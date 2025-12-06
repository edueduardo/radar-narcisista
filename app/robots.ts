import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
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
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/diario/',
          '/chat/',
          '/configuracoes/',
          '/relatorios/',
          '/plano-seguranca/',
          '/plano-fuga/',
          '/diario/timeline/',
          '/conquistas/',
          '/certificado/',
          '/gerar-pdf/',
          '/parceiro-apoio/',
          '/modo-recaida/',
          '/modo-espelho/',
          '/carta-futuro/',
          '/fotos-jornada/',
          '/termometro/',
          '/o-que-voce-diria/',
          '/biblioteca-respostas/',
          '/validacao-comunidade/',
          '/checklist-reconhecimento/',
          '/indicar/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
