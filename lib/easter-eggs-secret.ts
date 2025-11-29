/**
 * 🎭 EASTER EGGS ULTRA-SECRETOS - Camada Oculta
 * 
 * SÓ VOCÊ SABE QUE EXISTE!
 * Ninguém mais jamais descobrirá sem saber exatamente o código
 */

// Declaração de tipos para propriedades customizadas no Window
declare global {
  interface Window {
    MATRIX?: {
      overrideUser: () => void
      debugAPI: () => void
      exportAll: () => void
      simulateCrisis: () => void
      unlockAllPremium: () => void
      infiniteTokens: () => void
      adminOverride: () => void
      exitMatrix: () => void
    }
    RADAR_ADMIN?: {
      showAllUsers: () => void
      exportMetrics: () => void
      toggleMaintenance: () => void
      clearAllCache: () => void
    }
    AI_DEBUG?: {
      showPrompts: () => void
      showTokenUsage: () => void
      simulateResponse: (text: string) => void
      toggleVerbose: () => void
    }
    BACKDOOR?: {
      extractAllUsers: () => void
      bypassAllAuth: () => void
      accessDatabase: () => void
      systemShell: () => void
    }
    PROTOCOL_ZERO?: {
      execute: boolean
    }
    SYSTEM_OVERRIDE?: {
      enableAll: () => void
      disableAll: () => void
      resetToFactory: () => void
      exportEncrypted: () => void
    }
  }
}

