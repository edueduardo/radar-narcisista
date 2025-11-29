'use client'

import Link from 'next/link'
import { ArrowLeft, Sparkles, Heart, Play, Lock, CheckCircle, Clock, Star } from 'lucide-react'

// =============================================================================
// PÁGINA: Aula de Autoestima - Maquiagem
// Conteúdo de autocuidado para recuperar autoestima
// Rota: /cursos/autoestima/maquiagem
// =============================================================================

// Módulos do curso (exemplo de estrutura)
const MODULOS = [
  {
    id: 1,
    titulo: 'Introdução: Por que cuidar de si mesma importa',
    duracao: '5 min',
    liberado: true,
    concluido: false,
    descricao: 'Entenda como o autocuidado ajuda na recuperação emocional',
  },
  {
    id: 2,
    titulo: 'Skincare básico: Cuidando da sua pele',
    duracao: '8 min',
    liberado: true,
    concluido: false,
    descricao: 'Rotina simples de cuidados com a pele para se sentir bem',
  },
  {
    id: 3,
    titulo: 'Maquiagem natural: Realçando sua beleza',
    duracao: '12 min',
    liberado: true,
    concluido: false,
    descricao: 'Técnicas simples para uma maquiagem leve e natural',
  },
  {
    id: 4,
    titulo: 'Cores que combinam com você',
    duracao: '7 min',
    liberado: false,
    concluido: false,
    descricao: 'Descubra as cores que mais valorizam seu tom de pele',
  },
  {
    id: 5,
    titulo: 'Ritual de autocuidado: Criando sua rotina',
    duracao: '10 min',
    liberado: false,
    concluido: false,
    descricao: 'Monte uma rotina de autocuidado que funcione para você',
  },
]

export default function AulaMaquiagemPage() {
  const modulosLiberados = MODULOS.filter(m => m.liberado).length
  const modulosConcluidos = MODULOS.filter(m => m.concluido).length
  const progresso = Math.round((modulosConcluidos / MODULOS.length) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar ao Dashboard</span>
          </Link>

          <div className="flex items-start gap-4">
            <div className="p-4 bg-white/20 rounded-2xl">
              <Sparkles className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                  Autocuidado
                </span>
                <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-200 rounded-full text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" /> Novo
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Como se arrumar para voltar a se sentir bonita
              </h1>
              <p className="text-white/80 text-sm sm:text-base">
                Conteúdo de autocuidado para recuperar autoestima e se olhar com mais carinho
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Mensagem de acolhimento */}
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-pink-100 rounded-xl">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Você merece se sentir bem 💜</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Este curso foi criado especialmente para você que está em processo de recuperação. 
                Cuidar da aparência não é vaidade - é um ato de amor próprio. Quando nos arrumamos, 
                estamos dizendo para nós mesmas que merecemos atenção e cuidado.
              </p>
            </div>
          </div>
        </div>

        {/* Progresso */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Seu Progresso</h3>
            <span className="text-sm text-purple-600 font-medium">{progresso}% concluído</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">
            {modulosConcluidos} de {MODULOS.length} módulos concluídos • {modulosLiberados} módulos liberados
          </p>
        </div>

        {/* Lista de módulos */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-lg">Módulos do Curso</h3>
          
          {MODULOS.map((modulo, index) => (
            <div 
              key={modulo.id}
              className={`bg-white rounded-xl border shadow-sm p-5 transition-all ${
                modulo.liberado 
                  ? 'border-gray-100 hover:border-purple-200 hover:shadow-md cursor-pointer' 
                  : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Número/Status */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  modulo.concluido 
                    ? 'bg-green-100' 
                    : modulo.liberado 
                      ? 'bg-purple-100' 
                      : 'bg-gray-100'
                }`}>
                  {modulo.concluido ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : modulo.liberado ? (
                    <Play className="w-5 h-5 text-purple-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400 font-medium">Módulo {index + 1}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {modulo.duracao}
                    </span>
                  </div>
                  <h4 className={`font-semibold mb-1 ${modulo.liberado ? 'text-gray-900' : 'text-gray-500'}`}>
                    {modulo.titulo}
                  </h4>
                  <p className="text-sm text-gray-500">{modulo.descricao}</p>
                </div>

                {/* Ação */}
                {modulo.liberado && !modulo.concluido && (
                  <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                    Assistir
                  </button>
                )}
                {modulo.concluido && (
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                    Concluído
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm mb-4">
            Este conteúdo faz parte do seu processo de recuperação
          </p>
          <Link
            href="/chat?contexto=autoestima"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Heart className="w-5 h-5" />
            Conversar sobre autoestima com Coach IA
          </Link>
        </div>
      </div>
    </div>
  )
}
