import { requireAdmin } from '@/lib/admin-auth'
import FlowsClient from './FlowsClient'

export const dynamic = 'force-dynamic'

export default async function FlowsPage() {
  const { session } = await requireAdmin()

  // Buscar fluxos iniciais
  let initialFlows = []

  try {
    const flowsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/ai-flows`, {
      cache: 'no-store',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })
    
    if (flowsResponse.ok) {
      const flowsData = await flowsResponse.json()
      if (flowsData.success && flowsData.data) {
        initialFlows = flowsData.data
      }
    }
  } catch (error) {
    console.error('Erro ao buscar fluxos:', error)
  }

  return <FlowsClient initialFlows={initialFlows} />
}
