# 🔮 PATCHES OFICIAIS DO ORÁCULO (DOCUMENTO UNIFICADO)

> **Versão:** 1.0  
> **Criado em:** 01/12/2025  
> **Prioridade:** MÁXIMA – Este documento tem prioridade sobre qualquer texto antigo

---

## ⚠️ AVISO IMPORTANTE

Este documento consolida TODOS os patches do Oráculo em um único lugar.
Sempre que houver conflito entre textos antigos e este documento → ESTE DOCUMENTO TEM PRIORIDADE.

---

# PATCH 1 – CORREÇÃO CONCEITUAL (BLOCO 21-25)

## Dois Oráculos Diferentes

### ORÁCULO V1 – PAINEL ADMIN
- **Rota:** `/admin/oraculo`
- **Função:** Painel de métricas e visão geral do produto
- **Perfil:** SOMENTE ADMIN / DONO DO PRODUTO
- **Status:** ✅ JÁ EXISTE

### ORÁCULO V2 – IA INTERNA DE SUPORTE
- **Rota de API:** `/api/oraculo-v2`
- **Função:** IA que ajuda a entender o produto, dados, métricas, erros
- **BLOCO 21-25:** Uso EXCLUSIVO DO ADMIN
- **BLOCO 26-30:** Abertura para outros perfis (FUTURO)

## Regra de Interpretação

| Texto Antigo | Interpretação Correta |
|--------------|----------------------|
| "Oráculo V2 atende usuária/profissional AGORA" | FUTURO BLOCO 26-30, não implementado em 21-25 |
| "Oráculo para todos os perfis" | PLANEJADO, não implementado |

---

# PATCH 2 – ORÁCULO MULTIPERFIL & GERADOR DE SAAS (BLOCO 26-30)

## Decisão Oficial para o Futuro

### ORÁCULO V2 MULTIPERFIL
O mesmo núcleo de IA passará a atender TODOS os perfis:
- `user_role = "usuaria"`
- `user_role = "profissional"`
- `user_role = "admin"`
- `user_role = "dev"`
- `user_role = "whitelabel"`

### ORACULO_V2_CORE
- Módulo central reutilizável
- Usado no Radar Narcisista
- Acoplável pelo Gerador de SaaS
- Todo SaaS gerado pode nascer com Oráculo embutido

---

# PATCH 3A – CONTROLE POR PLANO, PERFIL E LIMITES

## Controle pelo Admin

O ADMIN tem CONTROLE TOTAL sobre o uso do ORÁCULO V2:

### Status por Plano/Perfil
- `0` = Desativado (não aparece nem responde)
- `1` = Modo teste/limitado (com limites)
- `2` = Modo completo (sem limites)

### Limites por Período
- `limite_diario`
- `limite_semanal`
- `limite_quinzenal`
- `limite_mensal`

### Estrutura de Dados

```sql
-- Tabela oraculo_plan_settings
CREATE TABLE oraculo_plan_settings (
  id UUID PRIMARY KEY,
  plan_slug TEXT,           -- 'free', 'pro', 'enterprise'
  user_role TEXT,           -- 'usuaria', 'profissional', etc.
  status INTEGER,           -- 0=off, 1=teste, 2=completo
  limite_diario INTEGER,
  limite_semanal INTEGER,
  limite_quinzenal INTEGER,
  limite_mensal INTEGER
);

-- Tabela oraculo_usage
CREATE TABLE oraculo_usage (
  id UUID PRIMARY KEY,
  user_id UUID,
  user_role TEXT,
  plan_slug TEXT,
  periodo_ref TEXT,         -- '2025-12-01-dia', '2025-12-semana-01'
  qtd_perguntas INTEGER,
  created_at TIMESTAMPTZ
);
```

---

# PATCH 3B – ETAPA 31: REFORMA DA FRONT PAGE

## Objetivo

Criar front page única, enxuta e inteligente que:
- Conta a história COMPLETA do Radar (até etapa 30)
- Mostra claramente para quem é
- Explica o que o sistema faz HOJE
- Permite cadastro e contato

## Estrutura Sugerida

1. **Hero** - Título forte + CTAs
2. **Para quem é** - Cards por perfil
3. **Como funciona** - Módulos principais
4. **Planos** - Free e pagos
5. **Profissionais/ONGs/Whitelabel** - Seção específica
6. **Oráculo & Roadmap** - Explicação honesta
7. **Chamada final** - CTAs repetidos

---

# PATCH 4 – MATRIZ OFICIAL ORÁCULO V1/V2

## Radar Principal (Mestre)

| Perfil | ORÁCULO V1 | ORÁCULO V2 |
|--------|------------|------------|
| usuaria | ❌ NÃO VÊ | ✅ Se plano permitir |
| profissional | ❌ NÃO VÊ | ✅ Se habilitado |
| admin/owner | ✅ SEMPRE VÊ | ✅ Pode usar |

## Whitelabel (Parceiros)

| Perfil | ORÁCULO V1 | ORÁCULO V2 |
|--------|------------|------------|
| usuária final | ❌ NÃO VÊ | ✅ Se admin habilitar |
| profissional | ❌ NÃO VÊ | ✅ Se habilitado |
| admin whitelabel | ✅ VÊ (dados dele) | ✅ Pode usar |

## Gerador de SaaS

Todo SaaS gerado possui capacidade de ter V1 e V2:
- `[x] Incluir painel de inteligência (V1) para admin`
- `[x] Incluir assistente de suporte (V2) para usuários`
- Configurações iniciais de planos/limites

---

# REGRAS DE COMUNICAÇÃO WINDSURF ↔ CHATGPT

## Fluxo Obrigatório

1. **ANTES** de iniciar etapa: Windsurf apresenta sugestões
2. **ChatGPT analisa** e decide o que implementar
3. **Só depois** Windsurf executa

## Palavras Proibidas

| ❌ NÃO USAR | ✅ USAR |
|-------------|---------|
| "Opcional" | Listar diretamente |
| "Ou" em bullets | Bullets separados |
| "Se quiser" | Listar diretamente |
| "Talvez" | Ser específico |

## Seções Obrigatórias no Resumo

1. ⚠️ OPINIÃO DO WINDSURF PARA O CHATGPT
2. MELHORIAS IDENTIFICADAS
3. PRÓXIMA AÇÃO SUGERIDA

---

# ETAPAS DO BLOCO 26-30

| Etapa | Descrição | Status |
|-------|-----------|--------|
| 26 | Template de resumo + checklist + regras | 🔄 Em andamento |
| 27 | ORACULO_V2_CORE (núcleo reutilizável) | ⏳ Pendente |
| 28 | Infra multiperfil (flags por plano/perfil) | ⏳ Pendente |
| 29 | Expor Oráculo V2 para outros perfis (Fase 1) | ⏳ Pendente |
| 30 | Integração com Gerador de SaaS + QA | ⏳ Pendente |

# ETAPAS FUTURAS

| Etapa | Descrição | Status |
|-------|-----------|--------|
| 31 | Reforma inteligente da Front Page | ⏳ Futuro |
| 32 | Matriz Oráculo multi-instância | ⏳ Futuro |

---

*Este documento deve ser consultado por Windsurf e ChatGPT em todas as interações relacionadas ao Oráculo.*
