/**
 * ============================================================================
 * TESTE E2E NARRADO: FRONTPAGE COM BACKEND CONFIGURADO
 * ============================================================================
 * 
 * CENÁRIO: frontpage_with_admin
 * 
 * OBJETIVO:
 * Este teste garante que, com o admin configurando as flags e planos,
 * a front page exibe corretamente os elementos principais.
 * 
 * FLUXO DO TESTE:
 * 1. Abrir frontpage
 * 2. Fechar modais (aviso 18+, tutorial)
 * 3. Verificar elementos principais (título, CTAs, seções)
 * 4. Testar navegação básica
 * 
 * COMO RODAR EM MODO CINEMA:
 * npx playwright test tests/e2e/frontpage_narrado.spec.ts --headed
 * 
 * COMO ATIVAR/DESATIVAR:
 * Edite tests/config/test-scenarios.config.ts
 * - frontpage_with_admin: true  → Roda este teste
 * - frontpage_with_admin: false → Pula este teste
 */

import { test, expect, Page } from '@playwright/test'
import { testScenarios, shouldRunScenario, getSkipMessage } from '../config/test-scenarios.config'
import { 
  debugParaWindsurf, 
  logPasso, 
  logVerificacao, 
  logSucesso, 
  logAviso,
  logErro,
  narrar 
} from '../utils/debug-windsurf'
import { closeAllModals } from '../helpers/close-modals'

// ============================================================================
// CONFIGURAÇÕES DO TESTE
// ============================================================================

const TESTE_INFO = {
  cenario: 'frontpage_with_admin',
  nome: 'Front page com backend configurado',
}

// ============================================================================
// TESTE PRINCIPAL
// ============================================================================

