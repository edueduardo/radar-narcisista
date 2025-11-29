-- Script para limpar apenas os tipos que estão causando conflito
-- Use este script ANTES de rodar o schema.sql original

-- Drop types com CASCADE para remover dependências
DROP TYPE IF EXISTS ai_suggestion_status CASCADE;
DROP TYPE IF EXISTS ai_suggestion_category CASCADE;
DROP TYPE IF EXISTS ai_message_role CASCADE;
DROP TYPE IF EXISTS chat_session_kind CASCADE;
DROP TYPE IF EXISTS journal_context CASCADE;
DROP TYPE IF EXISTS clarity_zone CASCADE;

-- Também remove a tabela ai_suggestions que pode estar causando problemas
DROP TABLE IF EXISTS public.ai_suggestions CASCADE;

-- Confirmação
SELECT 'Types limpos com sucesso!' AS status;
