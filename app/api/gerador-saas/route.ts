/**
 * API Route: Gerador de SaaS
 * 
 * POST /api/gerador-saas - Criar novo projeto
 * GET /api/gerador-saas - Listar projetos gerados
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

// Tipos
interface ProjectConfig {
  name: string
  slug: string
  type: 'SAAS_TEMATICO' | 'CORE_BRANCO'
  description: string
  tema?: string
  publicoAlvo?: string
  perfisUsuario: string[]
  modulosAtivados: string[]
  corPrimaria?: string
  corSecundaria?: string
}

interface GeneratedProject {
  id: string
  name: string
  slug: string
  type: 'SAAS_TEMATICO' | 'CORE_BRANCO'
  description: string
  origin: string
  status: 'creating' | 'ready' | 'error'
  modules: string[]
  created_at: string
  created_by: string
  zip_path?: string
  github_url?: string
}

// POST - Criar novo projeto
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Obter dados do request
    const config: ProjectConfig = await request.json()

    // Validar dados
    if (!config.name || !config.type) {
      return NextResponse.json({ error: 'Nome e tipo são obrigatórios' }, { status: 400 })
    }

    // Gerar slug
    const slug = config.slug || config.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Criar registro no banco
    const { data: project, error: insertError } = await supabase
      .from('generated_projects')
      .insert({
        name: config.name,
        slug,
        type: config.type,
        description: config.description || '',
        origin: 'RADAR-CORE@BLOCO-45',
        status: 'creating',
        modules: config.modulosAtivados || [],
        config: config,
        created_by: user.id
      })
      .select()
      .single()

    if (insertError) {
      // Se tabela não existe, retornar sucesso simulado
      if (insertError.code === '42P01') {
        return NextResponse.json({
          success: true,
          project: {
            id: `proj-${Date.now()}`,
            name: config.name,
            slug,
            type: config.type,
            description: config.description,
            origin: 'RADAR-CORE@BLOCO-45',
            status: 'ready',
            modules: config.modulosAtivados,
            created_at: new Date().toISOString(),
            message: 'Projeto criado (modo simulado - tabela não existe)'
          }
        })
      }
      throw insertError
    }

    // Em produção, aqui chamaria o serviço de geração real
    // Por enquanto, simular criação
    setTimeout(async () => {
      await supabase
        .from('generated_projects')
        .update({ status: 'ready' })
        .eq('id', project.id)
    }, 3000)

    return NextResponse.json({
      success: true,
      project
    })

  } catch (error) {
    console.error('[API] Erro ao criar projeto:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}

// GET - Listar projetos
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar projetos
    const { data: projects, error } = await supabase
      .from('generated_projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // Se tabela não existe, retornar lista vazia
      if (error.code === '42P01') {
        return NextResponse.json({ projects: [] })
      }
      throw error
    }

    return NextResponse.json({ projects })

  } catch (error) {
    console.error('[API] Erro ao listar projetos:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