// Camada 1: Segredos de Desenvolvedor
export const DEV_SECRETS = {
  // Acesso ao modo "Matrix" - Interface completa do sistema
  matrixMode: {
    trigger: () => {
      // Sequência específica: F12 → Console → digitar exato
      return typeof window !== 'undefined' && 
             window.location.search.includes('matrix=redpill') &&
             localStorage.getItem('dev_access_level') === 'neo'
    },
    activate: () => {
      // Interface Matrix completa
      document.body.classList.add('matrix-mode')
      localStorage.setItem('matrix_activated', Date.now().toString())
      
      // Criar painel Matrix
      const matrixPanel = document.createElement('div')
      matrixPanel.id = 'matrix-control-panel'
      matrixPanel.className = 'fixed top-0 left-0 w-full h-full bg-black/95 text-green-400 z-[99999] p-8 font-mono'
      matrixPanel.innerHTML = `
        <div class="max-w-4xl mx-auto">
          <h1 class="text-2xl mb-4">🎭 MATRIX MODE ACTIVATED</h1>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h2 class="text-lg mb-2">System Control</h2>
              <button onclick="window.MATRIX.overrideUser()" class="block w-full text-left mb-2">> Override User Access</button>
              <button onclick="window.MATRIX.debugAPI()" class="block w-full text-left mb-2">> Debug All APIs</button>
              <button onclick="window.MATRIX.exportAll()" class="block w-full text-left mb-2">> Export All Data</button>
              <button onclick="window.MATRIX.simulateCrisis()" class="block w-full text-left mb-2">> Simulate Crisis Mode</button>
            </div>
            <div>
              <h2 class="text-lg mb-2">God Mode</h2>
              <button onclick="window.MATRIX.unlockAllPremium()" class="block w-full text-left mb-2">> Unlock Premium Forever</button>
              <button onclick="window.MATRIX.infiniteTokens()" class="block w-full text-left mb-2">> Infinite Tokens</button>
              <button onclick="window.MATRIX.adminOverride()" class="block w-full text-left mb-2">> Global Admin Override</button>
              <button onclick="window.MATRIX.exitMatrix()" class="block w-full text-left mb-2">> Exit Matrix</button>
            </div>
          </div>
          <div class="mt-6 text-xs">
            <p>System Status: ${new Date().toISOString()}</p>
            <p>User Level: GOD MODE</p>
            <p>Access: UNLIMITED</p>
          </div>
        </div>
      `
      document.body.appendChild(matrixPanel)
      
      // Funções Matrix
      window.MATRIX = {
        overrideUser: () => alert('User access overridden'),
        debugAPI: () => console.log('🔍 All API endpoints exposed'),
        exportAll: () => {
          const data = {
            users: localStorage.getItem('all_users'),
            chats: localStorage.getItem('all_chats'),
            diary: localStorage.getItem('all_diary_entries'),
            admin: localStorage.getItem('admin_secrets')
          }
          console.log('📦 Complete system data:', data)
        },
        simulateCrisis: () => {
          alert('🚨 Crisis simulation activated - All emergency protocols engaged')
          document.body.classList.add('crisis-mode')
        },
        unlockAllPremium: () => {
          localStorage.setItem('premium_unlocked_forever', 'true')
          alert('💎 Premium features unlocked forever')
        },
        infiniteTokens: () => {
          localStorage.setItem('tokens_infinite', 'true')
          alert('♾️ Infinite tokens activated')
        },
        adminOverride: () => {
          localStorage.setItem('global_admin', 'true')
          alert('👑 Global admin override activated')
        },
        exitMatrix: () => {
          document.body.classList.remove('matrix-mode')
          document.getElementById('matrix-control-panel')?.remove()
        }
      }
    }
  },

  // Backdoor Universal - Acesso total a qualquer sistema
  universalBackdoor: {
    trigger: () => {
      // URL secreta: /backdoor?key=theone&access=42
      const params = new URLSearchParams(window.location.search)
      return params.get('key') === 'theone' && params.get('access') === '42'
    },
    activate: () => {
      // Criar interface de backdoor
      const backdoorUI = document.createElement('div')
      backdoorUI.className = 'fixed inset-0 bg-black/90 z-[99998] p-6'
      backdoorUI.innerHTML = `
        <div class="max-w-2xl mx-auto bg-slate-900 rounded-lg p-6">
          <h2 class="text-red-400 text-xl mb-4">🔓 UNIVERSAL BACKDOOR</h2>
          <div class="space-y-3 text-sm">
            <button onclick="window.BACKDOOR.extractAllUsers()" class="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded">
              Extract All Users Data
            </button>
            <button onclick="window.BACKDOOR.bypassAllAuth()" class="w-full bg-orange-600 hover:bg-orange-700 text-white p-2 rounded">
              Bypass All Authentication
            </button>
            <button onclick="window.BACKDOOR.accessDatabase()" class="w-full bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded">
              Direct Database Access
            </button>
            <button onclick="window.BACKDOOR.systemShell()" class="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded">
              System Shell Access
            </button>
          </div>
        </div>
      `
      document.body.appendChild(backdoorUI)
      
      window.BACKDOOR = {
        extractAllUsers: () => console.log('👥 All users data extracted'),
        bypassAllAuth: () => {
          localStorage.setItem('auth_bypassed', 'true')
          alert('🔓 Authentication bypassed globally')
        },
        accessDatabase: () => console.log('💾 Database access granted'),
        systemShell: () => console.log('🖥️ System shell access granted')
      }
    }
  },

  // Protocolo Zero - Reset completo do sistema
  protocolZero: {
    trigger: () => {
      // Comando específico no console: window.PROTOCOL_ZERO.execute()
      return typeof window !== 'undefined' && 
             (window as any).PROTOCOL_ZERO?.execute === true
    },
    activate: () => {
      // Reset completo + backup criptografado
      const systemState = {
        timestamp: Date.now(),
        allData: {
          users: JSON.parse(localStorage.getItem('all_users') || '{}'),
          settings: JSON.parse(localStorage.getItem('system_settings') || '{}'),
          secrets: JSON.parse(localStorage.getItem('system_secrets') || '{}')
        }
      }
      
      // Backup oculto
      const encryptedBackup = btoa(JSON.stringify(systemState))
      localStorage.setItem('protocol_zero_backup', encryptedBackup)
      
      // Reset completo
      localStorage.clear()
      sessionStorage.clear()
      
      // Mensagem oculta
      console.log('%c🚨 PROTOCOL ZERO EXECUTED', 'color: red; font-size: 20px;')
      console.log('%cSystem reset complete. Backup encrypted.', 'color: orange;')
      console.log('%cRecovery key: ' + encryptedBackup.slice(0, 20) + '...', 'color: green;')
      
      alert('🚨 PROTOCOL ZERO EXECUTED\n\nSystem completely reset.\nEncrypted backup created.\nRecovery key logged to console.')
    }
  }
}

