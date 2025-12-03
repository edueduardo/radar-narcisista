-- ============================================================================
-- RADAR NARCISISTA - MEGA SQL PARTE 3
-- CONTENT SYSTEM + BILLING PLANS
-- Data: 03/12/2025
-- ============================================================================
-- INSTRUÇÕES: Cole no Supabase SQL Editor e clique Run
-- IMPORTANTE: Execute DEPOIS da PARTE 1 e PARTE 2
-- ============================================================================

-- ============================================================================
-- SEÇÃO 1: BILLING PLANS
-- ============================================================================
CREATE TABLE IF NOT EXISTS billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  legacy_id TEXT,
  audience TEXT NOT NULL DEFAULT 'consumer',
  is_free BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_mid_bridge BOOLEAN NOT NULL DEFAULT false,
  name_pt TEXT NOT NULL,
  name_en TEXT,
  name_es TEXT,
  tagline_pt TEXT,
  tagline_en TEXT,
  tagline_es TEXT,
  description_pt TEXT,
  description_en TEXT,
  description_es TEXT,
  price_monthly_cents INTEGER DEFAULT 0,
  price_yearly_cents INTEGER DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  max_tests_per_month INTEGER DEFAULT -1,
  max_diary_entries_per_month INTEGER DEFAULT -1,
  max_chat_messages_per_day INTEGER DEFAULT -1,
  can_export_pdf BOOLEAN DEFAULT false,
  can_view_full_history BOOLEAN DEFAULT false,
  can_use_collaborative_ai BOOLEAN DEFAULT false,
  max_clients INTEGER DEFAULT 0,
  stripe_price_monthly_id TEXT,
  stripe_price_yearly_id TEXT,
  icon TEXT DEFAULT 'Shield',
  color TEXT DEFAULT 'text-gray-600',
  bg_color TEXT DEFAULT 'bg-gray-100',
  is_popular BOOLEAN DEFAULT false,
  is_coming_soon BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_plans_code ON billing_plans(code);
CREATE INDEX IF NOT EXISTS idx_billing_plans_audience ON billing_plans(audience);

-- ============================================================================
-- SEÇÃO 2: BILLING PLAN PROMOTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS billing_plan_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES billing_plans(id) ON DELETE CASCADE,
  label_pt TEXT,
  label_en TEXT,
  label_es TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  promo_price_monthly_cents INTEGER,
  promo_price_yearly_cents INTEGER,
  discount_percent INTEGER,
  is_active BOOLEAN DEFAULT true,
  show_original_price BOOLEAN DEFAULT true,
  badge_color TEXT DEFAULT 'bg-red-500',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_promotions_plan ON billing_plan_promotions(plan_id);

-- ============================================================================
-- SEÇÃO 3: CONTENT SOURCES
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'blog',
  url TEXT,
  feed_url TEXT,
  social_handle TEXT,
  trust_level INTEGER DEFAULT 3,
  topics TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'pt-BR',
  is_active BOOLEAN DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_content_sources_slug ON content_sources(slug);

-- ============================================================================
-- SEÇÃO 4: CONTENT ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'article',
  source_type TEXT NOT NULL DEFAULT 'internal',
  source_id UUID REFERENCES content_sources(id),
  original_url TEXT,
  title_pt TEXT NOT NULL,
  title_en TEXT,
  title_es TEXT,
  summary_pt TEXT,
  summary_en TEXT,
  summary_es TEXT,
  body_pt TEXT,
  body_en TEXT,
  body_es TEXT,
  cover_image_url TEXT,
  thumbnail_url TEXT,
  media_type TEXT,
  media_url TEXT,
  topics TEXT[] DEFAULT '{}',
  target_audience TEXT DEFAULT 'all',
  difficulty_level TEXT DEFAULT 'beginner',
  reading_time_minutes INTEGER DEFAULT 5,
  visibility TEXT NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_content_items_slug ON content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_items_visibility ON content_items(visibility);

-- ============================================================================
-- SEÇÃO 5: CONTENT COLLECTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  collection_type TEXT NOT NULL DEFAULT 'trail',
  name_pt TEXT NOT NULL,
  name_en TEXT,
  name_es TEXT,
  description_pt TEXT,
  description_en TEXT,
  description_es TEXT,
  icon TEXT DEFAULT 'BookOpen',
  color TEXT DEFAULT 'purple',
  cover_image_url TEXT,
  target_audience TEXT DEFAULT 'all',
  difficulty_level TEXT DEFAULT 'beginner',
  estimated_duration_minutes INTEGER,
  visibility TEXT NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  required_plan_code TEXT,
  sort_order INTEGER DEFAULT 0,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_content_collections_slug ON content_collections(slug);

