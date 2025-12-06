-- ============================================================================
-- SEED: IAs COLABORATIVAS - EXECUTAR NO SUPABASE
-- Data: 05/12/2025
-- 
-- INSTRUÇÕES:
-- 1. Acesse https://supabase.com/dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script e execute
-- ============================================================================

-- LIMPAR DADOS ANTIGOS (se houver)
DELETE FROM ai_plan_matrix;
DELETE FROM ai_feature_providers_core;
DELETE FROM ai_feature_menu_map;
DELETE FROM ai_features_core;
DELETE FROM ai_providers_core;

-- ============================================================================
-- SEED: Provedores de IA
-- ============================================================================

INSERT INTO ai_providers_core (slug, display_name, status, custo_relativo, api_key_env, modelo_padrao) VALUES
  ('openai', 'OpenAI GPT-4', 'ativo', 1.0, 'OPENAI_API_KEY', 'gpt-4o-mini'),
  ('anthropic', 'Anthropic Claude', 'ativo', 1.2, 'ANTHROPIC_API_KEY', 'claude-3-haiku-20240307'),
  ('groq', 'Groq (LLaMA)', 'ativo', 0.1, 'GROQ_API_KEY', 'llama-3.1-70b-versatile'),
  ('together', 'Together AI', 'ativo', 0.5, 'TOGETHER_API_KEY', 'meta-llama/Llama-3-70b-chat-hf'),
  ('gemini', 'Google Gemini', 'em_teste', 0.8, 'GOOGLE_AI_API_KEY', 'gemini-pro'),
  ('huggingface', 'HuggingFace', 'em_teste', 0.0, 'HUGGINGFACE_API_KEY', 'mistralai/Mixtral-8x7B-Instruct-v0.1'),
  ('cohere', 'Cohere', 'desativado', 0.3, 'COHERE_API_KEY', 'command-r')
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  status = EXCLUDED.status,
  custo_relativo = EXCLUDED.custo_relativo,
  modelo_padrao = EXCLUDED.modelo_padrao;

-- ============================================================================
-- SEED: Features de IA (onde a IA atua)
-- ============================================================================

INSERT INTO ai_features_core (slug, display_name, descricao_curta, categoria) VALUES
  ('chat_usuario', 'Chat com Usuária', 'Conversa de suporte emocional com a usuária', 'chat'),
  ('diario_analise', 'Análise de Diário', 'Analisa entradas do diário emocional', 'analise'),
  ('teste_clareza', 'Teste de Clareza', 'Avalia respostas do teste de clareza', 'analise'),
  ('plano_seguranca', 'Plano de Segurança', 'Ajuda a criar plano de segurança', 'geracao'),
  ('oraculo_admin', 'Oráculo Admin', 'IA de suporte para administradores', 'admin'),
  ('oraculo_profissional', 'Oráculo Profissional', 'IA de suporte para profissionais', 'chat'),
  ('curadoria_conteudo', 'Curadoria de Conteúdo', 'Sugere conteúdos relevantes', 'geracao'),
  ('relatorios_juridicos', 'Relatórios Jurídicos', 'Gera relatórios para advogados', 'geracao'),
  ('resumo_chat', 'Resumo de Chat', 'Resume conversas para o diário', 'resumo'),
  ('deteccao_risco', 'Detecção de Risco', 'Detecta sinais de risco nas mensagens', 'analise')
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  descricao_curta = EXCLUDED.descricao_curta,
  categoria = EXCLUDED.categoria;

-- ============================================================================
-- SEED: Ligação Feature <-> Provider (quais IAs podem fazer o quê)
-- ============================================================================

INSERT INTO ai_feature_providers_core (feature_id, provider_id, papel, peso, ativo)
SELECT f.id, p.id, 'geracao', 1.0, true
FROM ai_features_core f, ai_providers_core p
WHERE f.slug = 'chat_usuario' AND p.slug IN ('openai', 'anthropic', 'groq')
ON CONFLICT DO NOTHING;

INSERT INTO ai_feature_providers_core (feature_id, provider_id, papel, peso, ativo)
SELECT f.id, p.id, 'analise', 1.0, true
FROM ai_features_core f, ai_providers_core p
WHERE f.slug IN ('diario_analise', 'teste_clareza', 'deteccao_risco') AND p.slug IN ('openai', 'anthropic')
ON CONFLICT DO NOTHING;

INSERT INTO ai_feature_providers_core (feature_id, provider_id, papel, peso, ativo)
SELECT f.id, p.id, 'geracao', 1.0, true
FROM ai_features_core f, ai_providers_core p
WHERE f.slug IN ('oraculo_admin', 'oraculo_profissional') AND p.slug = 'openai'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED: Matrix por Plano (quem pode usar o quê)
-- ============================================================================

