import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, AlertTriangle, Heart, Gift, MessageCircle, Shield, BookOpen, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'O que é Love Bombing? Sinais do Bombardeio de Amor | Radar Narcisista',
  description: 'Entenda o que é love bombing, como identificar esse bombardeio de amor excessivo no início do relacionamento e por que é um sinal de alerta.',
  keywords: 'love bombing, bombardeio de amor, narcisismo, início de relacionamento, sinais de abuso, manipulação romântica',
  openGraph: {
    title: 'Love Bombing: O Bombardeio de Amor que Esconde Manipulação',
    description: 'Aprenda a diferenciar amor genuíno de manipulação disfarçada.',
    type: 'article',
  }
}

export default function LoveBombingPage() {
  const sinais = [
    { emoji: '💝', titulo: 'Declarações de amor muito rápidas', desc: '"Te amo" nas primeiras semanas ou até dias de relacionamento.' },
    { emoji: '🎁', titulo: 'Presentes excessivos', desc: 'Presentes caros ou frequentes demais para o estágio da relação.' },
    { emoji: '📱', titulo: 'Contato constante', desc: 'Mensagens e ligações o tempo todo, querendo saber onde você está.' },
    { emoji: '🏃', titulo: 'Pressa para compromisso', desc: 'Quer morar junto, noivar ou casar muito rapidamente.' },
    { emoji: '🌟', titulo: 'Idealização extrema', desc: '"Você é perfeita", "Nunca conheci ninguém como você".' },
    { emoji: '🔮', titulo: 'Planos de futuro imediatos', desc: 'Fala de filhos, casamento, viagens antes de realmente te conhecer.' },
  ]

  const diferencas = [
    { 
      loveBombing: 'Intensidade desde o primeiro momento',
      amorReal: 'Cresce gradualmente com o tempo'
    },
    { 
      loveBombing: 'Ignora seus limites e espaço',
      amorReal: 'Respeita seu tempo e individualidade'
    },
    { 
      loveBombing: 'Você se sente sufocada(o)',
      amorReal: 'Você se sente confortável e livre'
    },
    { 
      loveBombing: 'Fica com raiva se você não responde rápido',
      amorReal: 'Entende que você tem sua vida'
    },
    { 
      loveBombing: 'Te isola de amigos e família',
      amorReal: 'Quer conhecer as pessoas importantes pra você'
    },
  ]

  const fases = [
    { fase: '1', titulo: 'Love Bombing', desc: 'Bombardeio de amor, atenção e presentes. Você se sente especial e única(o).', cor: 'pink' },
    { fase: '2', titulo: 'Desvalorização', desc: 'Críticas começam. Você nunca é boa(bom) o suficiente. Confusão e culpa.', cor: 'orange' },
    { fase: '3', titulo: 'Descarte', desc: 'Afastamento, tratamento silencioso, ou término abrupto.', cor: 'red' },
    { fase: '4', titulo: 'Hoovering', desc: 'Volta com promessas de mudança. O ciclo recomeça.', cor: 'purple' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 border border-pink-200 mb-6">
            <Heart className="w-4 h-4 text-pink-500" />
            <span className="text-sm text-pink-700 font-medium">Manipulação Romântica</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            O que é <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Love Bombing</span>?
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            O "bombardeio de amor" que parece um conto de fadas, 
            mas pode ser o primeiro sinal de um relacionamento abusivo.
          </p>
        </div>

        {/* Definição */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Definição</h2>
              <p className="text-gray-700 leading-relaxed">
                <strong>Love Bombing</strong> (bombardeio de amor) é uma tática de manipulação onde 
                a pessoa te inunda com atenção excessiva, declarações de amor, presentes e promessas 
                no início do relacionamento. Parece um conto de fadas, mas o objetivo é criar 
                dependência emocional rapidamente.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                É a primeira fase do ciclo de abuso narcisista. Depois que você está "fisgada(o)", 
                vem a desvalorização. E você fica tentando recuperar aquela pessoa maravilhosa do início 
                – que nunca existiu de verdade.
              </p>
            </div>
          </div>
        </section>

        {/* Sinais */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Sinais de Love Bombing
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

        {/* Diferenças */}
        <section className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Heart className="w-6 h-6 text-pink-500" />
            Love Bombing vs Amor Real
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center font-semibold text-sm mb-2">
              <div className="text-red-600">❌ Love Bombing</div>
              <div className="text-green-600">✅ Amor Real</div>
            </div>
            {diferencas.map((item, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 rounded-lg p-3 text-sm text-red-700">
                  {item.loveBombing}
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-sm text-green-700">
                  {item.amorReal}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ciclo */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            O Ciclo do Relacionamento Narcisista
          </h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            {fases.map((item, idx) => (
              <div key={idx} className={`bg-white rounded-xl p-5 shadow-sm border-t-4 ${
                item.cor === 'pink' ? 'border-pink-500' :
                item.cor === 'orange' ? 'border-orange-500' :
                item.cor === 'red' ? 'border-red-500' :
                'border-purple-500'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mb-3 ${
                  item.cor === 'pink' ? 'bg-pink-500' :
                  item.cor === 'orange' ? 'bg-orange-500' :
                  item.cor === 'red' ? 'bg-red-500' :
                  'bg-purple-500'
                }`}>
                  {item.fase}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.titulo}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <p className="text-center text-gray-500 mt-4 text-sm">
            O ciclo se repete indefinidamente até que você consiga sair.
          </p>
        </section>

        {/* Alerta */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">Importante lembrar</h3>
              <p className="text-yellow-700 text-sm">
                Se você está no início de um relacionamento e tudo parece "bom demais para ser verdade", 
                preste atenção. Amor saudável cresce com o tempo, não explode do nada. 
                Confie nos seus instintos – se algo parece estranho, provavelmente é.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Está vivendo algo parecido?
          </h2>
          <p className="text-purple-100 mb-6 max-w-xl mx-auto">
            Faça nosso Teste de Clareza gratuito e entenda melhor os padrões 
            do seu relacionamento.
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
            <Link href="/triangulacao" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-1">Triangulação</h3>
              <p className="text-sm text-gray-600">Quando usam terceiros para manipular você</p>
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
