'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, ExternalLink, AlertTriangle, Heart, Shield, Users } from 'lucide-react'

interface Conceito {
  id: string
  termo: string
  emoji: string
  definicaoSimples: string
  explicacaoDetalhada: string
  exemplos: string[]
  comoIdentificar: string[]
  oQueFazer: string[]
  fontes: { nome: string; link?: string }[]
}

const conceitos: Conceito[] = [
  {
    id: 'gaslighting',
    termo: 'Gaslighting',
    emoji: '💨',
    definicaoSimples: 'Quando alguém te faz duvidar da sua própria memória e percepção. Você começa a achar que está ficando louca(o).',
    explicacaoDetalhada: `Gaslighting é uma forma de manipulação psicológica onde a pessoa faz você questionar sua própria realidade. O termo vem de uma peça de teatro de 1938 chamada "Gas Light", onde um marido manipulava a esposa fazendo ela acreditar que estava enlouquecendo.

O objetivo do gaslighting é fazer você depender totalmente da "versão da realidade" da outra pessoa. Quando você não confia mais na sua própria percepção, fica muito mais fácil de ser controlada(o).`,
    exemplos: [
      '"Isso nunca aconteceu, você está inventando"',
      '"Eu nunca disse isso, você está confundindo as coisas"',
      '"Você está louca, isso é coisa da sua cabeça"',
      '"Todo mundo concorda comigo, só você que não vê"',
      '"Você tem memória ruim, não lembra direito"'
    ],
    comoIdentificar: [
      'Você se sente confusa(o) frequentemente após conversas',
      'Você começa a duvidar da sua própria memória',
      'Você se pega pedindo desculpas o tempo todo',
      'Você sente que está "ficando louca(o)"',
      'Você grava conversas para provar que não inventou'
    ],
    oQueFazer: [
      'Confie na sua percepção - se você lembra, aconteceu',
      'Anote o que acontece (diário) para ter registro',
      'Converse com pessoas de confiança sobre as situações',
      'Busque ajuda profissional (psicólogo/terapeuta)',
      'Considere se afastar da pessoa que faz isso'
    ],
    fontes: [
      { nome: 'Dr. Robin Stern - "The Gaslight Effect"', link: 'https://www.drrobinstern.com' },
      { nome: 'Psychology Today - Gaslighting', link: 'https://www.psychologytoday.com/us/basics/gaslighting' },
      { nome: 'National Domestic Violence Hotline' }
    ]
  },
  {
    id: 'lovebombing',
    termo: 'Love Bombing',
    emoji: '🔥',
    definicaoSimples: 'Quando alguém te enche de amor, atenção e presentes no começo do relacionamento. Parece um conto de fadas, mas é uma armadilha.',
    explicacaoDetalhada: `Love Bombing (Bombardeio de Amor) é uma tática de manipulação onde a pessoa te cobre de atenção excessiva, declarações de amor intensas, presentes e promessas logo no início do relacionamento.

Parece romântico, mas o objetivo é criar uma dependência emocional rápida. Você se sente tão especial e amada(o) que fica "viciada(o)" nessa sensação. Quando o love bombing para (e sempre para), você faz de tudo para ter aquela sensação de volta.`,
    exemplos: [
      'Dizer "eu te amo" na primeira semana',
      'Mandar 50+ mensagens por dia',
      'Presentes caros logo no início',
      'Falar em casamento/filhos muito cedo',
      'Querer estar junto 24 horas por dia',
      '"Nunca senti isso por ninguém"',
      'Planejar o futuro inteiro em semanas'
    ],
    comoIdentificar: [
      'Tudo parece intenso demais, rápido demais',
      'Você se sente "a pessoa mais especial do mundo"',
      'A pessoa quer exclusividade imediata',
      'Você sente que está num filme de romance',
      'Amigos/família acham que está indo rápido demais'
    ],
    oQueFazer: [
      'Desacelere - relacionamentos saudáveis crescem devagar',
      'Mantenha sua vida independente (amigos, hobbies)',
      'Observe se a intensidade se mantém ou diminui',
      'Converse com pessoas de confiança sobre o relacionamento',
      'Lembre: amor de verdade não precisa de pressa'
    ],
    fontes: [
      { nome: 'Dr. Ramani Durvasula - "Should I Stay or Should I Go?"' },
      { nome: 'Healthline - Love Bombing', link: 'https://www.healthline.com/health/love-bombing' },
      { nome: 'Verywell Mind - Signs of Love Bombing' }
    ]
  },
  {
    id: 'ciclo-abuso',
    termo: 'Ciclo do Abuso',
    emoji: '🔄',
    definicaoSimples: 'Um padrão que se repete: tensão, explosão, lua de mel, e começa tudo de novo. A cada volta, a fase boa fica mais curta.',
    explicacaoDetalhada: `O Ciclo do Abuso foi identificado pela psicóloga Lenore Walker em 1979. É um padrão que se repete em relacionamentos abusivos e tem 4 fases:

1. TENSÃO: Clima pesado, você "anda em ovos", sente que algo vai explodir
2. EXPLOSÃO: A briga, o abuso (verbal, emocional ou físico)
3. LUA DE MEL: Desculpas, promessas de mudança, carinho intenso
4. CALMARIA: Tudo parece "normal" por um tempo

O problema é que o ciclo sempre se repete, e a cada volta a fase de lua de mel fica mais curta e as explosões ficam piores.`,
    exemplos: [
      'Semana tensa → Briga feia → "Desculpa, eu te amo" → 2 semanas bem → Repete',
      'Você sente que "anda em ovos" esperando a próxima explosão',
      'Após brigas, a pessoa fica super carinhosa e promete mudar',
      'Você pensa "dessa vez vai ser diferente" mas nunca é'
    ],
    comoIdentificar: [
      'Você consegue prever quando a "bomba vai explodir"',
      'Após brigas, sempre vem um período de "lua de mel"',
      'As promessas de mudança nunca se concretizam',
      'O tempo entre as crises está diminuindo',
      'Você se pega esperando a próxima briga'
    ],
    oQueFazer: [
      'Reconheça o padrão - isso é o primeiro passo',
      'Entenda que promessas não são mudanças reais',
      'Busque ajuda profissional',
      'Crie um plano de segurança',
      'Considere seriamente sair do relacionamento'
    ],
    fontes: [
      { nome: 'Lenore Walker - "The Battered Woman" (1979)' },
      { nome: 'National Domestic Violence Hotline', link: 'https://www.thehotline.org' },
      { nome: 'Instituto Maria da Penha (Brasil)' }
    ]
  },
  {
    id: 'triangulacao',
    termo: 'Triangulação',
    emoji: '🎭',
    definicaoSimples: 'Quando a pessoa usa terceiros (ex, amigos, família) para criar ciúmes, insegurança e te fazer competir pela atenção dela.',
    explicacaoDetalhada: `Triangulação é quando o narcisista traz uma terceira pessoa para o relacionamento de vocês dois. Pode ser um(a) ex, um(a) colega de trabalho, ou até um familiar.

O objetivo é fazer você se sentir insegura(o), com ciúmes, e "lutando" pela atenção da pessoa. Enquanto você está preocupada(o) com a "ameaça", não percebe a manipulação acontecendo.`,
    exemplos: [
      '"Minha ex nunca reclamava disso"',
      'Falar muito de uma colega de trabalho "incrível"',
      'Comparar você com outras pessoas constantemente',
      'Flertar com outros na sua frente',
      'Contar que outras pessoas te criticaram'
    ],
    comoIdentificar: [
      'Você se sente em constante competição',
      'A pessoa sempre menciona outras que "fazem melhor"',
      'Você sente ciúmes frequentemente (e a pessoa alimenta isso)',
      'Terceiros são usados para validar críticas a você'
    ],
    oQueFazer: [
      'Reconheça a tática - não entre na competição',
      'Não tente "provar" que é melhor que outros',
      'Estabeleça limites claros sobre comparações',
      'Lembre: em relacionamentos saudáveis, não há competição'
    ],
    fontes: [
      { nome: 'Dr. Ramani Durvasula - YouTube Channel' },
      { nome: 'Psychology Today - Triangulation' }
    ]
  },
  {
    id: 'isolamento',
    termo: 'Isolamento',
    emoji: '🚫',
    definicaoSimples: 'Quando a pessoa te afasta aos poucos de amigos e família, até você ficar sozinha(o) e dependente só dela.',
    explicacaoDetalhada: `O isolamento é uma tática gradual. A pessoa não diz "não fale mais com sua família". Ela faz isso aos poucos, de formas sutis:

- Critica seus amigos e família
- Cria conflitos quando você quer sair
- Faz você escolher entre ela e outros
- Monopoliza seu tempo
- Faz você se sentir culpada(o) por ter vida social

Quando você percebe, está sozinha(o), sem rede de apoio, e totalmente dependente da pessoa.`,
    exemplos: [
      '"Sua amiga não gosta de mim, você vai ter que escolher"',
      '"Sua família te influencia mal"',
      'Ficar de mau humor quando você sai com amigos',
      'Criar brigas antes de eventos sociais',
      'Monopolizar todo seu tempo livre'
    ],
    comoIdentificar: [
      'Você vê amigos e família cada vez menos',
      'Você se sente culpada(o) por querer sair',
      'A pessoa critica todas as suas relações',
      'Você perdeu hobbies e interesses próprios'
    ],
    oQueFazer: [
      'Reconecte-se com amigos e família',
      'Mantenha atividades independentes',
      'Não aceite ultimatos ("eu ou eles")',
      'Sua rede de apoio é sua proteção'
    ],
    fontes: [
      { nome: 'National Domestic Violence Hotline' },
      { nome: 'Instituto Maria da Penha' }
    ]
  },
  {
    id: 'hoovering',
    termo: 'Hoovering',
    emoji: '🧲',
    definicaoSimples: 'Quando você tenta sair e a pessoa te "suga" de volta com promessas, lágrimas, ou até ameaças. Como um aspirador de pó.',
    explicacaoDetalhada: `O termo vem da marca de aspirador "Hoover" - a pessoa te "suga" de volta para o relacionamento quando você tenta sair.

Pode vir de várias formas:
- Promessas de mudança
- Declarações de amor intensas
- Ameaças de se machucar
- Aparecer "por acaso" nos seus lugares
- Usar filhos, amigos ou família para te alcançar

O hoovering acontece porque o narcisista não quer perder o controle sobre você.`,
    exemplos: [
      '"Eu mudei, dessa vez é diferente"',
      '"Não consigo viver sem você"',
      'Mandar presentes, cartas, mensagens',
      'Aparecer no seu trabalho ou casa',
      'Usar os filhos para te manipular',
      'Ameaçar se machucar se você não voltar'
    ],
    comoIdentificar: [
      'Sempre que você tenta sair, a pessoa "muda"',
      'As promessas duram pouco tempo',
      'A pessoa não respeita seus limites',
      'Você se sente "sugada(o)" de volta'
    ],
    oQueFazer: [
      'Mantenha contato zero se possível',
      'Não responda mensagens ou ligações',
      'Bloqueie em todas as redes sociais',
      'Avise amigos e família sobre a situação',
      'Se houver ameaças, procure ajuda legal'
    ],
    fontes: [
      { nome: 'Dr. Ramani Durvasula' },
      { nome: 'Psych Central - Hoovering' }
    ]
  }
]

