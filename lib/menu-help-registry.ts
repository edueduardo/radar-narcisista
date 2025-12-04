/**
 * MENU HELP REGISTRY - Sistema de Ajuda Embutida por Menu
 * 
 * Este módulo centraliza todos os textos de ajuda para cada menu do sistema,
 * permitindo que usuários de diferentes perfis tenham acesso a explicações
 * em linguagem simples sobre cada funcionalidade.
 * 
 * @see docs/MENU-HELP-ADMIN.md para documentação completa
 */

// ============================================================================
// TIPOS
// ============================================================================

export type MenuHelpAudience = 'admin' | 'usuaria' | 'profissional' | 'whitelabel' | 'gerador'

export interface MenuHelpBlock {
  id: string                          // Ex: 'admin-planos-promocoes'
  route: string                       // Ex: '/admin/planos'
  audience: MenuHelpAudience          // Público-alvo
  menuLabel: string                   // Rótulo do menu na UI
  
  titulo: string                      // Ex: "Planos e promoções"
  o_que_e: string                     // Explicação em linguagem de leigo
  para_que_serve: string              // Objetivo prático
  quando_usar: string                 // Situações típicas
  como_funciona: string               // Visão geral simples
  passo_a_passo: string[]             // Lista de passos
  exemplos: string[]                  // Exemplos concretos
  avisos: string[]                    // Alertas, riscos, limites
  ligacoes_com_outros_menus: string[] // Ex: "Relaciona com /admin/oraculo"
  ultima_atualizacao?: string         // ISO string de data
}

// ============================================================================
// HELP BLOCKS - ADMIN
// ============================================================================

