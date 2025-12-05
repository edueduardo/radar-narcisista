import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { callAI, getAvailableProviders } from '@/lib/ai-providers'

/**
 * POST /api/clarity/activate-profile
 * 
 * Marca um teste de clareza como "base do perfil" do usuário.
 * Isso faz com que o resultado do teste alimente:
 * - Diário (sugestões de tags, primeiro registro)
 * - IAs (contexto para Coach e outras)
 * - Curso/Trilhas (recomendações personalizadas)
 * - Plano de Segurança (alertas de risco)
 * 
 * Body esperado:
 * {
 *   testId: string (UUID do teste a ser marcado como base)
 * }
 * 
 * OU (se não tiver testId, cria um novo teste a partir dos dados):
 * {
 *   answers: Record<string, number>,
 *   userNarrative?: string,
 *   result: UnifiedResult
 * }
 * 
 * TEMA 3 - Campos salvos:
 * - raw_answers: todas as 18 respostas
 * - user_narrative: resposta da pergunta 19
 * - fog_score, fear_score, limits_score: scores por eixo
 * - category_scores: scores das 6 categorias (JSONB)
 * - axis_scores: scores detalhados dos 3 eixos (JSONB)
 * - ip_hash: hash SHA-256 do IP (cadeia de custódia)
 * - overall_percentage, global_zone, has_physical_risk
 */

// Função para gerar hash do IP (LGPD compliant)
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.NEXTAUTH_SECRET || 'radar-salt').digest('hex')
}

// Função para extrair IP do request
function getClientIP(headersList: Headers): string {
  const forwarded = headersList.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIP = headersList.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  return 'unknown'
}

/**
 * Gera um resumo empático do resultado do teste usando IA.
 * IMPORTANTE: Este resumo é apenas apoio emocional/informativo,
 * NÃO é diagnóstico médico, psicológico ou legal.
 * 
 * @param result - Resultado do teste com scores e zona global
 * @param userNarrative - Narrativa opcional do usuário (pergunta 19)
 * @returns Resumo em 3-5 frases ou null se falhar
 */
