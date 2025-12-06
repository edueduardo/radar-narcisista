import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Lista de emails admin - MESMA do login
const ADMIN_EMAILS = ['etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com', 'demo.admin@radar.test']

export async function middleware(request: NextRequest) {
  // Criar response base
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Ignorar rotas de API e assets
  const pathname = request.nextUrl.pathname
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') // arquivos estáticos
  ) {
    return supabaseResponse
  }

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Proteger rotas de admin - apenas verificar se está logado
  // A verificação de role é feita na página /admin/page.tsx
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      console.log('[MIDDLEWARE] Admin sem user, redirecionando para login')
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    // Deixa passar - a página faz a verificação de admin
    console.log('[MIDDLEWARE] ✅ Usuário logado, deixando página verificar admin:', user.email)
  }

  // Adicionar headers de segurança
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Cache control para assets estáticos
  if (request.nextUrl.pathname.includes('_next/static') || 
      request.nextUrl.pathname.includes('favicon.ico')) {
    supabaseResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
  
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