export const adminMenuHelp: MenuHelpBlock[] = [
  {
    id: 'admin-oraculo',
    route: '/admin/oraculo',
    audience: 'admin',
    menuLabel: '🔮 Oráculo',
    titulo: 'Oráculo - Visão Executiva',
    o_que_e: 'O Oráculo é seu painel de controle principal. Ele mostra um resumo de tudo que está acontecendo no sistema: quantos usuários, quanto dinheiro, se há problemas.',
    para_que_serve: 'Ter uma visão rápida da saúde do seu negócio sem precisar abrir várias telas.',
    quando_usar: 'Abra o Oráculo todo dia de manhã para ver como está o sistema. Também use quando quiser uma visão geral rápida.',
    como_funciona: 'O Oráculo coleta dados de todas as partes do sistema e apresenta em cards e gráficos simples.',
    passo_a_passo: [
      'Acesse /admin/oraculo',
      'Veja os cards principais: usuários, receita, erros',
      'Clique em qualquer card para ver detalhes',
      'Use o botão "🔮 Perguntar ao Oráculo" para tirar dúvidas com IA'
    ],
    exemplos: [
      'Ver quantos usuários novos entraram hoje',
      'Verificar se houve erros no sistema',
      'Consultar a receita do mês'
    ],
    avisos: [
      'Os dados são atualizados a cada 5 minutos',
      'Alguns gráficos podem demorar a carregar se houver muitos dados'
    ],
    ligacoes_com_outros_menus: ['/admin/analytics', '/admin/custos-ia', '/admin/usuarios'],
    ultima_atualizacao: '2025-12-03'
  },
  {
    id: 'admin-ia-personas',
    route: '/admin/ia-personas',
    audience: 'admin',
    menuLabel: '🎭 IA Personas',
    titulo: 'Cockpit de IA e Personas',
    o_que_e: 'Aqui você controla os "avatares" das IAs que aparecem para os usuários. Em vez de mostrar "OpenAI" ou "Claude", os usuários veem nomes amigáveis como "Mentora Calma".',
    para_que_serve: 'Personalizar como as IAs aparecem para os usuários, sem expor os nomes técnicos dos provedores.',
    quando_usar: 'Quando quiser criar novas personas, mudar avatares, ou controlar quais IAs aparecem em cada parte do sistema.',
    como_funciona: 'Você cria "personas" (avatares) e liga cada uma a um provedor real (OpenAI, Claude, etc). Os usuários só veem as personas.',
    passo_a_passo: [
      'Acesse /admin/ia-personas',
      'Veja a lista de personas existentes',
      'Clique em uma persona para ver/editar detalhes',
      'Use "Bindings" para controlar onde cada persona aparece',
      'Veja estatísticas de uso na aba "Estatísticas"'
    ],
    exemplos: [
      'Criar uma persona "Conselheira Empática" usando Claude',
      'Desativar uma persona em determinado contexto',
      'Ver qual persona está sendo mais usada'
    ],
    avisos: [
      'Usuários NUNCA veem os nomes dos provedores reais',
      'Você pode ter várias personas usando o mesmo provedor'
    ],
    ligacoes_com_outros_menus: ['/admin/configurar-ias', '/admin/custos-ia', '/admin/ia-matrix'],
    ultima_atualizacao: '2025-12-03'
  },
  {
    id: 'admin-ia-matrix',
    route: '/admin/ia-matrix',
    audience: 'admin',
    menuLabel: '🧮 IA Matrix',
    titulo: 'Matrix de Configuração de IAs',
    o_que_e: 'Uma tabela que mostra todas as combinações de: plano + perfil + feature + provedor. Você vê exatamente qual IA atende qual situação.',
    para_que_serve: 'Controlar de forma granular quais IAs estão disponíveis para cada tipo de usuário e plano.',
    quando_usar: 'Quando precisar ajustar limites de uso de IA por plano, ou mudar qual provedor atende determinada feature.',
    como_funciona: 'A matrix cruza planos (free, pro, premium) com perfis (usuária, profissional) e features (chat, diário, etc).',
    passo_a_passo: [
      'Acesse /admin/ia-matrix',
      'Use os filtros para encontrar a combinação desejada',
      'Clique em uma célula para editar',
      'Ajuste limites diários/mensais',
      'Salve as alterações'
    ],
    exemplos: [
      'Aumentar limite de chat para plano premium',
      'Desativar IA no diário para plano free',
      'Trocar provedor do chat de OpenAI para Claude'
    ],
    avisos: [
      'Mudanças são aplicadas imediatamente',
      'Cuidado ao desativar features - usuários perdem acesso na hora'
    ],
    ligacoes_com_outros_menus: ['/admin/ia-personas', '/admin/planos', '/admin/custos-ia'],
    ultima_atualizacao: '2025-12-03'
  },
  {
    id: 'admin-planos',
    route: '/admin/planos',
    audience: 'admin',
    menuLabel: '💳 Planos',
    titulo: 'Gerenciamento de Planos',
    o_que_e: 'Aqui você cria e edita os planos de assinatura do sistema: Free, Profissional, Defesa, White Label.',
    para_que_serve: 'Definir preços, features incluídas e limites de cada plano.',
    quando_usar: 'Quando quiser criar um novo plano, ajustar preços, ou criar promoções.',
    como_funciona: 'Cada plano tem um "profile" de features associado. Você define quais features estão inclusas e com quais limites.',
    passo_a_passo: [
      'Acesse /admin/planos',
      'Veja a lista de planos existentes',
      'Clique em um plano para editar',
      'Ajuste preço, features e limites',
      'Para promoções, crie um novo profile com data de validade'
    ],
    exemplos: [
      'Criar promoção Black Friday com 50% de desconto',
      'Adicionar nova feature ao plano Premium',
      'Ajustar limite de mensagens do plano Free'
    ],
    avisos: [
      'Mudanças de preço não afetam assinaturas existentes',
      'Promoções precisam ter data de início e fim'
    ],
    ligacoes_com_outros_menus: ['/admin/ia-matrix', '/admin/usuarios', '/admin/stripe'],
    ultima_atualizacao: '2025-12-03'
  },
  {
    id: 'admin-usuarios',
    route: '/admin/usuarios',
    audience: 'admin',
    menuLabel: '👥 Usuários',
    titulo: 'Gerenciamento de Usuários',
    o_que_e: 'Lista de todos os usuários do sistema com suas informações: email, plano, data de cadastro, último acesso.',
    para_que_serve: 'Gerenciar usuários, ver detalhes, aplicar overrides de features, ou resolver problemas.',
    quando_usar: 'Quando precisar encontrar um usuário específico, dar acesso especial, ou investigar um problema.',
    como_funciona: 'Você pode buscar por email, filtrar por plano, e clicar em um usuário para ver todos os detalhes.',
    passo_a_passo: [
      'Acesse /admin/usuarios',
      'Use a busca para encontrar um usuário',
      'Clique no usuário para ver detalhes',
      'Use "Overrides" para dar/remover features especiais',
      'Use "Impersonar" para ver o sistema como aquele usuário'
    ],
    exemplos: [
      'Dar acesso premium temporário para um usuário',
      'Ver histórico de uso de um usuário',
      'Resetar limites de um usuário'
    ],
    avisos: [
      'Impersonar um usuário registra log de auditoria',
      'Overrides têm prioridade sobre o plano'
    ],
    ligacoes_com_outros_menus: ['/admin/planos', '/admin/oraculo', '/admin/logs'],
    ultima_atualizacao: '2025-12-03'
  },
  {
    id: 'admin-custos-ia',
    route: '/admin/custos-ia',
    audience: 'admin',
    menuLabel: '💰 Custos IA',
    titulo: 'Monitoramento de Custos de IA',
    o_que_e: 'Painel que mostra quanto você está gastando com cada provedor de IA (OpenAI, Claude, etc).',
    para_que_serve: 'Controlar gastos, identificar features que consomem mais, e otimizar custos.',
    quando_usar: 'Verifique semanalmente para garantir que os custos estão dentro do esperado.',
    como_funciona: 'O sistema registra cada chamada de IA com tokens usados e calcula o custo estimado.',
    passo_a_passo: [
      'Acesse /admin/custos-ia',
      'Veja o gráfico de custos por período',
      'Filtre por provedor ou feature',
      'Identifique picos de uso',
      'Ajuste limites se necessário'
    ],
    exemplos: [
      'Ver quanto gastou com OpenAI este mês',
      'Identificar qual feature consome mais tokens',
      'Comparar custos entre provedores'
    ],
    avisos: [
      'Custos são estimativas baseadas em preços públicos',
      'Picos podem indicar uso abusivo ou bug'
    ],
    ligacoes_com_outros_menus: ['/admin/ia-matrix', '/admin/ia-personas', '/admin/oraculo'],
    ultima_atualizacao: '2025-12-03'
  },
  {
    id: 'admin-configurar-ias',
    route: '/admin/configurar-ias',
    audience: 'admin',
    menuLabel: '🔧 Configurar IAs',
    titulo: 'Configuração de API Keys',
    o_que_e: 'Onde você cadastra as chaves de API dos provedores de IA (OpenAI, Anthropic, etc).',
    para_que_serve: 'Conectar o sistema aos provedores de IA que você contratou.',
    quando_usar: 'Na configuração inicial, ou quando precisar trocar/adicionar uma chave.',
    como_funciona: 'Você cola a chave de API e o sistema testa a conexão automaticamente.',
    passo_a_passo: [
      'Acesse /admin/configurar-ias',
      'Selecione o provedor',
      'Cole a API key',
      'Clique em "Testar conexão"',
      'Se OK, clique em "Salvar"'
    ],
    exemplos: [
      'Cadastrar chave da OpenAI',
      'Trocar chave do Claude',
      'Adicionar novo provedor'
    ],
    avisos: [
      'NUNCA compartilhe suas API keys',
      'Chaves são armazenadas de forma segura (criptografadas)',
      'Se uma chave parar de funcionar, verifique o saldo no provedor'
    ],
    ligacoes_com_outros_menus: ['/admin/ia-personas', '/admin/custos-ia'],
    ultima_atualizacao: '2025-12-03'
  },
  {
    id: 'admin-gerador-saas',
    route: '/admin/gerador-saas',
    audience: 'admin',
    menuLabel: '🏭 Gerador SaaS',
    titulo: 'Gerador de SaaS',
    o_que_e: 'Ferramenta para criar novos projetos SaaS baseados no Radar. Você pode criar versões temáticas ou white label.',
    para_que_serve: 'Expandir seu negócio criando novos produtos a partir do código base.',
    quando_usar: 'Quando quiser criar um novo SaaS para outro nicho ou vender como white label.',
    como_funciona: 'O gerador copia o código base, aplica personalizações, e cria um novo projeto independente.',
    passo_a_passo: [
      'Acesse /admin/gerador-saas',
      'Clique em "Novo Projeto"',
      'Escolha o tipo: Temático ou Core Branco',
      'Preencha nome, descrição e configurações',
      'Clique em "Gerar Projeto"',
      'Aguarde a criação (pode demorar alguns minutos)'
    ],
    exemplos: [
      'Criar "Radar Co-Parent" para pais separados',
      'Criar white label para uma clínica',
      'Criar versão para igrejas'
    ],
    avisos: [
      'Projetos gerados são INDEPENDENTES - você precisa hospedar separadamente',
      'Cada projeto tem seu próprio banco de dados'
    ],
    ligacoes_com_outros_menus: ['/admin/control-tower', '/admin/planos'],
    ultima_atualizacao: '2025-12-03'
  },
  {
    id: 'admin-analytics',
    route: '/admin/analytics',
    audience: 'admin',
    menuLabel: '📊 Analytics',
    titulo: 'Analytics e Métricas',
    o_que_e: 'Painel de análise de dados do sistema: eventos, funis de conversão, comportamento de usuários.',
    para_que_serve: 'Entender como os usuários usam o sistema e identificar oportunidades de melhoria.',
    quando_usar: 'Semanalmente para acompanhar métricas, ou quando quiser investigar algo específico.',
    como_funciona: 'O sistema registra eventos (page views, cliques, ações) e você pode analisar padrões.',
    passo_a_passo: [
      'Acesse /admin/analytics',
      'Escolha o período de análise',
      'Veja os gráficos principais',
      'Use filtros para segmentar',
      'Exporte dados se necessário'
    ],
    exemplos: [
      'Ver taxa de conversão do teste de clareza',
      'Identificar onde usuários abandonam',
      'Comparar uso entre planos'
    ],
    avisos: [
      'Dados são agregados - não identificam usuários individuais',
      'Alguns eventos podem ter delay de até 1 hora'
    ],
    ligacoes_com_outros_menus: ['/admin/oraculo', '/admin/usuarios'],
    ultima_atualizacao: '2025-12-03'
  }
]

