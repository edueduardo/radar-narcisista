'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Upload, Shield, CheckCircle, XCircle, AlertTriangle,
  ArrowLeft, FileText, Hash, Clock
} from 'lucide-react'
import { verifyLetter, type LetterVerificationResult } from '@/lib/sealedLetters'

export default function VerificarCartaPage() {
  const [content, setContent] = useState('')
  const [hash, setHash] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<LetterVerificationResult | null>(null)
  const [mode, setMode] = useState<'file' | 'hash'>('file')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    setContent(text)
    setResult(null)
  }

  const handleVerify = async () => {
    if (mode === 'file' && !content) {
      alert('Por favor, faça upload de um arquivo primeiro.')
      return
    }

    if (mode === 'hash' && (!content || !hash)) {
      alert('Por favor, preencha o conteúdo e o hash.')
      return
    }

    setVerifying(true)
    
    try {
      const verificationResult = await verifyLetter(
        content, 
        mode === 'hash' ? hash : undefined
      )
      setResult(verificationResult)
    } catch (error) {
      console.error('Erro na verificação:', error)
      setResult({
        status: 'not_found',
        message: 'Erro ao verificar o documento. Tente novamente.',
      })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Início
        </Link>

        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verificar Carta-Selo
            </h1>
            <p className="text-gray-600">
              Confirme se um documento não foi alterado desde a selagem
            </p>
          </div>

          {/* Tabs de modo */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setMode('file')
                setResult(null)
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'file' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Upload de Arquivo
            </button>
            <button
              onClick={() => {
                setMode('hash')
                setResult(null)
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'hash' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Hash className="h-4 w-4 inline mr-2" />
              Verificar com Hash
            </button>
          </div>

          {/* Modo Upload */}
          {mode === 'file' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept=".txt,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">
                    Clique para selecionar ou arraste o arquivo
                  </p>
                  <p className="text-sm text-gray-400">
                    Formatos aceitos: .txt, .pdf
                  </p>
                </label>
              </div>

              {content && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 text-sm">
                    Arquivo carregado ({content.length} caracteres)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Modo Hash */}
          {mode === 'hash' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo do documento
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Cole aqui o conteúdo completo do documento..."
                  className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hash SHA-256 original
                </label>
                <input
                  type="text"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  placeholder="Cole aqui o hash que aparece no selo..."
                  className="w-full p-3 border border-gray-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Botão de verificar */}
          <button
            onClick={handleVerify}
            disabled={verifying || !content}
            className="w-full mt-6 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {verifying ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Verificando...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                Verificar Integridade
              </>
            )}
          </button>

          {/* Resultado */}
          {result && (
            <div className={`mt-6 p-6 rounded-xl ${
              result.status === 'match' 
                ? 'bg-green-50 border border-green-200' 
                : result.status === 'no_match'
                ? 'bg-red-50 border border-red-200'
                : 'bg-amber-50 border border-amber-200'
            }`}>
              <div className="flex items-start gap-3">
                {result.status === 'match' && (
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                )}
                {result.status === 'no_match' && (
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                )}
                {result.status === 'not_found' && (
                  <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                )}
                
                <div>
                  <p className={`font-semibold ${
                    result.status === 'match' 
                      ? 'text-green-800' 
                      : result.status === 'no_match'
                      ? 'text-red-800'
                      : 'text-amber-800'
                  }`}>
                    {result.status === 'match' && 'Documento Verificado'}
                    {result.status === 'no_match' && 'Documento Alterado'}
                    {result.status === 'not_found' && 'Documento Não Encontrado'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    result.status === 'match' 
                      ? 'text-green-700' 
                      : result.status === 'no_match'
                      ? 'text-red-700'
                      : 'text-amber-700'
                  }`}>
                    {result.message}
                  </p>
                  
                  {result.originalSealedAt && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-green-700">
                      <Clock className="h-4 w-4" />
                      <span>
                        Selado em: {new Date(result.originalSealedAt).toLocaleDateString('pt-BR')} às {new Date(result.originalSealedAt).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2 text-sm">Como funciona?</h3>
            <p className="text-sm text-gray-600">
              Quando uma Carta-Selo é criada, geramos um código único (hash SHA-256) 
              baseado no conteúdo exato do documento. Se qualquer caractere for alterado, 
              o hash muda completamente. Isso permite verificar se o documento permanece 
              idêntico ao original.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
