/**
 * Sistema de Sincronização Offline
 * FASE 10.4 - Modo Offline para apps mobile
 */

export interface OfflineEntry {
  id: string
  type: 'journal' | 'chat' | 'clarity' | 'safety_plan'
  data: any
  createdAt: string
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed'
  retryCount: number
  lastError?: string
}

export interface SyncQueue {
  entries: OfflineEntry[]
  lastSyncAt: string | null
  isSyncing: boolean
}

export interface ConflictResolution {
  strategy: 'server_wins' | 'client_wins' | 'merge' | 'manual'
  resolver?: (local: any, remote: any) => any
}

/**
 * Gerenciador de sincronização offline
 */
export class OfflineSyncManager {
  private queue: SyncQueue = {
    entries: [],
    lastSyncAt: null,
    isSyncing: false
  }
  
  private storage: Storage | null = null
  private supabase: any = null
  private userId: string | null = null

  constructor(supabase: any, userId: string) {
    this.supabase = supabase
    this.userId = userId
    
    if (typeof window !== 'undefined') {
      this.storage = window.localStorage
      this.loadQueue()
    }
  }

  /**
   * Carregar fila do storage local
   */
  private loadQueue(): void {
    if (!this.storage) return

    try {
      const saved = this.storage.getItem(`offline_queue_${this.userId}`)
      if (saved) {
        this.queue = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Erro ao carregar fila offline:', error)
    }
  }

  /**
   * Salvar fila no storage local
   */
  private saveQueue(): void {
    if (!this.storage) return

    try {
      this.storage.setItem(`offline_queue_${this.userId}`, JSON.stringify(this.queue))
    } catch (error) {
      console.error('Erro ao salvar fila offline:', error)
    }
  }

  /**
   * Adicionar entrada à fila offline
   */
  addToQueue(type: OfflineEntry['type'], data: any): string {
    const entry: OfflineEntry = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data: {
        ...data,
        user_id: this.userId,
        created_offline: true,
        offline_id: data.id || `local_${Date.now()}`
      },
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
      retryCount: 0
    }

    this.queue.entries.push(entry)
    this.saveQueue()

    return entry.id
  }

  /**
   * Remover entrada da fila
   */
  removeFromQueue(id: string): void {
    this.queue.entries = this.queue.entries.filter(e => e.id !== id)
    this.saveQueue()
  }

  /**
   * Sincronizar fila com servidor
   */
  async sync(): Promise<{
    success: boolean
    synced: number
    failed: number
    errors: string[]
  }> {
    if (this.queue.isSyncing) {
      return { success: false, synced: 0, failed: 0, errors: ['Sincronização já em andamento'] }
    }

    if (!navigator.onLine) {
      return { success: false, synced: 0, failed: 0, errors: ['Sem conexão com internet'] }
    }

    this.queue.isSyncing = true
    this.saveQueue()

    const results = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [] as string[]
    }

    const pendingEntries = this.queue.entries.filter(e => 
      e.syncStatus === 'pending' || e.syncStatus === 'failed'
    )

    for (const entry of pendingEntries) {
      entry.syncStatus = 'syncing'
      this.saveQueue()

      try {
        await this.syncEntry(entry)
        entry.syncStatus = 'synced'
        results.synced++
      } catch (error: any) {
        entry.syncStatus = 'failed'
        entry.retryCount++
        entry.lastError = error.message
        results.failed++
        results.errors.push(`${entry.type} ${entry.id}: ${error.message}`)

        // Remover após 5 tentativas
        if (entry.retryCount >= 5) {
          this.removeFromQueue(entry.id)
        }
      }

      this.saveQueue()
    }

    // Limpar entradas sincronizadas
    this.queue.entries = this.queue.entries.filter(e => e.syncStatus !== 'synced')
    this.queue.lastSyncAt = new Date().toISOString()
    this.queue.isSyncing = false
    this.saveQueue()

    results.success = results.failed === 0

    return results
  }

  /**
   * Sincronizar entrada individual
   */
  private async syncEntry(entry: OfflineEntry): Promise<void> {
    const table = this.getTableName(entry.type)
    if (!table) {
      throw new Error(`Tipo desconhecido: ${entry.type}`)
    }

    // Verificar conflitos
    if (entry.data.id && !entry.data.id.startsWith('local_')) {
      const { data: existing } = await this.supabase
        .from(table)
        .select('updated_at')
        .eq('id', entry.data.id)
        .single()

      if (existing && new Date(existing.updated_at) > new Date(entry.createdAt)) {
        // Conflito - servidor tem versão mais recente
        throw new Error('Conflito de versão - dados mais recentes no servidor')
      }
    }

    // Preparar dados para inserção
    const insertData = { ...entry.data }
    delete insertData.offline_id
    delete insertData.created_offline

    // Se é um ID local, remover para gerar novo
    if (insertData.id?.startsWith('local_')) {
      delete insertData.id
    }

    // Inserir ou atualizar
    const { error } = await this.supabase
      .from(table)
      .upsert(insertData, {
        onConflict: 'id'
      })

    if (error) {
      throw error
    }
  }

  /**
   * Obter nome da tabela por tipo
   */
  private getTableName(type: OfflineEntry['type']): string | null {
    const tables: Record<string, string> = {
      journal: 'journal_entries',
      chat: 'chat_messages',
      clarity: 'clarity_profiles',
      safety_plan: 'safety_plans'
    }
    return tables[type] || null
  }

  /**
   * Verificar se há entradas pendentes
   */
  hasPendingEntries(): boolean {
    return this.queue.entries.some(e => 
      e.syncStatus === 'pending' || e.syncStatus === 'failed'
    )
  }

  /**
   * Obter contagem de pendentes
   */
  getPendingCount(): number {
    return this.queue.entries.filter(e => 
      e.syncStatus === 'pending' || e.syncStatus === 'failed'
    ).length
  }

  /**
   * Obter última sincronização
   */
  getLastSyncAt(): string | null {
    return this.queue.lastSyncAt
  }

  /**
   * Limpar fila
   */
  clearQueue(): void {
    this.queue = {
      entries: [],
      lastSyncAt: this.queue.lastSyncAt,
      isSyncing: false
    }
    this.saveQueue()
  }
}

/**
 * Hook para usar offline sync em componentes React
 */
export function createOfflineSyncHook(supabase: any, userId: string) {
  const manager = new OfflineSyncManager(supabase, userId)

  return {
    addToQueue: manager.addToQueue.bind(manager),
    sync: manager.sync.bind(manager),
    hasPending: manager.hasPendingEntries.bind(manager),
    pendingCount: manager.getPendingCount.bind(manager),
    lastSync: manager.getLastSyncAt.bind(manager),
    clear: manager.clearQueue.bind(manager)
  }
}

/**
 * Detectar status de conexão
 */
export function useOnlineStatus(): boolean {
  if (typeof window === 'undefined') return true
  return navigator.onLine
}

/**
 * Service Worker para cache offline
 */
export const OFFLINE_SW_CONFIG = `
// Service Worker para modo offline
const CACHE_NAME = 'radar-offline-v1';
const OFFLINE_URLS = [
  '/',
  '/dashboard',
  '/diario',
  '/chat',
  '/offline',
  '/manifest.json'
];

// Instalar e cachear recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retornar cache ou fazer request
      return response || fetch(event.request).catch(() => {
        // Se falhar e for navegação, mostrar página offline
        if (event.request.mode === 'navigate') {
          return caches.match('/offline');
        }
      });
    })
  );
});

// Limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
`