// ============================================================================
// HELP BLOCKS - USUÁRIA
// ============================================================================

export const usuariaMenuHelp: MenuHelpBlock[] = [
  {
    id: 'usuaria-dashboard',
    route: '/dashboard',
    audience: 'usuaria',
    menuLabel: '🏠 Início',
    titulo: 'Seu Painel Principal',
    o_que_e: 'Esta é sua página inicial. Aqui você vê um resumo da sua jornada: seu progresso, alertas importantes, e atalhos para as principais ferramentas.',
    para_que_serve: 'Ter uma visão geral do seu progresso e acessar rapidamente o que você precisa.',
    quando_usar: 'Sempre que entrar no sistema, comece por aqui para ver o que há de novo.',
    como_funciona: 'O painel mostra cards com informações importantes e links para as ferramentas.',
    passo_a_passo: [
      'Veja os cards de resumo no topo',
      'Confira se há alertas ou recomendações',
      'Clique nos atalhos para acessar as ferramentas',
      'Role para baixo para ver seu histórico recente'
    ],
    exemplos: [
      'Ver quantas entradas você fez no diário esta semana',
      'Acessar rapidamente o chat',
      'Ver se há novas conquistas'
    ],
    avisos: [
      'Se aparecer um alerta vermelho, leia com atenção - pode ser importante para sua segurança'
    ],
    ligacoes_com_outros_menus: ['/diario', '/chat', '/teste-clareza'],
    ultima_atualizacao: '2025-12-03'
  },
  {
    id: 'usuaria-diario',
    route: '/diario',
    audience: 'usuaria',
    menuLabel: '📔 Diário',
    titulo: 'Diário de Episódios',
    o_que_e: 'Um espaço seguro para registrar o que acontece no seu dia a dia. Você pode escrever sobre situações, sentimentos, e reflexões.',
    para_que_serve: 'Documentar sua jornada, identificar padrões, e ter um registro para você mesma.',
    quando_usar: 'Sempre que algo acontecer que você queira lembrar ou processar.',
    como_funciona: 'Você escreve uma entrada, pode adicionar tags e intensidade emocional. A IA pode ajudar a analisar.',
    passo_a_passo: [
      'Clique em "Nova Entrada"',
      'Escreva o que aconteceu',
      'Adicione tags se quiser (ex: "trabalho", "família")',
      'Marque a intensidade emocional',
      'Salve a entrada'
    ],
    exemplos: [
      'Registrar uma discussão que te deixou confusa',
      'Anotar um momento em que você se sentiu forte',
      'Documentar algo que alguém disse'
    ],
    avisos: [
      'Suas entradas são privadas - só você pode ver',
      'Se precisar de ajuda profissional, procure um psicólogo'
    ],
    ligacoes_com_outros_menus: ['/diario/timeline', '/chat', '/dashboard'],
    ultima_atualizacao: '2025-12-03'
  },
  {
    id: 'usuaria-chat',
    route: '/chat',
    audience: 'usuaria',
    menuLabel: '💬 Chat',
    titulo: 'Conversa com a IA',
    o_que_e: 'Um chat onde você pode conversar com uma assistente de IA treinada para te ajudar a ganhar clareza sobre suas situações.',
    para_que_serve: 'Ter alguém para conversar, organizar pensamentos, e receber perspectivas diferentes.',
    quando_usar: 'Quando precisar desabafar, organizar ideias, ou quiser uma opinião sobre algo.',
    como_funciona: 'Você escreve mensagens e a IA responde. Ela lembra do contexto da conversa.',
    passo_a_passo: [
      'Digite sua mensagem na caixa de texto',
      'Pressione Enter ou clique em Enviar',
      'Leia a resposta da IA',
      'Continue a conversa naturalmente',
      'Ao final, você pode salvar um resumo no diário'
    ],
    exemplos: [
      'Contar sobre uma situação e pedir opinião',
      'Pedir ajuda para organizar pensamentos',
      'Perguntar sobre padrões que você notou'
    ],
    avisos: [
      'A IA não substitui um profissional de saúde mental',
      'Se estiver em perigo, procure ajuda profissional imediatamente',
      'Suas conversas são privadas'
    ],
    ligacoes_com_outros_menus: ['/diario', '/teste-clareza', '/plano-seguranca'],
    ultima_atualizacao: '2025-12-03'
  },
  {
    id: 'usuaria-teste-clareza',
    route: '/teste-clareza',
    audience: 'usuaria',
    menuLabel: '🎯 Teste de Clareza',
    titulo: 'Teste de Clareza',
    o_que_e: 'Um questionário que ajuda você a entender melhor sua situação atual. Ele avalia diferentes aspectos como confusão mental, medo e limites.',
    para_que_serve: 'Ter uma visão mais clara de onde você está e identificar áreas que precisam de atenção.',
    quando_usar: 'Faça o teste quando entrar no sistema pela primeira vez, e repita de tempos em tempos para ver sua evolução.',
    como_funciona: 'Você responde 18 perguntas de múltipla escolha. No final, vê um resultado com explicações.',
    passo_a_passo: [
      'Clique em "Começar Teste"',
      'Responda cada pergunta com honestidade',
      'Não pense demais - vá com sua primeira impressão',
      'Ao final, veja seu resultado',
      'Você pode salvar o resultado como "base do seu Radar"'
    ],
    exemplos: [
      'Fazer o teste para entender sua situação atual',
      'Refazer após alguns meses para ver evolução',
      'Usar o resultado para guiar conversas no chat'
    ],
    avisos: [
      'Não existe resposta certa ou errada',
      'O teste não é um diagnóstico médico',
      'Se o resultado indicar risco, procure ajuda profissional'
    ],
    ligacoes_com_outros_menus: ['/dashboard', '/chat', '/plano-seguranca'],
    ultima_atualizacao: '2025-12-03'
  },
  {
    id: 'usuaria-plano-seguranca',
    route: '/plano-seguranca',
    audience: 'usuaria',
    menuLabel: '🛡️ Plano de Segurança',
    titulo: 'Plano de Segurança',
    o_que_e: 'Um espaço para você organizar informações importantes para sua segurança: contatos de emergência, documentos, e um plano de ação.',
    para_que_serve: 'Estar preparada caso precise agir rapidamente em uma situação de risco.',
    quando_usar: 'Preencha com calma quando estiver em um momento seguro. Revise periodicamente.',
    como_funciona: 'Você preenche informações como contatos de confiança, onde estão documentos importantes, e passos a seguir em emergência.',
    passo_a_passo: [
      'Acesse o Plano de Segurança',
      'Preencha seus contatos de emergência',
      'Anote onde estão documentos importantes',
      'Defina um plano de ação para emergências',
      'Revise e atualize periodicamente'
    ],
    exemplos: [
      'Listar 3 pessoas de confiança com telefone',
      'Anotar onde está sua documentação',
      'Definir um lugar seguro para ir se precisar'
    ],
    avisos: [
      'Mantenha essas informações atualizadas',
      'Se estiver em perigo imediato, ligue 190 (polícia) ou 180 (Central da Mulher)'
    ],
    ligacoes_com_outros_menus: ['/dashboard', '/chat'],
    ultima_atualizacao: '2025-12-03'
  }
]

