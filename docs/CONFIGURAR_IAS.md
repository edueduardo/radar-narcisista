# 🤖 COMO CONFIGURAR MÚLTIPLAS IAs

## Adicione no seu `.env.local`:

```env
# ========================================
# SUPABASE (já tem)
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://zxfbyxrtjrmebslprwhw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ========================================
# OPENAI - GPT-4 (já tem)
# ========================================
OPENAI_API_KEY=sk-proj-xxx

# ========================================
# GOOGLE GEMINI (opcional)
# ========================================
# Pegue em: https://makersuite.google.com/app/apikey
GOOGLE_AI_API_KEY=AIzaSy-xxx

# ========================================
# ANTHROPIC CLAUDE (opcional)
# ========================================
# Pegue em: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-xxx

# ========================================
# GROQ - LLaMA (opcional - GRÁTIS!)
# ========================================
# Pegue em: https://console.groq.com/keys
GROQ_API_KEY=gsk_xxx

# ========================================
# STRIPE (pagamentos - opcional)
# ========================================
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

---

## 📊 Comparação das IAs

| IA | Custo | Velocidade | Qualidade | Onde pegar chave |
|----|-------|------------|-----------|------------------|
| **OpenAI GPT-4** | $$$$ | Médio | Excelente | platform.openai.com |
| **Google Gemini** | $$ | Rápido | Muito bom | makersuite.google.com |
| **Claude** | $$$ | Médio | Excelente | console.anthropic.com |
| **Groq LLaMA** | **GRÁTIS** | Muito rápido | Bom | console.groq.com |

---

## 🎯 Recomendação

1. **Para começar:** Use só OpenAI (já está configurado)
2. **Para economizar:** Adicione Groq (é grátis!)
3. **Para consenso:** Use OpenAI + Gemini + Claude

---

## ⚡ Groq é GRÁTIS!

O Groq oferece acesso gratuito ao LLaMA 3.1 70B. É muito rápido e bom para:
- Gerar ideias de conteúdo
- Análises rápidas
- Testes

**Como pegar:**
1. Acesse https://console.groq.com
2. Crie conta (grátis)
3. Vá em API Keys
4. Crie uma chave
5. Cole no `.env.local`

---

## 🔧 Depois de adicionar as chaves

1. Reinicie o servidor (`npm run dev`)
2. Acesse http://localhost:3000/admin
3. Vá na aba "Config IAs"
4. As novas IAs vão aparecer disponíveis!
