'use client'

import { useState, useEffect } from 'react'
import Header from '../../../components/Header'

interface PesquisaConfig {
  nivel_academico: 'graduacao' | 'mestrado' | 'doutorado'
  tema_pesquisa: string
  instituicao: string
  area_estudo: string
  filtros: {
    demograficos: boolean[]
    situacionais: boolean[]
    temporais: boolean[]
  }
}

interface RelatorioGerado {
  id: string
  titulo: string
  nivel: string
  tema: string
  data_geracao: string
  status: 'rascunho' | 'revisado' | 'finalizado'
  download_url?: string
}

export default function PesquisaAcademicaPage() {
  const [config, setConfig] = useState<PesquisaConfig>({
    nivel_academico: 'mestrado',
    tema_pesquisa: '',
    instituicao: '',
    area_estudo: '',
    filtros: {
      demograficos: [false, false, false, false],
      situacionais: [false, false, false, false],
      temporais: [false, false, false]
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [relatorios, setRelatorios] = useState<RelatorioGerado[]>([])
  const [activeTab, setActiveTab] = useState<'gerador' | 'relatorios' | 'datasets'>('gerador')

  useEffect(() => {
    loadRelatorios()
  }, [])

  const loadRelatorios = async () => {
    // Simulação de relatórios existentes
    const mockRelatorios: RelatorioGerado[] = [
      {
        id: '1',
        titulo: 'Padrões de Gaslighting em Relações Homoafetivas',
        nivel: 'Mestrado',
        tema: 'Violência Psicológica',
        data_geracao: '2024-11-15',
        status: 'finalizado',
        download_url: '/downloads/relatorio1.pdf'
      },
      {
        id: '2',
        titulo: 'Impacto da Violência na Saúde Mental de Mulheres',
        nivel: 'Doutorado',
        tema: 'Saúde Pública',
        data_geracao: '2024-11-10',
        status: 'revisado',
        download_url: '/downloads/relatorio2.pdf'
      },
      {
        id: '3',
        titulo: 'Perfil das Vítimas que Buscam Ajuda Digital',
        nivel: 'Graduação',
        tema: 'Comportamento Online',
        data_geracao: '2024-11-05',
        status: 'rascunho'
      }
    ]
    
    setRelatorios(mockRelatorios)
  }

  const gerarRelatorio = async () => {
    if (!config.tema_pesquisa.trim()) {
      alert('Por favor, informe um tema para a pesquisa.')
      return
    }

    setLoading(true)
    
    try {
      // Simular geração do relatório
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const novoRelatorio: RelatorioGerado = {
        id: Date.now().toString(),
        titulo: config.tema_pesquisa,
        nivel: config.nivel_academico === 'graduacao' ? 'Graduação' :
               config.nivel_academico === 'mestrado' ? 'Mestrado' : 'Doutorado',
        tema: config.area_estudo || 'Pesquisa',
        data_geracao: new Date().toISOString().split('T')[0],
        status: 'rascunho'
      }
      
      setRelatorios([novoRelatorio, ...relatorios])
      alert('Relatório gerado com sucesso! Verifique na aba "Meus Relatórios".')
      
      // Limpar formulário
      setConfig({
        ...config,
        tema_pesquisa: '',
        instituicao: '',
        area_estudo: ''
      })
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      alert('Erro ao gerar relatório. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const opcoesFiltros = {
    demograficos: [
      'Gênero e Identidade de Gênero',
      'Orientação Sexual',
      'Faixa Etária',
      'Perfil Socioeconômico'
    ],
    situacionais: [
      'Tipo de Violência (Psicológica, Física, Patrimonial)',
      'Relação com Agressor (Parceiro, Família, Trabalho)',
      'Frequência e Duração',
      'Contexto Geográfico'
    ],
    temporais: [
      'Evolução Temporal (Mensal/Anual)',
      'Períodos de Crise (Pandemia, Econômico)',
      'Tendências e Padrões Emergentes',
      'Comparativos Históricos'
    ]
  }

  const exemplosTemas = [
    'Padrões de manipulação em relacionamentos digitais',
    'Impacto da violência psicológica na saúde mental',
    'Eficácia das linhas de emergência por gênero',
    'Evolução das buscas por ajuda durante a pandemia',
    'Perfil socioeconômico das vítimas de isolamento social'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">🎓 Portal de Pesquisa Acadêmica</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Ferramenta completa para pesquisadores de Graduação, Mestrado e Doutorado. 
              Gere relatórios customizados baseados na maior base de dados sobre violência doméstica do Brasil.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('gerador')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'gerador'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🤖 Gerador de Relatórios
            </button>
            <button
              onClick={() => setActiveTab('relatorios')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'relatorios'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📚 Meus Relatórios
            </button>
            <button
              onClick={() => setActiveTab('datasets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'datasets'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Datasets Públicos
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Gerador */}
        {activeTab === 'gerador' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Configuração Principal */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Configuração da Pesquisa</h2>
                
                <div className="space-y-4">
                  {/* Nível Acadêmico */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nível Acadêmico
                    </label>
                    <select
                      value={config.nivel_academico}
                      onChange={(e) => setConfig({...config, nivel_academico: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="graduacao">🎓 Graduação (TCC)</option>
                      <option value="mestrado">📜 Mestrado (Dissertação)</option>
                      <option value="doutorado">🎖️ Doutorado (Tese)</option>
                    </select>
                  </div>

                  {/* Tema da Pesquisa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tema da Pesquisa *
                    </label>
                    <input
                      type="text"
                      value={config.tema_pesquisa}
                      onChange={(e) => setConfig({...config, tema_pesquisa: e.target.value})}
                      placeholder="Ex: Padrões de gaslighting em relações contemporâneas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-2">💡 Sugestões de temas:</p>
                      <div className="flex flex-wrap gap-2">
                        {exemplosTemas.map((tema, index) => (
                          <button
                            key={index}
                            onClick={() => setConfig({...config, tema_pesquisa: tema})}
                            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full hover:bg-purple-200"
                          >
                            {tema}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Instituição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instituição de Ensino
                    </label>
                    <input
                      type="text"
                      value={config.instituicao}
                      onChange={(e) => setConfig({...config, instituicao: e.target.value})}
                      placeholder="Ex: Universidade de São Paulo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Área de Estudo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área de Estudo
                    </label>
                    <select
                      value={config.area_estudo}
                      onChange={(e) => setConfig({...config, area_estudo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      <option value="Psicologia">Psicologia</option>
                      <option value="Serviço Social">Serviço Social</option>
                      <option value="Saúde Pública">Saúde Pública</option>
                      <option value="Sociologia">Sociologia</option>
                      <option value="Direito">Direito</option>
                      <option value="Educação">Educação</option>
                      <option value="Antropologia">Antropologia</option>
                      <option value="Ciências Sociais">Ciências Sociais</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Filtros Avançados */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filtros de Análise</h3>
                
                <div className="space-y-6">
                  {/* Demográficos */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">👥 Demográficos</h4>
                    <div className="space-y-2">
                      {opcoesFiltros.demograficos.map((opcao, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={config.filtros.demograficos[index]}
                            onChange={(e) => {
                              const novos = [...config.filtros.demograficos]
                              novos[index] = e.target.checked
                              setConfig({...config, filtros: {...config.filtros, demograficos: novos}})
                            }}
                            className="mr-3 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">{opcao}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Situacionais */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">🎭 Situacionais</h4>
                    <div className="space-y-2">
                      {opcoesFiltros.situacionais.map((opcao, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={config.filtros.situacionais[index]}
                            onChange={(e) => {
                              const novos = [...config.filtros.situacionais]
                              novos[index] = e.target.checked
                              setConfig({...config, filtros: {...config.filtros, situacionais: novos}})
                            }}
                            className="mr-3 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">{opcao}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Temporais */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">📅 Temporais</h4>
                    <div className="space-y-2">
                      {opcoesFiltros.temporais.map((opcao, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={config.filtros.temporais[index]}
                            onChange={(e) => {
                              const novos = [...config.filtros.temporais]
                              novos[index] = e.target.checked
                              setConfig({...config, filtros: {...config.filtros, temporais: novos}})
                            }}
                            className="mr-3 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">{opcao}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão Gerar */}
              <button
                onClick={gerarRelatorio}
                disabled={loading || !config.tema_pesquisa.trim()}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Gerando relatório...
                  </span>
                ) : (
                  '🚀 Gerar Relatório Acadêmico'
                )}
              </button>
            </div>

            {/* Sidebar Informações */}
            <div className="space-y-6">
              {/* Informações */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 O que será gerado</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span className="text-gray-700">Análise quantitativa dos dados</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span className="text-gray-700">Revisão sistemática da literatura</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span className="text-gray-700">Metodologia detalhada</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span className="text-gray-700">Resultados com gráficos</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span className="text-gray-700">Discussão e implicações</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span className="text-gray-700">Referências bibliográficas</span>
                  </div>
                </div>
              </div>

              {/* Formatos */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 Formatos Disponíveis</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">📄 Documento Word</span>
                    <span className="text-xs text-gray-500">.docx</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">📊 PDF Acadêmico</span>
                    <span className="text-xs text-gray-500">.pdf</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">📈 Planilha de Dados</span>
                    <span className="text-xs text-gray-500">.xlsx</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">💻 Código R/Python</span>
                    <span className="text-xs text-gray-500">.r/.py</span>
                  </div>
                </div>
              </div>

              {/* Tempo Estimado */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">⏱️ Tempo Estimado</h4>
                <div className="text-sm text-purple-700">
                  <p>Graduação: 2-3 minutos</p>
                  <p>Mestrado: 4-6 minutos</p>
                  <p>Doutorado: 8-12 minutos</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Relatórios */}
        {activeTab === 'relatorios' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📚 Meus Relatórios Gerados</h2>
              
              {relatorios.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Nenhum relatório gerado ainda
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Use o gerador para criar seu primeiro relatório acadêmico.
                  </p>
                  <button
                    onClick={() => setActiveTab('gerador')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Ir para Gerador
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {relatorios.map((relatorio) => (
                    <div key={relatorio.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {relatorio.titulo}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span>🎓 {relatorio.nivel}</span>
                            <span>📂 {relatorio.tema}</span>
                            <span>📅 {new Date(relatorio.data_geracao).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              relatorio.status === 'finalizado' ? 'bg-green-100 text-green-700' :
                              relatorio.status === 'revisado' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {relatorio.status === 'finalizado' ? '✅ Finalizado' :
                               relatorio.status === 'revisado' ? '📝 Em Revisão' : '📄 Rascunho'}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">
                            📝 Editar
                          </button>
                          {relatorio.download_url && (
                            <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                              📥 Download
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Datasets */}
        {activeTab === 'datasets' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Datasets Públicos para Pesquisa</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Dataset Completo 2024</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Atualizado</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Dados anonimizados completos de 2024 para pesquisas acadêmicas.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex justify-between">
                      <span>Registros:</span>
                      <span>34.164</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Formatos:</span>
                      <span>CSV, JSON, Excel</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tamanho:</span>
                      <span>45 MB</span>
                    </div>
                  </div>
                  <button className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                    📥 Download Dataset
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Dataset por Estado</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Regional</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Dados desagregados por estado para análises regionais.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex justify-between">
                      <span>Estados:</span>
                      <span>27 + DF</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Formatos:</span>
                      <span>CSV, Shapefile</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tamanho:</span>
                      <span>128 MB</span>
                    </div>
                  </div>
                  <button className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                    📥 Download Regional
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Séries Temporais</h3>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Temporal</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Dados mensais desde 2020 para análises de tendências.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex justify-between">
                      <span>Período:</span>
                      <span>2020-2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Formatos:</span>
                      <span>CSV, R Data</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tamanho:</span>
                      <span>23 MB</span>
                    </div>
                  </div>
                  <button className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                    📥 Download Temporal
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">API para Pesquisadores</h3>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">API</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Acesso programático aos dados via REST API.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex justify-between">
                      <span>Rate Limit:</span>
                      <span>1000/hora</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Formatos:</span>
                      <span>JSON, XML</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Documentação:</span>
                      <span>Completa</span>
                    </div>
                  </div>
                  <button className="w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm">
                    📖 Ver Documentação
                  </button>
                </div>
              </div>

              {/* Aviso Ético */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">⚖️ Uso Ético dos Dados</h4>
                <p className="text-sm text-yellow-800">
                  Ao utilizar estes datasets, você concorda em: 1) Manter o anonimato completo dos participantes, 
                  2) Citar a fonte adequadamente, 3) Compartilhar descobertas que contribuam para políticas públicas, 
                  4) Não usar para fins comerciais sem autorização explícita.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
