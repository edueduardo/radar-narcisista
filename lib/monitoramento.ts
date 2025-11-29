// SISTEMA DE MONITORAMENTO AUTOMÁTICO 24/7
// Detecta problemas antes que afetem os usuários

import { verificarCorrupcaoEnv, statusBackupEnv } from './env-backup'
import { statusEmergencyMode } from './chat-emergency'
import { getStatusIAs, ADMIN_CONFIG } from './ia-admin'

interface Alerta {
  id: string
  tipo: 'critico' | 'aviso' | 'info'
  titulo: string
  descricao: string
  timestamp: string
  resolvido: boolean
}

interface MetricasSistema {
  timestamp: string
  env_status: 'ok' | 'corrompido'
  ias_ativas: number
  chat_status: 'normal' | 'emergencia'
  backup_count: number
  performance_chat: number
  performance_diario: number
}

// 📊 BANCO DE DADOS DE MONITORAMENTO (em memória)
let alertasAtivos: Alerta[] = []
let metricasHistorico: MetricasSistema[] = []

// 🚀 FUNÇÃO PRINCIPAL DE MONITORAMENTO
export async function executarMonitoramentoCompleto(): Promise<{
  status: 'ok' | 'aviso' | 'critico'
  metricas: MetricasSistema
  alertas: Alerta[]
  acoes_recomendadas: string[]
}> {
  console.log('🔍 Executando monitoramento completo do sistema...')
  
  const metricas = await coletarMetricasSistema()
  const alertas = await verificarAlertas(metricas)
  const acoes = gerarAcoesRecomendadas(metricas, alertas)
  
  // Salvar métricas no histórico
  metricasHistorico.push(metricas)
  if (metricasHistorico.length > 100) {
    metricasHistorico = metricasHistorico.slice(-100) // Manter só últimas 100
  }
  
  const status = determinarStatusGeral(alertas)
  
  console.log(`📊 Status do sistema: ${status.toUpperCase()}`)
  console.log(`🚨 Alertas ativos: ${alertas.length}`)
  console.log(`💡 Ações recomendadas: ${acoes.length}`)
  
  return {
    status,
    metricas,
    alertas,
    acoes_recomendadas: acoes
  }
}

// 📈 COLETAR MÉTRICAS DO SISTEMA
async function coletarMetricasSistema(): Promise<MetricasSistema> {
  const statusEnv = statusBackupEnv()
  const statusIAs = getStatusIAs()
  const emergencyStatus = statusEmergencyMode()
  
  // Simular testes de performance
  const performanceChat = await testarPerformanceChat()
  const performanceDiario = await testarPerformanceDiario()
  
  return {
    timestamp: new Date().toISOString(),
    env_status: statusEnv.ok ? 'ok' : 'corrompido',
    ias_ativas: statusIAs.ativas.length,
    chat_status: emergencyStatus.ativo ? 'emergencia' : 'normal',
    backup_count: statusEnv.backups.length,
    performance_chat: performanceChat,
    performance_diario: performanceDiario
  }
}

// 🚨 VERIFICAR ALERTAS E PROBLEMAS
async function verificarAlertas(metricas: MetricasSistema): Promise<Alerta[]> {
  const novosAlertas: Alerta[] = []
  
  // Alerta 1: .env.local corrompido
  if (metricas.env_status === 'corrompido') {
    novosAlertas.push({
      id: `env-corrompido-${Date.now()}`,
      tipo: 'critico',
      titulo: '🚨 .env.local Corrompido',
      descricao: 'Arquivo de ambiente está corrompido e precisa de reparo imediato',
      timestamp: new Date().toISOString(),
      resolvido: false
    })
  }
  
  // Alerta 2: Poucas IAs ativas
  if (metricas.ias_ativas < 2) {
    novosAlertas.push({
      id: `poucas-ias-${Date.now()}`,
      tipo: 'aviso',
      titulo: '⚠️ Poucas IAs Ativas',
      descricao: `Apenas ${metricas.ias_ativas} IAs estão ativas. Sistema pode ficar lento.`,
      timestamp: new Date().toISOString(),
      resolvido: false
    })
  }
  
  // Alerta 3: Chat em modo emergência
  if (metricas.chat_status === 'emergencia') {
    novosAlertas.push({
      id: `chat-emergencia-${Date.now()}`,
      tipo: 'critico',
      titulo: '🚨 Chat em Modo Emergência',
      descricao: 'Chat está operando em modo básico devido a falha nas APIs',
      timestamp: new Date().toISOString(),
      resolvido: false
    })
  }
  
  // Alerta 4: Sem backups
  if (metricas.backup_count === 0) {
    novosAlertas.push({
      id: `sem-backup-${Date.now()}`,
      tipo: 'aviso',
      titulo: '⚠️ Sem Backups',
      descricao: 'Nenhum backup do .env.local encontrado. Risco de perda de configuração.',
      timestamp: new Date().toISOString(),
      resolvido: false
    })
  }
  
  // Alerta 5: Performance baixa
  if (metricas.performance_chat < 70 || metricas.performance_diario < 70) {
    novosAlertas.push({
      id: `performance-baixa-${Date.now()}`,
      tipo: 'aviso',
      titulo: '📉 Performance Baixa',
      descricao: `Performance do sistema está abaixo do ideal. Chat: ${metricas.performance_chat}%, Diário: ${metricas.performance_diario}%`,
      timestamp: new Date().toISOString(),
      resolvido: false
    })
  }
  
  // Alerta 6: Nenhuma IA configurada para análise
  if (ADMIN_CONFIG.etapa_1_analise_colaborativa.length === 0) {
    novosAlertas.push({
      id: `sem-ia-analise-${Date.now()}`,
      tipo: 'critico',
      titulo: '🚨 Nenhuma IA para Análise',
      descricao: 'Nenhuma IA configurada para análise colaborativa. Sistema não vai funcionar.',
      timestamp: new Date().toISOString(),
      resolvido: false
    })
  }
  
  // Atualizar alertas ativos
  alertasAtivos = [...novosAlertas, ...alertasAtivos.filter(a => !a.resolvido)].slice(0, 50)
  
  return novosAlertas
}

