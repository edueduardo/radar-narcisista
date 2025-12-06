-- ================================================================================
-- SEED: DADOS DE EXEMPLO PARA FANPAGE VIVA
-- Executar no Supabase SQL Editor após criar as tabelas
-- ================================================================================

-- ============================================================================
-- 1. CONTENT_INSIGHTS (Radar em Números)
-- ============================================================================

INSERT INTO public.content_insights (
  metric_key, value_numeric, label_pt, description_pt, 
  display_format, display_suffix, icon, color,
  visibility, is_featured, sort_order
) VALUES 
(
  'total_users',
  15847,
  'Pessoas Apoiadas',
  'Total de pessoas que já usaram o Radar',
  'number',
  NULL,
  '👥',
  '#3B82F6',
  'public',
  true,
  1
),
(
  'clarity_tests',
  42563,
  'Testes Realizados',
  'Total de Testes de Clareza completados',
  'number',
  NULL,
  '🎯',
  '#10B981',
  'public',
  true,
  2
),
(
  'journal_entries',
  128947,
  'Registros no Diário',
  'Entradas de diário criadas',
  'number',
  NULL,
  '📝',
  '#8B5CF6',
  'public',
  true,
  3
),
(
  'safety_plans',
  3421,
  'Planos de Segurança',
  'Planos de segurança ativos',
  'number',
  NULL,
  '🛡️',
  '#EF4444',
  'public',
  true,
  4
)
ON CONFLICT (metric_key) DO UPDATE SET
  value_numeric = EXCLUDED.value_numeric,
  updated_at = NOW();

-- ============================================================================
-- 2. CONTENT_ITEMS - FAQs
-- ============================================================================

