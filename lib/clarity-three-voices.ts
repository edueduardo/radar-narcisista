// =============================================================================
// SISTEMA DE 3 VOZES - TEMPLATES DE TEXTO
// Colinho: Acolhedor, empático, fala como amiga próxima
// Profissional: Técnico mas acessível, como psicólogo explicando
// Defesa: Objetivo, factual, como advogado documentando
// =============================================================================

export type VoiceType = 'colinho' | 'profissional' | 'defesa'

export interface VoiceContent {
  colinho: string
  profissional: string
  defesa: string
  micro_acao: string
}

export interface TopicVoices {
  id: string
  label: string
  voices: VoiceContent
}

// Função para substituir placeholders nos textos
export function interpolateText(
  text: string, 
  context: {
    score?: number
    zona?: string
    episodios30d?: number
    impactoMedio?: number
    padroesPrincipais?: string[]
    percentage?: number
  }
): string {
  return text
    .replace(/\{\{score\}\}/g, String(context.score ?? 0))
    .replace(/\{\{zona\}\}/g, context.zona ?? 'atenção')
    .replace(/\{\{episodios30d\}\}/g, String(context.episodios30d ?? 0))
    .replace(/\{\{impactoMedio\}\}/g, String(context.impactoMedio ?? 0))
    .replace(/\{\{padroesPrincipais\}\}/g, (context.padroesPrincipais ?? []).join(', '))
    .replace(/\{\{percentage\}\}/g, String(context.percentage ?? 0))
}

// =============================================================================
// TEMPLATES DAS 3 VOZES POR TÓPICO
// =============================================================================

