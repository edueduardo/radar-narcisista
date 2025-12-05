'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Settings,
  BarChart3,
  MessageSquare,
  Globe,
  BookOpen,
  TrendingUp,
  Users,
  RefreshCw,
  GripVertical,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

// ============================================================================
// ADMIN: CONFIGURAÇÃO DA FANPAGE
// Configura blocos dinâmicos da frontpage
// ============================================================================

interface FanpageBlock {
  id: string
  key: string
  title: string
  description: string
  icon: string
  enabled: boolean
  order: number
  maxItems: number
  refreshInterval: number // em minutos, 0 = manual
  source: 'internal' | 'external' | 'mixed'
  config: Record<string, any>
}

const DEFAULT_BLOCKS: FanpageBlock[] = [
  {
    id: '1',
    key: 'radar_numeros',
    title: 'Radar em Números',
    description: 'Estatísticas agregadas anônimas do sistema',
    icon: '📊',
    enabled: true,
    order: 1,
    maxItems: 4,
    refreshInterval: 60,
    source: 'internal',
    config: {
      showTotalUsers: true,
      showTotalTests: true,
      showAverageScore: true,
      showActiveToday: true
    }
  },
  {
    id: '2',
    key: 'faq_dinamico',
    title: 'Perguntas Frequentes',
    description: 'FAQ dinâmico baseado em perguntas reais do chat',
    icon: '❓',
    enabled: true,
    order: 2,
    maxItems: 5,
    refreshInterval: 1440, // 24h
    source: 'internal',
    config: {
      minOccurrences: 3,
      showCategories: true
    }
  },
  {
    id: '3',
    key: 'radar_mundo',
    title: 'Radar no Mundo',
    description: 'Notícias e conteúdos externos curados',
    icon: '🌍',
    enabled: true,
    order: 3,
    maxItems: 4,
    refreshInterval: 720, // 12h
    source: 'external',
    config: {
      showSource: true,
      showDate: true,
      types: ['news', 'article', 'study']
    }
  },
  {
    id: '4',
    key: 'radar_academy',
    title: 'Radar Academy',
    description: 'Trilhas de aprendizado e conteúdo educativo',
    icon: '🎓',
    enabled: false,
    order: 4,
    maxItems: 3,
    refreshInterval: 0,
    source: 'internal',
    config: {
      showProgress: true,
      showDuration: true
    }
  },
  {
    id: '5',
    key: 'depoimentos',
    title: 'Histórias de Superação',
    description: 'Depoimentos anônimos aprovados',
    icon: '💜',
    enabled: true,
    order: 5,
    maxItems: 3,
    refreshInterval: 0,
    source: 'internal',
    config: {
      requireApproval: true,
      anonymize: true
    }
  },
  {
    id: '6',
    key: 'clima_emocional',
    title: 'Clima Emocional do Radar',
    description: 'Temperatura agregada do dia',
    icon: '🌡️',
    enabled: false,
    order: 6,
    maxItems: 1,
    refreshInterval: 60,
    source: 'internal',
    config: {
      showTrend: true,
      showComparison: false
    }
  }
]

