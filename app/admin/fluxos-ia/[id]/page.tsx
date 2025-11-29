import { requireAdmin } from '@/lib/admin-auth'
import FlowBuilderClient from './FlowBuilderClient'

export const dynamic = 'force-dynamic'

export default async function FlowBuilderPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { session } = await requireAdmin()
  const { id } = await params

  // Buscar dados do fluxo
  let flowData = {
    flow: null,
    nodes: [],
    edges: [],
    versions: []
  }

  try {
    const flowResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/ai-flows/${id}`, {
      cache: 'no-store',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })
    
    if (flowResponse.ok) {
      const flowResult = await flowResponse.json()
      if (flowResult.success && flowResult.data) {
        flowData = flowResult.data
      }
    }
  } catch (error) {
    console.error('Erro ao buscar fluxo:', error)
  }

  return <FlowBuilderClient flowId={id} initialData={flowData} />
}
