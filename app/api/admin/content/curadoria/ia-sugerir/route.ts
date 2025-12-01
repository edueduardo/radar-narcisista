import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAPI } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { chatGroq, chatOpenAI } from '@/lib/ia-conexoes-reais'

// ============================================================================
// API ADMIN: IA CURADORA - SUGERIR CONTEÚDO
// Recebe texto/URL e gera sugestão de conteúdo via IA
// Usa o MESMO client de IA do projeto (Groq/OpenAI)
// ============================================================================

// Prompt da IA Curadora (PT-BR, ético, alinhado com a filosofia do Radar)
const CURATOR_SYSTEM_PROMPT = `Você é a IA Curadora do Radar Narcisista, especializada em analisar e sugerir conteúdos educativos sobre relacionamentos abusivos, narcisismo e recuperação emocional.

OBJETIVO:
Analisar o texto/artigo fornecido e gerar uma sugestão de conteúdo para publicação no Radar.

REGRAS ÉTICAS (OBRIGATÓRIAS):
1. NÃO romantizar ou normalizar abuso
2. NÃO usar linguagem sensacionalista ou clickbait
3. NÃO fazer diagnósticos clínicos (não rotular pessoas como "narcisistas")
4. NÃO sugerir vingança, exposição ou perseguição
5. SEMPRE focar em educação, proteção e recuperação
6. SEMPRE usar linguagem acessível e empática
7. SEMPRE respeitar a perspectiva unilateral (só conhecemos um lado)

FORMATO DE RESPOSTA (JSON):
{
  "titulo_sugerido": "Título claro e informativo em PT-BR (máx 80 chars)",
  "resumo": "Resumo de 2-3 frases em linguagem acessível (máx 300 chars)",
  "tipo_conteudo": "faq" | "article" | "news" | "lesson" | "tip" | "resource",
  "tags_sugeridas": ["tag1", "tag2", "tag3"],
  "relevancia_score": 0.0 a 1.0 (quão relevante para o público do Radar),
  "riscos_gatilhos": ["lista de possíveis gatilhos ou riscos no conteúdo"],
  "justificativa": "Breve explicação de por que este conteúdo é útil para o Radar"
}

TAGS VÁLIDAS (use apenas estas):
- narcisismo, gaslighting, manipulacao, controle, isolamento
- abuso_emocional, abuso_fisico, abuso_financeiro
- recuperacao, autoestima, limites, autocuidado
- filhos, familia, trabalho, relacionamento
- juridico, seguranca, emergencia
- basico, avancado, profissional

TIPOS DE CONTEÚDO:
- faq: Perguntas frequentes, dúvidas comuns
- article: Artigos educativos aprofundados
- news: Notícias e atualizações relevantes
- lesson: Lições/aulas de uma trilha
- tip: Dicas práticas curtas
- resource: Recursos externos (livros, vídeos, contatos)

Responda APENAS com o JSON, sem texto adicional.`

