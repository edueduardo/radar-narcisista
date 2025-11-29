'use client'

import { useState, useEffect } from 'react'
import Header from '../../../components/Header'
import Link from 'next/link'

export default function EstatisticasAnoPage() {
  const [loading, setLoading] = useState(true)
  const [anoAtual, setAnoAtual] = useState('2024')

  useEffect(() => {
    // Simular loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando estatísticas anuais...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">📋 Estatísticas Anuais 2024</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Visão completa do ano com análise de tendências, crescimento e impacto social. 
              Dados agregados para formulação de políticas públicas e pesquisas acadêmicas.
            </p>
          </div>
        </div>
      </div>

      {/* Navegação Rápida */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/estatisticas"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                ← Voltar para Estatísticas
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Ano atual: 2024</span>
            </div>
            <div className="flex space-x-2">
              <Link 
                href="/estatisticas/mes"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                📊 Ver Mensal
              </Link>
              <Link 
                href="/estatisticas/publicas"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                🌐 Públicas
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Anual</h3>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-green-600">34.164</div>
            <div className="text-sm text-green-600 mt-2">↑ 45.2% vs 2023</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Vidas Impactadas</h3>
              <span className="text-2xl">🤝</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">8.934</div>
            <div className="text-sm text-green-600 mt-2">↑ 38.7% vs 2023</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Emergências</h3>
              <span className="text-2xl">🚨</span>
            </div>
            <div className="text-3xl font-bold text-red-600">1.247</div>
            <div className="text-sm text-red-600 mt-2">↑ 22.1% vs 2023</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Taxa Efetividade</h3>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">76.8%</div>
            <div className="text-sm text-green-600 mt-2">↑ 5.3% vs 2023</div>
          </div>
        </div>
      </div>

      {/* Gráficos Anuais */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Evolução Mensal 2024 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Evolução Mensal - 2024</h3>
            <div className="space-y-2">
              {[
                { mes: 'Jan', perguntas: 1843, crescimento: '+12.3%', meta: 1500 },
                { mes: 'Fev', perguntas: 2102, crescimento: '+14.1%', meta: 1500 },
                { mes: 'Mar', perguntas: 2398, crescimento: '+14.1%', meta: 2000 },
                { mes: 'Abr', perguntas: 2567, crescimento: '+7.0%', meta: 2000 },
                { mes: 'Mai', perguntas: 2743, crescimento: '+6.9%', meta: 2500 },
                { mes: 'Jun', perguntas: 2891, crescimento: '+5.4%', meta: 2500 },
                { mes: 'Jul', perguntas: 2654, crescimento: '-8.2%', meta: 2500 },
                { mes: 'Ago', perguntas: 2789, crescimento: '+5.1%', meta: 2500 },
                { mes: 'Set', perguntas: 2847, crescimento: '+2.1%', meta: 2500 },
                { mes: 'Out', perguntas: 2923, crescimento: '+2.7%', meta: 2500 },
                { mes: 'Nov', perguntas: 2847, crescimento: '-2.6%', meta: 2500 },
                { mes: 'Dez', perguntas: 0, crescimento: '-', meta: 2500 }
              ].map((item) => (
                <div key={item.mes} className="flex items-center">
                  <div className="w-12 text-sm font-medium text-gray-700">{item.mes}</div>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.perguntas >= item.meta ? 'bg-green-600' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min((item.perguntas / 3500) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-900 text-right font-medium">{item.perguntas}</div>
                  <div className={`w-16 text-xs text-right ${
                    item.crescimento.startsWith('+') ? 'text-green-600' : 
                    item.crescimento.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {item.crescimento}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Média mensal:</span>
                <span className="font-medium text-gray-900">2.847 perguntas</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Crescimento anual:</span>
                <span className="font-medium text-green-600">+45.2%</span>
              </div>
            </div>
          </div>

          {/* Top Categorias Anuais */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Categorias - Ano 2024</h3>
            <div className="space-y-3">
              {[
                { nome: 'Violência Psicológica', count: 10234, percentual: 29.9, mudanca: '+52.3%' },
                { nome: 'Busca Ajuda Urgente', count: 7845, percentual: 23.0, mudanca: '+41.2%' },
                { nome: 'Isolamento Social', count: 5432, percentual: 15.9, mudanca: '+38.7%' },
                { nome: 'Agressão Física', count: 4567, percentual: 13.4, mudanca: '+28.9%' },
                { nome: 'Controle Financeiro', count: 3876, percentual: 11.3, mudanca: '+67.2%' },
                { nome: 'Outros', count: 2210, percentual: 6.5, mudanca: '+15.4%' }
              ].map((categoria, index) => (
                <div key={categoria.nome} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-600 mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">{categoria.nome}</span>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">{categoria.count.toLocaleString()} ({categoria.percentual}%)</span>
                        <span className={`ml-2 text-xs font-medium ${categoria.mudanca.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {categoria.mudanca} vs 2023
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${categoria.percentual}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparativo Anual */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Comparativo 2023 vs 2024</h3>
            <div className="space-y-4">
              {[
                { metrica: 'Total Perguntas', ano2023: 23534, ano2024: 34164, mudanca: '+45.2%' },
                { metrica: 'Usuários Únicos', ano2023: 6434, ano2024: 8934, mudanca: '+38.8%' },
                { metrica: 'Emergências', ano2023: 1022, ano2024: 1247, mudanca: '+22.0%' },
                { metrica: 'Taxa Efetividade', ano2023: 72.9, ano2024: 76.8, mudanca: '+5.3%' },
                { metrica: 'Tempo Resposta', ano2023: 2.3, ano2024: 1.8, mudanca: '-21.7%' }
              ].map((item) => (
                <div key={item.metrica} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{item.metrica}</span>
                    <span className={`text-sm font-medium ${
                      item.mudanca.startsWith('+') ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {item.mudanca}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">2023</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gray-400 h-2 rounded-full"
                          style={{ width: `${(item.ano2023 / 40000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">2024</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(item.ano2024 / 40000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{item.ano2023.toLocaleString()}</span>
                    <span>{item.ano2024.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estados Mais Ativos Anual */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🗺️ Top Estados - Ano 2024</h3>
            <div className="space-y-3">
              {[
                { estado: 'São Paulo', count: 9876, percentual: 28.9, crescimento: '+48.2%' },
                { estado: 'Rio de Janeiro', count: 6789, percentual: 19.9, crescimento: '+42.1%' },
                { estado: 'Minas Gerais', count: 5234, percentual: 15.3, crescimento: '+39.7%' },
                { estado: 'Bahia', count: 4567, percentual: 13.4, crescimento: '+51.3%' },
                { estado: 'Paraná', count: 3421, percentual: 10.0, crescimento: '+44.8%' },
                { estado: 'Outros', count: 4277, percentual: 12.5, crescimento: '+37.2%' }
              ].map((estado, index) => (
                <div key={estado.estado} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm font-medium text-teal-600 mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">{estado.estado}</span>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">{estado.count.toLocaleString()} ({estado.percentual}%)</span>
                        <span className="ml-2 text-xs text-green-600 font-medium">
                          {estado.crescimento}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-teal-600 h-2 rounded-full"
                        style={{ width: `${estado.percentual}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Marcos e Conquistas */}
      <div className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">🏆 Marcos do Ano 2024</h2>
            <p className="text-green-100">
              Conquistas e momentos importantes que marcaram nossa jornada
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-700 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold mb-2">Março 2024</h3>
              <p className="text-sm text-green-100">
                Ultrapassamos 10.000 perguntas acumuladas. Implementado modo emergência do chat.
              </p>
            </div>
            
            <div className="bg-green-700 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-semibold mb-2">Junho 2024</h3>
              <p className="text-sm text-green-100">
                Lançamento do portal acadêmico. Primeiros datasets públicos disponibilizados.
              </p>
            </div>
            
            <div className="bg-green-700 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🌟</div>
              <h3 className="font-semibold mb-2">Novembro 2024</h3>
              <p className="text-sm text-green-100">
                Recorde de 34.164 perguntas anuais. Reconhecimento como referência nacional.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projeções 2025 */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">🔮 Projeções para 2025</h2>
            <p className="text-gray-300">
              Com base nas tendências atuais, esperamos alcançar:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">50K+</div>
              <p className="text-sm text-gray-300">Perguntas anuais</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">12K+</div>
              <p className="text-sm text-gray-300">Vidas impactadas</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">80%</div>
              <p className="text-sm text-gray-300">Taxa de efetividade</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">15+</div>
              <p className="text-sm text-gray-300">Parcerias acadêmicas</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link 
              href="/pesquisa/academica"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              🎓 Participar como Pesquisador
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
