'use client'

import Link from 'next/link'
import { BookOpen, Clock, Star, Lock } from 'lucide-react'

interface Track {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  color: string
  level: string
  is_premium: boolean
  display_order: number
}

interface RadarAcademyProps {
  tracks?: Track[]
}

const LEVEL_LABELS: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

const COLOR_CLASSES: Record<string, string> = {
  purple: 'from-purple-500 to-purple-600',
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  pink: 'from-pink-500 to-pink-600',
  indigo: 'from-indigo-500 to-indigo-600',
}

export default function RadarAcademy({ tracks = [] }: RadarAcademyProps) {
  if (tracks.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🎓 Radar Academy
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Trilhas de aprendizado para sua jornada de clareza e recuperação
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map(track => (
            <Link
              key={track.id}
              href={`/academy/${track.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-purple-200"
            >
              {/* Header com gradiente */}
              <div className={`h-24 bg-gradient-to-r ${COLOR_CLASSES[track.color] || COLOR_CLASSES.purple} flex items-center justify-center`}>
                <span className="text-4xl">{track.icon}</span>
              </div>
              
              {/* Conteúdo */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {LEVEL_LABELS[track.level] || track.level}
                  </span>
                  {track.is_premium && (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3" />
                      Premium
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {track.title}
                </h3>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {track.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-500">
                    <BookOpen className="w-4 h-4" />
                    Trilha completa
                  </span>
                  {track.is_premium ? (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Lock className="w-4 h-4" />
                      Desbloqueie
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">
                      Gratuito
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
          >
            Ver todas as trilhas
            <BookOpen className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
