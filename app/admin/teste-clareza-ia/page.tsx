'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  Brain,
  Users,
  User,
  Calculator,
  GitBranch,
  Cpu,
  BarChart3,
  PieChart,
  Activity,
  ChevronDown,
  ChevronRight,
  Info,
  Zap,
  Target,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Code,
  FileText,
  Layers
} from 'lucide-react'

// =============================================================================
// ADMIN: TESTE DE CLAREZA + RESULTADO - VISÃO IA
// Mostra como o sistema funciona por trás, IAs envolvidas, regras, cálculos
// =============================================================================

interface TestRecord {
  id: string
  user_id: string
  test_type: string
  raw_answers: Record<string, number>
  user_narrative?: string
  fog_score: number
  fear_score: number
  limits_score: number
  global_zone: string
  overall_percentage: number
  has_physical_risk: boolean
  created_at: string
  user_email?: string
}

interface UserStats {
  userId: string
  email: string
  testsCount: number
  avgPercentage: number
  lastZone: string
  hasNarrative: boolean
}

export default function AdminTesteClarezaIA() {
  const [loading, setLoading] = useState(true)
  const [tests, setTests] = useState<TestRecord[]>([])
  const [users, setUsers] = useState<UserStats[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'total' | 'individual'>('total')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    fluxo: true,
    ias: true,
    calculos: true,
    regras: true
  })

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Carregar todos os testes
      const { data: testsData, error } = await supabase
        .from('clarity_tests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setTests(testsData || [])

      // Agrupar por usuário
      const userMap = new Map<string, UserStats>()
      for (const test of testsData || []) {
        const existing = userMap.get(test.user_id)
        if (existing) {
          existing.testsCount++
          existing.avgPercentage = (existing.avgPercentage * (existing.testsCount - 1) + test.overall_percentage) / existing.testsCount
          existing.lastZone = test.global_zone
          existing.hasNarrative = existing.hasNarrative || !!test.user_narrative
        } else {
          userMap.set(test.user_id, {
            userId: test.user_id,
            email: test.user_id.slice(0, 8) + '...',
            testsCount: 1,
            avgPercentage: test.overall_percentage,
            lastZone: test.global_zone,
            hasNarrative: !!test.user_narrative
          })
        }
      }
      setUsers(Array.from(userMap.values()))
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const filteredTests = selectedUser 
    ? tests.filter(t => t.user_id === selectedUser)
    : tests

  // Estatísticas gerais
  const totalTests = filteredTests.length
  const avgPercentage = totalTests > 0 
    ? filteredTests.reduce((sum, t) => sum + t.overall_percentage, 0) / totalTests 
    : 0
  const zonesCount = {
    atencao: filteredTests.filter(t => t.global_zone === 'atencao').length,
    alerta: filteredTests.filter(t => t.global_zone === 'alerta').length,
    vermelha: filteredTests.filter(t => t.global_zone === 'vermelha').length
  }
  const withNarrative = filteredTests.filter(t => t.user_narrative).length

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-violet-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Carregando dados da IA...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Brain className="w-6 h-6 text-violet-400" />
                  Teste de Clareza + Resultado
                </h1>
                <p className="text-sm text-gray-400">Visão completa do sistema IA</p>
              </div>
            </div>
            
            {/* Toggle Total/Individual */}
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => { setViewMode('total'); setSelectedUser(null) }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === 'total' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                Total
              </button>
              <button
                onClick={() => setViewMode('individual')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === 'individual' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                Individual
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Seletor de Usuário (modo individual) */}
        {viewMode === 'individual' && (
          <div className="mb-6 p-4 bg-slate-900 rounded-xl border border-slate-800">
            <label className="block text-sm font-medium text-gray-400 mb-2">Selecionar Usuário:</label>
            <select
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value || null)}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
            >
              <option value="">-- Selecione um usuário --</option>
              {users.map(u => (
                <option key={u.userId} value={u.userId}>
                  {u.email} ({u.testsCount} testes, última zona: {u.lastZone})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={<Target className="w-5 h-5" />}
            label="Total de Testes"
            value={totalTests}
            color="violet"
          />
          <StatCard 
            icon={<Activity className="w-5 h-5" />}
            label="Média Geral"
            value={`${Math.round(avgPercentage * 100)}%`}
            color="blue"
          />
          <StatCard 
            icon={<FileText className="w-5 h-5" />}
            label="Com Narrativa (P19)"
            value={withNarrative}
            subtext={`${totalTests > 0 ? Math.round(withNarrative / totalTests * 100) : 0}%`}
            color="emerald"
          />
          <StatCard 
            icon={<AlertTriangle className="w-5 h-5" />}
            label="Zona Vermelha"
            value={zonesCount.vermelha}
            subtext={`${totalTests > 0 ? Math.round(zonesCount.vermelha / totalTests * 100) : 0}%`}
            color="red"
          />
        </div>

        {/* Distribuição por Zona */}
        <div className="mb-8 p-6 bg-slate-900 rounded-xl border border-slate-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-violet-400" />
            Distribuição por Zona
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <ZoneBar label="Atenção" count={zonesCount.atencao} total={totalTests} color="yellow" />
            <ZoneBar label="Alerta" count={zonesCount.alerta} total={totalTests} color="orange" />
            <ZoneBar label="Vermelha" count={zonesCount.vermelha} total={totalTests} color="red" />
          </div>
        </div>

        {/* ============================================================ */}
        {/* SEÇÃO: FLUXO DO SISTEMA */}
        {/* ============================================================ */}
        <CollapsibleSection
          title="Fluxo Completo do Sistema"
          icon={<GitBranch className="w-5 h-5 text-violet-400" />}
          isOpen={expandedSections.fluxo}
          onToggle={() => toggleSection('fluxo')}
        >
          <div className="space-y-4">
            <FlowStep 
              number={1}
              title="Usuário Inicia o Teste"
              description="Usuário acessa /teste-clareza e aceita os termos de consentimento (cadeia de custódia)"
              tech="Next.js Client Component + Supabase Auth"
            />
            <FlowStep 
              number={2}
              title="Carregamento das Perguntas"
              description="Sistema carrega 18 perguntas de 6 categorias (invalidação, gaslighting, controle, isolamento, emocional, físico)"
              tech="clarity-unified-config.ts → UNIFIED_QUESTIONS"
            />
            <FlowStep 
              number={3}
              title="Coleta de Respostas"
              description="Cada resposta é salva em tempo real no localStorage (backup) e no state do React"
              tech="useState + localStorage"
            />
            <FlowStep 
              number={4}
              title="Pergunta 19 (Texto Livre)"
              description="Usuário pode escrever sua história com suas próprias palavras (opcional)"
              tech="textarea → user_narrative"
            />
            <FlowStep 
              number={5}
              title="Cálculo do Resultado"
              description="Sistema processa todas as respostas usando algoritmo de pontuação ponderada"
              tech="calculateUnifiedResult() → clarity-unified-config.ts"
            />
            <FlowStep 
              number={6}
              title="Persistência"
              description="Resultado salvo no Supabase (clarity_tests) e localStorage"
              tech="Supabase PostgreSQL"
            />
            <FlowStep 
              number={7}
              title="Exibição do Resultado"
              description="Página de resultado mostra zona global, eixos, categorias e explicação personalizada"
              tech="/teste-clareza/resultado + ResultExplanation.tsx"
            />
          </div>
        </CollapsibleSection>

        {/* ============================================================ */}
        {/* SEÇÃO: IAs ENVOLVIDAS */}
        {/* ============================================================ */}
        <CollapsibleSection
          title="IAs e Componentes Envolvidos"
          icon={<Cpu className="w-5 h-5 text-violet-400" />}
          isOpen={expandedSections.ias}
          onToggle={() => toggleSection('ias')}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <IACard
              name="Motor de Cálculo"
              type="Algoritmo Determinístico"
              description="Calcula scores por eixo, categoria e zona global baseado nas respostas"
              file="lib/clarity-unified-config.ts"
              functions={['calculateUnifiedResult()', 'getAxisScore()', 'getCategoryScore()']}
              usesAI={false}
            />
            <IACard
              name="Explicação Personalizada"
              type="Template Dinâmico"
              description="Gera narrativa personalizada baseada nos scores do usuário"
              file="components/ResultExplanation.tsx"
              functions={['getNevoaStory()', 'getMedoStory()', 'getLimitesStory()']}
              usesAI={false}
            />
            <IACard
              name="Detecção de Risco Físico"
              type="Regra de Negócio"
              description="Identifica respostas que indicam risco físico e dispara alertas"
              file="lib/clarity-unified-config.ts"
              functions={['hasPhysicalRisk check']}
              usesAI={false}
            />
            <IACard
              name="Cadeia de Custódia"
              type="Sistema de Auditoria"
              description="Registra aceite de termos com hash SHA-256, timestamp e metadados"
              file="components/ClarityTermsModal.tsx"
              functions={['generateSHA256Hash()', 'saveAcceptance()']}
              usesAI={false}
            />
            <IACard
              name="Transcrição de Áudio"
              type="IA Externa (OpenAI)"
              description="Transcreve áudio da pergunta 19 para texto (Premium)"
              file="api/voice/transcribe"
              functions={['Whisper API']}
              usesAI={true}
              premium={true}
            />
            <IACard
              name="Análise de Narrativa"
              type="IA Externa (OpenAI)"
              description="Analisa texto livre para identificar padrões (futuro)"
              file="api/analyze-narrative"
              functions={['GPT-4 Analysis']}
              usesAI={true}
              premium={true}
              future={true}
            />
          </div>
        </CollapsibleSection>

        {/* ============================================================ */}
        {/* SEÇÃO: CÁLCULOS E FÓRMULAS */}
        {/* ============================================================ */}
        <CollapsibleSection
          title="Cálculos e Fórmulas"
          icon={<Calculator className="w-5 h-5 text-violet-400" />}
          isOpen={expandedSections.calculos}
          onToggle={() => toggleSection('calculos')}
        >
          <div className="space-y-6">
            {/* Escala de Respostas */}
            <div className="p-4 bg-slate-800 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Escala de Respostas (0-4)</h4>
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
                <div className="p-2 bg-green-900/30 rounded">
                  <div className="font-bold text-green-400">0</div>
                  <div className="text-gray-400">Nunca</div>
                </div>
                <div className="p-2 bg-green-900/20 rounded">
                  <div className="font-bold text-green-300">1</div>
                  <div className="text-gray-400">Raramente</div>
                </div>
                <div className="p-2 bg-yellow-900/30 rounded">
                  <div className="font-bold text-yellow-400">2</div>
                  <div className="text-gray-400">Às vezes</div>
                </div>
                <div className="p-2 bg-orange-900/30 rounded">
                  <div className="font-bold text-orange-400">3</div>
                  <div className="text-gray-400">Frequente</div>
                </div>
                <div className="p-2 bg-red-900/30 rounded">
                  <div className="font-bold text-red-400">4</div>
                  <div className="text-gray-400">Sempre</div>
                </div>
              </div>
            </div>

            {/* Fórmula de Score */}
            <div className="p-4 bg-slate-800 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Fórmula de Cálculo</h4>
              <div className="font-mono text-sm bg-slate-900 p-4 rounded-lg overflow-x-auto">
                <p className="text-violet-400">// Score por Eixo</p>
                <p className="text-gray-300">axisScore = Σ(resposta × peso) / maxPossível</p>
                <br />
                <p className="text-violet-400">// Score Global</p>
                <p className="text-gray-300">globalScore = (nevoaScore + medoScore + limitesScore) / 3</p>
                <br />
                <p className="text-violet-400">// Zona Global</p>
                <p className="text-gray-300">if (globalScore &lt; 0.33) → "atenção"</p>
                <p className="text-gray-300">if (globalScore &lt; 0.66) → "alerta"</p>
                <p className="text-gray-300">else → "vermelha"</p>
              </div>
            </div>

            {/* Mapeamento Categoria → Eixo */}
            <div className="p-4 bg-slate-800 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Mapeamento Categoria → Eixo</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-800">
                  <h5 className="font-medium text-purple-400 mb-2">🧠 Névoa Mental</h5>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Invalidação</li>
                    <li>• Gaslighting</li>
                  </ul>
                </div>
                <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-800">
                  <h5 className="font-medium text-blue-400 mb-2">😰 Medo/Tensão</h5>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Controle</li>
                    <li>• Abuso Emocional</li>
                  </ul>
                </div>
                <div className="p-3 bg-rose-900/20 rounded-lg border border-rose-800">
                  <h5 className="font-medium text-rose-400 mb-2">🛡️ Limites</h5>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Isolamento</li>
                    <li>• Risco Físico</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* ============================================================ */}
        {/* SEÇÃO: REGRAS DE NEGÓCIO */}
        {/* ============================================================ */}
        <CollapsibleSection
          title="Regras de Negócio"
          icon={<Shield className="w-5 h-5 text-violet-400" />}
          isOpen={expandedSections.regras}
          onToggle={() => toggleSection('regras')}
        >
          <div className="space-y-4">
            <RuleCard
              title="Alerta de Risco Físico"
              condition="Se categoria 'fisico' ≥ 40%"
              action="Exibe banner vermelho com telefones de emergência (190, 180)"
              priority="CRÍTICA"
            />
            <RuleCard
              title="Zona Vermelha"
              condition="Se score global ≥ 66%"
              action="Mensagem de urgência + recomendação de buscar ajuda profissional"
              priority="ALTA"
            />
            <RuleCard
              title="Destaque de Categoria"
              condition="Se categoria ≥ 40%"
              action="Categoria marcada com ⚠️ e explicação detalhada"
              priority="MÉDIA"
            />
            <RuleCard
              title="Pergunta 19 Opcional"
              condition="Sempre"
              action="Usuário pode pular, mas é incentivado a responder"
              priority="BAIXA"
            />
            <RuleCard
              title="Validade dos Termos"
              condition="30 dias desde último aceite"
              action="Modal de termos reaparece para novo aceite"
              priority="MÉDIA"
            />
            <RuleCard
              title="Áudio Premium"
              condition="Se usuário tem plano Premium/Pro"
              action="Habilita gravação de áudio na pergunta 19"
              priority="BAIXA"
            />
          </div>
        </CollapsibleSection>

        {/* ============================================================ */}
        {/* TABELA DE TESTES (se individual selecionado) */}
        {/* ============================================================ */}
        {selectedUser && filteredTests.length > 0 && (
          <div className="mt-8 p-6 bg-slate-900 rounded-xl border border-slate-800">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-violet-400" />
              Testes do Usuário ({filteredTests.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-slate-800">
                    <th className="p-3">Data</th>
                    <th className="p-3">Versão</th>
                    <th className="p-3">Névoa</th>
                    <th className="p-3">Medo</th>
                    <th className="p-3">Limites</th>
                    <th className="p-3">Zona</th>
                    <th className="p-3">%</th>
                    <th className="p-3">P19</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.map(test => (
                    <tr key={test.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="p-3 text-gray-300">
                        {new Date(test.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3 text-gray-400">{test.test_type}</td>
                      <td className="p-3">{test.fog_score}</td>
                      <td className="p-3">{test.fear_score}</td>
                      <td className="p-3">{test.limits_score}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          test.global_zone === 'atencao' ? 'bg-yellow-900/50 text-yellow-400' :
                          test.global_zone === 'alerta' ? 'bg-orange-900/50 text-orange-400' :
                          'bg-red-900/50 text-red-400'
                        }`}>
                          {test.global_zone}
                        </span>
                      </td>
                      <td className="p-3 font-medium">{Math.round(test.overall_percentage * 100)}%</td>
                      <td className="p-3">
                        {test.user_narrative ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// =============================================================================
// COMPONENTES AUXILIARES
// =============================================================================

function StatCard({ icon, label, value, subtext, color }: {
  icon: React.ReactNode
  label: string
  value: string | number
  subtext?: string
  color: 'violet' | 'blue' | 'emerald' | 'red'
}) {
  const colors = {
    violet: 'bg-violet-900/30 border-violet-800 text-violet-400',
    blue: 'bg-blue-900/30 border-blue-800 text-blue-400',
    emerald: 'bg-emerald-900/30 border-emerald-800 text-emerald-400',
    red: 'bg-red-900/30 border-red-800 text-red-400'
  }
  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </div>
  )
}

function ZoneBar({ label, count, total, color }: {
  label: string
  count: number
  total: number
  color: 'yellow' | 'orange' | 'red'
}) {
  const pct = total > 0 ? (count / total) * 100 : 0
  const colors = {
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  }
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{count} ({Math.round(pct)}%)</span>
      </div>
      <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color]} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function CollapsibleSection({ title, icon, isOpen, onToggle, children }: {
  title: string
  icon: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="mb-6 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold text-white">{title}</span>
        </div>
        {isOpen ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
      </button>
      {isOpen && <div className="p-4 pt-0 border-t border-slate-800">{children}</div>}
    </div>
  )
}

function FlowStep({ number, title, description, tech }: {
  number: number
  title: string
  description: string
  tech: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-sm font-bold">
        {number}
      </div>
      <div className="flex-1 pb-4 border-l-2 border-slate-700 pl-4 -ml-4">
        <h4 className="font-medium text-white">{title}</h4>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
        <code className="text-xs text-violet-400 bg-slate-800 px-2 py-1 rounded mt-2 inline-block">{tech}</code>
      </div>
    </div>
  )
}

function IACard({ name, type, description, file, functions, usesAI, premium, future }: {
  name: string
  type: string
  description: string
  file: string
  functions: string[]
  usesAI: boolean
  premium?: boolean
  future?: boolean
}) {
  return (
    <div className={`p-4 rounded-xl border ${future ? 'border-dashed border-slate-700 opacity-60' : 'border-slate-700'} bg-slate-800/50`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-white">{name}</h4>
        <div className="flex gap-1">
          {usesAI && <span className="px-2 py-0.5 bg-violet-900 text-violet-300 text-xs rounded">IA</span>}
          {premium && <span className="px-2 py-0.5 bg-amber-900 text-amber-300 text-xs rounded">Premium</span>}
          {future && <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">Futuro</span>}
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-2">{type}</p>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      <div className="text-xs">
        <p className="text-gray-500 mb-1">Arquivo: <code className="text-violet-400">{file}</code></p>
        <p className="text-gray-500">Funções: {functions.map((f, i) => (
          <code key={i} className="text-emerald-400 mr-1">{f}</code>
        ))}</p>
      </div>
    </div>
  )
}

function RuleCard({ title, condition, action, priority }: {
  title: string
  condition: string
  action: string
  priority: 'CRÍTICA' | 'ALTA' | 'MÉDIA' | 'BAIXA'
}) {
  const priorityColors = {
    'CRÍTICA': 'bg-red-900/50 text-red-400 border-red-800',
    'ALTA': 'bg-orange-900/50 text-orange-400 border-orange-800',
    'MÉDIA': 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
    'BAIXA': 'bg-slate-800 text-gray-400 border-slate-700'
  }
  return (
    <div className={`p-4 rounded-xl border ${priorityColors[priority]}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-white">{title}</h4>
        <span className="text-xs font-medium">{priority}</span>
      </div>
      <p className="text-sm mb-1"><span className="text-gray-500">Se:</span> {condition}</p>
      <p className="text-sm"><span className="text-gray-500">Então:</span> {action}</p>
    </div>
  )
}
