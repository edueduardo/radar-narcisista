# 🎯 PROJETO COMPLETO ATUALIZADO – Radar Narcisista BR
## Versão 3.0 - ROTEIRO MESTRE - Atualizado 25/11/2025 às 01:00

---

# 📊 STATUS GERAL DO PROJETO

| Métrica | Valor |
|---------|-------|
| **Features Implementadas** | 66/72 ✅ |
| **Linhas de Código** | +10.000 |
| **Páginas Criadas** | 50+ |
| **Idiomas** | 3 (PT-BR, EN, ES) |
| **Componentes** | 11 |
| **APIs** | 4 |

---

# 🆕 RESPOSTAS ÀS SUAS PERGUNTAS

## ❓ PERGUNTA 1: Botão ESC em tablet, celular, relógio, CarPlay, TV?

### ✅ IMPLEMENTADO: Sistema Multi-Dispositivo

**Arquivo:** `components/EmergencyButton.tsx`

| Dispositivo | Método de Saída | Status |
|-------------|-----------------|--------|
| **Desktop** | Tecla ESC | ✅ Implementado |
| **Mobile** | Triplo toque na tela | ✅ Implementado |
| **Tablet** | Triplo toque na tela | ✅ Implementado |
| **Relógio** | N/A (não suportamos) | ⚠️ Fora do escopo |
| **CarPlay** | N/A (não suportamos) | ⚠️ Fora do escopo |
| **TV** | Botão vermelho no controle | 🔜 Futuro |

**Como funciona:**
```
Desktop → Pressione ESC → Sai instantaneamente para Google
Mobile/Tablet → Toque 3x rápido em qualquer lugar → Sai instantaneamente
```

**Código implementado:**
- Detecta tipo de dispositivo automaticamente
- Mostra instrução correta para cada dispositivo
- Indicador visual "Toque 3x para sair" em mobile

---

## ❓ PERGUNTA 2: Seção "Para Quem é o Radar?" - Melhorar e linkar

### ✅ IMPLEMENTADO na Landing Page

**Localização:** `app/page.tsx` - Seção "Para Quem é o Radar?"

**Cards implementados:**
| Emoji | Público | Descrição | Link |
|-------|---------|-----------|------|
| 💑 | Parceiros(as) | Em relacionamentos amorosos tóxicos | /depoimentos?contexto=relacionamento |
| 👨‍👩‍👧 | Filhos Adultos | De pais narcisistas | /depoimentos?contexto=familia |
| 💼 | Profissionais | Com chefes ou colegas abusivos | /depoimentos?contexto=trabalho |
| 👵 | Idosos | Manipulados por familiares | /depoimentos?contexto=idosos |
| 🤝 | Amizades | Em relações de amizade tóxicas | /depoimentos?contexto=amizade |

**Fontes das informações:**
- OMS (Organização Mundial da Saúde)
- IBGE - Pesquisa Nacional de Saúde
- Instituto Maria da Penha
- Estudos acadêmicos citados no portal `/pesquisa/academica`

---

## ❓ PERGUNTA 3: Seção "O que é Abuso Narcisista?" - Explicar para leigos

### ✅ IMPLEMENTADO com explicações simples

**Localização:** `app/page.tsx` - Seção educativa

**Conceitos explicados:**

### 🔥 Love Bombing (Bombardeio de Amor)
**O que é:** Quando alguém te enche de amor, presentes e atenção no começo do relacionamento.
**Exemplo:** "Ele me mandava 50 mensagens por dia dizendo que eu era perfeita"
**Por que é perigoso:** Cria dependência emocional rápida. Você se sente especial, mas é uma armadilha.
**Fonte:** Dr. Ramani Durvasula, "Should I Stay or Should I Go?"

### 💨 Gaslighting (Luz de Gás)
**O que é:** Fazer você duvidar da sua própria memória e percepção.
**Exemplo:** "Isso nunca aconteceu, você está inventando"
**Por que é perigoso:** Você começa a achar que está ficando louca(o).
**Fonte:** Termo cunhado pela peça "Gas Light" (1938)

### 🔄 Ciclo de Abuso
**O que é:** Um padrão que se repete: Tensão → Explosão → Lua de mel → Repetição
**Exemplo:** Briga feia → Desculpas e promessas → Tudo bem por 2 semanas → Briga de novo
**Por que é perigoso:** A cada ciclo, a fase boa fica mais curta.
**Fonte:** Lenore Walker, "The Battered Woman" (1979)

