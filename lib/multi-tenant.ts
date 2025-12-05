/**
 * Sistema Multi-tenant Avançado
 * FASE 9.1 - White Label
 * 
 * Permite que múltiplas organizações usem o sistema com suas próprias marcas
 */

export interface Tenant {
  id: string
  slug: string
  name: string
  domain?: string
  customDomain?: string
  
  // Configurações
  settings: TenantSettings
  
  // Branding
  branding: TenantBranding
  
  // Limites
  limits: TenantLimits
  
  // Status
  status: 'active' | 'suspended' | 'trial' | 'cancelled'
  trialEndsAt?: string
  
  // Billing
  stripeCustomerId?: string
  subscriptionId?: string
  planSlug?: string
  
  // Metadata
  createdAt: string
  updatedAt: string
  ownerId: string
}

export interface TenantSettings {
  // Features habilitadas
  features: {
    chat: boolean
    diary: boolean
    clarityTest: boolean
    safetyPlan: boolean
    riskAlerts: boolean
    gamification: boolean
    academy: boolean
    professionalMode: boolean
  }
  
  // Configurações de IA
  ai: {
    provider: string
    model: string
    maxTokensPerDay: number
    customPrompts?: Record<string, string>
  }
  
  // Configurações de email
  email: {
    fromName: string
    fromEmail: string
    replyTo?: string
  }
  
  // Configurações de segurança
  security: {
    mfaRequired: boolean
    sessionTimeout: number
    ipWhitelist?: string[]
  }
  
  // Integrações
  integrations: {
    stripe?: { enabled: boolean; publishableKey?: string }
    analytics?: { enabled: boolean; trackingId?: string }
    intercom?: { enabled: boolean; appId?: string }
  }
}

export interface TenantBranding {
  // Visual
  logo: string
  logoLight?: string
  favicon?: string
  
  // Cores
  primaryColor: string
  secondaryColor: string
  accentColor?: string
  
  // Tipografia
  fontFamily?: string
  
  // Textos
  appName: string
  tagline?: string
  welcomeMessage?: string
  
  // Links
  termsUrl?: string
  privacyUrl?: string
  supportUrl?: string
  
  // Social
  social?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
}

export interface TenantLimits {
  maxUsers: number
  maxStorageGB: number
  maxAIRequestsPerDay: number
  maxProfessionalClients?: number
  customDomainAllowed: boolean
  apiAccessAllowed: boolean
  whitelabelAllowed: boolean
}

/**
 * Resolver tenant a partir do request
 */
export async function resolveTenant(
  request: Request,
  supabase: any
): Promise<Tenant | null> {
  // 1. Tentar pelo header X-Tenant-ID
  const tenantId = request.headers.get('X-Tenant-ID')
  if (tenantId) {
    return getTenantById(tenantId, supabase)
  }

  // 2. Tentar pelo hostname
  const url = new URL(request.url)
  const hostname = url.hostname

  // Verificar se é domínio customizado
  const { data: tenantByDomain } = await supabase
    .from('tenants')
    .select('*')
    .eq('custom_domain', hostname)
    .eq('status', 'active')
    .single()

  if (tenantByDomain) {
    return mapTenantFromDB(tenantByDomain)
  }

  // Verificar se é subdomínio
  const subdomain = hostname.split('.')[0]
  if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
    const { data: tenantBySlug } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', subdomain)
      .eq('status', 'active')
      .single()

    if (tenantBySlug) {
      return mapTenantFromDB(tenantBySlug)
    }
  }

  // 3. Retornar tenant padrão (Radar Narcisista)
  return getDefaultTenant()
}

/**
 * Buscar tenant por ID
 */
export async function getTenantById(
  id: string,
  supabase: any
): Promise<Tenant | null> {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return mapTenantFromDB(data)
}

/**
 * Buscar tenant por slug
 */
export async function getTenantBySlug(
  slug: string,
  supabase: any
): Promise<Tenant | null> {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return mapTenantFromDB(data)
}

