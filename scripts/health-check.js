/**
 * HEALTH CHECK COMPLETO
 * Executa: node scripts/health-check.js
 * 
 * Verifica se todos os serviços estão online
 */

const BASE_URL = process.env.BASE_URL || 'https://radar-narcisista.vercel.app'

const CHECKS = [
  {
    name: 'Website Principal',
    url: BASE_URL,
    type: 'page',
    critical: true
  },
  {
    name: 'API Health',
    url: `${BASE_URL}/api/health`,
    type: 'api',
    critical: true,
    validateJson: (data) => data.status === 'healthy' || data.status === 'degraded'
  },
  {
    name: 'Login Page',
    url: `${BASE_URL}/login`,
    type: 'page',
    critical: true
  },
  {
    name: 'Dashboard Page',
    url: `${BASE_URL}/dashboard`,
    type: 'page',
    critical: true
  },
  {
    name: 'Admin Page',
    url: `${BASE_URL}/admin`,
    type: 'page',
    critical: true
  },
  {
    name: 'Manifest PWA',
    url: `${BASE_URL}/manifest.json`,
    type: 'file',
    critical: false
  },
  {
    name: 'Robots.txt',
    url: `${BASE_URL}/robots.txt`,
    type: 'file',
    critical: false
  },
  {
    name: 'Sitemap',
    url: `${BASE_URL}/sitemap.xml`,
    type: 'file',
    critical: false
  },
  {
    name: 'API Plans',
    url: `${BASE_URL}/api/plans`,
    type: 'api',
    critical: false
  },
  {
    name: 'API Frontpage',
    url: `${BASE_URL}/api/frontpage/content`,
    type: 'api',
    critical: false
  },
  {
    name: 'API Radar Pulse',
    url: `${BASE_URL}/api/public/radar-pulse`,
    type: 'api',
    critical: false
  }
]

async function checkService(check) {
  const start = Date.now()
  
  try {
    const response = await fetch(check.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'RadarNarcisista-HealthCheck/1.0'
      },
      redirect: 'follow'
    })
    
    const latency = Date.now() - start
    const status = response.status
    
    // Verificar se está online (2xx ou 3xx)
    let online = status >= 200 && status < 400
    
    // Para APIs, verificar JSON se necessário
    if (check.validateJson && online) {
      try {
        const data = await response.json()
        online = check.validateJson(data)
      } catch {
        online = false
      }
    }
    
    return {
      name: check.name,
      url: check.url,
      type: check.type,
      critical: check.critical,
      status,
      latency,
      online
    }
  } catch (error) {
    return {
      name: check.name,
      url: check.url,
      type: check.type,
      critical: check.critical,
      status: 'ERROR',
      latency: Date.now() - start,
      online: false,
      error: error.message
    }
  }
}

function getStatusEmoji(result) {
  if (result.online) return '🟢'
  if (result.critical) return '🔴'
  return '🟡'
}

function getLatencyColor(latency) {
  if (latency < 500) return 'fast'
  if (latency < 1500) return 'normal'
  return 'slow'
}

async function runHealthCheck() {
  console.log('\n' + '═'.repeat(70))
  console.log('🏥 HEALTH CHECK - RADAR NARCISISTA')
  console.log('═'.repeat(70))
  console.log(`🌐 Base URL: ${BASE_URL}`)
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`)
  console.log('═'.repeat(70))
  
  const results = []
  
  for (const check of CHECKS) {
    const result = await checkService(check)
    results.push(result)
    
    const emoji = getStatusEmoji(result)
    const latencyInfo = result.online ? `${result.latency}ms` : result.error || 'Offline'
    const criticalTag = result.critical ? '[CRÍTICO]' : ''
    
    console.log(`${emoji} ${result.name.padEnd(20)} ${String(result.status).padEnd(5)} ${latencyInfo.padEnd(15)} ${criticalTag}`)
  }
  
  // Análise
  console.log('\n' + '─'.repeat(70))
  console.log('📊 ANÁLISE')
  console.log('─'.repeat(70))
  
  const online = results.filter(r => r.online)
  const offline = results.filter(r => !r.online)
  const criticalOffline = offline.filter(r => r.critical)
  
  console.log(`  🟢 Online: ${online.length}/${results.length}`)
  console.log(`  🔴 Offline: ${offline.length}/${results.length}`)
  
  if (criticalOffline.length > 0) {
    console.log(`\n  ⚠️  SERVIÇOS CRÍTICOS OFFLINE:`)
    criticalOffline.forEach(r => {
      console.log(`     - ${r.name}: ${r.error || 'Não respondeu'}`)
    })
  }
  
  // Latência média
  const avgLatency = online.reduce((sum, r) => sum + r.latency, 0) / online.length
  console.log(`\n  ⏱️  Latência média: ${avgLatency.toFixed(0)}ms`)
  
  // Status geral
  console.log('\n' + '═'.repeat(70))
  
  if (criticalOffline.length > 0) {
    console.log('🔴 STATUS: CRÍTICO - Serviços essenciais offline!')
    process.exit(2)
  } else if (offline.length > 0) {
    console.log('🟡 STATUS: DEGRADADO - Alguns serviços offline')
    process.exit(1)
  } else {
    console.log('🟢 STATUS: SAUDÁVEL - Todos os serviços online!')
    process.exit(0)
  }
}

runHealthCheck()
