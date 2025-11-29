import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, AlertTriangle, RefreshCw, Heart, Shield, BookOpen, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ciclo do Abuso Narcisista: As 4 Fases do Relacionamento Tóxico | Radar Narcisista',
  description: 'Entenda as 4 fases do ciclo de abuso narcisista: idealização, desvalorização, descarte e hoovering. Saiba por que é tão difícil sair e como quebrar o ciclo.',
  keywords: 'ciclo do abuso, fases do narcisismo, relacionamento tóxico, idealização, desvalorização, descarte, hoovering',
  openGraph: {
    title: 'As 4 Fases do Ciclo de Abuso Narcisista',
    description: 'Entenda por que é tão difícil sair de um relacionamento abusivo.',
    type: 'article',
  }
}

export default function CicloAbusoPage() {
  const fases = [
    {
      numero: 1,
      titulo: 'Idealização (Love Bombing)',
      cor: 'pink',
      emoji: '💕',
      duracao: 'Semanas a meses',
      descricao: 'Você é tratada(o) como a pessoa mais especial do mundo. Presentes, atenção constante, declarações de amor intensas.',
      sinais: [
        '"Você é diferente de todas as outras pessoas"',
        'Planos de futuro muito rápidos',
        'Atenção 24 horas por dia',
        'Parece bom demais para ser verdade',
      ],
      sentimento: 'Euforia, sensação de ter encontrado "a pessoa certa"'
    },
    {
      numero: 2,
      titulo: 'Desvalorização',
      cor: 'orange',
      emoji: '😔',
      duracao: 'Meses a anos',
      descricao: 'Gradualmente, você nunca é boa(bom) o suficiente. Críticas, comparações, gaslighting e manipulação começam.',
      sinais: [
        'Críticas constantes (aparência, trabalho, família)',
        'Comparações com ex ou outras pessoas',
        'Tratamento silencioso como punição',
        'Você "anda em ovos" para não irritar',
      ],
      sentimento: 'Confusão, culpa, ansiedade, tentando "recuperar" a pessoa do início'
    },
    {
      numero: 3,
      titulo: 'Descarte',
      cor: 'red',
      emoji: '💔',
      duracao: 'Dias a semanas',
      descricao: 'Você é descartada(o) de forma abrupta e cruel. Pode ser um término, traição revelada, ou simplesmente ser ignorada(o).',
      sinais: [
        'Término sem explicação ou com crueldade',
        'Já tem outra pessoa (às vezes há meses)',
        'Age como se você nunca tivesse existido',
        'Fala mal de você para todos',
      ],
      sentimento: 'Devastação, choque, não entende o que aconteceu'
    },
    {
      numero: 4,
      titulo: 'Hoovering (Aspirador)',
      cor: 'purple',
      emoji: '🔄',
      duracao: 'Dias a meses depois',
      descricao: 'A pessoa volta com promessas de mudança, pedidos de desculpa, ou simplesmente aparece como se nada tivesse acontecido.',
      sinais: [
        '"Eu mudei, dessa vez vai ser diferente"',
        'Mensagens "inocentes" (aniversário, foto antiga)',
        'Aparece em lugares que você frequenta',
        'Usa terceiros para chegar até você',
      ],
      sentimento: 'Esperança misturada com medo, vontade de acreditar'
    },
  ]

  const porqueDificil = [
    { titulo: 'Trauma Bond', desc: 'O ciclo de carinho e abuso cria um vínculo químico no cérebro, similar a uma dependência.' },
    { titulo: 'Intermittent Reinforcement', desc: 'Recompensas imprevisíveis (momentos bons) são mais viciantes que recompensas constantes.' },
    { titulo: 'Gaslighting', desc: 'Você foi condicionada(o) a duvidar da própria percepção e memória.' },
    { titulo: 'Isolamento', desc: 'Muitas vezes você foi afastada(o) de amigos e família que poderiam ajudar.' },
    { titulo: 'Vergonha', desc: 'Medo de julgamento por ter "ficado" ou por não conseguir sair.' },
    { titulo: 'Esperança', desc: 'Você ainda acredita que a pessoa do início pode voltar (ela não existe).' },
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 mb-6">
            <RefreshCw className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-purple-700 font-medium">Padrão de Relacionamento</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            O <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Ciclo do Abuso</span> Narcisista
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Entenda as 4 fases que se repetem em relacionamentos com pessoas narcisistas 
            e por que é tão difícil quebrar esse ciclo.
          </p>
        </div>

        {/* Diagrama Visual */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">As 4 Fases do Ciclo</h2>
          
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            {fases.map((fase, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-white ${
                  fase.cor === 'pink' ? 'bg-pink-500' :
                  fase.cor === 'orange' ? 'bg-orange-500' :
                  fase.cor === 'red' ? 'bg-red-500' :
                  'bg-purple-500'
                }`}>
                  <span className="text-2xl">{fase.emoji}</span>
                  <span className="text-xs font-medium text-center px-2">{fase.titulo.split(' ')[0]}</span>
                </div>
                {idx < 3 && <ArrowRight className="w-6 h-6 text-gray-300 mx-2" />}
              </div>
            ))}
          </div>
          
          <p className="text-center text-gray-500 text-sm">
            <RefreshCw className="w-4 h-4 inline mr-1" />
            O ciclo se repete indefinidamente, cada vez mais intenso
          </p>
        </section>

        {/* Fases Detalhadas */}
        <section className="space-y-6 mb-10">
          {fases.map((fase, idx) => (
            <div key={idx} className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 ${
              fase.cor === 'pink' ? 'border-pink-500' :
              fase.cor === 'orange' ? 'border-orange-500' :
              fase.cor === 'red' ? 'border-red-500' :
              'border-purple-500'
            }`}>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
                    fase.cor === 'pink' ? 'bg-pink-500' :
                    fase.cor === 'orange' ? 'bg-orange-500' :
                    fase.cor === 'red' ? 'bg-red-500' :
                    'bg-purple-500'
                  }`}>
                    {fase.numero}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{fase.titulo}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {fase.duracao}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{fase.descricao}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Sinais típicos:</h4>
                        <ul className="space-y-1">
                          {fase.sinais.map((sinal, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-gray-400">•</span>
                              {sinal}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className={`rounded-lg p-4 ${
                        fase.cor === 'pink' ? 'bg-pink-50' :
                        fase.cor === 'orange' ? 'bg-orange-50' :
                        fase.cor === 'red' ? 'bg-red-50' :
                        'bg-purple-50'
                      }`}>
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Como você se sente:</h4>
                        <p className="text-sm text-gray-700">{fase.sentimento}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Por que é difícil sair */}
        <section className="bg-gray-900 text-white rounded-2xl p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            Por que é tão difícil sair?
          </h2>
          
          <p className="text-gray-300 mb-6">
            Se você está se perguntando "por que eu não consigo simplesmente ir embora?", 
            saiba que não é fraqueza. Existem razões psicológicas e neurológicas reais:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {porqueDificil.map((item, idx) => (
              <div key={idx} className="bg-white/10 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-1">{item.titulo}</h3>
                <p className="text-sm text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Como quebrar o ciclo */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-500" />
            Como quebrar o ciclo
          </h2>
          
          <div className="bg-green-50 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h3 className="font-semibold text-gray-900">Reconheça o padrão</h3>
                <p className="text-sm text-gray-600">Você já deu esse passo ao ler isso. Conhecimento é poder.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h3 className="font-semibold text-gray-900">Registre os episódios</h3>
                <p className="text-sm text-gray-600">Anote o que acontece. Isso ajuda a ver o padrão e validar sua percepção.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h3 className="font-semibold text-gray-900">Busque apoio externo</h3>
                <p className="text-sm text-gray-600">Terapeuta, amigos de confiança, grupos de apoio. Você não precisa fazer isso sozinha(o).</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div>
                <h3 className="font-semibold text-gray-900">Planeje sua saída com segurança</h3>
                <p className="text-sm text-gray-600">Se necessário, prepare-se financeira e emocionalmente antes de sair.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Quer entender melhor sua situação?
          </h2>
          <p className="text-purple-100 mb-6 max-w-xl mx-auto">
            Faça nosso Teste de Clareza gratuito e identifique em qual fase 
            do ciclo você pode estar.
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
            <Link href="/love-bombing" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-1">Love Bombing</h3>
              <p className="text-sm text-gray-600">O bombardeio de amor no início da relação</p>
            </Link>
            <Link href="/gaslighting" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-1">Gaslighting</h3>
              <p className="text-sm text-gray-600">Quando te fazem duvidar da própria sanidade</p>
            </Link>
            <Link href="/triangulacao" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-1">Triangulação</h3>
              <p className="text-sm text-gray-600">Quando usam terceiros para manipular você</p>
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
