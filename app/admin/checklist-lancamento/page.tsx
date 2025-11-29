'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { 
  CheckCircle2, 
  Circle, 
  Rocket, 
  Code, 
  Key, 
  Users, 
  Globe, 
  TestTube,
  CreditCard,
  Package,
  Megaphone,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Clock,
  Zap,
  Download,
  RefreshCw
} from 'lucide-react'

// ============================================
// TIPOS
// ============================================

interface ChecklistItem {
  id: string
  title: string
  description?: string
  completed: boolean
}

interface ChecklistEtapa {
  id: string
  numero: number
  title: string
  icon: any
  color: string
  description: string
  items: ChecklistItem[]
  expanded?: boolean
}

// ============================================
// DADOS DO CHECKLIST
// ============================================

const INITIAL_CHECKLIST: ChecklistEtapa[] = [
  {
    id: 'etapa1',
    numero: 1,
    title: 'Garantir que o projeto roda "limpo"',
    icon: Code,
    color: 'from-blue-500 to-cyan-500',
    description: 'Não adianta vender se nem roda sem erro',
    items: [
      { id: '1.1', title: 'npm install executado', completed: false },
      { id: '1.2', title: 'npm run dev funcionando', completed: false },
      { id: '1.3', title: 'http://localhost:3000 abre sem erro', completed: false },
      { id: '1.4', title: 'Sem erros vermelhos no terminal', completed: false },
      { id: '1.5', title: 'Sem erros no console do navegador', completed: false },
      { id: '1.6', title: 'npm run build passa sem erro', completed: false },
      { id: '1.7', title: 'npm run lint sem erros críticos', completed: false },
    ]
  },
  {
    id: 'etapa2',
    numero: 2,
    title: 'Configurar chaves e serviços',
    icon: Key,
    color: 'from-purple-500 to-pink-500',
    description: 'Deixar tudo que é externo conectado e pronto',
    items: [
      { id: '2.1', title: 'Projeto criado no Supabase', completed: false },
      { id: '2.2', title: 'Schema SQL rodado (tabelas criadas)', completed: false },
      { id: '2.3', title: 'RLS configurado nas tabelas', completed: false },
      { id: '2.4', title: 'NEXT_PUBLIC_SUPABASE_URL configurado', completed: false },
      { id: '2.5', title: 'NEXT_PUBLIC_SUPABASE_ANON_KEY configurado', completed: false },
      { id: '2.6', title: 'API Key da OpenAI criada', completed: false },
      { id: '2.7', title: 'OPENAI_API_KEY configurado no .env', completed: false },
      { id: '2.8', title: 'Chat com IA respondendo', completed: false },
      { id: '2.9', title: 'Transcrição de voz funcionando', completed: false },
      { id: '2.10', title: 'Stripe: produto + preço criados', completed: false },
      { id: '2.11', title: 'STRIPE_SECRET_KEY configurado', completed: false },
      { id: '2.12', title: 'Webhook do Stripe configurado', completed: false },
      { id: '2.13', title: '.env.local completo e seguro', completed: false },
    ]
  },
  {
    id: 'etapa3',
    numero: 3,
    title: 'Testar fluxo completo como usuária',
    icon: TestTube,
    color: 'from-green-500 to-emerald-500',
    description: 'Provar que o Radar funciona na prática',
    items: [
      { id: '3.1', title: 'Cadastro com e-mail/senha funciona', completed: false },
      { id: '3.2', title: 'Login funciona', completed: false },
      { id: '3.3', title: 'Logout funciona', completed: false },
      { id: '3.4', title: 'Recuperação de senha funciona', completed: false },
      { id: '3.5', title: 'Teste de Clareza: responder leve', completed: false },
      { id: '3.6', title: 'Teste de Clareza: responder grave', completed: false },
      { id: '3.7', title: 'Resultado do teste grava no banco', completed: false },
      { id: '3.8', title: 'Diário: criar episódio com texto', completed: false },
      { id: '3.9', title: 'Diário: criar episódio com voz', completed: false },
      { id: '3.10', title: 'Diário: editar episódio', completed: false },
      { id: '3.11', title: 'Diário: apagar episódio', completed: false },
      { id: '3.12', title: 'Timeline/marcadores aparecem certo', completed: false },
      { id: '3.13', title: 'Chat IA: mensagem curta', completed: false },
      { id: '3.14', title: 'Chat IA: mensagem longa', completed: false },
      { id: '3.15', title: 'Chat IA: linguagem acolhedora', completed: false },
      { id: '3.16', title: 'Configurações LGPD funcionam', completed: false },
      { id: '3.17', title: 'ESC sai do app corretamente', completed: false },
      { id: '3.18', title: 'ESC limpa dados locais', completed: false },
    ]
  },
  {
    id: 'etapa4',
    numero: 4,
    title: 'Colocar online (Vercel)',
    icon: Globe,
    color: 'from-orange-500 to-red-500',
    description: 'Deixar acessível sem ser só na sua máquina',
    items: [
      { id: '4.1', title: 'Repositório criado no GitHub', completed: false },
      { id: '4.2', title: 'Código commitado e pushed', completed: false },
      { id: '4.3', title: 'Conta criada na Vercel', completed: false },
      { id: '4.4', title: 'Projeto importado na Vercel', completed: false },
      { id: '4.5', title: 'Variáveis de ambiente configuradas', completed: false },
      { id: '4.6', title: 'Deploy realizado com sucesso', completed: false },
      { id: '4.7', title: 'URL de produção funcionando', completed: false },
      { id: '4.8', title: 'Landing page OK em produção', completed: false },
      { id: '4.9', title: 'Teste de Clareza OK em produção', completed: false },
      { id: '4.10', title: 'Diário OK em produção', completed: false },
      { id: '4.11', title: 'Chat OK em produção', completed: false },
      { id: '4.12', title: 'Domínio personalizado (opcional)', completed: false },
    ]
  },
  {
    id: 'etapa5',
    numero: 5,
    title: 'Teste com pessoas reais (Beta)',
    icon: Users,
    color: 'from-pink-500 to-rose-500',
    description: 'Ver se o que está claro pra você também está claro pra elas',
    items: [
      { id: '5.1', title: 'Lista de 5-10 beta testers definida', completed: false },
      { id: '5.2', title: 'Roteiro de teste escrito', completed: false },
      { id: '5.3', title: 'Convites enviados', completed: false },
      { id: '5.4', title: 'Feedback coletado: o que foi fácil', completed: false },
      { id: '5.5', title: 'Feedback coletado: o que foi confuso', completed: false },
      { id: '5.6', title: 'Feedback coletado: o que mais ajudou', completed: false },
      { id: '5.7', title: 'Feedback coletado: o que não usariam', completed: false },
      { id: '5.8', title: 'Ajustes de texto realizados', completed: false },
      { id: '5.9', title: 'Ajustes de UX realizados', completed: false },
      { id: '5.10', title: 'Melhorias no que gerou "uau"', completed: false },
    ]
  },
  {
    id: 'etapa6',
    numero: 6,
    title: 'Ligar o dinheiro (Monetização)',
    icon: CreditCard,
    color: 'from-yellow-500 to-amber-500',
    description: 'Sair do "projeto bonito" para "produto vendável"',
    items: [
      { id: '6.1', title: 'Plano Gratuito definido', completed: false },
      { id: '6.2', title: 'Plano Premium definido', completed: false },
      { id: '6.3', title: 'Preço definido (ex: R$ 29/mês)', completed: false },
      { id: '6.4', title: 'Checkout Stripe testado', completed: false },
      { id: '6.5', title: 'Fluxo de sucesso testado', completed: false },
      { id: '6.6', title: 'Cancelamento testado', completed: false },
      { id: '6.7', title: 'Status muda no banco corretamente', completed: false },
      { id: '6.8', title: 'Textos da landing atualizados', completed: false },
      { id: '6.9', title: 'Página de planos clara', completed: false },
    ]
  },
  {
    id: 'etapa7',
    numero: 7,
    title: 'Preparar pacote de lançamento',
    icon: Package,
    color: 'from-indigo-500 to-violet-500',
    description: 'Quando for falar do Radar, não gaguejar',
    items: [
      { id: '7.1', title: 'Landing page finalizada', completed: false },
      { id: '7.2', title: 'Resumo de 1 parágrafo escrito', completed: false },
      { id: '7.3', title: '3 prints do app prontos', completed: false },
      { id: '7.4', title: 'Imagens para WhatsApp', completed: false },
      { id: '7.5', title: 'Imagens para Instagram', completed: false },
      { id: '7.6', title: 'PDF de apresentação (opcional)', completed: false },
      { id: '7.7', title: 'Estratégia de lançamento definida', completed: false },
    ]
  },
  {
    id: 'etapa8',
    numero: 8,
    title: 'Lançar pequeno, aprender grande',
    icon: Megaphone,
    color: 'from-teal-500 to-cyan-500',
    description: 'Mais negócio do que técnico',
    items: [
      { id: '8.1', title: 'Grupo de "membros fundadores" definido', completed: false },
      { id: '8.2', title: 'Desconto vitalício configurado', completed: false },
      { id: '8.3', title: 'Convites de fundadores enviados', completed: false },
      { id: '8.4', title: 'Monitorar: quantos usam após 1 semana', completed: false },
      { id: '8.5', title: 'Monitorar: cancelamentos', completed: false },
      { id: '8.6', title: 'Monitorar: features mais usadas', completed: false },
      { id: '8.7', title: 'Ajustes baseados em dados reais', completed: false },
      { id: '8.8', title: '🎉 LANÇAMENTO OFICIAL!', completed: false },
    ]
  }
]

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ChecklistLancamentoPage() {
  const [checklist, setChecklist] = useState<ChecklistEtapa[]>(INITIAL_CHECKLIST)
  const [expandedEtapas, setExpandedEtapas] = useState<string[]>(['etapa1'])

  // Carregar do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('checklist_lancamento')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Mesclar com o checklist inicial para pegar novos itens
        const merged = INITIAL_CHECKLIST.map(etapa => {
          const savedEtapa = parsed.find((e: ChecklistEtapa) => e.id === etapa.id)
          if (savedEtapa) {
            return {
              ...etapa,
              items: etapa.items.map(item => {
                const savedItem = savedEtapa.items.find((i: ChecklistItem) => i.id === item.id)
                return savedItem ? { ...item, completed: savedItem.completed } : item
              })
            }
          }
          return etapa
        })
        setChecklist(merged)
      } catch (e) {
        console.error('Erro ao carregar checklist:', e)
      }
    }
  }, [])

  // Salvar no localStorage
  const saveChecklist = (newChecklist: ChecklistEtapa[]) => {
    setChecklist(newChecklist)
    localStorage.setItem('checklist_lancamento', JSON.stringify(newChecklist))
  }

  // Toggle item
  const toggleItem = (etapaId: string, itemId: string) => {
    const newChecklist = checklist.map(etapa => {
      if (etapa.id === etapaId) {
        return {
          ...etapa,
          items: etapa.items.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
          )
        }
      }
      return etapa
    })
    saveChecklist(newChecklist)
  }

  // Toggle etapa expandida
  const toggleEtapa = (etapaId: string) => {
    setExpandedEtapas(prev => 
      prev.includes(etapaId) 
        ? prev.filter(id => id !== etapaId)
        : [...prev, etapaId]
    )
  }

  // Calcular progresso
  const getEtapaProgress = (etapa: ChecklistEtapa) => {
    const completed = etapa.items.filter(i => i.completed).length
    return { completed, total: etapa.items.length, percent: Math.round((completed / etapa.items.length) * 100) }
  }

  const getTotalProgress = () => {
    const allItems = checklist.flatMap(e => e.items)
    const completed = allItems.filter(i => i.completed).length
    return { completed, total: allItems.length, percent: Math.round((completed / allItems.length) * 100) }
  }

  // Resetar checklist
  const resetChecklist = () => {
    if (confirm('Tem certeza que deseja resetar todo o checklist?')) {
      localStorage.removeItem('checklist_lancamento')
      setChecklist(INITIAL_CHECKLIST)
    }
  }

  // Exportar como texto
  const exportAsText = () => {
    let text = '# CHECKLIST DE LANÇAMENTO - RADAR NARCISISTA BR\n\n'
    text += `Progresso: ${getTotalProgress().completed}/${getTotalProgress().total} (${getTotalProgress().percent}%)\n\n`
    
    checklist.forEach(etapa => {
      const progress = getEtapaProgress(etapa)
      text += `## ETAPA ${etapa.numero} - ${etapa.title} (${progress.completed}/${progress.total})\n`
      text += `${etapa.description}\n\n`
      etapa.items.forEach(item => {
        text += `${item.completed ? '[x]' : '[ ]'} ${item.id} - ${item.title}\n`
      })
      text += '\n'
    })

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'checklist-lancamento-radar.txt'
    a.click()
  }

  const totalProgress = getTotalProgress()

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8 ml-52">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Rocket className="w-8 h-8 text-purple-500" />
                Checklist de Lançamento
              </h1>
              <p className="text-gray-400 mt-1">
                Acompanhe todas as etapas para lançar o Radar Narcisista BR
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={exportAsText}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg flex items-center gap-2 hover:bg-gray-600 transition"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={resetChecklist}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg flex items-center gap-2 hover:bg-gray-600 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Resetar
              </button>
            </div>
          </div>

          {/* Progresso Geral */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Progresso Geral</h2>
                <p className="text-purple-200">
                  {totalProgress.completed} de {totalProgress.total} tarefas concluídas
                </p>
              </div>
              <div className="text-4xl font-bold text-white">
                {totalProgress.percent}%
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4">
              <div 
                className="bg-white h-4 rounded-full transition-all duration-500"
                style={{ width: `${totalProgress.percent}%` }}
              />
            </div>
            {totalProgress.percent === 100 && (
              <p className="mt-4 text-center text-white font-semibold">
                🎉 Parabéns! Você completou todas as etapas!
              </p>
            )}
          </div>

          {/* Etapas */}
          <div className="space-y-4">
            {checklist.map((etapa) => {
              const progress = getEtapaProgress(etapa)
              const isExpanded = expandedEtapas.includes(etapa.id)
              const Icon = etapa.icon

              return (
                <div key={etapa.id} className="bg-gray-800 rounded-xl overflow-hidden">
                  {/* Header da Etapa */}
                  <button
                    onClick={() => toggleEtapa(etapa.id)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-gray-700/50 transition"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${etapa.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-mono">ETAPA {etapa.numero}</span>
                        {progress.percent === 100 && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                            ✓ Completa
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white">{etapa.title}</h3>
                      <p className="text-sm text-gray-400">{etapa.description}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">{progress.percent}%</p>
                        <p className="text-xs text-gray-500">{progress.completed}/{progress.total}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Progress bar */}
                  <div className="px-4 pb-2">
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full bg-gradient-to-r ${etapa.color} transition-all duration-500`}
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Items */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2">
                      {etapa.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleItem(etapa.id, item.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                            item.completed 
                              ? 'bg-green-500/10 hover:bg-green-500/20' 
                              : 'bg-gray-700/50 hover:bg-gray-700'
                          }`}
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          )}
                          <span className="text-xs text-gray-500 font-mono w-8">{item.id}</span>
                          <span className={`flex-1 text-left ${
                            item.completed ? 'text-green-300 line-through' : 'text-white'
                          }`}>
                            {item.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Dica */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-300 font-medium">Dica</p>
                <p className="text-blue-200 text-sm">
                  Complete as etapas na ordem. Cada etapa depende da anterior estar funcionando.
                  O progresso é salvo automaticamente no seu navegador.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