/**
 * POST /api/admin/content/curadoria/ia-sugerir
 * Recebe texto/URL e gera sugestão de conteúdo via IA
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAPI(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const body = await request.json()

    // Validar input
    const rawText = body.raw_text?.trim() || ''
    const originalUrl = body.original_url?.trim() || ''
    const sourceType = body.source_type || 'other'

    if (!rawText && !originalUrl) {
      return NextResponse.json(
        { error: 'Forneça raw_text ou original_url' },
        { status: 400 }
      )
    }

    // Montar prompt para a IA
    let userPrompt = 'Analise o seguinte conteúdo e gere uma sugestão:\n\n'
    
    if (originalUrl) {
      userPrompt += `URL ORIGINAL: ${originalUrl}\n\n`
    }
    
    if (rawText) {
      // Limitar tamanho do texto
      const truncatedText = rawText.length > 5000 
        ? rawText.substring(0, 5000) + '...[texto truncado]'
        : rawText
      userPrompt += `TEXTO:\n${truncatedText}\n\n`
    }
    
    userPrompt += `TIPO DE FONTE: ${sourceType}\n`
    userPrompt += '\nGere a sugestão no formato JSON especificado.'

    console.log('[IA CURADORA] Processando sugestão para:', originalUrl || 'texto direto')

    // Tentar Groq primeiro (mais rápido), fallback para OpenAI
    let aiResult = await chatGroq(userPrompt, CURATOR_SYSTEM_PROMPT)
    
    if (!aiResult.success) {
      console.log('[IA CURADORA] Groq falhou, tentando OpenAI...')
      aiResult = await chatOpenAI(userPrompt, CURATOR_SYSTEM_PROMPT)
    }

    if (!aiResult.success) {
      console.error('[IA CURADORA] Todas as IAs falharam:', aiResult.error)
      return NextResponse.json(
        { error: 'Erro ao processar com IA. Tente novamente.' },
        { status: 500 }
      )
    }

    // Parsear resposta da IA
    let parsedResponse: any
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = aiResult.response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('JSON não encontrado na resposta')
      }
    } catch (parseError) {
      console.error('[IA CURADORA] Erro ao parsear resposta:', parseError)
      console.log('[IA CURADORA] Resposta raw:', aiResult.response)
      
      // Criar resposta padrão se parsing falhar
      parsedResponse = {
        titulo_sugerido: 'Conteúdo para revisão',
        resumo: 'A IA não conseguiu gerar um resumo estruturado. Revise manualmente.',
        tipo_conteudo: 'article',
        tags_sugeridas: [],
        relevancia_score: 0.5,
        riscos_gatilhos: [],
        justificativa: 'Parsing automático falhou. Conteúdo requer revisão manual.'
      }
    }

    // Criar sugestão no banco
    const now = new Date().toISOString()
    
    const suggestionData = {
      suggestion_source: 'ai_curator',
      source_id: null,
      original_url: originalUrl || null,
      original_title: null,
      original_content: rawText ? rawText.substring(0, 10000) : null, // Limitar tamanho
      suggested_title_pt: parsedResponse.titulo_sugerido || 'Sem título',
      suggested_summary_pt: parsedResponse.resumo || null,
      suggested_body_pt: null, // Corpo será editado manualmente
      suggested_type: parsedResponse.tipo_conteudo || 'article',
      suggested_topics: parsedResponse.tags_sugeridas || [],
      ai_relevance_score: parsedResponse.relevancia_score || 0.5,
      ai_quality_score: aiResult.confidence || 0.8,
      ai_reasoning: JSON.stringify({
        justificativa: parsedResponse.justificativa,
        riscos_gatilhos: parsedResponse.riscos_gatilhos,
        source_type: sourceType,
        ai_provider: aiResult.response.includes('groq') ? 'groq' : 'openai',
        latency_ms: aiResult.latency_ms
      }),
      status: 'pending',
      priority: parsedResponse.relevancia_score >= 0.8 ? 'high' : 'normal',
      created_at: now,
      updated_at: now
    }

    const { data: suggestion, error: insertError } = await supabaseAdmin
      .from('content_suggestions')
      .insert(suggestionData)
      .select()
      .single()

    if (insertError) {
      console.error('[IA CURADORA] Erro ao salvar sugestão:', insertError)
      return NextResponse.json(
        { error: 'Erro ao salvar sugestão no banco' },
        { status: 500 }
      )
    }

    console.log('[IA CURADORA] Sugestão criada:', suggestion.id)

    return NextResponse.json({
      success: true,
      suggestion: {
        id: suggestion.id,
        titulo: suggestion.suggested_title_pt,
        resumo: suggestion.suggested_summary_pt,
        tipo: suggestion.suggested_type,
        tags: suggestion.suggested_topics,
        relevancia: suggestion.ai_relevance_score,
        status: suggestion.status
      },
      ai_analysis: {
        justificativa: parsedResponse.justificativa,
        riscos_gatilhos: parsedResponse.riscos_gatilhos,
        latency_ms: aiResult.latency_ms
      }
    })
  } catch (error) {
    console.error('[IA CURADORA] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
