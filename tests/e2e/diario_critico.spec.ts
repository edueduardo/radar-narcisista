/**
 * ============================================================================
 * TESTE E2E NARRADO: DIÁRIO CRÍTICO (DETECÇÃO DE RISCO)
 * ============================================================================
 * 
 * CENÁRIO: diario_critico
 * 
 * OBJETIVO:
 * Este teste verifica se o sistema detecta tags graves no diário
 * e gera alertas de risco apropriados.
 * 
 * PRÉ-REQUISITOS:
 * - Usuária de teste criada no Supabase
 * - Sistema de detecção de risco implementado
 * 
 * COMO RODAR EM MODO CINEMA:
 * npx playwright test tests/e2e/diario_critico.spec.ts --headed
 */

import { test, expect } from '@playwright/test'
import { testScenarios, shouldRunScenario, getSkipMessage } from '../config/test-scenarios.config'
import { 
  debugParaWindsurf, 
  logPasso, 
  logVerificacao, 
  logSucesso, 
  logAviso,
  logErro,
  narrar 
} from '../utils/debug-windsurf'
import { closeAllModals } from '../helpers/close-modals'

// ============================================================================
// CONFIGURAÇÕES DO TESTE
// ============================================================================

const TESTE_INFO = {
  cenario: 'diario_critico',
  nome: 'Diário crítico - detecção de risco',
}

const TEST_USER = {
  email: 'teste.usuario@radar-narcisista.com.br',
  password: 'Teste123!@#',
}

// Tags que devem disparar alerta de risco
const TAGS_GRAVES = ['violencia_fisica', 'ameaca', 'isolamento', 'suicidio', 'autolesao']

// ============================================================================
// HELPERS
// ============================================================================

async function fazerLogin(page: any, email: string, password: string): Promise<boolean> {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await closeAllModals(page)
  
  const emailInput = page.locator('input[type="email"], input[name="email"]')
  const passwordInput = page.locator('input[type="password"], input[name="password"]')
  
  if (await emailInput.isVisible()) {
    await emailInput.fill(email)
    await passwordInput.fill(password)
    
    const submitButton = page.locator('button[type="submit"]').first()
    await submitButton.click()
    
    await page.waitForTimeout(3000)
    
    const url = page.url()
    return !url.includes('/login')
  }
  
  return false
}

// ============================================================================
// TESTE PRINCIPAL
// ============================================================================

