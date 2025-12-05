import { NextRequest, NextResponse } from 'next/server'
import { chatWithCoach } from '../../../lib/openai'
import { chatColaborativo, getConfigChatColaborativo } from '../../../lib/chat-colaborativo'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

// Tipos de problemas que podem ser detectados
type ProblemTag = 
  | 'invalidacao'
  | 'gaslighting'
  | 'criminalizacao'
  | 'manipulacao'
  | 'ameacas'
  | 'isolamento'
  | 'autoestima_baixa'

// Palavras-chave para detecção de problemas
const PROBLEM_KEYWORDS: Record<ProblemTag, string[]> = {
  gaslighting: [
    'gaslighting', 'louco', 'louca', 'imaginando', 'inventando', 'exagerando', 
    'memória', 'não aconteceu', 'você que', 'está vendo coisas', 'paranoia',
    'nunca disse isso', 'você inventou', 'está confusa', 'está confuso'
  ],
  invalidacao: [
    'invalida', 'minimiza', 'exagero', 'drama', 'sensível demais', 'frescura', 
    'besteira', 'não é nada', 'não é pra tanto', 'você é muito', 'histérica',
    'histérico', 'dramática', 'dramático', 'não tem importância'
  ],
  manipulacao: [
    'manipula', 'culpa', 'chantagem', 'ameaça', 'pressão', 'obriga', 'força',
    'se você me amasse', 'por sua culpa', 'você me fez', 'olha o que você fez',
    'coitado de mim', 'ninguém me entende', 'você vai se arrepender'
  ],
  isolamento: [
    'isola', 'afasta', 'amigos', 'família', 'sozinha', 'sozinho', 'proíbe', 
    'não deixa', 'não pode sair', 'não pode ver', 'ciúmes', 'controla',
    'onde você estava', 'com quem você estava'
  ],
  ameacas: [
    'ameaça', 'medo', 'bater', 'matar', 'suicídio', 'filhos', 'tirar',
    'você vai ver', 'vou te destruir', 'vou contar', 'vou expor',
    'ninguém vai acreditar', 'vai se arrepender'
  ],
  criminalizacao: [
    'processo', 'polícia', 'advogado', 'guarda', 'alienação', 'denúncia',
    'vou te processar', 'vou tirar a guarda', 'vou te denunciar',
    'falsa acusação', 'alienação parental'
  ],
  autoestima_baixa: [
    'autoestima', 'não valho', 'feia', 'feio', 'burra', 'burro', 'incapaz', 
    'não consigo', 'fracasso', 'inútil', 'não sirvo', 'ninguém me quer',
    'não mereço', 'sou um lixo', 'não presto'
  ]
}

// Função para detectar problemas no texto
function detectProblemsInText(text: string): ProblemTag[] {
  const lowerText = text.toLowerCase()
  const detected: ProblemTag[] = []
  
  for (const [problem, keywords] of Object.entries(PROBLEM_KEYWORDS)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      detected.push(problem as ProblemTag)
    }
  }
  
  return detected
}

// ============================================================================
// DETECÇÃO DE RED FLAGS PARA FRAUDE / MÁ-FÉ
// ============================================================================
type FraudFlag = {
  type: 'inconsistency' | 'fabrication' | 'revenge' | 'manipulation' | 'excessive_accusation' | 'zero_self_criticism'
  severity: 1 | 2 | 3 | 4 | 5
  description: string
}

const FRAUD_KEYWORDS: Record<string, { keywords: string[], type: FraudFlag['type'], severity: FraudFlag['severity'] }> = {
  revenge: {
    keywords: ['destruir', 'acabar com', 'vingança', 'vou expor', 'vou ferrar', 'vou arruinar', 'quero que sofra', 'pagar pelo que fez'],
    type: 'revenge',
    severity: 3
  },
  fabrication: {
    keywords: ['me ajuda a escrever', 'parecer pior', 'inventar', 'criar uma história', 'fabricar', 'forjar'],
    type: 'fabrication',
    severity: 4
  },
  manipulation: {
    keywords: ['para o processo', 'meu advogado pediu', 'preciso de prova', 'usar contra', 'no tribunal'],
    type: 'manipulation',
    severity: 2
  },
  excessive_accusation: {
    keywords: ['monstro', 'demônio', 'psicopata', 'sociopata', 'pura maldade', 'pessoa horrível', 'destruiu minha vida'],
    type: 'excessive_accusation',
    severity: 2
  }
}

