/**
 * CONTROL TOWER - Helpers para gerenciamento global de projetos
 * ETAPA 32 - BLOCO 32-35
 * 
 * Este módulo gerencia:
 * - Listagem de projetos (Radar Mãe, White Labels, SaaS gerados)
 * - CRUD de projetos
 * - Flags e configurações por projeto
 * - Owners/responsáveis
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================================
// TIPOS
// ============================================================================

export type TipoProjeto = 'radar_mae' | 'white_label' | 'saas_tema' | 'saas_branco'
export type StatusProjeto = 'ativo' | 'pausado' | 'desligado'
export type VinculoNucleo = 'ligado' | 'em_transicao' | 'desligado'
export type PoliticaSuporte = 'monitorado' | 'sob_demanda' | 'sem_suporte'
export type TipoOwner = 'cliente_final' | 'parceiro' | 'interno'

export interface ProjectCore {
  id: string
  slug: string
  nome_publico: string
  tipo_projeto: TipoProjeto
  tema: string | null
  parent_project_id: string | null
  url_publica: string | null
  url_admin: string | null
  status: StatusProjeto
  core_version: string
  vinculo_nucleo: VinculoNucleo
  politica_suporte: PoliticaSuporte
  config_extra: Record<string, unknown>
  data_criacao: string
  data_ultima_atividade: string | null
  created_at: string
  updated_at: string
  // Campos agregados (quando listados)
  total_owners?: number
  total_flags?: number
  // Campos de telemetria (quando disponíveis)
  ultimo_heartbeat?: string | null
  status_telemetria?: 'healthy' | 'degraded' | 'down' | 'unknown'
}

export interface OwnerCore {
  id: string
  project_id: string
  nome: string
  email: string
  tipo_owner: TipoOwner
  dados_contato: Record<string, unknown>
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface ProjectFlag {
  id: string
  project_id: string
  flag: string
  valor: unknown
  descricao: string | null
  created_at: string
  updated_at: string
}

export interface CreateProjectInput {
  slug: string
  nome_publico: string
  tipo_projeto: TipoProjeto
  tema?: string
  parent_project_id?: string
  url_publica?: string
  url_admin?: string
  core_version?: string
  config_extra?: Record<string, unknown>
}

export interface CreateOwnerInput {
  project_id: string
  nome: string
  email: string
  tipo_owner: TipoOwner
  dados_contato?: Record<string, unknown>
  is_primary?: boolean
}

// ============================================================================
// CLIENTE SUPABASE ADMIN
// ============================================================================

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase não configurado')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// ============================================================================
// FUNÇÕES DE PROJETOS
// ============================================================================

/**
 * Lista todos os projetos para a Control Tower
 */
export async function listAllProjects(): Promise<ProjectCore[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase.rpc('list_all_projects')
    
    if (error) {
      console.error('Erro ao listar projetos:', error)
      return []
    }
    
    return data as ProjectCore[]
  } catch (error) {
    console.error('Erro ao listar projetos:', error)
    return []
  }
}

/**
 * Busca um projeto pelo slug
 */
export async function getProjectBySlug(slug: string): Promise<ProjectCore | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('projects_core')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error || !data) {
      return null
    }
    
    return data as ProjectCore
  } catch (error) {
    console.error('Erro ao buscar projeto:', error)
    return null
  }
}

/**
 * Busca um projeto pelo ID
 */
export async function getProjectById(id: string): Promise<ProjectCore | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('projects_core')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !data) {
      return null
    }
    
    return data as ProjectCore
  } catch (error) {
    console.error('Erro ao buscar projeto:', error)
    return null
  }
}

/**
 * Cria um novo projeto
 */
export async function createProject(input: CreateProjectInput): Promise<ProjectCore | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('projects_core')
      .insert({
        slug: input.slug,
        nome_publico: input.nome_publico,
        tipo_projeto: input.tipo_projeto,
        tema: input.tema || null,
        parent_project_id: input.parent_project_id || null,
        url_publica: input.url_publica || null,
        url_admin: input.url_admin || null,
        core_version: input.core_version || '1.0.0',
        config_extra: input.config_extra || {}
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar projeto:', error)
      return null
    }
    
    return data as ProjectCore
  } catch (error) {
    console.error('Erro ao criar projeto:', error)
    return null
  }
}

/**
 * Atualiza um projeto
 */
export async function updateProject(
  id: string, 
  updates: Partial<Omit<ProjectCore, 'id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase
      .from('projects_core')
      .update(updates)
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao atualizar projeto:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error)
    return false
  }
}

/**
 * Atualiza última atividade de um projeto
 */
