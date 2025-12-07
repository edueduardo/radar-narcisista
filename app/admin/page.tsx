import { createServerComponentClient } from '@/lib/supabase/server-compat'
import { redirect } from 'next/navigation'
import AdminDashboard from './dashboard-admin'

export const dynamic = 'force-dynamic'

// Lista de emails admin - HARDCODED para garantir acesso
const ADMIN_EMAILS = [
  'etailoffice@gmail.com',
  'eduardo.mkt.davila@gmail.com',
  'demo.admin@radar.test' // Demo admin para demonstração
]

export default async function AdminPage() {
  const supabase = await createServerComponentClient()

  // Usar getUser() que é mais confiável que getSession()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  // Debug log (aparece no console do servidor Vercel)
  console.log('[ADMIN] Verificando acesso:', {
    hasUser: !!user,
    userEmail: user?.email,
    error: userError?.message
  })

  // Verificar se está logado
  if (userError || !user) {
    console.log('[ADMIN] Usuário não logado, redirecionando para login')
    redirect('/login?redirect=/admin')
  }

  // Verificar se é admin (por email) - PRIORIDADE MÁXIMA
  const userEmail = user.email?.toLowerCase().trim()
  const isAdminEmail = userEmail && ADMIN_EMAILS.some(
    adminEmail => adminEmail.toLowerCase().trim() === userEmail
  )

  console.log('[ADMIN] Verificação de email:', {
    userEmail,
    isAdminEmail,
    adminEmails: ADMIN_EMAILS
  })

  // Se é admin por email, permite acesso IMEDIATAMENTE
  if (isAdminEmail) {
    console.log('[ADMIN] ✅ Acesso permitido por email admin')
    return <AdminDashboard />
  }

  // Se não é admin por email, verificar role no banco
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  console.log('[ADMIN] Verificação de role no banco:', {
    profile,
    profileError: profileError?.message
  })

  const isAdminRole = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN'

  // Se não é admin por email NEM por role, redireciona
  if (!isAdminRole) {
    console.log('[ADMIN] ❌ Acesso negado - não é admin')
    redirect('/dashboard?error=acesso_negado')
  }

  console.log('[ADMIN] ✅ Acesso permitido por role no banco')
  return <AdminDashboard />
}
