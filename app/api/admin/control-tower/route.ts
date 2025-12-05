/**
 * API da Control Tower - Gerenciamento Global de Projetos
 * ETAPA 32 - BLOCO 32-35
 * 
 * Endpoints:
 * - GET: Lista todos os projetos e estatísticas
 * - POST: Cria novo projeto
 * - PATCH: Atualiza projeto existente
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { 
  listAllProjects, 
  createProject, 
  updateProject,
  getControlTowerStats,
  CreateProjectInput
} from '@/lib/control-tower'

// Verificar se usuário é super-admin
async function isSuperAdmin(supabase: Awaited<ReturnType<typeof createRouteHandlerClient>>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  
  const role = (profile as { role?: string } | null)?.role
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}

/**
 * GET - Lista todos os projetos e estatísticas
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação e permissão
    if (!await isSuperAdmin(supabase)) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas super-admin pode acessar a Control Tower.' },
        { status: 403 }
      )
    }
    
    // Buscar projetos e estatísticas
    const [projects, stats] = await Promise.all([
      listAllProjects(),
      getControlTowerStats()
    ])
    
    return NextResponse.json({
      success: true,
      projects,
      stats
    })
    
  } catch (error) {
    console.error('Erro na API Control Tower (GET):', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados da Control Tower' },
      { status: 500 }
    )
  }
}

/**
 * POST - Cria novo projeto
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação e permissão
    if (!await isSuperAdmin(supabase)) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas super-admin pode criar projetos.' },
        { status: 403 }
      )
    }
    
    const body = await request.json() as CreateProjectInput
    
    // Validar campos obrigatórios
    if (!body.slug || !body.nome_publico || !body.tipo_projeto) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: slug, nome_publico, tipo_projeto' },
        { status: 400 }
      )
    }
    
    // Validar tipo_projeto
    const tiposValidos = ['radar_mae', 'white_label', 'saas_tema', 'saas_branco']
    if (!tiposValidos.includes(body.tipo_projeto)) {
      return NextResponse.json(
        { error: `tipo_projeto inválido. Valores aceitos: ${tiposValidos.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Criar projeto
    const project = await createProject(body)
    
    if (!project) {
      return NextResponse.json(
        { error: 'Erro ao criar projeto. Verifique se o slug já existe.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      project
    }, { status: 201 })
    
  } catch (error) {
    console.error('Erro na API Control Tower (POST):', error)
    return NextResponse.json(
      { error: 'Erro ao criar projeto' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Atualiza projeto existente
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação e permissão
    if (!await isSuperAdmin(supabase)) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas super-admin pode atualizar projetos.' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    // Validar ID
    if (!body.id) {
      return NextResponse.json(
        { error: 'Campo obrigatório: id' },
        { status: 400 }
      )
    }
    
    // Extrair ID e campos para atualização
    const { id, ...updates } = body
    
    // Remover campos que não podem ser atualizados
    delete updates.created_at
    delete updates.updated_at
    
    // Atualizar projeto
    const success = await updateProject(id, updates)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao atualizar projeto' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Projeto atualizado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro na API Control Tower (PATCH):', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar projeto' },
      { status: 500 }
    )
  }
}
