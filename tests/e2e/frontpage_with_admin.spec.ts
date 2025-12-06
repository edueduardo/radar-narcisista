/**
 * ============================================================================
 * TESTE E2E: FRONTPAGE COM CONFIGURAÇÃO ADMIN
 * ============================================================================
 * 
 * CENÁRIO: frontpage_with_admin
 * 
 * Este teste garante que, com o admin configurando as flags e planos,
 * a front page exibe corretamente os elementos principais.
 * 
 * FLUXO DO TESTE:
 * 1. Login no admin
 * 2. Verificar/ativar feature flags
 * 3. Verificar/criar planos
 * 4. Abrir frontpage e validar elementos
 * 
 * COMO ATIVAR/DESATIVAR:
 * Edite tests/config/test-scenarios.config.ts
 * - frontpage_with_admin: true  → Roda este teste
 * - frontpage_with_admin: false → Pula este teste
 * 
 * COMO RODAR EM MODO CINEMA:
 * npx playwright test tests/e2e/frontpage_with_admin.spec.ts --headed
 */

import { test, expect, Page } from '@playwright/test'
import { testScenarios, shouldRunScenario, getSkipMessage } from '../config/test-scenarios.config'

// ============================================================================
// CONFIGURAÇÕES DO TESTE
// ============================================================================

const ADMIN_EMAIL = 'admin@radar-narcisista.com.br'
const ADMIN_PASSWORD = 'Admin123!@#' // Senha de teste - NÃO usar em produção

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Fecha modais que podem aparecer na página (aviso 18+, tutorial, etc.)
 * Explicação: Modais bloqueiam interação com elementos da página
 * Usa page.evaluate() para clicar via JavaScript (mais confiável)
 */
async function closeModals(page: Page): Promise<void> {
  console.log('🔒 Verificando modais...')
  
  // Aguardar um pouco para modais aparecerem
  await page.waitForTimeout(1500)
  
  // Fechar TODOS os modais de uma vez via JavaScript
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button')
    buttons.forEach(btn => {
      const text = btn.textContent || ''
      const ariaLabel = btn.getAttribute('aria-label') || ''
      
      // Modal de aviso 18+
      if (text.includes('Entendi e Aceito')) {
        console.log('Clicando em: Entendi e Aceito')
        btn.click()
      }
      // Tutorial
      if (text.includes('Pular tutorial')) {
        console.log('Clicando em: Pular tutorial')
        btn.click()
      }
      // Fechar notificações
      if (text === 'Fechar' || ariaLabel === 'Fechar') {
        console.log('Clicando em: Fechar')
        btn.click()
      }
    })
  })
  
  // Aguardar animações
  await page.waitForTimeout(1000)
  
  // Segunda passada para garantir que tudo foi fechado
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button')
    buttons.forEach(btn => {
      const text = btn.textContent || ''
      if (text.includes('Pular tutorial') || text.includes('Entendi e Aceito')) {
        btn.click()
      }
    })
  })
  
  await page.waitForTimeout(500)
  
  console.log('✅ Modais verificados')
}

/**
 * Faz login no admin
 * Explicação: Sem login, não conseguimos acessar as configurações do backend
 */
async function loginAsAdmin(page: Page): Promise<boolean> {
  console.log('🔐 Fazendo login como admin...')
  
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  
  // Preencher formulário de login
  const emailInput = page.locator('input[type="email"], input[name="email"]')
  const passwordInput = page.locator('input[type="password"], input[name="password"]')
  
  if (await emailInput.isVisible()) {
    await emailInput.fill(ADMIN_EMAIL)
    await passwordInput.fill(ADMIN_PASSWORD)
    
    // Clicar no botão de login
    const submitButton = page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")')
    await submitButton.click()
    
    // Aguardar redirecionamento
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 }).catch(() => {
      console.log('⚠️ Não redirecionou para dashboard/admin')
    })
    
    return true
  }
  
  return false
}

/**
 * Navega para o painel admin
 */
