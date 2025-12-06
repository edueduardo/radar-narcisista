/**
 * ============================================================================
 * CONFIGURAÇÃO CENTRAL DE CENÁRIOS DE TESTE - RADAR NARCISISTA
 * ============================================================================
 * 
 * Este arquivo controla quais cenários de teste E2E serão executados.
 * 
 * COMO USAR:
 * - all: true  → Roda TODOS os testes, ignorando flags individuais
 * - all: false → Roda apenas os cenários com flag = true
 * 
 * REGRA OBRIGATÓRIA:
 * Sempre que criar um novo teste E2E, DEVE:
 * 1. Adicionar uma nova chave aqui
 * 2. Usar test.skip() no teste para respeitar esta config
 * 
 * EXEMPLO DE USO NO TESTE:
 * ```ts
 * import { testScenarios } from '../config/test-scenarios.config';
 * test.skip(!(testScenarios.all || testScenarios.frontpage), 'Cenário desativado');
 * ```
 */

export const testScenarios = {
  // ========================================
  // CONTROLE GERAL
  // ========================================
  
  /** Se true, ignora todas as flags individuais e roda TUDO */
  all: false,

  // ========================================
  // BLOCO A - USUÁRIA FINAL
  // ========================================

  /** 
   * FRONTPAGE - Página inicial pública
   * Testa: título, seções, planos, CTAs, DynamicSections
   */
  frontpage: true,

  /**
   * FRONTPAGE COM ADMIN - Testa frontpage após configurar backend
   * Testa: login admin → ativar flags → verificar frontpage
   */
  frontpage_with_admin: true,

  /**
   * DASHBOARD USUÁRIA - Painel da usuária
   * Testa: contagem de diários, gráficos, indicador de risco
   */
  dashboard_usuario: true,

  /**
   * DIÁRIO BÁSICO - Funcionalidades básicas do diário
   * Testa: criar entrada, listar, editar, excluir
   */
  diario_basico: false,

  /**
   * DIÁRIO CRÍTICO - Detecção de risco no diário
   * Testa: tags graves, criação de risk_alert, padrões 30 dias
   */
  diario_critico: true,

  /**
   * ORÁCULO - Chat com IA (Coach de Clareza)
   * Testa: enviar mensagem, receber resposta, histórico
   */
  oraculo: false,

  /**
   * TESTE DE CLAREZA - Questionário de clareza
   * Testa: responder perguntas, ver resultado, histórico
   */
  teste_clareza: false,

  /**
   * PLANO DE SEGURANÇA - Triângulo de segurança
   * Testa: criar plano, editar itens, status
   */
  plano_seguranca: false,

  // ========================================
  // BLOCO B - PROFISSIONAL / ADMIN
  // ========================================

  /**
   * DASHBOARD PROFISSIONAL - Painel do profissional
   * Testa: casos listados, alertas, priorização
   */
  dashboard_profissional: false,

  /**
   * ADMIN FEATURE FLAGS - Configurações do admin
   * Testa: ativar/desativar flags, salvar configurações
   */
  admin_feature_flags: false,

  /**
   * ADMIN - Painel administrativo geral
   * Testa: dashboard admin, usuários, configurações
   */
  admin: false,

  // ========================================
  // BLOCO C - BACKEND / APIs
  // ========================================

  /**
   * API CORE - APIs principais
   * Testa: criar diário, registrar teste, gerar alerta
   */
  api_core: false,

  /**
   * API RESPONSES - Testes de API (respostas)
   * Testa: endpoints públicos e autenticados
   */
  api_responses: true,

  // ========================================
  // BLOCO D - BANCO DE DADOS / RLS
  // ========================================

  /**
   * RLS CORE - Row Level Security
   * Testa: RLS impedindo acesso indevido
   */
  rls_core: false,

  // ========================================
  // BLOCO E - BILLING / STRIPE
  // ========================================

  /**
   * BILLING BÁSICO - Pagamentos básicos
   * Testa: planos exibidos, fluxo checkout, status assinatura
   */
  billing_basico: true,

  /**
   * BILLING - Pagamentos e assinaturas (completo)
   * Testa: checkout Stripe, planos, upgrade/downgrade
   */
  billing: false,

  // ========================================
  // BLOCO F - GERADOR SAAS / MULTIINSTÂNCIA
  // ========================================

  /**
   * SAAS GENERATOR - Gerador de SaaS filhos
   * Testa: criar projeto, GitHub API, download
   */
  saas_generator: false,

  /**
   * SAAS SMOKE - Smoke test de instâncias filhas
   * Testa: abrir / de cada instância enabled
   */
  saas_smoke: false,

  /**
   * GERADOR SAAS (alias) - Gerador de SaaS filhos
   */
  gerador_saas: false,

  // ========================================
  // OUTROS CENÁRIOS
  // ========================================

  /**
   * AUTH - Autenticação (login, cadastro, logout)
   * Testa: formulários, validações, redirecionamentos
   */
  auth: false,

  /**
   * PROFISSIONAL - Painel do profissional (alias)
   */
  profissional: false,

  /**
   * FANPAGE VIVA - Conteúdo dinâmico
   * Testa: admin conteúdos, blocos na frontpage
   */
  fanpage_viva: false,

  /**
   * ALERT CENTER - Centro de alertas
   * Testa: exibição de alertas, marcar como resolvido
   */
  alert_center: false,

  /**
   * NAVIGATION - Navegação geral
   * Testa: links, redirecionamentos, menu
   */
  navigation: true,

  /**
   * SEO - Meta tags e SEO
   * Testa: title, description, og tags, robots, sitemap
   */
  seo: true,

  /**
   * RESPONSIVIDADE - Layout responsivo
   * Testa: mobile, tablet, desktop
   */
  responsividade: true,
}

// ========================================
// HELPERS
// ========================================

/**
 * Verifica se um cenário deve ser executado
 * @param scenario Nome do cenário
 * @returns true se deve executar, false se deve pular
 */
export function shouldRunScenario(scenario: keyof typeof testScenarios): boolean {
  if (scenario === 'all') return testScenarios.all
  return testScenarios.all || testScenarios[scenario]
}

/**
 * Retorna mensagem de skip para o cenário
 * @param scenario Nome do cenário
 * @returns Mensagem explicativa
 */
export function getSkipMessage(scenario: keyof typeof testScenarios): string {
  return `Cenário "${scenario}" está desativado em test-scenarios.config.ts`
}

// ========================================
// TIPOS
// ========================================

export type TestScenario = keyof typeof testScenarios
