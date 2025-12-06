# 🚀 GUIA PASSO A PASSO PARA VENDER O RADAR

> Siga cada passo na ordem. Marque ✅ quando completar.

---

## PARTE 1: CRIAR A DEMO (30 minutos)

### Passo 1.1 - Criar Supabase DEMO

1. [ ] Abra o navegador
2. [ ] Vá para: **https://supabase.com**
3. [ ] Clique em **Sign In** (canto superior direito)
4. [ ] Faça login com sua conta Google ou email
5. [ ] Depois de logado, clique em **New Project**
6. [ ] Preencha:
   - **Project name**: `radar-demo`
   - **Database password**: `RadarDemo2025!` (anote isso!)
   - **Region**: deixe o padrão
7. [ ] Clique em **Create new project**
8. [ ] Espere 2-3 minutos até aparecer "Project is ready"

### Passo 1.2 - Copiar as chaves do Supabase DEMO

1. [ ] No menu lateral esquerdo, clique em **Project Settings** (ícone de engrenagem)
2. [ ] Clique em **API**
3. [ ] Você vai ver duas informações importantes. COPIE E COLE AQUI EMBAIXO:

```
MINHA URL DO SUPABASE DEMO:
https://________________________________.supabase.co

MINHA CHAVE ANON (anon public):
eyJ_____________________________________________

MINHA CHAVE SERVICE_ROLE (service_role secret):
eyJ_____________________________________________
```

### Passo 1.3 - Criar usuários de teste no Supabase DEMO

1. [ ] No menu lateral, clique em **Authentication**
2. [ ] Clique em **Users**
3. [ ] Clique em **Add User** → **Create new user**
4. [ ] Crie estes 3 usuários (um de cada vez):

**Usuário 1 - Usuária:**
```
Email: demo.user@radar.test
Password: DemoUser123!
```

**Usuário 2 - Profissional:**
```
Email: demo.pro@radar.test
Password: DemoPro123!
```

**Usuário 3 - Admin:**
```
Email: demo.admin@radar.test
Password: DemoAdmin123!
```

### Passo 1.4 - Executar o SQL das tabelas

1. [ ] No menu lateral, clique em **SQL Editor**
2. [ ] Clique em **New query**
3. [ ] Abra o arquivo: `database/sql_consolidado/SQL_CONSOLIDADO_01_BASE.sql`
4. [ ] Copie TODO o conteúdo
5. [ ] Cole no SQL Editor do Supabase
6. [ ] Clique em **Run** (botão verde)
7. [ ] Espere aparecer "Success"

> Se der erro, tire um print e me manda!

---

## PARTE 2: DEPLOY DA DEMO NA VERCEL (15 minutos)

### Passo 2.1 - Criar novo projeto na Vercel

1. [ ] Abra: **https://vercel.com**
2. [ ] Faça login com GitHub
3. [ ] Clique em **Add New...** → **Project**
4. [ ] Procure o repositório **radar-narcisista**
5. [ ] Clique em **Import**

### Passo 2.2 - Configurar variáveis de ambiente

Na tela de configuração, clique em **Environment Variables** e adicione:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | (cole a URL do Supabase DEMO) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (cole a chave ANON) |
| `SUPABASE_SERVICE_ROLE_KEY` | (cole a chave SERVICE_ROLE) |

> As outras variáveis (OPENAI, STRIPE) podem ficar vazias por enquanto.

### Passo 2.3 - Fazer o deploy

1. [ ] Clique em **Deploy**
2. [ ] Espere 3-5 minutos
3. [ ] Quando terminar, você vai ver uma URL tipo:
   ```
   https://radar-narcisista-XXXXX.vercel.app
   ```
4. [ ] ANOTE ESSA URL! Essa é sua DEMO!

```
MINHA URL DA DEMO:
https://________________________________________
```

---

## PARTE 3: TESTAR A DEMO (10 minutos)

1. [ ] Abra a URL da demo no navegador
2. [ ] Veja se a página inicial carrega
3. [ ] Clique em "Entrar" ou "Login"
4. [ ] Tente fazer login com: `demo.user@radar.test` / `DemoUser123!`
5. [ ] Se funcionar, PARABÉNS! Sua demo está pronta!

> Se der erro, tire um print e me manda!

---

## PARTE 4: TIRAR SCREENSHOTS (10 minutos)

Você precisa de 5 prints para os anúncios:

