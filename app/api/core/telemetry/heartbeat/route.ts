/**
 * API de Telemetria - Heartbeat
 * ETAPA 33 - BLOCO 32-35
 * 
 * Endpoint central para receber heartbeats de todos os projetos do ecossistema.
 * Cada SaaS gerado chama este endpoint periodicamente.
 */

import { NextRequest, NextResponse } from 'next/server'
import { registerHeartbeat, HeartbeatInput } from '@/lib/telemetry-core'
import { getProjectById } from '@/lib/control-tower'

/**
 * POST - Registra heartbeat de um projeto
 * 
 * Body esperado:
 * {
 *   project_id: string (UUID do projeto)
 *   core_version: string
 *   ambiente: 'dev' | 'staging' | 'prod'
 *   status: 'healthy' | 'degraded' | 'down'
 *   info_resumida?: object
 *   latency_ms?: number
 *   memory_usage_mb?: number
 *   requests_last_hour?: number
 *   errors_last_hour?: number
 *   active_users?: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as HeartbeatInput
    
    // Validar campos obrigatórios
    if (!body.project_id || !body.core_version || !body.ambiente || !body.status) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: project_id, core_version, ambiente, status' },
        { status: 400 }
      )
    }
    
    // Validar ambiente
    const ambientesValidos = ['dev', 'staging', 'prod']
    if (!ambientesValidos.includes(body.ambiente)) {
      return NextResponse.json(
        { error: `ambiente inválido. Valores aceitos: ${ambientesValidos.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Validar status
    const statusValidos = ['healthy', 'degraded', 'down']
    if (!statusValidos.includes(body.status)) {
      return NextResponse.json(
        { error: `status inválido. Valores aceitos: ${statusValidos.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Verificar se projeto existe
    const project = await getProjectById(body.project_id)
    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }
    
    // Verificar se projeto está ativo
    if (project.status !== 'ativo') {
      return NextResponse.json(
        { error: 'Projeto não está ativo' },
        { status: 403 }
      )
    }
    
    // Verificar se telemetria está ligada
    if (project.vinculo_nucleo === 'desligado') {
      return NextResponse.json(
        { error: 'Projeto desvinculado do núcleo' },
        { status: 403 }
      )
    }
    
    // Registrar heartbeat
    const heartbeatId = await registerHeartbeat(body)
    
    if (!heartbeatId) {
      return NextResponse.json(
        { error: 'Erro ao registrar heartbeat' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      heartbeat_id: heartbeatId,
      message: 'Heartbeat registrado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro na API de heartbeat:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar heartbeat' },
      { status: 500 }
    )
  }
}
