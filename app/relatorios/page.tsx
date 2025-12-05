'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Heart,
  Shield,
  Target,
  Loader2,
  RefreshCw,
  Filter
} from 'lucide-react'
import { gerarEBaixarPDFCompleto, type RelatorioCompletoData } from '../../lib/pdf-generator'

interface TesteData {
  id: string
  created_at: string
  scores: {
    nevoa: number
    medo: number
    limites: number
  }
  global_zone: string
}

interface DiarioEntry {
  id: string
  created_at: string
  title: string
  impact_score: number
  tags: string[]
  ai_analysis?: {
    themes: string[]
    emotions: string[]
  }
}

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true)
  const [testes, setTestes] = useState<TesteData[]>([])
  const [entradas, setEntradas] = useState<DiarioEntry[]>([])
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [gerandoPDF, setGerandoPDF] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [periodo])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Calcular data de início baseado no período
      let dataInicio = new Date()
      switch (periodo) {
        case '7d': dataInicio.setDate(dataInicio.getDate() - 7); break
        case '30d': dataInicio.setDate(dataInicio.getDate() - 30); break
        case '90d': dataInicio.setDate(dataInicio.getDate() - 90); break
        case 'all': dataInicio = new Date('2020-01-01'); break
      }

      // Carregar testes
      const { data: testesData } = await supabase
        .from('clarity_tests')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', dataInicio.toISOString())
        .order('created_at', { ascending: false })

      // Carregar entradas do diário
      const { data: entradasData } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', dataInicio.toISOString())
        .order('created_at', { ascending: false })

      setTestes(testesData || [])
      setEntradas(entradasData || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular estatísticas
  const calcularEstatisticas = () => {
    const totalTestes = testes.length
    const totalEntradas = entradas.length
    
    // Média de impacto
    const mediaImpacto = entradas.length > 0
      ? entradas.reduce((acc, e) => acc + (e.impact_score || 0), 0) / entradas.length
      : 0

    // Zonas dos testes
    const zonasCount = {
      ATENCAO: testes.filter(t => t.global_zone === 'ATENCAO').length,
      ALERTA: testes.filter(t => t.global_zone === 'ALERTA').length,
      VERMELHA: testes.filter(t => t.global_zone === 'VERMELHA').length
    }

    // Tags mais frequentes
    const tagsCount: Record<string, number> = {}
    entradas.forEach(e => {
      (e.tags || []).forEach(tag => {
        tagsCount[tag] = (tagsCount[tag] || 0) + 1
      })
    })
    const topTags = Object.entries(tagsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // Tendência (comparar primeira e última metade)
    let tendencia: 'melhorando' | 'piorando' | 'estavel' = 'estavel'
    if (testes.length >= 2) {
      const metade = Math.floor(testes.length / 2)
      const primeiraMeta = testes.slice(metade)
      const segundaMetade = testes.slice(0, metade)
      
      const mediaPrimeira = primeiraMeta.reduce((acc, t) => 
        acc + (t.scores?.nevoa || 0) + (t.scores?.medo || 0) + (t.scores?.limites || 0), 0) / primeiraMeta.length
      const mediaSegunda = segundaMetade.reduce((acc, t) => 
        acc + (t.scores?.nevoa || 0) + (t.scores?.medo || 0) + (t.scores?.limites || 0), 0) / segundaMetade.length
      
      if (mediaSegunda < mediaPrimeira - 2) tendencia = 'melhorando'
      else if (mediaSegunda > mediaPrimeira + 2) tendencia = 'piorando'
    }

    return { totalTestes, totalEntradas, mediaImpacto, zonasCount, topTags, tendencia }
  }

  const stats = calcularEstatisticas()

  // Gerar PDF completo
  const handleGerarPDF = async () => {
    setGerandoPDF(true)
    try {
      const ultimoTeste = testes[0]
      
      const dadosPDF: RelatorioCompletoData = {
        usuario: { email: 'Usuário' },
        dataGeracao: new Date().toLocaleDateString('pt-BR'),
        teste: ultimoTeste ? {
          data: new Date(ultimoTeste.created_at).toLocaleDateString('pt-BR'),
          scores: {
            nevoa: ultimoTeste.scores?.nevoa || 0,
            medo: ultimoTeste.scores?.medo || 0,
            limites: ultimoTeste.scores?.limites || 0,
            total: (ultimoTeste.scores?.nevoa || 0) + (ultimoTeste.scores?.medo || 0) + (ultimoTeste.scores?.limites || 0)
          },
          zona: ultimoTeste.global_zone as 'ATENCAO' | 'ALERTA' | 'VERMELHA',
          interpretacao: {
            nevoa: 'Análise do nível de confusão mental.',
            medo: 'Análise do nível de medo e tensão.',
            limites: 'Análise do respeito a limites.',
            global: 'Análise global do resultado.'
          }
        } : undefined,
        diario: {
          periodo: periodo === '7d' ? 'Últimos 7 dias' : periodo === '30d' ? 'Últimos 30 dias' : periodo === '90d' ? 'Últimos 90 dias' : 'Todo o período',
          totalEntradas: entradas.length,
          entradas: entradas.slice(0, 10).map(e => ({
            data: new Date(e.created_at).toLocaleDateString('pt-BR'),
            titulo: e.title || 'Sem título',
            contexto: 'Relacionamento',
            impacto: e.impact_score || 2,
            tags: e.tags || [],
            resumo: e.title || ''
          })),
          padroes: stats.topTags.map(([tag]) => tag),
          emocoes: ['Confusão', 'Medo', 'Tristeza']
        },
        analiseIA: {
          padroes: stats.topTags.map(([tag]) => tag),
          alertas: stats.zonasCount.VERMELHA > 0 ? ['Testes em zona vermelha detectados'] : [],
          sugestoes: ['Continue registrando episódios', 'Busque apoio profissional se necessário'],
          intensidadeMedia: stats.mediaImpacto / 4
        }
      }

      await gerarEBaixarPDFCompleto(dadosPDF)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF')
    } finally {
      setGerandoPDF(false)
    }
  }

  const getZonaColor = (zona: string) => {
    switch (zona) {
      case 'VERMELHA': return 'bg-red-500'
      case 'ALERTA': return 'bg-yellow-500'
      case 'ATENCAO': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h1>
              <p className="text-gray-600">Visualize seu progresso e padrões identificados</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Filtro de período */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
              {[
                { value: '7d', label: '7 dias' },
                { value: '30d', label: '30 dias' },
                { value: '90d', label: '90 dias' },
                { value: 'all', label: 'Tudo' }
              ].map(p => (
                <button
                  key={p.value}
                  onClick={() => setPeriodo(p.value as any)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    periodo === p.value 
                      ? 'bg-purple-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Botão Atualizar */}
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Botão Gerar PDF */}
            <button
              onClick={handleGerarPDF}
              disabled={gerandoPDF}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              {gerandoPDF ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {gerandoPDF ? 'Gerando...' : 'Exportar PDF'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* Total de Testes */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Testes Realizados</span>
                  <Brain className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalTestes}</div>
                <div className="text-sm text-gray-500 mt-1">no período selecionado</div>
              </div>

              {/* Total de Entradas */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Entradas no Diário</span>
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalEntradas}</div>
                <div className="text-sm text-gray-500 mt-1">episódios registrados</div>
              </div>

              {/* Média de Impacto */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Impacto Médio</span>
                  <Activity className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.mediaImpacto.toFixed(1)}<span className="text-lg text-gray-400">/4</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {stats.mediaImpacto >= 3 ? '⚠️ Alto' : stats.mediaImpacto >= 2 ? '⚡ Médio' : '✓ Baixo'}
                </div>
              </div>

              {/* Tendência */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Tendência</span>
                  {stats.tendencia === 'melhorando' ? (
                    <TrendingDown className="h-5 w-5 text-green-500" />
                  ) : stats.tendencia === 'piorando' ? (
                    <TrendingUp className="h-5 w-5 text-red-500" />
                  ) : (
                    <Activity className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div className={`text-xl font-bold ${
                  stats.tendencia === 'melhorando' ? 'text-green-600' :
                  stats.tendencia === 'piorando' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stats.tendencia === 'melhorando' ? '📈 Melhorando' :
                   stats.tendencia === 'piorando' ? '📉 Piorando' : '➡️ Estável'}
                </div>
                <div className="text-sm text-gray-500 mt-1">baseado nos testes</div>
              </div>
            </div>

            {/* Gráficos e Detalhes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Distribuição de Zonas */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-500" />
                  Distribuição de Resultados
                </h3>
                
                {stats.totalTestes > 0 ? (
                  <div className="space-y-4">
                    {/* Zona Verde */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Zona de Atenção</span>
                        <span className="text-sm font-medium text-green-600">{stats.zonasCount.ATENCAO}</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${(stats.zonasCount.ATENCAO / stats.totalTestes) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Zona Amarela */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Zona de Alerta</span>
                        <span className="text-sm font-medium text-yellow-600">{stats.zonasCount.ALERTA}</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 rounded-full transition-all"
                          style={{ width: `${(stats.zonasCount.ALERTA / stats.totalTestes) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Zona Vermelha */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Zona Vermelha</span>
                        <span className="text-sm font-medium text-red-600">{stats.zonasCount.VERMELHA}</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full transition-all"
                          style={{ width: `${(stats.zonasCount.VERMELHA / stats.totalTestes) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhum teste realizado ainda</p>
                    <Link href="/teste-clareza" className="text-purple-500 hover:underline text-sm">
                      Fazer primeiro teste →
                    </Link>
                  </div>
                )}
              </div>

              {/* Tags Mais Frequentes */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Padrões Mais Frequentes
                </h3>
                
                {stats.topTags.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topTags.map(([tag, count], index) => (
                      <div key={tag} className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-300 w-6">#{index + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{tag}</span>
                            <span className="text-sm text-gray-500">{count}x</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${(count / stats.topTags[0][1]) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhum padrão identificado ainda</p>
                    <Link href="/diario/novo" className="text-purple-500 hover:underline text-sm">
                      Criar primeira entrada →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Histórico de Testes */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                Histórico de Testes
              </h3>
              
              {testes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Data</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Névoa</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Medo</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Limites</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Zona</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testes.slice(0, 10).map((teste) => {
                        const total = (teste.scores?.nevoa || 0) + (teste.scores?.medo || 0) + (teste.scores?.limites || 0)
                        return (
                          <tr key={teste.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {new Date(teste.created_at).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">{teste.scores?.nevoa || 0}/16</td>
                            <td className="py-3 px-4 text-sm text-gray-900">{teste.scores?.medo || 0}/16</td>
                            <td className="py-3 px-4 text-sm text-gray-900">{teste.scores?.limites || 0}/16</td>
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">{total}/48</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                teste.global_zone === 'VERMELHA' ? 'bg-red-100 text-red-700' :
                                teste.global_zone === 'ALERTA' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {teste.global_zone === 'VERMELHA' ? '🔴 Vermelha' :
                                 teste.global_zone === 'ALERTA' ? '🟡 Alerta' : '🟢 Atenção'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum teste no período selecionado</p>
                </div>
              )}
            </div>

            {/* Últimas Entradas do Diário */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Últimas Entradas do Diário
              </h3>
              
              {entradas.length > 0 ? (
                <div className="space-y-3">
                  {entradas.slice(0, 5).map((entrada) => (
                    <div key={entrada.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        (entrada.impact_score || 0) >= 3 ? 'bg-red-500' :
                        (entrada.impact_score || 0) >= 2 ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{entrada.title || 'Sem título'}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(entrada.created_at).toLocaleDateString('pt-BR')}
                          {entrada.tags?.length > 0 && ` • ${entrada.tags.slice(0, 3).join(', ')}`}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Impacto: {entrada.impact_score || 0}/4
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma entrada no período selecionado</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
