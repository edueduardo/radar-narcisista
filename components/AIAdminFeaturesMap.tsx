'use client'

import { useState, useEffect } from 'react'
import { Globe, Settings, Bot, Brain, Eye, Link2, AlertCircle } from 'lucide-react'
import { 
  getAllAdminFeatures, 
  getFeaturesUsingAI, 
  type AdminFeature,
  type AdminFeatureId 
} from '@/app/admin/admin-features-registry'

interface AIAdminFeaturesMapProps {
  aiId?: string
  aiName?: string
}

export default function AIAdminFeaturesMap({ aiId, aiName }: AIAdminFeaturesMapProps) {
  const [features, setFeatures] = useState<AdminFeature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (aiId) {
      const relatedFeatures = getFeaturesUsingAI(aiId)
      setFeatures(relatedFeatures)
    } else {
      setFeatures(getAllAdminFeatures())
    }
    setLoading(false)
  }, [aiId])

  if (loading) {
    return (
      <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-3 bg-slate-700 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getGroupIcon = (group: string) => {
    const icons = {
      'IAs': Bot,
      'Dados': Globe,
      'Usuários': Eye,
      'Sistema': Settings,
      'Outros': Brain
    }
    return icons[group as keyof typeof icons] || Brain
  }

  const getGroupColor = (group: string) => {
    const colors = {
      'IAs': 'text-purple-400 bg-purple-400/10 border-purple-500/30',
      'Dados': 'text-blue-400 bg-blue-400/10 border-blue-500/30',
      'Usuários': 'text-green-400 bg-green-400/10 border-green-500/30',
      'Sistema': 'text-orange-400 bg-orange-400/10 border-orange-500/30',
      'Outros': 'text-slate-400 bg-slate-400/10 border-slate-500/30'
    }
    return colors[group as keyof typeof colors] || colors['Outros']
  }

  // Agrupar features por grupo
  const featuresByGroup = features.reduce((acc, feature) => {
    if (!acc[feature.group]) {
      acc[feature.group] = []
    }
    acc[feature.group].push(feature)
    return acc
  }, {} as Record<string, AdminFeature[]>)

  return (
    <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Link2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {aiName ? `Onde "${aiName}" aparece no Admin` : 'Mapa de Funcionalidades do Admin'}
            </h3>
            <p className="text-sm text-slate-400">
              {aiName 
                ? `Esta IA é usada em ${features.length} tela${features.length !== 1 ? 's' : ''} do painel`
                : `${features.length} funcionalidades registradas no sistema`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Features por Grupo */}
      <div className="space-y-4">
        {Object.entries(featuresByGroup).map(([group, groupFeatures]) => {
          const GroupIcon = getGroupIcon(group)
          const groupColor = getGroupColor(group)
          
          return (
            <div key={group} className={`border rounded-lg p-4 ${groupColor}`}>
              <div className="flex items-center gap-2 mb-3">
                <GroupIcon className="w-4 h-4" />
                <h4 className="font-medium text-white">{group}</h4>
                <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">
                  {groupFeatures.length}
                </span>
              </div>
              
              <div className="grid gap-2">
                {groupFeatures.map(feature => (
                  <div key={feature.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <a 
                        href={feature.path}
                        className="flex items-center gap-2 hover:text-purple-400 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="font-medium text-white">{feature.label}</span>
                        <Globe className="w-3 h-3 text-slate-400" />
                      </a>
                      
                      {feature.isExperimental && (
                        <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                          🧪 Experimental
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <code className="px-2 py-1 bg-slate-800 rounded">
                        {feature.path}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Se nenhuma feature encontrada */}
      {features.length === 0 && aiId && (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">
            Nenhuma funcionalidade encontrada usando esta IA
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Verifique se o ID da IA está correto: <code>{aiId}</code>
          </p>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="text-xs text-slate-500">
          <p>💡 <strong>Dica:</strong> Esta visualização usa o Admin Features Registry.</p>
          <p>Para adicionar novas funcionalidades, edite <code>admin-features-registry.ts</code></p>
        </div>
      </div>
    </div>
  )
}

// Componente simplificado para embed em outros lugares
export function AIAdminFeaturesCompact({ aiId, aiName }: AIAdminFeaturesMapProps) {
  const [features, setFeatures] = useState<AdminFeature[]>([])

  useEffect(() => {
    if (aiId) {
      const relatedFeatures = getFeaturesUsingAI(aiId)
      setFeatures(relatedFeatures)
    }
  }, [aiId])

  if (!aiId || features.length === 0) {
    return null
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Link2 className="w-3 h-3 text-purple-400" />
        <span className="text-xs font-medium text-purple-400">
          Usado em {features.length} tela{features.length !== 1 ? 's' : ''} do admin
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {features.slice(0, 3).map(feature => (
          <a
            key={feature.id}
            href={feature.path}
            className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {feature.label}
          </a>
        ))}
        {features.length > 3 && (
          <span className="text-xs px-2 py-1 bg-slate-700 rounded">
            +{features.length - 3}
          </span>
        )}
      </div>
    </div>
  )
}