-- ============================================================================
-- SEÇÃO 6: CONTENT COLLECTION ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES content_collections(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  unlock_after_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, content_item_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON content_collection_items(collection_id);

-- ============================================================================
-- SEÇÃO 7: CONTENT INSIGHTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key TEXT UNIQUE NOT NULL,
  metric_category TEXT NOT NULL DEFAULT 'general',
  value_numeric DECIMAL(15,4),
  value_text TEXT,
  value_json JSONB,
  label_pt TEXT NOT NULL,
  label_en TEXT,
  label_es TEXT,
  description_pt TEXT,
  description_en TEXT,
  description_es TEXT,
  display_format TEXT DEFAULT 'number',
  display_prefix TEXT,
  display_suffix TEXT,
  decimal_places INTEGER DEFAULT 0,
  icon TEXT DEFAULT 'BarChart',
  color TEXT DEFAULT 'blue',
  visibility TEXT NOT NULL DEFAULT 'private',
  is_featured BOOLEAN DEFAULT false,
  update_frequency TEXT DEFAULT 'daily',
  last_computed_at TIMESTAMPTZ,
  next_compute_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_insights_key ON content_insights(metric_key);

-- ============================================================================
-- SEÇÃO 8: CONTENT SUGGESTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES content_sources(id),
  original_url TEXT NOT NULL,
  suggested_title TEXT,
  suggested_summary TEXT,
  topics TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_content_id UUID REFERENCES content_items(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_suggestions_status ON content_suggestions(status);

-- ============================================================================
-- SEÇÃO 9: RLS - HABILITAR
-- ============================================================================
ALTER TABLE billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_plan_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_suggestions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SEÇÃO 10: POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "billing_plans_select_public" ON billing_plans;
CREATE POLICY "billing_plans_select_public" ON billing_plans FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "content_items_public_read" ON content_items;
CREATE POLICY "content_items_public_read" ON content_items FOR SELECT USING (visibility = 'public');

DROP POLICY IF EXISTS "content_collections_public_read" ON content_collections;
CREATE POLICY "content_collections_public_read" ON content_collections FOR SELECT USING (visibility = 'public');

DROP POLICY IF EXISTS "content_insights_public_read" ON content_insights;
CREATE POLICY "content_insights_public_read" ON content_insights FOR SELECT USING (visibility = 'public');

-- ============================================================================
-- SEÇÃO 11: DADOS INICIAIS - BILLING PLANS
-- ============================================================================
INSERT INTO billing_plans (code, audience, is_free, is_public, name_pt, tagline_pt, price_monthly_cents, price_yearly_cents, max_tests_per_month, max_diary_entries_per_month, max_chat_messages_per_day, can_export_pdf, icon, color, bg_color, sort_order) VALUES
  ('visitante', 'consumer', true, false, 'Visitante', 'Explore sem compromisso', 0, 0, 1, 0, 0, false, 'Eye', 'text-gray-600', 'bg-gray-100', 0),
  ('guardar', 'consumer', true, true, 'Radar Guardar', 'Guarde sua história com segurança', 0, 0, -1, 3, 5, false, 'Shield', 'text-emerald-600', 'bg-emerald-100', 1),
  ('jornada', 'consumer', false, true, 'Radar Jornada', 'Sua jornada de clareza', 2990, 28700, -1, -1, 20, true, 'Compass', 'text-purple-600', 'bg-purple-100', 2),
  ('profissional', 'professional', false, true, 'Radar Profissional', 'Para profissionais de saúde mental', 9990, 95900, -1, -1, -1, true, 'Briefcase', 'text-blue-600', 'bg-blue-100', 3)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
SELECT '✅ PARTE 3 CONCLUÍDA COM SUCESSO!' as status;

SELECT 'Tabelas criadas:' as info, COUNT(*) as total FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

SELECT 'Billing Plans:' as tabela, COUNT(*) as registros FROM billing_plans
UNION ALL SELECT 'Content Sources:', COUNT(*) FROM content_sources
UNION ALL SELECT 'Content Items:', COUNT(*) FROM content_items;
