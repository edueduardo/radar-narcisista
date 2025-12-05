/**
 * Supabase Client Exports
 * 
 * Uso:
 * - Client Components: import { createClient } from '@/lib/supabase/client'
 * - Server Components/Actions: import { createClient } from '@/lib/supabase/server'
 * - Compatibilidade: import { createClientComponentClient, createRouteHandlerClient } from '@/lib/supabase/compat'
 */

// Browser client
export { createClient as createBrowserClient } from './client'

// Compatibility layer (deprecated)
export { createClientComponentClient } from './compat'
export { createRouteHandlerClient, createServerComponentClient } from './server-compat'
