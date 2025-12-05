'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Check, ChevronDown, Menu, X, Star, Phone, Shield, Eye, Feather } from 'lucide-react'
import EmergencyButton from '../../components/EmergencyButton'

export default function VersionA() {
  const [email, setEmail] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const faqs = [
    { q: 'Substitui terapia?', a: 'Não. Somos apoio complementar. Sempre recomendamos acompanhamento profissional.' },
    { q: 'Meus dados estão seguros?', a: 'Sim. Criptografia total, LGPD, você controla tudo. Pode deletar quando quiser.' },
    { q: 'Preciso pagar?', a: 'Teste gratuito. Planos premium com recursos avançados disponíveis.' },
    { q: 'Como funciona o ESC?', a: 'Pressione ESC para sair instantaneamente. Redireciona para Google.' },
  ]

  return (
    <div className="min-h-screen bg-stone-50">
      
      {/* NAV - Minimalista */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-rose-500 rounded-lg" />
            <span className="font-semibold text-stone-800">Radar</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#como" className="text-stone-600 hover:text-stone-900">Como funciona</a>
            <a href="#recursos" className="text-stone-600 hover:text-stone-900">Recursos</a>
            <a href="#faq" className="text-stone-600 hover:text-stone-900">FAQ</a>
            <Link href="/login" className="text-stone-600 hover:text-stone-900">Entrar</Link>
            <Link href="/teste-clareza" className="px-4 py-2 bg-stone-900 text-white rounded-full text-sm hover:bg-stone-800">
              Começar
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-stone-100 p-4 space-y-3">
            <a href="#como" className="block py-2 text-stone-600">Como funciona</a>
            <a href="#recursos" className="block py-2 text-stone-600">Recursos</a>
            <a href="#faq" className="block py-2 text-stone-600">FAQ</a>
            <Link href="/login" className="block py-2 text-stone-600">Entrar</Link>
            <Link href="/teste-clareza" className="block py-3 bg-stone-900 text-white rounded-lg text-center">Começar</Link>
          </div>
        )}
      </nav>

      {/* HERO - Emocional e Direto */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
            Plataforma brasileira de apoio emocional
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-stone-900 leading-tight mb-6">
            Você não está<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-rose-500 to-violet-600">
              imaginando coisas.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Ferramentas para reconhecer padrões de abuso emocional, 
            documentar sua experiência e recuperar sua clareza mental.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/teste-clareza"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-full font-medium hover:opacity-90 transition shadow-lg shadow-rose-500/25"
            >
              Fazer o Teste de Clareza
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              href="#como"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-stone-300 text-stone-700 rounded-full font-medium hover:bg-stone-100 transition"
            >
              Ver como funciona
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-stone-500">
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Gratuito</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Anônimo</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> 5 minutos</span>
            <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-500" /> Seguro</span>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF - Simples */}
      <section className="py-12 bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-stone-900">12.847</div>
              <div className="text-sm text-stone-500">pessoas ajudadas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-stone-900">4.9</div>
              <div className="text-sm text-stone-500 flex items-center justify-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> avaliação
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-stone-900">100%</div>
              <div className="text-sm text-stone-500">privado</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-stone-900">24/7</div>
              <div className="text-sm text-stone-500">disponível</div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA - Cards Limpos */}
      <section id="como" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Três passos para clareza
            </h2>
            <p className="text-stone-600 max-w-xl mx-auto">
              Um processo simples para entender o que você está vivendo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Passo 1 */}
            <div className="bg-white rounded-2xl p-8 border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-xl font-bold text-amber-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-3">Teste de Clareza</h3>
              <p className="text-stone-600 leading-relaxed">
                18 perguntas simples para identificar padrões de comportamento. 
                Resultado imediato, sem julgamentos.
              </p>
            </div>

            {/* Passo 2 */}
            <div className="bg-white rounded-2xl p-8 border border-stone-200 hover:border-rose-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-xl font-bold text-rose-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-3">Diário Seguro</h3>
              <p className="text-stone-600 leading-relaxed">
                Registre episódios por texto ou voz. Veja padrões ao longo do tempo. 
                Tudo criptografado.
              </p>
            </div>

            {/* Passo 3 */}
            <div className="bg-white rounded-2xl p-8 border border-stone-200 hover:border-violet-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-xl font-bold text-violet-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-3">Coach IA</h3>
              <p className="text-stone-600 leading-relaxed">
                Converse com nossa IA treinada para acolher, validar e ajudar você 
                a ganhar perspectiva.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RECURSOS - Grid Alternativo */}
      <section id="recursos" className="py-24 px-6 bg-stone-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Feito para sua segurança
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 mb-1">Saída de Emergência</h4>
                <p className="text-sm text-stone-600">Pressione ESC para sair instantaneamente e limpar rastros.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 mb-1">Criptografia Total</h4>
                <p className="text-sm text-stone-600">Seus dados são criptografados. Só você tem acesso.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Feather className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 mb-1">Voz para Texto</h4>
                <p className="text-sm text-stone-600">Grave áudios que são transcritos automaticamente.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Check className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 mb-1">LGPD Completa</h4>
                <p className="text-sm text-stone-600">Exporte ou delete seus dados a qualquer momento.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTO - Único e Impactante */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <blockquote className="text-2xl md:text-3xl text-stone-800 font-medium leading-relaxed mb-8">
            "Depois de anos achando que eu era o problema, finalmente consegui ver 
            os padrões. O teste de clareza mudou minha vida."
          </blockquote>
          <div className="text-stone-500">
            <span className="font-medium text-stone-700">Maria S.</span> · São Paulo
          </div>
        </div>
      </section>

      {/* EMERGÊNCIA - Destaque */}
      <section className="py-16 px-6 bg-rose-50 border-y border-rose-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">Precisa de ajuda agora?</h3>
              <p className="text-stone-600">Ligue para os serviços de emergência 24 horas.</p>
            </div>
            <div className="flex gap-4">
              <a href="tel:190" className="flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-stone-200 hover:border-rose-300 transition">
                <Phone className="h-4 w-4 text-rose-600" />
                <span className="font-semibold">190</span>
              </a>
              <a href="tel:188" className="flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-stone-200 hover:border-rose-300 transition">
                <Phone className="h-4 w-4 text-rose-600" />
                <span className="font-semibold">188</span>
              </a>
              <a href="tel:100" className="flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-stone-200 hover:border-rose-300 transition">
                <Phone className="h-4 w-4 text-rose-600" />
                <span className="font-semibold">100</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Accordion Simples */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-stone-900 text-center mb-12">
            Perguntas frequentes
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-stone-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50 transition"
                >
                  <span className="font-medium text-stone-900">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-stone-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-5 text-stone-600">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 bg-gradient-to-br from-stone-900 to-stone-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para ter clareza?
          </h2>
          <p className="text-stone-400 mb-10 text-lg">
            O primeiro passo é reconhecer. Estamos aqui para ajudar.
          </p>
          <Link 
            href="/teste-clareza"
            className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-full font-medium text-lg hover:opacity-90 transition shadow-xl"
          >
            Começar Agora — É Gratuito
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER - Minimalista */}
      <footer className="py-12 px-6 bg-stone-900 text-stone-400">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-rose-500 rounded" />
              <span className="text-white font-medium">Radar Narcisista</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/blog" className="hover:text-white transition">Blog</Link>
              <Link href="/contato" className="hover:text-white transition">Contato</Link>
              <Link href="/seguranca" className="hover:text-white transition">Privacidade</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-stone-800 text-center text-sm">
            © 2024 Radar Narcisista BR. Feito com cuidado no Brasil.
          </div>
        </div>
      </footer>

      <EmergencyButton />
    </div>
  )
}