export const THREE_VOICES_CONTENT: Record<string, TopicVoices> = {
  // -------------------------------------------------------------------------
  // SITUAÇÃO GERAL
  // -------------------------------------------------------------------------
  geral: {
    id: 'geral',
    label: 'Sua Situação Geral',
    voices: {
      colinho: `Pelos seus números e registros, parece que você está carregando MUITO mais peso emocional do que seria justo. Essa "zona {{zona}}" não quer dizer que você é fraca ou dramática. Pelo contrário: mostra que você vem aguentando situações difíceis há bastante tempo.

A ideia aqui não é te assustar, é te dar nome para aquilo que você sente todos os dias. A partir de agora, você não precisa mais passar por isso sozinha. Vamos usar esse mapa para organizar o que está acontecendo e pensar em passos pequenos, mas reais, para cuidar de você.`,

      profissional: `O conjunto das respostas indica um nível {{zona}} de sofrimento relacional, com alta incidência de invalidação, gaslighting e tensão constante no convívio. Isso se alinha ao que muitos profissionais descrevem como contexto de possível abuso emocional, ainda que o teste NÃO seja um diagnóstico.

Os dados sugerem uma sobrecarga emocional relevante, com impacto em autoestima, clareza e sensação de segurança. Esse resultado pode servir como ponto de partida para uma avaliação clínica ou para um acompanhamento psicoterapêutico focado em violência psicológica e relações abusivas.`,

      defesa: `No período avaliado, as respostas do teste apontam para a presença repetida de comportamentos percebidos como desrespeitosos, confusos e intimidadores.

Em termos simples: a pessoa usuária relata que, com frequência, sai de interações importantes mais confusa, com medo de falar e com a sensação de que seus limites não são levados a sério. Este resultado organiza essas percepções em forma de pontuação e categorias, servindo como um resumo do que vem sendo vivido, sem atribuir culpa jurídica ou emitir qualquer laudo técnico.`,

      micro_acao: `Próximo passo de 5 minutos: escolher UM dia recente que tenha sido especialmente pesado, e anotar em 3 linhas: o que aconteceu, o que a outra pessoa fez/disse, e como você foi dormir se sentindo. Não precisa mostrar isso para ninguém por enquanto. É só o primeiro pedaço do seu mapa.`
    }
  },

  // -------------------------------------------------------------------------
  // NÉVOA MENTAL
  // -------------------------------------------------------------------------
  nevoa_mental: {
    id: 'nevoa_mental',
    label: 'Névoa Mental',
    voices: {
      colinho: `Essa pontuação em Névoa Mental mostra que você está vivendo muito aquela sensação de "eu não sei mais se estou certa ou errada". É como se sua cabeça não tivesse mais espaço para ter certeza de nada: o que você sente, pensa, quer… tudo parece duvidoso.

Isso não significa que você é confusa por natureza. Em relações confusas, é comum a pessoa começar a duvidar da própria memória e do próprio julgamento. A névoa é um efeito do ambiente, não um defeito seu.`,

      profissional: `O escore elevado em Névoa Mental sugere um padrão de questionamento constante da própria percepção. Em contextos de abuso psicológico, é comum que a vítima passe a desconfiar sistematicamente da própria memória, interpretação e valor das suas emoções.

Esse quadro favorece a manutenção da relação abusiva, pois reduz a confiança interna na própria leitura da realidade. Novamente, este instrumento não diagnostica, mas sinaliza um ponto de atenção importante para uma avaliação profissional.`,

      defesa: `Na prática, a pessoa usuária relata que, após muitas conversas e conflitos, termina sentindo que "não sabe mais o que é verdade" ou "não lembra direito como começou a discussão".

Ela tende a questionar se está exagerando, mesmo diante de situações que, em outras circunstâncias, seriam vistas como desrespeitosas. Esse padrão de dúvida constante sobre si é o que aparece aqui como Névoa Mental.`,

      micro_acao: `Próximo passo de 5 minutos: lembrar de UMA discussão em que você saiu se sentindo "doida" ou "confusa", e anotar só a primeira frase que você falou e a primeira resposta que ouviu. Sem julgar, só registrando.`
    }
  },

  // -------------------------------------------------------------------------
  // MEDO E TENSÃO
  // -------------------------------------------------------------------------
  medo_tensao: {
    id: 'medo_tensao',
    label: 'Medo e Tensão',
    voices: {
      colinho: `Esse número mostra o quanto seu corpo e sua mente vivem em estado de alerta. É aquele medo de "o que ele/ela vai fazer se eu tocar nesse assunto?". É muito cansativo viver pisando em ovos o tempo todo.

Ninguém consegue relaxar nem ser quem é com essa sensação de ameaça constante. Você não é fraca por sentir medo: seu corpo está tentando te proteger de uma situação que ele reconhece como perigosa ou imprevisível.`,

      profissional: `O escore em Medo e Tensão indica que a pessoa usuária relata um estado frequente de vigilância, apreensão e medo de retaliação emocional ou física.

Isso é compatível com quadros em que há assimetria de poder e risco de violência psicológica ou física. Embora o teste não substitua avaliação clínica, esse sinal reforça a necessidade de considerar estratégias de segurança e apoio especializado.`,

      defesa: `De forma simples, a pessoa usuária descreve que evita determinados temas, locais ou comportamentos por receio da reação da outra parte.

Frequentemente, sente-se "andando em ovos" e calcula suas falas para tentar reduzir explosões, humilhações ou punições. Esse padrão de medo recorrente é o que a pontuação em Medo e Tensão está representando.`,

      micro_acao: `Próximo passo de 5 minutos: escrever uma única frase começando com "O que eu mais tenho medo que aconteça se eu disser o que eu realmente penso é…". Não precisa mostrar pra ninguém agora.`
    }
  },

  // -------------------------------------------------------------------------
  // LIMITES
  // -------------------------------------------------------------------------
  limites: {
    id: 'limites',
    label: 'Respeito aos Limites',
    voices: {
      colinho: `Essa parte fala sobre o quanto suas tentativas de dizer "não", "assim não dá" ou "isso me machuca" são respeitadas. Quando o número aqui sobe, normalmente significa que você vem engolindo muita coisa para evitar briga, culpa ou punição.

Colocar limites não é ser egoísta, é se tratar com respeito. Se você anda sentindo que precisa se encolher para caber nessa relação, tem algo importante acontecendo.`,

      profissional: `O escore em Limites aponta que a pessoa usuária percebe seus limites emocionais, físicos ou materiais sendo frequentemente ignorados, ridicularizados ou contornados.

Isso é coerente com dinâmicas abusivas, nas quais o "não" não é aceito e as necessidades de uma parte são sistematicamente despriorizadas. Esse dado, associado às demais categorias, pode ser relevante em processos terapêuticos ou avaliações de risco.`,

      defesa: `Na prática, a pessoa usuária relata que, mesmo após dizer que algo a machuca ou ultrapassa seus limites, a situação tende a se repetir, muitas vezes acompanhada de justificativas, chantagem emocional ou inversão de culpa.

Esse movimento de não respeitar limites pessoais é o que esta pontuação em Limites está organizando.`,

      micro_acao: `Próximo passo de 5 minutos: lembrar de UMA situação recente em que você tentou colocar um limite, e anotar exatamente a frase que você usou e como a outra pessoa reagiu.`
    }
  },

  // -------------------------------------------------------------------------
  // INVALIDAÇÃO
  // -------------------------------------------------------------------------
  invalidacao: {
    id: 'invalidacao',
    label: 'Invalidação',
    voices: {
      colinho: `Invalidar é quando o que você sente é tratado como bobagem, exagero ou frescura. Essa pontuação alta mostra que, muitas vezes, quando você tenta falar de algo importante, sai da conversa se sentindo menor, boba ou errada por ter sentido o que sentiu.

Isso não quer dizer que você "faz drama", quer dizer que a sua dor não está encontrando espaço de respeito. Sentir muito não é defeito, é sinal de que você está viva.`,

      profissional: `O escore em Invalidação indica que a pessoa usuária percebe suas emoções e relatos sendo sistematicamente minimizados ou ridicularizados. Frases do tipo "você exagera", "isso não é nada" ou "você entendeu tudo errado" são típicas desse padrão.

Em contextos de violência psicológica, a invalidação cumpre o papel de enfraquecer a confiança da vítima na legitimidade das suas próprias experiências.`,

      defesa: `Em termos objetivos, a pessoa usuária relata episódios em que, ao expor incômodos ou sofrimento, recebeu respostas que diminuem ou desqualificam seu sentimento.

Em vez de acolher ou negociar, a outra parte tende a reagir com ironia, deboche ou desdém. Esse conjunto de situações é o que aparece nessa pontuação como Invalidação.`,

      micro_acao: `Próximo passo de 5 minutos: escrever uma frase começando com "Quando eu tento falar de algo que me machuca, geralmente ouço…". Completar com as respostas mais comuns.`
    }
  },

  // -------------------------------------------------------------------------
  // GASLIGHTING
  // -------------------------------------------------------------------------
  gaslighting: {
    id: 'gaslighting',
    label: 'Gaslighting',
    voices: {
      colinho: `Gaslighting é quando a pessoa mexe tanto na conversa que você começa a duvidar da sua própria memória. Essa pontuação alta mostra que, muitas vezes, você sai das discussões perguntando: "Será que eu inventei isso? Será que estou louca?".

Isso não é frescura. É um padrão que muita gente em relações abusivas vive. Você não é louca. Você está reagindo a um ambiente que confunde de propósito ou por costume.`,

      profissional: `O escore elevado em Gaslighting indica um padrão de comunicação em que a percepção da pessoa usuária é frequentemente negada, invertida ou ridicularizada.

São comuns situações em que fatos previamente combinados são negados, falas são distorcidas e a responsabilidade pelo conflito é deslocada de forma sistemática para a própria vítima. Esse padrão é amplamente descrito na literatura sobre abuso psicológico.`,

      defesa: `Do ponto de vista descritivo, a pessoa usuária relata que, após apresentar lembranças específicas de conversas ou acordos, frequentemente ouve que está "inventando".

A outra parte nega ter dito ou feito algo, mesmo diante de registros ou memórias consistentes, o que leva a usuária a duvidar de si. Essa recorrência de negação e inversão de fatos é o que esta categoria chama de Gaslighting.`,

      micro_acao: `Próximo passo de 5 minutos: escolher UMA situação de gaslighting recente e anotar em duas colunas: o que você lembra que aconteceu e o que a outra pessoa diz que aconteceu. Só isso já é um começo para organizar sua memória.`
    }
  },

  // -------------------------------------------------------------------------
  // CONTROLE
  // -------------------------------------------------------------------------
  controle: {
    id: 'controle',
    label: 'Controle',
    voices: {
      colinho: `Essa pontuação mostra o quanto a outra pessoa tenta mandar nos seus horários, dinheiro, roupas, amizades ou redes sociais. Quando o controle cresce, a vida vai ficando pequena: você vai se encaixando no que o outro quer e, de repente, já não reconhece mais a própria rotina.

Isso não é "cuidado demais", é um tipo de prisão emocional.`,

      profissional: `O escore em Controle aponta para um padrão de monitoramento excessivo, restrições de liberdade e interferência significativa em escolhas pessoais (tempo, dinheiro, contatos sociais, aparência).

Em contextos abusivos, o controle é um dos pilares para manter a assimetria de poder e dificultar a saída da relação. Esse dado, somado a outros, pode ser relevante em discussões de risco e estratégias de proteção.`,

      defesa: `De forma prática, a pessoa usuária relata episódios em que precisa pedir autorização para atividades que, em relações saudáveis, seriam decididas de forma mais autônoma.

Há relatos de fiscalização de telefone, redes sociais, dinheiro ou contatos, com críticas e punições quando o comportamento não segue o padrão esperado pela outra parte. Esse conjunto de condutas é o que esta categoria agrupa como Controle.`,

      micro_acao: `Próximo passo de 5 minutos: listar 3 coisas simples que você faz hoje "com medo da reação da outra pessoa", mas que em outras relações seriam naturais (ex.: responder mensagem mais tarde, falar com um amigo, comprar algo pequeno).`
    }
  },

  // -------------------------------------------------------------------------
  // ISOLAMENTO
  // -------------------------------------------------------------------------
  isolamento: {
    id: 'isolamento',
    label: 'Isolamento',
    voices: {
      colinho: `Isolamento é quando, aos poucos, você vai se afastando de amigos, família e de tudo que te faz sentir que tem um mundo além da relação. Às vezes vem embalado de "é que eu te amo demais, quero você só pra mim", mas no fundo o efeito é: você fica sozinha, sem rede de apoio.

Isso aumenta muito a sensação de prisão e de que "não tem pra onde correr".`,

      profissional: `O escore em Isolamento indica que a pessoa usuária percebe um afastamento progressivo de contatos sociais significativos, muitas vezes acompanhado de críticas ou conflitos quando busca essas pessoas.

Em relações abusivas, o isolamento é um mecanismo central para reduzir o suporte externo e aumentar a dependência emocional e/ou material.`,

      defesa: `Na prática, a pessoa usuária relata que, ao tentar manter contato com amigos, familiares ou atividades próprias, costuma enfrentar discussões, ciúmes excessivo, chantagem emocional ou desqualificação dessas relações.

Com o tempo, isso leva a uma redução concreta da sua rede de apoio. Essa dinâmica é o que o teste está agrupando como Isolamento.`,

      micro_acao: `Próximo passo de 5 minutos: lembrar de UMA pessoa com quem você se afastou não porque quis, mas porque "ficava mais fácil" evitar briga. Anotar o nome e UMA coisa boa dessa relação.`
    }
  },

  // -------------------------------------------------------------------------
  // ABUSO EMOCIONAL
  // -------------------------------------------------------------------------
  abuso_emocional: {
    id: 'abuso_emocional',
    label: 'Abuso Emocional',
    voices: {
      colinho: `Abuso emocional não é só grito ou xingamento pesado. É um conjunto de pequenas facadas invisíveis: humilhações, ironias, ameaças veladas, castigos silenciosos. Essa pontuação mostra que você tem sentido esse tipo de coisa com frequência.

Não é frescura. Dói de verdade e vai corroendo a autoestima aos poucos. Ninguém merece viver com medo do próximo ataque.`,

      profissional: `O escore em Abuso Emocional sugere presença frequente de comportamentos como humilhações, xingamentos, ataques à autoestima, ameaças veladas e punições emocionais (silêncio, afastamento proposital etc.).

A combinação desses elementos é descrita na literatura como violência psicológica, ainda que este instrumento, por si só, não faça diagnóstico clínico nem jurídico.`,

      defesa: `Objetivamente, a pessoa usuária relata episódios em que é xingada, ridicularizada ou colocada em posição de inferioridade, muitas vezes em contextos de conflito.

Também descreve situações em que sofre punições emocionais (como ser ignorada por dias) após discordar ou tentar colocar limites. Esse conjunto de práticas é o que esta categoria chama de Abuso Emocional.`,

      micro_acao: `Próximo passo de 5 minutos: escrever uma frase começando com "Uma coisa que ele/ela diz ou faz que me destrói por dentro é…". Não precisa justificar nem minimizar.`
    }
  },

  // -------------------------------------------------------------------------
  // RISCO FÍSICO
  // -------------------------------------------------------------------------
  risco_fisico: {
    id: 'risco_fisico',
    label: 'Risco Físico',
    voices: {
      colinho: `Quando essa parte acende, é sinal de que seu corpo está captando perigo. Pode ser empurrão, aperto, bloquear a passagem, dirigir de propósito de forma assustadora, ameaçar quebrar coisas…

Mesmo que "ainda não tenha acontecido algo pior", o medo que você sente é um alerta importante. Sua segurança física é prioridade absoluta. Você não tem obrigação de esperar "ficar grave o suficiente" para pedir ajuda.`,

      profissional: `O escore em Risco Físico indica a presença de comportamentos e situações que a pessoa usuária percebe como potencialmente perigosos para sua integridade física.

Isso pode incluir empurrões, contenções, destruição de objetos, ameaças e outras condutas intimidatórias. Do ponto de vista de avaliação de risco, esse dado deve ser considerado com muita seriedade e, idealmente, discutido com profissionais especializados em violência doméstica.`,

      defesa: `De maneira concreta, a pessoa usuária relata episódios em que teme por sua integridade física, seja por contato físico agressivo direto, seja por comportamentos intimidatórios (como danificar objetos, bloquear saídas ou dirigir de forma ameaçadora).

Essa categoria não afirma que houve crime, mas organiza o relato de percepções de risco físico.`,

      micro_acao: `Próximo passo de 5 minutos: sem entrar em detalhes, anotar APENAS datas aproximadas em que você se sentiu fisicamente em risco (ex.: "outubro desse ano", "semana passada"). Isso pode ser útil se você decidir buscar ajuda especializada.`
    }
  }
}

