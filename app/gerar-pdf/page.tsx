'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Download, Lock, AlertTriangle, Calendar, Filter, CheckCircle, XCircle, Clock, Loader2, Scale } from 'lucide-react'
import { gerarEBaixarPDFCompleto, type RelatorioCompletoData } from '../../lib/pdf-generator'
import { Button } from '@/components/ui/button'

interface ConsentimentoData {
  permitido: boolean
  dataConsentimento: string | null
  prazo: number
  dataExpiracao: string | null
}

// Registros simulados
const registrosSimulados = [
  { id: 1, tipo: 'diario', data: '2024-11-20', titulo: 'Discussão sobre dinheiro', impacto: 8 },
  { id: 2, tipo: 'diario', data: '2024-11-18', titulo: 'Tratamento silencioso', impacto: 7 },
  { id: 3, tipo: 'diario', data: '2024-11-15', titulo: 'Críticas na frente dos amigos', impacto: 9 },
  { id: 4, tipo: 'teste', data: '2024-11-14', titulo: 'Teste de Clareza - Resultado: Alto Risco', impacto: null },
  { id: 5, tipo: 'diario', data: '2024-11-10', titulo: 'Gaslighting sobre conversa', impacto: 8 },
  { id: 6, tipo: 'chat', data: '2024-11-08', titulo: 'Conversa com Coach IA', impacto: null },
]