-- Plano FREE - Limites baixos
INSERT INTO ai_plan_matrix (plan_key, feature_id, provider_id, perfil, papel, limite_diario, limite_mensal, ativo, origem)
SELECT 'free', f.id, p.id, 'usuaria', 'geracao', 5, 50, true, 'padrao'
FROM ai_features_core f, ai_providers_core p
WHERE p.slug = 'groq' AND f.slug IN ('chat_usuario', 'diario_analise', 'teste_clareza')
ON CONFLICT DO NOTHING;

-- Plano BASIC - Limites médios
INSERT INTO ai_plan_matrix (plan_key, feature_id, provider_id, perfil, papel, limite_diario, limite_mensal, ativo, origem)
SELECT 'basic', f.id, p.id, 'usuaria', 'geracao', 20, 200, true, 'padrao'
FROM ai_features_core f, ai_providers_core p
WHERE p.slug = 'openai' AND f.slug IN ('chat_usuario', 'diario_analise', 'teste_clareza', 'plano_seguranca')
ON CONFLICT DO NOTHING;

-- Plano PREMIUM - Limites altos
INSERT INTO ai_plan_matrix (plan_key, feature_id, provider_id, perfil, papel, limite_diario, limite_mensal, ativo, origem)
SELECT 'premium', f.id, p.id, 'usuaria', 'geracao', 100, 1000, true, 'padrao'
FROM ai_features_core f, ai_providers_core p
WHERE p.slug IN ('openai', 'anthropic')
ON CONFLICT DO NOTHING;

-- Plano PROFESSIONAL - Sem limites
INSERT INTO ai_plan_matrix (plan_key, feature_id, provider_id, perfil, papel, limite_diario, limite_mensal, ativo, origem)
SELECT 'professional', f.id, p.id, 'profissional', 'geracao', NULL, NULL, true, 'padrao'
FROM ai_features_core f, ai_providers_core p
WHERE p.slug = 'openai'
ON CONFLICT DO NOTHING;

-- Admin - Sem limites, todas as features
INSERT INTO ai_plan_matrix (plan_key, feature_id, provider_id, perfil, papel, limite_diario, limite_mensal, ativo, origem)
SELECT 'admin', f.id, p.id, 'admin', 'geracao', NULL, NULL, true, 'padrao'
FROM ai_features_core f, ai_providers_core p
WHERE p.slug = 'openai'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED: Mapeamento de Menus (onde cada feature aparece)
-- ============================================================================

INSERT INTO ai_feature_menu_map (menu_key, menu_path, menu_name, feature_id, perfil_default, descricao, ativo) VALUES
  ('app.chat', '/chat', 'Chat com IA', (SELECT id FROM ai_features_core WHERE slug = 'chat_usuario'), 'usuaria', 'Conversa com a IA de suporte', true),
  ('app.diario', '/diario', 'Diário Emocional', (SELECT id FROM ai_features_core WHERE slug = 'diario_analise'), 'usuaria', 'Análise de entradas do diário', true),
  ('app.teste_clareza', '/teste-clareza', 'Teste de Clareza', (SELECT id FROM ai_features_core WHERE slug = 'teste_clareza'), 'usuaria', 'Avaliação do teste de clareza', true),
  ('app.plano_seguranca', '/plano-seguranca', 'Plano de Segurança', (SELECT id FROM ai_features_core WHERE slug = 'plano_seguranca'), 'usuaria', 'Criação de plano de segurança', true),
  ('admin.oraculo', '/admin/oraculo', 'Oráculo Admin', (SELECT id FROM ai_features_core WHERE slug = 'oraculo_admin'), 'admin', 'IA de suporte para admin', true),
  ('admin.config_ias', '/admin/configurar-ias', 'Configurar IAs', NULL, 'admin', 'Configuração de IAs colaborativas', true),
  ('admin.ia_matrix', '/admin/ia-matrix', 'IA Matrix', NULL, 'admin', 'Matrix de configuração de IAs', true),
  ('prof.oraculo', '/dashboard-profissional', 'Oráculo Profissional', (SELECT id FROM ai_features_core WHERE slug = 'oraculo_profissional'), 'profissional', 'IA para profissionais', true)
ON CONFLICT (menu_key) DO UPDATE SET
  menu_path = EXCLUDED.menu_path,
  menu_name = EXCLUDED.menu_name,
  feature_id = EXCLUDED.feature_id,
  descricao = EXCLUDED.descricao,
  ativo = EXCLUDED.ativo;

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

SELECT '✅ SEED DE IAs EXECUTADO COM SUCESSO!' as status;
SELECT 'Provedores de IA: ' || COUNT(*) as total FROM ai_providers_core;
SELECT 'Features de IA: ' || COUNT(*) as total FROM ai_features_core;
SELECT 'Ligações Feature-Provider: ' || COUNT(*) as total FROM ai_feature_providers_core;
SELECT 'Matrix por Plano: ' || COUNT(*) as total FROM ai_plan_matrix;
SELECT 'Menus mapeados: ' || COUNT(*) as total FROM ai_feature_menu_map;
