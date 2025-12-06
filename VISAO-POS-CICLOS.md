# VISÃO PÓS-CICLOS – RADAR NARCISISTA BR

> **Documento de Inovação Estratégica**
> Criado em: 05/12/2025
> Autor: Eduardo + Windsurf
> Status: ROADMAP FUTURO (após CICLOS 1-5)

---

## PRÉ-REQUISITOS (CICLOS 1-5)

Antes de entrar nestes eixos de inovação, os seguintes ciclos devem estar **100% concluídos**:

| CICLO | DESCRIÇÃO | STATUS |
|-------|-----------|--------|
| 1 | Banco redondo (SQLs consolidados) | ✅ CONCLUÍDO |
| 2 | Triângulo de Segurança funcionando | ✅ CONCLUÍDO |
| 3 | FanPage Viva v1 no ar | ⏳ PENDENTE |
| 4 | Billing/frontpage/planos amarrados | ⏳ PENDENTE |
| 5 | Gerador de SaaS Fase 2 (mãe → filhos) | ⏳ PENDENTE |

---

## EIXOS DE INOVAÇÃO PÓS-CICLOS

### 1️⃣ ORÁCULO V3 – "Linha do Tempo de Padrões"

**Conceito:** Radar como "mapa de trajetória", não só "foto do momento".

**Componentes:**

#### a) Linha do Tempo Visual
- Eventos marcantes (diário)
- Momentos de escalada de risco
- Momentos de "clareza" (insights, testes)
- Visualização temporal da relação/situação

#### b) Padrões no Tempo
- Correlações temporais: "Nas semanas em que X aconteceu, também aumentou Y"
- Exemplos: culpa ↔ isolamento, explosão ↔ autossabotagem
- **REGRA:** Sem diagnóstico, só padrões + perguntas

#### c) Módulo "Se eu continuar assim..."
- NÃO é prever futuro
- É mostrar padrões históricos
- Exemplo: "Nas últimas 12 semanas, quando você ignorou estes sinais, o que aconteceu depois foi..."
- **REGRA:** Sempre devolver a pergunta, nunca "mandar" fazer nada

**Arquivos potenciais:**
- `lib/oraculo-v3-timeline.ts`
- `components/TimelinePatterns.tsx`
- `app/dashboard/timeline-patterns/page.tsx`

---

### 2️⃣ ENGINE DE PROTOCOLOS – Blocos Modulares Reutilizáveis

**Conceito:** Parar de pensar em telas, começar a pensar em **protocolos**.

**Exemplos de Protocolos:**
- "Protocolo: Sair da Neblina"
- "Protocolo: Registrar Evidências com Segurança"
- "Protocolo: Reconstrução de Identidade"
- "Protocolo: Preparar-se para Conversa Difícil"

**Estrutura de um Protocolo:**
```typescript
interface Protocol {
  id: string
  name: string
  description: string
  duration_days: number
  steps: ProtocolStep[]
  exports: ('pdf' | 'report' | 'timeline')[]
  target_audience: ('user' | 'professional' | 'both')
}

interface ProtocolStep {
  order: number
  type: 'screen' | 'question' | 'exercise' | 'alert' | 'reflection'
  content: string
  triggers?: string[] // condições para avançar
  metadata?: Record<string, any>
}
```

**Inovação:**
> "RADAR não é só um app, é um **motor de protocolos emocionais** que alimenta vários SaaS."

**Arquivos potenciais:**
- `lib/protocol-engine.ts`
- `database/migrate-protocols.sql`
- `app/admin/protocolos/page.tsx`
- `app/admin/protocolos/builder/page.tsx`

---

### 3️⃣ FERRAMENTAS AVANÇADAS PARA PROFISSIONAIS (B2B/Pro)

**Conceito:** Subir o nível sem virar sistema jurídico/psicológico.

#### a) Builder de Dossiê
Com um clique, gera dossiê organizado:
- Timeline de eventos relevantes
- Marcações de risco
- Diários selecionados
- Gráficos de variação de humor/percepção
- **DISCLAIMER:** "Isto é um registro pessoal, não laudo, não diagnóstico"

#### b) Painel de Casos com Leitura de Padrões
- Dentro da instância do profissional (sem misturar dados)
- Padrões entre casos dele:
  - Tipos de dinâmicas mais comuns
  - Momentos típicos de abandono/recaída

#### c) Modo Supervisão
- Profissional experiente vê como outro usa os protocolos
- Não para vigiar, mas para co-criar boas práticas
- Transforma Radar em **plataforma de prática profissional**

**Arquivos potenciais:**
- `app/profissional/dossie-builder/page.tsx`
- `app/profissional/painel-casos/page.tsx`
- `app/profissional/supervisao/page.tsx`
- `lib/dossie-generator.ts`

---

### 4️⃣ RADAR LAB – Micro-Radares Experimentais

**Conceito:** Espaço para criar micro-Radares temáticos, rápidos, com risco controlado.