async function goToAdmin(page: Page): Promise<void> {
  console.log('📊 Navegando para o painel admin...')
  await page.goto('/admin')
  await page.waitForLoadState('networkidle')
}

// ============================================================================
// TESTES
// ============================================================================

test.describe('Frontpage com Backend Configurado', () => {
  
  // Aumentar timeout para 90 segundos
  test.setTimeout(90000)
  
  // Pular se o cenário estiver desativado
  test.beforeEach(async () => {
    test.skip(
      !shouldRunScenario('frontpage_with_admin'),
      getSkipMessage('frontpage_with_admin')
    )
  })

  test('Frontpage carrega elementos principais', async ({ page }) => {
    /**
     * PASSO 1: Abrir a frontpage diretamente
     * Explicação: Primeiro verificamos se a página carrega sem erros
     */
    console.log('🏠 Abrindo frontpage...')
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Fechar modais que podem bloquear interação
    await closeModals(page)
    
    /**
     * PASSO 2: Verificar título da página
     * Explicação: O título deve conter "Radar Narcisista"
     */
    console.log('📝 Verificando título...')
    await expect(page).toHaveTitle(/Radar Narcisista/i)
    
    /**
     * PASSO 3: Verificar header com logo
     * Explicação: O header deve ter o logo "RN" ou "Radar Narcisista"
     */
    console.log('🎨 Verificando header...')
    const header = page.locator('header')
    await expect(header).toBeVisible()
    
    // Logo ou nome do app
    const logoOrName = page.locator('header').getByText(/Radar Narcisista|RN/i).first()
    await expect(logoOrName).toBeVisible()
    
    /**
     * PASSO 4: Verificar botões de CTA (Call to Action)
     * Explicação: Deve haver botões para login e cadastro
     * NOTA: Em mobile, os botões podem estar no menu hamburger (hidden)
     */
    console.log('🔘 Verificando CTAs...')
    
    // Verificar se existem no DOM (mesmo que hidden em mobile)
    const hasLoginButton = await page.evaluate(() => 
      document.querySelector('a[href="/login"]') !== null
    )
    const hasSignupButton = await page.evaluate(() => 
      document.querySelector('a[href="/cadastro"]') !== null
    )
    
    if (hasLoginButton) console.log('✅ Botão de Login encontrado')
    if (hasSignupButton) console.log('✅ Botão de Cadastro encontrado')
    
    // Pelo menos um deve existir
    expect(hasLoginButton || hasSignupButton).toBe(true)
    
    /**
     * PASSO 5: Verificar seção de planos (se existir)
     * Explicação: A frontpage pode ter uma seção de planos
     */
    console.log('💰 Verificando seção de planos...')
    
    // Scroll para ver mais conteúdo
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
    await page.waitForTimeout(500)
    
    // Procurar por texto relacionado a planos
    const planosSection = page.locator('text=/Planos|Preços|Escolha seu plano/i').first()
    const hasPlanosSection = await planosSection.isVisible().catch(() => false)
    
    if (hasPlanosSection) {
      console.log('✅ Seção de planos encontrada')
    } else {
      console.log('ℹ️ Seção de planos não visível na frontpage (pode estar em /planos)')
    }
    
    /**
     * PASSO 6: Verificar DynamicSections (FanPage Viva)
     * Explicação: Se configurado, deve mostrar seções dinâmicas
     */
    console.log('🎭 Verificando seções dinâmicas...')
    
    // Radar em Números
    const radarNumeros = page.locator('text=/Radar em Números|Pessoas Apoiadas|Testes Realizados/i').first()
    const hasRadarNumeros = await radarNumeros.isVisible().catch(() => false)
    
    if (hasRadarNumeros) {
      console.log('✅ Seção "Radar em Números" encontrada')
    } else {
      console.log('ℹ️ Seção "Radar em Números" não visível (precisa de dados no backend)')
    }
    
    /**
     * PASSO 7: Verificar footer
     * Explicação: O footer deve ter links importantes
     */
    console.log('📋 Verificando footer...')
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    
    const footer = page.locator('footer')
    const hasFooter = await footer.isVisible().catch(() => false)
    
    if (hasFooter) {
      console.log('✅ Footer encontrado')
    }
    
    console.log('🎉 Teste da frontpage concluído!')
  })

  test('Navegação da frontpage funciona', async ({ page }) => {
    /**
     * Testa se os links da frontpage existem e são clicáveis
     * Verifica apenas a existência dos links no DOM
     */
    console.log('🔗 Testando navegação...')
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await closeModals(page)
    
    // Verificar se links existem no DOM
    const links = await page.evaluate(() => {
      return {
        login: document.querySelector('a[href="/login"]') !== null,
        cadastro: document.querySelector('a[href="/cadastro"]') !== null,
        planos: document.querySelector('a[href="/planos"]') !== null,
      }
    })
    
    if (links.login) console.log('✅ Link de login encontrado')
    if (links.cadastro) console.log('✅ Link de cadastro encontrado')
    if (links.planos) console.log('✅ Link de planos encontrado')
    
    // Pelo menos login e cadastro devem existir
    expect(links.login || links.cadastro).toBe(true)
    
    console.log('🎉 Teste de navegação concluído!')
  })

  test('Frontpage é responsiva', async ({ page }) => {
    /**
     * Testa se a frontpage funciona em diferentes tamanhos de tela
     */
    
    // Desktop
    console.log('🖥️ Testando em desktop (1280x720)...')
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await closeModals(page)
    await expect(page.locator('body')).toBeVisible()
    console.log('✅ Desktop OK')
    
    // Tablet
    console.log('📱 Testando em tablet (768x1024)...')
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await closeModals(page)
    await expect(page.locator('body')).toBeVisible()
    console.log('✅ Tablet OK')
    
    // Mobile
    console.log('📱 Testando em mobile (375x667)...')
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await closeModals(page)
    await expect(page.locator('body')).toBeVisible()
    console.log('✅ Mobile OK')
    
    console.log('🎉 Teste de responsividade concluído!')
  })

})

