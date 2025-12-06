/**
 * ============================================================================
 * CREDENCIAIS DE TESTE - RADAR NARCISISTA
 * ============================================================================
 * 
 * IMPORTANTE: Estas são credenciais para TESTES AUTOMATIZADOS.
 * NÃO use em produção!
 * 
 * COMO CRIAR USUÁRIO DE TESTE:
 * 
 * 1. No Supabase Dashboard, vá em Authentication → Users
 * 2. Clique em "Add user" → "Create new user"
 * 3. Use os dados abaixo
 * 4. No SQL Editor, execute:
 *    
 *    UPDATE auth.users 
 *    SET raw_user_meta_data = jsonb_set(
 *      COALESCE(raw_user_meta_data, '{}'), 
 *      '{role}', 
 *      '"admin"'
 *    )
 *    WHERE email = 'admin@radar-narcisista.com.br';
 */

// ============================================================================
// USUÁRIO ADMIN DE TESTE
// ============================================================================

export const TEST_ADMIN = {
  email: 'admin@radar-narcisista.com.br',
  password: 'Admin123!@#',
  name: 'Admin Teste',
  role: 'admin'
}

// ============================================================================
// USUÁRIO COMUM DE TESTE
// ============================================================================

export const TEST_USER = {
  email: 'teste.usuario@radar-narcisista.com.br',
  password: 'Teste123!@#',
  name: 'Usuária de Teste E2E',
  role: 'user'
}

// ============================================================================
// USUÁRIO PROFISSIONAL DE TESTE
// ============================================================================

export const TEST_PROFESSIONAL = {
  email: 'profissional@radar-narcisista.com.br',
  password: 'Prof123!@#',
  name: 'Profissional Teste',
  role: 'professional'
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Retorna credenciais por tipo
 */
export function getTestCredentials(type: 'admin' | 'user' | 'professional') {
  switch (type) {
    case 'admin':
      return TEST_ADMIN
    case 'professional':
      return TEST_PROFESSIONAL
    default:
      return TEST_USER
  }
}
