// =============================================================================
// PERGUNTAS DO TESTE DE CLAREZA - 3 VOZES
// Cada pergunta tem 3 versões para diferentes estilos de comunicação
// =============================================================================

export type QuestionVoice = 'colinho' | 'profissional' | 'defesa'

export interface QuestionVoices {
  colinho: string      // 💜 Acolhedora, empática, linguagem suave
  profissional: string // 🩺 Técnica, explicativa, mais direta
  defesa: string       // ⚖️ Objetiva, para documentação
}

export interface AnswerVoices {
  colinho: string
  profissional: string
  defesa: string
}

// Configuração visual das vozes
export const QUESTION_VOICE_CONFIG = {
  colinho: {
    id: 'colinho' as QuestionVoice,
    label: 'Colinho',
    emoji: '💜',
    description: 'Linguagem acolhedora e empática',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
  },
  profissional: {
    id: 'profissional' as QuestionVoice,
    label: 'Profissional',
    emoji: '🩺',
    description: 'Linguagem técnica e explicativa',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
  },
  defesa: {
    id: 'defesa' as QuestionVoice,
    label: 'Defesa',
    emoji: '⚖️',
    description: 'Linguagem objetiva para documentação',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/50',
  },
}

// =============================================================================
// PERGUNTAS COM 3 VOZES
// =============================================================================

export const QUESTIONS_3_VOICES: Record<string, QuestionVoices> = {
  // =========================================================================
  // INVALIDAÇÃO (3 perguntas)
  // =========================================================================
  inv_1: {
    colinho: 'Você sente que suas emoções são frequentemente minimizadas ou ignoradas?',
    profissional: 'Com que frequência você percebe que suas reações emocionais são desconsideradas ou tratadas como irrelevantes pelo parceiro?',
    defesa: 'A outra parte costuma desconsiderar ou minimizar suas manifestações emocionais?',
  },
  inv_2: {
    colinho: 'Quando você expressa desconforto, a outra pessoa diz que você está exagerando?',
    profissional: 'Ao comunicar incômodo ou desconforto, você recebe como resposta que está sendo exagerada(o) ou dramática(o)?',
    defesa: 'Ao expressar desconforto, você é acusada(o) de exagero pela outra parte?',
  },
  inv_3: {
    colinho: 'Você se sente "louca(o)" ou "sensível demais" com frequência?',
    profissional: 'Você experimenta sentimentos recorrentes de inadequação emocional, como se suas reações fossem desproporcionais?',
    defesa: 'Você é levada(o) a acreditar que suas reações emocionais são excessivas ou inapropriadas?',
  },

  // =========================================================================
  // GASLIGHTING (3 perguntas)
  // =========================================================================
  gas_1: {
    colinho: 'Você já duvidou da sua própria memória sobre eventos que aconteceram?',
    profissional: 'Você experimenta episódios de dúvida sobre a veracidade de suas próprias lembranças de eventos ocorridos?',
    defesa: 'Você passou a questionar a precisão de sua memória sobre fatos ocorridos na relação?',
  },
  gas_2: {
    colinho: 'A pessoa nega ter dito ou feito coisas que você claramente lembra?',
    profissional: 'O parceiro nega sistematicamente ter realizado ações ou feito declarações que você tem certeza de ter presenciado?',
    defesa: 'A outra parte nega fatos ou declarações que você tem convicção de terem ocorrido?',
  },
  gas_3: {
    colinho: 'Você se pega pedindo desculpas por coisas que não fez?',
    profissional: 'Você se encontra frequentemente pedindo desculpas por situações nas quais não teve responsabilidade objetiva?',
    defesa: 'Você costuma assumir culpa por situações nas quais não teve participação ou responsabilidade?',
  },

  // =========================================================================
  // CONTROLE (3 perguntas)
  // =========================================================================
  con_1: {
    colinho: 'A pessoa quer saber onde você está e com quem o tempo todo?',
    profissional: 'O parceiro demonstra necessidade constante de monitorar sua localização e seus contatos sociais?',
    defesa: 'A outra parte exige informações constantes sobre sua localização e companhias?',
  },
  con_2: {
    colinho: 'Você precisa pedir permissão para fazer coisas básicas?',
    profissional: 'Você sente necessidade de obter aprovação do parceiro para realizar atividades cotidianas e decisões pessoais?',
    defesa: 'Você precisa de autorização da outra parte para realizar atividades rotineiras?',
  },
  con_3: {
    colinho: 'A pessoa controla o dinheiro ou suas decisões financeiras?',
    profissional: 'O parceiro exerce controle sobre seus recursos financeiros ou limita sua autonomia em decisões econômicas?',
    defesa: 'A outra parte controla ou restringe seu acesso a recursos financeiros?',
  },

  // =========================================================================
  // ISOLAMENTO (3 perguntas)
  // =========================================================================
  iso_1: {
    colinho: 'Você foi se afastando de amigos ou família por causa dessa relação?',
    profissional: 'Você observa uma redução progressiva do seu círculo social desde o início deste relacionamento?',
    defesa: 'Houve diminuição do seu contato com amigos e familiares após o início desta relação?',
  },
  iso_2: {
    colinho: 'A pessoa faz você se sentir culpada por passar tempo com outras pessoas?',
    profissional: 'O parceiro induz sentimentos de culpa quando você dedica tempo a relacionamentos fora do casal?',
    defesa: 'A outra parte manifesta desaprovação ou gera culpa quando você convive com terceiros?',
  },
  iso_3: {
    colinho: 'Você sente que perdeu sua rede de apoio?',
    profissional: 'Você percebe uma deterioração significativa da sua rede de suporte social e emocional?',
    defesa: 'Sua rede de apoio social foi reduzida ou comprometida durante esta relação?',
  },

  // =========================================================================
  // ABUSO EMOCIONAL (3 perguntas)
  // =========================================================================
  emo_1: {
    colinho: 'Você sente que precisa "pisar em ovos" perto dessa pessoa?',
    profissional: 'Você experimenta estado de hipervigilância constante em relação às reações emocionais do parceiro?',
    defesa: 'Você modifica seu comportamento para evitar reações negativas da outra parte?',
  },
  emo_2: {
    colinho: 'A pessoa usa o silêncio ou a frieza como forma de punição?',
    profissional: 'O parceiro utiliza tratamento silencioso ou distanciamento emocional como mecanismo de controle comportamental?',
    defesa: 'A outra parte emprega silêncio ou frieza como forma de punição ou controle?',
  },
  emo_3: {
    colinho: 'Você tem medo de como a pessoa vai reagir às coisas?',
    profissional: 'Você experimenta ansiedade antecipatória significativa em relação às possíveis reações do parceiro?',
    defesa: 'Você sente receio das reações da outra parte diante de situações cotidianas?',
  },

  // =========================================================================
  // RISCO FÍSICO (3 perguntas)
  // =========================================================================
  fis_1: {
    colinho: 'A pessoa já quebrou objetos ou socou paredes durante discussões?',
    profissional: 'O parceiro já manifestou comportamento destrutivo contra objetos ou propriedade durante conflitos?',
    defesa: 'A outra parte já danificou objetos ou propriedade durante desentendimentos?',
  },
  fis_2: {
    colinho: 'Você já sentiu medo físico dessa pessoa?',
    profissional: 'Você já experimentou medo de agressão física por parte do parceiro?',
    defesa: 'Você já temeu por sua integridade física em decorrência de ações da outra parte?',
  },
  fis_3: {
    colinho: 'A pessoa já te empurrou, segurou com força ou te machucou?',
    profissional: 'O parceiro já exerceu força física contra você, incluindo empurrões, contenção forçada ou agressão?',
    defesa: 'A outra parte já praticou atos de violência física contra você, como empurrões, contenção ou agressão?',
  },
}

