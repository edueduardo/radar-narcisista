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

## ORDEM SUGERIDA DE IMPLEMENTAÇÃO (PÓS-CICLOS)

| FASE | EIXO | COMPLEXIDADE | IMPACTO |
|------|------|--------------|---------|
| 6 | Oráculo V3 – Timeline de Padrões | MÉDIA | ALTO |
| 7 | Engine de Protocolos | ALTA | MUITO ALTO |
| 8 | Builder de Dossiê (Pro) | MÉDIA | ALTO |
| 9 | Co-criação Guiada | MÉDIA | ALTO |
| 10 | Radar Lab | ALTA | ESTRATÉGICO |

---

## NOTAS PARA O FUTURO

- Este documento deve ser revisitado após conclusão do CICLO 5
- Cada eixo pode virar um CICLO próprio com prompt detalhado
- Manter sempre as regras éticas do Radar (sem diagnóstico, sem "mandar")
- Considerar feedback de usuárias reais antes de implementar

---

**FIM DO DOCUMENTO**
