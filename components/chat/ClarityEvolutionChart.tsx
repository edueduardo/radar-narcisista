"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ClarityDataPoint {
  messageNumber: number
  score: number
  label: string
}

interface ClarityEvolutionChartProps {
  data: ClarityDataPoint[]
  showTrend?: boolean
}

export function ClarityEvolutionChart({ data, showTrend = true }: ClarityEvolutionChartProps) {
  // Estado inicial sem dados - mostrar meta
  const hasData = data.length > 0

  // Calcular tendência
  const calculateTrend = () => {
    if (data.length < 2) return 'neutral'
    const firstHalf = data.slice(0, Math.floor(data.length / 2))
    const secondHalf = data.slice(Math.floor(data.length / 2))
    
    const avgFirst = firstHalf.reduce((sum, d) => sum + d.score, 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((sum, d) => sum + d.score, 0) / secondHalf.length
    
    if (avgSecond > avgFirst + 5) return 'up'
    if (avgSecond < avgFirst - 5) return 'down'
    return 'neutral'
  }

  const trend = hasData ? calculateTrend() : 'neutral'
  const avgScore = hasData ? Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length) : 0
  const lastScore = hasData ? data[data.length - 1].score : 0

  // Cor baseada na média
  const getColor = (score: number) => {
    if (score >= 70) return '#22c55e' // verde
    if (score >= 50) return '#eab308' // amarelo
    return '#ef4444' // vermelho
  }

  const chartColor = getColor(avgScore)

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium">Mensagem {data.messageNumber}</p>
          <p className="text-lg font-bold" style={{ color: getColor(data.score) }}>
            {data.score}/100
          </p>
          <p className="text-xs text-gray-500">{data.label}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          Evolução da Clareza
        </h4>
        {showTrend && hasData && data.length >= 2 && (
          <div className="flex items-center gap-1">
            {trend === 'up' && (
              <>
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600">Melhorando</span>
              </>
            )}
            {trend === 'down' && (
              <>
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-xs text-red-600">Diminuindo</span>
              </>
            )}
            {trend === 'neutral' && (
              <>
                <Minus className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-600">Estável</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Barra de progresso - Termômetro de Clareza */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600 font-medium">Última resposta:</span>
          <span className="text-xs font-medium">
            {hasData ? (
              <span style={{ color: getColor(lastScore) }}>
                {lastScore}/100 - {lastScore >= 70 ? 'Bem detalhada' : lastScore >= 40 ? 'Ok' : 'Precisa mais detalhes'}
              </span>
            ) : (
              <span className="text-gray-400">Aguardando sua mensagem</span>
            )}
          </span>
        </div>
        <div 
          className="relative h-3 bg-gray-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={hasData ? lastScore : 0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Termômetro de clareza da última resposta"
        >
          {/* Marcadores de referência - zonas */}
          <div className="absolute inset-0 flex">
            <div className="w-[30%] bg-red-100/50" title="Precisa mais detalhes"></div>
            <div className="w-[40%] bg-yellow-100/50" title="Ok"></div>
            <div className="w-[30%] bg-green-100/50" title="Bem detalhada"></div>
          </div>
          {/* Barra de progresso */}
          <div 
            className="absolute h-full transition-all duration-500 rounded-full"
            style={{ 
              width: `${hasData ? lastScore : 0}%`,
              backgroundColor: hasData ? getColor(lastScore) : '#e5e7eb'
            }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
          <span>Precisa detalhes</span>
          <span>Ok, dá pra entender</span>
          <span className="text-green-600 font-medium">Bem detalhada</span>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="flex items-center justify-between gap-2 mb-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-xl">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-700">{data.length}</div>
          <div className="text-[10px] text-gray-500">Mensagens</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold" style={{ color: hasData ? getColor(avgScore) : '#9ca3af' }}>
            {hasData ? avgScore : '-'}
          </div>
          <div className="text-[10px] text-gray-500">Média</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold" style={{ color: hasData ? getColor(lastScore) : '#9ca3af' }}>
            {hasData ? lastScore : '-'}
          </div>
          <div className="text-[10px] text-gray-500">Última</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">
            {hasData ? (trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→') : '-'}
          </div>
          <div className="text-[10px] text-gray-500">Tendência</div>
        </div>
      </div>

      {/* Gráfico - só mostra se tiver dados */}
      {hasData && (
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="messageNumber" 
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke={chartColor}
                strokeWidth={2}
                fill="url(#colorScore)"
                dot={{ fill: chartColor, strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: chartColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mensagem de feedback - cada resposta tem análise */}
      <div className="mt-3 text-xs text-center p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100/50">
        {!hasData ? (
          <span className="text-purple-600">
            💬 Comece a conversar! Cada mensagem sua recebe uma análise de clareza.
          </span>
        ) : lastScore >= 70 ? (
          <span className="text-green-600">
            🌟 Ótimo! Sua última mensagem foi bem detalhada. A IA consegue te ajudar melhor assim!
          </span>
        ) : lastScore >= 40 ? (
          <span className="text-yellow-600">
            👍 Sua mensagem está ok! Se quiser, pode adicionar mais contexto para uma análise mais rica.
          </span>
        ) : (
          <span className="text-purple-600">
            💡 Dica: Conte mais detalhes — o que aconteceu, como se sentiu, o contexto. Isso ajuda a IA a te entender melhor.
          </span>
        )}
      </div>
    </div>
  )
}
