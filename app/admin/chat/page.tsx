'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminSidebar from '@/components/AdminSidebar'
import { 
  ArrowLeft, 
  Bot, 
  Settings, 
  ToggleLeft, 
  ToggleRight,
  Zap,
  Brain,
  MessageCircle,
  Shield,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { 
  getConfigChatColaborativo, 
  setConfigChatColaborativo, 
  resetConfigChatColaborativo,
  type ChatColaborativoConfig 
} from '../../../lib/chat-colaborativo'

// IAs disponíveis
const IAS_DISPONIVEIS = [
  { id: 'openai', nome: 'OpenAI GPT-4', cor: 'bg-green-500', descricao: 'Mais preciso, mais caro' },
  { id: 'anthropic', nome: 'Anthropic Claude', cor: 'bg-orange-500', descricao: 'Seguro e ético' },
  { id: 'groq', nome: 'Groq (Llama)', cor: 'bg-blue-500', descricao: 'Rápido e gratuito' },
  { id: 'gemini', nome: 'Google Gemini', cor: 'bg-red-500', descricao: 'Multimodal' },
]

export default function AdminChatPage() {
  const [config, setConfig] = useState<ChatColaborativoConfig>(getConfigChatColaborativo())
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  const toggleIA = (iaId: string) => {
    setConfig(prev => {
      const novasIAs = prev.iasAtivas.includes(iaId)
        ? prev.iasAtivas.filter(id => id !== iaId)
        : [...prev.iasAtivas, iaId]
      return { ...prev, iasAtivas: novasIAs }
    })
  }

  const salvarConfig = () => {
    setSalvando(true)
    setConfigChatColaborativo(config)
    
    setTimeout(() => {
      setSalvando(false)
      setSalvo(true)
      setTimeout(() => setSalvo(false), 2000)
    }, 500)
  }

  const resetar = () => {
    resetConfigChatColaborativo()
    setConfig(getConfigChatColaborativo())
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-52 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-purple-950 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 hover:bg-white/50 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-purple-500" />
              Configurações do Chat
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Controle as IAs do Coach de Clareza</p>
          </div>
        </div>

        {/* Card Principal */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-500" />
            Modo de Operação
          </h2>

          {/* Toggle Colaborativo */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl mb-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                Modo Colaborativo
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Múltiplas IAs analisam e respondem juntas
              </p>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, usarMultiplasIAs: !prev.usarMultiplasIAs }))}
              className={`p-2 rounded-lg transition-colors ${
                config.usarMultiplasIAs 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-400'
              }`}
            >
              {config.usarMultiplasIAs ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
            </button>
          </div>

          {/* Toggle Consenso */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl mb-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                Exigir Consenso
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Só responde se as IAs concordarem
              </p>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, exigirConsenso: !prev.exigirConsenso }))}
              className={`p-2 rounded-lg transition-colors ${
                config.exigirConsenso 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-400'
              }`}
            >
              {config.exigirConsenso ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
            </button>
          </div>

          {/* Toggle Transparência */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                Mostrar Transparência
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Exibe quais IAs foram usadas na resposta
              </p>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, mostrarTransparencia: !prev.mostrarTransparencia }))}
              className={`p-2 rounded-lg transition-colors ${
                config.mostrarTransparencia 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-400'
              }`}
            >
              {config.mostrarTransparencia ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* IAs Ativas */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-500" />
            IAs Ativas no Chat
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {IAS_DISPONIVEIS.map(ia => {
              const ativa = config.iasAtivas.includes(ia.id)
              return (
                <button
                  key={ia.id}
                  onClick={() => toggleIA(ia.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    ativa 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 dark:border-slate-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${ia.cor}`} />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{ia.nome}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{ia.descricao}</p>
                    </div>
                    {ativa && <CheckCircle className="h-5 w-5 text-purple-500" />}
                  </div>
                </button>
              )
            })}
          </div>

          {config.iasAtivas.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Selecione pelo menos uma IA para o chat funcionar
              </p>
            </div>
          )}
        </div>

        {/* Threshold de Consenso */}
        {config.exigirConsenso && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nível de Consenso Exigido
            </h2>
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.1"
              value={config.thresholdConsenso}
              onChange={(e) => setConfig(prev => ({ ...prev, thresholdConsenso: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span>50% (flexível)</span>
              <span className="font-medium text-purple-600">{(config.thresholdConsenso * 100).toFixed(0)}%</span>
              <span>100% (rígido)</span>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-4">
          <button
            onClick={resetar}
            className="flex-1 py-3 px-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Resetar Padrão
          </button>
          <button
            onClick={salvarConfig}
            disabled={salvando || config.iasAtivas.length === 0}
            className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {salvando ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : salvo ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {salvando ? 'Salvando...' : salvo ? 'Salvo!' : 'Salvar Configurações'}
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">💡 Como funciona</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>• <strong>Modo Colaborativo:</strong> Múltiplas IAs analisam a mensagem e geram uma resposta consolidada</li>
            <li>• <strong>Consenso:</strong> Se ativado, só responde quando as IAs concordam (mais seguro)</li>
            <li>• <strong>Transparência:</strong> Mostra ao usuário quais IAs participaram da resposta</li>
          </ul>
        </div>
      </div>
      </div>
    </div>
  )
}
