'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Search, AlertTriangle, Heart, Brain } from 'lucide-react'

interface FAQ {
  id: string
  pergunta: string
  resposta: string
  categoria: 'tabu' | 'geral' | 'tecnico' | 'seguranca'
  destaque?: boolean
}

const faqs: FAQ[] = [
  // Perguntas Tabu
  {
    id: '1',
    pergunta: 'Sou eu o narcisista?',
    resposta: `Se você está se fazendo essa pergunta, provavelmente NÃO é. Pessoas com traços narcisistas raramente questionam seu próprio comportamento ou se preocupam em machucar os outros.

O fato de você estar aqui, buscando entender, já mostra autocrítica e empatia - características que narcisistas geralmente não têm.

Dito isso, todos nós podemos ter comportamentos tóxicos às vezes. O importante é:
• Reconhecer quando erramos
• Pedir desculpas genuínas
• Mudar o comportamento
• Buscar ajuda profissional se necessário

Se você está preocupado(a), converse com um terapeuta. Eles podem ajudar a entender seus padrões de comportamento.`,
    categoria: 'tabu',
    destaque: true
  },
  {
    id: '2',
    pergunta: 'Por que é tão difícil sair?',
    resposta: `É difícil porque você está lidando com algo chamado "trauma bonding" (vínculo traumático). Isso acontece quando:

1. **Ciclo de abuso**: A alternância entre momentos bons e ruins cria uma montanha-russa emocional que vicia.

2. **Isolamento**: Você pode ter perdido sua rede de apoio.

3. **Gaslighting**: Depois de tanto tempo duvidando de si mesma, você não confia mais nas suas percepções.

4. **Dependência**: Pode ser financeira, emocional ou prática.

5. **Medo**: De represálias, de ficar sozinha, de não conseguir.

6. **Esperança**: "Dessa vez vai ser diferente" é uma frase comum.

Sair é um processo, não um evento. Seja gentil consigo mesma. Cada pequeno passo conta.`,
    categoria: 'tabu',
    destaque: true
  },
  {
    id: '3',
    pergunta: 'E se eu estiver exagerando?',
    resposta: `Se você está se perguntando isso, provavelmente NÃO está exagerando. Essa dúvida é um dos efeitos do gaslighting.

Sinais de que você NÃO está exagerando:
• Você anda "pisando em ovos"
• Você se sente confusa sobre o que é real
• Você pede desculpas por coisas que não fez
• Você sente medo de expressar suas necessidades
• Outras pessoas já comentaram sobre o comportamento dele/dela

Seus sentimentos são válidos. Sua percepção importa. Você merece ser ouvida.

O Teste de Clareza pode ajudar a organizar seus pensamentos e validar suas experiências.`,
    categoria: 'tabu',
    destaque: true
  },
  {
    id: '4',
    pergunta: 'Por que sinto falta de quem me machuca?',
    resposta: `Isso é completamente normal e tem explicação científica:

**Trauma Bonding**: O ciclo de abuso (tensão → explosão → lua de mel) cria um padrão de liberação de dopamina similar ao vício.

**Memória seletiva**: Nosso cérebro tende a lembrar mais dos momentos bons, especialmente quando estamos tristes.

**Identidade**: Parte de quem você é foi construída nessa relação. Sair significa reconstruir.

**Solidão**: Mesmo uma companhia ruim pode parecer melhor que nenhuma.

O que fazer:
• Escreva os episódios ruins (use o Diário)
• Releia quando sentir saudade
• Mantenha contato zero se possível
• Busque novas conexões
• Seja paciente consigo mesma`,
    categoria: 'tabu'
  },
  {
    id: '5',
    pergunta: 'Posso mudar um narcisista?',
    resposta: `A resposta curta é: NÃO, você não pode.

A mudança só acontece quando:
1. A pessoa reconhece que tem um problema
2. A pessoa QUER mudar
3. A pessoa busca ajuda profissional
4. A pessoa se compromete com um processo longo

Narcisistas raramente fazem isso porque:
• Não acreditam que têm um problema
• Culpam os outros por tudo
• Não têm motivação para mudar (funciona para eles)

Seu papel NÃO é:
• Salvar ninguém
• Ser terapeuta de ninguém
• Sacrificar sua saúde mental

Você só pode mudar a si mesma e suas escolhas.`,
    categoria: 'tabu'
  },
  // Perguntas Gerais
  {
    id: '6',
    pergunta: 'O que é gaslighting?',
    resposta: `Gaslighting é uma forma de manipulação que faz você duvidar da sua própria realidade.

Exemplos comuns:
• "Isso nunca aconteceu"
• "Você está inventando"
• "Você é sensível demais"
• "Você está louca"
• "Eu nunca disse isso"

Efeitos do gaslighting:
• Você duvida da sua memória
• Você se sente confusa
• Você pede desculpas por tudo
• Você não confia mais em si mesma

O termo vem do filme "Gaslight" (1944), onde um marido manipula a esposa fazendo-a acreditar que está ficando louca.`,
    categoria: 'geral'
  },
  {
    id: '7',
    pergunta: 'O que é love bombing?',
    resposta: `Love bombing é uma tática de manipulação onde a pessoa te "bombardeia" com amor, atenção e presentes no início do relacionamento.

Sinais de love bombing:
• Declarações de amor muito rápidas
• "Você é a pessoa da minha vida" (na primeira semana)
• Presentes excessivos
• Atenção 24 horas
• Pressão para compromisso rápido
• Fazer você se sentir "especial demais"

Por que é perigoso:
• Cria dependência emocional
• Estabelece expectativas irreais
• Quando para, você sente que fez algo errado
• É usado para te "prender" antes de mostrar o lado real

Amor saudável cresce gradualmente, com respeito e limites.`,
    categoria: 'geral'
  },
  {
    id: '8',
    pergunta: 'O que é o ciclo de abuso?',
    resposta: `O ciclo de abuso tem 4 fases que se repetem:

**1. Tensão** 🌡️
• Você anda "pisando em ovos"
• Pequenas críticas e irritações
• Sensação de que algo vai explodir

**2. Explosão** 💥
• Gritos, humilhação, violência
• Pode ser verbal, emocional ou física
• Você se sente em choque

**3. Lua de Mel** 🌙
• Desculpas e promessas
• "Nunca mais vai acontecer"
• Presentes e atenção
• Você quer acreditar

**4. Calma** 😶
• Tudo parece "normal"
• Você relaxa
• Mas a tensão começa de novo...

Reconhecer o ciclo é o primeiro passo para quebrá-lo.`,
    categoria: 'geral'
  },
  // Técnico
  {
    id: '9',
    pergunta: 'Meus dados estão seguros?',
    resposta: `Sim! Sua privacidade é nossa prioridade máxima.

Medidas de segurança:
• Criptografia de ponta a ponta
• Seus dados são SEUS (LGPD)
• Você pode exportar ou apagar tudo
• Não vendemos dados para terceiros
• Servidores seguros

Você controla:
• O que é salvo
• Por quanto tempo
• Quem pode ver (ninguém, por padrão)
• Quando apagar

Botão de emergência:
• Pressione ESC para sair rápido
• Limpa histórico de navegação
• Redireciona para site neutro`,
    categoria: 'tecnico'
  },
  {
    id: '10',
    pergunta: 'O app substitui terapia?',
    resposta: `NÃO. O Radar Narcisista é uma ferramenta de APOIO, não substitui profissionais.

O que o app FAZ:
• Ajuda a organizar pensamentos
• Valida suas experiências
• Oferece psicoeducação
• Registra episódios
• Mostra padrões

O que o app NÃO FAZ:
• Diagnóstico clínico
• Tratamento psicológico
• Orientação jurídica
• Substituir emergências

Recomendamos fortemente:
• Buscar um psicólogo
• Especialmente se você está em crise
• O app pode complementar a terapia`,
    categoria: 'tecnico'
  },
  // Segurança
  {
    id: '11',
    pergunta: 'E se ele/ela descobrir o app?',
    resposta: `Sua segurança é prioridade. Temos recursos para isso:

**Modo Discreto:**
• Nome e ícone neutros
• Pode parecer um app de notas

**Saída Rápida:**
• Pressione ESC (computador)
• Toque 3x na tela (celular)
• Redireciona para Google

**Dicas de segurança:**
• Use em momentos seguros
• Limpe o histórico do navegador
• Use aba anônima
• Não deixe logado
• Tenha uma "história" pronta

Se você está em perigo imediato:
• Ligue 190 (Polícia)
• Ligue 180 (Central da Mulher)
• Vá a um lugar seguro`,
    categoria: 'seguranca'
  },
  {
    id: '12',
    pergunta: 'Estou em perigo. O que faço?',
    resposta: `Se você está em perigo AGORA:

**Ligue imediatamente:**
• 190 - Polícia
• 180 - Central da Mulher (24h)
• 188 - CVV (apoio emocional)
• 192 - SAMU

**Se puder sair:**
• Vá para casa de alguém de confiança
• Delegacia da Mulher
• Hospital
• Qualquer lugar público

**Se não puder sair:**
• Tranque-se em um cômodo
• Ligue para alguém
• Grite por ajuda
• Não enfrente sozinha

**Planeje com antecedência:**
• Tenha documentos guardados
• Dinheiro de emergência
• Mala pronta
• Pessoa de confiança avisada

Use nossa ferramenta "Plano de Fuga" para se preparar.`,
    categoria: 'seguranca'
  }
]