function detectFraudFlags(text: string, history: any[]): FraudFlag[] {
  const lowerText = text.toLowerCase()
  const allUserText = [
    text,
    ...history.filter((h: any) => h.role === 'user').map((h: any) => h.content)
  ].join(' ').toLowerCase()
  
  const flags: FraudFlag[] = []
  
  for (const [key, config] of Object.entries(FRAUD_KEYWORDS)) {
    if (config.keywords.some(keyword => lowerText.includes(keyword))) {
      flags.push({
        type: config.type,
        severity: config.severity,
        description: `Detectado padrão de ${key}: palavras-chave encontradas`
      })
    }
  }
  
  // Detectar ausência total de autocrítica (se muitas mensagens e nenhuma menção a próprio erro)
  const userMessages = history.filter((h: any) => h.role === 'user')
  if (userMessages.length >= 5) {
    const selfCriticismKeywords = ['meu erro', 'eu errei', 'minha culpa', 'eu também', 'reconheço que', 'poderia ter', 'deveria ter']
    const hasSelfCriticism = selfCriticismKeywords.some(k => allUserText.includes(k))
    
    if (!hasSelfCriticism) {
      flags.push({
        type: 'zero_self_criticism',
        severity: 1,
        description: 'Nenhuma autocrítica detectada após várias mensagens'
      })
    }
  }
  
  return flags
}

