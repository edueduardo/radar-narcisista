import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'

// Lista de emails admin (deve ser igual ao .env.local)
const ADMIN_EMAILS = [
  'etailoffice@gmail.com',
  'eduardo.mkt.davila@gmail.com'
]

export default async function AdminPage() {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore as any
  })

  const { data: { session }, error } = await supabase.auth.getSession()

  // Verificar se está logado
  if (error || !session) {
    redirect('/login?redirect=/admin')
  }

  // Verificar se é admin (por email ou role no banco)
  const userEmail = session.user.email?.toLowerCase()
  const isAdminEmail = userEmail && ADMIN_EMAILS.includes(userEmail)

  // Buscar role no banco
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  const isAdminRole = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN'

  // Se não é admin, redireciona para dashboard do usuário
  if (!isAdminEmail && !isAdminRole) {
    redirect('/dashboard?error=acesso_negado')
  }

  return <AdminClient />
}
