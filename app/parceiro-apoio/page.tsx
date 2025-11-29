'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Users, Heart, Shield, Bell, Eye, EyeOff,
  Mail, Copy, Check, AlertTriangle, Settings, Trash2,
  UserPlus, Clock, Activity
} from 'lucide-react'

interface Parceiro {
  id: string
  nome: string
  email: string
  tipo: 'amigo' | 'familiar' | 'terapeuta'
  permissoes: {
    verTermometro: boolean
    receberAlertas: boolean
    verEpisodiosGraves: boolean
  }
  adicionadoEm: string
  ultimoAcesso?: string
}

export default function ParceiroApoioPage() {
  const [parceiros, setParceiros] = useState<Parceiro[]>([
    {
      id: '1',
      nome: 'Maria Silva',
      email: 'maria@email.com',
      tipo: 'amigo',
      permissoes: {
        verTermometro: true,
        receberAlertas: true,
        verEpisodiosGraves: false
      },
      adicionadoEm: '2025-11-20',
      ultimoAcesso: '2025-11-24'
    }
  ])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [novoParceiro, setNovoParceiro] = useState({
    nome: '',
    email: '',
    tipo: 'amigo' as const
  })
  const [copiado, setCopiado] = useState(false)
  const [diasInatividade, setDiasInatividade] = useState(7)

  const adicionarParceiro = () => {
    if (!novoParceiro.nome || !novoParceiro.email) return

    const novo: Parceiro = {
      id: Date.now().toString(),
      nome: novoParceiro.nome,
      email: novoParceiro.email,
      tipo: novoParceiro.tipo,
      permissoes: {
        verTermometro: true,
        receberAlertas: true,
        verEpisodiosGraves: false
      },
      adicionadoEm: new Date().toISOString().split('T')[0]
    }

    setParceiros([...parceiros, novo])
    setNovoParceiro({ nome: '', email: '', tipo: 'amigo' })
    setMostrarFormulario(false)
  }

  const removerParceiro = (id: string) => {
    setParceiros(parceiros.filter(p => p.id !== id))
  }

  const togglePermissao = (id: string, permissao: keyof Parceiro['permissoes']) => {
    setParceiros(parceiros.map(p => 
      p.id === id 
        ? { ...p, permissoes: { ...p.permissoes, [permissao]: !p.permissoes[permissao] } }
        : p
    ))
  }

  const copiarLink = () => {
    navigator.clipboard.writeText('https://radarnarcisista.com.br/convite/abc123')
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const tipoLabels = {
    amigo: { label: 'Amigo(a)', emoji: '👫', cor: 'bg-blue-100 text-blue-600' },
    familiar: { label: 'Familiar', emoji: '👨‍👩‍👧', cor: 'bg-green-100 text-green-600' },
    terapeuta: { label: 'Terapeuta', emoji: '🧠', cor: 'bg-purple-100 text-purple-600' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-purple-950 pt-20 pb-10">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 hover:bg-white/50 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Heart className="h-6 w-6 text-pink-500" />
              Parceiro(a) de Apoio
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Convide pessoas de confiança para te acompanhar</p>
          </div>
        </div>

        {/* Explicação */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-6 text-white mb-6">
          <h2 className="text-lg font-semibold mb-2">💜 Por que ter um parceiro de apoio?</h2>
          <p className="text-white/90 text-sm mb-4">
            O isolamento é uma das táticas mais comuns em relacionamentos abusivos. 
            Ter alguém de confiança acompanhando sua jornada pode fazer toda a diferença.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/20 rounded-xl p-3">
              <Bell className="h-5 w-5 mx-auto mb-1" />
              <p className="text-xs">Alertas de inatividade</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <Eye className="h-5 w-5 mx-auto mb-1" />
              <p className="text-xs">Ver seu progresso</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <Shield className="h-5 w-5 mx-auto mb-1" />
              <p className="text-xs">Rede de segurança</p>
            </div>
          </div>
        </div>

        {/* Configuração de Alertas */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            Configurações de Alerta
          </h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Alerta de inatividade</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Notificar parceiros se você não acessar o app por:
              </p>
            </div>
            <select
              value={diasInatividade}
              onChange={(e) => setDiasInatividade(Number(e.target.value))}
              className="px-3 py-2 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded-lg"
            >
              <option value={3}>3 dias</option>
              <option value={5}>5 dias</option>
              <option value={7}>7 dias</option>
              <option value={14}>14 dias</option>
            </select>
          </div>
        </div>

        {/* Lista de Parceiros */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Seus Parceiros ({parceiros.length})
            </h2>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Adicionar
            </button>
          </div>

          {parceiros.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum parceiro adicionado ainda</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Convide alguém de confiança para te acompanhar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {parceiros.map((parceiro) => (
                <div key={parceiro.id} className="border border-gray-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <span className="text-lg">{tipoLabels[parceiro.tipo].emoji}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{parceiro.nome}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{parceiro.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${tipoLabels[parceiro.tipo].cor}`}>
                        {tipoLabels[parceiro.tipo].label}
                      </span>
                      <button
                        onClick={() => removerParceiro(parceiro.id)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Permissões */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Permissões</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => togglePermissao(parceiro.id, 'verTermometro')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          parceiro.permissoes.verTermometro
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-500'
                        }`}
                      >
                        {parceiro.permissoes.verTermometro ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        Ver Termômetro
                      </button>
                      <button
                        onClick={() => togglePermissao(parceiro.id, 'receberAlertas')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          parceiro.permissoes.receberAlertas
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-500'
                        }`}
                      >
                        <Bell className="h-3 w-3" />
                        Alertas
                      </button>
                      <button
                        onClick={() => togglePermissao(parceiro.id, 'verEpisodiosGraves')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          parceiro.permissoes.verEpisodiosGraves
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-500'
                        }`}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        Episódios Graves
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Adicionado em {new Date(parceiro.adicionadoEm).toLocaleDateString('pt-BR')}
                    </span>
                    {parceiro.ultimoAcesso && (
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        Último acesso: {new Date(parceiro.ultimoAcesso).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Link de Convite */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🔗 Link de Convite
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Compartilhe este link com quem você quer convidar:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value="https://radarnarcisista.com.br/convite/abc123"
              readOnly
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm"
            />
            <button
              onClick={copiarLink}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiado ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Modal Adicionar */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Adicionar Parceiro de Apoio
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                  <input
                    type="text"
                    value={novoParceiro.nome}
                    onChange={(e) => setNovoParceiro({ ...novoParceiro, nome: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    placeholder="Nome da pessoa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={novoParceiro.email}
                    onChange={(e) => setNovoParceiro({ ...novoParceiro, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                  <select
                    value={novoParceiro.tipo}
                    onChange={(e) => setNovoParceiro({ ...novoParceiro, tipo: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  >
                    <option value="amigo">👫 Amigo(a)</option>
                    <option value="familiar">👨‍👩‍👧 Familiar</option>
                    <option value="terapeuta">🧠 Terapeuta</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setMostrarFormulario(false)}
                  className="flex-1 py-2 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={adicionarParceiro}
                  className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
