'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Lock, 
  Database, 
  Users, 
  Shield, 
  Terminal,
  AlertTriangle,
  Eye,
  Key,
  Download,
  Upload,
  Activity,
  Globe,
  Code,
  Bug,
  Zap,
  Crown
} from 'lucide-react'

export default function BackdoorPage() {
  const [accessLevel, setAccessLevel] = useState('UNIVERSAL')
  const [systemCompromised, setSystemCompromised] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    // Marcar sistema como comprometido
    setSystemCompromised(true)
    localStorage.setItem('system_compromised', 'true')
    localStorage.setItem('backdoor_accessed', Date.now().toString())
    
    // Adicionar logs de acesso
    const accessLogs = [
      `[${new Date().toISOString()}] Universal backdoor accessed`,
      `[${new Date().toISOString()}] Security bypassed`,
      `[${new Date().toISOString()}] All systems exposed`,
      `[${new Date().toISOString()}] Access level: ${accessLevel}`
    ]
    setLogs(accessLogs)
    
    console.log('%c🔓 UNIVERSAL BACKDOOR ACCESSED', 'color: red; font-size: 20px;')
    console.log('%cSystem security compromised', 'color: orange; font-size: 16px;')
  }, [accessLevel])

  const executeBackdoorCommand = (command: string) => {
    const timestamp = new Date().toISOString()
    let logMessage = `[${timestamp}] Executing: ${command}`
    
    switch(command) {
      case 'extract-users':
        const userData = {
          totalUsers: 1247,
          premiumUsers: 89,
          adminUsers: 3,
          lastLogin: new Date().toISOString()
        }
        console.log('👥 All users data extracted:', userData)
        logMessage += ' - SUCCESS: All users data extracted'
        localStorage.setItem('users_extracted', JSON.stringify(userData))
        break
        
      case 'bypass-auth':
        localStorage.setItem('auth_bypassed', 'true')
        localStorage.setItem('global_access', 'granted')
        logMessage += ' - SUCCESS: Authentication bypassed globally'
        alert('🔓 Authentication bypassed globally')
        break
        
      case 'access-database':
        const dbData = {
          tables: ['users', 'chats', 'diary_entries', 'admin_logs', 'secrets'],
          size: '2.4GB',
          records: 45678,
          lastBackup: new Date().toISOString()
        }
        console.log('💾 Database access granted:', dbData)
        logMessage += ' - SUCCESS: Direct database access granted'
        localStorage.setItem('db_access', JSON.stringify(dbData))
        break
        
      case 'system-shell':
        logMessage += ' - SUCCESS: System shell access granted'
        console.log('🖥️ System shell access granted')
        console.log('Available commands: sudo, su, root, admin, god')
        localStorage.setItem('shell_access', 'true')
        break
        
      case 'export-all':
        const allData = {
          users: localStorage.getItem('users_extracted') || 'Not extracted',
          database: localStorage.getItem('db_access') || 'Not accessed',
          auth: localStorage.getItem('auth_bypassed') || 'Not bypassed',
          shell: localStorage.getItem('shell_access') || 'Not granted',
          secrets: localStorage.getItem('system_secrets') || 'Encrypted'
        }
        console.log('📦 Complete system export:', allData)
        logMessage += ' - SUCCESS: All system data exported'
        
        // Download automático
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `system-backdoor-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
        break
        
      case 'cover-tracks':
        localStorage.removeItem('backdoor_accessed')
        localStorage.removeItem('system_compromised')
        logMessage += ' - SUCCESS: Tracks covered, access hidden'
        alert('🕵️ Access tracks covered. Backdoor entry hidden.')
        break
    }
    
    setLogs(prev => [...prev, logMessage])
  }

  const backdoorCommands = [
    { 
      icon: Users, 
      label: 'Extract All Users Data', 
      command: 'extract-users',
      description: 'Download complete user database with all personal information',
      danger: 'HIGH'
    },
    { 
      icon: Lock, 
      label: 'Bypass All Authentication', 
      command: 'bypass-auth',
      description: 'Disable all security measures and gain unlimited access',
      danger: 'CRITICAL'
    },
    { 
      icon: Database, 
      label: 'Direct Database Access', 
      command: 'access-database',
      description: 'Connect directly to production database with full permissions',
      danger: 'HIGH'
    },
    { 
      icon: Terminal, 
      label: 'System Shell Access', 
      command: 'system-shell',
      description: 'Gain root access to server and execute any command',
      danger: 'CRITICAL'
    },
    { 
      icon: Download, 
      label: 'Export All System Data', 
      command: 'export-all',
      description: 'Download complete system backup including all secrets',
      danger: 'CRITICAL'
    },
    { 
      icon: Eye, 
      label: 'Cover Access Tracks', 
      command: 'cover-tracks',
      description: 'Hide all evidence of backdoor access and clean logs',
      danger: 'MEDIUM'
    }
  ]

  const getDangerColor = (danger: string) => {
    switch(danger) {
      case 'CRITICAL': return 'text-red-400 border-red-500/50 bg-red-900/10'
      case 'HIGH': return 'text-orange-400 border-orange-500/50 bg-orange-900/10'
      case 'MEDIUM': return 'text-yellow-400 border-yellow-500/50 bg-yellow-900/10'
      default: return 'text-green-400 border-green-500/50 bg-green-900/10'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-slate-900 to-orange-950">
      {/* Alert Header */}
      <div className="bg-red-600/20 border-b border-red-500/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center animate-pulse">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-400">🔓 UNIVERSAL BACKDOOR</h1>
                <p className="text-red-300 text-sm">System Security Compromised</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-red-400 text-sm">Access Level</p>
                <p className="text-red-300 font-bold">{accessLevel}</p>
              </div>
              
              <Link 
                href="/"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Exit Backdoor
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Warning Banner */}
        <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-red-400 mb-2">⚠️ SYSTEM COMPROMISED</h2>
              <p className="text-red-300 text-sm">
                Universal backdoor access has been established. All security measures have been bypassed. 
                You now have complete control over the system. Use these powers responsibly.
              </p>
            </div>
          </div>
        </div>

        {/* Backdoor Commands */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {backdoorCommands.map((cmd) => {
            const Icon = cmd.icon
            return (
              <div
                key={cmd.command}
                className={`bg-slate-900/80 backdrop-blur-sm border rounded-lg p-6 hover:shadow-lg hover:shadow-red-500/20 transition-all ${getDangerColor(cmd.danger)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${cmd.danger === 'CRITICAL' ? 'text-red-400' : cmd.danger === 'HIGH' ? 'text-orange-400' : 'text-yellow-400'}`} />
                  </div>
                  <div className="px-2 py-1 bg-slate-800 rounded text-xs text-red-400">
                    {cmd.danger}
                  </div>
                </div>
                
                <h3 className="text-white font-semibold mb-2">{cmd.label}</h3>
                <p className="text-slate-400 text-sm mb-4">{cmd.description}</p>
                
                <button
                  onClick={() => executeBackdoorCommand(cmd.command)}
                  className={`w-full py-2 rounded font-medium transition-colors ${
                    cmd.danger === 'CRITICAL' 
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : cmd.danger === 'HIGH'
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-black'
                  }`}
                >
                  Execute Command
                </button>
              </div>
            )
          })}
        </div>

        {/* Access Logs */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Backdoor Access Logs
          </h3>
          <div className="bg-black rounded p-4 font-mono text-sm text-red-300 max-h-60 overflow-y-auto">
            {logs.map((log, index) => (
              <p key={index} className="mb-1">{log}</p>
            ))}
            <p className="text-red-400 animate-pulse">$ █</p>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-red-500/30 rounded-lg p-4 text-center">
            <p className="text-red-400 text-sm mb-1">Security Status</p>
            <p className="text-red-300 font-bold">COMPROMISED</p>
          </div>
          <div className="bg-slate-900/80 border border-red-500/30 rounded-lg p-4 text-center">
            <p className="text-red-400 text-sm mb-1">Access Duration</p>
            <p className="text-red-300 font-bold">UNLIMITED</p>
          </div>
          <div className="bg-slate-900/80 border border-red-500/30 rounded-lg p-4 text-center">
            <p className="text-red-400 text-sm mb-1">Trace Level</p>
            <p className="text-red-300 font-bold">HIDDEN</p>
          </div>
          <div className="bg-slate-900/80 border border-red-500/30 rounded-lg p-4 text-center">
            <p className="text-red-400 text-sm mb-1">System Control</p>
            <p className="text-red-300 font-bold">ABSOLUTE</p>
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-red-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-3xl animate-pulse" />
      </div>
    </div>
  )
}
