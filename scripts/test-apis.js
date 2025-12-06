/**
 * Script de Teste Rápido das APIs
 * Executa: node scripts/test-apis.js
 */

const BASE_URL = process.env.BASE_URL || 'https://radar-narcisista.vercel.app'

const APIs = [
  { name: 'Health Check', path: '/api/health', method: 'GET' },
  { name: 'Frontpage Content', path: '/api/frontpage/content', method: 'GET' },
  { name: 'Public Radar Pulse', path: '/api/public/radar-pulse', method: 'GET' },
  { name: 'Plans', path: '/api/plans', method: 'GET' },
  { name: 'PWA Manifest', path: '/manifest.json', method: 'GET' },
]

async function testAPI(api) {
  const url = `${BASE_URL}${api.path}`
  const start = Date.now()
  
  try {
    const response = await fetch(url, { method: api.method })
    const latency = Date.now() - start
    const status = response.status
    
    let data = null
    try {
      data = await response.json()
    } catch {
      data = await response.text()
    }
    
    const success = status >= 200 && status < 400
    
    return {
      name: api.name,
      url,
      status,
      latency,
      success,
      data: typeof data === 'object' ? JSON.stringify(data).slice(0, 100) + '...' : data.slice(0, 100)
    }
  } catch (error) {
    return {
      name: api.name,
      url,
      status: 'ERROR',
      latency: Date.now() - start,
      success: false,
      error: error.message
    }
  }
}

async function runTests() {
  console.log('\n🧪 TESTE DE APIs - RADAR NARCISISTA')
  console.log('=' .repeat(60))
  console.log(`🌐 Base URL: ${BASE_URL}`)
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`)
  console.log('=' .repeat(60))
  
  let passed = 0
  let failed = 0
  
  for (const api of APIs) {
    const result = await testAPI(api)
    
    if (result.success) {
      passed++
      console.log(`\n✅ ${result.name}`)
      console.log(`   URL: ${result.url}`)
      console.log(`   Status: ${result.status} | Latência: ${result.latency}ms`)
    } else {
      failed++
      console.log(`\n❌ ${result.name}`)
      console.log(`   URL: ${result.url}`)
      console.log(`   Status: ${result.status} | Erro: ${result.error || 'HTTP Error'}`)
    }
  }
  
  console.log('\n' + '=' .repeat(60))
  console.log(`📊 RESULTADO: ${passed} passou | ${failed} falhou`)
  console.log('=' .repeat(60))
  
  if (failed > 0) {
    console.log('\n⚠️  Algumas APIs falharam. Verifique os logs acima.')
    process.exit(1)
  } else {
    console.log('\n🎉 Todas as APIs estão funcionando!')
    process.exit(0)
  }
}

runTests()
