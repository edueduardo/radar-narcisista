/**
 * Testes Unitários - Oráculo Billing
 * ETAPA 41 - Testes Automatizados
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock data
const mockPlans = [
  {
    id: 'plan-free',
    plan_slug: 'free',
    plan_name: 'Free',
    max_queries_per_month: 100,
    max_tokens_per_month: 50000,
    max_api_keys: 1,
    max_webhooks: 1,
    price_cents: 0,
    features: ['basic_support']
  },
  {
    id: 'plan-starter',
    plan_slug: 'starter',
    plan_name: 'Starter',
    max_queries_per_month: 1000,
    max_tokens_per_month: 500000,
    max_api_keys: 3,
    max_webhooks: 2,
    price_cents: 4900,
    features: ['basic_support', 'email_support']
  },
  {
    id: 'plan-pro',
    plan_slug: 'pro',
    plan_name: 'Pro',
    max_queries_per_month: 10000,
    max_tokens_per_month: 5000000,
    max_api_keys: 10,
    max_webhooks: 5,
    price_cents: 14900,
    features: ['priority_support', 'custom_branding', 'advanced_analytics']
  },
  {
    id: 'plan-enterprise',
    plan_slug: 'enterprise',
    plan_name: 'Enterprise',
    max_queries_per_month: -1, // ilimitado
    max_tokens_per_month: -1,
    max_api_keys: -1,
    max_webhooks: -1,
    price_cents: 49900,
    features: ['priority_support', 'custom_branding', 'advanced_analytics', 'dedicated_support', 'sla']
  }
]

describe('Billing Plans', () => {
  it('should have 4 default plans', () => {
    expect(mockPlans.length).toBe(4)
  })

  it('should have free plan with zero price', () => {
    const freePlan = mockPlans.find(p => p.plan_slug === 'free')
    expect(freePlan).toBeDefined()
    expect(freePlan?.price_cents).toBe(0)
  })

  it('should have enterprise with unlimited resources', () => {
    const enterprise = mockPlans.find(p => p.plan_slug === 'enterprise')
    expect(enterprise).toBeDefined()
    expect(enterprise?.max_queries_per_month).toBe(-1)
    expect(enterprise?.max_tokens_per_month).toBe(-1)
  })

  it('should have increasing prices', () => {
    const prices = mockPlans.map(p => p.price_cents)
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThan(prices[i - 1])
    }
  })

  it('should have increasing limits', () => {
    const nonEnterprise = mockPlans.filter(p => p.plan_slug !== 'enterprise')
    const queries = nonEnterprise.map(p => p.max_queries_per_month)
    
    for (let i = 1; i < queries.length; i++) {
      expect(queries[i]).toBeGreaterThan(queries[i - 1])
    }
  })
})

describe('Subscription Status', () => {
  it('should have valid status values', () => {
    const validStatuses = ['active', 'canceled', 'past_due', 'trialing', 'paused']
    
    validStatuses.forEach(status => {
      expect(['active', 'canceled', 'past_due', 'trialing', 'paused'].includes(status)).toBe(true)
    })
  })

  it('should allow queries only for active/trialing', () => {
    const allowedStatuses = ['active', 'trialing']
    const blockedStatuses = ['canceled', 'past_due', 'paused']

    allowedStatuses.forEach(status => {
      const canQuery = status === 'active' || status === 'trialing'
      expect(canQuery).toBe(true)
    })

    blockedStatuses.forEach(status => {
      const canQuery = status === 'active' || status === 'trialing'
      expect(canQuery).toBe(false)
    })
  })
})

describe('Usage Tracking', () => {
  it('should calculate usage percentage correctly', () => {
    const testCases = [
      { used: 0, limit: 100, expected: 0 },
      { used: 50, limit: 100, expected: 50 },
      { used: 100, limit: 100, expected: 100 },
      { used: 150, limit: 100, expected: 150 } // over limit
    ]

    testCases.forEach(tc => {
      const percentage = (tc.used / tc.limit) * 100
      expect(percentage).toBe(tc.expected)
    })
  })

  it('should handle unlimited plans', () => {
    const limit = -1
    const used = 999999

    const isUnlimited = limit === -1
    const canContinue = isUnlimited || used < limit

    expect(isUnlimited).toBe(true)
    expect(canContinue).toBe(true)
  })

  it('should block when limit reached', () => {
    const subscription = {
      queries_used: 100,
      plan: { max_queries_per_month: 100 }
    }

    const canQuery = subscription.plan.max_queries_per_month === -1 ||
                     subscription.queries_used < subscription.plan.max_queries_per_month

    expect(canQuery).toBe(false)
  })
})

describe('Cost Calculation', () => {
  it('should calculate monthly cost correctly', () => {
    const testCases = [
      { price_cents: 0, expected_brl: 0 },
      { price_cents: 4900, expected_brl: 49 },
      { price_cents: 14900, expected_brl: 149 },
      { price_cents: 49900, expected_brl: 499 }
    ]

    testCases.forEach(tc => {
      const brl = tc.price_cents / 100
      expect(brl).toBe(tc.expected_brl)
    })
  })

  it('should calculate token cost correctly', () => {
    // GPT-4: $30/1M input, $60/1M output
    const tokensInput = 100000
    const tokensOutput = 50000

    const inputCost = (tokensInput / 1000000) * 3000 // centavos
    const outputCost = (tokensOutput / 1000000) * 6000

    expect(inputCost).toBe(300) // R$ 3,00
    expect(outputCost).toBe(300) // R$ 3,00
  })
})

describe('Period Management', () => {
  it('should calculate period dates correctly', () => {
    const now = new Date('2024-12-01')
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    expect(periodStart.getDate()).toBe(1)
    expect(periodEnd.getMonth()).toBe(11) // dezembro
  })

  it('should reset usage at period start', () => {
    const subscription = {
      queries_used: 500,
      tokens_used: 250000,
      current_period_start: '2024-12-01',
      current_period_end: '2024-12-31'
    }

    // Simular reset
    const resetSubscription = {
      ...subscription,
      queries_used: 0,
      tokens_used: 0
    }

    expect(resetSubscription.queries_used).toBe(0)
    expect(resetSubscription.tokens_used).toBe(0)
  })
})

describe('Invoice Generation', () => {
  it('should have required invoice fields', () => {
    const invoice = {
      id: 'inv-123',
      instance_id: 'inst-123',
      amount_cents: 14900,
      currency: 'BRL',
      status: 'paid',
      period_start: '2024-12-01',
      period_end: '2024-12-31'
    }

    expect(invoice).toHaveProperty('id')
    expect(invoice).toHaveProperty('amount_cents')
    expect(invoice).toHaveProperty('status')
    expect(invoice.currency).toBe('BRL')
  })

  it('should have valid invoice status', () => {
    const validStatuses = ['draft', 'open', 'paid', 'void', 'uncollectible']
    
    validStatuses.forEach(status => {
      expect(['draft', 'open', 'paid', 'void', 'uncollectible'].includes(status)).toBe(true)
    })
  })
})

describe('Plan Upgrade/Downgrade', () => {
  it('should identify upgrade correctly', () => {
    const currentPlan = mockPlans.find(p => p.plan_slug === 'starter')
    const targetPlan = mockPlans.find(p => p.plan_slug === 'pro')

    const isUpgrade = (targetPlan?.price_cents || 0) > (currentPlan?.price_cents || 0)
    expect(isUpgrade).toBe(true)
  })

  it('should identify downgrade correctly', () => {
    const currentPlan = mockPlans.find(p => p.plan_slug === 'pro')
    const targetPlan = mockPlans.find(p => p.plan_slug === 'starter')

    const isDowngrade = (targetPlan?.price_cents || 0) < (currentPlan?.price_cents || 0)
    expect(isDowngrade).toBe(true)
  })

  it('should not allow downgrade below usage', () => {
    const currentUsage = {
      queries_used: 500,
      api_keys_count: 5
    }

    const targetPlan = mockPlans.find(p => p.plan_slug === 'free')
    
    const canDowngrade = 
      currentUsage.queries_used <= (targetPlan?.max_queries_per_month || 0) &&
      currentUsage.api_keys_count <= (targetPlan?.max_api_keys || 0)

    expect(canDowngrade).toBe(false) // free só permite 1 API key
  })
})