// ============================================================================
// HELP BLOCKS - PROFISSIONAL
// ============================================================================

export const profissionalMenuHelp: MenuHelpBlock[] = [
  {
    id: 'profissional-dashboard',
    route: '/dashboard-profissional',
    audience: 'profissional',
    menuLabel: '🏠 Painel Profissional',
    titulo: 'Painel do Profissional',
    o_que_e: 'Seu painel de controle como profissional. Aqui você vê seus clientes, relatórios, e ferramentas específicas para seu trabalho.',
    para_que_serve: 'Gerenciar seus clientes e acessar ferramentas profissionais.',
    quando_usar: 'Sempre que entrar no sistema como profissional.',
    como_funciona: 'O painel mostra seus clientes vinculados, relatórios pendentes, e atalhos para ferramentas.',
    passo_a_passo: [
      'Veja a lista de clientes vinculados',
      'Clique em um cliente para ver detalhes',
      'Acesse relatórios e ferramentas no menu lateral',
      'Use o Oráculo Profissional para dúvidas'
    ],
    exemplos: [
      'Ver o progresso de um cliente',
      'Gerar relatório para processo judicial',
      'Consultar o Oráculo sobre um caso'
    ],
    avisos: [
      'Respeite a privacidade dos clientes',
      'Relatórios são ferramentas de apoio, não substituem sua avaliação profissional'
    ],
    ligacoes_com_outros_menus: ['/profissional/clientes', '/profissional/relatorios'],
    ultima_atualizacao: '2025-12-03'
  }
]

