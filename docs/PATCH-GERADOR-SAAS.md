# PATCH – GERADOR DE SAAS (MÃE, CORE BRANCO, FILHOS)
## Estrutura, Clones e Independência

> **Versão:** 3.0  
> **Data:** 03/12/2025  
> **Prioridade:** MÁXIMA – Este PATCH tem prioridade sobre qualquer texto antigo

---

## 🎯 OBJETIVO

Este PATCH ajusta TUDO que for escrito daqui pra frente sobre:
- "Gerador de SaaS"
- "SaaS gerado pelo Gerador"
- Relação entre RADAR NARCISISTA e outros produtos gerados

**VALENDO A PARTIR DE AGORA.**

---

## 1. PAPÉIS OFICIAIS

### 1.1 RADAR-CORE (Projeto Mãe)

Aqui vivem:
- Módulos centrais (ORACULO_V2_CORE, PLANOS_CORE, segurança, LGPD, logging, etc.)
- Admin completo
- Dashboards
- Docs principais:
  - TUDO PARA O GPT.txt
  - ATLAS-RADAR-NARCISISTA.txt
  - ROADMAP-RADAR.txt
  - TESTES-RADAR.txt
  - LAMPADA-RADAR.txt
  - PATCH-ORACULO.md
  - REGRAS-COMUNICACAO-IA.md
  - BLOCO 1–20, 21–25, 31–35, etc.

### 1.2 GERADOR DE SAAS (Ferramenta)

Funções:
- Receber tema/vertente (ex.: "co-parent", "igrejas", "clínicas X")
- Configurar:
  - Público
  - Perfis de usuário
  - Tom de voz
  - Módulos ativados (oráculo, planos, etc.)
- Gerar um novo projeto completo:
  - Frontpage
  - App interna
  - Banco de dados
  - Stack configurada
  - Módulos CORE copiados

### 1.3 MODOS DO GERADOR DE SAAS

O Gerador deve ter, pelo menos, estes modos:

| Modo | Descrição |
|------|-----------|
| **MODO 1** | Criar SAAS TEMÁTICO a partir da MÃE (RADAR-CORE) |
| **MODO 2** | Criar CORE BRANCO (template neutro, sem tema) |
| **MODO 3** | Criar SAAS a partir de um CORE BRANCO existente |

### 1.4 CORE BRANCO (Template Neutro)

**Definição:**
- Projeto gerado a partir do RADAR-CORE
- Com mesma infraestrutura (planos, oráculos, segurança, admin)
- Porém SEM textos, copy e narrativas de tema (sem "narcisismo", etc.)

**Características:**
- Já nasce INDEPENDENTE da MÃE (outro repo/pasta)
- Já nasce com ambiente próprio
- Já nasce com KIT DE DOCS próprio:
  - `TUDO PARA O GPT – CORE-BRANCO-<ID>.txt`
  - `ATLAS-CORE-BRANCO-<ID>.txt`
  - `ROADMAP-CORE-BRANCO-<ID>.txt`
  - `TESTES-CORE-BRANCO-<ID>.txt`
  - `LAMPADA-CORE-BRANCO-<ID>.txt`

**Usos do CORE BRANCO:**

1. **Como produto final:**
   - Eduardo entra nesse projeto, personaliza manualmente
   - Segue a vida nesse SaaS usando os TXTs dele

2. **Como novo "template mãe" de uma linhagem:**
   - O GERADOR DE SAAS passa a enxergar esse CORE BRANCO como "novo core"
   - De onde podem nascer outros SaaS

### 1.5 SAAS TEMÁTICOS / ÚNICOS (Filhos)

Cada vez que o Gerador cria um novo SAAS:
- Tem **vida própria**
- Tem **código próprio**
- Tem **repositório próprio**
- Tem **ambiente próprio**
- Tem **KIT DE DOCS próprio**
- **NÃO é atualizado automaticamente** pelas futuras mudanças do RADAR-CORE nem do CORE BRANCO

Pode ser:
- Um produto do próprio Eduardo
- Um white label
- Um SaaS para um cliente específico

---

## 2. SIMBIOSE: O QUE O RADAR-CORE ENTREGA AO GERADOR

### Regra Global

> Tudo que for estruturado no RADAR-CORE como padrão de produto
> (planos, oráculos, segurança, LGPD, logging, admin, dashboards, docs)
> passa a ser parte do "CORE DO GERADOR DE SAAS".

### Módulos CORE Disponíveis

| Módulo | Descrição | Arquivo Principal |
|--------|-----------|-------------------|
| PLANOS_CORE | Features, profiles, catalog, overrides | `lib/planos-core.ts` |
| ORACULO_V2_CORE | IA multiperfil | `lib/oraculo/` |
| CONTROL_TOWER | Gerenciamento de projetos | `lib/control-tower.ts` |
| TELEMETRY_CORE | Heartbeats, erros, métricas | `database/MEGA-SQL-PARTE2.sql` |
| HELPDESK_CORE | Tickets, impersonation | `lib/helpdesk-core.ts` |
| ADDONS_CORE | Add-ons e créditos | `database/MEGA-SQL-PARTE2.sql` |
| RATE_LIMITER | Rate limiting por feature | `lib/rate-limiter.ts` |
| STRIPE_CORE | Checkout e webhooks | `lib/stripe-planos-core.ts` |