async function generateAISummary(
  result: any,
  userNarrative?: string
): Promise<string | null> {
  try {
    const providers = getAvailableProviders()
    if (providers.length === 0) {
      console.warn('Nenhum provedor de IA disponível para gerar resumo')
      return null
    }

    // Usar o primeiro provedor disponível (prioridade: groq > openai > claude > gemini)
    const preferredOrder = ['groq', 'openai', 'claude', 'gemini']
    const provider = preferredOrder.find(p => providers.some(pr => pr.id === p)) || providers[0].id

    // Preparar dados para o prompt
    const zoneLabels: Record<string, string> = {
      'VERDE': 'zona verde (baixo risco)',
      'ATENCAO': 'zona de atenção (risco moderado)',
      'ALERTA': 'zona de alerta (risco elevado)',
      'CRITICO': 'zona crítica (risco alto)'
    }
    const zoneLabel = zoneLabels[result.globalZone?.toUpperCase()] || 'zona de atenção'

    const systemPrompt = `Você é uma assistente empática especializada em apoio a pessoas em relacionamentos difíceis.

Sua tarefa é gerar um resumo BREVE (3-5 frases) do resultado de um teste de clareza emocional.

REGRAS IMPORTANTES:
1. Seja acolhedora e validadora, nunca julgue
2. Use linguagem simples e direta
3. NÃO faça diagnósticos médicos, psicológicos ou legais
4. NÃO use termos como "narcisista", "abusador" ou "vítima" diretamente
5. Foque em padrões observados e sentimentos validados
6. Termine com uma frase de encorajamento
7. Escreva em português brasileiro
8. Máximo 5 frases curtas`

    const userPrompt = `Gere um resumo empático para este resultado do Teste de Clareza:

- Zona global: ${zoneLabel}
- Porcentagem geral: ${result.overallPercentage || 0}%
- Score Névoa (confusão mental): ${result.axisScores?.nevoa?.score || 0}/30
- Score Medo (medo e ansiedade): ${result.axisScores?.medo?.score || 0}/30  
- Score Limites (dificuldade com limites): ${result.axisScores?.limites?.score || 0}/30
- Risco físico identificado: ${result.hasPhysicalRisk ? 'Sim' : 'Não'}
${userNarrative ? `- Relato da pessoa: "${userNarrative.substring(0, 500)}"` : ''}

Gere o resumo agora (3-5 frases, em português):`

    const response = await Promise.race([
      callAI(provider, userPrompt, systemPrompt),
      new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 15000)
      )
    ])

    if (response && typeof response === 'object' && 'content' in response) {
      return response.content.trim()
    }
    return null

  } catch (error) {
    console.error('Erro ao gerar resumo IA:', error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado. Faça login para salvar seu resultado.' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { testId, answers, userNarrative, result } = body
    
    // Obter IP e gerar hash para cadeia de custódia (TEMA 3)
    const headersList = await headers()
    const clientIP = getClientIP(headersList)
    const ipHash = hashIP(clientIP)
    
    let finalTestId = testId
    
    // Se não tem testId, precisa criar um novo teste
    if (!testId && answers && result) {
      // Extrair scores dos eixos
      const nevoaScore = result.axisScores?.find((a: any) => a.axis === 'nevoa')
      const medoScore = result.axisScores?.find((a: any) => a.axis === 'medo')
      const limitesScore = result.axisScores?.find((a: any) => a.axis === 'limites')
      
      // Preparar category_scores (TEMA 3)
      const categoryScores: Record<string, any> = {}
      if (result.categoryScores && Array.isArray(result.categoryScores)) {
        result.categoryScores.forEach((cat: any) => {
          categoryScores[cat.category] = {
            score: cat.totalScore || 0,
            percentage: cat.percentage || 0,
            level: cat.level || 'baixo'
          }
        })
      }
      
      // Preparar axis_scores detalhados (TEMA 3)
      const axisScores: Record<string, any> = {}
      if (result.axisScores && Array.isArray(result.axisScores)) {
        result.axisScores.forEach((axis: any) => {
          axisScores[axis.axis] = {
            score: axis.totalScore || 0,
            percentage: axis.percentage || 0,
            level: axis.level || 'baixo'
          }
        })
      }
      
      // Inserir novo teste com todos os campos (TEMA 3 completo)
      const { data: newTest, error: insertError } = await supabase
        .from('clarity_tests')
        .insert({
          user_id: user.id,
          test_type: 'unificado_v3',
          raw_answers: answers,
          user_narrative: userNarrative || null,
          fog_score: nevoaScore?.totalScore || 0,
          fear_score: medoScore?.totalScore || 0,
          limits_score: limitesScore?.totalScore || 0,
          global_zone: result.globalZone?.toUpperCase() || 'ATENCAO',
          overall_percentage: result.overallPercentage || 0,
          has_physical_risk: result.hasPhysicalRisk || false,
          is_profile_base: true,
          created_at: new Date().toISOString(),
          // NOVOS CAMPOS - TEMA 3
          category_scores: Object.keys(categoryScores).length > 0 ? categoryScores : null,
          axis_scores: Object.keys(axisScores).length > 0 ? axisScores : null,
          ip_hash: ipHash,
          completed_at: new Date().toISOString(),
        })
        .select('id')
        .single()
      
      if (insertError) {
        console.error('Erro ao criar teste:', insertError)
        return NextResponse.json(
          { error: 'Erro ao salvar teste. Tente novamente.' },
          { status: 500 }
        )
      }
      
      finalTestId = newTest.id
      
      // ETAPA 4 - Gerar resumo automático pela IA (não bloqueia o fluxo)
      // O resumo é gerado de forma assíncrona e salvo depois
      // Se falhar, o teste continua válido (summary fica null)
      const resultWithAxisScores = {
        ...result,
        axisScores: axisScores
      }
      generateAISummary(resultWithAxisScores, userNarrative)
        .then(async (summary) => {
          if (summary && finalTestId) {
            // Atualizar o teste com o resumo gerado
            await supabase
              .from('clarity_tests')
              .update({ summary })
              .eq('id', finalTestId)
            console.log('Resumo IA salvo para teste:', finalTestId)
          }
        })
        .catch((err) => {
          console.error('Erro ao salvar resumo IA:', err)
        })
      
      // ETAPA 2 - TRIÂNGULO: Criar entrada automática no diário (clarity_baseline)
      // Isso conecta Clareza → Diário
      const zoneLabels: Record<string, string> = {
        'VERDE': 'Zona Verde',
        'ATENCAO': 'Zona de Atenção',
        'ALERTA': 'Zona de Alerta',
        'CRITICO': 'Zona Crítica'
      }
      const zoneName = zoneLabels[result.globalZone?.toUpperCase()] || 'Teste de Clareza'
      
      // Gerar tags baseadas nos eixos mais impactados
      const suggestedTags: string[] = []
      if (result.hasPhysicalRisk) suggestedTags.push('risco_fisico')
      if (nevoaScore?.totalScore >= 20) suggestedTags.push('gaslighting', 'confusao_mental')
      if (medoScore?.totalScore >= 20) suggestedTags.push('medo', 'ansiedade')
      if (limitesScore?.totalScore >= 20) suggestedTags.push('controle', 'isolamento')
      
      // Criar entrada de diário tipo clarity_baseline
      const diaryContent = userNarrative 
        ? `Minha situação: ${userNarrative.substring(0, 500)}${userNarrative.length > 500 ? '...' : ''}`
        : `Resultado do Teste de Clareza: ${zoneName} (${result.overallPercentage || 0}%)`
      
      supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          title: `📊 Radiografia da Relação – ${zoneName}`,
          context: 'RELACIONAMENTO',
          description: diaryContent,
          mood_intensity: Math.round((result.overallPercentage || 0) / 10), // 0-10
          tags: suggestedTags,
          entry_type: 'clarity_baseline',
          clarity_test_id: finalTestId,
          created_at: new Date().toISOString(),
        })
        .then(({ error: diaryError }) => {
          if (diaryError) {
            console.error('Erro ao criar entrada de diário (não crítico):', diaryError)
          } else {
            console.log('Entrada de diário clarity_baseline criada para teste:', finalTestId)
          }
        })
      
      // ETAPA 7 - PLANO DE SEGURANÇA: Criar risk_alert quando hasPhysicalRisk
      if (result.hasPhysicalRisk) {
        const physicalScore = categoryScores['fisico']?.percentage || 0
        const riskLevel = physicalScore >= 0.5 ? 'CRITICAL' : 'HIGH'
        
        supabase
          .from('risk_alerts')
          .insert({
            user_id: user.id,
            source: 'clarity_test',
            source_id: finalTestId,
            level: riskLevel,
            category: 'PHYSICAL_VIOLENCE',
            title: 'Risco de Violência Física Detectado',
            description: `O Teste de Clareza indicou sinais de possível risco físico (${Math.round(physicalScore * 100)}%). Recomendamos revisar seu Plano de Segurança.`,
            recommendation: 'Revise seu Plano de Segurança e mantenha contatos de emergência atualizados.',
            is_read: false,
            is_dismissed: false,
            created_at: new Date().toISOString()
          })
          .then(({ error: alertError }) => {
            if (alertError) {
              console.error('Erro ao criar risk_alert (não crítico):', alertError)
            } else {
              console.log('Risk alert criado para risco físico no teste:', finalTestId)
            }
          })
      }
        
    } else if (testId) {
      // Verificar se o teste pertence ao usuário
      const { data: existingTest, error: fetchError } = await supabase
        .from('clarity_tests')
        .select('id, user_id')
        .eq('id', testId)
        .single()
      
      if (fetchError || !existingTest) {
        return NextResponse.json(
          { error: 'Teste não encontrado.' },
          { status: 404 }
        )
      }
      
      if (existingTest.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Você não tem permissão para acessar este teste.' },
          { status: 403 }
        )
      }
      
      // Marcar como base (o trigger cuida de desmarcar os outros)
      const { error: updateError } = await supabase
        .from('clarity_tests')
        .update({ is_profile_base: true })
        .eq('id', testId)
      
      if (updateError) {
        console.error('Erro ao atualizar teste:', updateError)
        return NextResponse.json(
          { error: 'Erro ao ativar perfil. Tente novamente.' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Dados insuficientes. Envie testId ou answers+result.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      testId: finalTestId,
      message: 'Perfil de clareza ativado com sucesso!'
    })
    
  } catch (error) {
    console.error('Erro na API activate-profile:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/clarity/activate-profile
 * 
 * Retorna o perfil de clareza ativo do usuário (teste marcado como base)
 */
export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = await createRouteHandlerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado.' },
        { status: 401 }
      )
    }
    
    // Buscar teste marcado como base
    const { data: profile, error: fetchError } = await supabase
      .from('clarity_tests')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_profile_base', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (não é erro, só não tem perfil)
      console.error('Erro ao buscar perfil:', fetchError)
      return NextResponse.json(
        { error: 'Erro ao buscar perfil.' },
        { status: 500 }
      )
    }
    
    if (!profile) {
      return NextResponse.json({
        hasProfile: false,
        profile: null
      })
    }
    
    return NextResponse.json({
      hasProfile: true,
      profile: {
        id: profile.id,
        createdAt: profile.created_at,
        completedAt: profile.completed_at,
        globalZone: profile.global_zone,
        overallPercentage: profile.overall_percentage,
        fogScore: profile.fog_score,
        fearScore: profile.fear_score,
        limitsScore: profile.limits_score,
        hasPhysicalRisk: profile.has_physical_risk,
        userNarrative: profile.user_narrative,
        rawAnswers: profile.raw_answers,
        // NOVOS CAMPOS - TEMA 3
        categoryScores: profile.category_scores,
        axisScores: profile.axis_scores,
        summary: profile.summary,
      }
    })
    
  } catch (error) {
    console.error('Erro na API get profile:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
