/**
 * API Admin: Check Environment Keys
 * Verifica quais chaves de API estão configuradas no ambiente
 */

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'

// Lista de chaves de API para verificar
const API_KEYS_TO_CHECK = [
  { key: 'OPENAI_API_KEY', provider: 'openai', name: 'OpenAI' },
  { key: 'ANTHROPIC_API_KEY', provider: 'anthropic', name: 'Anthropic Claude' },
  { key: 'GROQ_API_KEY', provider: 'groq', name: 'Groq' },
  { key: 'GOOGLE_AI_API_KEY', provider: 'gemini', name: 'Google Gemini' },
  { key: 'TOGETHER_API_KEY', provider: 'together', name: 'Together AI' },
  { key: 'MISTRAL_API_KEY', provider: 'mistral', name: 'Mistral AI' },
  { key: 'COHERE_API_KEY', provider: 'cohere', name: 'Cohere' },
  { key: 'HUGGINGFACE_API_KEY', provider: 'huggingface', name: 'HuggingFace' },
  { key: 'PERPLEXITY_API_KEY', provider: 'perplexity', name: 'Perplexity' },
  { key: 'REPLICATE_API_KEY', provider: 'replicate', name: 'Replicate' },
  { key: 'OPENROUTER_API_KEY', provider: 'openrouter', name: 'OpenRouter' },
  { key: 'DEEPSEEK_API_KEY', provider: 'deepseek', name: 'DeepSeek' },
  { key: 'CEREBRAS_API_KEY', provider: 'cerebras', name: 'Cerebras' },
]

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Verificar quais chaves estão configuradas
    const configuredKeys = API_KEYS_TO_CHECK.map(({ key, provider, name }) => {
      const value = process.env[key]
      const isConfigured = !!value && value.length > 10
      const maskedValue = isConfigured 
        ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
        : null

      return {
        key,
        provider,
        name,
        isConfigured,
        maskedValue,
        // Não expor o valor real por segurança
      }
    })

    const totalConfigured = configuredKeys.filter(k => k.isConfigured).length

    return NextResponse.json({
      success: true,
      keys: configuredKeys,
      summary: {
        total: API_KEYS_TO_CHECK.length,
        configured: totalConfigured,
        missing: API_KEYS_TO_CHECK.length - totalConfigured
      }
    })

  } catch (error) {
    console.error('[API] Erro ao verificar chaves:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
