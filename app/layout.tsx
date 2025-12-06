import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'
import EmergencyButton from '@/components/EmergencyButton'
import LegalDisclaimer from '@/components/LegalDisclaimer'
import { ToastProvider } from '@/components/Toast'
import { OnboardingProvider } from '@/components/Onboarding'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AnalyticsProvider } from '@/components/Analytics'
import { SkipLinks } from '@/components/Accessibility'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import { TermsConfirmationButton } from '@/components/TermsConfirmationButton'
import CrispChat from '@/components/CrispChat'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

// Função para obter URL base correta
const getMetadataBaseUrl = () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl && !appUrl.includes('localhost')) {
    return appUrl
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'https://radarnarcisista.com.br'
}

export const metadata: Metadata = {
  metadataBase: new URL(getMetadataBaseUrl()),
  title: {
    default: 'Radar Narcisista BR – Encontre clareza em meio à confusão',
    template: '%s | Radar Narcisista BR',
  },
  description:
    'Ferramenta segura e confidencial para ajudar pessoas em relacionamentos abusivos a identificar padrões, registrar episódios e buscar apoio com segurança.',
  keywords: 'narcisismo, abuso emocional, relacionamento tóxico, gaslighting, clareza emocional, apoio psicológico, teste narcisismo, diário emocional',
  authors: [{ name: 'Radar Narcisista BR' }],
  creator: 'Radar Narcisista BR',
  publisher: 'Radar Narcisista BR',
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  
  // Open Graph - Facebook, WhatsApp, LinkedIn
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://radarnarcisista.com.br',
    siteName: 'Radar Narcisista BR',
    title: 'Radar Narcisista BR – Você não está imaginando coisas',
    description: 'Ferramenta segura para identificar padrões de abuso emocional, registrar episódios e encontrar clareza. 100% confidencial.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Radar Narcisista BR - Encontre clareza em meio à confusão',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Radar Narcisista BR – Você não está imaginando coisas',
    description: 'Ferramenta segura para identificar padrões de abuso emocional e encontrar clareza. 100% confidencial.',
    images: ['/og-image.png'],
    creator: '@radarnarcisista',
  },
  
  // Verificação
  verification: {
    // google: 'seu-codigo-google',
    // yandex: 'seu-codigo-yandex',
  },
  
  // Alternates
  alternates: {
    canonical: 'https://radarnarcisista.com.br',
    languages: {
      'pt-BR': 'https://radarnarcisista.com.br',
      'en': 'https://radarnarcisista.com.br/en',
      'es': 'https://radarnarcisista.com.br/es',
    },
  },
  
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Radar Narcisista',
  },
  formatDetection: {
    telephone: true,
  },
  other: {
    'age-restriction': '18+',
    'content-warning': 'abuse-psychological-support',
    'disclaimer': 'Este site nao substitui ajuda profissional. Em caso de emergencia, ligue 190 (Policia), 180 (Central de Atendimento a Mulher) ou 188 (Disque Saude).',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileColor': '#9333ea',
    'msapplication-tap-highlight': 'no',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#9333ea' },
    { media: '(prefers-color-scheme: dark)', color: '#581c87' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        {/* Meta tags para todos os dispositivos */}
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="width" />
        <meta name="apple-touch-fullscreen" content="yes" />
        
        {/* Previne zoom automático em inputs no iOS */}
        <meta name="format-detection" content="telephone=yes" />
        
        {/* CarPlay / Android Auto - permite uso em carros */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        
        {/* Ícones para diferentes dispositivos */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        
        {/* Splash screens para iOS */}
        <link rel="apple-touch-startup-image" href="/icons/splash.png" />
        
      </head>
      <body className={`${inter.className} bg-gradient-main dark:bg-[var(--bg-primary)] min-h-screen antialiased transition-colors duration-300`}>
        <ServiceWorkerRegistration />
        <SkipLinks />
        <LegalDisclaimer />
        <AnalyticsProvider>
          <ThemeProvider>
            <ToastProvider>
              <OnboardingProvider>
                <main id="main-content">
                  {children}
                </main>
                <EmergencyButton />
                <TermsConfirmationButton variant="floating" context="geral" />
                <CrispChat publicOnly />
              </OnboardingProvider>
            </ToastProvider>
          </ThemeProvider>
        </AnalyticsProvider>
      </body>
    </html>
  )
}
