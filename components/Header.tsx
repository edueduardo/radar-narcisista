'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Globe, Check } from 'lucide-react'
import { Locale, locales, localeNames, defaultLocale, detectBrowserLocale } from '../lib/i18n'
import { createClient } from '@/lib/supabase/client'

// Menu simplificado: 3 links + 2 CTAs
const mainNav = [
  { label: 'Blog', href: '/blog' },
  { label: 'Estatísticas', href: '/estatisticas/publicas' },
  { label: 'Contato', href: '/contato' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [currentLocale, setCurrentLocale] = useState<Locale>(defaultLocale)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClient()

  // Carregar idioma salvo ou detectar do navegador
  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale
    if (saved && locales.includes(saved)) {
      setCurrentLocale(saved)
    } else {
      // Detectar idioma do navegador na primeira visita
      const detected = detectBrowserLocale()
      setCurrentLocale(detected)
      localStorage.setItem('locale', detected)
    }
  }, [])

  // Verificar se está logado
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const changeLocale = (locale: Locale) => {
    setCurrentLocale(locale)
    localStorage.setItem('locale', locale)
    setLangOpen(false)
    // Recarregar para aplicar traduções
    window.location.reload()
  }

  const flags: Record<Locale, string> = {
    'pt-BR': '🇧🇷',
    'en': '🇺🇸',
    'es': '🇪🇸'
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-black text-slate-50 shadow-lg shadow-purple-500/40">
            RN
          </span>
          <span className="flex flex-col text-xs font-medium text-slate-200 sm:text-sm">
            <span className="font-semibold tracking-tight">
              Radar Narcisista BR
            </span>
            <span className="hidden text-[0.7rem] text-slate-400 sm:inline">
              Clareza, segurança e dados sobre abuso psicológico
            </span>
          </span>
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-5 text-sm text-slate-200 md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-300 transition hover:text-purple-300"
            >
              {item.label}
            </Link>
          ))}

          {/* Seletor de Idioma */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-purple-400 hover:text-purple-100 transition-colors"
              aria-label="Selecionar idioma"
            >
              <span className="text-base">{flags[currentLocale]}</span>
              <Globe className="h-3.5 w-3.5" />
            </button>

            {langOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setLangOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-slate-800 bg-slate-950/95 p-1.5 shadow-lg shadow-slate-950/80 z-50">
                  <p className="px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">
                    Idioma / Language
                  </p>
                  {locales.map((locale) => (
                    <button
                      key={locale}
                      onClick={() => changeLocale(locale)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                        currentLocale === locale 
                          ? 'bg-purple-500/20 text-purple-200' 
                          : 'text-slate-200 hover:bg-slate-900 hover:text-purple-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{flags[locale]}</span>
                        <span>{localeNames[locale].split(' ')[1]}</span>
                      </span>
                      {currentLocale === locale && (
                        <Check className="h-3.5 w-3.5 text-purple-400" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* CTA Principal */}
          <Link
            href="/teste-clareza"
            className="rounded-full bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2 text-sm font-semibold text-white hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-500/25"
          >
            Fazer o Teste
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:border-purple-400 hover:text-purple-100 transition-colors"
          >
            Entrar
          </Link>
        </nav>

        {/* Mobile - CTA + Entrar + Hambúrguer */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/teste-clareza"
            className="rounded-full bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
          >
            Teste
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 p-2 text-slate-100"
            onClick={() => setOpen((value) => !value)}
            aria-label="Abrir menu de navegação"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-800 bg-slate-950/95 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-sm text-slate-100">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm hover:bg-slate-900 hover:text-purple-100"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Seletor de Idioma Mobile */}
            <div className="mt-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs">
              <p className="mb-2 flex items-center gap-1 font-semibold text-slate-100">
                <Globe className="h-3.5 w-3.5" />
                Idioma / Language
              </p>
              <div className="flex gap-2">
                {locales.map((locale) => (
                  <button
                    key={locale}
                    onClick={() => changeLocale(locale)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                      currentLocale === locale 
                        ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50' 
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-lg">{flags[locale]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTAs Mobile */}
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/teste-clareza"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 text-sm font-semibold text-white hover:from-purple-700 hover:to-purple-800 transition-all"
                onClick={() => setOpen(false)}
              >
                Fazer o Teste de Clareza
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-100 hover:border-purple-400 hover:text-purple-100"
                onClick={() => setOpen(false)}
              >
                Entrar
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
