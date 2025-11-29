import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { requireAdminAPI } from '@/lib/admin-auth'

// Tipos para os fluxos
interface Flow {
  id: string
  name: string
  description: string | null
  is_active: boolean
  mode_default: string
  created_by: string | null
  created_at: string
  updated_at: string
}

interface FlowNode {
  id: string
  flow_id: string
  type: 'TRIGGER' | 'IA' | 'ACTION'
  subtype: string
  ai_agent_id: string | null
  position_x: number
  position_y: number
  config: any
  created_at: string
  updated_at: string
}

interface FlowEdge {
  id: string
  flow_id: string
  source_node_id: string
  source_handle: string
  target_node_id: string
  target_handle: string
  created_at: string
}

interface FlowRun {
  id: string
  flow_id: string
  mode: 'simulation' | 'real'
  triggered_by_event: any
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'ERROR'
  started_at: string
  finished_at: string | null
  error_message: string | null
}

// Dados mock para demonstração
const mockFlows: Flow[] = [
  {
    id: 'demo-flow-1',
    name: 'Fluxo de Análise de Diário',
    description: 'Analisa novos episódios do diário e detecta padrões de risco',
    is_active: true,
    mode_default: 'simulation',
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-flow-2',
    name: 'Fluxo de Geração de Carta-Selo',
    description: 'Gera carta-selo quando usuário completa marcos importantes',
    is_active: true,
    mode_default: 'simulation',
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockNodes: FlowNode[] = [
  {
    id: 'node-1',
    flow_id: 'demo-flow-1',
    type: 'TRIGGER',
    subtype: 'diario_novo',
    ai_agent_id: null,
    position_x: 100,
    position_y: 100,
    config: { min_intensidade: 3 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'node-2',
    flow_id: 'demo-flow-1',
    type: 'IA',
    subtype: 'coach_clareza_v1',
    ai_agent_id: 'coach_clareza_v1',
    position_x: 300,
    position_y: 100,
    config: { profundidade: 'media' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'node-3',
    flow_id: 'demo-flow-1',
    type: 'ACTION',
    subtype: 'atualizar_flags_risco',
    ai_agent_id: null,
    position_x: 500,
    position_y: 100,
    config: { flag_risco: true },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockEdges: FlowEdge[] = [
  {
    id: 'edge-1',
    flow_id: 'demo-flow-1',
    source_node_id: 'node-1',
    source_handle: 'output',
    target_node_id: 'node-2',
    target_handle: 'input',
    created_at: new Date().toISOString()
  },
  {
    id: 'edge-2',
    flow_id: 'demo-flow-1',
    source_node_id: 'node-2',
    source_handle: 'output',
    target_node_id: 'node-3',
    target_handle: 'input',
    created_at: new Date().toISOString()
  }
]

// GET - Listar todos os fluxos
export async function GET(request: Request) {
  // Verificar permissão de admin
  const auth = await requireAdminAPI(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const useMock = searchParams.get('mock') === 'true'
    
    if (useMock) {
      console.log('🔧 MODO MOCK ATIVADO - Usando dados fictícios para fluxos')
      return NextResponse.json({
        success: true,
        mode: 'mock',
        data: mockFlows
      })
    }

    // MODO REAL - Buscar do Supabase
    console.log('📊 MODO REAL ATIVADO - Buscando fluxos do Supabase')

    // Verificar se tabelas existem
    const { error: tablesError } = await supabaseAdmin
      .from('ai_flows')
      .select('id')
      .limit(1)

    if (tablesError) {
      console.log('⚠️ Tabelas de fluxos não encontradas:', tablesError.message)
      return NextResponse.json({
        success: true,
        mode: 'real_empty',
        data: [],
        message: 'Tabelas de fluxos não encontradas. Execute a migração SQL primeiro.'
      })
    }

    const { data: flows, error } = await supabaseAdmin
      .from('ai_flows')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      mode: 'real',
      data: flows || []
    })

  } catch (error) {
    console.error('Erro ao buscar fluxos:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar fluxos' },
      { status: 500 }
    )
  }
}

// POST - Criar novo fluxo
export async function POST(request: Request) {
  // Verificar permissão de admin
  const auth = await requireAdminAPI(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { name, description, mode_default = 'simulation' } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    const { data: flow, error } = await supabaseAdmin
      .from('ai_flows')
      .insert({
        name,
        description,
        mode_default,
        created_by: 'system' // TODO: pegar do usuário logado
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: flow
    })

  } catch (error) {
    console.error('Erro ao criar fluxo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar fluxo' },
      { status: 500 }
    )
  }
}
