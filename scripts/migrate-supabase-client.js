/**
 * Script de Migração: @supabase/auth-helpers-nextjs -> @supabase/ssr
 * 
 * Este script substitui:
 * - import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
 * - Por: import { createClient } from '@/lib/supabase/client'
 * 
 * E também:
 * - createClientComponentClient() -> createClient()
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Diretórios a processar
const dirs = ['app', 'lib', 'components']
const excludeDirs = ['_archive', 'node_modules', '.next']

// Padrões de substituição
const replacements = [
  {
    // Import statement
    from: /import\s*{\s*createClientComponentClient\s*}\s*from\s*['"]@supabase\/auth-helpers-nextjs['"]/g,
    to: "import { createClient } from '@/lib/supabase/client'"
  },
  {
    // Function call
    from: /createClientComponentClient\(\)/g,
    to: 'createClient()'
  }
]

let totalFiles = 0
let modifiedFiles = 0

function processFile(filePath) {
  // Ignorar arquivos em diretórios excluídos
  if (excludeDirs.some(dir => filePath.includes(dir))) {
    return
  }

  const content = fs.readFileSync(filePath, 'utf8')
  
  // Verificar se o arquivo contém o padrão antigo
  if (!content.includes('@supabase/auth-helpers-nextjs')) {
    return
  }

  totalFiles++
  let newContent = content

  // Aplicar substituições
  for (const { from, to } of replacements) {
    newContent = newContent.replace(from, to)
  }

  // Se houve mudança, salvar
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8')
    modifiedFiles++
    console.log(`✅ ${path.relative(process.cwd(), filePath)}`)
  } else {
    console.log(`⚠️  ${path.relative(process.cwd(), filePath)} - Padrão não reconhecido`)
  }
}

// Processar arquivos
console.log('🔄 Iniciando migração de @supabase/auth-helpers-nextjs para @supabase/ssr...\n')

for (const dir of dirs) {
  const pattern = path.join(dir, '**/*.{ts,tsx}')
  const files = glob.sync(pattern, { nodir: true })
  
  for (const file of files) {
    processFile(file)
  }
}

console.log(`\n📊 Resultado:`)
console.log(`   Arquivos com padrão antigo: ${totalFiles}`)
console.log(`   Arquivos modificados: ${modifiedFiles}`)
console.log(`   Arquivos com padrão não reconhecido: ${totalFiles - modifiedFiles}`)
