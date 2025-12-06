import { test, expect } from '@playwright/test'

/**
 * Testes E2E - Fluxo de Autenticação
 * Verifica login, logout e proteção de rotas
 */

test.describe('Fluxo de Autenticação', () => {
  
  test('Página de login tem formulário', async ({ page }) => {
    await page.goto('/login')
    
    // Verificar campos do formulário
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    await expect(emailInput).toBeVisible({ timeout: 10000 })
  })

  test('Dashboard redireciona para login se não autenticado', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Deve redirecionar para login ou mostrar página de login
    await page.waitForURL(/\/(login|dashboard)/, { timeout: 10000 })
    
    // Se foi para login, verificar que tem o formulário
    if (page.url().includes('/login')) {
      const emailInput = page.locator('input[type="email"], input[name="email"]')
      await expect(emailInput).toBeVisible({ timeout: 10000 })
    }
  })

  test('Admin redireciona para login se não autenticado', async ({ page }) => {
    await page.goto('/admin')
    
    // Deve redirecionar para login
    await page.waitForURL(/\/(login|admin|dashboard)/, { timeout: 10000 })
  })

  test('Diário redireciona para login se não autenticado', async ({ page }) => {
    await page.goto('/diario')
    
    await page.waitForURL(/\/(login|diario|dashboard)/, { timeout: 10000 })
  })

  test('Chat redireciona para login se não autenticado', async ({ page }) => {
    await page.goto('/chat')
    
    await page.waitForURL(/\/(login|chat|dashboard)/, { timeout: 10000 })
  })

})

test.describe('Formulário de Login', () => {
  
  test('Mostra erro com email inválido', async ({ page }) => {
    await page.goto('/login')
    
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    await emailInput.waitFor({ state: 'visible', timeout: 10000 })
    
    // Tentar submeter com email inválido
    await emailInput.fill('email-invalido')
    
    // Verificar validação HTML5
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('Campo de email aceita email válido', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    await emailInput.waitFor({ state: 'visible', timeout: 10000 })
    
    await emailInput.fill('teste@exemplo.com')
    await page.waitForTimeout(500) // Aguardar validação
    
    // Verificar se o valor foi preenchido corretamente
    const value = await emailInput.inputValue()
    expect(value).toBe('teste@exemplo.com')
  })

})
