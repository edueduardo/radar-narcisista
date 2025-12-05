/**
 * API da Control Tower - Detalhes de Projeto Específico
 * ETAPA 32 - BLOCO 32-35
 * 
 * Endpoints:
 * - GET: Busca detalhes de um projeto (com owners e flags)
 * - DELETE: Remove um projeto (com cuidado!)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { 
  getProjectById,
  listProjectOwners,
  listProjectFlags
} from '@/lib/control-tower'

// Verificar se usuário é super-admin
async function isSuperAdmin(supabase: Awaited<Awaited<ReturnType<typeof createRouteHandlerClient>>>): Promise<boolean> {
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

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET - Busca detalhes de um projeto específico
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação e permissão
    if (!await isSuperAdmin(supabase)) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas super-admin pode acessar a Control Tower.' },
        { status: 403 }
      )
    }
    
    // Buscar projeto
    const project = await getProjectById(id)
    
    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }
    
    // Buscar owners e flags
    const [owners, flags] = await Promise.all([
      listProjectOwners(id),
      listProjectFlags(id)
    ])
    
    return NextResponse.json({
      success: true,
      project,
      owners,
      flags
    })
    
  } catch (error) {
    console.error('Erro na API Control Tower [id] (GET):', error)
    return NextResponse.json(
      { error: 'Erro ao buscar detalhes do projeto' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remove um projeto (CUIDADO!)
 * Só permite remover projetos que não são radar_mae
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação e permissão
    if (!await isSuperAdmin(supabase)) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas super-admin pode remover projetos.' },
        { status: 403 }
      )
    }
    
    // Buscar projeto para verificar tipo
    const project = await getProjectById(id)
    
    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }
    
    // Não permitir remover o Radar Mãe
    if (project.tipo_projeto === 'radar_mae') {
      return NextResponse.json(
        { error: 'Não é permitido remover o projeto Radar Mãe' },
        { status: 403 }
      )
    }
    
    // Remover projeto (cascade vai remover owners e flags)
    const { error } = await supabase
      .from('projects_core')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao remover projeto:', error)
      return NextResponse.json(
        { error: 'Erro ao remover projeto' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Projeto removido com sucesso'
    })
    
  } catch (error) {
    console.error('Erro na API Control Tower [id] (DELETE):', error)
    return NextResponse.json(
      { error: 'Erro ao remover projeto' },
      { status: 500 }
    )
  }
}
