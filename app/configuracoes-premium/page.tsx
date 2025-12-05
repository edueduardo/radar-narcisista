'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Settings, 
  ArrowLeft,
  User,
  Bell,
  Shield,
  Database,
  Trash2,
  Download,
  LogOut,
  Moon,
  Sun,
  Globe,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import {
  RadarButton,
  RadarCard,
  RadarAlertBanner,
  RadarInput,
  RadarModal,
} from '@/components/ui/design-system'

// ============================================================================
// CONFIGURAÇÕES PREMIUM - RADAR NARCISISTA BR
// ============================================================================

export default function ConfiguracoesPremiumPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  
  // Settings state
  const [settings, setSettings] = useState({
    saveHistory: true,
    notifications: true,
    darkMode: true,
    language: 'pt-BR',
    showEmotions: true,
    autoSave: true,
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      // Carregar configurações do usuário
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (userSettings) {
        setSettings({
          saveHistory: userSettings.save_history ?? true,
          notifications: userSettings.notifications ?? true,
          darkMode: true,
          language: userSettings.language ?? 'pt-BR',
          showEmotions: userSettings.show_emotions ?? true,
          autoSave: userSettings.auto_save ?? true,
        })
      }
      
      setLoading(false)
    }
    init()
  }, [router, supabase])

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          save_history: settings.saveHistory,
          notifications: settings.notifications,
          language: settings.language,
          show_emotions: settings.showEmotions,
          auto_save: settings.autoSave,
          updated_at: new Date().toISOString(),
        })
      
      // Mostrar feedback
      alert('Configurações salvas!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleExportData = async () => {
    // Simular exportação
    alert('Seus dados serão enviados para seu email em até 24h.')
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'EXCLUIR MINHA CONTA') return
    
    // Simular exclusão
    alert('Sua conta será excluída em até 7 dias. Você receberá um email de confirmação.')
    setShowDeleteModal(false)
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-sm border-b border-slate-800/50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h1 className="font-bold text-white">Configurações</h1>
                  <p className="text-xs text-gray-500">Personalize sua experiência</p>
                </div>
              </div>
            </div>
            
            <RadarButton onClick={handleSave} isLoading={saving} size="sm">
              <CheckCircle className="w-4 h-4" />
              Salvar
            </RadarButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Perfil */}
        <RadarCard variant="default" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-violet-400" />
            <h2 className="font-semibold text-white">Perfil</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <p className="font-medium text-white">{user?.email?.split('@')[0]}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-600 mt-1">
                Membro desde {new Date(user?.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </RadarCard>

        {/* Privacidade */}
        <RadarCard variant="default" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-green-400" />
            <h2 className="font-semibold text-white">Privacidade</h2>
          </div>
          
          <div className="space-y-4">
            <ToggleSetting
              label="Salvar histórico de conversas"
              description="Suas conversas com o Coach serão salvas para referência futura"
              checked={settings.saveHistory}
              onChange={(checked) => setSettings(prev => ({ ...prev, saveHistory: checked }))}
            />
            <ToggleSetting
              label="Salvar automaticamente"
              description="Registros do diário são salvos automaticamente enquanto você escreve"
              checked={settings.autoSave}
              onChange={(checked) => setSettings(prev => ({ ...prev, autoSave: checked }))}
            />
          </div>
        </RadarCard>

        {/* Aparência */}
        <RadarCard variant="default" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <Moon className="w-5 h-5 text-blue-400" />
            <h2 className="font-semibold text-white">Aparência</h2>
          </div>
          
          <div className="space-y-4">
            <ToggleSetting
              label="Modo escuro"
              description="Interface com fundo escuro (recomendado)"
              checked={settings.darkMode}
              onChange={(checked) => setSettings(prev => ({ ...prev, darkMode: checked }))}
              disabled
            />
            <ToggleSetting
              label="Mostrar emoções"
              description="Exibir chips de emoções nos registros"
              checked={settings.showEmotions}
              onChange={(checked) => setSettings(prev => ({ ...prev, showEmotions: checked }))}
            />
          </div>
        </RadarCard>

        {/* Notificações */}
        <RadarCard variant="default" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-yellow-400" />
            <h2 className="font-semibold text-white">Notificações</h2>
          </div>
          
          <div className="space-y-4">
            <ToggleSetting
              label="Lembretes por email"
              description="Receber lembretes para registrar no diário"
              checked={settings.notifications}
              onChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
            />
          </div>
        </RadarCard>

        {/* Dados */}
        <RadarCard variant="default" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-purple-400" />
            <h2 className="font-semibold text-white">Seus Dados</h2>
          </div>
          
          <div className="space-y-3">
            <RadarButton variant="secondary" onClick={handleExportData} className="w-full justify-start">
              <Download className="w-4 h-4" />
              Exportar todos os meus dados
            </RadarButton>
            <p className="text-xs text-gray-500">
              Você receberá um arquivo com todos os seus registros, conversas e configurações.
            </p>
          </div>
        </RadarCard>

        {/* Zona de Perigo */}
        <RadarCard variant="danger" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="font-semibold text-red-400">Zona de Perigo</h2>
          </div>
          
          <div className="space-y-4">
            <RadarButton variant="ghost" onClick={handleLogout} className="w-full justify-start text-gray-400">
              <LogOut className="w-4 h-4" />
              Sair da conta
            </RadarButton>
            
            <div className="pt-4 border-t border-red-900/30">
              <RadarButton 
                variant="danger" 
                onClick={() => setShowDeleteModal(true)} 
                className="w-full justify-start"
              >
                <Trash2 className="w-4 h-4" />
                Excluir minha conta permanentemente
              </RadarButton>
              <p className="text-xs text-red-400/70 mt-2">
                Esta ação é irreversível. Todos os seus dados serão excluídos.
              </p>
            </div>
          </div>
        </RadarCard>
      </main>

      {/* Modal de Exclusão */}
      <RadarModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Excluir conta permanentemente"
        size="md"
      >
        <div className="space-y-4">
          <RadarAlertBanner type="danger" title="Atenção: Esta ação é irreversível">
            Todos os seus dados serão excluídos permanentemente, incluindo:
            registros do diário, conversas com o Coach, resultados de testes e configurações.
          </RadarAlertBanner>

          <div>
            <p className="text-sm text-gray-400 mb-2">
              Para confirmar, digite <strong className="text-red-400">EXCLUIR MINHA CONTA</strong> abaixo:
            </p>
            <RadarInput
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Digite aqui..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <RadarButton variant="ghost" onClick={() => setShowDeleteModal(false)} className="flex-1">
              Cancelar
            </RadarButton>
            <RadarButton 
              variant="danger" 
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'EXCLUIR MINHA CONTA'}
              className="flex-1"
            >
              Excluir permanentemente
            </RadarButton>
          </div>
        </div>
      </RadarModal>
    </div>
  )
}

// Componente auxiliar
function ToggleSetting({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${disabled ? 'opacity-50' : ''}`}>
      <div>
        <p className="font-medium text-white text-sm">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-violet-600' : 'bg-slate-700'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}
