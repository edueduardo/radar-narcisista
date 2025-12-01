# 📋 Formato Padrão de Resumo de Etapas

> **Versão:** 1.0  
> **Última atualização:** 01/12/2025  
> **Objetivo:** Padronizar comunicação entre Windsurf e ChatGPT

---

## 🔄 Fluxo de Trabalho

1. **Windsurf implementa** a etapa solicitada
2. **Windsurf gera resumo** com sugestões e melhorias identificadas
3. **Usuário cola resumo** no ChatGPT
4. **ChatGPT analisa** as sugestões do Windsurf
5. **ChatGPT decide** quais implementar
6. **Usuário retorna** ao Windsurf com próxima etapa

---

## 📝 Estrutura do Resumo

```
================================================================================
✅ ETAPA [X] – [NOME DA ETAPA] – CONCLUÍDA
================================================================================

## Resumo das Ações Realizadas
[Tabela com itens e status]

## Arquivos Modificados/Criados
[Lista de arquivos]

## Status
| Item | Status |
|------|--------|
| Build | ✅/❌ |
| Git Push | ✅ Commit [hash] |
| Vercel Deploy | 🔄 Automático |

================================================================================
⚠️ AVISO: OPINIÃO DO WINDSURF PARA O CHATGPT
================================================================================

Antes de iniciar a próxima etapa, o Windsurf identificou as seguintes 
sugestões, ideias e melhorias que devem ser analisadas pelo ChatGPT.
Se válidas, devem ser implementadas ANTES de prosseguir com a sequência.

## 🔍 Melhorias Identificadas

- [Melhoria 1]
- [Melhoria 2]
- [Melhoria 3]

## 💡 Sugestões Técnicas

- [Sugestão 1]
- [Sugestão 2]

## 🎯 Observações de UX/Produto

- [Observação 1]
- [Observação 2]

================================================================================
📋 PRÓXIMAS AÇÕES SUGERIDAS
================================================================================

O ChatGPT deve analisar e escolher quais ações executar:

1. [Ação prioritária 1]
2. [Ação prioritária 2]
3. [Ação prioritária 3]

================================================================================
```

---

## ⚠️ Regras Importantes

1. **NUNCA usar "opcional"** - Todas as sugestões são para análise
2. **NUNCA usar "ou"** - Listar em bullet points separados
3. **Sugestões ANTES da próxima etapa** - ChatGPT analisa primeiro
4. **ChatGPT decide** - Ele escolhe o que implementar
5. **Formato consistente** - Sempre seguir esta estrutura

---

## 🎯 Benefícios

- Comunicação clara entre IAs
- Melhorias contínuas do produto
- Decisões documentadas
- Fluxo de trabalho organizado

---

*Este formato deve ser usado em todos os resumos de etapas.*
