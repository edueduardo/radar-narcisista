/**
 * SERVIÇO DE ARMAZENAMENTO DO ADMIN
 * Salva e carrega configurações do Supabase
 * 
 * BACKUP: Criado em 24/11/2025 22:30
 * LOCAL: lib/admin-storage.ts
 */

import { createClient } from '@/lib/supabase/client'

// ============================================
// TIPOS
// ============================================

export interface AdminIAConfig {
  id: string
  ias_ativas: string[]
  etapa1_analise: string[]
  etapa2_votacao: string[]
  etapa3_consenso: string[]
  etapa4_transparencia: string[]
  threshold_votacao: number
  min_consenso: number
  exigir_consenso_total: boolean
  relatorio_pontual_pessoas: boolean
  relatorio_global_sistema: boolean
  rastrear_problemas_juridicos: boolean
  detectar_possiveis_mentiras: boolean
  evitar_prognosticos_errados: boolean
  coach_tom: string
  coach_foco: string
  temperatura_ia: number
  max_tokens_resposta: number
  updated_at?: string
}

export interface AdminContent {
  id: string
  tipo: 'biblioteca' | 'historia' | 'comunidade' | 'recurso'
  categoria?: string
  titulo?: string
  conteudo: any
  status: 'pendente' | 'aprovado' | 'rejeitado'
  criado_por: 'admin' | 'ia' | 'usuario'
  created_at: string
  updated_at: string
  approved_at?: string
}

export interface RecursoEstado {
  id: string
  estado: string
  sigla: string
  recursos: {
    nome: string
    telefone: string
    tipo: string
  }[]
}

// ============================================
// CONFIGURAÇÃO PADRÃO
// ============================================

const DEFAULT_CONFIG: Omit<AdminIAConfig, 'id'> = {
  ias_ativas: ['openai'],
  etapa1_analise: ['openai'],
  etapa2_votacao: ['openai'],
  etapa3_consenso: ['openai'],
  etapa4_transparencia: ['openai'],
  threshold_votacao: 80,
  min_consenso: 2,
  exigir_consenso_total: false,
  relatorio_pontual_pessoas: true,
  relatorio_global_sistema: true,
  rastrear_problemas_juridicos: true,
  detectar_possiveis_mentiras: true,
  evitar_prognosticos_errados: true,
  coach_tom: 'empatico',
  coach_foco: 'validacao',
  temperatura_ia: 0.7,
  max_tokens_resposta: 1000
}

const CONFIG_ID = '00000000-0000-0000-0000-000000000001'

// ============================================
// FUNÇÕES DE CONFIGURAÇÃO DE IAs
// ============================================

/**
 * Carrega configuração de IAs do Supabase
 * Se não existir, retorna configuração padrão
 */
export async function loadIAConfig(): Promise<AdminIAConfig> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('admin_ia_config')
      .select('*')
      .eq('id', CONFIG_ID)
      .single()
    
    if (error || !data) {
      console.log('⚠️ Config não encontrada no Supabase, usando padrão')
      return { id: CONFIG_ID, ...DEFAULT_CONFIG }
    }
    
    console.log('✅ Config carregada do Supabase')
    return data as AdminIAConfig
  } catch (error) {
    console.error('❌ Erro ao carregar config:', error)
    return { id: CONFIG_ID, ...DEFAULT_CONFIG }
  }
}

/**
 * Salva configuração de IAs no Supabase
 */
export async function saveIAConfig(config: Partial<AdminIAConfig>): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('admin_ia_config')
      .upsert({
        id: CONFIG_ID,
        ...config,
        updated_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('❌ Erro ao salvar config:', error)
      
      // Fallback: salvar no localStorage
      localStorage.setItem('admin_ia_config', JSON.stringify(config))
      console.log('💾 Config salva no localStorage (fallback)')
      return true
    }
    
    console.log('✅ Config salva no Supabase')
    
    // Também salvar no localStorage como backup
    localStorage.setItem('admin_ia_config', JSON.stringify(config))
    
    return true
  } catch (error) {
    console.error('❌ Erro ao salvar config:', error)
    
    // Fallback: salvar no localStorage
    localStorage.setItem('admin_ia_config', JSON.stringify(config))
    console.log('💾 Config salva no localStorage (fallback)')
    
    return false
  }
}

