'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Gift, 
  Users, 
  Copy, 
  Check, 
  Share2, 
  MessageCircle,
  Send,
  Sparkles,
  Trophy,
  Clock
} from 'lucide-react'
import { 
  getOrCreateReferralCode, 
  getReferralStats, 
  generateShareLink, 
  generateShareText,
  REFERRAL_CONFIG,
  type ReferralStats 
} from '../../lib/referral'

export default function IndicarPage() {
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState<string | null>(null)
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [copied, setCopied] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar ou criar código
      const referral = await getOrCreateReferralCode(user.id)
      if (referral) {
        setCode(referral.code)
      }

      // Buscar estatísticas
      const referralStats = await getReferralStats(user.id)
      setStats(referralStats)
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyLink = () => {
    if (code) {
      navigator.clipboard.writeText(generateShareLink(code))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareWhatsApp = () => {
    if (code) {
      const text = encodeURIComponent(generateShareText(code))
      window.open(`https://wa.me/?text=${text}`, '_blank')
    }
  }

  const shareTelegram = () => {
    if (code) {
      const text = encodeURIComponent(generateShareText(code))
      window.open(`https://t.me/share/url?url=${encodeURIComponent(generateShareLink(code))}&text=${text}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-purple-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-purple-950 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 hover:bg-white/50 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Indique e Ganhe</h1>
            <p className="text-gray-600 dark:text-gray-400">Ajude outras pessoas e ganhe recompensas</p>
          </div>
        </div>

        {/* Card Principal */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 text-white mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Gift className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Ganhe {REFERRAL_CONFIG.referrerReward.value} dias grátis</h2>
              <p className="text-white/80">Para cada pessoa que você indicar</p>
            </div>
          </div>

          {/* Código */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
            <p className="text-sm text-white/70 mb-2">Seu código de indicação:</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-bold tracking-wider flex-1">
                {code || 'Carregando...'}
              </span>
              <button
                onClick={copyCode}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Botões de compartilhamento */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareWhatsApp}
              className="flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </button>
            <button
              onClick={shareTelegram}
              className="flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition-colors"
            >
              <Send className="h-5 w-5" />
              Telegram
            </button>
          </div>

          <button
            onClick={copyLink}
            className="w-full mt-3 flex items-center justify-center gap-2 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors"
          >
            <Share2 className="h-5 w-5" />
            {copied ? 'Link copiado!' : 'Copiar link'}
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 text-center">
            <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.totalReferrals || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Indicações</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 text-center">
            <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.completedReferrals || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Concluídas</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 text-center">
            <Sparkles className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.totalRewardsEarned || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Dias ganhos</div>
          </div>
        </div>

        {/* Como funciona */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Como funciona?</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Compartilhe seu código</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Envie para amigos, familiares ou nas redes sociais
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Eles se cadastram</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Usando seu código, ganham {REFERRAL_CONFIG.referredReward.value} dias grátis
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Você ganha também!</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receba {REFERRAL_CONFIG.referrerReward.value} dias grátis por cada indicação
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nota */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          💜 Ao indicar, você ajuda outras pessoas a encontrarem clareza
        </p>
      </div>
    </div>
  )
}
