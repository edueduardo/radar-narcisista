import { Page } from '@playwright/test'

/**
 * Fecha todos os modais que podem aparecer na página
 * - Modal de aviso 18+
 * - Tutorial de boas-vindas
 * - Notificações de social proof
 * - Termo de responsabilidade
 */
export async function closeAllModals(page: Page): Promise<void> {
  // Aguardar modais aparecerem
  await page.waitForTimeout(1500)
  
  // Fechar TODOS os modais via JavaScript (contorna problemas de overlay)
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button')
    buttons.forEach(btn => {
      const text = btn.textContent || ''
      const ariaLabel = btn.getAttribute('aria-label') || ''
      
      // Modal de aviso 18+
      if (text.includes('Entendi e Aceito')) {
        btn.click()
      }
      // Tutorial
      if (text.includes('Pular tutorial')) {
        btn.click()
      }
      // Fechar notificações
      if (text === 'Fechar' || ariaLabel === 'Fechar' || ariaLabel.toLowerCase().includes('close')) {
        btn.click()
      }
      // Termo de responsabilidade - aceitar todos os checkboxes primeiro
      if (text.includes('Li, entendi e aceito')) {
        // Marcar todos os checkboxes antes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]')
        checkboxes.forEach(cb => {
          if (!(cb as HTMLInputElement).checked) {
            (cb as HTMLInputElement).click()
          }
        })
        setTimeout(() => btn.click(), 100)
      }
    })
    
    // Fechar qualquer backdrop/overlay clicando nele
    const overlays = document.querySelectorAll('[class*="backdrop"], [class*="overlay"]')
    overlays.forEach(overlay => {
      if (overlay instanceof HTMLElement) {
        // Não clicar se for o conteúdo do modal
        if (!overlay.querySelector('button')) {
          overlay.click()
        }
      }
    })
  })
  
  // Aguardar animações
  await page.waitForTimeout(1000)
  
  // Segunda passada para garantir
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
}

/**
 * Navega para uma URL e fecha modais automaticamente
 */
export async function gotoAndCloseModals(page: Page, url: string): Promise<void> {
  await page.goto(url)
  await page.waitForLoadState('networkidle')
  await closeAllModals(page)
}
