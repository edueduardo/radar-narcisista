# 🔮 PATCH ORÁCULO – CORREÇÃO CONCEITUAL

> **Versão:** 1.1  
> **Criado em:** 01/12/2025  
> **Prioridade:** MÁXIMA – Este documento tem prioridade sobre qualquer texto antigo

---

## 📢 REGRAS DE COMUNICAÇÃO WINDSURF ↔ CHATGPT

### Fluxo de Trabalho

1. **ANTES de iniciar qualquer ETAPA/PROMPT:**
   - Windsurf apresenta SUGESTÕES, IDEIAS e OPINIÕES
   - ChatGPT analisa e decide o que implementar
   - Só depois inicia a execução do prompt

2. **No RESUMO FINAL de cada implementação:**
   - Incluir seção "OPINIÃO DO WINDSURF PARA O CHATGPT"
   - Listar melhorias identificadas (sem usar "opcional")
   - Próximas ações em bullet points (sem usar "ou")

### Regras de Escrita

| ❌ NÃO USAR | ✅ USAR |
|-------------|---------|
| "Opcional", "opcionalmente" | Listar diretamente |
| "Ou" nas sugestões | Bullet points separados |
| "Melhorias opcionais" | "Melhorias identificadas" |
| "Você pode fazer X ou Y" | "• Fazer X" e "• Fazer Y" |

### Estrutura do Resumo Final

```
# RESUMO DA IMPLEMENTAÇÃO
[descrição do que foi feito]

## ⚠️ OPINIÃO DO WINDSURF PARA O CHATGPT
[sugestões, ideias e opiniões para análise]

## MELHORIAS IDENTIFICADAS
• [melhoria 1]
• [melhoria 2]
• [melhoria 3]

## PRÓXIMA AÇÃO SUGERIDA
• [ação 1]
• [ação 2]
• [ação 3]

ChatGPT: Analise e implemente conforme necessário ao projeto.
```

---

## ⚠️ AVISO IMPORTANTE

Este patch ajusta TUDO que foi escrito antes sobre "Oráculo" neste projeto.

**Sempre que este documento for lido (Windsurf / ChatGPT / humano), considerar este PATCH como PRIORIDADE sobre qualquer texto antigo que diga o contrário.**

---

## PATCH 1 – ORÁCULO (BLOCO 21–25)

### 1. DOIS ORÁCULOS DIFERENTES (NOMES OFICIAIS)

#### ORÁCULO V1 – PAINEL ADMIN
- **Rota:** `/admin/oraculo`
- **Função:** Painel de métricas e visão geral do produto
- **Perfil:** SOMENTE ADMIN / DONO DO PRODUTO
- **Status:** ✅ JÁ EXISTE

#### ORÁCULO V2 – IA INTERNA DE SUPORTE
- **Rota de API:** `/api/oraculo-v2`
- **Função:** IA que ajuda a entender o produto, dados, métricas, erros, etc.
- **NESTE BLOCO 21–25:** Uso EXCLUSIVO DO ADMIN
- **FUTURO (BLOCO 26–30):** Poderá ser aberta para outros perfis

---

### 2. CORREÇÃO DE ENTENDIMENTO

**Por que deu confusão:**
- O primeiro "Oráculo" criado foi o ORÁCULO V1, DENTRO DO ADMIN → a cabeça fixou isso como "ferramenta só do Edu"
- Depois o conceito foi expandido para uma IA que poderia atender outros perfis, mas usando o mesmo nome "Oráculo", gerando confusão

**A PARTIR DESTE PATCH:**
- **ORÁCULO V1 = painel** (já está claro, continua igual)
- **ORÁCULO V2 = IA**, mas **NESTE BLOCO 21–25 É SÓ PARA ADMIN**

Qualquer texto anterior que diga que o Oráculo V2 "já atende usuária, profissional, dev, whitelabel" deve ser lido como:

> "PLANEJADO PARA FUTURO BLOCO (26–30), NÃO IMPLEMENTADO AGORA."

---

### 3. DECISÃO OFICIAL PARA O BLOCO 21–25