**Exemplos de Micro-Radares:**
- Radar para dinâmicas de trabalho abusivo
- Radar para burnout em squads
- Radar para dinâmica familiar específica
- Radar para relacionamentos com vício

**Reutiliza:**
- Engine de Protocolos
- Oráculo V2/V3
- Billing
- Gerador de SaaS

**Diferencia:**
- Temas, perguntas e metáforas diferentes
- Dados separados por instância (princípio já existente)

**Resultado:**
> Portfólio de Radares usando a mesma fundação.

**Arquivos potenciais:**
- `app/admin/radar-lab/page.tsx`
- `app/admin/radar-lab/criar/page.tsx`
- `lib/micro-radar-factory.ts`

---

### 5️⃣ CO-CRIAÇÃO GUIADA – "Radar me ajuda a pensar o próximo passo"

**Conceito:** Sistema como co-planejador de recuperação.

**Funcionalidade:**
- Sistema faz perguntas inteligentes (baseadas no histórico da pessoa)
- Monta mini-jornada personalizada de 7/14 dias:
  - Que telas ver
  - Que exercícios fazer
  - Quando registrar
  - Quando revisar

**REGRAS INVIOLÁVEIS:**
1. Nunca "faça isso", sempre "uma opção é... você quer fazer?"
2. Nunca diagnóstico, sempre padrões + perguntas

**Inovação na experiência:**
> Não é só "mais uma tela", é o sistema agindo como **co-planejador** sem ultrapassar fronteiras éticas.

**Arquivos potenciais:**
- `lib/journey-co-creator.ts`
- `components/JourneyBuilder.tsx`
- `app/dashboard/minha-jornada/page.tsx`

---

## RESUMO ESTRATÉGICO

> **Depois de todos os ciclos "duros" (banco, segurança, FanPage, billing, SaaS), a grande inovação não é mais feature, é:**
>
> Transformar o Radar de "um sistema" em um **motor de protocolos e trajetórias** que:
> - Ajuda a pessoa usuária a entender a própria história no tempo
> - Ajuda o profissional a estruturar intervenções e dossiês
> - Permite gerar novos micro-Radares em cima dessa mesma inteligência

---

---

## EIXOS DE INOVAÇÃO – NÍVEL PLATAFORMA 2.0

### 6️⃣ RADAR STUDIO – "Figma de Protocolos Emocionais"

**Conceito:** Transformar todo o stack em um builder visual.

**Funcionalidade:**
- Arrastar blocos: `Pergunta → Diário → Alerta → Insight → PDF → Encaminhamento`
- Ligar em fluxos visuais (igual automação, mas emocional/comportamental)

**Saídas:**
- Protocolo utilizável no Radar principal
- Pacote pronto para micro-SaaS filho
- Documentação automática (auditoria + onboarding)

**Inovação:**
> Em vez de vender "Radar pronto", vender um **estúdio para criar micro-Radares e protocolos**.

**Integra com:**
- Gerador de SaaS
- Engine de Protocolos
- Auditoria automática de fluxos

**Arquivos potenciais:**
```
app/admin/radar-studio/page.tsx
app/admin/radar-studio/editor/page.tsx
lib/protocol-visual-builder.ts
lib/protocol-compiler.ts
components/studio/BlockPalette.tsx
components/studio/FlowCanvas.tsx
```

---

### 7️⃣ RADAR AUDIT BOT – Auditor Autônomo como Produto

**Conceito:** Transformar auditoria manual em produto automatizado.

**O que audita:**
- Protocolo alinhado com ética
- Não dá conselho tipo "larga ele agora"
- Perguntas não empurram para culpa/auto-culpa tóxica

**Fluxo:**
1. Profissional cria/edita protocolo no Radar Studio
2. Audit Bot faz review automático:
   - Linguagem
   - Coerência com princípios (sem diagnóstico, sem determinismo)
   - Risco de sugestão imprudente
3. Gera relatório: "90% alinhado; pontos críticos: X, Y, Z"

**Monetização:**
> "Radar Compliance Layer" para clínicas, redes, ONGs

**Arquivos potenciais:**
```
lib/audit-bot/index.ts
lib/audit-bot/language-checker.ts
lib/audit-bot/ethics-validator.ts
lib/audit-bot/risk-detector.ts
app/admin/audit-reports/page.tsx
```

---

### 8️⃣ RADAR MARKUP – Linguagem de Interoperabilidade

**Conceito:** Formato padrão para descrever protocolos.

**Estrutura (JSON/DSL):**
```json
{
  "protocol": "sair-da-neblina",
  "version": "1.0",
  "blocks": [
    { "type": "question", "id": "q1", "text": "...", "next": "q2" },
    { "type": "diary_prompt", "id": "d1", "trigger": "q1.answer == 'sim'" },
    { "type": "alert", "id": "a1", "level": "HIGH", "condition": "..." },
    { "type": "export", "format": "pdf", "template": "relatorio-clareza" }
  ],
  "metadata": {
    "author": "...",
    "audit_score": 92,
    "tags": ["clareza", "segurança"]
  }
}
```

