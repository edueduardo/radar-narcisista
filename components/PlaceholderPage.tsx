'use client'

import { Construction, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface PlaceholderPageProps {
  title: string
  description: string
  icon?: string
  backUrl?: string
  features?: string[]
}

export default function PlaceholderPage({
  title,
  description,
  icon = '🚧',
  backUrl = '/admin',
  features = []
}: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mb-6">
          <span className="text-7xl">{icon}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-3">{title}</h1>
        
        {/* Description */}
        <p className="text-gray-400 mb-8">{description}</p>

        {/* Features Preview */}
        {features.length > 0 && (
          <div className="bg-slate-800/50 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Em breve você poderá:</span>
            </div>
            <ul className="space-y-2">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-8">
          <Construction className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 text-sm font-medium">Em desenvolvimento</span>
        </div>

        {/* Back Button */}
        <div>
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Admin
          </Link>
        </div>
      </div>
    </div>
  )
}
