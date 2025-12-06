/**
 * ============================================================================
 * DEBUG PARA WINDSURF - RADAR NARCISISTA
 * ============================================================================
 * 
 * Este helper gera blocos de debug formatados que Eduardo pode copiar
 * e colar de volta no chat com o Windsurf para diagnóstico rápido.
 * 
 * COMO USAR:
 * 1. Importe: import { debugParaWindsurf } from '../utils/debug-windsurf'
 * 2. Use em try/catch ao redor de expects importantes
 * 3. Quando o teste falhar, copie o bloco DEBUG-PARA-WINDSURF-INI/FIM
 * 4. Cole no chat do Windsurf para análise
 */

export type DebugContext = {
  cenario: string
  teste: string
  step: string
  urlAtual?: string
  seletor?: string
  esperado?: string
  observado?: string
  detalhesExtras?: Record<string, unknown>
}

/**
 * Gera um bloco de debug formatado para copiar/colar no Windsurf
 */
export function debugParaWindsurf(ctx: DebugContext): void {
  console.log('')
  console.log('===== DEBUG-PARA-WINDSURF-INI =====')
  console.log(JSON.stringify(ctx, null, 2))
  console.log('===== DEBUG-PARA-WINDSURF-FIM =====')
  console.log('')
}

/**
 * Helper para criar contexto de debug rapidamente
 */
export function criarContextoDebug(
  cenario: string,
  teste: string,
  step: string
): Partial<DebugContext> {
  return { cenario, teste, step }
}

/**
 * Wrapper para expect com debug automático
 * Uso: await expectComDebug(page, ctx, async () => { await expect(...) })
 */
export async function expectComDebug(
  page: { url: () => string },
  ctx: Partial<DebugContext>,
  expectFn: () => Promise<void>,
  seletor?: string,
  esperado?: string
): Promise<void> {
  try {
    await expectFn()
  } catch (error) {
    debugParaWindsurf({
      cenario: ctx.cenario || 'desconhecido',
      teste: ctx.teste || 'desconhecido',
      step: ctx.step || 'desconhecido',
      urlAtual: page.url(),
      seletor: seletor || 'não especificado',
      esperado: esperado || 'não especificado',
      observado: 'Falhou - ver detalhes',
      detalhesExtras: { 
        errorMessage: String(error),
        errorName: error instanceof Error ? error.name : 'Unknown'
      },
    })
    throw error
  }
}

/**
 * Log narrado em PT-BR para os testes
 */
export function narrar(emoji: string, mensagem: string): void {
  console.log(`${emoji} [NARRADOR] ${mensagem}`)
}

/**
 * Log de passo em PT-BR
 */
export function logPasso(mensagem: string): void {
  console.log(`👉 [PASSO] ${mensagem}`)
}

/**
 * Log de verificação em PT-BR
 */
export function logVerificacao(mensagem: string): void {
  console.log(`🔍 [VERIFICANDO] ${mensagem}`)
}

/**
 * Log de sucesso em PT-BR
 */
export function logSucesso(mensagem: string): void {
  console.log(`✅ [SUCESSO] ${mensagem}`)
}

/**
 * Log de aviso em PT-BR
 */
export function logAviso(mensagem: string): void {
  console.log(`⚠️ [AVISO] ${mensagem}`)
}

/**
 * Log de erro em PT-BR
 */
export function logErro(mensagem: string): void {
  console.log(`❌ [ERRO] ${mensagem}`)
}
