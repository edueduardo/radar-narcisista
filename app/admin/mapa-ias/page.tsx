import { requireAdmin } from '@/lib/admin-auth'
import AIMapClient from './AIMapClient'

export const dynamic = 'force-dynamic'

export default async function AIMapPage() {
  const { session } = await requireAdmin()

  // Buscar dados do mapa de IAs
  let initialData = {
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

  try {
    const mapResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/ai-map`, {
      cache: 'no-store',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })
    
    if (mapResponse.ok) {
      const mapData = await mapResponse.json()
      // A API retorna { success, mode, data, summary }
      if (mapData.success && mapData.data) {
        initialData = {
          agents: mapData.data.agents || [],
          metrics: mapData.data.metrics || [],
          incidents: mapData.data.incidents || [],
          suggestions: mapData.data.suggestions || [],
          summary: mapData.summary || initialData.summary
        }
      }
    }
  } catch (error) {
    console.error('Erro ao buscar dados do mapa de IAs:', error)
  }

  return <AIMapClient initialData={initialData} />
}
