/**
 * Testes do ORACULO_V2_CORE
 * ETAPA 30 - QA do Oráculo Multiperfil
 * 
 * Para executar: npx jest lib/__tests__/oraculo-core.test.ts
 */

import {
  buildSystemPrompt,
  buildUserContext,
  parseOraculoResponse,
  OraculoUserRole,
  OraculoRequest,
  OraculoResponse
} from '../oraculo-core'

// ============================================================================
// TESTES DE buildSystemPrompt
// ============================================================================

describe('buildSystemPrompt', () => {
  const roles: OraculoUserRole[] = ['admin', 'usuaria', 'profissional', 'dev', 'whitelabel']

  test.each(roles)('deve gerar prompt para perfil %s', (role) => {
    const prompt = buildSystemPrompt(role)
    
    // Deve conter o prompt base
    expect(prompt).toContain('ORÁCULO V2')
    expect(prompt).toContain('Radar Narcisista')
    expect(prompt).toContain('JSON OBRIGATÓRIO')
    
    // Deve conter informações específicas do perfil
    expect(prompt).toContain('SEU PAPEL')
  })

  test('prompt de admin deve mencionar métricas e decisões', () => {
    const prompt = buildSystemPrompt('admin')
    expect(prompt).toContain('métricas')
    expect(prompt).toContain('decisões')
  })

  test('prompt de usuaria deve ser acolhedor', () => {
    const prompt = buildSystemPrompt('usuaria')
    expect(prompt).toContain('Acolhedor')
    expect(prompt).toContain('empático')
  })

  test('prompt de profissional deve mencionar clientes', () => {
    const prompt = buildSystemPrompt('profissional')
    expect(prompt).toContain('clientes')
    expect(prompt).toContain('relatórios')
  })

  test('prompt de dev deve mencionar código', () => {
    const prompt = buildSystemPrompt('dev')
    expect(prompt).toContain('código')
    expect(prompt).toContain('APIs')
  })

  test('prompt de whitelabel deve mencionar customização', () => {
    const prompt = buildSystemPrompt('whitelabel')
    expect(prompt).toContain('customização')
    expect(prompt).toContain('instância')
  })
})

// ============================================================================
// TESTES DE buildUserContext
// ============================================================================

describe('buildUserContext', () => {
  test('deve incluir todos os campos obrigatórios', () => {
    const request: OraculoRequest = {
      user_role: 'admin',
      question: 'Quantos usuários temos?',
      plan: 'enterprise',
      url_atual: '/admin/metricas',
      language: 'pt-BR'
    }

    const context = buildUserContext(request)

    expect(context).toContain('admin')
    expect(context).toContain('enterprise')
    expect(context).toContain('/admin/metricas')
    expect(context).toContain('pt-BR')
    expect(context).toContain('Quantos usuários temos?')
  })

  test('deve lidar com campos opcionais ausentes', () => {
    const request: OraculoRequest = {
      user_role: 'usuaria',
      question: 'O que é o Teste de Clareza?'
    }

    const context = buildUserContext(request)

    expect(context).toContain('usuaria')
    expect(context).toContain('não informado')
    expect(context).toContain('O que é o Teste de Clareza?')
  })

  test('deve incluir contexto manual quando fornecido', () => {
    const request: OraculoRequest = {
      user_role: 'profissional',
      question: 'Como gerar relatório?',
      manual_context: 'Usuário está na página de clientes'
    }

    const context = buildUserContext(request)

    expect(context).toContain('Usuário está na página de clientes')
  })
})

// ============================================================================
// TESTES DE parseOraculoResponse
// ============================================================================