const categorias = {
  tabu: { label: 'Perguntas Tabu', emoji: '🤫', cor: 'bg-purple-100 text-purple-600' },
  geral: { label: 'Geral', emoji: '📚', cor: 'bg-blue-100 text-blue-600' },
  tecnico: { label: 'Técnico', emoji: '⚙️', cor: 'bg-gray-100 text-gray-600' },
  seguranca: { label: 'Segurança', emoji: '🛡️', cor: 'bg-red-100 text-red-600' }
}

export default function FAQPage() {
  const [busca, setBusca] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)
  const [abertos, setAbertos] = useState<string[]>(['1', '2', '3'])

  const toggleAberto = (id: string) => {
    setAbertos(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const faqsFiltradas = faqs.filter(faq => {
    const matchBusca = busca === '' || 
      faq.pergunta.toLowerCase().includes(busca.toLowerCase()) ||
      faq.resposta.toLowerCase().includes(busca.toLowerCase())
    const matchCategoria = categoriaAtiva === null || faq.categoria === categoriaAtiva
    return matchBusca && matchCategoria
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-purple-950 pt-20 pb-10">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 hover:bg-white/50 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-purple-500" />
              Perguntas Frequentes
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Incluindo as que ninguém tem coragem de fazer</p>
          </div>
        </div>

        {/* Busca */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar pergunta..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Categorias */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setCategoriaAtiva(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              categoriaAtiva === null
                ? 'bg-purple-500 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Todas
          </button>
          {Object.entries(categorias).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setCategoriaAtiva(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                categoriaAtiva === key
                  ? 'bg-purple-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{value.emoji}</span>
              {value.label}
            </button>
          ))}
        </div>

        {/* Destaque - Perguntas Tabu */}
        {categoriaAtiva === null && busca === '' && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-lg font-semibold">Perguntas que ninguém faz (mas deveria)</h2>
            </div>
            <p className="text-white/80 text-sm">
              Essas são as perguntas mais difíceis. Você não está sozinha em ter essas dúvidas.
            </p>
          </div>
        )}

        {/* Lista de FAQs */}
        <div className="space-y-3">
          {faqsFiltradas.map((faq) => (
            <div 
              key={faq.id}
              className={`bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm ${
                faq.destaque ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              <button
                onClick={() => toggleAberto(faq.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  {faq.destaque && <span className="text-lg">🤫</span>}
                  <span className="font-medium text-gray-900 dark:text-white">{faq.pergunta}</span>
                </div>
                {abertos.includes(faq.id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {abertos.includes(faq.id) && (
                <div className="px-5 pb-4">
                  <div className="pt-3 border-t border-gray-100 dark:border-slate-700">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${categorias[faq.categoria].cor}`}>
                      {categorias[faq.categoria].emoji} {categorias[faq.categoria].label}
                    </span>
                    <div className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">
                      {faq.resposta}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {faqsFiltradas.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma pergunta encontrada</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl p-6 text-center">
          <Heart className="h-8 w-8 text-pink-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Não encontrou sua pergunta?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Converse com nosso Coach de Clareza. Ele está aqui para ajudar.
          </p>
          <Link
            href="/chat"
            className="inline-block px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Conversar com Coach
          </Link>
        </div>
      </div>
    </div>
  )
}
