import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Lista de emails admin - MESMA do login
const ADMIN_EMAILS = ['etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Atualiza a sessão se expirada
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Proteger rotas de admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Verificar se é admin pelo EMAIL (mesma lógica do login)
    const userEmail = session.user.email?.toLowerCase()
    const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail)
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Adicionar headers de segurança
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Cache control para assets estáticos
  if (req.nextUrl.pathname.includes('_next/static') || 
      req.nextUrl.pathname.includes('favicon.ico')) {
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
  
  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
