/**
 * 📊 UX Analytics - Métricas para IA Guardiã de UX
 */

// src/lib/uxAnalytics.ts

export type UxFunnelMetrics = {
  visitors: number;
  testStarted: number;
  testCompleted: number;
  accountCreated: number;
  diaryUsed: number;
  chatUsed: number;
  premiumTrialStarted: number;
};

export type UxUiMetrics = {
  themeUsage: {
    light: number;
    dark: number;
    highContrast: number;
  };
  fontSizeChanges: {
    increased: number;
    decreased: number;
    default: number;
  };
  abortEvents: {
    audioStartButCancel: number;
    testAbandonedBeforeQ3: number;
    diaryOpenedNoSave: number;
    chatOpenedNoMessage: number;
  };
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
};

export type UxContentMetrics = {
  topLandingPaths: { path: string; sessions: number; conversionToTest: number }[];
  topBlogPosts: { slug: string; sessions: number; clickToTest: number }[];
  searchTermsInternal: { term: string; count: number }[];
};

export type UxSeoMetrics = {
  avgPageLoadMs: number;
  coreWebVitalsOk: boolean;
  organicSessionsLast30d: number;
  topOrganicKeywords: { keyword: string; clicks: number; ctr: number }[];
};

export type UxGuardianSnapshot = {
  timeWindow: 'last_24h' | 'last_7d' | 'last_30d';
  generatedAt: string; // ISO
  funnel: UxFunnelMetrics;
  ui: UxUiMetrics;
  content: UxContentMetrics;
  seo: UxSeoMetrics;
  notesFromFounder?: string; // você escreve aqui dúvidas ou hipóteses
};

export type UxGuardianSuggestion = {
  summary: string; // resumo em 3–5 frases
  priorityActions: {
    title: string;
    description: string;
    impact: 'alto' | 'medio' | 'baixo';
    effort: 'alto' | 'medio' | 'baixo';
  }[];
  uxIssues: {
    area: 'funnel' | 'ui' | 'content' | 'seo';
    description: string;
    suggestedFix: string;
  }[];
  seoOpportunities: {
    topic: string;
    suggestion: string;
  }[];
  contentIdeas: {
    title: string;
    outline: string[];
    targetAudience: 'vitima' | 'profissional';
  }[];
  risks: string[]; // coisas a tomar cuidado
};

console.log('📊 UX Analytics initialized')
