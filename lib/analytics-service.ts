/**
 * ANALYTICS SERVICE - Sistema de Analytics Avançado
 * 
 * BLOCO 41-45 - ETAPA 45
 * 
 * Suporta múltiplos provedores:
 * - Mixpanel
 * - Amplitude
 * - PostHog
 * - Google Analytics 4
 * - Custom (Supabase)
 */

import { createClient } from '@/lib/supabase/client'

// =============================================================================
// TIPOS
// =============================================================================

export interface AnalyticsConfig {
  provider: 'mixpanel' | 'amplitude' | 'posthog' | 'ga4' | 'custom'
  apiKey?: string
  projectId?: string
  enabled: boolean
  debug?: boolean
}

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined
}

export interface UserProperties {
  userId?: string
  email?: string
  name?: string
  plan?: string
  role?: string
  createdAt?: string
  [key: string]: string | number | boolean | null | undefined
}

export interface PageViewData {
  path: string
  title?: string
  referrer?: string
  queryParams?: Record<string, string>
}

// =============================================================================
// EVENTOS PADRÃO
// =============================================================================

export const ANALYTICS_EVENTS = {
  // Autenticação
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  EMAIL_VERIFIED: 'email_verified',
  
  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',
  
  // Features
  FEATURE_USED: 'feature_used',
  FEATURE_LIMIT_WARNING: 'feature_limit_warning',
  FEATURE_LIMIT_REACHED: 'feature_limit_reached',
  
  // Billing
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_UPDATED: 'subscription_updated',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  PAYMENT_FAILED: 'payment_failed',
  
  // Engajamento
  PAGE_VIEWED: 'page_viewed',
  BUTTON_CLICKED: 'button_clicked',
  FORM_SUBMITTED: 'form_submitted',
  SEARCH_PERFORMED: 'search_performed',
  
  // Específicos do Radar
  DIARY_ENTRY_CREATED: 'diary_entry_created',
  CLARITY_TEST_STARTED: 'clarity_test_started',
  CLARITY_TEST_COMPLETED: 'clarity_test_completed',
  AI_CHAT_MESSAGE_SENT: 'ai_chat_message_sent',
  SAFETY_PLAN_CREATED: 'safety_plan_created',
  EMERGENCY_MODE_ACTIVATED: 'emergency_mode_activated'
}

// =============================================================================
// CLASSE PRINCIPAL
// =============================================================================

export class AnalyticsService {
  private config: AnalyticsConfig
  private userId: string | null = null
  private userProperties: UserProperties = {}
  private supabase = createClient()

  constructor(config?: Partial<AnalyticsConfig>) {
    this.config = {
      provider: (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER as AnalyticsConfig['provider']) || 'custom',
      apiKey: process.env.NEXT_PUBLIC_ANALYTICS_API_KEY,
      projectId: process.env.NEXT_PUBLIC_ANALYTICS_PROJECT_ID,
      enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false',
      debug: process.env.NODE_ENV === 'development',
      ...config
    }
  }

  /**
   * Inicializa o serviço de analytics
   */
  async init(): Promise<void> {
    if (!this.config.enabled) return

    switch (this.config.provider) {
      case 'mixpanel':
        await this.initMixpanel()
        break
      case 'amplitude':
        await this.initAmplitude()
        break
      case 'posthog':
        await this.initPostHog()
        break
      case 'ga4':
        await this.initGA4()
        break
      case 'custom':
        // Usa Supabase, não precisa init
        break
    }

    this.log('Analytics inicializado', { provider: this.config.provider })
  }

  /**
   * Identifica o usuário
   */
  identify(userId: string, properties?: UserProperties): void {
    if (!this.config.enabled) return

    this.userId = userId
    this.userProperties = { ...this.userProperties, ...properties }

    switch (this.config.provider) {
      case 'mixpanel':
        if (typeof window !== 'undefined' && (window as any).mixpanel) {
          (window as any).mixpanel.identify(userId)
          if (properties) {
            (window as any).mixpanel.people.set(properties)
          }
        }
        break
      case 'amplitude':
        if (typeof window !== 'undefined' && (window as any).amplitude) {
          (window as any).amplitude.setUserId(userId)
          if (properties) {
            (window as any).amplitude.setUserProperties(properties)
          }
        }
        break
      case 'posthog':
        if (typeof window !== 'undefined' && (window as any).posthog) {
          (window as any).posthog.identify(userId, properties)
        }
        break
      case 'ga4':
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('set', 'user_id', userId)
          if (properties) {
            (window as any).gtag('set', 'user_properties', properties)
          }
        }
        break
    }

