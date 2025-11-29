import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, AlertTriangle, Brain, MessageCircle, Shield, BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'O que é Gaslighting? Sinais, Exemplos e Como se Proteger | Radar Narcisista',
  description: 'Entenda o que é gaslighting, como identificar os sinais de manipulação psicológica, exemplos reais de frases e como se proteger desse tipo de abuso emocional.',
  keywords: 'gaslighting, manipulação psicológica, abuso emocional, sinais de gaslighting, frases de gaslighting, como identificar gaslighting',
  openGraph: {
    title: 'O que é Gaslighting? Guia Completo',
    description: 'Aprenda a identificar gaslighting e proteja sua saúde mental.',
    type: 'article',
  }
}

export default function GaslightingPage() {
  const sinais = [
    { emoji: '🤔', titulo: 'Você questiona sua memória', desc: 'Começa a duvidar de coisas que tem certeza que aconteceram.' },
    { emoji: '😰', titulo: 'Sente que está "ficando louca(o)"', desc: 'A pessoa te faz acreditar que você está exagerando ou inventando.' },
    { emoji: '🙊', titulo: 'Pede desculpas o tempo todo', desc: 'Mesmo quando não fez nada de errado, você se sente culpado(a).' },
    { emoji: '🔇', titulo: 'Seus sentimentos são invalidados', desc: '"Você é muito sensível", "Isso não aconteceu assim".' },
    { emoji: '🎭', titulo: 'A pessoa nega o que disse', desc: '"Eu nunca disse isso", mesmo quando você tem certeza.' },
    { emoji: '😶', titulo: 'Você se isola', desc: 'Evita contar para outros porque acha que não vão acreditar.' },
  ]

  const frases = [
    '"Você está inventando coisas"',
    '"Isso nunca aconteceu"',
    '"Você é muito sensível"',
    '"Ninguém mais pensa assim"',
    '"Você está louca/louco"',
    '"Eu nunca disse isso"',
    '"Você está exagerando"',
    '"Todo mundo concorda comigo"',
  ]

  const protecao = [
    { titulo: 'Registre os episódios', desc: 'Anote o que aconteceu, quando e como você se sentiu. Isso ajuda a validar sua percepção.' },
    { titulo: 'Confie na sua memória', desc: 'Se você lembra que algo aconteceu, provavelmente aconteceu. Não deixe ninguém te convencer do contrário.' },
    { titulo: 'Busque apoio externo', desc: 'Converse com pessoas de confiança ou profissionais. Perspectivas externas ajudam.' },
    { titulo: 'Estabeleça limites', desc: 'Você não precisa aceitar ser tratado(a) assim. Limites são saudáveis.' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-gray-900">Entenda o Abuso</span>
          </div>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero do Artigo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 mb-6">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-700 font-medium">Manipulação Psicológica</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            O que é <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Gaslighting</span>?
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Uma forma de abuso psicológico onde a pessoa manipula você para duvidar 
            da sua própria percepção, memória e sanidade.
          </p>
        </div>

        {/* Definição */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Definição</h2>
              <p className="text-gray-700 leading-relaxed">
                <strong>Gaslighting</strong> é uma forma de manipulação psicológica onde o abusador 
                faz a vítima questionar sua própria realidade, memória e percepções. O termo vem do 
                filme "Gaslight" (1944), onde um marido manipula a esposa para fazê-la acreditar que 
                está ficando louca.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                É uma das táticas mais comuns em relacionamentos com pessoas narcisistas, mas pode 
                acontecer em qualquer tipo de relação: romântica, familiar, profissional ou de amizade.
              </p>
            </div>
          </div>
        </section>

        {/* Sinais */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Sinais de que você está sofrendo gaslighting
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {sinais.map((sinal, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{sinal.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{sinal.titulo}</h3>
                    <p className="text-sm text-gray-600">{sinal.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Frases Comuns */}
        <section className="bg-red-50 rounded-2xl p-8 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-red-500" />
            Frases típicas de gaslighting
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {frases.map((frase, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 text-center">
                <p className="text-sm text-gray-700 italic">{frase}</p>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-red-700 mt-6 text-center">
            Se você ouve essas frases com frequência, pode estar em um relacionamento abusivo.
          </p>
        </section>

        {/* Como se Proteger */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-500" />
            Como se proteger do gaslighting
          </h2>
          
          <div className="space-y-4">
            {protecao.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
                <h3 className="font-semibold text-gray-900 mb-2">{idx + 1}. {item.titulo}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Quer entender melhor sua situação?
          </h2>
          <p className="text-purple-100 mb-6 max-w-xl mx-auto">
            Faça nosso Teste de Clareza gratuito e descubra se você está vivendo 
            padrões de abuso emocional em seus relacionamentos.
          </p>
          <Link 
            href="/teste-clareza"
            className="inline-flex items-center gap-2 bg-white text-purple-700 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
          >
            Fazer o Teste de Clareza
            <ChevronRight className="w-5 h-5" />
          </Link>
        </section>

        {/* Artigos Relacionados */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Leia também</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/triangulacao" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-1">Triangulação</h3>
              <p className="text-sm text-gray-600">Quando usam terceiros para manipular você</p>
            </Link>
            <Link href="/love-bombing" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-1">Love Bombing</h3>
              <p className="text-sm text-gray-600">O bombardeio de amor no início da relação</p>
            </Link>
            <Link href="/ciclo-abuso" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-1">Ciclo do Abuso</h3>
              <p className="text-sm text-gray-600">Entenda as fases do relacionamento abusivo</p>
            </Link>
          </div>
        </section>
      </article>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p className="mb-2">
            Este conteúdo é informativo e não substitui acompanhamento profissional.
          </p>
          <p>
            Em caso de emergência, ligue <strong className="text-white">188</strong> (CVV) ou <strong className="text-white">190</strong> (Polícia).
          </p>
        </div>
      </footer>
    </div>
  )
}
