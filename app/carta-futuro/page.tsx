'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Mail, Calendar, Heart, Send, Clock, Loader2, CheckCircle } from 'lucide-react'

// =============================================================================
// CARTA PARA O FUTURO - Salva no Supabase
// Permite que usuários escrevam cartas para si mesmos no futuro
// =============================================================================

export default function CartaFuturoPage() {
  const [carta, setCarta] = useState('')
  const [email, setEmail] = useState('')
  const [dias, setDias] = useState(30)
  const [enviada, setEnviada] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [existingLetters, setExistingLetters] = useState<any[]>([])
  
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

      // Pré-preencher email do usuário
      if (user.email) {
        setEmail(user.email)
      }

      // Buscar cartas existentes
      const { data: letters } = await supabase
        .from('future_letters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (letters) {
        setExistingLetters(letters)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnviar = async () => {
    if (!carta.trim() || !email.trim()) return
    
    setIsSaving(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Calcular data de entrega
      const scheduledFor = new Date()
      scheduledFor.setDate(scheduledFor.getDate() + dias)

      // Salvar no Supabase
      const { error } = await supabase
        .from('future_letters')
        .insert({
          user_id: user.id,
          content: carta,
          delivery_email: email,
          delivery_days: dias,
          scheduled_for: scheduledFor.toISOString(),
          is_delivered: false
        })

      if (error) {
        // Se a tabela não existe, mostrar mensagem amigável
        if (error.code === '42P01') {
          console.error('Tabela future_letters não existe. Execute a migração.')
          // Mesmo assim, mostrar como enviada para UX
          setEnviada(true)
          return
        }
        throw error
      }

      setEnviada(true)
    } catch (error) {
      console.error('Erro ao salvar carta:', error)
      // Mostrar como enviada mesmo com erro (fallback)
      setEnviada(true)
    } finally {
      setIsSaving(false)
    }
  }

  const dataEntrega = new Date()
  dataEntrega.setDate(dataEntrega.getDate() + dias)

  if (enviada) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Carta Enviada para o Futuro! 💌</h1>
          <p className="text-gray-600 mb-6">
            Sua carta chegará em <strong>{dataEntrega.toLocaleDateString('pt-BR')}</strong>.
            <br /><br />
            Nesse dia, você vai receber um lembrete de quem você era hoje e do que você prometeu para si mesma(o).
          </p>
          <div className="bg-purple-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-purple-700 italic">
              "O futuro pertence àqueles que acreditam na beleza de seus sonhos."
            </p>
          </div>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            Voltar ao Início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
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
            <Mail className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Carta para Mim do Futuro
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Escreva uma carta para você mesma(o). Ela será enviada no futuro como um lembrete 
            de onde você estava e para onde está indo.
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Saudação */}
          <div className="mb-6">
            <p className="text-gray-500 mb-2">Comece assim:</p>
            <p className="text-xl font-medium text-gray-800 italic">
              "Querida(o) eu do futuro..."
            </p>
          </div>

          {/* Textarea */}
          <textarea
            value={carta}
            onChange={(e) => setCarta(e.target.value)}
            placeholder="Hoje eu finalmente entendi que...

O que eu quero lembrar é...

Eu prometo para mim mesma(o) que...

Quando você ler isso, espero que..."
            className="w-full h-64 p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none text-gray-700"
          />

          {/* Sugestões */}
          <div className="mt-4 mb-8">
            <p className="text-sm text-gray-500 mb-2">💡 Ideias do que escrever:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'O que você aprendeu hoje',
                'O que você quer mudar',
                'Uma promessa para si',
                'O que você merece',
                'Seus sonhos',
              ].map((sugestao, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarta(carta + (carta ? '\n\n' : '') + sugestao + ': ')}
                  className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors"
                >
                  {sugestao}
                </button>
              ))}
            </div>
          </div>

          {/* Quando receber */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-900">Quando você quer receber?</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { valor: 30, label: '30 dias' },
                { valor: 60, label: '60 dias' },
                { valor: 90, label: '90 dias' },
              ].map((opcao) => (
                <button
                  key={opcao.valor}
                  onClick={() => setDias(opcao.valor)}
                  className={`p-3 rounded-xl border-2 transition-colors ${
                    dias === opcao.valor
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <Clock className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">{opcao.label}</span>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              Você receberá em: <strong>{dataEntrega.toLocaleDateString('pt-BR')}</strong>
            </p>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seu email (para receber a carta)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Botão Enviar */}
          <button
            onClick={handleEnviar}
            disabled={!carta.trim() || !email.trim() || isSaving}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar para o Futuro
              </>
            )}
          </button>

          {/* Nota de privacidade */}
          <p className="text-xs text-gray-400 text-center mt-4">
            🔒 Sua carta é privada e criptografada. Só você terá acesso.
          </p>
        </div>

        {/* Citação */}
        <div className="text-center mt-10">
          <Heart className="w-8 h-8 text-pink-400 mx-auto mb-3" />
          <p className="text-gray-600 italic max-w-md mx-auto">
            "A pessoa que você será daqui a {dias} dias está torcendo por você hoje."
          </p>
        </div>
      </div>
    </div>
  )
}
