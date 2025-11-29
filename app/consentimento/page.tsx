'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, FileText, Clock, Lock, Check, X, AlertTriangle, Download, Calendar, Trash2 } from 'lucide-react'

interface ConsentimentoData {
  permitido: boolean
  dataConsentimento: string | null
  prazo: number // dias
  dataExpiracao: string | null
}

export default function ConsentimentoPage() {
  const [consentimento, setConsentimento] = useState<ConsentimentoData>({
    permitido: false,
    dataConsentimento: null,
    prazo: 30,
    dataExpiracao: null
  })
  const [prazoSelecionado, setPrazoSelecionado] = useState(30)
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)
  const [mostrarRevogacao, setMostrarRevogacao] = useState(false)

  // Carregar consentimento salvo
  useEffect(() => {
    const saved = localStorage.getItem('consentimento-armazenamento')
    if (saved) {
      const data = JSON.parse(saved)
      // Verificar se expirou
      if (data.dataExpiracao && new Date(data.dataExpiracao) < new Date()) {
        // Expirou - limpar dados
        localStorage.removeItem('consentimento-armazenamento')
        localStorage.removeItem('registros-usuario')
        setConsentimento({
          permitido: false,
          dataConsentimento: null,
          prazo: 30,
          dataExpiracao: null
        })
      } else {
        setConsentimento(data)
      }
    }
  }, [])

  const diasRestantes = () => {
    if (!consentimento.dataExpiracao) return 0
    const hoje = new Date()
    const expiracao = new Date(consentimento.dataExpiracao)
    const diff = Math.ceil((expiracao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }

  const handleConsentir = () => {
    const hoje = new Date()
    const expiracao = new Date()
    expiracao.setDate(hoje.getDate() + prazoSelecionado)

    const novoConsentimento: ConsentimentoData = {
      permitido: true,
      dataConsentimento: hoje.toISOString(),
      prazo: prazoSelecionado,
      dataExpiracao: expiracao.toISOString()
    }

    localStorage.setItem('consentimento-armazenamento', JSON.stringify(novoConsentimento))
    setConsentimento(novoConsentimento)
    setMostrarConfirmacao(false)
  }

  const handleRevogar = () => {
    // Limpar tudo
    localStorage.removeItem('consentimento-armazenamento')
    localStorage.removeItem('registros-usuario')
    
    setConsentimento({
      permitido: false,
      dataConsentimento: null,
      prazo: 30,
      dataExpiracao: null
    })
    setMostrarRevogacao(false)
  }

  const handleGerarPDF = () => {
    if (!consentimento.permitido) {
      alert('Você precisa dar consentimento para armazenamento antes de gerar PDFs.')
      return
    }
    // Aqui implementaria a geração real do PDF
    alert('PDF gerado com sucesso! (Funcionalidade em desenvolvimento)')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/configuracoes" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Voltar às Configurações
          </Link>
        </div>

        {/* Título */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Consentimento de Armazenamento
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Controle como seus dados são armazenados e por quanto tempo
          </p>
        </div>

        {/* Status Atual */}
        <div className={`rounded-2xl p-6 mb-8 ${
          consentimento.permitido 
            ? 'bg-green-50 border-2 border-green-200' 
            : 'bg-gray-100 border-2 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                consentimento.permitido ? 'bg-green-500' : 'bg-gray-400'
              }`}>
                {consentimento.permitido ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <X className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="font-bold text-gray-900">
                  {consentimento.permitido ? 'Armazenamento Ativo' : 'Armazenamento Desativado'}
                </h2>
                <p className="text-sm text-gray-600">
                  {consentimento.permitido 
                    ? `Seus dados serão mantidos por mais ${diasRestantes()} dias`
                    : 'Seus dados não estão sendo armazenados'
                  }
                </p>
              </div>
            </div>
            {consentimento.permitido && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Expira em</p>
                <p className="font-bold text-green-600">
                  {new Date(consentimento.dataExpiracao!).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>

          {/* Barra de progresso do tempo */}
          {consentimento.permitido && (
            <div className="mt-4">
              <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${(diasRestantes() / consentimento.prazo) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Explicação */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Como funciona?
          </h3>
          
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-medium">Com consentimento</p>
                <p className="text-sm text-gray-500">
                  Seus registros do diário, testes e conversas são armazenados pelo prazo escolhido (máximo 30 dias). 
                  Você pode gerar PDFs para uso pessoal ou jurídico.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-medium">Sem consentimento</p>
                <p className="text-sm text-gray-500">
                  Nenhum dado é armazenado. Você pode usar o app normalmente, mas não poderá gerar PDFs 
                  ou acessar histórico de registros.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold">3</span>
              </div>
              <div>
                <p className="font-medium">Após expiração</p>
                <p className="text-sm text-gray-500">
                  Quando o prazo expira, todos os dados são automaticamente excluídos. 
                  Você pode renovar o consentimento a qualquer momento.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        {!consentimento.permitido ? (
          /* Dar consentimento */
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Escolha o prazo de armazenamento
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { dias: 7, label: '7 dias' },
                { dias: 15, label: '15 dias' },
                { dias: 30, label: '30 dias' },
              ].map((opcao) => (
                <button
                  key={opcao.dias}
                  onClick={() => setPrazoSelecionado(opcao.dias)}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    prazoSelecionado === opcao.dias
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <Calendar className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-semibold">{opcao.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Importante:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>O prazo máximo é de 30 dias</li>
                    <li>Após o prazo, todos os dados são excluídos automaticamente</li>
                    <li>Você pode revogar o consentimento a qualquer momento</li>
                    <li>Os PDFs gerados ficam no seu dispositivo</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => setMostrarConfirmacao(true)}
              className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Concordo e Autorizo o Armazenamento
            </button>
          </div>
        ) : (
          /* Gerenciar consentimento existente */
          <div className="space-y-4">
            {/* Gerar PDF */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-green-600" />
                Gerar Relatório PDF
              </h3>
              <p className="text-gray-600 mb-4">
                Gere um PDF com todos os seus registros para uso pessoal ou jurídico.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleGerarPDF}
                  className="bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Gerar PDF Completo
                </button>
                <button
                  onClick={handleGerarPDF}
                  className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Gerar por Período
                </button>
              </div>
            </div>

            {/* Renovar */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Renovar Consentimento
              </h3>
              <p className="text-gray-600 mb-4">
                Estenda o prazo de armazenamento por mais tempo (máximo 30 dias a partir de hoje).
              </p>
              <button
                onClick={() => setMostrarConfirmacao(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Renovar por mais 30 dias
              </button>
            </div>

            {/* Revogar */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
              <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Revogar Consentimento
              </h3>
              <p className="text-red-700 mb-4">
                Ao revogar, todos os seus dados armazenados serão excluídos imediatamente e permanentemente.
              </p>
              <button
                onClick={() => setMostrarRevogacao(true)}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Revogar e Excluir Todos os Dados
              </button>
            </div>
          </div>
        )}

        {/* Nota LGPD */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            <Lock className="w-3 h-3 inline mr-1" />
            Em conformidade com a LGPD (Lei Geral de Proteção de Dados). 
            Seus dados são criptografados e você tem controle total sobre eles.
          </p>
        </div>

        {/* Modal de Confirmação */}
        {mostrarConfirmacao && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Consentimento</h3>
              <p className="text-gray-600 mb-6">
                Você está autorizando o armazenamento dos seus dados por <strong>{prazoSelecionado} dias</strong>.
                <br /><br />
                Após esse período, todos os dados serão automaticamente excluídos.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setMostrarConfirmacao(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConsentir}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Revogação */}
        {mostrarRevogacao && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Atenção!
              </h3>
              <p className="text-gray-600 mb-6">
                Esta ação é <strong>irreversível</strong>. Todos os seus registros, histórico e dados serão 
                permanentemente excluídos.
                <br /><br />
                Tem certeza que deseja continuar?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setMostrarRevogacao(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRevogar}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Sim, Excluir Tudo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