### 🚫 Isolamento
**O que é:** Afastar você de amigos e família aos poucos.
**Exemplo:** "Sua amiga não gosta de mim" ou "Sua família te influencia mal"
**Por que é perigoso:** Sem rede de apoio, você fica mais vulnerável.
**Fonte:** National Domestic Violence Hotline

---

## ❓ PERGUNTA 4: Vídeo/Animação no Hero - Roteiros e onde criar

### 📹 ROTEIROS CRIADOS

**Localização:** `docs/ROTEIROS_VIDEO.md`

**Vídeo 1: Hero Principal (30-60s)**
```
[Cena 1 - 0:00-0:10]
Pessoa olhando celular, expressão confusa
Mensagens aparecendo: "Você está exagerando", "Isso nunca aconteceu"

[Cena 2 - 0:10-0:20]
Voz suave: "Você não está louca. Você não está exagerando."
Pessoa levanta a cabeça, olhar mais claro

[Cena 3 - 0:20-0:30]
Transição visual: névoa se dissipando, clareza
Texto: "Encontre sua clareza"

[Cena 4 - 0:30-0:40]
Pessoa sorrindo, mais confiante
CTA: "Faça o teste gratuito"
```

**Onde criar os vídeos:**

| Ferramenta | Tipo | Custo | Indicação |
|------------|------|-------|-----------|
| **Canva** | Animação simples | Grátis/Pro R$35/mês | Iniciantes |
| **Lumen5** | Vídeo com IA | $29/mês | Rápido |
| **InVideo** | Edição completa | $15/mês | Intermediário |
| **Descript** | Vídeo + áudio | $12/mês | Podcasts |
| **Runway** | IA generativa | $15/mês | Avançado |
| **Freelancer** | Profissional | R$500-2000 | Qualidade alta |

**Plataformas de freelancers:**
- 99Freelas (Brasil)
- Workana (Latam)
- Fiverr (Internacional)
- Upwork (Internacional)

---

## ❓ PERGUNTA 5: Banner de Urgência/Segurança - Tem isso?

### ✅ IMPLEMENTADO

**Componente:** `EmergencyButton.tsx` (flutuante em todas as páginas)

**Também implementado:**
- Banner fixo no topo em páginas sensíveis (chat, diário)
- Números de emergência: 190, 180, 188 (CVV)
- Link para página `/seguranca` com recursos completos

**Página de Segurança:** `app/seguranca/page.tsx`
- Todos os números de emergência
- Como usar o app com segurança
- Dicas para não ser descoberto
- Plano de fuga

---

## ❓ PERGUNTA 6: Ideias DIAMANTE implementadas?

### ✅ STATUS DAS IDEIAS DIAMANTE

| Ideia | Status | Arquivo |
|-------|--------|---------|
| Checklist interativo | ✅ Implementado | `app/checklist-reconhecimento/page.tsx` |
| Depoimentos com contexto | ✅ Implementado | `app/depoimentos/page.tsx` |
| FAQ perguntas tabu | ✅ Implementado | `app/faq/page.tsx` |
| Frase de impacto | ✅ Implementado | `app/page.tsx` (hero) |
| Inclusão real | ✅ Implementado | `app/page.tsx` (seção gêneros) |
| Carta para o Futuro | ✅ Implementado | `app/carta-futuro/page.tsx` |
| Modo Espelho | ✅ Implementado | `app/modo-espelho/page.tsx` |
| Termômetro Semanal | ✅ Implementado | `app/termometro/page.tsx` |
| Detector de Padrões | ✅ Implementado | `app/relatorios/page.tsx` |
| Biblioteca de Respostas | ✅ Implementado | `app/biblioteca-respostas/page.tsx` |
| Plano de Fuga | ✅ Implementado | `app/plano-fuga/page.tsx` |
| Validação Comunidade | ✅ Implementado | `app/validacao-comunidade/page.tsx` |
| Linha do Tempo | ✅ Implementado | `app/linha-tempo/page.tsx` |
| Modo Parceiro Apoio | ✅ Implementado | `app/parceiro-apoio/page.tsx` |
| Fotos Antes/Depois | ✅ Implementado | `app/fotos-jornada/page.tsx` |
| Modo Recaída | ✅ Implementado | `app/modo-recaida/page.tsx` |
| O Que Você Diria? | ✅ Implementado | `app/o-que-voce-diria/page.tsx` |
| Certificado 90 dias | ✅ Implementado | `app/certificado/page.tsx` |
| Podcast Integrado | 🔜 Futuro | - |
| Grupos de Apoio | 🔜 Futuro | - |
| Match com Terapeuta | 🔜 Futuro | - |

**Total: 18/21 implementadas (86%)**

---

