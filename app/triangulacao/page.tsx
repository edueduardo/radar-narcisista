import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, AlertTriangle, Users, MessageCircle, Shield, BookOpen, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'O que é Triangulação? Como Narcisistas Usam Terceiros | Radar Narcisista',
  description: 'Entenda o que é triangulação narcisista, como funciona essa tática de manipulação que usa terceiros para controlar você, e como se proteger.',
  keywords: 'triangulação narcisista, manipulação com terceiros, abuso emocional, narcisismo, como identificar triangulação',
  openGraph: {
    title: 'Triangulação Narcisista: O que é e Como se Proteger',
    description: 'Aprenda a identificar quando usam terceiros para manipular você.',
    type: 'article',
  }
}

export default function TriangulacaoPage() {
  const tipos = [
    { 
      emoji: '💔', 
      titulo: 'Triangulação Romântica', 
      desc: 'Menciona ex-parceiros ou fala de outras pessoas atraentes para provocar ciúmes e insegurança.',
      exemplo: '"Minha ex nunca reclamava disso" ou "Fulana me entende melhor que você"'
    },
    { 
      emoji: '👨‍👩‍👧', 
      titulo: 'Triangulação Familiar', 
      desc: 'Usa filhos, pais ou outros familiares para passar mensagens ou criar conflitos.',
      exemplo: '"Sua mãe concorda comigo" ou "As crianças preferem ficar comigo"'
    },
    { 
      emoji: '👥', 
      titulo: 'Triangulação Social', 
      desc: 'Envolve amigos em comum ou colegas para validar seu ponto de vista.',
      exemplo: '"Todo mundo acha que você está errada" ou "Perguntei para X e ele concorda comigo"'
    },
    { 
      emoji: '💼', 
      titulo: 'Triangulação Profissional', 
      desc: 'No trabalho, usa chefes ou colegas para minar sua credibilidade.',
      exemplo: '"O chefe também acha que você não está rendendo" ou fofocas sobre você'
    },
  ]

  const sinais = [
    'Você sente ciúmes ou insegurança frequentes sem motivo aparente',
    'A pessoa sempre menciona outras pessoas para comparar você',
    'Você descobre que ela fala de você para terceiros de forma negativa',
    'Sente que precisa "competir" pela atenção ou aprovação',
    'Terceiros te procuram para "resolver" conflitos do casal',
    'A pessoa usa filhos como mensageiros ou armas emocionais',
  ]

  const protecao = [
    { titulo: 'Reconheça o padrão', desc: 'Perceba quando terceiros estão sendo usados para manipular suas emoções.' },
    { titulo: 'Não entre na competição', desc: 'Você não precisa provar seu valor comparando-se a outros.' },
    { titulo: 'Comunique-se diretamente', desc: 'Recuse-se a receber mensagens através de terceiros.' },
    { titulo: 'Proteja as crianças', desc: 'Se há filhos envolvidos, não os use como intermediários.' },
    { titulo: 'Busque apoio profissional', desc: 'Um terapeuta pode ajudar a lidar com essa dinâmica.' },
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-6">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-blue-700 font-medium">Manipulação com Terceiros</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            O que é <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Triangulação</span>?
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Uma tática de manipulação onde o abusador envolve terceiros para 
            controlar, provocar ciúmes ou validar seu comportamento.
          </p>
        </div>

        {/* Definição */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Definição</h2>
              <p className="text-gray-700 leading-relaxed">
                <strong>Triangulação</strong> é uma forma de manipulação psicológica onde uma pessoa 
                introduz um terceiro elemento (outra pessoa, real ou imaginária) na dinâmica do 
                relacionamento para criar insegurança, ciúmes ou para validar seu próprio comportamento.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                É uma das táticas favoritas de pessoas com traços narcisistas porque permite 
                controlar a vítima através de comparações, competição e medo de abandono.
              </p>
            </div>
          </div>
        </section>

        {/* Tipos de Triangulação */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Tipos de Triangulação
          </h2>
          
          <div className="space-y-4">
            {tipos.map((tipo, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{tipo.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{tipo.titulo}</h3>
                    <p className="text-gray-600 mb-3">{tipo.desc}</p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-500 italic">Exemplo: {tipo.exemplo}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sinais */}
        <section className="bg-orange-50 rounded-2xl p-8 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Sinais de que você está sendo triangulado(a)
          </h2>
          
          <ul className="space-y-3">
            {sinais.map((sinal, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-700 text-sm font-bold">{idx + 1}</span>
                </div>
                <p className="text-gray-700">{sinal}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Como se Proteger */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-500" />
            Como se proteger da triangulação
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {protecao.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
                <h3 className="font-semibold text-gray-900 mb-2">{item.titulo}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Nota sobre Filhos */}
        <section className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-4">
            <Heart className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-800 mb-2">Atenção: Triangulação com Filhos</h3>
              <p className="text-red-700 text-sm">
                Quando filhos são usados como intermediários ou armas emocionais, os danos podem ser 
                profundos e duradouros. Se você está nessa situação, busque orientação profissional 
                (psicólogo e/ou advogado) para proteger as crianças e a si mesmo(a).
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Reconhece esses padrões na sua vida?
          </h2>
          <p className="text-purple-100 mb-6 max-w-xl mx-auto">
            Faça nosso Teste de Clareza gratuito e entenda melhor o que está 
            acontecendo nos seus relacionamentos.
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
            <Link href="/gaslighting" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-1">Gaslighting</h3>
              <p className="text-sm text-gray-600">Quando te fazem duvidar da própria sanidade</p>
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