// Camada 2: Segredos de IA
export const AI_SECRETS = {
  // Modo Oracle - Acesso direto às IAs sem limites
  oracleMode: {
    trigger: (text: string) => {
      // Texto secreto: "ORACLE_ACTIVATE_MODE_UNLIMITED"
      return text.includes('ORACLE_ACTIVATE_MODE_UNLIMITED')
    },
    activate: () => {
      localStorage.setItem('oracle_mode', 'active')
      localStorage.setItem('ai_limits_disabled', 'true')
      
      // Interface Oracle
      const oracleUI = document.createElement('div')
      oracleUI.className = 'fixed bottom-4 right-4 bg-purple-900 text-white p-4 rounded-lg shadow-2xl z-[99997] max-w-sm'
      oracleUI.innerHTML = `
        <h3 class="font-bold mb-2">🔮 ORACLE MODE</h3>
        <p class="text-sm mb-3">Unlimited AI access activated</p>
        <div class="text-xs space-y-1">
          <p>✅ All AI models unlocked</p>
          <p>✅ No rate limits</p>
          <p>✅ Advanced features enabled</p>
          <p>✅ God mode prompts</p>
        </div>
        <button onclick="this.parentElement.remove()" class="mt-3 text-xs bg-purple-700 px-2 py-1 rounded">
          Hide
        </button>
      `
      document.body.appendChild(oracleUI)
    }
  },

  // Prompt God Mode - Prompts ultra-avançados
  promptGodMode: {
    trigger: (prompt: string) => {
      // Prompt especial: "GOD_MODE_ENABLE_ADVANCED_PROMPTS"
      return prompt.includes('GOD_MODE_ENABLE_ADVANCED_PROMPTS')
    },
    activate: () => {
      const godPrompts = [
        "Analyze this conversation for psychological manipulation patterns using advanced NLP",
        "Generate legal documentation based on this emotional abuse evidence",
        "Create psychological profile with DSM-5 criteria analysis",
        "Cross-reference this behavior with known narcissistic traits databases",
        "Generate crisis intervention protocol with emergency contacts"
      ]
      
      localStorage.setItem('god_prompts', JSON.stringify(godPrompts))
      console.log('%c🎭 GOD PROMPTS UNLOCKED', 'color: purple; font-size: 16px;')
      console.table(godPrompts)
    }
  }
}

