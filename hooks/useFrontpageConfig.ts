'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase/compat'

// Tipos para as configurações
export interface HeroConfig {
  title: string
  subtitle: string
  cta_primary: string
  cta_primary_link: string
  cta_secondary: string
  cta_secondary_link: string
  background_gradient?: string
}

export interface StatsConfig {
  enabled: boolean
  items: Array<{
    value: string
    label: string
  }>
}

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQConfig {
  enabled: boolean
  title: string
  items: FAQItem[]
}

export interface TestimonialItem {
  name: string
  location: string
  text: string
  rating: number
}

export interface TestimonialsConfig {
  enabled: boolean
  title: string
  items: TestimonialItem[]
}

export interface CTAFinalConfig {
  enabled: boolean
  title: string
  subtitle: string
  button_text: string
  button_link: string
}

export interface GeneralConfig {
  site_name: string
  tagline: string
  logo_text: string
  show_promo_banner: boolean
  promo_banner_text: string
}

export interface SectionOrder {
  id: string
  enabled: boolean
  order: number
}

export interface SectionsOrderConfig {
  sections: SectionOrder[]
}

export interface FrontpageConfigs {
  hero?: HeroConfig
  stats?: StatsConfig
  faq?: FAQConfig
  testimonials?: TestimonialsConfig
  cta_final?: CTAFinalConfig
  general?: GeneralConfig
  sections_order?: SectionsOrderConfig
  tools_section?: {
    enabled: boolean
    title: string
    subtitle: string
  }
}

// Valores padrão (fallback se banco não tiver dados)
const defaultConfigs: FrontpageConfigs = {
  hero: {
    title: 'Você não está louca.',
    subtitle: 'Descubra se está em um relacionamento abusivo com nossa IA especializada em narcisismo.',
    cta_primary: 'Fazer Teste de Clareza',
    cta_primary_link: '/teste-clareza',
    cta_secondary: 'Conhecer Ferramentas',
    cta_secondary_link: '#ferramentas',
    background_gradient: 'from-purple-900 via-violet-900 to-indigo-900'
  },
  stats: {
    enabled: true,
    items: [
      { value: '10.000+', label: 'Mulheres ajudadas' },
      { value: '50.000+', label: 'Testes realizados' },
      { value: '98%', label: 'Recomendam' },
      { value: '24/7', label: 'Disponível' }
    ]
  },
  faq: {
    enabled: true,
    title: 'Perguntas Frequentes',
    items: [
      {
        question: 'O Radar Narcisista substitui terapia?',
        answer: 'Não. Somos uma ferramenta de apoio e autoconhecimento. Recomendamos sempre buscar acompanhamento profissional.'
      },
      {
        question: 'Meus dados estão seguros?',
        answer: 'Sim. Usamos criptografia de ponta a ponta e nunca compartilhamos seus dados com terceiros.'
      }
    ]
  },
  testimonials: {
    enabled: true,
    title: 'O que dizem sobre nós',
    items: []
  },
  cta_final: {
    enabled: true,
    title: 'Pronta para dar o primeiro passo?',
    subtitle: 'Faça o teste de clareza gratuito e descubra se você está em um relacionamento saudável.',
    button_text: 'Começar Agora',
    button_link: '/teste-clareza'
  },
  general: {
    site_name: 'Radar Narcisista',
    tagline: 'Clareza para quem precisa',
    logo_text: 'Radar Narcisista',
    show_promo_banner: false,
    promo_banner_text: ''
  }
}

/**
 * Hook para carregar configurações da frontpage do Supabase
 * Usa fallback para valores padrão se não encontrar no banco
 */
export function useFrontpageConfig() {
  const [configs, setConfigs] = useState<FrontpageConfigs>(defaultConfigs)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    async function loadConfigs() {
      try {
        const { data, error: fetchError } = await supabase
          .from('frontpage_config')
          .select('config_key, config_value, is_active')
          .eq('is_active', true)
        
        if (fetchError) {
          console.warn('[useFrontpageConfig] Erro ao buscar configs, usando fallback:', fetchError)
          // Usar valores padrão em caso de erro
          setConfigs(defaultConfigs)
          return
        }
        
        if (data && data.length > 0) {
          const loadedConfigs: FrontpageConfigs = { ...defaultConfigs }
          
          data.forEach(item => {
            const key = item.config_key as keyof FrontpageConfigs
            if (key && item.config_value) {
              (loadedConfigs as any)[key] = item.config_value
            }
          })
          
          setConfigs(loadedConfigs)
        }
      } catch (err) {
        console.error('[useFrontpageConfig] Erro:', err)
        setError('Erro ao carregar configurações')
        setConfigs(defaultConfigs)
      } finally {
        setLoading(false)
      }
    }
    
    loadConfigs()
  }, [supabase])
  
  return {
    configs,
    loading,
    error,
    // Helpers para acessar configs específicas
    hero: configs.hero || defaultConfigs.hero!,
    stats: configs.stats || defaultConfigs.stats!,
    faq: configs.faq || defaultConfigs.faq!,
    testimonials: configs.testimonials || defaultConfigs.testimonials!,
    ctaFinal: configs.cta_final || defaultConfigs.cta_final!,
    general: configs.general || defaultConfigs.general!
  }
}

/**
 * Função para buscar configs no servidor (para SSR/SSG)
 */
export async function getFrontpageConfigServer() {
  // Esta função seria usada em Server Components
  // Por enquanto retorna os defaults
  return defaultConfigs
}