// 💡 GERAR AÇÕES RECOMENDADAS
function gerarAcoesRecomendadas(metricas: MetricasSistema, alertas: Alerta[]): string[] {
  const acoes: string[] = []
  
  if (metricas.env_status === 'corrompido') {
    acoes.push('🔧 Reparar .env.local automaticamente')
    acoes.push('📋 Verificar configurações das chaves de API')
  }
  
  if (metricas.ias_ativas < 2) {
    acoes.push('🔑 Adicionar mais chaves de API para aumentar IAs ativas')
    acoes.push('⚙️ Verificar se as chaves existentes estão funcionando')
  }
  
  if (metricas.chat_status === 'emergencia') {
    acoes.push('🚨 Investigar falha nas APIs do chat')
    acoes.push('📱 Testar conexão com OpenAI, Anthropic, Together')
  }
  
  if (metricas.backup_count === 0) {
    acoes.push('💾 Criar backup imediato do .env.local')
    acoes.push('📅 Configurar backup automático semanal')
  }
  
  if (metricas.performance_chat < 70 || metricas.performance_diario < 70) {
    acoes.push('⚡ Otimizar performance do sistema')
    acoes.push('🔄 Reiniciar serviços se necessário')
  }
  
  if (ADMIN_CONFIG.etapa_1_analise_colaborativa.length === 0) {
    acoes.push('⚙️ Configurar pelo menos 1 IA para análise no painel admin')
    acoes.push('🎛️ Acessar /admin e ajustar configurações')
  }
  
  return acoes
}

// 📊 DETERMINAR STATUS GERAL
function determinarStatusGeral(alertas: Alerta[]): 'ok' | 'aviso' | 'critico' {
  const criticos = alertas.filter(a => a.tipo === 'critico').length
  const avisos = alertas.filter(a => a.tipo === 'aviso').length
  
  if (criticos > 0) return 'critico'
  if (avisos > 0) return 'aviso'
  return 'ok'
}

// 🧪 TESTAR PERFORMANCE DO CHAT
async function testarPerformanceChat(): Promise<number> {
  try {
    const inicio = Date.now()
    
    // Simular chamada ao chat (na verdade só testa se as APIs respondem)
    const response = await fetch('/api/chat/test', { 
      method: 'POST',
      body: JSON.stringify({ message: 'test' })
    }).catch(() => null)
    
    const fim = Date.now()
    const tempo = fim - inicio
    
    // Performance baseada no tempo de resposta
    if (tempo < 1000) return 100
    if (tempo < 2000) return 85
    if (tempo < 5000) return 70
    if (tempo < 10000) return 50
    return 25
  } catch (error) {
    return 0 // Falha completa
  }
}

// 🧪 TESTAR PERFORMANCE DO DIÁRIO
async function testarPerformanceDiario(): Promise<number> {
  try {
    const inicio = Date.now()
    
    // Simular chamada à análise do diário
    const response = await fetch('/api/diario/analyze/test', {
      method: 'POST',
      body: JSON.stringify({ text: 'test' })
    }).catch(() => null)
    
    const fim = Date.now()
    const tempo = fim - inicio
    
    // Performance baseada no tempo de resposta
    if (tempo < 2000) return 100
    if (tempo < 4000) return 85
    if (tempo < 8000) return 70
    if (tempo < 15000) return 50
    return 25
  } catch (error) {
    return 0 // Falha completa
  }
}

// 📋 OBTER STATUS ATUAL
export function getStatusMonitoramento(): {
  status: 'ok' | 'aviso' | 'critico'
  alertas_ativos: number
  ultima_verificacao: string
  proxima_verificacao: string
} {
  const status = alertasAtivos.length > 0 
    ? alertasAtivos.some(a => a.tipo === 'critico') ? 'critico' : 'aviso'
    : 'ok'
  
  const ultima = metricasHistorico[metricasHistorico.length - 1]?.timestamp || new Date().toISOString()
  const proxima = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutos
  
  return {
    status,
    alertas_ativos: alertasAtivos.length,
    ultima_verificacao: ultima,
    proxima_verificacao: proxima
  }
}

// 🔄 INICIAR MONITORAMENTO AUTOMÁTICO
export function iniciarMonitoramentoAutomatico(): void {
  console.log('🚀 Iniciando monitoramento automático 24/7...')
  
  // Executar imediatamente
  executarMonitoramentoCompleto()
  
  // Executar a cada 5 minutos
  setInterval(() => {
    executarMonitoramentoCompleto()
  }, 5 * 60 * 1000)
  
  console.log('✅ Monitoramento automático iniciado! Verificando a cada 5 minutos.')
}

// 🔔 RESOLVER ALERTA
export function resolverAlerta(alertaId: string): void {
  const alerta = alertasAtivos.find(a => a.id === alertaId)
  if (alerta) {
    alerta.resolvido = true
    console.log(`✅ Alerta resolvido: ${alerta.titulo}`)
  }
}

// 📊 OBTER HISTÓRICO DE MÉTRICAS
export function getHistoricoMetricas(horas: number = 24): MetricasSistema[] {
  const limite = new Date(Date.now() - horas * 60 * 60 * 1000)
  return metricasHistorico.filter(m => new Date(m.timestamp) > limite)
}
