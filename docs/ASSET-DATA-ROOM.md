# 📁 ASSET DATA ROOM – Radar Narcisista

> Documentação completa do projeto para avaliação por compradores.

---

## 📋 Visão Geral

Este documento serve como **Data Room** para potenciais compradores do Radar Narcisista. Aqui você encontra um mapa de toda a documentação interna, código e recursos disponíveis.

---

## 📂 Estrutura do Repositório

```
radar-narcisista/
├── app/                    # Next.js App Router (páginas e APIs)
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Área logada da usuária
│   ├── (public)/          # Páginas públicas
│   ├── admin/             # Painel administrativo
│   ├── api/               # API Routes
│   └── profissional/      # Área do profissional
├── components/            # Componentes React reutilizáveis
├── lib/                   # Utilitários e configurações
├── hooks/                 # React hooks customizados
├── database/              # Scripts SQL e seeds
├── supabase/              # Migrações Supabase
├── docs/                  # Documentação técnica
├── tests/                 # Testes E2E (Playwright)
└── [arquivos .txt]        # Documentação de escopo/auditoria
```

---

## 📚 Documentação Interna por Categoria

### 1. 📜 Escopo e Roadmap

| Arquivo | Descrição |
|---------|-----------|
| `FUTURO-TERMINAR-IMPLEMENTACAO.txt` | Roadmap detalhado com todas as tarefas pendentes e concluídas |
| `ROADMAP-RADAR.txt` | Visão de produto e próximos passos |
| `ORIGEM-CORE.txt` | Origem e motivação do projeto |

### 2. 🔍 Auditorias Técnicas

| Arquivo | Descrição |
|---------|-----------|
| `AUDITORIA-MASTER-PREMIUM.txt` | Auditoria técnica completa do código |
| `AUDITORIA-COMPLETA-03-12-2025.md` | Auditoria mais recente |
| `AUDITORIA-DA-AUDITORIA-V2.txt` | Meta-auditoria de verificação |
| `AUDITORIA-COMPLETA-WINDSURF.txt` | Auditoria de implementação |

### 3. 🧠 Prompts e IA

| Arquivo | Descrição |
|---------|-----------|
| `PROMPTS-MESTRES-RADAR.txt` | Prompts calibrados para o Oráculo |
| `RADAR-PROMPTS-PATCHES-MEGA-COMPLETO.txt` | Patches e ajustes de prompts |
| `docs/ORACULO-CORE.md` | Documentação do sistema de IA |
| `docs/PATCH-AI-PERSONAS.md` | Personas de IA configuráveis |

### 4. 🗺️ Arquitetura e Visão

| Arquivo | Descrição |
|---------|-----------|
| `ATLAS-RADAR-NARCISISTA.txt` | Mapa completo da arquitetura |
| `HISTORICO-UNIFICADO.txt` | Histórico de todas as decisões |
| `docs/CONTROL-PLANE.md` | Plano de controle do sistema |

### 5. 📖 Manuais de Uso

| Arquivo | Descrição |
|---------|-----------|
| `docs/MANUAL-ADMIN.md` | Manual do administrador |
| `docs/MANUAL-USUARIA.md` | Manual da usuária final |
| `docs/MANUAL-PROFISSIONAL.md` | Manual do profissional |
| `docs/MANUAL-DEV.md` | Manual do desenvolvedor |

### 6. 💳 Billing e Negócio

| Arquivo | Descrição |
|---------|-----------|
| `docs/MODELO_NEGOCIO.md` | Modelo de negócio básico |
| `docs/MODELO_NEGOCIO_COMPLETO.md` | Modelo de negócio detalhado |
| `lib/stripe-config.ts` | Configuração do Stripe |
| `lib/stripe-planos-core.ts` | Lógica de planos |

### 7. 🏭 Gerador SaaS (Multi-instância)

| Arquivo | Descrição |
|---------|-----------|
| `docs/GERADOR-SAAS.md` | Documentação do gerador |
| `docs/GERADOR-CORE.md` | Core do gerador |
| `app/admin/gerador-saas/` | Interface do gerador |

### 8. 🧪 Testes

| Arquivo | Descrição |
|---------|-----------|
| `tests/` | Pasta com testes E2E Playwright |
| `tests/GUIA-TESTES-MANUAIS.md` | Guia de testes manuais |
| `playwright.config.ts` | Configuração do Playwright |

---

## 🔐 Informações Sensíveis

Alguns documentos contêm informações mais detalhadas sobre decisões internas e contexto pessoal do desenvolvimento. Estes podem ser compartilhados em negociação privada:

- Histórico completo de conversas de desenvolvimento
- Detalhes de decisões de produto
- Contexto de mercado brasileiro

---

## 📊 Métricas do Código

### Linhas de Código (estimativa)

| Área | Linhas |
|------|--------|
| Frontend (app/, components/) | ~15.000 |
| Backend (API routes) | ~5.000 |
| Lib/Hooks | ~3.000 |
| Testes | ~2.000 |
| Documentação | ~10.000 |
| **Total** | **~35.000** |

### Arquivos Principais

| Arquivo | Linhas | Função |
|---------|--------|--------|
| `app/api/diario/route.ts` | 248 | API do diário com detecção de risco |
| `app/admin/gerador-saas/page.tsx` | 845 | Gerador de instâncias SaaS |
| `lib/stripe-planos-core.ts` | 357 | Lógica de planos Stripe |
| `components/frontpage/DynamicSections.tsx` | 400+ | Seções dinâmicas da landing |

---

## ✅ Status de Implementação

### Ciclos Completos

| Ciclo | Descrição | Status |
|-------|-----------|--------|
| 1 | Banco de dados (Supabase) | ✅ 100% |
| 2 | Triângulo de Segurança (Auth + RLS) | ✅ 100% |
| 3 | FanPage Viva (Landing dinâmica) | ✅ 95% |
| 4 | Billing/Planos (Stripe) | ✅ 90% |
| 5 | Gerador SaaS (Multi-instância) | ✅ 100% |

### Funcionalidades Core

| Feature | Status |
|---------|--------|
| Autenticação completa | ✅ |
| Diário com tags de risco | ✅ |
| Detecção automática de risco | ✅ |
| Alertas de risco | ✅ |
| Dashboard da usuária | ✅ |
| Oráculo (Coach IA) | ✅ |
| Teste de Clareza | ✅ |
| Painel Admin | ✅ |
| Painel Profissional | ✅ |
| Planos e Billing | ✅ (90%) |
| Gerador de instâncias | ✅ |

---

## 🚀 Como Avaliar o Projeto

### 1. Demo Online
Veja [DEMO-GUIDE.md](DEMO-GUIDE.md) para acessar a demo.

### 2. Rodar Localmente
Veja [DEV-SETUP.md](DEV-SETUP.md) para instruções de setup.

### 3. Revisar Código
- Clone o repositório
- Explore a estrutura de pastas
- Leia os arquivos de documentação

### 4. Agendar Call
Entre em contato para uma apresentação ao vivo.

---

## 📞 Próximos Passos

1. Revisar esta documentação
2. Testar a demo online
3. Rodar localmente (opcional)
4. Agendar call para dúvidas
5. Fazer proposta

**Contato**: [SEU_EMAIL_AQUI]
