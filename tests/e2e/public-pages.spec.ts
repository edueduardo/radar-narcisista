import { test, expect } from '@playwright/test'

/**
 * Testes E2E - Páginas Públicas
 * Verifica se as páginas públicas carregam corretamente
 */

test.describe('Páginas Públicas', () => {
  
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
    expect(response?.status()).toBe(200)
  })

})

test.describe('Responsividade', () => {
  
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
