/**
 * 🎯 ÍNDICE DE CLAREZA (IC) - Versão 2.0
 * 
 * Métrica proprietária do Radar Narcisista.
 * Não é diagnóstico, não é saúde mental.
 * É um índice de uso / organização / clareza da jornada dentro do Radar.
 * 
 * Escala 0 a 100, com 3 faixas:
 * 0–33 → BAIXA (pouco uso / pouca organização ainda)
 * 34–66 → EM_TRANSICAO
 * 67–100 → EM_FASE_DE_CLAREZA
 */

// src/lib/clarityIndex.ts

export type ClarityIndexInput = {
  userId: string;

  // Último teste de clareza
  lastTest?: {
    fogScore: number;      // "nevoa"
    fearScore: number;     // "medo"
    limitsScore: number;   // "limites"
    createdAt: string;     // ISO
  };

  // Diário
  journalStats: {
    totalEntries: number;
    last30dEntries: number;
    daysWithEntriesLast30d: number;
  };

  // Chat IA
  chatStats: {
    totalMessages: number;
    last30dSessions: number;
  };

  // Planos / ações concretas
  planStats: {
    hasSafetyPlan: boolean;   // plano de segurança simples
    hasTherapyPlan: boolean;  // anotou que está em terapia / buscando
  };
};

export type ClarityIndexLevel =
  | 'BAIXA'
  | 'EM_TRANSICAO'
  | 'EM_FASE_DE_CLAREZA';

export type ClarityIndexComponent = {
  component: 'TESTE' | 'DIARIO' | 'CHAT' | 'PLANO';
  score: number;    // 0–peso
  max: number;      // peso máximo
  reason: string;   // texto curto explicando
};

export type ClarityIndexOutput = {
  userId: string;
  icValue: number;                // 0–100
  icLevel: ClarityIndexLevel;
  explanation: string;            // 2–3 frases humanas
  breakdown: ClarityIndexComponent[];
};

// src/lib/clarityIndex.ts (continuação)

function getLevel(icValue: number): ClarityIndexLevel {
  if (icValue < 34) return 'BAIXA';
  if (icValue < 67) return 'EM_TRANSICAO';
  return 'EM_FASE_DE_CLAREZA';
}

