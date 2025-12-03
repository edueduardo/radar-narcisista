/**
 * GERADOR DE SAAS SERVICE
 * 
 * Serviço para geração real de projetos SaaS
 * - Cópia de arquivos do RADAR-CORE
 * - Substituição de placeholders
 * - Geração de ZIP
 * - Integração com GitHub (futuro)
 */

import * as fs from 'fs'
import * as path from 'path'
import archiver from 'archiver'

// =============================================================================
// TIPOS
// =============================================================================

export interface ProjectConfig {
  name: string
  slug: string
  type: 'SAAS_TEMATICO' | 'CORE_BRANCO'
  description: string
  tema?: string
  publicoAlvo?: string
  perfisUsuario: string[]
  modulosAtivados: string[]
  corPrimaria?: string
  corSecundaria?: string
}

export interface GenerationResult {
  success: boolean
  projectPath?: string
  zipPath?: string
  error?: string
  filesCreated: number
  filesModified: number
}

// =============================================================================
// CONSTANTES
// =============================================================================

const VERSAO_BASE = 'BLOCO-45'
const ORIGEM_CORE = 'RADAR-CORE'

// Arquivos que devem ser copiados
const FILES_TO_COPY = [
  // Core
  'package.json',
  'tsconfig.json',
  'next.config.js',
  'tailwind.config.ts',
  'postcss.config.js',
  '.env.example',
  
  // Lib
  'lib/planos-core.ts',
  'lib/rate-limiter.ts',
  'lib/email-service.ts',
  'lib/analytics-service.ts',
  'lib/stripe-planos-core.ts',
  'lib/limit-notifications.ts',
  
  // Database
  'database/MEGA-SQL-PARTE1.sql',
  'database/MEGA-SQL-PARTE2.sql',
  'database/MEGA-SQL-PARTE3.sql',
  'database/MEGA-SQL-PARTE4.sql',
  'database/migrate-feature-usage.sql',
  'database/migrate-limit-notifications.sql',
  'database/migrate-analytics.sql',
]

// Diretórios que devem ser copiados inteiros
const DIRS_TO_COPY = [
  'app',
  'components',
  'public',
  'styles',
]

// Placeholders para substituição
const PLACEHOLDERS = {
  'RADAR_NARCISISTA': '{{PROJECT_NAME}}',
  'Radar Narcisista': '{{PROJECT_DISPLAY_NAME}}',
  'radar-narcisista': '{{PROJECT_SLUG}}',
  'narcisismo': '{{PROJECT_THEME}}',
  '#667eea': '{{PRIMARY_COLOR}}',
  '#764ba2': '{{SECONDARY_COLOR}}',
}

// =============================================================================
// CLASSE PRINCIPAL
// =============================================================================

export class GeradorSaasService {
  private radarCorePath: string
  private outputBasePath: string

  constructor(radarCorePath?: string, outputBasePath?: string) {
    this.radarCorePath = radarCorePath || process.cwd()
    this.outputBasePath = outputBasePath || path.join(process.cwd(), 'generated-projects')
  }

  /**
   * Gera um novo projeto
   */
  async generateProject(config: ProjectConfig): Promise<GenerationResult> {
    const result: GenerationResult = {
      success: false,
      filesCreated: 0,
      filesModified: 0
    }

    try {
      // Criar diretório de saída
      const projectPath = path.join(this.outputBasePath, config.slug)
      this.ensureDir(projectPath)
      result.projectPath = projectPath

      // Copiar arquivos
      for (const file of FILES_TO_COPY) {
        const copied = await this.copyFile(file, projectPath, config)
        if (copied) result.filesCreated++
      }

      // Copiar diretórios
      for (const dir of DIRS_TO_COPY) {
        const count = await this.copyDirectory(dir, projectPath, config)
        result.filesCreated += count
      }

      // Gerar documentação
      await this.generateDocs(projectPath, config)
      result.filesCreated += 6 // 6 arquivos de docs

      // Gerar ZIP
      const zipPath = await this.generateZip(projectPath, config.slug)
      result.zipPath = zipPath

      result.success = true
      return result

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Erro desconhecido'
      return result
    }
  }

