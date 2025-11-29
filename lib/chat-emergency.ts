// MODO EMERGÊNCIA DO CHAT - Funciona sem APIs externas
// Para quando todas as IAs falharem ou chaves estiverem corrompidas

interface RespostaLocal {
  texto: string
  categoria: 'apoio' | 'orientacao' | 'emergencia' | 'seguranca'
  tags: string[]
}

// 📋 BANCO DE RESPOSTAS LOCAIS (Coach de Clareza offline)
export const RESPOSTAS_EMERGENCIA: Record<string, RespostaLocal[]> = {
  // PALAVRAS-CHAVE DE APOIO
  'ajuda': [
    {
      texto: "Entendo que você precisa de ajuda. Estou aqui para te apoiar. Enquanto nosso sistema principal está em manutenção, posso te oferecer algumas orientações básicas. Você gostaria de conversar sobre o que está acontecendo?",
      categoria: 'apoio',
      tags: ['suporte', 'acolhimento', 'escuta']
    },
    {
      texto: "Estou aqui para te ouvir. Pode me contar o que está acontecendo. Vamos trabalhar juntos nisso, mesmo com nossos sistemas limitados no momento.",
      categoria: 'apoio',
      tags: ['escuta', 'empatia', 'presença']
    }
  ],
  
  'triste': [
    {
      texto: "Sinto muito que você esteja se sentindo triste. É válido sentir isso. Que tal tentar respirar fundo por alguns instantes? Lembre-se: seus sentimentos são importantes e você não está sozinho(a) nisso.",
      categoria: 'apoio',
      tags: ['tristeza', 'validacao', 'respiracao']
    }
  ],
  
  'raiva': [
    {
      texto: "Compreendo sua raiva. É uma emoção natural quando sentimos que algo está errado. Antes de tomar qualquer decisão, que tal contar o que aconteceu? Às vezes só colocar para fora já ajuda.",
      categoria: 'apoio',
      tags: ['raiva', 'validacao', 'expressao']
    }
  ],
  
  'medo': [
    {
      texto: "É normal sentir medo em situações difíceis. Sua segurança é prioridade. Você está em um lugar seguro agora? Se não estiver, por favor, procure ajuda imediatamente.",
      categoria: 'emergencia',
      tags: ['medo', 'seguranca', 'protecao']
    }
  ],
  
  // SITUAÇÕES ESPECÍFICAS
  'narcisista': [
    {
      texto: "Entendo. Relacionamentos com pessoas com traços narcisistas podem ser muito desgastantes. Alguns sinais importantes: manipulação emocional, falta de empatia, necessidade de controle. Você está seguro(a) agora para conversar sobre isso?",
      categoria: 'orientacao',
      tags: ['narcisismo', 'sinais', 'seguranca']
    }
  ],
  
  'gaslighting': [
    {
      texto: "Gaslighting é uma forma séria de manipulação emocional. Se alguém está fazendo você duvidar da sua própria percepção, isso é muito preocupante. Anote datas, horários e o que foi dito - isso ajuda a manter sua clareza mental.",
      categoria: 'orientacao',
      tags: ['gaslighting', 'manipulacao', 'documentacao']
    }
  ],
  
  'controle': [
    {
      texto: "Controle excessivo em um relacionamento não é saudável. Você tem direito à sua autonomia. Se alguém está controlando suas ações, contatos ou decisões, isso é um sinal de alerta importante.",
      categoria: 'orientacao',
      tags: ['controle', 'autonomia', 'alerta']
    }
  ],
  
  // CRISES E EMERGÊNCIAS
  'emergencia': [
    {
      texto: "🚨 SE VOCÊ ESTIVER EM PERIGO IMEDIATO, LIGUE PARA 190 (Polícia) ou 180 (Central de Atendimento à Mulher). Sua segurança é a prioridade número um. Não hesite em pedir ajuda.",
      categoria: 'emergencia',
      tags: ['emergencia', 'perigo', '190', '180']
    }
  ],
  
  'suicidio': [
    {
      texto: "🚨 SE VOCÊ ESTIVER PENSANDO EM SUICÍDIO, LIGUE IMEDIATAMENTE PARA 188 (CVV - Centro de Valorização da Vida). Eles estão disponíveis 24/7 gratuitamente. Sua vida tem valor e há ajuda disponível.",
      categoria: 'emergencia',
      tags: ['suicidio', 'cvv', '188', 'vida']
    }
  ],
  
  // ORIENTAÇÕES PRÁTICAS
  'diario': [
    {
      texto: "Manter um diário é uma ferramenta poderosa. Anote: o que aconteceu, como você se sentiu, o que foi dito, data, horário, testemunhas. Isso ajuda a identificar padrões e pode ser útil no futuro.",
      categoria: 'orientacao',
      tags: ['diario', 'documentacao', 'padroes']
    }
  ],
  
  'terapia': [
    {
      texto: "Terapia é um espaço seguro para explorar seus sentimentos. Um bom psicólogo pode te ajudar a desenvolver estratégias para lidar com situações difíceis. Não há vergonha nenhuma em procurar ajuda profissional.",
      categoria: 'orientacao',
      tags: ['terapia', 'ajuda profissional', 'psicologo']
    }
  ]
}

