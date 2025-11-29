'use client'

import { useState, useEffect } from 'react'
import Header from '../../../components/Header'
import Link from 'next/link'

export default function EstatisticasPublicasPage() {
  const [loading, setLoading] = useState(true)

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando estatísticas públicas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header Principal */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">🌐 Estatísticas Públicas</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-6">
              Dados anonimizados e agregados para transparência, pesquisa acadêmica e 
              formulação de políticas públicas. Compromisso com a verdade e a transformação social.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span>Dados 100% Anonimizados</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                <span>Atualização em Tempo Real</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
                <span>Acesso Livre e Gratuito</span>
              </div>
            </div>
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
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                ← Voltar para Estatísticas
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Portal Público de Dados</span>
            </div>
            <div className="flex space-x-2">
              <Link 
                href="/estatisticas/mes"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                📊 Mensal
              </Link>
              <Link 
                href="/estatisticas/ano"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                📋 Anual
              </Link>
              <Link 
                href="/pesquisa/academica"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                🎓 Portal Acadêmico
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Principais - Visão Geral */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Acumulado</h3>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">34.164</div>
            <div className="text-sm text-gray-500 mt-2">perguntas desde Jan/2024</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Este Mês</h3>
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">2.847</div>
            <div className="text-sm text-green-600 mt-2">↑ 12.3% vs mês anterior</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Vidas Impactadas</h3>
              <span className="text-2xl">🤝</span>
            </div>
            <div className="text-3xl font-bold text-green-600">8.934</div>
            <div className="text-sm text-gray-500 mt-2">pessoas ajudadas</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Taxa Efetividade</h3>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-indigo-600">76.8%</div>
            <div className="text-sm text-green-600 mt-2">ajuda efetiva</div>
          </div>
        </div>
      </div>

      {/* Seção de Impacto Social */}
      <div className="bg-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🏛️ Impacto Social e Transparência</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Nossos dados públicos contribuem para pesquisas acadêmicas, políticas públicas e 
              conscientização social sobre violência doméstica e padrões relacionais abusivos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-3xl mb-4">🎓</div>
              <h3 className="font-semibold text-gray-900 mb-2">Pesquisa Acadêmica</h3>
              <p className="text-sm text-gray-600 mb-4">
                Dados utilizados em 15+ instituições para teses, dissertações e artigos científicos.
              </p>
              <Link 
                href="/pesquisa/academica"
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Portal Acadêmico →
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-3xl mb-4">🏛️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Políticas Públicas</h3>
              <p className="text-sm text-gray-600 mb-4">
                Subsídios para governos estaduais e municipais na criação de programas de apoio.
              </p>
              <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                Relatórios para Governo →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-3xl mb-4">📰</div>
              <h3 className="font-semibold text-gray-900 mb-2">Mídia e Conscientização</h3>
              <p className="text-sm text-gray-600 mb-4">
                Dados citados em 50+ matérias jornalísticas e campanhas de prevenção nacional.
              </p>
              <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                Clipping de Mídia →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dados Detalhados */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Distribuição Nacional */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🗺️ Distribuição Nacional</h3>
            <div className="space-y-3">
              {[
                { regiao: 'Sudeste', count: 18432, percentual: 54.0, estados: 'SP, RJ, MG, ES' },
                { regiao: 'Nordeste', count: 8234, percentual: 24.1, estados: 'BA, PE, CE, MA, etc' },
                { regiao: 'Sul', count: 4521, percentual: 13.2, estados: 'PR, SC, RS' },
                { regiao: 'Centro-Oeste', count: 1876, percentual: 5.5, estados: 'DF, GO, MT, MS' },
                { regiao: 'Norte', count: 1101, percentual: 3.2, estados: 'AM, PA, RO, etc' }
              ].map((regiao) => (
                <div key={regiao.regiao} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">{regiao.regiao}</span>
                      <span className="text-sm text-gray-600">{regiao.count.toLocaleString()} ({regiao.percentual}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${regiao.percentual}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{regiao.estados}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Perfil Demográfico */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Perfil Demográfico</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Gênero (Auto-declarado)</h4>
                <div className="space-y-2">
                  {[
                    { genero: 'Mulheres Cis', percentual: 78.3 },
                    { genero: 'Homens Cis', percentual: 12.1 },
                    { genero: 'Mulheres Trans', percentual: 5.2 },
                    { genero: 'Homens Trans', percentual: 2.1 },
                    { genero: 'Não Binários', percentual: 1.8 },
                    { genero: 'Prefere não dizer', percentual: 0.5 }
                  ].map((item) => (
                    <div key={item.genero} className="flex items-center">
                      <span className="w-32 text-sm text-gray-700">{item.genero}</span>
                      <div className="flex-1 mx-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${item.percentual}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="w-12 text-sm text-gray-900 text-right">{item.percentual}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Faixa Etária</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>18-24 anos</span>
                    <span className="font-medium">23.4%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>25-34 anos</span>
                    <span className="font-medium">38.7%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>35-44 anos</span>
                    <span className="font-medium">25.1%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>45+ anos</span>
                    <span className="font-medium">12.8%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tipos de Violência */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Tipos de Violência Reportados</h3>
            <div className="space-y-3">
              {[
                { tipo: 'Violência Psicológica', count: 10234, percentual: 29.9, gravidade: 'Alta' },
                { tipo: 'Isolamento Social', count: 7845, percentual: 23.0, gravidade: 'Média' },
                { tipo: 'Controle Financeiro', count: 6234, percentual: 18.2, gravidade: 'Alta' },
                { tipo: 'Agressão Verbal', count: 4567, percentual: 13.4, gravidade: 'Média' },
                { tipo: 'Ameaças', count: 3456, percentual: 10.1, gravidade: 'Alta' },
                { tipo: 'Agressão Física', count: 1828, percentual: 5.4, gravidade: 'Crítica' }
              ].map((item) => (
                <div key={item.tipo} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.tipo}</div>
                    <div className="text-sm text-gray-600">{item.count.toLocaleString()} ocorrências</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-purple-600">{item.percentual}%</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.gravidade === 'Crítica' ? 'bg-red-100 text-red-700' :
                      item.gravidade === 'Alta' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.gravidade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Canais de Ajuda */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🆘 Encaminhamentos Realizados</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">190</div>
                  <div className="text-sm text-gray-600">Polícia</div>
                  <div className="text-xs text-gray-500">1.247 encaminhamentos</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">100</div>
                  <div className="text-sm text-gray-600">Direitos Humanos</div>
                  <div className="text-xs text-gray-500">892 encaminhamentos</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">188</div>
                  <div className="text-sm text-gray-600">CVV</div>
                  <div className="text-xs text-gray-500">654 encaminhamentos</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">192</div>
                  <div className="text-sm text-gray-600">SAMU</div>
                  <div className="text-xs text-gray-500">423 encaminhamentos</div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Taxa de Efetividade por Canal</h4>
                <div className="space-y-2">
                  {[
                    { canal: 'Chat Online', taxa: 78.5 },
                    { canal: 'Telefonia 190', taxa: 92.3 },
                    { canal: 'Centros de Apoio', taxa: 85.7 },
                    { canal: 'Encaminhamento Presencial', taxa: 94.2 }
                  ].map((item) => (
                    <div key={item.canal} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{item.canal}</span>
                      <span className="text-sm font-medium text-green-600">{item.taxa}% efetivo</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download de Dados */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">📥 Baixe os Dados Completos</h2>
            <p className="text-gray-300">
              Todos os datasets são 100% anonimizados e disponíveis para uso acadêmico e governamental
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold mb-2">Dataset Completo</h3>
              <p className="text-sm text-gray-400 mb-4">Todos os dados 2024</p>
              <button className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                Download CSV
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-semibold mb-2">Relatório Anual</h3>
              <p className="text-sm text-gray-400 mb-4">Análise completa 2024</p>
              <button className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                Download PDF
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors">
              <div className="text-3xl mb-3">🔬</div>
              <h3 className="font-semibold mb-2">API Pública</h3>
              <p className="text-sm text-gray-400 mb-4">Acesso programático</p>
              <button className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                Ver Documentação
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-semibold mb-2">Dashboard</h3>
              <p className="text-sm text-gray-400 mb-4">Visualização interativa</p>
              <button className="w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm">
                Acessar Dashboard
              </button>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-gray-800 rounded-lg max-w-2xl mx-auto">
            <h4 className="font-semibold mb-2 text-yellow-400">⚖️ Termos de Uso Ético</h4>
            <p className="text-sm text-gray-300">
              Ao utilizar estes dados, você compromete-se a: 1) Manter absoluto anonimato, 
              2) Citar a fonte "Radar Narcisista BR", 3) Usar exclusivamente para fins acadêmicos 
              ou de políticas públicas, 4) Não comercializar sem autorização.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Institucional */}
      <div className="bg-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-3">🎯 Sobre Nossa Missão</h3>
              <p className="text-sm text-purple-100">
                Transformar dados em ação. Cada estatística representa uma vida, 
                cada número conta uma história que merece ser ouvida e transformada.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">🤝 Parcerias</h3>
              <p className="text-sm text-purple-100 mb-3">
                Colaboramos com universidades, ONGs e governos para maximizar nosso impacto social.
              </p>
              <button className="text-sm underline hover:no-underline">
                Quero ser parceiro →
              </button>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">📞 Contato Institucional</h3>
              <p className="text-sm text-purple-100">
                dados@radarnarcisista.com.br<br/>
                Para pesquisadores e governos
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-purple-500 text-center">
            <p className="text-sm text-purple-100">
              © 2024 Radar Narcisista BR - Dados para transformar realidades
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
