/**
 * SISTEMA DE GAMIFICAÇÃO - RADAR NARCISISTA
 * Badges, conquistas e progresso do usuário
 * 
 * BACKUP: Criado em 24/11/2025 23:30
 * LOCAL: lib/gamificacao.ts
 */

// ============================================
// TIPOS
// ============================================

export interface Badge {
  id: string
  nome: string
  descricao: string
  icone: string
  cor: string
  categoria: 'teste' | 'diario' | 'chat' | 'jornada' | 'especial'
  condicao: {
    tipo: 'count' | 'streak' | 'milestone' | 'special'
    campo: string
    valor: number
  }
}

export interface UserProgress {
  userId: string
  badges: string[]
  estatisticas: {
    testesRealizados: number
    entradasDiario: number
    mensagensChat: number
    diasConsecutivos: number
    ultimoAcesso: string
  }
  nivel: number
  xp: number
  xpProximoNivel: number
}

// ============================================
// BADGES DISPONÍVEIS
// ============================================

export const BADGES: Badge[] = [
  // Teste de Clareza
  {
    id: 'primeiro-teste',
    nome: 'Primeiro Passo',
    descricao: 'Completou seu primeiro Teste de Clareza',
    icone: '🎯',
    cor: 'bg-purple-500',
    categoria: 'teste',
    condicao: { tipo: 'count', campo: 'testesRealizados', valor: 1 }
  },
  {
    id: 'cinco-testes',
    nome: 'Autoconhecimento',
    descricao: 'Completou 5 Testes de Clareza',
    icone: '🧠',
    cor: 'bg-blue-500',
    categoria: 'teste',
    condicao: { tipo: 'count', campo: 'testesRealizados', valor: 5 }
  },
  {
    id: 'dez-testes',
    nome: 'Mestre da Clareza',
    descricao: 'Completou 10 Testes de Clareza',
    icone: '👑',
    cor: 'bg-yellow-500',
    categoria: 'teste',
    condicao: { tipo: 'count', campo: 'testesRealizados', valor: 10 }
  },

  // Diário
  {
    id: 'primeira-entrada',
    nome: 'Diário Iniciado',
    descricao: 'Criou sua primeira entrada no diário',
    icone: '📝',
    cor: 'bg-green-500',
    categoria: 'diario',
    condicao: { tipo: 'count', campo: 'entradasDiario', valor: 1 }
  },
  {
    id: 'dez-entradas',
    nome: 'Escritor Dedicado',
    descricao: 'Criou 10 entradas no diário',
    icone: '📖',
    cor: 'bg-teal-500',
    categoria: 'diario',
    condicao: { tipo: 'count', campo: 'entradasDiario', valor: 10 }
  },
  {
    id: 'cinquenta-entradas',
    nome: 'Cronista',
    descricao: 'Criou 50 entradas no diário',
    icone: '📚',
    cor: 'bg-indigo-500',
    categoria: 'diario',
    condicao: { tipo: 'count', campo: 'entradasDiario', valor: 50 }
  },

  // Chat
  {
    id: 'primeira-conversa',
    nome: 'Primeira Conversa',
    descricao: 'Iniciou sua primeira conversa com o Coach',
    icone: '💬',
    cor: 'bg-pink-500',
    categoria: 'chat',
    condicao: { tipo: 'count', campo: 'mensagensChat', valor: 1 }
  },
  {
    id: 'cem-mensagens',
    nome: 'Comunicador',
    descricao: 'Enviou 100 mensagens no chat',
    icone: '🗣️',
    cor: 'bg-orange-500',
    categoria: 'chat',
    condicao: { tipo: 'count', campo: 'mensagensChat', valor: 100 }
  },

  // Jornada (Streak)
  {
    id: 'tres-dias',
    nome: 'Consistência',
    descricao: 'Acessou o app por 3 dias consecutivos',
    icone: '🔥',
    cor: 'bg-red-500',
    categoria: 'jornada',
    condicao: { tipo: 'streak', campo: 'diasConsecutivos', valor: 3 }
  },
  {
    id: 'sete-dias',
    nome: 'Semana Completa',
    descricao: 'Acessou o app por 7 dias consecutivos',
    icone: '⭐',
    cor: 'bg-amber-500',
    categoria: 'jornada',
    condicao: { tipo: 'streak', campo: 'diasConsecutivos', valor: 7 }
  },
  {
    id: 'trinta-dias',
    nome: 'Mês de Clareza',
    descricao: 'Acessou o app por 30 dias consecutivos',
    icone: '🏆',
    cor: 'bg-yellow-600',
    categoria: 'jornada',
    condicao: { tipo: 'streak', campo: 'diasConsecutivos', valor: 30 }
  },

  // Especiais
  {
    id: 'founding-member',
    nome: 'Founding Member',
    descricao: 'Um dos primeiros 100 usuários',
    icone: '💎',
    cor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    categoria: 'especial',
    condicao: { tipo: 'special', campo: 'foundingMember', valor: 1 }
  },
  {
    id: 'indicador',
    nome: 'Embaixador',
    descricao: 'Indicou alguém que se cadastrou',
    icone: '🤝',
    cor: 'bg-cyan-500',
    categoria: 'especial',
    condicao: { tipo: 'special', campo: 'indicacoes', valor: 1 }
  }
]

