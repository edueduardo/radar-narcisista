'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckSquare, Square, AlertTriangle, TrendingUp, Heart, Share2 } from 'lucide-react'

interface ItemChecklist {
  id: string
  frase: string
  categoria: 'gaslighting' | 'controle' | 'ciclo' | 'isolamento'
}

const itensChecklist: ItemChecklist[] = [
  // Gaslighting
  { id: '1', frase: '"Você está inventando isso"', categoria: 'gaslighting' },
  { id: '2', frase: '"Isso nunca aconteceu"', categoria: 'gaslighting' },
  { id: '3', frase: '"Você é sensível demais"', categoria: 'gaslighting' },
  { id: '4', frase: '"Você está louca/louco"', categoria: 'gaslighting' },
  { id: '5', frase: '"Ninguém mais pensa assim"', categoria: 'gaslighting' },
  { id: '6', frase: '"Você está exagerando"', categoria: 'gaslighting' },
  
  // Controle
  { id: '7', frase: '"Com quem você estava falando?"', categoria: 'controle' },
  { id: '8', frase: '"Me mostra seu celular"', categoria: 'controle' },
  { id: '9', frase: '"Você não precisa trabalhar/estudar"', categoria: 'controle' },
  { id: '10', frase: '"Eu cuido do dinheiro"', categoria: 'controle' },
  { id: '11', frase: '"Você não sabe se vestir"', categoria: 'controle' },
  { id: '12', frase: '"Precisa pedir minha permissão"', categoria: 'controle' },
  
  // Ciclo de abuso
  { id: '13', frase: '"Desculpa, eu te amo, vai mudar"', categoria: 'ciclo' },
  { id: '14', frase: '"Você me faz agir assim"', categoria: 'ciclo' },
  { id: '15', frase: '"Se você não tivesse feito X..."', categoria: 'ciclo' },
  { id: '16', frase: '"Nunca mais vai acontecer"', categoria: 'ciclo' },
  { id: '17', frase: '"Eu só agi assim porque te amo"', categoria: 'ciclo' },
  { id: '18', frase: '"Você me provoca"', categoria: 'ciclo' },
  
  // Isolamento
  { id: '19', frase: '"Sua família não gosta de mim"', categoria: 'isolamento' },
  { id: '20', frase: '"Seus amigos são má influência"', categoria: 'isolamento' },
  { id: '21', frase: '"Você não precisa de ninguém além de mim"', categoria: 'isolamento' },
  { id: '22', frase: '"Eles querem nos separar"', categoria: 'isolamento' },
  { id: '23', frase: '"Você tem que escolher: eu ou eles"', categoria: 'isolamento' },
  { id: '24', frase: '"Ninguém te entende como eu"', categoria: 'isolamento' },
]

const categorias = {
  gaslighting: { 
    label: 'Gaslighting', 
    emoji: '🔮', 
    cor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    descricao: 'Fazer você duvidar da sua realidade'
  },
  controle: { 
    label: 'Controle', 
    emoji: '🎮', 
    cor: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    descricao: 'Dominar suas decisões e liberdade'
  },
  ciclo: { 
    label: 'Ciclo de Abuso', 
    emoji: '🔄', 
    cor: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    descricao: 'Padrão de tensão, explosão e desculpas'
  },
  isolamento: { 
    label: 'Isolamento', 
    emoji: '🚫', 
    cor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    descricao: 'Afastar você de quem te apoia'
  }
}

