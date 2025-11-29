-- ============================================
-- BANCO DE PERGUNTAS DO QUIZ - Radar Narcisista
-- ============================================

-- Enum para categorias
CREATE TYPE quiz_category AS ENUM (
  'INVALIDACAO',
  'GASLIGHTING',
  'CULPABILIZACAO',
  'MANIPULACAO',
  'AMEACAS',
  'ISOLAMENTO',
  'IDEALIZACAO_LOVE_BOMBING',
  'DEPENDENCIA',
  'DESVALORIZACAO',
  'DESCARTE_ABANDONO',
  'HOOVERING',
  'IDENTIFICACAO_VITIMA',
  'IDENTIFICACAO_AGRESSOR'
);

-- Enum para fases do ciclo de abuso
CREATE TYPE abuse_phase AS ENUM (
  'FASE_1_IDEALIZACAO',
  'FASE_2_DEPENDENCIA',
  'FASE_3_DESVALORIZACAO',
  'FASE_4_DESCARTE',
  'FASE_5_HOOVERING'
);

-- Enum para tipo de pergunta
CREATE TYPE question_type AS ENUM (
  'ESCALA',
  'SIM_NAO',
  'MULTIPLA_ESCOLHA',
  'FREQUENCIA'
);

-- Enum para status da pergunta
CREATE TYPE question_status AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED'
);

-- Enum para perspectiva alvo
CREATE TYPE target_perspective AS ENUM (
  'VITIMA',
  'AGRESSOR',
  'AMBOS'
);

-- ============================================
-- TABELA PRINCIPAL DE PERGUNTAS
-- ============================================

CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Categorização
  category quiz_category NOT NULL,
  phase abuse_phase,
  type question_type NOT NULL DEFAULT 'FREQUENCIA',
  
  -- Conteúdo
  text TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL DEFAULT '[]',
  
  -- Metadados
  weight INTEGER NOT NULL DEFAULT 2 CHECK (weight >= 1 AND weight <= 3),
  target_perspective target_perspective NOT NULL DEFAULT 'VITIMA',
  tags TEXT[] DEFAULT '{}',
  source TEXT,
  
  -- Status e aprovação
  status question_status NOT NULL DEFAULT 'PENDING',
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  
  -- IA
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  ai_model TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_quiz_questions_category ON quiz_questions(category);
CREATE INDEX idx_quiz_questions_status ON quiz_questions(status);
CREATE INDEX idx_quiz_questions_phase ON quiz_questions(phase);
CREATE INDEX idx_quiz_questions_ai_generated ON quiz_questions(ai_generated);

-- Trigger para updated_at
CREATE TRIGGER update_quiz_questions_updated_at
  BEFORE UPDATE ON quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA DE CONFIGURAÇÃO DO GERADOR
-- ============================================

CREATE TABLE quiz_generator_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  enabled BOOLEAN NOT NULL DEFAULT true,
  auto_generate BOOLEAN NOT NULL DEFAULT false,
  model TEXT NOT NULL DEFAULT 'gpt-4',
  questions_per_batch INTEGER NOT NULL DEFAULT 5,
  categories quiz_category[] DEFAULT ARRAY['GASLIGHTING', 'MANIPULACAO', 'ISOLAMENTO']::quiz_category[],
  privacy_mode TEXT NOT NULL DEFAULT 'aggregated_only',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir configuração padrão
INSERT INTO quiz_generator_config (enabled, model, questions_per_batch)
VALUES (true, 'gpt-4', 5);

-- ============================================
-- TABELA DE LOG DE GERAÇÃO
-- ============================================

CREATE TABLE quiz_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  category quiz_category NOT NULL,
  model TEXT NOT NULL,
  questions_requested INTEGER NOT NULL,
  questions_generated INTEGER NOT NULL,
  
  success BOOLEAN NOT NULL,
  error_message TEXT,
  
  generated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice
CREATE INDEX idx_quiz_generation_logs_created_at ON quiz_generation_logs(created_at DESC);

-- ============================================
-- TABELA DE RESPOSTAS DOS USUÁRIOS
-- ============================================

