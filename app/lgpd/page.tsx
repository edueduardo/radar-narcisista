'use client'

/**
 * Página LGPD - Seus Dados e Privacidade
 * Explica de forma clara e acessível como os dados são tratados
 */

import { useState } from 'react'
import Link from 'next/link'
import {
  Shield,
  Lock,
  Eye,
  Download,
  Trash2,
  FileText,
  Server,
  Key,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ArrowLeft
} from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  icon: React.ReactNode
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Quem pode ver meus dados?',
    answer: 'Apenas você. Seus dados são criptografados e protegidos por políticas de segurança (RLS - Row Level Security). Nem mesmo nossa equipe técnica tem acesso ao conteúdo dos seus registros. Cada usuário só consegue ver e acessar seus próprios dados.',
    icon: <Eye className="w-5 h-5 text-blue-500" />
  },
  {
    question: 'Meus dados são vendidos ou compartilhados?',
    answer: 'Não. Nunca vendemos, compartilhamos ou usamos seus dados pessoais para publicidade. Seus registros são seus e de mais ninguém. Usamos apenas dados agregados e anônimos para melhorar o serviço.',
    icon: <Shield className="w-5 h-5 text-green-500" />
  },
  {
    question: 'Posso exportar todos os meus dados?',
    answer: 'Sim! A qualquer momento você pode exportar todos os seus dados em formato JSON ou PDF. Isso inclui: entradas do diário, resultados de testes, conversas com a IA, plano de segurança e configurações. Vá em Configurações → Meus Dados → Exportar.',
    icon: <Download className="w-5 h-5 text-purple-500" />
  },
  {
    question: 'Posso apagar minha conta e todos os dados?',
    answer: 'Sim, você tem direito ao esquecimento. Ao solicitar exclusão da conta, todos os seus dados são permanentemente removidos de nossos servidores em até 30 dias. Não mantemos backups identificáveis após esse período.',
    icon: <Trash2 className="w-5 h-5 text-red-500" />
  },
  {
    question: 'Os dados podem ser usados como prova judicial?',
    answer: 'Seus registros são datados e podem ter valor probatório como evidência documental. Implementamos cadeia de custódia com hash criptográfico para garantir que os registros não foram alterados. Porém, consulte sempre um advogado sobre a admissibilidade em seu caso específico.',
    icon: <FileText className="w-5 h-5 text-amber-500" />
  },
  {
    question: 'Onde os dados ficam armazenados?',
    answer: 'Seus dados são armazenados em servidores seguros da Supabase (infraestrutura AWS), com criptografia em trânsito (TLS) e em repouso. Os servidores estão localizados em data centers com certificações de segurança internacionais.',
    icon: <Server className="w-5 h-5 text-cyan-500" />
  },
  {
    question: 'A IA aprende com meus dados?',
    answer: 'Não automaticamente. Você controla se permite que a IA aprenda com suas conversas para personalizar respostas futuras. Mesmo quando permitido, esse aprendizado é individual (só para você) e nunca compartilhado com outros usuários ou usado para treinar modelos gerais.',
    icon: <Key className="w-5 h-5 text-indigo-500" />
  },
  {
    question: 'O que acontece se houver vazamento de dados?',
    answer: 'Temos protocolos de segurança para prevenir vazamentos. Caso ocorra qualquer incidente, você será notificado em até 72 horas conforme exige a LGPD, com detalhes sobre o ocorrido e medidas tomadas.',
    icon: <AlertTriangle className="w-5 h-5 text-orange-500" />
  }
]

export default function LGPDPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Conformidade LGPD
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Seus Dados, Sua Privacidade
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explicamos de forma clara e sem juridiquês como tratamos seus dados. 
            Você está no controle.
          </p>
        </div>

        {/* Princípios */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Nossos Princípios de Privacidade
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Privacidade por Design</h3>
              <p className="text-gray-600 text-sm">
                Cada funcionalidade é construída pensando primeiro na sua privacidade. 
                Coletamos apenas o necessário.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Transparência Total</h3>
              <p className="text-gray-600 text-sm">
                Você sabe exatamente quais dados coletamos, por quê e como são usados. 
                Sem letras miúdas.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Key className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Você no Controle</h3>
              <p className="text-gray-600 text-sm">
                Exporte, corrija ou apague seus dados quando quiser. 
                Seus direitos são respeitados.
              </p>
            </div>
          </div>
        </section>

        {/* Seus Direitos */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Seus Direitos (LGPD Art. 18)
          </h2>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { right: 'Confirmação de tratamento', desc: 'Saber se tratamos seus dados' },
                { right: 'Acesso aos dados', desc: 'Ver todos os dados que temos sobre você' },
                { right: 'Correção', desc: 'Corrigir dados incompletos ou incorretos' },
                { right: 'Anonimização', desc: 'Tornar dados não identificáveis' },
                { right: 'Portabilidade', desc: 'Exportar seus dados em formato padrão' },
                { right: 'Eliminação', desc: 'Apagar seus dados permanentemente' },
                { right: 'Informação sobre compartilhamento', desc: 'Saber com quem compartilhamos' },
                { right: 'Revogação de consentimento', desc: 'Retirar permissões a qualquer momento' }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{item.right}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-600 mb-4">
                Para exercer qualquer direito, acesse suas configurações ou entre em contato:
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/configuracoes"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Configurações
                </Link>
                <a 
                  href="mailto:privacidade@radarnarcisista.com.br"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  privacidade@radarnarcisista.com.br
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Perguntas Frequentes
          </h2>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium text-gray-900">{item.question}</span>
                  </div>
                  {expandedFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {expandedFAQ === index && (
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-gray-600 pl-8">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Documentos */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Documentos Legais
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              href="/termos"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all"
            >
              <FileText className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium text-gray-900">Termos de Uso</p>
                <p className="text-sm text-gray-500">Regras do serviço</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
            </Link>

            <Link 
              href="/privacidade"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all"
            >
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-gray-900">Política de Privacidade</p>
                <p className="text-sm text-gray-500">Tratamento de dados</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
            </Link>

            <Link 
              href="/cookies"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all"
            >
              <Server className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-medium text-gray-900">Política de Cookies</p>
                <p className="text-sm text-gray-500">Uso de cookies</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
            </Link>
          </div>
        </section>

        {/* DPO */}
        <section className="bg-purple-50 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Encarregado de Proteção de Dados (DPO)
          </h2>
          <p className="text-gray-600 mb-6">
            Para questões relacionadas à proteção de dados pessoais, entre em contato com nosso DPO:
          </p>
          <div className="inline-flex flex-col items-center gap-2 p-4 bg-white rounded-xl">
            <p className="font-medium text-gray-900">Eduardo Silva</p>
            <a 
              href="mailto:dpo@radarnarcisista.com.br"
              className="text-purple-600 hover:text-purple-700"
            >
              dpo@radarnarcisista.com.br
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Radar Narcisista. Todos os direitos reservados.</p>
          <p className="mt-2">
            Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
          </p>
        </div>
      </footer>
    </div>
  )
}
