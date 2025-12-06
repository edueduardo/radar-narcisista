# 🧪 CHECKLIST DE TESTES - RADAR NARCISISTA

**Data:** ___/___/2025  
**Testador:** ________________  
**Ambiente:** Produção (https://radar-narcisista.vercel.app)

---

## 1. 🔐 AUTENTICAÇÃO

| Teste | Status | Observação |
|-------|--------|------------|
| [ ] Acessar /login | ⬜ | |
| [ ] Login com email válido | ⬜ | |
| [ ] Redireciona para /dashboard | ⬜ | |
| [ ] Acessar /admin (como admin) | ⬜ | |
| [ ] Reload no /admin permanece | ⬜ | |
| [ ] Botão "Sair" funciona | ⬜ | |
| [ ] Login com email inválido mostra erro | ⬜ | |

---

## 2. 📊 DASHBOARD

| Teste | Status | Observação |
|-------|--------|------------|
| [ ] Dashboard carrega sem erros | ⬜ | |
| [ ] Cards principais visíveis | ⬜ | |
| [ ] Navegação para Diário | ⬜ | |
| [ ] Navegação para Chat | ⬜ | |
| [ ] Navegação para Teste | ⬜ | |
| [ ] Menu lateral funciona | ⬜ | |

---

## 3. 📔 DIÁRIO

| Teste | Status | Observação |
|-------|--------|------------|
| [ ] Criar nova entrada | ⬜ | |
| [ ] Adicionar título e texto | ⬜ | |
| [ ] Adicionar tags | ⬜ | |
| [ ] Salvar entrada | ⬜ | |
| [ ] Entrada aparece na lista | ⬜ | |
| [ ] Editar entrada existente | ⬜ | |
| [ ] Excluir entrada | ⬜ | |
| [ ] Filtrar por data | ⬜ | |

---

## 4. 💬 CHAT IA

| Teste | Status | Observação |
|-------|--------|------------|
| [ ] Iniciar nova conversa | ⬜ | |
| [ ] Enviar mensagem | ⬜ | |
| [ ] IA responde (precisa GROQ_API_KEY) | ⬜ | |
| [ ] Histórico de mensagens | ⬜ | |
| [ ] Nova sessão de chat | ⬜ | |

---

## 5. 🎯 TESTE DE CLAREZA

| Teste | Status | Observação |
|-------|--------|------------|
| [ ] Iniciar teste | ⬜ | |
| [ ] Responder perguntas | ⬜ | |
| [ ] Ver resultado/score | ⬜ | |
| [ ] Resultado salvo no histórico | ⬜ | |

---

## 6. 🛡️ PLANO DE SEGURANÇA

| Teste | Status | Observação |
|-------|--------|------------|
| [ ] Acessar plano de segurança | ⬜ | |
| [ ] Criar/editar plano | ⬜ | |
| [ ] Salvar alterações | ⬜ | |

---

## 7. ⚙️ ADMIN

| Teste | Status | Observação |
|-------|--------|------------|
| [ ] Header com botões visível | ⬜ | |
| [ ] Badge DEMO aparece | ⬜ | |
| [ ] Botão "Ver Real" funciona | ⬜ | |
| [ ] Botão "Limpar cache" funciona | ⬜ | |
| [ ] Botão "Sair" funciona | ⬜ | |
| [ ] Menu lateral navegável | ⬜ | |
| [ ] /admin/configurar-ias carrega | ⬜ | |
| [ ] Provedores de IA listados | ⬜ | |

---

## 8. 🤖 IA CURADORA (requer chaves)

| Teste | Status | Observação |
|-------|--------|------------|
| [ ] Acessar curadoria | ⬜ | |
| [ ] Ativar IA Curadora | ⬜ | |
| [ ] IA gera sugestões | ⬜ | |

---

## 9. 📱 PWA / MOBILE

| Teste | Status | Observação |
|-------|--------|------------|
| [ ] Site responsivo no mobile | ⬜ | |
| [ ] Manifest.json carrega | ⬜ | |
| [ ] Ícones aparecem | ⬜ | |

---

## 10. 🌐 APIs (Automatizado)

Execute: `node scripts/test-apis.js`

| API | Status | Latência |
|-----|--------|----------|
| /api/health | ✅ | 815ms |
| /api/frontpage/content | ✅ | 400ms |
| /api/public/radar-pulse | ✅ | 841ms |
| /api/plans | ✅ | 498ms |
| /manifest.json | ✅ | 76ms |

---

## 📋 RESUMO

- **Total de testes:** 45
- **Passou:** ___
- **Falhou:** ___
- **Pendente:** ___

### Problemas Encontrados:
1. 
2. 
3. 

### Ações Necessárias:
1. 
2. 
3. 

---

**Legenda:**
- ⬜ Não testado
- ✅ Passou
- ❌ Falhou
- ⚠️ Parcial
