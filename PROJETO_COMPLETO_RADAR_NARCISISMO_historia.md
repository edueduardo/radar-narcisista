# 📜 HISTÓRIA DE IMPLEMENTAÇÃO - RADAR NARCISISTA BR
## Guia Passo a Passo para Replicação Completa
### Versão 1.0 - 25/11/2025

---

# 🎯 OBJETIVO DESTE DOCUMENTO

Este documento serve como **manual de replicação** do projeto Radar Narcisista BR. Qualquer pessoa ou IA pode seguir estes passos para reconstruir o projeto do zero, exatamente como foi implementado.

---

# 📋 PRÉ-REQUISITOS

## Software Necessário
```
1. Node.js v18+ (https://nodejs.org)
2. npm ou yarn
3. Git
4. VS Code ou editor similar
5. Conta no Supabase (https://supabase.com)
6. Conta na OpenAI (https://platform.openai.com)
7. Conta na Vercel (https://vercel.com) - para deploy
```

## Conhecimentos Recomendados
- JavaScript/TypeScript básico
- React básico
- Conceitos de banco de dados
- Linha de comando básica

---

# 🚀 PASSO 1: CRIAR PROJETO NEXT.JS

## 1.1 Criar projeto
```bash
npx create-next-app@latest radar-narcisista --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

## 1.2 Entrar na pasta
```bash
cd radar-narcisista
```

## 1.3 Instalar dependências principais
```bash
npm install @supabase/supabase-js @supabase/ssr openai lucide-react
```

## 1.4 Instalar dependências de desenvolvimento
```bash
npm install -D @types/node
```

---

# 🗄️ PASSO 2: CONFIGURAR SUPABASE

## 2.1 Criar projeto no Supabase
1. Acessar https://supabase.com
2. Criar novo projeto
3. Anotar: URL do projeto e chave anon

## 2.2 Criar arquivo de conexão
**Arquivo:** `lib/supabaseClient.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## 2.3 Criar variáveis de ambiente
**Arquivo:** `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
OPENAI_API_KEY=sua_chave_openai_aqui
```

## 2.4 Executar schema do banco
Copiar conteúdo de `database/schema.sql` e executar no SQL Editor do Supabase.

---

# 🤖 PASSO 3: CONFIGURAR OPENAI

## 3.1 Criar arquivo de conexão
**Arquivo:** `lib/openai.ts`
```typescript
import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
```

## 3.2 Criar API de chat
**Arquivo:** `app/api/ai/chat/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

const SYSTEM_PROMPT = `Você é o Coach de Clareza do Radar Narcisista...`

export async function POST(request: NextRequest) {
  const { message, history } = await request.json()
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: message }
    ]
  })
  
  return NextResponse.json({ 
    response: completion.choices[0].message.content 
  })
}
```

---

# 🎨 PASSO 4: CRIAR ESTRUTURA DE PASTAS

```
radar-narcisista/
├── app/
│   ├── admin/
│   ├── api/
│   │   ├── ai/
│   │   └── voice/
│   ├── blog/
│   ├── cadastro/
│   ├── carta-futuro/
│   ├── chat/
│   ├── checklist-reconhecimento/
│   ├── configuracoes/
│   ├── contato/
│   ├── dashboard/
│   ├── depoimentos/
│   ├── diario/
│   ├── estatisticas/
│   ├── faq/
│   ├── fotos-jornada/
│   ├── linha-tempo/
│   ├── login/
│   ├── modo-espelho/
│   ├── modo-recaida/
│   ├── o-que-voce-diria/
│   ├── parceiro-apoio/
│   ├── pesquisa/
│   ├── plano-fuga/
│   ├── planos/
│   ├── relatorios/
│   ├── seguranca/
│   ├── termometro/
│   ├── teste-claridade/
│   ├── validacao-comunidade/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Accessibility.tsx
│   ├── Analytics.tsx
│   ├── EmergencyButton.tsx
│   ├── Header.tsx
│   ├── LanguageSelector.tsx
│   ├── Microphone.tsx
│   ├── Onboarding.tsx
│   ├── Paywall.tsx
│   ├── ThemeProvider.tsx
│   └── Toast.tsx
├── lib/
│   ├── openai.ts
│   ├── supabaseClient.ts
│   └── translations.ts
├── database/
│   └── schema.sql
├── docs/
│   ├── BACKUP_REDUNDANCIA.md
│   ├── HISTORIA_IMPLEMENTACAO.md
│   ├── MARKETING_DIGITAL.md
│   ├── MODELO_NEGOCIO.md
│   ├── ROTEIROS_VIDEO.md
│   └── ROTEIRO_PRINCIPAL.md
└── public/
```

---

# 🛡️ PASSO 5: IMPLEMENTAR COMPONENTES CRÍTICOS

## 5.1 Botão de Emergência
**Arquivo:** `components/EmergencyButton.tsx`

**Funcionalidades:**
- ESC para desktop → sair rápido
- Triplo toque para mobile/tablet
- Limpar localStorage, sessionStorage, cookies
- Redirecionar para Google
- Menu com 3 opções

**Código completo:** Ver arquivo no projeto

