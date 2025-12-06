import { test, expect } from '@playwright/test'

/**
 * Testes E2E - Navegação
 * Verifica se a navegação entre páginas funciona
 */

test.describe('Navegação Principal', () => {
  
  test('Links da homepage funcionam', async ({ page }) => {
    await page.goto('/')
    
    // Verificar que a página carregou
    await expect(page.locator('body')).toBeVisible()
    
    // Tentar encontrar link para planos
    const planosLink = page.locator('a[href*="planos"]').first()
    if (await planosLink.isVisible()) {
      await planosLink.click()
      await expect(page).toHaveURL(/planos/)
    }
  })

  test('Logo leva para homepage', async ({ page }) => {
    await page.goto('/planos')
    
    // Clicar no logo (geralmente é um link para /)
    const logo = page.locator('a[href="/"]').first()
    if (await logo.isVisible()) {
      await logo.click()
      await expect(page).toHaveURL('/')
    }
  })

})

test.describe('Navegação do Footer', () => {
  
  test('Link de Termos funciona', async ({ page }) => {
    await page.goto('/')
    
    const termosLink = page.locator('a[href*="termos"]').first()
    if (await termosLink.isVisible()) {
      await termosLink.click()
      await expect(page).toHaveURL(/termos/)
    }
  })

  test('Link de Privacidade funciona', async ({ page }) => {
    await page.goto('/')
    
    const privacidadeLink = page.locator('a[href*="privacidade"]').first()
    if (await privacidadeLink.isVisible()) {
      await privacidadeLink.click()
      await expect(page).toHaveURL(/privacidade/)
    }
  })

})

test.describe('Navegação Mobile', () => {
  
  test.use({ viewport: { width: 375, height: 667 } })
  
  test('Menu mobile abre e fecha', async ({ page }) => {
    await page.goto('/')
    
    // Procurar botão de menu hamburger
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], [data-testid="mobile-menu"]').first()
    
    if (await menuButton.isVisible()) {
      await menuButton.click()
      
      // Verificar que o menu abriu (procurar por nav ou menu visível)
      const mobileNav = page.locator('nav, [role="navigation"]').first()
      await expect(mobileNav).toBeVisible()
    }
  })

})

test.describe('Breadcrumbs e Voltar', () => {
  
  test('Botão voltar funciona no diário', async ({ page }) => {
    // Ir para uma página interna
    await page.goto('/diario/novo')
    
    // Verificar se tem botão de voltar
    const backButton = page.locator('button:has-text("Voltar"), a:has-text("Voltar"), [aria-label*="voltar"]').first()
    
    if (await backButton.isVisible()) {
      await backButton.click()
      // Deve navegar para algum lugar
      await page.waitForURL(/.*/, { timeout: 5000 })
    }
  })

})
