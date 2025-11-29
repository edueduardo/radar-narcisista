import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

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

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
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
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
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
