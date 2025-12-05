/**
 * Gerador de SaaS - Modo 3
 * Cria novos SaaS a partir do CORE BRANCO
 */

export interface SaaSConfig {
  // Identidade
  name: string
  slug: string
  description: string
  domain?: string
  
  // Visual
  theme: {
    primaryColor: string
    secondaryColor: string
    logo?: string
    favicon?: string
  }
  
  // Funcionalidades
  features: {
    chat: boolean
    diary: boolean
    clarityTest: boolean
    safetyPlan: boolean
    riskAlerts: boolean
    gamification: boolean
    academy: boolean
  }
  
  // Planos
  plans: {
    free: boolean
    paid: boolean
    professional: boolean
  }
  
  // Integrações
  integrations: {
    stripe: boolean
    openai: boolean
    resend: boolean
  }
  
  // Admin
  adminEmail: string
  
  // GitHub (se usar API)
  github?: {
    createRepo: boolean
    repoName?: string
    private?: boolean
  }
}

export interface GenerationResult {
  success: boolean
  projectPath?: string
  repoUrl?: string
  errors: string[]
  warnings: string[]
  filesCreated: number
}

/**
 * Templates de arquivos base
 */
const FILE_TEMPLATES = {
  envLocal: (config: SaaSConfig) => `
# ${config.name} - Configuração Local
# Gerado automaticamente pelo Gerador de SaaS

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
${config.integrations.stripe ? `STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=` : '# Stripe desabilitado'}

# OpenAI
${config.integrations.openai ? `OPENAI_API_KEY=` : '# OpenAI desabilitado'}

# Resend (Email)
${config.integrations.resend ? `RESEND_API_KEY=` : '# Resend desabilitado'}

# App
NEXT_PUBLIC_APP_NAME=${config.name}
NEXT_PUBLIC_APP_URL=https://${config.domain || `${config.slug}.vercel.app`}
`,

  tailwindConfig: (config: SaaSConfig) => `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '${lightenColor(config.theme.primaryColor, 0.9)}',
          100: '${lightenColor(config.theme.primaryColor, 0.8)}',
          200: '${lightenColor(config.theme.primaryColor, 0.6)}',
          300: '${lightenColor(config.theme.primaryColor, 0.4)}',
          400: '${lightenColor(config.theme.primaryColor, 0.2)}',
          500: '${config.theme.primaryColor}',
          600: '${darkenColor(config.theme.primaryColor, 0.1)}',
          700: '${darkenColor(config.theme.primaryColor, 0.2)}',
          800: '${darkenColor(config.theme.primaryColor, 0.3)}',
          900: '${darkenColor(config.theme.primaryColor, 0.4)}',
        },
        secondary: {
          500: '${config.theme.secondaryColor}',
        }
      },
    },
  },
  plugins: [],
}
`,

  packageJson: (config: SaaSConfig) => `{
  "name": "${config.slug}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "lucide-react": "^0.294.0",
    "tailwindcss": "^3.3.0"
    ${config.integrations.stripe ? ',"stripe": "^14.0.0","@stripe/stripe-js": "^2.2.0"' : ''}
    ${config.integrations.openai ? ',"openai": "^4.20.0"' : ''}
    ${config.integrations.resend ? ',"resend": "^2.0.0"' : ''}
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
`,

  readme: (config: SaaSConfig) => `# ${config.name}

${config.description}

## Gerado pelo Radar Narcisista - Gerador de SaaS

### Funcionalidades Ativas:
${config.features.chat ? '- ✅ Chat com IA' : '- ❌ Chat com IA'}
${config.features.diary ? '- ✅ Diário' : '- ❌ Diário'}
${config.features.clarityTest ? '- ✅ Teste de Clareza' : '- ❌ Teste de Clareza'}
${config.features.safetyPlan ? '- ✅ Plano de Segurança' : '- ❌ Plano de Segurança'}
${config.features.riskAlerts ? '- ✅ Alertas de Risco' : '- ❌ Alertas de Risco'}
${config.features.gamification ? '- ✅ Gamificação' : '- ❌ Gamificação'}
${config.features.academy ? '- ✅ Academy' : '- ❌ Academy'}

### Configuração

1. Clone o repositório
2. Copie \`.env.example\` para \`.env.local\`
3. Configure as variáveis de ambiente
4. Execute \`npm install\`
5. Execute \`npm run dev\`

### Deploy

Este projeto está pronto para deploy na Vercel.

---
Gerado em: ${new Date().toISOString()}
`
}

