'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft, Search, User, Shield, Plus, Trash2, Save, X, Check,
  AlertTriangle, Crown, Zap, Lock, Unlock, RefreshCw, Settings, BarChart3
} from 'lucide-react'

interface Feature {
  feature_key: string
  nome: string
  tipo: string
  categoria: string
}

interface UserOverride {
  id: string
  user_id: string
  feature_key: string
  override_type: 'grant' | 'revoke' | 'limit_custom'
  valor: any
  limite_diario: number | null
  limite_mensal: number | null
  motivo: string | null
  ativo: boolean
}

interface UserData {
  id: string
  email: string
  plan_slug: string | null
  profile_key: string | null
  overrides: UserOverride[]
  effective_features: Record<string, any>
}

export default function AdminPlanosCoreOverridesPage() {
  const supabase = createClient()
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [searchEmail, setSearchEmail] = useState('')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showAddOverride, setShowAddOverride] = useState(false)
  const [newOverride, setNewOverride] = useState({
    feature_key: '',
    override_type: 'grant' as 'grant' | 'revoke' | 'limit_custom',
    limite_diario: '',
    limite_mensal: '',
    motivo: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadFeatures()
  }, [])

  async function loadFeatures() {
    const { data } = await supabase.from('features').select('*').order('ordem_exibicao')
    if (data) setFeatures(data)
    setLoading(false)
  }

  async function searchUser() {
    if (!searchEmail.trim()) return
    setSearching(true)
    setUserData(null)
    setMessage(null)
    
    try {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('user_id, email')
        .ilike('email', `%${searchEmail}%`)
        .limit(1)
        .single()
      
      if (!profileData) {
        setMessage({ type: 'error', text: 'Usuário não encontrado' })
        return
      }

      const userId = profileData.user_id

      const { data: subData } = await supabase
        .from('user_subscriptions_core')
        .select('plan_slug, feature_profiles(profile_key)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      const { data: overridesData } = await supabase
        .from('user_feature_overrides')
        .select('*')
        .eq('user_id', userId)
        .eq('ativo', true)

      const { data: effectiveData } = await supabase
        .rpc('get_effective_features', { p_user_id: userId })

      setUserData({
        id: userId,
        email: profileData.email,
        plan_slug: subData?.plan_slug || null,
        profile_key: (subData?.feature_profiles as any)?.profile_key || null,
        overrides: overridesData || [],
        effective_features: effectiveData || {}
      })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao buscar' })
    } finally {
      setSearching(false)
    }
  }

  async function addOverride() {
    if (!userData || !newOverride.feature_key) return
    setSaving(true)
    try {
      await supabase.from('user_feature_overrides').upsert({
        user_id: userData.id,
        feature_key: newOverride.feature_key,
        override_type: newOverride.override_type,
        valor: newOverride.override_type === 'revoke' ? null : true,
        limite_diario: newOverride.limite_diario ? parseInt(newOverride.limite_diario) : null,
        limite_mensal: newOverride.limite_mensal ? parseInt(newOverride.limite_mensal) : null,
        motivo: newOverride.motivo || null,
        ativo: true
      }, { onConflict: 'user_id,feature_key' })

      setMessage({ type: 'success', text: 'Override adicionado!' })
      setShowAddOverride(false)
      setNewOverride({ feature_key: '', override_type: 'grant', limite_diario: '', limite_mensal: '', motivo: '' })
      await searchUser()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function removeOverride(id: string) {
    if (!confirm('Remover override?')) return
    await supabase.from('user_feature_overrides').update({ ativo: false }).eq('id', id)
    setMessage({ type: 'success', text: 'Override removido!' })
    await searchUser()
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><RefreshCw className="w-8 h-8 animate-spin text-purple-600" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-purple-600" />PLANOS_CORE - Overrides</h1>
            <p className="text-sm text-gray-500">Gerenciar features por usuário</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Search className="w-5 h-5" />Buscar Usuário</h2>
          <div className="flex gap-4">
            <input type="email" placeholder="Email do usuário..." value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchUser()} className="flex-1 px-4 py-2 border rounded-lg" />
            <button onClick={searchUser} disabled={searching} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
              {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}Buscar
            </button>
          </div>
        </div>

        {userData && (
          <>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"><User className="w-6 h-6 text-purple-600" /></div>
                  <div>
                    <h3 className="font-semibold">{userData.email}</h3>
                    <p className="text-sm text-gray-500">ID: {userData.id.slice(0,8)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">{userData.plan_slug?.toUpperCase() || 'FREE'}</span>
                  {userData.profile_key && <span className="text-sm text-gray-500">({userData.profile_key})</span>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" />Features Efetivas ({Object.keys(userData.effective_features).length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(userData.effective_features).map(([key, val]: [string, any]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="font-medium text-sm">{key}</div>
                    {val.limite_mensal && <div className="text-xs text-gray-500">{val.limite_diario}/dia, {val.limite_mensal}/mês</div>}
                    {val.override && <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">Override</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2"><Settings className="w-5 h-5" />Overrides ({userData.overrides.length})</h3>
                <button onClick={() => setShowAddOverride(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"><Plus className="w-4 h-4" />Adicionar</button>
              </div>

              {showAddOverride && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border space-y-3">
                  <select value={newOverride.feature_key} onChange={(e) => setNewOverride({...newOverride, feature_key: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                    <option value="">Selecione a feature...</option>
                    {features.map(f => <option key={f.feature_key} value={f.feature_key}>{f.nome} ({f.feature_key})</option>)}
                  </select>
                  <select value={newOverride.override_type} onChange={(e) => setNewOverride({...newOverride, override_type: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg">
                    <option value="grant">GRANT - Conceder acesso</option>
                    <option value="revoke">REVOKE - Revogar acesso</option>
                    <option value="limit_custom">LIMIT_CUSTOM - Limite personalizado</option>
                  </select>
                  {newOverride.override_type === 'limit_custom' && (
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" placeholder="Limite diário" value={newOverride.limite_diario} onChange={(e) => setNewOverride({...newOverride, limite_diario: e.target.value})} className="px-3 py-2 border rounded-lg" />
                      <input type="number" placeholder="Limite mensal" value={newOverride.limite_mensal} onChange={(e) => setNewOverride({...newOverride, limite_mensal: e.target.value})} className="px-3 py-2 border rounded-lg" />
                    </div>
                  )}
                  <input type="text" placeholder="Motivo (opcional)" value={newOverride.motivo} onChange={(e) => setNewOverride({...newOverride, motivo: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  <div className="flex gap-2">
                    <button onClick={addOverride} disabled={saving} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Salvar
                    </button>
                    <button onClick={() => setShowAddOverride(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {userData.overrides.map(o => (
                  <div key={o.id} className={`p-3 rounded-lg border flex items-center justify-between ${o.override_type === 'grant' ? 'bg-green-50 border-green-200' : o.override_type === 'revoke' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex items-center gap-3">
                      {o.override_type === 'grant' ? <Unlock className="w-4 h-4 text-green-600" /> : o.override_type === 'revoke' ? <Lock className="w-4 h-4 text-red-600" /> : <Settings className="w-4 h-4 text-yellow-600" />}
                      <div>
                        <span className="font-medium">{o.feature_key}</span>
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded ${o.override_type === 'grant' ? 'bg-green-200 text-green-800' : o.override_type === 'revoke' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>{o.override_type.toUpperCase()}</span>
                        {o.limite_mensal && <span className="ml-2 text-sm text-gray-500">{o.limite_diario}/dia, {o.limite_mensal}/mês</span>}
                        {o.motivo && <span className="ml-2 text-sm text-gray-400">"{o.motivo}"</span>}
                      </div>
                    </div>
                    <button onClick={() => removeOverride(o.id)} className="p-2 text-red-500 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {userData.overrides.length === 0 && <p className="text-gray-500 text-center py-4">Nenhum override configurado</p>}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
