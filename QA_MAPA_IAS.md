# 🧪 QA MANUAL – MAPA DE IAs

**Data:** ___/___/2025  
**Testador:** _______________  
**Versão do documento:** 1.1  
**Sistema:** Radar Narcisista – Mapa de IAs

> ⚠️ **IMPORTANTE:**  
> Este checklist cobre tanto:
> - ✅ **Funcionalidades CORE (MVP do Mapa de IAs)**  
> - 🔁 **Funcionalidades AVANÇADAS** (árvore visual, camadas, guardiã "inteligente" etc.)
>
> Se algo marcado como **AVANÇADO** ainda não foi implementado no código, marque como:
> > "❌ Não implementado (escopo futuro)"  
> e **não** como bug.

---

## 🔍 PARTE 1: VERIFICAÇÃO DE ARQUIVOS (Pré-requisito técnico)

### 1.1 Arquivos que DEVEM existir

| Arquivo | Existe? | Nível | Observação |
|---------|---------|-------|------------|
| `/app/admin/mapa-ias/page.tsx` | [ ] | CORE | Server component (rota da página) |
| `/app/admin/mapa-ias/AIMapClient.tsx` | [ ] | CORE | Client component principal |
| `/app/api/admin/ai-map/route.ts` | [ ] | CORE | API endpoint |
| `/database/migrate-ai-agents.sql` | [ ] | CORE | Schema SQL (tabelas ai_*) |
| `/database/ai-agents-mock.json` (se existir) | [ ] | OPCIONAL | Dados mock (pode estar inline na API) |
| `/components/AITreeView.tsx` | [ ] | AVANÇADO | Árvore visual |
| `/components/AIMetricsCharts.tsx` | [ ] | AVANÇADO | Gráficos |
| `/components/AIBackupManager.tsx` | [ ] | AVANÇADO | Gerenciador backup |
| `/components/AIGuardian.tsx` | [ ] | AVANÇADO | IA Guardiã |
| `/components/AILayerView.tsx` | [ ] | AVANÇADO | Visão por camadas |

**Como verificar no Windows (PowerShell):**
```powershell
# No terminal, na pasta do projeto:
dir app\admin\mapa-ias\
dir app\api\admin\ai-map\
dir database\
dir components\AI*
```

- Se algum arquivo **CORE** não existir → funcionalidade principal do Mapa de IAs não está implementada.
- Se arquivos **AVANÇADOS** não existirem → anotar como "não implementado (escopo futuro)".

---

## 🖥️ PARTE 2: TESTE VISUAL NA INTERFACE (Mapa de IAs)

### 2.1 Acesso à Página

**URL:** `http://localhost:3000/admin/mapa-ias`

| Teste | Passou? | Observação |
|-------|---------|------------|
| Página carrega sem erro 500 | [ ] | |
| Não aparece "404 Not Found" | [ ] | |
| Não aparece erro de compilação | [ ] | |
| Requer login de admin (ou ao menos estar logado) | [ ] | |

### 2.2 Estrutura Visual (Layout 3 Colunas – CORE)

| Elemento | Existe? | Funciona? | Observação |
|----------|---------|-----------|------------|
| **HEADER** | | | |
| Título "Mapa das IAs" (ou similar) | [ ] | - | |
| Badge de modo (Real/Mock ou equivalente) | [ ] | [ ] | |
| Botão toggle Real/Mock | [ ] | [ ] | |
| Cards de resumo (total IAs, ativas, saudáveis etc.) | [ ] | [ ] | |
| **COLUNA ESQUERDA** | | | |
| Lista de IAs (simples ou em árvore) | [ ] | [ ] | |
| Opcional: filtros (camada/status) | [ ] | [ ] | |
| **COLUNA CENTRAL** | | | |
| Área de detalhes da IA selecionada | [ ] | [ ] | |
| Exibe função, camada, provider/model | [ ] | [ ] | |
| Exibe métricas (Chamadas, Erro, Latência, Custo) | [ ] | [ ] | |
| Gráficos ou valores numéricos básicos | [ ] | [ ] | |
| **COLUNA DIREITA** | | | |
| Área com sugestões / incidentes / controles | [ ] | [ ] | |
| Pelo menos 1 tab funcional (ex.: Controle) | [ ] | [ ] | |

### 2.3 Interações Básicas (CORE)

| Ação | Resultado Esperado | Passou? | Observação |
|------|-------------------|---------|------------|
| Clicar em uma IA na lista | Detalhes aparecem na coluna central | [ ] | |
| Clicar em outra IA | Detalhes mudam corretamente | [ ] | |
| Clicar no toggle Real/Mock | Badge muda e dados são recarregados | [ ] | |
| Atualizar página (F5) | Layout permanece correto | [ ] | |
| Navegar pelo painel sem quebrar layout | Nenhum erro grave na tela | [ ] | |

