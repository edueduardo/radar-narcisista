# 🎯 Radar Narcisista – Plataforma SaaS com IA para Clareza em Relacionamentos

> **Projeto em desenvolvimento avançado (MVP 97% completo), disponível para aquisição como ASSET tecnológico.**

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green)
![Stripe](https://img.shields.io/badge/Stripe-Billing-purple)
![AI](https://img.shields.io/badge/AI-OpenAI%20%7C%20Anthropic-orange)

---

## 📋 Visão Geral

O **Radar Narcisista** é uma plataforma web (SaaS) que usa **Inteligência Artificial + registro estruturado** para ajudar pessoas a ganharem clareza em relacionamentos potencialmente abusivos ou tóxicos.

### O Problema que Resolve

Milhões de pessoas vivem em relacionamentos onde sofrem manipulação, gaslighting, controle ou abuso emocional – mas não conseguem enxergar o padrão. O Radar oferece:

- **Diário guiado** para registrar episódios e sentimentos
- **Detecção automática de padrões de risco** via IA
- **Indicadores visuais** de comportamentos problemáticos
- **Coach de Clareza (Oráculo)** – assistente de IA para reflexão
- **Painel para profissionais** (psicólogos, terapeutas)

> ⚠️ **IMPORTANTE**: O Radar NÃO faz diagnóstico clínico e NÃO substitui acompanhamento profissional de saúde mental.

---

## 👥 Personas e Papéis

| Papel | Descrição |
|-------|-----------|
| **Usuária Final** | Pessoa que registra episódios, usa o diário, vê indicadores de risco |
| **Profissional** | Psicólogo/terapeuta que acompanha casos de pacientes |
| **Admin** | Gerencia a plataforma, configura IA, monitora métricas |

---

## 🛠️ Stack Técnica

| Tecnologia | Uso |
|------------|-----|
| **Next.js 15** (App Router) | Frontend + API Routes |
| **TypeScript** | Tipagem estática |
| **Supabase** | Banco (Postgres) + Auth + RLS |
| **Stripe** | Billing e assinaturas |
| **OpenAI / Anthropic** | Integração de IA |
| **Tailwind CSS** | Estilização |
| **Vercel** | Deploy |
| **Playwright** | Testes E2E |

---

## 📊 Estado Atual do Projeto

### ✅ Implementado (97%)

| Módulo | Status |
|--------|--------|
| Autenticação (login/cadastro/recuperação) | ✅ 100% |
| Diário com detecção de risco | ✅ 100% |
| Dashboard da usuária | ✅ 100% |
| Sistema de alertas de risco | ✅ 100% |
| Oráculo (Coach de IA) | ✅ 100% |
| Teste de Clareza | ✅ 100% |
| Painel Admin | ✅ 100% |
| Billing/Planos (Stripe) | ✅ 90% |
| FanPage dinâmica | ✅ 95% |
| Gerador de SaaS (multi-instância) | ✅ 100% |
| Testes E2E (Playwright) | ✅ 90% |

### 🔧 Pendências Mínimas

1. Configurar `price_id` reais do Stripe (variáveis de ambiente)
2. Executar seed de conteúdo da FanPage no Supabase

---

## 📦 O que está incluído na venda

- ✅ **Código-fonte completo** (Next.js + Supabase + Stripe + IA)
- ✅ **Documentação extensa** (40+ arquivos .md/.txt)
- ✅ **Prompts de IA auditados** (Oráculo, detecção de risco)
- ✅ **Scripts de banco de dados** (migrações, seeds)
- ✅ **Testes E2E** (Playwright configurado)
- ✅ **Deploy configurado** (Vercel)
- ✅ **Marca "Radar Narcisista"** (opcional, negociável)

### Documentação Interna Inclusa

- `HISTORICO-UNIFICADO.txt` – Histórico completo de decisões
- `FUTURO-TERMINAR-IMPLEMENTACAO.txt` – Roadmap detalhado
- `AUDITORIA-MASTER-PREMIUM.txt` – Auditoria técnica completa
- `ATLAS-RADAR-NARCISISTA.txt` – Visão arquitetural
- `PROMPTS-MESTRES-RADAR.txt` – Prompts de IA calibrados
- 40+ documentos de especificação, manuais e guias

---

## 🚀 Possíveis Caminhos para o Comprador

1. **Lançar como SaaS B2C** focado em relacionamentos abusivos
2. **Generalizar** para "clareza emocional" ou "saúde de relacionamentos"
3. **Whitelabel para clínicas/ONGs** (arquitetura multi-instância pronta)
4. **Usar como boilerplate** de SaaS em saúde mental com IA
5. **Licenciar para profissionais** (psicólogos, coaches)

---

## 💻 Como Rodar Localmente

### Pré-requisitos

- Node.js 18+
- Conta Supabase (gratuita)
- Conta Stripe (modo teste)
- Chave OpenAI ou Anthropic

### Instalação

```bash
# Clonar repositório
git clone https://github.com/edueduardo/radar-narcisista.git
cd radar-narcisista

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas chaves

# Rodar em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

### Variáveis de Ambiente

Veja `.env.example` para a lista completa. Principais:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
OPENAI_API_KEY=
```

---

## 💰 Status de Monetização

- **Estágio**: Pre-revenue (MVP pronto, não lançado comercialmente)
- **Modelo planejado**: Assinaturas mensais/anuais (4 planos)
- **Potencial adicional**: Licenciamento B2B, whitelabel, serviços

---

## 📄 Licença

Este projeto é **PROPRIETÁRIO** (All Rights Reserved).

Veja `LICENSE-RADAR-ASSET.txt` para detalhes.

O repositório está público apenas para avaliação por potenciais compradores.

---

## 📞 Contato para Aquisição

Interessado em adquirir, licenciar ou fazer parceria?

- **Nome**: Eduardo
- **Email**: [SEU_EMAIL_AQUI]
- **GitHub**: https://github.com/edueduardo
- **Localização**: Brasil (BRT)

---

## 📚 Guias Adicionais

- [Guia de Demo Online](docs/DEMO-GUIDE.md)
- [Guia de Setup para Devs](docs/DEV-SETUP.md)
- [Data Room do Asset](docs/ASSET-DATA-ROOM.md)
- [Manual do Admin](docs/MANUAL-ADMIN.md)
- [Manual da Usuária](docs/MANUAL-USUARIA.md)