export default function EducacaoPage() {
  const [expandido, setExpandido] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">O Que é Abuso Narcisista?</h1>
            <p className="text-sm text-gray-500">Explicado de forma simples, com exemplos</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Introdução */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Para quem é esta página?</h2>
              <p className="text-gray-600 mb-4">
                Esta página foi feita para explicar de forma <strong>simples e clara</strong> o que é abuso narcisista. 
                Você não precisa ter estudado psicologia para entender. Usamos exemplos do dia a dia e linguagem acessível.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">✓ Linguagem simples</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">✓ Exemplos reais</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">✓ Fontes confiáveis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conceitos */}
        <div className="space-y-4">
          {conceitos.map(conceito => (
            <div key={conceito.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandido(expandido === conceito.id ? null : conceito.id)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{conceito.emoji}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{conceito.termo}</h3>
                    <p className="text-gray-600 text-sm mt-1">{conceito.definicaoSimples}</p>
                  </div>
                </div>
                {expandido === conceito.id ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </button>

              {expandido === conceito.id && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  {/* Explicação Detalhada */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-500" />
                      Explicação Completa
                    </h4>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {conceito.explicacaoDetalhada}
                    </p>
                  </div>

                  {/* Exemplos */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Exemplos de Frases/Situações
                    </h4>
                    <div className="bg-orange-50 rounded-xl p-4">
                      <ul className="space-y-2">
                        {conceito.exemplos.map((ex, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700">
                            <span className="text-orange-500 mt-1">•</span>
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Como Identificar */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-500" />
                      Como Identificar
                    </h4>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <ul className="space-y-2">
                        {conceito.comoIdentificar.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700">
                            <span className="text-blue-500 mt-1">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* O Que Fazer */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-green-500" />
                      O Que Fazer
                    </h4>
                    <div className="bg-green-50 rounded-xl p-4">
                      <ul className="space-y-2">
                        {conceito.oQueFazer.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700">
                            <span className="text-green-500 mt-1">→</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Fontes */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-gray-500" />
                      Fontes e Referências
                    </h4>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <ul className="space-y-2">
                        {conceito.fontes.map((fonte, i) => (
                          <li key={i} className="text-gray-600 text-sm">
                            {fonte.link ? (
                              <a href={fonte.link} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                                {fonte.nome} ↗
                              </a>
                            ) : (
                              fonte.nome
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Final */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Você se identificou com algo?</h3>
          <p className="mb-6 text-purple-100">
            Reconhecer é o primeiro passo. Você não está sozinha(o) e não é sua culpa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/teste-clareza" className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
              Fazer Teste de Clareza
            </Link>
            <Link href="/chat" className="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-400 transition-colors">
              Conversar com IA
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
