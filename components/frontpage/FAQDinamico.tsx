'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

interface FAQ {
  id: string
  slug: string
  title: string
  summary: string
  body?: string
}

interface FAQDinamicoProps {
  faqs?: FAQ[]
}

export default function FAQDinamico({ faqs = [] }: FAQDinamicoProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  if (faqs.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ❓ Perguntas Frequentes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dúvidas mais comuns da nossa comunidade
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={faq.id}
              className="border border-gray-200 rounded-xl overflow-hidden hover:border-purple-300 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <span className="font-medium text-gray-900">{faq.title}</span>
                </div>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4 pt-2 bg-gray-50">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.body || faq.summary}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
