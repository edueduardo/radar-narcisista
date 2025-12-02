/**
 * API de Telemetria - Erros
 * ETAPA 33 - BLOCO 32-35
 * 
 * Endpoint central para receber erros de todos os projetos do ecossistema.
 */

import { NextRequest, NextResponse } from 'next/server'
import { registerError, ErrorInput } from '@/lib/telemetry-core'
import { getProjectById } from '@/lib/control-tower'

/**
 * POST - Registra erro de um projeto
 * 
 * Body esperado:
 * {
 *   project_id: string (UUID do projeto)
 *   tipo_erro: 'api' | 'banco' | 'third_party' | 'front_end' | 'auth' | 'unknown'
 *   mensagem_resumida: string
 *   nivel_severidade: 'baixo' | 'medio' | 'alto' | 'critico'
 *   codigo_erro?: string
 *   contexto?: object (sem dados sensíveis!)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ErrorInput
    
    // Validar campos obrigatórios
    if (!body.project_id || !body.tipo_erro || !body.mensagem_resumida || !body.nivel_severidade) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: project_id, tipo_erro, mensagem_resumida, nivel_severidade' },
        { status: 400 }
      )
    }
    
    // Validar tipo_erro
    const tiposValidos = ['api', 'banco', 'third_party', 'front_end', 'auth', 'unknown']
    if (!tiposValidos.includes(body.tipo_erro)) {
      return NextResponse.json(
        { error: `tipo_erro inválido. Valores aceitos: ${tiposValidos.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Validar nivel_severidade
    const severidadesValidas = ['baixo', 'medio', 'alto', 'critico']
    if (!severidadesValidas.includes(body.nivel_severidade)) {
      return NextResponse.json(
        { error: `nivel_severidade inválido. Valores aceitos: ${severidadesValidas.join(', ')}` },
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
    
    // Sanitizar contexto (remover dados potencialmente sensíveis)
    const contextoSanitizado = sanitizeContext(body.contexto || {})
    
    // Registrar erro
    const errorId = await registerError({
      ...body,
      contexto: contextoSanitizado
    })
    
    if (!errorId) {
      return NextResponse.json(
        { error: 'Erro ao registrar erro de telemetria' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      error_id: errorId,
      message: 'Erro registrado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro na API de telemetria de erros:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar erro de telemetria' },
      { status: 500 }
    )
  }
}

/**
 * Sanitiza o contexto removendo dados potencialmente sensíveis
 */
function sanitizeContext(contexto: Record<string, unknown>): Record<string, unknown> {
  const camposSensiveis = [
    'password', 'senha', 'token', 'api_key', 'apikey', 'secret',
    'authorization', 'auth', 'cookie', 'session', 'credit_card',
    'cpf', 'cnpj', 'email', 'phone', 'telefone', 'endereco', 'address'
  ]
  
  const sanitizado: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(contexto)) {
    const keyLower = key.toLowerCase()
    
    // Verificar se a chave contém algum campo sensível
    const isSensitive = camposSensiveis.some(campo => keyLower.includes(campo))
    
    if (isSensitive) {
      sanitizado[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitizado[key] = sanitizeContext(value as Record<string, unknown>)
    } else {
      sanitizado[key] = value
    }
  }
  
  return sanitizado
}
