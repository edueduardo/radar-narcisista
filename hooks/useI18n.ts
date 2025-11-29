'use client'

/**
 * TEMA 14: Hook de Internacionalização
 * 
 * Uso:
 * const { t, locale, setLocale } = useFrontpageI18n()
 * 
 * <h1>{t.hero.title}</h1>
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Locale,
  locales,
  defaultLocale,
  localeNames,
  getFrontpageDictionary,
  FrontpageDictionary,
  detectBrowserLocale,
} from '@/lib/i18n'

interface UseFrontpageI18nReturn {
  // Dicionário atual
  t: FrontpageDictionary
  
  // Locale atual
  locale: Locale
  
  // Função para mudar locale
  setLocale: (locale: Locale) => void
  
  // Lista de locales disponíveis
  availableLocales: Locale[]
  
  // Nomes dos locales
  localeNames: Record<Locale, string>
  
  // Helpers
  isLoading: boolean
}

export function useFrontpageI18n(): UseFrontpageI18nReturn {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [isLoading, setIsLoading] = useState(true)
  
  // Carregar locale salvo no mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const saved = localStorage.getItem('locale') as Locale
    if (saved && locales.includes(saved)) {
      setLocaleState(saved)
    } else {
      const detected = detectBrowserLocale()
      setLocaleState(detected)
    }
    setIsLoading(false)
  }, [])
  
  // Função para mudar locale
  const setLocale = useCallback((newLocale: Locale) => {
    if (!locales.includes(newLocale)) {
      console.warn(`Locale "${newLocale}" não suportado`)
      return
    }
    
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
    }
    
    // Atualizar atributo lang do HTML
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale
    }
  }, [])
  
  // Obter dicionário atual
  const t = getFrontpageDictionary(locale)
  
  return {
    t,
    locale,
    setLocale,
    availableLocales: locales,
    localeNames,
    isLoading,
  }
}

export default useFrontpageI18n
