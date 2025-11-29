'use client'

import { useState } from 'react'
import { Copy, Check, Shield, FileText, Calendar } from 'lucide-react'

interface HashDisplayProps {
  documentId: string
  hash: string
  filename: string
  generatedAt: string
  hashSalvo?: boolean
  type?: 'CLARITY_TEST' | 'JOURNAL' | 'COMPLETE_REPORT' | 'PROFESSIONAL_SUMMARY'
}

/**
 * Componente para exibir informações de hash do documento
 * Usado após o download do PDF para mostrar integridade e permitir cópia
 */
export default function HashDisplay({
  documentId,
  hash,
  filename,
  generatedAt,
  hashSalvo = false,
  type
}: HashDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar hash:', err)
    }
  }

  const getTypeLabel = () => {
    switch (type) {
      case 'CLARITY_TEST': return 'Teste de Clareza'
      case 'JOURNAL': return 'Diário de Episódios'
      case 'COMPLETE_REPORT': return 'Relatório Completo'
      case 'PROFESSIONAL_SUMMARY': return 'Resumo para Profissional'
      default: return 'Documento'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 shadow-sm border border-purple-100 dark:border-slate-600">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Integridade do Documento
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getTypeLabel()} - Verificado ✅
          </p>
        </div>
      </div>

      {/* Status de salvamento */}
      {hashSalvo && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
            <Check className="w-4 h-4" />
            Hash salvo com segurança no sistema
          </p>
        </div>
      )}

      {/* Informações do documento */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl">
          <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">Arquivo</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {filename}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl">
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">Gerado em</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(generatedAt)}
            </p>
          </div>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">ID do Documento</p>
          <p className="text-sm font-mono text-gray-900 dark:text-white">
            {documentId}
          </p>
        </div>
      </div>

      {/* Hash SHA-256 */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Hash SHA-256</p>
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
          <p className="text-xs font-mono text-gray-900 dark:text-white break-all leading-relaxed">
            {hash}
          </p>
        </div>
      </div>

      {/* Botão copiar */}
      <button
        onClick={copyHash}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Hash copiado!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copiar Hash
          </>
        )}
      </button>

      {/* Informações de uso */}
      <div className="mt-4 pt-4 border-t border-purple-100 dark:border-slate-600">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 <strong>Para que serve o hash?</strong> Ele garante que o PDF não foi alterado 
          desde sua geração. Use para verificar a integridade do documento se precisar 
          apresentá-lo a profissionais.
        </p>
      </div>
    </div>
  )
}
