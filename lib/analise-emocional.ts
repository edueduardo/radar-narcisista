/**
 * ANÁLISE DE EVOLUÇÃO EMOCIONAL
 * Compara mensagens anteriores com a atual para detectar mudanças de estado
 * 
 * Criado em: 28/11/2025
 */

// ============================================
// TIPOS
// ============================================

export interface EstadoEmocional {
  sentimento: 'muito_negativo' | 'negativo' | 'neutro' | 'positivo' | 'muito_positivo'
  intensidade: number // 0-100
  emocoes: string[] // ex: ['triste', 'cansado', 'frustrado']
  palavrasChave: string[]
  timestamp: string
}

export interface EvolucaoEmocional {
  estadoAnterior: EstadoEmocional | null
  estadoAtual: EstadoEmocional
  mudanca: 'melhora_significativa' | 'melhora' | 'estavel' | 'piora' | 'piora_significativa'
  diferencaIntensidade: number
  analise: string
  sugestao: string
}

export interface HistoricoEmocional {
  mensagens: {
    conteudo: string
    estado: EstadoEmocional
    timestamp: string
  }[]
}

// ============================================
// PALAVRAS-CHAVE PARA DETECÇÃO DE EMOÇÕES
// ============================================

const PALAVRAS_NEGATIVAS = {
  muito_negativo: [
    'desesperado', 'desesperada', 'não aguento', 'quero morrer', 'suicídio',
    'acabou', 'destruída', 'destruído', 'sem saída', 'não consigo mais',
    'odeio', 'terror', 'pânico', 'desespero', 'inferno'
  ],
  negativo: [
    'triste', 'cansado', 'cansada', 'exausto', 'exausta', 'frustrado', 'frustrada',
    'irritado', 'irritada', 'chateado', 'chateada', 'decepcionado', 'decepcionada',
    'ansioso', 'ansiosa', 'preocupado', 'preocupada', 'medo', 'inseguro', 'insegura',
    'confuso', 'confusa', 'perdido', 'perdida', 'sozinho', 'sozinha', 'abandonado',
    'abandonada', 'magoado', 'magoada', 'ferido', 'ferida', 'mal', 'péssimo', 'péssima',
    'horrível', 'terrível', 'difícil', 'complicado', 'problema', 'ruim'
  ]
}

const PALAVRAS_POSITIVAS = {
  muito_positivo: [
    'incrível', 'maravilhoso', 'maravilhosa', 'fantástico', 'fantástica',
    'excelente', 'perfeito', 'perfeita', 'felicíssimo', 'felicíssima',
    'realizado', 'realizada', 'pleno', 'plena', 'gratidão', 'abençoado', 'abençoada'
  ],
  positivo: [
    'feliz', 'bem', 'melhor', 'bom', 'boa', 'ótimo', 'ótima', 'legal',
    'contente', 'alegre', 'animado', 'animada', 'esperança', 'esperançoso', 'esperançosa',
    'tranquilo', 'tranquila', 'calmo', 'calma', 'aliviado', 'aliviada', 'grato', 'grata',
    'confiante', 'forte', 'capaz', 'consegui', 'conseguindo', 'evoluindo', 'melhorando',
    'progresso', 'avanço', 'vitória', 'conquista'
  ]
}

const PALAVRAS_NEUTRAS = [
  'normal', 'ok', 'tá', 'está', 'acho', 'talvez', 'não sei', 'mais ou menos'
]

// ============================================
// FUNÇÕES DE ANÁLISE
// ============================================

/**
 * Analisa o estado emocional de uma mensagem
 */
export function analisarEstadoEmocional(mensagem: string): EstadoEmocional {
  const texto = mensagem.toLowerCase()
  const palavrasEncontradas: string[] = []
  let pontuacao = 50 // Começa neutro
  
  // Verificar palavras muito negativas (-40 pontos cada)
  for (const palavra of PALAVRAS_NEGATIVAS.muito_negativo) {
    if (texto.includes(palavra)) {
      pontuacao -= 40
      palavrasEncontradas.push(palavra)
    }
  }
  
  // Verificar palavras negativas (-15 pontos cada)
  for (const palavra of PALAVRAS_NEGATIVAS.negativo) {
    if (texto.includes(palavra)) {
      pontuacao -= 15
      palavrasEncontradas.push(palavra)
    }
  }
  
  // Verificar palavras muito positivas (+40 pontos cada)
  for (const palavra of PALAVRAS_POSITIVAS.muito_positivo) {
    if (texto.includes(palavra)) {
      pontuacao += 40
      palavrasEncontradas.push(palavra)
    }
  }
  
  // Verificar palavras positivas (+15 pontos cada)
  for (const palavra of PALAVRAS_POSITIVAS.positivo) {
    if (texto.includes(palavra)) {
      pontuacao += 15
      palavrasEncontradas.push(palavra)
    }
  }
  
  // Limitar entre 0 e 100
  pontuacao = Math.max(0, Math.min(100, pontuacao))
  
  // Determinar sentimento baseado na pontuação
  let sentimento: EstadoEmocional['sentimento']
  if (pontuacao <= 20) sentimento = 'muito_negativo'
  else if (pontuacao <= 40) sentimento = 'negativo'
  else if (pontuacao <= 60) sentimento = 'neutro'
  else if (pontuacao <= 80) sentimento = 'positivo'
  else sentimento = 'muito_positivo'
  
  // Extrair emoções específicas
  const emocoes = extrairEmocoes(texto)
  
  return {
    sentimento,
    intensidade: pontuacao,
    emocoes,
    palavrasChave: palavrasEncontradas,
    timestamp: new Date().toISOString()
  }
}

