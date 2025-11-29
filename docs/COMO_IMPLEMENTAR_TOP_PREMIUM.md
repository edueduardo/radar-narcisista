# 👑 COMO IMPLEMENTAR O PLANO TOP PREMIUM
## Sessão com Psicólogo + Grupo VIP

---

# 🧠 SESSÃO COM PSICÓLOGO (1/mês)

## Como Funciona na Prática

### Opção 1: Parceria com Psicólogos (RECOMENDADO)
Você NÃO precisa contratar psicólogos. Você faz PARCERIA.

**Passo a Passo:**

1. **Encontrar psicólogos parceiros**
   - Procure psicólogos que atendem online
   - Foque em especialistas em: relacionamentos abusivos, narcisismo, trauma
   - LinkedIn, Instagram, indicações

2. **Proposta de parceria**
   ```
   "Olá [Nome], sou criador do Radar Narcisista, um app que ajuda 
   pessoas em relacionamentos abusivos. Temos usuários Premium que 
   gostariam de sessões com profissionais especializados.
   
   Proposta:
   - Você atende nossos usuários (30 min/sessão)
   - Nós pagamos R$ 80-100 por sessão
   - Você ganha pacientes qualificados (já sabem o problema)
   - Possibilidade de continuar atendimento particular
   
   Interesse em conversar?"
   ```

3. **Modelo financeiro**
   ```
   Usuário paga: R$ 99,90/mês (Top Premium)
   Você paga ao psicólogo: R$ 80-100/sessão
   Sobra para você: R$ 0-20 (mas ganha na fidelização)
   
   OU
   
   Usuário paga: R$ 99,90/mês
   Psicólogo cobra: R$ 150 (preço normal)
   Você subsidia: R$ 50-70 (desconto exclusivo)
   Usuário economiza: R$ 50-70
   ```

4. **Agendamento**
   - Use Calendly (grátis) para agendamentos
   - Ou integre com Google Calendar
   - Usuário escolhe horário disponível

### Opção 2: Plataformas de Terapia Online
Fazer parceria com plataformas que já têm psicólogos:

| Plataforma | Como Funciona |
|------------|---------------|
| **Zenklub** | Parceria corporativa, desconto para usuários |
| **Vittude** | Programa de benefícios |
| **Psicologia Viva** | Convênios |
| **Telavita** | Parcerias B2B |

**Vantagem:** Eles já têm a estrutura, você só indica.
**Desvantagem:** Menos controle, menos margem.

### Opção 3: Sessões em Grupo (mais barato)
Em vez de sessão individual, fazer sessão em GRUPO:

```
1 psicólogo atende 5-10 pessoas
Custo: R$ 200/sessão
Dividido por 10 pessoas: R$ 20/pessoa
Você cobra: R$ 99,90/mês
Lucro: R$ 79,90/pessoa
```

**Formato:**
- Grupo de apoio online (Zoom/Google Meet)
- 1x por mês, 1 hora
- Tema do mês: "Como lidar com gaslighting", "Reconstruindo autoestima"
- Psicólogo modera, usuários compartilham

---

# 💬 GRUPO VIP WHATSAPP

## Como Criar e Gerenciar

### Passo 1: Criar o Grupo
1. Criar grupo no WhatsApp Business
2. Nome: "Radar Narcisista VIP 👑"
3. Descrição com regras

### Passo 2: Regras do Grupo
```
📜 REGRAS DO GRUPO VIP

✅ PERMITIDO:
- Compartilhar experiências
- Pedir apoio e conselhos
- Celebrar conquistas
- Fazer perguntas

❌ PROIBIDO:
- Identificar o abusador (nome, foto, local)
- Conselhos médicos/jurídicos específicos
- Spam ou propaganda
- Desrespeito a qualquer membro
- Prints ou compartilhamento externo

⚠️ IMPORTANTE:
- Este grupo NÃO substitui terapia
- Em emergência, ligue 188 (CVV) ou 180
- Moderadores podem remover membros

Ao entrar, você concorda com estas regras.
```

### Passo 3: Moderação
**Quem modera:**
- Você (admin principal)
- 1-2 moderadores de confiança
- Opcional: psicólogo parceiro

**Ferramentas:**
- WhatsApp Business (gratuito)
- Ou Telegram (mais recursos para grupos grandes)
- Ou Discord (melhor para comunidades)

