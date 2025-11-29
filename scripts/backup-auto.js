/**
 * SISTEMA DE BACKUP AUTOMÁTICO - RADAR NARCISISTA
 * Execute: node scripts/backup-auto.js
 * 
 * Este script cria backups automáticos do projeto
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurações
const PROJECT_ROOT = path.join(__dirname, '..');
const BACKUP_DIR = 'c:\\Users\\teste\\Desktop\\BACKUPS_RADAR';
const BACKUP_LOG = path.join(PROJECT_ROOT, 'BACKUP_LOG.md');

// Pastas para fazer backup (excluindo node_modules e .next)
const FOLDERS_TO_BACKUP = [
  'app',
  'components', 
  'lib',
  'database',
  'types',
  'public',
  'scripts'
];

const FILES_TO_BACKUP = [
  'package.json',
  'package-lock.json',
  'tailwind.config.ts',
  'tsconfig.json',
  'next.config.ts',
  '.env.local',
  'BACKUP_AUTOMATICO.md',
  'PROJETO_COMPLETO_RADAR_NARCISISMO.md',
  'ANALISE_UX_UI.md',
  'README.md'
];

function getTimestamp() {
  const now = new Date();
  return now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 19);
}

function createBackup() {
  const timestamp = getTimestamp();
  const backupName = `radar-narcisista_BACKUP_${timestamp}`;
  const backupPath = path.join(BACKUP_DIR, backupName);

  console.log('🔄 Iniciando backup automático...');
  console.log(`📁 Destino: ${backupPath}`);

  // Criar diretório de backup se não existir
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // Criar pasta do backup
  fs.mkdirSync(backupPath, { recursive: true });

  // Copiar pastas
  FOLDERS_TO_BACKUP.forEach(folder => {
    const src = path.join(PROJECT_ROOT, folder);
    const dest = path.join(backupPath, folder);
    
    if (fs.existsSync(src)) {
      copyFolderSync(src, dest);
      console.log(`✅ Pasta copiada: ${folder}`);
    }
  });

  // Copiar arquivos
  FILES_TO_BACKUP.forEach(file => {
    const src = path.join(PROJECT_ROOT, file);
    const dest = path.join(backupPath, file);
    
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✅ Arquivo copiado: ${file}`);
    }
  });

  // Atualizar log de backup
  updateBackupLog(backupName, timestamp);

  console.log('');
  console.log('✅ BACKUP CONCLUÍDO COM SUCESSO!');
  console.log(`📁 Local: ${backupPath}`);
  console.log('');

  return backupPath;
}

function copyFolderSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function updateBackupLog(backupName, timestamp) {
  const logEntry = `| ${timestamp.replace('_', ' ').replace(/-/g, ':')} | ${backupName} | Automático |\n`;
  
  let logContent = '';
  
  if (fs.existsSync(BACKUP_LOG)) {
    logContent = fs.readFileSync(BACKUP_LOG, 'utf8');
  } else {
    logContent = `# 📋 LOG DE BACKUPS - RADAR NARCISISTA

| Data/Hora | Nome do Backup | Tipo |
|-----------|----------------|------|
`;
  }

  // Adicionar nova entrada após o cabeçalho da tabela
  const lines = logContent.split('\n');
  const headerEndIndex = lines.findIndex(line => line.startsWith('|---'));
  
  if (headerEndIndex !== -1) {
    lines.splice(headerEndIndex + 1, 0, logEntry.trim());
    logContent = lines.join('\n');
  }

  fs.writeFileSync(BACKUP_LOG, logContent);
}

// Executar backup
createBackup();

// Exportar para uso em outros scripts
module.exports = { createBackup };