describe('parseOraculoResponse', () => {
  test('deve parsear JSON válido corretamente', () => {
    const jsonResponse = JSON.stringify({
      modo: 'analise',
      risco: 'baixo',
      titulo_curto: 'Métricas do Sistema',
      resposta_principal: 'O sistema está funcionando bem.',
      passos: ['Verificar logs', 'Monitorar métricas'],
      links_sugeridos: [{ label: 'Dashboard', url: '/admin' }]
    })

    const response = parseOraculoResponse(jsonResponse)

    expect(response.modo).toBe('analise')
    expect(response.risco).toBe('baixo')
    expect(response.titulo_curto).toBe('Métricas do Sistema')
    expect(response.resposta_principal).toBe('O sistema está funcionando bem.')
    expect(response.passos).toHaveLength(2)
    expect(response.links_sugeridos).toHaveLength(1)
  })

  test('deve retornar resposta padrão para JSON inválido', () => {
    const invalidJson = 'Isso não é JSON válido'

    const response = parseOraculoResponse(invalidJson)

    expect(response.modo).toBe('explicacao')
    expect(response.risco).toBe('baixo')
    expect(response.titulo_curto).toBe('Resposta do Oráculo')
    expect(response.resposta_principal).toBe(invalidJson)
    expect(response.passos).toEqual([])
    expect(response.links_sugeridos).toEqual([])
  })

  test('deve preencher campos ausentes com valores padrão', () => {
    const partialJson = JSON.stringify({
      resposta_principal: 'Resposta parcial'
    })

    const response = parseOraculoResponse(partialJson)

    expect(response.modo).toBe('explicacao')
    expect(response.risco).toBe('baixo')
    expect(response.titulo_curto).toBe('Resposta do Oráculo')
    expect(response.resposta_principal).toBe('Resposta parcial')
    expect(response.passos).toEqual([])
    expect(response.links_sugeridos).toEqual([])
  })

  test('deve incluir mensagem de segurança quando presente', () => {
    const jsonResponse = JSON.stringify({
      modo: 'alerta',
      risco: 'critico',
      titulo_curto: 'Alerta de Segurança',
      resposta_principal: 'Situação crítica detectada.',
      passos: [],
      links_sugeridos: [],
      mensagem_final_seguranca: 'Procure ajuda profissional imediatamente.'
    })

    const response = parseOraculoResponse(jsonResponse)

    expect(response.mensagem_final_seguranca).toBe('Procure ajuda profissional imediatamente.')
  })
})

// ============================================================================
// TESTES DE TIPOS
// ============================================================================

describe('Tipos', () => {
  test('OraculoUserRole deve aceitar todos os perfis válidos', () => {
    const roles: OraculoUserRole[] = ['admin', 'usuaria', 'profissional', 'dev', 'whitelabel']
    expect(roles).toHaveLength(5)
  })

  test('OraculoResponse deve ter estrutura correta', () => {
    const response: OraculoResponse = {
      modo: 'sugestao',
      risco: 'medio',
      titulo_curto: 'Teste',
      resposta_principal: 'Resposta de teste',
      passos: ['Passo 1'],
      links_sugeridos: [{ label: 'Link', url: '/test' }]
    }

    expect(response).toHaveProperty('modo')
    expect(response).toHaveProperty('risco')
    expect(response).toHaveProperty('titulo_curto')
    expect(response).toHaveProperty('resposta_principal')
    expect(response).toHaveProperty('passos')
    expect(response).toHaveProperty('links_sugeridos')
  })
})

// ============================================================================
// TESTES DE INTEGRAÇÃO (Mock)
// ============================================================================

describe('Integração (Mock)', () => {
  test('fluxo completo deve funcionar', () => {
    // 1. Construir prompt
    const systemPrompt = buildSystemPrompt('admin')
    expect(systemPrompt.length).toBeGreaterThan(500)

    // 2. Construir contexto
    const userContext = buildUserContext({
      user_role: 'admin',
      question: 'Quantos usuários ativos?',
      plan: 'enterprise'
    })
    expect(userContext).toContain('Quantos usuários ativos?')

    // 3. Simular resposta da IA
    const mockResponse = JSON.stringify({
      modo: 'analise',
      risco: 'baixo',
      titulo_curto: 'Usuários Ativos',
      resposta_principal: 'Temos 150 usuários ativos.',
      passos: ['Ver dashboard', 'Exportar relatório'],
      links_sugeridos: [{ label: 'Dashboard', url: '/admin' }]
    })

    // 4. Parsear resposta
    const response = parseOraculoResponse(mockResponse)
    expect(response.resposta_principal).toBe('Temos 150 usuários ativos.')
  })
})
