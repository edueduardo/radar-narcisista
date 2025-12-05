'use client'

/**
 * Admin do Cliente (White Label)
 * FASE 9.4 - Gerenciamento de Tenants
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Building2,
  Plus,
  Search,
  Settings,
  Users,
  CreditCard,
  Globe,
  Palette,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Edit
} from 'lucide-react'

interface Tenant {
  id: string
  slug: string
  name: string
  domain?: string
  customDomain?: string
  status: 'active' | 'suspended' | 'trial' | 'cancelled'
  trialEndsAt?: string
  planSlug?: string
  userCount?: number
  createdAt: string
}

export default function WhiteLabelAdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*, tenant_users(count)')
        .order('created_at', { ascending: false })

      if (error) throw error

      setTenants(data?.map(t => ({
        ...t,
        userCount: t.tenant_users?.[0]?.count || 0
      })) || [])
    } catch (error) {
      console.error('Erro ao carregar tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.slug.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Ativo
        </span>
      case 'trial':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1">
          <Clock className="w-3 h-3" /> Trial
        </span>
      case 'suspended':
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Suspenso
        </span>
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1">
          <XCircle className="w-3 h-3" /> Cancelado
        </span>
      default:
        return null
    }
  }

  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    trial: tenants.filter(t => t.status === 'trial').length,
    totalUsers: tenants.reduce((sum, t) => sum + (t.userCount || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">White Label</h1>
                <p className="text-sm text-gray-500">Gerenciamento de Tenants</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
              Novo Tenant
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Total de Tenants</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Ativos</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Em Trial</p>
            <p className="text-2xl font-bold text-blue-600">{stats.trial}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Total de Usuários</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalUsers}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="trial">Em Trial</option>
            <option value="suspended">Suspensos</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>

        {/* Lista de Tenants */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando...</div>
          ) : filteredTenants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum tenant encontrado
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tenant</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Domínio</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Plano</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Usuários</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTenants.map(tenant => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{tenant.name}</p>
                        <p className="text-sm text-gray-500">{tenant.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tenant.customDomain ? (
                        <a 
                          href={`https://${tenant.customDomain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline flex items-center gap-1"
                        >
                          {tenant.customDomain}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 capitalize">
                        {tenant.planSlug || 'Trial'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {tenant.userCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(tenant.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/whitelabel/${tenant.id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Configurações"
                        >
                          <Settings className="w-4 h-4 text-gray-500" />
                        </Link>
                        <Link
                          href={`/admin/whitelabel/${tenant.id}/users`}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Usuários"
                        >
                          <Users className="w-4 h-4 text-gray-500" />
                        </Link>
                        <Link
                          href={`/admin/whitelabel/${tenant.id}/branding`}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Branding"
                        >
                          <Palette className="w-4 h-4 text-gray-500" />
                        </Link>
                        <Link
                          href={`/admin/whitelabel/${tenant.id}/billing`}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Billing"
                        >
                          <CreditCard className="w-4 h-4 text-gray-500" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal de Criar Tenant */}
      {showCreateModal && (
        <CreateTenantModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            loadTenants()
          }}
        />
      )}
    </div>
  )
}

function CreateTenantModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao criar tenant')
      }

      onCreated()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Novo Tenant</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'))
              }}
              placeholder="Minha Empresa"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (URL)
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 text-sm mr-2">https://</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="minha-empresa"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
              <span className="text-gray-500 text-sm ml-2">.app.com</span>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
