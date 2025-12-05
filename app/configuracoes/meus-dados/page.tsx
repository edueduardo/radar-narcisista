'use client'

/**
 * Página Meus Dados - Configurações LGPD
 * Permite exportar e solicitar exclusão de dados
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Download,
  Trash2,
  Shield,
  FileJson,
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Info
} from 'lucide-react'

export default function MeusDadosPage() {
  const [exporting, setExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient()

  const handleExport = async () => {
    setExporting(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/user/export?format=${exportFormat}`)
      
      if (!response.ok) {
        throw new Error('Erro ao exportar dados')
      }

      // Baixar arquivo
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `radar-narcisista-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setMessage({ type: 'success', text: 'Dados exportados com sucesso!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao exportar dados. Tente novamente.' })
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteRequest = async () => {
    setDeleting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/export', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmEmail: deleteConfirmEmail,
          reason: deleteReason
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao solicitar exclusão')
      }

      setMessage({ 
        type: 'success', 
        text: 'Solicitação registrada. Seus dados serão excluídos em até 30 dias. Você receberá um email de confirmação.' 
      })
      setShowDeleteModal(false)
      setDeleteConfirmEmail('')
      setDeleteReason('')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao processar solicitação' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/configuracoes" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar para Configurações</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Meus Dados</h1>
          <p className="text-gray-600">
            Gerencie seus dados pessoais conforme seus direitos garantidos pela LGPD.
          </p>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        {/* Seção: Exportar Dados */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Exportar Meus Dados
              </h2>
              <p className="text-gray-600 text-sm">
                Baixe uma cópia de todos os seus dados armazenados no Radar Narcisista.
                Inclui: perfil, testes de clareza, diário, conversas do chat, alertas de risco e mais.
              </p>
            </div>
          </div>

          {/* Formato */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Formato do arquivo
            </label>
            <div className="flex gap-4">
              <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                exportFormat === 'json' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={() => setExportFormat('json')}
                  className="sr-only"
                />
                <FileJson className={`w-5 h-5 ${exportFormat === 'json' ? 'text-blue-600' : 'text-gray-400'}`} />
                <div>
                  <p className="font-medium text-gray-900">JSON</p>
                  <p className="text-xs text-gray-500">Formato estruturado, ideal para backup</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                exportFormat === 'csv' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                  className="sr-only"
                />
                <FileText className={`w-5 h-5 ${exportFormat === 'csv' ? 'text-blue-600' : 'text-gray-400'}`} />
                <div>
                  <p className="font-medium text-gray-900">CSV</p>
                  <p className="text-xs text-gray-500">Legível em Excel/Planilhas</p>
                </div>
              </label>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Exportar Dados
              </>
            )}
          </button>
        </section>

        {/* Seção: Excluir Dados */}
        <section className="bg-white rounded-xl border border-red-200 p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-100 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Excluir Minha Conta e Dados
              </h2>
              <p className="text-gray-600 text-sm">
                Solicite a exclusão permanente de todos os seus dados. 
                Esta ação é irreversível e será processada em até 30 dias.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Atenção: Esta ação é permanente</p>
                <ul className="list-disc list-inside space-y-1 text-amber-700">
                  <li>Todos os seus registros do diário serão apagados</li>
                  <li>Histórico de conversas com a IA será excluído</li>
                  <li>Resultados de testes de clareza serão removidos</li>
                  <li>Você perderá acesso a qualquer plano ativo</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-5 h-5" />
            Solicitar Exclusão
          </button>
        </section>

        {/* Info LGPD */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-1">Seus direitos (LGPD Art. 18)</p>
              <p>
                Você tem direito a acessar, corrigir, exportar e solicitar a exclusão dos seus dados pessoais. 
                Para mais informações, consulte nossa{' '}
                <Link href="/lgpd" className="text-purple-600 hover:underline">
                  página de privacidade
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Exclusão
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              Para confirmar a exclusão permanente dos seus dados, digite seu email abaixo.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirme seu email
                </label>
                <input
                  type="email"
                  value={deleteConfirmEmail}
                  onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo (opcional)
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Nos ajude a melhorar..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteRequest}
                disabled={deleting || !deleteConfirmEmail}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Confirmar Exclusão'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