// ============================================================================
// HELP BLOCKS - WHITE LABEL
// ============================================================================

export const whitelabelMenuHelp: MenuHelpBlock[] = [
  {
    id: 'whitelabel-dashboard',
    route: '/admin',
    audience: 'whitelabel',
    menuLabel: '🏠 Painel White Label',
    titulo: 'Painel do Dono da Instância',
    o_que_e: 'Seu painel de administração da instância white label. Você pode personalizar a aparência, gerenciar usuários, e ver métricas.',
    para_que_serve: 'Administrar sua instância personalizada do sistema.',
    quando_usar: 'Para gerenciar sua instância e seus usuários.',
    como_funciona: 'Você tem acesso a um subconjunto das ferramentas de admin, limitado ao que foi contratado.',
    passo_a_passo: [
      'Acesse o painel de admin',
      'Personalize cores e logo',
      'Gerencie seus usuários',
      'Veja métricas de uso'
    ],
    exemplos: [
      'Trocar o logo da sua instância',
      'Ver quantos usuários você tem',
      'Ajustar limites de planos'
    ],
    avisos: [
      'Algumas configurações são definidas pelo admin principal',
      'Limites de uso são definidos no seu contrato'
    ],
    ligacoes_com_outros_menus: ['/admin/usuarios', '/admin/personalizacao'],
    ultima_atualizacao: '2025-12-03'
  }
]