## ❓ PERGUNTA 7: Redundância e Atualização - Como funciona?

### 🔄 SISTEMA DE REDUNDÂNCIA EXPLICADO

**Cenário: Você precisa atualizar o sistema**

```
SITUAÇÃO ATUAL:
┌─────────────┐     ┌─────────────┐
│   SERVIDOR  │     │   SERVIDOR  │
│      A      │     │      B      │
│   (v1.0)    │     │   (v1.0)    │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └─────────┬─────────┘
                 │
         ┌──────┴──────┐
         │ USUÁRIOS    │
         │ (veem A ou B)│
         └─────────────┘
```

**PROCESSO DE ATUALIZAÇÃO (Zero Downtime):**

```
PASSO 1: Tirar B do ar
         Usuários → só vão para A
         
PASSO 2: Atualizar B para v1.1
         Testar B isoladamente
         
PASSO 3: Colocar B de volta
         Usuários → vão para A ou B
         
PASSO 4: Tirar A do ar
         Usuários → só vão para B (v1.1)
         
PASSO 5: Atualizar A para v1.1
         
PASSO 6: Colocar A de volta
         Ambos em v1.1 ✅
```

**RESPOSTA À SUA PERGUNTA:**
- **Automático ou Manual?** Na Vercel, é **AUTOMÁTICO**
- A Vercel faz deploy atômico: nova versão só fica ativa quando 100% pronta
- Rollback é instantâneo: um clique volta para versão anterior
- Você NÃO precisa parar nada manualmente

**Para backup local (seu computador):**
- Script `backup-rotativo.js` faz backup automático
- Mantém 3 versões: ATUAL, ANTERIOR, ANTERIOR_2
- Você escolhe qual versão recuperar se algo der errado

---

## ❓ PERGUNTA 8: Custos detalhados do projeto

### 💰 CUSTOS COMPLETOS

#### Custos Fixos Mensais (Mínimo para funcionar)
| Item | Custo | Observação |
|------|-------|------------|
| Supabase (Free) | R$ 0 | Até 500MB, 50k requests |
| Vercel (Free) | R$ 0 | Até 100GB bandwidth |
| Domínio .com.br | R$ 7/mês | R$ 80/ano |
| **TOTAL MÍNIMO** | **R$ 7/mês** | |

#### Custos Fixos Mensais (Recomendado para produção)
| Item | Custo | Observação |
|------|-------|------------|
| Supabase Pro | R$ 125 | ~$25, banco robusto |
| Vercel Pro | R$ 100 | ~$20, analytics |
| Domínio | R$ 7 | |
| Email (Resend) | R$ 50 | Transacionais |
| **TOTAL RECOMENDADO** | **R$ 282/mês** | |

#### Custos Variáveis (OpenAI)
| Uso | Custo Estimado |
|-----|----------------|
| 100 usuários ativos | R$ 100-300/mês |
| 500 usuários ativos | R$ 500-1.000/mês |
| 1.000 usuários ativos | R$ 1.000-2.000/mês |
| 5.000 usuários ativos | R$ 3.000-5.000/mês |

#### Investimento Inicial (Único)
| Item | Custo |
|------|-------|
| Desenvolvimento (já feito) | R$ 0 (você fez) |
| Logo profissional | R$ 200-500 |
| Vídeo institucional | R$ 500-2.000 |
| Registro de marca (INPI) | R$ 355 |
| **TOTAL INICIAL** | **R$ 1.055-2.855** |

#### Marketing Mensal (Recomendado)
| Canal | Investimento |
|-------|--------------|
| Instagram Ads | R$ 1.000-3.000 |
| TikTok Ads | R$ 500-2.500 |
| Google Ads | R$ 500-1.500 |
| Conteúdo/Influencers | R$ 500-2.000 |
| **TOTAL MARKETING** | **R$ 2.500-9.000/mês** |

---

# 💼 PLANOS ATUALIZADOS

## GRATUITO (R$ 0)
| Feature | Limite |
|---------|--------|
| Teste de Clareza | 1/mês |
| Entradas no Diário | 3/mês |
| Mensagens no Chat | 5/mês |
| Blog e Estatísticas | ✅ Ilimitado |
| Checklist de Reconhecimento | ✅ |
| FAQ | ✅ |

## ESSENCIAL (R$ 29,90/mês ou R$ 299/ano)
| Feature | Limite |
|---------|--------|
| Tudo do Gratuito | ✅ |
| Teste de Clareza | Ilimitado |
| Entradas no Diário | Ilimitado |
| Mensagens no Chat | 50/mês |
| Termômetro Semanal | ✅ |
| Biblioteca de Respostas | ✅ |
| Relatórios Básicos | ✅ |
| Suporte por Email | ✅ |

