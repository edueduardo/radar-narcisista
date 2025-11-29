// Redirecionamento para /dashboard (unificado)
import { redirect } from 'next/navigation'

export default function DashboardV2Redirect() {
  redirect('/dashboard')
}
