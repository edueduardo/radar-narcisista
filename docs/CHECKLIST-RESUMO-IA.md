# ✅ CHECKLIST DE REVISÃO DE RESUMO (WINDSURF → CHATGPT)

> **Versão:** 2.0  
> **Atualizado em:** 01/12/2025 (ETAPA 26 - BLOCO 26-30)  
> **Objetivo:** Validar resumo antes de enviar ao ChatGPT

---

## 📋 CHECKLIST OBRIGATÓRIO

Antes de enviar o resumo ao ChatGPT, verificar TODOS os itens:

### 1. ESTRUTURA DO RESUMO

- [ ] Cabeçalho com número e nome da etapa
- [ ] Seção "Objetivo da Etapa" preenchida
- [ ] Seção "Arquivos de Código" listados
- [ ] Seção "Arquivos de Documentação" atualizados
- [ ] Seção "Testes Executados" descrita
- [ ] Seção "Riscos e Dívidas Técnicas" listada
- [ ] Seção "Status Final" com tabela
- [ ] Seção "Commit" com hash

### 2. SEÇÕES OBRIGATÓRIAS DE COMUNICAÇÃO

- [ ] ⚠️ OPINIÃO DO WINDSURF PARA O CHATGPT presente
- [ ] MELHORIAS IDENTIFICADAS presente (com bullets)
- [ ] PRÓXIMA AÇÃO SUGERIDA presente (com bullets)

### 3. PALAVRAS PROIBIDAS (VERIFICAR AUSÊNCIA)

- [ ] NÃO contém "opcional"
- [ ] NÃO contém "opcionalmente"
- [ ] NÃO contém "opcionais"
- [ ] NÃO contém "ou" dentro de bullets de melhorias
- [ ] NÃO contém "ou" dentro de bullets de próximas ações
- [ ] NÃO contém "se quiser"
- [ ] NÃO contém "caso deseje"
- [ ] NÃO contém "talvez"
- [ ] NÃO contém "poderia"
- [ ] NÃO contém "seria bom"

### 4. DOCUMENTAÇÃO SINCRONIZADA

- [ ] ATLAS-RADAR-NARCISISTA.txt atualizado
- [ ] TUDO PARA O GPT.txt atualizado
- [ ] ROADMAP-RADAR.txt atualizado
- [ ] TESTES-RADAR.txt atualizado
- [ ] LAMPADA-RADAR.txt atualizado (se aplicável)
- [ ] MANUAIS atualizados (se aplicável)
- [ ] Justificativa para arquivos NÃO alterados

### 5. QUALIDADE DO CONTEÚDO

- [ ] Bullets são específicos e acionáveis
- [ ] Cada bullet contém UMA ação (não múltiplas)
- [ ] Linguagem clara e direta
- [ ] Sem ambiguidades

---

## 🔍 VALIDAÇÃO RÁPIDA

Execute mentalmente estas perguntas:

1. **O ChatGPT consegue entender o que foi feito?**
   - Se não, reescrever seções confusas

2. **O ChatGPT consegue tomar decisões com as sugestões?**
   - Se não, ser mais específico nos bullets

3. **Há alguma palavra proibida no texto?**
   - Se sim, reescrever usando bullets separados

4. **A documentação está sincronizada com o código?**
   - Se não, atualizar antes de enviar

---

## 📝 EXEMPLO DE VALIDAÇÃO

### ❌ ANTES (com problemas):
```
Você pode implementar rate limiting ou adicionar logs.
Opcionalmente, configure o Sentry se quiser.
```

**Problemas encontrados:**
- ❌ Contém "ou"
- ❌ Contém "Opcionalmente"
- ❌ Contém "se quiser"

### ✅ DEPOIS (corrigido):
```
## MELHORIAS IDENTIFICADAS
• Implementar rate limiting na API /api/oraculo-v2
• Adicionar logs estruturados com Winston
• Configurar Sentry para monitoramento de erros
```

---

## 🚀 AÇÃO FINAL

Após passar por TODOS os itens do checklist:

1. **Copiar o resumo completo**
2. **Colar no ChatGPT**
3. **Aguardar análise do ChatGPT**
4. **Receber próxima etapa**

---

*Use este checklist SEMPRE antes de enviar resumos ao ChatGPT.*
