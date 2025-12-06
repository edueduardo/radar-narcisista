import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Prioridade: APP_URL > VERCEL_URL > domínio padrão
  const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
      return process.env.NEXT_PUBLIC_APP_URL
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }
    return 'https://radarnarcisista.com.br'
  }
  const baseUrl = getBaseUrl()
  
  // Paginas publicas principais (alinhadas com footer)
  const publicPages = [
    '', // Home
    '/login',
    '/cadastro',
    // Produto
    '/teste-clareza', // Teste principal
    '/planos',
    '/status',
    // Entenda - Clusters SEO
    '/blog',
    '/educacao',
    '/estatisticas/publicas',
    '/faq',
    '/gaslighting',
    '/triangulacao',
    '/love-bombing',
    '/ciclo-abuso',
    // Seguranca
    '/privacidade',
    '/termos',
    '/seguranca',
    '/seguranca-digital',
    // Ajuda
    '/contato',
    // Profissionais
    '/profissionais',
    '/pesquisa/academica',
    // Outros
    '/depoimentos',
  ]

  // Páginas de blog (em produção, buscar do banco de dados)
  const blogPosts = [
    '/blog/o-que-e-narcisismo',
    '/blog/sinais-de-abuso',
    '/blog/como-sair-de-relacionamento-toxico',
    '/blog/gaslighting-o-que-e',
    '/blog/trauma-bond-explicado',
  ]

  const allPages = [...publicPages, ...blogPosts]

  return allPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : route.startsWith('/blog') ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/teste-clareza' ? 0.9 : 0.7,
  }))
}
