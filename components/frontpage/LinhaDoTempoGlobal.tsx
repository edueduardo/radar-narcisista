'use client'

/**
 * Linha do Tempo Global
 * Ideia Diamante #2: Eventos do mundo (leis, estudos, notícias)
 * Mostra acontecimentos relevantes sobre narcisismo e abuso
 */

import { useEffect, useState } from 'react'
import { 
  Globe, 
  Scale, 
  BookOpen, 
  Newspaper, 
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface GlobalEvent {
  id: string
  date: string
  title: string
  description: string
  category: 'law' | 'study' | 'news' | 'milestone'
  country?: string
  source?: string
  sourceUrl?: string
}

// Eventos estáticos (em produção, viriam do banco)
const GLOBAL_EVENTS: GlobalEvent[] = [
  {
    id: '1',
    date: '2024-12-01',
    title: 'Lei Maria da Penha completa 18 anos',
    description: 'A Lei 11.340/2006 continua sendo referência mundial no combate à violência doméstica.',
    category: 'law',
    country: 'Brasil',
    source: 'Senado Federal'
  },
  {
    id: '2',
    date: '2024-11-15',
    title: 'Novo estudo sobre coparentalidade narcisista',
    description: 'Pesquisa da Universidade de Stanford revela impactos de longo prazo em filhos de relacionamentos com narcisistas.',
    category: 'study',
    country: 'EUA',
    source: 'Stanford Psychology',
    sourceUrl: 'https://stanford.edu'
  },
  {
    id: '3',
    date: '2024-10-20',
    title: 'OMS reconhece coercive control como forma de abuso',
    description: 'Organização Mundial da Saúde inclui controle coercitivo na classificação de violência psicológica.',
    category: 'milestone',
    country: 'Internacional',
    source: 'WHO'
  },
  {
    id: '4',
    date: '2024-09-10',
    title: 'Reino Unido aprova lei contra controle coercitivo',
    description: 'Nova legislação criminaliza padrões de comportamento controlador em relacionamentos.',
    category: 'law',
    country: 'Reino Unido',
    source: 'UK Parliament'
  },
  {
    id: '5',
    date: '2024-08-05',
    title: 'Estudo brasileiro sobre gaslighting',
    description: 'USP publica pesquisa sobre os efeitos do gaslighting na saúde mental de vítimas.',
    category: 'study',
    country: 'Brasil',
    source: 'USP'
  },
  {
    id: '6',
    date: '2024-07-22',
    title: 'Campanha global contra abuso narcisista',
    description: 'ONU lança campanha de conscientização sobre abuso emocional em relacionamentos.',
    category: 'news',
    country: 'Internacional',
    source: 'ONU Mulheres'
  }
]

const CATEGORY_CONFIG = {
  law: { icon: Scale, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Legislação' },
  study: { icon: BookOpen, color: 'text-green-500', bg: 'bg-green-100', label: 'Estudo' },
  news: { icon: Newspaper, color: 'text-purple-500', bg: 'bg-purple-100', label: 'Notícia' },
  milestone: { icon: Globe, color: 'text-amber-500', bg: 'bg-amber-100', label: 'Marco' }
}

export default function LinhaDoTempoGlobal() {
  const [events, setEvents] = useState<GlobalEvent[]>(GLOBAL_EVENTS)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const eventsPerPage = 3

  // Filtrar eventos
  const filteredEvents = selectedCategory 
    ? events.filter(e => e.category === selectedCategory)
    : events

  // Paginação
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage)
  const paginatedEvents = filteredEvents.slice(
    currentPage * eventsPerPage,
    (currentPage + 1) * eventsPerPage
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            Linha do Tempo Global
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            O Mundo Está Acordando
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Acompanhe leis, estudos e marcos importantes sobre narcisismo e abuso emocional ao redor do mundo.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => { setSelectedCategory(null); setCurrentPage(0) }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const Icon = config.icon
            return (
              <button
                key={key}
                onClick={() => { setSelectedCategory(key); setCurrentPage(0) }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === key 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </button>
            )
          })}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Linha central (desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

          <div className="space-y-8">
            {paginatedEvents.map((event, index) => {
              const config = CATEGORY_CONFIG[event.category]
              const Icon = config.icon
              const isLeft = index % 2 === 0

              return (
                <div 
                  key={event.id}
                  className={`relative flex items-center ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Card */}
                  <div className={`w-full md:w-5/12 ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                      {/* Header do card */}
                      <div className="flex items-start justify-between mb-3">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <span className={`text-xs font-medium ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                        {event.country && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {event.country}
                          </span>
                        )}
                      </div>

                      {/* Conteúdo */}
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {event.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(event.date)}
                        </span>
                        {event.source && (
                          event.sourceUrl ? (
                            <a 
                              href={event.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                              {event.source}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-gray-500">{event.source}</span>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ponto central (desktop) */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-indigo-500" />

                  {/* Espaço do outro lado */}
                  <div className="hidden md:block w-5/12" />
                </div>
              )
            })}
          </div>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="text-sm text-gray-600">
              {currentPage + 1} de {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm mb-4">
            Quer sugerir um evento ou estudo relevante?
          </p>
          <a 
            href="mailto:conteudo@radarnarcisista.com.br"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Envie sua sugestão →
          </a>
        </div>
      </div>
    </section>
  )
}
