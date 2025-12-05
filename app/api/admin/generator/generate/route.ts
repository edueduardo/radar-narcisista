// API para gerar código do projeto
// /api/admin/generator/generate

import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Estrutura base do projeto Core Branco
const CORE_BRANCO_STRUCTURE = {
  files: [
    // Package.json
    {
      path: 'package.json',
      content: `{
  "name": "{{PROJECT_SLUG}}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "@supabase/supabase-js": "^2.39.0",
    "lucide-react": "^0.294.0",
    "next": "14.0.4",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}`
    },
    // .env.example
    {
      path: '.env.example',
      content: `# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_NAME={{PROJECT_NAME}}
NEXT_PUBLIC_APP_URL=http://localhost:3000
`
    },
    // README.md
    {
      path: 'README.md',
      content: `# {{PROJECT_NAME}}

Projeto gerado a partir do RADAR-CORE.

## Início Rápido

\`\`\`bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env.local

# Rodar em desenvolvimento
npm run dev
\`\`\`

## Estrutura

- \`/app\` - Páginas e rotas (Next.js App Router)
- \`/components\` - Componentes React
- \`/lib\` - Utilitários e configurações
- \`/types\` - Tipos TypeScript

## Documentação

Consulte os arquivos:
- \`TUDO-PARA-O-GPT.txt\` - Contexto completo do projeto
- \`ATLAS.txt\` - Mapa técnico do sistema
`
    },
    // app/layout.tsx
    {
      path: 'app/layout.tsx',
      content: `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '{{PROJECT_NAME}}',
  description: 'Gerado a partir do RADAR-CORE',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
`
    },
    // app/globals.css
    {
      path: 'app/globals.css',
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
`
    },
    // app/page.tsx
    {
      path: 'app/page.tsx',
      content: `import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">
            {{PROJECT_NAME}}
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Projeto gerado a partir do RADAR-CORE
          </p>
          
          <div className="flex justify-center gap-4">
            <Link 
              href="/login"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              Entrar
            </Link>
            <Link 
              href="/cadastro"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
            >
              Criar Conta
            </Link>
          </div>
        </div>
        
        <div className="mt-20 grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-2">🔐 Autenticação</h3>
            <p className="text-gray-400 text-sm">
              Sistema completo de login, cadastro e recuperação de senha com Supabase.
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-2">📊 Dashboard</h3>
            <p className="text-gray-400 text-sm">
              Painel administrativo com métricas e gestão de usuários.
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-2">💳 Planos</h3>
            <p className="text-gray-400 text-sm">
              Sistema de assinaturas com Stripe integrado.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
`
    },
    // tailwind.config.ts
    {
      path: 'tailwind.config.ts',
      content: `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
`
    },
    // tsconfig.json
    {
      path: 'tsconfig.json',
      content: `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`
    },
    // next.config.js
    {
      path: 'next.config.js',
      content: `/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig
`
    },
    // lib/supabase.ts
    {
      path: 'lib/supabase.ts',
      content: `import { createClient } from '@/lib/supabase/client'

export const createClient = () => createClient()
`
    },
    // TUDO-PARA-O-GPT.txt
    {
      path: 'TUDO-PARA-O-GPT.txt',
      content: `================================================================================
{{PROJECT_NAME}} - CONTEXTO COMPLETO
================================================================================
Gerado em: {{DATE}}
Origem: RADAR-CORE (Gerador de SaaS)
================================================================================

SOBRE O PROJETO:
{{PROJECT_DESCRIPTION}}

TIPO: {{PROJECT_TYPE}}

MÓDULOS INCLUÍDOS:
{{MODULES_LIST}}

================================================================================
PRÓXIMOS PASSOS:
================================================================================

1. Configure o Supabase:
   - Crie um projeto em https://supabase.com
   - Copie as credenciais para .env.local

2. Execute as migrações do banco:
   - Veja /database/migrations/

3. Personalize o tema:
   - Edite tailwind.config.ts
   - Modifique as cores em app/globals.css

4. Adicione suas features:
   - Use este arquivo como contexto para IAs
   - Consulte ATLAS.txt para o mapa técnico

================================================================================
`
    },
    // ATLAS.txt
    {
      path: 'ATLAS.txt',
      content: `================================================================================
{{PROJECT_NAME}} - ATLAS TÉCNICO
================================================================================

ESTRUTURA DE PASTAS:
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Página inicial
│   ├── login/             # Autenticação
│   ├── dashboard/         # Painel do usuário
│   └── admin/             # Painel admin
├── components/            # Componentes React
├── lib/                   # Utilitários
├── types/                 # Tipos TypeScript
└── database/              # Migrações SQL

TECNOLOGIAS:
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database)
- Lucide Icons

BANCO DE DADOS:
- user_profiles: Perfis de usuário
- subscriptions: Assinaturas
- (adicione suas tabelas aqui)

================================================================================
`
    }
  ]
}

// POST - Gerar código do projeto
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação e role admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      projectName, 
      projectSlug, 
      projectType = 'CORE_BRANCO',
      projectDescription = '',
      modules = []
    } = body

    if (!projectName || !projectSlug) {
      return NextResponse.json({ error: 'Nome e slug são obrigatórios' }, { status: 400 })
    }

    // Gerar arquivos com substituição de variáveis
    const generatedFiles = CORE_BRANCO_STRUCTURE.files.map(file => {
      let content = file.content
        .replace(/\{\{PROJECT_NAME\}\}/g, projectName)
        .replace(/\{\{PROJECT_SLUG\}\}/g, projectSlug)
        .replace(/\{\{PROJECT_TYPE\}\}/g, projectType)
        .replace(/\{\{PROJECT_DESCRIPTION\}\}/g, projectDescription || 'Projeto SaaS')
        .replace(/\{\{DATE\}\}/g, new Date().toLocaleDateString('pt-BR'))
        .replace(/\{\{MODULES_LIST\}\}/g, modules.length > 0 ? modules.map((m: string) => `- ${m}`).join('\n') : '- Todos os módulos base')

      return {
        path: file.path,
        content
      }
    })

    return NextResponse.json({
      success: true,
      projectName,
      projectSlug,
      files: generatedFiles,
      totalFiles: generatedFiles.length
    })

  } catch (error) {
    console.error('Erro ao gerar projeto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