// ============================================
// NÍVEIS
// ============================================

export const NIVEIS = [
  { nivel: 1, nome: 'Iniciante', xpNecessario: 0 },
  { nivel: 2, nome: 'Explorador', xpNecessario: 100 },
  { nivel: 3, nome: 'Observador', xpNecessario: 300 },
  { nivel: 4, nome: 'Consciente', xpNecessario: 600 },
  { nivel: 5, nome: 'Clarificado', xpNecessario: 1000 },
  { nivel: 6, nome: 'Sábio', xpNecessario: 1500 },
  { nivel: 7, nome: 'Mestre', xpNecessario: 2500 },
  { nivel: 8, nome: 'Iluminado', xpNecessario: 4000 },
  { nivel: 9, nome: 'Guardião', xpNecessario: 6000 },
  { nivel: 10, nome: 'Lenda', xpNecessario: 10000 }
]

// ============================================
// PONTOS DE XP
// ============================================

export const XP_ACOES = {
  completarTeste: 50,
  criarEntradaDiario: 20,
  enviarMensagemChat: 5,
  acessoDiario: 10,
  conquistarBadge: 100,
  indicarAmigo: 200,
  completarOnboarding: 30
}

// ============================================
// FUNÇÕES
// ============================================

/**
 * Calcula o nível baseado no XP
 */
export function calcularNivel(xp: number): { nivel: number; nome: string; xpAtual: number; xpProximo: number } {
  let nivelAtual = NIVEIS[0]
  let proximoNivel = NIVEIS[1]

  for (let i = 0; i < NIVEIS.length; i++) {
    if (xp >= NIVEIS[i].xpNecessario) {
      nivelAtual = NIVEIS[i]
      proximoNivel = NIVEIS[i + 1] || NIVEIS[i]
    } else {
      break
    }
  }

  return {
    nivel: nivelAtual.nivel,
    nome: nivelAtual.nome,
    xpAtual: xp - nivelAtual.xpNecessario,
    xpProximo: proximoNivel.xpNecessario - nivelAtual.xpNecessario
  }
}

/**
 * Verifica badges conquistados
 */
export function verificarBadges(estatisticas: UserProgress['estatisticas']): string[] {
  const badgesConquistados: string[] = []

  for (const badge of BADGES) {
    const { tipo, campo, valor } = badge.condicao
    
    if (tipo === 'count' || tipo === 'streak') {
      const valorAtual = estatisticas[campo as keyof typeof estatisticas]
      if (typeof valorAtual === 'number' && valorAtual >= valor) {
        badgesConquistados.push(badge.id)
      }
    }
  }

  return badgesConquistados
}

/**
 * Verifica novos badges conquistados
 */
export function verificarNovosBadges(
  badgesAtuais: string[],
  estatisticas: UserProgress['estatisticas']
): Badge[] {
  const todosBadges = verificarBadges(estatisticas)
  const novosBadges = todosBadges.filter(id => !badgesAtuais.includes(id))
  
  return novosBadges.map(id => BADGES.find(b => b.id === id)!).filter(Boolean)
}

/**
 * Busca badge por ID
 */
export function getBadge(id: string): Badge | undefined {
  return BADGES.find(b => b.id === id)
}

/**
 * Calcula progresso para próximo badge
 */
export function calcularProgressoBadge(
  badge: Badge,
  estatisticas: UserProgress['estatisticas']
): { atual: number; necessario: number; percentual: number } {
  const { campo, valor } = badge.condicao
  const valorAtual = estatisticas[campo as keyof typeof estatisticas]
  
  if (typeof valorAtual !== 'number') {
    return { atual: 0, necessario: valor, percentual: 0 }
  }

  return {
    atual: valorAtual,
    necessario: valor,
    percentual: Math.min(100, Math.round((valorAtual / valor) * 100))
  }
}

/**
 * Gera progresso inicial do usuário
 */
export function criarProgressoInicial(userId: string): UserProgress {
  return {
    userId,
    badges: [],
    estatisticas: {
      testesRealizados: 0,
      entradasDiario: 0,
      mensagensChat: 0,
      diasConsecutivos: 0,
      ultimoAcesso: new Date().toISOString()
    },
    nivel: 1,
    xp: 0,
    xpProximoNivel: 100
  }
}