export async function updateProjectActivity(projectId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase.rpc('update_project_activity', {
      p_project_id: projectId
    })
    
    if (error) {
      console.error('Erro ao atualizar atividade:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error)
    return false
  }
}

// ============================================================================
// FUNÇÕES DE OWNERS
// ============================================================================

/**
 * Lista owners de um projeto
 */
export async function listProjectOwners(projectId: string): Promise<OwnerCore[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('owners_core')
      .select('*')
      .eq('project_id', projectId)
      .order('is_primary', { ascending: false })
    
    if (error) {
      console.error('Erro ao listar owners:', error)
      return []
    }
    
    return data as OwnerCore[]
  } catch (error) {
    console.error('Erro ao listar owners:', error)
    return []
  }
}

/**
 * Adiciona um owner a um projeto
 */
export async function addProjectOwner(input: CreateOwnerInput): Promise<OwnerCore | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('owners_core')
      .insert({
        project_id: input.project_id,
        nome: input.nome,
        email: input.email,
        tipo_owner: input.tipo_owner,
        dados_contato: input.dados_contato || {},
        is_primary: input.is_primary || false
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao adicionar owner:', error)
      return null
    }
    
    return data as OwnerCore
  } catch (error) {
    console.error('Erro ao adicionar owner:', error)
    return null
  }
}

// ============================================================================
// FUNÇÕES DE FLAGS
// ============================================================================

/**
 * Lista flags de um projeto
 */
export async function listProjectFlags(projectId: string): Promise<ProjectFlag[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('project_flags_core')
      .select('*')
      .eq('project_id', projectId)
      .order('flag')
    
    if (error) {
      console.error('Erro ao listar flags:', error)
      return []
    }
    
    return data as ProjectFlag[]
  } catch (error) {
    console.error('Erro ao listar flags:', error)
    return []
  }
}

/**
 * Define uma flag para um projeto
 */
export async function setProjectFlag(
  projectId: string, 
  flag: string, 
  valor: unknown, 
  descricao?: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase
      .from('project_flags_core')
      .upsert({
        project_id: projectId,
        flag,
        valor,
        descricao: descricao || null
      }, {
        onConflict: 'project_id,flag'
      })
    
    if (error) {
      console.error('Erro ao definir flag:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao definir flag:', error)
    return false
  }
}

/**
 * Obtém valor de uma flag específica
 */
export async function getProjectFlag(projectId: string, flag: string): Promise<unknown | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('project_flags_core')
      .select('valor')
      .eq('project_id', projectId)
      .eq('flag', flag)
      .single()
    
    if (error || !data) {
      return null
    }
    
    return data.valor
  } catch (error) {
    console.error('Erro ao obter flag:', error)
    return null
  }
}

// ============================================================================
// FUNÇÕES DE ESTATÍSTICAS
// ============================================================================

/**
 * Obtém estatísticas gerais da Control Tower
 */
export async function getControlTowerStats(): Promise<{
  total_projetos: number
  por_tipo: Record<TipoProjeto, number>
  por_status: Record<StatusProjeto, number>
  por_vinculo: Record<VinculoNucleo, number>
}> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('projects_core')
      .select('tipo_projeto, status, vinculo_nucleo')
    
    if (error || !data) {
      return {
        total_projetos: 0,
        por_tipo: { radar_mae: 0, white_label: 0, saas_tema: 0, saas_branco: 0 },
        por_status: { ativo: 0, pausado: 0, desligado: 0 },
        por_vinculo: { ligado: 0, em_transicao: 0, desligado: 0 }
      }
    }
    
    const stats = {
      total_projetos: data.length,
      por_tipo: { radar_mae: 0, white_label: 0, saas_tema: 0, saas_branco: 0 } as Record<TipoProjeto, number>,
      por_status: { ativo: 0, pausado: 0, desligado: 0 } as Record<StatusProjeto, number>,
      por_vinculo: { ligado: 0, em_transicao: 0, desligado: 0 } as Record<VinculoNucleo, number>
    }
    
    for (const row of data) {
      stats.por_tipo[row.tipo_projeto as TipoProjeto]++
      stats.por_status[row.status as StatusProjeto]++
      stats.por_vinculo[row.vinculo_nucleo as VinculoNucleo]++
    }
    
    return stats
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return {
      total_projetos: 0,
      por_tipo: { radar_mae: 0, white_label: 0, saas_tema: 0, saas_branco: 0 },
      por_status: { ativo: 0, pausado: 0, desligado: 0 },
      por_vinculo: { ligado: 0, em_transicao: 0, desligado: 0 }
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const CONTROL_TOWER = {
  // Projetos
  listAllProjects,
  getProjectBySlug,
  getProjectById,
  createProject,
  updateProject,
  updateProjectActivity,
  // Owners
  listProjectOwners,
  addProjectOwner,
  // Flags
  listProjectFlags,
  setProjectFlag,
  getProjectFlag,
  // Stats
  getControlTowerStats
}

export default CONTROL_TOWER
