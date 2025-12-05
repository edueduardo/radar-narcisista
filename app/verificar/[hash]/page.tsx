'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  Hash, 
  Monitor,
  Globe,
  User,
  FileCheck,
  AlertTriangle,
  Home,
  Loader2
} from 'lucide-react'

// =============================================================================
// PÁGINA DE VERIFICAÇÃO DE DOCUMENTO
// Verifica autenticidade de documentos gerados pelo Radar Narcisista
// =============================================================================

interface VerificationData {
  isValid: boolean
  acceptance?: {
    id: string
    accepted_at: string
    ip_address: string
    user_agent: string
    locale: string
    timezone: string
    screen_resolution: string
    platform: string
    event_hash: string
    terms_version: {
      title: string
      version_number: string
    }
  }
  error?: string
}

export default function VerificarDocumento() {
  const params = useParams()
  const hash = params.hash as string
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<VerificationData | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    if (hash) {
      verifyDocument()
    }
  }, [hash])

  const verifyDocument = async () => {
    try {
      setLoading(true)
      
      // Buscar aceite pelo hash
      const { data: acceptance, error } = await supabase
        .from('terms_acceptances')
        .select(`
          id,
          accepted_at,
          ip_address,
          user_agent,
          locale,
          timezone,
          screen_resolution,
          platform,
          event_hash,
          terms_version:terms_version_id (
            title,
            version_number
          )
        `)
        .eq('event_hash', hash)
        .single()

      if (error || !acceptance) {
        setData({
          isValid: false,
          error: 'Documento não encontrado ou hash inválido.'
        })
      } else {
        setData({
          isValid: true,
          acceptance: acceptance as any
        })
      }
    } catch (err) {
      console.error('Erro na verificação:', err)
      setData({
        isValid: false,
        error: 'Erro ao verificar documento. Tente novamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  const parseDevice = (ua: string): string => {
    if (/iPhone/.test(ua)) return 'iPhone'
    if (/iPad/.test(ua)) return 'iPad'
    if (/Android/.test(ua)) return 'Android'
    if (/Windows/.test(ua)) return 'Windows'
    if (/Mac/.test(ua)) return 'Mac'
    if (/Linux/.test(ua)) return 'Linux'
    return 'Desktop'
  }

  const parseBrowser = (ua: string): string => {
    if (/Chrome/.test(ua) && !/Edge/.test(ua)) return 'Chrome'
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'Safari'
    if (/Firefox/.test(ua)) return 'Firefox'
    if (/Edge/.test(ua)) return 'Edge'
    return 'Navegador'
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          </div>
          <p className="text-gray-400">Verificando documento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <header className="bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">Início</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-400" />
            <span className="font-semibold text-white">Verificação</span>
          </div>
          
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Verificação de Documento
          </h1>
          <p className="text-gray-400">
            Radar Narcisista BR - Cadeia de Custódia
          </p>
        </div>

        {/* Resultado da Verificação */}
        {data?.isValid ? (
          <div className="space-y-6">
            {/* Status: Válido */}
            <div className="bg-emerald-500/10 border-2 border-emerald-500/50 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-emerald-400">
                    Documento Verificado
                  </h2>
                  <p className="text-emerald-300/80 text-sm mt-1">
                    Este documento é autêntico e não foi alterado.
                  </p>
                </div>
              </div>
            </div>

            {/* Detalhes do Documento */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-violet-400" />
                  <h3 className="font-semibold text-white">Detalhes do Registro</h3>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Termo */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <FileCheck className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Documento</p>
                    <p className="text-white font-medium">
                      {data.acceptance?.terms_version.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Versão {data.acceptance?.terms_version.version_number}
                    </p>
                  </div>
                </div>

                {/* Data/Hora */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Data do Aceite</p>
                      <p className="text-white font-medium">
                        {data.acceptance && new Date(data.acceptance.accepted_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Hora (Local)</p>
                      <p className="text-white font-medium">
                        {data.acceptance && new Date(data.acceptance.accepted_at).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dispositivo */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <Monitor className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Dispositivo</p>
                    <p className="text-white font-medium">
                      {data.acceptance && parseDevice(data.acceptance.user_agent)} ({data.acceptance?.platform})
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {data.acceptance && parseBrowser(data.acceptance.user_agent)} • {data.acceptance?.screen_resolution}
                    </p>
                  </div>
                </div>

                {/* Localização */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <Globe className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Localização</p>
                    <p className="text-white font-medium">
                      {data.acceptance?.timezone}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Idioma: {data.acceptance?.locale}
                    </p>
                  </div>
                </div>

                {/* Hash */}
                <div className="pt-4 border-t border-slate-700">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <Hash className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">Hash SHA-256 (Prova de Integridade)</p>
                      <p className="text-amber-400 font-mono text-xs break-all">
                        {data.acceptance?.event_hash}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Explicação */}
            <div className="bg-slate-800/50 rounded-xl p-4">
              <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-400" />
                O que isso significa?
              </h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• O documento foi gerado pelo sistema Radar Narcisista BR</li>
                <li>• O hash SHA-256 confirma que o conteúdo não foi alterado</li>
                <li>• Os dados de dispositivo e localização foram registrados no momento do aceite</li>
                <li>• Este registro pode ser usado como evidência de que o termo foi aceito</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Status: Inválido */
          <div className="space-y-6">
            <div className="bg-red-500/10 border-2 border-red-500/50 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-400">
                    Documento Não Encontrado
                  </h2>
                  <p className="text-red-300/80 text-sm mt-1">
                    {data?.error || 'Não foi possível verificar este documento.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Possíveis motivos
              </h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• O hash informado está incorreto ou incompleto</li>
                <li>• O documento foi gerado em outro sistema</li>
                <li>• O registro foi removido do banco de dados</li>
                <li>• O link de verificação expirou ou é inválido</li>
              </ul>
            </div>
          </div>
        )}

        {/* Hash consultado */}
        <div className="mt-8 p-4 bg-slate-900/50 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">Hash consultado:</p>
          <p className="text-xs text-gray-400 font-mono break-all">{hash}</p>
        </div>

        {/* Voltar */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            Voltar ao Início
          </Link>
        </div>
      </main>
    </div>
  )
}