### 2.4 Interações Avançadas (se implementadas)

| Ação | Resultado Esperado | Passou? | Observação |
|------|-------------------|---------|------------|
| Mudar filtro de camada | Lista filtra corretamente | [ ] | |
| Mudar filtro de status | Lista filtra corretamente | [ ] | |
| Clicar modo "Árvore" | Visual muda para árvore | [ ] | |
| Clicar modo "Camadas" | Visual muda para camadas | [ ] | |
| Clicar modo "Grid" | Visual muda para grid | [ ] | |
| Clicar tab "Controle" | Conteúdo muda | [ ] | |
| Clicar tab "IA Guardiã" | Conteúdo muda | [ ] | |
| Clicar tab "Backup" | Conteúdo muda | [ ] | |

> Se algum modo (Árvore/Camadas/Grid) ou tab (Guardiã/Backup) não existir ainda:
> marcar como "❌ Não implementado (escopo futuro)".

---

## 🔌 PARTE 3: TESTE DA API `/api/admin/ai-map`

### 3.1 Teste Direto no Navegador

**Passo a passo:**
1. Abra uma nova aba no navegador.
2. Acesse as URLs abaixo.
3. Anote o resultado real.

| URL | Resultado Esperado (genérico) | Resultado Real |
|-----|-------------------------------|----------------|
| `/api/admin/ai-map` | JSON com campo `mode` indicando uso REAL (ex.: `"real"` ou `"real_empty"`) + lista de agentes (pode estar vazia) | |
| `/api/admin/ai-map?mock=true` | JSON com campo `mode` indicando `"mock"` + lista de agentes mock | |

> O nome exato do campo (`mode`) e valores (`"real"`, `"real_empty"`) precisa bater com o código em `route.ts`.
> Se o código usar outro nome/campo, atualizar este checklist para refletir a realidade.

### 3.2 Verificar Diferença Real vs Mock (CRÍTICO)

**Procedimento:**
1. Acesse `/api/admin/ai-map`
2. Copie o JSON retornado
3. Acesse `/api/admin/ai-map?mock=true`
4. Compare os dois JSONs

| Verificação | Passou? | Observação |
|-------------|---------|------------|
| JSON REAL e JSON MOCK são visivelmente diferentes | [ ] | Se forem idênticos, modo real provavelmente não está implementado |
| Modo real indica explicitamente que é REAL (campo `mode` ou similar) | [ ] | |
| Modo mock indica explicitamente que é MOCK | [ ] | |
| Em caso de erro no modo real, mensagem é clara (sem stack trace bruto) | [ ] | |

### 3.3 Teste via DevTools (F12)

**Passo a passo:**
1. Abra `/admin/mapa-ias`
2. Pressione F12 → aba **Network** (Rede)
3. Marque "Disable cache"
4. Clique no toggle Real/Mock
5. Observe as requisições

| Verificação | Passou? | Observação |
|-------------|---------|------------|
| Surge requisição GET `/api/admin/ai-map` ao trocar para modo Real | [ ] | |
| Surge requisição GET `/api/admin/ai-map?mock=true` ao trocar para modo Mock | [ ] | |
| Status HTTP = 200 nas duas chamadas | [ ] | |
| Response body muda conforme modo selecionado | [ ] | |

---

## 🗄️ PARTE 4: TESTE DE INTEGRAÇÃO COM SUPABASE

### 4.1 Verificar Tabelas no Supabase

**Passo a passo:**
1. Acesse o painel Supabase do projeto.
2. Vá em **Table Editor**.
3. Verifique se as tabelas existem:

| Tabela | Existe? | Tem dados? | Observação |
|--------|---------|------------|------------|
| `ai_agents` | [ ] | [ ] | CORE |
| `ai_agent_metrics_daily` | [ ] | [ ] | CORE/AVANÇADO (métricas) |
| `ai_usage_logs` | [ ] | [ ] | AVANÇADO (logs detalhados) |
| `ai_incidents` | [ ] | [ ] | AVANÇADO |
| `ai_guardian_suggestions` | [ ] | [ ] | AVANÇADO |

**Se tabelas CORE não existirem:**
> Rodar o arquivo `migrate-ai-agents.sql` no SQL Editor do Supabase.

### 4.2 Teste de Sincronização (PROVA DEFINITIVA DO MODO REAL)

