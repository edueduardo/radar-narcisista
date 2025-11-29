'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Copy, Check, Search, MessageSquare, Shield } from 'lucide-react'

// =============================================================================
// MAPEAMENTO DE TEMAS PARA CATEGORIAS
// Quando vem de /hub/[problema] com ?tema=invalidacao, filtra automaticamente
// =============================================================================
const TEMA_PARA_CATEGORIA: Record<string, string> = {
  'invalidacao': 'Invalidação',
  'gaslighting': 'Gaslighting',
  'manipulacao': 'Manipulação',
  'ameacas': 'Ameaças',
  'isolamento': 'Isolamento',
  'culpabilizacao': 'Culpabilização',
  'criminalizacao': 'Ameaças', // Mapeia para categoria mais próxima
  'respostas-invalidacao': 'Invalidação',
  'sinais-gaslighting': 'Gaslighting',
  'documentar-gaslighting': 'Gaslighting',
  'ciclo-abuso': 'Manipulação',
  'sair-ciclo': 'Manipulação',
  'sinais-perigo': 'Ameaças',
  'plano-fuga': 'Ameaças',
  'recursos-emergencia': 'Ameaças',
  'reconectar-rede': 'Isolamento',
  'controle-ciumes': 'Isolamento',
}

const respostas = [
  {
    categoria: 'Invalidação',
    cor: 'red',
    frases: [
      {
        eles: '"Você está exagerando"',
        voce: 'Meus sentimentos são válidos, mesmo que você não concorde com eles.',
        alternativa: 'Eu sei o que sinto. Não preciso da sua validação.'
      },
      {
        eles: '"Você é muito sensível"',
        voce: 'Sensibilidade não é defeito. É como eu processo o mundo.',
        alternativa: 'Prefiro ser sensível do que insensível.'
      },
      {
        eles: '"Isso não é nada demais"',
        voce: 'Para mim é importante, e isso deveria ser suficiente.',
        alternativa: 'Você não decide o que é importante para mim.'
      },
    ]
  },
  {
    categoria: 'Gaslighting',
    cor: 'yellow',
    frases: [
      {
        eles: '"Isso nunca aconteceu"',
        voce: 'Eu me lembro claramente. Minha memória é confiável.',
        alternativa: 'Eu sei o que vi e ouvi.'
      },
      {
        eles: '"Você está inventando coisas"',
        voce: 'Eu confio na minha percepção da realidade.',
        alternativa: 'Não vou duvidar de mim mesma(o).'
      },
      {
        eles: '"Você está louca(o)"',
        voce: 'Questionar minha sanidade não muda os fatos.',
        alternativa: 'Chamar de louca(o) é uma tática, não um diagnóstico.'
      },
    ]
  },
  {
    categoria: 'Culpabilização',
    cor: 'orange',
    frases: [
      {
        eles: '"A culpa é sua"',
        voce: 'Cada um é responsável pelas próprias ações.',
        alternativa: 'Você é responsável pelo que você faz, não eu.'
      },
      {
        eles: '"Você me fez fazer isso"',
        voce: 'Ninguém te obrigou. Você escolheu agir assim.',
        alternativa: 'Suas ações são suas escolhas.'
      },
      {
        eles: '"Se você não tivesse..."',
        voce: 'Isso não justifica seu comportamento.',
        alternativa: 'Não vou aceitar a culpa pelo que você fez.'
      },
    ]
  },
  {
    categoria: 'Manipulação',
    cor: 'purple',
    frases: [
      {
        eles: '"Se você me amasse, faria isso"',
        voce: 'Amor não é chantagem. Posso amar e ainda ter limites.',
        alternativa: 'Amor de verdade respeita o "não".'
      },
      {
        eles: '"Ninguém vai te querer"',
        voce: 'Isso é uma opinião sua, não um fato.',
        alternativa: 'Prefiro ficar sozinha(o) do que mal acompanhada(o).'
      },
      {
        eles: '"Sem mim você não é nada"',
        voce: 'Eu existia antes de você e vou existir depois.',
        alternativa: 'Meu valor não depende de você.'
      },
    ]
  },
  {
    categoria: 'Ameaças',
    cor: 'red',
    frases: [
      {
        eles: '"Se você sair, eu..."',
        voce: 'Ameaças não vão me fazer ficar.',
        alternativa: 'Isso é manipulação, não amor.'
      },
      {
        eles: '"Vou contar para todo mundo"',
        voce: 'Faça o que quiser. Não tenho medo de você.',
        alternativa: 'Não vou ser refém de ameaças.'
      },
      {
        eles: '"Você vai se arrepender"',
        voce: 'Vou me arrepender mais se ficar.',
        alternativa: 'Prefiro arriscar do que continuar assim.'
      },
    ]
  },
  {
    categoria: 'Isolamento',
    cor: 'blue',
    frases: [
      {
        eles: '"Sua família não te ama de verdade"',
        voce: 'Você não decide quem me ama.',
        alternativa: 'Não vou me afastar de quem se importa comigo.'
      },
      {
        eles: '"Seus amigos são má influência"',
        voce: 'Eu escolho minhas amizades.',
        alternativa: 'Você não controla meus relacionamentos.'
      },
      {
        eles: '"Só eu te entendo"',
        voce: 'Muitas pessoas me entendem e me apoiam.',
        alternativa: 'Isso é isolamento, não conexão especial.'
      },
    ]
  },
]

