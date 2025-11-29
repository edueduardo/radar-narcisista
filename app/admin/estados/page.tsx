'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { MapPin, Users, TrendingUp, TrendingDown, Search, RefreshCw } from 'lucide-react'

interface EstadoStats {
  uf: string
  nome: string
  usuarios: number
  testes: number
  diarios: number
  crescimento: number
}

const ESTADOS_DATA: EstadoStats[] = [
  { uf: 'SP', nome: 'São Paulo', usuarios: 2345, testes: 4521, diarios: 8934, crescimento: 12.5 },
  { uf: 'RJ', nome: 'Rio de Janeiro', usuarios: 1234, testes: 2345, diarios: 4567, crescimento: 8.3 },
  { uf: 'MG', nome: 'Minas Gerais', usuarios: 987, testes: 1876, diarios: 3456, crescimento: 15.2 },
  { uf: 'RS', nome: 'Rio Grande do Sul', usuarios: 765, testes: 1432, diarios: 2876, crescimento: 6.7 },
  { uf: 'PR', nome: 'Paraná', usuarios: 654, testes: 1234, diarios: 2345, crescimento: 9.1 },
  { uf: 'BA', nome: 'Bahia', usuarios: 543, testes: 1098, diarios: 2134, crescimento: 11.4 },
  { uf: 'SC', nome: 'Santa Catarina', usuarios: 432, testes: 876, diarios: 1654, crescimento: 7.8 },
  { uf: 'PE', nome: 'Pernambuco', usuarios: 321, testes: 654, diarios: 1234, crescimento: -2.3 },
  { uf: 'CE', nome: 'Ceará', usuarios: 298, testes: 587, diarios: 1098, crescimento: 4.5 },
  { uf: 'GO', nome: 'Goiás', usuarios: 276, testes: 543, diarios: 987, crescimento: 13.2 },
  { uf: 'DF', nome: 'Distrito Federal', usuarios: 234, testes: 456, diarios: 876, crescimento: 18.9 },
  { uf: 'ES', nome: 'Espírito Santo', usuarios: 198, testes: 387, diarios: 765, crescimento: 5.6 },
]

export default function EstadosPage() {
  const [estados, setEstados] = useState<EstadoStats[]>(ESTADOS_DATA)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'usuarios' | 'testes' | 'crescimento'>('usuarios')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredEstados = estados
    .filter(e => e.nome.toLowerCase().includes(search.toLowerCase()) || e.uf.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b[sortBy] - a[sortBy])

  const totalUsuarios = estados.reduce((acc, e) => acc + e.usuarios, 0)
  const totalTestes = estados.reduce((acc, e) => acc + e.testes, 0)
  const totalDiarios = estados.reduce((acc, e) => acc + e.diarios, 0)
  const mediaCresc = estados.reduce((acc, e) => acc + e.crescimento, 0) / estados.length

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsRefreshing(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8 ml-52">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <MapPin className="w-8 h-8 text-blue-500" />
                Estatísticas por Estado
              </h1>
              <p className="text-gray-400 mt-1">
                Visualize métricas de uso por região do Brasil
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg flex items-center gap-2 hover:bg-gray-600 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>

          {/* Stats Gerais */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4">
              <p className="text-3xl font-bold text-white">{totalUsuarios.toLocaleString()}</p>
              <p className="text-sm text-blue-200">Usuários Total</p>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-4">
              <p className="text-3xl font-bold text-white">{totalTestes.toLocaleString()}</p>
              <p className="text-sm text-purple-200">Testes Realizados</p>
            </div>
            <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl p-4">
              <p className="text-3xl font-bold text-white">{totalDiarios.toLocaleString()}</p>
              <p className="text-sm text-pink-200">Entradas no Diário</p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4">
              <p className="text-3xl font-bold text-white">{mediaCresc.toFixed(1)}%</p>
              <p className="text-sm text-green-200">Crescimento Médio</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar estado..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="usuarios">Ordenar por Usuários</option>
              <option value="testes">Ordenar por Testes</option>
              <option value="crescimento">Ordenar por Crescimento</option>
            </select>
          </div>

          {/* Tabela */}
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Estado</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Usuários</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Testes</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Diários</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Crescimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredEstados.map((estado, index) => (
                  <tr key={estado.uf} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-600/20 text-blue-400 rounded-lg font-bold text-sm">
                          {estado.uf}
                        </span>
                        <span className="text-white">{estado.nome}</span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                            🏆 Top 1
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-white">{estado.usuarios.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">{estado.testes.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{estado.diarios.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`flex items-center justify-end gap-1 ${estado.crescimento >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {estado.crescimento >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {estado.crescimento >= 0 ? '+' : ''}{estado.crescimento}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mapa Visual (placeholder) */}
          <div className="mt-8 bg-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              Mapa de Calor por Região
            </h2>
            <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Mapa interativo do Brasil (em desenvolvimento)</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
