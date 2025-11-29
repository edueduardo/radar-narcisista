// SISTEMA DE BACKUP E RECUPERAÇÃO AUTOMÁTICA DO .env.local
// Protege contra corrupção do arquivo de ambiente

import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface EnvConfig {
  OPENAI_API_KEY: string
  ANTHROPIC_API_KEY: string
  TOGETHER_API_KEY: string
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  NEXT_PUBLIC_APP_URL: string
}

// 🗂️ ARQUIVOS DE BACKUP
const BACKUP_FILES = {
  primary: '.env.backup',
  secondary: '.env.backup2', 
  emergency: '.env.emergency'
}

// 📋 CONFIGURAÇÃO PADRÃO (se todos falharem)
const EMERGENCY_CONFIG: EnvConfig = {
  OPENAI_API_KEY: 'OPENAI_EMERGENCY_KEY_AQUI',
  ANTHROPIC_API_KEY: 'ANTHROPIC_EMERGENCY_KEY_AQUI',
  TOGETHER_API_KEY: 'TOGETHER_EMERGENCY_KEY_AQUI',
  NEXT_PUBLIC_SUPABASE_URL: 'https://seu-projeto.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'SUPABASE_ANON_KEY_AQUI',
  SUPABASE_SERVICE_ROLE_KEY: 'SUPABASE_SERVICE_ROLE_KEY_AQUI',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000'
}

// 🔍 VERIFICAR SE .env.local ESTÁ CORROMPIDO
export function verificarCorrupcaoEnv(): boolean {
  try {
    if (!existsSync('.env.local')) {
      console.log('🚨 .env.local não existe')
      return true
    }

    const content = readFileSync('.env.local', 'utf-8')
    
    // 🔍 VERIFICAR PROBLEMAS COMUNS
    const problemas = []
    
    // Tudo em uma linha?
    if (!content.includes('\n')) {
      problemas.push('Arquivo em uma única linha')
    }
    
    // Sem quebras de linha adequadas?
    const lines = content.split('\n').filter(line => line.trim())
    if (lines.length < 5) {
      problemas.push('Poucas linhas detectadas')
    }
    
    // Chaves importantes faltando?
    const chavesNecessarias = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'TOGETHER_API_KEY']
    chavesNecessarias.forEach(chave => {
      if (!content.includes(chave + '=')) {
        problemas.push(`Faltando ${chave}`)
      }
    })
    
    // Formatação corrompida?
    if (content.includes('sk-') && !content.includes('sk-\n')) {
      problemas.push('Chaves API sem quebra de linha')
    }
    
    if (problemas.length > 0) {
      console.log('🚨 .env.local CORROMPIDO:', problemas)
      return true
    }
    
    console.log('✅ .env.local parece OK')
    return false
  } catch (error) {
    console.log('🚨 Erro ao ler .env.local:', error)
    return true
  }
}

// 💾 CRIAR BACKUP AUTOMÁTICO
export function criarBackupEnv(): void {
  try {
    if (!existsSync('.env.local')) {
      console.log('🚨 .env.local não existe para backup')
      return
    }
    
    const content = readFileSync('.env.local', 'utf-8')
    
    // Backup primário
    writeFileSync(BACKUP_FILES.primary, content)
    console.log('✅ Backup primário criado')
    
    // Backup secundário (semanal)
    const data = new Date().toISOString().split('T')[0]
    const backupSemana = `.env.backup.${data}`
    writeFileSync(backupSemana, content)
    console.log(`✅ Backup semanal criado: ${backupSemana}`)
    
    // Backup de emergência (só se não existir)
    if (!existsSync(BACKUP_FILES.emergency)) {
      writeFileSync(BACKUP_FILES.emergency, gerarEnvContent(EMERGENCY_CONFIG))
      console.log('✅ Backup de emergência criado')
    }
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error)
  }
}

