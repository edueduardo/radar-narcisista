'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { getEasterEggStatus, getEasterEggLogs } from '@/lib/easter-eggs'
import { DEV_SECRETS, AI_SECRETS, SYSTEM_SECRETS } from '@/lib/easter-eggs-secret'
import { 
  Eye, EyeOff, Lock, Unlock, AlertTriangle, 
  Activity, Users, Shield, Key, Code, 
  RefreshCw, Download, Upload, Trash2,
  Radar, Ghost, Sparkles, Crown, Clock
} from 'lucide-react'

const Invisible = EyeOff

interface EasterEggStatus {
  id: string
  name: string
  description: string
  active: boolean
  usageCount: number
  lastUsed: string
  users: Array<{ id: string; name: string; date: string }>
  dangerLevel: 'low' | 'medium' | 'high' | 'critical'
}

export default function EasterEggsAdmin() {
  const [easterEggs, setEasterEggs] = useState<EasterEggStatus[]>([])

  const [showSecrets, setShowSecrets] = useState(false)
  const [selectedEgg, setSelectedEgg] = useState<string | null>(null)

  // Carregar dados reais dos Easter Eggs
  useEffect(() => {
    const loadEasterEggs = () => {
      const status = getEasterEggStatus()
      const logs = getEasterEggLogs()
      
      // Easter Eggs principais
      const enriched = status.map(egg => {
        const eggLogs = logs.filter(log => log.eggId === egg.id)
        const users = eggLogs.map(log => ({
          id: log.id,
          name: `Usuário ${log.userId?.slice(0, 8) || 'Anônimo'}`,
          date: log.timestamp
        }))
        
        return {
          ...egg,
          active: Boolean(egg.active), // Garantir boolean
          description: getDescription(egg.id),
          users: users.slice(-5), // Últimos 5 usuários
          dangerLevel: getDangerLevel(egg.id)
        }
      })
      
      // Adicionar Easter Eggs ultra-secretos
      const ultraSecretEggs = [
        {
          id: 'matrix-mode',
          name: '🎮 Matrix Mode (Ultra-Secreto)',
          description: '?matrix=redpill - Interface Matrix com controle total do sistema',
          active: localStorage.getItem('matrix_activated') ? true : false,
          usageCount: parseInt(localStorage.getItem('matrix_usage_count') || '0'),
          lastUsed: localStorage.getItem('matrix_last_used') || 'Nunca',
          users: [],
          dangerLevel: 'critical' as const
        },
        {
          id: 'universal-backdoor',
          name: '🔓 Universal Backdoor (Ultra-Secreto)',
          description: '/backdoor?key=theone&access=42 - Acesso total a qualquer sistema',
          active: localStorage.getItem('backdoor_accessed') ? true : false,
          usageCount: parseInt(localStorage.getItem('backdoor_usage_count') || '0'),
          lastUsed: localStorage.getItem('backdoor_last_used') || 'Nunca',
          users: [],
          dangerLevel: 'critical' as const
        },
        {
          id: 'protocol-zero',
          name: '🚨 Protocolo Zero (Ultra-Secreto)',
          description: 'window.PROTOCOL_ZERO.execute() - Reset completo do sistema',
          active: localStorage.getItem('protocol_zero_executed') ? true : false,
          usageCount: parseInt(localStorage.getItem('protocol_zero_count') || '0'),
          lastUsed: localStorage.getItem('protocol_zero_last_used') || 'Nunca',
          users: [],
          dangerLevel: 'critical' as const
        },
        {
          id: 'oracle-mode',
          name: '🔮 Oracle Mode IA (Ultra-Secreto)',
          description: 'ORACLE_ACTIVATE_MODE_UNLIMITED - Acesso direto às IAs sem limites',
          active: localStorage.getItem('oracle_mode') === 'active',
          usageCount: parseInt(localStorage.getItem('oracle_usage_count') || '0'),
          lastUsed: localStorage.getItem('oracle_last_used') || 'Nunca',
          users: [],
          dangerLevel: 'high' as const
        },
        {
          id: 'prompt-god-mode',
          name: '🎭 Prompt God Mode (Ultra-Secreto)',
          description: 'GOD_MODE_ENABLE_ADVANCED_PROMPTS - Prompts ultra-avançados',
          active: localStorage.getItem('god_prompts') ? true : false,
          usageCount: parseInt(localStorage.getItem('god_prompts_count') || '0'),
          lastUsed: localStorage.getItem('god_prompts_last_used') || 'Nunca',
          users: [],
          dangerLevel: 'high' as const
        },
        {
          id: 'invisible-mode',
          name: '👻 Invisible Mode (Ultra-Secreto)',
          description: 'Ctrl+Alt+I+V - Navegação 100% anônima',
          active: localStorage.getItem('invisible_mode') === 'active',
          usageCount: parseInt(localStorage.getItem('invisible_usage_count') || '0'),
          lastUsed: localStorage.getItem('invisible_last_used') || 'Nunca',
          users: [],
          dangerLevel: 'medium' as const
        },
        {
          id: 'final-easter-egg',
          name: '🏆 Final Easter Egg (Ultra-Secreto)',
          description: 'Sequência secreta complexa - Surpresa final do sistema',
          active: localStorage.getItem('ultimate_secret_found') === 'true',
          usageCount: parseInt(localStorage.getItem('final_egg_count') || '0'),
          lastUsed: localStorage.getItem('final_egg_last_used') || 'Nunca',
          users: [],
          dangerLevel: 'low' as const
        }
      ]
      
      setEasterEggs([...enriched, ...ultraSecretEggs])
    }
    
    // Carregar inicialmente
    loadEasterEggs()
    
    // Atualizar a cada 5 segundos
    const interval = setInterval(loadEasterEggs, 5000)
    
    return () => clearInterval(interval)
  }, [])

  // Funções auxiliares
  const getDescription = (eggId: string): string => {
    const descriptions: Record<string, string> = {
      'master-admin': '?admin=rn2024&debug=true - Painel secreto com modo Deus',
      'secret-resources': '/recursos-secretos - Gerador de laudos, detector de mentiras',
      'mirror-mode': '**DESBLOQUEAR_ESPELHO** no diário - Análise terapêutica',
      'emergency-protocol': 'Ctrl+Shift+R+N - Limpeza instantânea e backup',
      'console-secrets': 'window.RADAR_SECRETS = true - Debug completo',
      'logo-sequence': '7 cliques no logo RN - Menu oculto',
      'key-phrases': '"chave mestra" ou "protocolo zero" no diário'
    }
    return descriptions[eggId] || 'Easter Egg secreto'
  }

  const getDangerLevel = (eggId: string): 'low' | 'medium' | 'high' | 'critical' => {
    const levels: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'master-admin': 'critical',
      'secret-resources': 'high',
      'emergency-protocol': 'critical',
      'mirror-mode': 'medium',
      'console-secrets': 'medium',
      'logo-sequence': 'low',
      'key-phrases': 'low'
    }
    return levels[eggId] || 'low'
  }

  const toggleEasterEgg = (id: string) => {
    setEasterEggs(prev => prev.map(egg => 
      egg.id === id ? { ...egg, active: !egg.active } : egg
    ))
  }

  const getDangerColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      default: return 'text-green-400 bg-green-500/10 border-green-500/30'
    }
  }

  const getDangerIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      case 'high': return <Shield className="w-4 h-4" />
      case 'medium': return <Lock className="w-4 h-4" />
      default: return <Eye className="w-4 h-4" />
    }
  }

  const exportLogs = () => {
    const logs = {
      timestamp: new Date().toISOString(),
      easterEggs: easterEggs,
      summary: {
        totalActive: easterEggs.filter(e => e.active).length,
        totalUsage: easterEggs.reduce((sum, e) => sum + e.usageCount, 0),
        criticalActive: easterEggs.filter(e => e.active && e.dangerLevel === 'critical').length
      }
    }
    
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `easter-eggs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetAllEggs = () => {
    if (confirm('⚠️ Resetar TODOS os Easter Eggs? Isso desativará tudo e limpará os logs.')) {
      setEasterEggs(prev => prev.map(egg => ({
        ...egg,
        active: false,
        usageCount: 0,
        lastUsed: 'Nunca',
        users: []
      })))
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Secreto */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Ghost className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Painel de Easter Eggs</h1>
              <Invisible className="w-6 h-6 text-purple-400" />
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setShowSecrets(!showSecrets)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
              >
                {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showSecrets ? 'Ocultar Segredos' : 'Mostrar Segredos'}
              </button>
              
              <button
                onClick={exportLogs}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar Logs
              </button>
              
              <button
                onClick={resetAllEggs}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Resetar Tudo
              </button>
            </div>

            {/* Status Geral */}
            <div className="grid grid-cols-5 gap-4 mb-8">
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-slate-400">Ativos</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {easterEggs.filter(e => e.active).length}
                </p>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-slate-400">Total</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {easterEggs.length}/15
                </p>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-slate-400">Críticos</span>
                </div>
                <p className="text-2xl font-bold text-red-400">
                  {easterEggs.filter(e => e.active && e.dangerLevel === 'critical').length}
                </p>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Ghost className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-slate-400">Ultra-Secretos</span>
                </div>
                <p className="text-2xl font-bold text-purple-400">
                  {easterEggs.filter(e => e.name.includes('Ultra-Secreto')).length}
                </p>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-slate-400">Master</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400">
                  {easterEggs.find(e => e.id === 'master-admin')?.active ? 'ON' : 'OFF'}
                </p>
              </div>
            </div>
          </div>

          {/* Lista de Easter Eggs */}
          <div className="space-y-4">
            {/* Easter Eggs Principais */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Easter Eggs Principais (8)
              </h3>
              {easterEggs.filter(e => !e.name.includes('Ultra-Secreto')).map((egg) => (
              <div 
                key={egg.id}
                className={`bg-slate-900 rounded-xl p-6 border transition-all ${
                  egg.active ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{egg.name}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getDangerColor(egg.dangerLevel)}`}>
                        <div className="flex items-center gap-1">
                          {getDangerIcon(egg.dangerLevel)}
                          {egg.dangerLevel.toUpperCase()}
                        </div>
                      </div>
                      {egg.active && (
                        <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          ATIVO
                        </div>
                      )}
                    </div>
                    
                    <p className="text-slate-400 mb-2 font-mono text-sm">{egg.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                      <span>Usos: <strong className="text-white">{egg.usageCount}</strong></span>
                      <span>Último: <strong className="text-white">{egg.lastUsed}</strong></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedEgg(egg.id)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4 text-slate-400" />
                    </button>
                    
                    <button
                      onClick={() => toggleEasterEgg(egg.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        egg.active 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                      title={egg.active ? 'Desativar' : 'Ativar'}
                    >
                      {egg.active ? (
                        <Unlock className="w-4 h-4 text-white" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Usuários Recentes */}
                {showSecrets && egg.users.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-400 mb-2">Usuários recentes:</p>
                    <div className="flex flex-wrap gap-2">
                      {egg.users.map((user, idx) => (
                        <div 
                          key={idx}
                          className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300"
                        >
                          {user.name} - {new Date(user.date).toLocaleTimeString('pt-BR')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            </div>

            {/* Easter Eggs Ultra-Secretos */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                <Ghost className="w-5 h-5 text-purple-400" />
                Easter Eggs Ultra-Secretos (7) - Acesso Direto
              </h3>
              {easterEggs.filter(e => e.name.includes('Ultra-Secreto')).map((egg) => (
              <div 
                key={egg.id}
                className={`bg-purple-950/30 rounded-xl p-6 border transition-all ${
                  egg.active ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' : 'border-purple-900/50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-purple-300">{egg.name}</h3>
                      <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                        Ultra-Secreto
                      </span>
                    </div>
                    <p className="text-purple-200 text-sm mb-3">{egg.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300">Usos: {egg.usageCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300">{egg.lastUsed}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${getDangerColor(egg.dangerLevel)}`}>
                        <AlertTriangle className="w-4 h-4" />
                        <span>{egg.dangerLevel.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      egg.active ? 'bg-purple-400' : 'bg-slate-600'
                    }`} />
                    <span className={`text-sm ${
                      egg.active ? 'text-purple-400' : 'text-slate-400'
                    }`}>
                      {egg.active ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>

          {/* Modal de Detalhes */}
          {selectedEgg && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
              <div className="bg-slate-900 rounded-xl p-6 max-w-2xl w-full border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">
                    Detalhes: {easterEggs.find(e => e.id === selectedEgg)?.name}
                  </h3>
                  <button
                    onClick={() => setSelectedEgg(null)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg"
                  >
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Código de Ativação:</p>
                    <code className="block p-3 bg-slate-800 rounded text-green-400 font-mono text-sm">
                      {easterEggs.find(e => e.id === selectedEgg)?.description}
                    </code>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Logs Completos:</p>
                    <div className="bg-slate-800 rounded p-3 h-40 overflow-y-auto">
                      <pre className="text-xs text-slate-300">
                        {JSON.stringify(easterEggs.find(e => e.id === selectedEgg), null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aviso de Segurança */}
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-semibold">⚠️ AVISO DE SEGURANÇA</span>
            </div>
            <p className="text-red-300 text-sm">
              Easter Eggs críticos podem expor dados sensíveis e comprometer a segurança do sistema. 
              Monitore ativamente e desative imediatamente se detectar uso não autorizado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