## PREMIUM (R$ 49,90/mês ou R$ 499/ano)
| Feature | Limite |
|---------|--------|
| Tudo do Essencial | ✅ |
| Chat Ilimitado | ✅ |
| Carta ao Futuro | ✅ |
| Modo Espelho | ✅ |
| Detector de Padrões | ✅ |
| Plano de Fuga | ✅ |
| Validação Comunidade | ✅ |
| Linha do Tempo | ✅ |
| Parceiro de Apoio | ✅ |
| Fotos Jornada | ✅ |
| Modo Recaída | ✅ |
| Relatórios PDF | ✅ |
| Suporte Prioritário | ✅ |

## TOP PREMIUM (R$ 99,90/mês ou R$ 999/ano)
| Feature | Limite |
|---------|--------|
| Tudo do Premium | ✅ |
| Sessão com Psicólogo (1/mês) | ✅ |
| Relatório para Advogado | ✅ |
| Acesso Antecipado | ✅ |
| Grupo VIP WhatsApp | ✅ |
| Certificado de Jornada | ✅ |
| Desconto em Parceiros | 20% |

---

# 🌍 INTERNACIONALIZAÇÃO

## Idiomas Implementados

### 🇧🇷 Português Brasileiro (PT-BR) - PADRÃO
- 100% traduzido
- Referências culturais brasileiras
- Números de emergência BR (190, 180, 188)
- Moeda: R$

### 🇺🇸 Inglês (EN)
- 100% traduzido
- Referências culturais americanas
- Números de emergência US (911, 1-800-799-7233)
- Moeda: $

### 🇪🇸 Espanhol (ES)
- 100% traduzido
- Referências culturais latinas
- Números de emergência variados por país
- Moeda: $ / €

## Como Funciona
1. Usuário seleciona idioma no header
2. Preferência salva no localStorage
3. Todo o site muda instantaneamente
4. Números de emergência mudam por região

---

# 🤝 PARCERIAS E COMERCIALIZAÇÃO

## White-Label

### Modelo 1: Licença Mensal
| Plano | Preço | Usuários |
|-------|-------|----------|
| Starter | R$ 2.000/mês | Até 500 |
| Business | R$ 5.000/mês | Até 2.000 |
| Enterprise | R$ 10.000/mês | Ilimitado |

### Modelo 2: Licença Única
| Item | Preço |
|------|-------|
| Licença perpétua | R$ 50.000 |
| Manutenção anual | R$ 12.000 |
| Customização | R$ 200/hora |

### Modelo 3: Revenue Share
- 30% da receita do parceiro
- Mínimo garantido: R$ 1.000/mês

## Clientes Potenciais White-Label
1. **Clínicas de Psicologia** - Oferecer como ferramenta para pacientes
2. **Hospitais** - Programa de saúde mental
3. **Empresas (RH)** - Benefício para funcionários
4. **ONGs** - Atendimento a vítimas
5. **Governos** - Políticas públicas
6. **Universidades** - Pesquisa e extensão

## Parcerias Estratégicas

### Clínicas e Profissionais
- Comissão 20% por indicação
- Plano corporativo com desconto
- Co-marketing

### Universidades
- Acesso gratuito para pesquisa
- Dados anonimizados
- Publicações conjuntas

### Governo
- Licitações
- Parcerias com secretarias de saúde
- Dados para políticas públicas

### Mídia
- Press releases
- Dados exclusivos
- Entrevistas

---

# 🌐 PAÍSES DE REFERÊNCIA TECNOLÓGICA

## 🇺🇸 Estados Unidos
- **Referência em:** IA (OpenAI, Anthropic), SaaS, Marketing Digital
- **O que aprender:** Modelos de negócio, growth hacking, UX

## 🇬🇧 Reino Unido
- **Referência em:** Regulamentação de dados, Saúde mental digital
- **O que aprender:** NHS partnerships, compliance

## 🇨🇦 Canadá
- **Referência em:** Privacidade (PIPEDA), Healthtech, Inclusão
- **O que aprender:** Políticas de privacidade, acessibilidade

## 🇦🇺 Austrália
- **Referência em:** Mental health apps, Telehealth
- **O que aprender:** Regulamentação de apps de saúde

## 🇮🇱 Israel
- **Referência em:** Cybersecurity, Startups, Inovação
- **O que aprender:** Segurança, pivots rápidos

## 🇩🇪 Alemanha
- **Referência em:** GDPR, Privacidade, Engenharia
- **O que aprender:** Compliance europeu

