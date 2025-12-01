'use client'

import Link from 'next/link'
import { BookOpen, Lock, Star, ChevronRight, GraduationCap } from 'lucide-react'
import type { AcademyCollection } from '@/lib/frontpage-content'

// ============================================================================
// RADAR ACADEMY - Trilhas de aprendizado
// ETAPA 8.4: FanPage Viva
// ============================================================================

interface Props {
  collections: AcademyCollection[]
  theme?: 'light' | 'dark' | 'high-contrast'
}

export default function RadarAcademySection({ collections, theme = 'dark' }: Props) {
  if (!collections || collections.length === 0) {
    return null // Não renderiza se não houver coleções
  }

  return (
    <section className={`py-16 md:py-20 ${theme === 'dark' ? 'bg-gradient-to-br from-purple-950/30 to-indigo-950/30' : 'bg-gradient-to-br from-purple-50 to-indigo-50'}`}>
      <div className="container-app">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium mb-4">
            <GraduationCap className="w-4 h-4" />
            Radar Academy
          </div>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Trilhas de Aprendizado
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Conteúdo organizado para você entender e se proteger no seu ritmo
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/educacao/${collection.slug}`}
              className={`group rounded-2xl p-6 transition-all hover:-translate-y-1 relative overflow-hidden ${
                theme === 'dark' 
                  ? 'bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/50' 
                  : 'bg-white shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                {collection.is_featured && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    <Star className="w-3 h-3" /> Destaque
                  </span>
                )}
                {collection.is_premium && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                  }`}>
                    <Lock className="w-3 h-3" /> Premium
                  </span>
                )}
              </div>

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
              }`}>
                <BookOpen className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>

              {/* Content */}
              <h3 className={`font-bold text-lg mb-2 group-hover:text-purple-400 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {collection.name_pt}
              </h3>

              {collection.description_pt && (
                <p className={`text-sm line-clamp-2 mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {collection.description_pt}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/30">
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {collection.item_count} {collection.item_count === 1 ? 'lição' : 'lições'}
                </span>
                <span className={`flex items-center gap-1 text-sm font-medium ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  Começar <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link 
            href="/educacao"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              theme === 'dark' 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            Ver todas as trilhas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
