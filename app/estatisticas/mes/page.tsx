'use client'

import { useState, useEffect } from 'react'
import Header from '../../../components/Header'
import Link from 'next/link'

export default function EstatisticasMesPage() {
  const [loading, setLoading] = useState(true)
  const [mesAtual, setMesAtual] = useState('2024-11')

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando estatísticas do mês...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">📊 Estatísticas de Novembro 2024</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Dados detalhados do mês atual para acompanhamento em tempo real das tendências 
              e padrões de busca por ajuda em situações de vulnerabilidade.
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
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Voltar para Estatísticas
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Mês atual: Novembro 2024</span>
            </div>
            <div className="flex space-x-2">
              <Link 
                href="/estatisticas/ano"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                📋 Ver Anual
              </Link>
              <Link 
                href="/estatisticas/publicas"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
              <h3 className="text-sm font-medium text-gray-600">Total Perguntas</h3>
              <span className="text-2xl">💬</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">2.847</div>
            <div className="text-sm text-green-600 mt-2">↑ 12.3% vs mês anterior</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Usuários Ativos</h3>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">1.234</div>
            <div className="text-sm text-green-600 mt-2">↑ 8.7% vs mês anterior</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Emergências</h3>
              <span className="text-2xl">🚨</span>
            </div>
            <div className="text-3xl font-bold text-red-600">147</div>
            <div className="text-sm text-red-600 mt-2">↑ 5.2% vs mês anterior</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Taxa Ajuda</h3>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-green-600">78.5%</div>
            <div className="text-sm text-green-600 mt-2">↑ 2.1% vs mês anterior</div>
          </div>
        </div>
      </div>

      {/* Gráficos Detalhados */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Evolução Diária */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Evolução Diária</h3>
            <div className="space-y-2">
              {[
                { dia: '1 Nov', perguntas: 87, usuarios: 34 },
                { dia: '5 Nov', perguntas: 92, usuarios: 41 },
                { dia: '10 Nov', perguntas: 78, usuarios: 35 },
                { dia: '15 Nov', perguntas: 95, usuarios: 43 },
                { dia: '20 Nov', perguntas: 103, usuarios: 47 },
                { dia: '25 Nov', perguntas: 98, usuarios: 44 },
                { dia: '30 Nov', perguntas: 89, usuarios: 38 }
              ].map((item) => (
                <div key={item.dia} className="flex items-center">
                  <div className="w-16 text-sm text-gray-600">{item.dia}</div>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(item.perguntas / 120) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-sm text-gray-900 text-right">{item.perguntas}</div>
                  <div className="w-8 text-xs text-gray-500 text-center">{item.usuarios}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Média diária:</span>
                <span className="font-medium text-gray-900">94.9 perguntas / 40.3 usuários</span>
              </div>
            </div>
          </div>

          {/* Top Categorias do Mês */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Categorias - Novembro</h3>
            <div className="space-y-3">
              {[
                { nome: 'Violência Psicológica', count: 892, percentual: 31.3, mudanca: '+5.2%' },
                { nome: 'Busca Ajuda Urgente', count: 654, percentual: 23.0, mudanca: '+3.8%' },
                { nome: 'Isolamento Social', count: 432, percentual: 15.2, mudanca: '+2.1%' },
                { nome: 'Agressão Física', count: 387, percentual: 13.6, mudanca: '+1.5%' },
                { nome: 'Controle Financeiro', count: 345, percentual: 12.1, mudanca: '+4.3%' },
                { nome: 'Outros', count: 137, percentual: 4.8, mudanca: '-1.2%' }
              ].map((categoria, index) => (
                <div key={categoria.nome} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600 mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">{categoria.nome}</span>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">{categoria.count} ({categoria.percentual}%)</span>
                        <span className={`ml-2 text-xs ${categoria.mudanca.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {categoria.mudanca}
                        </span>
                      </div>
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

          {/* Distribuição por Hora */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⏰ Picos de Atividade por Hora</h3>
            <div className="space-y-2">
              {[
                { hora: '00:00-06:00', perguntas: 127, percentual: 4.5 },
                { hora: '06:00-12:00', perguntas: 687, percentual: 24.1 },
                { hora: '12:00-18:00', perguntas: 1234, percentual: 43.3 },
                { hora: '18:00-24:00', perguntas: 799, percentual: 28.1 }
              ].map((periodo) => (
                <div key={periodo.hora} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{periodo.hora}</div>
                    <div className="text-sm text-gray-600">{periodo.perguntas} perguntas</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600">{periodo.percentual}%</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                📊 **Pico principal:** 12:00-18:00 (43.3% das perguntas)
              </p>
            </div>
          </div>

          {/* Estados Mais Ativos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🗺️ Estados Mais Ativos - Novembro</h3>
            <div className="space-y-3">
              {[
                { estado: 'São Paulo', count: 823, percentual: 28.9, cidades: 'São Paulo, Campinas, Guarulhos' },
                { estado: 'Rio de Janeiro', count: 567, percentual: 19.9, cidades: 'Rio, Niterói, São Gonçalo' },
                { estado: 'Minas Gerais', count: 445, percentual: 15.6, cidades: 'BH, Belo Horizonte, Uberlândia' },
                { estado: 'Bahia', count: 398, percentual: 14.0, cidades: 'Salvador, Feira, Vitória' },
                { estado: 'Paraná', count: 287, percentual: 10.1, cidades: 'Curitiba, Londrina, Maringá' },
                { estado: 'Outros', count: 327, percentual: 11.5, cidades: 'Vários estados' }
              ].map((estado) => (
                <div key={estado.estado} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-medium text-gray-900">{estado.estado}</div>
                      <div className="text-xs text-gray-500">{estado.cidades}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">{estado.count}</div>
                      <div className="text-xs text-gray-500">{estado.percentual}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insights e Análises */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">🔍 Insights do Mês</h2>
            <p className="text-gray-300">
              Análises inteligentes baseadas nos dados de Novembro 2024
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-3 text-yellow-400">⚠️ Alerta Crítico</h3>
              <p className="text-sm text-gray-300">
                Aumento de 12.3% nas buscas por ajuda, com pico significativo em violência psicológica 
                (+5.2%). Sugere necessidade de campanhas específicas sobre manipulação emocional.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-3 text-green-400">✅ Positivo</h3>
              <p className="text-sm text-gray-300">
                Taxa de efetividade de ajuda aumentou 2.1%, indicando que as respostas e encaminhamentos 
                estão mais eficazes. Modo emergência funcionando bem.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold mb-3 text-blue-400">📈 Tendência</h3>
              <p className="text-sm text-gray-300">
                Horário comercial (12:00-18:00) concentra 43.3% das buscas, sugerindo que pessoas 
                procuram ajuda durante trabalho/estudo, possivelmente por privacidade.
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link 
              href="/admin"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              ⚙️ Ver Análise Completa no Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