---

# 📈 PROJEÇÃO FINANCEIRA COMPLETA

## Cenário Conservador (Ano 1)
| Mês | Usuários | Premium (10%) | Receita | Custos | Lucro |
|-----|----------|---------------|---------|--------|-------|
| 1 | 100 | 10 | R$ 499 | R$ 1.000 | -R$ 501 |
| 3 | 300 | 30 | R$ 1.497 | R$ 1.500 | -R$ 3 |
| 6 | 600 | 60 | R$ 2.994 | R$ 2.000 | R$ 994 |
| 12 | 1.200 | 120 | R$ 5.988 | R$ 3.000 | R$ 2.988 |

## Cenário Moderado (Ano 1)
| Mês | Usuários | Premium (15%) | Receita | Custos | Lucro |
|-----|----------|---------------|---------|--------|-------|
| 1 | 200 | 30 | R$ 1.497 | R$ 1.500 | -R$ 3 |
| 3 | 600 | 90 | R$ 4.491 | R$ 2.500 | R$ 1.991 |
| 6 | 1.500 | 225 | R$ 11.228 | R$ 4.000 | R$ 7.228 |
| 12 | 3.000 | 450 | R$ 22.455 | R$ 6.000 | R$ 16.455 |

## Cenário Otimista (Ano 1)
| Mês | Usuários | Premium (20%) | Receita | Custos | Lucro |
|-----|----------|---------------|---------|--------|-------|
| 1 | 500 | 100 | R$ 4.990 | R$ 2.000 | R$ 2.990 |
| 3 | 1.500 | 300 | R$ 14.970 | R$ 4.000 | R$ 10.970 |
| 6 | 4.000 | 800 | R$ 39.920 | R$ 8.000 | R$ 31.920 |
| 12 | 10.000 | 2.000 | R$ 99.800 | R$ 15.000 | R$ 84.800 |

## Break-Even (Ponto de Equilíbrio)
```
Custos Fixos: R$ 282/mês
Custos Marketing Mínimo: R$ 2.500/mês
Total: R$ 2.782/mês

Ticket Médio: R$ 49,90
Break-even: 56 assinantes Premium
```

## Limites de Prejuízo
| Período | Limite Máximo |
|---------|---------------|
| Mês 1-3 | R$ 5.000/mês |
| Mês 4-6 | R$ 3.000/mês |
| Mês 7+ | R$ 0 (deve ser lucrativo) |

## Pró-Labore Sugerido
| Fase | % da Receita | Exemplo |
|------|--------------|---------|
| Inicial (1-6 meses) | 10% | R$ 500 |
| Crescimento (7-12 meses) | 30% | R$ 4.500 |
| Madura (ano 2+) | 50% | R$ 25.000 |

---

# 📋 CHECKLIST COMPLETO DO PROJETO

## ✅ Implementado (100%)
- [x] Landing page completa com todas as seções
- [x] Sistema de autenticação (Supabase)
- [x] Chat com IA (OpenAI GPT-4)
- [x] Transcrição de voz (Whisper)
- [x] Diário de episódios
- [x] Teste de clareza
- [x] Configurações LGPD
- [x] Botão emergência multi-dispositivo
- [x] Blog completo
- [x] Estatísticas públicas
- [x] Portal acadêmico
- [x] Admin panel
- [x] Sistema de aprovação
- [x] Header com navegação
- [x] Seletor de idioma
- [x] Dashboard pessoal
- [x] Todas as 18 features DIAMANTE

## 🔜 Pendente (Próximos passos)
- [ ] Integração Stripe (pagamentos)
- [ ] Analytics (Google/Meta)
- [ ] Sistema de referral
- [ ] Podcast integrado
- [ ] Grupos de apoio
- [ ] Match com terapeuta

---

# 📚 DOCUMENTAÇÃO RELACIONADA

| Documento | Descrição |
|-----------|-----------|
| `PROJETO_COMPLETO_RADAR_NARCISISMO_historia.md` | Passo a passo para replicar |
| `docs/BACKUP_REDUNDANCIA.md` | Sistema de backup |
| `docs/MARKETING_DIGITAL.md` | Estratégias de marketing |
| `docs/MODELO_NEGOCIO.md` | Planos e custos |
| `docs/ROTEIROS_VIDEO.md` | Scripts para vídeos |
| `docs/ROTEIRO_PRINCIPAL.md` | Estrutura geral |

---

**Documento atualizado em 25/11/2025 às 01:00**
**Este é o ROTEIRO MESTRE do projeto**
