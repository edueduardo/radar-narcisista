'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, BookOpen, MessageCircle, ChevronRight, Heart, Lock, Phone, Menu, X, BarChart3, Globe, Check, Moon, Sun, Monitor, ArrowUp, Users, Sparkles, RefreshCw, FileText, Lightbulb, MapPin, Star, TrendingUp } from 'lucide-react'
import { Locale, locales, localeNames, defaultLocale, detectBrowserLocale, translations } from '../lib/i18n'
import HeaderMenuDropdown, { MobileMenuDropdown } from '../components/HeaderMenuDropdown'
import SocialProofWidget from '../components/SocialProofWidget'
import SkipLinks, { SectionMarker, ScreenReaderAnnouncement } from '../components/SkipLinks'
import { initializeEasterEggs } from '../lib/easter-eggs'
import { initializeUltraSecrets } from '../lib/easter-eggs-secret'
import { initializeHiddenPowers } from '../lib/hidden-powers'
import { getDisplayPlans } from '../lib/plans-config'
import { useConsumerPlans, type PlanWithPromotion } from '../hooks/usePlans'
import DynamicSections from '../components/frontpage/DynamicSections'

type Theme = 'light' | 'dark' | 'high-contrast'

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [currentLocale, setCurrentLocale] = useState<Locale>(defaultLocale)
  const [theme, setTheme] = useState<Theme>('dark') // Escuro como padrão - Premium
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [periodo, setPeriodo] = useState<'mensal' | 'anual'>('mensal')
  const router = useRouter()
  
  // Planos do banco de dados (com fallback para hardcoded)
  const { plans: dbPlans, source: plansSource } = useConsumerPlans(currentLocale)
  
  // Usar planos do banco se disponíveis, senão fallback
  const displayPlans = dbPlans.length > 0 
    ? dbPlans.filter(p => !p.comingSoon)
    : getDisplayPlans(false, false).filter(p => !p.comingSoon)

  // Scroll progress + botão voltar ao topo
  useEffect(() => {
    const handleScroll = () => {
      // Botão voltar ao topo
      setShowBackToTop(window.scrollY > 500)
      
      // Barra de progresso
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Carregar e aplicar tema
  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved) {
      setTheme(saved)
      applyTheme(saved)
    } else {
      // Aplicar tema escuro como padrão - Premium
      applyTheme('dark')
    }
  }, [])

  const applyTheme = (t: Theme) => {
    const root = document.documentElement
    root.classList.remove('light', 'dark', 'high-contrast')
    root.classList.add(t)
  }

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'high-contrast']
    const idx = themes.indexOf(theme)
    const next = themes[(idx + 1) % themes.length]
    setTheme(next)
    localStorage.setItem('theme', next)
    applyTheme(next)
  }

  const flags: Record<Locale, string> = {
    'pt-BR': '🇧🇷',
    'en': '🇺🇸',
    'es': '🇪🇸'
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Carregar idioma salvo ou detectar do navegador
  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale
    if (saved && locales.includes(saved)) {
      setCurrentLocale(saved)
    } else {
      const detected = detectBrowserLocale()
      setCurrentLocale(detected)
      localStorage.setItem('locale', detected)
    }
  }, [])

  // Inicializar Easter Eggs (secreto!)
  useEffect(() => {
    initializeEasterEggs()
  }, [])

  // Inicializar Easter Eggs ULTRA-SECRETOS (só você sabe!)
  useEffect(() => {
    initializeUltraSecrets()
  }, [])

  // Inicializar PODERES OCULTOS (camada final ultra-secreta!)
  useEffect(() => {
    initializeHiddenPowers()
  }, [])

  const changeLocale = (locale: Locale) => {
    setCurrentLocale(locale)
    localStorage.setItem('locale', locale)
    setLangOpen(false)
    window.location.reload()
  }

  // Função de tradução
  const t = (key: string): string => {
    return translations[currentLocale]?.[key] || translations['pt-BR'][key] || key
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#020617] text-white' : theme === 'high-contrast' ? 'bg-black text-white' : 'bg-slate-50 text-gray-900'}`} suppressHydrationWarning>
      {/* Skip Links - Acessibilidade */}
      <SkipLinks />
      
      {/* Anúncio para leitores de tela */}
      <ScreenReaderAnnouncement message="Página inicial do Radar Narcisista carregada" />

      {/* HEADER OTIMIZADO - Conversão + Acessibilidade */}
      <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0F172A]/95 border-slate-700/50' : theme === 'high-contrast' ? 'bg-black border-white' : 'bg-white/95 border-gray-200'}`}>
        <div className="container-app">
          <div className="flex items-center justify-between h-16 md:h-18">
            
            {/* ESQUERDA: Logo + Nome + Subtítulo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <span className="text-white font-bold text-sm">RN</span>
              </div>
              <div className="hidden sm:block">
                <p className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Radar Narcisista</p>
                <p className={`text-xs hidden lg:block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Encontre sua clareza</p>
              </div>
            </Link>

            {/* CENTRO: Menu Principal (Desktop grande) */}
            <nav className="hidden xl:flex items-center gap-1">
              <HeaderMenuDropdown />
            </nav>

            {/* DIREITA: Ações (Desktop/Tablet grande) */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Tema - Compacto com Tooltip */}
              <button
                onClick={cycleTheme}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-sm ${theme === 'dark' ? 'border-slate-600 hover:border-violet-500 hover:bg-violet-500/10' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'}`}
                data-tooltip={theme === 'light' ? '🌞 Tema Claro' : theme === 'dark' ? '🌙 Tema Escuro' : '♿ Alto Contraste'}
              >
                {theme === 'light' && <Sun className="w-4 h-4 text-yellow-500" />}
                {theme === 'dark' && <Moon className="w-4 h-4 text-purple-500" />}
                {theme === 'high-contrast' && <Monitor className="w-4 h-4 text-gray-700" />}
              </button>
              
              {/* Idioma - Compacto com Tooltip */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all text-sm ${theme === 'dark' ? 'border-slate-600 hover:border-violet-500 hover:bg-violet-500/10' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'}`}
                  aria-label="Selecionar idioma"
                  data-tooltip="🌐 Idioma"
                >
                  <span className="text-base">{flags[currentLocale]}</span>
                  <ChevronRight className="w-3 h-3 text-gray-400 rotate-90" />
                </button>

                {langOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                      {locales.map((locale) => (
                        <button
                          key={locale}
                          onClick={() => changeLocale(locale)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                            currentLocale === locale 
                              ? 'bg-purple-50 text-purple-700 font-medium' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-lg">{flags[locale]}</span>
                          <span>{localeNames[locale].split(' ')[1]}</span>
                          {currentLocale === locale && <Check className="w-4 h-4 text-purple-600 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Separador */}
              <div className={`w-px h-6 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}></div>

              {/* Entrar - Azul */}
              <Link 
                href="/login" 
                className="bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-md flex items-center py-2.5 px-5"
                style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px' }}
              >
                {t('nav.login')}
              </Link>

              {/* CTA Principal - Roxo */}
              <Link 
                href="/cadastro" 
                className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-full hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-500/30 flex items-center py-2.5 px-5"
                style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px' }}
              >
                {t('nav.signup')}
              </Link>
            </div>

            {/* MOBILE/TABLET: CTA + Entrar + Menu - Conversão máxima */}
            <div className="flex lg:hidden items-center gap-1.5">
              {/* TESTE - CTA PRINCIPAL - Roxo */}
              <Link 
                href="/teste-clareza" 
                className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-full hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-500/30 flex items-center gap-1 py-2.5 px-4"
                style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px' }}
              >
                🎯 Teste
              </Link>
              {/* Entrar - Azul */}
              <Link 
                href="/login" 
                className="bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-md flex items-center py-2.5 px-4"
                style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px' }}
              >
                Entrar
              </Link>
              {/* Menu hamburguer */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-full min-h-[42px] min-w-[42px] flex items-center justify-center" 
                aria-label="Menu"
                style={{ color: '#ffffff' }}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* MENU MOBILE/TABLET - Otimizado */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 animate-fade-in max-h-[80vh] overflow-y-auto">
            <div className="container-app py-4">
              
              {/* CTA Principal Mobile - Full width */}
              <Link 
                href="/teste-clareza" 
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-center py-4 rounded-xl mb-4 text-base"
                onClick={() => setMobileMenuOpen(false)}
              >
                🎯 Fazer Teste de Clareza
              </Link>

              {/* Menu Items */}
              <div className="space-y-1 mb-4">
                <MobileMenuDropdown onClose={() => setMobileMenuOpen(false)} />
              </div>
              
              {/* Separador */}
              <div className="border-t border-gray-100 my-4"></div>

              {/* Tema e Idioma lado a lado */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Tema */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Tema</p>
                  <div className="flex gap-1">
                    {(['light', 'dark', 'high-contrast'] as Theme[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => { setTheme(t); localStorage.setItem('theme', t); applyTheme(t); }}
                        className={`flex-1 flex items-center justify-center p-2.5 rounded-lg transition-all min-h-[44px] ${
                          theme === t 
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-300' 
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}
                        title={t === 'light' ? 'Claro' : t === 'dark' ? 'Escuro' : 'Alto Contraste'}
                      >
                        {t === 'light' && <Sun className="w-5 h-5" />}
                        {t === 'dark' && <Moon className="w-5 h-5" />}
                        {t === 'high-contrast' && <Monitor className="w-5 h-5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Idioma */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Idioma</p>
                  <div className="flex gap-1">
                    {locales.map((locale) => (
                      <button
                        key={locale}
                        onClick={() => changeLocale(locale)}
                        className={`flex-1 flex items-center justify-center p-2.5 rounded-lg transition-all min-h-[44px] ${
                          currentLocale === locale 
                            ? 'bg-purple-100 border-2 border-purple-300' 
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <span className="text-xl">{flags[locale]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3">
                <Link 
                  href="/login" 
                  className="flex-1 text-center py-3 rounded-xl bg-blue-600 hover:bg-blue-700 min-h-[44px] flex items-center justify-center" 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ color: '#ffffff', fontWeight: 700 }}
                >
                  {t('nav.login')}
                </Link>
                <Link 
                  href="/cadastro" 
                  className="flex-1 text-center py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 min-h-[44px] flex items-center justify-center shadow-lg" 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ color: '#ffffff', fontWeight: 700 }}
                >
                  {t('common.start')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* HERO - DESIGN ORIGINAL COM CONTRASTE */}
      <main id="main-content" className="pt-16 md:pt-18">
        <SectionMarker id="hero" ariaLabel="Seção principal com chamada para o Teste de Clareza">
          <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container-app">
          <div className="max-w-4xl mx-auto text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 animate-fade-in ${theme === 'dark' ? 'bg-violet-500/20 border border-violet-500/30' : 'bg-purple-50 border border-purple-200'}`}>
              <Shield className={`w-4 h-4 ${theme === 'dark' ? 'text-violet-400' : 'text-purple-600'}`} />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-violet-300' : 'text-purple-700'}`}>{t('header.safe')}</span>
            </div>

            {/* BANNER VERSÃO 1.0.0 - LANÇAMENTO OFICIAL */}
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full mb-6 animate-fade-in bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 shadow-lg shadow-green-500/10`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-green-300">🎉 VERSÃO 1.0.0 LANÇADA!</span>
                <span className="text-sm text-green-400">• Sistema 100% Completo</span>
              </div>
            </div>

            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('hero.title1')} <span className="text-gradient">{t('hero.title2')}</span>
            </h1>

            <p className={`text-xl md:text-2xl mb-2 animate-slide-up ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('hero.subtitle')}
            </p>
            
            <p className={`text-lg mb-4 animate-slide-up ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              O Radar é um espaço seguro para entender sinais de abuso, registrar episódios e planejar próximos passos – sem julgamento.
            </p>

            <div className="max-w-2xl mx-auto mb-8 animate-slide-up">
              <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white card-shadow'}`}>
                <ul className={`text-left space-y-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                  <li className="flex items-start gap-3"><span className={`mt-1 ${theme === 'dark' ? 'text-violet-400' : 'text-purple-500'}`}>•</span><span>{t('hero.question1')}</span></li>
                  <li className="flex items-start gap-3"><span className={`mt-1 ${theme === 'dark' ? 'text-violet-400' : 'text-purple-500'}`}>•</span><span>{t('hero.question2')}</span></li>
                  <li className="flex items-start gap-3"><span className={`mt-1 ${theme === 'dark' ? 'text-violet-400' : 'text-purple-500'}`}>•</span><span>{t('hero.question3')}</span></li>
                  <li className="flex items-start gap-3"><span className={`mt-1 ${theme === 'dark' ? 'text-violet-400' : 'text-purple-500'}`}>•</span><span>{t('hero.question4')}</span></li>
                </ul>
              </div>
            </div>

            <p className={`text-lg mb-8 animate-slide-up ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{t('hero.validation1')}</strong> {t('hero.validation2')}
              <br />{t('hero.help')} <strong>{t('hero.clarity')}</strong> {t('hero.whats_happening')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <button onClick={() => router.push('/teste-clareza')} className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                {t('hero.cta_test')} <ChevronRight className="w-5 h-5" />
              </button>
              <Link href="#como-funciona" className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                Ver como funciona <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <p className={`text-sm mt-4 animate-fade-in ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Ferramenta de apoio • Não substitui terapia • 18+
            </p>

            <div className={`flex flex-wrap justify-center gap-6 mt-6 text-sm animate-fade-in ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="flex items-center gap-1"><Lock className="w-4 h-4" /> Altos padrões de segurança</span>
              <span className="flex items-center gap-1 hidden md:flex"><Shield className="w-4 h-4" /> Saída rápida (tecla ESC)</span>
              <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> Para todos os gêneros</span>
            </div>
          </div>
        </div>
      </section>
        </SectionMarker>

      {/* COMO FUNCIONA - 3 PASSOS - DESIGN ORIGINAL */}
      <SectionMarker id="como-funciona" ariaLabel="Como funciona o Radar Narcisista em 3 passos">
        <section className={`py-16 md:py-20 ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-white'}`}>
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('howItWorks.title')}
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${theme === 'dark' ? 'bg-violet-500/20' : 'bg-purple-100'}`}>
                <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-violet-400' : 'text-purple-600'}`}>1</span>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('howItWorks.step1.title')}</h3>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}>{t('howItWorks.step1.desc')}</p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>2</span>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('howItWorks.step2.title')}</h3>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}>{t('howItWorks.step2.desc')}</p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>3</span>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('howItWorks.step3.title')}</h3>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}>{t('howItWorks.step3.desc')}</p>
            </div>
          </div>

          <div className="text-center mt-10">
            <button onClick={() => router.push('/teste-clareza')} className="btn-primary text-lg px-8 py-4">
              {t('howItWorks.cta')}
            </button>
          </div>
        </div>
      </section>
      </SectionMarker>

      {/* BLOCO "VOCÊ ESCOLHE COMO USAR" - ETAPA 5 */}
      <section className={`py-16 md:py-20 ${theme === 'dark' ? 'bg-gradient-to-b from-[#0F172A] to-[#020617]' : 'bg-gradient-to-b from-white to-gray-50'}`}>
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('choose.title')}
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('choose.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Card 1: Teste Rápido (sem conta) */}
            <div className={`rounded-2xl p-8 border-2 transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 hover:border-violet-500/50' : 'bg-white border-gray-200 hover:border-purple-300 shadow-lg'}`}>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                ⚡ {t('choose.quick.subtitle')}
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('choose.quick.title')}
              </h3>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('choose.quick.desc')}
              </p>
              <ul className={`text-sm space-y-2 mb-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 18 perguntas em 5 minutos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Resultado imediato
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 100% anônimo
                </li>
              </ul>
              <Link 
                href="/teste-clareza" 
                className={`inline-flex items-center gap-2 font-semibold ${theme === 'dark' ? 'text-violet-400 hover:text-violet-300' : 'text-purple-600 hover:text-purple-700'}`}
              >
                {t('choose.quick.cta')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 2: Radar Completo (com conta) */}
            <div className={`rounded-2xl p-8 border-2 transition-all hover:scale-[1.02] relative ${theme === 'dark' ? 'bg-gradient-to-br from-violet-900/30 to-indigo-900/30 border-violet-500/50 hover:border-violet-400' : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 hover:border-purple-400 shadow-lg'}`}>
              <div className={`absolute -top-3 right-6 px-3 py-1 rounded-full text-xs font-bold ${theme === 'dark' ? 'bg-violet-500 text-white' : 'bg-purple-600 text-white'}`}>
                RECOMENDADO
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${theme === 'dark' ? 'bg-violet-500/20 text-violet-400' : 'bg-purple-100 text-purple-700'}`}>
                🎯 {t('choose.radar.subtitle')}
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('choose.radar.title')}
              </h3>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('choose.radar.desc')}
              </p>
              <ul className={`text-sm space-y-2 mb-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                <li className="flex items-center gap-2">
                  <span className="text-violet-500">✓</span> Tudo do teste rápido
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-violet-500">✓</span> Resultado salvo para sempre
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-violet-500">✓</span> Diário + Coach IA + Trilhas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-violet-500">✓</span> Resumo personalizado pela IA
                </li>
              </ul>
              <Link 
                href="/cadastro" 
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${theme === 'dark' ? 'bg-violet-600 hover:bg-violet-500 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
              >
                {t('choose.radar.cta')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FERRAMENTAS PRINCIPAIS */}
      <section className={`py-16 md:py-20 ${theme === 'dark' ? 'bg-gradient-to-br from-violet-950/30 to-indigo-950/30' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}>
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.title')}</h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className={`rounded-2xl p-8 hover:-translate-y-1 transition-transform ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-lg'}`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${theme === 'dark' ? 'bg-violet-500/20' : 'bg-purple-100'}`}>
                <Shield className={`w-7 h-7 ${theme === 'dark' ? 'text-violet-400' : 'text-purple-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.test.title')}</h3>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.test.desc')}</p>
              <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                <li>✓ Resultado imediato</li>
                <li>✓ 100% gratuito</li>
                <li>✓ Sem cadastro</li>
              </ul>
            </div>

            <div className={`rounded-2xl p-8 hover:-translate-y-1 transition-transform ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-lg'}`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <BookOpen className={`w-7 h-7 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Diário de Episódios</h3>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Registre o que acontece. Veja padrões emergir. Tenha provas se precisar.</p>
              <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                <li>✓ Texto ou voz</li>
                <li>✓ Tags e filtros</li>
                <li>✓ Histórico seguro</li>
              </ul>
            </div>

            <div className={`rounded-2xl p-8 hover:-translate-y-1 transition-transform ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-lg'}`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                <MessageCircle className={`w-7 h-7 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Coach de Clareza (IA)</h3>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Apoio empático 24/7 para organizar pensamentos e encontrar caminhos.</p>
              <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                <li>✓ Disponível 24/7</li>
                <li>✓ Detecção de crises</li>
                <li>✓ Sem julgamento</li>
              </ul>
            </div>
          </div>

          {/* Link para mais ferramentas */}
          <div className="text-center mt-8">
            <Link href="/dashboard" className={`font-medium inline-flex items-center gap-1 ${theme === 'dark' ? 'text-violet-400 hover:text-violet-300' : 'text-purple-600 hover:text-purple-700'}`}>
              Ver todas as ferramentas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FERRAMENTAS PARA SUA JORNADA - Grid 6 ferramentas */}
      <section className={`py-16 md:py-20 ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-gradient-to-br from-purple-50 to-white'}`}>
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-purple-900'}`}>
              Ferramentas para sua jornada
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Tudo que você precisa para documentar, entender e se proteger
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-md border border-gray-100'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-violet-500/20' : 'bg-purple-100'}`}>
                <Shield className={`w-6 h-6 ${theme === 'dark' ? 'text-violet-400' : 'text-purple-600'}`} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Teste de Clareza</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>Grátis</span>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>18 perguntas para entender os padrões do seu relacionamento</p>
            </div>

            <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-md border border-gray-100'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                <MessageCircle className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Coach IA</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>Grátis</span>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Converse com uma IA treinada para te ouvir sem julgamento</p>
            </div>

            <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-md border border-gray-100'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <BookOpen className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Diário Seguro</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>Grátis</span>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Registre episódios com criptografia e análise de padrões</p>
            </div>

            <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-md border border-gray-100'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'}`}>
                <MapPin className={`w-6 h-6 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Plano de Segurança</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>Grátis</span>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Organize contatos, documentos e rotas de fuga</p>
            </div>

            <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-md border border-gray-100'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                <Lightbulb className={`w-6 h-6 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Biblioteca de Respostas</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>Grátis</span>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Frases prontas para situações difíceis</p>
            </div>

            <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-md border border-gray-100'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-cyan-500/20' : 'bg-cyan-100'}`}>
                <FileText className={`w-6 h-6 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Relatórios PDF</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>Grátis</span>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Exporte seus dados para mostrar a profissionais</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO "PARA QUEM É O RADAR" - ETAPA 31 */}
      <section className={`py-16 md:py-20 ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-white'}`}>
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Para quem é o Radar?
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Uma plataforma para diferentes necessidades, um objetivo comum: clareza.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Card 1: Pessoas em Relacionamentos */}
            <div className={`rounded-2xl p-6 border-2 transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 hover:border-rose-500/50' : 'bg-white border-gray-200 hover:border-rose-300 shadow-lg'}`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-rose-500/20' : 'bg-rose-100'}`}>
                <Heart className={`w-7 h-7 ${theme === 'dark' ? 'text-rose-400' : 'text-rose-600'}`} />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Pessoas em Relacionamentos
              </h3>
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Entenda se o que você vive é normal ou se há padrões abusivos. Sem julgamento.
              </p>
              <Link 
                href="/teste-clareza" 
                className={`text-sm font-medium flex items-center gap-1 ${theme === 'dark' ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600 hover:text-rose-700'}`}
              >
                Fazer Teste de Clareza <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 2: Profissionais de Saúde */}
            <div className={`rounded-2xl p-6 border-2 transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 hover:border-blue-500/50' : 'bg-white border-gray-200 hover:border-blue-300 shadow-lg'}`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <Users className={`w-7 h-7 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Psicólogos e Terapeutas
              </h3>
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Gerencie clientes, acompanhe evolução e gere relatórios para laudos.
              </p>
              <Link 
                href="/profissional" 
                className={`text-sm font-medium flex items-center gap-1 ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                Conhecer Radar Pro <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 3: ONGs e Instituições */}
            <div className={`rounded-2xl p-6 border-2 transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 hover:border-green-500/50' : 'bg-white border-gray-200 hover:border-green-300 shadow-lg'}`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                <Globe className={`w-7 h-7 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ONGs e Instituições
              </h3>
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Ofereça o Radar como ferramenta de apoio para as pessoas que você atende.
              </p>
              <Link 
                href="/contato" 
                className={`text-sm font-medium flex items-center gap-1 ${theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'}`}
              >
                Falar sobre Parceria <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 4: Parceiros Whitelabel */}
            <div className={`rounded-2xl p-6 border-2 transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 hover:border-violet-500/50' : 'bg-white border-gray-200 hover:border-violet-300 shadow-lg'}`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-violet-500/20' : 'bg-violet-100'}`}>
                <Sparkles className={`w-7 h-7 ${theme === 'dark' ? 'text-violet-400' : 'text-violet-600'}`} />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Parceiros Whitelabel
              </h3>
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Lance sua própria versão do Radar com sua marca e domínio.
              </p>
              <Link 
                href="/contato" 
                className={`text-sm font-medium flex items-center gap-1 ${theme === 'dark' ? 'text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-700'}`}
              >
                Solicitar Proposta <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO "RADAR EM NÚMEROS" - ETAPA 31 */}
      <section className={`py-16 md:py-20 ${theme === 'dark' ? 'bg-gradient-to-b from-[#0F172A] to-[#020617]' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Radar em Números
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Impacto real na vida de pessoas que buscam clareza
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {/* Stat 1 */}
            <div className={`text-center p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-lg'}`}>
              <div className={`text-4xl md:text-5xl font-bold mb-2 ${theme === 'dark' ? 'text-violet-400' : 'text-purple-600'}`}>
                5.000+
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Testes realizados
              </p>
            </div>

            {/* Stat 2 */}
            <div className={`text-center p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-lg'}`}>
              <div className={`text-4xl md:text-5xl font-bold mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                12.000+
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Episódios registrados
              </p>
            </div>

            {/* Stat 3 */}
            <div className={`text-center p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-lg'}`}>
              <div className={`text-4xl md:text-5xl font-bold mb-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                8.500+
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Conversas com Coach IA
              </p>
            </div>

            {/* Stat 4 */}
            <div className={`text-center p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-lg'}`}>
              <div className={`text-4xl md:text-5xl font-bold mb-2 ${theme === 'dark' ? 'text-rose-400' : 'text-rose-600'}`}>
                97%
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Relatam mais clareza
              </p>
            </div>
          </div>

          <p className={`text-center text-xs mt-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            * Dados baseados em feedback de usuárias beta. Números atualizados mensalmente.
          </p>
        </div>
      </section>

      {/* SEÇÃO DE DEPOIMENTOS - ETAPA 31 */}
      <section className={`py-16 md:py-20 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-white'}`}>
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Histórias de Clareza
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Pessoas reais compartilhando suas jornadas de autoconhecimento
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Depoimento 1 */}
            <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-4 h-4 fill-current ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
                ))}
              </div>
              <p className={`text-sm mb-4 italic ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                "Eu achava que estava ficando louca. O Radar me mostrou que não era eu — eram os padrões que eu não conseguia ver. Hoje tenho clareza e estou reconstruindo minha vida."
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-violet-500/20' : 'bg-purple-100'}`}>
                  <span className="text-lg">👩</span>
                </div>
                <div>
                  <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Marina S.</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>São Paulo, SP</p>
                </div>
              </div>
            </div>

            {/* Depoimento 2 */}
            <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-4 h-4 fill-current ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
                ))}
              </div>
              <p className={`text-sm mb-4 italic ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                "O diário me ajudou a documentar tudo. Quando precisei de provas para o processo, estava tudo lá. O Radar foi fundamental na minha jornada de libertação."
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <span className="text-lg">👨</span>
                </div>
                <div>
                  <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Carlos R.</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Rio de Janeiro, RJ</p>
                </div>
              </div>
            </div>

            {/* Depoimento 3 */}
            <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-4 h-4 fill-current ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
                ))}
              </div>
              <p className={`text-sm mb-4 italic ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                "Como psicóloga, indico o Radar para minhas pacientes. A ferramenta complementa o trabalho terapêutico e ajuda elas a identificarem padrões entre as sessões."
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                  <span className="text-lg">👩‍⚕️</span>
                </div>
                <div>
                  <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Dra. Fernanda L.</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Psicóloga, CRP 06/XXXXX</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link 
              href="/depoimentos" 
              className={`inline-flex items-center gap-2 font-medium ${theme === 'dark' ? 'text-violet-400 hover:text-violet-300' : 'text-purple-600 hover:text-purple-700'}`}
            >
              Ver mais histórias <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE PLANOS */}
      <section id="planos" className={`py-16 md:py-24 ${theme === 'dark' ? 'bg-gradient-to-b from-[#020617] to-[#0F172A]' : 'bg-gradient-to-b from-blue-50 to-white'}`}>
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('plans.title')}
            </h2>
            <p className={`text-lg max-w-2xl mx-auto mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('plans.subtitle')}
            </p>
            
            {/* Toggle Mensal/Anual */}
            <div className={`inline-flex items-center gap-2 p-1 rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}>
              <button
                onClick={() => setPeriodo('mensal')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  periodo === 'mensal' 
                    ? (theme === 'dark' ? 'bg-violet-600 text-white' : 'bg-white text-gray-900 shadow') 
                    : (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')
                }`}
              >
                {t('plans.monthly')}
              </button>
              <button
                onClick={() => setPeriodo('anual')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  periodo === 'anual' 
                    ? (theme === 'dark' ? 'bg-violet-600 text-white' : 'bg-white text-gray-900 shadow') 
                    : (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')
                }`}
              >
                {t('plans.annual')}
              </button>
            </div>
          </div>

          {/* 3 Cards de Planos */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
            {displayPlans.map((plan) => {
              const planWithPromo = plan as PlanWithPromotion
              const isPopular = plan.popular
              const isFree = plan.price === 0
              
              // Usar preço efetivo se disponível (com promoção), senão preço normal
              const effectiveMonthly = planWithPromo.effectivePrice ?? plan.price
              const effectiveYearly = planWithPromo.effectivePriceAnnual ?? plan.priceAnnual
              const priceToShow = periodo === 'anual' && effectiveYearly 
                ? effectiveYearly / 12 
                : effectiveMonthly
              
              // Preço original (para mostrar riscado)
              const originalPrice = periodo === 'anual' && plan.priceAnnual
                ? plan.priceAnnual / 12
                : plan.price
              
              const hasPromo = planWithPromo.hasPromotion && planWithPromo.showOriginalPrice && originalPrice !== priceToShow
              
              return (
                <div 
                  key={plan.id}
                  className={`rounded-2xl p-6 relative overflow-hidden border-2 ${
                    isPopular 
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-500' 
                      : theme === 'dark'
                      ? 'bg-slate-800/50 border-slate-700/50'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Badge de promoção */}
                  {planWithPromo.hasPromotion && planWithPromo.promotionLabel && (
                    <div className="absolute top-4 left-4">
                      <span className={`text-white text-xs font-bold px-2 py-1 rounded-full ${planWithPromo.promotionBadgeColor || 'bg-red-500'}`}>
                        {planWithPromo.promotionLabel}
                      </span>
                    </div>
                  )}
                  
                  {isPopular && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        POPULAR
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                      isPopular ? 'bg-white/20' : theme === 'dark' ? 'bg-violet-500/20' : 'bg-purple-100'
                    }`}>
                      {isFree ? (
                        <Shield className={`w-6 h-6 ${isPopular ? 'text-white' : theme === 'dark' ? 'text-violet-400' : 'text-purple-600'}`} />
                      ) : plan.id === 'jornada' ? (
                        <TrendingUp className={`w-6 h-6 ${isPopular ? 'text-white' : theme === 'dark' ? 'text-violet-400' : 'text-purple-600'}`} />
                      ) : (
                        <Star className={`w-6 h-6 ${isPopular ? 'text-white' : theme === 'dark' ? 'text-violet-400' : 'text-purple-600'}`} />
                      )}
                    </div>
                    <h3 className={`text-xl font-bold ${isPopular ? 'text-white' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm mt-1 ${isPopular ? 'text-white/80' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {plan.tagline}
                    </p>
                    <div className="mt-4">
                      {/* Preço original riscado (se houver promoção) */}
                      {hasPromo && !isFree && (
                        <div className={`text-sm line-through ${isPopular ? 'text-white/50' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          R$ {originalPrice.toFixed(2).replace('.', ',')}
                        </div>
                      )}
                      <span className={`text-4xl font-bold ${isPopular ? 'text-white' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {isFree ? 'Grátis' : `R$ ${priceToShow.toFixed(2).replace('.', ',')}`}
                      </span>
                      {!isFree && (
                        <span className={isPopular ? 'text-white/70' : theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>/mês</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.slice(0, 7).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className={`h-5 w-5 flex-shrink-0 ${isPopular ? 'text-green-300' : 'text-green-500'}`} />
                        ) : (
                          <span className={`h-5 w-5 flex-shrink-0 text-center ${isPopular ? 'text-white/30' : theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>—</span>
                        )}
                        <span className={`text-sm ${
                          !feature.included 
                            ? (isPopular ? 'text-white/40 line-through' : theme === 'dark' ? 'text-gray-600 line-through' : 'text-gray-400 line-through')
                            : (isPopular ? 'text-white/90' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600')
                        }`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={isFree ? '/cadastro' : '/planos'}
                    className={`block w-full py-3 px-4 rounded-xl font-medium text-center transition-colors ${
                      isPopular
                        ? 'bg-white text-orange-600 hover:bg-gray-100'
                        : isFree
                        ? (theme === 'dark' ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                        : (theme === 'dark' ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-purple-600 text-white hover:bg-purple-700')
                    }`}
                  >
                    {isFree ? 'Plano Atual' : `Assinar ${plan.name.replace('Radar ', '')}`}
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Banner Horizontal - Radar Profissional */}
          <Link 
            href="/profissional"
            className="block max-w-5xl mx-auto p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-white hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">Radar Profissional</h3>
                    <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      EM BREVE
                    </span>
                  </div>
                  <p className="text-blue-100">
                    Para profissionais de saúde e direito. Gerencie clientes, gere relatórios para laudos.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <div className="text-2xl font-bold">R$ 99,90</div>
                  <div className="text-blue-200 text-sm">/mês</div>
                </div>
                <div className="px-6 py-3 bg-white text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap">
                  Entrar na lista →
                </div>
              </div>
            </div>
          </Link>

          {/* Garantias */}
          <div className={`max-w-5xl mx-auto mt-12 rounded-2xl p-8 ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-lg'}`}>
            <h3 className={`text-xl font-bold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Sua segurança é nossa prioridade
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                  <Shield className={`h-6 w-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('plans.guarantee')}</h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Não gostou? Devolvemos 100% do valor.</p>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <Lock className={`h-6 w-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('plans.securePayment')}</h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Processado pelo Stripe, líder mundial.</p>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                  <RefreshCw className={`h-6 w-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('plans.cancelAnytime')}</h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Sem multa, sem burocracia.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 SEÇÕES DINÂMICAS - FanPage Viva (ETAPA 8.4) */}
      <DynamicSections theme={theme} />

      {/* SEÇÃO INCLUSIVA - Homens e Mulheres */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="container-app">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('section.no_gender')}
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {t('section.no_gender_desc')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Card Homens */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-500/30 flex items-center justify-center">
                  <span className="text-3xl">👨</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{t('section.men_victims')}</h3>
                  <p className="text-blue-200">{t('section.men_subtitle')}</p>
                </div>
              </div>
              <p className="text-blue-100 mb-4">
                {t('section.men_text')}
              </p>
              <ul className="space-y-2 text-sm text-blue-100">
                <li className="flex items-center gap-2">✓ {t('section.men_point1')}</li>
                <li className="flex items-center gap-2">✓ {t('section.men_point2')}</li>
                <li className="flex items-center gap-2">✓ {t('section.men_point3')}</li>
              </ul>
            </div>

            {/* Card Mulheres */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-purple-500/30 flex items-center justify-center">
                  <span className="text-3xl">👩</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{t('section.women_victims')}</h3>
                  <p className="text-purple-200">{t('section.women_subtitle')}</p>
                </div>
              </div>
              <p className="text-purple-100 mb-4">
                {t('section.women_text')}
              </p>
              <ul className="space-y-2 text-sm text-purple-100">
                <li className="flex items-center gap-2">✓ {t('section.women_point1')}</li>
                <li className="flex items-center gap-2">✓ {t('section.women_point2')}</li>
                <li className="flex items-center gap-2">✓ {t('section.women_point3')}</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-10">
            <div className="inline-flex items-center gap-3 bg-white/10 rounded-full px-6 py-3 border border-white/20">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="font-medium">{t('section.safe_space')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 💎 DIAMANTE - Você se identifica? (Checklist de reconhecimento) */}
      <section className={`py-16 md:py-20 ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-white'}`}>
        <div className="container-app">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('section.heard_phrases')}
              </h2>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('section.checklist_subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { frase: '"Você está exagerando"', tipo: t('section.invalidacao') },
                { frase: '"Isso nunca aconteceu"', tipo: t('section.gaslighting') },
                { frase: '"Você é muito sensível"', tipo: t('section.minimizacao') },
                { frase: '"Ninguém vai acreditar em você"', tipo: t('section.isolamento') },
                { frase: '"Sem mim você não é nada"', tipo: t('section.dependencia') },
                { frase: '"A culpa é sempre sua"', tipo: t('section.culpabilizacao') },
                { frase: '"Se você me amasse, faria isso"', tipo: t('section.manipulacao') },
                { frase: '"Você me fez fazer isso"', tipo: t('section.inversao') },
              ].map((item, idx) => (
                <label key={idx} className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors border-2 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700/50 hover:bg-violet-500/10 hover:border-violet-500/30' : 'bg-gray-50 border-transparent hover:bg-purple-50 hover:border-purple-200'}`}>
                  <input type="checkbox" className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500" />
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.frase}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-violet-400' : 'text-purple-600'}`}>{item.tipo}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className={`rounded-2xl p-6 text-center ${theme === 'dark' ? 'bg-gradient-to-r from-violet-950/50 to-indigo-950/50 border border-violet-800/30' : 'bg-gradient-to-r from-purple-100 to-blue-100'}`}>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>{t('section.checklist_warning1')}</strong>
                <br />{t('section.checklist_warning2')}
              </p>
              <button onClick={() => router.push('/teste-clareza')} className="btn-primary">
                {t('hero.cta_test')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 🥇 OURO - O que é Abuso Narcisista? (Educação) */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('section.what_is_abuse')}
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              {t('section.what_is_abuse_desc')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-red-400/50 transition-colors">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-xl font-bold mb-2 text-red-400">{t('section.love_bombing')}</h3>
              <p className="text-gray-300 text-sm">{t('section.love_bombing_desc')}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-yellow-400/50 transition-colors">
              <div className="text-4xl mb-4">💨</div>
              <h3 className="text-xl font-bold mb-2 text-yellow-400">{t('section.gaslighting')}</h3>
              <p className="text-gray-300 text-sm">{t('section.gaslighting_desc')}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-blue-400/50 transition-colors">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-xl font-bold mb-2 text-blue-400">{t('section.triangulation')}</h3>
              <p className="text-gray-300 text-sm">{t('section.triangulation_desc')}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-purple-400/50 transition-colors">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-bold mb-2 text-purple-400">{t('section.abuse_cycle')}</h3>
              <p className="text-gray-300 text-sm">{t('section.abuse_cycle_desc')}</p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link href="/blog" className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors">
              {t('section.learn_more_blog')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 💎 DIAMANTE - Para Quem é o Radar? (Ampliação de público) */}
      <section className={`py-16 md:py-20 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-white'}`}>
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('section.who_is_radar')}
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('section.who_is_radar_desc')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {[
              { emoji: '👩', titulo: t('section.women'), desc: t('section.women_desc'), href: '/depoimentos?contexto=mulheres' },
              { emoji: '👨', titulo: t('section.men'), desc: t('section.men_desc'), href: '/depoimentos?contexto=homens' },
              { emoji: '👨‍👩‍👧', titulo: t('section.adult_children'), desc: t('section.adult_children_desc'), href: '/depoimentos?contexto=filhos' },
              { emoji: '💼', titulo: t('section.professionals'), desc: t('section.professionals_desc'), href: '/depoimentos?contexto=trabalho' },
              { emoji: '👵', titulo: t('section.elderly'), desc: t('section.elderly_desc'), href: '/depoimentos?contexto=idosos' },
            ].map((item, idx) => (
              <Link key={idx} href={item.href} className={`rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform block ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-gradient-to-br from-purple-50 to-white card-shadow'}`}>
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.titulo}</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{item.desc}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: '🤝', titulo: t('section.toxic_friendships'), desc: t('section.toxic_friendships_desc'), href: '/depoimentos?contexto=amizade' },
              { emoji: '👨‍👩‍👧‍👦', titulo: t('section.siblings'), desc: t('section.siblings_desc'), href: '/depoimentos?contexto=irmaos' },
              { emoji: '💒', titulo: t('section.religious_leaders'), desc: t('section.religious_leaders_desc'), href: '/depoimentos?contexto=religioso' },
              { emoji: '🎓', titulo: t('section.students'), desc: t('section.students_desc'), href: '/depoimentos?contexto=escola' },
            ].map((item, idx) => (
              <Link key={idx} href={item.href} className={`rounded-2xl p-5 text-center hover:-translate-y-1 transition-transform block ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-gradient-to-br from-blue-50 to-white card-shadow'}`}>
                <div className="text-3xl mb-2">{item.emoji}</div>
                <h3 className={`font-semibold text-sm mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.titulo}</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{item.desc}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('section.who_stats')}</strong>
            </p>
            <Link href="/educacao" className={`inline-flex items-center gap-2 font-medium ${theme === 'dark' ? 'text-violet-400 hover:text-violet-300' : 'text-purple-600 hover:text-purple-700'}`}>
              {t('section.understand_more')} →
            </Link>
          </div>
        </div>
      </section>

      {/* 🥇 OURO - Linha do Tempo do Abuso */}
      <section className={`py-12 md:py-20 ${theme === 'dark' ? 'bg-gradient-to-r from-violet-950/30 to-indigo-950/30' : 'bg-gradient-to-r from-purple-50 to-blue-50'}`}>
        <div className="container-app">
          <div className="text-center mb-8 md:mb-12">
            <h2 className={`text-2xl md:text-4xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              O Ciclo do Relacionamento Narcisista
            </h2>
            <p className={`text-base md:text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Reconheça em qual fase você pode estar
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Versão Desktop - 5 colunas */}
            <div className="hidden md:grid md:grid-cols-5 gap-4">
              {[
                { num: '1', fase: 'Idealização', desc: 'Você é perfeita(o), amor intenso, promessas', cor: 'bg-pink-500' },
                { num: '2', fase: 'Dependência', desc: 'Isolamento, você "precisa" dela(e)', cor: 'bg-orange-500' },
                { num: '3', fase: 'Desvalorização', desc: 'Críticas, humilhação, nada é suficiente', cor: 'bg-red-500' },
                { num: '4', fase: 'Descarte', desc: 'Abandono, tratamento silencioso, frieza', cor: 'bg-gray-500' },
                { num: '5', fase: 'Hoovering', desc: 'Volta arrependida(o), promete mudar', cor: 'bg-purple-500' },
              ].map((item, idx) => (
                <div key={idx} className="relative">
                  <div className={`rounded-2xl p-5 h-full ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white card-shadow'}`}>
                    <div className={`w-10 h-10 ${item.cor} rounded-full flex items-center justify-center text-white font-bold mb-3`}>
                      {item.num}
                    </div>
                    <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.fase}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                  </div>
                  {idx < 4 && (
                    <div className={`hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-2xl ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>→</div>
                  )}
                </div>
              ))}
            </div>

            {/* Versão Mobile - Lista compacta */}
            <div className="md:hidden space-y-3">
              {[
                { num: '1', fase: 'Idealização', cor: 'bg-pink-500' },
                { num: '2', fase: 'Dependência', cor: 'bg-orange-500' },
                { num: '3', fase: 'Desvalorização', cor: 'bg-red-500' },
                { num: '4', fase: 'Descarte', cor: 'bg-gray-500' },
                { num: '5', fase: 'Hoovering', cor: 'bg-purple-500' },
              ].map((item, idx) => (
                <div key={idx} className={`flex items-center gap-3 rounded-xl p-3 ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-sm'}`}>
                  <div className={`w-8 h-8 ${item.cor} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                    {item.num}
                  </div>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.fase}</span>
                </div>
              ))}
              <Link href="/ciclo-abuso" className={`block text-center font-medium mt-4 ${theme === 'dark' ? 'text-violet-400' : 'text-purple-600'}`}>
                Ver detalhes de cada fase →
              </Link>
            </div>

            <p className={`text-center text-sm mt-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              ⚠️ O ciclo se repete. Cada volta, a fase de "lua de mel" fica mais curta.
            </p>
          </div>
        </div>
      </section>

      {/* 💎 DIAMANTE - Mitos vs Realidade */}
      <section className={`py-16 md:py-20 ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-white'}`}>
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Mitos vs Realidade
            </h2>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Quebrando preconceitos sobre abuso narcisista
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              { mito: '"Só mulher sofre abuso emocional"', realidade: 'Homens também são vítimas e têm vergonha de falar' },
              { mito: '"Se fosse tão ruim, ela(e) sairia"', realidade: 'Trauma bond (vínculo traumático) dificulta muito a saída' },
              { mito: '"Narcisista é só quem se acha bonito"', realidade: 'É um transtorno de personalidade, não vaidade' },
              { mito: '"Com amor suficiente, ela(e) muda"', realidade: 'Narcisistas raramente mudam, mesmo com terapia' },
              { mito: '"Abuso é só quando tem violência física"', realidade: 'Abuso emocional deixa cicatrizes invisíveis profundas' },
            ].map((item, idx) => (
              <div key={idx} className={`flex flex-col md:flex-row gap-4 rounded-2xl overflow-hidden ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-gray-50'}`}>
                <div className={`md:w-1/2 p-5 ${theme === 'dark' ? 'bg-red-950/50' : 'bg-red-100'}`}>
                  <p className={`text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>❌ MITO</p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.mito}</p>
                </div>
                <div className={`md:w-1/2 p-5 ${theme === 'dark' ? 'bg-green-950/50' : 'bg-green-100'}`}>
                  <p className={`text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>✅ REALIDADE</p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.realidade}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESEJO - Depoimentos/Social Proof EXPANDIDO */}
      <section className={`py-16 md:py-24 ${theme === 'dark' ? 'bg-gradient-to-br from-violet-950/30 to-indigo-950/30' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}>
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Histórias Reais de Quem Encontrou Clareza</h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Depoimentos anônimos de pessoas que passaram pelo mesmo que você
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`rounded-2xl p-6 border-l-4 border-purple-500 ${theme === 'dark' ? 'bg-slate-800/50 border-r border-t border-b border-slate-700/50' : 'bg-white card-shadow'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">👩</span>
                <span className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>Relacionamento</span>
              </div>
              <p className={`mb-4 italic ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>"Eu achava que era exagero meu. Que eu era sensível demais. O teste me mostrou que não era eu o problema. Foram 8 anos até eu entender."</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>— Mulher, 34 anos, SP</p>
            </div>
            <div className={`rounded-2xl p-6 border-l-4 border-blue-500 ${theme === 'dark' ? 'bg-slate-800/50 border-r border-t border-b border-slate-700/50' : 'bg-white card-shadow'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">👨</span>
                <span className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>Relacionamento</span>
              </div>
              <p className={`mb-4 italic ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>"Eu era um homem de 45 anos e tinha vergonha de admitir que minha esposa me manipulava. Aqui encontrei um lugar sem julgamento."</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>— Homem, 45 anos, RJ</p>
            </div>
            <div className={`rounded-2xl p-6 border-l-4 border-green-500 ${theme === 'dark' ? 'bg-slate-800/50 border-r border-t border-b border-slate-700/50' : 'bg-white card-shadow'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">👩</span>
                <span className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'}`}>Família</span>
              </div>
              <p className={`mb-4 italic ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>"Minha mãe é narcisista. Levei 30 anos para entender porque eu nunca era boa o suficiente. O Radar me ajudou a nomear o que eu sentia."</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>— Mulher, 32 anos, MG</p>
            </div>
            <div className={`rounded-2xl p-6 border-l-4 border-orange-500 ${theme === 'dark' ? 'bg-slate-800/50 border-r border-t border-b border-slate-700/50' : 'bg-white card-shadow'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">👨</span>
                <span className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>Trabalho</span>
              </div>
              <p className={`mb-4 italic ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>"Meu chefe destruía minha autoestima diariamente. Eu achava que era incompetente. O diário me mostrou o padrão de abuso."</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>— Homem, 38 anos, PR</p>
            </div>
            <div className={`rounded-2xl p-6 border-l-4 border-pink-500 ${theme === 'dark' ? 'bg-slate-800/50 border-r border-t border-b border-slate-700/50' : 'bg-white card-shadow'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">👩</span>
                <span className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-pink-500/20 text-pink-300' : 'bg-pink-100 text-pink-700'}`}>Relacionamento</span>
              </div>
              <p className={`mb-4 italic ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>"Ele dizia que me amava, mas eu vivia com medo. O ciclo de abuso explicou tudo. Agora estou livre há 6 meses."</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>— Mulher, 29 anos, BA</p>
            </div>
            <div className={`rounded-2xl p-6 border-l-4 border-red-500 ${theme === 'dark' ? 'bg-slate-800/50 border-r border-t border-b border-slate-700/50' : 'bg-white card-shadow'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">👴</span>
                <span className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'}`}>Família</span>
              </div>
              <p className={`mb-4 italic ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>"Meus filhos me manipulavam para conseguir dinheiro. Eu me sentia culpado por dizer não. Agora sei que não sou obrigado a aceitar tudo."</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>— Homem, 67 anos, RS</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEGURANÇA */}
      <section className={`py-16 md:py-24 ${theme === 'dark' ? 'bg-red-950/30' : 'bg-red-50'}`}>
        <div className="container-app">
          <SectionMarker id="emergency" ariaLabel="Seção de emergência e contatos de ajuda">
            <div className="text-center mb-12">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sua Segurança é Prioridade</h2>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Se você está em risco imediato, procure ajuda agora mesmo</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className={`rounded-xl p-6 text-center ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white card-shadow'}`}>
              <Phone className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-red-500 mb-1">190</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Polícia</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Emergência</p>
            </div>
            <div className={`rounded-xl p-6 text-center ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white card-shadow'}`}>
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-red-500 mb-1">188</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>CVV</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Apoio Emocional 24h</p>
            </div>
            <div className={`rounded-xl p-6 text-center ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white card-shadow'}`}>
              <MessageCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-red-500 mb-1">100</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Direitos Humanos</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Denúncias</p>
            </div>
            <div className={`rounded-xl p-6 text-center ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white card-shadow'}`}>
              <Shield className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-red-500 mb-1">181</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Disque Denúncia</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Anônimo</p>
            </div>
          </div>

          <p className={`text-center text-sm mt-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>Para TODOS:</strong> Homens, mulheres, jovens, idosos — qualquer pessoa merece ajuda e proteção.
          </p>

          {/* Botão para página de segurança completa */}
          <div className="text-center mt-8">
            <Link 
              href="/seguranca" 
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              <Shield className="w-5 h-5" />
              Ver Todos os Recursos de Ajuda por Estado
              <ChevronRight className="w-5 h-5" />
            </Link>
            <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Delegacias, CREAS, Defensorias e mais em todos os 27 estados
            </p>
          </div>
          </SectionMarker>
        </div>
      </section>

      {/* 💎 DIAMANTE EXCLUSIVO - FAQ */}
      <section className={`py-16 md:py-20 ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-gray-50'}`}>
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Perguntas Frequentes
            </h2>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Dúvidas que você pode ter vergonha de perguntar
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { 
                pergunta: 'Como saber se EU sou o narcisista?', 
                resposta: 'O fato de você se perguntar isso já é um bom sinal. Narcisistas raramente questionam seu próprio comportamento. Se você está preocupado(a) em magoar os outros e quer melhorar, provavelmente não é narcisista — mas pode ter comportamentos aprendidos que podem ser trabalhados em terapia.' 
              },
              { 
                pergunta: 'Narcisista pode mudar?', 
                resposta: 'É muito raro. O Transtorno de Personalidade Narcisista é profundamente enraizado. Mesmo com terapia, a mudança é lenta e depende 100% da vontade da pessoa. A maioria não reconhece que tem um problema. Não é sua responsabilidade "consertar" ninguém.' 
              },
              { 
                pergunta: 'Por que é tão difícil sair?', 
                resposta: 'Por causa do "trauma bond" — um vínculo traumático criado pelo ciclo de abuso (carinho → abuso → carinho). Seu cérebro fica viciado nos momentos bons, como uma montanha-russa emocional. Isso não é fraqueza, é neurociência.' 
              },
              { 
                pergunta: 'E se eu ainda amo essa pessoa?', 
                resposta: 'Amor e abuso podem coexistir, infelizmente. Você pode amar alguém e ainda assim reconhecer que a relação te faz mal. Amar não significa aceitar tudo. Você pode amar de longe, protegendo sua saúde mental.' 
              },
              { 
                pergunta: 'Homem pode ser vítima de mulher narcisista?', 
                resposta: 'Absolutamente sim. Abuso emocional não tem gênero. Muitos homens sofrem em silêncio por vergonha ou porque a sociedade não leva a sério. Aqui, você é acolhido sem julgamento.' 
              },
              { 
                pergunta: 'Meus dados estão seguros?', 
                resposta: 'Sim. Usamos criptografia, não compartilhamos dados com terceiros, e você pode apagar tudo a qualquer momento. Temos botão de saída rápida (ESC) e modo discreto para sua segurança.' 
              },
            ].map((item, idx) => (
              <details key={idx} className={`rounded-2xl group ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-sm'}`}>
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className={`font-semibold pr-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.pergunta}</span>
                  <ChevronRight className={`w-5 h-5 group-open:rotate-90 transition-transform ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                </summary>
                <div className={`px-6 pb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.resposta}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* APRENDA MAIS - Links para conteúdo educativo */}
      <section className={`py-16 md:py-20 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-white'}`}>
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Quer Entender Mais?
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Conteúdo educativo para você se informar no seu tempo
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Link href="/gaslighting" className={`rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform ${theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100'}`}>
              <span className="text-3xl mb-3 block">💨</span>
              <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Gaslighting</h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>O que é e como identificar</p>
            </Link>
            <Link href="/love-bombing" className={`rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform ${theme === 'dark' ? 'bg-pink-500/10 border border-pink-500/20' : 'bg-gradient-to-br from-pink-50 to-red-50 border border-pink-100'}`}>
              <span className="text-3xl mb-3 block">🔥</span>
              <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Love Bombing</h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Amor intenso demais</p>
            </Link>
            <Link href="/ciclo-abuso" className={`rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform ${theme === 'dark' ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100'}`}>
              <span className="text-3xl mb-3 block">🔄</span>
              <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Ciclo do Abuso</h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>As 5 fases</p>
            </Link>
            <Link href="/triangulacao" className={`rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform ${theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100'}`}>
              <span className="text-3xl mb-3 block">🎭</span>
              <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Triangulação</h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Manipulação com terceiros</p>
            </Link>
          </div>

          <div className="text-center mt-8">
            <Link href="/blog" className={`font-medium inline-flex items-center gap-1 ${theme === 'dark' ? 'text-violet-400 hover:text-violet-300' : 'text-purple-600 hover:text-purple-700'}`}>
              Ver todos os artigos no Blog <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ RÁPIDO - ETAPA 31 */}
      <section className={`py-16 md:py-20 ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-gray-50'}`}>
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Perguntas Frequentes
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Tire suas dúvidas sobre o Radar Narcisista
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {/* FAQ 1 */}
            <details className={`group rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-md'}`}>
              <summary className={`flex items-center justify-between p-6 cursor-pointer list-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span className="font-semibold text-left">O Radar faz diagnóstico de narcisismo?</span>
                <ChevronRight className="w-5 h-5 transition-transform group-open:rotate-90" />
              </summary>
              <div className={`px-6 pb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <p><strong>Não.</strong> O Radar é uma ferramenta de autoconhecimento e apoio. Não fazemos diagnósticos de transtornos de personalidade. Nosso objetivo é ajudar você a identificar padrões de comportamento e encontrar clareza sobre sua situação. Para diagnósticos, consulte um profissional de saúde mental.</p>
              </div>
            </details>

            {/* FAQ 2 */}
            <details className={`group rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-md'}`}>
              <summary className={`flex items-center justify-between p-6 cursor-pointer list-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span className="font-semibold text-left">Meus dados estão seguros?</span>
                <ChevronRight className="w-5 h-5 transition-transform group-open:rotate-90" />
              </summary>
              <div className={`px-6 pb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <p><strong>Sim.</strong> Usamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança. Seus dados são armazenados de forma segura e nunca são compartilhados com terceiros. Você pode excluir sua conta e todos os dados a qualquer momento.</p>
              </div>
            </details>

            {/* FAQ 3 */}
            <details className={`group rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-md'}`}>
              <summary className={`flex items-center justify-between p-6 cursor-pointer list-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span className="font-semibold text-left">O Radar é só para mulheres?</span>
                <ChevronRight className="w-5 h-5 transition-transform group-open:rotate-90" />
              </summary>
              <div className={`px-6 pb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <p><strong>Não.</strong> O Radar é para todas as pessoas, independente de gênero. Homens também podem ser vítimas de relacionamentos abusivos e merecem apoio. Nossa linguagem é inclusiva e nossas ferramentas funcionam para qualquer pessoa.</p>
              </div>
            </details>

            {/* FAQ 4 */}
            <details className={`group rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-md'}`}>
              <summary className={`flex items-center justify-between p-6 cursor-pointer list-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span className="font-semibold text-left">Posso usar o Radar sem criar conta?</span>
                <ChevronRight className="w-5 h-5 transition-transform group-open:rotate-90" />
              </summary>
              <div className={`px-6 pb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <p><strong>Sim.</strong> O Teste de Clareza pode ser feito sem cadastro e é 100% anônimo. Se quiser salvar seus resultados, acessar o Diário, o Coach IA e outras ferramentas, você pode criar uma conta gratuita.</p>
              </div>
            </details>

            {/* FAQ 5 */}
            <details className={`group rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-md'}`}>
              <summary className={`flex items-center justify-between p-6 cursor-pointer list-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span className="font-semibold text-left">O que é o Coach IA?</span>
                <ChevronRight className="w-5 h-5 transition-transform group-open:rotate-90" />
              </summary>
              <div className={`px-6 pb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>O Coach IA é um assistente virtual treinado para oferecer apoio empático 24/7. Ele usa inteligência artificial para ajudar você a organizar pensamentos, identificar padrões e encontrar caminhos. <strong>Não substitui terapia</strong>, mas pode ser um complemento valioso no seu processo de autoconhecimento.</p>
              </div>
            </details>
          </div>

          <div className="text-center mt-10">
            <Link 
              href="/faq" 
              className={`inline-flex items-center gap-2 font-medium ${theme === 'dark' ? 'text-violet-400 hover:text-violet-300' : 'text-purple-600 hover:text-purple-700'}`}
            >
              Ver todas as perguntas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 🏆 EXCLUSIVO - Frase de Impacto Final */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-center">
        <div className="container-app">
          <blockquote className="text-2xl md:text-4xl font-light italic max-w-4xl mx-auto mb-6">
            "Você não está louca(o). Você não está exagerando. O que você sente é real. E você merece paz."
          </blockquote>
          <p className="text-gray-400">— Para todos que precisam ouvir isso hoje</p>
        </div>
      </section>

      {/* CTA FINAL - AÇÃO */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-purple-600 to-purple-800 text-white">
        <div className="container-app text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronta(o) para encontrar clareza?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            O primeiro passo é o mais difícil. Mas você já deu esse passo ao chegar aqui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => router.push('/teste-clareza')} className="bg-white text-purple-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-smooth flex items-center justify-center gap-2 shadow-lg">
              Fazer Teste de Clareza <ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={() => router.push('/cadastro')} className="border-2 border-white/70 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-smooth">
              Criar Conta Gratuita
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER - 5 Colunas */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-8">
            {/* Produto */}
            <div>
              <h4 className="font-semibold text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/teste-clareza" className="hover:text-white transition-smooth">Teste de Clareza</Link></li>
                <li><Link href="/diario" className="hover:text-white transition-smooth">Diário</Link></li>
                <li><Link href="/chat" className="hover:text-white transition-smooth">Coach IA</Link></li>
                <li><Link href="/planos" className="hover:text-white transition-smooth">Planos</Link></li>
                <li><Link href="/status" className="hover:text-white transition-smooth">Status</Link></li>
              </ul>
            </div>

            {/* Entenda */}
            <div>
              <h4 className="font-semibold text-white mb-4">Entenda</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="hover:text-white transition-smooth">Blog</Link></li>
                <li><Link href="/educacao" className="hover:text-white transition-smooth">Educação</Link></li>
                <li><Link href="/estatisticas/publicas" className="hover:text-white transition-smooth">Estatísticas</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-smooth">FAQ</Link></li>
              </ul>
            </div>

            {/* Segurança */}
            <div>
              <h4 className="font-semibold text-white mb-4">Segurança</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacidade" className="hover:text-white transition-smooth">Privacidade</Link></li>
                <li><Link href="/termos" className="hover:text-white transition-smooth">Termos de Uso</Link></li>
                <li><Link href="/seguranca" className="hover:text-white transition-smooth">Dicas de Segurança</Link></li>
                <li><Link href="/seguranca-digital" className="hover:text-white transition-smooth">Modo Discreto</Link></li>
              </ul>
            </div>

            {/* Ajuda */}
            <div>
              <h4 className="font-semibold text-white mb-4">Ajuda</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq" className="hover:text-white transition-smooth">FAQ</Link></li>
                <li><Link href="/contato" className="hover:text-white transition-smooth">Contato</Link></li>
                <li className="pt-2">
                  <span className="text-xs text-gray-400">Emergência:</span>
                </li>
                <li><a href="tel:188" className="hover:text-white transition-smooth">📞 188 (CVV)</a></li>
                <li><a href="tel:190" className="hover:text-white transition-smooth">📞 190 (Polícia)</a></li>
                <li><a href="tel:180" className="hover:text-white transition-smooth">📞 180 (Mulher)</a></li>
              </ul>
            </div>

            {/* Profissionais */}
            <div>
              <h4 className="font-semibold text-white mb-4">Profissionais</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/profissionais" className="hover:text-white transition-smooth">Para Psicólogos</Link></li>
                <li><Link href="/profissionais" className="hover:text-white transition-smooth">Para Advogados</Link></li>
                <li><Link href="/pesquisa/academica" className="hover:text-white transition-smooth">Pesquisa</Link></li>
                <li><Link href="/contato" className="hover:text-white transition-smooth">Parcerias</Link></li>
              </ul>
            </div>
          </div>

          {/* Logo e descrição */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 border-t border-gray-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">RN</span>
              </div>
              <div>
                <span className="font-semibold text-white">Radar Narcisista BR</span>
                <p className="text-xs text-gray-400">Clareza em meio à confusão</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 text-center md:text-right max-w-md">
              Ferramenta de apoio para identificar padrões abusivos e encontrar clareza emocional.
            </p>
          </div>
          {/* Disclaimer Legal */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-8">
            <p className="text-xs text-gray-400 text-center">
              <strong className="text-gray-300">⚠️ Aviso Importante:</strong> Este aplicativo é uma ferramenta de apoio e autoconhecimento. 
              <strong> Não substitui</strong> acompanhamento profissional de saúde mental, terapia ou aconselhamento jurídico. 
              <strong> Não faz diagnósticos</strong> de transtornos de personalidade. 
              Destinado a maiores de 18 anos. Se você está em crise ou risco imediato, ligue 188 (CVV) ou 190 (Polícia).
            </p>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>© 2024 Radar Narcisista BR. Todos os direitos reservados.</p>
            <p className="mt-2">Desenvolvido com base em literatura sobre abuso psicológico e relacionamentos tóxicos.</p>
          </div>
        </div>
      </footer>

      {/* INDICADOR DE SCROLL LATERAL + BOTÃO VOLTAR - Inicia em 65% */}
      <div 
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3 transition-opacity duration-300"
        style={{ opacity: 0.65 + (scrollProgress / 100) * 0.35 }}
      >
        {/* Barra de progresso vertical */}
        <div className="w-2 h-32 bg-gray-300/50 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className="w-full bg-gradient-to-b from-purple-600 to-blue-500 rounded-full transition-all duration-150"
            style={{ height: `${scrollProgress}%` }}
          />
        </div>
        
        {/* Porcentagem */}
        <span 
          className="text-xs font-bold px-2 py-1 rounded-full shadow-sm backdrop-blur-sm"
          style={{ 
            backgroundColor: `rgba(255,255,255,${0.5 + (scrollProgress / 100) * 0.5})`,
            color: scrollProgress > 65 ? '#7c3aed' : '#6b7280'
          }}
        >
          {Math.round(scrollProgress)}%
        </span>

        {/* Botão Voltar ao Topo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-purple-600 hover:bg-purple-700 p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Voltar ao topo"
          style={{ 
            color: '#ffffff',
            opacity: showBackToTop ? 1 : 0.5
          }}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>

      {/* Social Proof Widget */}
      <SocialProofWidget />
      </main>

    </div>
  )
}