  /**
   * Copia um arquivo com substituição de placeholders
   */
  private async copyFile(
    relativePath: string, 
    destDir: string, 
    config: ProjectConfig
  ): Promise<boolean> {
    const srcPath = path.join(this.radarCorePath, relativePath)
    const destPath = path.join(destDir, relativePath)

    if (!fs.existsSync(srcPath)) {
      console.warn(`Arquivo não encontrado: ${srcPath}`)
      return false
    }

    // Criar diretório de destino
    this.ensureDir(path.dirname(destPath))

    // Ler conteúdo
    let content = fs.readFileSync(srcPath, 'utf-8')

    // Substituir placeholders
    content = this.replacePlaceholders(content, config)

    // Escrever arquivo
    fs.writeFileSync(destPath, content)
    return true
  }

  /**
   * Copia um diretório inteiro
   */
  private async copyDirectory(
    relativePath: string, 
    destDir: string, 
    config: ProjectConfig
  ): Promise<number> {
    const srcPath = path.join(this.radarCorePath, relativePath)
    const destPath = path.join(destDir, relativePath)

    if (!fs.existsSync(srcPath)) {
      console.warn(`Diretório não encontrado: ${srcPath}`)
      return 0
    }

    return this.copyDirRecursive(srcPath, destPath, config)
  }

  /**
   * Copia diretório recursivamente
   */
  private copyDirRecursive(src: string, dest: string, config: ProjectConfig): number {
    this.ensureDir(dest)
    let count = 0

    const entries = fs.readdirSync(src, { withFileTypes: true })

    for (const entry of entries) {
      const srcEntry = path.join(src, entry.name)
      const destEntry = path.join(dest, entry.name)

      // Ignorar node_modules, .git, .next
      if (['node_modules', '.git', '.next', '.vercel'].includes(entry.name)) {
        continue
      }

      if (entry.isDirectory()) {
        count += this.copyDirRecursive(srcEntry, destEntry, config)
      } else {
        // Ler e substituir placeholders
        const ext = path.extname(entry.name).toLowerCase()
        const textExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt', '.css', '.html', '.sql']

        if (textExtensions.includes(ext)) {
          let content = fs.readFileSync(srcEntry, 'utf-8')
          content = this.replacePlaceholders(content, config)
          fs.writeFileSync(destEntry, content)
        } else {
          // Copiar binário
          fs.copyFileSync(srcEntry, destEntry)
        }
        count++
      }
    }

    return count
  }

  /**
   * Substitui placeholders no conteúdo
   */
  private replacePlaceholders(content: string, config: ProjectConfig): string {
    let result = content

    // Substituições básicas
    result = result.replace(/RADAR_NARCISISTA/g, config.name.toUpperCase().replace(/\s+/g, '_'))
    result = result.replace(/Radar Narcisista/g, config.name)
    result = result.replace(/radar-narcisista/g, config.slug)
    
    if (config.type === 'CORE_BRANCO') {
      // Remover referências ao tema narcisismo
      result = result.replace(/narcisismo/gi, 'tema')
      result = result.replace(/narcisista/gi, 'usuario')
    } else if (config.tema) {
      result = result.replace(/narcisismo/gi, config.tema)
    }

    // Cores
    if (config.corPrimaria) {
      result = result.replace(/#667eea/g, config.corPrimaria)
    }
    if (config.corSecundaria) {
      result = result.replace(/#764ba2/g, config.corSecundaria)
    }

    return result
  }

  /**
   * Gera documentação do projeto
   */
  private async generateDocs(projectPath: string, config: ProjectConfig): Promise<void> {
    const docsDir = projectPath

    // TUDO PARA O GPT
    const tudoContent = this.generateTudoParaGpt(config)
    fs.writeFileSync(path.join(docsDir, `TUDO PARA O GPT - ${config.name}.txt`), tudoContent)

    // ATLAS
    const atlasContent = this.generateAtlas(config)
    fs.writeFileSync(path.join(docsDir, `ATLAS-${config.slug.toUpperCase()}.txt`), atlasContent)

    // ROADMAP
    const roadmapContent = this.generateRoadmap(config)
    fs.writeFileSync(path.join(docsDir, `ROADMAP-${config.slug.toUpperCase()}.txt`), roadmapContent)

    // TESTES
    const testesContent = this.generateTestes(config)
    fs.writeFileSync(path.join(docsDir, `TESTES-${config.slug.toUpperCase()}.txt`), testesContent)

    // LÂMPADA
    const lampadaContent = this.generateLampada(config)
    fs.writeFileSync(path.join(docsDir, `LAMPADA-${config.slug.toUpperCase()}.txt`), lampadaContent)

    // ORIGEM-CORE
    const origemContent = this.generateOrigemCore(config)
    fs.writeFileSync(path.join(docsDir, 'ORIGEM-CORE.txt'), origemContent)
  }

  /**
   * Gera ZIP do projeto
   */
  private async generateZip(projectPath: string, slug: string): Promise<string> {
    const zipPath = path.join(this.outputBasePath, `${slug}.zip`)
    
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      output.on('close', () => resolve(zipPath))
      archive.on('error', reject)

      archive.pipe(output)
      archive.directory(projectPath, slug)
      archive.finalize()
    })
  }