// 🤖 FUNÇÃO PRINCIPAL DO MODO EMERGÊNCIA
export function chatEmergencyMode(mensagem: string): {
  resposta: string
  categoria: string
  tags: string[]
  isEmergency: boolean
  needsHumanHelp: boolean
} {
  const mensagemLower = mensagem.toLowerCase()
  
  // 🚨 DETECTAR EMERGÊNCIAS PRIMEIRO
  const palavrasEmergencia = ['emergencia', 'perigo', 'socorro', '190', 'polícia', 'suicídio', 'matar', 'morre']
  if (palavrasEmergencia.some(palavra => mensagemLower.includes(palavra))) {
    const respostaEmergencia = RESPOSTAS_EMERGENCIA['emergencia'][0]
    if (mensagemLower.includes('suicidio') || mensagemLower.includes('matar') || mensagemLower.includes('morre')) {
      return {
        resposta: RESPOSTAS_EMERGENCIA['suicidio'][0].texto,
        categoria: 'emergencia',
        tags: ['emergencia', 'cvv', 'vida'],
        isEmergency: true,
        needsHumanHelp: true
      }
    }
    return {
      resposta: respostaEmergencia.texto,
      categoria: respostaEmergencia.categoria,
      tags: respostaEmergencia.tags,
      isEmergency: true,
      needsHumanHelp: true
    }
  }
  
  // 🔍 PROCURAR RESPOSTA ESPECÍFICA
  for (const [chave, respostas] of Object.entries(RESPOSTAS_EMERGENCIA)) {
    if (mensagemLower.includes(chave)) {
      const resposta = respostas[0] // Pega a primeira resposta da categoria
      return {
        resposta: resposta.texto,
        categoria: resposta.categoria,
        tags: resposta.tags,
        isEmergency: resposta.categoria === 'emergencia',
        needsHumanHelp: false
      }
    }
  }
  
  // 🎯 RESPOSTA GENÉRICA SE NÃO ENCONTRAR ESPECÍFICA
  return {
    resposta: "Estou aqui para te ouvir. Pode me contar mais sobre o que está acontecendo. Estou operando em modo básico no momento, mas ainda posso te oferecer apoio e orientações gerais. Sinto pela limitação técnica atual.",
    categoria: 'apoio',
    tags: ['apoio', 'modo-basico', 'limitacao'],
    isEmergency: false,
    needsHumanHelp: false
  }
}

// 📊 STATUS DO MODO EMERGÊNCIA
export function statusEmergencyMode(): {
  ativo: boolean
    motivo: string
    respostas_disponiveis: number
    categorias: string[]
} {
  const totalRespostas = Object.values(RESPOSTAS_EMERGENCIA).reduce((sum, respostas) => sum + respostas.length, 0)
  const categorias = Object.keys(RESPOSTAS_EMERGENCIA)
  
  return {
    ativo: true,
    motivo: 'Sistema operando em modo emergência devido à falha nas APIs externas',
    respostas_disponiveis: totalRespostas,
    categorias
  }
}

// 🔄 ATIVAR MODO EMERGÊNCIA AUTOMATICAMENTE
export function ativarModoEmergencia(): void {
  console.log('🚨 MODO EMERGÊNCIA ATIVADO')
  console.log('📋 Respostas disponíveis:', statusEmergencyMode())
  console.log('🎯 Chat funcionando em modo offline')
}
