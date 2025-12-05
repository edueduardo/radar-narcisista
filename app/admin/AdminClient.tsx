'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Layout, 
  TestTube, 
  Globe, 
  Trash2, 
  Save, 
  Power, 
  PowerOff,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Plus,
  X,
  BookOpen,
  MessageSquare,
  Users,
  MapPin,
  Shield,
  Check,
  XCircle,
  Edit,
  Clock,
  AlertTriangle,
  FileText,
  Settings,
  Bot,
  Cpu,
  Zap,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Brain,
  Scale,
  FileSearch,
  ShieldAlert,
  Target,
  RefreshCw,
  Database,
  Cloud,
  CloudOff,
  Download,
  FileDown,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  BarChart3,
  TrendingUp,
  Activity,
  Sparkles,
  CheckSquare,
  UserPlus,
  Network,
  Cog,
  GitBranch,
  Skull
} from 'lucide-react'
import { loadIAConfig, saveIAConfig, loadIAConfigLocal, type AdminIAConfig } from '../../lib/admin-storage'
import { IAS_DISPONIVEIS, isIANova, type IAConfig } from '../../lib/ia-registry'
import { loadMenuOrder, AdminMenuItem } from '../../lib/admin-menu-config'
import { getAdminFeature } from '@/app/admin/admin-features-registry'
import OraculoButton from '@/components/OraculoButton'

interface FrontpageConfig {
  id: string
  name: string
  url?: string
  isActive: boolean
  isTestEnabled: boolean
  isExternal: boolean
}

// Tipos para gestão de conteúdo
interface RespostaBiblioteca {
  id: string
  categoria: string
  elesDizem: string
  vocePodeResponder: string
  alternativa: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  criadoPor: 'admin' | 'ia'
  dataCriacao: string
}

interface HistoriaReflexao {
  id: string
  nome: string
  idade: number
  historia: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  criadoPor: 'admin' | 'ia' | 'usuario'
  dataCriacao: string
}

interface HistoriaComunidade {
  id: string
  texto: string
  votosVerde: number
  votosAmarelo: number
  votosVermelho: number
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'denunciado'
  dataCriacao: string
  denuncias: number
}

interface RecursoEstado {
  id: string
  estado: string
  sigla: string
  recursos: {
    nome: string
    telefone: string
    tipo: string
  }[]
}

