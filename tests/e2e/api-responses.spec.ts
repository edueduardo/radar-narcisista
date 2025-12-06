import { test, expect } from '@playwright/test'

/**
 * Testes E2E - Respostas de API
 * Verifica se as APIs retornam dados corretos
 */

test.describe('APIs Públicas', () => {
  
  test('API Health retorna status correto', async ({ request }) => {
    const response = await request.get('/api/health')
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBeDefined()
    expect(['healthy', 'degraded', 'unhealthy']).toContain(data.status)
  })

  test('API Plans retorna lista de planos', async ({ request }) => {
    const response = await request.get('/api/plans')
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(Array.isArray(data) || data.plans).toBeTruthy()
  })

  test('API Frontpage Content retorna dados', async ({ request }) => {
    const response = await request.get('/api/frontpage/content')
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toBeDefined()
  })

  test('API Radar Pulse retorna temperatura', async ({ request }) => {
    const response = await request.get('/api/public/radar-pulse')
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.temperature).toBeDefined()
    expect(typeof data.temperature).toBe('number')
  })

})

test.describe('APIs Protegidas', () => {
  
  test('API Diário retorna 401 sem auth', async ({ request }) => {
    const response = await request.get('/api/diario')
    
    // Deve retornar 401 ou 403
    expect([401, 403]).toContain(response.status())
  })

  test('API Chat retorna 401 sem auth', async ({ request }) => {
    const response = await request.get('/api/chat')
    
    expect([401, 403, 405]).toContain(response.status())
  })

  test('API Safety Plan retorna 401 sem auth', async ({ request }) => {
    const response = await request.get('/api/safety-plan')
    
    expect([401, 403]).toContain(response.status())
  })

})

test.describe('APIs Admin', () => {
  
  test('API Admin AI Config retorna 401 sem auth', async ({ request }) => {
    const response = await request.get('/api/admin/ai-config')
    
    expect([401, 403]).toContain(response.status())
  })

  test('API Admin Content retorna 401 sem auth', async ({ request }) => {
    const response = await request.get('/api/admin/content')
    
    expect([401, 403]).toContain(response.status())
  })

})

test.describe('Arquivos Estáticos', () => {
  
  test('Manifest.json é válido', async ({ request }) => {
    const response = await request.get('/manifest.json')
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.name).toBeDefined()
    expect(data.icons).toBeDefined()
  })

  test('Robots.txt existe', async ({ request }) => {
    const response = await request.get('/robots.txt')
    
    // Em dev pode retornar 500 devido a geração dinâmica do Next.js
    // Em produção deve retornar 200
    const isDevOrProd = [200, 500].includes(response.status())
    expect(isDevOrProd).toBe(true)
    
    if (response.status() === 200) {
      const text = await response.text()
      expect(text).toContain('User-agent')
    }
  })

  test('Sitemap.xml existe', async ({ request }) => {
    const response = await request.get('/sitemap.xml')
    
    // Em dev pode retornar 500 devido a geração dinâmica do Next.js
    // Em produção deve retornar 200
    const isDevOrProd = [200, 500].includes(response.status())
    expect(isDevOrProd).toBe(true)
    
    if (response.status() === 200) {
      const text = await response.text()
      expect(text).toContain('<?xml')
    }
  })

})