### Padrão de Documentação

- TUDO PARA O GPT
- ATLAS
- ROADMAP
- TESTES
- LÂMPADA
- PATCHes

---

## 3. INDEPENDÊNCIA: O QUE ACONTECE QUANDO UM SAAS É GERADO

### Decisão Oficial

> Depois que o Gerador cria um novo SaaS, **ELE SE TORNA INDEPENDENTE**.
> Não recebe updates automáticos do RADAR-CORE.

### O SaaS Gerado Vira:

- Outro repositório/pasta com:
  - Seu próprio `package.json`
  - Seu próprio `.env.example`
  - Seu próprio `schema.sql` / migrations
  - Seus próprios componentes, páginas, rotas
  - Seus próprios módulos CORE (copiados do template)

### Atualizações Futuras

Se o RADAR-CORE evoluir (ex.: PLANOS_CORE v2, ORACULO_V3), o SaaS gerado só será atualizado se o DONO decidir:
- Aplicar um "pacote de upgrade"
- Rodar migrations específicas
- Manualmente portar essas melhorias

**Nenhum SaaS gerado é "refém" das mudanças do RADAR-CORE.**

---

## 4. KIT DE DOCS PARA CADA SAAS GERADO

### Regra Obrigatória

> Cada novo SaaS gerado deve nascer com o seu próprio "KIT DE DOCS",
> seguindo o mesmo modelo do Radar, mas com nome próprio.

### KIT MÍNIMO

| Arquivo | Conteúdo |
|---------|----------|
| `TUDO PARA O GPT - <NOME>.txt` | Contexto, blocos, decisões |
| `ATLAS-<NOME>.txt` | Mapa de módulos, rotas, tabelas |
| `ROADMAP-<NOME>.txt` | Blocos 1–5, 6–10, etc. |
| `TESTES-<NOME>.txt` | Como testar rotas, fluxos, IAs |
| `LAMPADA-<NOME>.txt` | Ideias, dívidas técnicas |
| `PATCH-<NOME>.md` | Decisões conceituais (recomendado) |

### Inicialização

Esses arquivos devem ser inicializados com:
- Resumo do tema
- Perfis de usuário
- Módulos ativados
- Stack
- Versão do RADAR-CORE que serviu de base (ex.: "Baseado em RADAR-CORE@BLOCO-31–35")

### Objetivo

Permitir que o dono do SaaS:
- Pegue só esse KIT
- Cole no ChatGPT
- Continue evoluindo de forma autônoma

---

## 5. REGRAS PARA WINDSURF & CHATGPT

### Quando Estiverem num SaaS Gerado

1) Se os arquivos forem:
   - `TUDO PARA O GPT - COPARENT.txt`
   - `ATLAS-COPARENT.txt`
   - etc.

   **ENTÃO:** Estão trabalhando NO SAAS COPARENT, NÃO no RADAR-CORE.

2) Manter a mesma disciplina:
   - Usar blocos (1–5, 6–10, 31–35, etc.)
   - Registrar tudo em TUDO / ATLAS / ROADMAP / TESTES / LÂMPADA
   - Nunca mentir que implementou o que não implementou

3) Se precisar reaproveitar algo novo do RADAR-CORE:
   - Registrar na LÂMPADA: "💡 IDEA: importar PLANOS_CORE v2 do RADAR-CORE"
   - Planejar como bloco futuro
   - Só aplicar se o dono quiser

---

## 6. RESUMO EXECUTIVO

```
RADAR-CORE = projeto mãe, guarda os módulos CORE
GERADOR DE SAAS = usa o RADAR-CORE como blueprint
SAAS GERADO = nasce com código próprio, docs próprios, independente

TODA evolução estruturante no RADAR-CORE deve ser pensada
também como módulo CORE reaproveitável pelo GERADOR DE SAAS.

Windsurf e ChatGPT devem respeitar essa separação
e sempre registrar as decisões nos TXTs.
```

---

## 7. MÓDULOS CORE ATUAIS (BLOCO 40)

| Módulo | Status | Versão |
|--------|--------|--------|
| PLANOS_CORE | ✅ Completo | v1 |
| ORACULO_V2_CORE | ✅ Completo | v1 |
| CONTROL_TOWER | ✅ Completo | v1 |
| TELEMETRY_CORE | ✅ Completo | v1 |
| HELPDESK_CORE | ✅ Completo | v1 |
| ADDONS_CORE | ✅ Completo | v1 |
| RATE_LIMITER | ✅ Completo | v1 |
| STRIPE_CORE | ✅ Completo | v1 |
| LIMIT_NOTIFICATIONS | ✅ Completo | v1 |

---

**FIM DO PATCH – GERADOR DE SAAS & SAAS GERADOS**
