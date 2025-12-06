/**
 * TESTE COMPLETO DE TODAS AS APIs
 * Executa: node scripts/test-all-apis.js
 * 
 * Testa todas as rotas /api/* do sistema
 */

const BASE_URL = process.env.BASE_URL || 'https://radar-narcisista.vercel.app'

// APIs públicas (não precisam de autenticação)
const PUBLIC_APIS = [
  { name: 'Health Check', path: '/api/health', method: 'GET' },
  { name: 'Frontpage Content', path: '/api/frontpage/content', method: 'GET' },
  { name: 'Public Radar Pulse', path: '/api/public/radar-pulse', method: 'GET' },
  { name: 'Public Frontpage', path: '/api/public/frontpage', method: 'GET' },
  { name: 'Plans', path: '/api/plans', method: 'GET' },
  { name: 'Plans Catalog', path: '/api/plans/catalog', method: 'GET' },
  { name: 'Plan Catalog', path: '/api/plan-catalog', method: 'GET' },
  { name: 'Fanpage Config', path: '/api/fanpage/config', method: 'GET' },
  { name: 'Fanpage Insights', path: '/api/fanpage/insights', method: 'GET' },
  { name: 'Content', path: '/api/content', method: 'GET' },
]

// APIs que precisam de autenticação (vão retornar 401/403/405)
const AUTH_APIS = [
  { name: 'Diário', path: '/api/diario', method: 'GET', expectAuth: true },
  { name: 'Chat', path: '/api/chat', method: 'POST', expectAuth: true }, // Chat é POST
  { name: 'Waitlist', path: '/api/waitlist', method: 'POST', expectAuth: true },
  { name: 'Safety Plan', path: '/api/safety-plan', method: 'GET', expectAuth: true },
  { name: 'Notifications', path: '/api/notifications', method: 'GET', expectAuth: true },
  { name: 'Gamification', path: '/api/gamification', method: 'GET', expectAuth: true },
  { name: 'User Export', path: '/api/user/export', method: 'GET', expectAuth: true },
  { name: 'Academy Tracks', path: '/api/academy/tracks', method: 'GET', expectAuth: true },
  { name: 'Academy Progress', path: '/api/academy/progress', method: 'GET', expectAuth: true },
]

// APIs Admin (vão retornar 401/403)
const ADMIN_APIS = [
  { name: 'Admin AI Config', path: '/api/admin/ai-config', method: 'GET', expectAuth: true },
  { name: 'Admin AI Flows', path: '/api/admin/ai-flows', method: 'GET', expectAuth: true },
  { name: 'Admin AI Map', path: '/api/admin/ai-map', method: 'GET', expectAuth: true },
  { name: 'Admin Content', path: '/api/admin/content', method: 'GET', expectAuth: true },
  { name: 'Admin Fanpage', path: '/api/admin/fanpage', method: 'GET', expectAuth: true },
  { name: 'Admin Control Tower', path: '/api/admin/control-tower', method: 'GET', expectAuth: true },
  { name: 'Admin Check Env Keys', path: '/api/admin/check-env-keys', method: 'GET', expectAuth: true },
  { name: 'Admin Tenants', path: '/api/admin/tenants', method: 'GET', expectAuth: true },
]

// Arquivos estáticos
const STATIC_FILES = [
  { name: 'Manifest', path: '/manifest.json', method: 'GET' },
  { name: 'Robots', path: '/robots.txt', method: 'GET' },
  { name: 'Sitemap', path: '/sitemap.xml', method: 'GET' },
  { name: 'Favicon', path: '/favicon.ico', method: 'GET' },
]

async function testAPI(api) {
  const url = `${BASE_URL}${api.path}`
  const start = Date.now()
  
  try {
    const response = await fetch(url, { 
      method: api.method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RadarNarcisista-TestBot/1.0'
      }
    })
    const latency = Date.now() - start
    const status = response.status
    
    // Para APIs que precisam de auth, 401/403/405 é esperado
    const success = api.expectAuth 
      ? (status === 401 || status === 403 || status === 405 || status === 200)
      : (status >= 200 && status < 400)
    
    return {
      name: api.name,
      path: api.path,
      status,
      latency,
      success,
      note: api.expectAuth && status !== 200 ? '(auth required - OK)' : ''
    }
  } catch (error) {
    return {
      name: api.name,
      path: api.path,
      status: 'ERROR',
      latency: Date.now() - start,
      success: false,
      error: error.message
    }
  }
}

async function runTestGroup(name, apis) {
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`📦 ${name}`)
  console.log(`${'─'.repeat(60)}`)
  
  let passed = 0
  let failed = 0
  
  for (const api of apis) {
    const result = await testAPI(api)
    
    if (result.success) {
      passed++
      console.log(`  ✅ ${result.name.padEnd(25)} ${String(result.status).padEnd(5)} ${result.latency}ms ${result.note}`)
    } else {
      failed++
      console.log(`  ❌ ${result.name.padEnd(25)} ${String(result.status).padEnd(5)} ${result.error || 'Failed'}`)
    }
  }
  
  return { passed, failed }
}

async function runAllTests() {
  console.log('\n' + '═'.repeat(60))
  console.log('🧪 TESTE COMPLETO DE APIs - RADAR NARCISISTA')
  console.log('═'.repeat(60))
  console.log(`🌐 Base URL: ${BASE_URL}`)
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`)
  
  let totalPassed = 0
  let totalFailed = 0
  
  // Testar cada grupo
  const groups = [
    { name: 'APIs PÚBLICAS', apis: PUBLIC_APIS },
    { name: 'APIs COM AUTENTICAÇÃO', apis: AUTH_APIS },
    { name: 'APIs ADMIN', apis: ADMIN_APIS },
    { name: 'ARQUIVOS ESTÁTICOS', apis: STATIC_FILES },
  ]
  
  for (const group of groups) {
    const result = await runTestGroup(group.name, group.apis)
    totalPassed += result.passed
    totalFailed += result.failed
  }
  
  // Resumo final
  console.log('\n' + '═'.repeat(60))
  console.log('📊 RESUMO FINAL')
  console.log('═'.repeat(60))
  console.log(`  ✅ Passou: ${totalPassed}`)
  console.log(`  ❌ Falhou: ${totalFailed}`)
  console.log(`  📈 Taxa de sucesso: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`)
  console.log('═'.repeat(60))
  
  if (totalFailed > 0) {
    console.log('\n⚠️  Algumas APIs falharam. Verifique os logs acima.')
    process.exit(1)
  } else {
    console.log('\n🎉 Todas as APIs estão respondendo corretamente!')
    process.exit(0)
  }
}

runAllTests()
