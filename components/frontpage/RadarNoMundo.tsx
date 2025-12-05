'use client'

import Link from 'next/link'
import { ExternalLink, Calendar, Eye, Tag } from 'lucide-react'

interface ContentItem {
  id: string
  slug: string
  title: string
  summary: string
  type: string
  tags: string[]
  published_at: string
  view_count: number
  featured_image?: string
}

interface RadarNoMundoProps {
  content?: ContentItem[]
}

const TYPE_LABELS: Record<string, string> = {
  article: 'Artigo',
  news: 'Notícia',
  study: 'Estudo',
  external_link: 'Link Externo',
  video: 'Vídeo',
}

const TYPE_COLORS: Record<string, string> = {
  article: 'bg-blue-100 text-blue-700',
  news: 'bg-green-100 text-green-700',
  study: 'bg-purple-100 text-purple-700',
  external_link: 'bg-orange-100 text-orange-700',
  video: 'bg-red-100 text-red-700',
}

export default function RadarNoMundo({ content = [] }: RadarNoMundoProps) {
  if (content.length === 0) {
    return null
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🌍 Radar no Mundo
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Conteúdos curados sobre narcisismo, relacionamentos abusivos e recuperação
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.slice(0, 6).map(item => (
            <Link
              key={item.id}
              href={`/conteudo/${item.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-purple-200"
            >
              {/* Imagem ou placeholder */}
              <div className="h-40 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                {item.featured_image ? (
                  <img 
                    src={item.featured_image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">📰</span>
                )}
              </div>
              
              {/* Conteúdo */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${TYPE_COLORS[item.type] || TYPE_COLORS.article}`}>
                    {TYPE_LABELS[item.type] || item.type}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {item.summary}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.published_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {item.view_count} views
                  </span>
                </div>
                
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.slice(0, 3).map(tag => (
                      <span 
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/conteudos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors"
          >
            Ver todos os conteúdos
            <ExternalLink className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
