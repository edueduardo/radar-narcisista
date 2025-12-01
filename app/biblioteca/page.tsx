'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  BookOpen, 
  Search,
  ChevronRight,
  AlertTriangle,
  Heart,
  Brain,
  Shield,
  Users,
  MessageCircle
} from 'lucide-react'

// ============================================================================
// BIBLIOTECA - Conteúdos sobre Narcisismo
// ============================================================================

const CATEGORIAS = [
  {
    id: 'gaslighting',
    title: 'Gaslighting',
    description: 'Entenda a manipulação da realidade',
    icon: Brain,
    color: 'purple',
    artigos: [
      { title: 'O que é Gaslighting?', slug: 'o-que-e-gaslighting' },
      { title: 'Sinais de que você está sofrendo Gaslighting', slug: 'sinais-gaslighting' },
      { title: 'Como se proteger do Gaslighting', slug: 'protecao-gaslighting' },
    ]
  },
  {
    id: 'invalidacao',
    title: 'Invalidação Emocional',
    description: 'Quando seus sentimentos são minimizados',
    icon: Heart,
    color: 'pink',
    artigos: [
      { title: 'O que é Invalidação Emocional?', slug: 'o-que-e-invalidacao' },
      { title: 'Frases comuns de invalidação', slug: 'frases-invalidacao' },
      { title: 'Recuperando sua autoestima', slug: 'recuperando-autoestima' },
    ]
  },
  {
    id: 'manipulacao',
    title: 'Manipulação',
    description: 'Táticas de controle e poder',
    icon: Users,
    color: 'blue',
    artigos: [
      { title: 'Tipos de manipulação emocional', slug: 'tipos-manipulacao' },
      { title: 'Love bombing: o que é?', slug: 'love-bombing' },
      { title: 'Ciclo do abuso narcisista', slug: 'ciclo-abuso' },
    ]
  },
  {
    id: 'protecao',
    title: 'Proteção e Segurança',
    description: 'Como se proteger e sair',
    icon: Shield,
    color: 'red',
    artigos: [
      { title: 'Criando um plano de segurança', slug: 'plano-seguranca' },
      { title: 'Recursos de ajuda no Brasil', slug: 'recursos-ajuda' },
      { title: 'Quando buscar ajuda profissional', slug: 'ajuda-profissional' },
    ]
  },
]

export default function BibliotecaPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCategorias = CATEGORIAS.filter(cat => 
    cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.artigos.some(art => art.title.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-sm border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h1 className="font-bold text-white">Biblioteca</h1>
                <p className="text-xs text-gray-400">Conteúdos sobre narcisismo</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar artigos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Aviso */}
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-200">
              <strong>Lembrete:</strong> Este conteúdo é educativo e não substitui acompanhamento profissional.
              "Às vezes acreditamos em um mentiroso e culpamos um inocente."
            </p>
          </div>
        </div>
      </div>

      {/* Categorias */}
      <main className="max-w-4xl mx-auto px-4 pb-8">
        <div className="space-y-6">
          {filteredCategorias.map((categoria) => {
            const Icon = categoria.icon
            const colorClasses = {
              purple: 'bg-purple-600/20 text-purple-400 border-purple-900/50',
              pink: 'bg-pink-600/20 text-pink-400 border-pink-900/50',
              blue: 'bg-blue-600/20 text-blue-400 border-blue-900/50',
              red: 'bg-red-600/20 text-red-400 border-red-900/50',
            }
            
            return (
              <div key={categoria.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[categoria.color as keyof typeof colorClasses]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">{categoria.title}</h2>
                      <p className="text-xs text-gray-400">{categoria.description}</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-slate-700/50">
                  {categoria.artigos.map((artigo) => (
                    <Link key={artigo.slug} href={`/biblioteca/${artigo.slug}`}>
                      <div className="p-4 hover:bg-slate-800 transition-colors flex items-center justify-between">
                        <span className="text-sm text-gray-300">{artigo.title}</span>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {filteredCategorias.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum artigo encontrado</p>
          </div>
        )}
      </main>
    </div>
  )
}
