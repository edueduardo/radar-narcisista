'use client'

import { useEffect, useState } from 'react'

/**
 * MODO CAMUFLAGEM - RADAR NARCISISTA
 * 
 * Permite que o usuário altere o título da aba do navegador
 * para algo neutro, evitando que o abusador veja o que está acessando.
 * 
 * Títulos disponíveis:
 * - "Meu Diário" (padrão camuflado)
 * - "Notas Pessoais"
 * - "Google"
 * - Título real do Radar
 */

const CAMOUFLAGE_TITLES = [
  { id: 'diary', label: 'Meu Diário', title: 'Meu Diário' },
  { id: 'notes', label: 'Notas Pessoais', title: 'Notas Pessoais' },
  { id: 'google', label: 'Google', title: 'Google' },
  { id: 'email', label: 'E-mail', title: 'Caixa de Entrada' },
  { id: 'real', label: 'Título Real', title: 'Radar Narcisista BR' },
]

const STORAGE_KEY = 'radar_camouflage_mode'

export function useCamouflageMode() {
  const [mode, setMode] = useState<string>('real')
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    // Carregar preferência salva
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      setMode(parsed.mode || 'real')
      setIsEnabled(parsed.enabled || false)
    }
  }, [])

  useEffect(() => {
    // Aplicar título
    if (isEnabled && mode !== 'real') {
      const selected = CAMOUFLAGE_TITLES.find(t => t.id === mode)
      if (selected) {
        document.title = selected.title
      }
    }
  }, [mode, isEnabled])

  const toggleCamouflage = () => {
    const newEnabled = !isEnabled
    setIsEnabled(newEnabled)
    
    if (newEnabled && mode !== 'real') {
      const selected = CAMOUFLAGE_TITLES.find(t => t.id === mode)
      if (selected) {
        document.title = selected.title
      }
    } else {
      // Restaurar título original
      document.title = 'Radar Narcisista BR – Encontre clareza em meio à confusão'
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, enabled: newEnabled }))
  }

  const setModeAndSave = (newMode: string) => {
    setMode(newMode)
    
    if (isEnabled && newMode !== 'real') {
      const selected = CAMOUFLAGE_TITLES.find(t => t.id === newMode)
      if (selected) {
        document.title = selected.title
      }
    } else if (newMode === 'real') {
      document.title = 'Radar Narcisista BR – Encontre clareza em meio à confusão'
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: newMode, enabled: isEnabled }))
  }

  return {
    mode,
    isEnabled,
    toggleCamouflage,
    setMode: setModeAndSave,
    titles: CAMOUFLAGE_TITLES
  }
}

/**
 * Componente de configuração do modo camuflagem
 * Para usar em páginas de configuração
 */
export default function CamouflageModeSettings() {
  const { mode, isEnabled, toggleCamouflage, setMode, titles } = useCamouflageMode()

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            🛡️ Modo Camuflagem
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Muda o título da aba para algo neutro
          </p>
        </div>
        <button
          onClick={toggleCamouflage}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isEnabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {isEnabled && (
        <div className="space-y-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Escolha como o título da aba aparecerá:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {titles.filter(t => t.id !== 'real').map(title => (
              <button
                key={title.id}
                onClick={() => setMode(title.id)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  mode === title.id
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-2 border-purple-500'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {title.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            💡 Dica: Use "Google" ou "E-mail" para parecer uma aba comum
          </p>
        </div>
      )}

      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-xs text-yellow-700 dark:text-yellow-300">
          ⚠️ O modo camuflagem muda apenas o título da aba. Para maior segurança, 
          use também navegação privada e limpe o histórico regularmente.
        </p>
      </div>
    </div>
  )
}