export default function ChecklistReconhecimentoPage() {
  const [marcados, setMarcados] = useState<string[]>([])
  const [mostrarResultado, setMostrarResultado] = useState(false)

  const toggleItem = (id: string) => {
    setMarcados(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const contarPorCategoria = (categoria: string) => {
    return marcados.filter(id => 
      itensChecklist.find(item => item.id === id)?.categoria === categoria
    ).length
  }

  const totalPorCategoria = (categoria: string) => {
    return itensChecklist.filter(item => item.categoria === categoria).length
  }

  const porcentagemTotal = Math.round((marcados.length / itensChecklist.length) * 100)

  const getNivelAlerta = () => {
    if (porcentagemTotal >= 50) return { nivel: 'alto', cor: 'text-red-500', emoji: '🔴' }
    if (porcentagemTotal >= 25) return { nivel: 'medio', cor: 'text-orange-500', emoji: '🟡' }
    return { nivel: 'baixo', cor: 'text-green-500', emoji: '🟢' }
  }

  const alerta = getNivelAlerta()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-purple-950 pt-20 pb-10">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 hover:bg-white/50 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-purple-500" />
              Checklist de Reconhecimento
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Marque as frases que você já ouviu</p>
          </div>
        </div>

        {/* Explicação */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm mb-6">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Este checklist contém frases comuns em relacionamentos abusivos. 
            Marque as que você reconhece ter ouvido. Isso pode ajudar a identificar padrões.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            ⚠️ Este checklist não é diagnóstico. É apenas uma ferramenta de reflexão.
          </p>
        </div>

        {/* Progresso */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {marcados.length} de {itensChecklist.length} marcados
            </span>
            <span className={`text-sm font-medium ${alerta.cor}`}>
              {alerta.emoji} {porcentagemTotal}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                porcentagemTotal >= 50 ? 'bg-red-500' : 
                porcentagemTotal >= 25 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${porcentagemTotal}%` }}
            />
          </div>
        </div>

        {/* Checklist por Categoria */}
        {Object.entries(categorias).map(([key, value]) => (
          <div key={key} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>{value.emoji}</span>
                  {value.label}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{value.descricao}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${value.cor}`}>
                {contarPorCategoria(key)}/{totalPorCategoria(key)}
              </span>
            </div>
            
            <div className="space-y-2">
              {itensChecklist.filter(item => item.categoria === key).map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                    marcados.includes(item.id)
                      ? 'bg-purple-100 dark:bg-purple-900/30'
                      : 'bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600'
                  }`}
                >
                  {marcados.includes(item.id) ? (
                    <CheckSquare className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${
                    marcados.includes(item.id) 
                      ? 'text-purple-700 dark:text-purple-300 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {item.frase}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Botão Ver Resultado */}
        {marcados.length > 0 && !mostrarResultado && (
          <button
            onClick={() => setMostrarResultado(true)}
            className="w-full py-4 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
          >
            <TrendingUp className="h-5 w-5" />
            Ver Meu Resultado
          </button>
        )}

        {/* Resultado */}
        {mostrarResultado && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm mt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className={alerta.cor} />
              Seu Resultado
            </h2>

            {porcentagemTotal >= 50 ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                <p className="text-red-800 dark:text-red-200 font-medium mb-2">
                  🔴 Nível de Alerta Alto ({porcentagemTotal}%)
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Você marcou muitas frases. Isso pode indicar padrões preocupantes no seu relacionamento. 
                  Recomendamos fortemente que você converse com um profissional.
                </p>
              </div>
            ) : porcentagemTotal >= 25 ? (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-4">
                <p className="text-orange-800 dark:text-orange-200 font-medium mb-2">
                  🟡 Nível de Atenção ({porcentagemTotal}%)
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Algumas frases que você marcou merecem atenção. 
                  Considere fazer o Teste de Clareza para uma análise mais profunda.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4">
                <p className="text-green-800 dark:text-green-200 font-medium mb-2">
                  🟢 Poucos Sinais ({porcentagemTotal}%)
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Você marcou poucas frases. Isso é um bom sinal, mas continue atento(a) aos seus sentimentos.
                </p>
              </div>
            )}

            {/* Resumo por Categoria */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.entries(categorias).map(([key, value]) => {
                const count = contarPorCategoria(key)
                const total = totalPorCategoria(key)
                const percent = Math.round((count / total) * 100)
                return (
                  <div key={key} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{value.emoji}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{value.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{count}/{total}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <Link
                href="/teste-clareza"
                className="w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
              >
                Fazer Teste de Clareza Completo
              </Link>
              <Link
                href="/chat"
                className="w-full py-3 border border-purple-500 text-purple-500 rounded-xl font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Conversar com Coach
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
