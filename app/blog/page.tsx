'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Header from '../../components/Header'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  published_at: string
  read_time: number
  tags: string[]
  featured_image?: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadBlogPosts()
  }, [])

  const loadBlogPosts = async () => {
    try {
      // Simulação - depois virá do Supabase
      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: 'Aumento de 40% em Buscas por Ajuda: O Que Os Dados Revelam',
          excerpt: 'Análise completa das tendências de busca por ajuda em situações de violência doméstica no Brasil, baseada em dados reais e anonimizados.',
          content: 'Conteúdo completo do artigo...',
          category: 'estatisticas',
          author: 'IA Radar Narcisista',
          published_at: '2024-11-20',
          read_time: 8,
          tags: ['violência doméstica', 'estatísticas', 'políticas públicas'],
          featured_image: '/images/blog/estatisticas-violencia.jpg'
        },
        {
          id: '2',
          title: 'Padrões de Gaslighting: Como Identificar e Proteger-se',
          excerpt: 'Guia completo sobre manipulação psicológica, com sinais alertantes e estratégias de proteção baseadas em casos reais.',
          content: 'Conteúdo completo do artigo...',
          category: 'ajuda',
          author: 'IA Radar Narcisista',
          published_at: '2024-11-18',
          read_time: 12,
          tags: ['gaslighting', 'manipulação', 'saúde mental'],
          featured_image: '/images/blog/gaslighting-protecao.jpg'
        },
        {
          id: '3',
          title: 'O Impacto da Violência Psicológica na Saúde Mental',
          excerpt: 'Estudo aprofundado sobre consequências da violência psicológica, com dados de 5 estados brasileiros e recomendações especializadas.',
          content: 'Conteúdo completo do artigo...',
          category: 'pesquisa',
          author: 'IA Radar Narcisista',
          published_at: '2024-11-15',
          read_time: 15,
          tags: ['saúde mental', 'pesquisa', 'violência psicológica'],
          featured_image: '/images/blog/saude-mental-impacto.jpg'
        },
        {
          id: '4',
          title: 'Como Fazer uma Denúncia: Passo a Passo Completo',
          excerpt: 'Guia prático e seguro para fazer denúncias, com contatos úteis, direitos garantidos e proteção legal em todas as etapas.',
          content: 'Conteúdo completo do artigo...',
          category: 'direitos',
          author: 'IA Radar Narcisista',
          published_at: '2024-11-12',
          read_time: 10,
          tags: ['denúncia', 'direitos', 'segurança'],
          featured_image: '/images/blog/denuncia-passos.jpg'
        }
      ]
      
      setPosts(mockPosts)
    } catch (error) {
      console.error('Erro ao carregar posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'todos', name: 'Todos', color: 'bg-gray-500' },
    { id: 'estatisticas', name: 'Estatísticas', color: 'bg-blue-500' },
    { id: 'ajuda', name: 'Ajuda', color: 'bg-green-500' },
    { id: 'pesquisa', name: 'Pesquisa', color: 'bg-purple-500' },
    { id: 'direitos', name: 'Direitos', color: 'bg-red-500' }
  ]

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'todos' || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando artigos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header do Blog */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">📝 Blog Radar Narcisista</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Conteúdo baseado em dados reais para ajudar, educar e transformar vidas. 
              Artigos gerados por IA com insights de milhares de histórias anônimas.
            </p>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Buscar artigos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Categorias */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    selectedCategory === category.id
                      ? `${category.color} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Posts */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <article key={post.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow">
              {/* Imagem Destaque */}
              <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 rounded-t-lg flex items-center justify-center">
                <span className="text-4xl">📊</span>
              </div>

              {/* Conteúdo */}
              <div className="p-6">
                {/* Categoria e Data */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                    categories.find(c => c.id === post.category)?.color || 'bg-gray-500'
                  }`}>
                    {categories.find(c => c.id === post.category)?.name || post.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(post.published_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {/* Título */}
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Metadados */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Por {post.author}</span>
                  <span>{post.read_time} min de leitura</span>
                </div>

                {/* Botão Ler Mais */}
                <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Ler Artigo Completo
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Estado Vazio */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum artigo encontrado
            </h3>
            <p className="text-gray-600">
              Tente ajustar os filtros ou o termo de busca.
            </p>
          </div>
        )}
      </div>

      {/* Newsletter */}
      <div className="bg-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">📧 Receba Nossos Artigos</h2>
            <p className="text-purple-100 mb-6">
              Contenido exclusivo baseado em dados reais diretamente no seu e-mail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu melhor e-mail..."
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <button className="px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Inscrever-se
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
