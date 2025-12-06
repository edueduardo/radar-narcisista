#!/usr/bin/env node

/**
 * RADAR NARCISISTA - SCRIPT DE TESTES COMPLETO
 * 
 * Roda todos os testes do sistema em sequência:
 * 1. Lint (verificação de código)
 * 2. Build (compilação)
 * 3. Testes unitários
 * 4. Testes de API
 * 5. Health Check
 * 
 * Uso: node scripts/run-all-tests.js
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function logResult(success, message) {
  if (success) {
    log(`✅ ${message}`, 'green');
  } else {
    log(`❌ ${message}`, 'red');
  }
}

function runCommand(command, description, allowFail = false) {
  logHeader(description);
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    // Mostrar apenas as últimas 20 linhas
    const lines = output.trim().split('\n');
    const lastLines = lines.slice(-20);
    console.log(lastLines.join('\n'));
    
    logResult(true, `${description} - PASSOU`);
    return { success: true, output };
  } catch (error) {
    console.log(error.stdout || '');
    console.log(error.stderr || '');
    
    if (allowFail) {
      logResult(false, `${description} - FALHOU (mas continuando...)`);
      return { success: false, output: error.message };
    }
    
    logResult(false, `${description} - FALHOU`);
    return { success: false, output: error.message };
  }
}

async function main() {
  const startTime = Date.now();
  const results = [];
  
  console.log('\n');
  log('🔬 RADAR NARCISISTA - SUITE DE TESTES COMPLETA', 'bright');
  log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`, 'blue');
  console.log('\n');

  // 1. Verificar se estamos no diretório correto
  if (!fs.existsSync('package.json')) {
    log('❌ ERRO: Execute este script na raiz do projeto!', 'red');
    process.exit(1);
  }

  // 2. Lint
  const lintResult = runCommand('npm run lint', '1. LINT (Verificação de Código)', true);
  results.push({ name: 'Lint', ...lintResult });

  // 3. Build
  const buildResult = runCommand('npm run build', '2. BUILD (Compilação)', false);
  results.push({ name: 'Build', ...buildResult });

  // Se build falhou, parar aqui
  if (!buildResult.success) {
    log('\n⛔ Build falhou! Corrija os erros antes de continuar.', 'red');
    process.exit(1);
  }

  // 4. Testes unitários
  const testResult = runCommand('npm test', '3. TESTES UNITÁRIOS', true);
  results.push({ name: 'Testes Unitários', ...testResult });

  // 5. Testes de API
  const apiResult = runCommand('npm run test:api', '4. TESTES DE API', true);
  results.push({ name: 'Testes de API', ...apiResult });

  // 6. Health Check
  const healthResult = runCommand('npm run health-check', '5. HEALTH CHECK', true);
  results.push({ name: 'Health Check', ...healthResult });

  // Resumo final
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  logHeader('📊 RESUMO FINAL');
  
  let passed = 0;
  let failed = 0;

  results.forEach(r => {
    if (r.success) {
      passed++;
      log(`  ✅ ${r.name}`, 'green');
    } else {
      failed++;
      log(`  ❌ ${r.name}`, 'red');
    }
  });

  console.log('\n' + '-'.repeat(40));
  log(`Total: ${results.length} | Passou: ${passed} | Falhou: ${failed}`, 'bright');
  log(`Tempo total: ${duration}s`, 'blue');
  console.log('-'.repeat(40) + '\n');

  if (failed === 0) {
    log('🎉 TODOS OS TESTES PASSARAM!', 'green');
  } else {
    log(`⚠️  ${failed} teste(s) falharam. Verifique os erros acima.`, 'yellow');
  }

  // Gerar relatório
  const reportPath = path.join(process.cwd(), 'test-report.txt');
  const report = `
RADAR NARCISISTA - RELATÓRIO DE TESTES
======================================
Data: ${new Date().toLocaleString('pt-BR')}
Duração: ${duration}s

RESULTADOS:
${results.map(r => `- ${r.name}: ${r.success ? 'PASSOU' : 'FALHOU'}`).join('\n')}

Total: ${results.length}
Passou: ${passed}
Falhou: ${failed}
`;

  fs.writeFileSync(reportPath, report);
  log(`\n📄 Relatório salvo em: test-report.txt`, 'blue');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
