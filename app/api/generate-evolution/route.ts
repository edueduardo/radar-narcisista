import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

// Tipos
interface AnalysisSnapshot {
  score: number
  problem_tags: string[]
  emotions: string[]
  ai_summary: string | null
  created_at: string
}

interface EvolutionRequest {
  currentScore: number
  currentProblems: string[]
  currentEmotions?: string[]
  currentSummary?: string
  origin: 'coach' | 'diario' | 'teste_clareza'
  messageContent?: string
}

// Labels para problemas
const PROBLEM_LABELS: Record<string, string> = {
  gaslighting: 'gaslighting (manipulação da percepção)',
  invalidacao: 'invalidação emocional',
  manipulacao: 'manipulação emocional',
  isolamento: 'isolamento social',
  ameacas: 'ameaças ou medo',
  criminalizacao: 'ameaças legais',
  autoestima_baixa: 'impacto na autoestima'
}

// Gerar texto de evolução com IA
async function generateEvolutionWithAI(
  current: { score: number; problems: string[]; summary?: string },
  previous: AnalysisSnapshot | null,
  origin: string
): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  
  if (!OPENAI_API_KEY) {
    // Fallback para texto gerado localmente
    return generateEvolutionFallback(current, previous)
  }

  try {
    const systemPrompt = `Você é um coach de clareza gentil e objetivo.
Você NÃO faz diagnóstico clínico.
Você NÃO oferece terapia, psiquiatria ou consultoria jurídica.
Você comenta a EVOLUÇÃO da pessoa entre análises, com base nos scores e resumos.
Fale sempre em 2-3 parágrafos curtos, em português simples e acolhedor.
Nunca use termos clínicos como "transtorno", "diagnóstico", "paciente".
Use "você" e seja empático.
Se perceber descrições claras de risco de suicídio, autoagressão ou violência física, mantenha um tom cuidadoso e incentive a busca de ajuda humana imediata (por exemplo, CVV 188, Polícia 190, Central 180, SAMU 192 ou serviços locais de proteção), sem descrever planos detalhados ou estratégias perigosas.
Termine sempre com uma frase de cuidado: "Lembre-se: isso não é diagnóstico, é apenas um espelho do que você compartilhou."`

    let userPrompt = ''
    
    if (!previous) {
      // Primeira análise
      userPrompt = `PRIMEIRA ANÁLISE DO USUÁRIO:
- Score de clareza: ${current.score}/100
- Padrões detectados: ${current.problems.map(p => PROBLEM_LABELS[p] || p).join(', ') || 'nenhum específico'}
${current.summary ? `- Resumo: ${current.summary}` : ''}

Regras:
1. Dê boas-vindas e reconheça a coragem de compartilhar.
2. Comente brevemente o nível de clareza (${current.score >= 70 ? 'bom' : current.score >= 40 ? 'moderado' : 'inicial'}).
3. Se houver padrões detectados, mencione de forma gentil que você percebeu alguns elementos importantes.
4. Sugira um próximo passo concreto.
5. Inclua a frase de cuidado no final.`
    } else {
      // Comparar com análise anterior
      const scoreDiff = current.score - previous.score
      const evolution = scoreDiff >= 10 ? 'melhora significativa' : 
                       scoreDiff >= 5 ? 'leve melhora' :
                       scoreDiff >= -5 ? 'estável' :
                       scoreDiff >= -10 ? 'leve queda' : 'queda significativa'
      
      userPrompt = `DADOS DA EVOLUÇÃO:

- Análise anterior (${new Date(previous.created_at).toLocaleDateString('pt-BR')}):
  - Score: ${previous.score}/100
  - Padrões: ${previous.problem_tags.map(p => PROBLEM_LABELS[p] || p).join(', ') || 'nenhum'}
  ${previous.ai_summary ? `- Resumo: ${previous.ai_summary}` : ''}

- Análise atual:
  - Score: ${current.score}/100 (${evolution}: ${scoreDiff >= 0 ? '+' : ''}${scoreDiff} pontos)
  - Padrões: ${current.problems.map(p => PROBLEM_LABELS[p] || p).join(', ') || 'nenhum'}
  ${current.summary ? `- Resumo: ${current.summary}` : ''}

Regras:
1. Comece dizendo se houve melhora, piora ou estabilidade, de forma humana ("vejo que...", "parece que...").
2. Aponte 1 ou 2 pontos específicos que mudaram (mais detalhes, mais clareza, novos elementos, etc.).
3. Se houver novos padrões ou padrões que sumiram, mencione de forma gentil.
4. Termine sugerindo um próximo passo concreto.
5. Inclua a frase de cuidado no final.`
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
    })

    if (!response.ok) {
      throw new Error('Falha na API da IA')
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || generateEvolutionFallback(current, previous)

  } catch (error) {
    console.error('Erro ao gerar evolução com IA:', error)
    return generateEvolutionFallback(current, previous)
  }
}

