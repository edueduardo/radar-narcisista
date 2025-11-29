# 🚀 Setup do Mapa de IAs - Modo REAL vs MOCK

## 📋 O que foi implementado:

### ✅ **1. Sistema Dual (REAL/MOCK)**
- **Modo REAL:** Busca dados do Supabase (padrão)
- **Modo MOCK:** Usa dados fictícios para testes
- **Toggle visual** no painel para alternar

### ✅ **2. Componentes Criados**
- `/app/admin/mapa-ias/page.tsx` - Server component com autenticação
- `/app/admin/mapa-ias/AIMapClient.tsx` - UI completa com 3 colunas
- `/app/api/admin/ai-map/route.ts` - API com suporte a modo mock
- `/database/migrate-ai-agents.sql` - Script de migração
- `/database/ai-agents-mock.json` - Dados de exemplo

### ✅ **3. Funcionalidades**
- Cards de resumo (8 indicadores)
- Lista de IAs com status e filtros
- Detalhes por IA com métricas
- Sugestões da IA Guardiã
- Incidentes recentes
- Toggle ativar/desativar IAs

---

## 🔧 **Como Ativar o MODO REAL:**

### **Passo 1: Executar Migração no Supabase**
1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Cole e execute o conteúdo de `/database/migrate-ai-agents.sql`
4. Verifique se todas as tabelas foram criadas

### **Passo 2: Verificar no Painel**
1. Acesse: `http://localhost:3000/admin/mapa-ias`
2. Clique no botão **"Modo Real"** (verde)
3. Deve aparecer **"📊 MODO REAL"** no header

### **Passo 3: Configurar Logging Real**
Para capturar dados reais das IAs, adicione às suas APIs:

```typescript
// Exemplo em /api/ai/chat
import { createClient } from '@supabase/auth-helpers-nextjs'

// Log de uso da IA
async function logAIAgent(agentId: string, feature: string, success: boolean, latency: number, tokens: number, cost: number) {
  const supabase = createClient()
  await supabase.from('ai_usage_logs').insert({
    agent_id: agentId,
    feature_tag: feature,
    route: '/api/ai/chat',
    success,
    latency_ms: latency,
    tokens_used: tokens,
    cost_usd: cost
  })
}
```

---

## 🎮 **Como Usar o Modo MOCK:**

### **Para Testes/Demonstrações**
1. Acesse: `http://localhost:3000/admin/mapa-ias`
2. Clique no botão **"Modo Mock"** (laranja)
3. Aparece **"🔧 MODO MOCK"** no header
4. Dados fictícios são carregados imediatamente

### **URL Direta (opcional)**
- Modo Real: `/admin/mapa-ias`
- Modo Mock: `/admin/mapa-ias?mock=true`

---

## 📊 **Estrutura de Dados:**

### **Tabelas Principais**
```sql
ai_agents              -- Registro das IAs
ai_agent_metrics_daily -- Métricas diárias
ai_usage_logs          -- Logs de uso (detecta escopo)
ai_incidents           -- Incidentes e mudanças
ai_guardian_suggestions-- Sugestões automáticas
```

### **Status das IAs**
- 🟢 **HEALTHY** - Funcionando normal
- 🟡 **DEGRADED** - Lentidão/erros esporádicos
- 🟠 **PARTIAL** - Algumas funções falhando
- 🔴 **DOWN** - Fora de operação

---

## 🚨 **Estados Possíveis do Sistema:**

### **1. 📊 MODO REAL (Verde)**
- Buscando do Supabase
- Dados reais das IAs
- Logs funcionando

### **2. 🔧 MODO MOCK (Laranja)**
- Dados fictícios
- Para testes/demos
- Não afeta banco

### **3. ⚠️ SEM DADOS (Amarelo)**
- Tabelas não existem
- Execute migração SQL
- Sistema vazio mas funcional

---

## 🎯 **Próximos Passos:**

### **Implementação Real (Opcional)**
1. **Logging automático** nas chamadas de IA
2. **Cálculo de métricas** em tempo real
3. **Detecção automática** de violações de escopo
4. **IA Guardiã** para sugestões inteligentes
5. **Gráficos temporais** de performance

### **Features Avançadas**
- Troca automática de backup
- Alertas por email/Slack
- Previsão de custos
- Análise de padrões

---

## 🔍 **Como Verificar Funcionamento:**

### **No Console do Navegador**
```javascript
// Ver modo atual
fetch('/api/admin/ai-map').then(r => r.json()).then(console.log)

// Forçar modo mock
fetch('/api/admin/ai-map?mock=true').then(r => r.json()).then(console.log)
```

### **No Console do Servidor**
- `📊 MODO REAL ATIVADO` - buscando do Supabase
- `🔧 MODO MOCK ATIVADO` - usando dados fictícios
- `⚠️ Tabelas não encontradas` - execute migração

---

## ✅ **Resumo:**

- **✅ Sistema implementado** com toggle real/mock
- **✅ Interface completa** funcionando
- **✅ API preparada** para modo real
- **✅ Migração SQL** pronta para executar
- **✅ Documentação** completa

**O padrão é MODO REAL!** Mock só quando ativo explicitamente. 🎯