/**
 * Gera estrutura de pastas e arquivos
 */
export function generateProjectStructure(config: SaaSConfig): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = []

  // Arquivos base
  files.push({ path: '.env.example', content: FILE_TEMPLATES.envLocal(config) })
  files.push({ path: 'tailwind.config.js', content: FILE_TEMPLATES.tailwindConfig(config) })
  files.push({ path: 'package.json', content: FILE_TEMPLATES.packageJson(config) })
  files.push({ path: 'README.md', content: FILE_TEMPLATES.readme(config) })

  // Configuração do app
  files.push({
    path: 'lib/config.ts',
    content: `
export const APP_CONFIG = {
  name: '${config.name}',
  slug: '${config.slug}',
  description: '${config.description}',
  features: ${JSON.stringify(config.features, null, 2)},
  theme: ${JSON.stringify(config.theme, null, 2)}
}
`
  })

  // Páginas condicionais
  if (config.features.chat) {
    files.push({
      path: 'app/chat/page.tsx',
      content: generateChatPage(config)
    })
  }

  if (config.features.diary) {
    files.push({
      path: 'app/diario/page.tsx',
      content: generateDiaryPage(config)
    })
  }

  if (config.features.clarityTest) {
    files.push({
      path: 'app/teste-clareza/page.tsx',
      content: generateClarityTestPage(config)
    })
  }

  return files
}

/**
 * Valida configuração do SaaS
 */
export function validateConfig(config: SaaSConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.name || config.name.length < 3) {
    errors.push('Nome deve ter pelo menos 3 caracteres')
  }

  if (!config.slug || !/^[a-z0-9-]+$/.test(config.slug)) {
    errors.push('Slug deve conter apenas letras minúsculas, números e hífens')
  }

  if (!config.adminEmail || !config.adminEmail.includes('@')) {
    errors.push('Email do admin inválido')
  }

  if (!config.theme.primaryColor || !/^#[0-9A-Fa-f]{6}$/.test(config.theme.primaryColor)) {
    errors.push('Cor primária deve ser um hex válido (#RRGGBB)')
  }

  // Pelo menos uma feature deve estar ativa
  const hasFeature = Object.values(config.features).some(v => v)
  if (!hasFeature) {
    errors.push('Pelo menos uma funcionalidade deve estar ativa')
  }

  return { valid: errors.length === 0, errors }
}

// Helpers para cores
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

// Geradores de páginas
function generateChatPage(config: SaaSConfig): string {
  return `'use client'
// Chat Page - ${config.name}
// Gerado automaticamente

import { useState } from 'react'

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-primary-600">Chat</h1>
        {/* Implementar chat aqui */}
      </div>
    </div>
  )
}
`
}

function generateDiaryPage(config: SaaSConfig): string {
  return `'use client'
// Diary Page - ${config.name}
// Gerado automaticamente

import { useState } from 'react'

export default function DiaryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-primary-600">Diário</h1>
        {/* Implementar diário aqui */}
      </div>
    </div>
  )
}
`
}

function generateClarityTestPage(config: SaaSConfig): string {
  return `'use client'
// Clarity Test Page - ${config.name}
// Gerado automaticamente

import { useState } from 'react'

export default function ClarityTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-primary-600">Teste de Clareza</h1>
        {/* Implementar teste aqui */}
      </div>
    </div>
  )
}
`
}
