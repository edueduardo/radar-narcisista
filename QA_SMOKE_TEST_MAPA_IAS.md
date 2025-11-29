# ⚡ SMOKE TEST – MAPA DE IAs (5 minutos)

**Data:** ___/___/2025  
**Testador:** _______________

> Use este checklist rápido **todo dia** ou antes de cada deploy.
> Para QA completo, use `QA_MAPA_IAS_v1.1.md`.

---

## ✅ CHECKLIST RÁPIDO (4 verificações)

### 1️⃣ PÁGINA CARREGA?
```
http://localhost:3000/admin/mapa-ias
```
| Verificação | OK? |
|-------------|-----|
| Página abre sem erro 500/404 | [ ] |
| Layout 3 colunas aparece | [ ] |
| Cards de resumo no header | [ ] |

---

### 2️⃣ API RESPONDE?

Abra no navegador:

| URL | Esperado | OK? |
|-----|----------|-----|
| `/api/admin/ai-map` | JSON com `"mode": "real"` ou `"real_empty"` | [ ] |
| `/api/admin/ai-map?mock=true` | JSON com `"mode": "mock"` | [ ] |

---

### 3️⃣ TOGGLE FUNCIONA?

| Ação | Resultado | OK? |
|------|-----------|-----|
| Clicar toggle Real/Mock | Badge muda | [ ] |
| Dados na lista mudam | [ ] |

---

### 4️⃣ SELEÇÃO DE IA FUNCIONA?

| Ação | Resultado | OK? |
|------|-----------|-----|
| Clicar em uma IA na lista | Detalhes aparecem no meio | [ ] |
| Clicar em outra IA | Detalhes mudam | [ ] |

---

## 🎯 VEREDICTO RÁPIDO

- [ ] ✅ **PASSOU** – Pode seguir com o dia/deploy
- [ ] ⚠️ **ATENÇÃO** – Algo menor não funcionou, investigar depois
- [ ] ❌ **BLOQUEADO** – Funcionalidade CORE quebrada, parar e corrigir

---

## 🐛 PROBLEMA ENCONTRADO?

**Descrição rápida:**
```
_________________________________________________
_________________________________________________
```

**Próximo passo:**
- [ ] Abrir QA completo (`QA_MAPA_IAS_v1.1.md`)
- [ ] Verificar console (F12)
- [ ] Verificar Supabase

---

**Tempo estimado:** 3-5 minutos  
**Frequência:** Diário ou pré-deploy
