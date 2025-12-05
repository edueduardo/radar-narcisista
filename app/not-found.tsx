'use client'

import Link from 'next/link'
import { Home, Search, ArrowLeft, Heart, MessageCircle, BookOpen } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Ilustração */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-[150px] font-bold text-purple-200 dark:text-purple-900 leading-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center animate-pulse">
                <Search className="w-12 h-12 text-purple-500 dark:text-purple-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Página não encontrada
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Parece que você se perdeu. Mas não se preocupe, 
          estamos aqui para te ajudar a encontrar o caminho.
        </p>

        {/* Botões principais */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Home className="w-5 h-5" />
            Ir para o início
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl font-semibold border border-gray-200 dark:border-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
        </div>

        {/* Links úteis */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Talvez você esteja procurando:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link 
              href="/teste-clareza"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Teste de Clareza</span>
            </Link>
            
            <Link 
              href="/diario"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors group"
            >
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Diário</span>
            </Link>
            
            <Link 
              href="/chat"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Coach IA</span>
            </Link>
          </div>
        </div>

        {/* Mensagem de apoio */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          💜 Lembre-se: você não está sozinha(o).
        </p>
      </div>
    </div>
  )
}
