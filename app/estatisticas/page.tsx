'use client'

import { useState, useEffect } from 'react'
import Header from '../../components/Header'

interface EstatisticasData {
  mensal: {
    total_perguntas: number
    top_categorias: Array<{ nome: string; count: number; percentual: number }>
    distribuicao_regional: Array<{ estado: string; count: number; percentual: number }>
    padroes_comportamentais: Array<{ padrao: string; count: number; tendencia: string }>
  }
  anual: {
    total_perguntas: number
    crescimento_percentual: number
    meses: Array<{ mes: string; count: number }>
  }
  impacto: {
    vidas_impactadas: number
    encaminhamentos_urgentes: number
    taxa_ajuda_efetiva: number
  }
}

export default function EstatisticasPage() {
  const [periodo, setPeriodo] = useState<'mes' | 'ano'>('mes')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<EstatisticasData | null>(null)

  useEffect(() => {
    loadEstatisticas()
  }, [periodo])

  const loadEstatisticas = async () => {
    try {
      // Simulação - depois virá do Supabase
      const mockData: EstatisticasData = {
        mensal: {
          total_perguntas: 2847,
          top_categorias: [
            { nome: 'Violência Psicológica', count: 892, percentual: 31.3 },
            { nome: 'Busca por Ajuda Urgente', count: 654, percentual: 23.0 },
            { nome: 'Isolamento Social', count: 432, percentual: 15.2 },
            { nome: 'Controle Financeiro', count: 387, percentual: 13.6 },
            { nome: 'Agressão Física', count: 482, percentual: 16.9 }
          ],
          distribuicao_regional: [
            { estado: 'São Paulo', count: 823, percentual: 28.9 },
            { estado: 'Rio de Janeiro', count: 567, percentual: 19.9 },
            { estado: 'Minas Gerais', count: 445, percentual: 15.6 },
            { estado: 'Bahia', count: 398, percentual: 14.0 },
            { estado: 'Outros', count: 614, percentual: 21.6 }
          ],
          padroes_comportamentais: [
            { padrao: 'Gaslighting', count: 1247, tendencia: 'subindo' },
            { padrao: 'Isolamento', count: 892, tendencia: 'estavel' },
            { padrao: 'Controle Financeiro', count: 654, tendencia: 'subindo' },
            { padrao: 'Ameaças', count: 432, tendencia: 'descendo' }
          ]
        },
        anual: {
          total_perguntas: 34164,
          crescimento_percentual: 45.2,
          meses: [
            { mes: 'Jan', count: 1843 },
            { mes: 'Fev', count: 2102 },
            { mes: 'Mar', count: 2398 },
            { mes: 'Abr', count: 2567 },
            { mes: 'Mai', count: 2743 },
            { mes: 'Jun', count: 2891 },
            { mes: 'Jul', count: 2654 },
            { mes: 'Ago', count: 2789 },
            { mes: 'Set', count: 2847 },
            { mes: 'Out', count: 2923 },
            { mes: 'Nov', count: 2847 },
            { mes: 'Dez', count: 0 }
          ]
        },
        impacto: {
          vidas_impactadas: 8934,
          encaminhamentos_urgentes: 1247,
          taxa_ajuda_efetiva: 78.5
        }
      }
      
      // Simular loading
      await new Promise(resolve => setTimeout(resolve, 1000))
      setData(mockData)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando estatísticas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Dados não disponíveis
            </h3>
            <p className="text-gray-600">
              Tente novamente mais tarde.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const currentData = periodo === 'mes' ? data.mensal : data.anual

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">📊 Estatísticas Públicas</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Dados anonimizados em tempo real para pesquisadores, formuladores de políticas públicas 
              e sociedade civil. Transparência para transformar realidades.
            </p>
          </div>
        </div>
      </div>

      {/* Seletor de Período */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Período de Análise</h2>
              <p className="text-sm text-gray-600">
                {periodo === 'mes' ? 'Dados de Novembro 2024' : 'Dados de 2024'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriodo('mes')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  periodo === 'mes'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Mensal
              </button>
              <button
                onClick={() => setPeriodo('ano')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  periodo === 'ano'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 Anual
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total de Perguntas</h3>
              <span className="text-2xl">💬</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {currentData.total_perguntas.toLocaleString('pt-BR')}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {periodo === 'mes' ? 'este mês' : 'este ano'}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Vidas Impactadas</h3>
              <span className="text-2xl">🤝</span>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {data.impacto.vidas_impactadas.toLocaleString('pt-BR')}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              pessoas ajudadas
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Taxa de Efetividade</h3>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {data.impacto.taxa_ajuda_efetiva}%
            </div>
            <div className="text-sm text-gray-500 mt-2">
              ajuda efetiva
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos e Tabelas */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top Categorias */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Principais Categorias</h3>
            <div className="space-y-3">
              {data.mensal.top_categorias.map((categoria, index) => (
                <div key={categoria.nome} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600 mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">{categoria.nome}</span>
                      <span className="text-sm text-gray-600">{categoria.count} ({categoria.percentual}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${categoria.percentual}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição Regional */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🗺️ Distribuição Regional</h3>
            <div className="space-y-3">
              {data.mensal.distribuicao_regional.map((estado) => (
                <div key={estado.estado} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{estado.estado}</div>
                    <div className="text-sm text-gray-600">{estado.count} perguntas</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600">{estado.percentual}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Padrões Comportamentais */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Padrões Detectados</h3>
            <div className="space-y-3">
              {data.mensal.padroes_comportamentais.map((padrao) => (
                <div key={padrao.padrao} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{padrao.padrao}</div>
                    <div className="text-sm text-gray-600">{padrao.count} menções</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    padrao.tendencia === 'subindo' 
                      ? 'bg-red-100 text-red-700' 
                      : padrao.tendencia === 'descendo'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {padrao.tendencia === 'subindo' ? '📈 Subindo' : 
                     padrao.tendencia === 'descendo' ? '📉 Descendo' : '➡️ Estável'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evolução Mensal */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Evolução Mensal</h3>
            <div className="space-y-2">
              {data.anual.meses.map((mes) => (
                <div key={mes.mes} className="flex items-center">
                  <div className="w-12 text-sm font-medium text-gray-600">{mes.mes}</div>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${(mes.count / 3000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-900 text-right">{mes.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ações e Download */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">📥 Baixe os Dados Completos</h2>
            <p className="text-gray-300 mb-6">
              Dataset anonimizado disponível para pesquisa acadêmica e políticas públicas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                📊 Download CSV
              </button>
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                📋 Relatório PDF
              </button>
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                🔬 API para Pesquisadores
              </button>
            </div>
            
            <div className="mt-8 p-4 bg-gray-800 rounded-lg max-w-2xl mx-auto">
              <h3 className="font-semibold mb-2">🛡️ Compromisso de Privacidade</h3>
              <p className="text-sm text-gray-300">
                Todos os dados são 100% anonimizados. Nenhuma informação pessoal, 
                como nomes, contatos ou identificações individuais, é compartilhada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
