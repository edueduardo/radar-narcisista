# 📋 CHECKLIST - Próximas Etapas do Radar Narcisista BR

> **Data de criação:** 25/11/2025
> **Status:** Código finalizado, iniciando fase de lançamento

---

## ETAPA 1 – Garantir que o projeto roda "limpo"

### 1.1 Ambiente de Desenvolvimento
- [ ] `npm install` executado sem erros
- [ ] `npm run dev` inicia sem erros
- [ ] http://localhost:3000 abre corretamente
- [ ] Console do navegador sem erros vermelhos
- [ ] Terminal sem erros de import ou rotas 500

### 1.2 Verificações Básicas
- [ ] `npm run lint` passa (se configurado)
- [ ] `npm run build` compila sem erros
- [ ] Todas as páginas principais carregam

---

## ETAPA 2 – Configurar chaves e serviços

### 2.1 Supabase
- [ ] Projeto criado no Supabase
- [ ] `schema.sql` executado no SQL Editor
- [ ] Tabelas criadas: `user_profiles`, `clarity_tests`, `journal_entries`, `ai_conversations`, `safety_plans`
- [ ] RLS (Row Level Security) configurado
- [ ] Políticas de segurança aplicadas

### 2.2 OpenAI
- [ ] Conta criada na OpenAI
- [ ] API Key gerada
- [ ] `OPENAI_API_KEY` no `.env.local`
- [ ] Testar rota `/api/chat` - responde?
- [ ] Testar rota `/api/transcribe` - funciona?

### 2.3 Stripe (quando for lançar pago)
- [ ] Conta criada no Stripe
- [ ] Produto criado (Plano Premium)
- [ ] Preço definido (ex: R$ 29/mês)
- [ ] `STRIPE_SECRET_KEY` no `.env.local`
- [ ] `STRIPE_PUBLISHABLE_KEY` no `.env.local`
- [ ] Webhook configurado

