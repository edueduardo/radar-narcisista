'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, AlertTriangle, Heart, BookOpen, MessageCircle, Phone, ChevronRight, X, Loader2 } from 'lucide-react'

// =============================================================================
// MODO RECAÍDA - Lê episódios REAIS do diário do usuário
// Mostra os piores momentos para ajudar a pessoa a não voltar
// =============================================================================

interface Episodio {
  id: string
  title: string
  description: string
  impact_score: number
  created_at: string
  tags: string[]
}

interface UserStats {
  primeiroTeste: number | null
  ultimoTeste: number | null
  totalEpisodios: number
  episodiosRecentes: number
}

export default function ModoRecaidaPage() {
  const [etapa, setEtapa] = useState(1)
  const [leuTudo, setLeuTudo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [pioresEpisodios, setPioresEpisodios] = useState<Episodio[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [cartaFuturo, setCartaFuturo] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Buscar os episódios de MAIOR IMPACTO do diário
      const { data: episodios, error: episodiosError } = await supabase
        .from('journal_entries')
        .select('id, title, description, impact_score, created_at, tags')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .gte('impact_score', 3) // Apenas impacto >= 3
        .order('impact_score', { ascending: false })
        .limit(5)

      if (episodiosError) {
        console.error('Erro ao carregar episódios:', episodiosError)
      } else if (episodios && episodios.length > 0) {
        setPioresEpisodios(episodios)
      }

      // Buscar estatísticas do usuário
      const [testesRes, entradasRes, entradasRecentesRes] = await Promise.all([
        supabase
          .from('clarity_tests')
          .select('fog_score, fear_score, limits_score, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true }),
        supabase
          .from('journal_entries')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .is('deleted_at', null),
        supabase
          .from('journal_entries')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ])

      if (testesRes.data && testesRes.data.length > 0) {
        const primeiro = testesRes.data[0]
        const ultimo = testesRes.data[testesRes.data.length - 1]
        
        const calcScore = (t: any) => Math.round(((t.fog_score + t.fear_score + t.limits_score) / 48) * 10)
        
        setUserStats({
          primeiroTeste: calcScore(primeiro),
          ultimoTeste: calcScore(ultimo),
          totalEpisodios: entradasRes.count || 0,
          episodiosRecentes: entradasRecentesRes.count || 0
        })
      }

      // Buscar carta para o futuro (se existir)
      const { data: carta } = await supabase
        .from('future_letters')
        .select('content')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (carta) {
        setCartaFuturo(carta.content)
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-red-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando seus registros...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Link>
        </div>

        {/* Etapa 1 - Alerta inicial */}
        {etapa === 1 && (
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 bg-red-600/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Espera.
            </h1>
            
            <p className="text-xl text-red-200 mb-8">
              Você está pensando em voltar?
            </p>

            <div className="bg-red-900/50 border border-red-500/50 rounded-2xl p-6 mb-8">
              <p className="text-red-100">
                Antes de tomar qualquer decisão, eu preciso te mostrar algumas coisas.
                <br /><br />
                <strong>Você escreveu isso. Você sentiu isso. Isso é real.</strong>
              </p>
            </div>

            <button
              onClick={() => setEtapa(2)}
              className="bg-white text-red-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-red-50 transition-colors"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Etapa 2 - Mostrar piores episódios REAIS do diário */}
        {etapa === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <BookOpen className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Lembra disso?
              </h2>
              <p className="text-gray-400">
                {pioresEpisodios.length > 0 
                  ? 'Esses são os episódios que VOCÊ registrou no seu diário'
                  : 'Você ainda não registrou episódios no diário'}
              </p>
            </div>

            {pioresEpisodios.length > 0 ? (
              <div className="space-y-4 mb-8">
                {pioresEpisodios.map((ep) => (
                  <div key={ep.id} className="bg-gray-800 rounded-2xl p-6 border-l-4 border-red-500">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-500">{formatDate(ep.created_at)}</span>
                      <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded">
                        Impacto: {ep.impact_score}/5
                      </span>
                    </div>
                    <h3 className="font-bold text-white mb-2">{ep.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-3">{ep.description}</p>
                    {ep.tags && ep.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {ep.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-2xl p-8 mb-8 text-center">
                <p className="text-gray-400 mb-4">
                  Você ainda não tem episódios registrados no diário.
                </p>
                <p className="text-red-300 text-sm">
                  Mesmo assim, lembre-se: se você está aqui, é porque algo te fez questionar.
                  Confie nesse sentimento.
                </p>
              </div>
            )}

            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-2xl p-6 mb-8">
              <p className="text-yellow-200 text-center">
                {pioresEpisodios.length > 0 ? (
                  <>
                    <strong>Você escreveu isso nos seus piores momentos.</strong>
                    <br />
                    Esses momentos vão voltar se você voltar.
                  </>
                ) : (
                  <>
                    <strong>Você está aqui por um motivo.</strong>
                    <br />
                    Confie no que você está sentindo.
                  </>
                )}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setEtapa(1)}
                className="flex-1 bg-gray-700 text-white py-4 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => setEtapa(3)}
                className="flex-1 bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Etapa 3 - Comparação Antes vs Agora (DADOS REAIS) */}
        {etapa === 3 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Olha como você estava vs como você está
              </h2>
              {userStats && (
                <p className="text-gray-400 text-sm">
                  Baseado nos seus {userStats.totalEpisodios} registros
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Antes - Dados do primeiro teste */}
              <div className="bg-red-900/50 rounded-2xl p-6 border border-red-500/30">
                <h3 className="font-bold text-red-300 mb-4 text-center">😔 QUANDO VOCÊ COMEÇOU</h3>
                <ul className="space-y-3 text-red-200 text-sm">
                  {userStats && userStats.primeiroTeste !== null ? (
                    <li>• Clareza inicial: <strong>{userStats.primeiroTeste}/10</strong></li>
                  ) : (
                    <li>• Clareza: <strong>Baixa</strong></li>
                  )}
                  <li>• Episódios registrados: <strong>{userStats?.totalEpisodios ?? 'Vários'}</strong></li>
                  <li>• Ansiedade constante</li>
                  <li>• Medo de falar o que pensa</li>
                  <li>• Isolada(o) de amigos e família</li>
                  <li>• Duvidando da própria sanidade</li>
                </ul>
              </div>

              {/* Agora - Dados do último teste */}
              <div className="bg-green-900/50 rounded-2xl p-6 border border-green-500/30">
                <h3 className="font-bold text-green-300 mb-4 text-center">😊 AGORA</h3>
                <ul className="space-y-3 text-green-200 text-sm">
                  {userStats && userStats.ultimoTeste !== null ? (
                    <li>• Clareza atual: <strong>{userStats.ultimoTeste}/10</strong></li>
                  ) : (
                    <li>• Clareza: <strong>Melhorando</strong></li>
                  )}
                  <li>• Episódios recentes (30 dias): <strong>{userStats?.episodiosRecentes ?? 0}</strong></li>
                  <li>• Mais calma(o)</li>
                  <li>• Livre para ser você</li>
                  <li>• Reconectando com pessoas queridas</li>
                  <li>• Confiando em si mesma(o)</li>
                </ul>
              </div>
            </div>

            <div className="bg-purple-900/50 border border-purple-500/30 rounded-2xl p-6 mb-8">
              <p className="text-purple-200 text-center text-lg">
                <strong>Você lutou muito para chegar até aqui.</strong>
                <br />
                Tem certeza que quer voltar para onde estava?
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setEtapa(2)}
                className="flex-1 bg-gray-700 text-white py-4 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => setEtapa(4)}
                className="flex-1 bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Etapa 4 - Mensagem da você do passado (ou carta real se existir) */}
        {etapa === 4 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Uma mensagem para você
              </h2>
              <p className="text-gray-400">
                {cartaFuturo 
                  ? 'Esta é a carta que VOCÊ escreveu para si mesma'
                  : 'Da pessoa que você era quando decidiu sair'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl p-8 border border-purple-500/30 mb-8">
              {cartaFuturo ? (
                // Carta REAL escrita pelo usuário
                <div>
                  <p className="text-purple-100 text-lg italic leading-relaxed whitespace-pre-wrap">
                    "{cartaFuturo}"
                  </p>
                  <p className="text-purple-300 text-sm mt-6 text-right">
                    — Você mesma, quando escreveu esta carta
                  </p>
                </div>
              ) : (
                // Mensagem padrão
                <p className="text-purple-100 text-lg italic leading-relaxed">
                  "Eu sei que você está sentindo falta. Eu sei que parece que o amor era real.
                  <br /><br />
                  Mas lembra de como você se sentia? Lembra das noites chorando? Lembra de como você duvidava de si mesma?
                  <br /><br />
                  Você é mais forte do que pensa. Você conseguiu sair. Não volta.
                  <br /><br />
                  O amor que você merece não machuca assim.
                  <br /><br />
                  Com amor,<br />
                  <strong>Você mesma, do passado</strong>"
                </p>
              )}
            </div>

            <button
              onClick={() => { setEtapa(5); setLeuTudo(true); }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              Eu li tudo
            </button>
          </div>
        )}

        {/* Etapa 5 - Decisão final */}
        {etapa === 5 && (
          <div className="animate-fade-in text-center">
            <div className="w-20 h-20 bg-green-600/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-green-400" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
              Você é mais forte do que pensa
            </h2>

            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              O fato de você ter lido tudo isso mostra que uma parte de você sabe a verdade.
              Confie nessa parte.
            </p>

            <div className="space-y-4 mb-8">
              <Link
                href="/chat"
                className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Conversar com Coach IA
              </Link>
              
              <Link
                href="/diario"
                className="w-full bg-gray-700 text-white py-4 rounded-xl font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Escrever no Diário
              </Link>

              <a
                href="tel:188"
                className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Ligar para CVV (188)
              </a>
            </div>

            <Link
              href="/"
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              Voltar ao início
            </Link>
          </div>
        )}

        {/* Botão de emergência sempre visível */}
        <div className="fixed bottom-6 right-6">
          <a
            href="tel:188"
            className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Phone className="w-6 h-6" />
            <span className="hidden sm:inline font-semibold">188 - CVV</span>
          </a>
        </div>
      </div>
    </div>
  )
}