/**
 * Carrega config do localStorage (fallback)
 */
export function loadIAConfigLocal(): AdminIAConfig | null {
  try {
    const stored = localStorage.getItem('admin_ia_config')
    if (stored) {
      return JSON.parse(stored)
    }
    return null
  } catch {
    return null
  }
}

// ============================================
// FUNÇÕES DE CONTEÚDO (Biblioteca, Histórias, etc)
// ============================================

/**
 * Carrega conteúdo por tipo
 */
export async function loadContent(tipo: string): Promise<AdminContent[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('admin_content')
      .select('*')
      .eq('tipo', tipo)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro ao carregar conteúdo:', error)
      return []
    }
    
    return data as AdminContent[]
  } catch (error) {
    console.error('❌ Erro ao carregar conteúdo:', error)
    return []
  }
}

/**
 * Salva novo conteúdo
 */
export async function saveContent(content: Omit<AdminContent, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('admin_content')
      .insert({
        ...content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('❌ Erro ao salvar conteúdo:', error)
      return null
    }
    
    console.log('✅ Conteúdo salvo:', data.id)
    return data.id
  } catch (error) {
    console.error('❌ Erro ao salvar conteúdo:', error)
    return null
  }
}

/**
 * Atualiza status do conteúdo (aprovar/rejeitar)
 */
export async function updateContentStatus(
  id: string, 
  status: 'aprovado' | 'rejeitado',
  userId?: string
): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }
    
    if (status === 'aprovado') {
      updateData.approved_at = new Date().toISOString()
      updateData.approved_by = userId
    }
    
    const { error } = await supabase
      .from('admin_content')
      .update(updateData)
      .eq('id', id)
    
    if (error) {
      console.error('❌ Erro ao atualizar status:', error)
      return false
    }
    
    console.log(`✅ Conteúdo ${status}:`, id)
    return true
  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error)
    return false
  }
}

/**
 * Deleta conteúdo
 */
export async function deleteContent(id: string): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('admin_content')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('❌ Erro ao deletar conteúdo:', error)
      return false
    }
    
    console.log('✅ Conteúdo deletado:', id)
    return true
  } catch (error) {
    console.error('❌ Erro ao deletar conteúdo:', error)
    return false
  }
}

// ============================================
// FUNÇÕES DE RECURSOS POR ESTADO
// ============================================

/**
 * Carrega recursos de um estado
 */
export async function loadRecursosEstado(sigla: string): Promise<RecursoEstado | null> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('recursos_estado')
      .select('*')
      .eq('sigla', sigla)
      .single()
    
    if (error) {
      console.error('❌ Erro ao carregar recursos:', error)
      return null
    }
    
    return data as RecursoEstado
  } catch (error) {
    console.error('❌ Erro ao carregar recursos:', error)
    return null
  }
}

/**
 * Carrega todos os recursos
 */
export async function loadAllRecursos(): Promise<RecursoEstado[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('recursos_estado')
      .select('*')
      .order('estado')
    
    if (error) {
      console.error('❌ Erro ao carregar recursos:', error)
      return []
    }
    
    return data as RecursoEstado[]
  } catch (error) {
    console.error('❌ Erro ao carregar recursos:', error)
    return []
  }
}

/**
 * Salva/atualiza recursos de um estado
 */
export async function saveRecursosEstado(recurso: Omit<RecursoEstado, 'id'>): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('recursos_estado')
      .upsert({
        ...recurso,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'sigla'
      })
    
    if (error) {
      console.error('❌ Erro ao salvar recursos:', error)
      return false
    }
    
    console.log('✅ Recursos salvos:', recurso.sigla)
    return true
  } catch (error) {
    console.error('❌ Erro ao salvar recursos:', error)
    return false
  }
}

// ============================================
// FUNÇÃO DE SINCRONIZAÇÃO
// ============================================

/**
 * Sincroniza localStorage com Supabase
 * Útil quando o usuário estava offline
 */
export async function syncLocalToSupabase(): Promise<void> {
  console.log('🔄 Sincronizando localStorage com Supabase...')
  
  // Sincronizar config de IAs
  const localConfig = loadIAConfigLocal()
  if (localConfig) {
    await saveIAConfig(localConfig)
  }
  
  console.log('✅ Sincronização concluída')
}
