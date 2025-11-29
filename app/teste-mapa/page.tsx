// PÁGINA DE TESTE - Acesso direto ao Mapa de IAs sem autenticação
// URL: /teste-mapa
// REMOVER EM PRODUÇÃO!

import AIMapClient from '../admin/mapa-ias/AIMapClient'

const defaultData = {
  agents: [],
  metrics: [],
  incidents: [],
  suggestions: [],
  summary: {
    total_agents: 0,
    active_agents: 0,
    healthy_agents: 0,
    degraded_agents: 0,
    down_agents: 0,
    total_cost_today: 0,
    scope_violations: 0,
    open_incidents: 0
  }
}

async function getData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/admin/ai-map?mock=true`, {
      cache: 'no-store'
    })
    if (!res.ok) throw new Error('Falha ao buscar dados')
    const json = await res.json()
    
    // A API retorna { success, mode, data, summary }
    if (json.success && json.data) {
      return {
        agents: json.data.agents || [],
        metrics: json.data.metrics || [],
        incidents: json.data.incidents || [],
        suggestions: json.data.suggestions || [],
        summary: json.summary || defaultData.summary
      }
    }
    return defaultData
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    return defaultData
  }
}

export default async function TesteMapaPage() {
  const data = await getData()
  
  return (
    <div>
      <div className="bg-yellow-500 text-black text-center py-2 text-sm font-bold">
        ⚠️ PÁGINA DE TESTE - SEM AUTENTICAÇÃO - REMOVER EM PRODUÇÃO
      </div>
      <AIMapClient initialData={data} />
    </div>
  )
}
