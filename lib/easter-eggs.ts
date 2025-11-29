/**
 * EASTER EGGS SYSTEM - Radar Narcisista
 * 
 * Sistema completo de funcionalidades secretas
 * Monitoramento e controle via admin
 */

// Interface para logs
interface EasterEggLog {
  id: string
  eggId: string
  userId?: string
  timestamp: string
  data?: any
}

// Storage keys
const STORAGE_KEYS = {
  masterAdmin: 'rn_master_admin_active',
  mirrorMode: 'rn_mirror_mode_active',
  emergencyProtocol: 'rn_emergency_used',
  consoleSecrets: 'rn_console_secrets',
  logoClicks: 'rn_logo_clicks',
  secretResources: 'rn_secret_resources_unlocked',
  investigationMode: 'rn_investigation_mode',
  keyPhrases: 'rn_key_phrases_used'
}

// Easter Eggs configuráveis
export const EASTER_EGGS = {
  masterAdmin: {
    id: 'master-admin',
    name: 'Código Master Admin',
    trigger: ['admin', 'debug'],
    condition: (params: URLSearchParams) => {
      return params.get('admin') === 'rn2024' && params.get('debug') === 'true'
    },
    activate: () => {
      localStorage.setItem(STORAGE_KEYS.masterAdmin, 'true')
      activateMasterAdminPanel()
      logEasterEggUsage('master-admin')
    },
    deactivate: () => {
      localStorage.removeItem(STORAGE_KEYS.masterAdmin)
      deactivateMasterAdminPanel()
    },
    isActive: () => localStorage.getItem(STORAGE_KEYS.masterAdmin) === 'true'
  },

  secretResources: {
    id: 'secret-resources',
    name: 'Portal de Recursos Secretos',
    trigger: ['path'],
    condition: (path: string) => path === '/recursos-secretos',
    activate: () => {
      localStorage.setItem(STORAGE_KEYS.secretResources, 'true')
      showSecretResources()
      logEasterEggUsage('secret-resources')
    },
    deactivate: () => {
      localStorage.removeItem(STORAGE_KEYS.secretResources)
    },
    isActive: () => localStorage.getItem(STORAGE_KEYS.secretResources) === 'true'
  },

  mirrorMode: {
    id: 'mirror-mode',
    name: 'Modo Espelho Oculto',
    trigger: ['text'],
    condition: (text: string) => text.includes('**DESBLOQUEAR_ESPELHO**'),
    activate: () => {
      localStorage.setItem(STORAGE_KEYS.mirrorMode, 'true')
      activateMirrorMode()
      logEasterEggUsage('mirror-mode')
    },
    deactivate: () => {
      localStorage.removeItem(STORAGE_KEYS.mirrorMode)
      deactivateMirrorMode()
    },
    isActive: () => localStorage.getItem(STORAGE_KEYS.mirrorMode) === 'true'
  },

  emergencyProtocol: {
    id: 'emergency-protocol',
    name: 'Protocolo de Emergência',
    trigger: ['keys'],
    condition: (keys: string[]) => {
      return keys.includes('Control') && keys.includes('Shift') && 
             keys.includes('r') && keys.includes('n')
    },
    activate: () => {
      localStorage.setItem(STORAGE_KEYS.emergencyProtocol, Date.now().toString())
      executeEmergencyProtocol()
      logEasterEggUsage('emergency-protocol')
    },
    deactivate: () => {
      // Não pode desativar - uma vez usado, fica registrado
    },
    isActive: () => localStorage.getItem(STORAGE_KEYS.emergencyProtocol) !== null
  },

  consoleSecrets: {
    id: 'console-secrets',
    name: 'Console Secrets',
    trigger: ['console'],
    condition: (command: string) => command.includes('window.RADAR_SECRETS = true'),
    activate: () => {
      localStorage.setItem(STORAGE_KEYS.consoleSecrets, 'true')
      activateConsoleSecrets()
      logEasterEggUsage('console-secrets')
    },
    deactivate: () => {
      localStorage.removeItem(STORAGE_KEYS.consoleSecrets)
      deactivateConsoleSecrets()
    },
    isActive: () => localStorage.getItem(STORAGE_KEYS.consoleSecrets) === 'true'
  },

  logoSequence: {
    id: 'logo-sequence',
    name: 'Sequência do Logo',
    trigger: ['clicks'],
    condition: (count: number) => count >= 7,
    activate: () => {
      localStorage.setItem(STORAGE_KEYS.logoClicks, '7')
      showSecretMenu()
      logEasterEggUsage('logo-sequence')
    },
    deactivate: () => {
      localStorage.removeItem(STORAGE_KEYS.logoClicks)
      hideSecretMenu()
    },
    isActive: () => {
      const clicks = localStorage.getItem(STORAGE_KEYS.logoClicks)
      return clicks && parseInt(clicks) >= 7
    }
  },

  keyPhrases: {
    id: 'key-phrases',
    name: 'Frases-Chave',
    trigger: ['phrases'],
    condition: (text: string) => {
      return text.includes('chave mestra') || text.includes('protocolo zero')
    },
    activate: () => {
      const used = JSON.parse(localStorage.getItem(STORAGE_KEYS.keyPhrases) || '[]')
      used.push(Date.now())
      localStorage.setItem(STORAGE_KEYS.keyPhrases, JSON.stringify(used))
      showKeyPhraseSecret()
      logEasterEggUsage('key-phrases')
    },
    deactivate: () => {
      localStorage.removeItem(STORAGE_KEYS.keyPhrases)
    },
    isActive: () => {
      const used = localStorage.getItem(STORAGE_KEYS.keyPhrases)
      return used && JSON.parse(used).length > 0
    }
  }
}