### Passo 4: Conteúdo Exclusivo
O que postar no grupo VIP:

| Dia | Conteúdo |
|-----|----------|
| Segunda | Frase motivacional da semana |
| Quarta | Dica prática (como responder a gaslighting) |
| Sexta | Espaço aberto para desabafos |
| Domingo | Celebração de conquistas da semana |

### Passo 5: Limite de Membros
- Máximo 50-100 pessoas por grupo
- Grupos menores = mais intimidade
- Se crescer, criar Grupo VIP 2, 3...

---

# 💻 IMPLEMENTAÇÃO TÉCNICA

## No App: Verificar se é Top Premium

```typescript
// lib/checkPremium.ts
export async function isTopPremium(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single()
  
  return data?.plan === 'top_premium'
}
```

## Página de Agendamento

```typescript
// app/agendar-psicologo/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { isTopPremium } from '@/lib/checkPremium'

export default function AgendarPsicologoPage() {
  const [canAccess, setCanAccess] = useState(false)
  
  useEffect(() => {
    // Verificar se usuário é Top Premium
    checkAccess()
  }, [])
  
  if (!canAccess) {
    return (
      <div className="text-center py-12">
        <h1>Recurso Exclusivo Top Premium</h1>
        <p>Faça upgrade para agendar sessões com psicólogos.</p>
        <a href="/planos">Ver Planos</a>
      </div>
    )
  }
  
  return (
    <div>
      <h1>Agendar Sessão com Psicólogo</h1>
      {/* Embed do Calendly ou formulário próprio */}
      <iframe 
        src="https://calendly.com/seu-usuario/sessao-radar"
        width="100%"
        height="600"
      />
    </div>
  )
}
```

## Link do Grupo VIP

```typescript
// app/grupo-vip/page.tsx
'use client'

export default function GrupoVIPPage() {
  const [canAccess, setCanAccess] = useState(false)
  
  // Verificar se é Top Premium...
  
  if (!canAccess) {
    return <Paywall />
  }
  
  return (
    <div className="text-center py-12">
      <h1>👑 Grupo VIP</h1>
      <p>Clique no botão abaixo para entrar no grupo exclusivo.</p>
      
      <a 
        href="https://chat.whatsapp.com/SEU_LINK_DO_GRUPO"
        target="_blank"
        className="btn-primary"
      >
        Entrar no Grupo VIP
      </a>
      
      <div className="mt-8">
        <h2>Regras do Grupo</h2>
        {/* Mostrar regras */}
      </div>
    </div>
  )
}
```

---

# 💰 CUSTOS E LUCROS

## Cenário: 100 usuários Top Premium

```
RECEITA:
100 usuários x R$ 99,90 = R$ 9.990/mês

CUSTOS:
- Psicólogo (100 sessões x R$ 80) = R$ 8.000
- WhatsApp Business = R$ 0
- Seu tempo moderando = ???

LUCRO: R$ 1.990/mês
```

## Cenário Otimizado: Sessões em Grupo

```
RECEITA:
100 usuários x R$ 99,90 = R$ 9.990/mês

CUSTOS:
- Psicólogo (10 sessões grupo x R$ 200) = R$ 2.000
- WhatsApp Business = R$ 0

LUCRO: R$ 7.990/mês ✅
```

---

# 📋 CHECKLIST DE IMPLEMENTAÇÃO

## Sessão com Psicólogo
- [ ] Encontrar 3-5 psicólogos parceiros
- [ ] Definir modelo de pagamento
- [ ] Criar conta no Calendly
- [ ] Criar página de agendamento no app
- [ ] Testar fluxo completo

## Grupo VIP
- [ ] Criar grupo no WhatsApp Business
- [ ] Escrever regras do grupo
- [ ] Definir moderadores
- [ ] Criar página de acesso no app
- [ ] Planejar conteúdo semanal

## Técnico
- [ ] Implementar verificação de plano
- [ ] Criar páginas protegidas
- [ ] Integrar com Stripe (verificar assinatura)
- [ ] Testar fluxo de upgrade

---

# 🎯 DICA FINAL

**Comece simples:**
1. Encontre 1 psicólogo parceiro
2. Crie 1 grupo WhatsApp
3. Ofereça para os primeiros 10 usuários
4. Aprenda e ajuste
5. Escale depois

**Não precisa ter tudo perfeito no dia 1!**

---

**Documento criado em 25/11/2025**
