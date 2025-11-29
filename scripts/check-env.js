// SCRIPT AUTOMÁTICO DE VERIFICAÇÃO DO .env.local
// Executa toda vez que o servidor inicia

const { readFileSync, writeFileSync, existsSync } = require('fs')
const { join } = require('path')

console.log('🔍 VERIFICANDO .env.local ANTES DE INICIAR...')

// 🚨 DETECTAR PROBLEMAS COMUNS
function verificarCorrupcao() {
  try {
    if (!existsSync('.env.local')) {
      console.log('🚨 .env.local não existe!')
      return true
    }

    const content = readFileSync('.env.local', 'utf-8')
    
    // Problema 1: Tudo em uma linha
    if (!content.includes('\n')) {
      console.log('🚨 PROBLEMA: Arquivo em uma linha!')
      return true
    }
    
    // Problema 2: Sem chaves necessárias
    const chaves = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
    const faltando = chaves.filter(chave => !content.includes(chave + '='))
    
    if (faltando.length > 0) {
      console.log(`🚨 PROBLEMA: Faltando chaves: ${faltando.join(', ')}`)
      return true
    }
    
    // Problema 3: Formatação corrompida (linhas MUITO longas - mais de 500 chars)
    const linhas = content.split('\n')
    if (linhas.some(linha => linha.length > 500 && linha.includes('='))) {
      console.log('🚨 PROBLEMA: Linha muito longa detectada (possível chave API exposta)')
      return true
    }
    
    console.log('✅ .env.local parece OK!')
    return false
  } catch (error) {
    console.log('🚨 ERRO ao ler .env.local:', error.message)
    return true
  }
}

// 🔧 REPARAR AUTOMATICAMENTE
function repararEnv() {
  console.log('🔧 TENTANDO REPARAR AUTOMATICAMENTE...')
  
  try {
    // Tentar restaurar do backup
    if (existsSync('.env.backup')) {
      const backup = readFileSync('.env.backup', 'utf-8')
      writeFileSync('.env.local', backup)
      console.log('✅ Restaurado do backup!')
      return true
    }
    
    // Criar do zero se não tiver backup
    const configCorreta = `# Configuração mínima para desenvolvimento
# NÃO adicione chaves privadas aqui - use ambiente seguro
NEXT_PUBLIC_SUPABASE_URL=https://zxfbyxrtjrmebslprwhw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmJ5eHJ0anJtZWJzbHByd2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTA1MjUsImV4cCI6MjA3OTU2NjUyNX0.R-hj6BY3xL5VmSSQNDqBB9t-lt3u2uyfQkJCagvyILM
NEXT_PUBLIC_APP_URL=http://localhost:3000`
    
    writeFileSync('.env.local', configCorreta)
    console.log('✅ .env.local recriado com configuração padrão!')
    return true
  } catch (error) {
    console.error('❌ ERRO no reparo:', error.message)
    return false
  }
}

// 🚀 EXECUTAR VERIFICAÇÃO
if (verificarCorrupcao()) {
  console.log('🚨 PROBLEMA DETECTADO! Iniciando reparo...')
  
  if (repararEnv()) {
    console.log('✅ REPARO CONCLUÍDO! Servidor pode iniciar.')
    process.exit(0)
  } else {
    console.log('❌ REPARO FALHOU! Verifique manualmente.')
    process.exit(1)
  }
} else {
  console.log('✅ TUDO OK! Servidor pode iniciar.')
  process.exit(0)
}