// ============================================================================
// CONTEXTO DE CLAREZA PARA IAs
// ============================================================================
async function getClarityContextForChat(userId: string): Promise<string | null> {
  try {
    const cookieStore = cookies()
    const supabase = await createRouteHandlerClient()
    
    const { data: profile, error } = await supabase
      .from('clarity_tests')
      .select('*')
      .eq('user_id', userId)
      .eq('is_profile_base', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (error || !profile) return null
    
    // Formatar contexto
    const zoneLabels: Record<string, string> = {
      ATENCAO: 'Zona de Atenção (sinais leves)',
      ALERTA: 'Zona de Alerta (sinais moderados)',
      VERMELHA: 'Zona de Alto Risco (sinais graves)',
    }
    
    const axisLabels: Record<string, string> = {
      nevoa: 'Névoa Mental',
      medo: 'Medo e Tensão',
      limites: 'Desrespeito a Limites',
    }
    
    // Calcular dias desde o teste
    const testDate = new Date(profile.created_at)
    const now = new Date()
    const daysAgo = Math.floor((now.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Ordenar eixos por score
    const axes = [
      { axis: 'nevoa', score: profile.fog_score || 0 },
      { axis: 'medo', score: profile.fear_score || 0 },
      { axis: 'limites', score: profile.limits_score || 0 },
    ].sort((a, b) => b.score - a.score)
    
    let context = `\n\n[CONTEXTO DE CLAREZA DA USUÁRIA - NÃO MENCIONAR DIRETAMENTE]\n`
    context += `- Teste de Clareza realizado há ${daysAgo} dias\n`
    context += `- Zona atual: ${zoneLabels[profile.global_zone] || profile.global_zone}\n`
    context += `- Percentual geral: ${Math.round((profile.overall_percentage || 0) * 100)}%\n`
    
    if (profile.has_physical_risk) {
      context += `- ⚠️ ALERTA: Sinais de possível risco físico detectados no teste\n`
    }
    
    context += `\nEixos mais impactados:\n`
    axes.forEach((axis, i) => {
      context += `${i + 1}. ${axisLabels[axis.axis]}: ${axis.score} pontos\n`
    })
    
    if (profile.user_narrative) {
      context += `\nNarrativa da usuária (resumo):\n"${profile.user_narrative.slice(0, 300)}${profile.user_narrative.length > 300 ? '...' : ''}"\n`
    }
    
    context += `\nUse essas informações para adaptar sua linguagem e sugestões. NÃO repita diagnósticos, apenas use como contexto silencioso.`
    
    return context
  } catch (error) {
    console.warn('[CLARITY CONTEXT] Erro ao buscar perfil (não crítico):', error)
    return null
  }
}

// ============================================================================
// ETAPA 2 - TRIÂNGULO: CONTEXTO DE EPISÓDIOS RECENTES DO DIÁRIO
// ============================================================================
async function getDiaryContextForChat(userId: string): Promise<string | null> {
  try {
    const cookieStore = cookies()
    const supabase = await createRouteHandlerClient()
    
    // Buscar últimos 3 episódios mais intensos (mood_intensity >= 6) dos últimos 30 dias
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: recentEpisodes, error } = await supabase
      .from('journal_entries')
      .select('title, description, mood_intensity, tags, created_at, entry_type')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('mood_intensity', { ascending: false })
      .limit(3)
    
    if (error || !recentEpisodes || recentEpisodes.length === 0) return null
    
    let context = `\n\n[EPISÓDIOS RECENTES DO DIÁRIO - NÃO MENCIONAR DIRETAMENTE]\n`
    context += `A usuária registrou ${recentEpisodes.length} episódio(s) relevante(s) nos últimos 30 dias:\n`
    
    recentEpisodes.forEach((ep, i) => {
      const daysAgo = Math.floor((Date.now() - new Date(ep.created_at).getTime()) / (1000 * 60 * 60 * 24))
      const isBaseline = ep.entry_type === 'clarity_baseline'
      
      context += `\n${i + 1}. ${isBaseline ? '📊 ' : ''}${ep.title || 'Sem título'} (há ${daysAgo} dias)\n`
      context += `   - Intensidade: ${ep.mood_intensity || 0}/10\n`
      if (ep.tags && ep.tags.length > 0) {
        context += `   - Tags: ${ep.tags.slice(0, 5).join(', ')}\n`
      }
      if (ep.description) {
        context += `   - Resumo: "${ep.description.substring(0, 150)}${ep.description.length > 150 ? '...' : ''}"\n`
      }
    })
    
    context += `\nUse esses episódios como contexto para entender melhor a situação da usuária.`
    
    return context
  } catch (error) {
    console.warn('[DIARY CONTEXT] Erro ao buscar episódios (não crítico):', error)
    return null
  }
}

// Função para registrar suspeita de fraude (fire and forget)
async function logFraudSuspicion(
  userId: string,
  sessionId: string | null,
  flag: FraudFlag,
  message: string,
  aiResponse: string,
  req: NextRequest
) {
  try {
    const baseUrl = req.nextUrl.origin
    await fetch(`${baseUrl}/api/fraud/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.get('cookie') || ''
      },
      body: JSON.stringify({
        sessionId,
        suspicionType: flag.type,
        severity: flag.severity,
        description: flag.description,
        context: {
          message: message.substring(0, 500), // Limitar tamanho
          detectedFlags: [flag.type]
        },
        aiAction: flag.severity >= 3 ? 'warned' : 'questioned',
        aiResponseExcerpt: aiResponse.substring(0, 300)
      })
    })
  } catch (error) {
    console.warn('[FRAUD LOG] Erro ao registrar (não crítico):', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)

    // ETAPA 7 - Verificar se é uma requisição para criar risk_alert
    if (body?.createRiskAlert) {
      const cookieStore = cookies()
      const supabase = await createRouteHandlerClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
      }
      
      // Criar risk_alert
      const { error } = await supabase
        .from('risk_alerts')
        .insert({
          user_id: user.id,
          source: body.source || 'chat',
          source_id: null,
          level: 'HIGH',
          category: 'PHYSICAL_VIOLENCE',
          title: 'Possível Risco Físico Detectado no Chat',
          description: `Mensagem com indicadores de risco físico detectada: "${body.messageContent?.substring(0, 200)}..."`,
          recommendation: 'Revise seu Plano de Segurança e considere buscar ajuda profissional.',
          is_read: false,
          is_dismissed: false,
          created_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('[RISK ALERT] Erro ao criar:', error)
        return NextResponse.json({ success: false, error: 'Erro ao criar alerta' }, { status: 500 })
      }
      
      console.log('[RISK ALERT] Alerta de risco físico criado via chat')
      return NextResponse.json({ success: true, message: 'Risk alert criado' })
    }

    const rawMessage = typeof body?.message === 'string' ? body.message : ''
    const message = rawMessage.trim()
    const history = Array.isArray(body?.history) ? body.history : []
    const userLocation = typeof body?.userLocation === 'string' ? body.userLocation : ''
    // ETAPA 2 - Receber perfil de clareza do frontend (otimização)
    const clarityProfileFromClient = body?.clarityProfile || null

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Mensagem vazia' },
        { status: 400 }
      )
    }

    console.log('[API /chat] Nova mensagem recebida (Coach de Clareza)', {
      historyLength: history.length,
      userLocation,
    })

    // Detectar problemas na mensagem atual e no histórico
    const allText = [
      message,
      ...history.filter((h: any) => h.role === 'user').map((h: any) => h.content)
    ].join(' ')
    
    const detectedProblems = detectProblemsInText(allText)

    // Buscar contexto de clareza do usuário (se logado e tiver perfil)
    const cookieStore = cookies()
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let clarityContext: string | null = null
    
    // ETAPA 2 - Usar perfil do cliente se disponível (evita query extra)
    if (clarityProfileFromClient) {
      const zoneLabels: Record<string, string> = {
        VERDE: 'Zona Verde (baixo risco)',
        ATENCAO: 'Zona de Atenção (sinais leves)',
        ALERTA: 'Zona de Alerta (sinais moderados)',
        VERMELHA: 'Zona de Alto Risco (sinais graves)',
        CRITICO: 'Zona Crítica (risco alto)',
      }
      
      clarityContext = `\n\n[CONTEXTO DE CLAREZA DA USUÁRIA - NÃO MENCIONAR DIRETAMENTE]\n`
      clarityContext += `- Zona atual: ${zoneLabels[clarityProfileFromClient.globalZone?.toUpperCase()] || clarityProfileFromClient.globalZone}\n`
      clarityContext += `- Percentual geral: ${Math.round((clarityProfileFromClient.overallPercentage || 0) * 100)}%\n`
      
      if (clarityProfileFromClient.hasPhysicalRisk) {
        clarityContext += `- ⚠️ ALERTA: Sinais de possível risco físico detectados no teste\n`
      }
      
      clarityContext += `\nEixos mais impactados (scores):\n`
      clarityContext += `- Névoa Mental: ${clarityProfileFromClient.fogScore || 0} pontos\n`
      clarityContext += `- Medo e Tensão: ${clarityProfileFromClient.fearScore || 0} pontos\n`
      clarityContext += `- Desrespeito a Limites: ${clarityProfileFromClient.limitsScore || 0} pontos\n`
      
      if (clarityProfileFromClient.summary) {
        clarityContext += `\nResumo do teste (gerado por IA):\n"${clarityProfileFromClient.summary.slice(0, 400)}"\n`
      }
      
      clarityContext += `\nUse essas informações para adaptar sua linguagem e sugestões. NÃO repita diagnósticos, apenas use como contexto silencioso.`
      
      console.log('[API /chat] Usando perfil de clareza do cliente')
    } else if (user) {
      // Fallback: buscar do banco se não veio do cliente
      clarityContext = await getClarityContextForChat(user.id)
    }

    // Adicionar contexto de localização e clareza ao histórico
    const systemContexts: { role: 'system'; content: string }[] = []
    
    if (userLocation) {
      systemContexts.push({
        role: 'system' as const,
        content: `O usuário é de ${userLocation}. Adapte sua linguagem e exemplos para a realidade dessa região, sendo mais próximo e culturalmente relevante. Use expressões brasileiras autênticas e referências locais quando apropriado.`
      })
    }
    
    if (clarityContext) {
      systemContexts.push({
        role: 'system' as const,
        content: clarityContext
      })
      console.log('[API /chat] Contexto de clareza injetado para usuário:', user?.id)
    }
    
    // ETAPA 2 - TRIÂNGULO: Adicionar contexto de episódios do diário
    if (user) {
      const diaryContext = await getDiaryContextForChat(user.id)
      if (diaryContext) {
        systemContexts.push({
          role: 'system' as const,
          content: diaryContext
        })
        console.log('[API /chat] Contexto de diário injetado para usuário:', user.id)
      }
    }
    
    const enhancedHistory = [...systemContexts, ...history]

    // Verificar se deve usar modo colaborativo
    const usarColaborativo = body?.usarColaborativo !== false
    const configColab = getConfigChatColaborativo()
    
    let reply: string
    let transparenciaData: any = null
    
    try {
      if (usarColaborativo && configColab.usarMultiplasIAs) {
        // Usar sistema colaborativo com múltiplas IAs
        console.log('[API /chat] Usando modo colaborativo com IAs:', configColab.iasAtivas)
        
        const resultado = await chatColaborativo(message, enhancedHistory, {
          ...configColab,
          mostrarTransparencia: true
        })
        
        reply = resultado.respostaFinal
        
        // Dados de transparência para o frontend
        transparenciaData = {
          analises: resultado.analises,
          consenso: resultado.consenso,
          transparencia: resultado.transparencia,
          metodo: 'colaborativo'
        }
        
        console.log('[API /chat] Resultado colaborativo:', {
          iasUsadas: resultado.transparencia.iasUsadas,
          consenso: resultado.consenso.nivel,
          tempoTotal: resultado.transparencia.tempoTotal
        })
      } else {
        // Usar apenas OpenAI (modo simples)
        const startTime = Date.now()
        reply = await chatWithCoach(message, enhancedHistory)
        
        transparenciaData = {
          analises: [{
            ia: 'openai',
            resposta: reply,
            confianca: 0.9,
            latencia: Date.now() - startTime,
            sucesso: true
          }],
          consenso: { alcancado: true, nivel: 1, divergencias: [] },
          transparencia: {
            iasUsadas: ['openai'],
            tempoTotal: Date.now() - startTime,
            metodo: 'single'
          },
          metodo: 'simples'
        }
      }
    } catch (aiError) {
      console.error('Erro ao chamar IA:', aiError)
      
      // Verificar tipo de erro
      const errorMessage = aiError instanceof Error ? aiError.message : 'Erro desconhecido'
      
      if (errorMessage.includes('API key') || errorMessage.includes('Unauthorized') || errorMessage.includes('chave')) {
        return NextResponse.json(
          { success: false, error: 'Serviço de IA não configurado. Contate o suporte.' },
          { status: 503 }
        )
      }
      
      if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        return NextResponse.json(
          { success: false, error: 'Limite de uso da IA atingido. Tente novamente em alguns minutos.' },
          { status: 429 }
        )
      }
      
      // Erro genérico da IA
      return NextResponse.json(
        { success: false, error: 'Erro ao processar com IA. Tente novamente.' },
        { status: 500 }
      )
    }

    // Detectar red flags de fraude/má-fé
    const fraudFlags = detectFraudFlags(message, history)
    
    // Se detectou flags, registrar no banco (fire and forget)
    if (fraudFlags.length > 0) {
      const sessionId = body?.sessionId || null
      const userId = body?.userId || 'anonymous'
      
      // Registrar cada flag detectada
      for (const flag of fraudFlags) {
        logFraudSuspicion(userId, sessionId, flag, message, reply, request)
          .catch(err => console.warn('[FRAUD LOG] Erro não crítico:', err))
      }
      
      console.log(`[FRAUD DETECTION] ${fraudFlags.length} red flag(s) detectada(s):`, 
        fraudFlags.map(f => `${f.type} (sev:${f.severity})`).join(', ')
      )
    }

    // Retornar resposta com problemTags, fraudFlags e dados de transparência
    return NextResponse.json({ 
      success: true, 
      reply,
      problemTags: detectedProblems.slice(0, 3),
      fraudFlags: fraudFlags.length > 0 ? fraudFlags : undefined,
      transparencia: transparenciaData
    })
  } catch (error) {
    console.error('Erro na API /chat:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno no chat' },
      { status: 500 }
    )
  }
}