  // ===========================================================================
  // GERADORES DE DOCUMENTAÇÃO
  // ===========================================================================

  private generateTudoParaGpt(config: ProjectConfig): string {
    return `================================================================================
📚 TUDO PARA O GPT - ${config.name}
================================================================================
Este é o arquivo-mãe do projeto ${config.name}.
Cole este arquivo no ChatGPT para dar contexto completo ao assistente.

================================================================================
IDENTIDADE DO PROJETO
================================================================================

Nome: ${config.name}
Slug: ${config.slug}
Tipo: ${config.type}
Descrição: ${config.description}
Tema: ${config.tema || 'Neutro (Core Branco)'}
Público-alvo: ${config.publicoAlvo || 'A definir'}
Perfis de usuário: ${config.perfisUsuario.join(', ') || 'A definir'}

================================================================================
ORIGEM
================================================================================

Baseado em: ${ORIGEM_CORE}
Versão base: ${VERSAO_BASE}
Data de criação: ${new Date().toISOString().split('T')[0]}
Gerador: GERADOR-DE-SAAS@v1

================================================================================
MÓDULOS CORE ATIVADOS
================================================================================

${config.modulosAtivados.map(m => `[X] ${m}`).join('\n')}

================================================================================
STACK TÉCNICA
================================================================================

- Next.js 16 + TypeScript
- TailwindCSS
- Supabase (Postgres + Auth + RLS)
- Stripe (Billing)
- Vercel (Deploy)

================================================================================
REGRAS PARA WINDSURF E CHATGPT
================================================================================

1. Este projeto é INDEPENDENTE do RADAR-CORE
2. Seguir a mesma disciplina de blocos e documentação
3. Registrar tudo em TUDO / ATLAS / ROADMAP / TESTES / LÂMPADA
4. Nunca mentir que implementou o que não implementou
5. Se precisar importar algo do RADAR-CORE, registrar na LÂMPADA

================================================================================
FIM DO ARQUIVO TUDO PARA O GPT
================================================================================
`
  }

  private generateAtlas(config: ProjectConfig): string {
    return `================================================================================
🗺️ ATLAS - ${config.name}
================================================================================
Mapa técnico completo do projeto.
Gerado em: ${new Date().toISOString().split('T')[0]}
Origem: ${ORIGEM_CORE}@${VERSAO_BASE}

================================================================================
ESTRUTURA DE PASTAS
================================================================================

${config.slug}/
├── app/                    # Páginas Next.js
├── components/            # Componentes React
├── lib/                   # Bibliotecas e utils
├── database/              # Migrations SQL
├── public/                # Assets públicos
└── docs/                  # Documentação

================================================================================
ROTAS PRINCIPAIS
================================================================================

PÚBLICAS:
- / - Landing page
- /login - Login
- /signup - Cadastro
- /planos - Planos e preços

AUTENTICADAS:
- /dashboard - Dashboard principal
- /perfil - Perfil do usuário

ADMIN:
- /admin - Painel admin
- /admin/usuarios - Gerenciar usuários
- /admin/planos - Gerenciar planos

================================================================================
FIM DO ATLAS
================================================================================
`
  }

