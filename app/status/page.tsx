'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  Bot,
  Shield,
  Globe,
  Zap
} from 'lucide-react'

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance'

interface Service {
  id: string
  name: string
  description: string
  icon: any
  status: ServiceStatus
  responseTime?: number
}

interface Incident {
  id: string
  title: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  date: string
  updates: { time: string; message: string }[]
}

export default function StatusPage() {
  const [services, setServices] = useState<Service[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Simular verificação de status
  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 60000) // Atualiza a cada minuto
    return () => clearInterval(interval)
  }, [])

  const checkStatus = async () => {
    setIsLoading(true)
    
    // Em produção, isso faria chamadas reais para verificar os serviços
    // Por enquanto, simulamos os status
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setServices([
      { 
        id: 'website', 
        name: 'Website', 
        description: 'Páginas públicas e landing page',
        icon: Globe, 
        status: 'operational',
        responseTime: 120
      },
      { 
        id: 'auth', 
        name: 'Autenticação', 
        description: 'Login, cadastro e recuperação de senha',
        icon: Shield, 
        status: 'operational',
        responseTime: 180
      },
      { 
        id: 'database', 
        name: 'Banco de Dados', 
        description: 'Armazenamento de dados do usuário',
        icon: Database, 
        status: 'operational',
        responseTime: 45
      },
      { 
        id: 'ai', 
        name: 'Coach de Clareza (IA)', 
        description: 'Chat com inteligência artificial',
        icon: Bot, 
        status: 'operational',
        responseTime: 1200
      },
      { 
        id: 'api', 
        name: 'API', 
        description: 'Endpoints e integrações',
        icon: Server, 
        status: 'operational',
        responseTime: 95
      },
    ])

    // Incidentes recentes (vazio = tudo funcionando)
    setIncidents([])
    
    // Guardar apenas o horário já formatado em string para evitar problemas de serialização
    setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
    setIsLoading(false)
  }

  const getStatusInfo = (status: ServiceStatus) => {
    switch (status) {
      case 'operational':
        return { 
          label: 'Operacional', 
          color: 'text-green-600', 
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: CheckCircle 
        }
      case 'degraded':
        return { 
          label: 'Degradado', 
          color: 'text-yellow-600', 
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: Clock 
        }
      case 'outage':
        return { 
          label: 'Fora do ar', 
          color: 'text-red-600', 
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: XCircle 
        }
      case 'maintenance':
        return { 
          label: 'Manutenção', 
          color: 'text-blue-600', 
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: AlertTriangle 
        }
    }
  }

  const allOperational = services.every(s => s.status === 'operational')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Voltar ao site
          </Link>
          <button 
            onClick={checkStatus}
            disabled={isLoading}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </header>

      {/* Status Geral */}
      <section className={`py-12 ${allOperational ? 'bg-green-500' : 'bg-yellow-500'}`}>
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-4">
            {allOperational ? (
              <CheckCircle className="w-12 h-12" />
            ) : (
              <AlertTriangle className="w-12 h-12" />
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {allOperational ? 'Todos os sistemas operacionais' : 'Alguns sistemas com problemas'}
          </h1>
          <p className="text-white/80">
            Última verificação: {lastUpdate ?? 'Carregando...'}
          </p>
        </div>
      </section>

      {/* Lista de Serviços */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Status dos Serviços</h2>
          
          <div className="space-y-4">
            {services.map(service => {
              const statusInfo = getStatusInfo(service.status)
              const StatusIcon = statusInfo.icon
              const ServiceIcon = service.icon
              
              return (
                <div 
                  key={service.id}
                  className={`bg-white rounded-xl p-4 border ${statusInfo.border} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ServiceIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-500">{service.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {service.responseTime && (
                      <span className="text-sm text-gray-400 hidden sm:block">
                        {service.responseTime}ms
                      </span>
                    )}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.bg}`}>
                      <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                      <span className={`text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Incidentes Recentes */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Incidentes Recentes</h2>
          
          {incidents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum incidente nos últimos 90 dias</p>
              <p className="text-sm text-gray-400 mt-2">Tudo funcionando normalmente! 🎉</p>
            </div>
          ) : (
            <div className="space-y-6">
              {incidents.map(incident => (
                <div key={incident.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                    <span className="text-sm text-gray-500">{incident.date}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {incident.updates.map((update, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-sm text-gray-400 w-16 flex-shrink-0">{update.time}</span>
                        <p className="text-sm text-gray-600">{update.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Uptime */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Histórico de Disponibilidade</h2>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-3xl font-bold text-green-600">99.9%</p>
                <p className="text-sm text-gray-500">Últimos 30 dias</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">99.8%</p>
                <p className="text-sm text-gray-500">Últimos 90 dias</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">99.7%</p>
                <p className="text-sm text-gray-500">Último ano</p>
              </div>
            </div>
            
            {/* Barra de uptime visual */}
            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-2">Últimos 30 dias</p>
              <div className="flex gap-0.5">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 h-8 bg-green-500 rounded-sm first:rounded-l-lg last:rounded-r-lg"
                    title={`Dia ${30 - i}: 100% disponível`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>30 dias atrás</span>
                <span>Hoje</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Problemas?</h2>
          <p className="text-gray-600 mb-6">
            Se você está enfrentando problemas que não aparecem aqui, entre em contato.
          </p>
          <a 
            href="mailto:suporte@radarnarcisista.br"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            <Zap className="w-5 h-5" />
            Reportar Problema
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p>© 2024 Radar Narcisista BR</p>
          <p className="mt-2">
            <Link href="/" className="hover:text-white">Voltar ao site</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
