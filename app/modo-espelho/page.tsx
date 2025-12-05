'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, MessageCircle, Heart, Sparkles, Send, Loader2, History } from 'lucide-react'

// =============================================================================
// MODO ESPELHO - Salva reflexões no Supabase
// Exercício de auto-aconselhamento
// =============================================================================

interface Reflection {
  id: string
  situation: string
  advice: string
  created_at: string
}

export default function ModoEspelhoPage() {
  const [etapa, setEtapa] = useState(1)
  const [situacao, setSituacao] = useState('')
  const [conselho, setConselho] = useState('')
  const [revelado, setRevelado] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [pastReflections, setPastReflections] = useState<Reflection[]>([])
  const [showHistory, setShowHistory] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadPastReflections()
  }, [])

  const loadPastReflections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('mirror_reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (data) {
        setPastReflections(data)
      }
    } catch (error) {
      console.error('Erro ao carregar reflexões:', error)
    }
  }

  const handleProximo = async () => {
    if (etapa === 1 && situacao.trim()) {
      setEtapa(2)
    } else if (etapa === 2 && conselho.trim()) {
      // Salvar reflexão no Supabase
      setIsSaving(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('mirror_reflections')
            .insert({
              user_id: user.id,
              situation: situacao,
              advice: conselho
            })
        }
      } catch (error) {
        console.error('Erro ao salvar reflexão:', error)
      } finally {
        setIsSaving(false)
      }
      setRevelado(true)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Link>
        </div>

        {/* Título */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Modo Espelho
          </h1>
          <p className="text-lg text-gray-600">
            Às vezes, o melhor conselho vem de dentro de você
          </p>
        </div>

        {/* Etapa 1 - Descrever situação */}
        {etapa === 1 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl">1</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Conte sua situação</h2>
            </div>

            <p className="text-gray-600 mb-6">
              Descreva o que está acontecendo na sua relação. O que te incomoda? 
              O que te deixa confusa(o)? Não se preocupe, isso é só para você.
            </p>

            <textarea
              value={situacao}
              onChange={(e) => setSituacao(e.target.value)}
              placeholder="Exemplo: Meu parceiro sempre diz que eu exagero quando fico chateada. Ele fala que eu sou sensível demais e que o problema sou eu. Às vezes ele é muito carinhoso, mas depois fica frio e distante sem motivo..."
              className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none text-gray-700"
            />

            <button
              onClick={handleProximo}
              disabled={!situacao.trim()}
              className="w-full mt-6 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continuar <Send className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Etapa 2 - Dar conselho */}
        {etapa === 2 && !revelado && (
          <div className="bg-white rounded-3xl shadow-xl p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xl">2</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Agora imagine...</h2>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 mb-6">
              <p className="text-purple-800 text-lg">
                <strong>Sua melhor amiga</strong> te conta exatamente essa situação que você descreveu.
                Ela está confusa, triste, e pede sua opinião.
              </p>
            </div>

            <p className="text-gray-700 font-medium mb-4">
              O que você diria para ela? Que conselho você daria?
            </p>

            <textarea
              value={conselho}
              onChange={(e) => setConselho(e.target.value)}
              placeholder="Eu diria para ela que..."
              className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none text-gray-700"
            />

            <button
              onClick={handleProximo}
              disabled={!conselho.trim() || isSaving}
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  Ver Revelação <Sparkles className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Revelação */}
        {revelado && (
          <div className="space-y-6 animate-fade-in">
            {/* Card de revelação */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl shadow-xl p-8 text-white text-center">
              <Heart className="w-16 h-16 mx-auto mb-6 animate-pulse" />
              <h2 className="text-3xl font-bold mb-4">
                Agora leia o que você escreveu.
              </h2>
              <p className="text-xl text-purple-100">
                Esse conselho é para <strong className="text-white">VOCÊ</strong>.
              </p>
            </div>

            {/* O conselho */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <p className="text-sm text-purple-600 font-semibold mb-3">SEU CONSELHO PARA VOCÊ:</p>
              <blockquote className="text-xl text-gray-800 italic border-l-4 border-purple-500 pl-4">
                "{conselho}"
              </blockquote>
            </div>

            {/* Reflexão */}
            <div className="bg-yellow-50 rounded-3xl p-8 border-2 border-yellow-200">
              <h3 className="font-bold text-gray-900 mb-3">💡 Reflexão</h3>
              <p className="text-gray-700">
                Você sabia exatamente o que dizer. Lá no fundo, você sabe o que é certo para você.
                <br /><br />
                A diferença é que quando é com outra pessoa, você consegue ver com clareza.
                Quando é com você, a confusão emocional atrapalha.
                <br /><br />
                <strong>Mas a sabedoria está dentro de você.</strong>
              </p>
            </div>

            {/* Sua situação original */}
            <div className="bg-gray-50 rounded-3xl p-8">
              <p className="text-sm text-gray-500 font-semibold mb-3">SUA SITUAÇÃO:</p>
              <p className="text-gray-700">{situacao}</p>
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setEtapa(1)
                  setSituacao('')
                  setConselho('')
                  setRevelado(false)
                }}
                className="flex-1 bg-white border-2 border-purple-200 text-purple-700 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
              >
                Fazer Novamente
              </button>
              <Link
                href="/chat"
                className="flex-1 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors text-center flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Conversar com Coach IA
              </Link>
            </div>
          </div>
        )}

        {/* Citação */}
        {!revelado && (
          <div className="text-center mt-10">
            <p className="text-gray-500 italic">
              "Você já tem todas as respostas. Às vezes só precisa de um espelho para enxergá-las."
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
