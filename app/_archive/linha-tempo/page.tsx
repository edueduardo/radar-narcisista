'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Clock, Heart, AlertTriangle, Frown, Ghost, RotateCcw, ChevronRight, Info, BookOpen, Loader2 } from 'lucide-react'

// =============================================================================
// LINHA DO TEMPO - Integrado com dados do diário do usuário
// Mostra em qual fase o usuário pode estar baseado nas tags dos episódios
// =============================================================================

// Mapeamento de tags para fases do ciclo
const TAG_TO_PHASE: Record<string, number> = {
  'love bombing': 1,
  'idealização': 1,
  'presentes excessivos': 1,
  'isolamento': 2,
  'ciúmes excessivos': 2,
  'controle social': 2,
  'possessividade': 2,
  'gaslighting': 3,
  'humilhação': 3,
  'crítica destrutiva': 3,
  'desprezo': 3,
  'invalidação': 3,
  'minimização': 3,
  'tratamento de gelo': 4,
  'silêncio punitivo': 4,
  'abandono': 4,
  'hoovering': 5,
  'volta': 5,
  'promessas de mudança': 5,
}

const fases = [
  {
    id: 1,
    nome: 'Idealização',
    subtitulo: 'Love Bombing',
    icone: <Heart className="w-8 h-8" />,
    cor: 'pink',
    bgCor: 'bg-pink-500',
    textCor: 'text-pink-600',
    bgLight: 'bg-pink-50',
    borderCor: 'border-pink-300',
    descricao: 'Você é perfeita(o). Amor intenso, presentes, atenção constante. Promessas de futuro. "Nunca conheci alguém como você."',
    sinais: [
      'Declarações de amor muito rápidas',
      'Quer ficar junto o tempo todo',
      'Presentes e surpresas constantes',
      'Fala em casamento/morar junto cedo demais',
      'Parece bom demais para ser verdade',
    ],
    duracao: 'Semanas a poucos meses',
    sentimento: 'Euforia, paixão intensa, sensação de ter encontrado "a pessoa certa"',
  },
  {
    id: 2,
    nome: 'Dependência',
    subtitulo: 'Isolamento',
    icone: <AlertTriangle className="w-8 h-8" />,
    cor: 'orange',
    bgCor: 'bg-orange-500',
    textCor: 'text-orange-600',
    bgLight: 'bg-orange-50',
    borderCor: 'border-orange-300',
    descricao: 'Você começa a "precisar" dela(e). Seus amigos e família são afastados. Sua vida gira em torno da relação.',
    sinais: [
      'Críticas sutis aos seus amigos/família',
      'Ciúmes excessivo',
      'Você deixa de fazer coisas que gostava',
      'Precisa dar satisfação de tudo',
      'Sente culpa quando não está junto',
    ],
    duracao: 'Meses',
    sentimento: 'Ansiedade, medo de perder, sensação de que precisa se esforçar mais',
  },
  {
    id: 3,
    nome: 'Desvalorização',
    subtitulo: 'Críticas e Humilhação',
    icone: <Frown className="w-8 h-8" />,
    cor: 'red',
    bgCor: 'bg-red-500',
    textCor: 'text-red-600',
    bgLight: 'bg-red-50',
    borderCor: 'border-red-300',
    descricao: 'Nada que você faz é suficiente. Críticas constantes, comparações, humilhações. Você começa a duvidar de si.',
    sinais: [
      'Críticas constantes (aparência, trabalho, família)',
      'Comparações com ex ou outras pessoas',
      'Tratamento silencioso como punição',
      'Gaslighting ("isso nunca aconteceu")',
      'Você se sente "pisando em ovos"',
    ],
    duracao: 'Meses a anos',
    sentimento: 'Confusão, baixa autoestima, sensação de nunca ser boa(bom) o suficiente',
  },
  {
    id: 4,
    nome: 'Descarte',
    subtitulo: 'Abandono',
    icone: <Ghost className="w-8 h-8" />,
    cor: 'gray',
    bgCor: 'bg-gray-500',
    textCor: 'text-gray-600',
    bgLight: 'bg-gray-50',
    borderCor: 'border-gray-300',
    descricao: 'Frieza total, abandono emocional ou físico. Pode haver traição. Você é descartada(o) como se não importasse.',
    sinais: [
      'Frieza e distância emocional',
      'Desaparece sem explicação',
      'Traição (às vezes proposital para você descobrir)',
      'Fala que "acabou o amor"',
      'Te trata como se você não existisse',
    ],
    duracao: 'Dias a semanas',
    sentimento: 'Devastação, desespero, sensação de não valer nada',
  },
  {
    id: 5,
    nome: 'Hoovering',
    subtitulo: 'A Volta',
    icone: <RotateCcw className="w-8 h-8" />,
    cor: 'purple',
    bgCor: 'bg-purple-500',
    textCor: 'text-purple-600',
    bgLight: 'bg-purple-50',
    borderCor: 'border-purple-300',
    descricao: 'Volta arrependida(o), promete mudar, jura que vai ser diferente. O ciclo recomeça.',
    sinais: [
      '"Eu mudei, eu prometo"',
      'Presentes, cartas, declarações',
      'Usa filhos, família ou amigos para chegar até você',
      'Ameaças veladas de suicídio ou desespero',
      'Aparece "por acaso" nos seus lugares',
    ],
    duracao: 'Dias a semanas',
    sentimento: 'Esperança, dúvida, vontade de acreditar que dessa vez será diferente',
  },
]

