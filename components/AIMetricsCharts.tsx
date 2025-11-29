'use client'

import { useEffect, useRef } from 'react'

interface AIMetricsChartsProps {
  agentId: string
  metrics: any[]
}

export default function AIMetricsCharts({ agentId, metrics }: AIMetricsChartsProps) {
  const hourlyChartRef = useRef<HTMLCanvasElement>(null)
  const costChartRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    drawHourlyChart()
    drawCostChart()
  }, [agentId, metrics])

  const drawHourlyChart = () => {
    const canvas = hourlyChartRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Dados mock para 24h
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const callsData = hours.map(() => Math.floor(Math.random() * 100) + 20)
    const errorData = hours.map(() => Math.floor(Math.random() * 5))
    const latencyData = hours.map(() => Math.floor(Math.random() * 2000) + 500)

    const maxCalls = Math.max(...callsData)
    const maxLatency = Math.max(...latencyData)

    // Configuração
    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    // Desenhar grid
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvas.width - padding, y)
      ctx.stroke()
    }

    // Desenhar linha de chamadas
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.beginPath()
    callsData.forEach((value, index) => {
      const x = padding + (chartWidth / (callsData.length - 1)) * index
      const y = padding + chartHeight - (value / maxCalls) * chartHeight
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Desenhar linha de latência (segundo eixo)
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.beginPath()
    latencyData.forEach((value, index) => {
      const x = padding + (chartWidth / (latencyData.length - 1)) * index
      const y = padding + chartHeight - (value / maxLatency) * chartHeight
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Labels
    ctx.fillStyle = '#94a3b8'
    ctx.font = '10px sans-serif'
    ctx.fillText('Chamadas/Hora', padding, 20)
    ctx.fillText('Latência (ms)', canvas.width - 100, 20)

    // Eixo X
    hours.forEach((hour, index) => {
      if (index % 3 === 0) {
        const x = padding + (chartWidth / (hours.length - 1)) * index
        ctx.fillText(`${hour}h`, x - 10, canvas.height - 10)
      }
    })
  }

  const drawCostChart = () => {
    const canvas = costChartRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Dados mock para 7 dias
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    const costData = days.map(() => Math.random() * 10 + 2)

    const maxCost = Math.max(...costData)

    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2
    const barWidth = chartWidth / days.length * 0.6
    const barSpacing = chartWidth / days.length

    // Grid
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvas.width - padding, y)
      ctx.stroke()
    }

    // Barras
    costData.forEach((value, index) => {
      const x = padding + barSpacing * index + (barSpacing - barWidth) / 2
      const barHeight = (value / maxCost) * chartHeight
      const y = padding + chartHeight - barHeight

      // Gradiente
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
      gradient.addColorStop(0, '#10b981')
      gradient.addColorStop(1, '#059669')
      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, barHeight)

      // Valor
      ctx.fillStyle = '#94a3b8'
      ctx.font = '10px sans-serif'
      ctx.fillText(`$${value.toFixed(1)}`, x + barWidth / 2 - 15, y - 5)

      // Dia
      ctx.fillText(days[index], x + barWidth / 2 - 10, canvas.height - 10)
    })

    // Label
    ctx.fillStyle = '#94a3b8'
    ctx.font = '10px sans-serif'
    ctx.fillText('Custo Diário (USD)', padding, 20)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Chamadas por Hora (24h)</h3>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <canvas
            ref={hourlyChartRef}
            width={400}
            height={200}
            className="w-full"
          />
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Chamadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Latência</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Custo Estimado (7 dias)</h3>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <canvas
            ref={costChartRef}
            width={400}
            height={200}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Taxa de Erro vs Tempo Resposta</h3>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Taxa de Erro (24h)</span>
              <span className="text-sm font-medium text-green-400">0.8%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '0.8%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Tempo Médio Resposta</span>
              <span className="text-sm font-medium text-yellow-400">1.2s</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Uso de Tokens/Hora</span>
              <span className="text-sm font-medium text-blue-400">85%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