function BibliotecaRespostasContent() {
  const searchParams = useSearchParams()
  const temaParam = searchParams.get('tema')
  
  const [busca, setBusca] = useState('')
  const [copiado, setCopiado] = useState<string | null>(null)
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)

  // Aplicar filtro de categoria baseado no query param ?tema=
  useEffect(() => {
    if (temaParam && TEMA_PARA_CATEGORIA[temaParam]) {
      setCategoriaAtiva(TEMA_PARA_CATEGORIA[temaParam])
    }
  }, [temaParam])

  const copiar = (texto: string) => {
    navigator.clipboard.writeText(texto)
    setCopiado(texto)
    setTimeout(() => setCopiado(null), 2000)
  }

  const respostasFiltradas = respostas.filter(cat => 
    !categoriaAtiva || cat.categoria === categoriaAtiva
  ).map(cat => ({
    ...cat,
    frases: cat.frases.filter(f => 
      !busca || 
      f.eles.toLowerCase().includes(busca.toLowerCase()) ||
      f.voce.toLowerCase().includes(busca.toLowerCase())
    )
  })).filter(cat => cat.frases.length > 0)

  const getCorClasse = (cor: string) => {
    const cores: Record<string, string> = {
      red: 'bg-red-100 text-red-700 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
    }
    return cores[cor] || cores.purple
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Link>
        </div>

        {/* Título */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Biblioteca de Respostas
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Frases prontas para quando você não souber o que dizer. 
            Copie e use quando precisar se defender.
          </p>
        </div>

        {/* Busca e Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar frase..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Filtros de categoria */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoriaAtiva(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !categoriaAtiva ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              {respostas.map(cat => (
                <button
                  key={cat.categoria}
                  onClick={() => setCategoriaAtiva(cat.categoria)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    categoriaAtiva === cat.categoria ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.categoria}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Respostas */}
        <div className="space-y-8">
          {respostasFiltradas.map((categoria, catIdx) => (
            <div key={catIdx}>
              <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                categoria.cor === 'red' ? 'text-red-600' :
                categoria.cor === 'yellow' ? 'text-yellow-600' :
                categoria.cor === 'orange' ? 'text-orange-600' :
                categoria.cor === 'purple' ? 'text-purple-600' : 'text-blue-600'
              }`}>
                <Shield className="w-5 h-5" />
                {categoria.categoria}
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {categoria.frases.map((frase, fraseIdx) => (
                  <div key={fraseIdx} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* O que eles dizem */}
                    <div className={`p-4 ${getCorClasse(categoria.cor)} border-b`}>
                      <p className="text-xs font-semibold mb-1 opacity-70">QUANDO DIZEM:</p>
                      <p className="font-medium">{frase.eles}</p>
                    </div>

                    {/* O que você pode responder */}
                    <div className="p-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2">VOCÊ PODE RESPONDER:</p>
                      
                      {/* Resposta principal */}
                      <div className="flex items-start justify-between gap-2 mb-3 p-3 bg-green-50 rounded-xl">
                        <p className="text-gray-800 font-medium">{frase.voce}</p>
                        <button
                          onClick={() => copiar(frase.voce)}
                          className="flex-shrink-0 p-2 hover:bg-green-100 rounded-lg transition-colors"
                          title="Copiar"
                        >
                          {copiado === frase.voce ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* Alternativa */}
                      <div className="flex items-start justify-between gap-2 p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Alternativa:</p>
                          <p className="text-gray-700 text-sm">{frase.alternativa}</p>
                        </div>
                        <button
                          onClick={() => copiar(frase.alternativa)}
                          className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Copiar"
                        >
                          {copiado === frase.alternativa ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Dica */}
        <div className="mt-10 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
          <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Dica Importante
          </h3>
          <p className="text-yellow-700">
            Você <strong>não precisa</strong> responder a tudo. Às vezes, o silêncio é a melhor resposta. 
            Você não tem obrigação de se explicar ou se defender o tempo todo. 
            <strong> Sair da conversa também é uma opção válida.</strong>
          </p>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            Praticar com Coach IA
          </Link>
        </div>
      </div>
    </div>
  )
}

// Wrapper com Suspense para useSearchParams
export default function BibliotecaRespostasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Carregando biblioteca...</p>
        </div>
      </div>
    }>
      <BibliotecaRespostasContent />
    </Suspense>
  )
}
