'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Award, Download, Share2, Heart, Star, Calendar } from 'lucide-react'

export default function CertificadoPage() {
  const [nome, setNome] = useState('')
  const [diasJornada] = useState(90) // Simulado
  const [gerado, setGerado] = useState(false)
  const certificadoRef = useRef<HTMLDivElement>(null)

  const dataInicio = new Date()
  dataInicio.setDate(dataInicio.getDate() - diasJornada)

  const handleGerar = () => {
    if (nome.trim()) {
      setGerado(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Link>
        </div>

        {!gerado ? (
          /* Formulário */
          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-yellow-400" />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Certificado de Jornada
            </h1>
            
            <p className="text-xl text-purple-200 mb-8 max-w-lg mx-auto">
              Você completou <strong className="text-white">{diasJornada} dias</strong> de jornada no Radar Narcisista.
              Isso é <strong className="text-yellow-400">coragem</strong>.
            </p>

            <div className="bg-white/10 backdrop-blur rounded-3xl p-8 max-w-md mx-auto">
              <label className="block text-purple-200 mb-2 text-left">
                Como você quer ser chamada(o) no certificado?
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome ou apelido"
                className="w-full p-4 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none mb-6"
              />
              
              <button
                onClick={handleGerar}
                disabled={!nome.trim()}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-yellow-600 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Award className="w-5 h-5" />
                Gerar Meu Certificado
              </button>
            </div>
          </div>
        ) : (
          /* Certificado */
          <div className="space-y-6">
            {/* Certificado Visual */}
            <div 
              ref={certificadoRef}
              className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 md:p-12 shadow-2xl border-8 border-purple-200"
            >
              {/* Decoração superior */}
              <div className="flex justify-center gap-2 mb-6">
                <Star className="w-6 h-6 text-yellow-500" />
                <Star className="w-8 h-8 text-yellow-500" />
                <Star className="w-6 h-6 text-yellow-500" />
              </div>

              {/* Título */}
              <div className="text-center mb-8">
                <h2 className="text-sm uppercase tracking-widest text-purple-600 mb-2">Radar Narcisista BR</h2>
                <h1 className="text-4xl md:text-5xl font-bold text-purple-900 mb-2">
                  Certificado de Coragem
                </h1>
                <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
              </div>

              {/* Conteúdo */}
              <div className="text-center mb-8">
                <p className="text-gray-600 mb-4">Este certificado é concedido a</p>
                <p className="text-3xl md:text-4xl font-bold text-purple-800 mb-4">
                  {nome}
                </p>
                <p className="text-gray-600 max-w-md mx-auto">
                  Por completar <strong className="text-purple-700">{diasJornada} dias</strong> de jornada 
                  em busca de clareza, autoconhecimento e cura.
                </p>
              </div>

              {/* Conquistas */}
              <div className="bg-white/50 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-purple-800 mb-4 text-center">Conquistas Desbloqueadas</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">🛡️</span>
                    </div>
                    <p className="text-xs text-gray-600">Proteção</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">💪</span>
                    </div>
                    <p className="text-xs text-gray-600">Força</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">✨</span>
                    </div>
                    <p className="text-xs text-gray-600">Clareza</p>
                  </div>
                </div>
              </div>

              {/* Data e assinatura */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500">Data de início</p>
                  <p className="text-sm text-gray-700">{dataInicio.toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-0.5 bg-purple-400 mb-1" />
                  <p className="text-xs text-gray-500">Radar Narcisista BR</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Data de conclusão</p>
                  <p className="text-sm text-gray-700">{new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              {/* Selo */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
                <Award className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Mensagem */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
              <Heart className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <p className="text-purple-100">
                <strong className="text-white">{nome}</strong>, você é mais forte do que imagina.
                <br />
                Cada dia dessa jornada foi uma vitória. Continue assim. 💜
              </p>
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  // Aqui implementaria download real
                  alert('Funcionalidade de download em desenvolvimento!')
                }}
                className="flex-1 bg-white text-purple-700 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Baixar Certificado
              </button>
              <button
                onClick={() => {
                  // Aqui implementaria compartilhamento
                  alert('Funcionalidade de compartilhamento em desenvolvimento!')
                }}
                className="flex-1 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Compartilhar
              </button>
            </div>

            {/* Voltar */}
            <div className="text-center">
              <button
                onClick={() => setGerado(false)}
                className="text-purple-300 hover:text-white transition-colors"
              >
                Gerar outro certificado
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
