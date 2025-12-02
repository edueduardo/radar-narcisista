# 📢 REGRAS DE COMUNICAÇÃO ENTRE IAs (WINDSURF ↔ CHATGPT)

> **Versão:** 2.0  
> **Atualizado em:** 01/12/2025 (ETAPA 26 - BLOCO 26-30)  
> **Prioridade:** MÁXIMA – Aplicar em TODAS as interações

---

## 🎯 OBJETIVO

Padronizar a comunicação entre Windsurf e ChatGPT para que:
- Sugestões, ideias e opiniões sejam apresentadas ANTES da execução
- O ChatGPT possa analisar e decidir o que implementar
- O fluxo de trabalho seja claro e produtivo

---

## 📋 FLUXO DE TRABALHO OBRIGATÓRIO

### ANTES de Iniciar Qualquer ETAPA/PROMPT:

```
1. Windsurf apresenta SUGESTÕES, IDEIAS e OPINIÕES
2. ChatGPT analisa e decide o que implementar
3. Só depois inicia a execução do prompt
```

### DURANTE a Implementação:

```
1. Executar as tarefas conforme decidido
2. Documentar o que foi feito
3. Identificar melhorias durante o processo
```

### APÓS a Implementação (RESUMO FINAL):

```
1. Descrever o que foi implementado
2. Incluir seção "OPINIÃO DO WINDSURF PARA O CHATGPT"
3. Listar melhorias identificadas
4. Sugerir próximas ações
```

---

## ❌ PALAVRAS E EXPRESSÕES PROIBIDAS

| PROIBIDO | MOTIVO |
|----------|--------|
| "Opcional" | Tudo deve ser listado como item a analisar |
| "Opcionalmente" | Mesma razão |
| "Melhorias opcionais" | Usar "Melhorias identificadas" |
| "Você pode fazer X ou Y" | Listar X e Y separados |
| "Ou" nas sugestões | Usar bullet points separados |
| "Se quiser" | Listar diretamente |
| "Caso deseje" | Listar diretamente |
| "Talvez" | Ser específico |
| "Poderia" | Usar imperativo |
| "Seria bom" | Listar como melhoria |

---

## ✅ FORMATO CORRETO

### ❌ ERRADO:
```
Você pode implementar rate limiting ou adicionar logs estruturados.
Opcionalmente, configure o Sentry.
```

### ✅ CORRETO:
```
## MELHORIAS IDENTIFICADAS
• Implementar rate limiting
• Adicionar logs estruturados
• Configurar Sentry
```

---

## 📝 ESTRUTURA DO RESUMO FINAL

Após cada implementação, usar este formato:

```markdown
# RESUMO DA IMPLEMENTAÇÃO

## O que foi feito
[descrição clara do que foi implementado]

## Arquivos criados/alterados
| Arquivo | Ação |
|---------|------|
| arquivo1.ts | Criado |
| arquivo2.ts | Alterado |

## Status
| Item | Status |
|------|--------|
| Build | ✅ |
| Git Push | ✅ |

---

## ⚠️ OPINIÃO DO WINDSURF PARA O CHATGPT

[Aqui o Windsurf apresenta suas sugestões, ideias e opiniões
para que o ChatGPT analise antes de prosseguir]

---

## MELHORIAS IDENTIFICADAS

• [melhoria 1 - descrição clara]
• [melhoria 2 - descrição clara]
• [melhoria 3 - descrição clara]

---

## PRÓXIMA AÇÃO SUGERIDA

• [ação 1]
• [ação 2]
• [ação 3]

**ChatGPT:** Analise as sugestões acima e implemente conforme necessário ao projeto.
```

---

## 🔄 EXEMPLO PRÁTICO

### Antes de iniciar ETAPA 26:

```
## ⚠️ OPINIÃO DO WINDSURF PARA O CHATGPT

Antes de iniciar a ETAPA 26 (Oráculo V2 Multiperfil), sugiro:

• Criar feature flags por perfil antes de abrir o Oráculo
• Implementar rate limiting diferenciado por perfil
• Adicionar logs de segurança para acessos não-admin
• Criar testes automatizados para validar permissões

ChatGPT: Analise estas sugestões e decida quais implementar 
antes de prosseguir com a ETAPA 26.
```

---

## 📌 ONDE APLICAR ESTAS REGRAS

1. **docs/PATCH-ORACULO.md** - Já inclui estas regras
2. **Todos os resumos de implementação** - Seguir o formato
3. **Comunicação Windsurf → ChatGPT** - Sempre usar bullet points
4. **Sugestões de melhorias** - Nunca usar "opcional" ou "ou"

---

## 🎁 BENEFÍCIO PARA O SAAS

Quando estas regras são seguidas:
- O ChatGPT recebe informações claras e acionáveis
- Decisões são tomadas de forma consciente
- Melhorias não são perdidas ou esquecidas
- O projeto evolui de forma organizada
- Todos que utilizam o SaaS se beneficiam

---

*Este documento deve ser consultado por Windsurf e ChatGPT em todas as interações.*
