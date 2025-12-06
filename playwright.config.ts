import { defineConfig, devices } from '@playwright/test'

/**
 * Configuração do Playwright para testes E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Tempo máximo por teste */
  timeout: 30 * 1000,
  
  /* Tempo máximo para expect() */
  expect: {
    timeout: 5000
  },
  
  /* Rodar testes em paralelo */
  fullyParallel: true,
  
  /* Falhar o build se deixar test.only no código */
  forbidOnly: !!process.env.CI,
  
  /* Retry em CI */
  retries: process.env.CI ? 2 : 0,
  
  /* Workers */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter */
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  
  /* Configurações compartilhadas */
  use: {
    /* Base URL */
    baseURL: process.env.BASE_URL || 'https://radar-narcisista.vercel.app',
    
    /* Coletar trace em caso de falha */
    trace: 'on-first-retry',
    
    /* Screenshot em caso de falha */
    screenshot: 'only-on-failure',
    
    /* Video em caso de falha */
    video: 'on-first-retry',
  },

  /* Projetos para diferentes browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
})
