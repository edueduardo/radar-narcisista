'use client'

import { useState, useEffect } from 'react'
import { Globe, Check } from 'lucide-react'
import { Locale, locales, localeNames, defaultLocale } from '../lib/i18n'

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLocale, setCurrentLocale] = useState<Locale>(defaultLocale)

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale
    if (saved && locales.includes(saved)) {
      setCurrentLocale(saved)
    }
  }, [])

  const changeLocale = (locale: Locale) => {
    setCurrentLocale(locale)
    localStorage.setItem('locale', locale)
    setIsOpen(false)
    // Recarregar página para aplicar traduções
    window.location.reload()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        aria-label="Selecionar idioma"
      >
        <Globe className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {localeNames[currentLocale].split(' ')[0]}
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 z-50 overflow-hidden">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => changeLocale(locale)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
                  currentLocale === locale ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                }`}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {localeNames[locale]}
                </span>
                {currentLocale === locale && (
                  <Check className="h-4 w-4 text-purple-500" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Versão compacta para o header
export function LanguageSelectorCompact() {
  const [currentLocale, setCurrentLocale] = useState<Locale>(defaultLocale)

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale
    if (saved && locales.includes(saved)) {
      setCurrentLocale(saved)
    }
  }, [])

  const cycleLocale = () => {
    const currentIndex = locales.indexOf(currentLocale)
    const nextIndex = (currentIndex + 1) % locales.length
    const nextLocale = locales[nextIndex]
    setCurrentLocale(nextLocale)
    localStorage.setItem('locale', nextLocale)
    window.location.reload()
  }

  const flags: Record<Locale, string> = {
    'pt-BR': '🇧🇷',
    'en': '🇺🇸',
    'es': '🇪🇸'
  }

  return (
    <button
      onClick={cycleLocale}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      aria-label="Trocar idioma"
      title={`Idioma: ${localeNames[currentLocale]}`}
    >
      <span className="text-xl">{flags[currentLocale]}</span>
    </button>
  )
}