  private generateRoadmap(config: ProjectConfig): string {
    return `================================================================================
🛣️ ROADMAP - ${config.name}
================================================================================
Planejamento de implementação por blocos.
Gerado em: ${new Date().toISOString().split('T')[0]}

================================================================================
BLOCO 1-5: PERSONALIZAÇÃO
================================================================================

⏳ ETAPA 1: Personalizar textos e cores
⏳ ETAPA 2: Configurar Supabase
⏳ ETAPA 3: Configurar Stripe
⏳ ETAPA 4: Configurar Vercel
⏳ ETAPA 5: Deploy inicial

================================================================================
BLOCO 6-10: FUNCIONALIDADES ESPECÍFICAS
================================================================================

⏳ ETAPA 6: [Definir funcionalidade 1]
⏳ ETAPA 7: [Definir funcionalidade 2]
⏳ ETAPA 8: [Definir funcionalidade 3]
⏳ ETAPA 9: [Definir funcionalidade 4]
⏳ ETAPA 10: [Definir funcionalidade 5]

================================================================================
FIM DO ROADMAP
================================================================================
`
  }

  private generateTestes(config: ProjectConfig): string {
    return `================================================================================
🧪 TESTES - ${config.name}
================================================================================
Guia de testes do projeto.
Gerado em: ${new Date().toISOString().split('T')[0]}

================================================================================
TESTES MANUAIS
================================================================================

1. AUTENTICAÇÃO
   [ ] Cadastro com email válido
   [ ] Login com credenciais corretas
   [ ] Logout

2. PLANOS
   [ ] Visualizar planos
   [ ] Checkout (modo teste)

3. DASHBOARD
   [ ] Acessar dashboard autenticado

================================================================================
FIM DOS TESTES
================================================================================
`
  }

  private generateLampada(config: ProjectConfig): string {
    return `================================================================================
💡 LÂMPADA - ${config.name}
================================================================================
Ideias, dívidas técnicas e insights futuros.
Gerado em: ${new Date().toISOString().split('T')[0]}

================================================================================
💡 IDEIAS FUTURAS
================================================================================

1. [Adicionar ideias aqui]

================================================================================
🔧 DÍVIDAS TÉCNICAS
================================================================================

1. [Adicionar dívidas aqui]

================================================================================
🔗 IMPORTAR DO RADAR-CORE
================================================================================

Se precisar importar algo novo do RADAR-CORE, registre aqui.

================================================================================
FIM DA LÂMPADA
================================================================================
`
  }

  private generateOrigemCore(config: ProjectConfig): string {
    return `================================================================================
📍 ORIGEM-CORE - ${config.name}
================================================================================

projeto: ${config.name}
slug: ${config.slug}
tipo: ${config.type}
origem: ${ORIGEM_CORE}
versao_base: ${VERSAO_BASE}
data_criacao: ${new Date().toISOString().split('T')[0]}
gerador: GERADOR-DE-SAAS@v1

================================================================================
MÓDULOS HERDADOS
================================================================================

${config.modulosAtivados.map(m => `[X] ${m}`).join('\n')}

================================================================================
INDEPENDÊNCIA
================================================================================

Este projeto é INDEPENDENTE do RADAR-CORE.
Não recebe atualizações automáticas.

================================================================================
FIM DO ARQUIVO ORIGEM-CORE
================================================================================
`
  }

  // ===========================================================================
  // UTILIDADES
  // ===========================================================================

  private ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }
}

// =============================================================================
// INSTÂNCIA SINGLETON
// =============================================================================

let geradorInstance: GeradorSaasService | null = null

export function getGeradorSaas(): GeradorSaasService {
  if (!geradorInstance) {
    geradorInstance = new GeradorSaasService()
  }
  return geradorInstance
}