INSERT INTO public.content_items (
  slug, content_type, source_type, title_pt, summary_pt, body_pt,
  topics, visibility, is_featured, status
) VALUES 
(
  'o-que-e-narcisismo',
  'faq',
  'internal',
  'O que é narcisismo?',
  'Entenda o que caracteriza o transtorno de personalidade narcisista.',
  'O narcisismo é um padrão de comportamento caracterizado por grandiosidade, necessidade de admiração e falta de empatia. É importante distinguir entre traços narcisistas (que todos podem ter em algum grau) e o Transtorno de Personalidade Narcisista (TPN), que é um diagnóstico clínico.

**Sinais comuns incluem:**
- Senso exagerado de autoimportância
- Preocupação com fantasias de sucesso ilimitado
- Crença de ser "especial" e único
- Necessidade excessiva de admiração
- Senso de direito/merecimento
- Comportamento explorador nas relações
- Falta de empatia
- Inveja dos outros ou crença de que os outros o invejam
- Comportamentos arrogantes',
  ARRAY['narcisismo', 'definição', 'básico'],
  'public',
  true,
  'published'
),
(
  'como-identificar-gaslighting',
  'faq',
  'internal',
  'Como identificar gaslighting?',
  'Aprenda a reconhecer essa forma de manipulação psicológica.',
  'Gaslighting é uma forma de manipulação psicológica onde a pessoa faz você duvidar da sua própria percepção, memória ou sanidade.

**Sinais de gaslighting:**
- "Isso nunca aconteceu"
- "Você está imaginando coisas"
- "Você é muito sensível"
- "Você está louca/louco"
- Negar fatos que você presenciou
- Minimizar seus sentimentos
- Mudar a história constantemente
- Fazer você se sentir "errada" o tempo todo

**O que fazer:**
- Confie na sua percepção
- Registre os acontecimentos (diário)
- Busque apoio de pessoas de confiança
- Considere ajuda profissional',
  ARRAY['gaslighting', 'manipulação', 'identificar'],
  'public',
  true,
  'published'
),
(
  'quando-buscar-ajuda-profissional',
  'faq',
  'internal',
  'Quando devo buscar ajuda profissional?',
  'Saiba quando é hora de procurar um psicólogo ou terapeuta.',
  'Buscar ajuda profissional é um passo importante e corajoso. Considere procurar um profissional quando:

**Sinais de que é hora de buscar ajuda:**
- Você se sente constantemente ansioso ou deprimido
- Seus relacionamentos estão afetando sua saúde mental
- Você tem dificuldade para funcionar no dia a dia
- Pensamentos intrusivos ou obsessivos
- Isolamento social
- Mudanças no sono ou apetite
- Sentimentos de desesperança

**Tipos de profissionais:**
- **Psicólogo:** Terapia e acompanhamento
- **Psiquiatra:** Avaliação e medicação se necessário
- **Assistente Social:** Orientação e encaminhamentos

**Lembre-se:** Pedir ajuda é sinal de força, não de fraqueza.',
  ARRAY['ajuda', 'profissional', 'terapia'],
  'public',
  true,
  'published'
),
(
  'como-sair-de-relacionamento-abusivo',
  'faq',
  'internal',
  'Como sair de um relacionamento abusivo?',
  'Orientações para planejar uma saída segura.',
  'Sair de um relacionamento abusivo requer planejamento e apoio. Sua segurança é prioridade.

**Passos importantes:**
1. **Reconheça a situação** - Você não merece ser maltratada
2. **Documente** - Guarde provas de abusos (mensagens, fotos)
3. **Planeje em segredo** - Não avise o abusador
4. **Prepare recursos** - Dinheiro, documentos, roupas
5. **Identifique apoio** - Amigos, família, abrigos
6. **Tenha um plano de fuga** - Saiba para onde ir

**Recursos de emergência:**
- Central de Atendimento à Mulher: 180
- Polícia: 190
- CRAS/CREAS da sua cidade

**Importante:** Se houver risco físico imediato, priorize sua segurança.',
  ARRAY['sair', 'relacionamento', 'abusivo', 'segurança'],
  'public',
  true,
  'published'
),
(
  'o-que-e-ciclo-do-abuso',
  'faq',
  'internal',
  'O que é o ciclo do abuso?',
  'Entenda as fases que se repetem em relacionamentos abusivos.',
  'O ciclo do abuso é um padrão que se repete em relacionamentos abusivos, tornando difícil sair.

**As 4 fases do ciclo:**

1. **Tensão crescente**
   - Irritabilidade, críticas, ciúmes
   - Você "anda em ovos" para não irritar

2. **Explosão**
   - Violência verbal, emocional ou física
   - Humilhação, ameaças, agressão

3. **Lua de mel**
   - Pedidos de desculpa
   - Promessas de mudança
   - Presentes, carinho excessivo

4. **Calmaria**
   - Período de "paz"
   - Esperança de que mudou
   - Até a tensão começar novamente

**Por que é difícil sair:**
- A fase de lua de mel cria esperança
- Trauma bonding (vínculo traumático)
- Medo, vergonha, dependência

**Lembre-se:** O ciclo tende a se intensificar com o tempo.',
  ARRAY['ciclo', 'abuso', 'fases', 'padrão'],
  'public',
  true,
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  title_pt = EXCLUDED.title_pt,
  summary_pt = EXCLUDED.summary_pt,
  body_pt = EXCLUDED.body_pt,
  updated_at = NOW();

-- ============================================================================
-- 3. CONTENT_ITEMS - Artigos/Notícias (Radar no Mundo)
-- ============================================================================

INSERT INTO public.content_items (
  slug, content_type, source_type, title_pt, summary_pt,
  original_url, topics, visibility, is_featured, status
) VALUES 
(
  'lei-maria-da-penha-completa-18-anos',
  'news',
  'external',
  'Lei Maria da Penha completa 18 anos',
  'A lei que revolucionou o combate à violência doméstica no Brasil celebra mais um aniversário.',
  'https://www.gov.br/mdh/pt-br',
  ARRAY['lei', 'violência', 'direitos'],
  'public',
  true,
  'published'
),
(
  'estudo-revela-impacto-abuso-emocional',
  'article',
  'external',
  'Estudo revela impacto do abuso emocional na saúde mental',
  'Pesquisa mostra que abuso emocional pode ter efeitos tão graves quanto abuso físico.',
  'https://www.scielo.br',
  ARRAY['estudo', 'abuso', 'saúde mental'],
  'public',
  true,
  'published'
),
(
  'como-apoiar-vitima-violencia-domestica',
  'article',
  'internal',
  'Como apoiar uma vítima de violência doméstica',
  'Guia prático para amigos e familiares que querem ajudar.',
  NULL,
  ARRAY['apoio', 'família', 'ajuda'],
  'public',
  true,
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  title_pt = EXCLUDED.title_pt,
  summary_pt = EXCLUDED.summary_pt,
  updated_at = NOW();

-- ============================================================================
-- 4. ACADEMY_COLLECTIONS (Radar Academy)
-- ============================================================================

INSERT INTO public.academy_collections (
  slug, name_pt, description_pt, is_premium, is_featured, sort_order
) VALUES 
(
  'entendendo-narcisismo',
  'Entendendo o Narcisismo',
  'Trilha completa para compreender o que é narcisismo e como ele afeta relacionamentos.',
  false,
  true,
  1
),
(
  'recuperacao-emocional',
  'Recuperação Emocional',
  'Exercícios e técnicas para reconstruir sua autoestima e saúde mental.',
  true,
  true,
  2
),
(
  'limites-saudaveis',
  'Estabelecendo Limites Saudáveis',
  'Aprenda a criar e manter limites em todos os seus relacionamentos.',
  false,
  true,
  3
),
(
  'documentacao-segura',
  'Documentação Segura',
  'Como registrar evidências de forma segura e organizada.',
  true,
  false,
  4
)
ON CONFLICT (slug) DO UPDATE SET
  name_pt = EXCLUDED.name_pt,
  description_pt = EXCLUDED.description_pt,
  updated_at = NOW();

-- ============================================================================
-- FIM DO SEED
-- ============================================================================

SELECT 'SEED FANPAGE CONTENT executado com sucesso!' as status;
