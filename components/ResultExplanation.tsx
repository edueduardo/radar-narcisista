'use client'

import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, Heart, Phone } from 'lucide-react'
import type { UnifiedResult } from '@/lib/clarity-unified-config'

interface Props { result: UnifiedResult; isDarkMode: boolean }

export default function ResultExplanation({ result, isDarkMode }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const t = {
    bg: isDarkMode ? 'bg-slate-900' : 'bg-white',
    border: isDarkMode ? 'border-slate-700' : 'border-gray-200',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    textBody: isDarkMode ? 'text-gray-300' : 'text-gray-700',
    tipBg: isDarkMode ? 'bg-emerald-900/30 border-emerald-700' : 'bg-emerald-50 border-emerald-200',
    warnBg: isDarkMode ? 'bg-amber-900/30 border-amber-700' : 'bg-amber-50 border-amber-200',
    dangerBg: isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200',
  }
  const pct = (n: number) => Math.round(n * 100)
  const nevoa = result.axisScores.find(a => a.axis === 'nevoa')
  const medo = result.axisScores.find(a => a.axis === 'medo')
  const limites = result.axisScores.find(a => a.axis === 'limites')
  const nevoaPct = nevoa ? pct(nevoa.percentage) : 0
  const medoPct = medo ? pct(medo.percentage) : 0
  const limitesPct = limites ? pct(limites.percentage) : 0
  const sortedCategories = [...result.categoryScores].sort((a, b) => b.percentage - a.percentage)
  const overallPct = pct(result.overallPercentage)

  const getZoneStory = () => {
    if (result.globalZone === 'atencao') return { emoji: '🟡', title: 'Zona de Atencao', story: 'Voce esta na Zona de Atencao. Algumas coisas merecem um olhar mais cuidadoso.' }
    if (result.globalZone === 'alerta') return { emoji: '🟠', title: 'Zona de Alerta', story: 'Voce esta na Zona de Alerta. Isso e serio e merece sua atencao.' }
    return { emoji: '🔴', title: 'Zona Vermelha', story: 'Voce esta na Zona Vermelha. A situacao e grave. Por favor, busque apoio.' }
  }

  const zone = getZoneStory()

  return (
    <div className={t.bg + ' rounded-2xl border-2 ' + (isOpen ? (isDarkMode ? 'border-violet-500' : 'border-purple-400') : t.border) + ' overflow-hidden mb-8'}>
      <button onClick={() => setIsOpen(!isOpen)} className={'w-full p-4 sm:p-6 flex items-center justify-between gap-4 ' + (isOpen ? (isDarkMode ? 'bg-violet-900/20' : 'bg-purple-50') : '')}>
        <div className='flex items-center gap-3 sm:gap-4'>
          <div className={'p-3 sm:p-4 rounded-2xl ' + (isDarkMode ? 'bg-violet-600/20' : 'bg-purple-100')}>
            <MessageCircle className={'w-6 h-6 sm:w-8 sm:h-8 ' + (isDarkMode ? 'text-violet-400' : 'text-purple-600')} />
          </div>
          <div className='text-left'>
            <h3 className={'font-bold text-lg sm:text-xl ' + t.text}>🤔 O que isso significa pra mim?</h3>
            <p className={'text-sm sm:text-base ' + t.textMuted}>Clique para entender seu resultado</p>
          </div>
        </div>
        <div className={'p-2 sm:p-3 rounded-full ' + (isDarkMode ? 'bg-slate-800' : 'bg-gray-100')}>
          {isOpen ? <ChevronUp className={'w-5 h-5 ' + t.textMuted} /> : <ChevronDown className={'w-5 h-5 ' + t.textMuted} />}
        </div>
      </button>
      {isOpen && (
        <div className='p-4 sm:p-6 space-y-6 border-t border-dashed border-slate-600/30'>
          <div className={t.tipBg + ' p-4 rounded-xl border'}>
            <div className='flex items-start gap-3'>
              <Heart className={'w-6 h-6 flex-shrink-0 ' + (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')} />
              <div>
                <p className={'font-medium text-base sm:text-lg ' + (isDarkMode ? 'text-emerald-300' : 'text-emerald-800')}>Vamos conversar sobre seu resultado</p>
                <p className={'text-sm sm:text-base mt-1 ' + (isDarkMode ? 'text-emerald-400' : 'text-emerald-700')}>Leia com calma. Estou aqui para te ajudar a entender.</p>
              </div>
            </div>
          </div>
          <div className='space-y-3'>
            <h4 className={'text-lg sm:text-xl font-bold ' + t.text}>{zone.emoji} Sua Situacao: {zone.title}</h4>
            <p className={'text-base sm:text-lg ' + t.textBody}>Voce fez <strong>{result.overallScore} pontos</strong> de {result.maxOverallScore} ({overallPct}%).</p>
            <div className={(isDarkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-blue-50 border-blue-200') + ' p-4 rounded-xl border'}>
              <p className={t.textBody}>{zone.story}</p>
            </div>
          </div>
          <div className='space-y-3'>
            <h4 className={'text-lg font-bold ' + t.text}>🧠 Nevoa Mental ({nevoaPct}%)</h4>
            <div className={(isDarkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-blue-50 border-blue-200') + ' p-4 rounded-xl border'}>
              <p className={t.textBody}>{nevoaPct < 40 ? 'Voce parece ter clareza sobre o que acontece.' : 'Voce esta sentindo confusao. Isso pode ser gaslighting - quando alguem distorce a realidade para te fazer duvidar de si mesma.'}</p>
            </div>
          </div>
          <div className='space-y-3'>
            <h4 className={'text-lg font-bold ' + t.text}>😰 Medo e Tensao ({medoPct}%)</h4>
            <div className={(isDarkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-blue-50 border-blue-200') + ' p-4 rounded-xl border'}>
              <p className={t.textBody}>{medoPct < 40 ? 'Voce parece se sentir segura para se expressar.' : 'Voce esta vivendo com medo. Provavelmente pisa em ovos para nao irritar a pessoa. Isso nao e normal.'}</p>
            </div>
          </div>
          <div className='space-y-3'>
            <h4 className={'text-lg font-bold ' + t.text}>🛡️ Seus Limites ({limitesPct}%)</h4>
            <div className={(isDarkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-blue-50 border-blue-200') + ' p-4 rounded-xl border'}>
              <p className={t.textBody}>{limitesPct < 40 ? 'Seus limites parecem ser respeitados.' : 'Seus limites estao sendo desrespeitados. Quando voce diz nao, a pessoa ignora. Isso nao e amor.'}</p>
            </div>
          </div>
          <div className='space-y-3'>
            <h4 className={'text-lg font-bold ' + t.text}>📊 Categorias</h4>
            <div className='space-y-3'>
              {sortedCategories.map((cat) => {
                const catPct = pct(cat.percentage)
                return (
                  <div key={cat.category} className={(isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200') + ' p-4 rounded-xl border'}>
                    <div className='flex justify-between mb-1'>
                      <span className={'font-semibold ' + t.text}>{cat.label}</span>
                      <span className={'font-bold ' + (catPct >= 66 ? 'text-red-500' : catPct >= 33 ? 'text-yellow-500' : 'text-green-500')}>{catPct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {result.hasPhysicalRisk && (
            <div className={t.dangerBg + ' p-5 rounded-xl border-2'}>
              <h4 className={'font-bold text-lg mb-3 ' + (isDarkMode ? 'text-red-300' : 'text-red-800')}>⚠️ Risco Fisico Detectado</h4>
              <p className={(isDarkMode ? 'text-red-400' : 'text-red-700') + ' mb-4'}>Suas respostas indicam risco a sua seguranca. Por favor, busque ajuda.</p>
              <div className='flex flex-wrap gap-3'>
                <a href='tel:180' className={(isDarkMode ? 'bg-red-800' : 'bg-red-600') + ' text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2'}><Phone className='w-4 h-4' /> Ligue 180</a>
                <a href='tel:190' className={(isDarkMode ? 'bg-red-800' : 'bg-red-600') + ' text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2'}><Phone className='w-4 h-4' /> Ligue 190</a>
              </div>
            </div>
          )}
          <div className={t.warnBg + ' p-4 rounded-xl border'}>
            <p className={'font-medium ' + (isDarkMode ? 'text-amber-300' : 'text-amber-800')}>⚠️ Este teste NAO substitui um profissional</p>
            <p className={'text-sm mt-1 ' + (isDarkMode ? 'text-amber-400' : 'text-amber-700')}>Se voce esta sofrendo, procure um psicologo ou ligue 188 (CVV).</p>
          </div>
          <div className={t.tipBg + ' p-5 rounded-xl border text-center'}>
            <p className={'text-lg font-medium ' + (isDarkMode ? 'text-emerald-300' : 'text-emerald-800')}>💚 Voce nao esta sozinha.</p>
          </div>
        </div>
      )}
    </div>
  )
}
