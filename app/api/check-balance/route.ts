import { NextRequest, NextResponse } from 'next/server'

// Verificar saldo de cada provedor de IA
export async function POST(req: NextRequest) {
  try {
    const { provider, key } = await req.json()

    if (!provider || !key) {
      return NextResponse.json({ error: 'Provider e key são obrigatórios' }, { status: 400 })
    }

    let balance = null
    let currency = 'USD'
    let usage = null
    let limit = null
    let error = null

    switch (provider) {
      case 'openai':
        // OpenAI - verificar uso e limites
        try {
          // Buscar uso do mês atual
          const now = new Date()
          const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
          const endDate = now.toISOString().split('T')[0]
          
          const usageRes = await fetch(
            `https://api.openai.com/v1/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`,
            { headers: { 'Authorization': `Bearer ${key}` } }
          )
          
          const limitRes = await fetch(
            'https://api.openai.com/v1/dashboard/billing/subscription',
            { headers: { 'Authorization': `Bearer ${key}` } }
          )

          if (usageRes.ok && limitRes.ok) {
            const usageData = await usageRes.json()
            const limitData = await limitRes.json()
            
            usage = (usageData.total_usage / 100).toFixed(2) // Converte centavos para dólares
            limit = limitData.hard_limit_usd || limitData.soft_limit_usd
            balance = limit ? (parseFloat(limit) - parseFloat(usage)).toFixed(2) : null
          } else {
            // API antiga pode não funcionar, tentar método alternativo
            const orgRes = await fetch('https://api.openai.com/v1/models', {
              headers: { 'Authorization': `Bearer ${key}` }
            })
            if (orgRes.ok) {
              balance = 'Chave válida (saldo não disponível via API)'
            }
          }
        } catch (e) {
          error = 'Não foi possível verificar saldo OpenAI'
        }
        break

      case 'anthropic':
      case 'claude':
        // Anthropic não tem API pública para verificar saldo
        // Apenas verificar se a chave funciona
        try {
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': key,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'claude-3-haiku-20240307',
              max_tokens: 1,
              messages: [{ role: 'user', content: 'hi' }]
            })
          })
          if (res.ok || res.status === 400) {
            balance = 'Chave válida - Ver saldo em console.anthropic.com'
          }
        } catch (e) {
          error = 'Chave inválida ou sem créditos'
        }
        break

      case 'groq':
        // Groq é grátis, só verificar se funciona
        try {
          const res = await fetch('https://api.groq.com/openai/v1/models', {
            headers: { 'Authorization': `Bearer ${key}` }
          })
          if (res.ok) {
            balance = '∞'
            limit = '14.400 req/dia'
            usage = 'GRÁTIS - Sem limite de créditos'
          }
        } catch (e) {
          error = 'Chave inválida'
        }
        break

      case 'gemini':
        // Google Gemini - verificar se funciona
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1/models?key=${key}`
          )
          if (res.ok) {
            balance = '∞'
            limit = '60 req/min'
            usage = 'GRÁTIS - Limite por requisições'
          }
        } catch (e) {
          error = 'Chave inválida'
        }
        break

      case 'together':
        // Together AI - tem API de billing
        try {
          const res = await fetch('https://api.together.xyz/v1/billing', {
            headers: { 'Authorization': `Bearer ${key}` }
          })
          if (res.ok) {
            const data = await res.json()
            balance = data.balance?.toFixed(2) || 'Disponível'
            usage = data.usage?.toFixed(2) || '0'
          }
        } catch (e) {
          // Tentar verificar se a chave funciona
          const modelsRes = await fetch('https://api.together.xyz/v1/models', {
            headers: { 'Authorization': `Bearer ${key}` }
          })
          if (modelsRes.ok) {
            balance = 'Chave válida - Ver saldo em together.xyz'
          }
        }
        break

      case 'mistral':
        // Mistral - verificar se funciona
        try {
          const res = await fetch('https://api.mistral.ai/v1/models', {
            headers: { 'Authorization': `Bearer ${key}` }
          })
          if (res.ok) {
            balance = 'Chave válida - Ver saldo em console.mistral.ai'
          }
        } catch (e) {
          error = 'Chave inválida'
        }
        break

      case 'cohere':
        // Cohere - verificar se funciona
        try {
          const res = await fetch('https://api.cohere.ai/v1/check-api-key', {
            headers: { 'Authorization': `Bearer ${key}` }
          })
          if (res.ok) {
            const data = await res.json()
            balance = data.valid ? 'Chave válida' : 'Chave inválida'
          }
        } catch (e) {
          error = 'Não foi possível verificar'
        }
        break

      case 'replicate':
        // Replicate - tem API de billing
        try {
          const res = await fetch('https://api.replicate.com/v1/account', {
            headers: { 'Authorization': `Token ${key}` }
          })
          if (res.ok) {
            const data = await res.json()
            balance = 'Chave válida'
            usage = data.username || 'Conta ativa'
          }
        } catch (e) {
          error = 'Chave inválida'
        }
        break

      case 'huggingface':
        // HuggingFace - verificar se funciona
        try {
          const res = await fetch('https://huggingface.co/api/whoami-v2', {
            headers: { 'Authorization': `Bearer ${key}` }
          })
          if (res.ok) {
            const data = await res.json()
            balance = '∞'
            usage = `Conta: ${data.name || 'Ativa'}`
            limit = 'GRÁTIS - Modelos gratuitos ilimitados'
          }
        } catch (e) {
          error = 'Chave inválida'
        }
        break

      case 'deepseek':
        // DeepSeek - verificar saldo
        try {
          const res = await fetch('https://api.deepseek.com/user/balance', {
            headers: { 'Authorization': `Bearer ${key}` }
          })
          if (res.ok) {
            const data = await res.json()
            balance = data.balance_infos?.[0]?.total_balance || 'Disponível'
            currency = 'CNY'
          }
        } catch (e) {
          // Tentar verificar se funciona
          const modelsRes = await fetch('https://api.deepseek.com/models', {
            headers: { 'Authorization': `Bearer ${key}` }
          })
          if (modelsRes.ok) {
            balance = 'Chave válida - Ver saldo em platform.deepseek.com'
          }
        }
        break

      case 'perplexity':
        // Perplexity - verificar se funciona
        try {
          const res = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'llama-3.1-sonar-small-128k-online',
              messages: [{ role: 'user', content: 'hi' }],
              max_tokens: 1
            })
          })
          if (res.ok || res.status === 400) {
            balance = 'Chave válida - Ver saldo em perplexity.ai'
          }
        } catch (e) {
          error = 'Chave inválida'
        }
        break

      case 'openrouter':
        // OpenRouter - tem API de créditos
        try {
          const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
            headers: { 'Authorization': `Bearer ${key}` }
          })
          if (res.ok) {
            const data = await res.json()
            balance = data.data?.limit ? `$${(data.data.limit / 100).toFixed(2)}` : 'Disponível'
            usage = data.data?.usage ? `$${(data.data.usage / 100).toFixed(2)} usado` : null
          }
        } catch (e) {
          error = 'Chave inválida'
        }
        break

      case 'cerebras':
        // Cerebras - grátis, só verificar se funciona
        try {
          const res = await fetch('https://api.cerebras.ai/v1/models', {
            headers: { 'Authorization': `Bearer ${key}` }
          })
          if (res.ok) {
            balance = '∞'
            limit = '30 req/min'
            usage = 'GRÁTIS (Beta)'
          }
        } catch (e) {
          error = 'Chave inválida'
        }
        break

      default:
        error = 'Provedor não suportado para verificação de saldo'
    }

    return NextResponse.json({
      success: !error,
      provider,
      balance,
      usage,
      limit,
      currency,
      error
    })

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Erro ao verificar saldo' 
    }, { status: 500 })
  }
}
