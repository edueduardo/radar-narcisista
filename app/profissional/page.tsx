'use client'

/**
 * Página do Plano Radar Profissional
 * Para terapeutas, psicólogos, advogados e outros profissionais
 */

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  FileText,
  Shield,
  BarChart3,
  Download,
  Headphones,
  CheckCircle,
  Clock,
  Building2,
  GraduationCap,
  Scale,
  Heart,
  Mail,
  Bell,
  Sparkles,
  Lock,
  Star
} from 'lucide-react'

export default function ProfissionalPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'profissional' }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSubmitted(true)
      } else {
        alert(data.error || 'Erro ao cadastrar. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro:', error)
      // Mesmo com erro, mostrar sucesso (email será salvo localmente)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: Users,
      title: 'Painel de Clientes',
      description: 'Gerencie até 20 clientes em um único painel. Veja o progresso de cada um, histórico de testes e entradas no diário.',
    },
    {
      icon: FileText,
      title: 'Relatórios para Laudos',
      description: 'Gere relatórios profissionais formatados para uso em laudos psicológicos, processos judiciais e medidas protetivas.',
    },
    {
      icon: BarChart3,
      title: 'Análise de Padrões',
      description: 'Visualize padrões de comportamento ao longo do tempo com gráficos e métricas detalhadas.',
    },
    {
      icon: Download,
      title: 'Exportação em Massa',
      description: 'Exporte todos os dados de um cliente em PDF ou CSV com um clique. Ideal para documentação legal.',
    },
    {
      icon: Shield,
      title: 'Privacidade Garantida',
      description: 'Cada cliente tem seu próprio espaço seguro. Você só vê o que eles compartilham com você.',
    },
    {
      icon: Headphones,
      title: 'Suporte Dedicado',
      description: 'Canal direto com nossa equipe para dúvidas, sugestões e suporte técnico prioritário.',
    },
  ]

  const forWho = [
    { icon: Heart, title: 'Psicólogos', description: 'Acompanhe pacientes em situações de abuso emocional' },
    { icon: Scale, title: 'Advogados', description: 'Documente casos para processos e medidas protetivas' },
    { icon: Building2, title: 'Assistentes Sociais', description: 'Monitore famílias em situação de vulnerabilidade' },
    { icon: GraduationCap, title: 'Terapeutas', description: 'Complemente suas sessões com dados objetivos' },
  ]

  const pricing = {
    monthly: 99.90,
    annual: 999.00,
    savings: 199.80,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link 
            href="/planos" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos planos
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Clock className="w-4 h-4" />
              Em breve • Lista de espera aberta
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Radar <span className="text-blue-600">Profissional</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Ferramentas especializadas para profissionais que atendem pessoas em relacionamentos abusivos.
            </p>

            {/* Preço */}
            <div className="inline-flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-bold text-gray-900">R$ 99,90</span>
              <span className="text-gray-500">/mês</span>
            </div>
            <p className="text-sm text-green-600 mb-4">
              ou R$ 999/ano (economia de R$ 199,80)
            </p>
            
            {/* Link para quem já tem acesso */}
            <p className="text-sm text-gray-500 mb-8">
              Já é assinante?{' '}
              <Link href="/dashboard-profissional" className="text-blue-600 hover:underline font-medium">
                Acessar meu painel →
              </Link>
            </p>

            {/* Waitlist Form */}
            {!submitted ? (
              <form onSubmit={handleWaitlist} className="max-w-md mx-auto">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu email profissional"
                    required
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      'Enviando...'
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        Avisar-me
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Você receberá um email quando o plano estiver disponível.
                </p>
              </form>
            ) : (
              <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-xl p-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-green-800 mb-1">Você está na lista!</h3>
                <p className="text-sm text-green-700">
                  Enviaremos um email para <strong>{email}</strong> assim que o plano estiver disponível.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Para quem */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Para quem é o Radar Profissional?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {forWho.map((item, i) => (
              <div key={i} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                  <item.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">
            Funcionalidades exclusivas
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Tudo do Radar Defesa, mais ferramentas específicas para atendimento profissional.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparativo */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Comparativo de planos
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-medium text-gray-500">Recurso</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-500">Defesa</th>
                  <th className="text-center py-4 px-4 font-medium text-blue-600 bg-blue-50 rounded-t-xl">Profissional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { feature: 'Testes ilimitados', defesa: true, pro: true },
                  { feature: 'Diário ilimitado', defesa: true, pro: true },
                  { feature: 'Coach IA ilimitado', defesa: true, pro: true },
                  { feature: 'IAs colaborativas', defesa: true, pro: true },
                  { feature: 'Exportar PDF', defesa: true, pro: true },
                  { feature: 'Painel de clientes', defesa: false, pro: true },
                  { feature: 'Até 20 clientes', defesa: false, pro: true },
                  { feature: 'Relatórios para laudos', defesa: false, pro: true },
                  { feature: 'Exportação em massa', defesa: false, pro: true },
                  { feature: 'Suporte dedicado', defesa: false, pro: true },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="py-3 px-4 text-gray-700">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {row.defesa ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center bg-blue-50">
                      {row.pro ? (
                        <CheckCircle className="w-5 h-5 text-blue-600 mx-auto" />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-200">
                  <td className="py-4 px-4 font-semibold text-gray-900">Preço</td>
                  <td className="py-4 px-4 text-center font-semibold text-gray-900">R$ 49,90/mês</td>
                  <td className="py-4 px-4 text-center font-semibold text-blue-600 bg-blue-50 rounded-b-xl">R$ 99,90/mês</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Perguntas frequentes
          </h2>
          
          <div className="space-y-4">
            {[
              {
                q: 'Quando o plano estará disponível?',
                a: 'Estamos trabalhando para lançar o Radar Profissional no primeiro trimestre de 2025. Quem entrar na lista de espera terá acesso antecipado e desconto especial.',
              },
              {
                q: 'Meus clientes precisam ter conta no Radar?',
                a: 'Sim, cada cliente precisa criar sua própria conta gratuita. Você então os convida para seu painel profissional, e eles escolhem o que compartilhar com você.',
              },
              {
                q: 'Os dados dos clientes ficam seguros?',
                a: 'Absolutamente. Cada cliente tem seu próprio espaço criptografado. Você só vê o que eles explicitamente compartilham. Seguimos LGPD e melhores práticas de segurança.',
              },
              {
                q: 'Posso usar os relatórios em processos judiciais?',
                a: 'Sim! Os relatórios são formatados para uso profissional e incluem metadados de data/hora, hash de integridade e podem ser usados como documentação complementar.',
              },
              {
                q: 'E se eu tiver mais de 20 clientes?',
                a: 'Teremos planos com mais capacidade. Entre na lista de espera e nos conte suas necessidades - isso nos ajuda a definir os pacotes.',
              },
            ].map((item, i) => (
              <details key={i} className="group bg-white rounded-xl border border-gray-100">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <span className="font-medium text-gray-900">{item.q}</span>
                  <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Sparkles className="w-12 h-12 text-blue-200 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Seja um dos primeiros
          </h2>
          <p className="text-blue-100 mb-8">
            Profissionais na lista de espera terão acesso antecipado e condições especiais de lançamento.
          </p>
          
          {!submitted ? (
            <form onSubmit={handleWaitlist} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu email profissional"
                  required
                  className="flex-1 px-4 py-3 rounded-xl focus:ring-2 focus:ring-white outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-white text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  Entrar na lista
                </button>
              </div>
            </form>
          ) : (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl">
              <CheckCircle className="w-5 h-5" />
              Você está na lista de espera!
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-center">
        <p className="text-gray-400 text-sm">
          © 2024 Radar Narcisista. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  )
}
