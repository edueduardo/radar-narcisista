'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Settings,
  Lightbulb,
  FileText,
  FolderOpen,
  BarChart3,
  Bot,
  Power,
  PowerOff,
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Image,
  Video,
  BookOpen,
  MessageSquare
} from 'lucide-react'
import EditSemaforoBadge, { SemaforoExplanation } from '@/components/admin/EditSemaforoBadge'
import type { CuradoriaConfig } from '@/lib/curadoria-config'

// ============================================================================
// ADMIN: PAINEL DE CURADORIA
// Central de controle da IA Curadora e semáforo de edição
// ETAPA 9: Painel de Curadoria + Semáforo de Edição
// ============================================================================

interface ContentCounts {
  suggestions_pending: number
  suggestions_total: number
  items_published: number
  items_draft: number
  collections_total: number
}

const CONTENT_TYPES = [
  { key: 'article', label: 'Artigos', icon: FileText },
  { key: 'faq', label: 'FAQs', icon: MessageSquare },
  { key: 'video', label: 'Vídeos', icon: Video },
  { key: 'story', label: 'Histórias', icon: BookOpen },
  { key: 'image', label: 'Imagens', icon: Image }
] as const

export default function CuradoriaPage() {
  const [config, setConfig] = useState<CuradoriaConfig | null>(null)
  const [counts, setCounts] = useState<ContentCounts | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar configuração e contagens
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Carregar config
      const configRes = await fetch('/api/admin/curadoria/config')
      if (configRes.ok) {
        const configData = await configRes.json()
        if (configData.success) {
          setConfig(configData.config)
        }
      }

      // Carregar contagens (via APIs existentes)
      const [suggestionsRes, itemsRes, collectionsRes] = await Promise.all([
        fetch('/api/admin/content/suggestions'),
        fetch('/api/admin/content/items'),
        fetch('/api/admin/content/collections')
      ])

      const suggestionsData = suggestionsRes.ok ? await suggestionsRes.json() : null
      const itemsData = itemsRes.ok ? await itemsRes.json() : null
      const collectionsData = collectionsRes.ok ? await collectionsRes.json() : null

      setCounts({
        suggestions_pending: suggestionsData?.data?.filter((s: any) => s.status === 'pending').length || 0,
        suggestions_total: suggestionsData?.data?.length || 0,
        items_published: itemsData?.data?.filter((i: any) => i.visibility === 'public').length || 0,
        items_draft: itemsData?.data?.filter((i: any) => i.visibility === 'draft').length || 0,
        collections_total: collectionsData?.data?.length || 0
      })
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados da curadoria')
    }

    setLoading(false)
  }

  const updateConfig = async (partialConfig: Partial<CuradoriaConfig>) => {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/curadoria/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialConfig)
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setConfig(data.config)
        } else {
          setError(data.error || 'Erro ao salvar')
        }
      } else {
        setError('Erro ao salvar configuração')
      }
    } catch (err) {
      setError('Erro de conexão')
    }

    setSaving(false)
  }

  const toggleEnabled = () => {
    if (config) {
      updateConfig({ enabled: !config.enabled })
    }
  }

  const toggleContentType = (type: string) => {
    if (config) {
      updateConfig({
        allowed_types: {
          ...config.allowed_types,
          [type]: !config.allowed_types[type as keyof typeof config.allowed_types]
        }
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded" />
            <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Settings className="w-7 h-7 text-purple-600" />
                Painel de Curadoria
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Central de controle da IA Curadora e FanPage Viva
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* Erro */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Grid principal */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Bloco 1: Resumo da Curadoria */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Resumo da Curadoria
              </h2>
              <EditSemaforoBadge
                level={config?.enabled ? 'green' : 'red'}
                label={config?.enabled ? 'IA Curadora LIGADA' : 'IA Curadora DESLIGADA'}
                description={config?.enabled 
                  ? 'A IA Curadora está ativa e pode ser acionada manualmente.'
                  : 'A IA Curadora está desligada. Ative para usar.'
                }
              />
            </div>

            {/* Contadores */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Sugestões Pendentes</span>
                </div>
                <p className="text-3xl font-bold text-yellow-800 dark:text-yellow-300">
                  {counts?.suggestions_pending || 0}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Publicados</span>
                </div>
                <p className="text-3xl font-bold text-green-800 dark:text-green-300">
                  {counts?.items_published || 0}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Coleções (Academy)</span>
                </div>
                <p className="text-3xl font-bold text-blue-800 dark:text-blue-300">
                  {counts?.collections_total || 0}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Rascunhos</span>
                </div>
                <p className="text-3xl font-bold text-purple-800 dark:text-purple-300">
                  {counts?.items_draft || 0}
                </p>
              </div>
            </div>

            {/* Links rápidos */}
            <div className="space-y-2">
              <Link
                href="/admin/conteudos/sugestoes"
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Ir para Sugestões</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>

              <Link
                href="/admin/conteudos/publicados"
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Ir para Conteúdos Publicados</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>

              <Link
                href="/admin/conteudos/colecoes"
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Ir para Academy</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>

              <Link
                href="/admin/conteudos/insights"
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Ver Radar em Números</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Bloco 2: Configuração da IA Curadora */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <Bot className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Configuração da IA Curadora
              </h2>
            </div>

            {/* Switch principal */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {config?.enabled ? (
                    <Power className="w-6 h-6 text-green-600" />
                  ) : (
                    <PowerOff className="w-6 h-6 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Ativar IA Curadora
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Permite usar a IA para sugerir conteúdo (sempre manual)
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleEnabled}
                  disabled={saving}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    config?.enabled 
                      ? 'bg-green-500' 
                      : 'bg-gray-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      config?.enabled ? 'left-8' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Tipos de conteúdo permitidos */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Tipos de Conteúdo Permitidos
              </h3>
              <div className="space-y-2">
                {CONTENT_TYPES.map(({ key, label, icon: Icon }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{label}</span>
                    </div>
                    <button
                      onClick={() => toggleContentType(key)}
                      disabled={saving || !config?.enabled}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        config?.allowed_types[key as keyof typeof config.allowed_types]
                          ? 'bg-purple-500'
                          : 'bg-gray-300 dark:bg-slate-600'
                      } ${!config?.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          config?.allowed_types[key as keyof typeof config.allowed_types] ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Nota */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                <strong>Importante:</strong> A IA Curadora NUNCA roda automaticamente. 
                Ela só é acionada quando você clica em "Pedir IA Curadora" nas telas de sugestões.
              </p>
            </div>
          </div>
        </div>

        {/* Bloco 3: Explicação do Semáforo */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <SemaforoExplanation />
          
          {/* Tabela de módulos */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              Recomendação por Módulo
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Módulo</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Zona</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  <tr>
                    <td className="py-2 px-3 text-gray-900 dark:text-white">Conteúdos Publicados / FanPage Viva</td>
                    <td className="py-2 px-3"><EditSemaforoBadge level="green" size="sm" showInfo={false} /></td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">Textos, FAQs, Radar no Mundo, Academy</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-900 dark:text-white">Sugestões da IA Curadora</td>
                    <td className="py-2 px-3"><EditSemaforoBadge level="yellow" size="sm" showInfo={false} /></td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">Revisar antes de publicar</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-900 dark:text-white">Radar em Números (Insights)</td>
                    <td className="py-2 px-3"><EditSemaforoBadge level="yellow" size="sm" showInfo={false} /></td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">Métricas derivadas de dados reais</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-900 dark:text-white">Frontpage - Planos & Preços</td>
                    <td className="py-2 px-3"><EditSemaforoBadge level="yellow" size="sm" showInfo={false} /></td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">Textos comerciais sensíveis</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-900 dark:text-white">Triângulo (Clareza ⇄ Diário ⇄ Chat)</td>
                    <td className="py-2 px-3"><EditSemaforoBadge level="red" size="sm" showInfo={false} /></td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">Fluxos críticos do MVP</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-900 dark:text-white">Plano de Segurança</td>
                    <td className="py-2 px-3"><EditSemaforoBadge level="red" size="sm" showInfo={false} /></td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">Lógica de risco e proteção</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-900 dark:text-white">Prompts de IA / Guardrails</td>
                    <td className="py-2 px-3"><EditSemaforoBadge level="red" size="sm" showInfo={false} /></td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">Ética e limites do sistema</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-900 dark:text-white">Botão de Emergência / 190/188</td>
                    <td className="py-2 px-3"><EditSemaforoBadge level="red" size="sm" showInfo={false} /></td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">Segurança crítica</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