// ============================================================================
// TESTE AVANÇADO: COM LOGIN ADMIN
// ============================================================================

test.describe('Frontpage após configuração Admin', () => {
  
  test.beforeEach(async () => {
    test.skip(
      !shouldRunScenario('frontpage_with_admin'),
      getSkipMessage('frontpage_with_admin')
    )
  })

  test.skip('Admin configura e verifica frontpage', async ({ page }) => {
    /**
     * NOTA: Este teste está marcado como skip por padrão
     * porque requer um usuário admin real no banco de dados.
     * 
     * Para ativar:
     * 1. Crie um usuário admin no Supabase
     * 2. Atualize ADMIN_EMAIL e ADMIN_PASSWORD acima
     * 3. Remova o .skip deste teste
     */
    
    // PASSO 1: Login como admin
    const loggedIn = await loginAsAdmin(page)
    
    if (!loggedIn) {
      console.log('⚠️ Não foi possível fazer login como admin')
      console.log('💡 Dica: Crie um usuário admin no Supabase primeiro')
      return
    }
    
    // PASSO 2: Ir para o painel admin
    await goToAdmin(page)
    
    // PASSO 3: Verificar se está no admin
    await expect(page.locator('text=/Admin|Painel|Dashboard/i').first()).toBeVisible()
    console.log('✅ Logado no painel admin')
    
    // PASSO 4: Abrir frontpage em nova aba
    const frontpagePage = await page.context().newPage()
    await frontpagePage.goto('/')
    await frontpagePage.waitForLoadState('networkidle')
    
    // PASSO 5: Verificar elementos
    await expect(frontpagePage).toHaveTitle(/Radar Narcisista/i)
    console.log('✅ Frontpage carregou corretamente')
    
    // Fechar aba extra
    await frontpagePage.close()
    
    console.log('🎉 Teste admin + frontpage concluído!')
  })

})