**Passo a passo (CRÍTICO):**
1. No Supabase, abra a tabela `ai_agents`.
2. Localize uma IA (ex.: `coach_clareza_v1`).
3. Altere o campo `display_name` para `TESTE_QA_123`.
4. Clique em **Save / Confirm**.
5. Volte ao painel `/admin/mapa-ias`.
6. Certifique-se de estar em **MODO REAL**.
7. Pressione **Ctrl+Shift+R** (reload sem cache).
8. Procure essa IA na lista.

| Verificação | Passou? | Observação |
|-------------|---------|------------|
| O nome exibido na lista mudou para `TESTE_QA_123` | [ ] | |
| O nome exibido nos detalhes também mudou | [ ] | |

**Interpretação:**
- ✅ Se mudou → **Modo REAL está realmente conectado ao Supabase.**
- ❌ Se não mudou → a UI ainda está usando mock ou a API real está ignorando o banco.

### 4.3 Teste de Status/Cores

**Passo a passo:**
1. No Supabase, na tabela `ai_agents`, encontre uma IA.
2. Altere o campo `last_status` para valores diferentes:
   - `"HEALTHY"`
   - `"DEGRADED"`
   - `"DOWN"`
3. Recarregue o painel em modo REAL.

| Verificação | Passou? | Observação |
|-------------|---------|------------|
| Status "HEALTHY" aparece como verde (ou equivalente) | [ ] | |
| Status "DOWN" aparece como vermelho (ou equivalente) | [ ] | |
| Cards de resumo (Qtd. de IAs DOWN/DEGRADED) refletem essa mudança | [ ] | |

> Se a UI ainda não estiver lendo `last_status` da tabela, registrar como bug ou "parcialmente implementado".

---

## 📊 PARTE 5: TESTE DOS COMPONENTES AVANÇADOS

> ⚠️ Esta parte só se aplica se os arquivos/componentes foram criados **e** usados na página.
> Caso contrário, assinar como "não implementado ainda".

### 5.1 Árvore Visual (`AITreeView.tsx`)

| Verificação | Passou? | Observação |
|-------------|---------|------------|
| Modo "Árvore" existe no UI | [ ] | |
| Estrutura hierárquica aparece (camadas → IAs) | [ ] | |
| Nós são expansíveis/recolhíveis | [ ] | |
| Camadas Produto / Meta / Infra aparecem corretamente | [ ] | |
| Clicar numa IA na árvore seleciona a IA e atualiza detalhes | [ ] | |
| Status colorido (verde/amarelo/laranja/vermelho) aparece ao lado de cada IA | [ ] | |

### 5.2 Visualização por Camadas (`AILayerView.tsx`)

| Verificação | Passou? | Observação |
|-------------|---------|------------|
| Modo "Camadas" existe no UI | [ ] | |
| Exibe camadas do sistema (Front-end, Dashboard, Backend, Background, BD, Analytics) | [ ] | |
| IAs aparecem na camada correta | [ ] | |
| Componentes/rotas associados são listados (ex.: páginas, APIs) | [ ] | |

### 5.3 Gráficos Temporais (`AIMetricsCharts.tsx`)

| Verificação | Passou? | Observação |
|-------------|---------|------------|
| Gráfico "Chamadas por Hora" aparece ou alguma métrica temporal equivalente | [ ] | |
| Gráfico "Custo Diário" aparece (ou pelo menos total/dia) | [ ] | |
| Barras/linhas de erro (%) e latência são exibidas | [ ] | |
| Gráficos renderizam sem erro (não ficam em branco ou quebrados) | [ ] | |

### 5.4 Gerenciador de Backup (`AIBackupManager.tsx`)

| Verificação | Passou? | Observação |
|-------------|---------|------------|
| Tab "Backup" existe na coluna direita | [ ] | |
| Para cada função (ex.: "Chat – Coach de Clareza") aparecem primária e backups | [ ] | |
| Botão "Tornar Primária" existe | [ ] | |
| Toggle "Automático ON/OFF" existe (se previsto no design) | [ ] | |
| Ao mudar a primária, UI atualiza corretamente (mesmo que backend ainda não aplique de verdade) | [ ] | |

### 5.5 IA Guardiã (`AIGuardian.tsx`)

| Verificação | Passou? | Observação |
|-------------|---------|------------|
| Tab "IA Guardiã" existe | [ ] | |
| Exibe ao menos uma lista de insights/sugestões | [ ] | |
| Insights estão coerentes com os dados (mesmo que sejam mock) | [ ] | |
| Botão "Aplicar automaticamente" aparece (mesmo que ainda não tenha efeito real) | [ ] | |
| Botão "Ignorar" / "Descartar" existe | [ ] | |

