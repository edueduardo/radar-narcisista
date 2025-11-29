'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

// ============================================
// CONFIGURAÇÃO
// ============================================

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

// ============================================
// GOOGLE ANALYTICS
// ============================================

// Declaração global para TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
    fbq: (...args: any[]) => void
    _fbq: any
    clarity: (...args: any[]) => void
    Sentry: any
  }
}

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
    </>
  )
}

// ============================================
// META PIXEL (Facebook)
// ============================================

export function MetaPixel() {
  if (!META_PIXEL_ID) return null

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

// ============================================
// MICROSOFT CLARITY (Heatmaps e Gravação de Sessões)
// ============================================

export function MicrosoftClarity() {
  if (!CLARITY_PROJECT_ID) return null

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
        `,
      }}
    />
  )
}

// Funções do Clarity para identificação e eventos
export const clarityUtils = {
  // Identificar usuário (anonimizado)
  identify: (userId: string, sessionId?: string, pageId?: string) => {
    if (typeof window.clarity === 'function') {
      window.clarity('identify', userId, sessionId, pageId)
    }
  },

  // Definir tag customizada
  setTag: (key: string, value: string) => {
    if (typeof window.clarity === 'function') {
      window.clarity('set', key, value)
    }
  },

  // Marcar evento importante
  event: (eventName: string) => {
    if (typeof window.clarity === 'function') {
      window.clarity('event', eventName)
    }
  },

  // Upgrade de sessão (força gravação)
  upgrade: (reason: string) => {
    if (typeof window.clarity === 'function') {
      window.clarity('upgrade', reason)
    }
  },

  // Consentimento (LGPD)
  consent: () => {
    if (typeof window.clarity === 'function') {
      window.clarity('consent')
    }
  }
}

// ============================================
// SENTRY (Monitoramento de Erros)
// ============================================

export function SentryErrorTracking() {
  if (!SENTRY_DSN) return null

  return (
    <Script
      id="sentry-sdk"
      strategy="afterInteractive"
      src="https://browser.sentry-cdn.com/7.91.0/bundle.tracing.min.js"
      crossOrigin="anonymous"
      onLoad={() => {
        if (typeof window.Sentry !== 'undefined') {
          window.Sentry.init({
            dsn: SENTRY_DSN,
            environment: process.env.NODE_ENV,
            tracesSampleRate: 0.1, // 10% das transações
            replaysSessionSampleRate: 0.1, // 10% das sessões
            replaysOnErrorSampleRate: 1.0, // 100% quando há erro
            
            // Ignorar erros comuns
            ignoreErrors: [
              'ResizeObserver loop limit exceeded',
              'ResizeObserver loop completed with undelivered notifications',
              'Non-Error promise rejection captured',
              'Network request failed',
              'Failed to fetch',
              'Load failed',
              'ChunkLoadError',
            ],
            
            // Não enviar dados sensíveis
            beforeSend(event: any) {
              // Remover dados sensíveis
              if (event.request?.cookies) {
                delete event.request.cookies
              }
              if (event.request?.headers) {
                delete event.request.headers['Authorization']
                delete event.request.headers['Cookie']
              }
              return event
            },
          })
        }
      }}
    />
  )
}

// Funções do Sentry para captura manual
export const sentryUtils = {
  // Capturar erro manualmente
  captureError: (error: Error, context?: Record<string, any>) => {
    if (typeof window.Sentry !== 'undefined') {
      window.Sentry.captureException(error, { extra: context })
    }
    console.error('[Sentry]', error, context)
  },

  // Capturar mensagem
  captureMessage: (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    if (typeof window.Sentry !== 'undefined') {
      window.Sentry.captureMessage(message, level)
    }
  },

  // Definir usuário (anonimizado)
  setUser: (userId: string) => {
    if (typeof window.Sentry !== 'undefined') {
      window.Sentry.setUser({ id: userId })
    }
  },

  // Limpar usuário (logout)
  clearUser: () => {
    if (typeof window.Sentry !== 'undefined') {
      window.Sentry.setUser(null)
    }
  },

  // Adicionar breadcrumb (rastro)
  addBreadcrumb: (message: string, category: string, data?: Record<string, any>) => {
    if (typeof window.Sentry !== 'undefined') {
      window.Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
      })
    }
  },

  // Definir contexto extra
  setContext: (name: string, context: Record<string, any>) => {
    if (typeof window.Sentry !== 'undefined') {
      window.Sentry.setContext(name, context)
    }
  },

  // Definir tag
  setTag: (key: string, value: string) => {
    if (typeof window.Sentry !== 'undefined') {
      window.Sentry.setTag(key, value)
    }
  }
}

// ============================================
// PAGE VIEW TRACKER
// ============================================

function PageViewTrackerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      // Google Analytics
      if (typeof window.gtag === 'function') {
        window.gtag('config', GA_MEASUREMENT_ID, {
          page_path: pathname,
        })
      }

      // Meta Pixel
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'PageView')
      }

      // Microsoft Clarity - marcar navegação
      if (typeof window.clarity === 'function') {
        window.clarity('set', 'page', pathname)
      }

      // Sentry - adicionar breadcrumb de navegação
      if (typeof window.Sentry !== 'undefined') {
        window.Sentry.addBreadcrumb({
          category: 'navigation',
          message: `Navegou para ${pathname}`,
          level: 'info',
        })
      }
    }
  }, [pathname, searchParams])

  return null
}

export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <PageViewTrackerInner />
    </Suspense>
  )
}

// ============================================
// EVENTOS CUSTOMIZADOS
// ============================================

export const analytics = {
  // Evento genérico
  event: (action: string, category: string, label?: string, value?: number) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      })
    }
  },

  // Teste de clareza
  testeIniciado: () => {
    analytics.event('teste_iniciado', 'engagement')
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'StartTrial')
    }
  },

  testeConcluido: (zona: string, score: number) => {
    analytics.event('teste_concluido', 'engagement', zona, score)
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'CompleteRegistration', { content_name: zona })
    }
  },

  // Diário
  entradaCriada: () => {
    analytics.event('entrada_criada', 'engagement')
  },

  // Chat
  chatIniciado: () => {
    analytics.event('chat_iniciado', 'engagement')
  },

  mensagemEnviada: () => {
    analytics.event('mensagem_enviada', 'engagement')
  },

  // Conversão
  cadastroIniciado: () => {
    analytics.event('cadastro_iniciado', 'conversion')
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead')
    }
  },

  cadastroConcluido: () => {
    analytics.event('cadastro_concluido', 'conversion')
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'CompleteRegistration')
    }
  },

  assinaturaIniciada: (plano: string, valor: number) => {
    analytics.event('assinatura_iniciada', 'conversion', plano, valor)
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'InitiateCheckout', {
        content_name: plano,
        value: valor,
        currency: 'BRL'
      })
    }
  },

  assinaturaConcluida: (plano: string, valor: number) => {
    analytics.event('assinatura_concluida', 'conversion', plano, valor)
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Purchase', {
        content_name: plano,
        value: valor,
        currency: 'BRL'
      })
    }
  },

  // Referral
  codigoCompartilhado: (via: string) => {
    analytics.event('codigo_compartilhado', 'referral', via)
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Share')
    }
  },

  codigoAplicado: () => {
    analytics.event('codigo_aplicado', 'referral')
  },

  // Emergência
  botaoEmergenciaClicado: () => {
    analytics.event('emergencia_ativada', 'safety')
  },

  // PDF
  pdfGerado: (tipo: string) => {
    analytics.event('pdf_gerado', 'engagement', tipo)
  },
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoogleAnalytics />
      <MetaPixel />
      <MicrosoftClarity />
      <SentryErrorTracking />
      <PageViewTracker />
      {children}
    </>
  )
}

export default AnalyticsProvider
