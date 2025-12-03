'use client'

/**
 * OraculoCostMonitor - Componente de Monitoramento de Custos do Oráculo V2
 * 
 * Exibe em tempo real:
 * - Custo atual (diário/semanal/mensal)
 * - Tokens consumidos (input/output)
 * - Alertas de limite
 * - Projeção de custos
 */

import { useState, useEffect } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Zap,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

// ============================================================================
// TIPOS
// ============================================================================

interface CostData {
  periodo: 'diario' | 'semanal' | 'mensal'
  custoAtualCents: number
  limiteCents: number | null
  tokensInput: number
  tokensOutput: number
  perguntas: number
  projecaoCents: number
}

interface OraculoCostMonitorProps {
  className?: string
  compact?: boolean
  showAlerts?: boolean
  refreshInterval?: number // em segundos
}

// ============================================================================
// PREÇOS DA OPENAI (GPT-4o-mini)
// ============================================================================

const PRECOS = {
  'gpt-4o-mini': {
    input: 0.15 / 1000000,  // $0.15 por 1M tokens
    output: 0.60 / 1000000  // $0.60 por 1M tokens
  },
  'gpt-4o': {
    input: 2.50 / 1000000,  // $2.50 por 1M tokens
    output: 10.00 / 1000000 // $10.00 por 1M tokens
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function OraculoCostMonitor({
  className = '',
  compact = false,
  showAlerts = true,
  refreshInterval = 60
}: OraculoCostMonitorProps) {
  const [costData, setCostData] = useState<CostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(!compact)
  const [periodo, setPeriodo] = useState<'diario' | 'semanal' | 'mensal'>('diario')

  // Carregar dados
  useEffect(() => {
    loadCostData()
    
    // Auto-refresh
    const interval = setInterval(loadCostData, refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [periodo, refreshInterval])

  const loadCostData = async () => {
    try {
      // Em produção, isso viria de uma API
      // Por agora, simulamos dados
      const mockData: CostData = {
        periodo,
        custoAtualCents: periodo === 'diario' ? 89 : periodo === 'semanal' ? 612 : 1834,
        limiteCents: periodo === 'diario' ? 500 : periodo === 'semanal' ? 2000 : 10000,
        tokensInput: periodo === 'diario' ? 12500 : periodo === 'semanal' ? 87500 : 245000,
        tokensOutput: periodo === 'diario' ? 4500 : periodo === 'semanal' ? 31500 : 89000,
        perguntas: periodo === 'diario' ? 23 : periodo === 'semanal' ? 156 : 487,
        projecaoCents: periodo === 'diario' ? 120 : periodo === 'semanal' ? 800 : 2500
      }
      
      setCostData(mockData)
    } catch (error) {
      console.error('Erro ao carregar custos:', error)
    }
    setLoading(false)
  }

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`
  const formatBRL = (cents: number) => `R$ ${((cents / 100) * 5.5).toFixed(2)}`
  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
    return tokens.toString()
  }

  const getUsagePercent = () => {
    if (!costData || !costData.limiteCents) return 0
    return Math.min(100, (costData.custoAtualCents / costData.limiteCents) * 100)
  }

  const getUsageColor = () => {
    const percent = getUsagePercent()
    if (percent >= 90) return 'bg-red-500'
    if (percent >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getUsageTextColor = () => {
    const percent = getUsagePercent()
    if (percent >= 90) return 'text-red-400'
    if (percent >= 70) return 'text-yellow-400'
    return 'text-green-400'
  }

  if (loading) {
    return (
      <div className={`bg-white/5 rounded-xl p-4 border border-white/10 ${className}`}>
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Carregando custos...</span>
        </div>
      </div>
    )
  }

  if (!costData) return null

  // Versão compacta
  if (compact && !expanded) {
    return (
      <div 
        className={`bg-white/5 rounded-xl p-3 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors ${className}`}
        onClick={() => setExpanded(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-white font-medium">{formatCurrency(costData.custoAtualCents)}</span>
            <span className="text-gray-400 text-sm">hoje</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white/5 rounded-xl border border-white/10 overflow-hidden ${className}`}>
      {/* Header */}
      <div 
        className="p-4 border-b border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/5"
        onClick={() => compact && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          <span className="text-white font-medium">Custos do Oráculo V2</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Seletor de período */}
          <div className="flex bg-white/5 rounded-lg p-0.5">
            {(['diario', 'semanal', 'mensal'] as const).map(p => (
              <button
                key={p}
                onClick={(e) => { e.stopPropagation(); setPeriodo(p) }}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  periodo === p 
                    ? 'bg-violet-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {p === 'diario' ? 'Dia' : p === 'semanal' ? 'Sem' : 'Mês'}
              </button>
            ))}
          </div>
          {compact && (
            expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-4">
        {/* Custo Atual */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(costData.custoAtualCents)}
            </div>
            <div className="text-sm text-gray-400">
              {formatBRL(costData.custoAtualCents)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Projeção</div>
            <div className={`font-medium ${getUsageTextColor()}`}>
              {formatCurrency(costData.projecaoCents)}
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        {costData.limiteCents && (
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Uso do limite</span>
              <span>{getUsagePercent().toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getUsageColor()} transition-all duration-500`}
                style={{ width: `${getUsagePercent()}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatCurrency(costData.custoAtualCents)}</span>
              <span>Limite: {formatCurrency(costData.limiteCents)}</span>
            </div>
          </div>
        )}

        {/* Tokens */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Zap className="w-3 h-3" />
              Tokens Input
            </div>
            <div className="text-white font-medium">
              {formatTokens(costData.tokensInput)}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Zap className="w-3 h-3" />
              Tokens Output
            </div>
            <div className="text-white font-medium">
              {formatTokens(costData.tokensOutput)}
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-400">
            <span className="text-white font-medium">{costData.perguntas}</span> perguntas
          </div>
          <div className="text-gray-400">
            Média: <span className="text-white">
              {formatCurrency(Math.round(costData.custoAtualCents / Math.max(1, costData.perguntas)))}
            </span>/pergunta
          </div>
        </div>

        {/* Alerta */}
        {showAlerts && getUsagePercent() >= 80 && (
          <div className={`p-3 rounded-lg flex items-start gap-2 ${
            getUsagePercent() >= 90 
              ? 'bg-red-500/10 border border-red-500/20' 
              : 'bg-yellow-500/10 border border-yellow-500/20'
          }`}>
            <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
              getUsagePercent() >= 90 ? 'text-red-400' : 'text-yellow-400'
            }`} />
            <div className="text-xs">
              <span className={getUsagePercent() >= 90 ? 'text-red-300' : 'text-yellow-300'}>
                {getUsagePercent() >= 90 
                  ? 'Limite quase atingido!' 
                  : 'Atenção: uso elevado'}
              </span>
              <p className="text-gray-400 mt-0.5">
                {getUsagePercent() >= 90 
                  ? 'Considere aumentar o limite ou revisar o uso.'
                  : 'Monitore o consumo para evitar surpresas.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE MINI (para sidebar ou header)
// ============================================================================

export function OraculoCostMini({ className = '' }: { className?: string }) {
  const [custo, setCusto] = useState(89) // cents
  
  return (
    <div className={`flex items-center gap-1.5 text-sm ${className}`}>
      <DollarSign className="w-3.5 h-3.5 text-green-400" />
      <span className="text-white font-medium">${(custo / 100).toFixed(2)}</span>
      <span className="text-gray-500">hoje</span>
    </div>
  )
}