**Usos práticos:**
- **Import/Export:** Profissional exporta `.radar.json`, outro importa
- **Marketplace futuro:** Protocolos validados pelo Audit Bot
- **Integração:** Outros sistemas "entendem" protocolo Radar

**Arquivos potenciais:**
```
lib/radar-markup/parser.ts
lib/radar-markup/validator.ts
lib/radar-markup/compiler.ts
lib/radar-markup/types.ts
app/api/protocols/import/route.ts
app/api/protocols/export/route.ts
```

---

### 9️⃣ RADAR RESEARCH MODE – Módulo de Pesquisa

**Conceito:** Ferramenta para pesquisa aplicada, com governança.

**Regras invioláveis:**
- Sempre opt-in
- Consentimento explícito
- Dados anonimizados/agrupados
- Instância separada

**Funcionalidades:**
- Pesquisadores desenham estudos usando blocos do Radar
- Gerenciamento de consentimento integrado
- Randomização de grupos (A/B)
- Coleta estruturada (sem texto livre sensível, se desejado)
- Exports prontos para análise estatística

**Inovação:**
> Radar vira ferramenta para **pesquisa aplicada** sobre relações abusivas, recuperação, impacto de intervenções.

**Arquivos potenciais:**
```
app/research/page.tsx
app/research/estudos/page.tsx
app/research/consentimento/page.tsx
lib/research/anonymizer.ts
lib/research/consent-manager.ts
lib/research/statistical-export.ts
database/migrate-research-module.sql
```

---

### 🔟 MÓDULO REPARAÇÃO & RECONSTRUÇÃO – Pós-Saída

**Conceito:** Não só sobreviver, mas reconstruir identidade e vida.

**Diferencial:**
- Hoje: clareza, segurança, triângulo, registro
- Novo: reconstrução de identidade, projeto de vida, relações futuras

**Componentes:**

#### a) Módulo "Cicatriz" (nome ilustrativo)
Protocolos focados em:
- Reconstrução de identidade
- Confiança em si
- Escolha de novos relacionamentos
- Reentrada em carreira/negócio após abuso

#### b) Oráculo em Modo Reconstrução
- Foco em metas positivas (não só risco)
- Tracking de progresso ao longo de meses/anos
- Celebração de marcos de recuperação

#### c) Micro-Radares de Reconstrução
- "Radar Reconstrução Profissional"
- "Radar Novos Relacionamentos"
- "Radar Autoconfiança"

**Inovação:**
> Diferencia de qualquer coisa só focada em "detectar narcisista" – vira **plataforma de ciclos de vida**.

**Arquivos potenciais:**
```
app/reconstrucao/page.tsx
app/reconstrucao/identidade/page.tsx
app/reconstrucao/metas/page.tsx
lib/reconstruction-tracker.ts
components/MilestoneTimeline.tsx
```

---

## ORDEM SUGERIDA DE IMPLEMENTAÇÃO (COMPLETA)

### FASE 1: FUNDAÇÃO (CICLOS 1-5)
| CICLO | DESCRIÇÃO | STATUS |
|-------|-----------|--------|
| 1 | Banco redondo | ✅ |
| 2 | Triângulo de Segurança | ✅ |
| 3 | FanPage Viva v1 | ⏳ |
| 4 | Billing/planos | ⏳ |
| 5 | Gerador SaaS Fase 2 | ⏳ |

### FASE 2: INOVAÇÃO PRODUTO (CICLOS 6-10)
| CICLO | EIXO | COMPLEXIDADE | IMPACTO |
|-------|------|--------------|---------|
| 6 | Oráculo V3 – Timeline | MÉDIA | ALTO |
| 7 | Engine de Protocolos | ALTA | MUITO ALTO |
| 8 | Builder de Dossiê (Pro) | MÉDIA | ALTO |
| 9 | Co-criação Guiada | MÉDIA | ALTO |
| 10 | Radar Lab | ALTA | ESTRATÉGICO |

### FASE 3: PLATAFORMA 2.0 (CICLOS 11-15)
| CICLO | EIXO | COMPLEXIDADE | IMPACTO |
|-------|------|--------------|---------|
| 11 | Radar Studio | MUITO ALTA | TRANSFORMADOR |
| 12 | Radar Audit Bot | ALTA | COMPLIANCE |
| 13 | Radar Markup | ALTA | ECOSSISTEMA |
| 14 | Radar Research Mode | ALTA | ACADÊMICO |
| 15 | Módulo Reparação | MÉDIA | DIFERENCIAÇÃO |

---

## NOTAS PARA O FUTURO

- Este documento deve ser revisitado após conclusão do CICLO 5
- Cada eixo pode virar um CICLO próprio com prompt detalhado
- Manter sempre as regras éticas do Radar (sem diagnóstico, sem "mandar")
- Considerar feedback de usuárias reais antes de implementar

---

**FIM DO DOCUMENTO**
