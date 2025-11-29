/**
 * 📝 DIÁRIO DE DECISÕES DO FOUNDER
 * 
 * Registra decisões sobre sugestões da IA Guardiã.
 * Cria um histórico que permite à IA "aprender" o estilo do Eduardo.
 * 
 * "Considere este histórico de decisões: aqui estão coisas que 
 * normalmente aceito e que normalmente recuso."
 */

export type DecisionType = 'ACCEPTED' | 'REJECTED' | 'DEFERRED';

export type FounderDecision = {
  id: string;
  aiSuggestionId: string;
  aiSuggestionTitle: string;
  aiSuggestionCategory: string;
  decision: DecisionType;
  reason: string;
  createdAt: string;
  tags?: string[];
};

export type CreateDecisionInput = {
  aiSuggestionId: string;
  aiSuggestionTitle: string;
  aiSuggestionCategory: string;
  decision: DecisionType;
  reason: string;
  tags?: string[];
};

// Funções de gerenciamento

const STORAGE_KEY = 'founder_decisions';

export function getDecisions(): FounderDecision[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function createDecision(input: CreateDecisionInput): FounderDecision {
  const decision: FounderDecision = {
    id: `dec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    aiSuggestionId: input.aiSuggestionId,
    aiSuggestionTitle: input.aiSuggestionTitle,
    aiSuggestionCategory: input.aiSuggestionCategory,
    decision: input.decision,
    reason: input.reason,
    createdAt: new Date().toISOString(),
    tags: input.tags,
  };

  const decisions = getDecisions();
  decisions.unshift(decision);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));

  return decision;
}

export function deleteDecision(id: string): boolean {
  const decisions = getDecisions();
  const filtered = decisions.filter(d => d.id !== id);
  
  if (filtered.length === decisions.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// Análise de decisões

export function getDecisionStats() {
  const decisions = getDecisions();
  
  const byCategory: Record<string, { accepted: number; rejected: number; deferred: number }> = {};
  
  decisions.forEach(d => {
    if (!byCategory[d.aiSuggestionCategory]) {
      byCategory[d.aiSuggestionCategory] = { accepted: 0, rejected: 0, deferred: 0 };
    }
    
    if (d.decision === 'ACCEPTED') byCategory[d.aiSuggestionCategory].accepted++;
    if (d.decision === 'REJECTED') byCategory[d.aiSuggestionCategory].rejected++;
    if (d.decision === 'DEFERRED') byCategory[d.aiSuggestionCategory].deferred++;
  });

  return {
    total: decisions.length,
    accepted: decisions.filter(d => d.decision === 'ACCEPTED').length,
    rejected: decisions.filter(d => d.decision === 'REJECTED').length,
    deferred: decisions.filter(d => d.decision === 'DEFERRED').length,
    byCategory,
    acceptanceRate: decisions.length > 0 
      ? Math.round((decisions.filter(d => d.decision === 'ACCEPTED').length / decisions.length) * 100)
      : 0,
  };
}

// Padrões de decisão (para IA aprender)

export function getDecisionPatterns() {
  const decisions = getDecisions();
  
  // Razões mais comuns para rejeição
  const rejectionReasons = decisions
    .filter(d => d.decision === 'REJECTED')
    .map(d => d.reason);
  
  // Razões mais comuns para aceitação
  const acceptanceReasons = decisions
    .filter(d => d.decision === 'ACCEPTED')
    .map(d => d.reason);
  
  // Categorias preferidas
  const categoryPreferences = Object.entries(getDecisionStats().byCategory)
    .map(([category, stats]) => ({
      category,
      acceptanceRate: stats.accepted + stats.rejected > 0
        ? Math.round((stats.accepted / (stats.accepted + stats.rejected)) * 100)
        : 50,
    }))
    .sort((a, b) => b.acceptanceRate - a.acceptanceRate);

  return {
    rejectionReasons,
    acceptanceReasons,
    categoryPreferences,
  };
}

// Gerar contexto para IA Guardiã

export function generateDecisionsContextForAI(): string {
  const decisions = getDecisions().slice(0, 30); // últimos 30
  const stats = getDecisionStats();
  const patterns = getDecisionPatterns();
  
  const accepted = decisions.filter(d => d.decision === 'ACCEPTED').slice(0, 10);
  const rejected = decisions.filter(d => d.decision === 'REJECTED').slice(0, 10);
  
  return `
HISTÓRICO DE DECISÕES DO FOUNDER (últimos 30):

Taxa de aceitação geral: ${stats.acceptanceRate}%

CATEGORIAS PREFERIDAS (maior aceitação primeiro):
${patterns.categoryPreferences.map(c => `- ${c.category}: ${c.acceptanceRate}% aceitação`).join('\n') || 'Sem dados ainda'}

SUGESTÕES ACEITAS RECENTEMENTE:
${accepted.map(d => `- "${d.aiSuggestionTitle}" (${d.aiSuggestionCategory}): "${d.reason}"`).join('\n') || 'Nenhuma ainda'}

SUGESTÕES REJEITADAS RECENTEMENTE:
${rejected.map(d => `- "${d.aiSuggestionTitle}" (${d.aiSuggestionCategory}): "${d.reason}"`).join('\n') || 'Nenhuma ainda'}

INSTRUÇÕES: Alinhe suas futuras sugestões com este estilo de decisão. Priorize categorias com maior aceitação. Evite padrões similares às sugestões rejeitadas.
`.trim();
}

console.log('📝 Founder Decisions initialized');
