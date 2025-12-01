/**
 * ETAPA 11: Layout do Dashboard do Usuário
 * 
 * Função que monta a "trilha do herói" para o usuário,
 * baseada no plano e no estado atual dele.
 */

import type { PlanLevel } from './plans-config'
import { 
  DASHBOARD_MODULES, 
  DashboardModuleConfig, 
  DashboardModuleId,
  HeroStep,
  HERO_STEP_LABELS,
  getModulesByHeroStep
} from './plan-dashboard-modules'

// =============================================================================
// TIPOS
// =============================================================================

export type DashboardSectionId = 
  | 'entender' 
  | 'registrar' 
  | 'conversar' 
  | 'proteger' 
  | 'recursos'

export interface DashboardModuleState {
  moduleId: DashboardModuleId
  enabled: boolean      // Se esse usuário tem acesso real
  visible: boolean      // Se deve aparecer no dashboard (mesmo que bloqueado)
  locked: boolean       // Se está bloqueado pelo plano
  label: string
  description: string
  icon: string
  route?: string
  critical: boolean
  limitKey?: string
}

export interface DashboardSection {
  id: DashboardSectionId
  heroStep: HeroStep
  title: string
  description: string
  highlight: boolean    // Se deve ter destaque visual (ex: risco físico)
  modules: DashboardModuleState[]
}

export interface DashboardLayoutInput {
  currentPlanLevel: PlanLevel
  hasClarityProfile: boolean
  hasRecentJournalEntries: boolean
  hasActiveSafetyPlan: boolean
  hasPhysicalRisk: boolean
  safetyPlanStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'READY'
  // ETAPA 11.2: Dados adicionais para heurística do passo atual
  chatSessionCount?: number      // Quantas sessões de chat teve
  journalEntryCount?: number     // Total de entradas no diário
}

// =============================================================================
// ETAPA 11.2: HEURÍSTICA DO PASSO ATUAL
// =============================================================================

/**
 * Calcula o "passo atual" da usuária na trilha do herói
 * baseado no uso real das funcionalidades.
 * 
 * HEURÍSTICA:
 * 1. Sem teste de clareza → Passo 1 (Entender)
 * 2. Com teste, mas poucos registros no diário (<3) → Passo 2 (Registrar)
 * 3. Com diário ativo, mas pouco uso de chat (<2) → Passo 3 (Conversar)
 * 4. Com chat ativo, mas sem plano de segurança → Passo 4 (Proteger)
 * 5. Tudo ativo → Passo 5 (Recursos)
 * 
 * EXCEÇÃO: Se há risco físico e plano não está pronto → força Passo 4
 */
export function getCurrentHeroStep(input: DashboardLayoutInput): HeroStep {
  const { 
    hasClarityProfile, 
    hasRecentJournalEntries,
    hasPhysicalRisk,
    safetyPlanStatus,
    chatSessionCount = 0,
    journalEntryCount = 0
  } = input
  
  // PRIORIDADE MÁXIMA: Risco físico sem plano de segurança pronto
  if (hasPhysicalRisk && safetyPlanStatus !== 'READY') {
    return 4 // Proteger
  }
  
  // Passo 1: Não fez teste de clareza
  if (!hasClarityProfile) {
    return 1 // Entender
  }
  
  // Passo 2: Fez teste, mas tem poucos registros no diário
  if (journalEntryCount < 3 || !hasRecentJournalEntries) {
    return 2 // Registrar
  }
  
  // Passo 3: Tem diário ativo, mas pouco uso de chat
  if (chatSessionCount < 2) {
    return 3 // Conversar
  }
  
  // Passo 4: Tem chat ativo, mas não tem plano de segurança
  if (safetyPlanStatus === 'NOT_STARTED') {
    return 4 // Proteger
  }
  
  // Passo 5: Tudo ativo - usuária avançada
  return 5 // Recursos
}

// =============================================================================
// MAPEAMENTO heroStep → sectionId
// =============================================================================

const HERO_STEP_TO_SECTION: Record<HeroStep, DashboardSectionId> = {
  1: 'entender',
  2: 'registrar',
  3: 'conversar',
  4: 'proteger',
  5: 'recursos',
}

// =============================================================================
// FUNÇÃO PRINCIPAL
// =============================================================================

/**
 * Monta o layout do dashboard para o usuário
 */
