'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import type { FaqItem } from '@/lib/frontpage-content'

// ============================================================================
// FAQ DINÂMICO - Perguntas frequentes do banco de dados
// ETAPA 8.4: FanPage Viva
// ============================================================================

interface Props {
  items: FaqItem[]
  theme?: 'light' | 'dark' | 'high-contrast'
}

export default function FaqDinamicoSection({ items, theme = 'dark' }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  if (!items || items.length === 0) {
    return null // Não renderiza se não houver FAQs
  }

  return (
    <section className={`py-16 md:py-20 ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-white'}`}>
      <div className="container-app">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            Perguntas Frequentes
          </div>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Dúvidas que Mais Aparecem
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Respostas para as perguntas mais comuns sobre o Radar Narcisista
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {items.map((item, index) => {
            const isOpen = openIndex === index

            return (
              <div
                key={item.id}
                className={`rounded-xl overflow-hidden transition-all ${
                  theme === 'dark' 
                    ? 'bg-slate-800/50 border border-slate-700/50' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className={`w-full flex items-center justify-between p-5 text-left transition-colors ${
                    theme === 'dark' 
                      ? 'hover:bg-slate-700/50' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className={`font-medium pr-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {item.title_pt}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 flex-shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                  />
                </button>
                
                {isOpen && (
                  <div className={`px-5 pb-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className={`pt-2 border-t ${theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'}`}>
                      {item.body_pt || item.summary_pt || 'Resposta em breve.'}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="text-center mt-8">
          <a 
            href="/faq" 
            className={`inline-flex items-center gap-2 font-medium ${
              theme === 'dark' ? 'text-violet-400 hover:text-violet-300' : 'text-purple-600 hover:text-purple-700'
            }`}
          >
            Ver todas as perguntas →
          </a>
        </div>
      </div>
    </section>
  )
}