// 🔄 RESTAURAR DO BACKUP
export function restaurarEnvBackup(): boolean {
  try {
    // Tentar backup primário primeiro
    if (existsSync(BACKUP_FILES.primary)) {
      const content = readFileSync(BACKUP_FILES.primary, 'utf-8')
      writeFileSync('.env.local', content)
      console.log('✅ .env.local restaurado do backup primário')
      return true
    }
    
    // Tentar backup secundário
    if (existsSync(BACKUP_FILES.secondary)) {
      const content = readFileSync(BACKUP_FILES.secondary, 'utf-8')
      writeFileSync('.env.local', content)
      console.log('✅ .env.local restaurado do backup secundário')
      return true
    }
    
    // Usar emergência como último recurso
    writeFileSync('.env.local', gerarEnvContent(EMERGENCY_CONFIG))
    console.log('✅ .env.local restaurado do emergência')
    return true
  } catch (error) {
    console.error('❌ Erro ao restaurar backup:', error)
    return false
  }
}

// 🔧 REPARAR AUTOMATICAMENTE
export function repararEnvAutomatico(): boolean {
  console.log('🔧 Iniciando reparo automático do .env.local...')
  
  try {
    // Se está corrompido, tentar restaurar
    if (verificarCorrupcaoEnv()) {
      console.log('🚨 .env.local corrompido, tentando restaurar...')
      
      if (restaurarEnvBackup()) {
        console.log('✅ .env.local restaurado com sucesso!')
        
        // Verificar se funcionou
        if (!verificarCorrupcaoEnv()) {
          console.log('✅ Reparo confirmado! .env.local está OK')
          return true
        } else {
          console.log('❌ Reparo falhou, tentando emergência...')
          return restaurarEmergencia()
        }
      }
    } else {
      console.log('✅ .env.local não precisa de reparo')
      return true
    }
  } catch (error) {
    console.error('❌ Erro no reparo automático:', error)
    return false
  }
  
  return false
}

// 🚨 RESTAURAR CONFIGURAÇÃO DE EMERGÊNCIA
function restaurarEmergencia(): boolean {
  try {
    writeFileSync('.env.local', gerarEnvContent(EMERGENCY_CONFIG))
    console.log('✅ Configuração de emergência aplicada!')
    return true
  } catch (error) {
    console.error('❌ Erro ao aplicar emergência:', error)
    return false
  }
}

// 📝 GERAR CONTEÚDO .env FORMATADO
function gerarEnvContent(config: EnvConfig): string {
  return `OPENAI_API_KEY=${config.OPENAI_API_KEY}
ANTHROPIC_API_KEY=${config.ANTHROPIC_API_KEY}
TOGETHER_API_KEY=${config.TOGETHER_API_KEY}
NEXT_PUBLIC_SUPABASE_URL=${config.NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.NEXT_PUBLIC_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${config.SUPABASE_SERVICE_ROLE_KEY}
NEXT_PUBLIC_APP_URL=${config.NEXT_PUBLIC_APP_URL}`
}

// 🚀 VERIFICAR E REPARAR INÍCIO AUTOMÁTICO
export function iniciarVerificacaoAutomatica(): void {
  console.log('🚀 Iniciando verificação automática do .env.local...')
  
  // Verificar e reparar se necessário
  if (verificarCorrupcaoEnv()) {
    console.log('🚨 Problema detectado! Iniciando reparo...')
    repararEnvAutomatico()
  } else {
    console.log('✅ Tudo OK! Criando backup preventivo...')
    criarBackupEnv()
  }
}

// 📊 STATUS DO SISTEMA DE BACKUP
export function statusBackupEnv(): {
  ok: boolean
  backups: string[]
  mensagem: string
} {
  const backups = Object.values(BACKUP_FILES).filter(file => existsSync(file))
  
  if (verificarCorrupcaoEnv()) {
    return {
      ok: false,
      backups,
      mensagem: '🚨 .env.local corrompido! Precisa de reparo.'
    }
  }
  
  return {
    ok: true,
    backups,
    mensagem: `✅ .env.local OK! ${backups.length} backups disponíveis.`
  }
}
