/**
 * VALIDADOR DE RESUMO PARA COMUNICAÇÃO WINDSURF → CHATGPT
 * 
 * Este script valida se um resumo de etapa segue as regras de comunicação
 * definidas em docs/REGRAS-COMUNICACAO-IA.md e docs/FORMATO-RESUMO-ETAPAS.md
 * 
 * Uso: npx ts-node scripts/validar-resumo-ia.ts "texto do resumo"
 * Ou:  npx ts-node scripts/validar-resumo-ia.ts < arquivo.txt
 */

// Palavras e expressões proibidas
const PALAVRAS_PROIBIDAS = [
  'opcional',
  'opcionalmente',
  'opcionais',
  'se quiser',
  'caso deseje',
  'caso queira',
  'talvez',
  'possivelmente',
  'eventualmente',
  'poderia',
  'seria bom',
  'seria interessante',
  'você pode',
  'vocês podem',
];

// Padrão para detectar "ou" dentro de bullets
const PADRAO_OU_EM_BULLET = /^[\s]*[•\-\*]\s+.*\s+ou\s+/gim;

// Seções obrigatórias
const SECOES_OBRIGATORIAS = [
  'OPINIÃO DO WINDSURF',
  'MELHORIAS IDENTIFICADAS',
  'PRÓXIMA AÇÃO SUGERIDA',
];

interface ResultadoValidacao {
  valido: boolean;
  erros: string[];
  avisos: string[];
}

function validarResumo(texto: string): ResultadoValidacao {
  const erros: string[] = [];
  const avisos: string[] = [];
  const textoLower = texto.toLowerCase();

  // 1. Verificar palavras proibidas
  for (const palavra of PALAVRAS_PROIBIDAS) {
    if (textoLower.includes(palavra.toLowerCase())) {
      erros.push(`❌ Palavra proibida encontrada: "${palavra}"`);
    }
  }

  // 2. Verificar "ou" em bullets
  const linhas = texto.split('\n');
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    // Verifica se é um bullet (começa com •, -, *)
    if (/^[\s]*[•\-\*]\s+/.test(linha)) {
      // Verifica se contém " ou " no meio
      if (/\s+ou\s+/i.test(linha)) {
        erros.push(`❌ Linha ${i + 1}: Bullet contém "ou" - separar em bullets distintos`);
      }
    }
  }

  // 3. Verificar seções obrigatórias
  for (const secao of SECOES_OBRIGATORIAS) {
    if (!texto.toUpperCase().includes(secao.toUpperCase())) {
      erros.push(`❌ Seção obrigatória ausente: "${secao}"`);
    }
  }

  // 4. Verificar se há bullets nas seções de melhorias e ações
  const temBulletsMelhorias = /MELHORIAS IDENTIFICADAS[\s\S]*?[•\-\*]/i.test(texto);
  const temBulletsAcoes = /PRÓXIMA AÇÃO SUGERIDA[\s\S]*?[•\-\*]/i.test(texto);

  if (!temBulletsMelhorias) {
    avisos.push('⚠️ Seção "MELHORIAS IDENTIFICADAS" pode estar sem bullets');
  }
  if (!temBulletsAcoes) {
    avisos.push('⚠️ Seção "PRÓXIMA AÇÃO SUGERIDA" pode estar sem bullets');
  }

  // 5. Verificar comprimento mínimo
  if (texto.length < 500) {
    avisos.push('⚠️ Resumo muito curto - pode estar incompleto');
  }

  return {
    valido: erros.length === 0,
    erros,
    avisos,
  };
}

function imprimirResultado(resultado: ResultadoValidacao): void {
  console.log('\n' + '='.repeat(60));
  console.log('📋 RESULTADO DA VALIDAÇÃO DO RESUMO');
  console.log('='.repeat(60) + '\n');

  if (resultado.valido) {
    console.log('✅ RESUMO VÁLIDO - Pode ser enviado ao ChatGPT\n');
  } else {
    console.log('❌ RESUMO INVÁLIDO - Corrija os erros antes de enviar\n');
  }

  if (resultado.erros.length > 0) {
    console.log('ERROS ENCONTRADOS:');
    resultado.erros.forEach(erro => console.log(`  ${erro}`));
    console.log('');
  }

  if (resultado.avisos.length > 0) {
    console.log('AVISOS:');
    resultado.avisos.forEach(aviso => console.log(`  ${aviso}`));
    console.log('');
  }

  console.log('='.repeat(60) + '\n');
}

// Execução principal
async function main() {
  let texto = '';

  // Verificar se recebeu texto como argumento
  if (process.argv[2]) {
    texto = process.argv.slice(2).join(' ');
  } else {
    // Ler do stdin
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    texto = Buffer.concat(chunks).toString('utf-8');
  }

  if (!texto.trim()) {
    console.log('Uso: npx ts-node scripts/validar-resumo-ia.ts "texto do resumo"');
    console.log('Ou:  cat resumo.txt | npx ts-node scripts/validar-resumo-ia.ts');
    process.exit(1);
  }

  const resultado = validarResumo(texto);
  imprimirResultado(resultado);
  
  process.exit(resultado.valido ? 0 : 1);
}

main().catch(console.error);