// Fallback: gerar texto sem IA
function generateEvolutionFallback(
  current: { score: number; problems: string[]; summary?: string },
  previous: AnalysisSnapshot | null
): string {
  if (!previous) {
    // Primeira análise
    if (current.score >= 70) {
      return `Obrigada por compartilhar! Sua mensagem foi bem detalhada, o que me ajuda muito a entender sua situação. ${current.problems.length > 0 ? `Percebi alguns elementos importantes no que você descreveu: ${current.problems.map(p => PROBLEM_LABELS[p] || p).join(', ')}. ` : ''}Continue assim - quanto mais você compartilha, melhor consigo te apoiar.\n\nLembre-se: isso não é diagnóstico, é apenas um espelho do que você compartilhou.`
    } else if (current.score >= 40) {
      return `Obrigada por começar a conversar! Entendi o básico da sua situação. Se quiser, pode me contar mais detalhes - como aconteceu, quando, como você se sentiu. Isso me ajuda a te apoiar melhor.\n\nLembre-se: isso não é diagnóstico, é apenas um espelho do que você compartilhou.`
    } else {
      return `Obrigada por estar aqui. Percebi que sua mensagem foi breve, e tudo bem - vá no seu ritmo. Quando se sentir confortável, pode me contar mais sobre o que está acontecendo. Estou aqui para ouvir.\n\nLembre-se: isso não é diagnóstico, é apenas um espelho do que você compartilhou.`
    }
  }

  // Comparar com anterior
  const scoreDiff = current.score - previous.score
  
  if (scoreDiff >= 10) {
    return `Vejo uma melhora significativa na sua clareza! Você passou de ${previous.score} para ${current.score} pontos. Isso mostra que você está conseguindo expressar melhor o que sente e o que aconteceu. ${current.problems.length > 0 && current.problems.some(p => !previous.problem_tags.includes(p)) ? 'Novos elementos apareceram na sua descrição, o que é importante para entender melhor a situação. ' : ''}Continue assim!\n\nLembre-se: isso não é diagnóstico, é apenas um espelho do que você compartilhou.`
  } else if (scoreDiff >= 5) {
    return `Bom progresso! Sua clareza aumentou de ${previous.score} para ${current.score}. Você está conseguindo se expressar cada vez melhor. Se quiser, pode continuar aprofundando - cada detalhe ajuda.\n\nLembre-se: isso não é diagnóstico, é apenas um espelho do que você compartilhou.`
  } else if (scoreDiff >= -5) {
    return `Você está mantendo um bom nível de clareza (${current.score}/100). ${current.score >= 70 ? 'Suas mensagens continuam bem detalhadas.' : 'Se quiser, pode adicionar mais contexto sobre o que está sentindo.'}\n\nLembre-se: isso não é diagnóstico, é apenas um espelho do que você compartilhou.`
  } else if (scoreDiff >= -10) {
    return `Percebi que essa mensagem foi um pouco mais breve que a anterior (${previous.score} → ${current.score}). Tudo bem, cada momento é diferente. Se quiser elaborar mais sobre o que está sentindo agora, estou aqui.\n\nLembre-se: isso não é diagnóstico, é apenas um espelho do que você compartilhou.`
  } else {
    return `Parece que está mais difícil se expressar agora. Isso é completamente normal - às vezes as emoções são intensas demais. Não há pressa. Respire fundo e, quando se sentir pronta, pode continuar no seu ritmo.\n\nLembre-se: isso não é diagnóstico, é apenas um espelho do que você compartilhou.`
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = await createRouteHandlerClient()

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body: EvolutionRequest = await request.json()
    const { currentScore, currentProblems, currentEmotions, currentSummary, origin, messageContent } = body

    if (currentScore === undefined || !origin) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Buscar análise anterior do mesmo contexto
    let previousSnapshot: AnalysisSnapshot | null = null
    
    try {
      const { data: prevData } = await supabase
        .from('analysis_snapshots')
        .select('score, problem_tags, emotions, ai_summary, created_at')
        .eq('user_id', user.id)
        .eq('origin', origin)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (prevData) {
        previousSnapshot = prevData as AnalysisSnapshot
      }
    } catch (e) {
      // Tabela pode não existir ainda ou não ter dados
      console.log('Sem snapshot anterior ou tabela não existe')
    }

    // Gerar texto de evolução
    const evolutionText = await generateEvolutionWithAI(
      { score: currentScore, problems: currentProblems || [], summary: currentSummary },
      previousSnapshot,
      origin
    )

    // Salvar novo snapshot (se tabela existir)
    try {
      await supabase.from('analysis_snapshots').insert({
        user_id: user.id,
        origin,
        score: currentScore,
        problem_tags: currentProblems || [],
        emotions: currentEmotions || [],
        ai_summary: currentSummary,
        evolution_comment: evolutionText,
        message_content: messageContent?.substring(0, 500) // Limitar tamanho
      })
    } catch (e) {
      console.log('Não foi possível salvar snapshot (tabela pode não existir)')
    }

    return NextResponse.json({
      success: true,
      evolutionText,
      previousScore: previousSnapshot?.score,
      scoreDiff: previousSnapshot ? currentScore - previousSnapshot.score : null
    })

  } catch (error) {
    console.error('Erro ao gerar evolução:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
