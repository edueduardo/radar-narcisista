'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Thermometer, TrendingUp, Calendar, ChevronRight, Plus } from 'lucide-react'

// Dados simulados de histórico
const historicoSimulado = [
  { data: '17/11', clareza: 3, episodios: 4, limites: false },
  { data: '24/11', clareza: 4, episodios: 3, limites: true },
  { data: '01/12', clareza: 5, episodios: 2, limites: true },
  { data: '08/12', clareza: 6, episodios: 2, limites: true },
  { data: '15/12', clareza: 7, episodios: 1, limites: true },
]

export default function TermometroPage() {
  const [clareza, setClareza] = useState(5)
  const [episodios, setEpisodios] = useState(2)
  const [limites, setLimites] = useState<boolean | null>(null)
  const [registrado, setRegistrado] = useState(false)

  const getClarezaColor = (valor: number) => {
    if (valor <= 3) return 'text-red-500'
    if (valor <= 5) return 'text-yellow-500'
    if (valor <= 7) return 'text-blue-500'
    return 'text-green-500'
  }

  const getClarezaLabel = (valor: number) => {
    if (valor <= 2) return 'Muito confusa(o)'
    if (valor <= 4) return 'Confusa(o)'
    if (valor <= 6) return 'Ganhando clareza'
    if (valor <= 8) return 'Clara(o)'
    return 'Muito clara(o)'
  }

  const handleRegistrar = () => {
    if (limites !== null) {
      setRegistrado(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Link>
        </div>

        {/* Título */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Thermometer className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Termômetro de Clareza
          </h1>
          <p className="text-lg text-gray-600">
            Acompanhe sua evolução semana a semana
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Registro Semanal */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Check-in Semanal</h2>
            </div>

            {!registrado ? (
              <div className="space-y-8">
                {/* Clareza */}
                <div>
                  <label className="block text-gray-700 font-medium mb-3">
                    Como você se sentiu essa semana? (1-10)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={clareza}
                      onChange={(e) => setClareza(Number(e.target.value))}
                      className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className={`text-3xl font-bold ${getClarezaColor(clareza)}`}>
                      {clareza}
                    </span>
                  </div>
                  <p className={`text-sm mt-2 ${getClarezaColor(clareza)}`}>
                    {getClarezaLabel(clareza)}
                  </p>
                </div>

                {/* Episódios */}
                <div>
                  <label className="block text-gray-700 font-medium mb-3">
                    Quantos episódios difíceis aconteceram?
                  </label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, '5+'].map((num) => (
                      <button
                        key={num}
                        onClick={() => setEpisodios(typeof num === 'number' ? num : 5)}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                          episodios === (typeof num === 'number' ? num : 5)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Limites */}
                <div>
                  <label className="block text-gray-700 font-medium mb-3">
                    Você conseguiu manter seus limites?
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setLimites(true)}
                      className={`flex-1 py-4 rounded-xl font-semibold transition-colors ${
                        limites === true
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ✓ Sim, consegui
                    </button>
                    <button
                      onClick={() => setLimites(false)}
                      className={`flex-1 py-4 rounded-xl font-semibold transition-colors ${
                        limites === false
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ✗ Não consegui
                    </button>
                  </div>
                </div>

                {/* Botão Registrar */}
                <button
                  onClick={handleRegistrar}
                  disabled={limites === null}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Registrar Semana
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✓</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Registrado!</h3>
                <p className="text-gray-600 mb-6">
                  Seu check-in dessa semana foi salvo. Volte no próximo domingo!
                </p>
                <button
                  onClick={() => setRegistrado(false)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Editar registro
                </button>
              </div>
            )}
          </div>

          {/* Histórico e Gráfico */}
          <div className="space-y-6">
            {/* Gráfico Visual */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Sua Evolução</h2>
              </div>

              {/* Gráfico de barras simples */}
              <div className="flex items-end justify-between h-48 gap-2 mb-4">
                {historicoSimulado.map((semana, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        semana.clareza <= 3 ? 'bg-red-400' :
                        semana.clareza <= 5 ? 'bg-yellow-400' :
                        semana.clareza <= 7 ? 'bg-blue-400' : 'bg-green-400'
                      }`}
                      style={{ height: `${semana.clareza * 10}%` }}
                    />
                    <span className="text-xs text-gray-500 mt-2">{semana.data}</span>
                  </div>
                ))}
              </div>

              {/* Legenda */}
              <div className="flex justify-center gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded" /> 1-3</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded" /> 4-5</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded" /> 6-7</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded" /> 8-10</span>
              </div>
            </div>

            {/* Resumo */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl p-6 text-white">
              <h3 className="font-bold text-lg mb-3">📈 Seu Progresso</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold">+4</p>
                  <p className="text-sm text-green-100">pontos de clareza</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">-3</p>
                  <p className="text-sm text-green-100">episódios/semana</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">80%</p>
                  <p className="text-sm text-green-100">limites mantidos</p>
                </div>
              </div>
            </div>

            {/* Histórico detalhado */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Histórico</h3>
              <div className="space-y-3">
                {historicoSimulado.slice().reverse().map((semana, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">{semana.data}</span>
                    <div className="flex items-center gap-4">
                      <span className={`font-bold ${getClarezaColor(semana.clareza)}`}>
                        {semana.clareza}/10
                      </span>
                      <span className="text-sm text-gray-500">{semana.episodios} ep.</span>
                      <span className={semana.limites ? 'text-green-500' : 'text-orange-500'}>
                        {semana.limites ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem motivacional */}
        <div className="text-center mt-10 bg-white rounded-2xl p-6 shadow-lg">
          <p className="text-gray-700">
            <strong>Você está no caminho certo.</strong> Mesmo nos dias difíceis, 
            o fato de você estar aqui monitorando sua jornada já é uma vitória. 💪
          </p>
        </div>
      </div>
    </div>
  )
}
