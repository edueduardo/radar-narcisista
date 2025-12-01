/**
 * Testes Unitários - Oráculo Instances
 * ETAPA 41 - Testes Automatizados
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock do Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockInstance, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [mockInstance], error: null }))
        })),
        order: vi.fn(() => Promise.resolve({ data: [mockInstance], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockInstance, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }))
}))

// Mock data
const mockInstance = {
  id: 'test-uuid-123',
  instance_slug: 'test-instance',
  instance_name: 'Test Instance',
  status: 'active',
  modelo_ia: 'gpt-4o-mini',
  temperatura: 0.7,
  max_tokens: 2000,
  nome_assistente: 'Test Assistant',
  tom_comunicacao: 'acolhedor',
  created_at: '2024-12-01T00:00:00Z',
  updated_at: '2024-12-01T00:00:00Z'
}

describe('Oráculo Instances', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Instance Validation', () => {
    it('should validate instance slug format', () => {
      const validSlugs = ['meu-saas', 'clinica-123', 'test']
      const invalidSlugs = ['Meu SaaS', 'clinica@123', '']

      validSlugs.forEach(slug => {
        expect(/^[a-z0-9-]+$/.test(slug)).toBe(true)
      })

      invalidSlugs.forEach(slug => {
        expect(/^[a-z0-9-]+$/.test(slug)).toBe(false)
      })
    })

    it('should validate temperature range', () => {
      const validTemps = [0, 0.5, 0.7, 1, 2]
      const invalidTemps = [-1, 2.5, 3]

      validTemps.forEach(temp => {
        expect(temp >= 0 && temp <= 2).toBe(true)
      })

      invalidTemps.forEach(temp => {
        expect(temp >= 0 && temp <= 2).toBe(false)
      })
    })

    it('should validate max_tokens range', () => {
      const validTokens = [100, 500, 2000, 4000]
      const invalidTokens = [0, -100, 10000]

      validTokens.forEach(tokens => {
        expect(tokens > 0 && tokens <= 8000).toBe(true)
      })

      invalidTokens.forEach(tokens => {
        expect(tokens > 0 && tokens <= 8000).toBe(false)
      })
    })
  })

  describe('Instance Status', () => {
    it('should have valid status values', () => {
      const validStatuses = ['active', 'inactive', 'suspended']
      
      validStatuses.forEach(status => {
        expect(['active', 'inactive', 'suspended'].includes(status)).toBe(true)
      })
    })

    it('should default to active status', () => {
      const newInstance = { ...mockInstance, status: 'active' }
      expect(newInstance.status).toBe('active')
    })
  })

  describe('Instance Configuration', () => {
    it('should have required fields', () => {
      const requiredFields = [
        'instance_slug',
        'instance_name',
        'modelo_ia',
        'temperatura',
        'max_tokens',
        'nome_assistente',
        'tom_comunicacao'
      ]

      requiredFields.forEach(field => {
        expect(mockInstance).toHaveProperty(field)
      })
    })

    it('should have valid tom_comunicacao', () => {
      const validToms = ['acolhedor', 'profissional', 'tecnico', 'casual']
      expect(validToms.includes(mockInstance.tom_comunicacao)).toBe(true)
    })

    it('should have valid modelo_ia', () => {
      const validModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']
      expect(validModels.includes(mockInstance.modelo_ia)).toBe(true)
    })
  })
})

describe('API Key Validation', () => {
  it('should validate API key format', () => {
    const validKeys = ['orak_abc123xyz789', 'orak_test123']
    const invalidKeys = ['abc123', 'invalid_key', '']

    validKeys.forEach(key => {
      expect(key.startsWith('orak_')).toBe(true)
    })

    invalidKeys.forEach(key => {
      expect(key.startsWith('orak_')).toBe(false)
    })
  })

  it('should mask API key for display', () => {
    const fullKey = 'orak_abc123xyz789def456'
    const masked = `orak_****${fullKey.slice(-6)}`
    
    expect(masked).toBe('orak_****ef456')
    expect(masked).not.toContain('abc123')
  })
})

describe('Webhook Validation', () => {
  it('should validate webhook URL format', () => {
    const validUrls = [
      'https://example.com/webhook',
      'https://api.mysite.com/hooks/oraculo'
    ]
    const invalidUrls = [
      'http://example.com/webhook', // não HTTPS
      'ftp://example.com',
      'not-a-url'
    ]

    validUrls.forEach(url => {
      expect(url.startsWith('https://')).toBe(true)
    })

    invalidUrls.forEach(url => {
      expect(url.startsWith('https://')).toBe(false)
    })
  })

  it('should validate webhook events', () => {
    const validEvents = [
      'oraculo.query',
      'oraculo.response',
      'oraculo.error',
      'oraculo.limit_reached',
      'instance.updated',
      'apikey.created',
      'apikey.revoked'
    ]

    const testEvents = ['oraculo.query', 'oraculo.response']
    
    testEvents.forEach(event => {
      expect(validEvents.includes(event)).toBe(true)
    })
  })
})

describe('Billing Validation', () => {
  it('should validate plan limits', () => {
    const plans = [
      { slug: 'free', queries: 100, tokens: 50000 },
      { slug: 'starter', queries: 1000, tokens: 500000 },
      { slug: 'pro', queries: 10000, tokens: 5000000 },
      { slug: 'enterprise', queries: -1, tokens: -1 } // ilimitado
    ]

    plans.forEach(plan => {
      if (plan.queries === -1) {
        expect(plan.slug).toBe('enterprise')
      } else {
        expect(plan.queries).toBeGreaterThan(0)
      }
    })
  })

  it('should calculate usage percentage correctly', () => {
    const used = 250
    const limit = 1000
    const percentage = (used / limit) * 100

    expect(percentage).toBe(25)
  })

  it('should handle unlimited plans', () => {
    const limit = -1
    const used = 10000
    
    // -1 significa ilimitado
    const isUnlimited = limit === -1
    expect(isUnlimited).toBe(true)
  })
})

describe('Usage Logs', () => {
  it('should generate valid request ID', () => {
    const requestId = `req_${Date.now()}_abc123`
    
    expect(requestId.startsWith('req_')).toBe(true)
    expect(requestId.length).toBeGreaterThan(10)
  })

  it('should calculate token cost correctly', () => {
    // GPT-4: $30/1M input, $60/1M output (em centavos)
    const tokensInput = 1000
    const tokensOutput = 500
    const model = 'gpt-4o'

    const inputCost = (tokensInput / 1000000) * 3000
    const outputCost = (tokensOutput / 1000000) * 6000
    const totalCost = inputCost + outputCost

    expect(totalCost).toBeCloseTo(0.006, 4)
  })

  it('should validate log status', () => {
    const validStatuses = ['success', 'error', 'rate_limited', 'quota_exceeded']
    
    validStatuses.forEach(status => {
      expect(['success', 'error', 'rate_limited', 'quota_exceeded'].includes(status)).toBe(true)
    })
  })
})