1. [ ] **Screenshot 1**: Página inicial (landing page)
2. [ ] **Screenshot 2**: Dashboard da usuária (depois de logado)
3. [ ] **Screenshot 3**: Página do diário
4. [ ] **Screenshot 4**: Painel admin (login com demo.admin)
5. [ ] **Screenshot 5**: Versão mobile (aperte F12, clique no ícone de celular)

**Como tirar print no Windows:**
- Aperte `Windows + Shift + S`
- Selecione a área
- Cole no Paint e salve como .png

**Salve os prints em:**
```
c:\Users\teste\Desktop\SaaS sobre narcisismo\radar-narcisista\screenshots\
```

---

## PARTE 5: CRIAR CONTA NO FLIPPA (5 minutos)

1. [ ] Abra: **https://flippa.com**
2. [ ] Clique em **Sign Up**
3. [ ] Crie conta com email ou Google
4. [ ] Confirme o email se pedir

---

## PARTE 6: PUBLICAR NO FLIPPA (20 minutos)

1. [ ] Faça login no Flippa
2. [ ] Clique em **Sell** ou **Start Selling**
3. [ ] Escolha **Starter Site** ou **Web App**
4. [ ] Preencha os campos copiando do arquivo:
   ```
   docs/LISTING-FLIPPA-EN.md
   ```

### Campos importantes:

**Title:**
```
Radar Narcisista – AI-Powered Relationship Clarity SaaS (Next.js + Supabase + Stripe) | 97% Complete MVP
```

**Short Summary:**
```
Advanced SaaS platform for relationship clarity and abuse pattern detection. Built with Next.js 15, Supabase, Stripe, and AI (OpenAI/Anthropic). 97% complete MVP with extensive documentation, multi-tenant architecture, and E2E tests. Pre-revenue, ready to launch or customize.
```

**Demo URL:**
```
(cole a URL da sua demo aqui)
```

**Asking Price:**
```
US$ 7,000
```

**Repository:**
```
https://github.com/edueduardo/radar-narcisista
```

5. [ ] Faça upload dos screenshots
6. [ ] Revise tudo
7. [ ] Clique em **Publish** ou **Submit**

---

## PARTE 7: CRIAR CONTA NO ACQUIRE (5 minutos)

1. [ ] Abra: **https://acquire.com**
2. [ ] Clique em **Sign Up** ou **Sell a Startup**
3. [ ] Crie conta
4. [ ] Confirme email

---

## PARTE 8: PUBLICAR NO ACQUIRE (20 minutos)

1. [ ] Faça login no Acquire
2. [ ] Clique em **List your startup**
3. [ ] Preencha os campos copiando do arquivo:
   ```
   docs/LISTING-ACQUIRE-EN.md
   ```

### Campos importantes:

**Headline:**
```
AI-Powered Relationship Clarity SaaS | Next.js + Supabase + Stripe | 97% Complete MVP
```

**Stage:** `MVP / Pre-revenue`

**Niche:** `Mental Health / Relationship Clarity`

**Price:**
```
Open to offers - Indicative range: US$ 5,000 – 10,000
```

4. [ ] Faça upload dos screenshots
5. [ ] Revise tudo
6. [ ] Publique

---

## ✅ CHECKLIST FINAL

- [ ] Supabase DEMO criado
- [ ] Usuários de teste criados
- [ ] SQL executado
- [ ] Deploy na Vercel feito
- [ ] Demo funcionando
- [ ] 5 screenshots tirados
- [ ] Conta no Flippa criada
- [ ] Anúncio no Flippa publicado
- [ ] Conta no Acquire criada
- [ ] Anúncio no Acquire publicado

---

## 🆘 SE DER ERRO

1. Tire um print da tela de erro
2. Copie a mensagem de erro (se tiver)
3. Me manda aqui no chat
4. Eu te ajudo a resolver!

---

## 📧 SEU EMAIL PARA CONTATO

Coloque seu email real nos anúncios:
```
Email: ________________________________
```

---

## 💰 PREÇOS SUGERIDOS

| Plataforma | Preço Inicial | Mínimo Aceitável |
|------------|---------------|------------------|
| Flippa | US$ 7,000 | US$ 3,000 |
| Acquire | US$ 5,000-10,000 | US$ 3,000 |

> Você pode negociar! Esses são preços de partida.

---

## 🎉 PRONTO!

Depois de seguir todos os passos, seus anúncios estarão no ar!

Agora é só esperar contatos de compradores interessados.

Boa sorte! 🚀