## 5.2 Header com Navegação
**Arquivo:** `components/Header.tsx`

**Funcionalidades:**
- Menu dropdown para estatísticas
- Links para todas as seções
- Responsivo mobile
- Seletor de idioma

## 5.3 Seletor de Idioma
**Arquivo:** `components/LanguageSelector.tsx`

**Funcionalidades:**
- PT-BR, EN, ES
- Salva preferência no localStorage
- Versão compacta para header

---

# 📄 PASSO 6: CRIAR PÁGINAS PRINCIPAIS

## 6.1 Landing Page (/)
**Arquivo:** `app/page.tsx`

**Seções implementadas:**
1. Hero com frase de impacto
2. Seção inclusiva (homens e mulheres)
3. Checklist de reconhecimento
4. O que é abuso narcisista
5. Para quem é o Radar
6. Ciclo do relacionamento
7. Mitos vs Realidade
8. Contador de impacto
9. Ferramentas exclusivas
10. Como funciona
11. Depoimentos
12. FAQ
13. CTA final
14. Footer

## 6.2 Dashboard (/dashboard)
**Arquivo:** `app/dashboard/page.tsx`

**Funcionalidades:**
- Cards de estatísticas
- Sistema de XP e níveis
- Ações rápidas
- Últimas entradas

## 6.3 Chat IA (/chat)
**Arquivo:** `app/chat/page.tsx`

**Funcionalidades:**
- Interface de conversa
- Botão de voz (Whisper)
- Histórico de mensagens
- Detecção de crise

## 6.4 Diário (/diario)
**Arquivo:** `app/diario/page.tsx`

**Funcionalidades:**
- Lista de episódios
- Filtros por data/tag
- Novo episódio com voz
- Edição e exclusão

---

# 💎 PASSO 7: IMPLEMENTAR FEATURES DIAMANTE

## 7.1 Carta para o Futuro
**Arquivo:** `app/carta-futuro/page.tsx`
- Escrever carta para si mesmo
- Agendar envio (30, 60, 90 dias)
- Visualizar cartas enviadas

## 7.2 Modo Espelho
**Arquivo:** `app/modo-espelho/page.tsx`
- Descrever situação
- IA pergunta: "O que você diria para uma amiga?"
- Reflexão guiada

## 7.3 Termômetro de Clareza
**Arquivo:** `app/termometro/page.tsx`
- Check-in semanal
- Gráfico de evolução
- Histórico de humor

## 7.4 Detector de Padrões
**Arquivo:** `app/relatorios/page.tsx`
- Análise de episódios
- Identificar gatilhos
- Ciclos recorrentes

## 7.5 Biblioteca de Respostas
**Arquivo:** `app/biblioteca-respostas/page.tsx`
- Frases prontas por situação
- Copiar para usar
- Favoritos

## 7.6 Plano de Fuga
**Arquivo:** `app/plano-fuga/page.tsx`
- Checklist criptografado
- Documentos, dinheiro, contatos
- Privado e seguro

## 7.7 Validação da Comunidade
**Arquivo:** `app/validacao-comunidade/page.tsx`
- Descrever situação anônima
- Votação: saudável/dúvida/preocupa
- Resultado agregado

## 7.8 Linha do Tempo
**Arquivo:** `app/linha-tempo/page.tsx`
- Visualização do ciclo
- Marcar onde está
- Histórico visual

## 7.9 Modo Parceiro de Apoio
**Arquivo:** `app/parceiro-apoio/page.tsx`
- Convidar pessoa de confiança
- Alertas de inatividade
- Permissões configuráveis

## 7.10 Fotos Antes/Depois
**Arquivo:** `app/fotos-jornada/page.tsx`
- Galeria privada
- Fases: antes, durante, agora
- Comparação visual

## 7.11 FAQ Perguntas Tabu
**Arquivo:** `app/faq/page.tsx`
- "Sou eu o narcisista?"
- "Por que é difícil sair?"
- Categorias e busca

## 7.12 Checklist Interativo
**Arquivo:** `app/checklist-reconhecimento/page.tsx`
- 24 frases para marcar
- Resultado por categoria
- Nível de alerta

## 7.13 Depoimentos com Contexto
**Arquivo:** `app/depoimentos/page.tsx`
- Histórias por categoria
- Relacionamento, trabalho, família
- Filtros

## 7.14 Modo Recaída
**Arquivo:** `app/modo-recaida/page.tsx`
- Botão de emergência
- Mostrar piores episódios
- Carta do passado

## 7.15 O Que Você Diria?
**Arquivo:** `app/o-que-voce-diria/page.tsx`
- Ler história de outra pessoa
- Dar conselho
- Revelar: "Esse conselho é para VOCÊ"

## 7.16 Certificado de Jornada
**Arquivo:** `app/certificado/page.tsx`
- Após 90 dias
- Certificado visual
- Marco de coragem

---

# 🌐 PASSO 8: IMPLEMENTAR INTERNACIONALIZAÇÃO

## 8.1 Criar arquivo de traduções
**Arquivo:** `lib/translations.ts`

