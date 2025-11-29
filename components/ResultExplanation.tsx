'use client'

import { useState } from 'react'
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  MessageCircle,
  Heart,
  Phone
} from 'lucide-react'
import type { UnifiedResult } from '@/lib/clarity-unified-config'

interface Props {
  result: UnifiedResult
  isDarkMode: boolean
}

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
    if (result.globalZone === 'atencao') {
      return { emoji: '🟡', title: 'Zona de Atenção', story: `Você está na Zona de Atenção. Isso significa que algumas coisas no seu relacionamento merecem um olhar mais cuidadoso. Não é motivo para desespero, mas também não deve ser ignorado. É como quando você sente uma dorzinha no corpo — pode não ser nada grave, mas é bom prestar atenção.` }
    }
    if (result.globalZone === 'alerta') {
      return { emoji: '🟠', title: 'Zona de Alerta', story: `Você está na Zona de Alerta. Isso é sério e merece sua atenção. Suas respostas mostram que você está vivendo situações que podem estar te machucando. É como quando o corpo dá sinais claros de que algo não está bem — você precisa cuidar de você.` }
    }
    return { emoji: '🔴', title: 'Zona Vermelha', story: `Você está na Zona Vermelha. Isso significa que a situação é grave e você precisa de apoio. Suas respostas mostram padrões que podem estar causando muito sofrimento. Por favor, não enfrente isso sozinha. Existem pessoas prontas para te ajudar.` }
  }

  const getNevoaStory = () => {
    if (nevoaPct < 25) return `Sobre a "névoa mental": você parece ter clareza sobre o que acontece ao seu redor. Isso é muito bom!`
    if (nevoaPct < 50) return `Sobre a "névoa mental" (${nevoaPct}%): às vezes você pode se sentir confusa sobre o que realmente aconteceu. Talvez você já tenha se perguntado "será que eu estou exagerando?". Essa confusão pode ser um sinal de que alguém está tentando te fazer duvidar de si mesma.`
    if (nevoaPct < 75) return `Sobre a "névoa mental" (${nevoaPct}%): você está sentindo bastante confusão. É provável que você saia de discussões sem saber mais o que é verdade. Isso tem um nome: gaslighting. É quando alguém distorce a realidade para te fazer duvidar de você mesma.`
    return `Sobre a "névoa mental" (${nevoaPct}%): você está vivendo uma confusão mental muito intensa. Provavelmente você já não confia mais na sua própria memória. Isso é muito sério. Você NÃO está louca. O que você sente é real.`
  }

  const getMedoStory = () => {
    if (medoPct < 25) return `Sobre o medo e tensão: você parece se sentir relativamente segura para se expressar. Isso é positivo.`
    if (medoPct < 50) return `Sobre o medo e tensão (${medoPct}%): você sente algum nível de medo no relacionamento. Talvez você pense duas vezes antes de falar certas coisas. Em relacionamentos saudáveis, você deveria se sentir à vontade para ser você mesma.`
    if (medoPct < 75) return `Sobre o medo e tensão (${medoPct}%): você está vivendo com bastante medo. Provavelmente você "pisa em ovos" para não irritar a pessoa. Isso não é normal. Você não deveria ter medo de quem diz te amar.`
    return `Sobre o medo e tensão (${medoPct}%): você está vivendo em estado de alerta constante. O medo domina seu dia a dia. Isso é exaustivo e prejudica sua saúde. Você merece paz.`
  }

  const getLimitesStory = () => {
    if (limitesPct < 25) return `Sobre seus limites: parece que seus limites são respeitados na maior parte do tempo. Isso é fundamental.`
    if (limitesPct < 50) return `Sobre seus limites (${limitesPct}%): às vezes seus limites não são totalmente respeitados. Talvez quando você diz "não", a pessoa insista. Seus limites são importantes.`
    if (limitesPct < 75) return `Sobre seus limites (${limitesPct}%): seus limites estão sendo frequentemente desrespeitados. Você provavelmente se sente diminuída ou ridicularizada. Isso não é amor. Amor respeita.`
    return `Sobre seus limites (${limitesPct}%): seus limites praticamente não existem mais. A outra pessoa faz o que quer, sem considerar seus sentimentos. Isso é abuso. Você tem direito de ser respeitada.`
  }

  const getCategoryStory = (catId: string, catPct: number) => {
    const stories: Record<string, { name: string; low: string; mid: string; high: string }> = {
      invalidacao: { name: 'Invalidação', low: 'Seus sentimentos parecem ser ouvidos.', mid: `Você está sentindo invalidação (${catPct}%). Isso acontece quando alguém diz que seus sentimentos não importam ou que você está exagerando.`, high: `A invalidação está muito presente (${catPct}%). Você provavelmente já ouviu muitas vezes que está "exagerando". Seus sentimentos SÃO válidos.` },
      gaslighting: { name: 'Gaslighting', low: 'Você parece confiar na sua percepção.', mid: `Há sinais de gaslighting (${catPct}%). É quando alguém distorce a realidade para te fazer duvidar de si mesma.`, high: `O gaslighting está muito intenso (${catPct}%). Você provavelmente já não sabe mais o que é real. Isso é abuso psicológico. Você NÃO está louca.` },
      controle: { name: 'Controle', low: 'Você parece ter liberdade para suas decisões.', mid: `Há sinais de controle (${catPct}%). A pessoa quer saber onde você está, com quem fala. Controle não é amor.`, high: `O controle está muito presente (${catPct}%). A pessoa provavelmente controla seu dinheiro, amizades, tempo. Isso é prisão, não relacionamento.` },
      isolamento: { name: 'Isolamento', low: 'Você parece manter contato com amigos e família.', mid: `Há sinais de isolamento (${catPct}%). A pessoa pode falar mal dos seus amigos ou criar conflitos. Aos poucos, você vai se afastando de todos.`, high: `O isolamento está muito forte (${catPct}%). Você provavelmente já se afastou de muitas pessoas importantes. Isso é proposital.` },
      emocional: { name: 'Abuso Emocional', low: 'O tratamento emocional parece respeitoso.', mid: `Há sinais de abuso emocional (${catPct}%). Isso inclui tratamento de silêncio, humilhações, críticas constantes.`, high: `O abuso emocional está muito intenso (${catPct}%). Você provavelmente vive com medo, se sente humilhada. Você merece respeito.` },
      fisico: { name: 'Risco Físico', low: 'Não há sinais significativos de risco físico.', mid: `Há sinais de risco físico (${catPct}%). A pessoa pode ter quebrado objetos ou te segurado com força. Esses são sinais de alerta sérios.`, high: `O risco físico é alto (${catPct}%). Isso é muito grave. Por favor, procure ajuda. Ligue 180 ou 190.` }
    }
    const cat = stories[catId]
    if (!cat) return null
    if (catPct < 25) return { name: cat.name, story: cat.low }
    if (catPct < 50) return { name: cat.name, story: cat.mid }
    return { name: cat.name, story: cat.high }
  }

  const zone = getZoneStory()

  return (
    <div className={`${t.bg} rounded-2xl border-2 ${isOpen ? (isDarkMode ? 'border-violet-500' : 'border-purple-400') : t.border} overflow-hidden transition-all duration-300 mb-8`}>
      <button onClick={() => setIsOpen(!isOpen)} className={`w-full p-4 sm:p-6 flex items-center justify-between gap-4 transition-all ${isOpen ? (isDarkMode ? 'bg-violet-900/20' : 'bg-purple-50') : ''}`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`p-3 sm:p-4 rounded-2xl ${isDarkMode ? 'bg-violet-600/20' : 'bg-purple-100'}`}>
            <MessageCircle className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'text-violet-400' : 'text-purple-600'}`} />
          </div>
          <div className="text-left">
            <h3 className={`font-bold ${t.text} text-lg sm:text-xl`}>🤔 O que isso significa pra mim?</h3>
            <p className={`text-sm sm:text-base ${t.textMuted}`}>Clique para entender seu resultado de forma simples</p>
          </div>
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
          {isOpen ? <ChevronUp className={`w-5 h-5 sm:w-6 sm:h-6 ${t.textMuted}`} /> : <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 ${t.textMuted}`} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-6 space-y-6 border-t border-dashed border-slate-600/30">
          
          <div className={`p-4 sm:p-5 rounded-xl ${t.tipBg} border`}>
            <div className="flex items-start gap-3">
              <Heart className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} flex-shrink-0`} />
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'} text-base sm:text-lg`}>Vamos conversar sobre o seu resultado</p>
                <p className={`text-sm sm:text-base ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'} mt-1`}>Leia com calma, no seu tempo. Estou aqui para te ajudar a entender.</p>
              </div>
            </div>
          </div>

          <Section title={`${zone.emoji} Sua Situação Geral: ${zone.title}`} isDarkMode={isDarkMode}>
            <p className={`text-base sm:text-lg leading-relaxed ${t.textBody}`}>Você fez <strong>{result.overallScore} pontos</strong> de {result.maxOverallScore} possíveis ({overallPct}%).</p>
            <StoryBox isDarkMode={isDarkMode}>{zone.story}</StoryBox>
          </Section>

          <Section title="🧠 Névoa Mental — Você está conseguindo enxergar com clareza?" isDarkMode={isDarkMode} percentage={nevoaPct} level={nevoa?.level}>
            <StoryBox isDarkMode={isDarkMode}>{getNevoaStory()}</StoryBox>
            {nevoaPct >= 40 && <TipBox isDarkMode={isDarkMode}><strong>Na prática:</strong> É quando você sai de uma discussão mais confusa do que entrou. Quando você lembra de algo, mas a pessoa jura que não foi assim.</TipBox>}
          </Section>

          <Section title="😰 Medo e Tensão — Você se sente segura para ser você mesma?" isDarkMode={isDarkMode} percentage={medoPct} level={medo?.level}>
            <StoryBox isDarkMode={isDarkMode}>{getMedoStory()}</StoryBox>
            {medoPct >= 40 && <TipBox isDarkMode={isDarkMode}><strong>Na prática:</strong> É quando você pensa 10 vezes antes de falar algo. Quando esconde coisas bobas só para evitar briga.</TipBox>}
          </Section>

          <Section title="🛡️ Seus Limites — Eles são respeitados?" isDarkMode={isDarkMode} percentage={limitesPct} level={limites?.level}>
            <StoryBox isDarkMode={isDarkMode}>{getLimitesStory()}</StoryBox>
            {limitesPct >= 40 && <TipBox isDarkMode={isDarkMode}><strong>Na prática:</strong> É quando você diz "não quero isso" e a pessoa ignora ou te faz sentir culpada.</TipBox>}
          </Section>

          <Section title="📊 O que aparece mais forte no seu resultado" isDarkMode={isDarkMode}>
            <p className={`${t.textBody} mb-4`}>Cada categoria que apareceu no seu teste:</p>
            <div className="space-y-4">
              {sortedCategories.map((cat) => {
                const catPct = pct(cat.percentage)
                const story = getCategoryStory(cat.category, catPct)
                if (!story) return null
                const isHighlight = catPct >= 40
                return (
                  <div key={cat.category} className={`p-4 rounded-xl border ${isHighlight ? (isDarkMode ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-300') : (isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200')}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold ${t.text}`}>{story.name} {isHighlight && '⚠️'}</h4>
                      <span className={`text-sm font-bold ${catPct >= 66 ? 'text-red-500' : catPct >= 33 ? 'text-yellow-500' : 'text-green-500'}`}>{catPct}%</span>
                    </div>
                    <p className={`text-sm sm:text-base ${t.textBody} leading-relaxed`}>{story.story}</p>
                  </div>
                )
              })}
            </div>
          </Section>

          {result.hasPhysicalRisk && (
            <div className={`p-5 rounded-xl ${t.dangerBg} border-2`}>
              <h4 className={`font-bold text-lg ${isDarkMode ? 'text-red-300' : 'text-red-800'} mb-3`}>⚠️ Atenção: Sinais de Risco Físico</h4>
              <p className={`${isDarkMode ? 'text-red-400' : 'text-red-700'} mb-4`}>Suas respostas indicam que pode haver risco à sua segurança física. Você não precisa enfrentar isso sozinha.</p>
              <div className="flex flex-wrap gap-3">
                <a href="tel:180" className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${isDarkMode ? 'bg-red-800 text-white' : 'bg-red-600 text-white'}`}><Phone className="w-4 h-4" /> Ligue 180</a>
                <a href="tel:190" className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${isDarkMode ? 'bg-red-800 text-white' : 'bg-red-600 text-white'}`}><Phone className="w-4 h-4" /> Ligue 190</a>
              </div>
            </div>
          )}

          <Section title="🚀 E agora, o que eu faço?" isDarkMode={isDarkMode}>
            <StoryBox isDarkMode={isDarkMode}>
              <p className="mb-3"><strong>Primeiro:</strong> Respire fundo. Você já deu um passo muito importante ao fazer esse teste.</p>
              <p className="mb-3"><strong>Segundo:</strong> Esse resultado mostra a sua percepção. É um ponto de partida para você cuidar de si mesma.</p>
              <p><strong>Terceiro:</strong> Você não precisa resolver tudo sozinha. Existem pessoas que podem te ajudar.</p>
            </StoryBox>
            <div className={`p-4 rounded-xl ${t.warnBg} border mt-4`}>
              <p className={`font-medium ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>⚠️ Este teste NÃO substitui um profissional</p>
              <p className={`text-sm ${isDarkMode ? 'text-amber-400' : 'text-amber-700'} mt-1`}>Se você está sofrendo, procure um psicólogo ou ligue para o CVV (188).</p>
            </div>
          </Section>

          <Section title="📚 Onde posso aprender mais?" isDarkMode={isDarkMode}>
            <div className="grid gap-3">
              <RefCard type="Lei" title="Lei Maria da Penha (Lei 11.340/2006)" desc="Protege mulheres contra violência doméstica." isDarkMode={isDarkMode} />
              <RefCard type="Serviço" title="Ligue 180 — Central da Mulher" desc="Gratuito, 24h. Orientação e denúncias." isDarkMode={isDarkMode} />
              <RefCard type="Serviço" title="Ligue 188 — CVV" desc="Apoio emocional 24h." isDarkMode={isDarkMode} />
              <RefCard type="Livro" title="'Por que ele faz isso?' — Lundy Bancroft" desc="Explica a mente de pessoas abusivas." isDarkMode={isDarkMode} />
            </div>
          </Section>

          <div className={`p-5 rounded-xl ${t.tipBg} border text-center`}>
            <p className={`text-lg font-medium ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>💚 Você não está sozinha. Buscar entender é o primeiro passo.</p>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children, isDarkMode, percentage, level }: { title: string; children: React.ReactNode; isDarkMode: boolean; percentage?: number; level?: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
        {percentage !== undefined && (
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${percentage >= 66 ? 'text-red-500' : percentage >= 33 ? 'text-yellow-500' : 'text-green-500'}`}>{percentage}%</span>
            {level && <span className={`px-2 py-0.5 rounded text-xs font-medium ${level === 'alto' ? (isDarkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700') : level === 'moderado' ? (isDarkMode ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-700') : (isDarkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700')}`}>{level.toUpperCase()}</span>}
          </div>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function StoryBox({ children, isDarkMode }: { children: React.ReactNode; isDarkMode: boolean }) {
  return (
    <div className={`p-4 sm:p-5 rounded-xl ${isDarkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'} border`}>
      <div className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{children}</div>
    </div>
  )
}

function TipBox({ children, isDarkMode }: { children: React.ReactNode; isDarkMode: boolean }) {
  return (
    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-violet-900/20 border-violet-700' : 'bg-purple-50 border-purple-200'} border`}>
      <div className={`text-sm leading-relaxed ${isDarkMode ? 'text-violet-300' : 'text-purple-700'}`}>{children}</div>
    </div>
  )
}

function RefCard({ type, title, desc, isDarkMode }: { type: string; title: string; desc: string; isDarkMode: boolean }) {
  return (
    <div className={`p-3 sm:p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'} flex items-start gap-3`}>
      <span className={`px-2 py-1 rounded text-xs font-bold ${isDarkMode ? 'bg-violet-900 text-violet-300' : 'bg-purple-100 text-purple-700'}`}>{type}</span>
      <div>
        <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm sm:text-base`}>{title}</h5>
        <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{desc}</p>
      </div>
    </div>
  )
}