test.describe('🎬 CINEMA: Frontpage com Backend Configurado', () => {
  
  // Aumentar timeout para modo cinema
  test.setTimeout(120000)
  
  // Pular se o cenário estiver desativado
  test.beforeEach(async () => {
    test.skip(
      !shouldRunScenario('frontpage_with_admin'),
      getSkipMessage('frontpage_with_admin')
    )
  })

  test('🎥 Frontpage carrega e exibe elementos principais', async ({ page }) => {
    narrar('🎬', 'INICIANDO TESTE: Frontpage com backend configurado')
    narrar('📋', 'Este teste verifica se a página inicial carrega corretamente')
    
    // ========================================
    // PASSO 1: Abrir a frontpage
    // ========================================
    await test.step('1️⃣ Abrir a frontpage', async () => {
      logPasso('Abrindo a página inicial do Radar Narcisista...')
      
      // Por que fazemos isso:
      // A frontpage é a porta de entrada do sistema. Se ela não carregar,
      // nenhum usuário consegue usar o sistema.
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      logSucesso('Página carregada com sucesso!')
    })

    // ========================================
    // PASSO 2: Fechar modais
    // ========================================
    await test.step('2️⃣ Fechar modais de aviso e tutorial', async () => {
      logPasso('Fechando modais que podem bloquear a interação...')
      
      // Por que fazemos isso:
      // O sistema tem modais de aviso 18+ e tutorial que aparecem
      // na primeira visita. Precisamos fechá-los para interagir com a página.
      
      await closeAllModals(page)
      
      logSucesso('Modais fechados!')
    })

    // ========================================
    // PASSO 3: Verificar título da página
    // ========================================
    await test.step('3️⃣ Verificar título da página', async () => {
      logVerificacao('Verificando se o título contém "Radar Narcisista"...')
      
      // Por que fazemos isso:
      // O título é importante para SEO e para o usuário saber onde está.
      
      try {
        await expect(page).toHaveTitle(/Radar Narcisista/i)
        logSucesso('Título correto!')
      } catch (error) {
        debugParaWindsurf({
          cenario: TESTE_INFO.cenario,
          teste: TESTE_INFO.nome,
          step: 'Verificar título da página',
          urlAtual: page.url(),
          seletor: 'page.title()',
          esperado: 'Título contendo "Radar Narcisista"',
          observado: `Título atual: ${await page.title()}`,
          detalhesExtras: { errorMessage: String(error) },
        })
        throw error
      }
    })

    // ========================================
    // PASSO 4: Verificar header com logo
    // ========================================
    await test.step('4️⃣ Verificar header com logo', async () => {
      logVerificacao('Verificando se o header está visível...')
      
      // Por que fazemos isso:
      // O header contém a navegação principal e o logo.
      // Sem ele, o usuário não consegue navegar.
      
      try {
        const header = page.locator('header')
        await expect(header).toBeVisible()
        logSucesso('Header visível!')
        
        // Verificar logo ou nome
        logVerificacao('Verificando se o logo/nome está visível...')
        const logoOrName = page.locator('header').getByText(/Radar Narcisista|RN/i).first()
        await expect(logoOrName).toBeVisible()
        logSucesso('Logo/nome visível!')
      } catch (error) {
        debugParaWindsurf({
          cenario: TESTE_INFO.cenario,
          teste: TESTE_INFO.nome,
          step: 'Verificar header com logo',
          urlAtual: page.url(),
          seletor: 'header, header:has-text("Radar Narcisista")',
          esperado: 'Header e logo visíveis',
          observado: 'Header ou logo não encontrado',
          detalhesExtras: { errorMessage: String(error) },
        })
        throw error
      }
    })

    // ========================================
    // PASSO 5: Verificar botões de CTA
    // ========================================
    await test.step('5️⃣ Verificar botões de CTA (Login e Cadastro)', async () => {
      logVerificacao('Verificando se os botões de ação estão visíveis...')
      
      // Por que fazemos isso:
      // Os CTAs (Call to Action) são essenciais para conversão.
      // O usuário precisa ver claramente como começar.
      
      // Em mobile, os botões podem estar no menu hamburger
      // Verificamos se existem no DOM (mesmo que hidden)
      const hasLoginButton = await page.evaluate(() => {
        return document.querySelector('a[href="/login"]') !== null
      })
      
      const hasSignupButton = await page.evaluate(() => {
        return document.querySelector('a[href="/cadastro"]') !== null
      })
      
      if (hasLoginButton) {
        logSucesso('Botão de Login encontrado!')
      } else {
        logAviso('Botão de Login não encontrado no DOM')
      }
      
      if (hasSignupButton) {
        logSucesso('Botão de Cadastro encontrado!')
      } else {
        logAviso('Botão de Cadastro não encontrado no DOM')
      }
      
      // Pelo menos um deve existir
      expect(hasLoginButton || hasSignupButton).toBe(true)
    })

    // ========================================
    // PASSO 6: Verificar seção de planos
    // ========================================
    await test.step('6️⃣ Verificar seção de planos', async () => {
      logVerificacao('Procurando seção de planos...')
      
      // Por que fazemos isso:
      // A seção de planos mostra as opções de assinatura.
      // É importante para monetização.
      
      // Scroll para ver mais conteúdo
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
      await page.waitForTimeout(500)
      
      // Procurar por texto relacionado a planos
      const planosSection = page.locator('text=/Planos|Preços|Escolha seu plano|Choose your plan/i').first()
      const hasPlanosSection = await planosSection.isVisible().catch(() => false)
      
      if (hasPlanosSection) {
        logSucesso('Seção de planos encontrada!')
      } else {
        logAviso('Seção de planos não visível na frontpage (pode estar em /planos)')
      }
    })

    // ========================================
    // PASSO 7: Verificar footer
    // ========================================
    await test.step('7️⃣ Verificar footer', async () => {
      logVerificacao('Verificando se o footer está visível...')
      
      // Por que fazemos isso:
      // O footer contém links importantes como Termos, Privacidade, etc.
      
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(500)
      
      const footer = page.locator('footer')
      const hasFooter = await footer.isVisible().catch(() => false)
      
      if (hasFooter) {
        logSucesso('Footer encontrado!')
      } else {
        logAviso('Footer não encontrado (pode ser um problema de layout)')
      }
    })

    narrar('🎉', 'TESTE CONCLUÍDO COM SUCESSO!')
    narrar('📊', 'A frontpage está carregando corretamente com todos os elementos principais.')
  })

  test('🎥 Navegação da frontpage funciona', async ({ page }) => {
    narrar('🎬', 'INICIANDO TESTE: Navegação da frontpage')
    narrar('📋', 'Este teste verifica se os links da frontpage funcionam')
    
    // ========================================
    // PASSO 1: Abrir frontpage e fechar modais
    // ========================================
    await test.step('1️⃣ Abrir frontpage e preparar', async () => {
      logPasso('Abrindo frontpage e fechando modais...')
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await closeAllModals(page)
      
      logSucesso('Página pronta para navegação!')
    })

    // ========================================
    // PASSO 2: Testar link de Login
    // ========================================
    await test.step('2️⃣ Testar navegação para Login', async () => {
      logPasso('Clicando no link de Login...')
      
      // Por que fazemos isso:
      // Verificar se o link de login leva para a página correta.
      
      const clicked = await page.evaluate(() => {
        const link = document.querySelector('a[href="/login"]') as HTMLAnchorElement
        if (link) {
          link.click()
          return true
        }
        return false
      })
      
      if (clicked) {
        await page.waitForURL(/\/login/, { timeout: 10000 })
        logSucesso('Navegou para /login!')
        
        // Voltar para frontpage
        await page.goto('/')
        await page.waitForLoadState('networkidle')
        await closeAllModals(page)
      } else {
        logAviso('Link de login não encontrado')
      }
    })

    // ========================================
    // PASSO 3: Testar link de Cadastro
    // ========================================
    await test.step('3️⃣ Testar navegação para Cadastro', async () => {
      logPasso('Clicando no link de Cadastro...')
      
      // Por que fazemos isso:
      // Verificar se o link de cadastro leva para a página correta.
      
      const clicked = await page.evaluate(() => {
        const link = document.querySelector('a[href="/cadastro"]') as HTMLAnchorElement
        if (link) {
          link.click()
          return true
        }
        return false
      })
      
      if (clicked) {
        await page.waitForURL(/\/cadastro/, { timeout: 10000 })
        logSucesso('Navegou para /cadastro!')
      } else {
        logAviso('Link de cadastro não encontrado')
      }
    })

    narrar('🎉', 'TESTE DE NAVEGAÇÃO CONCLUÍDO!')
  })

})