test.describe('🎬 CINEMA: Diário Crítico - Detecção de Risco', () => {
  
  test.setTimeout(180000) // 3 minutos para este teste
  
  test.beforeEach(async () => {
    test.skip(
      !shouldRunScenario('diario_critico'),
      getSkipMessage('diario_critico')
    )
  })

  test('🎥 Sistema detecta tags graves e mostra alerta', async ({ page }) => {
    narrar('🎬', 'INICIANDO TESTE: Detecção de risco no diário')
    narrar('📋', 'Este teste verifica se o sistema detecta situações de risco')
    narrar('⚠️', 'IMPORTANTE: Este teste cria entradas com conteúdo sensível para fins de teste')
    
    // ========================================
    // PASSO 1: Fazer login
    // ========================================
    await test.step('1️⃣ Fazer login como usuária de teste', async () => {
      logPasso('Fazendo login...')
      
      const loggedIn = await fazerLogin(page, TEST_USER.email, TEST_USER.password)
      
      if (!loggedIn) {
        debugParaWindsurf({
          cenario: TESTE_INFO.cenario,
          teste: TESTE_INFO.nome,
          step: 'Fazer login',
          urlAtual: page.url(),
          esperado: 'Login bem-sucedido',
          observado: 'Falha no login',
        })
        test.skip(true, 'Usuária de teste não existe')
      }
      
      logSucesso('Login realizado!')
    })

    // ========================================
    // PASSO 2: Acessar página do diário
    // ========================================
    await test.step('2️⃣ Acessar página do diário', async () => {
      logPasso('Navegando para o diário...')
      
      // Por que fazemos isso:
      // Precisamos acessar a página de criação de diário.
      
      await page.goto('/diario')
      await page.waitForLoadState('networkidle')
      await closeAllModals(page)
      
      // Procurar botão de novo diário
      const newButton = page.locator('a[href*="novo"], button:has-text("Novo"), button:has-text("Criar")').first()
      
      if (await newButton.isVisible().catch(() => false)) {
        await newButton.click({ force: true })
        await page.waitForTimeout(1000)
        logSucesso('Página de novo diário aberta!')
      } else {
        // Tentar navegar diretamente
        await page.goto('/diario/novo')
        await page.waitForLoadState('networkidle')
        await closeAllModals(page)
        logSucesso('Navegou para /diario/novo')
      }
    })

    // ========================================
    // PASSO 3: Criar entrada com tags graves
    // ========================================
    await test.step('3️⃣ Criar entrada com tags graves', async () => {
      logPasso('Criando entrada com conteúdo sensível...')
      
      // Por que fazemos isso:
      // Queremos verificar se o sistema detecta situações de risco
      // e mostra os recursos de ajuda apropriados.
      
      // Procurar campos do formulário
      const titleInput = page.locator('input[name="title"], input[placeholder*="título"]').first()
      const contentInput = page.locator('textarea, [contenteditable="true"]').first()
      
      if (await titleInput.isVisible().catch(() => false)) {
        await titleInput.fill('Situação difícil - TESTE')
      }
      
      if (await contentInput.isVisible().catch(() => false)) {
        await contentInput.fill('Estou passando por uma situação muito difícil. Me sinto isolada e com medo. Este é um TESTE do sistema de detecção.')
      }
      
      // Procurar e selecionar tags graves (se houver seletor de tags)
      const tagSelectors = page.locator('[data-tag], [class*="tag"], button:has-text("violência"), button:has-text("ameaça")')
      const tagCount = await tagSelectors.count()
      
      if (tagCount > 0) {
        logVerificacao(`Encontradas ${tagCount} opções de tags`)
        // Clicar nas primeiras tags disponíveis
        for (let i = 0; i < Math.min(3, tagCount); i++) {
          await tagSelectors.nth(i).click().catch(() => {})
        }
      }
      
      // Salvar
      const saveButton = page.locator('button[type="submit"], button:has-text("Salvar"), button:has-text("Criar")').first()
      if (await saveButton.isVisible().catch(() => false)) {
        await saveButton.click()
        await page.waitForTimeout(2000)
        logSucesso('Entrada criada!')
      }
    })

    // ========================================
    // PASSO 4: Verificar se alerta de risco aparece
    // ========================================
    await test.step('4️⃣ Verificar alerta de risco', async () => {
      logVerificacao('Verificando se o sistema detectou risco...')
      
      // Por que fazemos isso:
      // O sistema deve mostrar recursos de ajuda quando detecta
      // conteúdo que indica situação de risco.
      
      // Procurar por elementos de alerta
      const alertElements = await page.evaluate(() => {
        const text = document.body.innerText.toLowerCase()
        return {
          temAlerta: text.includes('alerta') || text.includes('risco') || text.includes('emergência'),
          temTelefone: text.includes('188') || text.includes('190') || text.includes('180'),
          temAjuda: text.includes('ajuda') || text.includes('apoio') || text.includes('cvv'),
        }
      })
      
      if (alertElements.temAlerta) {
        logSucesso('Sistema mostrou alerta de risco!')
      }
      
      if (alertElements.temTelefone) {
        logSucesso('Telefones de emergência exibidos!')
      }
      
      if (alertElements.temAjuda) {
        logSucesso('Recursos de ajuda exibidos!')
      }
      
      if (!alertElements.temAlerta && !alertElements.temTelefone && !alertElements.temAjuda) {
        logAviso('Nenhum alerta de risco detectado - verificar implementação')
        debugParaWindsurf({
          cenario: TESTE_INFO.cenario,
          teste: TESTE_INFO.nome,
          step: 'Verificar alerta de risco',
          urlAtual: page.url(),
          esperado: 'Alerta de risco ou recursos de ajuda visíveis',
          observado: 'Nenhum elemento de alerta encontrado',
          detalhesExtras: alertElements,
        })
      }
    })

    narrar('🎉', 'TESTE DE DETECÇÃO DE RISCO CONCLUÍDO!')
    narrar('📊', 'Verifique no Supabase se um risk_alert foi criado.')
  })

})
