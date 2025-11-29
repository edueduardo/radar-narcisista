import { ClarityTestConfig } from '../types/database'

// Novos tipos para suporte a múltiplas versões e randomização
export type ClarityQuestion = {
  id: string;
  text: string;
  axis: "nevoa" | "medo" | "limites";
  inverted?: boolean;
};

export type ClarityTestDefinition = {
  id: string;
  version: number;
  name: string;
  description: string;
  questions: ClarityQuestion[];
  randomizeQuestions?: boolean;
};

// Mantém compatibilidade com tipo existente
export const CLARITY_TEST_V1: ClarityTestDefinition = {
  id: "clarity_test_v1",
  version: 1,
  name: "Teste de Clareza em Relações Abusivas",
  description:
    "Este teste NÃO é diagnóstico clínico. Ele ajuda você a enxergar padrões de confusão mental, medo e desrespeito a limites em uma relação importante da sua vida.",
  randomizeQuestions: true, // ATIVAR randomização já no V1
  questions: [
    // Névoa mental (q1–q4)
    {
      id: "q1",
      axis: "nevoa",
      text:
        "Você costuma sair de discussões se sentindo confuso(a), sem saber mais o que é verdade ou se você exagerou?",
      inverted: false
    },
    {
      id: "q2",
      axis: "nevoa",
      text:
        "Quando você tenta falar de algo que te machucou, a outra pessoa faz você se sentir 'louco(a)', 'dramático(a)' ou exagerado(a)?",
      inverted: false
    },
    {
      id: "q3",
      axis: "nevoa",
      text:
        "Você já pediu desculpas mesmo achando, no fundo, que não tinha feito nada de errado, só para acabar a briga?",
      inverted: false
    },
    {
      id: "q4",
      axis: "nevoa",
      text:
        "Você sente dificuldade de confiar na sua própria memória dos fatos, porque a outra pessoa sempre 'corrige' a história?",
      inverted: false
    },

    // Medo / tensão (q5–q8)
    {
      id: "q5",
      axis: "medo",
      text:
        "Você sente medo da reação da outra pessoa quando precisa falar de um assunto delicado (dinheiro, família, ex, redes sociais, trabalho)?",
      inverted: false
    },
    {
      id: "q6",
      axis: "medo",
      text:
        "Você sente que vive 'pisando em ovos', escolhendo cada palavra para não gerar uma explosão ou punição?",
      inverted: false
    },
    {
      id: "q7",
      axis: "medo",
      text:
        "Já aconteceu de você esconder coisas neutras (encontros com amigos, compras simples, mensagens normais) só para evitar problema?",
      inverted: false
    },
    {
      id: "q8",
      axis: "medo",
      text:
        "Você sente tensão física frequente (dor no estômago, aperto no peito, insônia) ligada a essa relação?",
      inverted: false
    },

    // Limites / desrespeito (q9–q12)
    {
      id: "q9",
      axis: "limites",
      text:
        "Quando você coloca um limite ('isso me incomoda', 'não quero isso'), a outra pessoa costuma respeitar?",
      inverted: true // Essa pergunta é invertida
    },
    {
      id: "q10",
      axis: "limites",
      text:
        "Você se sente frequentemente diminuído(a), ridicularizado(a) ou tratado(a) como inferior nas conversas?",
      inverted: false
    },
    {
      id: "q11",
      axis: "limites",
      text:
        "A outra pessoa desconsidera ou ridiculariza conquistas suas (trabalho, estudos, cuidado com a casa, aparência)?",
      inverted: false
    },
    {
      id: "q12",
      axis: "limites",
      text:
        "Você sente que a relação funciona só quando você cede, engole e se adapta, e que suas necessidades quase nunca são prioridade?",
      inverted: false
    }
]
};

// Estrutura para futuras versões (placeholder)
export const CLARITY_TESTS: Record<string, ClarityTestDefinition> = {
  clarity_test_v1: CLARITY_TEST_V1,
  // Lugar reservado para clarity_test_v2 no futuro
};

