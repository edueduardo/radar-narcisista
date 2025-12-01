'use client'

import { ExternalLink, Globe, Newspaper, Podcast, Youtube } from 'lucide-react'
import type { WorldNewsItem } from '@/lib/frontpage-content'

// ============================================================================
// RADAR NO MUNDO - Conteúdo externo curado
// ETAPA 8.4: FanPage Viva
// ============================================================================

interface Props {
  items: WorldNewsItem[]
  theme?: 'light' | 'dark' | 'high-contrast'
}

const SOURCE_ICONS: Record<string, any> = {
  news: Newspaper,
  podcast: Podcast,
  youtube: Youtube,
  external_curated: Globe,
  external_world: Globe
}

const SOURCE_LABELS: Record<string, string> = {
  news: 'Notícia',
  podcast: 'Podcast',
  youtube: 'Vídeo',
  external_curated: 'Artigo',
  external_world: 'Mundo',
  blog: 'Blog',
  academic: 'Estudo'
}

export default function RadarNoMundoSection({ items, theme = 'dark' }: Props) {
  if (!items || items.length === 0) {
    return null // Não renderiza se não houver conteúdo
  }

  return (
    <section className={`py-16 md:py-20 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-gray-50'}`}>
      <div className="container-app">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            Radar no Mundo
          </div>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            O Que Está Acontecendo Lá Fora
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Conteúdo selecionado sobre narcisismo, abuso emocional e recuperação
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {items.map((item) => {
            const SourceIcon = SOURCE_ICONS[item.source_type] || Globe
            const sourceLabel = SOURCE_LABELS[item.source_type] || 'Conteúdo'

            return (
              <a
                key={item.id}
                href={item.original_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`group rounded-2xl p-6 transition-all hover:-translate-y-1 ${
                  theme === 'dark' 
                    ? 'bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/50' 
                    : 'bg-white shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                    <SourceIcon className={`w-4 h-4 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  </div>
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {sourceLabel}
                  </span>
                </div>

                <h3 className={`font-semibold mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.title_pt}
                </h3>

                {item.summary_pt && (
                  <p className={`text-sm line-clamp-3 mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.summary_pt}
                  </p>
                )}

                {item.topics && item.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.topics.slice(0, 3).map(topic => (
                      <span 
                        key={topic}
                        className={`px-2 py-0.5 rounded text-xs ${
                          theme === 'dark' ? 'bg-slate-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                <div className={`flex items-center gap-1 text-sm font-medium ${
                  theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                }`}>
                  Ler mais <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            )
          })}
        </div>

        <p className={`text-center text-sm mt-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          🌍 Conteúdo curado pela equipe do Radar Narcisista
        </p>
      </div>
    </section>
  )
}
