/**
 * 🧪 LOG DE EXPERIMENTOS UX
 * 
 * Sistema para rastrear mudanças, hipóteses e resultados.
 * "O que eu mudei? Por que eu mudei? Funcionou?"
 * 
 * Cria memória de decisão para não se perder no caos.
 */

export type ExperimentResult = 'ganhou' | 'perdeu' | 'neutro' | 'em_andamento';

export type ExperimentMetrics = {
  sessions?: number;
  testStarts?: number;
  testCompletions?: number;
  signups?: number;
  conversionRate?: number;
  bounceRate?: number;
  avgTimeOnPage?: number;
  [key: string]: number | undefined;
};

export type UxExperiment = {
  id: string;
  title: string;
  description: string;
  hypothesis: string;
  startedAt: string;        // ISO
  finishedAt?: string;      // ISO
  metricsBefore: ExperimentMetrics;
  metricsAfter?: ExperimentMetrics;
  createdBy: 'founder' | 'ai';
  suggestedByAi: boolean;
  aiSuggestionId?: string;
  result: ExperimentResult;
  notes?: string;
  tags?: string[];
};

export type CreateExperimentInput = {
  title: string;
  description: string;
  hypothesis: string;
  metricsBefore: ExperimentMetrics;
  createdBy: 'founder' | 'ai';
  suggestedByAi: boolean;
  aiSuggestionId?: string;
  tags?: string[];
};

export type FinishExperimentInput = {
  id: string;
  metricsAfter: ExperimentMetrics;
  result: ExperimentResult;
  notes?: string;
};

// Funções de gerenciamento (localStorage para MVP, depois Supabase)

const STORAGE_KEY = 'ux_experiments';

export function getExperiments(): UxExperiment[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function createExperiment(input: CreateExperimentInput): UxExperiment {
  const experiment: UxExperiment = {
    id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    description: input.description,
    hypothesis: input.hypothesis,
    startedAt: new Date().toISOString(),
    metricsBefore: input.metricsBefore,
    createdBy: input.createdBy,
    suggestedByAi: input.suggestedByAi,
    aiSuggestionId: input.aiSuggestionId,
    result: 'em_andamento',
    tags: input.tags,
  };

  const experiments = getExperiments();
  experiments.unshift(experiment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(experiments));

  return experiment;
}

export function finishExperiment(input: FinishExperimentInput): UxExperiment | null {
  const experiments = getExperiments();
  const index = experiments.findIndex(e => e.id === input.id);
  
  if (index === -1) return null;

  experiments[index] = {
    ...experiments[index],
    finishedAt: new Date().toISOString(),
    metricsAfter: input.metricsAfter,
    result: input.result,
    notes: input.notes,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(experiments));
  return experiments[index];
}

export function deleteExperiment(id: string): boolean {
  const experiments = getExperiments();
  const filtered = experiments.filter(e => e.id !== id);
  
  if (filtered.length === experiments.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// Análise de experimentos

export function getExperimentStats() {
  const experiments = getExperiments();
  const finished = experiments.filter(e => e.result !== 'em_andamento');
  
  return {
    total: experiments.length,
    emAndamento: experiments.filter(e => e.result === 'em_andamento').length,
    ganhou: finished.filter(e => e.result === 'ganhou').length,
    perdeu: finished.filter(e => e.result === 'perdeu').length,
    neutro: finished.filter(e => e.result === 'neutro').length,
    taxaAcertoAi: calculateAiAccuracy(experiments),
    taxaAcertoFounder: calculateFounderAccuracy(experiments),
  };
}

function calculateAiAccuracy(experiments: UxExperiment[]): number {
  const aiExperiments = experiments.filter(e => e.suggestedByAi && e.result !== 'em_andamento');
  if (aiExperiments.length === 0) return 0;
  
  const wins = aiExperiments.filter(e => e.result === 'ganhou').length;
  return Math.round((wins / aiExperiments.length) * 100);
}

function calculateFounderAccuracy(experiments: UxExperiment[]): number {
  const founderExperiments = experiments.filter(e => !e.suggestedByAi && e.result !== 'em_andamento');
  if (founderExperiments.length === 0) return 0;
  
  const wins = founderExperiments.filter(e => e.result === 'ganhou').length;
  return Math.round((wins / founderExperiments.length) * 100);
}

// Gerar contexto para IA Guardiã

export function generateExperimentsContextForAI(): string {
  const experiments = getExperiments().slice(0, 20); // últimos 20
  const stats = getExperimentStats();
  
  const winners = experiments.filter(e => e.result === 'ganhou');
  const losers = experiments.filter(e => e.result === 'perdeu');
  
  return `
HISTÓRICO DE EXPERIMENTOS (últimos 20):

Taxa de acerto IA: ${stats.taxaAcertoAi}%
Taxa de acerto Founder: ${stats.taxaAcertoFounder}%

EXPERIMENTOS QUE FUNCIONARAM:
${winners.map(e => `- "${e.title}": ${e.hypothesis}`).join('\n') || 'Nenhum ainda'}

EXPERIMENTOS QUE NÃO FUNCIONARAM:
${losers.map(e => `- "${e.title}": ${e.hypothesis}`).join('\n') || 'Nenhum ainda'}

CONSIDERE: Priorize sugestões similares às que funcionaram. Evite padrões similares às que não funcionaram.
`.trim();
}

console.log('🧪 UX Experiments initialized');