// Mantém compatibilidade com legado - converte para formato antigo
export function getLegacyClarityTestConfig(testId: string = "clarity_test_v1"): ClarityTestConfig {
  const test = CLARITY_TESTS[testId];
  if (!test) throw new Error(`Test ${testId} not found`);

  return {
    id: test.id,
    version: test.version,
    title: test.name,
    description: test.description,
    scale: {
      id: "frequency_0_4",
      label: "Frequência",
      options: [
        { value: 0, label: "Nunca" },
        { value: 1, label: "Raramente" },
        { value: 2, label: "Às vezes" },
        { value: 3, label: "Frequentemente" },
        { value: 4, label: "Quase sempre" }
      ]
    },
    axes: [
      {
        id: "nevoa",
        label: "Névoa mental (gaslighting/confusão)",
        minScore: 0,
        maxScore: 16
      },
      {
        id: "medo",
        label: "Medo e tensão constante",
        minScore: 0,
        maxScore: 16
      },
      {
        id: "limites",
        label: "Desrespeito a limites e desvalorização",
        minScore: 0,
        maxScore: 16
      }
    ],
    questions: test.questions.map(q => ({
      id: q.id,
      axisId: q.axis,
      text: q.text,
      reverse: q.inverted || false
    })),
    scoring: {
      axisLevels: [
        {
          axisId: "nevoa",
          levels: [
            {
              id: "baixo",
              min: 0,
              max: 5,
              title: "Névoa emocional baixa",
              body:
                "Pelos seus relatos, você ainda consegue confiar razoavelmente na sua própria percepção. Mesmo que existam conflitos, você não parece sair das conversas totalmente confuso(a) ou duvidando de si o tempo todo. Ainda assim, vale usar o Diário para registrar qualquer episódio que te deixe em dúvida, para não deixar nada acumular sem nome."
            },
            {
              id: "moderado",
              min: 6,
              max: 10,
              title: "Névoa emocional moderada",
              body:
                "Você descreve um nível relevante de confusão mental nas interações. Em várias situações, você sai da conversa se sentindo culpado(a) ou sem saber mais o que é verdade. Isso é um sinal importante de que sua percepção pode estar sendo constantemente questionada ou distorcida. Não é 'frescura' e não é só 'drama'. Registrar episódios no Diário e revisá-los depois com calma pode te ajudar a recuperar a confiança em você mesmo(a)."
            },
            {
              id: "alto",
              min: 11,
              max: 16,
              title: "Névoa emocional alta",
              body:
                "Seu nível de névoa mental está muito alto. Você relata confusão frequente, inversão de culpa e dificuldade séria de confiar na própria memória. Isso é muito comum em relações com forte componente de gaslighting e abuso emocional. Você merece recuperar a clareza. A combinação Diário + Coach IA + plano de 7 dias pode te ajudar a organizar o que está acontecendo e sair dessa névoa, passo a passo. E conversar com um(a) psicólogo(a) de confiança é altamente recomendado."
            }
          ]
        },
        {
          axisId: "medo",
          levels: [
            {
              id: "baixo",
              min: 0,
              max: 5,
              title: "Medo e tensão baixos",
              body:
                "Você não parece viver em estado de alerta constante. Embora existam conflitos, você não sente medo intenso das reações da outra pessoa e consegue se expressar com relativa liberdade. Mesmo assim, continue atento(a) a qualquer mudança nesse padrão."
            },
            {
              id: "moderado",
              min: 6,
              max: 10,
              title: "Medo e tensão moderados",
              body:
                "Você já sente um nível significativo de medo e tensão na relação. Evitar certos assuntos, esconder coisas ou sentir-se 'pisando em ovos' são sinais de que a segurança emocional está comprometida. Essa tensão constante desgasta muito e pode afetar sua saúde física e mental."
            },
            {
              id: "alto",
              min: 11,
              max: 16,
              title: "Medo e tensão altos",
              body:
                "Seu nível de medo está muito elevado. Viver com medo constante de reações, esconder comportamentos normais e sentir tensão física são indicadores sérios de que você está em um ambiente inseguro. Sua segurança é prioridade. Considere buscar ajuda e planejar formas de se proteger."
            }
          ]
        },
        {
          axisId: "limites",
          levels: [
            {
              id: "baixo",
              min: 0,
              max: 5,
              title: "Respeito aos limites presente",
              body:
                "De modo geral, seus limites parecem ser respeitados na relação. Embora existam conflitos, a outra pessoa costuma aceitar quando você diz 'não' ou estabelece fronteiras. Isso é um bom sinal para a saúde da relação."
            },
            {
              id: "moderado",
              min: 6,
              max: 10,
              title: "Desrespeito aos limites moderado",
              body:
                "Você enfrenta situações frequentes de desrespeito aos seus limites. Ser ridicularizado(a), ter conquistas minimizadas ou sentir que só 'cede' são sinais de que suas necessidades não estão sendo valorizadas. Limites saudáveis são essenciais para qualquer relação equilibrada."
            },
            {
              id: "alto",
              min: 11,
              max: 16,
              title: "Desrespeito aos limites alto",
              body:
                "Há um padrão claro e consistente de desrespeito aos seus limites. Ser constantemente diminuído(a), ter suas necessidades ignoradas e sentir que só pode 'funcionar' se abdicar de si mesmo(a) são indicadores fortes de uma relação desequilibrada e prejudicial. Você merece ter seus limites respeitados."
            }
          ]
        }
      ],
      globalLevels: [
        {
          id: "atencao",
          min: 0,
          max: 15,
          title: "Zona de Atenção",
          body:
            "Você relata conflitos e incômodos, mas ainda não há sinais fortes de padrão abusivo persistente em todos os eixos. Mesmo assim, vale ficar atento(a) e usar o Diário para acompanhar qualquer mudança. Relações saudáveis também têm desafios, mas não deveriam deixar você constantemente confuso(a) ou com medo."
        },
        {
          id: "alerta",
          min: 16,
          max: 31,
          title: "Zona de Alerta",
          body:
            "Há sinais consistentes de sofrimento emocional e padrões que merecem atenção. Talvez você já sinta que 'não é normal', que dói mais do que deveria. Usar o Diário, o plano de 7 dias e, se possível, apoio profissional, pode evitar que isso evolua para algo ainda mais pesado. Sua percepção está correta: algo não está bem."
        },
        {
          id: "vermelha",
          min: 32,
          max: 48,
          title: "Zona Vermelha de Alto Risco Emocional",
          body:
            "Seu resultado mostra alto nível de confusão, medo e/ou desrespeito a limites. Isso é compatível com relações emocionalmente abusivas. Não é frescura, não é exagero. É sério. Você não precisa decidir nada hoje, mas merece se proteger e ter apoio. Use este resultado como ponto de partida para: • Registrar episódios com detalhes • Refletir sobre um plano de segurança • Buscar ajuda profissional (terapia, serviços de apoio, advogados, dependendo do caso)"
        }
      ]
    }
  };
}

