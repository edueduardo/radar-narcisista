/**
 * BACKUP ROTATIVO - 3 NÍVEIS
 * ATUAL → ANTERIOR → ANTERIOR_2
 */

const fs = require('fs-extra')
const path = require('path')

const BACKUP_DIR = 'c:\\Users\\teste\\Desktop\\BACKUPS_RADAR'
const SOURCE = 'c:\\Users\\teste\\Desktop\\SaaS sobre narcisismo\\radar-narcisista'

const PASTAS = ['app', 'components', 'lib', 'database', 'types', 'public', 'scripts', 'docs']
const ARQUIVOS = ['package.json', 'tailwind.config.ts', 'tsconfig.json', 'next.config.ts', '.env.local']

async function backup() {
  const anterior2 = path.join(BACKUP_DIR, 'ANTERIOR_2')
  const anterior = path.join(BACKUP_DIR, 'ANTERIOR')
  const atual = path.join(BACKUP_DIR, 'ATUAL')

  console.log('🔄 Backup rotativo iniciando...')

  // 1. Deletar ANTERIOR_2
  if (await fs.pathExists(anterior2)) await fs.remove(anterior2)
  
  // 2. ANTERIOR → ANTERIOR_2
  if (await fs.pathExists(anterior)) await fs.move(anterior, anterior2)
  
  // 3. ATUAL → ANTERIOR
  if (await fs.pathExists(atual)) await fs.move(atual, anterior)
  
  // 4. Copiar novo ATUAL
  const dest = path.join(atual, 'radar-narcisista')
  await fs.ensureDir(dest)

  for (const p of PASTAS) {
    const src = path.join(SOURCE, p)
    if (await fs.pathExists(src)) {
      await fs.copy(src, path.join(dest, p))
      console.log(`✅ ${p}`)
    }
  }

  for (const a of ARQUIVOS) {
    const src = path.join(SOURCE, a)
    if (await fs.pathExists(src)) {
      await fs.copy(src, path.join(dest, a))
      console.log(`✅ ${a}`)
    }
  }

  console.log('\n✅ BACKUP ROTATIVO CONCLUÍDO!')
  console.log(`📁 ATUAL: ${atual}`)
  console.log(`📁 ANTERIOR: ${anterior}`)
  console.log(`📁 ANTERIOR_2: ${anterior2}`)
}

backup().catch(console.error)
