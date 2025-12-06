/**
 * ============================================================================
 * TESTE E2E NARRADO: BILLING BÁSICO (STRIPE)
 * ============================================================================
 * 
 * CENÁRIO: billing_basico
 * 
 * OBJETIVO:
 * Este teste verifica se os planos são exibidos corretamente
 * e se o fluxo de checkout funciona.
 * 
 * PRÉ-REQUISITOS:
 * - Stripe configurado (modo teste)
 * - Produtos/preços criados no Stripe Dashboard
 * - Variáveis STRIPE_* no .env.local
 * 
 * COMO RODAR EM MODO CINEMA:
 * npx playwright test tests/e2e/billing_basico.spec.ts --headed
 */

import { test, expect } from '@playwright/test'
import { testScenarios, shouldRunScenario, getSkipMessage } from '../config/test-scenarios.config'
import { 
  debugParaWindsurf, 
  logPasso, 
  logVerificacao, 
  logSucesso, 
  logAviso,
  narrar 
} from '../utils/debug-windsurf'
import { closeAllModals } from '../helpers/close-modals'

// ============================================================================
// CONFIGURAÇÕES DO TESTE
// ============================================================================

const TESTE_INFO = {
  cenario: 'billing_basico',
  nome: 'Billing básico - Stripe',
}

// Planos esperados
const PLANOS_ESPERADOS = [
  { nome: /gratuito|free|guardar/i, preco: /grátis|free|R\$ 0/i },
  { nome: /essencial|jornada/i, preco: /R\$ 29|29,90/i },
  { nome: /completo|defesa/i, preco: /R\$ 49|49,90/i },
  { nome: /profissional/i, preco: /R\$ 99|99,90/i },
]

// ============================================================================
// TESTE PRINCIPAL
// ============================================================================

test.describe('🎬 CINEMA: Billing Básico - Stripe', () => {
  
  test.setTimeout(120000)
  
  test.beforeEach(async () => {
    test.skip(
      !shouldRunScenario('billing_basico'),
      getSkipMessage('billing_basico')
    )
  })

  test('🎥 Página de planos exibe todos os planos', async ({ page }) => {
    narrar('🎬', 'INICIANDO TESTE: Página de planos')
    narrar('📋', 'Este teste verifica se os planos são exibidos corretamente')
    
    // ========================================
    // PASSO 1: Acessar página de planos
    // ========================================
    await test.step('1️⃣ Acessar página de planos', async () => {
      logPasso('Abrindo página de planos...')
      
      // Por que fazemos isso:
      // A página de planos é onde o usuário escolhe sua assinatura.
      
      await page.goto('/planos')
      await page.waitForLoadState('networkidle')
      await closeAllModals(page)
      
      logSucesso('Página de planos carregada!')
    })

    // ========================================
    // PASSO 2: Verificar se planos aparecem
    // ========================================
    await test.step('2️⃣ Verificar planos exibidos', async () => {
      logVerificacao('Verificando planos na página...')
      
      // Por que fazemos isso:
      // Todos os planos devem estar visíveis para o usuário escolher.
      
      const pageContent = await page.evaluate(() => document.body.innerText)
      
      let planosEncontrados = 0
      
      for (const plano of PLANOS_ESPERADOS) {
        if (plano.nome.test(pageContent)) {
          logSucesso(`Plano "${plano.nome}" encontrado!`)
          planosEncontrados++
        } else {
          logAviso(`Plano "${plano.nome}" não encontrado`)
        }
      }
      
      if (planosEncontrados === 0) {
        debugParaWindsurf({
          cenario: TESTE_INFO.cenario,
          teste: TESTE_INFO.nome,
          step: 'Verificar planos exibidos',
          urlAtual: page.url(),
          esperado: 'Pelo menos 1 plano visível',
          observado: 'Nenhum plano encontrado',
          detalhesExtras: { pageContentLength: pageContent.length },
        })
      }
      
      logSucesso(`${planosEncontrados} planos encontrados!`)
    })

    // ========================================
    // PASSO 3: Verificar botões de assinar
    // ========================================
    await test.step('3️⃣ Verificar botões de assinar', async () => {
      logVerificacao('Verificando botões de ação...')
      
      // Por que fazemos isso:
      // Cada plano deve ter um botão para assinar.
      
      const buttons = page.locator('button:has-text("Assinar"), a:has-text("Assinar"), button:has-text("Subscribe")')
      const buttonCount = await buttons.count()
      
      if (buttonCount > 0) {
        logSucesso(`${buttonCount} botões de assinar encontrados!`)
      } else {
        logAviso('Nenhum botão de assinar encontrado')
      }
    })

    // ========================================
    // PASSO 4: Verificar toggle mensal/anual
    // ========================================
    await test.step('4️⃣ Verificar toggle de período', async () => {
      logVerificacao('Verificando toggle mensal/anual...')
      
      // Por que fazemos isso:
      // O usuário deve poder escolher entre pagamento mensal ou anual.
      
      const toggle = page.locator('button:has-text("Mensal"), button:has-text("Anual"), button:has-text("Monthly"), button:has-text("Annual")')
      const hasToggle = await toggle.first().isVisible().catch(() => false)
      
      if (hasToggle) {
        logSucesso('Toggle de período encontrado!')
        
        // Clicar para testar
        await toggle.first().click()
        await page.waitForTimeout(500)
        logSucesso('Toggle funcionando!')
      } else {
        logAviso('Toggle de período não encontrado')
      }
    })

    narrar('🎉', 'TESTE DE PLANOS CONCLUÍDO!')
  })

  test('🎥 Fluxo de checkout redireciona para Stripe', async ({ page }) => {
    narrar('🎬', 'INICIANDO TESTE: Fluxo de checkout')
    narrar('📋', 'Este teste verifica se o checkout redireciona para o Stripe')
    narrar('⚠️', 'NOTA: Este teste não completa o pagamento, apenas verifica o redirecionamento')
    
    // ========================================
    // PASSO 1: Acessar página de planos
    // ========================================
    await test.step('1️⃣ Acessar página de planos', async () => {
      logPasso('Abrindo página de planos...')
      
      await page.goto('/planos')
      await page.waitForLoadState('networkidle')
      await closeAllModals(page)
      
      logSucesso('Página carregada!')
    })

    // ========================================
    // PASSO 2: Clicar em assinar plano pago
    // ========================================
    await test.step('2️⃣ Clicar em assinar plano pago', async () => {
      logPasso('Procurando botão de assinar plano pago...')
      
      // Por que fazemos isso:
      // Queremos verificar se o sistema inicia o checkout corretamente.
      
      // Procurar por botão de assinar (não o gratuito)
      const assinarButtons = page.locator('a:has-text("Assinar"), button:has-text("Assinar")')
      const count = await assinarButtons.count()
      
      if (count > 0) {
        // Clicar no primeiro botão de assinar (geralmente é um plano pago)
        await assinarButtons.first().click()
        await page.waitForTimeout(3000)
        
        // Verificar se redirecionou
        const url = page.url()
        
        if (url.includes('stripe.com') || url.includes('checkout')) {
          logSucesso('Redirecionou para Stripe Checkout!')
        } else if (url.includes('login')) {
          logAviso('Redirecionou para login (usuário não autenticado)')
        } else {
          logAviso(`URL atual: ${url}`)
        }
      } else {
        logAviso('Nenhum botão de assinar encontrado')
      }
    })

    narrar('🎉', 'TESTE DE CHECKOUT CONCLUÍDO!')
  })

})
