#!/usr/bin/env node

/**
 * Script para extrair o template admin do Radar Narcisista
 * Uso: node scripts/extract-admin-template.js /caminho/do/novo/projeto
 */

const fs = require('fs')
const path = require('path')

// Arquivos que compõem o template admin
const adminFiles = [
  // App Router - Admin Pages
  'app/admin/page.tsx',
  'app/admin/AdminClient.tsx',
  'app/admin/menu-config/page.tsx',
  'app/login/page.tsx',
  
  // Libraries
  'lib/admin-menu-config.ts',
  'lib/admin-storage.ts',
  'lib/ia-registry.ts',
  
  // Components
  'components/AdminSidebar.tsx',
  
  // API Routes (estrutura)
  'app/api/admin/README.md',
  
  // Database (schema base)
  'database/admin-template.sql',
  
  // Styles (se houver)
  'styles/admin.css',
]

// Configurações para substituição
const replacements = [
  { from: /Radar Narcisista/g, to: '{{NOME_SaaS}}' },
  { from: /narcisista/g, to: '{{slug_saas}}' },
  { from: /purple-400/g, to: '{{cor_principal}}-400' },
  { from: /purple-600/g, to: '{{cor_principal}}-600' },
  { from: /purple-500/g, to: '{{cor_principal}}-500' },
]

function extractTemplate(targetDir) {
  console.log('🚀 Extraindo Admin Template...')
  console.log(`📁 Destino: ${targetDir}`)
  
  // Criar diretório de template
  const templateDir = path.join(targetDir, 'admin-template')
  
  if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true })
  }
  
  // Copiar arquivos
  let copiedCount = 0
  
  adminFiles.forEach(file => {
    const sourcePath = path.join(__dirname, '..', file)
    const targetPath = path.join(templateDir, file)
    
    if (fs.existsSync(sourcePath)) {
      // Criar diretório se não existir
      const targetDirPath = path.dirname(targetPath)
      if (!fs.existsSync(targetDirPath)) {
        fs.mkdirSync(targetDirPath, { recursive: true })
      }
      
      // Ler e substituir placeholders
      let content = fs.readFileSync(sourcePath, 'utf8')
      
      replacements.forEach(replacement => {
        content = content.replace(replacement.from, replacement.to)
      })
      
      fs.writeFileSync(targetPath, content)
      console.log(`✅ Copiado: ${file}`)
      copiedCount++
    } else {
      console.log(`⚠️  Não encontrado: ${file}`)
    }
  })
  
  // Criar arquivo de configuração
  const configContent = `
// Configuração do Template Admin
module.exports = {
  nome: '{{NOME_SaaS}}',
  slug: '{{slug_saas}}',
  corPrincipal: '{{cor_principal}}',
  database: {
    provider: 'supabase',
    tables: ['users', 'admin_logs']
  },
  features: {
    auth: true,
    menuDinamico: true,
    darkTheme: true,
    responsive: true
  }
}
`
  
  fs.writeFileSync(path.join(templateDir, 'template.config.js'), configContent)
  
  // Criar package.json específico
  const packageContent = {
    name: "{{slug_saas}}-admin",
    version: "1.0.0",
    description: "Painel administrativo para {{NOME_SaaS}}",
    dependencies: {
      "@supabase/auth-helpers-nextjs": "^0.8.0",
      "lucide-react": "^0.294.0",
      "next": "^16.0.0",
      "react": "^18.0.0",
      "react-dom": "^18.0.0",
      "typescript": "^5.0.0",
      "tailwindcss": "^3.3.0"
    },
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start"
    }
  }
  
  fs.writeFileSync(
    path.join(templateDir, 'package.json'), 
    JSON.stringify(packageContent, null, 2)
  )
  
  console.log(`\n🎉 Template extraído com sucesso!`)
  console.log(`📊 Arquivos copiados: ${copiedCount}/${adminFiles.length}`)
  console.log(`📂 Local: ${templateDir}`)
  console.log(`\n📝 Próximos passos:`)
  console.log(`1. cd ${templateDir}`)
  console.log(`2. npm install`)
  console.log(`3. Substituir {{placeholders}} nos arquivos`)
  console.log(`4. Configurar Supabase`)
  console.log(`5. npm run dev`)
}

// Verificar argumento
const targetDir = process.argv[2]

if (!targetDir) {
  console.log('❌ Erro: Especifique o diretório de destino')
  console.log('Uso: node scripts/extract-admin-template.js /caminho/do/novo/projeto')
  process.exit(1)
}

// Verificar se diretório existe
if (!fs.existsSync(targetDir)) {
  console.log('❌ Erro: Diretório de destino não existe')
  process.exit(1)
}

// Executar extração
extractTemplate(targetDir)