export default function GerarPDFPage() {
  const [consentimento, setConsentimento] = useState<ConsentimentoData | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [registrosSelecionados, setRegistrosSelecionados] = useState<number[]>([])
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [gerandoPDF, setGerandoPDF] = useState(false)
  const [pdfGerado, setPdfGerado] = useState(false)
  // Estados para modal de confirmação de responsabilidade
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmChecks, setConfirmChecks] = useState({
    perspectiva: false,
    naoProva: false,
    responsabilidade: false
  })

  useEffect(() => {
    const saved = localStorage.getItem('consentimento-armazenamento')
    if (saved) {
      const data = JSON.parse(saved)
      // Verificar se expirou
      if (data.dataExpiracao && new Date(data.dataExpiracao) < new Date()) {
        setConsentimento(null)
      } else {
        setConsentimento(data)
      }
    }
    setCarregando(false)
  }, [])

  const registrosFiltrados = registrosSimulados.filter(r => 
    filtroTipo === 'todos' || r.tipo === filtroTipo
  )

  const toggleRegistro = (id: number) => {
    setRegistrosSelecionados(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  const selecionarTodos = () => {
    if (registrosSelecionados.length === registrosFiltrados.length) {
      setRegistrosSelecionados([])
    } else {
      setRegistrosSelecionados(registrosFiltrados.map(r => r.id))
    }
  }

  // Função para abrir modal de confirmação
  const handleGerarPDFClick = () => {
    if (registrosSelecionados.length === 0) {
      alert('Selecione pelo menos um registro para gerar o PDF.')
      return
    }
    // Resetar checkboxes e abrir modal
    setConfirmChecks({ perspectiva: false, naoProva: false, responsabilidade: false })
    setShowConfirmModal(true)
  }

  // Função real de gerar PDF (após confirmação)
  const handleGerarPDF = async () => {
    // Fechar modal
    setShowConfirmModal(false)
    setGerandoPDF(true)
    
    try {
      // Preparar dados para o PDF
      const registrosSelecionadosData = registrosSimulados.filter(r => 
        registrosSelecionados.includes(r.id)
      )
      
      const dadosPDF: RelatorioCompletoData = {
        usuario: {
          nome: 'Usuário',
          email: 'usuario@email.com'
        },
        dataGeracao: new Date().toLocaleDateString('pt-BR'),
        teste: registrosSelecionadosData.some(r => r.tipo === 'teste') ? {
          data: new Date().toLocaleDateString('pt-BR'),
          scores: { nevoa: 12, medo: 10, limites: 11, total: 33 },
          zona: 'ALERTA',
          interpretacao: {
            nevoa: 'Nível moderado de confusão mental detectado.',
            medo: 'Presença de medo e tensão nas interações.',
            limites: 'Dificuldade em manter limites saudáveis.',
            global: 'Os resultados indicam padrões que merecem atenção profissional.'
          }
        } : undefined,
        diario: {
          periodo: 'Últimos 30 dias',
          totalEntradas: registrosSelecionadosData.filter(r => r.tipo === 'diario').length,
          entradas: registrosSelecionadosData
            .filter(r => r.tipo === 'diario')
            .map(r => ({
              data: r.data,
              titulo: r.titulo,
              contexto: 'Relacionamento',
              impacto: r.impacto ? Math.ceil(r.impacto / 2.5) : 2,
              tags: ['padrão identificado'],
              resumo: `Episódio registrado: ${r.titulo}`
            })),
          padroes: ['Gaslighting', 'Tratamento silencioso', 'Críticas públicas'],
          emocoes: ['Confusão', 'Medo', 'Tristeza', 'Ansiedade']
        },
        analiseIA: {
          padroes: ['Ciclo de abuso emocional', 'Manipulação recorrente', 'Isolamento social'],
          alertas: ['Padrão de comportamento abusivo identificado', 'Recomenda-se buscar apoio profissional'],
          sugestoes: ['Manter registro dos episódios', 'Buscar rede de apoio', 'Considerar terapia'],
          intensidadeMedia: 0.75
        }
      }
      
      // Gerar e baixar PDF REAL
      await gerarEBaixarPDFCompleto(dadosPDF)
      
      setPdfGerado(true)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    } finally {
      setGerandoPDF(false)
    }
  }

  const diasRestantes = () => {
    if (!consentimento?.dataExpiracao) return 0
    const hoje = new Date()
    const expiracao = new Date(consentimento.dataExpiracao)
    const diff = Math.ceil((expiracao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Sem consentimento
  if (!consentimento || !consentimento.permitido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Acesso Bloqueado
            </h1>
            
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Para gerar PDFs dos seus registros, você precisa primeiro dar consentimento 
              para o armazenamento dos seus dados.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 text-left">
                  <strong>Por que isso é necessário?</strong><br />
                  Para gerar um PDF, precisamos armazenar seus registros temporariamente. 
                  Sem seu consentimento explícito, não guardamos nenhum dado.
                </p>
              </div>
            </div>

            <Link
              href="/consentimento"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Gerenciar Consentimento
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // PDF gerado com sucesso
  if (pdfGerado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              PDF Gerado com Sucesso!
            </h1>
            
            <p className="text-gray-600 mb-8">
              Seu relatório foi gerado com {registrosSelecionados.length} registro(s).
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-4">
                <FileText className="w-12 h-12 text-red-500" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Relatorio_Radar_Narcisista.pdf</p>
                  <p className="text-sm text-gray-500">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => alert('Download iniciado! (Funcionalidade em desenvolvimento)')}
                className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Baixar PDF
              </button>
              <button
                onClick={() => {
                  setPdfGerado(false)
                  setRegistrosSelecionados([])
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Gerar Outro
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              <Lock className="w-3 h-3 inline mr-1" />
              O PDF foi salvo apenas no seu dispositivo. Não temos acesso a ele.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Tela principal de seleção
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Link>
        </div>

        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerar Relatório PDF
          </h1>
          <p className="text-gray-600">
            Selecione os registros que deseja incluir no PDF
          </p>
        </div>

        {/* Status do consentimento */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">Consentimento ativo</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Clock className="w-4 h-4" />
            {diasRestantes()} dias restantes
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">Filtrar por:</span>
            </div>
            {[
              { value: 'todos', label: 'Todos' },
              { value: 'diario', label: 'Diário' },
              { value: 'teste', label: 'Testes' },
              { value: 'chat', label: 'Conversas' },
            ].map((filtro) => (
              <button
                key={filtro.value}
                onClick={() => setFiltroTipo(filtro.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroTipo === filtro.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filtro.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de registros */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Header da lista */}
          <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
            <button
              onClick={selecionarTodos}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {registrosSelecionados.length === registrosFiltrados.length 
                ? 'Desmarcar todos' 
                : 'Selecionar todos'
              }
            </button>
            <span className="text-sm text-gray-500">
              {registrosSelecionados.length} de {registrosFiltrados.length} selecionados
            </span>
          </div>

          {/* Registros */}
          <div className="divide-y">
            {registrosFiltrados.map((registro) => (
              <div
                key={registro.id}
                onClick={() => toggleRegistro(registro.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  registrosSelecionados.includes(registro.id)
                    ? 'bg-purple-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    registrosSelecionados.includes(registro.id)
                      ? 'bg-purple-600 border-purple-600'
                      : 'border-gray-300'
                  }`}>
                    {registrosSelecionados.includes(registro.id) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        registro.tipo === 'diario' ? 'bg-blue-100 text-blue-700' :
                        registro.tipo === 'teste' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {registro.tipo === 'diario' ? 'Diário' :
                         registro.tipo === 'teste' ? 'Teste' : 'Chat'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(registro.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900">{registro.titulo}</p>
                  </div>

                  {registro.impacto && (
                    <div className={`text-sm font-bold px-3 py-1 rounded ${
                      registro.impacto >= 8 ? 'bg-red-100 text-red-700' :
                      registro.impacto >= 5 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {registro.impacto}/10
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botão Gerar */}
        <button
          onClick={handleGerarPDFClick}
          disabled={registrosSelecionados.length === 0 || gerandoPDF}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {gerandoPDF ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              Gerando PDF...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Gerar PDF ({registrosSelecionados.length} registros)
            </>
          )}
        </button>

        {/* Nota */}
        <p className="text-xs text-gray-500 text-center mt-4">
          <Lock className="w-3 h-3 inline mr-1" />
          O PDF será gerado localmente no seu dispositivo. Nenhum dado é enviado para servidores externos.
        </p>
      </div>

      {/* Modal de Confirmação de Responsabilidade */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Scale className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirmação de Responsabilidade</h3>
              <p className="text-sm text-gray-600 mt-2">
                Antes de gerar o PDF, confirme que você entende:
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={confirmChecks.perspectiva}
                  onChange={(e) => setConfirmChecks(prev => ({ ...prev, perspectiva: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  Este documento contém <strong>apenas minha perspectiva</strong> dos fatos. A IA não conhece o outro lado da história.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                <input
                  type="checkbox"
                  checked={confirmChecks.naoProva}
                  onChange={(e) => setConfirmChecks(prev => ({ ...prev, naoProva: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  Este documento <strong>não é prova judicial</strong>, laudo técnico ou diagnóstico clínico. Mentir para prejudicar alguém é crime (Art. 299 CP).
                </span>
              </label>

              <label className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
                <input
                  type="checkbox"
                  checked={confirmChecks.responsabilidade}
                  onChange={(e) => setConfirmChecks(prev => ({ ...prev, responsabilidade: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">
                  <strong>Assumo total responsabilidade</strong> pelo uso que fizer deste documento.
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGerarPDF}
                disabled={!confirmChecks.perspectiva || !confirmChecks.naoProva || !confirmChecks.responsabilidade}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
              >
                Confirmar e Gerar PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
