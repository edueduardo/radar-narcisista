// API para Gerador de SaaS
// /api/admin/generator

import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Tipos
type ProjectType = 'SAAS_TEMATICO' | 'CORE_BRANCO'
type ProjectStatus = 'pending' | 'creating' | 'ready' | 'error'

interface GeneratorProject {
  id: string
  name: string
  slug: string
  type: ProjectType
  description: string
  modules: string[]
  config: Record<string, any>
  status: ProjectStatus
  github_repo?: string
  error_message?: string
  created_by: string
  created_at: string
  updated_at: string
}

// GET - Listar projetos gerados
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação e role admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar projetos do banco
    const { data: projects, error } = await supabase
      .from('generator_projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // Se tabela não existe, retornar array vazio
      if (error.code === '42P01') {
        return NextResponse.json({ projects: [], source: 'empty' })
      }
      throw error
    }

    return NextResponse.json({ projects: projects || [] })

  } catch (error) {
    console.error('Erro ao listar projetos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo projeto
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação e role admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { name, type, description, modules, config } = body

    // Validações
    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    // Gerar slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Criar projeto
    const projectData = {
      name,
      slug,
      type: type || 'SAAS_TEMATICO',
      description: description || '',
      modules: modules || ['oraculo_v1', 'oraculo_v2', 'planos', 'auth', 'admin'],
      config: config || {},
      status: 'pending' as ProjectStatus,
      created_by: user.id
    }

    // Tentar inserir no banco
    const { data: project, error } = await supabase
      .from('generator_projects')
      .insert(projectData)
      .select()
      .single()

    if (error) {
      // Se tabela não existe, retornar projeto simulado
      if (error.code === '42P01') {
        const simulatedProject = {
          id: `sim-${Date.now()}`,
          ...projectData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        return NextResponse.json({ 
          project: simulatedProject, 
          source: 'simulated',
          message: 'Projeto criado em modo simulado (tabela não existe)'
        }, { status: 201 })
      }
      throw error
    }

    // Iniciar processo de geração (em background)
    // Em produção, isso seria uma fila de jobs
    generateProjectAsync(project.id, supabase)

    return NextResponse.json({ project }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar projeto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função assíncrona para gerar projeto (simulada)
async function generateProjectAsync(projectId: string, supabase: any) {
  try {
    // Atualizar status para 'creating'
    await supabase
      .from('generator_projects')
      .update({ status: 'creating' })
      .eq('id', projectId)

    // Simular tempo de geração
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Atualizar status para 'ready'
    await supabase
      .from('generator_projects')
      .update({ 
        status: 'ready',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

  } catch (error) {
    console.error('Erro ao gerar projeto:', error)
    await supabase
      .from('generator_projects')
      .update({ 
        status: 'error',
        error_message: 'Erro durante a geração do projeto'
      })
      .eq('id', projectId)
  }
}

// DELETE - Remover projeto
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação e role admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')

    if (!projectId) {
      return NextResponse.json({ error: 'ID do projeto é obrigatório' }, { status: 400 })
    }

    const { error } = await supabase
      .from('generator_projects')
      .delete()
      .eq('id', projectId)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro ao deletar projeto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
