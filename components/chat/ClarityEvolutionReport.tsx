"use client"

import { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Brain,
  Shield,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Heart,
  BookOpen,
  FileText,
  Phone
} from 'lucide-react'
import type { ClarityEvolutionData } from '@/lib/types/evolution-clarity'
import { getRiskLevelColor, getRiskLevelLabel, getTrendEmoji, getToolUrl } from '@/lib/types/evolution-clarity'
import Link from 'next/link'

interface ClarityEvolutionReportProps {
  evolution: ClarityEvolutionData
  onContinueConversation?: () => void
}

// Cores por nível de risco
const RISK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  none: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
  low: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  moderate: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
  imminent: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' }
}

// Ícones por tipo de ação
const ACTION_ICONS: Record<string, any> = {
  tool: BookOpen,
  professional_help: Heart,
  safety: Shield,
  emotional: Sparkles
}

export function ClarityEvolutionReport({
  evolution,
  onContinueConversation
}: ClarityEvolutionReportProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showThemes, setShowThemes] = useState(false)

  const { input_signals, analysis, recommendations } = evolution
  const riskColors = RISK_COLORS[analysis.risk_assessment.level] || RISK_COLORS.none

  // Calcular cor do score
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Ícone de tendência
  const TrendIcon = input_signals.clarity_trend === 'up' 
    ? TrendingUp 
    : input_signals.clarity_trend === 'down' 
      ? TrendingDown 
      : Minus

  const trendColor = input_signals.clarity_trend === 'up'
    ? 'text-green-600'
    : input_signals.clarity_trend === 'down'
      ? 'text-red-600'
      : 'text-gray-500'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-sm">Análise de Evolução</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className={`font-medium ${getScoreColor(input_signals.clarity_score_current)}`}>
                Clareza: {input_signals.clarity_score_current}/100
              </span>
              <TrendIcon className={`w-3 h-3 ${trendColor}`} />
              {input_signals.clarity_score_previous !== null && (
                <span className={trendColor}>
                  ({input_signals.clarity_score_current > input_signals.clarity_score_previous ? '+' : ''}
                  {input_signals.clarity_score_current - input_signals.clarity_score_previous})
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {analysis.risk_assessment.level !== 'none' && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColors.bg} ${riskColors.text}`}>
              {getRiskLevelLabel(analysis.risk_assessment.level)}
            </span>
          )}
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
          
          {/* Barra de clareza visual */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Nível de Clareza</span>
              <span className={`text-lg font-bold ${getScoreColor(input_signals.clarity_score_current)}`}>
                {input_signals.clarity_score_current}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  input_signals.clarity_score_current >= 70 
                    ? 'bg-green-500' 
                    : input_signals.clarity_score_current >= 40 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                }`}
                style={{ width: `${input_signals.clarity_score_current}%` }}
              />
            </div>
            {input_signals.clarity_score_previous !== null && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                Anterior: {input_signals.clarity_score_previous}% 
                {getTrendEmoji(input_signals.clarity_trend)}
              </p>
            )}
          </div>

          {/* Resumo da clareza atual */}
          {analysis.current_clarity_summary && (
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-800 flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                O que percebi
              </h4>
              <p className="text-sm text-purple-700 leading-relaxed">
                {analysis.current_clarity_summary}
              </p>
            </div>
          )}

          {/* Evolução desde a última sessão */}
          {analysis.evolution_since_last && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" />
                Sua evolução
              </h4>
              <p className="text-sm text-blue-700 leading-relaxed">
                {analysis.evolution_since_last}
              </p>
            </div>
          )}

          {/* Avaliação de risco (se houver) */}
          {analysis.risk_assessment.level !== 'none' && (
            <div className={`rounded-xl p-4 border ${riskColors.bg} ${riskColors.border}`}>
              <h4 className={`font-semibold flex items-center gap-2 mb-2 ${riskColors.text}`}>
                <AlertTriangle className="w-4 h-4" />
                Atenção à segurança
              </h4>
              {analysis.risk_assessment.signals.length > 0 && (
                <ul className="text-sm mb-3 space-y-1">
                  {analysis.risk_assessment.signals.map((signal, i) => (
                    <li key={i} className={riskColors.text}>• {signal}</li>
                  ))}
                </ul>
              )}
              {analysis.risk_assessment.safety_recommendation && (
                <p className={`text-sm font-medium ${riskColors.text}`}>
                  {analysis.risk_assessment.safety_recommendation}
                </p>
              )}
              
              {/* Contatos de emergência para risco alto/iminente */}
              {(analysis.risk_assessment.level === 'high' || analysis.risk_assessment.level === 'imminent') && (
                <div className="mt-3 pt-3 border-t border-current/20">
                  <p className="text-xs font-semibold mb-2">Contatos de emergência:</p>
                  <div className="flex flex-wrap gap-2">
                    <a href="tel:188" className="flex items-center gap-1 px-2 py-1 bg-white/50 rounded text-xs font-medium">
                      <Phone className="w-3 h-3" /> CVV: 188
                    </a>
                    <a href="tel:190" className="flex items-center gap-1 px-2 py-1 bg-white/50 rounded text-xs font-medium">
                      <Phone className="w-3 h-3" /> Polícia: 190
                    </a>
                    <a href="tel:180" className="flex items-center gap-1 px-2 py-1 bg-white/50 rounded text-xs font-medium">
                      <Phone className="w-3 h-3" /> Mulher: 180
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Temas dominantes */}
          {analysis.dominant_themes.length > 0 && (
            <div>
              <button
                onClick={() => setShowThemes(!showThemes)}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-2"
              >
                {showThemes ? '▼ Ocultar' : '▶ Ver'} temas detectados ({analysis.dominant_themes.length})
              </button>
              
              {showThemes && (
                <div className="mt-2 space-y-2">
                  {analysis.dominant_themes.map((theme, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-lg">{getTrendEmoji(theme.trend)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{theme.label}</p>
                        <p className="text-xs text-gray-600">{theme.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mensagem de encorajamento */}
          {recommendations.encouragement_message && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
              <p className="text-sm text-purple-800 leading-relaxed">
                💜 {recommendations.encouragement_message}
              </p>
            </div>
          )}

          {/* Ações sugeridas */}
          {recommendations.suggested_actions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Próximos passos sugeridos
              </h4>
              <div className="space-y-2">
                {recommendations.suggested_actions.map((action, index) => {
                  const ActionIcon = ACTION_ICONS[action.type] || Sparkles
                  const url = action.tool_id ? getToolUrl(action.tool_id) : null
                  
                  return (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <ActionIcon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{action.label}</p>
                        <p className="text-xs text-gray-600">{action.reason}</p>
                      </div>
                      {url && (
                        <Link 
                          href={url}
                          className="flex-shrink-0 p-2 text-purple-600 hover:text-purple-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ProblemTags detectados */}
          {input_signals.problem_tags_current.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {input_signals.problem_tags_current.map((tag, i) => (
                <span 
                  key={i}
                  className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Botão continuar */}
          <button
            onClick={onContinueConversation}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Continuar conversando
          </button>

          {/* Disclaimer */}
          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            {evolution.disclaimer}
          </p>
        </div>
      )}
    </div>
  )
}