export function calculateClarityIndex(input: ClarityIndexInput): ClarityIndexOutput {
  const breakdown: ClarityIndexComponent[] = [];

  // 1) TESTE DE CLAREZA (até 40 pontos)
  const TEST_WEIGHT = 40;
  let testScore = 0;
  let testReason = 'Nenhum teste respondido ainda.';

  if (input.lastTest) {
    // Assumindo cada eixo 0–36 (ajuste se for diferente)
    const maxAxis = 36;
    const fogNorm = input.lastTest.fogScore / maxAxis;        // 0 = bom, 1 = ruim
    const fearNorm = input.lastTest.fearScore / maxAxis;      // 0 = bom, 1 = ruim
    const limitsNorm = input.lastTest.limitsScore / maxAxis;  // 0 = ruim, 1 = bom

    // Confusão média
    const confusionNorm = (fogNorm + fearNorm + (1 - limitsNorm)) / 3;
    const clarityFromTest = (1 - confusionNorm); // 0–1

    testScore = Math.max(0, Math.min(TEST_WEIGHT, clarityFromTest * TEST_WEIGHT));

    if (clarityFromTest < 0.33) {
      testReason = 'O teste mostra muita confusão e dificuldade de enxergar padrões ainda.';
    } else if (clarityFromTest < 0.66) {
      testReason = 'O teste indica que você já percebe sinais importantes, mas ainda há muita dúvida.';
    } else {
      testReason = 'O teste sugere que você já reconhece bem os padrões e está em fase de organizar saídas.';
    }
  }

  breakdown.push({
    component: 'TESTE',
    score: Math.round(testScore),
    max: TEST_WEIGHT,
    reason: testReason,
  });

  // 2) DIÁRIO (até 30 pontos)
  const DIARY_WEIGHT = 30;
  let diaryScore = 0;
  let diaryReason = 'Diário ainda não foi usado nos últimos 30 dias.';

  const e = input.journalStats.last30dEntries;
  const d = input.journalStats.daysWithEntriesLast30d;

  // Normaliza: 0 entradas = 0, 10+ entradas e 7+ dias registrados → 1
  const entriesNorm = Math.min(1, e / 10);
  const daysNorm = Math.min(1, d / 7);
  const diaryEngagement = (entriesNorm + daysNorm) / 2; // 0–1

  diaryScore = diaryEngagement * DIARY_WEIGHT;

  if (diaryEngagement === 0) {
    diaryReason = 'Nenhum registro recente no diário – a memória fica toda na cabeça.';
  } else if (diaryEngagement < 0.5) {
    diaryReason = 'Você começou a registrar alguns episódios, o que já é um passo importante.';
  } else {
    diaryReason = 'Você está usando bem o diário para organizar o que acontece no dia a dia.';
  }

  breakdown.push({
    component: 'DIARIO',
    score: Math.round(diaryScore),
    max: DIARY_WEIGHT,
    reason: diaryReason,
  });

  // 3) CHAT IA (até 20 pontos)
  const CHAT_WEIGHT = 20;
  let chatScore = 0;
  let chatReason = 'Você ainda não conversou com o Coach de Clareza.';

  const totalMessages = input.chatStats.totalMessages;
  const last30dSessions = input.chatStats.last30dSessions;

  const msgNorm = Math.min(1, totalMessages / 30);     // 30 mensagens+ → 1
  const sessNorm = Math.min(1, last30dSessions / 5);   // 5 sessões+ → 1
  const chatEngagement = (msgNorm + sessNorm) / 2;

  chatScore = chatEngagement * CHAT_WEIGHT;

  if (chatEngagement === 0) {
    chatReason = 'Você ainda não usou o Coach de Clareza – pode ser um espaço seguro para organizar ideias.';
  } else if (chatEngagement < 0.5) {
    chatReason = 'Você já começou a testar o Coach de Clareza – quanto mais conversa, mais clareza tende a vir.';
  } else {
    chatReason = 'Você está usando bem o Coach de Clareza como apoio para pensar as situações.';
  }

  breakdown.push({
    component: 'CHAT',
    score: Math.round(chatScore),
    max: CHAT_WEIGHT,
    reason: chatReason,
  });

  // 4) PLANOS (até 10 pontos)
  const PLAN_WEIGHT = 10;
  let planScore = 0;
  let planReason = 'Ainda não foi registrado um plano de segurança ou plano de apoio profissional.';

  const flags = [
    input.planStats.hasSafetyPlan ? 1 : 0,
    input.planStats.hasTherapyPlan ? 1 : 0,
  ];
  const planNorm = flags.reduce((a, b) => a + b, 0) / flags.length; // 0, 0.5 ou 1
  planScore = planNorm * PLAN_WEIGHT;

  if (planNorm === 0) {
    planReason = 'Ainda não foi definido um plano de segurança ou apoio – isso pode ser o próximo passo.';
  } else if (planNorm < 1) {
    planReason = 'Você já começou a desenhar um plano (segurança ou apoio profissional).';
  } else {
    planReason = 'Você já tem plano de segurança e apoio profissional registrados – isso é um grande passo de clareza.';
  }

  breakdown.push({
    component: 'PLANO',
    score: Math.round(planScore),
    max: PLAN_WEIGHT,
    reason: planReason,
  });

  // 5) Soma final
  const icValueRaw =
    testScore + diaryScore + chatScore + planScore;

  const icValue = Math.round(Math.max(0, Math.min(100, icValueRaw)));
  const icLevel = getLevel(icValue);

  const explanation =
    icLevel === 'BAIXA'
      ? 'Seu Índice de Clareza ainda está baixo. Isso não é culpa sua – significa que você está começando a organizar o que está acontecendo. Use o teste, o diário e o Coach de Clareza aos poucos.'
      : icLevel === 'EM_TRANSICAO'
      ? 'Seu Índice de Clareza mostra que você já enxerga vários padrões, mas ainda está em fase de organizar tudo. Continuar registrando e conversando tende a aumentar essa clareza.'
      : 'Seu Índice de Clareza está em uma faixa alta. Você já reconhece bem os padrões e está usando as ferramentas para planejar próximos passos com mais segurança.';

  return {
    userId: input.userId,
    icValue,
    icLevel,
    explanation,
    breakdown,
  };
}

console.log('🎯 Clarity Index v2 initialized')
