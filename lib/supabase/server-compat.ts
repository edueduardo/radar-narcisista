/**
 * Supabase Compatibility Layer - SERVER ONLY
 * 
 * Este arquivo fornece compatibilidade com o código antigo que usa
 * @supabase/auth-helpers-nextjs enquanto migramos para @supabase/ssr
 * 
 * DEPRECATED: Use lib/supabase/server.ts diretamente
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * @deprecated Use createClient() de lib/supabase/server.ts
 * Mantido para compatibilidade com código existente de Route Handlers
 */
export async function createRouteHandlerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return cookieStore.getAll().map(c => ({ name: c.name, value: c.value }))
        },
        async setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignorar erros em Server Components
          }
        },
      },
    }
  )
}

/**
 * @deprecated Use createClient() de lib/supabase/server.ts
 * Mantido para compatibilidade com código existente de Server Components
 */
export async function createServerComponentClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return cookieStore.getAll().map(c => ({ name: c.name, value: c.value }))
        },
        async setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignorar erros em Server Components
          }
        },
      },
    }
  )
}
