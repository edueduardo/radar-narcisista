/**
 * Script de Verificação de Saúde do Sistema
 * Executa testes básicos em todas as APIs e serviços
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface HealthCheckResult {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
  duration: number
}

const results: HealthCheckResult[] = []

async function checkEndpoint(
  name: string,
  url: string,
  options?: RequestInit
): Promise<HealthCheckResult> {
  const start = Date.now()
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    })
    
    const duration = Date.now() - start
    
    if (response.ok) {
      return {
        name,
        status: 'pass',
        message: `OK (${response.status})`,
        duration
      }
    } else if (response.status === 401 || response.status === 403) {
      return {
        name,
        status: 'warn',
        message: `Auth required (${response.status})`,
        duration
      }
    } else {
      return {
        name,
        status: 'fail',
        message: `Error (${response.status})`,
        duration
      }
    }
  } catch (error: any) {
    return {
      name,
      status: 'fail',
      message: error.message,
      duration: Date.now() - start
    }
  }
}

async function runHealthChecks() {
  console.log('🏥 VERIFICAÇÃO DE SAÚDE DO SISTEMA')
  console.log('=' .repeat(50))
  console.log(`Base URL: ${BASE_URL}`)
  console.log('')

  // APIs Públicas
  console.log('📡 APIs Públicas:')
  results.push(await checkEndpoint('Health', `${BASE_URL}/api/health`))
  results.push(await checkEndpoint('Public Frontpage', `${BASE_URL}/api/public/frontpage`))
  results.push(await checkEndpoint('Plan Catalog', `${BASE_URL}/api/plan-catalog`))
  results.push(await checkEndpoint('Waitlist', `${BASE_URL}/api/waitlist`, { method: 'GET' }))

  // APIs que requerem auth (esperamos 401)
  console.log('\n🔐 APIs Protegidas (esperado 401/403):')
  results.push(await checkEndpoint('Chat', `${BASE_URL}/api/chat`))
  results.push(await checkEndpoint('Diário', `${BASE_URL}/api/diario`))
  results.push(await checkEndpoint('Gamification', `${BASE_URL}/api/gamification`))
  results.push(await checkEndpoint('Notifications', `${BASE_URL}/api/notifications`))
  results.push(await checkEndpoint('Safety Plan', `${BASE_URL}/api/safety-plan`))

  // Páginas principais
  console.log('\n📄 Páginas Principais:')
  results.push(await checkEndpoint('Home', `${BASE_URL}/`))
  results.push(await checkEndpoint('Login', `${BASE_URL}/login`))
  results.push(await checkEndpoint('Cadastro', `${BASE_URL}/cadastro`))
  results.push(await checkEndpoint('Planos', `${BASE_URL}/planos`))
  results.push(await checkEndpoint('FAQ', `${BASE_URL}/faq`))
  results.push(await checkEndpoint('Termos', `${BASE_URL}/termos`))
  results.push(await checkEndpoint('Privacidade', `${BASE_URL}/privacidade`))

  // Páginas protegidas (esperamos redirect ou 401)
  console.log('\n🔒 Páginas Protegidas:')
  results.push(await checkEndpoint('Dashboard', `${BASE_URL}/dashboard`))
  results.push(await checkEndpoint('Chat Page', `${BASE_URL}/chat`))
  results.push(await checkEndpoint('Diário Page', `${BASE_URL}/diario`))
  results.push(await checkEndpoint('Teste Clareza', `${BASE_URL}/teste-clareza`))

  // Resumo
  console.log('\n' + '=' .repeat(50))
  console.log('📊 RESUMO:')
  
  const passed = results.filter(r => r.status === 'pass').length
  const warned = results.filter(r => r.status === 'warn').length
  const failed = results.filter(r => r.status === 'fail').length
  
  console.log(`✅ Passou: ${passed}`)
  console.log(`⚠️ Aviso: ${warned}`)
  console.log(`❌ Falhou: ${failed}`)
  
  // Detalhes
  console.log('\n📋 DETALHES:')
  results.forEach(r => {
    const icon = r.status === 'pass' ? '✅' : r.status === 'warn' ? '⚠️' : '❌'
    console.log(`${icon} ${r.name}: ${r.message} (${r.duration}ms)`)
  })

  // Retornar código de saída
  if (failed > 0) {
    console.log('\n❌ Alguns testes falharam!')
    process.exit(1)
  } else {
    console.log('\n✅ Todos os testes passaram!')
    process.exit(0)
  }
}

// Executar
runHealthChecks().catch(console.error)