| Componente | Descrição | Status |
|------------|-----------|--------|
| **ORÁCULO V1** | Painel `/admin/oraculo` - métricas, visão geral | ✅ Existe, só ADMIN |
| **ORÁCULO V2 Backend** | Rota `/api/oraculo-v2` + tabela `oraculo_logs` | ✅ Criado |
| **ORÁCULO V2 Prompt** | Especificado em `docs/ORACULO-V2-PROMPT.md` | ✅ Pronto |
| **ORÁCULO V2 Front** | Botão só aparece em telas admin | ✅ Implementado |
| **user_role utilizado** | Apenas `"admin"` neste bloco | ✅ |
| **Outros roles** | `usuaria`, `profissional`, `dev`, `whitelabel` | ⏳ FUTURO |

---

### 4. COMO WINDSURF E CHATGPT DEVEM LER ISSO

1. **Se algum texto antigo disser:**
   - "Oráculo V2 atende usuária/profissional/dev/whitelabel agora"
   > ENTENDER COMO: "PLANEJADO, NÃO IMPLEMENTADO NESTE BLOCO 21–25"

2. **Se houver dúvida de comportamento atual:**
   - **ORÁCULO V1:** painel `/admin/oraculo`, só admin
   - **ORÁCULO V2:** IA chamada só pelo admin, em rotas/admin, com `user_role = "admin"`

3. **Quando for gerar tarefas / commits no BLOCO 21–25:**
   - QUALQUER referência a "Oráculo para usuária/profissional" deve ser enviada para:
     - ROADMAP → FUTURO
     - LÂMPADA → "Ideia / Futuro Bloco 26–30"
   - Não implementar front público para Oráculo V2 agora

---

## PATCH 2 – ORÁCULO MULTIPERFIL & GERADOR DE SAAS (FUTURO BLOCO 26–30)

### 1. DECISÃO OFICIAL PARA O FUTURO

A partir do BLOCO 26–30 (NÃO AGORA), o plano é:

#### ORÁCULO V2 MULTIPERFIL
O mesmo núcleo de IA passará a atender TODOS os perfis:
- `user_role = "usuaria"`
- `user_role = "profissional"`
- `user_role = "admin"`
- `user_role = "dev"`
- `user_role = "whitelabel"`
- (e outros perfis futuros)

#### ACOPLAR O ORÁCULO EM TODA A PLATAFORMA
- O ORÁCULO V2 vira um **módulo central** (`ORACULO_V2_CORE`)
- Usado no Radar Narcisista
- Reutilizável em outros produtos
- Acoplável pelo **Gerador de SaaS**

#### GERADOR DE SAAS + ORÁCULO
Todo SaaS gerado pode, opcionalmente, nascer com:
- `ORACULO_V2_CORE` embutido
- Suporte a múltiplos `user_role`
- Estrutura de resposta em JSON padronizada
- Flags por plano/perfil para habilitar/desabilitar

---

### 2. REGRAS DE INTERPRETAÇÃO

| Contexto | Interpretação |
|----------|---------------|
| Texto antigo diz "Oráculo para usuária/profissional AGORA" | FUTURO BLOCO 26–30, não implementado em 21–25 |
| Contexto do GERADOR DE SAAS | ORÁCULO_V2 será módulo acoplável, executado DEPOIS DO BLOCO 25 |

---

## RESUMO EXECUTIVO (VERSÃO CURTA)

```
PATCH ORÁCULO – BLOCO 21–25
━━━━━━━━━━━━━━━━━━━━━━━━━━━
• ORÁCULO V1 = painel /admin/oraculo → só ADMIN (já existe)
• ORÁCULO V2 = IA de suporte → NESTE BLOCO é apenas para ADMIN
• Menção a Oráculo V2 para usuária/profissional/dev/whitelabel = FUTURO (bloco 26–30)

PATCH 2 – FUTURO BLOCO 26–30
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• ORÁCULO V2 MULTIPERFIL para TODOS os perfis
• ORACULO_V2_CORE como módulo compartilhado
• Acoplável a todos os SaaS gerados pelo GERADOR DE SAAS
```

---

*Windsurf e ChatGPT devem considerar este patch como prioridade ao interpretar texto antigo.*
