import { createServerComponentClient } from '@/lib/supabase/server-compat'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { redirect } from 'next/navigation'

const ADMIN_EMAILS = [
  'etailoffice@gmail.com',
  'eduardo.mkt.davila@gmail.com'
]

/**
 * Verifica se o usuário atual tem permissão de administrador
 * Deve ser usada em Server Components de rotas admin
 */
export async function requireAdmin() {
  const supabase = await createServerComponentClient()

  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    redirect('/login?redirect=/admin')
  }

  const userEmail = session.user.email?.toLowerCase()
  const isAdminEmail = userEmail && ADMIN_EMAILS.includes(userEmail)

  // Verificar role no perfil
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  const isAdminRole = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN'

  if (!isAdminEmail && !isAdminRole) {
    redirect('/dashboard?error=acesso_negado')
  }

  return {
    session,
    isAdminEmail,
    isAdminRole,
    user: session.user
  }
}

/**
 * Verifica se o usuário tem permissão de admin (sem redirecionar)
 * Retorna boolean para uso condicional
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createServerComponentClient()

    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user?.email) return false

    const userEmail = session.user.email.toLowerCase()
    const isAdminEmail = ADMIN_EMAILS.includes(userEmail)

    if (isAdminEmail) return true

    // Verificar role no perfil
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    const isAdminRole = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN'

    return isAdminRole || false
  } catch (error) {
    console.error('Erro ao verificar permissão de admin:', error)
    return false
  }
}

/**
 * Middleware helper para API routes
 * Aceita token via header Authorization OU via cookies de sessão
 */
export async function requireAdminAPI(request: Request) {
  try {
    let user = null
    
    // Tentar extrair token do header Authorization
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data, error } = await supabaseAdmin.auth.getUser(token)
      if (!error && data.user) {
        user = data.user
      }
    }
    
    // Se não encontrou via header, tentar via cookie (para chamadas do navegador)
    if (!user) {
      const cookieHeader = request.headers.get('cookie')
      if (cookieHeader) {
        // Extrair o token do cookie sb-access-token ou similar
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {} as Record<string, string>)
        
        // Tentar diferentes formatos de cookie do Supabase
        const accessToken = cookies['sb-access-token'] || 
                           cookies['supabase-auth-token'] ||
                           cookies['sb-localhost-auth-token']
        
        if (accessToken) {
          try {
            const parsed = JSON.parse(decodeURIComponent(accessToken))
            const token = parsed?.access_token || parsed?.[0]?.access_token
            if (token) {
              const { data, error } = await supabaseAdmin.auth.getUser(token)
              if (!error && data.user) {
                user = data.user
              }
            }
          } catch (e) {
            // Token não é JSON, tentar usar diretamente
            const { data, error } = await supabaseAdmin.auth.getUser(accessToken)
            if (!error && data.user) {
              user = data.user
            }
          }
        }
      }
    }
    
    if (!user) {
      return { authorized: false, error: 'Token não fornecido ou inválido' }
    }

    const userEmail = user.email?.toLowerCase()
    const isAdminEmail = userEmail && ADMIN_EMAILS.includes(userEmail)

    if (isAdminEmail) {
      return { authorized: true, user }
    }

    // Verificar role no perfil
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const isAdminRole = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN'

    if (!isAdminRole) {
      return { authorized: false, error: 'Permissão negada' }
    }

    return { authorized: true, user }
  } catch (error) {
    console.error('Erro na verificação de admin API:', error)
    return { authorized: false, error: 'Erro interno' }
  }
}
