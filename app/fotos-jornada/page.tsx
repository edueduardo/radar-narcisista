'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Camera, Image, Upload, Trash2, Calendar,
  Heart, Sparkles, Lock, Eye, EyeOff, Plus, X
} from 'lucide-react'

type FaseType = 'antes' | 'durante' | 'agora'

interface Foto {
  id: string
  url: string
  fase: FaseType
  data: string
  descricao: string
}

export default function FotosJornadaPage() {
  const [fotos, setFotos] = useState<Foto[]>([
    {
      id: '1',
      url: '/placeholder-antes.jpg',
      fase: 'antes',
      data: '2024-01-15',
      descricao: 'Antes do relacionamento - feliz e confiante'
    },
    {
      id: '2',
      url: '/placeholder-durante.jpg',
      fase: 'durante',
      data: '2024-08-20',
      descricao: 'Durante - cansada e triste'
    },
    {
      id: '3',
      url: '/placeholder-agora.jpg',
      fase: 'agora',
      data: '2025-11-24',
      descricao: 'Agora - em recuperação'
    }
  ])
  const [faseAtiva, setFaseAtiva] = useState<'todas' | 'antes' | 'durante' | 'agora'>('todas')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [novaFoto, setNovaFoto] = useState<{ fase: FaseType, descricao: string }>({ fase: 'agora', descricao: '' })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fases = {
    antes: { 
      label: 'Antes', 
      emoji: '😊', 
      cor: 'bg-green-100 dark:bg-green-900/30 text-green-600',
      descricao: 'Antes do relacionamento'
    },
    durante: { 
      label: 'Durante', 
      emoji: '😔', 
      cor: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
      descricao: 'Durante o relacionamento'
    },
    agora: { 
      label: 'Agora', 
      emoji: '🌟', 
      cor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
      descricao: 'Em recuperação'
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const adicionarFoto = () => {
    if (!previewUrl) return

    const nova: Foto = {
      id: Date.now().toString(),
      url: previewUrl,
      fase: novaFoto.fase,
      data: new Date().toISOString().split('T')[0],
      descricao: novaFoto.descricao
    }

    setFotos([...fotos, nova])
    setMostrarModal(false)
    setPreviewUrl(null)
    setNovaFoto({ fase: 'agora', descricao: '' })
  }

  const removerFoto = (id: string) => {
    setFotos(fotos.filter(f => f.id !== id))
  }

  const fotosFiltradas = faseAtiva === 'todas' 
    ? fotos 
    : fotos.filter(f => f.fase === faseAtiva)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-purple-950 pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 hover:bg-white/50 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Camera className="h-6 w-6 text-purple-500" />
              Fotos da Jornada
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Seu antes, durante e depois</p>
          </div>
        </div>

        {/* Mensagem Inspiradora */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Olhe para essas fotos</h2>
              <p className="text-white/90">
                "Essa pessoa merece paz. Essa pessoa merece amor. Essa pessoa é você."
              </p>
            </div>
          </div>
        </div>

        {/* Aviso de Privacidade */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Lock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">Suas fotos são privadas</p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Armazenadas apenas no seu dispositivo. Ninguém mais tem acesso.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFaseAtiva('todas')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              faseAtiva === 'todas'
                ? 'bg-purple-500 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Todas ({fotos.length})
          </button>
          {(Object.keys(fases) as Array<keyof typeof fases>).map((fase) => (
            <button
              key={fase}
              onClick={() => setFaseAtiva(fase)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                faseAtiva === fase
                  ? 'bg-purple-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{fases[fase].emoji}</span>
              {fases[fase].label} ({fotos.filter(f => f.fase === fase).length})
            </button>
          ))}
        </div>

        {/* Grid de Fotos */}
        {fotosFiltradas.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center">
            <Image className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">Nenhuma foto ainda</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
              Adicione fotos para visualizar sua transformação
            </p>
            <button
              onClick={() => setMostrarModal(true)}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Adicionar Primeira Foto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fotosFiltradas.map((foto) => (
              <div key={foto.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm group">
                <div className="aspect-square bg-gray-100 dark:bg-slate-700 relative">
                  {/* Placeholder visual */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-6xl">{fases[foto.fase].emoji}</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{fases[foto.fase].descricao}</p>
                    </div>
                  </div>
                  
                  {/* Overlay com ações */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                      <Eye className="h-5 w-5 text-white" />
                    </button>
                    <button 
                      onClick={() => removerFoto(foto.id)}
                      className="p-2 bg-red-500/80 rounded-full hover:bg-red-500"
                    >
                      <Trash2 className="h-5 w-5 text-white" />
                    </button>
                  </div>

                  {/* Badge da fase */}
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${fases[foto.fase].cor}`}>
                    {fases[foto.fase].emoji} {fases[foto.fase].label}
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{foto.descricao}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(foto.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}

            {/* Botão Adicionar */}
            <button
              onClick={() => setMostrarModal(true)}
              className="aspect-square bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-600 flex flex-col items-center justify-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <Plus className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Adicionar Foto</span>
            </button>
          </div>
        )}

        {/* Comparação Visual */}
        {fotos.filter(f => f.fase === 'antes').length > 0 && fotos.filter(f => f.fase === 'agora').length > 0 && (
          <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Sua Transformação
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="aspect-square bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center mb-2">
                  <span className="text-4xl">😊</span>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Antes</p>
              </div>
              <div className="text-center">
                <div className="aspect-square bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-2">
                  <span className="text-4xl">🌟</span>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Agora</p>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              Você está no caminho certo. Continue! 💜
            </p>
          </div>
        )}

        {/* Modal Adicionar Foto */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Adicionar Foto
                </h3>
                <button onClick={() => setMostrarModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Upload */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video bg-gray-100 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors mb-4"
              >
                {previewUrl ? (
                  <div className="text-center">
                    <span className="text-4xl">📷</span>
                    <p className="text-sm text-gray-500 mt-2">Foto selecionada</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Clique para selecionar</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Fase */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fase</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(fases) as Array<keyof typeof fases>).map((fase) => (
                    <button
                      key={fase}
                      onClick={() => setNovaFoto({ ...novaFoto, fase })}
                      className={`p-3 rounded-xl text-center transition-colors ${
                        novaFoto.fase === fase
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-xl">{fases[fase].emoji}</span>
                      <p className="text-xs mt-1">{fases[fase].label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Descrição */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <textarea
                  value={novaFoto.descricao}
                  onChange={(e) => setNovaFoto({ ...novaFoto, descricao: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 resize-none"
                  rows={2}
                  placeholder="Como você se sentia nesse momento?"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 py-2 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={adicionarFoto}
                  disabled={!previewUrl}
                  className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