### 2.4 Variáveis de Ambiente (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=✅ ou ❌
NEXT_PUBLIC_SUPABASE_ANON_KEY=✅ ou ❌
OPENAI_API_KEY=✅ ou ❌
STRIPE_SECRET_KEY=✅ ou ❌
STRIPE_PUBLISHABLE_KEY=✅ ou ❌
ADMIN_EMAILS=✅ ou ❌
```

---

## ETAPA 3 – Testar fluxo completo como usuário

### 3.1 Autenticação
- [ ] Criar conta com email/senha
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Recuperação de senha funciona
- [ ] Admin redireciona para `/admin`

### 3.2 Teste de Clareza
- [ ] Fazer teste completo (18 perguntas)
- [ ] Resultado aparece corretamente
- [ ] Resultado salva no banco
- [ ] Histórico de testes funciona

### 3.3 Diário de Episódios
- [ ] Criar episódio com texto
- [ ] Criar episódio com voz (se tiver)
- [ ] Editar episódio
- [ ] Apagar episódio
- [ ] Timeline funciona
- [ ] Marcadores aparecem

### 3.4 Chat com IA
- [ ] Enviar mensagem curta
- [ ] Enviar mensagem longa
- [ ] Resposta é acolhedora
- [ ] Não faz diagnóstico
- [ ] Botão de voz funciona (se tiver)

### 3.5 Configurações/LGPD
- [ ] Mudar flag "salvar histórico"
- [ ] Mudar flag "permitir IA aprender"
- [ ] Exportar dados funciona
- [ ] Apagar conta funciona

### 3.6 Saída Rápida / ESC
- [ ] Tecla ESC funciona (desktop)
- [ ] Botão "Saída Rápida" funciona
- [ ] Limpa dados locais
- [ ] Redireciona para Google
- [ ] Não deixa rastro no histórico

---

## ETAPA 4 – Colocar em ambiente online

### 4.1 Repositório
- [ ] Criar repositório no GitHub
- [ ] Subir código (sem chaves secretas!)
- [ ] `.gitignore` inclui `.env.local`

### 4.2 Deploy na Vercel
- [ ] Criar projeto na Vercel
- [ ] Conectar ao repositório
- [ ] Configurar variáveis de ambiente
- [ ] Deploy inicial

### 4.3 Testes em Produção
- [ ] Landing page carrega
- [ ] Login funciona
- [ ] Teste de Clareza funciona
- [ ] Diário funciona
- [ ] Chat com IA funciona
- [ ] URL acessível: https://_____.vercel.app

---

## ETAPA 5 – Teste com pessoas reais (Beta)

### 5.1 Selecionar Testadores
- [ ] Lista de 5-10 pessoas de confiança
- [ ] Incluir: pessoas próximas, profissionais, público-alvo
- [ ] Todos 18+
- [ ] Ninguém em crise aguda

### 5.2 Preparar Convite
- [ ] Script de convite pronto
- [ ] Link do app
- [ ] Instruções claras

### 5.3 Coletar Feedback
- [ ] O que foi fácil?
- [ ] O que foi confuso?
- [ ] O que mais ajudou?
- [ ] O que não usaria?
- [ ] Pagaria R$ XX/mês?

### 5.4 Ajustar com Base no Feedback
- [ ] Corrigir bugs reportados
- [ ] Melhorar textos confusos
- [ ] Simplificar fluxos complexos

---

## ETAPA 6 – Ligar o dinheiro

### 6.1 Definir Oferta
**Plano Gratuito:**
- [ ] 1 Teste de Clareza
- [ ] Diário limitado (X entradas)
- [ ] Chat limitado (X mensagens)

**Plano Premium (R$ XX/mês):**
- [ ] Testes ilimitados
- [ ] Diário ilimitado
- [ ] Chat ilimitado
- [ ] Relatórios PDF
- [ ] Plano de Segurança

### 6.2 Testar Stripe
- [ ] Fluxo de checkout funciona
- [ ] Pagamento teste aprovado
- [ ] Cancelamento funciona
- [ ] Status atualiza no banco

### 6.3 Atualizar Landing
- [ ] Seção de preços clara
- [ ] Botão "Assinar Premium"
- [ ] Explicação do que cada plano oferece

---

## ETAPA 7 – Preparar pacote de lançamento

### 7.1 Materiais
- [ ] Landing page finalizada
- [ ] Resumo de 1 parágrafo para WhatsApp
- [ ] 3 prints do app para redes sociais
- [ ] Vídeo curto (opcional)

### 7.2 Resumo para Compartilhar
```
"O Radar Narcisista BR é um app 100% confidencial com 
Teste de Clareza, Diário e IA acolhedora para quem vive 
ou viveu relações abusivas e precisa organizar a própria 
história sem julgamento."
```

### 7.3 Decidir Estratégia de Lançamento
- [ ] Beta fechado (20-50 pessoas)
- [ ] OU lançamento aberto gradual

---

## ETAPA 8 – Lançar pequeno, aprender grande

### 8.1 Membros Fundadores
- [ ] Convidar grupo inicial
- [ ] Oferecer desconto vitalício
- [ ] Explicar que é beta
- [ ] Pedir feedback constante

### 8.2 Métricas a Observar
- [ ] Quantos usam após 1 semana?
- [ ] Qual feature mais usada?
- [ ] Taxa de cancelamento
- [ ] NPS (recomendaria?)

### 8.3 Iterar
- [ ] Ajustar produto com base em dados
- [ ] Melhorar textos
- [ ] Adicionar features pedidas
- [ ] Remover features não usadas

---

## 📞 Contatos de Emergência (para usuários)

| Serviço | Número | Descrição |
|---------|--------|-----------|
| Polícia | 190 | Emergência |
| CVV | 188 | Apoio emocional 24h |
| Direitos Humanos | 100 | Denúncias |
| Central da Mulher | 180 | Violência contra mulher |
| SAMU | 192 | Emergência médica |

---

## 📝 Notas

_Use este espaço para anotações durante o processo:_

```
Data: ___/___/___
Observação: 
_________________________________
_________________________________
```

---

**Última atualização:** 25/11/2025
**Responsável:** Eduardo
