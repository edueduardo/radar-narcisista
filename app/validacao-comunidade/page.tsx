'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Send, ThumbsUp, AlertCircle, HelpCircle, Eye, MessageCircle } from 'lucide-react'

// Histórias simuladas da comunidade
const historiasSimuladas = [
  {
    id: 1,
    texto: "Meu parceiro sempre diz que eu exagero quando fico chateada com algo. Ontem ele gritou comigo na frente dos nossos amigos e depois disse que eu estava inventando, que ele só 'levantou a voz'. Quando eu chorei, ele disse que eu estava fazendo drama.",
    votos: { verde: 12, amarelo: 45, vermelho: 187 },
    totalVotos: 244,
    tempo: '2 horas atrás'
  },
  {
    id: 2,
    texto: "Minha namorada controla meu celular e minhas redes sociais. Ela diz que é porque me ama e não quer me perder. Quando eu reclamo, ela chora e diz que vou abandoná-la como todo mundo fez.",
    votos: { verde: 8, amarelo: 34, vermelho: 156 },
    totalVotos: 198,
    tempo: '5 horas atrás'
  },
  {
    id: 3,
    texto: "Meu marido é super carinhoso em público, mas em casa fica dias sem falar comigo quando eu faço algo que ele não gosta. Ele nunca me bate, mas o silêncio dele me machuca muito.",
    votos: { verde: 15, amarelo: 67, vermelho: 134 },
    totalVotos: 216,
    tempo: '1 dia atrás'
  },
]

export default function ValidacaoComunidadePage() {
  const [minhaHistoria, setMinhaHistoria] = useState('')
  const [enviada, setEnviada] = useState(false)
  const [votosUsuario, setVotosUsuario] = useState<Record<number, string>>({})

  const handleEnviar = () => {
    if (minhaHistoria.trim()) {
      setEnviada(true)
    }
  }

  const handleVotar = (historiaId: number, voto: string) => {
    setVotosUsuario(prev => ({ ...prev, [historiaId]: voto }))
  }

  const getPercentual = (votos: { verde: number; amarelo: number; vermelho: number }, tipo: string) => {
    const total = votos.verde + votos.amarelo + votos.vermelho
    const valor = votos[tipo as keyof typeof votos]
    return Math.round((valor / total) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Validação da Comunidade
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compartilhe sua situação anonimamente e veja o que outras pessoas pensam.
            Às vezes precisamos de olhos externos para enxergar com clareza.
          </p>
        </div>

        {/* Compartilhar História */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-purple-600" />
            Compartilhe Sua Situação
          </h2>

          {!enviada ? (
            <>
              <p className="text-gray-600 mb-4">
                Descreva o que está acontecendo. Sua história será compartilhada <strong>anonimamente</strong> 
                e outras pessoas vão dar sua opinião.
              </p>
              <textarea
                value={minhaHistoria}
                onChange={(e) => setMinhaHistoria(e.target.value)}
                placeholder="Descreva a situação que te deixa confusa(o)..."
                className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
              />
              <button
                onClick={handleEnviar}
                disabled={!minhaHistoria.trim()}
                className="mt-4 w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Enviar Anonimamente
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                🔒 100% anônimo. Nenhuma informação pessoal é compartilhada.
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">História Enviada!</h3>
              <p className="text-gray-600 mb-4">
                Sua história está sendo avaliada pela comunidade. 
                Você receberá uma notificação quando tiver respostas.
              </p>
              <button
                onClick={() => { setEnviada(false); setMinhaHistoria('') }}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Enviar outra história
              </button>
            </div>
          )}
        </div>

        {/* Histórias da Comunidade */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Histórias da Comunidade</h2>
          <p className="text-gray-600">Vote e ajude outras pessoas a encontrar clareza</p>
        </div>

        <div className="space-y-6">
          {historiasSimuladas.map((historia) => (
            <div key={historia.id} className="bg-white rounded-3xl shadow-xl overflow-hidden">
              {/* História */}
              <div className="p-6">
                <p className="text-gray-700 mb-4">{historia.texto}</p>
                <p className="text-xs text-gray-400">{historia.tempo} • {historia.totalVotos} votos</p>
              </div>

              {/* Votação */}
              {!votosUsuario[historia.id] ? (
                <div className="border-t border-gray-100 p-4">
                  <p className="text-sm text-gray-600 mb-3 text-center">O que você acha dessa situação?</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleVotar(historia.id, 'verde')}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors border-2 border-transparent hover:border-green-300"
                    >
                      <ThumbsUp className="w-6 h-6 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Parece saudável</span>
                    </button>
                    <button
                      onClick={() => handleVotar(historia.id, 'amarelo')}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-colors border-2 border-transparent hover:border-yellow-300"
                    >
                      <HelpCircle className="w-6 h-6 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-700">Tenho dúvidas</span>
                    </button>
                    <button
                      onClick={() => handleVotar(historia.id, 'vermelho')}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors border-2 border-transparent hover:border-red-300"
                    >
                      <AlertCircle className="w-6 h-6 text-red-600" />
                      <span className="text-sm font-medium text-red-700">Me preocupa</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-3 text-center">Resultado da comunidade:</p>
                  
                  {/* Barra de resultados */}
                  <div className="flex h-8 rounded-full overflow-hidden mb-3">
                    <div 
                      className="bg-green-500 flex items-center justify-center text-white text-xs font-bold"
                      style={{ width: `${getPercentual(historia.votos, 'verde')}%` }}
                    >
                      {getPercentual(historia.votos, 'verde') > 10 && `${getPercentual(historia.votos, 'verde')}%`}
                    </div>
                    <div 
                      className="bg-yellow-500 flex items-center justify-center text-white text-xs font-bold"
                      style={{ width: `${getPercentual(historia.votos, 'amarelo')}%` }}
                    >
                      {getPercentual(historia.votos, 'amarelo') > 10 && `${getPercentual(historia.votos, 'amarelo')}%`}
                    </div>
                    <div 
                      className="bg-red-500 flex items-center justify-center text-white text-xs font-bold"
                      style={{ width: `${getPercentual(historia.votos, 'vermelho')}%` }}
                    >
                      {getPercentual(historia.votos, 'vermelho') > 10 && `${getPercentual(historia.votos, 'vermelho')}%`}
                    </div>
                  </div>

                  {/* Legenda */}
                  <div className="flex justify-center gap-6 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-green-500 rounded" />
                      Saudável ({getPercentual(historia.votos, 'verde')}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-yellow-500 rounded" />
                      Dúvidas ({getPercentual(historia.votos, 'amarelo')}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-red-500 rounded" />
                      Preocupa ({getPercentual(historia.votos, 'vermelho')}%)
                    </span>
                  </div>

                  {/* Mensagem se maioria votou vermelho */}
                  {getPercentual(historia.votos, 'vermelho') > 50 && (
                    <div className="mt-4 p-3 bg-red-100 rounded-xl">
                      <p className="text-sm text-red-700 text-center">
                        <strong>{getPercentual(historia.votos, 'vermelho')}% das pessoas</strong> que leram essa história 
                        ficaram preocupadas. Isso pode ser um sinal importante.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Aviso */}
        <div className="mt-10 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-blue-800 mb-2">💡 Lembre-se</h3>
          <p className="text-blue-700 text-sm">
            A opinião da comunidade é uma ferramenta de reflexão, não um diagnóstico. 
            Se você está em dúvida sobre sua situação, considere conversar com um profissional de saúde mental.
          </p>
        </div>
      </div>
    </div>
  )
}
