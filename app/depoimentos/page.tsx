'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, Heart, Filter, Quote, User, Briefcase, Home, Users, Clock } from 'lucide-react'

interface Depoimento {
  id: string
  texto: string
  contexto: 'relacionamento' | 'trabalho' | 'familia' | 'idoso'
  anonimo: string
  tempo: string
  destaque?: boolean
}

const depoimentos: Depoimento[] = [
  // Relacionamento
  {
    id: '1',
    texto: 'Eu achava que estava ficando louca. Toda discussão terminava comigo pedindo desculpas, mesmo quando eu não tinha feito nada. O Teste de Clareza me mostrou que não era eu. Foi como tirar um véu dos olhos.',
    contexto: 'relacionamento',
    anonimo: 'M., 34 anos',
    tempo: '8 anos de relacionamento',
    destaque: true
  },
  {
    id: '2',
    texto: 'Ele dizia que me amava, mas controlava tudo: meu dinheiro, minhas roupas, com quem eu falava. Quando finalmente entendi o padrão, consegui planejar minha saída com segurança.',
    contexto: 'relacionamento',
    anonimo: 'A., 29 anos',
    tempo: '5 anos de relacionamento'
  },
  {
    id: '3',
    texto: 'O ciclo de lua de mel me mantinha preso. Ele explodia, depois era o homem mais carinhoso do mundo. Demorei anos para entender que isso ERA o abuso, não apesar dele.',
    contexto: 'relacionamento',
    anonimo: 'R., 41 anos',
    tempo: '12 anos de relacionamento'
  },
  // Trabalho
  {
    id: '4',
    texto: 'Meu chefe me humilhava em reuniões, mas sempre em tom de "brincadeira". Quando eu reclamava, ele dizia que eu não tinha senso de humor. O Diário me ajudou a documentar tudo para o RH.',
    contexto: 'trabalho',
    anonimo: 'C., 38 anos',
    tempo: '3 anos no emprego',
    destaque: true
  },
  {
    id: '5',
    texto: 'Ela se apropriava das minhas ideias e depois me culpava pelos erros dela. Eu estava desenvolvendo ansiedade e síndrome do impostor. Registrar os episódios me deu clareza e provas.',
    contexto: 'trabalho',
    anonimo: 'P., 32 anos',
    tempo: '2 anos no emprego'
  },
  // Família
  {
    id: '6',
    texto: 'Minha mãe sempre me comparou com minha irmã. Nada que eu fazia era bom o suficiente. Aos 35 anos, finalmente entendi que o problema nunca foi eu. Foi libertador.',
    contexto: 'familia',
    anonimo: 'L., 35 anos',
    tempo: 'Vida toda',
    destaque: true
  },
  {
    id: '7',
    texto: 'Meu pai controlava tudo com dinheiro. Se eu discordava dele, cortava minha mesada, meu plano de saúde. Aprendi que isso tem nome: abuso financeiro.',
    contexto: 'familia',
    anonimo: 'T., 28 anos',
    tempo: 'Desde a adolescência'
  },
  {
    id: '8',
    texto: 'Cresci achando que era "difícil" e "problemática". Depois de adulta, percebi que meus pais usavam gaslighting comigo desde criança. A terapia + o app me ajudaram muito.',
    contexto: 'familia',
    anonimo: 'J., 42 anos',
    tempo: 'Vida toda'
  },
  // Idoso
  {
    id: '9',
    texto: 'Meu filho controla minha aposentadoria. Diz que é "para meu bem", mas eu não posso comprar nada sem pedir. Me sinto uma criança aos 72 anos.',
    contexto: 'idoso',
    anonimo: 'D., 72 anos',
    tempo: '5 anos',
    destaque: true
  },
  {
    id: '10',
    texto: 'Minha nora me trata como se eu fosse um estorvo. Faz comentários maldosos e depois diz que estou "inventando". Meu filho não acredita em mim.',
    contexto: 'idoso',
    anonimo: 'M., 68 anos',
    tempo: '3 anos'
  }
]

const contextos = {
  relacionamento: { 
    label: 'Relacionamento', 
    emoji: '💔', 
    cor: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
    icon: Heart
  },
  trabalho: { 
    label: 'Trabalho', 
    emoji: '💼', 
    cor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    icon: Briefcase
  },
  familia: { 
    label: 'Família', 
    emoji: '👨‍👩‍👧', 
    cor: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    icon: Home
  },
  idoso: { 
    label: 'Idosos', 
    emoji: '👵', 
    cor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    icon: Users
  }
}

export default function DepoimentosPage() {
  const [filtroAtivo, setFiltroAtivo] = useState<string | null>(null)

  const depoimentosFiltrados = filtroAtivo 
    ? depoimentos.filter(d => d.contexto === filtroAtivo)
    : depoimentos

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-purple-950 pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 hover:bg-white/50 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-purple-500" />
              Histórias Reais
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Você não está sozinha(o)</p>
          </div>
        </div>

        {/* Aviso */}
        <div className="bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            💜 Estes são depoimentos reais de pessoas que passaram por situações similares. 
            Todos os nomes foram alterados para proteger a identidade.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFiltroAtivo(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              filtroAtivo === null
                ? 'bg-purple-500 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Filter className="h-4 w-4" />
            Todos ({depoimentos.length})
          </button>
          {Object.entries(contextos).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setFiltroAtivo(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                filtroAtivo === key
                  ? 'bg-purple-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{value.emoji}</span>
              {value.label} ({depoimentos.filter(d => d.contexto === key).length})
            </button>
          ))}
        </div>

        {/* Depoimentos em Destaque */}
        {filtroAtivo === null && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">✨ Em Destaque</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {depoimentos.filter(d => d.destaque).map((dep) => (
                <div 
                  key={dep.id}
                  className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white"
                >
                  <Quote className="h-8 w-8 opacity-50 mb-3" />
                  <p className="text-white/95 mb-4 leading-relaxed">{dep.texto}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 opacity-70" />
                      <span className="text-sm opacity-90">{dep.anonimo}</span>
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {contextos[dep.contexto].emoji} {contextos[dep.contexto].label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Depoimentos */}
        <div className="space-y-4">
          {depoimentosFiltrados.filter(d => !d.destaque || filtroAtivo !== null).map((dep) => (
            <div 
              key={dep.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${contextos[dep.contexto].cor}`}>
                  {(() => {
                    const IconComponent = contextos[dep.contexto].icon
                    return <IconComponent className="h-5 w-5" />
                  })()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${contextos[dep.contexto].cor}`}>
                      {contextos[dep.contexto].emoji} {contextos[dep.contexto].label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {dep.tempo}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    "{dep.texto}"
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {dep.anonimo}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl p-6 text-center">
          <Heart className="h-8 w-8 text-pink-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sua história importa</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Você não está sozinha(o). Milhares de pessoas passam pelo mesmo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/teste-clareza"
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Fazer Teste de Clareza
            </Link>
            <Link
              href="/chat"
              className="px-6 py-2 border border-purple-500 text-purple-500 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              Conversar com Coach
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
