import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://radarnarcisista.com.br'
  
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
          '/linha-tempo/',
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