// =============================================================================
// RESPOSTAS COM 3 VOZES
// =============================================================================

export const ANSWERS_3_VOICES: Record<number, AnswerVoices> = {
  0: {
    colinho: 'Nunca — Isso não acontece comigo',
    profissional: 'Nunca — Ausência do comportamento descrito',
    defesa: 'Nunca — Não há ocorrência registrada',
  },
  1: {
    colinho: 'Raramente — Aconteceu uma ou duas vezes',
    profissional: 'Raramente — Ocorrência isolada (1-2 episódios)',
    defesa: 'Raramente — Episódios pontuais documentados',
  },
  2: {
    colinho: 'Às vezes — Acontece de vez em quando',
    profissional: 'Às vezes — Ocorrência ocasional, sem padrão definido',
    defesa: 'Às vezes — Ocorrências esporádicas observadas',
  },
  3: {
    colinho: 'Frequentemente — Acontece com regularidade',
    profissional: 'Frequentemente — Padrão recorrente identificável',
    defesa: 'Frequentemente — Padrão de comportamento estabelecido',
  },
  4: {
    colinho: 'Quase sempre — É constante na minha vida',
    profissional: 'Quase sempre — Comportamento sistemático e persistente',
    defesa: 'Quase sempre — Conduta habitual e contínua',
  },
}

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

/**
 * Obtém o texto da pergunta na voz especificada
 */
export function getQuestionText(questionId: string, voice: QuestionVoice): string {
  const voices = QUESTIONS_3_VOICES[questionId]
  if (!voices) {
    // Fallback para pergunta original se não tiver 3 vozes
    return questionId
  }
  return voices[voice]
}

/**
 * Obtém o texto da resposta na voz especificada
 */
export function getAnswerText(value: number, voice: QuestionVoice): { label: string; description: string } {
  const voices = ANSWERS_3_VOICES[value]
  if (!voices) {
    return { label: String(value), description: '' }
  }
  
  const fullText = voices[voice]
  const [label, description] = fullText.split(' — ')
  return { label, description: description || '' }
}

/**
 * Verifica se uma pergunta tem as 3 vozes disponíveis
 */
export function hasThreeVoices(questionId: string): boolean {
  return questionId in QUESTIONS_3_VOICES
}