/**
 * Extrai emoções específicas do texto
 */
function extrairEmocoes(texto: string): string[] {
  const emocoes: string[] = []
  
  const mapaEmocoes: Record<string, string[]> = {
    'tristeza': ['triste', 'chorando', 'chorei', 'lágrimas', 'deprimido', 'deprimida'],
    'raiva': ['raiva', 'irritado', 'irritada', 'bravo', 'brava', 'ódio', 'furioso', 'furiosa'],
    'medo': ['medo', 'assustado', 'assustada', 'pânico', 'terror', 'apavorado', 'apavorada'],
    'ansiedade': ['ansioso', 'ansiosa', 'nervoso', 'nervosa', 'preocupado', 'preocupada'],
    'confusão': ['confuso', 'confusa', 'perdido', 'perdida', 'não entendo', 'não sei'],
    'solidão': ['sozinho', 'sozinha', 'abandonado', 'abandonada', 'isolado', 'isolada'],
    'esperança': ['esperança', 'esperançoso', 'esperançosa', 'acredito', 'vai melhorar'],
    'alívio': ['aliviado', 'aliviada', 'alívio', 'respirar', 'peso saiu'],
    'felicidade': ['feliz', 'alegre', 'contente', 'animado', 'animada', 'bem'],
    'gratidão': ['grato', 'grata', 'agradeço', 'obrigado', 'obrigada', 'gratidão'],
    'cansaço': ['cansado', 'cansada', 'exausto', 'exausta', 'esgotado', 'esgotada']
  }
  
  for (const [emocao, palavras] of Object.entries(mapaEmocoes)) {
    for (const palavra of palavras) {
      if (texto.includes(palavra)) {
        if (!emocoes.includes(emocao)) {
          emocoes.push(emocao)
        }
        break
      }
    }
  }
  
  return emocoes
}

/**
 * Compara estado atual com anterior e gera análise de evolução
 */
export function compararEvolucao(
  estadoAtual: EstadoEmocional,
  estadoAnterior: EstadoEmocional | null
): EvolucaoEmocional {
  
  if (!estadoAnterior) {
    // Primeira mensagem
    return {
      estadoAnterior: null,
      estadoAtual,
      mudanca: 'estavel',
      diferencaIntensidade: 0,
      analise: gerarAnaliseInicial(estadoAtual),
      sugestao: gerarSugestaoInicial(estadoAtual)
    }
  }
  
  const diferenca = estadoAtual.intensidade - estadoAnterior.intensidade
  
  let mudanca: EvolucaoEmocional['mudanca']
  if (diferenca >= 30) mudanca = 'melhora_significativa'
  else if (diferenca >= 10) mudanca = 'melhora'
  else if (diferenca <= -30) mudanca = 'piora_significativa'
  else if (diferenca <= -10) mudanca = 'piora'
  else mudanca = 'estavel'
  
  return {
    estadoAnterior,
    estadoAtual,
    mudanca,
    diferencaIntensidade: diferenca,
    analise: gerarAnaliseComparativa(estadoAnterior, estadoAtual, mudanca),
    sugestao: gerarSugestaoEvolucao(estadoAtual, mudanca)
  }
}

/**
 * Gera análise para primeira mensagem
 */
function gerarAnaliseInicial(estado: EstadoEmocional): string {
  const emocoesTexto = estado.emocoes.length > 0 
    ? estado.emocoes.join(', ') 
    : 'não identificadas claramente'
  
  switch (estado.sentimento) {
    case 'muito_negativo':
      return `Percebi que você está passando por um momento muito difícil. Detectei emoções de ${emocoesTexto}. Estou aqui para te ouvir.`
    case 'negativo':
      return `Entendo que você não está se sentindo bem. Percebi ${emocoesTexto} no que você compartilhou. Quer me contar mais?`
    case 'neutro':
      return `Obrigado por compartilhar. Ainda estou conhecendo como você está se sentindo. Pode me contar mais sobre sua situação?`
    case 'positivo':
      return `Que bom perceber que você está se sentindo ${emocoesTexto}! Quer me contar o que está acontecendo de bom?`
    case 'muito_positivo':
      return `Que maravilha! Você está irradiando positividade! Percebi ${emocoesTexto}. Conta mais!`
  }
}

