/**
 * RADAR NARCISISTA - Gerador de Espelho do Código
 * 
 * Este script percorre o projeto e gera um arquivo TXT consolidado
 * com todo o código fonte relevante, para enviar ao ChatGPT ou outras IAs.
 * 
 * Uso: npm run espelho-codigo
 * Saída: ./ESPELHO-CODIGO-RADAR.txt
 */

const fs = require('fs');
const path = require('path');

// Configurações
const projectRoot = path.resolve(__dirname, '..');
const outputFile = path.join(projectRoot, 'ESPELHO-CODIGO-RADAR.txt');

// Pastas a ignorar
const IGNORED_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  '.turbo',
  '.vercel',
  '.vscode',
  '.idea',
  '__pycache__',
  'coverage',
  'dist',
  'build'
]);

// Extensões a incluir
const INCLUDED_EXTS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.sql',
  '.json'
]);

// Arquivos específicos a ignorar
const IGNORED_FILES = new Set([
  'package-lock.json',
  'tsconfig.tsbuildinfo',
  '.env.local',
  '.env'
]);

/**
 * Verifica se um arquivo deve ser ignorado
 */
function shouldIgnoreFile(fileName) {
  const lower = fileName.toLowerCase();
  
  // Ignorar arquivos de tipagem e testes
  if (lower.endsWith('.d.ts')) return true;
  if (lower.endsWith('.test.ts')) return true;
  if (lower.endsWith('.test.tsx')) return true;
  if (lower.endsWith('.spec.ts')) return true;
  if (lower.endsWith('.spec.tsx')) return true;
  if (lower.endsWith('.test.js')) return true;
  if (lower.endsWith('.spec.js')) return true;
  
  // Ignorar arquivos específicos
  if (IGNORED_FILES.has(fileName)) return true;
  
  return false;
}

/**
 * Coleta todos os arquivos relevantes recursivamente
 */
function collectFiles(dir, baseDir = projectRoot, acc = []) {
  let entries;
  
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    console.warn(`Aviso: não foi possível ler ${dir}: ${err.message}`);
    return acc;
  }

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Ignorar pastas da lista
      if (IGNORED_DIRS.has(entry.name)) {
        continue;
      }
      // Recursão
      collectFiles(entryPath, baseDir, acc);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      
      // Verificar extensão
      if (!INCLUDED_EXTS.has(ext)) continue;
      
      // Verificar se deve ignorar
      if (shouldIgnoreFile(entry.name)) continue;

      const relativePath = path.relative(baseDir, entryPath).replace(/\\/g, '/');
      acc.push({ absolutePath: entryPath, relativePath });
    }
  }

  return acc;
}

/**
 * Gera o arquivo ESPELHO-CODIGO-RADAR.txt
 */
function generateMirror() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  RADAR NARCISISTA - Gerador de Espelho do Código           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Coletando arquivos do projeto...');

  const files = collectFiles(projectRoot);
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  console.log(`Encontrados ${files.length} arquivos relevantes.`);
  console.log('');

  // Cabeçalho do arquivo
  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  let output = '';
  
  output += '╔════════════════════════════════════════════════════════════════════════════╗\n';
  output += '║                    RADAR NARCISISTA - ESPELHO DO CÓDIGO                    ║\n';
  output += '╚════════════════════════════════════════════════════════════════════════════╝\n\n';
  output += `Gerado em: ${now}\n`;
  output += `Total de arquivos: ${files.length}\n`;
  output += `Extensões incluídas: ${Array.from(INCLUDED_EXTS).join(', ')}\n`;
  output += `Pastas ignoradas: ${Array.from(IGNORED_DIRS).join(', ')}\n\n`;
  
  // Índice de arquivos
  output += '════════════════════════════════════════════════════════════════════════════\n';
  output += 'ÍNDICE DE ARQUIVOS\n';
  output += '════════════════════════════════════════════════════════════════════════════\n\n';
  
  files.forEach((file, index) => {
    output += `${String(index + 1).padStart(4, ' ')}. ${file.relativePath}\n`;
  });
  
  output += '\n\n';

  // Conteúdo de cada arquivo
  let processedCount = 0;
  let errorCount = 0;

  for (const file of files) {
    let content;
    
    try {
      content = fs.readFileSync(file.absolutePath, 'utf8');
      processedCount++;
    } catch (err) {
      console.warn(`Erro ao ler ${file.relativePath}: ${err.message}`);
      errorCount++;
      content = `[ERRO AO LER ARQUIVO: ${err.message}]`;
    }

    output += '════════════════════════════════════════════════════════════════════════════\n';
    output += `ARQUIVO: ${file.relativePath}\n`;
    output += '════════════════════════════════════════════════════════════════════════════\n\n';
    output += content;
    output += '\n\n';
  }

  // Rodapé
  output += '════════════════════════════════════════════════════════════════════════════\n';
  output += 'FIM DO ESPELHO DO CÓDIGO\n';
  output += '════════════════════════════════════════════════════════════════════════════\n';

  // Escrever arquivo
  try {
    fs.writeFileSync(outputFile, output, 'utf8');
    
    const stats = fs.statSync(outputFile);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('✅ ESPELHO gerado com sucesso!');
    console.log('');
    console.log(`   📄 Arquivo: ${outputFile}`);
    console.log(`   📊 Tamanho: ${sizeMB} MB`);
    console.log(`   📁 Arquivos processados: ${processedCount}`);
    if (errorCount > 0) {
      console.log(`   ⚠️  Erros: ${errorCount}`);
    }
    console.log('');
    
  } catch (err) {
    console.error('❌ Erro ao escrever ESPELHO-CODIGO-RADAR.txt:', err.message);
    process.exit(1);
  }
}

// Executar
try {
  generateMirror();
} catch (err) {
  console.error('❌ Erro fatal ao gerar ESPELHO-CODIGO-RADAR:', err);
  process.exit(1);
}
