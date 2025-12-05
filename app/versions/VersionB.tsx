'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ClipboardList,
  BookOpen,
  MessageCircle,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Lock,
  Eye,
  Zap,
  Sparkles,
} from 'lucide-react'

export default function VersionB() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* HERO SECTION - VERSÃO B SaaS */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-3 text-white">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">Versão B - Design SaaS Moderno</span>
            </div>

            {/* Main Title */}
            <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
              Transforme{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Confusão
              </span>{' '}
              em{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Clareza
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
              Plataforma inteligente para identificar padrões de abuso emocional e recuperar seu poder pessoal
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/teste-clareza"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:scale-105 transition-all shadow-xl"
              >
                <Zap className="inline h-5 w-5 mr-2" />
                Iniciar Análise Gratuita
              </Link>
              
              <Link
                href="#features"
                className="px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Explorar Recursos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Recursos Inteligentes
            </h2>
            <p className="text-xl text-white/70">
              Tecnologia avançada a serviço do seu bem-estar emocional
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ClipboardList,
                title: 'Análise Inteligente',
                description: 'Algoritmos avançados identificam padrões de comportamento tóxico com precisão',
                features: ['18 perguntas validadas', 'Resultado instantâneo', 'Gráfico visual']
              },
              {
                icon: BookOpen,
                title: 'Diário Digital',
                description: 'Registre episódios e acompanhe a evolução da sua jornada emocional',
                features: ['Texto e áudio', 'Timeline interativa', 'Export seguro']
              },
              {
                icon: MessageCircle,
                title: 'IA Terapêutica',
                description: 'Conversas confidenciais com inteligência artificial para apoio emocional',
                features: ['24/7 disponível', 'Linguagem acolhedora', 'Plano de segurança']
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-white/70 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/60">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Comece Sua Jornada Hoje
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Junte-se a milhares que já encontraram clareza e recuperação
            </p>
            <Link
              href="/teste-clareza"
              className="inline-block px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:scale-105 transition-all"
            >
              Fazer Teste Gratuitamente
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
