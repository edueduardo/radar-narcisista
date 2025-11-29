'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Plus, ArrowRight, BookOpen, MousePointer } from 'lucide-react'
import {
  ABUSE_TAG_CATEGORIES,
  ABUSE_TAGS,
  AbuseTagCategoryId,
  AbuseTagConfig,
  getTagsByCategory,
  getOrderedCategories,
  getCategoryById,
} from '@/lib/abuse-tags-config'

// =============================================================================
// DICIONÁRIO DE TAGS DE ABUSO
// Componente inline (sem popup/modal) para explicar cada tipo de abuso
// Conectado aos hubs via ProblemTag
// Suporta dois modos: 'inline' (accordion) e 'side' (painel lateral)
// =============================================================================

interface AbuseTagsDictionaryProps {
  /** Modo de exibição: 'inline' = accordion, 'side' = painel lateral sincronizado */
  mode?: 'inline' | 'side'
  /** Categoria para abrir automaticamente (inline) ou mostrar (side) */
  focusedCategoryId?: AbuseTagCategoryId | null
  /** Callback quando uma tag é selecionada */
  onSelectTag?: (tagId: string) => void
  /** Tags já selecionadas (para mostrar estado) */
  selectedTags?: string[]
}

export default function AbuseTagsDictionary({
  mode = 'inline',
  focusedCategoryId,
  onSelectTag,
  selectedTags = [],
}: AbuseTagsDictionaryProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<AbuseTagCategoryId>>(
    focusedCategoryId ? new Set([focusedCategoryId]) : new Set()
  )

  const toggleCategory = (categoryId: AbuseTagCategoryId) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const categories = getOrderedCategories()

  // =========================================================================
  // MODO SIDE - Painel lateral sincronizado com categoria selecionada
  // =========================================================================
  if (mode === 'side') {
    // Se nenhuma categoria selecionada, mostrar mensagem de instrução
    if (!focusedCategoryId) {
      return (
        <div className="border border-purple-200 rounded-2xl overflow-hidden bg-white h-full">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-5 py-4 border-b border-purple-100">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-900">Explicações e Exemplos</h3>
            </div>
          </div>
          <div className="p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
            <MousePointer className="w-10 h-10 text-purple-300 mb-4" />
            <p className="text-gray-600 font-medium mb-2">
              Selecione uma categoria à esquerda
            </p>
            <p className="text-sm text-gray-500">
              Clique em "Manipulação", "Controle", etc. para ver explicações e exemplos de cada tipo de comportamento.
            </p>
          </div>
        </div>
      )
    }

    // Categoria selecionada - mostrar detalhes
    const category = getCategoryById(focusedCategoryId)
    if (!category) return null

    const tags = getTagsByCategory(focusedCategoryId)
    const colors = category.colorClass

    return (
      <div className="border border-purple-200 rounded-2xl overflow-hidden bg-white h-full flex flex-col">
        {/* Header */}
        <div className={`${colors.bg} px-5 py-4 border-b ${colors.border}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{category.emoji}</span>
            <h3 className={`font-bold ${colors.text}`}>{category.title}</h3>
          </div>
          <p className="text-sm text-gray-600">{category.description}</p>
        </div>

        {/* Tags da categoria */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tags.map(tag => (
            <TagCard
              key={tag.id}
              tag={tag}
              colors={colors}
              isSelected={selectedTags.includes(tag.id) || selectedTags.includes(tag.label.toLowerCase())}
              onSelect={() => onSelectTag?.(tag.label.toLowerCase())}
            />
          ))}
        </div>

        {/* Footer com link para hub */}
        <div className={`px-5 py-4 border-t ${colors.border} ${colors.bg}`}>
          <Link
            href={`/hub/${category.problemTag}`}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white ${colors.text} border ${colors.border} hover:opacity-80 transition-opacity w-full justify-center font-medium`}
          >
            Ver Hub de {category.title}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  // =========================================================================
  // MODO INLINE - Accordion com todas as categorias (comportamento original)
  // =========================================================================
  return (
    <div className="border border-purple-200 rounded-2xl overflow-hidden bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-5 py-4 border-b border-purple-100">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-gray-900">Dicionário de Tags</h3>
        </div>
        <p className="text-sm text-gray-600">
          Entenda cada tipo de comportamento. Clique para expandir e adicionar tags ao seu episódio.
        </p>
      </div>

      {/* Categorias (Accordion) */}
      <div className="divide-y divide-gray-100">
        {categories.map(category => {
          const isExpanded = expandedCategories.has(category.id)
          const tags = getTagsByCategory(category.id)
          const colors = category.colorClass

          return (
            <div key={category.id}>
              {/* Header da categoria (clicável) */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50 ${
                  isExpanded ? colors.bg : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{category.emoji}</span>
                  <div className="text-left">
                    <span className={`font-semibold ${isExpanded ? colors.text : 'text-gray-900'}`}>
                      {category.title}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{tags.length} tipos</span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Conteúdo expandido */}
              {isExpanded && (
                <div className={`px-5 py-4 ${colors.bg} border-t ${colors.border}`}>
                  {/* Link para o Hub */}
                  <Link
                    href={`/hub/${category.problemTag}`}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${colors.bg} ${colors.text} border ${colors.border} hover:opacity-80 transition-opacity mb-4`}
                  >
                    <span className="text-sm font-medium">Ver Hub de {category.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {/* Cards de tags */}
                  <div className="space-y-3">
                    {tags.map(tag => (
                      <TagCard
                        key={tag.id}
                        tag={tag}
                        colors={colors}
                        isSelected={selectedTags.includes(tag.id) || selectedTags.includes(tag.label.toLowerCase())}
                        onSelect={() => onSelectTag?.(tag.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer com aviso */}
      <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
        <p className="text-xs text-amber-700">
          💡 Estas definições são educativas e ajudam a identificar padrões. 
          Não são diagnósticos clínicos.
        </p>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// COMPONENTE DE CARD DE TAG
// -----------------------------------------------------------------------------

interface TagCardProps {
  tag: AbuseTagConfig
  colors: {
    bg: string
    text: string
    border: string
    bgActive: string
  }
  isSelected: boolean
  onSelect?: () => void
}

function TagCard({ tag, colors, isSelected, onSelect }: TagCardProps) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isSelected
          ? `${colors.bg} ${colors.border} ring-2 ring-offset-1 ring-purple-300`
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className={`font-semibold ${isSelected ? colors.text : 'text-gray-900'}`}>
          {tag.label}
        </span>
        {isSelected ? (
          <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bgActive} text-white`}>
            Selecionada
          </span>
        ) : onSelect ? (
          <button
            onClick={onSelect}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${colors.bg} ${colors.text} hover:opacity-80 transition-opacity`}
          >
            <Plus className="w-3 h-3" />
            Adicionar
          </button>
        ) : null}
      </div>

      {/* Descrição */}
      <p className="text-sm text-gray-600 mb-3">{tag.description}</p>

      {/* Exemplo */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-xs text-gray-500 mb-1 font-medium">Exemplo:</p>
        <p className="text-sm text-gray-700 italic">"{tag.example}"</p>
      </div>
    </div>
  )
}