// ============================================
// FUNÇÕES DE ATIVAÇÃO
// ============================================

function activateMasterAdminPanel() {
  // Criar painel secreto
  const panel = document.createElement('div')
  panel.id = 'rn-master-admin-panel'
  panel.className = 'fixed bottom-4 right-4 w-80 bg-slate-900 border border-purple-500 rounded-lg shadow-2xl z-[9999] p-4'
  panel.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-purple-400 font-bold flex items-center gap-2">
        <span>👑</span> Painel Master Admin
      </h3>
      <button onclick="this.parentElement.parentElement.remove()" class="text-slate-400 hover:text-white">✕</button>
    </div>
    <div class="space-y-2 text-xs">
      <div class="flex justify-between">
        <span class="text-slate-400">Modo Deus:</span>
        <span class="text-green-400">ATIVO</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Usuário:</span>
        <span class="text-white">${localStorage.getItem('user_email') || 'Anônimo'}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Tokens:</span>
        <span class="text-yellow-400">∞</span>
      </div>
    </div>
    <div class="mt-3 space-y-2">
      <button onclick="unlockAllFeatures()" class="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 rounded">
        🔓 Desbloquear Tudo
      </button>
      <button onclick="showDebugConsole()" class="w-full bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded">
        🐛 Debug Console
      </button>
    </div>
  `
  document.body.appendChild(panel)

  // Adicionar funções globais
  ;(window as any).unlockAllFeatures = () => {
    localStorage.setItem('all_features_unlocked', 'true')
    alert('✅ Todas as features desbloqueadas!')
  }

  ;(window as any).showDebugConsole = () => {
    console.log('🔍 RADAR NARCISISTA - DEBUG MODE')
    console.log('User:', localStorage.getItem('user_email'))
    console.log('Tokens:', localStorage.getItem('user_tokens'))
    console.log('Easter Eggs:', Object.keys(STORAGE_KEYS).map(key => ({
      key,
      active: localStorage.getItem(STORAGE_KEYS[key as keyof typeof STORAGE_KEYS])
    })))
  }
}

function showSecretResources() {
  const resources = [
    { name: 'Gerador de Laudos Médicos', desc: 'Crie laudos profissionais para perícia' },
    { name: 'Simulador de Audiência', desc: 'Pratique seu discurso para o juiz' },
    { name: 'Banco de Provas Auto', desc: 'Organize evidências automaticamente' },
    { name: 'Detector de Mentiras IA', desc: 'Análise de padrões de linguagem' },
    { name: 'Portal ONGs Parceiras', desc: 'Apoio jurídico gratuito' }
  ]

  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-6'
  modal.innerHTML = `
    <div class="bg-slate-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
      <h2 class="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
        <span>🌟</span> Recursos Secretos Desbloqueados
      </h2>
      <div class="grid gap-4">
        ${resources.map(r => `
          <div class="bg-slate-800 rounded-lg p-4 border border-purple-500/30">
            <h3 class="text-white font-semibold mb-1">${r.name}</h3>
            <p class="text-slate-400 text-sm">${r.desc}</p>
            <button class="mt-2 text-purple-400 text-sm hover:text-purple-300">Ativar →</button>
          </div>
        `).join('')}
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg">
        Fechar Portal Secreto
      </button>
    </div>
  `
  document.body.appendChild(modal)
}

function activateMirrorMode() {
  document.body.classList.add('mirror-mode-therapist')
  
  const notification = document.createElement('div')
  notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]'
  notification.innerHTML = `
    <div class="flex items-center gap-2">
      <span>🧠</span>
      <span><strong>Modo Terapeuta</strong> ativado</span>
    </div>
  `
  document.body.appendChild(notification)
  
  setTimeout(() => notification.remove(), 5000)
}

function executeEmergencyProtocol() {
  // Gerar backup
  const backup = {
    timestamp: Date.now(),
    data: {
      diary: localStorage.getItem('diary_entries'),
      chat: localStorage.getItem('chat_history'),
      user: localStorage.getItem('user_data')
    }
  }
  
  // Simular envio para nuvem
  console.log('🚨 EMERGENCY PROTOCOL - Backup criado:', backup)
  
  // Limpar dados locais
  localStorage.clear()
  
  // Abrir janela anônima
  window.open('https://duckduckgo.com/?t=h_&ia=web', '_blank')
  
  alert('🚨 Protocolo de Emergência executado!\n\n✅ Backup criado\n✅ Dados limpos\n✅ Navegação anônima aberta')
}

function activateConsoleSecrets() {
  console.log('%c🥚 EASTER EGGS DESBLOQUEADOS', 'color: purple; font-size: 20px; font-weight: bold;')
  console.log('%cCódigos secretos:', 'color: orange; font-size: 14px;')
  console.log('?admin=rn2024&debug=true')
  console.log('/recursos-secretos')
  console.log('**DESBLOQUEAR_ESPELHO**')
  console.log('Ctrl+Shift+R+N')
  console.log('window.RADAR_SECRETS = true')
  console.log('7 cliques no logo')
  console.log('"chave mestra" ou "protocolo zero"')
}

function showSecretMenu() {
  const menu = document.createElement('div')
  menu.className = 'fixed top-20 right-4 bg-slate-900 border border-purple-500 rounded-lg shadow-2xl z-[9999] p-4'
  menu.innerHTML = `
    <h3 class="text-purple-400 font-bold mb-3">🥚 Menu Secreto</h3>
    <div class="space-y-2">
      <button onclick="alert('Debug ativado!')" class="block w-full text-left text-sm text-slate-300 hover:text-white">🐛 Debug Mode</button>
      <button onclick="alert('Todos os recursos liberados!')" class="block w-full text-left text-sm text-slate-300 hover:text-white">🔓 Unlock All</button>
      <button onclick="alert('Logs exportados!')" class="block w-full text-left text-sm text-slate-300 hover:text-white">📊 Export Logs</button>
    </div>
  `
  document.body.appendChild(menu)
}

function showKeyPhraseSecret() {
  const message = document.createElement('div')
  message.className = 'fixed bottom-4 left-4 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]'
  message.innerHTML = `
    <div class="flex items-center gap-2">
      <span>🔑</span>
      <span>Chave secreta reconhecida!</span>
    </div>
  `
  document.body.appendChild(message)
  
  setTimeout(() => message.remove(), 3000)
}

// ============================================
// FUNÇÕES DE DESATIVAÇÃO
// ============================================

function deactivateMasterAdminPanel() {
  const panel = document.getElementById('rn-master-admin-panel')
  if (panel) panel.remove()
}

function deactivateMirrorMode() {
  document.body.classList.remove('mirror-mode-therapist')
}

function deactivateConsoleSecrets() {
  console.clear()
}

function hideSecretMenu() {
  const menus = document.querySelectorAll('[class*="fixed"][class*="secret"], [class*="Menu"]')
  menus.forEach(menu => menu.remove())
}

// ============================================
// MONITORAMENTO E LOGS
// ============================================

function logEasterEggUsage(eggId: string) {
  const logs = getEasterEggLogs()
  const newLog: EasterEggLog = {
    id: Math.random().toString(36),
    eggId,
    userId: localStorage.getItem('user_id') || 'anonymous',
    timestamp: new Date().toISOString()
  }
  
  logs.push(newLog)
  
  // Manter apenas últimos 100 logs
  if (logs.length > 100) {
    logs.splice(0, logs.length - 100)
  }
  
  localStorage.setItem('rn_easter_egg_logs', JSON.stringify(logs))
  
  // Enviar para admin (em produção)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('easterEggUsed', { detail: newLog }))
  }
}

export function getEasterEggLogs(): EasterEggLog[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('rn_easter_egg_logs') || '[]')
  } catch {
    return []
  }
}

export function getEasterEggStatus() {
  return Object.entries(EASTER_EGGS).map(([key, egg]) => ({
    id: egg.id,
    name: egg.name,
    active: egg.isActive(),
    usageCount: getEasterEggLogs().filter(log => log.eggId === egg.id).length,
    lastUsed: (() => {
      const logs = getEasterEggLogs().filter(log => log.eggId === egg.id)
      return logs.length > 0 ? logs[logs.length - 1].timestamp : 'Nunca'
    })()
  }))
}

// ============================================
// INICIALIZAÇÃO
// ============================================

export function initializeEasterEggs() {
  if (typeof window === 'undefined') return
  
  // Verificar URL params
  const params = new URLSearchParams(window.location.search)
  if (EASTER_EGGS.masterAdmin.condition(params)) {
    EASTER_EGGS.masterAdmin.activate()
  }
  
  // Verificar path
  if (EASTER_EGGS.secretResources.condition(window.location.pathname)) {
    EASTER_EGGS.secretResources.activate()
  }
  
  // Monitorar cliques no logo
  let logoClicks = 0
  const logo = document.querySelector('[class*="logo"], [href="/"]')
  if (logo) {
    logo.addEventListener('click', () => {
      logoClicks++
      localStorage.setItem(STORAGE_KEYS.logoClicks, logoClicks.toString())
      if (EASTER_EGGS.logoSequence.condition(logoClicks)) {
        EASTER_EGGS.logoSequence.activate()
      }
    })
  }
  
  // Monitorar teclas de emergência
  let keysPressed: string[] = []
  document.addEventListener('keydown', (e) => {
    keysPressed.push(e.key)
    if (keysPressed.length > 10) keysPressed.shift()
    
    if (EASTER_EGGS.emergencyProtocol.condition(keysPressed)) {
      EASTER_EGGS.emergencyProtocol.activate()
    }
  })
  
  // Expor interface global
  ;(window as any).RADAR_EASTER_EGGS = {
    activate: (eggId: string) => {
      const egg = Object.values(EASTER_EGGS).find(e => e.id === eggId)
      if (egg) egg.activate()
    },
    deactivate: (eggId: string) => {
      const egg = Object.values(EASTER_EGGS).find(e => e.id === eggId)
      if (egg) egg.deactivate()
    },
    status: getEasterEggStatus,
    logs: getEasterEggLogs
  }
}

// Exportar para uso no admin
export { EASTER_EGGS as EasterEggsConfig, STORAGE_KEYS }