interface UserPhaseData {
  detectedPhase: number | null
  phaseCounts: Record<number, number>
  totalEpisodes: number
  recentTags: string[]
}

export default function LinhaTempoPage() {
  const [faseAtiva, setFaseAtiva] = useState<number | null>(null)
  const [minhaFase, setMinhaFase] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userPhaseData, setUserPhaseData] = useState<UserPhaseData | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      // Buscar episódios do diário com tags
      const { data: entries } = await supabase
        .from('journal_entries')
        .select('tags, created_at')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (entries && entries.length > 0) {
        // Contar tags por fase
        const phaseCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        const recentTags: string[] = []

        entries.forEach(entry => {
          (entry.tags || []).forEach((tag: string) => {
            const tagLower = tag.toLowerCase()
            const phase = TAG_TO_PHASE[tagLower]
            if (phase) {
              phaseCounts[phase]++
            }
            // Coletar tags recentes (últimos 5 episódios)
            if (entries.indexOf(entry) < 5 && !recentTags.includes(tag)) {
              recentTags.push(tag)
            }
          })
        })

        // Detectar fase predominante
        let maxCount = 0
        let detectedPhase: number | null = null
        Object.entries(phaseCounts).forEach(([phase, count]) => {
          if (count > maxCount) {
            maxCount = count
            detectedPhase = parseInt(phase)
          }
        })

        setUserPhaseData({
          detectedPhase: maxCount > 0 ? detectedPhase : null,
          phaseCounts,
          totalEpisodes: entries.length,
          recentTags: recentTags.slice(0, 5)
        })

        // Auto-selecionar fase detectada
        if (detectedPhase && maxCount >= 2) {
          setMinhaFase(detectedPhase)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Link>
        </div>

        {/* Título */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-purple-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            O Ciclo do Relacionamento Narcisista
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Entenda as fases do abuso e reconheça onde você pode estar
          </p>
        </div>

        {/* Linha do Tempo Visual */}
        <div className="relative mb-12">
          {/* Linha conectora */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-1 bg-gray-700">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 border-t-2 border-r-2 border-gray-700 transform rotate-45" />
          </div>

          {/* Fases */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {fases.map((fase) => (
              <div
                key={fase.id}
                onClick={() => setFaseAtiva(faseAtiva === fase.id ? null : fase.id)}
                className={`relative cursor-pointer transition-all ${
                  faseAtiva === fase.id ? 'scale-105 z-10' : 'hover:scale-102'
                }`}
              >
                {/* Círculo */}
                <div className={`w-12 h-12 ${fase.bgCor} rounded-full flex items-center justify-center mx-auto mb-3 text-white shadow-lg ${
                  minhaFase === fase.id ? 'ring-4 ring-white ring-offset-4 ring-offset-gray-900' : ''
                }`}>
                  {fase.id}
                </div>

                {/* Card */}
                <div className={`bg-gray-800 rounded-2xl p-4 border-2 transition-colors ${
                  faseAtiva === fase.id ? fase.borderCor : 'border-gray-700'
                }`}>
                  <div className={`${fase.textCor} mb-2 flex justify-center`}>
                    {fase.icone}
                  </div>
                  <h3 className="font-bold text-white text-center mb-1">{fase.nome}</h3>
                  <p className="text-xs text-gray-400 text-center">{fase.subtitulo}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Seta de retorno */}
          <div className="hidden md:flex justify-center mt-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <RotateCcw className="w-4 h-4" />
              <span>O ciclo se repete</span>
            </div>
          </div>
        </div>

        {/* Detalhes da fase selecionada */}
        {faseAtiva && (
          <div className={`${fases[faseAtiva - 1].bgLight} rounded-3xl p-8 mb-8 animate-fade-in`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 ${fases[faseAtiva - 1].bgCor} rounded-2xl flex items-center justify-center text-white`}>
                {fases[faseAtiva - 1].icone}
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${fases[faseAtiva - 1].textCor}`}>
                  Fase {faseAtiva}: {fases[faseAtiva - 1].nome}
                </h2>
                <p className="text-gray-600">{fases[faseAtiva - 1].subtitulo}</p>
              </div>
            </div>

            <p className="text-gray-700 text-lg mb-6">{fases[faseAtiva - 1].descricao}</p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Sinais */}
              <div className="bg-white rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">🚩 Sinais dessa fase:</h3>
                <ul className="space-y-2">
                  {fases[faseAtiva - 1].sinais.map((sinal, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className={fases[faseAtiva - 1].textCor}>•</span>
                      {sinal}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Info adicional */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-2">⏱️ Duração típica:</h3>
                  <p className="text-gray-700">{fases[faseAtiva - 1].duracao}</p>
                </div>
                <div className="bg-white rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-2">💭 Como você se sente:</h3>
                  <p className="text-gray-700">{fases[faseAtiva - 1].sentimento}</p>
                </div>
              </div>
            </div>

            {/* Botão "Estou nessa fase" */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setMinhaFase(faseAtiva)}
                className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                  minhaFase === faseAtiva
                    ? `${fases[faseAtiva - 1].bgCor} text-white`
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {minhaFase === faseAtiva ? '✓ Você marcou: Estou nessa fase' : 'Marcar: Estou nessa fase'}
              </button>
            </div>
          </div>
        )}

        {/* Seção de dados do usuário (se logado e com dados) */}
        {!isLoading && userPhaseData && userPhaseData.totalEpisodes > 0 && (
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-purple-400" />
              <h3 className="font-bold text-white">Baseado no seu diário</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Episódios registrados</p>
                <p className="text-2xl font-bold text-white">{userPhaseData.totalEpisodes}</p>
              </div>
              
              {userPhaseData.detectedPhase && (
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">Fase predominante detectada</p>
                  <p className="text-2xl font-bold text-white">
                    {fases[userPhaseData.detectedPhase - 1]?.nome || 'Não identificada'}
                  </p>
                </div>
              )}
            </div>

            {userPhaseData.recentTags.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Tags recentes nos seus episódios:</p>
                <div className="flex flex-wrap gap-2">
                  {userPhaseData.recentTags.map((tag, i) => (
                    <span key={i} className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {userPhaseData.detectedPhase && (
              <div className="mt-4 p-3 bg-yellow-500/20 rounded-xl">
                <p className="text-yellow-200 text-sm">
                  ⚠️ Seus registros indicam padrões da <strong>Fase {userPhaseData.detectedPhase}: {fases[userPhaseData.detectedPhase - 1]?.nome}</strong>. 
                  Clique na fase acima para entender melhor.
                </p>
              </div>
            )}
          </div>
        )}

        {/* CTA para criar diário se não tiver */}
        {!isLoading && (!userPhaseData || userPhaseData.totalEpisodes === 0) && (
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-2xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <BookOpen className="w-10 h-10 text-blue-400" />
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-white">Registre seus episódios</h3>
                <p className="text-gray-400 text-sm">
                  O diário ajuda a identificar em qual fase do ciclo você está
                </p>
              </div>
              <Link
                href="/diario/novo"
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Criar registro
              </Link>
            </div>
          </div>
        )}

        {/* Aviso importante */}
        <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-300 mb-2">Importante saber</h3>
              <ul className="text-yellow-200 text-sm space-y-2">
                <li>• <strong>O ciclo se repete.</strong> Cada vez que volta, a fase de "lua de mel" fica mais curta.</li>
                <li>• <strong>Nem sempre é linear.</strong> Você pode pular fases ou voltar para fases anteriores.</li>
                <li>• <strong>A única forma de quebrar o ciclo é sair dele.</strong> Narcisistas raramente mudam.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-400 mb-6">
            Reconheceu alguma fase? O primeiro passo é a consciência.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/teste-claridade"
              className="inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Fazer Teste de Clareza <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              Conversar com Coach IA
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
