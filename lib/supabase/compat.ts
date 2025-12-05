/**
 * Supabase Compatibility Layer - CLIENT ONLY
 * 
 * Este arquivo fornece compatibilidade com o código antigo que usa
 * @supabase/auth-helpers-nextjs enquanto migramos para @supabase/ssr
 * 
 * DEPRECATED: Use lib/supabase/client.ts diretamente
 * 
 * NOTA: Para Server Components e Route Handlers, use lib/supabase/server-compat.ts
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * @deprecated Use createClient() de lib/supabase/client.ts
 * Mantido para compatibilidade com código existente de Client Components
 */
export function createClientComponentClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Re-export para facilitar migração
export { createClient as createBrowserClient } from './client'