/**
 * Gera análise comparativa entre estados
 */
function gerarAnaliseComparativa(
  anterior: EstadoEmocional,
  atual: EstadoEmocional,
  mudanca: EvolucaoEmocional['mudanca']
): string {
  const emocoesAnteriores = anterior.emocoes.join(', ') || 'não identificadas'
  const emocoesAtuais = atual.emocoes.join(', ') || 'não identificadas'
  
  switch (mudanca) {
    case 'melhora_significativa':
      return `🎉 **Evolução incrível!** Antes você demonstrava ${emocoesAnteriores}, e agora percebo ${emocoesAtuais}. Sua intensidade emocional subiu de ${anterior.intensidade} para ${atual.intensidade}. Isso é uma mudança muito positiva!`
    
    case 'melhora':
      return `📈 **Você está melhorando!** Antes: ${emocoesAnteriores}. Agora: ${emocoesAtuais}. Sua intensidade foi de ${anterior.intensidade} para ${atual.intensidade}. Continue assim!`
    
    case 'estavel':
      return `➡️ **Seu estado está estável.** Você continua demonstrando ${emocoesAtuais}. Intensidade: ${atual.intensidade}/100.`
    
    case 'piora':
      return `💙 **Percebi uma mudança.** Antes você estava com ${emocoesAnteriores}, agora percebo ${emocoesAtuais}. Sua intensidade foi de ${anterior.intensidade} para ${atual.intensidade}. O que aconteceu?`
    
    case 'piora_significativa':
      return `🫂 **Você parece estar passando por um momento mais difícil.** Antes: ${emocoesAnteriores} (${anterior.intensidade}). Agora: ${emocoesAtuais} (${atual.intensidade}). Estou aqui para te apoiar.`
  }
}

/**
 * Gera sugestão inicial baseada no estado
 */
function gerarSugestaoInicial(estado: EstadoEmocional): string {
  switch (estado.sentimento) {
    case 'muito_negativo':
      return 'Se você está em crise, ligue 188 (CVV). Estou aqui para te ouvir. Me conta mais sobre o que está acontecendo.'
    case 'negativo':
      return 'Vamos conversar sobre isso. Me conta mais detalhes sobre o que está te deixando assim.'
    case 'neutro':
      return 'Pode me contar mais sobre sua situação? Quanto mais você compartilhar, melhor posso te ajudar.'
    case 'positivo':
      return 'Que bom! Me conta mais sobre o que está te fazendo bem.'
    case 'muito_positivo':
      return 'Incrível! Vamos celebrar isso juntos. O que mais está acontecendo de bom?'
  }
}

/**
 * Gera sugestão baseada na evolução
 */
function gerarSugestaoEvolucao(
  estadoAtual: EstadoEmocional,
  mudanca: EvolucaoEmocional['mudanca']
): string {
  switch (mudanca) {
    case 'melhora_significativa':
      return 'Você está evoluindo muito bem! Vamos continuar conversando para fortalecer esse progresso. O que mais você gostaria de explorar?'
    
    case 'melhora':
      return 'Bom progresso! Vamos continuar nessa direção. Me conta mais sobre o que está te ajudando a se sentir melhor.'
    
    case 'estavel':
      if (estadoAtual.sentimento === 'negativo' || estadoAtual.sentimento === 'muito_negativo') {
        return 'Vamos explorar juntos o que pode te ajudar a se sentir melhor. Quer me contar mais sobre o que está acontecendo?'
      }
      return 'Você está mantendo um bom estado. Quer continuar conversando sobre algo específico?'
    
    case 'piora':
      return 'Percebi que algo mudou. Quer me contar o que aconteceu? Estou aqui para te ouvir e ajudar.'
    
    case 'piora_significativa':
      return 'Estou preocupado com você. Me conta o que está acontecendo. Se precisar de ajuda urgente, ligue 188 (CVV).'
  }
}

/**
 * Formata o histórico emocional para exibição
 */
export function formatarHistoricoEmocional(historico: HistoricoEmocional): string {
  if (historico.mensagens.length === 0) {
    return 'Ainda não há histórico emocional.'
  }
  
  let texto = '## Sua Jornada Emocional\n\n'
  
  historico.mensagens.forEach((msg, index) => {
    const emoji = getEmojiPorSentimento(msg.estado.sentimento)
    texto += `**Mensagem ${index + 1}:** ${emoji} ${msg.estado.sentimento.replace('_', ' ')} (${msg.estado.intensidade}/100)\n`
    if (msg.estado.emocoes.length > 0) {
      texto += `Emoções: ${msg.estado.emocoes.join(', ')}\n`
    }
    texto += '\n'
  })
  
  return texto
}

function getEmojiPorSentimento(sentimento: EstadoEmocional['sentimento']): string {
  switch (sentimento) {
    case 'muito_negativo': return '😢'
    case 'negativo': return '😔'
    case 'neutro': return '😐'
    case 'positivo': return '🙂'
    case 'muito_positivo': return '😄'
  }
}
