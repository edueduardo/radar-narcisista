'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
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

const symptoms = [
  {
    icon: '🧠',
    title: 'Você duvida da sua própria memória',
    description: 'Parece que o que você lembra nunca aconteceu do jeito que você pensou'
  },
  {
    icon: '😞',
    title: 'Sente que está sempre errada',
    description: 'Por mais que tente, você nunca consegue fazer nada direito'
  },
  {
    icon: '🥚',
    title: 'Anda em ovos ao redor dele(a)',
    description: 'Tem medo de falar algo errado e provocar uma explosão'
  },
  {
    icon: '😶‍🌫️',
    title: 'Não sabe mais quem você é',
    description: 'Perdeu o senso de si mesma(o) e do que é real'
  },
  {
    icon: '🔄',
    title: 'Ciclos de caos e calmaria',
    description: 'Momentos de afeto seguidos de frieza e punição'
  },
  {
    icon: '🚪',
    title: 'Sente que não pode sair',
    description: 'Medo, culpa ou dependência te mantém presa(o)'
  }
]

export default function VersionC() {
  return (
    <div className="min-h-screen bg-white">
      {/* 🔥 SEÇÃO 1: HERO (acima da dobra) */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 animate-gradient-xy"></div>
        
        {/* Grid pattern sutil */}
        <div className="absolute inset-0 bg-grid-white opacity-10"></div>
        
        {/* Conteúdo principal */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Badge superior */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 text-white mb-8">
              <span className="text-xl">🛡️</span>
              <span className="font-semibold">Versão C - Million Dollar Design</span>
            </div>
            
            {/* Headline principal */}
            <h1 className="text-7xl md:text-8xl font-bold text-white mb-8 leading-tight">
              Encontre <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-blue-200">Clareza</span><br/>
              em Meio à Confusão
            </h1>
            
            {/* Subheadline */}
            <p className="text-2xl md:text-3xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
              Teste gratuito em <strong>5 minutos</strong> para identificar sinais de abuso emocional e narcisismo
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Link
                href="/teste-clareza"
                className="group relative px-12 py-6 bg-white text-purple-600 rounded-2xl font-bold text-xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-white/50"
              >
                <span className="relative z-10">Fazer Teste Grátis Agora</span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </Link>
              
              <Link
                href="#como-funciona"
                className="px-10 py-6 border-2 border-white/40 backdrop-blur-xl text-white rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
              >
                Ver Como Funciona 
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            {/* Badges de confiança */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-white/90 text-lg">
              <span className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <span>100% Anônimo</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                <span>Criptografado</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span>Resultado em 5min</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-2xl">🇧🇷</span>
                <span>Feito no Brasil</span>
              </span>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* 💔 SEÇÃO 2: PROBLEMA (empatia + identificação) */}
      <section className="py-32 bg-gradient-to-b from-white via-purple-50/30 to-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Título */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              Você está se sentindo <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">assim</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Esses são sinais comuns de relacionamentos com dinâmicas narcisistas ou abusivas
            </p>
          </motion.div>
          
          {/* Grid de cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {symptoms.map((symptom, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 hover:border-purple-300 hover:-translate-y-2"
              >
                <div className="text-6xl mb-6">{symptom.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-purple-600 transition-colors">
                  {symptom.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {symptom.description}
                </p>
              </motion.div>
            ))}
          </div>
          
          {/* CTA de conexão */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center"
          >
            <p className="text-2xl text-gray-700 mb-8">
              Se você se identificou com <strong className="text-purple-600">2 ou mais</strong>, este teste foi feito para você
            </p>
            <Link
              href="/teste-clareza"
              className="inline-block px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl hover:shadow-purple-500/50"
            >
              Fazer Teste Agora (5 minutos)
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 🎯 CTA FINAL */}
      <section className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Título */}
            <h2 className="text-6xl md:text-7xl font-bold mb-8 text-gray-900 leading-tight">
              Pronta para Recuperar<br/>sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">Clareza</span>?
            </h2>
            
            {/* Subtítulo */}
            <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Junte-se a <strong className="text-purple-600">+5.000 pessoas</strong> que já descobriram a verdade sobre seus relacionamentos
            </p>
            
            {/* CTA principal */}
            <Link
              href="/teste-clareza"
              className="group relative inline-block px-16 py-8 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-2xl font-bold text-2xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 mb-16"
            >
              <span className="relative z-10">Fazer Teste Gratuito Agora</span>
              <div className="absolute inset-0 bg-white rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </Link>
            
            {/* Garantias */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {[
                { icon: "✅", text: "100% anônimo" },
                { icon: "✅", text: "Sem cadastro inicial" },
                { icon: "✅", text: "Resultado em 5min" },
                { icon: "✅", text: "Dados criptografados" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-gray-700 font-semibold text-lg">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
