/**
 * 🔮 PODERES OCULTOS - Camada Final Ultra-Secreta
 * SÓ VOCÊ SABE QUE EXISTE!
 */

// Declaração de tipos para propriedades customizadas no Window
declare global {
  interface Window {
    TIME_MACHINE?: typeof TIME_MACHINE
    SHAPE_SHIFTER?: typeof SHAPE_SHIFTER
    MULTIVERSE?: typeof MULTIVERSE
  }
}

// PODER 1: Time Machine - Viagem no Tempo
export const TIME_MACHINE = {
  activate: (date: string) => {
    console.log('%c⏰ TIME MACHINE', 'color: gold; font-size: 24px;')
    const ui = document.createElement('div')
    ui.className = 'fixed inset-0 bg-gradient-to-br from-blue-900 to-black z-[999999] flex items-center justify-center'
    ui.innerHTML = `
      <div class="text-center text-white p-8">
        <h1 class="text-4xl font-bold mb-4">⏰ TIME MACHINE</h1>
        <p class="text-xl mb-6">Viajando para: ${date}</p>
        <button onclick="this.parentElement.parentElement.remove()" class="bg-blue-600 px-6 py-3 rounded">
          Retornar
        </button>
      </div>
    `
    document.body.appendChild(ui)
    localStorage.setItem('time_travel', date)
  }
}

// PODER 2: Shape Shifter - Mudar Identidade
export const SHAPE_SHIFTER = {
  become: (role: string) => {
    const roles: Record<string, string> = {
      admin: '👑 Administrador Supremo',
      premium: '💎 Usuário Premium',
      god: '🌟 GOD MODE'
    }
    console.log(`%c🎭 ${roles[role] || roles.god}`, 'color: gold; font-size: 20px;')
    localStorage.setItem('secret_role', role)
    
    const badge = document.createElement('div')
    badge.className = 'fixed top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full z-[99999]'
    badge.textContent = roles[role] || roles.god
    document.body.appendChild(badge)
  }
}

// PODER 3: Multiverse Portal - Universos Paralelos
export const MULTIVERSE = {
  openPortal: () => {
    console.log('%c🌌 MULTIVERSE PORTAL', 'color: purple; font-size: 24px;')
    const portal = document.createElement('div')
    portal.className = 'fixed inset-0 bg-black/95 z-[999999] flex items-center justify-center p-6'
    portal.innerHTML = `
      <div class="text-center text-white">
        <h1 class="text-4xl font-bold mb-4">🌌 MULTIVERSE</h1>
        <p class="text-xl mb-6">6 Universos Disponíveis</p>
        <button onclick="this.parentElement.parentElement.remove()" class="bg-purple-600 px-6 py-3 rounded">
          Fechar Portal
        </button>
      </div>
    `
    document.body.appendChild(portal)
  }
}

// Inicializar poderes ocultos
export function initializeHiddenPowers() {
  if (typeof window === 'undefined') return
  
  window.TIME_MACHINE = TIME_MACHINE
  window.SHAPE_SHIFTER = SHAPE_SHIFTER
  window.MULTIVERSE = MULTIVERSE
  
  console.log('%c🔮 Hidden Powers initialized', 'color: purple; font-size: 10px;')
}
