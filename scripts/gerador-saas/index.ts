#!/usr/bin/env node
/**
 * GERADOR DE SAAS - CLI
 * 
 * Ferramenta para gerar novos projetos SaaS a partir do RADAR-CORE.
 * 
 * MODOS:
 * - MODO 1: Criar SAAS TEMÁTICO a partir da MÃE (RADAR-CORE)
 * - MODO 2: Criar CORE BRANCO (template neutro, sem tema)
 * - MODO 3: Criar SAAS a partir de um CORE BRANCO existente
 * 
 * Uso:
 *   npx ts-node scripts/gerador-saas/index.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

// =============================================================================
// TIPOS
// =============================================================================

interface ProjetoConfig {
  nome: string
  slug: string
  tipo: 'SAAS-TEMATICO' | 'CORE-BRANCO'
  tema?: string
  publicoAlvo?: string
  perfisUsuario: string[]
  modulosAtivados: string[]
  origemCore: string
  versaoBase: string
  dataGeracao: string
}

interface ModuloCore {
  key: string
  nome: string
  descricao: string
  arquivos: string[]
}

// =============================================================================
// CONSTANTES
// =============================================================================

const MODULOS_CORE: ModuloCore[] = [
  {
    key: 'PLANOS_CORE',
    nome: 'Planos Core',
    descricao: 'Features, profiles, catalog, overrides',
    arquivos: ['lib/planos-core.ts', 'database/MEGA-SQL-PARTE1.sql']
  },
  {
    key: 'ORACULO_V2_CORE',
    nome: 'Oráculo V2 Core',
    descricao: 'IA multiperfil',
    arquivos: ['lib/oraculo/']
  },
  {
    key: 'RATE_LIMITER',
    nome: 'Rate Limiter',
    descricao: 'Rate limiting por feature',
    arquivos: ['lib/rate-limiter.ts', 'database/migrate-feature-usage.sql']
  },
  {
    key: 'STRIPE_CORE',
    nome: 'Stripe Core',
    descricao: 'Checkout e webhooks',
    arquivos: ['lib/stripe-planos-core.ts', 'app/api/webhooks/stripe-planos/']
  },
  {
    key: 'LIMIT_NOTIFICATIONS',
    nome: 'Notificações de Limite',
    descricao: 'Notificações 80% e 100%',
    arquivos: ['lib/limit-notifications.ts', 'components/LimitNotificationBanner.tsx']
  },
  {
    key: 'HELPDESK_CORE',
    nome: 'Helpdesk Core',
    descricao: 'Tickets e impersonation',
    arquivos: ['lib/helpdesk-core.ts']
  },
  {
    key: 'TELEMETRY_CORE',
    nome: 'Telemetria Core',
    descricao: 'Heartbeats, erros, métricas',
    arquivos: ['lib/telemetry-core.ts']
  },
  {
    key: 'CONTROL_TOWER',
    nome: 'Control Tower',
    descricao: 'Gerenciamento de projetos',
    arquivos: ['lib/control-tower.ts']
  },
  {
    key: 'ADDONS_CORE',
    nome: 'Add-ons Core',
    descricao: 'Add-ons e créditos',
    arquivos: ['database/migrate-user-addons.sql']
  }
]

const VERSAO_BASE = 'BLOCO-40'
const ORIGEM_CORE = 'RADAR-CORE'

// =============================================================================
// UTILIDADES
// =============================================================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function pergunta(texto: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(texto, (resposta) => {
      resolve(resposta.trim())
    })
  })
}

function perguntaSimNao(texto: string): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(`${texto} (s/n): `, (resposta) => {
      resolve(resposta.toLowerCase() === 's' || resposta.toLowerCase() === 'sim')
    })
  })
}

function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function criarDiretorio(caminho: string): void {
  if (!fs.existsSync(caminho)) {
    fs.mkdirSync(caminho, { recursive: true })
    console.log(`📁 Criado: ${caminho}`)
  }
}

function copiarArquivo(origem: string, destino: string): void {
  if (fs.existsSync(origem)) {
    const conteudo = fs.readFileSync(origem, 'utf-8')
    fs.writeFileSync(destino, conteudo)
    console.log(`📄 Copiado: ${destino}`)
  }
}

function substituirPlaceholders(conteudo: string, config: ProjetoConfig): string {
  return conteudo
    .replace(/\[NOME-DO-SAAS\]/g, config.nome)
    .replace(/NOME-DO-SAAS/g, config.slug.toUpperCase())
    .replace(/nome-do-saas/g, config.slug)
    .replace(/\[DESCREVER O TEMA\/VERTENTE\]/g, config.tema || 'A definir')
    .replace(/\[DESCREVER O PÚBLICO\]/g, config.publicoAlvo || 'A definir')
    .replace(/\[LISTAR PERFIS\]/g, config.perfisUsuario.join(', ') || 'A definir')
    .replace(/\[DATA\]/g, config.dataGeracao)
    .replace(/\[CORE-BRANCO ou SAAS-TEMATICO\]/g, config.tipo)
}

// =============================================================================
// GERAÇÃO DE DOCUMENTAÇÃO
// =============================================================================

function gerarKitDocs(destino: string, config: ProjetoConfig): void {
  const templateDir = path.join(__dirname, '../../templates/KIT-DOCS-TEMPLATE')
  const docsDir = destino
  
  criarDiretorio(docsDir)
  
  const arquivos = [
    { template: 'TUDO PARA O GPT - NOME-DO-SAAS.txt', destino: `TUDO PARA O GPT - ${config.nome}.txt` },
    { template: 'ATLAS-NOME-DO-SAAS.txt', destino: `ATLAS-${config.slug.toUpperCase()}.txt` },
    { template: 'ROADMAP-NOME-DO-SAAS.txt', destino: `ROADMAP-${config.slug.toUpperCase()}.txt` },
    { template: 'TESTES-NOME-DO-SAAS.txt', destino: `TESTES-${config.slug.toUpperCase()}.txt` },
    { template: 'LAMPADA-NOME-DO-SAAS.txt', destino: `LAMPADA-${config.slug.toUpperCase()}.txt` },
    { template: 'ORIGEM-CORE.txt', destino: 'ORIGEM-CORE.txt' }
  ]
  
  for (const arquivo of arquivos) {
    const templatePath = path.join(templateDir, arquivo.template)
    const destinoPath = path.join(docsDir, arquivo.destino)
    
    if (fs.existsSync(templatePath)) {
      let conteudo = fs.readFileSync(templatePath, 'utf-8')
      conteudo = substituirPlaceholders(conteudo, config)
      
      // Marcar módulos ativados
      for (const modulo of MODULOS_CORE) {
        const marcador = config.modulosAtivados.includes(modulo.key) ? '[X]' : '[ ]'
        conteudo = conteudo.replace(
          new RegExp(`\\[ \\] ${modulo.key}`, 'g'),
          `${marcador} ${modulo.key}`
        )
      }
      
      fs.writeFileSync(destinoPath, conteudo)
      console.log(`📄 Gerado: ${arquivo.destino}`)
    }
  }
}

// =============================================================================
// MODOS DO GERADOR
// =============================================================================

async function modo1_SaasTematicoRadar(): Promise<void> {
  console.log('\n🚀 MODO 1: Criar SAAS TEMÁTICO a partir do RADAR-CORE\n')
  
  const nome = await pergunta('Nome do projeto (ex: CoParent, Clínicas X): ')
  const tema = await pergunta('Tema/vertente do projeto: ')
  const publicoAlvo = await pergunta('Público-alvo: ')
  const perfisStr = await pergunta('Perfis de usuário (separados por vírgula): ')
  const destino = await pergunta('Pasta de destino (caminho completo): ')
  
  console.log('\n📦 Módulos CORE disponíveis:')
  MODULOS_CORE.forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.nome} - ${m.descricao}`)
  })
  
  const modulosStr = await pergunta('\nQuais módulos ativar? (números separados por vírgula, ex: 1,2,3): ')
  const modulosIndices = modulosStr.split(',').map(s => parseInt(s.trim()) - 1)
  const modulosAtivados = modulosIndices
    .filter(i => i >= 0 && i < MODULOS_CORE.length)
    .map(i => MODULOS_CORE[i].key)
  
  const config: ProjetoConfig = {
    nome,
    slug: slugify(nome),
    tipo: 'SAAS-TEMATICO',
    tema,
    publicoAlvo,
    perfisUsuario: perfisStr.split(',').map(s => s.trim()),
    modulosAtivados,
    origemCore: ORIGEM_CORE,
    versaoBase: VERSAO_BASE,
    dataGeracao: new Date().toISOString().split('T')[0]
  }
  
  console.log('\n📋 Configuração:')
  console.log(JSON.stringify(config, null, 2))
  
  const confirmar = await perguntaSimNao('\nConfirmar geração?')
  
  if (confirmar) {
    criarDiretorio(destino)
    gerarKitDocs(destino, config)
    
    // Salvar config
    fs.writeFileSync(
      path.join(destino, 'projeto-config.json'),
      JSON.stringify(config, null, 2)
    )
    
    console.log('\n✅ Projeto gerado com sucesso!')
    console.log(`📁 Localização: ${destino}`)
    console.log('\n💡 Próximos passos:')
    console.log('  1. Copiar código base do RADAR-CORE')
    console.log('  2. Configurar Supabase e Vercel')
    console.log('  3. Personalizar tema e copy')
    console.log('  4. Seguir o ROADMAP gerado')
  } else {
    console.log('❌ Geração cancelada.')
  }
}

async function modo2_CoreBranco(): Promise<void> {
  console.log('\n⚪ MODO 2: Criar CORE BRANCO (template neutro)\n')
  
  const id = `CB-${Date.now().toString(36).toUpperCase()}`
  const nome = `CORE-BRANCO-${id}`
  const destino = await pergunta('Pasta de destino (caminho completo): ')
  
  console.log('\n📦 Módulos CORE disponíveis:')
  MODULOS_CORE.forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.nome} - ${m.descricao}`)
  })
  
  const modulosStr = await pergunta('\nQuais módulos incluir? (números separados por vírgula, ex: 1,2,3,4,5): ')
  const modulosIndices = modulosStr.split(',').map(s => parseInt(s.trim()) - 1)
  const modulosAtivados = modulosIndices
    .filter(i => i >= 0 && i < MODULOS_CORE.length)
    .map(i => MODULOS_CORE[i].key)
  
  const config: ProjetoConfig = {
    nome,
    slug: slugify(nome),
    tipo: 'CORE-BRANCO',
    perfisUsuario: ['usuario', 'admin'],
    modulosAtivados,
    origemCore: ORIGEM_CORE,
    versaoBase: VERSAO_BASE,
    dataGeracao: new Date().toISOString().split('T')[0]
  }
  
  console.log('\n📋 Configuração:')
  console.log(JSON.stringify(config, null, 2))
  
  const confirmar = await perguntaSimNao('\nConfirmar geração?')
  
  if (confirmar) {
    criarDiretorio(destino)
    gerarKitDocs(destino, config)
    
    // Salvar config
    fs.writeFileSync(
      path.join(destino, 'projeto-config.json'),
      JSON.stringify(config, null, 2)
    )
    
    console.log('\n✅ CORE BRANCO gerado com sucesso!')
    console.log(`📁 Localização: ${destino}`)
    console.log(`🆔 ID: ${id}`)
    console.log('\n💡 Próximos passos:')
    console.log('  1. Copiar código base do RADAR-CORE')
    console.log('  2. Remover textos e copy específicos do Radar')
    console.log('  3. Configurar como template neutro')
    console.log('  4. Usar como base para novos SaaS (MODO 3)')
  } else {
    console.log('❌ Geração cancelada.')
  }
}

async function modo3_SaasDeCoreBranco(): Promise<void> {
  console.log('\n🎨 MODO 3: Criar SAAS a partir de um CORE BRANCO\n')
  
  const coreBrancoPath = await pergunta('Caminho do CORE BRANCO existente: ')
  
  // Verificar se existe
  const configPath = path.join(coreBrancoPath, 'projeto-config.json')
  if (!fs.existsSync(configPath)) {
    console.log('❌ CORE BRANCO não encontrado ou inválido.')
    console.log('   Certifique-se de que a pasta contém projeto-config.json')
    return
  }
  
  const coreBrancoConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  console.log(`\n✅ CORE BRANCO encontrado: ${coreBrancoConfig.nome}`)
  
  const nome = await pergunta('Nome do novo projeto: ')
  const tema = await pergunta('Tema/vertente do projeto: ')
  const publicoAlvo = await pergunta('Público-alvo: ')
  const perfisStr = await pergunta('Perfis de usuário (separados por vírgula): ')
  const destino = await pergunta('Pasta de destino (caminho completo): ')
  
  const config: ProjetoConfig = {
    nome,
    slug: slugify(nome),
    tipo: 'SAAS-TEMATICO',
    tema,
    publicoAlvo,
    perfisUsuario: perfisStr.split(',').map(s => s.trim()),
    modulosAtivados: coreBrancoConfig.modulosAtivados,
    origemCore: coreBrancoConfig.nome,
    versaoBase: coreBrancoConfig.versaoBase,
    dataGeracao: new Date().toISOString().split('T')[0]
  }
  
  console.log('\n📋 Configuração:')
  console.log(JSON.stringify(config, null, 2))
  
  const confirmar = await perguntaSimNao('\nConfirmar geração?')
  
  if (confirmar) {
    criarDiretorio(destino)
    gerarKitDocs(destino, config)
    
    // Salvar config
    fs.writeFileSync(
      path.join(destino, 'projeto-config.json'),
      JSON.stringify(config, null, 2)
    )
    
    console.log('\n✅ Projeto gerado com sucesso!')
    console.log(`📁 Localização: ${destino}`)
    console.log(`📦 Baseado em: ${coreBrancoConfig.nome}`)
    console.log('\n💡 Próximos passos:')
    console.log('  1. Copiar código do CORE BRANCO')
    console.log('  2. Personalizar tema e copy')
    console.log('  3. Configurar Supabase e Vercel')
    console.log('  4. Seguir o ROADMAP gerado')
  } else {
    console.log('❌ Geração cancelada.')
  }
}

// =============================================================================
// MENU PRINCIPAL
// =============================================================================

async function menuPrincipal(): Promise<void> {
  console.log('\n' + '='.repeat(60))
  console.log('🏭 GERADOR DE SAAS - RADAR-CORE')
  console.log('='.repeat(60))
  console.log(`\nVersão base: ${VERSAO_BASE}`)
  console.log(`Origem: ${ORIGEM_CORE}`)
  console.log('\nModos disponíveis:')
  console.log('  1. SAAS TEMÁTICO a partir do RADAR-CORE')
  console.log('  2. CORE BRANCO (template neutro)')
  console.log('  3. SAAS a partir de um CORE BRANCO existente')
  console.log('  0. Sair')
  
  const opcao = await pergunta('\nEscolha uma opção: ')
  
  switch (opcao) {
    case '1':
      await modo1_SaasTematicoRadar()
      break
    case '2':
      await modo2_CoreBranco()
      break
    case '3':
      await modo3_SaasDeCoreBranco()
      break
    case '0':
      console.log('\n👋 Até logo!')
      rl.close()
      process.exit(0)
    default:
      console.log('\n❌ Opção inválida.')
  }
  
  // Voltar ao menu
  await menuPrincipal()
}

// =============================================================================
// EXECUÇÃO
// =============================================================================

console.log('\n🚀 Iniciando GERADOR DE SAAS...\n')
menuPrincipal().catch(console.error)
