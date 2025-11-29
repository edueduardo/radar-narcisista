'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFrontpage } from '@/components/FrontpageManager'
import AdminSidebar from '@/components/AdminSidebar'
import { Plus, ExternalLink, Settings, Trash2, Play, Pause, BarChart3, Globe, Zap, FileCode, Search, Copy, Check, Edit3, Save, X, Activity, Shield, Eye, AlertTriangle, TrendingUp } from 'lucide-react'

function FrontpageManagerContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const {
    frontpages,
    loading,
    testMode,
    setTestMode,
    addFrontpage,
    updateFrontpage,
    deleteFrontpage,
    toggleFrontpage,
    getSelectedFrontpage
  } = useFrontpage()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    platform: 'local' as 'local' | 'lovable' | 'vercel' | 'custom',
    version: 'A',
    weight: 50
  })
  
  // SEO States - inicializa com o parâmetro da URL se existir
  const [activeTab, setActiveTab] = useState<'frontpages' | 'seo' | 'analytics'>('frontpages')
  
  // Atualizar tab quando o parâmetro da URL mudar
  useEffect(() => {
    if (tabParam === 'seo' || tabParam === 'analytics' || tabParam === 'frontpages') {
      setActiveTab(tabParam)
    }
  }, [tabParam])
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [editingSEO, setEditingSEO] = useState<string | null>(null)
  
  // Analytics & Tracking Data
  const [analyticsTools, setAnalyticsTools] = useState([
    { id: 'ga4', name: 'Google Analytics 4', icon: '📊', enabled: true, trackingId: 'G-XXXXXXXXXX', category: 'analytics', lgpdRequired: true },
    { id: 'gsc', name: 'Google Search Console', icon: '🔍', enabled: true, trackingId: '', category: 'seo', lgpdRequired: false },
    { id: 'meta', name: 'Meta Pixel (Facebook/Instagram)', icon: '📘', enabled: false, trackingId: '', category: 'ads', lgpdRequired: true },
    { id: 'gads', name: 'Google Ads', icon: '📢', enabled: false, trackingId: '', category: 'ads', lgpdRequired: true },
    { id: 'clarity', name: 'Microsoft Clarity', icon: '🔥', enabled: true, trackingId: '', category: 'heatmap', lgpdRequired: true },
    { id: 'hotjar', name: 'Hotjar', icon: '🎯', enabled: false, trackingId: '', category: 'heatmap', lgpdRequired: true },
    { id: 'sentry', name: 'Sentry (Erros)', icon: '🐛', enabled: true, trackingId: '', category: 'monitoring', lgpdRequired: false },
    { id: 'uptime', name: 'UptimeRobot', icon: '⏱️', enabled: true, trackingId: '', category: 'monitoring', lgpdRequired: false },
    { id: 'plausible', name: 'Plausible (Privacidade)', icon: '🔒', enabled: false, trackingId: '', category: 'analytics', lgpdRequired: false },
    { id: 'vercel', name: 'Vercel Analytics', icon: '▲', enabled: true, trackingId: '', category: 'monitoring', lgpdRequired: false },
  ])
  
  const [ga4Events, setGa4Events] = useState([
    { name: 'view_home', description: 'Carregou a home', enabled: true, category: 'pageview' },
    { name: 'click_start_test', description: 'Clicou em "Fazer Teste de Clareza"', enabled: true, category: 'engagement' },
    { name: 'start_test', description: 'Começou o teste (pergunta 1)', enabled: true, category: 'conversion' },
    { name: 'complete_test', description: 'Terminou o teste', enabled: true, category: 'conversion' },
    { name: 'view_result_basic', description: 'Viu resultado gratuito', enabled: true, category: 'conversion' },
    { name: 'view_result_premium_cta', description: 'Viu oferta de upgrade', enabled: true, category: 'conversion' },
    { name: 'sign_up', description: 'Criou conta', enabled: true, category: 'conversion' },
    { name: 'start_diary_entry', description: 'Começou registro no diário', enabled: true, category: 'engagement' },
    { name: 'save_diary_entry', description: 'Salvou registro no diário', enabled: true, category: 'engagement' },
    { name: 'start_chat', description: 'Abriu o Coach IA', enabled: true, category: 'engagement' },
    { name: 'change_theme', description: 'Trocou tema (acessibilidade)', enabled: true, category: 'ux' },
  ])
  
  const [lgpdSettings, setLgpdSettings] = useState({
    bannerEnabled: true,
    essentialOnly: false,
    analyticsDefault: false,
    marketingDefault: false,
    heatmapOnlyPublic: true,
    noTrackingLoggedIn: true,
    blockedPaths: ['/dashboard', '/diario', '/chat', '/relatorios', '/plano-seguranca']
  })
  
  // Custom Code Injection
  const [headCode, setHeadCode] = useState(`<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

<!-- Meta Pixel Code -->
<!-- Cole seu código do Meta Pixel aqui -->`)
  
  const [footCode, setFootCode] = useState(`<!-- Microsoft Clarity -->
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    // Cole seu código do Clarity aqui
  })(window, document, "clarity", "script", "XXXXXXXXXX");
</script>

<!-- Outros scripts de rodapé -->`)
  
  const [headCodeSaved, setHeadCodeSaved] = useState(false)
  const [footCodeSaved, setFootCodeSaved] = useState(false)
  const [headCodeTemp, setHeadCodeTemp] = useState('')
  const [footCodeTemp, setFootCodeTemp] = useState('')
  
  // Inicializar temps com valores salvos
  useEffect(() => {
    setHeadCodeTemp(headCode)
    setFootCodeTemp(footCode)
  }, [])
  
  const saveHeadCode = () => {
    setHeadCode(headCodeTemp)
    setHeadCodeSaved(true)
    setTimeout(() => setHeadCodeSaved(false), 2000)
  }
  
  const saveFootCode = () => {
    setFootCode(footCodeTemp)
    setFootCodeSaved(true)
    setTimeout(() => setFootCodeSaved(false), 2000)
  }
  
  const clearHeadCode = () => {
    if (confirm('Tem certeza que deseja limpar o código do HEAD?')) {
      setHeadCodeTemp('')
      setHeadCode('')
    }
  }
  
  const clearFootCode = () => {
    if (confirm('Tem certeza que deseja limpar o código do FOOTER?')) {
      setFootCodeTemp('')
      setFootCode('')
    }
  }
  
  // SEO Data
  const [sitemapPages, setSitemapPages] = useState([
    { url: '/', priority: 1, frequency: 'daily', enabled: true },
    { url: '/login', priority: 0.7, frequency: 'monthly', enabled: true },
    { url: '/cadastro', priority: 0.7, frequency: 'monthly', enabled: true },
    { url: '/teste-clareza', priority: 0.9, frequency: 'weekly', enabled: true },
    { url: '/planos', priority: 0.8, frequency: 'weekly', enabled: true },
    { url: '/blog', priority: 0.8, frequency: 'daily', enabled: true },
    { url: '/educacao', priority: 0.7, frequency: 'weekly', enabled: true },
    { url: '/gaslighting', priority: 0.7, frequency: 'monthly', enabled: true },
    { url: '/love-bombing', priority: 0.7, frequency: 'monthly', enabled: true },
    { url: '/triangulacao', priority: 0.7, frequency: 'monthly', enabled: true },
    { url: '/ciclo-abuso', priority: 0.7, frequency: 'monthly', enabled: true },
    { url: '/faq', priority: 0.6, frequency: 'monthly', enabled: true },
    { url: '/contato', priority: 0.5, frequency: 'monthly', enabled: true },
    { url: '/privacidade', priority: 0.3, frequency: 'yearly', enabled: true },
    { url: '/termos', priority: 0.3, frequency: 'yearly', enabled: true },
  ])
  
  const [robotsRules, setRobotsRules] = useState([
    { path: '/api/', blocked: true },
    { path: '/admin/', blocked: true },
    { path: '/dashboard/', blocked: true },
    { path: '/diario/', blocked: true },
    { path: '/chat/', blocked: true },
    { path: '/configuracoes/', blocked: true },
    { path: '/relatorios/', blocked: true },
  ])
  
  const [blockedBots, setBlockedBots] = useState([
    { name: 'GPTBot', blocked: true },
    { name: 'ChatGPT-User', blocked: true },
    { name: 'CCBot', blocked: true },
    { name: 'Google-Extended', blocked: false },
  ])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedItem(id)
    setTimeout(() => setCopiedItem(null), 2000)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      platform: 'local',
      version: 'A',
      weight: 50
    })
    setEditingId(null)
    setShowAddForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateFrontpage(editingId, formData)
      } else {
        await addFrontpage({
          ...formData,
          isActive: false,
          isExternal: formData.platform !== 'local'
        })
      }
      resetForm()
    } catch (error) {
      alert('Erro ao salvar frontpage: ' + error)
    }
  }

  const handleEdit = (fp: any) => {
    setFormData({
      name: fp.name,
      url: fp.url,
      platform: fp.platform,
      version: fp.version,
      weight: fp.weight
    })
    setEditingId(fp.id)
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta frontpage?')) {
      try {
        await deleteFrontpage(id)
      } catch (error) {
        alert('Erro ao deletar: ' + error)
      }
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await toggleFrontpage(id)
    } catch (error) {
      alert('Erro ao alternar: ' + error)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'lovable': return '💜'
      case 'vercel': return '▲'
      case 'custom': return '🔗'
      default: return '🏠'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'lovable': return 'text-purple-400 bg-purple-900/20'
      case 'vercel': return 'text-gray-400 bg-gray-900/20'
      case 'custom': return 'text-blue-400 bg-blue-900/20'
      default: return 'text-green-400 bg-green-900/20'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-52 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Carregando configurações...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-52 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Globe className="w-8 h-8 text-purple-400" />
            Frontpage Manager
          </h1>
          <p className="text-slate-400">
            Gerencie múltiplas frontpages, configure URLs externas e execute testes A/B/C
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('frontpages')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'frontpages'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            Frontpages
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'seo'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Search className="w-4 h-4" />
            SEO & Indexação
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            Analytics & LGPD
          </button>
        </div>

        {/* TAB: FRONTPAGES */}
        {activeTab === 'frontpages' && (
        <>
        {/* Controle de Teste */}
        <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Modo de Teste
          </h2>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setTestMode('single')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                testMode === 'single'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Única Frontpage
            </button>
            <button
              onClick={() => setTestMode('ab')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                testMode === 'ab'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Teste A/B
            </button>
            <button
              onClick={() => setTestMode('abc')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                testMode === 'abc'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Teste A/B/C
            </button>
          </div>

          <div className="text-sm text-slate-400">
            {testMode === 'single' && 'Apenas uma frontpage será exibida para todos os visitantes.'}
            {testMode === 'ab' && 'Duas frontpages ativas serão divididas aleatoriamente (50/50).'}
            {testMode === 'abc' && 'Três frontpages ativas serão divididas baseadas nos pesos configurados.'}
          </div>
        </div>

        {/* Lista de Frontpages */}
        <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Frontpages Configuradas
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Frontpage
            </button>
          </div>

          {frontpages.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma frontpage configurada ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {frontpages.map((fp) => (
                <div
                  key={fp.id}
                  className={`border rounded-lg p-4 transition-all ${
                    fp.isActive
                      ? 'border-purple-500 bg-purple-950/20'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPlatformColor(fp.platform)}`}>
                        {getPlatformIcon(fp.platform)} {fp.platform.toUpperCase()}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-white">{fp.name}</h3>
                        {fp.isExternal && fp.url && (
                          <a
                            href={fp.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {fp.url}
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">
                          Versão {fp.version}
                        </span>
                        {testMode !== 'single' && (
                          <span className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">
                            {fp.weight}% peso
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {fp.isActive && (
                        <div className="flex items-center gap-1 text-green-400 text-sm">
                          <Zap className="w-4 h-4" />
                          Ativa
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleToggle(fp.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          fp.isActive
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        }`}
                        title={fp.isActive ? 'Desativar' : 'Ativar'}
                      >
                        {fp.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleEdit(fp)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Settings className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(fp.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulário de Adição/Edição */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-700">
              <h3 className="text-xl font-semibold mb-4">
                {editingId ? 'Editar Frontpage' : 'Adicionar Frontpage'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="Ex: Frontpage Lovable"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Plataforma</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="local">🏠 Local (Padrão)</option>
                    <option value="lovable">💜 Lovable</option>
                    <option value="vercel">▲ Vercel</option>
                    <option value="custom">🔗 URL Customizada</option>
                  </select>
                </div>

                {formData.platform !== 'local' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">URL Externa</label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="https://sua-frontpage.com"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Versão</label>
                    <select
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="A">Versão A</option>
                      <option value="B">Versão B</option>
                      <option value="C">Versão C</option>
                    </select>
                  </div>

                  {testMode !== 'single' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Peso (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {editingId ? 'Atualizar' : 'Adicionar'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </>
        )}

        {/* TAB: SEO & INDEXAÇÃO */}
        {activeTab === 'seo' && (
        <>
          {/* Sitemap.xml */}
          <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileCode className="w-5 h-5 text-green-400" />
                Sitemap.xml
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(sitemapPages.filter(p => p.enabled).map(p => p.url).join('\n'), 'sitemap')}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-1"
                >
                  {copiedItem === 'sitemap' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  Copiar URLs
                </button>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver Sitemap
                </a>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sitemapPages.map((page, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${page.enabled ? 'bg-slate-800' : 'bg-slate-800/50 opacity-50'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={page.enabled}
                      onChange={() => {
                        const updated = [...sitemapPages]
                        updated[idx].enabled = !updated[idx].enabled
                        setSitemapPages(updated)
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <code className="text-purple-400 text-sm">{page.url}</code>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Prioridade: {page.priority}</span>
                    <span>Freq: {page.frequency}</span>
                    <button
                      onClick={() => {
                        const updated = sitemapPages.filter((_, i) => i !== idx)
                        setSitemapPages(updated)
                      }}
                      className="p-1 hover:bg-red-600 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700">
              <button
                onClick={() => {
                  const url = prompt('Digite a URL (ex: /nova-pagina):')
                  if (url) {
                    setSitemapPages([...sitemapPages, { url, priority: 0.7, frequency: 'monthly', enabled: true }])
                  }
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Página
              </button>
            </div>
          </div>

          {/* Robots.txt */}
          <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileCode className="w-5 h-5 text-orange-400" />
                Robots.txt - Páginas Bloqueadas
              </h2>
              <a
                href="/robots.txt"
                target="_blank"
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                Ver Robots
              </a>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Caminhos Bloqueados</h3>
                <div className="space-y-2">
                  {robotsRules.map((rule, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={rule.blocked}
                          onChange={() => {
                            const updated = [...robotsRules]
                            updated[idx].blocked = !updated[idx].blocked
                            setRobotsRules(updated)
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <code className="text-red-400 text-sm">{rule.path}</code>
                      </div>
                      <button
                        onClick={() => setRobotsRules(robotsRules.filter((_, i) => i !== idx))}
                        className="p-1 hover:bg-red-600 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const path = prompt('Digite o caminho (ex: /nova-area/):')
                      if (path) {
                        setRobotsRules([...robotsRules, { path, blocked: true }])
                      }
                    }}
                    className="w-full px-3 py-2 border border-dashed border-slate-600 rounded-lg text-sm text-slate-400 hover:border-purple-500 hover:text-purple-400"
                  >
                    + Adicionar Caminho
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Bots Bloqueados</h3>
                <div className="space-y-2">
                  {blockedBots.map((bot, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={bot.blocked}
                          onChange={() => {
                            const updated = [...blockedBots]
                            updated[idx].blocked = !updated[idx].blocked
                            setBlockedBots(updated)
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span className={bot.blocked ? 'text-red-400' : 'text-green-400'}>{bot.name}</span>
                      </div>
                      <span className="text-xs text-slate-500">{bot.blocked ? 'Bloqueado' : 'Permitido'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Meta Tags */}
          <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <FileCode className="w-5 h-5 text-blue-400" />
              Meta Tags (Open Graph)
            </h2>

            <div className="grid gap-4">
              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-slate-300">og:title</span>
                  <button
                    onClick={() => copyToClipboard('Radar Narcisista - Encontre Clareza em Relacionamentos', 'og-title')}
                    className="p-1 hover:bg-slate-700 rounded"
                  >
                    {copiedItem === 'og-title' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <code className="text-purple-400 text-sm">Radar Narcisista - Encontre Clareza em Relacionamentos</code>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-slate-300">og:description</span>
                  <button
                    onClick={() => copyToClipboard('Ferramenta de apoio para identificar padrões de abuso narcisista e encontrar clareza emocional.', 'og-desc')}
                    className="p-1 hover:bg-slate-700 rounded"
                  >
                    {copiedItem === 'og-desc' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <code className="text-purple-400 text-sm">Ferramenta de apoio para identificar padrões de abuso narcisista e encontrar clareza emocional.</code>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-slate-300">og:image</span>
                  <button
                    onClick={() => copyToClipboard('/og-image.png', 'og-image')}
                    className="p-1 hover:bg-slate-700 rounded"
                  >
                    {copiedItem === 'og-image' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <code className="text-purple-400 text-sm">/og-image.png</code>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-slate-300">Canonical URL</span>
                </div>
                <code className="text-purple-400 text-sm">https://radarnarcisista.com.br</code>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4">
              ⚠️ Para alterar as meta tags, edite o arquivo <code className="text-purple-400">app/layout.tsx</code>
            </p>
          </div>
        </>
        )}

        {/* TAB: ANALYTICS & LGPD */}
        {activeTab === 'analytics' && (
        <>
          {/* Ferramentas de Analytics */}
          <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              Ferramentas de Tracking
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {['analytics', 'ads', 'heatmap', 'monitoring', 'seo'].map(category => (
                <div key={category} className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-400 capitalize mb-2">
                    {category === 'analytics' ? '📊 Analytics' : 
                     category === 'ads' ? '📢 Pixels de Anúncio' :
                     category === 'heatmap' ? '🔥 Mapas de Calor' :
                     category === 'monitoring' ? '⚙️ Monitoramento' : '🔍 SEO'}
                  </h3>
                  {analyticsTools.filter(t => t.category === category).map(tool => (
                    <div key={tool.id} className={`flex items-center justify-between p-3 rounded-lg ${tool.enabled ? 'bg-slate-800' : 'bg-slate-800/50'}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={tool.enabled}
                          onChange={() => {
                            const updated = analyticsTools.map(t => 
                              t.id === tool.id ? {...t, enabled: !t.enabled} : t
                            )
                            setAnalyticsTools(updated)
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-lg">{tool.icon}</span>
                        <div>
                          <span className={tool.enabled ? 'text-white' : 'text-slate-500'}>{tool.name}</span>
                          {tool.lgpdRequired && (
                            <span className="ml-2 text-xs bg-yellow-600/20 text-yellow-400 px-1.5 py-0.5 rounded">LGPD</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {tool.trackingId && (
                          <code className="text-xs text-purple-400 bg-slate-700 px-2 py-1 rounded">{tool.trackingId}</code>
                        )}
                        <button
                          onClick={() => {
                            const newId = prompt(`ID de tracking para ${tool.name}:`, tool.trackingId)
                            if (newId !== null) {
                              const updated = analyticsTools.map(t => 
                                t.id === tool.id ? {...t, trackingId: newId} : t
                              )
                              setAnalyticsTools(updated)
                            }
                          }}
                          className="p-1.5 hover:bg-slate-700 rounded"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Eventos GA4 */}
          <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Eventos GA4 (Funil de Conversão)
              </h2>
              <button
                onClick={() => copyToClipboard(ga4Events.filter(e => e.enabled).map(e => e.name).join(', '), 'ga4-events')}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-1"
              >
                {copiedItem === 'ga4-events' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                Copiar Eventos
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {ga4Events.map((event, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${event.enabled ? 'bg-slate-800' : 'bg-slate-800/50 opacity-60'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={event.enabled}
                      onChange={() => {
                        const updated = [...ga4Events]
                        updated[idx].enabled = !updated[idx].enabled
                        setGa4Events(updated)
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <code className="text-purple-400 text-sm font-mono">{event.name}</code>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{event.description}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      event.category === 'conversion' ? 'bg-green-600/20 text-green-400' :
                      event.category === 'engagement' ? 'bg-blue-600/20 text-blue-400' :
                      event.category === 'pageview' ? 'bg-purple-600/20 text-purple-400' :
                      'bg-slate-600/20 text-slate-400'
                    }`}>
                      {event.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700">
              <button
                onClick={() => {
                  const name = prompt('Nome do evento (ex: click_cta):')
                  const desc = prompt('Descrição:')
                  if (name && desc) {
                    setGa4Events([...ga4Events, { name, description: desc, enabled: true, category: 'engagement' }])
                  }
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Evento
              </button>
            </div>
          </div>

          {/* LGPD & Privacidade */}
          <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-yellow-400" />
              LGPD & Privacidade
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-400">Configurações do Banner</h3>
                
                <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer">
                  <span>Banner de Consentimento</span>
                  <input
                    type="checkbox"
                    checked={lgpdSettings.bannerEnabled}
                    onChange={() => setLgpdSettings({...lgpdSettings, bannerEnabled: !lgpdSettings.bannerEnabled})}
                    className="w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer">
                  <span>Analytics pré-marcado</span>
                  <input
                    type="checkbox"
                    checked={lgpdSettings.analyticsDefault}
                    onChange={() => setLgpdSettings({...lgpdSettings, analyticsDefault: !lgpdSettings.analyticsDefault})}
                    className="w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer">
                  <span>Marketing pré-marcado</span>
                  <input
                    type="checkbox"
                    checked={lgpdSettings.marketingDefault}
                    onChange={() => setLgpdSettings({...lgpdSettings, marketingDefault: !lgpdSettings.marketingDefault})}
                    className="w-4 h-4 rounded"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-400">Proteção de Dados Sensíveis</h3>
                
                <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer">
                  <div>
                    <span>Heatmap só em páginas públicas</span>
                    <p className="text-xs text-slate-500">Clarity/Hotjar desativado em áreas privadas</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={lgpdSettings.heatmapOnlyPublic}
                    onChange={() => setLgpdSettings({...lgpdSettings, heatmapOnlyPublic: !lgpdSettings.heatmapOnlyPublic})}
                    className="w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer">
                  <div>
                    <span>Sem tracking para logados</span>
                    <p className="text-xs text-slate-500">Não rastrear usuários autenticados</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={lgpdSettings.noTrackingLoggedIn}
                    onChange={() => setLgpdSettings({...lgpdSettings, noTrackingLoggedIn: !lgpdSettings.noTrackingLoggedIn})}
                    className="w-4 h-4 rounded"
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Caminhos Bloqueados (sem gravação)</h3>
              <div className="flex flex-wrap gap-2">
                {lgpdSettings.blockedPaths.map((path, idx) => (
                  <span key={idx} className="flex items-center gap-1 bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-sm">
                    {path}
                    <button
                      onClick={() => {
                        const updated = lgpdSettings.blockedPaths.filter((_, i) => i !== idx)
                        setLgpdSettings({...lgpdSettings, blockedPaths: updated})
                      }}
                      className="hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => {
                    const path = prompt('Caminho a bloquear (ex: /nova-area):')
                    if (path) {
                      setLgpdSettings({...lgpdSettings, blockedPaths: [...lgpdSettings.blockedPaths, path]})
                    }
                  }}
                  className="px-3 py-1 border border-dashed border-slate-600 rounded-full text-sm text-slate-400 hover:border-purple-500"
                >
                  + Adicionar
                </button>
              </div>
            </div>
          </div>

          {/* Resumo & Recomendações */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-800/50">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Kit Mínimo Recomendado
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h4 className="font-medium text-green-400 mb-2">✅ Essencial</h4>
                <ul className="space-y-1 text-slate-300">
                  <li>• GA4 com eventos de funil</li>
                  <li>• Search Console</li>
                  <li>• Sentry (erros)</li>
                  <li>• UptimeRobot</li>
                </ul>
              </div>
              
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-400 mb-2">📈 Crescimento</h4>
                <ul className="space-y-1 text-slate-300">
                  <li>• Meta Pixel</li>
                  <li>• Google Ads</li>
                  <li>• Clarity (heatmap)</li>
                </ul>
              </div>
              
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-400 mb-2">⚠️ Cuidados LGPD</h4>
                <ul className="space-y-1 text-slate-300">
                  <li>• Banner de consentimento</li>
                  <li>• Sem tracking em áreas sensíveis</li>
                  <li>• Blur em inputs de texto</li>
                  <li>• Política de privacidade clara</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-400">
                <strong className="text-yellow-400">⚠️ IMPORTANTE:</strong> Por ser um tema sensível (abuso narcisista), 
                <strong className="text-white"> NÃO rastreie</strong> nada que identifique pessoa logada dentro da área autenticada. 
                Foque tracking só em páginas públicas e eventos genéricos de conversão.
              </p>
            </div>
          </div>

          {/* CÓDIGO CUSTOMIZADO - HEAD */}
          <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                Código no &lt;head&gt;
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(headCode, 'head-code')}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-1"
                >
                  {copiedItem === 'head-code' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  Copiar
                </button>
                <button
                  onClick={clearHeadCode}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-2 left-3 text-xs text-slate-500 font-mono">&lt;head&gt;</div>
              <textarea
                value={headCodeTemp}
                onChange={(e) => setHeadCodeTemp(e.target.value)}
                className="w-full h-64 bg-slate-950 border border-slate-700 rounded-lg p-3 pt-8 pb-8 text-sm font-mono text-green-400 focus:outline-none focus:border-purple-500 resize-y"
                placeholder="<!-- Cole aqui seus scripts do Google Analytics, Meta Pixel, etc -->"
                spellCheck={false}
              />
              <div className="absolute bottom-2 left-3 text-xs text-slate-500 font-mono">&lt;/head&gt;</div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="text-xs text-slate-500">
                {headCodeTemp !== headCode && <span className="text-yellow-400">⚠️ Alterações não salvas</span>}
                {headCodeSaved && <span className="text-green-400">✅ Código salvo!</span>}
              </div>
              <button
                onClick={saveHeadCode}
                disabled={headCodeTemp === headCode}
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                  headCodeTemp !== headCode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                Salvar HEAD
              </button>
            </div>

            {headCode && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <h4 className="text-xs text-slate-400 mb-2">📋 Código Salvo Atualmente:</h4>
                <pre className="bg-slate-950 p-3 rounded-lg text-xs text-slate-400 overflow-x-auto max-h-32 overflow-y-auto">
                  {headCode}
                </pre>
              </div>
            )}
          </div>

          {/* CÓDIGO CUSTOMIZADO - FOOTER */}
          <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileCode className="w-5 h-5 text-orange-400" />
                Código antes do &lt;/body&gt; (Footer)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(footCode, 'foot-code')}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-1"
                >
                  {copiedItem === 'foot-code' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  Copiar
                </button>
                <button
                  onClick={clearFootCode}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-2 left-3 text-xs text-slate-500 font-mono">&lt;body&gt; ... conteúdo ...</div>
              <textarea
                value={footCodeTemp}
                onChange={(e) => setFootCodeTemp(e.target.value)}
                className="w-full h-64 bg-slate-950 border border-slate-700 rounded-lg p-3 pt-8 pb-8 text-sm font-mono text-yellow-400 focus:outline-none focus:border-purple-500 resize-y"
                placeholder="<!-- Cole aqui scripts que devem carregar no final da página (Clarity, Hotjar, etc) -->"
                spellCheck={false}
              />
              <div className="absolute bottom-2 left-3 text-xs text-slate-500 font-mono">&lt;/body&gt;</div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="text-xs text-slate-500">
                {footCodeTemp !== footCode && <span className="text-yellow-400">⚠️ Alterações não salvas</span>}
                {footCodeSaved && <span className="text-green-400">✅ Código salvo!</span>}
              </div>
              <button
                onClick={saveFootCode}
                disabled={footCodeTemp === footCode}
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                  footCodeTemp !== footCode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                Salvar FOOTER
              </button>
            </div>

            {footCode && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <h4 className="text-xs text-slate-400 mb-2">📋 Código Salvo Atualmente:</h4>
                <pre className="bg-slate-950 p-3 rounded-lg text-xs text-slate-400 overflow-x-auto max-h-32 overflow-y-auto">
                  {footCode}
                </pre>
              </div>
            )}
          </div>

          {/* Instruções */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-2">📖 Como usar:</h3>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• <strong className="text-cyan-400">HEAD:</strong> Scripts que precisam carregar primeiro (GA4, Meta Pixel, fontes)</li>
              <li>• <strong className="text-orange-400">FOOTER:</strong> Scripts que podem carregar por último (Clarity, Hotjar, chat widgets)</li>
              <li>• Após salvar, copie o código e cole no arquivo <code className="text-purple-400">app/layout.tsx</code></li>
              <li>• Scripts no footer melhoram a performance (carregam depois do conteúdo)</li>
            </ul>
          </div>

          {/* UTM Builder */}
          <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Gerador de UTM
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">URL Base</label>
                <input
                  type="text"
                  placeholder="https://radarnarcisista.com.br/teste-clareza"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                  id="utm-url"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">utm_source (origem)</label>
                <input
                  type="text"
                  placeholder="google, facebook, instagram, tiktok"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                  id="utm-source"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">utm_medium (tipo)</label>
                <input
                  type="text"
                  placeholder="cpc, social, email, banner"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                  id="utm-medium"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">utm_campaign (campanha)</label>
                <input
                  type="text"
                  placeholder="lancamento_2024, black_friday"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                  id="utm-campaign"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">utm_term (palavra-chave)</label>
                <input
                  type="text"
                  placeholder="narcisismo, abuso emocional"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                  id="utm-term"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">utm_content (variação)</label>
                <input
                  type="text"
                  placeholder="botao_roxo, banner_topo"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                  id="utm-content"
                />
              </div>
            </div>

            <button
              onClick={() => {
                const url = (document.getElementById('utm-url') as HTMLInputElement)?.value || ''
                const source = (document.getElementById('utm-source') as HTMLInputElement)?.value || ''
                const medium = (document.getElementById('utm-medium') as HTMLInputElement)?.value || ''
                const campaign = (document.getElementById('utm-campaign') as HTMLInputElement)?.value || ''
                const term = (document.getElementById('utm-term') as HTMLInputElement)?.value || ''
                const content = (document.getElementById('utm-content') as HTMLInputElement)?.value || ''
                
                if (!url) { alert('Preencha a URL base'); return }
                
                let finalUrl = url + '?'
                if (source) finalUrl += `utm_source=${encodeURIComponent(source)}&`
                if (medium) finalUrl += `utm_medium=${encodeURIComponent(medium)}&`
                if (campaign) finalUrl += `utm_campaign=${encodeURIComponent(campaign)}&`
                if (term) finalUrl += `utm_term=${encodeURIComponent(term)}&`
                if (content) finalUrl += `utm_content=${encodeURIComponent(content)}&`
                
                finalUrl = finalUrl.slice(0, -1) // Remove último &
                
                navigator.clipboard.writeText(finalUrl)
                alert('URL copiada!\n\n' + finalUrl)
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Gerar e Copiar URL
            </button>
          </div>

          {/* Links Rápidos */}
          <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <ExternalLink className="w-5 h-5 text-blue-400" />
              Links Rápidos - Ferramentas
            </h2>
            
            <div className="grid md:grid-cols-3 gap-3">
              <a href="https://analytics.google.com" target="_blank" className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-medium text-sm">Google Analytics</p>
                  <p className="text-xs text-slate-400">Ver relatórios</p>
                </div>
              </a>
              <a href="https://search.google.com/search-console" target="_blank" className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <span className="text-2xl">🔍</span>
                <div>
                  <p className="font-medium text-sm">Search Console</p>
                  <p className="text-xs text-slate-400">SEO e indexação</p>
                </div>
              </a>
              <a href="https://business.facebook.com/events_manager" target="_blank" className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <span className="text-2xl">📘</span>
                <div>
                  <p className="font-medium text-sm">Meta Events Manager</p>
                  <p className="text-xs text-slate-400">Pixel e conversões</p>
                </div>
              </a>
              <a href="https://ads.google.com" target="_blank" className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <span className="text-2xl">📢</span>
                <div>
                  <p className="font-medium text-sm">Google Ads</p>
                  <p className="text-xs text-slate-400">Campanhas</p>
                </div>
              </a>
              <a href="https://clarity.microsoft.com" target="_blank" className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="font-medium text-sm">Microsoft Clarity</p>
                  <p className="text-xs text-slate-400">Heatmaps grátis</p>
                </div>
              </a>
              <a href="https://sentry.io" target="_blank" className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <span className="text-2xl">🐛</span>
                <div>
                  <p className="font-medium text-sm">Sentry</p>
                  <p className="text-xs text-slate-400">Monitorar erros</p>
                </div>
              </a>
              <a href="https://uptimerobot.com" target="_blank" className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="font-medium text-sm">UptimeRobot</p>
                  <p className="text-xs text-slate-400">Monitorar uptime</p>
                </div>
              </a>
              <a href="https://pagespeed.web.dev" target="_blank" className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="font-medium text-sm">PageSpeed Insights</p>
                  <p className="text-xs text-slate-400">Performance</p>
                </div>
              </a>
              <a href="https://www.google.com/webmasters/tools/richsnippets" target="_blank" className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <span className="text-2xl">🏷️</span>
                <div>
                  <p className="font-medium text-sm">Rich Results Test</p>
                  <p className="text-xs text-slate-400">Schema markup</p>
                </div>
              </a>
            </div>
          </div>

          {/* Checklist de Lançamento */}
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-800/50">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-green-400" />
              Checklist de Lançamento
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-green-400">📊 Analytics</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-slate-300">GA4 configurado com eventos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-slate-300">Search Console verificado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-slate-300">Conversões importadas no GA4</span>
                </label>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-blue-400">📢 Ads</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-slate-300">Meta Pixel instalado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-slate-300">Google Ads tag instalada</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-slate-300">Conversões configuradas</span>
                </label>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-400">🔒 LGPD</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-slate-300">Banner de cookies ativo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-slate-300">Política de privacidade atualizada</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-slate-300">Áreas sensíveis sem tracking</span>
                </label>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-purple-400">⚙️ Técnico</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-slate-300">Sentry configurado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-slate-300">UptimeRobot ativo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-slate-300">PageSpeed acima de 90</span>
                </label>
              </div>
            </div>
          </div>
        </>
        )}

      </div>
      </div>
    </div>
  )
}

export default function FrontpageManagerPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-slate-950">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    }>
      <FrontpageManagerContent />
    </Suspense>
  )
}
