/**
 * Sistema de Customização Visual por Tenant
 * FASE 9.2 - White Label
 */

import { TenantBranding } from './multi-tenant'

/**
 * Gera CSS customizado baseado no branding do tenant
 */
export function generateTenantCSS(branding: TenantBranding): string {
  const primary = branding.primaryColor || '#7c3aed'
  const secondary = branding.secondaryColor || '#ec4899'
  const accent = branding.accentColor || primary

  return `
    :root {
      --color-primary: ${primary};
      --color-primary-light: ${lightenColor(primary, 0.2)};
      --color-primary-dark: ${darkenColor(primary, 0.2)};
      
      --color-secondary: ${secondary};
      --color-secondary-light: ${lightenColor(secondary, 0.2)};
      --color-secondary-dark: ${darkenColor(secondary, 0.2)};
      
      --color-accent: ${accent};
      
      ${branding.fontFamily ? `--font-family: ${branding.fontFamily};` : ''}
    }
    
    .bg-primary { background-color: var(--color-primary) !important; }
    .bg-primary-light { background-color: var(--color-primary-light) !important; }
    .bg-primary-dark { background-color: var(--color-primary-dark) !important; }
    
    .text-primary { color: var(--color-primary) !important; }
    .text-primary-light { color: var(--color-primary-light) !important; }
    .text-primary-dark { color: var(--color-primary-dark) !important; }
    
    .border-primary { border-color: var(--color-primary) !important; }
    
    .bg-secondary { background-color: var(--color-secondary) !important; }
    .text-secondary { color: var(--color-secondary) !important; }
    
    .ring-primary { --tw-ring-color: var(--color-primary) !important; }
    
    ${branding.fontFamily ? `
    body, .font-sans {
      font-family: var(--font-family), ui-sans-serif, system-ui, sans-serif !important;
    }
    ` : ''}
  `
}

/**
 * Gera configuração de tema para Tailwind
 */
export function generateTailwindTheme(branding: TenantBranding): Record<string, any> {
  const primary = branding.primaryColor || '#7c3aed'
  const secondary = branding.secondaryColor || '#ec4899'

  return {
    colors: {
      primary: {
        50: lightenColor(primary, 0.9),
        100: lightenColor(primary, 0.8),
        200: lightenColor(primary, 0.6),
        300: lightenColor(primary, 0.4),
        400: lightenColor(primary, 0.2),
        500: primary,
        600: darkenColor(primary, 0.1),
        700: darkenColor(primary, 0.2),
        800: darkenColor(primary, 0.3),
        900: darkenColor(primary, 0.4),
      },
      secondary: {
        50: lightenColor(secondary, 0.9),
        100: lightenColor(secondary, 0.8),
        200: lightenColor(secondary, 0.6),
        300: lightenColor(secondary, 0.4),
        400: lightenColor(secondary, 0.2),
        500: secondary,
        600: darkenColor(secondary, 0.1),
        700: darkenColor(secondary, 0.2),
        800: darkenColor(secondary, 0.3),
        900: darkenColor(secondary, 0.4),
      }
    }
  }
}

/**
 * Componente de estilo inline para SSR
 */
export function TenantStyleTag({ branding }: { branding: TenantBranding }): string {
  return `<style id="tenant-branding">${generateTenantCSS(branding)}</style>`
}

/**
 * Valida cores do branding
 */
export function validateBranding(branding: Partial<TenantBranding>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (branding.primaryColor && !isValidHexColor(branding.primaryColor)) {
    errors.push('Cor primária inválida (use formato #RRGGBB)')
  }

  if (branding.secondaryColor && !isValidHexColor(branding.secondaryColor)) {
    errors.push('Cor secundária inválida (use formato #RRGGBB)')
  }

  if (branding.logo && !isValidUrl(branding.logo)) {
    errors.push('URL do logo inválida')
  }

  if (branding.appName && branding.appName.length < 2) {
    errors.push('Nome do app deve ter pelo menos 2 caracteres')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Preset de temas prontos
 */
export const THEME_PRESETS: Record<string, Partial<TenantBranding>> = {
  purple: {
    primaryColor: '#7c3aed',
    secondaryColor: '#ec4899',
    accentColor: '#8b5cf6'
  },
  blue: {
    primaryColor: '#2563eb',
    secondaryColor: '#06b6d4',
    accentColor: '#3b82f6'
  },
  green: {
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    accentColor: '#34d399'
  },
  rose: {
    primaryColor: '#e11d48',
    secondaryColor: '#f43f5e',
    accentColor: '#fb7185'
  },
  amber: {
    primaryColor: '#d97706',
    secondaryColor: '#f59e0b',
    accentColor: '#fbbf24'
  },
  slate: {
    primaryColor: '#475569',
    secondaryColor: '#64748b',
    accentColor: '#94a3b8'
  }
}

// Helpers
function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * amount))
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * amount))
  const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * amount))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)))
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)))
  const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return url.startsWith('/')
  }
}