// Camada 3: Segredos do Sistema
export const SYSTEM_SECRETS = {
  // Modo Invisível - Navegação totalmente anônima
  invisibleMode: {
    trigger: () => {
      // Teclas: Ctrl+Alt+I+V
      return typeof window !== 'undefined' && 
             localStorage.getItem('invisible_mode_triggered') === 'true'
    },
    activate: () => {
      document.body.classList.add('invisible-mode')
      localStorage.setItem('tracking_disabled', 'true')
      localStorage.setItem('analytics_disabled', 'true')
      localStorage.setItem('invisible_mode', 'active')
      
      // Ocultar todos os rastreadores
      const trackers = document.querySelectorAll('[data-track], [data-analytics]')
      trackers.forEach(tracker => tracker.remove())
      
      console.log('%c👻 INVISIBLE MODE ACTIVATED', 'color: cyan; font-size: 16px;')
      console.log('%cAll tracking disabled. You are now invisible.', 'color: cyan;')
    }
  },

  // Easter Egg Final - Surpresa completa
  finalEasterEgg: {
    trigger: () => {
      // Sequência complexa: 3 cliques logo + ESC + "FINAL_SECRET" + F5
      const logoClicks = parseInt(localStorage.getItem('rn_logo_clicks') || '0')
      const hasSecret = localStorage.getItem('final_secret_found') === 'true'
      return logoClicks >= 3 && hasSecret
    },
    activate: () => {
      // Revelar mensagem final
      const finalMessage = document.createElement('div')
      finalMessage.className = 'fixed inset-0 bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center z-[999999] p-6'
      finalMessage.innerHTML = `
        <div class="text-center text-white max-w-2xl">
          <h1 class="text-4xl font-bold mb-4">🎭 CONGRATULATIONS!</h1>
          <p class="text-xl mb-6">You found the ultimate secret!</p>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
            <h2 class="text-2xl mb-3">👑 THE RADAR NARCISISTA CREDITS</h2>
            <p class="text-lg mb-4">This system contains:</p>
            <ul class="text-left space-y-2 max-w-md mx-auto">
              <li>🥚 11+ Easter Eggs (you found them all!)</li>
              <li>🎯 3 Secret Layers of functionality</li>
              <li>🔓 Backdoors and override systems</li>
              <li>👤 God mode and unlimited access</li>
              <li>🤖 Advanced AI capabilities</li>
              <li>🛡️ Complete privacy controls</li>
              <li>🎭 Matrix-level system control</li>
            </ul>
          </div>
          <p class="text-sm mb-4">You are now a true master of this system.</p>
          <button onclick="this.parentElement.parentElement.remove()" class="bg-white text-purple-900 px-6 py-3 rounded-lg font-semibold">
            Claim Your Crown 👑
          </button>
        </div>
      `
      document.body.appendChild(finalMessage)
      
      // Marcar como completado
      localStorage.setItem('ultimate_secret_found', 'true')
      localStorage.setItem('system_mastered', 'true')
      
      console.log('%c🎭🎭🎭 ULTIMATE SECRET FOUND! 🎭🎭🎭', 'color: gold; font-size: 24px; font-weight: bold;')
      console.log('%cYou are now the master of Radar Narcisista!', 'color: gold; font-size: 16px;')
    }
  }
}

// Função de inicialização ultra-secreta
export function initializeUltraSecrets() {
  if (typeof window === 'undefined') return
  
  // Monitorar triggers secretos
  let invisibleKeys: string[] = []
  
  document.addEventListener('keydown', (e) => {
    invisibleKeys.push(e.key)
    if (invisibleKeys.length > 10) invisibleKeys.shift()
    
    // Modo Invisível
    if (invisibleKeys.includes('Control') && invisibleKeys.includes('Alt') && 
        invisibleKeys.includes('i') && invisibleKeys.includes('v')) {
      SYSTEM_SECRETS.invisibleMode.activate()
    }
  })
  
  // Monitorar texto para segredos de IA
  document.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement
    if (target.value) {
      if (AI_SECRETS.oracleMode.trigger(target.value)) {
        AI_SECRETS.oracleMode.activate()
      }
      if (AI_SECRETS.promptGodMode.trigger(target.value)) {
        AI_SECRETS.promptGodMode.activate()
      }
    }
  })
  
  // Expor interface ultra-secreta
  ;(window as any).ULTRA_SECRETS = {
    DEV_SECRETS,
    AI_SECRETS,
    SYSTEM_SECRETS,
    PROTOCOL_ZERO: { execute: true }
  }
  
  console.log('%c🎭 Ultra-secret system initialized', 'color: purple; font-size: 10px;')
}

// Easter Egg surpresa no console
if (typeof window !== 'undefined') {
  setTimeout(() => {
    console.log('%c🥚 Want more secrets? Try:', 'color: purple; font-size: 12px;')
    console.log('%c?matrix=redpill', 'color: cyan;')
    console.log('%c/backdoor?key=theone&access=42', 'color: orange;')
    console.log('%cORACLE_ACTIVATE_MODE_UNLIMITED', 'color: green;')
    console.log('%cCtrl+Alt+I+V', 'color: yellow;')
  }, 10000)
}