```typescript
export const translations = {
  'pt-BR': {
    hero: {
      title: 'Você não está imaginando coisas.',
      subtitle: 'Se você está aqui...'
    },
    // ... todas as traduções
  },
  'en': {
    hero: {
      title: "You're not imagining things.",
      subtitle: 'If you are here...'
    },
    // ...
  },
  'es': {
    hero: {
      title: 'No te lo estás imaginando.',
      subtitle: 'Si estás aquí...'
    },
    // ...
  }
}
```

## 8.2 Criar hook de tradução
**Arquivo:** `lib/useTranslation.ts`

```typescript
import { useState, useEffect } from 'react'
import { translations } from './translations'

export function useTranslation() {
  const [locale, setLocale] = useState('pt-BR')
  
  useEffect(() => {
    const saved = localStorage.getItem('locale')
    if (saved) setLocale(saved)
  }, [])
  
  const t = (key: string) => {
    const keys = key.split('.')
    let value = translations[locale]
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }
  
  return { t, locale, setLocale }
}
```

---

# 🔄 PASSO 9: CONFIGURAR BACKUP E REDUNDÂNCIA

## 9.1 Estrutura de 3 níveis
```
BACKUPS_RADAR/
├── ATUAL/           ← Espelho atual
├── ANTERIOR/        ← 1 backup atrás
└── ANTERIOR_2/      ← 2 backups atrás
```

## 9.2 Script de backup
**Arquivo:** `scripts/backup-rotativo.js`
- Ver arquivo completo em `docs/BACKUP_REDUNDANCIA.md`

## 9.3 Agendar no Windows
```bash
schtasks /create /tn "Backup Radar" /sc daily /st 03:00 /tr "node scripts/backup-rotativo.js"
```

---

# 📊 PASSO 10: CONFIGURAR ADMIN

## 10.1 Painel Admin
**Arquivo:** `app/admin/page.tsx`

**Abas:**
1. Dashboard - Métricas gerais
2. Usuários - Gerenciamento
3. Conteúdo - Blog e artigos
4. Estatísticas - Dados
5. Configurações - Sistema

## 10.2 Analytics Admin
**Arquivo:** `app/admin/analytics/page.tsx`
- Total usuários
- Ativos/Premium
- MRR
- Conversão/Churn

## 10.3 Gerenciador de Usuários
**Arquivo:** `app/admin/usuarios/page.tsx`
- Lista com busca
- Filtros
- Ações (premium, ban)

---

# 🚀 PASSO 11: DEPLOY

## 11.1 Preparar para produção
```bash
npm run build
```

## 11.2 Deploy na Vercel
1. Conectar repositório GitHub
2. Configurar variáveis de ambiente
3. Deploy automático

## 11.3 Configurar domínio
1. Comprar domínio (ex: radarnarcisista.com.br)
2. Configurar DNS na Vercel
3. Ativar HTTPS

---

# ✅ CHECKLIST DE VERIFICAÇÃO

## Funcionalidades Core
- [ ] Landing page completa
- [ ] Sistema de autenticação
- [ ] Chat com IA funcionando
- [ ] Diário de episódios
- [ ] Teste de clareza
- [ ] Configurações LGPD

## Segurança
- [ ] Botão emergência (ESC + triplo toque)
- [ ] RLS no Supabase
- [ ] HTTPS ativo
- [ ] Variáveis de ambiente seguras

## Features Diamante
- [ ] Carta ao futuro
- [ ] Modo espelho
- [ ] Termômetro
- [ ] Biblioteca de respostas
- [ ] Plano de fuga
- [ ] Validação comunidade
- [ ] Linha do tempo
- [ ] Parceiro de apoio
- [ ] Fotos jornada
- [ ] FAQ tabu
- [ ] Checklist interativo
- [ ] Depoimentos
- [ ] Modo recaída
- [ ] O que você diria
- [ ] Certificado

## Internacionalização
- [ ] PT-BR completo
- [ ] EN completo
- [ ] ES completo
- [ ] Seletor funcionando

## Admin
- [ ] Dashboard métricas
- [ ] Gerenciamento usuários
- [ ] Sistema aprovação conteúdo

## Backup
- [ ] Script funcionando
- [ ] Agendamento ativo
- [ ] Testado recuperação

---

# 📝 NOTAS IMPORTANTES

## Sobre Custos
- OpenAI: ~$50-200/mês (depende do uso)
- Supabase Pro: ~$25/mês
- Vercel Pro: ~$20/mês
- Domínio: ~R$80/ano

## Sobre Segurança
- NUNCA expor chaves de API
- Sempre usar RLS no Supabase
- Implementar rate limiting
- Monitorar custos da OpenAI

## Sobre Manutenção
- Backup diário automático
- Monitorar erros (Sentry)
- Atualizar dependências mensalmente
- Testar em múltiplos dispositivos

---

# 🔗 REFERÊNCIAS

- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- OpenAI: https://platform.openai.com/docs
- Tailwind: https://tailwindcss.com/docs
- Vercel: https://vercel.com/docs

---

**Documento criado em 25/11/2025**
**Última atualização: 25/11/2025 00:30**
