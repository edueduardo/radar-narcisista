'use client'

/**
 * Biblioteca Viva do Mundo
 * Ideia Diamante #7: Podcasts, artigos, teses curados
 * Conteúdos externos aprovados pelo admin
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Headphones,
  FileText,
  Video,
  ExternalLink,
  Star,
  Clock,
  Globe,
  Filter,
  ChevronRight
} from 'lucide-react'

interface ExternalContent {
  id: string
  type: 'podcast' | 'article' | 'thesis' | 'video' | 'book'
  title: string
  description: string
  source: string
  sourceUrl: string
  language: 'pt' | 'en' | 'es'
  duration?: string
  author?: string
  rating?: number
  tags: string[]
  featured?: boolean
  addedAt: string
}

// Conteúdos estáticos (em produção, viriam do banco content_items)
const EXTERNAL_CONTENTS: ExternalContent[] = [
  {
    id: '1',
    type: 'podcast',
    title: 'Narcisismo: O que é e como identificar',
    description: 'Episódio completo sobre os sinais de alerta e como se proteger de relacionamentos narcisistas.',
    source: 'Mamilos Podcast',
    sourceUrl: 'https://mamilos.com.br',
    language: 'pt',
    duration: '1h 23min',
    rating: 4.8,
    tags: ['narcisismo', 'relacionamentos', 'psicologia'],
    featured: true,
    addedAt: '2024-12-01'
  },
  {
    id: '2',
    type: 'article',
    title: 'Gaslighting: A manipulação que faz você duvidar de si',
    description: 'Artigo científico explicando os mecanismos psicológicos por trás do gaslighting.',
    source: 'Psychology Today',
    sourceUrl: 'https://psychologytoday.com',
    language: 'en',
    author: 'Dr. Robin Stern',
    rating: 4.9,
    tags: ['gaslighting', 'manipulação', 'saúde mental'],
    featured: true,
    addedAt: '2024-11-28'
  },
  {
    id: '3',
    type: 'thesis',
    title: 'Violência psicológica em relacionamentos íntimos',
    description: 'Tese de doutorado da USP sobre os impactos da violência psicológica na saúde mental.',
    source: 'USP - Biblioteca Digital',
    sourceUrl: 'https://teses.usp.br',
    language: 'pt',
    author: 'Maria Silva Santos',
    tags: ['violência psicológica', 'pesquisa', 'acadêmico'],
    addedAt: '2024-11-20'
  },
  {
    id: '4',
    type: 'video',
    title: 'Como reconhecer um narcisista',
    description: 'Vídeo educativo com psicóloga especialista explicando os padrões de comportamento.',
    source: 'TED Talks',
    sourceUrl: 'https://ted.com',
    language: 'en',
    duration: '18min',
    rating: 4.7,
    tags: ['narcisismo', 'educação', 'autoconhecimento'],
    addedAt: '2024-11-15'
  },
  {
    id: '5',
    type: 'book',
    title: 'Por que fazemos o que fazemos?',
    description: 'Livro sobre comportamento humano e padrões de relacionamento.',
    source: 'Amazon',
    sourceUrl: 'https://amazon.com.br',
    language: 'pt',
    author: 'Mario Sergio Cortella',
    rating: 4.6,
    tags: ['comportamento', 'filosofia', 'relacionamentos'],
    addedAt: '2024-11-10'
  },
  {
    id: '6',
    type: 'podcast',
    title: 'Healing from Narcissistic Abuse',
    description: 'Série de episódios sobre recuperação após relacionamentos abusivos.',
    source: 'Spotify',
    sourceUrl: 'https://spotify.com',
    language: 'en',
    duration: '45min',
    rating: 4.8,
    tags: ['recuperação', 'healing', 'abuso narcisista'],
    addedAt: '2024-11-05'
  }
]

const TYPE_CONFIG = {
  podcast: { icon: Headphones, color: 'text-purple-500', bg: 'bg-purple-100', label: 'Podcast' },
  article: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Artigo' },
  thesis: { icon: BookOpen, color: 'text-green-500', bg: 'bg-green-100', label: 'Tese' },
  video: { icon: Video, color: 'text-red-500', bg: 'bg-red-100', label: 'Vídeo' },
  book: { icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-100', label: 'Livro' }
}

const LANGUAGE_FLAGS: Record<string, string> = {
  pt: '🇧🇷',
  en: '🇺🇸',
  es: '🇪🇸'
}

export default function BibliotecaViva() {
  const [contents, setContents] = useState<ExternalContent[]>(EXTERNAL_CONTENTS)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)

  // Filtrar conteúdos
  const filteredContents = contents.filter(c => {
    if (selectedType && c.type !== selectedType) return false
    if (selectedLanguage && c.language !== selectedLanguage) return false
    return true
  })

  // Separar featured
  const featuredContents = filteredContents.filter(c => c.featured)
  const regularContents = filteredContents.filter(c => !c.featured)

  return (
    <section className="py-16 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            Biblioteca Viva do Mundo
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Conteúdos Curados Para Você
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Podcasts, artigos, vídeos e teses selecionados por nossa equipe. 
            Todo conteúdo passa por curadoria antes de ser publicado.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {/* Tipo */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedType(null)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedType === null 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedType(selectedType === key ? null : key)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedType === key 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Idioma */}
          <div className="flex gap-1">
            {Object.entries(LANGUAGE_FLAGS).map(([lang, flag]) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(selectedLanguage === lang ? null : lang)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedLanguage === lang 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {flag}
              </button>
            ))}
          </div>
        </div>

        {/* Featured */}
        {featuredContents.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Destaques
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {featuredContents.map(content => (
                <ContentCard key={content.id} content={content} featured />
              ))}
            </div>
          </div>
        )}

        {/* Lista regular */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regularContents.map(content => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>

        {/* Empty state */}
        {filteredContents.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum conteúdo encontrado com esses filtros.</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link 
            href="/biblioteca"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            Ver Biblioteca Completa
            <ChevronRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-500 mt-3">
            Quer sugerir um conteúdo?{' '}
            <a href="mailto:conteudo@radarnarcisista.com.br" className="text-indigo-600 hover:underline">
              Envie para nós
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

function ContentCard({ content, featured = false }: { content: ExternalContent; featured?: boolean }) {
  const config = TYPE_CONFIG[content.type]
  const Icon = config.icon

  return (
    <a
      href={content.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all hover:border-indigo-200 ${
        featured ? 'ring-2 ring-amber-200' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${config.bg}`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          <span className={`text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">{LANGUAGE_FLAGS[content.language]}</span>
          {featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
        </div>
      </div>

      {/* Título e descrição */}
      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {content.title}
      </h4>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {content.description}
      </p>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          {content.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {content.duration}
            </span>
          )}
          {content.rating && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500" />
              {content.rating}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 text-indigo-600">
          {content.source}
          <ExternalLink className="w-3 h-3" />
        </span>
      </div>

      {/* Tags */}
      {content.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {content.tags.slice(0, 3).map(tag => (
            <span 
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  )
}