    this.log('Usuário identificado', { userId, properties })
  }

  /**
   * Rastreia um evento
   */
  async track(eventName: string, properties?: EventProperties): Promise<void> {
    if (!this.config.enabled) return

    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    }

    switch (this.config.provider) {
      case 'mixpanel':
        if (typeof window !== 'undefined' && (window as any).mixpanel) {
          (window as any).mixpanel.track(eventName, enrichedProperties)
        }
        break
      case 'amplitude':
        if (typeof window !== 'undefined' && (window as any).amplitude) {
          (window as any).amplitude.track(eventName, enrichedProperties)
        }
        break
      case 'posthog':
        if (typeof window !== 'undefined' && (window as any).posthog) {
          (window as any).posthog.capture(eventName, enrichedProperties)
        }
        break
      case 'ga4':
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', eventName, enrichedProperties)
        }
        break
      case 'custom':
        await this.trackToSupabase(eventName, enrichedProperties)
        break
    }

    this.log('Evento rastreado', { eventName, properties: enrichedProperties })
  }

  /**
   * Rastreia visualização de página
   */
  async pageView(data: PageViewData): Promise<void> {
    await this.track(ANALYTICS_EVENTS.PAGE_VIEWED, {
      path: data.path,
      title: data.title,
      referrer: data.referrer,
      ...data.queryParams
    })
  }

  /**
   * Rastreia clique em botão
   */
  async buttonClick(buttonId: string, properties?: EventProperties): Promise<void> {
    await this.track(ANALYTICS_EVENTS.BUTTON_CLICKED, {
      buttonId,
      ...properties
    })
  }

  /**
   * Rastreia uso de feature
   */
  async featureUsed(featureKey: string, properties?: EventProperties): Promise<void> {
    await this.track(ANALYTICS_EVENTS.FEATURE_USED, {
      featureKey,
      ...properties
    })
  }

  /**
   * Reseta o usuário (logout)
   */
  reset(): void {
    this.userId = null
    this.userProperties = {}

    switch (this.config.provider) {
      case 'mixpanel':
        if (typeof window !== 'undefined' && (window as any).mixpanel) {
          (window as any).mixpanel.reset()
        }
        break
      case 'amplitude':
        if (typeof window !== 'undefined' && (window as any).amplitude) {
          (window as any).amplitude.reset()
        }
        break
      case 'posthog':
        if (typeof window !== 'undefined' && (window as any).posthog) {
          (window as any).posthog.reset()
        }
        break
    }

    this.log('Analytics resetado')
  }

  // ===========================================================================
  // MÉTODOS PRIVADOS
  // ===========================================================================

  private async initMixpanel(): Promise<void> {
    if (typeof window === 'undefined' || !this.config.apiKey) return

    // Carregar script do Mixpanel
    const script = document.createElement('script')
    script.innerHTML = `
      (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}for(var d={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<j.length;c++)b(j[c]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
      mixpanel.init('${this.config.apiKey}');
    `
    document.head.appendChild(script)
  }

  private async initAmplitude(): Promise<void> {
    if (typeof window === 'undefined' || !this.config.apiKey) return

    // Carregar script do Amplitude
    const script = document.createElement('script')
    script.src = 'https://cdn.amplitude.com/libs/analytics-browser-2.0.0-min.js.gz'
    script.onload = () => {
      (window as any).amplitude.init(this.config.apiKey)
    }
    document.head.appendChild(script)
  }

  private async initPostHog(): Promise<void> {
    if (typeof window === 'undefined' || !this.config.apiKey) return

    // Carregar script do PostHog
    const script = document.createElement('script')
    script.innerHTML = `
      !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
      posthog.init('${this.config.apiKey}', {api_host: 'https://app.posthog.com'});
    `
    document.head.appendChild(script)
  }

  private async initGA4(): Promise<void> {
    if (typeof window === 'undefined' || !this.config.projectId) return

    // Carregar script do GA4
    const script1 = document.createElement('script')
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.projectId}`
    document.head.appendChild(script1)

    const script2 = document.createElement('script')
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${this.config.projectId}');
    `
    document.head.appendChild(script2)
  }

  private async trackToSupabase(eventName: string, properties: EventProperties): Promise<void> {
    try {
      await this.supabase.from('analytics_events').insert({
        event_name: eventName,
        user_id: this.userId,
        properties,
        created_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('[Analytics] Erro ao salvar no Supabase:', error)
    }
  }

  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[Analytics] ${message}`, data || '')
    }
  }
}

// =============================================================================
// INSTÂNCIA SINGLETON
// =============================================================================

let analyticsInstance: AnalyticsService | null = null

export function getAnalytics(): AnalyticsService {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsService()
  }
  return analyticsInstance
}

// =============================================================================
// HOOK REACT
// =============================================================================

export function useAnalytics() {
  const analytics = getAnalytics()
  
  return {
    init: analytics.init.bind(analytics),
    identify: analytics.identify.bind(analytics),
    track: analytics.track.bind(analytics),
    pageView: analytics.pageView.bind(analytics),
    buttonClick: analytics.buttonClick.bind(analytics),
    featureUsed: analytics.featureUsed.bind(analytics),
    reset: analytics.reset.bind(analytics),
    events: ANALYTICS_EVENTS
  }
}