// ============================================================================
// HELP BLOCKS - GERADOR
// ============================================================================

export const geradorMenuHelp: MenuHelpBlock[] = [
  {
    id: 'gerador-dashboard',
    route: '/admin/gerador-saas',
    audience: 'gerador',
    menuLabel: '🏭 Gerador de SaaS',
    titulo: 'Painel do Gerador de SaaS',
    o_que_e: 'Ferramenta para criar novos projetos SaaS baseados no Radar.',
    para_que_serve: 'Criar novos produtos para diferentes nichos ou white labels.',
    quando_usar: 'Quando quiser expandir seu portfólio de produtos.',
    como_funciona: 'O gerador copia o código base e aplica personalizações.',
    passo_a_passo: [
      'Acesse o Gerador de SaaS',
      'Escolha o tipo de projeto',
      'Preencha as configurações',
      'Gere o projeto',
      'Configure o novo projeto separadamente'
    ],
    exemplos: [
      'Criar versão para clínicas',
      'Criar white label para parceiro',
      'Criar versão temática'
    ],
    avisos: [
      'Cada projeto gerado é independente',
      'Você precisa hospedar e manter cada projeto separadamente'
    ],
    ligacoes_com_outros_menus: ['/admin/control-tower'],
    ultima_atualizacao: '2025-12-03'
  }
]

