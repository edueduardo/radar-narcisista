// ============================================
// 🔥 CONFIGURAÇÃO CENTRALIZADA DO MENU ADMIN
// ============================================
// 
// AVISO: ESTE ARQUIVO AGORA USA O ADMIN FEATURES REGISTRY
// 
// Para adicionar/remover funcionalidades:
// 1. EDITE app/admin/admin-features-registry.ts
// 2. NÃO EDITE MAIS ESTE ARQUIVO MANUALMENTE
// 
// Este arquivo existe apenas para compatibilidade com código existente.
// Toda a lógica está migrada para o registry centralizado.
// ============================================

import { 
  ADMIN_FEATURES, 
  AdminFeatureId, 
  featureToMenuItem,
  getAllAdminFeatures,
  getRegistryStats 
} from '@/app/admin/admin-features-registry'

// Interface para compatibilidade (mantida para não quebrar código existente)
export interface AdminMenuItem {
  id: string
  label: string
  icon: string // Nome do ícone (lucide-react)
  href?: string // Se definido, é um link externo
  isLink?: boolean
  badge?: number // Contador de notificações
  enabled: boolean // Se false, não aparece no menu
  order: number // Posição no menu (menor = mais acima)
}

// 🔥 AGORA USA O REGISTRY CENTRALIZADO
export const DEFAULT_MENU_ITEMS: AdminMenuItem[] = getAllAdminFeatures().map(feature => 
  featureToMenuItem(feature)
)

const STORAGE_KEY = 'admin_menu_order'

// 🔄 Carregar ordem personalizada do localStorage (AGORA COM REGISTRY)
export function loadMenuOrder(): AdminMenuItem[] {
  if (typeof window === 'undefined') return DEFAULT_MENU_ITEMS
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_MENU_ITEMS
    
    const savedOrder: { id: string; order: number; enabled: boolean }[] = JSON.parse(saved)
    
    // 🔥 MESCLA COM REGISTRY (inclui automaticamente novas features)
    const merged = DEFAULT_MENU_ITEMS.map(item => {
      const savedItem = savedOrder.find(s => s.id === item.id)
      if (savedItem) {
        return { ...item, order: savedItem.order, enabled: savedItem.enabled }
      }
      // Nova feature sem preferências salvas - usa defaults do registry
      return item
    })
    
    // Ordenar por order
    return merged.sort((a, b) => a.order - b.order)
  } catch {
    return DEFAULT_MENU_ITEMS
  }
}

// Salvar ordem personalizada no localStorage (mesma lógica, agora com registry)
export function saveMenuOrder(items: AdminMenuItem[]): void {
  if (typeof window === 'undefined') return
  
  const toSave = items.map((item, index) => ({
    id: item.id,
    order: index + 1,
    enabled: item.enabled
  }))
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
}

// 🔥 NOVAS FUNÇÕES DE INTEGRAÇÃO COM REGISTRY

// Obter features do registry como menu items
export function getMenuItemsFromRegistry(): AdminMenuItem[] {
  return getAllAdminFeatures().map(feature => featureToMenuItem(feature))
}

// Verificar se há novas features no registry que não estão no menu salvo
export function getNewFeaturesSinceLastSave(): AdminMenuItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_MENU_ITEMS
    
    const savedOrder: { id: string }[] = JSON.parse(saved)
    const savedIds = new Set(savedOrder.map(s => s.id))
    
    return DEFAULT_MENU_ITEMS.filter(item => !savedIds.has(item.id))
  } catch {
    return DEFAULT_MENU_ITEMS
  }
}

// Sincronizar menu com registry (adiciona novas features automaticamente)
export function syncMenuWithRegistry(): AdminMenuItem[] {
  const currentItems = loadMenuOrder()
  const registryItems = getMenuItemsFromRegistry()
  const currentIds = new Set(currentItems.map(i => i.id))
  
  // Adicionar novas features do registry que não existem no menu atual
  const newItems = registryItems.filter(item => !currentIds.has(item.id))
  
  if (newItems.length > 0) {
    const updatedItems = [...currentItems, ...newItems]
    saveMenuOrder(updatedItems)
    return updatedItems
  }
  
  return currentItems
}

// Obter estatísticas do menu (baseado no registry)
export function getMenuStats() {
  const stats = getRegistryStats()
  const currentMenu = loadMenuOrder()
  const enabledItems = currentMenu.filter(item => item.enabled)
  
  return {
    ...stats,
    totalInMenu: currentMenu.length,
    enabledInMenu: enabledItems.length,
    disabledInMenu: currentMenu.length - enabledItems.length,
    newFeaturesAvailable: getNewFeaturesSinceLastSave().length
  }
}

// Mover item para cima
export function moveItemUp(items: AdminMenuItem[], itemId: string): AdminMenuItem[] {
  const index = items.findIndex(i => i.id === itemId)
  if (index <= 0) return items
  
  const newItems = [...items]
  const temp = newItems[index - 1]
  newItems[index - 1] = newItems[index]
  newItems[index] = temp
  
  // Atualizar orders
  return newItems.map((item, i) => ({ ...item, order: i + 1 }))
}

// Mover item para baixo
export function moveItemDown(items: AdminMenuItem[], itemId: string): AdminMenuItem[] {
  const index = items.findIndex(i => i.id === itemId)
  if (index < 0 || index >= items.length - 1) return items
  
  const newItems = [...items]
  const temp = newItems[index + 1]
  newItems[index + 1] = newItems[index]
  newItems[index] = temp
  
  // Atualizar orders
  return newItems.map((item, i) => ({ ...item, order: i + 1 }))
}

// Toggle enabled
export function toggleItemEnabled(items: AdminMenuItem[], itemId: string): AdminMenuItem[] {
  return items.map(item => 
    item.id === itemId ? { ...item, enabled: !item.enabled } : item
  )
}

// Resetar para ordem padrão
export function resetMenuOrder(): AdminMenuItem[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
  return DEFAULT_MENU_ITEMS
}

// Obter menu filtrado (apenas enabled)
export function getEnabledMenuItems(): AdminMenuItem[] {
  return loadMenuOrder().filter(item => item.enabled)
}
