'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Trophy, 
  Star, 
  Lock,
  Sparkles,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react'
import { 
  BADGES, 
  NIVEIS,
  calcularNivel, 
  verificarBadges,
  calcularProgressoBadge,
  criarProgressoInicial,
  type UserProgress,
  type Badge
} from '../../lib/gamificacao'

export default function ConquistasPage() {
  const [loading, setLoading] = useState(true)
  const [progresso, setProgresso] = useState<UserProgress | null>(null)
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todos')
  
  const supabase = createClient()

  useEffect(() => {
    loadProgresso()
  }, [])

  // Função para calcular streak de dias consecutivos
  const calcularStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0
    
    // Ordenar datas do mais recente para o mais antigo
    const sortedDates = dates
      .map(d => new Date(d).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i) // Remover duplicatas
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    
    if (sortedDates.length === 0) return 0
    
    // Verificar se o usuário acessou hoje ou ontem
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0 // Streak quebrado
    }
    
    let streak = 1
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const current = new Date(sortedDates[i])
      const next = new Date(sortedDates[i + 1])
      const diffDays = Math.floor((current.getTime() - next.getTime()) / 86400000)
      
      if (diffDays === 1) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const loadProgresso = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar estatísticas reais do usuário
      const [testesRes, entradasRes, mensagensRes, activityRes] = await Promise.all([
        supabase.from('clarity_tests').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('journal_entries').select('id', { count: 'exact' }).eq('user_id', user.id).is('deleted_at', null),
        supabase.from('ai_messages').select('id', { count: 'exact' }).eq('user_id', user.id).eq('role', 'user'),
        // Buscar todas as datas de atividade para calcular streak
        Promise.all([
          supabase.from('clarity_tests').select('created_at').eq('user_id', user.id),
          supabase.from('journal_entries').select('created_at').eq('user_id', user.id).is('deleted_at', null),
          supabase.from('ai_chat_sessions').select('created_at').eq('user_id', user.id)
        ])
      ])

      // Coletar todas as datas de atividade
      const allDates: string[] = []
      if (activityRes[0].data) allDates.push(...activityRes[0].data.map(d => d.created_at))
      if (activityRes[1].data) allDates.push(...activityRes[1].data.map(d => d.created_at))
      if (activityRes[2].data) allDates.push(...activityRes[2].data.map(d => d.created_at))

      // Calcular streak real
      const diasConsecutivos = calcularStreak(allDates)

      const estatisticas = {
        testesRealizados: testesRes.count || 0,
        entradasDiario: entradasRes.count || 0,
        mensagensChat: mensagensRes.count || 0,
        diasConsecutivos,
        ultimoAcesso: new Date().toISOString()
      }

      // Calcular XP
      const xp = 
        (estatisticas.testesRealizados * 50) +
        (estatisticas.entradasDiario * 20) +
        (estatisticas.mensagensChat * 5)

      const nivelInfo = calcularNivel(xp)
      const badgesConquistados = verificarBadges(estatisticas)

      setProgresso({
        userId: user.id,
        badges: badgesConquistados,
        estatisticas,
        nivel: nivelInfo.nivel,
        xp,
        xpProximoNivel: nivelInfo.xpProximo
      })
    } catch (error) {
      console.error('Erro ao carregar progresso:', error)
    } finally {
      setLoading(false)
    }
  }

  const categorias = [
    { id: 'todos', nome: 'Todos' },
    { id: 'teste', nome: 'Testes' },
    { id: 'diario', nome: 'Diário' },
    { id: 'chat', nome: 'Chat' },
    { id: 'jornada', nome: 'Jornada' },
    { id: 'especial', nome: 'Especiais' }
  ]

  const badgesFiltrados = categoriaAtiva === 'todos' 
    ? BADGES 
    : BADGES.filter(b => b.categoria === categoriaAtiva)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-purple-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  const nivelInfo = progresso ? calcularNivel(progresso.xp) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-purple-950 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 hover:bg-white/50 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Conquistas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Acompanhe seu progresso e conquistas</p>
          </div>
        </div>

        {/* Card de Nível */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm">Seu Nível</p>
              <h2 className="text-3xl font-bold">{nivelInfo?.nome || 'Iniciante'}</h2>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{nivelInfo?.nivel || 1}</div>
              <p className="text-white/70 text-sm">Nível</p>
            </div>
          </div>

          {/* Barra de XP */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-white/70 mb-1">
              <span>{progresso?.xp || 0} XP</span>
              <span>{nivelInfo?.xpProximo || 100} XP para próximo nível</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${nivelInfo ? (nivelInfo.xpAtual / nivelInfo.xpProximo) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Stats rápidos */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{progresso?.badges.length || 0}</div>
              <p className="text-white/70 text-sm">Badges</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{progresso?.estatisticas.diasConsecutivos || 0}</div>
              <p className="text-white/70 text-sm">Dias seguidos</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{progresso?.xp || 0}</div>
              <p className="text-white/70 text-sm">XP Total</p>
            </div>
          </div>
        </div>

        {/* Filtros de Categoria */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                categoriaAtiva === cat.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>

        {/* Grid de Badges */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badgesFiltrados.map(badge => {
            const conquistado = progresso?.badges.includes(badge.id)
            const progressoBadge = progresso 
              ? calcularProgressoBadge(badge, progresso.estatisticas)
              : { atual: 0, necessario: badge.condicao.valor, percentual: 0 }

            return (
              <div
                key={badge.id}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  conquistado
                    ? 'bg-white dark:bg-slate-800 border-purple-500 shadow-lg'
                    : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 opacity-60'
                }`}
              >
                {/* Ícone */}
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl ${
                  conquistado ? badge.cor : 'bg-gray-200 dark:bg-slate-700'
                }`}>
                  {conquistado ? badge.icone : <Lock className="h-6 w-6 text-gray-400" />}
                </div>

                {/* Info */}
                <h3 className={`font-semibold text-center mb-1 ${
                  conquistado ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {badge.nome}
                </h3>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-2">
                  {badge.descricao}
                </p>

                {/* Progresso */}
                {!conquistado && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${progressoBadge.percentual}%` }}
                      />
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-1">
                      {progressoBadge.atual}/{progressoBadge.necessario}
                    </p>
                  </div>
                )}

                {/* Badge de conquistado */}
                {conquistado && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Dica */}
        <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
          <h3 className="font-medium text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Como ganhar XP
          </h3>
          <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
            <li>• Completar Teste de Clareza: <strong>50 XP</strong></li>
            <li>• Criar entrada no Diário: <strong>20 XP</strong></li>
            <li>• Enviar mensagem no Chat: <strong>5 XP</strong></li>
            <li>• Conquistar badge: <strong>100 XP</strong></li>
            <li>• Indicar amigo: <strong>200 XP</strong></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