// ============================================================================
// FUNÇÕES DE BUSCA
// ============================================================================

/**
 * Busca o help de um menu específico
 */
export function getMenuHelp(audience: MenuHelpAudience, route: string): MenuHelpBlock | null {
  const registries: Record<MenuHelpAudience, MenuHelpBlock[]> = {
    admin: adminMenuHelp,
    usuaria: usuariaMenuHelp,
    profissional: profissionalMenuHelp,
    whitelabel: whitelabelMenuHelp,
    gerador: geradorMenuHelp
  }
  
  const registry = registries[audience]
  if (!registry) return null
  
  return registry.find(block => block.route === route) || null
}

/**
 * Busca todos os helps de um audience
 */
export function getAllMenuHelps(audience: MenuHelpAudience): MenuHelpBlock[] {
  const registries: Record<MenuHelpAudience, MenuHelpBlock[]> = {
    admin: adminMenuHelp,
    usuaria: usuariaMenuHelp,
    profissional: profissionalMenuHelp,
    whitelabel: whitelabelMenuHelp,
    gerador: geradorMenuHelp
  }
  
  return registries[audience] || []
}

/**
 * Busca help por ID
 */
export function getMenuHelpById(id: string): MenuHelpBlock | null {
  const allHelps = [
    ...adminMenuHelp,
    ...usuariaMenuHelp,
    ...profissionalMenuHelp,
    ...whitelabelMenuHelp,
    ...geradorMenuHelp
  ]
  
  return allHelps.find(block => block.id === id) || null
}

/**
 * Verifica se um menu tem help disponível
 */
export function hasMenuHelp(audience: MenuHelpAudience, route: string): boolean {
  return getMenuHelp(audience, route) !== null
}

/**
 * Busca help por rota em todos os audiences (para uso no AdminSidebar)
 */
export function getHelpForRoute(route: string): MenuHelpBlock | null {
  const allHelps = [
    ...adminMenuHelp,
    ...usuariaMenuHelp,
    ...profissionalMenuHelp,
    ...whitelabelMenuHelp,
    ...geradorMenuHelp
  ]
  
  return allHelps.find(block => block.route === route) || null
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

const MenuHelpRegistry = {
  getMenuHelp,
  getAllMenuHelps,
  getMenuHelpById,
  hasMenuHelp,
  getHelpForRoute,
  adminMenuHelp,
  usuariaMenuHelp,
  profissionalMenuHelp,
  whitelabelMenuHelp,
  geradorMenuHelp
}

export default MenuHelpRegistry
