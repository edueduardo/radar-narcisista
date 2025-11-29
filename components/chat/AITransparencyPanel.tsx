"use client"

import { useState } from 'react'
import { 
  ChevronDown, 
  ChevronUp, 
  Brain, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Sparkles,
  Users,
  TrendingUp,
  MessageSquare,
  Save,
  FileText,
  Download,
  Shield,
  ArrowRight
} from 'lucide-react'

// Tipos para análise de cada IA
interface IAAnalysis {
  ia: string
  resposta: string
  confianca: number
  latencia: number
  sucesso: boolean
}

interface ConsensusInfo {
  alcancado: boolean
  nivel: number
  divergencias: string[]
}

interface TransparencyInfo {
  iasUsadas: string[]
  tempoTotal: number
  metodo: string
}

interface AITransparencyPanelProps {
  analises: IAAnalysis[]
  consenso: ConsensusInfo
  transparencia: TransparencyInfo
  currentScore: number
  previousScore?: number
  detectedProblems?: string[]
  onContinueConversation?: () => void
  onSaveConversation?: () => void
  onExportPDF?: () => void
  allowSave?: boolean
}

// Nomes amigáveis das IAs
const IA_NAMES: Record<string, { name: string; icon: string; color: string }> = {
  openai: { name: 'GPT-4', icon: '🤖', color: 'bg-green-100 text-green-800 border-green-200' },
  anthropic: { name: 'Claude', icon: '🧠', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  groq: { name: 'Groq', icon: '⚡', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  gemini: { name: 'Gemini', icon: '✨', color: 'bg-blue-100 text-blue-800 border-blue-200' }
}

// Labels para problemas
const PROBLEM_LABELS: Record<string, string> = {
  gaslighting: 'Gaslighting',
  invalidacao: 'Invalidação',
  manipulacao: 'Manipulação',
  isolamento: 'Isolamento',
  ameacas: 'Ameaças',
  criminalizacao: 'Criminalização',
  autoestima_baixa: 'Autoestima'
}

export function AITransparencyPanel({
  analises,
  consenso,
  transparencia,
  currentScore,
  previousScore,
  detectedProblems,
  onContinueConversation,
  onSaveConversation,
  onExportPDF,
  allowSave = true
}: AITransparencyPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true) // Começa expandido
  const [showIndividualAnalyses, setShowIndividualAnalyses] = useState(true) // Mostra análises por padrão
  const [showProcessSteps, setShowProcessSteps] = useState(true) // Mostra etapas do processo

  const iasComSucesso = analises.filter(a => a.sucesso)
  const iasFalharam = analises.filter(a => !a.sucesso)
  const scoreDiff = previousScore !== undefined ? currentScore - previousScore : null
  
  // Ordenar IAs por latência (ordem de resposta)
  const iasOrdenadas = [...analises].sort((a, b) => a.latencia - b.latencia)

  // Determinar status da evolução
  const getEvolutionStatus = () => {
    if (scoreDiff === null) return { label: 'Primeira análise', color: 'text-blue-600', icon: '🎯' }
    if (scoreDiff >= 10) return { label: 'Melhora significativa!', color: 'text-green-600', icon: '🚀' }
    if (scoreDiff >= 5) return { label: 'Progresso!', color: 'text-green-500', icon: '📈' }
    if (scoreDiff >= -5) return { label: 'Estável', color: 'text-gray-600', icon: '➡️' }
    if (scoreDiff >= -10) return { label: 'Leve queda', color: 'text-amber-600', icon: '📉' }
    return { label: 'Atenção necessária', color: 'text-red-600', icon: '⚠️' }
  }

  const evolutionStatus = getEvolutionStatus()

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header - Sempre visível */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-sm">Análise das IAs</h3>
            <p className="text-xs text-gray-500">
              {iasComSucesso.length} IA{iasComSucesso.length !== 1 ? 's' : ''} analisaram • {transparencia.tempoTotal}ms
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Badge de consenso */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            consenso.alcancado 
              ? 'bg-green-100 text-green-700' 
              : 'bg-amber-100 text-amber-700'
          }`}>
            {consenso.alcancado ? '✓ Consenso' : '⚡ Divergência'}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Conteúdo expandido */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Resumo da evolução */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Evolução da Clareza
              </h4>
              <span className={`text-sm font-medium ${evolutionStatus.color}`}>
                {evolutionStatus.icon} {evolutionStatus.label}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-700">
                  {previousScore ?? '-'}
                </div>
                <div className="text-xs text-gray-500">Anterior</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {currentScore}
                </div>
                <div className="text-xs text-gray-500">Atual</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${
                  scoreDiff === null ? 'text-gray-400' :
                  scoreDiff >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {scoreDiff === null ? '-' : (scoreDiff >= 0 ? '+' : '') + scoreDiff}
                </div>
                <div className="text-xs text-gray-500">Diferença</div>
              </div>
            </div>
          </div>

          {/* Problemas detectados */}
          {detectedProblems && detectedProblems.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-4">
              <h4 className="font-semibold text-amber-800 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Padrões Identificados pelas IAs
              </h4>
              <div className="flex flex-wrap gap-2">
                {detectedProblems.map(problem => (
                  <span 
                    key={problem}
                    className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium"
                  >
                    {PROBLEM_LABELS[problem] || problem}
                  </span>
                ))}
              </div>
              <p className="text-xs text-amber-600 mt-2">
                Estes padrões foram identificados com base no que você compartilhou. Não é diagnóstico.
              </p>
            </div>
          )}

          {/* IAs que trabalharam */}
          <div>
            <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <Users className="w-4 h-4" />
              IAs que Analisaram
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {analises.map((analise, index) => {
                const iaInfo = IA_NAMES[analise.ia] || { name: analise.ia, icon: '🤖', color: 'bg-gray-100 text-gray-800' }
                return (
                  <div 
                    key={index}
                    className={`p-3 rounded-xl border ${analise.sucesso ? iaInfo.color : 'bg-red-50 text-red-800 border-red-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{iaInfo.icon}</span>
                        <span className="font-medium text-sm">{iaInfo.name}</span>
                      </div>
                      {analise.sucesso ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs opacity-75">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {analise.latencia}ms
                      </span>
                      <span>
                        Confiança: {Math.round(analise.confianca * 100)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ============================================================= */}
          {/* ETAPAS DO PROCESSO - TIMELINE */}
          {/* ============================================================= */}
          <div className="bg-gradient-to-b from-blue-50 to-indigo-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <ArrowRight className="w-4 h-4" />
              Etapas do Processo de Análise
            </h4>
            
            <div className="space-y-3">
              {/* Etapa 1: Recebimento */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-medium text-gray-800 text-sm">Mensagem Recebida</p>
                  <p className="text-xs text-gray-500">Sua mensagem foi enviada para análise</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              </div>

              {/* Etapa 2: IAs analisando */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-medium text-gray-800 text-sm">
                    {analises.length} IA{analises.length !== 1 ? 's' : ''} Analisaram
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {iasOrdenadas.map((ia, idx) => {
                      const iaInfo = IA_NAMES[ia.ia] || { name: ia.ia, icon: '🤖' }
                      return (
                        <span key={idx} className="text-xs bg-white px-2 py-0.5 rounded-full border">
                          {iaInfo.icon} {iaInfo.name} ({ia.latencia}ms)
                        </span>
                      )
                    })}
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              </div>

              {/* Etapa 3: Comparação */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-medium text-gray-800 text-sm">Comparação de Respostas</p>
                  <p className="text-xs text-gray-500">
                    {iasComSucesso.length} respostas comparadas
                    {iasFalharam.length > 0 && ` • ${iasFalharam.length} falha(s)`}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              </div>

              {/* Etapa 4: Consenso */}
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 ${consenso.alcancado ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  4
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-medium text-gray-800 text-sm">
                    {consenso.alcancado ? 'Consenso Alcançado' : 'Divergência Detectada'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Nível de acordo: {Math.round(consenso.nivel * 100)}%
                  </p>
                </div>
                {consenso.alcancado ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                )}
              </div>

              {/* Etapa 5: Resultado */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  ✓
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-medium text-gray-800 text-sm">Resultado Final</p>
                  <p className="text-xs text-gray-500">
                    Tempo total: {transparencia.tempoTotal}ms • Método: {transparencia.metodo}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Barra de consenso visual */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" />
              Nível de Consenso Final
            </h4>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    consenso.nivel >= 0.8 ? 'bg-green-500' :
                    consenso.nivel >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${consenso.nivel * 100}%` }}
                />
              </div>
              <span className="text-lg font-bold text-gray-700">
                {Math.round(consenso.nivel * 100)}%
              </span>
            </div>
            {consenso.divergencias.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ Divergências: {consenso.divergencias.join(', ')}
              </p>
            )}
          </div>

          {/* ============================================================= */}
          {/* ANÁLISE DE CADA IA - DETALHADA */}
          {/* ============================================================= */}
          <div>
            <button
              onClick={() => setShowIndividualAnalyses(!showIndividualAnalyses)}
              className="w-full py-2 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center gap-2 mb-3"
            >
              <MessageSquare className="w-4 h-4" />
              {showIndividualAnalyses ? '▼ Ocultar' : '▶ Ver'} o que cada IA analisou
            </button>

            {showIndividualAnalyses && (
              <div className="space-y-4">
                {iasOrdenadas.map((analise, index) => {
                  const iaInfo = IA_NAMES[analise.ia] || { name: analise.ia, icon: '🤖', color: 'bg-gray-100 text-gray-800 border-gray-200' }
                  return (
                    <div 
                      key={index} 
                      className={`rounded-xl p-4 border-2 ${analise.sucesso ? iaInfo.color : 'bg-red-50 text-red-800 border-red-300'}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{iaInfo.icon}</span>
                          <div>
                            <span className="font-bold text-base">{iaInfo.name}</span>
                            <span className="text-xs ml-2 opacity-75">
                              (IA #{index + 1})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {analise.sucesso ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              ✓ Sucesso
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              ✗ Falhou
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Métricas da IA */}
                      <div className="flex gap-4 mb-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">{analise.latencia}ms</span>
                          <span className="opacity-60">latência</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span className="font-medium">{Math.round(analise.confianca * 100)}%</span>
                          <span className="opacity-60">confiança</span>
                        </div>
                      </div>
                      
                      {/* Resposta da IA */}
                      {analise.sucesso && analise.resposta && (
                        <div className="bg-white/50 rounded-lg p-3 border border-current/10">
                          <p className="text-xs font-medium mb-1 opacity-60">Resposta desta IA:</p>
                          <p className="text-sm leading-relaxed">
                            {analise.resposta}
                          </p>
                        </div>
                      )}
                      
                      {!analise.sucesso && (
                        <div className="bg-red-100/50 rounded-lg p-3">
                          <p className="text-sm text-red-700">
                            Esta IA não conseguiu processar a mensagem.
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Pergunta de satisfação */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">
              💚 Como você está se sentindo?
            </h4>
            <p className="text-sm text-green-700 mb-3">
              {currentScore >= 70 
                ? 'Você está conseguindo se expressar muito bem! Se sentir que já evoluiu o suficiente, tudo bem parar por aqui.'
                : currentScore >= 40
                ? 'Você está progredindo! Quer continuar conversando para ganhar mais clareza?'
                : 'Estou aqui para te ouvir. Quer continuar explorando seus sentimentos?'
              }
            </p>
            <div className="flex gap-2">
              <button
                onClick={onContinueConversation}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Quero continuar
              </button>
              <button
                className="flex-1 py-2 px-4 bg-white text-green-700 border border-green-300 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
              >
                Estou satisfeita
              </button>
            </div>
          </div>

          {/* ============================================================= */}
          {/* SALVAR E EXPORTAR */}
          {/* ============================================================= */}
          {allowSave && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-purple-800">Salvar esta Conversa</h4>
              </div>
              
              <p className="text-sm text-purple-700 mb-3 leading-relaxed">
                Você pode salvar esta conversa para acessar depois ou gerar um PDF para compartilhar com seu terapeuta.
                <span className="block mt-1 text-xs text-purple-600">
                  🔒 Seus dados são protegidos com cadeia de custódia para uso em perícias, se necessário.
                </span>
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={onSaveConversation}
                  className="flex-1 py-2.5 px-4 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar Conversa
                </button>
                <button
                  onClick={onExportPDF}
                  className="flex-1 py-2.5 px-4 bg-white text-purple-700 border border-purple-300 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar PDF
                </button>
              </div>
              
              <p className="text-[10px] text-purple-500 mt-3 text-center">
                O PDF inclui hash de verificação, data/hora e metadados para validação pericial.
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            Esta análise foi gerada por inteligência artificial e não substitui avaliação profissional.
            Os padrões identificados são baseados apenas no que você compartilhou.
          </p>
        </div>
      )}
    </div>
  )
}