CREATE TABLE quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,  -- Para usuários não logados
  
  question_id UUID REFERENCES quiz_questions(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,  -- Snapshot do texto
  
  selected_option_id TEXT NOT NULL,
  selected_option_value INTEGER NOT NULL,
  is_red_flag BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_quiz_responses_user_id ON quiz_responses(user_id);
CREATE INDEX idx_quiz_responses_session_id ON quiz_responses(session_id);
CREATE INDEX idx_quiz_responses_question_id ON quiz_responses(question_id);

-- ============================================
-- TABELA DE RESULTADOS DO QUIZ
-- ============================================

CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  
  -- Pontuação
  total_score INTEGER NOT NULL,
  max_possible_score INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  
  -- Classificação
  zone TEXT NOT NULL,  -- 'verde', 'amarela', 'laranja', 'vermelha'
  zone_label TEXT NOT NULL,
  
  -- Detalhes por categoria
  scores_by_category JSONB NOT NULL DEFAULT '{}',
  red_flags_count INTEGER NOT NULL DEFAULT 0,
  
  -- Metadados
  questions_answered INTEGER NOT NULL,
  time_spent_seconds INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_session_id ON quiz_results(session_id);
CREATE INDEX idx_quiz_results_zone ON quiz_results(zone);
CREATE INDEX idx_quiz_results_created_at ON quiz_results(created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_generator_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Quiz Questions: Leitura pública para aprovadas, escrita apenas admin
CREATE POLICY "Perguntas aprovadas são públicas" ON quiz_questions
  FOR SELECT USING (status = 'APPROVED');

CREATE POLICY "Admin pode gerenciar perguntas" ON quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Config: Apenas admin
CREATE POLICY "Admin pode gerenciar config" ON quiz_generator_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Logs: Apenas admin pode ver
CREATE POLICY "Admin pode ver logs" ON quiz_generation_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Responses: Usuário vê apenas suas respostas
CREATE POLICY "Usuário vê suas respostas" ON quiz_responses
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Qualquer um pode inserir resposta" ON quiz_responses
  FOR INSERT WITH CHECK (true);

-- Results: Usuário vê apenas seus resultados
CREATE POLICY "Usuário vê seus resultados" ON quiz_results
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Qualquer um pode inserir resultado" ON quiz_results
  FOR INSERT WITH CHECK (true);

-- ============================================
-- VIEWS PARA ESTATÍSTICAS
-- ============================================

CREATE VIEW v_quiz_stats AS
SELECT
  COUNT(*) as total_questions,
  COUNT(*) FILTER (WHERE status = 'APPROVED') as approved,
  COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
  COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected,
  COUNT(*) FILTER (WHERE ai_generated = true) as ai_generated,
  COUNT(*) FILTER (WHERE ai_generated = false) as manual
FROM quiz_questions;

CREATE VIEW v_quiz_stats_by_category AS
SELECT
  category,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'APPROVED') as approved
FROM quiz_questions
GROUP BY category
ORDER BY total DESC;

CREATE VIEW v_quiz_results_stats AS
SELECT
  zone,
  COUNT(*) as total,
  AVG(percentage) as avg_percentage,
  AVG(red_flags_count) as avg_red_flags
FROM quiz_results
GROUP BY zone;

-- ============================================
-- FUNÇÃO PARA OBTER QUIZ RANDOMIZADO
-- ============================================

CREATE OR REPLACE FUNCTION get_randomized_quiz(
  p_count INTEGER DEFAULT 12,
  p_categories quiz_category[] DEFAULT NULL
)
RETURNS SETOF quiz_questions
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM quiz_questions
  WHERE status = 'APPROVED'
    AND (p_categories IS NULL OR category = ANY(p_categories))
  ORDER BY RANDOM()
  LIMIT p_count;
END;
$$;

-- ============================================
-- SEED: PERGUNTAS INICIAIS
-- ============================================

INSERT INTO quiz_questions (category, phase, type, text, description, options, weight, target_perspective, tags, status, ai_generated) VALUES

-- GASLIGHTING
('GASLIGHTING', NULL, 'FREQUENCIA', 
 'Você já ouviu frases como "isso nunca aconteceu" ou "você está inventando coisas"?',
 'Quando você tenta falar sobre algo que aconteceu',
 '[{"id":"opt_0","text":"Nunca","value":0,"isRed":false},{"id":"opt_1","text":"Raramente","value":1,"isRed":false},{"id":"opt_2","text":"Às vezes","value":2,"isRed":false},{"id":"opt_3","text":"Frequentemente","value":3,"isRed":true},{"id":"opt_4","text":"Sempre","value":4,"isRed":true}]',
 3, 'VITIMA', ARRAY['memoria', 'negacao', 'confusao'], 'APPROVED', false),

('GASLIGHTING', NULL, 'FREQUENCIA',
 'Você sente que sua memória está piorando ou que não pode confiar nas suas lembranças?',
 NULL,
 '[{"id":"opt_0","text":"Nunca","value":0,"isRed":false},{"id":"opt_1","text":"Raramente","value":1,"isRed":false},{"id":"opt_2","text":"Às vezes","value":2,"isRed":false},{"id":"opt_3","text":"Frequentemente","value":3,"isRed":true},{"id":"opt_4","text":"Sempre","value":4,"isRed":true}]',
 3, 'VITIMA', ARRAY['memoria', 'autoconfianca'], 'APPROVED', false),

-- LOVE BOMBING
('IDEALIZACAO_LOVE_BOMBING', 'FASE_1_IDEALIZACAO', 'FREQUENCIA',
 'No início do relacionamento, a pessoa te encheu de atenção, presentes e declarações intensas muito rapidamente?',
 NULL,
 '[{"id":"opt_0","text":"Não","value":0,"isRed":false},{"id":"opt_1","text":"Um pouco","value":1,"isRed":false},{"id":"opt_2","text":"Moderadamente","value":2,"isRed":false},{"id":"opt_3","text":"Bastante","value":3,"isRed":true},{"id":"opt_4","text":"Extremamente","value":4,"isRed":true}]',
 2, 'VITIMA', ARRAY['inicio', 'intensidade', 'presentes'], 'APPROVED', false),

-- ISOLAMENTO
('ISOLAMENTO', 'FASE_2_DEPENDENCIA', 'FREQUENCIA',
 'A pessoa critica ou fala mal dos seus amigos e familiares?',
 NULL,
 '[{"id":"opt_0","text":"Nunca","value":0,"isRed":false},{"id":"opt_1","text":"Raramente","value":1,"isRed":false},{"id":"opt_2","text":"Às vezes","value":2,"isRed":false},{"id":"opt_3","text":"Frequentemente","value":3,"isRed":true},{"id":"opt_4","text":"Sempre","value":4,"isRed":true}]',
 2, 'VITIMA', ARRAY['familia', 'amigos', 'critica'], 'APPROVED', false),

('ISOLAMENTO', 'FASE_2_DEPENDENCIA', 'FREQUENCIA',
 'Você deixou de ver pessoas importantes para você por causa do relacionamento?',
 NULL,
 '[{"id":"opt_0","text":"Não","value":0,"isRed":false},{"id":"opt_1","text":"Uma ou duas pessoas","value":1,"isRed":false},{"id":"opt_2","text":"Algumas pessoas","value":2,"isRed":false},{"id":"opt_3","text":"Muitas pessoas","value":3,"isRed":true},{"id":"opt_4","text":"Quase todos","value":4,"isRed":true}]',
 3, 'VITIMA', ARRAY['afastamento', 'rede_apoio'], 'APPROVED', false),

-- DESVALORIZAÇÃO
('DESVALORIZACAO', 'FASE_3_DESVALORIZACAO', 'FREQUENCIA',
 'A pessoa faz comentários que diminuem suas conquistas ou capacidades?',
 NULL,
 '[{"id":"opt_0","text":"Nunca","value":0,"isRed":false},{"id":"opt_1","text":"Raramente","value":1,"isRed":false},{"id":"opt_2","text":"Às vezes","value":2,"isRed":false},{"id":"opt_3","text":"Frequentemente","value":3,"isRed":true},{"id":"opt_4","text":"Sempre","value":4,"isRed":true}]',
 2, 'VITIMA', ARRAY['critica', 'autoestima', 'conquistas'], 'APPROVED', false),

-- MANIPULAÇÃO
('MANIPULACAO', NULL, 'FREQUENCIA',
 'Você sente que precisa "pisar em ovos" para não irritar a pessoa?',
 NULL,
 '[{"id":"opt_0","text":"Nunca","value":0,"isRed":false},{"id":"opt_1","text":"Raramente","value":1,"isRed":false},{"id":"opt_2","text":"Às vezes","value":2,"isRed":false},{"id":"opt_3","text":"Frequentemente","value":3,"isRed":true},{"id":"opt_4","text":"Sempre","value":4,"isRed":true}]',
 3, 'VITIMA', ARRAY['medo', 'cuidado', 'tensao'], 'APPROVED', false),

('MANIPULACAO', NULL, 'FREQUENCIA',
 'A pessoa usa chantagem emocional (chorar, ameaçar se machucar) para conseguir o que quer?',
 NULL,
 '[{"id":"opt_0","text":"Nunca","value":0,"isRed":false},{"id":"opt_1","text":"Raramente","value":1,"isRed":false},{"id":"opt_2","text":"Às vezes","value":2,"isRed":false},{"id":"opt_3","text":"Frequentemente","value":3,"isRed":true},{"id":"opt_4","text":"Sempre","value":4,"isRed":true}]',
 3, 'VITIMA', ARRAY['chantagem', 'emocional', 'controle'], 'APPROVED', false),

-- CULPABILIZAÇÃO
('CULPABILIZACAO', NULL, 'FREQUENCIA',
 'Quando algo dá errado, a culpa sempre acaba sendo sua de alguma forma?',
 NULL,
 '[{"id":"opt_0","text":"Nunca","value":0,"isRed":false},{"id":"opt_1","text":"Raramente","value":1,"isRed":false},{"id":"opt_2","text":"Às vezes","value":2,"isRed":false},{"id":"opt_3","text":"Frequentemente","value":3,"isRed":true},{"id":"opt_4","text":"Sempre","value":4,"isRed":true}]',
 2, 'VITIMA', ARRAY['culpa', 'responsabilidade'], 'APPROVED', false),

-- HOOVERING
('HOOVERING', 'FASE_5_HOOVERING', 'SIM_NAO',
 'Após um término ou afastamento, a pessoa voltou prometendo mudanças e sendo muito carinhosa?',
 NULL,
 '[{"id":"opt_0","text":"Não","value":0,"isRed":false},{"id":"opt_1","text":"Uma vez","value":1,"isRed":false},{"id":"opt_2","text":"Algumas vezes","value":2,"isRed":true},{"id":"opt_3","text":"Várias vezes","value":3,"isRed":true},{"id":"opt_4","text":"É um padrão constante","value":4,"isRed":true}]',
 2, 'VITIMA', ARRAY['volta', 'promessas', 'ciclo'], 'APPROVED', false),

-- IDENTIFICAÇÃO VÍTIMA
('IDENTIFICACAO_VITIMA', NULL, 'FREQUENCIA',
 'Você sente que perdeu sua identidade ou não sabe mais quem você é?',
 NULL,
 '[{"id":"opt_0","text":"Não","value":0,"isRed":false},{"id":"opt_1","text":"Um pouco","value":1,"isRed":false},{"id":"opt_2","text":"Moderadamente","value":2,"isRed":false},{"id":"opt_3","text":"Bastante","value":3,"isRed":true},{"id":"opt_4","text":"Completamente","value":4,"isRed":true}]',
 3, 'VITIMA', ARRAY['identidade', 'autoconhecimento'], 'APPROVED', false),

('IDENTIFICACAO_VITIMA', NULL, 'FREQUENCIA',
 'Você se pega justificando ou defendendo comportamentos da pessoa para outras pessoas?',
 NULL,
 '[{"id":"opt_0","text":"Nunca","value":0,"isRed":false},{"id":"opt_1","text":"Raramente","value":1,"isRed":false},{"id":"opt_2","text":"Às vezes","value":2,"isRed":false},{"id":"opt_3","text":"Frequentemente","value":3,"isRed":true},{"id":"opt_4","text":"Sempre","value":4,"isRed":true}]',
 2, 'VITIMA', ARRAY['defesa', 'justificativa', 'negacao'], 'APPROVED', false);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON quiz_questions TO authenticated;
GRANT SELECT ON quiz_questions TO anon;
GRANT ALL ON quiz_generator_config TO authenticated;
GRANT SELECT ON quiz_generation_logs TO authenticated;
GRANT ALL ON quiz_responses TO authenticated;
GRANT INSERT ON quiz_responses TO anon;
GRANT ALL ON quiz_results TO authenticated;
GRANT INSERT ON quiz_results TO anon;
GRANT SELECT ON v_quiz_stats TO authenticated;
GRANT SELECT ON v_quiz_stats_by_category TO authenticated;
GRANT SELECT ON v_quiz_results_stats TO authenticated;
