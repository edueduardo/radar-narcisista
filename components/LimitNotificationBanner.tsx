'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, X, TrendingUp, Zap, Bell } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  feature_key: string
  notification_type: 'warning_80' | 'limit_100' | 'reset'
  message: string
  created_at: string
}

interface UsageStatus {
  feature_key: string
  percentage: number
  status: 'ok' | 'warning' | 'limit_reached'
}

export default function LimitNotificationBanner() {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [usageStatuses, setUsageStatuses] = useState<UsageStatus[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar notificações não lidas
      const { data } = await supabase
        .from('limit_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5)

      if (data) {
        setNotifications(data)
      }

      // Buscar status de uso das features principais
      const { data: effectiveFeatures } = await supabase
        .rpc('get_effective_features', { p_user_id: user.id })

      if (effectiveFeatures) {
        const statuses: UsageStatus[] = []
        for (const [key, value] of Object.entries(effectiveFeatures)) {
          const val = value as any
          if (val.limite_mensal) {
            // Buscar uso atual
            const { data: limitCheck } = await supabase
              .rpc('check_feature_limit', { p_user_id: user.id, p_feature_key: key })
            
            if (limitCheck) {
              const percent = limitCheck.limite_mensal 
                ? (limitCheck.usage_month / limitCheck.limite_mensal) * 100 
                : 0
              
              if (percent >= 80) {
                statuses.push({
                  feature_key: key,
                  percentage: Math.round(percent),
                  status: percent >= 100 ? 'limit_reached' : 'warning'
                })
              }
            }
          }
        }
        setUsageStatuses(statuses)
      }
    } catch (err) {
      console.error('Erro ao carregar notificações:', err)
    } finally {
      setLoading(false)
    }
  }

  async function dismissNotification(id: string) {
    setDismissed([...dismissed, id])
    await supabase
      .from('limit_notifications')
      .update({ read: true })
      .eq('id', id)
  }

  async function dismissAll() {
    const ids = notifications.map(n => n.id)
    setDismissed([...dismissed, ...ids])
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('limit_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
    }
  }

  if (loading) return null

  const visibleNotifications = notifications.filter(n => !dismissed.includes(n.id))
  const visibleStatuses = usageStatuses.filter(s => s.status !== 'ok')

  if (visibleNotifications.length === 0 && visibleStatuses.length === 0) return null

  return (
    <div className="space-y-2 mb-4">
      {/* Notificações de limite */}
      {visibleNotifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg flex items-start gap-3 ${
            notification.notification_type === 'limit_100'
              ? 'bg-red-50 border border-red-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          <div className={`p-2 rounded-full ${
            notification.notification_type === 'limit_100'
              ? 'bg-red-100'
              : 'bg-yellow-100'
          }`}>
            {notification.notification_type === 'limit_100' 
              ? <AlertTriangle className="w-5 h-5 text-red-600" />
              : <Bell className="w-5 h-5 text-yellow-600" />
            }
          </div>
          <div className="flex-1">
            <p className={`font-medium ${
              notification.notification_type === 'limit_100'
                ? 'text-red-800'
                : 'text-yellow-800'
            }`}>
              {notification.message}
            </p>
            <div className="mt-2 flex gap-2">
              <Link
                href="/planos"
                className={`text-sm font-medium ${
                  notification.notification_type === 'limit_100'
                    ? 'text-red-700 hover:text-red-900'
                    : 'text-yellow-700 hover:text-yellow-900'
                }`}
              >
                Ver planos →
              </Link>
            </div>
          </div>
          <button
            onClick={() => dismissNotification(notification.id)}
            className="p-1 hover:bg-white/50 rounded"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      ))}

      {/* Barras de progresso de uso */}
      {visibleStatuses.length > 0 && visibleNotifications.length === 0 && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-gray-700">Uso de Features</span>
          </div>
          <div className="space-y-2">
            {visibleStatuses.map(status => (
              <div key={status.feature_key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{status.feature_key}</span>
                  <span className={`font-medium ${
                    status.status === 'limit_reached' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {status.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      status.status === 'limit_reached' 
                        ? 'bg-red-500' 
                        : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(status.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/planos"
            className="mt-3 inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            <TrendingUp className="w-4 h-4" />
            Fazer upgrade
          </Link>
        </div>
      )}

      {/* Botão para dispensar todas */}
      {visibleNotifications.length > 1 && (
        <button
          onClick={dismissAll}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Dispensar todas notificações
        </button>
      )}
    </div>
  )
}
