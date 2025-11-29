# AI Flow Orchestrator v2.0 - Templates, Sugestões & Laboratório Seguro

## Visão Geral

Evolução do AI Flow Orchestrator para incluir **templates oficiais**, **sistema de sugestões** e **experiência de laboratório seguro**, conforme PROMPT B, além de **Hash SHA-256** para integridade de episódios.

## Funcionalidades Implementadas

### 1. Templates de Fluxos (`ai_flow_templates`)

**Schema:**
- `id` (uuid, pk)
- `name` (text) - Nome do template
- `description` (text) - Descrição detalhada
- `category` (text) - Categoria: "Risco", "Relatório", "Emergência", etc.
- `definition` (jsonb) - Nodes + edges genéricos
- `is_official` (boolean) - Templates oficiais do produto
- `created_at`, `updated_at`

**Templates Mock Criados:**
1. **Fluxo de Risco Padrão** - Detecta padrões de risco em episódios
2. **Fluxo de Resumo Semanal** - Gera resumo semanal do diário
3. **Fluxo de Alerta Emergência** - Aciona alerta ao pressionar botão

**APIs:**
- `GET /api/admin/ai-flows/templates` - Listar templates
- `POST /api/admin/ai-flows/templates` - Criar fluxo a partir de template

**UI:**
- Nova aba "Templates" em `/admin/fluxos-ia`
- Lista templates com categoria e badge "Oficial"
- Botão "Criar Fluxo" para clonar template

### 2. Sistema de Sugestões (`ai_flow_suggestions`)

**Schema:**
- `id` (uuid, pk)
- `flow_id` (fk → ai_flows) - Opcional (null para sugestões gerais)
- `type` (enum) - 'IMPROVEMENT', 'RISK', 'NEW_FLOW_IDEA'
- `title` (text) - Título da sugestão
- `description` (text) - Descrição detalhada
- `status` (enum) - 'OPEN', 'ACCEPTED', 'REJECTED', 'DONE'
- `created_at`, `updated_at`

**APIs:**
- `GET /api/admin/ai-flows/[id]/suggestions` - Listar sugestões do fluxo
- `POST /api/admin/ai-flows/[id]/suggestions` - Criar nova sugestão
- `PUT /api/admin/ai-flows/[id]/suggestions` - Atualizar status
- `POST /api/admin/ai-flows/[id]/suggestions/seed` - Criar sugestões mock

**UI:**
- Painel "Sugestões & Riscos" no builder (`/admin/fluxos-ia/[id]`)
- Ícones por tipo: 🔴 Risco, 💡 Melhoria, 🔵 Nova ideia
- Botões para aceitar/rejeitar sugestões abertas
- Botão "+ Criar sugestões mock" para demonstração

### 3. Laboratório Seguro (UX)

**Banner no Builder:**
- Status de revisão com badges coloridos
- Janela de validação com countdown
- **Texto de alerta amarelo:** "LABORATÓRIO EM MODO SIMULAÇÃO • Nenhuma execução aqui altera dados de produção."

**Restrições:**
- Todos os fluxos criados via template: `simulation_only = true`
- Execução em modo real bloqueada por padrão
- Aviso visual claro sobre modo simulação

### 4. Hash SHA-256 para Episódios

**Schema:**
- `episode_hashes` - Tabela com hash SHA-256 de cada episódio
- `generate_sha256_hash()` - Função SQL para gerar hash

**Utilitários (`lib/hash-utils.ts`):**
- `generateSHA256Hash(content)` - Gera hash de qualquer string
- `generateEpisodeHash(episode)` - Gera hash do episódio (campos principais)
- `verifyEpisodeIntegrity()` - Verifica se episódio foi alterado
- `formatHashForPDF()` - Formata hash para rodapé de PDF

**APIs:**
- `POST /api/admin/episodes/hash` - Gerar hash para episódio
- `GET /api/admin/episodes/hash?episodeId=X` - Buscar hash pelo ID
- `GET /api/admin/episodes/hash?hash=X` - Buscar episódio pelo hash

## Como Usar

### 1. Aplicar Migração

```sql
-- Execute no Supabase SQL Editor
-- Arquivo: database/migrate-ai-flows-templates.sql
```

### 2. Usar Templates

1. Acesse `/admin/fluxos-ia`
2. Clique na aba "Templates"
3. Escolha um template oficial
4. Clique "Criar Fluxo"
5. Dê um nome personalizado
6. Será redirecionado para o builder

### 3. Gerenciar Sugestões

1. No builder de fluxos, role até "Sugestões & Riscos"
2. Clique "+ Criar sugestões mock" para demonstração
3. Use ✅ ou ❌ para aceitar/rejeitar sugestões
4. Status atualizados automaticamente

### 4. Hash SHA-256

```javascript
import { generateEpisodeHash } from '@/lib/hash-utils'

// Gerar hash ao criar episódio
const hash = generateEpisodeHash(episode)

// Verificar integridade
const isValid = verifyEpisodeIntegrity(originalHash, currentEpisode)
```

### 5. Smoke Test Completo

```powershell
$env:ADMIN_TOKEN = "SEU_TOKEN_ADMIN"
.\scripts\test-fluxos-ia-validation.ps1
```

## Arquivos Criados/Alterados

### Novos Arquivos
- `database/migrate-ai-flows-templates.sql` - Schema templates + sugestões + hash
- `app/api/admin/ai-flows/templates/route.ts` - API de templates
- `app/api/admin/ai-flows/[id]/suggestions/route.ts` - API de sugestões
- `app/api/admin/ai-flows/[id]/suggestions/seed/route.ts` - Mock de sugestões
- `app/api/admin/episodes/hash/route.ts` - API de hash SHA-256
- `lib/hash-utils.ts` - Utilitários de hash
- `docs/ai-flow-templates-sugestoes-lab.md` - Esta documentação

### Arquivos Alterados
- `app/admin/fluxos-ia/FlowsClient.tsx` - Aba templates + UI
- `app/admin/fluxos-ia/[id]/FlowBuilderClient.tsx` - Banner laboratório + painel sugestões
- `scripts/test-fluxos-ia-validation.ps1` - Smoke test atualizado

## Confirmações de Segurança

✅ **Nenhum template ou sugestão foi ligado automaticamente a eventos reais**  
✅ **Toda execução continua em modo simulação**  
✅ **Não alterei auth, Stripe, LGPD, RLS ou tabelas de usuário final**  
✅ **Banner exibe claramente "LABORATÓRIO EM MODO SIMULAÇÃO"**  
✅ **Hash SHA-256 armazenado separadamente, sem afetar episódios originais**

## Próximos Passos (Opcionais)

- Relatórios PDF com hash no rodapé
- Página pública de verificação de hash (`/verificar/[hash]`)
- IA gerando sugestões automaticamente
- Integração com sistema de tickets para validação

---

**Status da implementação:** ✅ Completo (Prompt B + Hash SHA-256)
