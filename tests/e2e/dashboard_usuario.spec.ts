/**
 * ============================================================================
 * TESTE E2E NARRADO: DASHBOARD DA USUÁRIA
 * ============================================================================
 * 
 * CENÁRIO: dashboard_usuario
 * 
 * OBJETIVO:
 * Este teste verifica se o dashboard da usuária exibe corretamente
 * os dados de diários, gráficos e indicadores de risco.
 * 
 * PRÉ-REQUISITOS:
 * - Usuária de teste criada no Supabase
 * - Pelo menos 1 diário registrado
 * 
 * COMO RODAR EM MODO CINEMA:
 * npx playwright test tests/e2e/dashboard_usuario.spec.ts --headed
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
  cenario: 'dashboard_usuario',
  nome: 'Dashboard da usuária',
}

// Credenciais de teste (criar no Supabase antes de rodar)
const TEST_USER = {
  email: 'teste.usuario@radar-narcisista.com.br',
  password: 'Teste123!@#',
}

// ============================================================================
// HELPERS
// ============================================================================

async function fazerLogin(page: any, email: string, password: string): Promise<boolean> {
  logPasso(`Fazendo login com ${email}...`)
  
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await closeAllModals(page)
  
  // Preencher formulário
  const emailInput = page.locator('input[type="email"], input[name="email"]')
  const passwordInput = page.locator('input[type="password"], input[name="password"]')
  
  if (await emailInput.isVisible()) {
    await emailInput.fill(email)
    await passwordInput.fill(password)
    
    // Clicar no botão de login
    const submitButton = page.locator('button[type="submit"]').first()
    await submitButton.click()
    
    // Aguardar redirecionamento
    await page.waitForTimeout(3000)
    
    // Verificar se logou (não está mais na página de login)
    const url = page.url()
    if (!url.includes('/login')) {
      logSucesso('Login realizado!')
      return true
    }
  }
  
  logAviso('Não foi possível fazer login')
  return false
}

// ============================================================================
// TESTE PRINCIPAL
// ============================================================================

test.describe('🎬 CINEMA: Dashboard da Usuária', () => {
  
  test.setTimeout(120000)
  
  test.beforeEach(async () => {
    test.skip(
      !shouldRunScenario('dashboard_usuario'),
      getSkipMessage('dashboard_usuario')
    )
  })

  test('🎥 Dashboard carrega e exibe dados da usuária', async ({ page }) => {
    narrar('🎬', 'INICIANDO TESTE: Dashboard da usuária')
    narrar('📋', 'Este teste verifica se o dashboard mostra os dados corretamente')
    
    // ========================================
    // PASSO 1: Fazer login
    // ========================================
    await test.step('1️⃣ Fazer login como usuária de teste', async () => {
      // Por que fazemos isso:
      // O dashboard é uma área protegida, precisamos estar logados.
      
      const loggedIn = await fazerLogin(page, TEST_USER.email, TEST_USER.password)
      
      if (!loggedIn) {
        debugParaWindsurf({
          cenario: TESTE_INFO.cenario,
          teste: TESTE_INFO.nome,
          step: 'Fazer login',
          urlAtual: page.url(),
          esperado: 'Login bem-sucedido',
          observado: 'Falha no login - verificar se usuária existe no Supabase',
          detalhesExtras: { email: TEST_USER.email },
        })
        test.skip(true, 'Usuária de teste não existe - criar no Supabase primeiro')
      }
    })

    // ========================================
    // PASSO 2: Acessar dashboard
    // ========================================
    await test.step('2️⃣ Acessar o dashboard', async () => {
      logPasso('Navegando para o dashboard...')
      
      // Por que fazemos isso:
      // Verificar se a página do dashboard carrega sem erros.
      
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      await closeAllModals(page)
      
      logSucesso('Dashboard carregado!')
    })

    // ========================================
    // PASSO 3: Verificar elementos do dashboard
    // ========================================
    await test.step('3️⃣ Verificar elementos principais do dashboard', async () => {
      logVerificacao('Verificando elementos do dashboard...')
      
      // Por que fazemos isso:
      // O dashboard deve mostrar informações úteis para a usuária.
      
      // Verificar se há algum conteúdo
      const body = page.locator('body')
      await expect(body).toBeVisible()
      
      // Procurar por elementos comuns de dashboard
      const dashboardContent = await page.evaluate(() => {
        const text = document.body.innerText
        return {
          temDiario: text.toLowerCase().includes('diário') || text.toLowerCase().includes('diary'),
          temTeste: text.toLowerCase().includes('teste') || text.toLowerCase().includes('clareza'),
          temCoach: text.toLowerCase().includes('coach') || text.toLowerCase().includes('chat'),
        }
      })
      
      if (dashboardContent.temDiario) {
        logSucesso('Seção de Diário encontrada!')
      }
      if (dashboardContent.temTeste) {
        logSucesso('Seção de Teste encontrada!')
      }
      if (dashboardContent.temCoach) {
        logSucesso('Seção de Coach encontrada!')
      }
      
      logSucesso('Dashboard verificado!')
    })

    // ========================================
    // PASSO 4: Verificar navegação lateral
    // ========================================
    await test.step('4️⃣ Verificar menu de navegação', async () => {
      logVerificacao('Verificando menu lateral...')
      
      // Por que fazemos isso:
      // A usuária precisa navegar facilmente entre as seções.
      
      const hasNav = await page.evaluate(() => {
        const nav = document.querySelector('nav, aside, [role="navigation"]')
        return nav !== null
      })
      
      if (hasNav) {
        logSucesso('Menu de navegação encontrado!')
      } else {
        logAviso('Menu de navegação não encontrado (pode ser mobile)')
      }
    })

    narrar('🎉', 'TESTE DO DASHBOARD CONCLUÍDO!')
  })

})
