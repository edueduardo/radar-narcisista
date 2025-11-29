import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { requireAdminAPI } from '@/lib/admin-auth'

// Dados mock inline para evitar problemas de importação
const mockData = {
  agents: [
    {
      id: 'coach_clareza_v1',
      display_name: 'Coach de Clareza - v1',
      role: 'PRODUCT_CHAT',
      layer: 'produto',
      provider: 'openai',
      model: 'gpt-4o-mini',
      endpoint: '/api/ai/chat',
      active: true,
      priority: 1,
      features: ['chat_usuario', 'sugerir_titulo_diario', 'resumo_semanal'],
      scope_declared: ['chat_usuario'],
      last_status: 'HEALTHY',
      last_status_reason: null,
      last_heartbeat_at: new Date().toISOString()
    },
    {
      id: 'voice_transcribe_whisper_v1',
      display_name: 'Transcrição de Voz - Whisper',
      role: 'INFRA_TRANSCRIBE',
      layer: 'infra',
      provider: 'openai',
      model: 'whisper-1',
      endpoint: '/api/voice/transcribe',
      active: true,
      priority: 1,
      features: ['transcrever_audio'],
      scope_declared: ['transcrever_audio'],
      last_status: 'DEGRADED',
      last_status_reason: 'Latência acima do normal (2.3s)',
      last_heartbeat_at: new Date().toISOString()
    },
    {
      id: 'guardian_ux_v1',
      display_name: 'IA Guardiã de UX',
      role: 'META_UX',
      layer: 'meta',
      provider: 'anthropic',
      model: 'claude-3-haiku',
      endpoint: '/api/ai/guardian/ux',
      active: true,
      priority: 1,
      features: ['analise_ux', 'sugestoes_conversao'],
      scope_declared: ['analise_ux', 'sugestoes_conversao'],
      last_status: 'HEALTHY',
      last_status_reason: null,
      last_heartbeat_at: new Date().toISOString()
    },
    {
      id: 'coach_clareza_backup',
      display_name: 'Coach de Clareza - Backup',
      role: 'PRODUCT_CHAT',
      layer: 'produto',
      provider: 'anthropic',
      model: 'claude-3-sonnet',
      endpoint: '/api/ai/chat/backup',
      active: false,
      priority: 2,
      features: ['chat_usuario'],
      scope_declared: ['chat_usuario'],
      last_status: 'HEALTHY',
      last_status_reason: null,
      last_heartbeat_at: new Date().toISOString()
    }
  ],
  metrics: [
    {
      id: '1',
      agent_id: 'coach_clareza_v1',
      date: new Date().toISOString().split('T')[0],
      calls_total: 1250,
      calls_success: 1240,
      calls_error: 10,
      avg_latency_ms: 1200,
      tokens_input: 125000,
      tokens_output: 87500,
      cost_estimated_usd: 4.25
    },
    {
      id: '2',
      agent_id: 'voice_transcribe_whisper_v1',
      date: new Date().toISOString().split('T')[0],
      calls_total: 340,
      calls_success: 320,
      calls_error: 20,
      avg_latency_ms: 2300,
      tokens_input: 0,
      tokens_output: 0,
      cost_estimated_usd: 1.70
    },
    {
      id: '3',
      agent_id: 'guardian_ux_v1',
      date: new Date().toISOString().split('T')[0],
      calls_total: 50,
      calls_success: 50,
      calls_error: 0,
      avg_latency_ms: 800,
      tokens_input: 15000,
      tokens_output: 8000,
      cost_estimated_usd: 0.45
    }
  ],
  incidents: [
    {
      id: '1',
      agent_id: 'voice_transcribe_whisper_v1',
      old_status: 'HEALTHY',
      new_status: 'DEGRADED',
      reason: 'Latência aumentou para 2.3s (limite: 2s)',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      resolved_at: null
    }
  ],
  suggestions: [
    {
      id: '1',
      agent_id: 'coach_clareza_v1',
      type: 'SCOPE_VIOLATION',
      suggestion: 'A IA coach_clareza_v1 está sendo usada para "resumo_semanal" que não está no escopo declarado. Considere adicionar ao escopo ou restringir o uso.',
      auto_applied: false,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      agent_id: null,
      type: 'COST_OPTIMIZATION',
      suggestion: 'Migrar 30% das chamadas do coach_clareza_v1 para gpt-4o-mini pode economizar ~$50/mês.',
      auto_applied: false,
      created_at: new Date().toISOString()
    }
  ]
}

