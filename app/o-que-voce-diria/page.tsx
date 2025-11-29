'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, MessageCircle, Sparkles, ChevronRight } from 'lucide-react'

// Histórias para reflexão
const historias = [
  {
    id: 1,
    nome: 'Ana',
    idade: 32,
    historia: `Meu marido diz que me ama, mas quando eu faço algo que ele não gosta, ele fica dias sem falar comigo. 
    
Ele nunca me bateu, mas as palavras dele me machucam muito. Ele diz que eu sou dramática, que exagero em tudo, que ninguém mais me aguentaria.

Às vezes ele é tão carinhoso que eu penso que estou inventando os problemas. Mas depois ele volta a ser frio e cruel.

Eu não sei mais o que é real. Será que o problema sou eu?`,
  },
  {
    id: 2,
    nome: 'Carlos',
    idade: 45,
    historia: `Minha esposa controla tudo na minha vida. Meu celular, minhas amizades, até quanto tempo eu passo com minha família.

Quando eu reclamo, ela chora e diz que é porque me ama demais. Que tem medo de me perder.

Meus amigos dizem que isso não é normal, mas ela diz que eles querem nos separar.

Eu me sinto preso, mas tenho vergonha de admitir isso. Homem não deveria se sentir assim, né?`,
  },
  {
    id: 3,
    nome: 'Juliana',
    idade: 28,
    historia: `Meu namorado é incrível em público. Todo mundo acha ele perfeito.

Mas em casa, ele me critica o tempo todo. Minha roupa, meu cabelo, meu trabalho, minha família. Nada que eu faço é bom o suficiente.

Quando eu tento terminar, ele promete mudar. Fica carinhoso por uma semana. Depois volta tudo ao normal.

Já tentei sair 5 vezes. Sempre volto. O que há de errado comigo?`,
  },
]

export default function OQueVoceDiriaPage() {
  const [etapa, setEtapa] = useState(1)
  const [historiaAtual, setHistoriaAtual] = useState(0)
  const [conselho, setConselho] = useState('')
  const [revelado, setRevelado] = useState(false)

  const historia = historias[historiaAtual]

  const handleProximo = () => {
    if (etapa === 1) {
      setEtapa(2)
    } else if (etapa === 2 && conselho.trim()) {
      setRevelado(true)
    }
  }

  const reiniciar = () => {
    setEtapa(1)
    setConselho('')
    setRevelado(false)
    setHistoriaAtual((prev) => (prev + 1) % historias.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
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
            <Heart className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            O Que Você Diria?
          </h1>
          <p className="text-lg text-gray-600">
            Um exercício de autocompaixão
          </p>
        </div>

        {/* Etapa 1 - Mostrar história */}
        {etapa === 1 && !revelado && (
          <div className="bg-white rounded-3xl shadow-xl p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900">{historia.nome}, {historia.idade} anos</h2>
                <p className="text-sm text-gray-500">Compartilhou sua história</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {historia.historia}
              </p>
            </div>

            <button
              onClick={handleProximo}
              className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              Li a história <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Etapa 2 - Pedir conselho */}
        {etapa === 2 && !revelado && (
          <div className="bg-white rounded-3xl shadow-xl p-8 animate-fade-in">
            <div className="text-center mb-6">
              <MessageCircle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {historia.nome} te pediu um conselho
              </h2>
              <p className="text-gray-600">
                O que você diria para ela(e)?
              </p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-4 mb-6">
              <p className="text-purple-800 text-sm italic">
                "{historia.nome} está confusa(o) e precisa de alguém que a(o) ajude a enxergar a situação com clareza. 
                O que você diria?"
              </p>
            </div>

            <textarea
              value={conselho}
              onChange={(e) => setConselho(e.target.value)}
              placeholder={`${historia.nome}, eu diria para você que...`}
              className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none text-gray-700"
            />

            <button
              onClick={handleProximo}
              disabled={!conselho.trim()}
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Ver Revelação
            </button>
          </div>
        )}

        {/* Revelação */}
        {revelado && (
          <div className="space-y-6 animate-fade-in">
            {/* Card de revelação */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl shadow-xl p-8 text-white text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                Agora leia o que você escreveu.
              </h2>
              <p className="text-xl text-purple-100">
                Esse conselho é para <strong className="text-white">VOCÊ</strong>.
              </p>
            </div>

            {/* O conselho */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <p className="text-sm text-purple-600 font-semibold mb-3">O QUE VOCÊ DISSE:</p>
              <blockquote className="text-xl text-gray-800 italic border-l-4 border-purple-500 pl-4">
                "{conselho}"
              </blockquote>
            </div>

            {/* Reflexão */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-8 border-2 border-yellow-200">
              <h3 className="font-bold text-gray-900 mb-4 text-xl">💡 Percebeu?</h3>
              <p className="text-gray-700 leading-relaxed">
                Você sabia <strong>exatamente</strong> o que dizer para {historia.nome}.
                <br /><br />
                Quando é com outra pessoa, você consegue ver com clareza. 
                Você sabe identificar o que é abuso, o que é manipulação, o que não é amor saudável.
                <br /><br />
                <strong>Por que é tão difícil aplicar isso a você mesma(o)?</strong>
                <br /><br />
                Porque quando estamos dentro da situação, a confusão emocional nos cega. 
                Mas a sabedoria está aí, dentro de você. Você só precisa ouvir.
              </p>
            </div>

            {/* A história era sobre você */}
            <div className="bg-purple-100 rounded-3xl p-8 text-center">
              <Heart className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <p className="text-purple-800 text-lg">
                <strong>Trate a si mesma(o) com o mesmo amor e clareza 
                que você daria a uma amiga querida.</strong>
              </p>
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={reiniciar}
                className="flex-1 bg-white border-2 border-purple-200 text-purple-700 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
              >
                Fazer com outra história
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
      </div>
    </div>
  )
}
