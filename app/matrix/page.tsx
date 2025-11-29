'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Terminal, 
  Shield, 
  Database, 
  Zap, 
  Eye, 
  Lock,
  AlertTriangle,
  Crown,
  Code,
  Download,
  Upload,
  RefreshCw,
  Activity,
  Users,
  Globe,
  Key,
  Bug,
  Cpu
} from 'lucide-react'

export default function MatrixPage() {
  const [matrixActive, setMatrixActive] = useState(false)
  const [systemStatus, setSystemStatus] = useState({
    users: 1247,
    activeChats: 89,
    diaryEntries: 3421,
    apiCalls: 15678,
    uptime: '99.9%',
    security: 'MAXIMUM'
  })

  useEffect(() => {
    // Ativar modo Matrix
    document.body.classList.add('matrix-mode')
    setMatrixActive(true)
    
    // Simular atualizações em tempo real
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        users: prev.users + Math.floor(Math.random() * 5),
        activeChats: prev.activeChats + Math.floor(Math.random() * 3) - 1,
        diaryEntries: prev.diaryEntries + Math.floor(Math.random() * 2),
        apiCalls: prev.apiCalls + Math.floor(Math.random() * 10)
      }))
    }, 3000)

    return () => {
      clearInterval(interval)
      document.body.classList.remove('matrix-mode')
    }
  }, [])

  const executeCommand = (command: string) => {
    console.log(`🎭 Matrix Command: ${command}`)
    
    switch(command) {
      case 'override':
        localStorage.setItem('user_override', 'true')
        alert('🔓 User access override activated')
        break
      case 'debug':
        console.table(systemStatus)
        console.log('🔍 All systems exposed')
        break
      case 'export':
        const data = {
          timestamp: Date.now(),
          system: systemStatus,
          secrets: localStorage.getItem('system_secrets') || 'None'
        }
        console.log('📦 System data exported:', data)
        break
      case 'crisis':
        document.body.classList.add('crisis-mode')
        alert('🚨 Crisis simulation activated')
        break
      case 'premium':
        localStorage.setItem('premium_unlocked_forever', 'true')
        alert('💎 Premium unlocked forever')
        break
      case 'tokens':
        localStorage.setItem('tokens_infinite', 'true')
        alert('♾️ Infinite tokens activated')
        break
      case 'admin':
        localStorage.setItem('global_admin', 'true')
        alert('👑 Global admin override activated')
        break
    }
  }

  const matrixCommands = [
    { icon: Users, label: 'Override User Access', command: 'override', color: 'text-red-400' },
    { icon: Bug, label: 'Debug All APIs', command: 'debug', color: 'text-orange-400' },
    { icon: Download, label: ' Export All Data', command: 'export', color: 'text-yellow-400' },
    { icon: AlertTriangle, label: 'Simulate Crisis Mode', command: 'crisis', color: 'text-red-500' },
    { icon: Crown, label: 'Unlock Premium Forever', command: 'premium', color: 'text-purple-400' },
    { icon: Zap, label: 'Infinite Tokens', command: 'tokens', color: 'text-blue-400' },
    { icon: Shield, label: 'Global Admin Override', command: 'admin', color: 'text-green-400' }
  ]

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Matrix Rain Effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="matrix-rain"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-green-500/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-8 h-8 text-green-400" />
              <div>
                <h1 className="text-2xl font-bold text-green-400">MATRIX CONTROL</h1>
                <p className="text-green-600 text-sm">System Access Level: GOD MODE</p>
              </div>
            </div>
            
            <Link 
              href="/"
              className="px-4 py-2 bg-green-900/50 hover:bg-green-900/70 text-green-400 rounded border border-green-500/50 transition-colors"
            >
              Exit Matrix
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        {/* System Status */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-green-900/20 border border-green-500/30 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-600">USERS</span>
            </div>
            <p className="text-xl font-bold text-green-400">{systemStatus.users.toLocaleString()}</p>
          </div>
          
          <div className="bg-green-900/20 border border-green-500/30 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-600">ACTIVE CHATS</span>
            </div>
            <p className="text-xl font-bold text-green-400">{systemStatus.activeChats}</p>
          </div>
          
          <div className="bg-green-900/20 border border-green-500/30 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-600">DIARY ENTRIES</span>
            </div>
            <p className="text-xl font-bold text-green-400">{systemStatus.diaryEntries.toLocaleString()}</p>
          </div>
          
          <div className="bg-green-900/20 border border-green-500/30 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-600">API CALLS</span>
            </div>
            <p className="text-xl font-bold text-green-400">{systemStatus.apiCalls.toLocaleString()}</p>
          </div>
          
          <div className="bg-green-900/20 border border-green-500/30 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-600">UPTIME</span>
            </div>
            <p className="text-xl font-bold text-green-400">{systemStatus.uptime}</p>
          </div>
          
          <div className="bg-green-900/20 border border-green-500/30 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-600">SECURITY</span>
            </div>
            <p className="text-xl font-bold text-green-400">{systemStatus.security}</p>
          </div>
        </div>

        {/* Control Panels */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          
          {/* System Control */}
          <div className="bg-green-900/10 border border-green-500/30 rounded-lg p-6">
            <h2 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              SYSTEM CONTROL
            </h2>
            <div className="space-y-2">
              {matrixCommands.slice(0, 4).map((cmd) => {
                const Icon = cmd.icon
                return (
                  <button
                    key={cmd.command}
                    onClick={() => executeCommand(cmd.command)}
                    className="w-full flex items-center gap-3 p-3 bg-green-900/20 hover:bg-green-900/40 border border-green-500/20 rounded transition-colors text-left"
                  >
                    <Icon className={`w-4 h-4 ${cmd.color}`} />
                    <span className="text-green-300">{cmd.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* God Mode */}
          <div className="bg-green-900/10 border border-green-500/30 rounded-lg p-6">
            <h2 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5" />
              GOD MODE
            </h2>
            <div className="space-y-2">
              {matrixCommands.slice(4).map((cmd) => {
                const Icon = cmd.icon
                return (
                  <button
                    key={cmd.command}
                    onClick={() => executeCommand(cmd.command)}
                    className="w-full flex items-center gap-3 p-3 bg-green-900/20 hover:bg-green-900/40 border border-green-500/20 rounded transition-colors text-left"
                  >
                    <Icon className={`w-4 h-4 ${cmd.color}`} />
                    <span className="text-green-300">{cmd.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Terminal Output */}
        <div className="bg-black border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">MATRIX TERMINAL</span>
          </div>
          <div className="text-green-600 text-sm space-y-1 font-mono">
            <p>$ System initialized...</p>
            <p>$ Loading secret protocols...</p>
            <p>$ Access level: GOD_MODE</p>
            <p>$ All security measures bypassed</p>
            <p>$ Ready for commands...</p>
            <p className="text-green-400">$ █</p>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-8 text-center text-green-600 text-sm">
          <p>MATRIX MODE ACTIVE | System Access: UNLIMITED | Status: {new Date().toISOString()}</p>
        </div>
      </div>

      {/* CSS for Matrix Effect */}
      <style jsx>{`
        .matrix-rain {
          background: linear-gradient(to bottom, transparent, rgba(0, 255, 0, 0.03));
          animation: matrix-fall 3s linear infinite;
        }
        
        @keyframes matrix-fall {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        .matrix-mode {
          background: black;
          color: #00ff00;
        }
        
        .crisis-mode {
          animation: crisis-flash 0.5s infinite alternate;
        }
        
        @keyframes crisis-flash {
          0% { background-color: rgba(255, 0, 0, 0.1); }
          100% { background-color: rgba(255, 0, 0, 0.3); }
        }
      `}</style>
    </div>
  )
}