// Tipos
interface Agent {
  id: string
  display_name: string
  role: string
  layer: string
  provider: string
  model: string
  endpoint: string
  active: boolean
  priority: number
  features: string[]
  scope_declared: string[]
  last_status: string
  last_status_reason: string | null
  last_heartbeat_at: string
}

interface Metric {
  id: string
  agent_id: string
  date: string
  calls_total: number
  calls_success: number
  calls_error: number
  avg_latency_ms: number
  tokens_input: number
  tokens_output: number
  cost_estimated_usd: number
}

interface Incident {
  id: string
  agent_id: string
  old_status: string
  new_status: string
  reason: string
  created_at: string
  resolved_at: string | null
}

interface Suggestion {
  id: string
  agent_id: string | null
  type: string
  suggestion: string
  auto_applied: boolean
  created_at: string
}

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
    
    // Verificar se deve usar modo mock
    if (useMock) {
      console.log('🔧 MODO MOCK ATIVADO - Usando dados fictícios')
      return NextResponse.json({
        success: true,
        mode: 'mock',
        data: mockData,
        summary: {
          total_agents: mockData.agents.length,
          active_agents: mockData.agents.filter((a: Agent) => a.active).length,
          healthy_agents: mockData.agents.filter((a: Agent) => a.last_status === 'HEALTHY').length,
          degraded_agents: mockData.agents.filter((a: Agent) => a.last_status === 'DEGRADED').length,
          down_agents: mockData.agents.filter((a: Agent) => a.last_status === 'DOWN').length,
          total_cost_today: mockData.metrics.reduce((sum: number, m: Metric) => sum + m.cost_estimated_usd, 0),
          scope_violations: mockData.suggestions.filter((s: Suggestion) => s.type === 'SCOPE_VIOLATION').length,
          open_incidents: mockData.incidents.filter((i: Incident) => !i.resolved_at).length
        }
      })
    }

    // MODO REAL - Buscar do Supabase
    console.log('📊 MODO REAL ATIVADO - Buscando dados do Supabase')

    // Verificar se tabelas existem
    const { error: tablesError } = await supabaseAdmin
      .from('ai_agents')
      .select('id')
      .limit(1)

    if (tablesError) {
      console.log('⚠️ Tabelas não encontradas:', tablesError.message)
      // Retornar dados vazios mas estrutura válida
      return NextResponse.json({
        success: true,
        mode: 'real_empty',
        data: {
          agents: [],
          metrics: [],
          incidents: [],
          suggestions: []
        },
        summary: {
          total_agents: 0,
          active_agents: 0,
          healthy_agents: 0,
          degraded_agents: 0,
          down_agents: 0,
          total_cost_today: 0,
          scope_violations: 0,
          open_incidents: 0
        },
        message: 'Tabelas não encontradas. Execute a migração SQL primeiro.'
      })
    }

    // Buscar dados reais
    const [agentsResult, metricsResult, incidentsResult, suggestionsResult] = await Promise.all([
      supabaseAdmin.from('ai_agents').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('ai_agent_metrics_daily').select('*').order('date', { ascending: false }).limit(100),
      supabaseAdmin.from('ai_incidents').select('*').order('created_at', { ascending: false }).limit(50),
      supabaseAdmin.from('ai_guardian_suggestions').select('*').is('dismissed_at', null).order('created_at', { ascending: false })
    ])

    const agents: Agent[] = agentsResult.data || []
    const metrics: Metric[] = metricsResult.data || []
    const incidents: Incident[] = incidentsResult.data || []
    const suggestions: Suggestion[] = suggestionsResult.data || []

    // Calcular summary
    const summary = {
      total_agents: agents.length,
      active_agents: agents.filter((a: Agent) => a.active).length,
      healthy_agents: agents.filter((a: Agent) => a.last_status === 'HEALTHY').length,
      degraded_agents: agents.filter((a: Agent) => a.last_status === 'DEGRADED').length,
      down_agents: agents.filter((a: Agent) => a.last_status === 'DOWN').length,
      total_cost_today: metrics.reduce((sum: number, m: Metric) => sum + (m.cost_estimated_usd || 0), 0),
      scope_violations: suggestions.filter((s: Suggestion) => s.type === 'SCOPE_VIOLATION').length,
      open_incidents: incidents.filter((i: Incident) => !i.resolved_at).length
    }

    return NextResponse.json({
      success: true,
      mode: agents.length > 0 ? 'real' : 'real_empty',
      data: {
        agents,
        metrics,
        incidents,
        suggestions
      },
      summary
    })

  } catch (error) {
    console.error('Erro ao buscar mapa de IAs:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar dados das IAs' },
      { status: 500 }
    )
  }
}

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
    const { action, agent_id, data, role, suggestion_id } = body

    switch (action) {
      case 'toggle_agent':
        // Atualizar status da IA no Supabase
        const { error: toggleError } = await supabaseAdmin
          .from('ai_agents')
          .update({ 
            active: data.active,
            updated_at: new Date().toISOString()
          })
          .eq('id', agent_id)

        if (toggleError) throw toggleError

        // Registrar incidente se desativou
        if (!data.active) {
          await supabaseAdmin
            .from('ai_incidents')
            .insert({
              agent_id,
              old_status: 'ACTIVE',
              new_status: 'INACTIVE',
              reason: 'Desativada manualmente pelo administrador',
              created_at: new Date().toISOString()
            })
        }

        return NextResponse.json({ success: true, message: 'IA atualizada com sucesso' })

      case 'switch_primary':
        // Buscar IAs da mesma role
        const { data: roleAgents, error: roleError } = await supabaseAdmin
          .from('ai_agents')
          .select('*')
          .eq('role', role)

        if (roleError) throw roleError

        // Atualizar prioridades
        const updates = (roleAgents || []).map((agent: Agent) => {
          if (agent.id === agent_id) {
            return { id: agent.id, priority: 1, active: true }
          } else if (agent.priority === 1) {
            return { id: agent.id, priority: 2 }
          }
          return null
        }).filter(Boolean) as { id: string; priority: number; active?: boolean }[]

        for (const update of updates) {
          await supabaseAdmin
            .from('ai_agents')
            .update({ 
              priority: update.priority,
              active: update.active,
              updated_at: new Date().toISOString()
            })
            .eq('id', update.id)
        }

        // Registrar mudança
        await supabaseAdmin
          .from('ai_incidents')
          .insert({
            agent_id,
            old_status: 'BACKUP',
            new_status: 'PRIMARY',
            reason: `Promovida a primária para role ${role}`,
            created_at: new Date().toISOString()
          })

        return NextResponse.json({ success: true, message: 'IA primária trocada com sucesso' })

      case 'apply_suggestion':
        // Marcar sugestão como aplicada
        const { error: applyError } = await supabaseAdmin
          .from('ai_guardian_suggestions')
          .update({ 
            auto_applied: true,
            applied_at: new Date().toISOString()
          })
          .eq('id', suggestion_id)

        if (applyError) throw applyError

        return NextResponse.json({ success: true, message: 'Sugestão aplicada com sucesso' })

      case 'dismiss_suggestion':
        // Marcar sugestão como ignorada
        const { error: dismissError } = await supabaseAdmin
          .from('ai_guardian_suggestions')
          .update({ 
            dismissed_at: new Date().toISOString()
          })
          .eq('id', suggestion_id)

        if (dismissError) throw dismissError

        return NextResponse.json({ success: true, message: 'Sugestão ignorada' })

      case 'toggle_auto_failover':
        console.log(`Toggle auto failover for ${role}: ${data.enabled}`)
        return NextResponse.json({ success: true, message: 'Auto failover atualizado' })

      default:
        return NextResponse.json({ success: false, error: 'Ação desconhecida' }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API do mapa de IAs:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}
