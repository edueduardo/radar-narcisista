import { defineConfig, devices } from '@playwright/test'

/**
 * ============================================================================
 * CONFIGURAÇÃO DO PLAYWRIGHT - RADAR NARCISISTA
 * ============================================================================
 * 
 * MODOS DE EXECUÇÃO:
 * 
 * 1. MODO CINEMA (navegador visível):
 *    npx playwright test --headed
 *    npx playwright test --ui
 * 
 * 2. MODO CI (headless):
 *    npx playwright test
 * 
 * 3. RODAR TESTE ESPECÍFICO:
 *    npx playwright test tests/e2e/frontpage_with_admin.spec.ts --headed
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Tempo máximo por teste */
  timeout: 60 * 1000, // 60 segundos para testes mais complexos
  
  /* Tempo máximo para expect() */
  expect: {
    timeout: 10000 // 10 segundos
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
    /* Base URL - usar localhost para desenvolvimento */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    /* MODO CINEMA: headless = false para ver o navegador */
    headless: process.env.CI ? true : false,
    
    /* Velocidade da execução (slow motion em ms) */
    launchOptions: {
      slowMo: process.env.CI ? 0 : 100, // 100ms entre ações no modo local
    },
    
    /* Coletar trace em caso de falha */
    trace: 'on-first-retry',
    
    /* Screenshot em caso de falha */
    screenshot: 'only-on-failure',
    
    /* Video em caso de falha */
    video: 'on-first-retry',
    
    /* Viewport padrão */
    viewport: { width: 1280, height: 720 },
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
  
  /* Servidor de desenvolvimento */
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120 * 1000, // 2 minutos para subir
  },
})