---

## 🚨 PARTE 6: TESTE DE ERROS E RESILIÊNCIA

### 6.1 Cenários de Erro

| Cenário | Comportamento Esperado | Passou? | Observação |
|---------|----------------------|---------|------------|
| Supabase offline (simular desligando internet ou trocando URL) | Painel mostra mensagem amigável de erro e, se possível, oferece modo mock | [ ] | |
| Tabelas `ai_agents` ausentes | UI informa "Migração não executada" ou cai em modo mock, sem quebrar | [ ] | |
| Sem IAs cadastradas | Mensagem "Nenhuma IA encontrada" em vez de tela vazia quebrada | [ ] | |
| API `/ai-map` retorna 500 | Toast/alerta de erro; página continua utilizável | [ ] | |

### 6.2 Console do Navegador (F12 → Console)

**Passo a passo:**
1. Abra o painel `/admin/mapa-ias`.
2. Pressione F12 → aba **Console**.
3. Clique em diferentes IAs, mude modos/filtros.
4. Anote erros vermelhos.

| Tipo de Erro | Quantidade | Crítico? (S/N) | Observação |
|--------------|------------|----------------|------------|
| Erros de importação | | | |
| Erros de TypeScript em tempo de execução | | | |
| Erros de API/fetch | | | |
| Erros de renderização React | | | |

---

## ✅ PARTE 7: RESUMO FINAL DO TESTE

### 7.1 Status Geral

| Componente | Status | Notas |
|------------|--------|-------|
| Página carrega | ⬜ OK / ⬜ FALHA | |
| Layout 3 colunas (CORE) | ⬜ OK / ⬜ FALHA | |
| Toggle Real/Mock funcional | ⬜ OK / ⬜ FALHA | |
| API `/api/admin/ai-map` (REAL vs MOCK) | ⬜ OK / ⬜ FALHA | |
| Supabase conectado (`ai_agents`) | ⬜ OK / ⬜ FALHA | |
| Sincronização nome IA (`TESTE_QA_123`) | ⬜ OK / ⬜ FALHA | |
| Árvore visual (AITreeView) | ⬜ OK / ⬜ NÃO IMPLEMENTADO / ⬜ FALHA | |
| Visualização por camadas (AILayerView) | ⬜ OK / ⬜ NÃO IMPLEMENTADO / ⬜ FALHA | |
| Gráficos (AIMetricsCharts) | ⬜ OK / ⬜ NÃO IMPLEMENTADO / ⬜ FALHA | |
| Backup manager (AIBackupManager) | ⬜ OK / ⬜ NÃO IMPLEMENTADO / ⬜ FALHA | |
| IA Guardiã (AIGuardian) | ⬜ OK / ⬜ NÃO IMPLEMENTADO / ⬜ FALHA | |

### 7.2 Veredicto

- [ ] **APROVADO (CORE)** – Funcionalidades centrais implementadas e funcionando
- [ ] **APROVADO COM RESSALVAS** – CORE ok, mas com bugs menores ou AVANÇADO incompleto
- [ ] **REPROVADO** – Falhas em itens CORE (página, API real, integração Supabase)

### 7.3 Bugs Encontrados

| # | Descrição | Severidade (Alta/Média/Baixa) | Componente |
|---|-----------|-------------------------------|------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

### 7.4 Próximos Passos Sugeridos

- [ ] Corrigir bugs críticos em CORE (página, API, Supabase)
- [ ] Garantir que `migrate-ai-agents.sql` rodou em produção
- [ ] Cadastrar IAs reais na tabela `ai_agents`
- [ ] Alimentar métricas básicas (`ai_agent_metrics_daily`)
- [ ] Implementar/ajustar componentes AVANÇADOS (árvore, camadas, gráficos, guardiã, backup)
- [ ] Rodar novamente este checklist após correções

---

## 📝 COMANDOS ÚTEIS (Windows / PowerShell)

### Verificar servidor rodando:
```powershell
npm run dev
```

### Verificar arquivos existem:
```powershell
Get-ChildItem -Path "app\admin\mapa-ias" -Recurse
Get-ChildItem -Path "components" -Filter "AI*"
```

### Testar API via PowerShell:
```powershell
# Modo Real
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/ai-map" -Method GET

# Modo Mock
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/ai-map?mock=true" -Method GET
```

### Verificar erros de build:
```powershell
npm run build
```

---

**Documento criado em:** 26/11/2025  
**Última atualização:** 26/11/2025 (ajuste CORE vs AVANÇADO)  
**Versão do sistema:** Radar Narcisista – Mapa de IAs