export default function AdminClient() {
  const [activeTab, setActiveTab] = useState('ias')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  // ===== ESTADOS PARA GESTÃO DE CONTEÚDO =====
  
  // Biblioteca de Respostas
  const [respostas, setRespostas] = useState<RespostaBiblioteca[]>([
    {
      id: '1',
      categoria: 'Gaslighting',
      elesDizem: '"Isso nunca aconteceu"',
      vocePodeResponder: 'Eu me lembro claramente. Minha memória é confiável.',
      alternativa: 'Eu sei o que vi e ouvi.',
      status: 'aprovado',
      criadoPor: 'admin',
      dataCriacao: '2024-11-20'
    },
    {
      id: '2',
      categoria: 'Manipulação',
      elesDizem: '"Se você me amasse, faria isso"',
      vocePodeResponder: 'Amor não é chantagem. Posso amar e ainda ter limites.',
      alternativa: 'Amor de verdade respeita o "não".',
      status: 'pendente',
      criadoPor: 'ia',
      dataCriacao: '2024-11-24'
    },
    {
      id: '3',
      categoria: 'Invalidação',
      elesDizem: '"Você é muito sensível"',
      vocePodeResponder: 'Sensibilidade não é defeito. É como eu processo o mundo.',
      alternativa: 'Prefiro ser sensível do que insensível.',
      status: 'pendente',
      criadoPor: 'ia',
      dataCriacao: '2024-11-24'
    },
  ])

  // Histórias para Reflexão
  const [historias, setHistorias] = useState<HistoriaReflexao[]>([
    {
      id: '1',
      nome: 'Ana',
      idade: 32,
      historia: 'Meu marido diz que me ama, mas quando eu faço algo que ele não gosta, ele fica dias sem falar comigo...',
      status: 'aprovado',
      criadoPor: 'admin',
      dataCriacao: '2024-11-15'
    },
    {
      id: '2',
      nome: 'Roberto',
      idade: 41,
      historia: 'Minha esposa controla todas as minhas amizades. Ela diz que é porque me ama...',
      status: 'pendente',
      criadoPor: 'ia',
      dataCriacao: '2024-11-24'
    },
  ])

  // Histórias da Comunidade (para moderação)
  const [historiasComunidade, setHistoriasComunidade] = useState<HistoriaComunidade[]>([
    {
      id: '1',
      texto: 'Meu parceiro sempre diz que eu exagero quando fico chateada com algo...',
      votosVerde: 12,
      votosAmarelo: 45,
      votosVermelho: 187,
      status: 'aprovado',
      dataCriacao: '2024-11-20',
      denuncias: 0
    },
    {
      id: '2',
      texto: 'Minha namorada verifica meu celular todos os dias...',
      votosVerde: 5,
      votosAmarelo: 23,
      votosVermelho: 89,
      status: 'pendente',
      dataCriacao: '2024-11-24',
      denuncias: 0
    },
    {
      id: '3',
      texto: 'História com conteúdo inadequado...',
      votosVerde: 0,
      votosAmarelo: 2,
      votosVermelho: 5,
      status: 'denunciado',
      dataCriacao: '2024-11-24',
      denuncias: 3
    },
  ])

  // Modal states
  const [modalAberto, setModalAberto] = useState<string | null>(null)
  const [itemEditando, setItemEditando] = useState<any>(null)
  
  // Estados para relatórios administrativos
  const [relatorioAberto, setRelatorioAberto] = useState<string | null>(null)
  const [relatorioLoading, setRelatorioLoading] = useState(false)
  const [relatorioData, setRelatorioData] = useState<any>(null)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<string>('')
  const [listaUsuarios, setListaUsuarios] = useState<{id: string, email: string, created_at: string}[]>([])
  const [avaliacaoAdmin, setAvaliacaoAdmin] = useState<string>('')
  const [gerandoPDF, setGerandoPDF] = useState(false)
  const [itensParaAvaliar, setItensParaAvaliar] = useState<{id: string, status: 'pendente' | 'aprovado' | 'rejeitado', nota?: string}[]>([])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Erro ao fazer logout no admin:', error)
    }
  }

  const handleClearCache = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ai_api_keys')
        localStorage.removeItem('ai_api_balances')
        localStorage.removeItem('ia_balances_admin')
        localStorage.removeItem('ia_status_admin')
        localStorage.removeItem('ias_customizadas')
      }
    } catch (e) {
      console.error('Erro ao limpar cache de IA:', e)
    } finally {
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }

  // Categorias disponíveis
  const categorias = ['Gaslighting', 'Manipulação', 'Invalidação', 'Culpabilização', 'Ameaças', 'Isolamento']

  // Funções de gestão
  const aprovarItem = (tipo: string, id: string) => {
    if (tipo === 'resposta') {
      setRespostas(prev => prev.map(r => r.id === id ? { ...r, status: 'aprovado' as const } : r))
    } else if (tipo === 'historia') {
      setHistorias(prev => prev.map(h => h.id === id ? { ...h, status: 'aprovado' as const } : h))
    } else if (tipo === 'comunidade') {
      setHistoriasComunidade(prev => prev.map(h => h.id === id ? { ...h, status: 'aprovado' as const } : h))
    }
    setMessage('✅ Item aprovado com sucesso!')
    setTimeout(() => setMessage(''), 3000)
  }

  const rejeitarItem = (tipo: string, id: string) => {
    if (tipo === 'resposta') {
      setRespostas(prev => prev.map(r => r.id === id ? { ...r, status: 'rejeitado' as const } : r))
    } else if (tipo === 'historia') {
      setHistorias(prev => prev.map(h => h.id === id ? { ...h, status: 'rejeitado' as const } : h))
    } else if (tipo === 'comunidade') {
      setHistoriasComunidade(prev => prev.map(h => h.id === id ? { ...h, status: 'rejeitado' as const } : h))
    }
    setMessage('❌ Item rejeitado')
    setTimeout(() => setMessage(''), 3000)
  }

  const excluirItem = (tipo: string, id: string) => {
    if (tipo === 'resposta') {
      setRespostas(prev => prev.filter(r => r.id !== id))
    } else if (tipo === 'historia') {
      setHistorias(prev => prev.filter(h => h.id !== id))
    } else if (tipo === 'comunidade') {
      setHistoriasComunidade(prev => prev.filter(h => h.id !== id))
    }
    setMessage('🗑️ Item excluído')
    setTimeout(() => setMessage(''), 3000)
  }

  const gerarSugestaoIA = (tipo: string) => {
    setLoading(true)
    // Simula geração por IA
    setTimeout(() => {
      if (tipo === 'resposta') {
        const novaResposta: RespostaBiblioteca = {
          id: Date.now().toString(),
          categoria: categorias[Math.floor(Math.random() * categorias.length)],
          elesDizem: '"Nova frase gerada pela IA"',
          vocePodeResponder: 'Resposta sugerida pela IA para aprovação.',
          alternativa: 'Alternativa sugerida pela IA.',
          status: 'pendente',
          criadoPor: 'ia',
          dataCriacao: new Date().toISOString().split('T')[0]
        }
        setRespostas(prev => [novaResposta, ...prev])
      } else if (tipo === 'historia') {
        const novaHistoria: HistoriaReflexao = {
          id: Date.now().toString(),
          nome: 'Pessoa',
          idade: 30,
          historia: 'História gerada pela IA para aprovação do administrador...',
          status: 'pendente',
          criadoPor: 'ia',
          dataCriacao: new Date().toISOString().split('T')[0]
        }
        setHistorias(prev => [novaHistoria, ...prev])
      }
      setLoading(false)
      setMessage('🤖 IA gerou nova sugestão para aprovação')
      setTimeout(() => setMessage(''), 3000)
    }, 1500)
  }

  // Contadores
  const respostasPendentes = respostas.filter(r => r.status === 'pendente').length
  const historiasPendentes = historias.filter(h => h.status === 'pendente').length
  const comunidadePendentes = historiasComunidade.filter(h => h.status === 'pendente').length
  const denuncias = historiasComunidade.filter(h => h.status === 'denunciado').length

  // ===== FUNÇÕES DE RELATÓRIOS ADMINISTRATIVOS =====
  
  // Carregar lista de usuários
  const carregarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (data) {
        setListaUsuarios(data)
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  // Abrir relatório
  const abrirRelatorio = async (tipo: string) => {
    setRelatorioAberto(tipo)
    setRelatorioLoading(true)
    setRelatorioData(null)
    
    try {
      if (tipo === 'relatorioPontualPessoas') {
        await carregarUsuarios()
        setRelatorioData({ tipo: 'pessoa', usuarios: listaUsuarios })
      } else if (tipo === 'relatorioGlobalSistema') {
        // Carregar estatísticas globais
        const [testesRes, entradasRes, profilesRes] = await Promise.all([
          supabase.from('clarity_tests').select('*', { count: 'exact' }),
          supabase.from('journal_entries').select('*', { count: 'exact' }),
          supabase.from('profiles').select('*', { count: 'exact' })
        ])
        
        const testes = testesRes.data || []
        const zonas = {
          ATENCAO: testes.filter((t: any) => t.global_zone === 'ATENCAO').length,
          ALERTA: testes.filter((t: any) => t.global_zone === 'ALERTA').length,
          VERMELHA: testes.filter((t: any) => t.global_zone === 'VERMELHA').length,
        }
        
        setRelatorioData({
          tipo: 'global',
          totalUsuarios: profilesRes.count || 0,
          totalTestes: testesRes.count || 0,
          totalEntradas: entradasRes.count || 0,
          zonas,
          ultimosTestes: testes.slice(0, 10)
        })
      } else if (tipo === 'rastrearProblemasJuridicos') {
        // Buscar entradas com palavras-chave jurídicas
        const { data: entradas } = await supabase
          .from('journal_entries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500)
        
        const palavrasJuridicas = ['ameaça', 'ameaçou', 'bater', 'bateu', 'violência', 'matar', 'morte', 'polícia', 'delegacia', 'advogado', 'processo', 'medida protetiva', 'agressão', 'agrediu']
        const entradasRisco = (entradas || []).filter((e: any) => {
          const texto = (e.content || e.texto || '').toLowerCase()
          return palavrasJuridicas.some(p => texto.includes(p))
        })
        
        setRelatorioData({
          tipo: 'juridico',
          totalAnalisadas: entradas?.length || 0,
          entradasRisco,
          palavrasChave: palavrasJuridicas
        })
      } else if (tipo === 'detectarPossiveisMentiras') {
        // Análise de consistência - buscar usuários com muitas variações
        const { data: testes } = await supabase
          .from('clarity_tests')
          .select('user_id, scores, global_zone, created_at')
          .order('created_at', { ascending: false })
          .limit(1000)
        
        // Agrupar por usuário e verificar variações extremas
        const porUsuario: Record<string, any[]> = {}
        ;(testes || []).forEach((t: any) => {
          if (!porUsuario[t.user_id]) porUsuario[t.user_id] = []
          porUsuario[t.user_id].push(t)
        })
        
        const inconsistencias = Object.entries(porUsuario)
          .filter(([_, tests]) => {
            if (tests.length < 3) return false
            // Verificar se há variações muito grandes em curto período
            const zonas = tests.map(t => t.global_zone)
            const temVariacao = zonas.includes('ATENCAO') && zonas.includes('VERMELHA')
            return temVariacao
          })
          .map(([userId, tests]) => ({ userId, testes: tests.length, variacao: 'Alta' }))
        
        setRelatorioData({
          tipo: 'veracidade',
          totalUsuariosAnalisados: Object.keys(porUsuario).length,
          inconsistencias
        })
      } else if (tipo === 'evitarPrognosticosErrados') {
        // Validar prognósticos - buscar casos onde IA pode ter errado
        const { data: testes } = await supabase
          .from('clarity_tests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200)
        
        // Identificar casos extremos ou duvidosos
        const casosRevisao = (testes || []).filter((t: any) => {
          const scores = t.scores || {}
          // Casos onde todos os scores são muito altos ou muito baixos
          const total = (scores.nevoa || 0) + (scores.medo || 0) + (scores.limites || 0)
          return total > 25 || total < 3
        })
        
        setRelatorioData({
          tipo: 'prognosticos',
          totalAnalisados: testes?.length || 0,
          casosRevisao,
          criterios: ['Scores extremos (>25 ou <3)', 'Variação abrupta entre testes', 'Respostas inconsistentes']
        })
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
      setRelatorioData({ erro: 'Erro ao carregar dados do relatório' })
    } finally {
      setRelatorioLoading(false)
    }
  }

  // Carregar dados de um usuário específico
  const carregarDadosUsuario = async (userId: string) => {
    setRelatorioLoading(true)
    try {
      const [testesRes, entradasRes, profileRes] = await Promise.all([
        supabase.from('clarity_tests').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('journal_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('id', userId).single()
      ])
      
      setRelatorioData({
        tipo: 'pessoa_detalhe',
        usuario: profileRes.data,
        testes: testesRes.data || [],
        entradas: entradasRes.data || []
      })
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    } finally {
      setRelatorioLoading(false)
    }
  }

  // Gerar PDF do relatório
  const gerarPDFRelatorio = () => {
    setGerandoPDF(true)
    
    const tituloRelatorio = {
      'relatorioPontualPessoas': 'Relatório por Pessoa',
      'relatorioGlobalSistema': 'Relatório Global do Sistema',
      'rastrearProblemasJuridicos': 'Riscos Jurídicos Detectados',
      'detectarPossiveisMentiras': 'Análise de Veracidade',
      'evitarPrognosticosErrados': 'Validação de Prognósticos'
    }[relatorioAberto || ''] || 'Relatório'

    // Criar conteúdo do PDF
    let conteudo = `
RADAR NARCISISTA - ${tituloRelatorio.toUpperCase()}
Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
================================================================================

`

    if (relatorioData?.tipo === 'global') {
      conteudo += `
ESTATÍSTICAS GERAIS
-------------------
Total de Usuários: ${relatorioData.totalUsuarios}
Total de Testes: ${relatorioData.totalTestes}
Total de Entradas no Diário: ${relatorioData.totalEntradas}

DISTRIBUIÇÃO POR ZONA
---------------------
Zona Atenção (Verde): ${relatorioData.zonas?.ATENCAO || 0}
Zona Alerta (Amarelo): ${relatorioData.zonas?.ALERTA || 0}
Zona Vermelha: ${relatorioData.zonas?.VERMELHA || 0}
`
    } else if (relatorioData?.tipo === 'juridico') {
      conteudo += `
ANÁLISE DE RISCOS JURÍDICOS
---------------------------
Total de Entradas Analisadas: ${relatorioData.totalAnalisadas}
Entradas com Risco Detectado: ${relatorioData.entradasRisco?.length || 0}

PALAVRAS-CHAVE MONITORADAS:
${relatorioData.palavrasChave?.join(', ') || 'N/A'}

ENTRADAS COM RISCO:
${relatorioData.entradasRisco?.map((e: any, i: number) => `
${i + 1}. Data: ${new Date(e.created_at).toLocaleDateString('pt-BR')}
   Conteúdo: ${(e.content || e.texto || '').substring(0, 200)}...
`).join('') || 'Nenhuma entrada com risco detectada.'}
`
    } else if (relatorioData?.tipo === 'veracidade') {
      conteudo += `
ANÁLISE DE VERACIDADE/CONSISTÊNCIA
----------------------------------
Total de Usuários Analisados: ${relatorioData.totalUsuariosAnalisados}
Inconsistências Detectadas: ${relatorioData.inconsistencias?.length || 0}

${relatorioData.inconsistencias?.length > 0 ? `
USUÁRIOS COM INCONSISTÊNCIAS:
${relatorioData.inconsistencias.map((inc: any, i: number) => `
${i + 1}. ID: ${inc.userId.slice(0, 8)}... | Testes: ${inc.testes} | Variação: ${inc.variacao}
`).join('')}` : 'Nenhuma inconsistência significativa detectada.'}
`
    } else if (relatorioData?.tipo === 'prognosticos') {
      conteudo += `
VALIDAÇÃO DE PROGNÓSTICOS
-------------------------
Total de Testes Analisados: ${relatorioData.totalAnalisados}
Casos para Revisão: ${relatorioData.casosRevisao?.length || 0}

CRITÉRIOS DE VALIDAÇÃO:
${relatorioData.criterios?.map((c: string) => `- ${c}`).join('\n') || 'N/A'}

${relatorioData.casosRevisao?.length > 0 ? `
CASOS QUE REQUEREM REVISÃO:
${relatorioData.casosRevisao.slice(0, 20).map((c: any, i: number) => `
${i + 1}. Data: ${new Date(c.created_at).toLocaleDateString('pt-BR')}
   Zona: ${c.global_zone}
   Scores: Névoa=${c.scores?.nevoa || 0} | Medo=${c.scores?.medo || 0} | Limites=${c.scores?.limites || 0}
`).join('')}` : 'Todos os prognósticos parecem consistentes.'}
`
    } else if (relatorioData?.tipo === 'pessoa_detalhe') {
      conteudo += `
RELATÓRIO INDIVIDUAL DO USUÁRIO
-------------------------------
Email: ${relatorioData.usuario?.email || 'N/A'}
Data de Cadastro: ${relatorioData.usuario?.created_at ? new Date(relatorioData.usuario.created_at).toLocaleDateString('pt-BR') : 'N/A'}
Total de Testes: ${relatorioData.testes?.length || 0}
Total de Entradas no Diário: ${relatorioData.entradas?.length || 0}

HISTÓRICO DE TESTES:
${relatorioData.testes?.slice(0, 20).map((t: any, i: number) => `
${i + 1}. ${new Date(t.created_at).toLocaleDateString('pt-BR')} - Zona: ${t.global_zone}
`).join('') || 'Nenhum teste realizado.'}
`
    }

    if (avaliacaoAdmin) {
      conteudo += `
================================================================================
AVALIAÇÃO DO ADMINISTRADOR
--------------------------
${avaliacaoAdmin}
================================================================================
`
    }

    conteudo += `
--------------------------------------------------------------------------------
Gerado automaticamente pelo Radar Narcisista
${new Date().toISOString()}
`

    // Criar e baixar arquivo
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_${relatorioAberto}_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setGerandoPDF(false)
    setMessage('📄 Relatório exportado com sucesso!')
    setTimeout(() => setMessage(''), 3000)
  }

  // Avaliar item do relatório
  const avaliarItemRelatorio = (itemId: string, status: 'aprovado' | 'rejeitado', nota?: string) => {
    setItensParaAvaliar(prev => {
      const existe = prev.find(i => i.id === itemId)
      if (existe) {
        return prev.map(i => i.id === itemId ? { ...i, status, nota } : i)
      }
      return [...prev, { id: itemId, status, nota }]
    })
    setMessage(`✅ Item ${status === 'aprovado' ? 'aprovado' : 'rejeitado'}`)
    setTimeout(() => setMessage(''), 2000)
  }

  // ===== CONFIGURAÇÃO DAS IAs =====
  // Lista inicial de IAs do registro
  const iasIniciais = IAS_DISPONIVEIS.map(ia => ({
    id: ia.id,
    nome: ia.nome,
    icon: ia.icon,
    isNova: isIANova(ia),
    categoria: ia.categoria,
    ativa: false,
    chaveConfigurada: false,
  }))

  const [iasConfig, setIasConfig] = useState({
    // IAs disponíveis
    ias: iasIniciais,
    
    // Etapas - quais IAs em cada etapa
    etapa1_analise: ['openai'],
    etapa2_votacao: ['openai'],
    etapa3_consenso: ['openai'],
    etapa4_transparencia: ['openai'],
    
    // Controle de qualidade
    thresholdVotacao: 80, // %
    minConsenso: 2,
    exigirConsensoTotal: false,
    
    // Relatórios do administrador
    relatorioPontualPessoas: true,
    relatorioGlobalSistema: true,
    rastrearProblemasJuridicos: true,
    detectarPossiveisMentiras: true,
    evitarPrognosticosErrados: true,
    
    // Prompt do Coach
    coachPromptCustomizado: false,
    coachTom: 'empatico', // empatico, direto, tecnico
    coachFoco: 'validacao', // validacao, educacao, acao
    
    // Limites
    maxTokensResposta: 1000,
    temperaturaIA: 0.7,
  })

  // Estados para testar e ver saldo das IAs
  const [testingIA, setTestingIA] = useState<Record<string, boolean>>({})
  const [checkingBalanceIA, setCheckingBalanceIA] = useState<Record<string, boolean>>({})
  const [iaBalances, setIaBalances] = useState<Record<string, string>>({})
  const [iaStatus, setIaStatus] = useState<Record<string, 'ok' | 'error' | 'unknown'>>({})
  const [iaKeys, setIaKeys] = useState<Record<string, string>>({})
  const [testingAll, setTestingAll] = useState(false)
  const [iaFilter, setIaFilter] = useState<'all' | 'configured' | 'active' | 'free' | 'error'>('all')
  const [iaSearch, setIaSearch] = useState('')
  const [expandedIA, setExpandedIA] = useState<string | null>(null)
  const [newKeyInput, setNewKeyInput] = useState('')
  const [savingKey, setSavingKey] = useState(false)

  // Carregar IAs customizadas e chaves do localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Primeiro, carregar IAs customizadas
    try {
      const customizadas = localStorage.getItem('ias_customizadas')
      if (customizadas) {
        const iasCustom = JSON.parse(customizadas) as IAConfig[]
        const novasIAs = iasCustom.map(ia => ({
          id: ia.id,
          nome: ia.nome,
          icon: ia.icon,
          isNova: true,
          categoria: ia.categoria,
          ativa: false,
          chaveConfigurada: false,
        }))
        
        setIasConfig(prev => ({
          ...prev,
          ias: [...prev.ias, ...novasIAs]
        }))
      }
    } catch (e) {}

    // Depois, carregar chaves
    const savedKeys = localStorage.getItem('ai_api_keys')
    if (savedKeys) {
      try {
        const keys = JSON.parse(savedKeys)
        setIaKeys(keys)
        setIasConfig(prev => {
          const novasIas = prev.ias.map(ia => {
            const temChave = !!(keys[ia.id] && keys[ia.id].length > 10)
            return {
              ...ia,
              chaveConfigurada: temChave,
              ativa: temChave ? ia.ativa : false
            }
          })
          return { ...prev, ias: novasIas }
        })
      } catch (e) {
        console.error('Erro ao carregar chaves:', e)
      }
    }
    
    // Carregar saldos salvos
    const savedBalances = localStorage.getItem('ia_balances_admin')
    if (savedBalances) {
      try {
        setIaBalances(JSON.parse(savedBalances))
      } catch (e) {}
    }
    
    // Carregar status salvos
    const savedStatus = localStorage.getItem('ia_status_admin')
    if (savedStatus) {
      try {
        setIaStatus(JSON.parse(savedStatus))
      } catch (e) {}
    }
  }, [])

  // Salvar chave inline (direto no card)
  const salvarChaveInline = async (iaId: string) => {
    if (!newKeyInput || newKeyInput.length < 10) {
      return
    }

    setSavingKey(true)
    
    // Atualizar iaKeys
    const novasChaves = { ...iaKeys, [iaId]: newKeyInput }
    setIaKeys(novasChaves)
    localStorage.setItem('ai_api_keys', JSON.stringify(novasChaves))
    
    // Atualizar status da IA
    setIasConfig(prev => ({
      ...prev,
      ias: prev.ias.map(ia => 
        ia.id === iaId ? { ...ia, chaveConfigurada: true } : ia
      )
    }))
    
    // Testar a chave automaticamente
    await testarChaveIA(iaId)
    
    // Limpar e fechar
    setNewKeyInput('')
    setExpandedIA(null)
    setSavingKey(false)
  }

  // Remover chave
  const removerChave = (iaId: string) => {
    const novasChaves = { ...iaKeys }
    delete novasChaves[iaId]
    setIaKeys(novasChaves)
    localStorage.setItem('ai_api_keys', JSON.stringify(novasChaves))
    
    setIasConfig(prev => ({
      ...prev,
      ias: prev.ias.map(ia => 
        ia.id === iaId ? { ...ia, chaveConfigurada: false, ativa: false } : ia
      )
    }))
    
    setIaStatus(prev => {
      const novo = { ...prev }
      delete novo[iaId]
      return novo
    })
    
    setIaBalances(prev => {
      const novo = { ...prev }
      delete novo[iaId]
      return novo
    })
  }

  // Testar TODAS as chaves configuradas
  const testarTodasIAs = async () => {
    const iasComChave = iasConfig.ias.filter(ia => ia.chaveConfigurada)
    if (iasComChave.length === 0) return

    setTestingAll(true)
    
    for (const ia of iasComChave) {
      await testarChaveIA(ia.id)
      // Pequeno delay entre testes para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setTestingAll(false)
  }

  // Filtrar IAs baseado no filtro selecionado
  const iasFiltradas = iasConfig.ias.filter(ia => {
    // Filtro de busca
    if (iaSearch && !ia.nome.toLowerCase().includes(iaSearch.toLowerCase())) {
      return false
    }
    
    // Filtro de categoria
    switch (iaFilter) {
      case 'configured':
        return ia.chaveConfigurada
      case 'active':
        return ia.ativa
      case 'free':
        return ia.nome.includes('GRÁTIS') || ia.id === 'groq' || ia.id === 'huggingface' || ia.id === 'cerebras'
      case 'error':
        return iaStatus[ia.id] === 'error'
      default:
        return true
    }
  })

  // Testar chave da IA
  const testarChaveIA = async (iaId: string) => {
    const key = iaKeys[iaId]
    if (!key) return

    setTestingIA(prev => ({ ...prev, [iaId]: true }))
    
    try {
      const response = await fetch('/api/check-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: iaId, key })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIaStatus(prev => {
          const updated = { ...prev, [iaId]: 'ok' as const }
          localStorage.setItem('ia_status_admin', JSON.stringify(updated))
          return updated
        })
        setIaBalances(prev => {
          const updated = { ...prev, [iaId]: '✓ Funcionando' }
          localStorage.setItem('ia_balances_admin', JSON.stringify(updated))
          return updated
        })
      } else {
        setIaStatus(prev => ({ ...prev, [iaId]: 'error' as const }))
        setIaBalances(prev => ({ ...prev, [iaId]: '✗ ' + (data.error || 'Erro na API') }))
      }
    } catch (error) {
      setIaStatus(prev => ({ ...prev, [iaId]: 'error' as const }))
      setIaBalances(prev => ({ ...prev, [iaId]: '✗ Sem conexão' }))
    } finally {
      setTestingIA(prev => ({ ...prev, [iaId]: false }))
    }
  }

  // Ver saldo da IA
  const verSaldoIA = async (iaId: string) => {
    const key = iaKeys[iaId]
    if (!key) return

    setCheckingBalanceIA(prev => ({ ...prev, [iaId]: true }))
    
    try {
      const response = await fetch('/api/check-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: iaId, key })
      })
      
      const data = await response.json()
      
      let balanceText = ''
      if (data.balance === '∞') {
        balanceText = '∞ Grátis'
      } else if (data.balance) {
        balanceText = `$${data.balance}`
      } else if (data.usage) {
        balanceText = data.usage
      } else {
        balanceText = '✓ Ativo'
      }
      
      setIaBalances(prev => {
        const updated = { ...prev, [iaId]: balanceText }
        localStorage.setItem('ia_balances_admin', JSON.stringify(updated))
        return updated
      })
    } catch (error) {
      setIaBalances(prev => ({ ...prev, [iaId]: '? Erro' }))
    } finally {
      setCheckingBalanceIA(prev => ({ ...prev, [iaId]: false }))
    }
  }

  const toggleIAAtiva = (iaId: string) => {
    setIasConfig(prev => ({
      ...prev,
      ias: prev.ias.map(ia => 
        ia.id === iaId ? { ...ia, ativa: !ia.ativa } : ia
      )
    }))
  }

  const toggleIAEtapa = (etapa: string, iaId: string) => {
    setIasConfig(prev => {
      const etapaKey = etapa as keyof typeof prev
      const etapaAtual = prev[etapaKey] as string[]
      const novaEtapa = etapaAtual.includes(iaId)
        ? etapaAtual.filter(id => id !== iaId)
        : [...etapaAtual, iaId]
      return { ...prev, [etapaKey]: novaEtapa }
    })
  }

  const [salvandoConfig, setSalvandoConfig] = useState(false)
  const [configSalvaSupabase, setConfigSalvaSupabase] = useState(false)

  // Carregar config do Supabase ao iniciar
  useEffect(() => {
    const carregarConfig = async () => {
      try {
        const config = await loadIAConfig()
        if (config) {
          setIasConfig(prev => ({
            ...prev,
            etapa1_analise: config.etapa1_analise || ['openai'],
            etapa2_votacao: config.etapa2_votacao || ['openai'],
            etapa3_consenso: config.etapa3_consenso || ['openai'],
            etapa4_transparencia: config.etapa4_transparencia || ['openai'],
            thresholdVotacao: config.threshold_votacao || 80,
            minConsenso: config.min_consenso || 2,
            exigirConsensoTotal: config.exigir_consenso_total || false,
            relatorioPontualPessoas: config.relatorio_pontual_pessoas ?? true,
            relatorioGlobalSistema: config.relatorio_global_sistema ?? true,
            rastrearProblemasJuridicos: config.rastrear_problemas_juridicos ?? true,
            detectarPossiveisMentiras: config.detectar_possiveis_mentiras ?? true,
            evitarPrognosticosErrados: config.evitar_prognosticos_errados ?? true,
            coachTom: config.coach_tom || 'empatico',
            coachFoco: config.coach_foco || 'validacao',
            temperaturaIA: config.temperatura_ia || 0.7,
          }))
          setConfigSalvaSupabase(true)
          console.log('✅ Config carregada do Supabase')
        }
      } catch (error) {
        console.error('Erro ao carregar config:', error)
        // Tentar carregar do localStorage
        const localConfig = loadIAConfigLocal()
        if (localConfig) {
          console.log('💾 Config carregada do localStorage')
        }
      }
    }
    carregarConfig()
  }, [])

  const salvarConfigIA = async () => {
    setSalvandoConfig(true)
    setMessage('💾 Salvando configurações...')
    
    try {
      const configParaSalvar = {
        ias_ativas: iasConfig.ias.filter(ia => ia.ativa).map(ia => ia.id),
        etapa1_analise: iasConfig.etapa1_analise,
        etapa2_votacao: iasConfig.etapa2_votacao,
        etapa3_consenso: iasConfig.etapa3_consenso,
        etapa4_transparencia: iasConfig.etapa4_transparencia,
        threshold_votacao: iasConfig.thresholdVotacao,
        min_consenso: iasConfig.minConsenso,
        exigir_consenso_total: iasConfig.exigirConsensoTotal,
        relatorio_pontual_pessoas: iasConfig.relatorioPontualPessoas,
        relatorio_global_sistema: iasConfig.relatorioGlobalSistema,
        rastrear_problemas_juridicos: iasConfig.rastrearProblemasJuridicos,
        detectar_possiveis_mentiras: iasConfig.detectarPossiveisMentiras,
        evitar_prognosticos_errados: iasConfig.evitarPrognosticosErrados,
        coach_tom: iasConfig.coachTom,
        coach_foco: iasConfig.coachFoco,
        temperatura_ia: iasConfig.temperaturaIA,
        max_tokens_resposta: iasConfig.maxTokensResposta,
      }
      
      const sucesso = await saveIAConfig(configParaSalvar)
      
      if (sucesso) {
        setConfigSalvaSupabase(true)
        setMessage('✅ Configurações salvas no Supabase!')
      } else {
        setMessage('⚠️ Salvo localmente (Supabase indisponível)')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setMessage('❌ Erro ao salvar. Tente novamente.')
    } finally {
      setSalvandoConfig(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  // Configurações das frontpages
  const [frontpages, setFrontpages] = useState<FrontpageConfig[]>([
    {
      id: 'version-a',
      name: 'Versão A (SaaS Original - COM ESTADOS)',
      isActive: true,
      isTestEnabled: false,
      isExternal: false
    },
    {
      id: 'version-b', 
      name: 'Versão B (SaaS)',
      isActive: false,
      isTestEnabled: false,
      isExternal: false
    },
    {
      id: 'version-c',
      name: 'Versão C (Million Dollar)',
      isActive: false,
      isTestEnabled: false,
      isExternal: false
    },
    // URLs externas (até 3)
    {
      id: 'external-1',
      name: 'Frontpage Externa 1',
      url: '',
      isActive: false,
      isTestEnabled: false,
      isExternal: true
    },
    {
      id: 'external-2',
      name: 'Frontpage Externa 2',
      url: '',
      isActive: false,
      isTestEnabled: false,
      isExternal: true
    },
    {
      id: 'external-3',
      name: 'Frontpage Externa 3',
      url: '',
      isActive: false,
      isTestEnabled: false,
      isExternal: true
    }
  ])

  // Carregar configurações do Supabase
  useEffect(() => {
    loadFrontpageConfig()
  }, [])

  const loadFrontpageConfig = async () => {
    try {
      const response = await fetch('/api/admin/frontpage-config')
      const data = await response.json()

      if (data.success && data.config) {
        setFrontpages(data.config)
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
    }
  }

  const saveConfig = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/frontpage-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config: frontpages }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ Configurações salvas com sucesso!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        throw new Error(data.error || 'Erro ao salvar')
      }
    } catch (err) {
      setMessage('❌ Erro ao salvar configurações')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = (id: string) => {
    setFrontpages(prev => prev.map(fp => 
      fp.id === id 
        ? { ...fp, isActive: !fp.isActive }
        : { ...fp, isActive: false } // Só uma pode estar ativa
    ))
  }

  const toggleTest = (id: string) => {
    setFrontpages(prev => prev.map(fp => 
      fp.id === id ? { ...fp, isTestEnabled: !fp.isTestEnabled } : fp
    ))
  }

  const updateUrl = (id: string, url: string) => {
    setFrontpages(prev => prev.map(fp => 
      fp.id === id ? { ...fp, url } : fp
    ))
  }

  const removeFrontpage = (id: string) => {
    if (id.startsWith('external-')) {
      setFrontpages(prev => prev.filter(fp => fp.id !== id))
    }
  }

  const addExternalFrontpage = () => {
    const externalsCount = frontpages.filter(fp => fp.isExternal).length
    if (externalsCount >= 3) {
      setMessage('❌ Máximo de 3 frontpages externas atingido')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    const newId = `external-${externalsCount + 1}`
    const newFrontpage: FrontpageConfig = {
      id: newId,
      name: `Frontpage Externa ${externalsCount + 1}`,
      url: '',
      isActive: false,
      isTestEnabled: false,
      isExternal: true
    }

    setFrontpages(prev => [...prev, newFrontpage])
  }

  const activeCount = frontpages.filter(fp => fp.isActive).length
  const testEnabledCount = frontpages.filter(fp => fp.isTestEnabled).length
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const apiKeysPath = getAdminFeature('api_keys')?.path ?? '/admin/configurar-ias'
  
  // MENU DINÂMICO - Carregado do arquivo centralizado lib/admin-menu-config.ts
  // Para editar: vá em /admin/menu-config ou edite lib/admin-menu-config.ts
  const [dynamicMenuItems, setDynamicMenuItems] = useState<AdminMenuItem[]>([])
  
  useEffect(() => {
    // Carregar menu do localStorage/config centralizado
    const items = loadMenuOrder()
    setDynamicMenuItems(items.filter(i => i.enabled))
  }, [])

  // Mapeamento de ícones string -> componente
  const iconMap: Record<string, any> = {
    Bot, Settings, Zap, Scale, Brain, BookOpen, MessageSquare, Users, MapPin,
    TestTube, Eye, Layout, Globe, BarChart3, TrendingUp, Activity, Sparkles,
    CheckSquare, UserPlus, Network, MessageCircle, Cog, GitBranch
  }

  // Badges dinâmicos
  const getBadge = (itemId: string): number => {
    switch (itemId) {
      case 'biblioteca': return respostasPendentes
      case 'historias': return historiasPendentes
      case 'comunidade': return comunidadePendentes + denuncias
      default: return 0
    }
  }

  // Converter menu dinâmico para formato usado no render
  const menuItems = dynamicMenuItems.map(item => ({
    id: item.id,
    label: item.label,
    icon: iconMap[item.icon] || Eye,
    isLink: item.isLink,
    href: item.href,
    badge: getBadge(item.id),
    // Destacar orquestrador de fluxos
    isFlowOrchestrator: item.id === 'fluxos_ia'
  }))

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Sidebar - Menu Lateral Esquerdo */}
      <aside className={`${sidebarOpen ? 'w-52' : 'w-14'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 fixed h-full z-40`}>
        {/* Logo/Header */}
        <div className="p-3 border-b border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h1 className="text-lg font-bold text-purple-400">Admin</h1>}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
          {sidebarOpen && (
            <a
              href="/admin/menu-config"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
              title="Configurar ordem do menu"
            >
              <span>⚙️</span>
              <span>Config Menu</span>
            </a>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {menuItems.map(item => {
            const isFlow = (item as any).isFlowOrchestrator

            return (
              'isLink' in item && (item as any).isLink ? (
                <a
                  key={item.id}
                  href={(item as any).href}
                  className={`relative flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                    isFlow
                      ? 'bg-red-600/20 text-red-400 border-r-2 border-red-500 hover:bg-red-600/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-purple-400'
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${isFlow ? 'text-red-400' : ''}`} />
                  {sidebarOpen && (
                    <span className={`truncate ${isFlow ? 'font-bold text-red-400' : ''}`}>
                      {item.label}
                    </span>
                  )}
                  {isFlow && sidebarOpen && (
                    <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                      NEW
                    </span>
                  )}
                </a>
              ) : (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                    isFlow
                      ? 'bg-red-600/20 text-red-400 border-r-2 border-red-500 hover:bg-red-600/30'
                      : activeTab === item.id
                        ? 'bg-purple-600/20 text-purple-400 border-r-2 border-purple-500'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${isFlow ? 'text-red-400' : ''}`} />
                  {sidebarOpen && (
                    <span className={`truncate ${isFlow ? 'font-bold text-red-400' : ''}`}>
                      {item.label}
                    </span>
                  )}
                  {'badge' in item && (item as any).badge > 0 && !isFlow && (
                    <span className={`${sidebarOpen ? 'ml-auto' : 'absolute top-1 right-1'} bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center`}>
                      {(item as any).badge}
                    </span>
                  )}
                </button>
              )
            )
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-3 border-t border-slate-800 text-xs text-slate-500">
            {activeCount} ativa • {testEnabledCount} teste
            <a
              href="/admin/menu-config"
              className="block mt-2 text-purple-400 hover:text-purple-300 underline"
            >
              ⚙️ Configurar Menu
            </a>
            <button
              onClick={() => {
                localStorage.removeItem('ai_api_keys')
                localStorage.removeItem('ia_balances_admin')
                localStorage.removeItem('ia_status_admin')
                localStorage.removeItem('ias_customizadas')
                window.location.reload()
              }}
              className="block mt-1 text-red-400 hover:text-red-300 underline"
            >
              🗑️ Limpar cache
            </button>
          </div>
        )}
      </aside>

      {/* Conteúdo Principal */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-52' : 'ml-14'} transition-all duration-300`}>
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Painel Admin - Radar Narcisista</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearCache}
                className="text-xs text-slate-300 hover:text-slate-100 border border-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">Limpar cache</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-red-400 hover:text-red-300 border border-red-500/40 px-3 py-1.5 rounded-lg"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <div className="p-6">
          {/* Mensagem de feedback */}
          {message && (
          <div className="mb-6 p-4 rounded-lg bg-slate-800 border border-slate-700 text-center">
            {message}
          </div>
        )}

        {activeTab === 'frontpage' && (
          <div className="space-y-8">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Gerenciar Frontpages
                </h2>
                <p className="text-slate-400">
                  Escolha qual versão estará ativa e habilite testes A/B/C
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={addExternalFrontpage}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Externa
                </button>
                <button
                  onClick={saveConfig}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>

            {/* Grid de frontpages */}
            <div className="grid gap-6">
              {frontpages.map((frontpage) => (
                <div
                  key={frontpage.id}
                  className={`border rounded-xl p-6 transition-all ${
                    frontpage.isActive 
                      ? 'border-purple-500 bg-purple-950/20' 
                      : 'border-slate-700 bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {frontpage.isExternal ? (
                        <Globe className="h-5 w-5 text-blue-400" />
                      ) : (
                        <Layout className="h-5 w-5 text-purple-400" />
                      )}
                      <div>
                        <h3 className="font-semibold text-white">
                          {frontpage.name}
                        </h3>
                        {frontpage.isActive && (
                          <span className="inline-flex items-center gap-1 text-xs text-purple-400">
                            <Power className="h-3 w-3" />
                            Ativa no site
                          </span>
                        )}
                      </div>
                    </div>
                    {frontpage.isExternal && (
                      <button
                        onClick={() => removeFrontpage(frontpage.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* URL externa */}
                  {frontpage.isExternal && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        URL da Frontpage
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={frontpage.url || ''}
                          onChange={(e) => updateUrl(frontpage.id, e.target.value)}
                          placeholder="https://exemplo.com/frontpage"
                          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                        {frontpage.url && (
                          <a
                            href={frontpage.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <LinkIcon className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Controles */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleActive(frontpage.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        frontpage.isActive
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {frontpage.isActive ? (
                        <>
                          <Power className="h-4 w-4" />
                          Ativa
                        </>
                      ) : (
                        <>
                          <PowerOff className="h-4 w-4" />
                          Ativar
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => toggleTest(frontpage.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        frontpage.isTestEnabled
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <TestTube className="h-4 w-4" />
                      {frontpage.isTestEnabled ? 'Em Teste' : 'Habilitar Teste'}
                    </button>

                    {frontpage.isTestEnabled && (
                      <span className="flex items-center gap-1 text-sm text-emerald-400">
                        <Eye className="h-3 w-3" />
                        Coletando dados
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-2">Total de Frontpages</h3>
                <p className="text-3xl font-bold text-purple-400">{frontpages.length}</p>
              </div>
              <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-2">Em Teste A/B/C</h3>
                <p className="text-3xl font-bold text-emerald-400">{testEnabledCount}</p>
              </div>
              <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-2">Ativa no Site</h3>
                <p className="text-3xl font-bold text-blue-400">{activeCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== ABA: CONFIGURAÇÃO DE IAs ===== */}
        {activeTab === 'ias' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Configuração de IAs Colaborativas
                </h2>
                <p className="text-slate-400">
                  Configure quais IAs participam de cada etapa do sistema
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Indicador de status */}
                <div className="flex items-center gap-2 text-sm">
                  {configSalvaSupabase ? (
                    <span className="flex items-center gap-1 text-green-400">
                      <Cloud className="h-4 w-4" />
                      Sincronizado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <CloudOff className="h-4 w-4" />
                      Local
                    </span>
                  )}
                </div>
                
                <button
                  onClick={salvarConfigIA}
                  disabled={salvandoConfig}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                    salvandoConfig 
                      ? 'bg-slate-600 cursor-not-allowed' 
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {salvandoConfig ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {salvandoConfig ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </div>
            </div>

            {/* Novidades em IAs */}
            <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🆕</span>
                  <div>
                    <h4 className="font-semibold text-white">Fique por dentro das novas IAs!</h4>
                    <p className="text-sm text-slate-400">Novas IAs surgem toda semana. Acompanhe as novidades:</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a 
                    href="https://theresanaiforthat.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    🔍 There's an AI for That
                  </a>
                  <a 
                    href="https://www.futuretools.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    🛠️ Future Tools
                  </a>
                  <a 
                    href="https://openrouter.ai/models" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                  >
                    🔀 OpenRouter (todas IAs)
                  </a>
                  <a 
                    href="https://artificialanalysis.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
                  >
                    📊 Comparar IAs
                  </a>
                </div>
              </div>
            </div>

            {/* Resumo de Status */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <div className="bg-slate-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{iasConfig.ias.length}</p>
                <p className="text-xs text-slate-400">Total de IAs</p>
              </div>
              <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-400">{iasConfig.ias.filter(ia => ia.chaveConfigurada).length}</p>
                <p className="text-xs text-green-400/70">Configuradas</p>
              </div>
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-400">{iasConfig.ias.filter(ia => ia.ativa).length}</p>
                <p className="text-xs text-blue-400/70">Ativas</p>
              </div>
              <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">{Object.values(iaStatus).filter(s => s === 'ok').length}</p>
                <p className="text-xs text-emerald-400/70">Funcionando</p>
              </div>
              <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-400">{Object.values(iaStatus).filter(s => s === 'error').length}</p>
                <p className="text-xs text-red-400/70">Com Erro</p>
              </div>
            </div>

            {/* Status das IAs */}
            <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6">
              {/* Header com ações */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-purple-400" />
                  IAs ({iasFiltradas.length} de {iasConfig.ias.length})
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={testarTodasIAs}
                    disabled={testingAll || iasConfig.ias.filter(ia => ia.chaveConfigurada).length === 0}
                    className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-1"
                  >
                    {testingAll ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>⚡ Testar Todas</>
                    )}
                  </button>
                  <a 
                    href={apiKeysPath}
                    className="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    + API Keys
                  </a>
                </div>
              </div>

              {/* Busca e Filtros */}
              <div className="flex flex-wrap gap-3 mb-4">
                {/* Busca */}
                <input
                  type="text"
                  placeholder="🔍 Buscar IA..."
                  value={iaSearch}
                  onChange={(e) => setIaSearch(e.target.value)}
                  className="flex-1 min-w-[150px] px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  data-form-type="other"
                  name="ia-search-field"
                />
                
                {/* Filtros */}
                <div className="flex gap-1 flex-wrap">
                  {[
                    { id: 'all', label: 'Todas', count: iasConfig.ias.length },
                    { id: 'configured', label: '✓ Configuradas', count: iasConfig.ias.filter(ia => ia.chaveConfigurada).length },
                    { id: 'active', label: '🟢 Ativas', count: iasConfig.ias.filter(ia => ia.ativa).length },
                    { id: 'free', label: '🆓 Grátis', count: iasConfig.ias.filter(ia => ia.nome.includes('GRÁTIS')).length },
                    { id: 'error', label: '🔴 Erros', count: Object.values(iaStatus).filter(s => s === 'error').length },
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setIaFilter(filter.id as any)}
                      className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                        iaFilter === filter.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid de IAs */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-2">
                {iasFiltradas.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-slate-400">
                    Nenhuma IA encontrada com esse filtro
                  </div>
                ) : iasFiltradas.map((ia) => (
                  <div
                    key={ia.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      iaStatus[ia.id] === 'error'
                        ? 'border-red-500 bg-red-950/20'
                        : ia.ativa 
                          ? 'border-green-500 bg-green-950/20' 
                          : ia.chaveConfigurada 
                            ? 'border-slate-600 bg-slate-800'
                            : 'border-slate-700 bg-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{(ia as any).icon || '🤖'}</span>
                        {/* Indicador de status */}
                        {ia.chaveConfigurada && (
                          <span className={`w-2 h-2 rounded-full ${
                            iaStatus[ia.id] === 'ok' ? 'bg-green-500' :
                            iaStatus[ia.id] === 'error' ? 'bg-red-500 animate-pulse' :
                            'bg-yellow-500'
                          }`} title={
                            iaStatus[ia.id] === 'ok' ? 'Funcionando' :
                            iaStatus[ia.id] === 'error' ? 'Erro na API' :
                            'Não testado'
                          } />
                        )}
                      </div>
                      <button
                        onClick={() => ia.chaveConfigurada && iaStatus[ia.id] !== 'error' && toggleIAAtiva(ia.id)}
                        disabled={!ia.chaveConfigurada || iaStatus[ia.id] === 'error'}
                        className={`text-xs px-2 py-1 rounded font-bold transition-colors ${
                          iaStatus[ia.id] === 'error'
                            ? 'bg-red-600 text-white cursor-not-allowed'
                            : ia.ativa 
                              ? 'bg-green-500 text-white hover:bg-green-600' 
                              : ia.chaveConfigurada
                                ? 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {iaStatus[ia.id] === 'error' ? '❌' : ia.ativa ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <p className="text-sm font-medium text-white mb-1">{ia.nome}</p>
                    
                    {ia.chaveConfigurada ? (
                      <div className="space-y-2">
                        {/* Status da API */}
                        <div className={`text-xs ${
                          iaStatus[ia.id] === 'ok' ? 'text-green-400' :
                          iaStatus[ia.id] === 'error' ? 'text-red-400' :
                          'text-yellow-400'
                        }`}>
                          {iaStatus[ia.id] === 'ok' && '✓ API funcionando'}
                          {iaStatus[ia.id] === 'error' && (iaBalances[ia.id] || '✗ API com erro')}
                          {!iaStatus[ia.id] && '⚠ Não testado'}
                        </div>
                        
                        {/* Saldo se disponível */}
                        {iaBalances[ia.id] && iaStatus[ia.id] === 'ok' && (
                          <div className="text-xs text-emerald-400">
                            💰 {iaBalances[ia.id]}
                          </div>
                        )}
                        
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); testarChaveIA(ia.id); }}
                            disabled={testingIA[ia.id]}
                            className={`flex-1 text-xs px-2 py-1 rounded disabled:opacity-50 ${
                              iaStatus[ia.id] === 'error' 
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {testingIA[ia.id] ? '...' : iaStatus[ia.id] === 'error' ? '🔄 Retestar' : '⚡ Testar'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); verSaldoIA(ia.id); }}
                            disabled={checkingBalanceIA[ia.id] || iaStatus[ia.id] === 'error'}
                            className="flex-1 text-xs px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded disabled:opacity-50"
                          >
                            {checkingBalanceIA[ia.id] ? '...' : '💰 Saldo'}
                          </button>
                        </div>
                        
                        {/* Botão para editar/remover chave */}
                        <button
                          onClick={(e) => { 
                            e.stopPropagation()
                            setExpandedIA(expandedIA === ia.id ? null : ia.id)
                            setNewKeyInput(iaKeys[ia.id] || '')
                          }}
                          className="w-full text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded mt-1"
                        >
                          {expandedIA === ia.id ? '▲ Fechar' : '⚙️ Editar chave'}
                        </button>
                        
                        {/* Dropdown para editar chave */}
                        {expandedIA === ia.id && (
                          <div className="mt-2 p-2 bg-slate-800 rounded-lg border border-slate-600">
                            <textarea
                              value={newKeyInput}
                              onChange={(e) => setNewKeyInput(e.target.value.replace(/\n/g, ''))}
                              placeholder="Cole a nova chave..."
                              className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white mb-2 resize-none h-8"
                              onClick={(e) => e.stopPropagation()}
                              autoComplete="new-password"
                              rows={1}
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); salvarChaveInline(ia.id); }}
                                disabled={savingKey || !newKeyInput}
                                className="flex-1 text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
                              >
                                {savingKey ? '...' : '✓ Salvar'}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); removerChave(ia.id); }}
                                className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        {/* Botão para adicionar chave inline */}
                        <button
                          onClick={(e) => { 
                            e.stopPropagation()
                            setExpandedIA(expandedIA === ia.id ? null : ia.id)
                            setNewKeyInput('')
                          }}
                          className="text-xs text-purple-400 hover:text-purple-300 underline"
                        >
                          + Adicionar chave API
                        </button>
                        
                        {/* Dropdown para adicionar chave */}
                        {expandedIA === ia.id && (
                          <div className="mt-2 p-2 bg-slate-800 rounded-lg border border-purple-500/50">
                            <p className="text-xs text-slate-400 mb-2">Cole sua API Key:</p>
                            <textarea
                              value={newKeyInput}
                              onChange={(e) => setNewKeyInput(e.target.value.replace(/\n/g, ''))}
                              placeholder="sk-... ou gsk_..."
                              className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white mb-2 resize-none h-8"
                              onClick={(e) => e.stopPropagation()}
                              autoComplete="new-password"
                              rows={1}
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); salvarChaveInline(ia.id); }}
                                disabled={savingKey || !newKeyInput || newKeyInput.length < 10}
                                className="flex-1 text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50"
                              >
                                {savingKey ? '...' : '✓ Salvar e Testar'}
                              </button>
                            </div>
                            <a 
                              href={apiKeysPath}
                              target="_blank"
                              className="block text-center text-xs text-slate-500 hover:text-slate-400 mt-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              ou abrir página completa ↗
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Etapas do Sistema */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Etapa 1 */}
              <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm">1</span>
                  Análise Colaborativa
                </h3>
                <p className="text-slate-400 text-sm mb-4">Quais IAs analisam o texto inicial</p>
                <div className="flex flex-wrap gap-2">
                  {iasConfig.ias.filter(ia => ia.ativa).map(ia => (
                    <button
                      key={ia.id}
                      onClick={() => toggleIAEtapa('etapa1_analise', ia.id)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        iasConfig.etapa1_analise.includes(ia.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {ia.nome.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Etapa 2 */}
              <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm">2</span>
                  Votação
                </h3>
                <p className="text-slate-400 text-sm mb-4">Quais IAs validam as análises</p>
                <div className="flex flex-wrap gap-2">
                  {iasConfig.ias.filter(ia => ia.ativa).map(ia => (
                    <button
                      key={ia.id}
                      onClick={() => toggleIAEtapa('etapa2_votacao', ia.id)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        iasConfig.etapa2_votacao.includes(ia.id)
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {ia.nome.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Etapa 3 */}
              <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-sm">3</span>
                  Consenso
                </h3>
                <p className="text-slate-400 text-sm mb-4">Quais IAs aprovam o resultado final</p>
                <div className="flex flex-wrap gap-2">
                  {iasConfig.ias.filter(ia => ia.ativa).map(ia => (
                    <button
                      key={ia.id}
                      onClick={() => toggleIAEtapa('etapa3_consenso', ia.id)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        iasConfig.etapa3_consenso.includes(ia.id)
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {ia.nome.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Etapa 4 */}
              <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-sm">4</span>
                  Transparência
                </h3>
                <p className="text-slate-400 text-sm mb-4">Quais IAs geram relatório final</p>
                <div className="flex flex-wrap gap-2">
                  {iasConfig.ias.filter(ia => ia.ativa).map(ia => (
                    <button
                      key={ia.id}
                      onClick={() => toggleIAEtapa('etapa4_transparencia', ia.id)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        iasConfig.etapa4_transparencia.includes(ia.id)
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {ia.nome.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Controle de Qualidade */}
            <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Scale className="h-5 w-5 text-yellow-400" />
                Controle de Qualidade
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Threshold de Votação (%)
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={iasConfig.thresholdVotacao}
                    onChange={(e) => setIasConfig(prev => ({ ...prev, thresholdVotacao: Number(e.target.value) }))}
                    className="w-full"
                  />
                  <p className="text-center text-white font-bold mt-1">{iasConfig.thresholdVotacao}%</p>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Mínimo de IAs para Consenso
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={iasConfig.minConsenso}
                    onChange={(e) => setIasConfig(prev => ({ ...prev, minConsenso: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIasConfig(prev => ({ ...prev, exigirConsensoTotal: !prev.exigirConsensoTotal }))}
                    className={`p-2 rounded-lg transition-colors ${
                      iasConfig.exigirConsensoTotal ? 'bg-green-600' : 'bg-slate-700'
                    }`}
                  >
                    {iasConfig.exigirConsensoTotal ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                  </button>
                  <div>
                    <p className="text-white font-medium">Consenso Total</p>
                    <p className="text-xs text-slate-400">100% das IAs devem concordar</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Relatórios do Administrador */}
            <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-blue-400" />
                Relatórios do Administrador
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: 'relatorioPontualPessoas', label: 'Relatório por Pessoa', desc: 'Análise individual de usuários', icon: Target },
                  { key: 'relatorioGlobalSistema', label: 'Relatório Global', desc: 'Visão geral do sistema', icon: Eye },
                  { key: 'rastrearProblemasJuridicos', label: 'Riscos Jurídicos', desc: 'Detectar problemas legais', icon: ShieldAlert },
                  { key: 'detectarPossiveisMentiras', label: 'Detecção de Veracidade', desc: 'Análise de consistência', icon: Brain },
                  { key: 'evitarPrognosticosErrados', label: 'Validar Prognósticos', desc: 'Evitar diagnósticos errados', icon: Shield },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      iasConfig[item.key as keyof typeof iasConfig]
                        ? 'border-green-500 bg-green-950/20'
                        : 'border-slate-600 bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <item.icon className={`h-5 w-5 ${iasConfig[item.key as keyof typeof iasConfig] ? 'text-green-400' : 'text-slate-500'}`} />
                        <div>
                          <p className="text-white font-medium">{item.label}</p>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIasConfig(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          iasConfig[item.key as keyof typeof iasConfig]
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {iasConfig[item.key as keyof typeof iasConfig] ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <button
                      onClick={() => abrirRelatorio(item.key)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Relatório
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuração do Coach */}
            <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                Configuração do Coach de Clareza
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Tom de Comunicação</label>
                  <select
                    value={iasConfig.coachTom}
                    onChange={(e) => setIasConfig(prev => ({ ...prev, coachTom: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="empatico">Empático e Acolhedor</option>
                    <option value="direto">Direto e Objetivo</option>
                    <option value="tecnico">Técnico e Educacional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Foco Principal</label>
                  <select
                    value={iasConfig.coachFoco}
                    onChange={(e) => setIasConfig(prev => ({ ...prev, coachFoco: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="validacao">Validação Emocional</option>
                    <option value="educacao">Educação sobre Abuso</option>
                    <option value="acao">Orientação para Ação</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Temperatura da IA</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={iasConfig.temperaturaIA}
                    onChange={(e) => setIasConfig(prev => ({ ...prev, temperaturaIA: Number(e.target.value) }))}
                    className="w-full"
                  />
                  <p className="text-center text-white font-bold mt-1">{iasConfig.temperaturaIA}</p>
                  <p className="text-xs text-slate-500 text-center">0 = Preciso | 1 = Criativo</p>
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4">📊 Resumo da Configuração</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-purple-400">{iasConfig.ias.filter(ia => ia.ativa).length}</p>
                  <p className="text-sm text-slate-400">IAs Ativas</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-400">{iasConfig.etapa1_analise.length}</p>
                  <p className="text-sm text-slate-400">Na Análise</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-400">{iasConfig.thresholdVotacao}%</p>
                  <p className="text-sm text-slate-400">Threshold</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-400">{Object.values(iasConfig).filter(v => v === true).length}</p>
                  <p className="text-sm text-slate-400">Relatórios Ativos</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'testing' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Testes A/B/C
              </h2>
              <p className="text-slate-400">
                Configure e monitore testes entre diferentes versões
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-8 text-center">
              <TestTube className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Sistema de Testes
              </h3>
              <p className="text-slate-400 mb-6">
                Configure testes A/B/C na aba Frontpages para analisar performance
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="font-medium text-purple-400 mb-1">Versão A</h4>
                  <p className="text-sm text-slate-400">Design Premium</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-400 mb-1">Versão B</h4>
                  <p className="text-sm text-slate-400">Design SaaS</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="font-medium text-emerald-400 mb-1">Versão C</h4>
                  <p className="text-sm text-slate-400">Million Dollar</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Analytics
              </h2>
              <p className="text-slate-400">
                Visualize métricas de performance das frontpages
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-8 text-center">
              <Eye className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-slate-400">
                Métricas detalhadas em desenvolvimento
              </p>
            </div>
          </div>
        )}

        {/* ===== ABA: BIBLIOTECA DE RESPOSTAS ===== */}
        {activeTab === 'biblioteca' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Biblioteca de Respostas
                </h2>
                <p className="text-slate-400">
                  Gerencie frases que ajudam usuários a responder manipulações
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => gerarSugestaoIA('resposta')}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  🤖 {loading ? 'Gerando...' : 'IA Sugerir'}
                </button>
                <button
                  onClick={() => setModalAberto('novaResposta')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-4">
              <span className="text-slate-400">Filtrar:</span>
              <button className="text-purple-400 hover:text-purple-300">Todos ({respostas.length})</button>
              <button className="text-yellow-400 hover:text-yellow-300">Pendentes ({respostasPendentes})</button>
              <button className="text-green-400 hover:text-green-300">Aprovados ({respostas.filter(r => r.status === 'aprovado').length})</button>
            </div>

            {/* Lista de Respostas */}
            <div className="space-y-4">
              {respostas.map((resposta) => (
                <div
                  key={resposta.id}
                  className={`border rounded-xl p-6 ${
                    resposta.status === 'pendente' ? 'border-yellow-500/50 bg-yellow-950/10' :
                    resposta.status === 'aprovado' ? 'border-green-500/50 bg-green-950/10' :
                    'border-red-500/50 bg-red-950/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        resposta.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400' :
                        resposta.status === 'aprovado' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {resposta.status.toUpperCase()}
                      </span>
                      <span className="text-slate-400 text-sm">{resposta.categoria}</span>
                      <span className="text-slate-500 text-xs">
                        {resposta.criadoPor === 'ia' ? '🤖 IA' : '👤 Admin'} • {resposta.dataCriacao}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {resposta.status === 'pendente' && (
                        <>
                          <button
                            onClick={() => aprovarItem('resposta', resposta.id)}
                            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                            title="Aprovar"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => rejeitarItem('resposta', resposta.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            title="Rejeitar"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => excluirItem('resposta', resposta.id)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-red-950/30 rounded-lg p-4">
                      <p className="text-xs text-red-400 mb-1">ELES DIZEM:</p>
                      <p className="text-white">{resposta.elesDizem}</p>
                    </div>
                    <div className="bg-green-950/30 rounded-lg p-4">
                      <p className="text-xs text-green-400 mb-1">VOCÊ RESPONDE:</p>
                      <p className="text-white">{resposta.vocePodeResponder}</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4">
                      <p className="text-xs text-slate-400 mb-1">ALTERNATIVA:</p>
                      <p className="text-white">{resposta.alternativa}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== ABA: HISTÓRIAS PARA REFLEXÃO ===== */}
        {activeTab === 'historias' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Histórias para Reflexão
                </h2>
                <p className="text-slate-400">
                  Gerencie histórias usadas no exercício "O Que Você Diria?"
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => gerarSugestaoIA('historia')}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  🤖 {loading ? 'Gerando...' : 'IA Sugerir'}
                </button>
                <button
                  onClick={() => setModalAberto('novaHistoria')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </button>
              </div>
            </div>

            {/* Lista de Histórias */}
            <div className="space-y-4">
              {historias.map((historia) => (
                <div
                  key={historia.id}
                  className={`border rounded-xl p-6 ${
                    historia.status === 'pendente' ? 'border-yellow-500/50 bg-yellow-950/10' :
                    historia.status === 'aprovado' ? 'border-green-500/50 bg-green-950/10' :
                    'border-red-500/50 bg-red-950/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        historia.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400' :
                        historia.status === 'aprovado' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {historia.status.toUpperCase()}
                      </span>
                      <span className="text-white font-medium">{historia.nome}, {historia.idade} anos</span>
                      <span className="text-slate-500 text-xs">
                        {historia.criadoPor === 'ia' ? '🤖 IA' : historia.criadoPor === 'usuario' ? '👥 Usuário' : '👤 Admin'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {historia.status === 'pendente' && (
                        <>
                          <button
                            onClick={() => aprovarItem('historia', historia.id)}
                            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => rejeitarItem('historia', historia.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => excluirItem('historia', historia.id)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-300 bg-slate-800 rounded-lg p-4">
                    {historia.historia}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== ABA: MODERAÇÃO DA COMUNIDADE ===== */}
        {activeTab === 'comunidade' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Moderação da Comunidade
              </h2>
              <p className="text-slate-400">
                Aprove ou rejeite histórias enviadas por usuários
              </p>
            </div>

            {/* Alertas */}
            {denuncias > 0 && (
              <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-4 flex items-center gap-4">
                <AlertTriangle className="h-6 w-6 text-red-400" />
                <div>
                  <p className="text-red-300 font-medium">{denuncias} história(s) denunciada(s)</p>
                  <p className="text-red-400 text-sm">Requer atenção imediata</p>
                </div>
              </div>
            )}

            {/* Lista */}
            <div className="space-y-4">
              {historiasComunidade.map((historia) => (
                <div
                  key={historia.id}
                  className={`border rounded-xl p-6 ${
                    historia.status === 'denunciado' ? 'border-red-500 bg-red-950/20' :
                    historia.status === 'pendente' ? 'border-yellow-500/50 bg-yellow-950/10' :
                    historia.status === 'aprovado' ? 'border-green-500/50 bg-green-950/10' :
                    'border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        historia.status === 'denunciado' ? 'bg-red-500/20 text-red-400' :
                        historia.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400' :
                        historia.status === 'aprovado' ? 'bg-green-500/20 text-green-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {historia.status === 'denunciado' ? `⚠️ DENUNCIADO (${historia.denuncias}x)` : historia.status.toUpperCase()}
                      </span>
                      <span className="text-slate-500 text-xs">{historia.dataCriacao}</span>
                    </div>
                    <div className="flex gap-2">
                      {(historia.status === 'pendente' || historia.status === 'denunciado') && (
                        <>
                          <button
                            onClick={() => aprovarItem('comunidade', historia.id)}
                            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => rejeitarItem('comunidade', historia.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => excluirItem('comunidade', historia.id)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-300 bg-slate-800 rounded-lg p-4 mb-4">
                    {historia.texto}
                  </p>

                  {/* Votos */}
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-400">🟢 {historia.votosVerde} saudável</span>
                    <span className="text-yellow-400">🟡 {historia.votosAmarelo} dúvidas</span>
                    <span className="text-red-400">🔴 {historia.votosVermelho} preocupa</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== ABA: RECURSOS POR ESTADO ===== */}
        {activeTab === 'estados' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Recursos por Estado
                </h2>
                <p className="text-slate-400">
                  Gerencie telefones e órgãos de apoio em cada estado
                </p>
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
              >
                <Edit className="h-4 w-4" />
                Editar Estados
              </button>
            </div>

            <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6">
              <p className="text-slate-400 mb-4">
                Os recursos por estado estão configurados no arquivo <code className="bg-slate-800 px-2 py-1 rounded">app/seguranca/page.tsx</code>
              </p>
              <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
                {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(estado => (
                  <div key={estado} className="bg-slate-800 rounded-lg p-3 text-center">
                    <span className="text-white font-medium">{estado}</span>
                  </div>
                ))}
              </div>
              <p className="text-green-400 mt-4 text-sm">✅ Todos os 27 estados configurados</p>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* ===== MODAL DE RELATÓRIOS ===== */}
      {relatorioAberto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <FileSearch className="h-6 w-6 text-blue-400" />
                  {relatorioAberto === 'relatorioPontualPessoas' && 'Relatório por Pessoa'}
                  {relatorioAberto === 'relatorioGlobalSistema' && 'Relatório Global do Sistema'}
                  {relatorioAberto === 'rastrearProblemasJuridicos' && 'Riscos Jurídicos Detectados'}
                  {relatorioAberto === 'detectarPossiveisMentiras' && 'Análise de Veracidade'}
                  {relatorioAberto === 'evitarPrognosticosErrados' && 'Validação de Prognósticos'}
                </h2>
                {/* Status ON/OFF */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  iasConfig[relatorioAberto as keyof typeof iasConfig]
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {iasConfig[relatorioAberto as keyof typeof iasConfig] ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Botão Exportar */}
                <button
                  onClick={gerarPDFRelatorio}
                  disabled={gerandoPDF || !relatorioData}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg font-medium transition-colors"
                >
                  {gerandoPDF ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Exportar
                </button>
                {/* Botão Fechar */}
                <button
                  onClick={() => {
                    setRelatorioAberto(null)
                    setRelatorioData(null)
                    setUsuarioSelecionado('')
                    setAvaliacaoAdmin('')
                  }}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {relatorioLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mb-4" />
                  <p className="text-slate-400">Carregando dados do relatório...</p>
                </div>
              ) : relatorioData?.erro ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <p className="text-slate-400">{relatorioData.erro}</p>
                </div>
              ) : (
                <>
                  {/* Relatório por Pessoa */}
                  {relatorioAberto === 'relatorioPontualPessoas' && (
                    <div className="space-y-6">
                      {relatorioData?.tipo === 'pessoa' && (
                        <>
                          <div className="bg-slate-800 rounded-xl p-4">
                            <label className="block text-sm text-slate-400 mb-2">Selecione um usuário para análise:</label>
                            <select
                              value={usuarioSelecionado}
                              onChange={(e) => {
                                setUsuarioSelecionado(e.target.value)
                                if (e.target.value) carregarDadosUsuario(e.target.value)
                              }}
                              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                            >
                              <option value="">-- Selecione um usuário --</option>
                              {listaUsuarios.map(u => (
                                <option key={u.id} value={u.id}>
                                  {u.email} (desde {new Date(u.created_at).toLocaleDateString('pt-BR')})
                                </option>
                              ))}
                            </select>
                          </div>
                          {listaUsuarios.length === 0 && (
                            <p className="text-slate-500 text-center py-8">Nenhum usuário encontrado no sistema.</p>
                          )}
                        </>
                      )}

                      {relatorioData?.tipo === 'pessoa_detalhe' && (
                        <div className="space-y-6">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4 text-center">
                              <p className="text-3xl font-bold text-blue-400">{relatorioData.testes?.length || 0}</p>
                              <p className="text-sm text-slate-400">Testes Realizados</p>
                            </div>
                            <div className="bg-purple-900/30 border border-purple-700 rounded-xl p-4 text-center">
                              <p className="text-3xl font-bold text-purple-400">{relatorioData.entradas?.length || 0}</p>
                              <p className="text-sm text-slate-400">Entradas no Diário</p>
                            </div>
                            <div className="bg-green-900/30 border border-green-700 rounded-xl p-4 text-center">
                              <p className="text-3xl font-bold text-green-400">
                                {relatorioData.usuario?.created_at ? new Date(relatorioData.usuario.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                              </p>
                              <p className="text-sm text-slate-400">Data de Cadastro</p>
                            </div>
                          </div>

                          {relatorioData.testes?.length > 0 && (
                            <div className="bg-slate-800 rounded-xl p-4">
                              <h4 className="text-white font-medium mb-3">Últimos Testes</h4>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {relatorioData.testes.slice(0, 10).map((t: any, i: number) => (
                                  <div key={i} className="flex items-center justify-between bg-slate-700 rounded-lg p-3">
                                    <span className="text-slate-300">{new Date(t.created_at).toLocaleDateString('pt-BR')}</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                      t.global_zone === 'VERMELHA' ? 'bg-red-900 text-red-300' :
                                      t.global_zone === 'ALERTA' ? 'bg-yellow-900 text-yellow-300' :
                                      'bg-green-900 text-green-300'
                                    }`}>
                                      {t.global_zone}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Relatório Global */}
                  {relatorioAberto === 'relatorioGlobalSistema' && relatorioData?.tipo === 'global' && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-6 text-center">
                          <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                          <p className="text-3xl font-bold text-blue-400">{relatorioData.totalUsuarios}</p>
                          <p className="text-sm text-slate-400">Usuários Cadastrados</p>
                        </div>
                        <div className="bg-purple-900/30 border border-purple-700 rounded-xl p-6 text-center">
                          <TestTube className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                          <p className="text-3xl font-bold text-purple-400">{relatorioData.totalTestes}</p>
                          <p className="text-sm text-slate-400">Testes Realizados</p>
                        </div>
                        <div className="bg-green-900/30 border border-green-700 rounded-xl p-6 text-center">
                          <BookOpen className="h-8 w-8 text-green-400 mx-auto mb-2" />
                          <p className="text-3xl font-bold text-green-400">{relatorioData.totalEntradas}</p>
                          <p className="text-sm text-slate-400">Entradas no Diário</p>
                        </div>
                      </div>

                      <div className="bg-slate-800 rounded-xl p-6">
                        <h4 className="text-white font-medium mb-4">Distribuição por Zona</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="w-full bg-slate-700 rounded-full h-4 mb-2">
                              <div 
                                className="bg-green-500 h-4 rounded-full" 
                                style={{ width: `${relatorioData.totalTestes > 0 ? (relatorioData.zonas.ATENCAO / relatorioData.totalTestes * 100) : 0}%` }}
                              />
                            </div>
                            <p className="text-green-400 font-bold">{relatorioData.zonas.ATENCAO}</p>
                            <p className="text-xs text-slate-400">Zona Atenção</p>
                          </div>
                          <div className="text-center">
                            <div className="w-full bg-slate-700 rounded-full h-4 mb-2">
                              <div 
                                className="bg-yellow-500 h-4 rounded-full" 
                                style={{ width: `${relatorioData.totalTestes > 0 ? (relatorioData.zonas.ALERTA / relatorioData.totalTestes * 100) : 0}%` }}
                              />
                            </div>
                            <p className="text-yellow-400 font-bold">{relatorioData.zonas.ALERTA}</p>
                            <p className="text-xs text-slate-400">Zona Alerta</p>
                          </div>
                          <div className="text-center">
                            <div className="w-full bg-slate-700 rounded-full h-4 mb-2">
                              <div 
                                className="bg-red-500 h-4 rounded-full" 
                                style={{ width: `${relatorioData.totalTestes > 0 ? (relatorioData.zonas.VERMELHA / relatorioData.totalTestes * 100) : 0}%` }}
                              />
                            </div>
                            <p className="text-red-400 font-bold">{relatorioData.zonas.VERMELHA}</p>
                            <p className="text-xs text-slate-400">Zona Vermelha</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Riscos Jurídicos */}
                  {relatorioAberto === 'rastrearProblemasJuridicos' && relatorioData?.tipo === 'juridico' && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-slate-800 rounded-xl p-6 text-center">
                          <p className="text-3xl font-bold text-blue-400">{relatorioData.totalAnalisadas}</p>
                          <p className="text-sm text-slate-400">Entradas Analisadas</p>
                        </div>
                        <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center">
                          <ShieldAlert className="h-8 w-8 text-red-400 mx-auto mb-2" />
                          <p className="text-3xl font-bold text-red-400">{relatorioData.entradasRisco?.length || 0}</p>
                          <p className="text-sm text-slate-400">Entradas com Risco</p>
                        </div>
                      </div>

                      <div className="bg-slate-800 rounded-xl p-4">
                        <h4 className="text-white font-medium mb-3">Palavras-chave Monitoradas</h4>
                        <div className="flex flex-wrap gap-2">
                          {relatorioData.palavrasChave?.map((p: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-red-900/50 text-red-300 rounded-full text-sm">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      {relatorioData.entradasRisco?.length > 0 && (
                        <div className="bg-slate-800 rounded-xl p-4">
                          <h4 className="text-white font-medium mb-3">Entradas que Requerem Atenção</h4>
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {relatorioData.entradasRisco.slice(0, 10).map((e: any, i: number) => (
                              <div key={i} className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                                <p className="text-xs text-slate-400 mb-1">
                                  {new Date(e.created_at).toLocaleDateString('pt-BR')}
                                </p>
                                <p className="text-slate-300 text-sm line-clamp-2">
                                  {e.content || e.texto || 'Conteúdo não disponível'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Detecção de Veracidade */}
                  {relatorioAberto === 'detectarPossiveisMentiras' && relatorioData?.tipo === 'veracidade' && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-slate-800 rounded-xl p-6 text-center">
                          <p className="text-3xl font-bold text-blue-400">{relatorioData.totalUsuariosAnalisados}</p>
                          <p className="text-sm text-slate-400">Usuários Analisados</p>
                        </div>
                        <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-6 text-center">
                          <Brain className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                          <p className="text-3xl font-bold text-yellow-400">{relatorioData.inconsistencias?.length || 0}</p>
                          <p className="text-sm text-slate-400">Inconsistências Detectadas</p>
                        </div>
                      </div>

                      <div className="bg-slate-800 rounded-xl p-4">
                        <h4 className="text-white font-medium mb-3">Critérios de Análise</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-400" />
                            Variação extrema entre zonas (Atenção → Vermelha)
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-400" />
                            Mínimo de 3 testes para análise
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-400" />
                            Padrões inconsistentes de resposta
                          </li>
                        </ul>
                      </div>

                      {relatorioData.inconsistencias?.length > 0 ? (
                        <div className="bg-slate-800 rounded-xl p-4">
                          <h4 className="text-white font-medium mb-3">Usuários com Inconsistências</h4>
                          <div className="space-y-2">
                            {relatorioData.inconsistencias.map((inc: any, i: number) => (
                              <div key={i} className="flex items-center justify-between bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
                                <span className="text-slate-300 text-sm font-mono">{inc.userId.slice(0, 8)}...</span>
                                <span className="text-yellow-400 text-sm">{inc.testes} testes | Variação: {inc.variacao}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-900/20 border border-green-700 rounded-xl p-6 text-center">
                          <Check className="h-12 w-12 text-green-400 mx-auto mb-2" />
                          <p className="text-green-400 font-medium">Nenhuma inconsistência significativa detectada</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Validar Prognósticos */}
                  {relatorioAberto === 'evitarPrognosticosErrados' && relatorioData?.tipo === 'prognosticos' && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-slate-800 rounded-xl p-6 text-center">
                          <p className="text-3xl font-bold text-blue-400">{relatorioData.totalAnalisados}</p>
                          <p className="text-sm text-slate-400">Testes Analisados</p>
                        </div>
                        <div className="bg-orange-900/30 border border-orange-700 rounded-xl p-6 text-center">
                          <Shield className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                          <p className="text-3xl font-bold text-orange-400">{relatorioData.casosRevisao?.length || 0}</p>
                          <p className="text-sm text-slate-400">Casos para Revisão</p>
                        </div>
                      </div>

                      <div className="bg-slate-800 rounded-xl p-4">
                        <h4 className="text-white font-medium mb-3">Critérios de Validação</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                          {relatorioData.criterios?.map((c: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-400" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {relatorioData.casosRevisao?.length > 0 ? (
                        <div className="bg-slate-800 rounded-xl p-4">
                          <h4 className="text-white font-medium mb-3">Casos que Requerem Revisão Manual</h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {relatorioData.casosRevisao.slice(0, 10).map((c: any, i: number) => (
                              <div key={i} className="flex items-center justify-between bg-orange-900/20 border border-orange-800 rounded-lg p-3">
                                <div>
                                  <p className="text-slate-300 text-sm">{new Date(c.created_at).toLocaleDateString('pt-BR')}</p>
                                  <p className="text-xs text-slate-500">
                                    Névoa: {c.scores?.nevoa || 0} | Medo: {c.scores?.medo || 0} | Limites: {c.scores?.limites || 0}
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  c.global_zone === 'VERMELHA' ? 'bg-red-900 text-red-300' :
                                  c.global_zone === 'ALERTA' ? 'bg-yellow-900 text-yellow-300' :
                                  'bg-green-900 text-green-300'
                                }`}>
                                  {c.global_zone}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-900/20 border border-green-700 rounded-xl p-6 text-center">
                          <Check className="h-12 w-12 text-green-400 mx-auto mb-2" />
                          <p className="text-green-400 font-medium">Todos os prognósticos parecem consistentes</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Área de Avaliação do Admin */}
            {relatorioData && !relatorioLoading && (
              <div className="p-6 border-t border-slate-700 bg-slate-800/50">
                <div className="flex items-start gap-4">
                  <MessageCircle className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-white mb-2">
                      Sua Avaliação / Observações
                    </label>
                    <textarea
                      value={avaliacaoAdmin}
                      onChange={(e) => setAvaliacaoAdmin(e.target.value)}
                      placeholder="Adicione suas observações sobre este relatório... (será incluído no arquivo exportado)"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                
                {/* Ações rápidas */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Ações rápidas:</span>
                    <button
                      onClick={() => setAvaliacaoAdmin(prev => prev + (prev ? '\n' : '') + '✅ Revisado e aprovado em ' + new Date().toLocaleString('pt-BR'))}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-600 text-green-400 rounded-lg text-sm transition-colors"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      Aprovar
                    </button>
                    <button
                      onClick={() => setAvaliacaoAdmin(prev => prev + (prev ? '\n' : '') + '⚠️ Requer atenção adicional - ' + new Date().toLocaleString('pt-BR'))}
                      className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600 text-yellow-400 rounded-lg text-sm transition-colors"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Atenção
                    </button>
                    <button
                      onClick={() => setAvaliacaoAdmin(prev => prev + (prev ? '\n' : '') + '❌ Rejeitado/Inválido - ' + new Date().toLocaleString('pt-BR'))}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-600 text-red-400 rounded-lg text-sm transition-colors"
                    >
                      <ThumbsDown className="h-3 w-3" />
                      Rejeitar
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Toggle ON/OFF */}
                    <button
                      onClick={() => setIasConfig(prev => ({ ...prev, [relatorioAberto as string]: !prev[relatorioAberto as keyof typeof prev] }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        iasConfig[relatorioAberto as keyof typeof iasConfig]
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                    >
                      {iasConfig[relatorioAberto as keyof typeof iasConfig] ? (
                        <>
                          <ToggleRight className="h-4 w-4" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4" />
                          Ativar
                        </>
                      )}
                    </button>
                    
                    {/* Exportar com avaliação */}
                    <button
                      onClick={gerarPDFRelatorio}
                      disabled={gerandoPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-lg font-medium transition-colors"
                    >
                      {gerandoPDF ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileDown className="h-4 w-4" />
                      )}
                      Exportar com Avaliação
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botão do Oráculo V2 - Flutuante */}
      <OraculoButton context="Página principal do Admin - Configuração de IAs" />
    </div>
  )
}