export function buildUserDashboardLayout(input: DashboardLayoutInput): DashboardSection[] {
  const { 
    currentPlanLevel, 
    hasPhysicalRisk,
    safetyPlanStatus
  } = input
  
  const modulesByStep = getModulesByHeroStep(currentPlanLevel)
  
  // ETAPA 11.2: Calcular o passo atual da usuária
  const currentStep = getCurrentHeroStep(input)
  
  const sections: DashboardSection[] = []
  
  for (const step of [1, 2, 3, 4, 5] as HeroStep[]) {
    const sectionId = HERO_STEP_TO_SECTION[step]
    const stepLabel = HERO_STEP_LABELS[step]
    const { visible, locked } = modulesByStep[step]
    
    // ETAPA 11.2: Destacar o passo atual da usuária
    // Prioridade: risco físico > passo atual calculado
    let highlight = false
    if (step === 4 && hasPhysicalRisk && safetyPlanStatus !== 'READY') {
      highlight = true // Destacar seção de proteção se há risco físico
    } else if (step === currentStep) {
      highlight = true // Destacar o passo atual da jornada
    }
    
    // Montar módulos
    const modules: DashboardModuleState[] = []
    
    // Módulos visíveis (enabled)
    for (const mod of visible) {
      modules.push({
        moduleId: mod.id,
        enabled: true,
        visible: true,
        locked: false,
        label: mod.label,
        description: mod.description,
        icon: mod.icon,
        route: mod.route,
        critical: mod.isCritical ?? false,
        limitKey: mod.limitKey as string | undefined,
      })
    }
    
    // Módulos bloqueados (locked)
    for (const mod of locked) {
      modules.push({
        moduleId: mod.id,
        enabled: false,
        visible: true,
        locked: true,
        label: mod.label,
        description: mod.description,
        icon: mod.icon,
        route: mod.route,
        critical: mod.isCritical ?? false,
        limitKey: mod.limitKey as string | undefined,
      })
    }
    
    // Só adicionar seção se tiver módulos
    if (modules.length > 0) {
      sections.push({
        id: sectionId,
        heroStep: step,
        title: stepLabel.title,
        description: stepLabel.description,
        highlight,
        modules,
      })
    }
  }
  
  return sections
}

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

/**
 * Retorna a mensagem de boas-vindas baseada no estado do usuário
 */
export function getWelcomeMessage(input: DashboardLayoutInput): {
  title: string
  subtitle: string
  urgency: 'low' | 'medium' | 'high'
} {
  const { 
    hasClarityProfile, 
    hasRecentJournalEntries, 
    hasPhysicalRisk, 
    safetyPlanStatus 
  } = input
  
  // Prioridade 1: Risco físico sem plano
  if (hasPhysicalRisk && safetyPlanStatus === 'NOT_STARTED') {
    return {
      title: 'Sua segurança é prioridade',
      subtitle: 'Detectamos sinais de risco. Vamos criar seu Plano de Segurança juntos.',
      urgency: 'high'
    }
  }
  
  // Prioridade 2: Risco físico com plano incompleto
  if (hasPhysicalRisk && safetyPlanStatus === 'IN_PROGRESS') {
    return {
      title: 'Complete seu Plano de Segurança',
      subtitle: 'Você já começou, agora vamos finalizar para você estar preparada.',
      urgency: 'medium'
    }
  }
  
  // Prioridade 3: Sem perfil de clareza
  if (!hasClarityProfile) {
    return {
      title: 'Vamos começar sua jornada',
      subtitle: 'Faça o Teste de Clareza para entender sua situação.',
      urgency: 'medium'
    }
  }
  
  // Prioridade 4: Sem entradas recentes no diário
  if (!hasRecentJournalEntries) {
    return {
      title: 'Continue registrando',
      subtitle: 'Documentar episódios ajuda a ver padrões com clareza.',
      urgency: 'low'
    }
  }
  
  // Estado normal
  return {
    title: 'Bem-vinda de volta',
    subtitle: 'Continue sua jornada de clareza e proteção.',
    urgency: 'low'
  }
}

/**
 * Retorna a próxima ação sugerida para o usuário
 */
export function getNextSuggestedAction(input: DashboardLayoutInput): {
  moduleId: DashboardModuleId
  label: string
  route: string
  reason: string
} {
  const { 
    hasClarityProfile, 
    hasRecentJournalEntries, 
    hasPhysicalRisk, 
    safetyPlanStatus 
  } = input
  
  // Prioridade 1: Risco físico sem plano
  if (hasPhysicalRisk && safetyPlanStatus !== 'READY') {
    return {
      moduleId: 'plano_seguranca',
      label: 'Criar Plano de Segurança',
      route: '/plano-seguranca',
      reason: 'Você indicou sinais de risco físico. Prepare-se para emergências.'
    }
  }
  
  // Prioridade 2: Sem perfil de clareza
  if (!hasClarityProfile) {
    return {
      moduleId: 'teste_clareza',
      label: 'Fazer Teste de Clareza',
      route: '/teste-clareza',
      reason: 'Entenda sua situação em 5-10 minutos.'
    }
  }
  
  // Prioridade 3: Sem entradas recentes
  if (!hasRecentJournalEntries) {
    return {
      moduleId: 'diario',
      label: 'Registrar no Diário',
      route: '/diario/novo',
      reason: 'Documente o que está acontecendo.'
    }
  }
  
  // Padrão: Chat
  return {
    moduleId: 'chat_ia',
    label: 'Conversar com Coach',
    route: '/chat',
    reason: 'Organize suas ideias com apoio da IA.'
  }
}

/**
 * Retorna o plano sugerido para upgrade baseado nos módulos bloqueados
 */
export function getSuggestedUpgrade(currentPlanLevel: PlanLevel): {
  suggestedPlan: PlanLevel | null
  reason: string
  lockedFeatures: string[]
} | null {
  if (currentPlanLevel === 'defesa' || currentPlanLevel === 'profissional') {
    return null // Já tem plano alto
  }
  
  if (currentPlanLevel === 'guardar') {
    return {
      suggestedPlan: 'jornada',
      reason: 'Desbloqueie mais recursos para sua jornada',
      lockedFeatures: ['Minha Evolução', 'Radar Academy']
    }
  }
  
  if (currentPlanLevel === 'jornada') {
    return {
      suggestedPlan: 'defesa',
      reason: 'Acesse ferramentas de proteção avançadas',
      lockedFeatures: ['Provas & Evidências']
    }
  }
  
  return null
}
