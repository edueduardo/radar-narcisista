"use client"

import { useState } from "react"
import { 
  ABUSE_TAGS, 
  ABUSE_TAGS_BY_CATEGORY, 
  CATEGORY_COLORS, 
  AbuseTag, 
  AbuseTagCategory 
} from "@/lib/abuseTagsConfig"
import { ChevronDown, ChevronUp, HelpCircle, X, Check } from "lucide-react"

interface AbuseTagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  disabled?: boolean
}

export function AbuseTagSelector({ 
  selectedTags, 
  onTagsChange, 
  disabled = false 
}: AbuseTagSelectorProps) {
  const [showExplanations, setShowExplanations] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<AbuseTagCategory[]>([])

  const toggleTag = (tagId: string) => {
    if (disabled) return
    
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(t => t !== tagId))
    } else {
      onTagsChange([...selectedTags, tagId])
    }
  }

  const toggleCategory = (category: AbuseTagCategory) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category))
    } else {
      setExpandedCategories([...expandedCategories, category])
    }
  }

  const getTagById = (id: string) => ABUSE_TAGS.find(t => t.id === id)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tags de Tipo de Abuso</h3>
          <p className="text-sm text-gray-600 mt-1">
            Isso é opcional, mas ajuda a organizar seus episódios.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowExplanations(!showExplanations)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          {showExplanations ? "Ocultar explicações" : "Ver explicações e exemplos"}
        </button>
      </div>

      {/* Texto de orientação */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          Se você não tiver certeza da tag, tudo bem. Você pode deixar em branco ou escolher 
          o que mais se aproxima da sua experiência.
        </p>
      </div>

      {/* Tags selecionadas */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tagId => {
            const tag = getTagById(tagId)
            if (!tag) return null
            const colors = CATEGORY_COLORS[tag.categoria]
            return (
              <span
                key={tagId}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
              >
                {tag.label}
                <button
                  type="button"
                  onClick={() => toggleTag(tagId)}
                  className="hover:opacity-70"
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Painel de explicações (accordion por categoria) */}
      {showExplanations && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {(Object.keys(ABUSE_TAGS_BY_CATEGORY) as AbuseTagCategory[]).map(category => {
            const tags = ABUSE_TAGS_BY_CATEGORY[category]
            const colors = CATEGORY_COLORS[category]
            const isExpanded = expandedCategories.includes(category)

            return (
              <div key={category} className="border-b border-gray-200 last:border-b-0">
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`w-full px-4 py-3 flex items-center justify-between ${colors.bg} hover:opacity-90 transition-opacity`}
                >
                  <span className={`font-semibold ${colors.text}`}>{category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{tags.length} tipos</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 space-y-4 bg-white">
                    {tags.map(tag => (
                      <div 
                        key={tag.id} 
                        className={`p-3 rounded-lg border ${
                          selectedTags.includes(tag.id) 
                            ? `${colors.border} ${colors.bg}` 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{tag.label}</h4>
                              {selectedTags.includes(tag.id) && (
                                <Check className={`w-4 h-4 ${colors.text}`} />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{tag.explicacaoCurta}</p>
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700 italic">
                              <strong>Exemplo:</strong> {tag.exemplo}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            disabled={disabled}
                            className={`ml-3 px-3 py-1 text-sm rounded-lg transition-colors ${
                              selectedTags.includes(tag.id)
                                ? `${colors.bg} ${colors.text} border ${colors.border}`
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {selectedTags.includes(tag.id) ? 'Remover' : 'Adicionar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Seleção rápida (quando explicações estão ocultas) */}
      {!showExplanations && (
        <div className="space-y-3">
          {(Object.keys(ABUSE_TAGS_BY_CATEGORY) as AbuseTagCategory[]).map(category => {
            const tags = ABUSE_TAGS_BY_CATEGORY[category]
            const colors = CATEGORY_COLORS[category]

            return (
              <div key={category}>
                <h4 className={`text-sm font-medium ${colors.text} mb-2`}>{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      disabled={disabled}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        selectedTags.includes(tag.id)
                          ? `${colors.bg} ${colors.text} ${colors.border}`
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