// Função para embaralhar perguntas (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Função para obter perguntas embaralhadas se necessário
export function getTestQuestions(testId: string = "clarity_test_v1"): ClarityQuestion[] {
  const test = CLARITY_TESTS[testId];
  if (!test) throw new Error(`Test ${testId} not found`);
  
  if (test.randomizeQuestions) {
    return shuffleArray(test.questions);
  }
  
  return test.questions;
}

// Função para calcular resultado do teste (atualizada para novo formato)
export function calculateClarityTestResult(responses: Record<string, number>, testId: string = "clarity_test_v1") {
  const test = CLARITY_TESTS[testId];
  if (!test) throw new Error(`Test ${testId} not found`);
  
  const scores = {
    nevoa: 0,
    medo: 0,
    limites: 0
  }

  // Calcular scores por eixo (baseado no ID da pergunta, não na ordem)
  test.questions.forEach((question) => {
    const value = responses[question.id] || 0
    let adjustedValue = value

    // Pergunta invertida
    if (question.inverted) {
      adjustedValue = 4 - value
    }

    scores[question.axis] += adjustedValue
  })

  // Determinar zonas por eixo
  const zones = {
    nevoa: getZoneLevel(scores.nevoa),
    medo: getZoneLevel(scores.medo),
    limites: getZoneLevel(scores.limites)
  }

  // Calcular score total e zona global
  const totalScore = scores.nevoa + scores.medo + scores.limites
  const globalZone = getGlobalZone(totalScore)

  return {
    scores,
    zones,
    globalZone,
    totalScore
  }
}

function getZoneLevel(score: number): 'baixo' | 'moderado' | 'alto' {
  if (score <= 5) return "baixo"
  if (score <= 10) return "moderado"
  return "alto"
}

function getGlobalZone(score: number): 'atencao' | 'alerta' | 'vermelha' {
  if (score <= 15) return "atencao"
  if (score <= 31) return "alerta"
  return "vermelha"
}