export default function FanpageConfigPage() {
  const [blocks, setBlocks] = useState<FanpageBlock[]>(DEFAULT_BLOCKS)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedBlock, setSelectedBlock] = useState<FanpageBlock | null>(null)
  const supabase = createClient()

  // Carregar configuração do banco
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    try {
      // Tentar carregar do localStorage primeiro (fallback)
      const saved = localStorage.getItem('fanpage_config')
      if (saved) {
        setBlocks(JSON.parse(saved))
      }
      
      // TODO: Carregar do banco quando tabela existir
      // const { data } = await supabase.from('fanpage_config').select('*')
    } catch (error) {
      console.error('Erro ao carregar config:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      // Salvar no localStorage (fallback)
      localStorage.setItem('fanpage_config', JSON.stringify(blocks))
      
      // TODO: Salvar no banco quando tabela existir
      // await supabase.from('fanpage_config').upsert(...)
      
      setMessage('✅ Configuração salva com sucesso!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setMessage('❌ Erro ao salvar configuração')
    } finally {
      setSaving(false)
    }
  }

  const toggleBlock = (id: string) => {
    setBlocks(prev => prev.map(b => 
      b.id === id ? { ...b, enabled: !b.enabled } : b
    ))
  }

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id)
    if (index === -1) return
    
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= blocks.length) return
    
    const newBlocks = [...blocks]
    const temp = newBlocks[index].order
    newBlocks[index].order = newBlocks[newIndex].order
    newBlocks[newIndex].order = temp
    
    newBlocks.sort((a, b) => a.order - b.order)
    setBlocks(newBlocks)
  }

  const updateBlockConfig = (id: string, key: string, value: any) => {
    setBlocks(prev => prev.map(b => 
      b.id === id ? { ...b, [key]: value } : b
    ))
  }

  const enabledCount = blocks.filter(b => b.enabled).length

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin"
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-400" />
                  Configuração da Fanpage
                </h1>
                <p className="text-sm text-slate-400">
                  Configure os blocos dinâmicos da frontpage
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
              >
                <Eye className="h-4 w-4" />
                Ver Frontpage
              </Link>
              <button
                onClick={saveConfig}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mensagem */}
      {message && (
        <div className="mx-6 mt-4 p-4 rounded-lg bg-slate-800 border border-slate-700 text-center">
          {message}
        </div>
      )}

      {/* Conteúdo */}
      <div className="p-6">
        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{blocks.length}</p>
                <p className="text-sm text-slate-400">Blocos Total</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Eye className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enabledCount}</p>
                <p className="text-sm text-slate-400">Ativos</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Globe className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {blocks.filter(b => b.source === 'external').length}
                </p>
                <p className="text-sm text-slate-400">Externos</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <RefreshCw className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {blocks.filter(b => b.refreshInterval > 0).length}
                </p>
                <p className="text-sm text-slate-400">Auto-refresh</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Blocos */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold">Blocos da Frontpage</h2>
            <p className="text-sm text-slate-400">
              Arraste para reordenar, clique para configurar
            </p>
          </div>

          <div className="divide-y divide-slate-800">
            {blocks.sort((a, b) => a.order - b.order).map((block, index) => (
              <div
                key={block.id}
                className={`p-4 hover:bg-slate-800/50 transition-colors ${
                  !block.enabled ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Drag Handle */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveBlock(block.id, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-slate-700 rounded disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveBlock(block.id, 'down')}
                      disabled={index === blocks.length - 1}
                      className="p-1 hover:bg-slate-700 rounded disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Icon */}
                  <div className="text-3xl">{block.icon}</div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{block.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        block.source === 'internal' 
                          ? 'bg-blue-500/20 text-blue-400'
                          : block.source === 'external'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {block.source}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{block.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>Max: {block.maxItems} itens</span>
                      <span>
                        Refresh: {block.refreshInterval === 0 
                          ? 'Manual' 
                          : `${block.refreshInterval}min`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedBlock(block)}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleBlock(block.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        block.enabled
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {block.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal de Configuração */}
        {selectedBlock && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg mx-4">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span>{selectedBlock.icon}</span>
                  {selectedBlock.title}
                </h3>
                <button
                  onClick={() => setSelectedBlock(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 space-y-4">
                {/* Max Items */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Máximo de Itens
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={selectedBlock.maxItems}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      updateBlockConfig(selectedBlock.id, 'maxItems', value)
                      setSelectedBlock({ ...selectedBlock, maxItems: value })
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  />
                </div>

                {/* Refresh Interval */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Intervalo de Atualização (minutos)
                  </label>
                  <select
                    value={selectedBlock.refreshInterval}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      updateBlockConfig(selectedBlock.id, 'refreshInterval', value)
                      setSelectedBlock({ ...selectedBlock, refreshInterval: value })
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  >
                    <option value="0">Manual</option>
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="360">6 horas</option>
                    <option value="720">12 horas</option>
                    <option value="1440">24 horas</option>
                  </select>
                </div>

                {/* Config específica */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Configuração Avançada (JSON)
                  </label>
                  <textarea
                    value={JSON.stringify(selectedBlock.config, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value)
                        updateBlockConfig(selectedBlock.id, 'config', config)
                        setSelectedBlock({ ...selectedBlock, config })
                      } catch {}
                    }}
                    rows={6}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
              <div className="p-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedBlock(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
