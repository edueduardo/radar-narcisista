'use client'

/**
 * CENTRO DE ALERTAS - Dashboard
 * PENDENTE-V2 - IMPLEMENTADO
 * 
 * Painel centralizado de todos os risk_alerts do usuário.
 * Mostra alertas de risco físico detectados via:
 * - Teste de Clareza
 * - Chat
 * - Diário (tags graves)
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  AlertTriangle,
  Shield,
  MessageSquare,
  BookOpen,
  Brain,
  X,
  ChevronRight,
  Bell,
  BellOff,
  CheckCircle,
  Clock,
  Phone
} from 'lucide-react'

// ============================================================================
// TIPOS
// ============================================================================

interface RiskAlert {
  id: string
  user_id: string
  source: 'clarity_test' | 'chat' | 'journal' | 'diary' | 'manual'
  source_id?: string
  // Suporta ambos os formatos (SQL consolidado e API do diário)
  level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  risk_level?: 'low' | 'moderate' | 'high' | 'critical'
  category?: 'PHYSICAL_VIOLENCE' | 'EMOTIONAL_ABUSE' | 'FINANCIAL_ABUSE' | 'ISOLATION' | 'OTHER'
  risk_type?: string
  title?: string
  description?: string
  recommendation?: string
  details?: {
    tags_detected?: string[]
    entry_title?: string
    entry_preview?: string
    impact_score?: number
  }
  status?: 'active' | 'resolved' | 'dismissed'
  is_resolved?: boolean
  is_dismissed?: boolean
  resolved_at?: string | null
  dismissed_at?: string | null
  created_at: string
}

interface AlertCenterProps {
  className?: string
  compact?: boolean
  maxAlerts?: number
  showResolved?: boolean
}

// ============================================================================
// CONSTANTES
// ============================================================================

const SOURCE_ICONS: Record<string, typeof Brain> = {
  clarity_test: Brain,
  chat: MessageSquare,
  diary: BookOpen,
  journal: BookOpen,
  manual: Shield
}

const SOURCE_LABELS: Record<string, string> = {
  clarity_test: 'Teste de Clareza',
  chat: 'Chat',
  diary: 'Diário',
  journal: 'Diário',
  manual: 'Manual'
}

const LEVEL_COLORS = {
  LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30'
}

const LEVEL_LABELS = {
  LOW: 'Baixo',
  MEDIUM: 'Médio',
  HIGH: 'Alto',
  CRITICAL: 'Crítico'
}

const CATEGORY_LABELS = {
  PHYSICAL_VIOLENCE: 'Violência Física',
  EMOTIONAL_ABUSE: 'Abuso Emocional',
  FINANCIAL_ABUSE: 'Abuso Financeiro',
  ISOLATION: 'Isolamento',
  OTHER: 'Outro'
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function AlertCenter({
  className = '',
  compact = false,
  maxAlerts = 5,
  showResolved = false
}: AlertCenterProps) {
  const [alerts, setAlerts] = useState<RiskAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(!compact)
  
  const supabase = createClient()

  // Carregar alertas
  useEffect(() => {
    loadAlerts()
  }, [showResolved])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('risk_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(maxAlerts)

      // Filtrar por status ativo (suporta ambos os formatos)
      if (!showResolved) {
        query = query.or('status.eq.active,status.is.null')
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao carregar alertas:', error)
        return
      }

      setAlerts(data || [])
    } catch (error) {
      console.error('Erro ao carregar alertas:', error)
    }
    setLoading(false)
  }

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('risk_alerts')
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', alertId)

      if (!error) {
        setAlerts(prev => prev.filter(a => a.id !== alertId))
      }
    } catch (error) {
      console.error('Erro ao resolver alerta:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`
    return date.toLocaleDateString('pt-BR')
  }

  // Funções helper para normalizar dados (suporta ambos os formatos)
  const getNormalizedLevel = (alert: RiskAlert): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
    if (alert.level) return alert.level
    if (alert.risk_level) {
      const map: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = {
        'low': 'LOW',
        'moderate': 'MEDIUM',
        'high': 'HIGH',
        'critical': 'CRITICAL'
      }
      return map[alert.risk_level] || 'MEDIUM'
    }
    return 'MEDIUM'
  }

  const isAlertResolved = (alert: RiskAlert): boolean => {
    if (alert.is_resolved !== undefined) return alert.is_resolved
    if (alert.is_dismissed !== undefined) return alert.is_dismissed
    if (alert.status) return alert.status !== 'active'
    return false
  }

  const getAlertTitle = (alert: RiskAlert): string => {
    if (alert.title) return alert.title
    if (alert.details?.entry_title) return alert.details.entry_title
    if (alert.risk_type) return `Alerta: ${alert.risk_type}`
    return 'Alerta de Risco'
  }

  const getAlertDescription = (alert: RiskAlert): string => {
    if (alert.description) return alert.description
    if (alert.recommendation) return alert.recommendation
    if (alert.details?.entry_preview) return alert.details.entry_preview
    if (alert.details?.tags_detected) return `Tags detectadas: ${alert.details.tags_detected.join(', ')}`
    return 'Verifique este alerta'
  }

  const unresolvedCount = alerts.filter(a => !isAlertResolved(a)).length
  const hasCritical = alerts.some(a => getNormalizedLevel(a) === 'CRITICAL' && !isAlertResolved(a))

  // Se não há alertas, mostrar mensagem positiva
  if (!loading && alerts.length === 0) {
    return (
      <div className={`bg-green-500/10 rounded-xl p-4 border border-green-500/20 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/20">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-green-400 font-medium">Tudo tranquilo</h3>
            <p className="text-green-300/70 text-sm">Nenhum alerta de risco ativo</p>
          </div>
        </div>
      </div>
    )
  }

  // Versão compacta
  if (compact && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className={`w-full bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors ${className} ${
          hasCritical ? 'border-red-500/50 animate-pulse' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${hasCritical ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
              <Bell className={`w-5 h-5 ${hasCritical ? 'text-red-400' : 'text-yellow-400'}`} />
            </div>
            <div className="text-left">
              <h3 className={`font-medium ${hasCritical ? 'text-red-400' : 'text-yellow-400'}`}>
                {unresolvedCount} alerta{unresolvedCount !== 1 ? 's' : ''} ativo{unresolvedCount !== 1 ? 's' : ''}
              </h3>
              <p className="text-gray-400 text-sm">Clique para ver detalhes</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </button>
    )
  }

  return (
    <div className={`bg-white/5 rounded-xl border border-white/10 overflow-hidden ${className} ${
      hasCritical ? 'border-red-500/50' : ''
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${hasCritical ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
            <AlertTriangle className={`w-5 h-5 ${hasCritical ? 'text-red-400' : 'text-yellow-400'}`} />
          </div>
          <div>
            <h3 className="text-white font-medium">Centro de Alertas</h3>
            <p className="text-gray-400 text-sm">
              {unresolvedCount} alerta{unresolvedCount !== 1 ? 's' : ''} ativo{unresolvedCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {compact && (
          <button
            onClick={() => setExpanded(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Lista de Alertas */}
      <div className="divide-y divide-white/5">
        {loading ? (
          <div className="p-4 text-center text-gray-400">
            <Clock className="w-5 h-5 animate-spin mx-auto mb-2" />
            Carregando alertas...
          </div>
        ) : (
          alerts.map(alert => {
            const SourceIcon = SOURCE_ICONS[alert.source] || SOURCE_ICONS['manual']
            const level = getNormalizedLevel(alert)
            const resolved = isAlertResolved(alert)
            const title = getAlertTitle(alert)
            const description = getAlertDescription(alert)
            
            return (
              <div 
                key={alert.id}
                className={`p-4 ${resolved ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Ícone da fonte */}
                  <div className={`p-2 rounded-lg ${LEVEL_COLORS[level].split(' ')[0]}`}>
                    <SourceIcon className={`w-4 h-4 ${LEVEL_COLORS[level].split(' ')[1]}`} />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${LEVEL_COLORS[level]}`}>
                        {LEVEL_LABELS[level]}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {SOURCE_LABELS[alert.source] || 'Sistema'}
                      </span>
                      <span className="text-gray-600 text-xs">
                        • {formatDate(alert.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm font-medium mb-1">
                      {title}
                    </p>
                    
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {description}
                    </p>

                    {/* Ações */}
                    {!resolved && (
                      <div className="flex items-center gap-2 mt-3">
                        <Link
                          href="/plano-seguranca"
                          className="px-3 py-1.5 text-xs rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors"
                        >
                          Ver Plano de Segurança
                        </Link>
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                        >
                          Marcar como resolvido
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer com emergência */}
      {hasCritical && (
        <div className="p-4 bg-red-500/10 border-t border-red-500/20">
          <p className="text-red-300 text-sm mb-3">
            <strong>Atenção:</strong> Você tem alertas críticos. Se estiver em perigo imediato, ligue para:
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="tel:190"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <Phone className="w-4 h-4" />
              190 - Polícia
            </a>
            <a
              href="tel:180"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-colors"
            >
              <Phone className="w-4 h-4" />
              180 - Mulher
            </a>
            <a
              href="tel:188"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
            >
              <Phone className="w-4 h-4" />
              188 - CVV
            </a>
          </div>
        </div>
      )}

      {/* Link para ver todos */}
      {alerts.length >= maxAlerts && (
        <Link
          href="/alertas"
          className="block p-3 text-center text-sm text-violet-400 hover:bg-white/5 transition-colors border-t border-white/10"
        >
          Ver todos os alertas →
        </Link>
      )}
    </div>
  )
}

// ============================================================================
// COMPONENTE MINI (para header/sidebar)
// ============================================================================

export function AlertBadge({ className = '' }: { className?: string }) {
  const [count, setCount] = useState(0)
  const [hasCritical, setHasCritical] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const loadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('risk_alerts')
        .select('level')
        .eq('user_id', user.id)
        .eq('is_resolved', false)

      if (!error && data) {
        setCount(data.length)
        setHasCritical(data.some(a => a.level === 'CRITICAL'))
      }
    }

    loadCount()
  }, [])

  if (count === 0) return null

  return (
    <Link
      href="/alertas"
      className={`relative p-2 rounded-lg hover:bg-white/10 transition-colors ${className}`}
    >
      <Bell className={`w-5 h-5 ${hasCritical ? 'text-red-400' : 'text-yellow-400'}`} />
      <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center ${
        hasCritical ? 'bg-red-500' : 'bg-yellow-500'
      } text-white font-bold`}>
        {count > 9 ? '9+' : count}
      </span>
    </Link>
  )
}