/**
 * Criar novo tenant
 */
export async function createTenant(
  data: Partial<Tenant>,
  ownerId: string,
  supabase: any
): Promise<{ tenant: Tenant | null; error: string | null }> {
  // Validar slug único
  const { data: existing } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', data.slug)
    .single()

  if (existing) {
    return { tenant: null, error: 'Slug já existe' }
  }

  const newTenant = {
    slug: data.slug,
    name: data.name,
    domain: data.domain,
    settings: data.settings || getDefaultSettings(),
    branding: data.branding || getDefaultBranding(data.name || ''),
    limits: data.limits || getDefaultLimits(),
    status: 'trial',
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    owner_id: ownerId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data: created, error } = await supabase
    .from('tenants')
    .insert(newTenant)
    .select()
    .single()

  if (error) {
    return { tenant: null, error: error.message }
  }

  return { tenant: mapTenantFromDB(created), error: null }
}

/**
 * Atualizar tenant
 */
export async function updateTenant(
  id: string,
  updates: Partial<Tenant>,
  supabase: any
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase
    .from('tenants')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

// Helpers
function mapTenantFromDB(data: any): Tenant {
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    domain: data.domain,
    customDomain: data.custom_domain,
    settings: data.settings || getDefaultSettings(),
    branding: data.branding || getDefaultBranding(data.name),
    limits: data.limits || getDefaultLimits(),
    status: data.status,
    trialEndsAt: data.trial_ends_at,
    stripeCustomerId: data.stripe_customer_id,
    subscriptionId: data.subscription_id,
    planSlug: data.plan_slug,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    ownerId: data.owner_id
  }
}

function getDefaultTenant(): Tenant {
  return {
    id: 'default',
    slug: 'radar-narcisista',
    name: 'Radar Narcisista',
    settings: getDefaultSettings(),
    branding: getDefaultBranding('Radar Narcisista'),
    limits: getDefaultLimits(),
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: 'system'
  }
}

function getDefaultSettings(): TenantSettings {
  return {
    features: {
      chat: true,
      diary: true,
      clarityTest: true,
      safetyPlan: true,
      riskAlerts: true,
      gamification: true,
      academy: true,
      professionalMode: true
    },
    ai: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      maxTokensPerDay: 100000
    },
    email: {
      fromName: 'Radar Narcisista',
      fromEmail: 'noreply@radarnarcisista.com.br'
    },
    security: {
      mfaRequired: false,
      sessionTimeout: 7 * 24 * 60 * 60 // 7 dias
    },
    integrations: {}
  }
}

function getDefaultBranding(name: string): TenantBranding {
  return {
    logo: '/logo.svg',
    primaryColor: '#7c3aed',
    secondaryColor: '#ec4899',
    appName: name,
    tagline: 'Sua jornada de clareza começa aqui'
  }
}

function getDefaultLimits(): TenantLimits {
  return {
    maxUsers: 1000,
    maxStorageGB: 10,
    maxAIRequestsPerDay: 10000,
    maxProfessionalClients: 50,
    customDomainAllowed: true,
    apiAccessAllowed: true,
    whitelabelAllowed: true
  }
}

/**
 * SQL para criar tabela de tenants
 */
export const TENANT_SCHEMA = `
-- Tabela de Tenants (Multi-tenant)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  domain TEXT,
  custom_domain TEXT UNIQUE,
  
  settings JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}',
  limits JSONB DEFAULT '{}',
  
  status TEXT DEFAULT 'trial' CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
  trial_ends_at TIMESTAMPTZ,
  
  stripe_customer_id TEXT,
  subscription_id TEXT,
  plan_slug TEXT,
  
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de usuários por tenant
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON tenants(custom_domain);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON tenant_users(user_id);

-- RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Owners can manage their tenants" ON tenants
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Users can view their tenants" ON tenant_users
  FOR SELECT USING (user_id = auth.uid());
`