// =============================================================================
// LABELS E CONFIGURAÇÕES DAS VOZES
// =============================================================================

export const VOICE_CONFIG: Record<VoiceType, { label: string; emoji: string; color: string; bgColor: string; description: string }> = {
  colinho: {
    label: 'Colinho',
    emoji: '💜',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20',
    description: 'Acolhedor e empático, como uma amiga próxima'
  },
  profissional: {
    label: 'Profissional',
    emoji: '🩺',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    description: 'Técnico mas acessível, como um psicólogo explicando'
  },
  defesa: {
    label: 'Defesa',
    emoji: '⚖️',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    description: 'Objetivo e factual, como documentação para advogado'
  }
}

// Função para obter conteúdo de um tópico
export function getVoiceContent(topicId: string): TopicVoices | null {
  return THREE_VOICES_CONTENT[topicId] || null
}

// Função para mapear categoria para topicId
export function categoryToTopicId(category: string): string {
  const mapping: Record<string, string> = {
    invalidacao: 'invalidacao',
    gaslighting: 'gaslighting',
    controle: 'controle',
    isolamento: 'isolamento',
    emocional: 'abuso_emocional',
    fisico: 'risco_fisico'
  }
  return mapping[category] || category
}

// Função para mapear eixo para topicId
export function axisToTopicId(axis: string): string {
  const mapping: Record<string, string> = {
    nevoa: 'nevoa_mental',
    medo: 'medo_tensao',
    limites: 'limites'
  }
  return mapping[axis] || axis
}
