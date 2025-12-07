'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Shield, 
  Globe,
  BarChart3,
  Settings,
  Zap,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Cpu
} from 'lucide-react'
import { Locale, getAdminTranslation } from '@/lib/i18n'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    totalTests: 0,
    riskAlerts: 0,
    systemHealth: 'good',
    lastUpdate: ''
  })
  const [locale, setLocale] = useState<Locale>('pt-BR')
  const supabase = createClient()

  const t = (key: string) => getAdminTranslation(key, locale)

  useEffect(() => {
    // Detectar idioma do localStorage
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && ['pt-BR', 'en', 'es'].includes(savedLocale)) {
      setLocale(savedLocale)
    }

    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Carregar estatísticas básicas
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      const { count: totalTests } = await supabase
        .from('clareza_testes')
        .select('*', { count: 'exact', head: true })

      const { count: riskAlerts } = await supabase
        .from('risk_alerts')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalUsers: totalUsers || 0,
        activeToday: Math.floor(Math.random() * 50) + 10, // Simulado
        totalTests: totalTests || 0,
        riskAlerts: riskAlerts || 0,
        systemHealth: 'good',
        lastUpdate: new Date().toLocaleString()
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    color, 
    trend 
  }: {
    icon: any
    title: string
    value: string | number
    color: string
    trend?: number
  }) => (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            <TrendingUp className="w-4 h-4" />
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{title}</p>
      </div>
    </div>
  )

  const QuickAction = ({ 
    icon: Icon, 
    titleKey, 
    descriptionKey, 
    href, 
    color 
  }: {
    icon: any
    titleKey: string
    descriptionKey: string
    href: string
    color: string
  }) => (
    <a 
      href={href}
      className="block bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white mb-1">{t(titleKey)}</h3>
          <p className="text-sm text-slate-400">{t(descriptionKey)}</p>
        </div>
      </div>
    </a>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <Activity className="w-5 h-5 animate-spin" />
          <span>{t('admin.status.loading')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('admin.header.title')}
          </h1>
          <p className="text-slate-400">
            {t('admin.header.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          {t('admin.table.updated')}: {stats.lastUpdate}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title={t('admin.nav.users')}
          value={stats.totalUsers}
          color="bg-blue-600/20 border border-blue-500/30"
          trend={12}
        />
        <StatCard
          icon={Activity}
          title="Ativos Hoje"
          value={stats.activeToday}
          color="bg-green-600/20 border border-green-500/30"
          trend={8}
        />
        <StatCard
          icon={BarChart3}
          title="Testes Realizados"
          value={stats.totalTests}
          color="bg-purple-600/20 border border-purple-500/30"
          trend={15}
        />
        <StatCard
          icon={AlertTriangle}
          title="Alertas de Risco"
          value={stats.riskAlerts}
          color="bg-red-600/20 border border-red-500/30"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            icon={Users}
            titleKey="admin.nav.users"
            descriptionKey="admin.msg.loading"
            href="/admin/usuarios"
            color="bg-blue-600/20 border border-blue-500/30"
          />
          <QuickAction
            icon={Settings}
            titleKey="admin.menu.ai"
            descriptionKey="admin.msg.loading"
            href="/admin/configurar-ias"
            color="bg-purple-600/20 border border-purple-500/30"
          />
          <QuickAction
            icon={Shield}
            titleKey="admin.status.warning"
            descriptionKey="admin.msg.loading"
            href="/admin/seguranca"
            color="bg-red-600/20 border border-red-500/30"
          />
          <QuickAction
            icon={Database}
            titleKey="admin.actions.database"
            descriptionKey="admin.msg.loading"
            href="/admin/database"
            color="bg-green-600/20 border border-green-500/30"
          />
          <QuickAction
            icon={Globe}
            titleKey="admin.menu.front"
            descriptionKey="admin.msg.loading"
            href="/admin/fanpage"
            color="bg-indigo-600/20 border border-indigo-500/30"
          />
          <QuickAction
            icon={Zap}
            titleKey="admin.menu.ai"
            descriptionKey="admin.msg.loading"
            href="/admin/oraculo"
            color="bg-yellow-600/20 border border-yellow-500/30"
          />
        </div>
      </div>

      {/* System Status */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Status do Sistema</h2>
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-white font-medium">API</p>
                <p className="text-sm text-slate-400">Operacional</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-white font-medium">Database</p>
                <p className="text-sm text-slate-400">Conectado</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-white font-medium">IA</p>
                <p className="text-sm text-slate-400">Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
