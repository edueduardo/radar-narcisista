// SISTEMA DE MEMÓRIA CONTEXTUAL AUTOMÁTICA
// Verifica automaticamente se ideias já foram mencionadas pelo usuário

interface ContextMemory {
  id: string
  topic: string
  description: string
  mentioned_at: string
  implemented: boolean
  where_implemented: string[]
  keywords: string[]
}

// 🧠 MEMÓRIA DAS IDEIAS DO USUÁRIO
export const USER_CONTEXT_MEMORY: ContextMemory[] = [
  {
    id: 'admin-ias-001',
    topic: 'Sistema Administrativo de IAs',
    description: 'Controle total do administrador sobre quais IAs usar em cada etapa, com ligar/desligar funcionalidades',
    mentioned_at: 'Prompt inicial e atualizações',
    implemented: true,
    where_implemented: ['lib/ia-admin.ts', 'app/diario/novo/page.tsx'],
    keywords: ['administrador', 'controle', 'ligar', 'desligar', 'etapas', 'ias', 'configurar']
  },
  {
    id: 'grafico-importancia-002', 
    topic: 'Gráfico de Importância das Etapas',
    description: 'Gráfico visual mostrando importância de cada etapa (análise 95%, votação 70%, consenso 85%, transparência 40%)',
    mentioned_at: 'Prompt original sobre controle administrativo',
    implemented: true,
    where_implemented: ['app/diario/novo/page.tsx - Painel Administrativo'],
    keywords: ['gráfico', 'importância', 'etapas', 'visual', 'porcentagem']
  },
  {
    id: 'analise-colaborativa-003',
    topic: 'Análise Colaborativa com Múltiplas IAs',
    description: 'Múltiplas IAs analisando juntas, não em fallback, mas em colaboração real',
    mentioned_at: 'Desde o primeiro prompt sobre sistema de IAs',
    implemented: true,
    where_implemented: ['lib/ia-admin.ts - analiseColaborativaAdmin'],
    keywords: ['colaborativa', 'múltiplas', 'juntas', 'consenso', 'votação']
  },
  {
    id: 'relatorios-admin-004',
    topic: 'Relatórios do Administrador',
    description: 'Relatórios pontuais por pessoas, global do sistema, análise jurídica, detecção de veracidade',
    mentioned_at: 'Prompt sobre visão administrativa completa',
    implemented: true,
    where_implemented: ['lib/ia-admin.ts - funções de relatório'],
    keywords: ['relatório', 'pontual', 'global', 'jurídica', 'veracidade', 'admin']
  },
  {
    id: 'problemas-juridicos-005',
    topic: 'Análise de Problemas Jurídicos',
    description: 'Detecção automática de riscos jurídicos nas análises',
    mentioned_at: 'Prompt sobre cuidado com aspectos legais',
    implemented: true,
    where_implemented: ['lib/ia-admin.ts - analisarRiscosJuridicos'],
    keywords: ['jurídico', 'legal', 'risco', 'problema', 'lei']
  },
  {
    id: 'detecao-veracidade-006',
    topic: 'Detecção de Veracidade',
    description: 'Análise de possíveis mentiras ou inconsistências no contexto',
    mentioned_at: 'Prompt sobre análise completa e cuidadosa',
    implemented: true,
    where_implemented: ['lib/ia-admin.ts - detectarVeracidade'],
    keywords: ['veracidade', 'mentira', 'inconsistência', 'verdade', 'contexto']
  },
  {
    id: 'flexibilidade-total-007',
    topic: 'Flexibilidade Total de Configuração',
    description: 'Administrador pode determinar exatamente quantas e quais IAs em cada etapa',
    mentioned_at: 'Prompt sobre controle total do sistema',
    implemented: true,
    where_implemented: ['lib/ia-admin.ts - ADMIN_CONFIG'],
    keywords: ['flexibilidade', 'configuração', 'determinar', 'quantas', 'quais']
  },
  {
    id: 'chat-administrativo-008',
    topic: 'Sistema Administrativo do Chat',
    description: 'Tela administrativa separada para chat com controle de IAs, voz, transcrição para uso crítico (banheiro)',
    mentioned_at: 'Prompt sobre chat crítico e desabafo',
    implemented: true,
    where_implemented: ['app/admin/chat/page.tsx'],
    keywords: ['chat', 'administrativo', 'tela', 'separada', 'voz', 'transcrição', 'banheiro', 'crítico']
  },
  {
    id: 'chat-colaborativo-009',
    topic: 'Análise Colaborativa no Chat',
    description: 'Mesmo sistema de 10 IAs colaborativas aplicado ao chat para respostas mais seguras',
    mentioned_at: 'Prompt sobre extensão do sistema para chat',
    implemented: true,
    where_implemented: ['lib/chat-colaborativo.ts', 'app/chat/page.tsx'],
    keywords: ['chat', 'colaborativo', 'ias', 'resposta', 'segura', 'sistema']
  },
  {
    id: 'chat-voz-transcricao-010',
    topic: 'Voz e Transcrição no Chat',
    description: 'Implementar voz e transcrição no chat para situações onde pessoa não pode falar (banheiro)',
    mentioned_at: 'Prompt sobre acessibilidade e privacidade',
    implemented: true,
    where_implemented: ['app/chat/page.tsx - Microphone component integrado'],
    keywords: ['chat', 'voz', 'transcrição', 'banheiro', 'escrever', 'falar', 'privacidade']
  },
  {
    id: 'env-backup-automatico-011',
    topic: 'Sistema de Backup Automático do .env.local',
    description: 'Sistema de backup e recuperação automática para .env.local corrompido com múltiplos níveis de segurança',
    mentioned_at: 'Prompt sobre problema recorrente de corrupção',
    implemented: true,
    where_implemented: ['lib/env-backup.ts', 'scripts/check-env.js', 'package.json'],
    keywords: ['backup', 'automatico', 'env', 'corrompido', 'recuperacao', 'seguranca']
  }
]

