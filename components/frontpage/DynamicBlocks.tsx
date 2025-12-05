'use client'

import { useEffect, useState } from 'react'
import RadarEmNumeros from './RadarEmNumeros'
import FAQDinamico from './FAQDinamico'
import RadarAcademy from './RadarAcademy'
import RadarNoMundo from './RadarNoMundo'

interface FrontpageData {
  blocks: any[]
  insights: any[]
  recentContent: any[]
  tracks: any[]
  faqs: any[]
  lastUpdated: string
}

export default function DynamicBlocks() {
  const [data, setData] = useState<FrontpageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/public/frontpage')
        if (!response.ok) throw new Error('Erro ao carregar dados')
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Erro ao carregar blocos dinâmicos:', err)
        setError('Não foi possível carregar os dados')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return null // Silenciosamente não renderiza se houver erro
  }

  // Ordenar blocos pela configuração
  const enabledBlocks = data.blocks.filter(b => b.enabled)
  
  return (
    <>
      {/* Radar em Números */}
      {enabledBlocks.some(b => b.block_key === 'radar_numeros') && (
        <RadarEmNumeros insights={data.insights} />
      )}

      {/* FAQ Dinâmico */}
      {enabledBlocks.some(b => b.block_key === 'faq_dinamico') && data.faqs.length > 0 && (
        <FAQDinamico faqs={data.faqs} />
      )}

      {/* Radar no Mundo */}
      {enabledBlocks.some(b => b.block_key === 'radar_mundo') && data.recentContent.length > 0 && (
        <RadarNoMundo content={data.recentContent} />
      )}

      {/* Radar Academy */}
      {enabledBlocks.some(b => b.block_key === 'radar_academy') && data.tracks.length > 0 && (
        <RadarAcademy tracks={data.tracks} />
      )}
    </>
  )
}
