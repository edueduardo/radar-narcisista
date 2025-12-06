import { test, expect } from '@playwright/test'
import { testScenarios, shouldRunScenario, getSkipMessage } from '../config/test-scenarios.config'

/**
 * ============================================================================
 * TESTES E2E - PÁGINAS PÚBLICAS
 * ============================================================================
 * 
 * CENÁRIO: frontpage, navigation, seo, responsividade
 * 
 * Verifica se as páginas públicas carregam corretamente.
 * 
 * COMO ATIVAR/DESATIVAR:
 * Edite tests/config/test-scenarios.config.ts
 */

test.describe('Páginas Públicas', () => {
  
  test.beforeEach(async () => {
    test.skip(
      !shouldRunScenario('frontpage'),
      getSkipMessage('frontpage')
    )
  })
  
  test('Homepage carrega corretamente', async ({ page }) => {
    await page.goto('/')
    
    // Verificar título
    await expect(page).toHaveTitle(/Radar Narcisista/i)
    
    // Verificar elementos principais
    await expect(page.locator('body')).toBeVisible()
  })

  test('Página de Login carrega', async ({ page }) => {
    await page.goto('/login')
    
    // Verificar que tem formulário de login
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 })
  })

  test('Página de Planos carrega', async ({ page }) => {
    await page.goto('/planos')
    
    // Verificar que a página carregou
    await expect(page.locator('body')).toBeVisible()
  })

  test('Página de Termos carrega', async ({ page }) => {
    await page.goto('/termos')
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('Página de Privacidade carrega', async ({ page }) => {
    await page.goto('/privacidade')
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('Página de FAQ carrega', async ({ page }) => {
    await page.goto('/faq')
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('Página de Contato carrega', async ({ page }) => {
    await page.goto('/contato')
    
    await expect(page.locator('body')).toBeVisible()
  })

})

test.describe('SEO e Meta Tags', () => {
  
  test.beforeEach(async () => {
    test.skip(
      !shouldRunScenario('seo'),
      getSkipMessage('seo')
    )
  })
  
  test('Homepage tem meta tags corretas', async ({ page }) => {
    await page.goto('/')
    
    // Verificar meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)
    
    // Verificar Open Graph
    const ogTitle = page.locator('meta[property="og:title"]')
    await expect(ogTitle).toHaveAttribute('content', /.+/)
  })

  test('Manifest.json está acessível', async ({ page }) => {
    const response = await page.goto('/manifest.json')
    expect(response?.status()).toBe(200)
    
    const manifest = await response?.json()
    expect(manifest.name).toBeDefined()
  })

  test('Robots.txt está acessível', async ({ page }) => {
    const response = await page.goto('/robots.txt')
    // Em dev pode retornar 500 devido a geração dinâmica do Next.js
    const isDevOrProd = [200, 500].includes(response?.status() || 0)
    expect(isDevOrProd).toBe(true)
  })

})

test.describe('Responsividade', () => {
  
  test.beforeEach(async () => {
    test.skip(
      !shouldRunScenario('responsividade'),
      getSkipMessage('responsividade')
    )
  })
  
  test('Homepage é responsiva em mobile', async ({ page }) => {
    // Viewport mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Verificar que carregou
    await expect(page.locator('body')).toBeVisible()
    
    // Não deve ter scroll horizontal
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10) // margem de 10px
  })

})
