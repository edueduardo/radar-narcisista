'use client'

/**
 * Perguntas da Semana
 * Ideia Diamante #5: Chat → mini-artigos → FAQ viva
 * Mostra as dúvidas mais frequentes do chat transformadas em conteúdo
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  MessageCircle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Sparkles,
  ArrowRight,
  HelpCircle
} from 'lucide-react'

interface WeeklyQuestion {
  id: string
  question: string
  answer: string
  category: string
  frequency: number
  isNew?: boolean
}

// Perguntas estáticas (em produção, viriam do banco via agregação do chat)
const WEEKLY_QUESTIONS: WeeklyQuestion[] = [
  {
    id: '1',
    question: 'Como saber se estou sofrendo gaslighting?',
    answer: 'Gaslighting é quando alguém faz você duvidar da sua própria percepção da realidade. Sinais comuns incluem: você se sente confusa frequentemente, pede desculpas o tempo todo mesmo sem ter feito nada errado, sente que está "ficando louca", e suas memórias são constantemente questionadas. Se você precisa "provar" que algo aconteceu, pode ser gaslighting.',
    category: 'Manipulação',
    frequency: 847,
    isNew: true
  },
  {
    id: '2',
    question: 'É normal sentir saudade do abusador?',
    answer: 'Sim, é completamente normal e não significa que você é fraca. O trauma bonding (vínculo traumático) é uma resposta neurológica real. O ciclo de abuso cria picos de dopamina durante as fases "boas", criando uma dependência emocional. Sentir saudade não invalida o abuso que você sofreu.',
    category: 'Emocional',
    frequency: 623
  },
  {
    id: '3',
    question: 'Como explicar para minha família o que estou vivendo?',
    answer: 'Muitas vezes a família não entende porque narcisistas são mestres em parecer encantadores em público. Comece compartilhando exemplos específicos de comportamentos, não diagnósticos. Use frases como "quando ele faz X, eu me sinto Y". Considere enviar artigos educativos. Lembre-se: você não precisa convencer ninguém para validar sua experiência.',
    category: 'Relacionamentos',
    frequency: 512
  },
  {
    id: '4',
    question: 'Posso usar meus registros como prova judicial?',
    answer: 'Registros datados e consistentes podem ter valor probatório como evidência documental. O Radar Narcisista implementa cadeia de custódia com hash criptográfico para garantir integridade. Porém, consulte sempre um advogado sobre admissibilidade no seu caso específico. Quanto mais detalhes (datas, horários, testemunhas), melhor.',
    category: 'Jurídico',
    frequency: 489
  },
  {
    id: '5',
    question: 'Como proteger meus filhos durante a separação?',
    answer: 'Priorize a segurança física e emocional. Documente tudo, mantenha comunicação por escrito, evite falar mal do outro genitor na frente das crianças. Considere terapia infantil com profissional especializado em alienação parental. Em casos de risco, busque medidas protetivas. Seu plano de segurança deve incluir os filhos.',
    category: 'Família',
    frequency: 456,
    isNew: true
  }
]

const CATEGORY_COLORS: Record<string, string> = {
  'Manipulação': 'bg-purple-100 text-purple-700',
  'Emocional': 'bg-pink-100 text-pink-700',
  'Relacionamentos': 'bg-blue-100 text-blue-700',
  'Jurídico': 'bg-amber-100 text-amber-700',
  'Família': 'bg-green-100 text-green-700',
  'Segurança': 'bg-red-100 text-red-700'
}

export default function PerguntasDaSemana() {
  const [questions, setQuestions] = useState<WeeklyQuestion[]>(WEEKLY_QUESTIONS)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const displayedQuestions = showAll ? questions : questions.slice(0, 3)

  return (
    <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            <MessageCircle className="w-4 h-4" />
            Perguntas da Semana
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            O Que Mais Perguntam no Chat
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dúvidas reais de pessoas como você, transformadas em respostas que ajudam. 
            Atualizado semanalmente com base nas conversas do chat.
          </p>
        </div>

        {/* Lista de perguntas */}
        <div className="space-y-4">
          {displayedQuestions.map((q) => (
            <div 
              key={q.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Pergunta (sempre visível) */}
              <button
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                className="w-full flex items-start gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-purple-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[q.category] || 'bg-gray-100 text-gray-700'}`}>
                      {q.category}
                    </span>
                    {q.isNew && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Nova
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 pr-8">
                    {q.question}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <TrendingUp className="w-3 h-3" />
                    {q.frequency} pessoas perguntaram isso
                  </div>
                </div>

                <div className="flex-shrink-0 mt-1">
                  {expandedId === q.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Resposta (expandível) */}
              {expandedId === q.id && (
                <div className="px-5 pb-5 pt-0">
                  <div className="pl-14">
                    <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <p className="text-gray-700 leading-relaxed">
                        {q.answer}
                      </p>
                    </div>
                    
                    {/* Links relacionados */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link 
                        href="/chat"
                        className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        Conversar sobre isso
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <span className="text-gray-300">•</span>
                      <Link 
                        href={`/academy?topic=${encodeURIComponent(q.category.toLowerCase())}`}
                        className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        Aprender mais
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ver mais / menos */}
        {questions.length > 3 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-3 text-purple-600 hover:text-purple-700 font-medium"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Ver todas as {questions.length} perguntas
                </>
              )}
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">
            Não encontrou sua dúvida?
          </p>
          <Link 
            href="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            Pergunte no Chat
          </Link>
        </div>
      </div>
    </section>
  )
}