// 🎯 FUNÇÃO AUTOMÁTICA DE VERIFICAÇÃO DE MEMÓRIA
export function verificarMemoriaContextual(ideiaAtual: string): {
  jaExiste: boolean
  memoriaEncontrada?: ContextMemory
  mensagem: string
} {
  // Extrair keywords da ideia atual
  const keywordsAtuais = ideiaAtual.toLowerCase()
    .split(/[ ,\.\?]+/)
    .filter(word => word.length > 3)
  
  // Procurar na memória
  for (const memoria of USER_CONTEXT_MEMORY) {
    const matchKeywords = memoria.keywords.some(keyword => 
      keywordsAtuais.includes(keyword.toLowerCase())
    )
    
    const matchDescricao = memoria.keywords.some(keyword =>
      ideiaAtual.toLowerCase().includes(keyword.toLowerCase())
    )
    
    if (matchKeywords || matchDescricao) {
      return {
        jaExiste: true,
        memoriaEncontrada: memoria,
        mensagem: gerarMensagemMemoria(memoria)
      }
    }
  }
  
  return {
    jaExiste: false,
    mensagem: '💡 Nova ideia detectada! Adicionando ao contexto...'
  }
}

// 📝 GERAR MENSAGEM AUTOMÁTICA
function gerarMensagemMemoria(memoria: ContextMemory): string {
  const status = memoria.implemented ? '✅ JÁ IMPLEMENTADO' : '🔄 PENDENTE'
  
  return `
${status} - Esta ideia já está no seu contexto!

🎯 **TÓPICO:** ${memoria.topic}
📝 **DESCRIÇÃO:** ${memoria.description}
📅 **MENCIONADO EM:** ${memoria.mentioned_at}
📍 **IMPLEMENTADO EM:** ${memoria.where_implemented.join(', ')}

🔍 **CONEXÃO:** Esta ideia que você mencionou já foi discutida anteriormente e está implementada no sistema!

💡 **PRÓXIMO PASSO:** Quer revisar a implementação existente ou adicionar melhorias?
  `.trim()
}

// 🆕 ADICIONAR NOVA IDEIA À MEMÓRIA
export function adicionarIdeiaMemoria(
  topic: string, 
  description: string, 
  keywords: string[]
): void {
  const novaMemoria: ContextMemory = {
    id: `user-idea-${Date.now()}`,
    topic,
    description,
    mentioned_at: new Date().toISOString(),
    implemented: false,
    where_implemented: [],
    keywords
  }
  
  USER_CONTEXT_MEMORY.push(novaMemoria)
  console.log('💡 Nova ideia adicionada à memória:', topic)
}

// 📊 LISTAR TODAS AS IDEIAS DA MEMÓRIA
export function listarMemoriaContextual(): ContextMemory[] {
  return USER_CONTEXT_MEMORY.sort((a, b) => 
    a.implemented === b.implemented ? 0 : a.implemented ? 1 : -1
  )
}

// 🎯 FUNÇÃO PARA USAR AUTOMATICAMENTE NAS RESPOSTAS
export function respostaComMemoriaContextual(ideia: string, respostaNormal: string): string {
  const verificacao = verificarMemoriaContextual(ideia)
  
  if (verificacao.jaExiste) {
    return `${verificacao.mensagem}\n\n---\n\n${respostaNormal}`
  }
  
  return respostaNormal
}
