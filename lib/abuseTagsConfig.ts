/**
 * Dicionário de Tags de Tipo de Abuso
 * 
 * Este arquivo contém definições detalhadas de cada tipo de comportamento abusivo
 * com explicações em linguagem leiga e exemplos concretos para ajudar o usuário
 * a identificar padrões em suas experiências.
 */

export type AbuseTagCategory = 
  | "Manipulação"
  | "Controle"
  | "Agressão Verbal/Emocional"
  | "Ciclo de Abuso"
  | "Invalidação";

export type AbuseTag = {
  id: string;
  label: string;
  categoria: AbuseTagCategory;
  explicacaoCurta: string;
  exemplo: string;
};

export const ABUSE_TAGS: AbuseTag[] = [
  // === MANIPULAÇÃO ===
  {
    id: "gaslighting",
    label: "Gaslighting",
    categoria: "Manipulação",
    explicacaoCurta: "Quando a pessoa faz você duvidar da sua própria memória, percepção ou sanidade. Você começa a achar que está 'ficando louco(a)'.",
    exemplo: "Você lembra claramente de uma conversa, mas a pessoa diz: 'Isso nunca aconteceu, você está inventando coisas'."
  },
  {
    id: "love_bombing",
    label: "Love Bombing",
    categoria: "Manipulação",
    explicacaoCurta: "Excesso de atenção, presentes e declarações de amor no início do relacionamento ou após uma briga, para conquistar ou reconquistar você.",
    exemplo: "Após uma discussão séria, a pessoa aparece com flores, presentes caros e promete que vai mudar, mas logo volta ao comportamento anterior."
  },
  {
    id: "triangulacao",
    label: "Triangulação",
    categoria: "Manipulação",
    explicacaoCurta: "Envolver uma terceira pessoa (ex, amigo, familiar) para criar ciúmes, insegurança ou competição.",
    exemplo: "A pessoa menciona frequentemente como o(a) ex era 'mais compreensivo(a)' ou como outras pessoas a admiram."
  },
  {
    id: "projecao",
    label: "Projeção",
    categoria: "Manipulação",
    explicacaoCurta: "Acusar você de fazer exatamente o que a pessoa faz. É como se ela 'jogasse' os próprios defeitos em você.",
    exemplo: "A pessoa te acusa de ser controlador(a) ou mentiroso(a), quando na verdade é ela quem age assim."
  },
  {
    id: "vitimismo",
    label: "Vitimismo",
    categoria: "Manipulação",
    explicacaoCurta: "A pessoa sempre se coloca como vítima, mesmo quando é ela quem causou o problema, fazendo você se sentir culpado(a).",
    exemplo: "Quando você tenta falar sobre algo que te machucou, a pessoa diz: 'Você sempre me ataca, eu é que sofro nessa relação'."
  },

  // === CONTROLE ===
  {
    id: "isolamento",
    label: "Isolamento Social",
    categoria: "Controle",
    explicacaoCurta: "Afastar você de amigos, família ou qualquer rede de apoio, deixando você dependente apenas da pessoa.",
    exemplo: "A pessoa critica seus amigos, cria conflitos com sua família ou fica com raiva quando você quer sair sem ela."
  },
  {
    id: "controle_financeiro",
    label: "Controle Financeiro",
    categoria: "Controle",
    explicacaoCurta: "Controlar seu dinheiro, impedir que você trabalhe ou ter que 'prestar contas' de cada gasto.",
    exemplo: "Você precisa pedir permissão para comprar algo ou a pessoa controla todo o dinheiro da casa."
  },
  {
    id: "monitoramento",
    label: "Monitoramento Excessivo",
    categoria: "Controle",
    explicacaoCurta: "Vigiar constantemente suas mensagens, ligações, redes sociais ou localização.",
    exemplo: "A pessoa exige suas senhas, verifica seu celular ou quer saber onde você está a todo momento."
  },
  {
    id: "ciumes_possessivo",
    label: "Ciúmes Possessivo",
    categoria: "Controle",
    explicacaoCurta: "Ciúmes extremo que vai além do normal, tratando você como propriedade.",
    exemplo: "A pessoa fica com raiva se você conversa com alguém do sexo oposto ou questiona suas roupas e amizades."
  },

  // === AGRESSÃO VERBAL/EMOCIONAL ===
  {
    id: "xingamentos",
    label: "Xingamentos e Ofensas",
    categoria: "Agressão Verbal/Emocional",
    explicacaoCurta: "Usar palavras para humilhar, ofender ou diminuir você.",
    exemplo: "A pessoa te chama de 'burro(a)', 'inútil', 'louco(a)' ou usa apelidos depreciativos."
  },
  {
    id: "gritos_intimidacao",
    label: "Gritos e Intimidação",
    categoria: "Agressão Verbal/Emocional",
    explicacaoCurta: "Usar o tom de voz alto, gritos ou postura física para assustar ou calar você.",
    exemplo: "A pessoa grita durante discussões, bate na mesa, joga objetos ou fica 'em cima' de você de forma ameaçadora."
  },
  {
    id: "humilhacao_publica",
    label: "Humilhação Pública",
    categoria: "Agressão Verbal/Emocional",
    explicacaoCurta: "Fazer piadas, críticas ou comentários que te diminuem na frente de outras pessoas.",
    exemplo: "A pessoa conta seus segredos, faz piadas sobre você ou te corrige de forma constrangedora em público."
  },
  {
    id: "ameacas",
    label: "Ameaças",
    categoria: "Agressão Verbal/Emocional",
    explicacaoCurta: "Usar ameaças (de terminar, de se machucar, de tirar os filhos, etc.) para controlar você.",
    exemplo: "A pessoa diz: 'Se você me deixar, eu me mato' ou 'Você nunca mais vai ver as crianças'."
  },
  {
    id: "tratamento_silencioso",
    label: "Tratamento de Silêncio",
    categoria: "Agressão Verbal/Emocional",
    explicacaoCurta: "Ignorar você completamente como forma de punição, às vezes por dias.",
    exemplo: "Após uma discussão, a pessoa para de falar com você, não responde mensagens e age como se você não existisse."
  },

  // === CICLO DE ABUSO ===
  {
    id: "lua_de_mel",
    label: "Fase de Lua de Mel",
    categoria: "Ciclo de Abuso",
    explicacaoCurta: "Período de 'paz' após um episódio ruim, onde a pessoa é carinhosa e promete mudar.",
    exemplo: "Depois de uma briga intensa, a pessoa fica super atenciosa, faz promessas e vocês vivem dias 'perfeitos'."
  },
  {
    id: "tensao_crescente",
    label: "Tensão Crescente",
    categoria: "Ciclo de Abuso",
    explicacaoCurta: "Período onde você sente que 'algo vai acontecer', anda pisando em ovos.",
    exemplo: "Você percebe que a pessoa está ficando irritada com coisas pequenas e sente que uma explosão está chegando."
  },
  {
    id: "explosao",
    label: "Explosão/Episódio Agudo",
    categoria: "Ciclo de Abuso",
    explicacaoCurta: "O momento em que a tensão 'estoura' em gritos, agressão verbal ou física.",
    exemplo: "A pessoa explode por algo pequeno, grita, xinga ou age de forma agressiva."
  },

  // === INVALIDAÇÃO ===
  {
    id: "minimizacao",
    label: "Minimização",
    categoria: "Invalidação",
    explicacaoCurta: "Dizer que você está exagerando, que 'não foi tão grave assim' ou que você é 'sensível demais'.",
    exemplo: "Você tenta falar sobre algo que te machucou e a pessoa diz: 'Você está fazendo tempestade em copo d'água'."
  },
  {
    id: "negacao",
    label: "Negação",
    categoria: "Invalidação",
    explicacaoCurta: "Negar que algo aconteceu ou que a pessoa disse/fez algo, mesmo quando você tem certeza.",
    exemplo: "A pessoa diz: 'Eu nunca disse isso' ou 'Você entendeu errado' sobre algo que você lembra claramente."
  },
  {
    id: "culpabilizacao",
    label: "Culpabilização da Vítima",
    categoria: "Invalidação",
    explicacaoCurta: "Colocar a culpa em você pelo comportamento abusivo da pessoa.",
    exemplo: "A pessoa diz: 'Se você não tivesse feito X, eu não teria reagido assim' ou 'Você me provoca'."
  },
  {
    id: "desvalorizacao",
    label: "Desvalorização",
    categoria: "Invalidação",
    explicacaoCurta: "Diminuir suas conquistas, opiniões, sentimentos ou capacidades.",
    exemplo: "A pessoa diz que seu trabalho 'não é tão importante', que sua opinião 'não conta' ou que você 'não sabe de nada'."
  }
];

// Agrupar tags por categoria para facilitar exibição
export const ABUSE_TAGS_BY_CATEGORY: Record<AbuseTagCategory, AbuseTag[]> = {
  "Manipulação": ABUSE_TAGS.filter(t => t.categoria === "Manipulação"),
  "Controle": ABUSE_TAGS.filter(t => t.categoria === "Controle"),
  "Agressão Verbal/Emocional": ABUSE_TAGS.filter(t => t.categoria === "Agressão Verbal/Emocional"),
  "Ciclo de Abuso": ABUSE_TAGS.filter(t => t.categoria === "Ciclo de Abuso"),
  "Invalidação": ABUSE_TAGS.filter(t => t.categoria === "Invalidação"),
};

// Função para obter uma tag pelo ID
export function getAbuseTagById(id: string): AbuseTag | undefined {
  return ABUSE_TAGS.find(tag => tag.id === id);
}

// Cores por categoria para UI
export const CATEGORY_COLORS: Record<AbuseTagCategory, { bg: string; text: string; border: string }> = {
  "Manipulação": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  "Controle": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  "Agressão Verbal/Emocional": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  "Ciclo de Abuso": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "Invalidação": { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
};
