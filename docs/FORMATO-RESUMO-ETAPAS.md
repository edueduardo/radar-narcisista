# 📋 FORMATO OFICIAL DE RESUMO DE ETAPAS

> **Versão:** 3.0  
> **Última atualização:** 01/12/2025 (ETAPA 26 - BLOCO 26-30)  
> **Objetivo:** Padronizar comunicação entre Windsurf e ChatGPT  
> **Prioridade:** MÁXIMA – Este formato é OBRIGATÓRIO para todas as etapas

---

## 🔄 FLUXO DE TRABALHO OBRIGATÓRIO

### ANTES de Iniciar Qualquer Etapa:
1. **Windsurf apresenta** SUGESTÕES, IDEIAS e OPINIÕES
2. **ChatGPT analisa** e decide o que implementar
3. **Só depois** Windsurf executa a etapa

### DURANTE a Execução:
1. **Windsurf implementa** código e documentação
2. **Windsurf atualiza** TODOS os arquivos de documentação obrigatórios
3. **Windsurf faz commit** com mensagem padronizada

### APÓS a Execução:
1. **Windsurf gera resumo** no formato oficial
2. **Usuário cola resumo** no ChatGPT
3. **ChatGPT analisa** sugestões e decide próximos passos
4. **Ciclo reinicia** com próxima etapa

---

## 📝 TEMPLATE OFICIAL DO RESUMO

```markdown
================================================================================
[RESUMO ETAPA XX – STATUS]
================================================================================

## Objetivo da Etapa
[Frase clara e objetiva do que a etapa deveria entregar]

## Arquivos de Código Criados/Alterados
• [arquivo1.ts] - [descrição curta]
• [arquivo2.tsx] - [descrição curta]
• [arquivo3.sql] - [descrição curta]

## Arquivos de Documentação Atualizados
• ATLAS-RADAR-NARCISISTA.txt - [o que mudou em 1 linha]
• TUDO PARA O GPT.txt - [o que mudou em 1 linha]
• ROADMAP-RADAR.txt - [o que mudou em 1 linha]
• TESTES-RADAR.txt - [o que mudou em 1 linha]
• LAMPADA-RADAR.txt - [se houve alteração]
• MANUAIS tocados: [lista]

## Documentação NÃO Alterada (justificativa)
• [NOME_DO_ARQUIVO] - Esta etapa NÃO impactou este arquivo porque [motivo]

## Testes Executados
• Testes automatizados: [descrição]
• Testes manuais: [descrição]

## Riscos e Dívidas Técnicas
• [risco/dívida 1]
• [risco/dívida 2]

## Status Final
| Item | Status |
|------|--------|
| Build | ✅ |
| Git Push | ✅ Commit [hash] |
| Vercel Deploy | 🔄 Automático |

## Commit
"ETAPA XX – [descrição curta] (código + documentação sincronizados)"

================================================================================
⚠️ OPINIÃO DO WINDSURF PARA O CHATGPT
================================================================================

Antes de iniciar a próxima etapa, o Windsurf identificou as seguintes 
sugestões, ideias e opiniões que devem ser analisadas pelo ChatGPT.

[Escrever aqui observações técnicas, insights, preocupações e ideias
que surgiram durante a implementação. Este bloco será lido pelo ChatGPT
e usado como base de decisão para as próximas etapas.]

================================================================================
MELHORIAS IDENTIFICADAS
================================================================================

• [Melhoria 1 - descrição específica]
• [Melhoria 2 - descrição específica]
• [Melhoria 3 - descrição específica]
• [Melhoria 4 - descrição específica]

================================================================================
PRÓXIMA AÇÃO SUGERIDA
================================================================================

• [Ação 1 - descrição clara do que fazer]
• [Ação 2 - descrição clara do que fazer]
• [Ação 3 - descrição clara do que fazer]

**ChatGPT:** Analise as sugestões acima e implemente conforme necessário ao projeto.
```

---

## ❌ PALAVRAS E EXPRESSÕES PROIBIDAS

| PROIBIDO | MOTIVO | USAR INSTEAD |
|----------|--------|--------------|
| "Opcional" | Tudo deve ser analisado | Listar diretamente |
| "Opcionalmente" | Mesma razão | Listar diretamente |
| "Melhorias opcionais" | Ambíguo | "Melhorias identificadas" |
| "Você pode fazer X ou Y" | Confuso | Bullet separado para X e Y |
| "Ou" dentro de bullets | Dificulta decisão | Bullets separados |
| "Se quiser" | Passivo | Listar diretamente |
| "Caso deseje" | Passivo | Listar diretamente |
| "Talvez" | Incerto | Ser específico |

---

## ✅ EXEMPLOS CORRETOS

### ❌ ERRADO:
```
Você pode implementar rate limiting ou adicionar logs.
Opcionalmente, configure o Sentry.
```

### ✅ CORRETO:
```
## MELHORIAS IDENTIFICADAS
• Implementar rate limiting na API
• Adicionar logs estruturados
• Configurar Sentry para monitoramento
```

---

## 📋 DOCUMENTAÇÃO OBRIGATÓRIA POR ETAPA

Para CADA etapa (21-32+), atualizar OBRIGATORIAMENTE:

> **REGRA FIXA:** Nenhuma etapa é considerada 100% concluída se a documentação não estiver alinhada.

| Arquivo | Quando Atualizar |
|---------|------------------|
| `ATLAS-RADAR-NARCISISTA.txt` | SEMPRE |
| `TUDO PARA O GPT.txt` | SEMPRE |
| `ROADMAP-RADAR.txt` | SEMPRE |
| `TESTES-RADAR.txt` | SEMPRE |
| `LAMPADA-RADAR.txt` | Se houver bug, dívida, ideia |
| `docs/MANUAL-ADMIN.md` | Se impactar admin |
| `docs/MANUAL-USUARIA.md` | Se impactar usuária |
| `docs/MANUAL-PROFISSIONAL.md` | Se impactar profissional |
| `docs/MANUAL-DEV.md` | Se impactar dev |
| `docs/MANUAL-WHITELABEL.md` | Se impactar whitelabel |

**REGRA:** Se um arquivo NÃO for impactado, escrever explicitamente:
> "Documentação: esta etapa NÃO alterou [NOME_DO_ARQUIVO] porque [motivo]."

---

## 🔢 PADRÃO DE COMMIT

```
ETAPA XX – [descrição curta] (código + documentação sincronizados)
```

Exemplos:
- `ETAPA 26 – Template de resumo + checklist + regras de linguagem`
- `ETAPA 27 – ORACULO_V2_CORE (núcleo reutilizável)`
- `ETAPA 28 – Infra multiperfil do Oráculo (flags por plano/perfil)`

---

## 🎯 CRITÉRIO DE CONCLUSÃO

Uma etapa SÓ está concluída quando:
- [ ] Código implementado e funcionando
- [ ] Build passando sem erros
- [ ] Commit feito com mensagem padronizada
- [ ] TODOS os arquivos de documentação atualizados
- [ ] Resumo gerado no formato oficial
- [ ] Seção "OPINIÃO DO WINDSURF" preenchida
- [ ] Seção "MELHORIAS IDENTIFICADAS" preenchida
- [ ] Seção "PRÓXIMA AÇÃO SUGERIDA" preenchida

---

*Este formato é OBRIGATÓRIO para todas as etapas do projeto Radar Narcisista.*
