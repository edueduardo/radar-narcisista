'use client'

/**
 * Builder.io - Editor Visual Drag & Drop
 * Permite editar a frontpage visualmente
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  ExternalLink, 
  Settings, 
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  Copy,
  Check
} from 'lucide-react'

// Chave pública do Builder.io (você precisa criar uma conta em builder.io)
const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY || ''

export default function BuilderAdminPage() {
  const [hasApiKey, setHasApiKey] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setHasApiKey(!!BUILDER_API_KEY && BUILDER_API_KEY !== '')
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin" 
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🏗️ Builder.io
          </h1>
          <p className="text-gray-400">Editor visual drag & drop para a frontpage</p>
        </div>
      </div>

      {/* Status */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Card de Status */}
        <div className={`p-6 rounded-xl border ${hasApiKey ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
          <div className="flex items-start gap-4">
            {hasApiKey ? (
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
            )}
            <div>
              <h2 className="font-semibold text-lg">
                {hasApiKey ? 'Builder.io Configurado!' : 'Configuração Necessária'}
              </h2>
              <p className="text-gray-400 mt-1">
                {hasApiKey 
                  ? 'Sua API key do Builder.io está configurada. Você pode começar a editar!'
                  : 'Para usar o Builder.io, você precisa criar uma conta e configurar a API key.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Instruções de Setup */}
        {!hasApiKey && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">📋 Como Configurar</h3>
            
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <p className="font-medium">Crie uma conta no Builder.io</p>
                  <a 
                    href="https://builder.io/signup" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm mt-1"
                  >
                    builder.io/signup <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </li>
              
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <p className="font-medium">Crie um novo Space</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Após criar a conta, crie um Space para o Radar Narcisista
                  </p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <p className="font-medium">Copie sua Public API Key</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Vá em Settings → API Keys → Public API Key
                  </p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <p className="font-medium">Adicione ao .env.local</p>
                  <div className="mt-2 bg-slate-900 rounded-lg p-3 flex items-center justify-between">
                    <code className="text-green-400 text-sm">NEXT_PUBLIC_BUILDER_API_KEY=sua_chave_aqui</code>
                    <button
                      onClick={() => copyToClipboard('NEXT_PUBLIC_BUILDER_API_KEY=')}
                      className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </li>
              
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <div>
                  <p className="font-medium">Reinicie o servidor</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Execute <code className="bg-slate-700 px-1 rounded">npm run dev</code> novamente
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Links Úteis */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-4">🔗 Links Úteis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="https://builder.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                🏗️
              </div>
              <div>
                <p className="font-medium">Builder.io</p>
                <p className="text-sm text-gray-400">Painel do Builder.io</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
            </a>
            
            <a 
              href="https://www.builder.io/c/docs/getting-started" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                📚
              </div>
              <div>
                <p className="font-medium">Documentação</p>
                <p className="text-sm text-gray-400">Guia de início rápido</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
            </a>
            
            <Link 
              href="/admin/frontpage-editor"
              className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                📝
              </div>
              <div>
                <p className="font-medium">Editor Formulários</p>
                <p className="text-sm text-gray-400">Editor simples por campos</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/frontpage-visual"
              className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                🎨
              </div>
              <div>
                <p className="font-medium">Editor Visual</p>
                <p className="text-sm text-gray-400">Preview em tempo real</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Se configurado, mostrar botão para abrir */}
        {hasApiKey && (
          <div className="flex gap-4">
            <a
              href="https://builder.io/content"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition-colors"
            >
              <Settings className="w-5 h-5" />
              Abrir Editor Builder.io
              <ExternalLink className="w-4 h-4" />
            </a>
            
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-colors"
            >
              <Eye className="w-5 h-5" />
              Ver Site
            </Link>
          </div>
        )}

        {/* Info sobre alternativas */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-sm text-gray-400">
          <p>
            <strong className="text-white">💡 Dica:</strong> Enquanto não configura o Builder.io, 
            você pode usar o <Link href="/admin/frontpage-editor" className="text-purple-400 hover:underline">Editor por Formulários</Link> ou 
            o <Link href="/admin/frontpage-visual" className="text-purple-400 hover:underline">Editor Visual</Link> que já estão funcionando!
          </p>
        </div>
      </div>
    </div>
  )
}
