'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN'

interface UseUserRoleReturn {
  role: UserRole | null
  isAdmin: boolean
  isSuperAdmin: boolean
  isLoading: boolean
  userId: string | null
  userEmail: string | null
}

// Lista de emails admin (fallback se não tiver no banco)
const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [
  'etailoffice@gmail.com',
  'eduardo.mkt.davila@gmail.com'
]

/**
 * Hook para verificar o papel (role) do usuário logado
 * Retorna se é USER, ADMIN ou SUPER_ADMIN
 */
export function useUserRole(): UseUserRoleReturn {
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    async function checkRole() {
      try {
        // Verificar se há usuário logado
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setRole(null)
          setIsLoading(false)
          return
        }

        setUserId(user.id)
        setUserEmail(user.email || null)

        // Verificar se o email está na lista de admins (fallback)
        const isAdminEmail = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())

        // Buscar role no banco de dados
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (error || !profile) {
          // Se não encontrou no banco, usa fallback por email
          setRole(isAdminEmail ? 'ADMIN' : 'USER')
        } else {
          // Se encontrou no banco, usa o role do banco
          // Mas se o email está na lista de admins, garante que é pelo menos ADMIN
          if (isAdminEmail && profile.role === 'USER') {
            setRole('ADMIN')
            // Atualizar no banco para manter consistência
            await supabase
              .from('user_profiles')
              .update({ role: 'ADMIN' })
              .eq('user_id', user.id)
          } else {
            setRole(profile.role as UserRole)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar role:', error)
        setRole('USER')
      } finally {
        setIsLoading(false)
      }
    }

    checkRole()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkRole()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    role,
    isAdmin: role === 'ADMIN' || role === 'SUPER_ADMIN',
    isSuperAdmin: role === 'SUPER_ADMIN',
    isLoading,
    userId,
    userEmail
  }
}

/**
 * Verifica se um email específico é admin
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
