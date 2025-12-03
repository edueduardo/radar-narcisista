'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ChevronDown, Bot, Sparkles, Check } from 'lucide-react'

// ============================================================================
// TIPOS
// ============================================================================

interface Persona {
  id: string
  slug: string
  display_name: string
  avatar_emoji: string
  avatar_url?: string
  short_bio: string
  cor_tema?: string
  is_default?: boolean
}

interface PersonaSelectorProps {
  contextType?: string
  contextKey?: string
  userRole?: string
  planKey?: string
  onPersonaChange?: (persona: Persona | null) => void
  showBio?: boolean
  compact?: boolean
  className?: string
}

// ============================================================================
// PERSONAS PADRÃO (fallback se banco não tiver dados)
// ============================================================================

const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'default-1',
    slug: 'mentora-calma',
    display_name: 'Mentora Calma',
    avatar_emoji: '🕊️',
    short_bio: 'Sua companheira de jornada, focada em acolhimento e clareza emocional.',
    cor_tema: '#8B5CF6',
    is_default: true
  },
  {
    id: 'default-2',
    slug: 'analista-logico',
    display_name: 'Analista Lógico',
    avatar_emoji: '🧠',
    short_bio: 'Especialista em identificar padrões e organizar pensamentos.',
    cor_tema: '#3B82F6'
  },
  {
    id: 'default-3',
    slug: 'guardiao-seguranca',
    display_name: 'Guardião de Segurança',
    avatar_emoji: '🛡️',
    short_bio: 'Focado em sua proteção e alertas de risco.',
    cor_tema: '#EF4444'
  }
]

// ============================================================================
// COMPONENTE
// ============================================================================

export function PersonaSelector({
  contextType = 'chat',
  contextKey = 'chat_geral',
  userRole = 'usuaria',
  planKey = 'free',
  onPersonaChange,
  showBio = true,
  compact = false,
  className = ''
}: PersonaSelectorProps) {
  const [personas, setPersonas] = useState<Persona[]>(DEFAULT_PERSONAS)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPersonas()
  }, [contextType, contextKey, userRole, planKey])

  async function loadPersonas() {
    setLoading(true)
    try {
      // Tentar carregar do banco via RPC
      const { data, error } = await supabase.rpc('get_active_personas_for_context', {
        p_context_type: contextType,
        p_context_key: contextKey,
        p_user_role: userRole,
        p_plan_key: planKey,
        p_segment: null
      })

      if (!error && data && data.length > 0) {
        const mappedPersonas: Persona[] = data.map((p: any) => ({
          id: p.persona_id,
          slug: p.persona_slug,
          display_name: p.display_name,
          avatar_emoji: p.avatar_emoji,
          avatar_url: p.avatar_url,
          short_bio: p.short_bio,
          is_default: p.is_default
        }))
        setPersonas(mappedPersonas)
        
        // Selecionar persona padrão
        const defaultPersona = mappedPersonas.find(p => p.is_default) || mappedPersonas[0]
        setSelectedPersona(defaultPersona)
        onPersonaChange?.(defaultPersona)
      } else {
        // Usar fallback
        setPersonas(DEFAULT_PERSONAS)
        const defaultPersona = DEFAULT_PERSONAS.find(p => p.is_default) || DEFAULT_PERSONAS[0]
        setSelectedPersona(defaultPersona)
        onPersonaChange?.(defaultPersona)
      }
    } catch (err) {
      console.error('Erro ao carregar personas:', err)
      // Usar fallback
      setPersonas(DEFAULT_PERSONAS)
      const defaultPersona = DEFAULT_PERSONAS.find(p => p.is_default) || DEFAULT_PERSONAS[0]
      setSelectedPersona(defaultPersona)
      onPersonaChange?.(defaultPersona)
    }
    setLoading(false)
  }

  function handleSelectPersona(persona: Persona) {
    setSelectedPersona(persona)
    setIsOpen(false)
    onPersonaChange?.(persona)
  }

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-12 ${className}`} />
    )
  }

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="text-xl">{selectedPersona?.avatar_emoji || '🤖'}</span>
          <span className="text-sm font-medium">{selectedPersona?.display_name || 'Assistente'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            {personas.map(persona => (
              <button
                key={persona.id}
                onClick={() => handleSelectPersona(persona)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  selectedPersona?.id === persona.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                }`}
              >
                <span className="text-2xl">{persona.avatar_emoji}</span>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{persona.display_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {persona.short_bio}
                  </p>
                </div>
                {selectedPersona?.id === persona.id && (
                  <Check className="w-4 h-4 text-purple-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Escolha sua assistente
        </span>
      </div>

      <div className="grid gap-2">
        {personas.map(persona => (
          <button
            key={persona.id}
            onClick={() => handleSelectPersona(persona)}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
              selectedPersona?.id === persona.id
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-transparent bg-gray-50 dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span className="text-3xl">{persona.avatar_emoji}</span>
            <div className="flex-1 text-left">
              <p className="font-semibold">{persona.display_name}</p>
              {showBio && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {persona.short_bio}
                </p>
              )}
            </div>
            {selectedPersona?.id === persona.id && (
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE: Avatar da Persona (para mensagens)
// ============================================================================

interface PersonaAvatarProps {
  persona?: Persona | null
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

export function PersonaAvatar({
  persona,
  size = 'md',
  showName = false,
  className = ''
}: PersonaAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-14 h-14 text-3xl'
  }

  const emoji = persona?.avatar_emoji || '🤖'
  const name = persona?.display_name || 'Assistente'
  const color = persona?.cor_tema || '#8B5CF6'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center`}
        style={{ backgroundColor: `${color}20` }}
      >
        {persona?.avatar_url ? (
          <img 
            src={persona.avatar_url} 
            alt={name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{emoji}</span>
        )}
      </div>
      {showName && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {name}
        </span>
      )}
    </div>
  )
}

// ============================================================================
// HOOK: usePersona
// ============================================================================

export function usePersona(contextType: string = 'chat', contextKey: string = 'chat_geral') {
  const [persona, setPersona] = useState<Persona | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.rpc('get_active_personas_for_context', {
          p_context_type: contextType,
          p_context_key: contextKey,
          p_user_role: 'usuaria',
          p_plan_key: 'free',
          p_segment: null
        })

        if (data && data.length > 0) {
          const defaultPersona = data.find((p: any) => p.is_default) || data[0]
          setPersona({
            id: defaultPersona.persona_id,
            slug: defaultPersona.persona_slug,
            display_name: defaultPersona.display_name,
            avatar_emoji: defaultPersona.avatar_emoji,
            avatar_url: defaultPersona.avatar_url,
            short_bio: defaultPersona.short_bio,
            is_default: defaultPersona.is_default
          })
        } else {
          setPersona(DEFAULT_PERSONAS[0])
        }
      } catch {
        setPersona(DEFAULT_PERSONAS[0])
      }
      setLoading(false)
    }
    load()
  }, [contextType, contextKey])

  return { persona, setPersona, loading }
}

export default PersonaSelector
