'use client'

import { useState } from 'react'
import { 
  Bell, 
  BellOff, 
  Clock, 
  Shield, 
  Volume2, 
  VolumeX,
  Calendar,
  MessageSquare
} from 'lucide-react'

// ============================================
// TIPOS
// ============================================

export type DiscretionLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM'

export interface NotificationConfig {
  enabled: boolean
  discretionLevel: DiscretionLevel
  allowedHoursStart: number
  allowedHoursEnd: number
  allowedDays: string[]
  notifyDiaryReminder: boolean
  notifyRiskAlerts: boolean
  notifyWeeklySummary: boolean
  neutralTitle: string
  silentMode: boolean
}

interface NotificationSettingsProps {
  config: NotificationConfig
  onConfigChange: (config: NotificationConfig) => void
}

// ============================================
// CONSTANTES
// ============================================

const DAYS = [
  { id: 'mon', label: 'Seg' },
  { id: 'tue', label: 'Ter' },
  { id: 'wed', label: 'Qua' },
  { id: 'thu', label: 'Qui' },
  { id: 'fri', label: 'Sex' },
  { id: 'sat', label: 'Sáb' },
  { id: 'sun', label: 'Dom' }
]

const DISCRETION_LEVELS: { id: DiscretionLevel; label: string; description: string }[] = [
  { id: 'LOW', label: 'Baixo', description: 'Notificações normais com nome do app' },
  { id: 'MEDIUM', label: 'Médio', description: 'Título neutro, sem detalhes' },
  { id: 'HIGH', label: 'Alto', description: 'Apenas ícone genérico' },
  { id: 'MAXIMUM', label: 'Máximo', description: 'Completamente silencioso' }
]

const NEUTRAL_TITLES = [
  'Nova atualização',
  'Lembrete',
  'Nota disponível',
  'Verificar agenda',
  'Nova mensagem'
]

// ============================================
// COMPONENTE
// ============================================

export default function NotificationSettings({
  config,
  onConfigChange
}: NotificationSettingsProps) {
  const updateConfig = (updates: Partial<NotificationConfig>) => {
    onConfigChange({ ...config, ...updates })
  }

  const toggleDay = (dayId: string) => {
    const newDays = config.allowedDays.includes(dayId)
      ? config.allowedDays.filter(d => d !== dayId)
      : [...config.allowedDays, dayId]
    updateConfig({ allowedDays: newDays })
  }

  return (
    <div className="space-y-6">
      {/* Toggle principal */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {config.enabled ? (
              <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            ) : (
              <BellOff className="w-6 h-6 text-gray-400" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Notificações
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {config.enabled ? 'Ativadas' : 'Desativadas'}
              </p>
            </div>
          </div>
          <button
            onClick={() => updateConfig({ enabled: !config.enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.enabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {config.enabled && (
        <>
          {/* Nível de discrição */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Nível de Discrição
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {DISCRETION_LEVELS.map(level => (
                <button
                  key={level.id}
                  onClick={() => updateConfig({ discretionLevel: level.id })}
                  className={`p-3 rounded-xl text-left transition-colors ${
                    config.discretionLevel === level.id
                      ? 'bg-purple-100 dark:bg-purple-900 border-2 border-purple-500'
                      : 'bg-gray-50 dark:bg-slate-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-slate-600'
                  }`}
                >
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {level.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {level.description}
                  </p>
                </button>
              ))}
            </div>

            {config.discretionLevel === 'MAXIMUM' && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  ⚠️ No modo máximo, você não receberá nenhuma notificação visível. 
                  Lembre-se de verificar o app regularmente.
                </p>
              </div>
            )}
          </div>

          {/* Título neutro */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Texto da Notificação
              </h3>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Escolha como o título da notificação aparecerá:
            </p>

            <div className="flex flex-wrap gap-2">
              {NEUTRAL_TITLES.map(title => (
                <button
                  key={title}
                  onClick={() => updateConfig({ neutralTitle: title })}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    config.neutralTitle === title
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {title}
                </button>
              ))}
            </div>

            <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Preview: <span className="font-medium text-gray-900 dark:text-white">"{config.neutralTitle}"</span>
              </p>
            </div>
          </div>

          {/* Horários permitidos */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Horários Permitidos
              </h3>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Receba notificações apenas nestes horários:
            </p>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">De</label>
                <select
                  value={config.allowedHoursStart}
                  onChange={e => updateConfig({ allowedHoursStart: parseInt(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Até</label>
                <select
                  value={config.allowedHoursEnd}
                  onChange={e => updateConfig({ allowedHoursEnd: parseInt(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Dias da semana:</span>
            </div>
            
            <div className="flex gap-2">
              {DAYS.map(day => (
                <button
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    config.allowedDays.includes(day.id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tipos de notificação */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Tipos de Notificação
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Lembrete de diário</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Lembrete gentil para registrar episódios</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifyDiaryReminder}
                  onChange={e => updateConfig({ notifyDiaryReminder: e.target.checked })}
                  className="w-5 h-5 rounded text-purple-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Alertas de risco</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Quando a IA detectar padrões preocupantes</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifyRiskAlerts}
                  onChange={e => updateConfig({ notifyRiskAlerts: e.target.checked })}
                  className="w-5 h-5 rounded text-purple-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Resumo semanal</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Resumo dos seus registros da semana</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifyWeeklySummary}
                  onChange={e => updateConfig({ notifyWeeklySummary: e.target.checked })}
                  className="w-5 h-5 rounded text-purple-600"
                />
              </label>
            </div>
          </div>

          {/* Modo silencioso */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {config.silentMode ? (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Modo Silencioso
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sem som ou vibração
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateConfig({ silentMode: !config.silentMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.silentMode ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.silentMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Aviso de segurança */}
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
        <p className="text-sm text-purple-700 dark:text-purple-300">
          💡 <strong>Dica de segurança:</strong> Configure as notificações para horários em que 
          você está sozinha e pode verificar o celular com privacidade.
        </p>
      </div>
    </div>
  )
}

// ============================================
// CONFIG PADRÃO
// ============================================

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  enabled: true,
  discretionLevel: 'MEDIUM',
  allowedHoursStart: 9,
  allowedHoursEnd: 17,
  allowedDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  notifyDiaryReminder: true,
  notifyRiskAlerts: true,
  notifyWeeklySummary: false,
  neutralTitle: 'Nova atualização',
  silentMode: false
}
