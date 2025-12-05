/**
 * AI Flow Engine - Mini-n8n Interno
 * Sistema de fluxos de IA robustos e configuráveis
 */

export type NodeType = 
  | 'trigger'      // Início do fluxo
  | 'ai_call'      // Chamada de IA
  | 'condition'    // Condição/Branch
  | 'transform'    // Transformar dados
  | 'action'       // Ação (salvar, notificar, etc)
  | 'output'       // Saída do fluxo

export interface FlowNode {
  id: string
  type: NodeType
  name: string
  config: Record<string, any>
  position: { x: number; y: number }
  nextNodes: string[]  // IDs dos próximos nós
}

export interface AIFlow {
  id: string
  name: string
  description: string
  trigger: {
    type: 'manual' | 'schedule' | 'event' | 'webhook'
    config: Record<string, any>
  }
  nodes: FlowNode[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface FlowExecutionContext {
  flowId: string
  runId: string
  startedAt: string
  variables: Record<string, any>
  logs: FlowLog[]
  status: 'running' | 'completed' | 'failed'
}

export interface FlowLog {
  nodeId: string
  nodeName: string
  timestamp: string
  status: 'started' | 'completed' | 'failed'
  input?: any
  output?: any
  error?: string
  duration?: number
}

/**
 * Executor de Fluxos de IA
 */
export class AIFlowEngine {
  private context: FlowExecutionContext
  private flow: AIFlow

  constructor(flow: AIFlow) {
    this.flow = flow
    this.context = {
      flowId: flow.id,
      runId: this.generateRunId(),
      startedAt: new Date().toISOString(),
      variables: {},
      logs: [],
      status: 'running'
    }
  }

  private generateRunId(): string {
    return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Executa o fluxo completo
   */
  async execute(initialData: Record<string, any> = {}): Promise<FlowExecutionContext> {
    this.context.variables = { ...initialData }

    try {
      // Encontrar nó inicial (trigger)
      const triggerNode = this.flow.nodes.find(n => n.type === 'trigger')
      if (!triggerNode) {
        throw new Error('Fluxo sem nó de trigger')
      }

      // Executar a partir do trigger
      await this.executeNode(triggerNode)

      this.context.status = 'completed'
    } catch (error: any) {
      this.context.status = 'failed'
      this.log({
        nodeId: 'engine',
        nodeName: 'Engine',
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: error.message
      })
    }

    return this.context
  }

  /**
   * Executa um nó específico
   */
  private async executeNode(node: FlowNode): Promise<void> {
    const startTime = Date.now()

    this.log({
      nodeId: node.id,
      nodeName: node.name,
      timestamp: new Date().toISOString(),
      status: 'started',
      input: this.context.variables
    })

    try {
      let output: any

      switch (node.type) {
        case 'trigger':
          output = await this.executeTrigger(node)
          break
        case 'ai_call':
          output = await this.executeAICall(node)
          break
        case 'condition':
          output = await this.executeCondition(node)
          break
        case 'transform':
          output = await this.executeTransform(node)
          break
        case 'action':
          output = await this.executeAction(node)
          break
        case 'output':
          output = await this.executeOutput(node)
          break
        default:
          throw new Error(`Tipo de nó desconhecido: ${node.type}`)
      }

      this.log({
        nodeId: node.id,
        nodeName: node.name,
        timestamp: new Date().toISOString(),
        status: 'completed',
        output,
        duration: Date.now() - startTime
      })

      // Executar próximos nós
      if (node.type === 'condition') {
        // Condition retorna o ID do próximo nó
        const nextNodeId = output as string
        const nextNode = this.flow.nodes.find(n => n.id === nextNodeId)
        if (nextNode) {
          await this.executeNode(nextNode)
        }
      } else {
        // Executar todos os próximos nós
        for (const nextNodeId of node.nextNodes) {
          const nextNode = this.flow.nodes.find(n => n.id === nextNodeId)
          if (nextNode) {
            await this.executeNode(nextNode)
          }
        }
      }

    } catch (error: any) {
      this.log({
        nodeId: node.id,
        nodeName: node.name,
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: error.message,
        duration: Date.now() - startTime
      })
      throw error
    }
  }

  private async executeTrigger(node: FlowNode): Promise<any> {
    // Trigger apenas passa os dados iniciais
    return this.context.variables
  }

  private async executeAICall(node: FlowNode): Promise<any> {
    const { provider, model, prompt, temperature, maxTokens } = node.config

    // Substituir variáveis no prompt
    const resolvedPrompt = this.resolveVariables(prompt)

    // Chamar IA via API interna
    const response = await fetch('/api/ai/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: provider || 'openai',
        model: model || 'gpt-4o-mini',
        prompt: resolvedPrompt,
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 1000
      })
    })

    if (!response.ok) {
      throw new Error('Erro na chamada de IA')
    }

    const data = await response.json()
    
    // Salvar resultado nas variáveis
    if (node.config.outputVariable) {
      this.context.variables[node.config.outputVariable] = data.content
    }

    return data.content
  }

  private async executeCondition(node: FlowNode): Promise<string> {
    const { field, operator, value, trueNode, falseNode } = node.config

    const fieldValue = this.getVariable(field)
    let result = false

    switch (operator) {
      case 'equals':
        result = fieldValue === value
        break
      case 'not_equals':
        result = fieldValue !== value
        break
      case 'contains':
        result = String(fieldValue).includes(value)
        break
      case 'greater_than':
        result = Number(fieldValue) > Number(value)
        break
      case 'less_than':
        result = Number(fieldValue) < Number(value)
        break
      case 'is_empty':
        result = !fieldValue || fieldValue === ''
        break
      case 'is_not_empty':
        result = !!fieldValue && fieldValue !== ''
        break
      default:
        result = false
    }

    return result ? trueNode : falseNode
  }

  private async executeTransform(node: FlowNode): Promise<any> {
    const { transformType, input, output } = node.config
    const inputValue = this.getVariable(input)

    let result: any

    switch (transformType) {
      case 'uppercase':
        result = String(inputValue).toUpperCase()
        break
      case 'lowercase':
        result = String(inputValue).toLowerCase()
        break
      case 'trim':
        result = String(inputValue).trim()
        break
      case 'split':
        result = String(inputValue).split(node.config.delimiter || ',')
        break
      case 'join':
        result = Array.isArray(inputValue) ? inputValue.join(node.config.delimiter || ',') : inputValue
        break
      case 'json_parse':
        result = JSON.parse(inputValue)
        break
      case 'json_stringify':
        result = JSON.stringify(inputValue)
        break
      case 'extract':
        result = inputValue?.[node.config.key]
        break
      default:
        result = inputValue
    }

    this.context.variables[output] = result
    return result
  }

  private async executeAction(node: FlowNode): Promise<any> {
    const { actionType } = node.config

    switch (actionType) {
      case 'save_to_db':
        return this.actionSaveToDb(node.config)
      case 'send_notification':
        return this.actionSendNotification(node.config)
      case 'create_alert':
        return this.actionCreateAlert(node.config)
      case 'log':
        console.log('[AIFlow]', this.resolveVariables(node.config.message))
        return true
      default:
        throw new Error(`Ação desconhecida: ${actionType}`)
    }
  }

  private async executeOutput(node: FlowNode): Promise<any> {
    const { outputVariable } = node.config
    return outputVariable ? this.getVariable(outputVariable) : this.context.variables
  }

  // Ações específicas
  private async actionSaveToDb(config: any): Promise<any> {
    const { table, data } = config
    const resolvedData = this.resolveVariables(JSON.stringify(data))
    
    const response = await fetch('/api/admin/ai-flows/action/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, data: JSON.parse(resolvedData) })
    })

    return response.ok
  }

  private async actionSendNotification(config: any): Promise<any> {
    const { userId, title, message, type } = config
    
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: this.resolveVariables(userId),
        title: this.resolveVariables(title),
        message: this.resolveVariables(message),
        type: type || 'info'
      })
    })

    return response.ok
  }

  private async actionCreateAlert(config: any): Promise<any> {
    const { userId, riskLevel, riskType, details } = config
    
    const response = await fetch('/api/risk-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: this.resolveVariables(userId),
        risk_level: riskLevel,
        risk_type: riskType,
        details: this.resolveVariables(JSON.stringify(details))
      })
    })

    return response.ok
  }

  // Helpers
  private getVariable(path: string): any {
    const parts = path.split('.')
    let value: any = this.context.variables

    for (const part of parts) {
      value = value?.[part]
    }

    return value
  }

  private resolveVariables(text: string): string {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getVariable(path.trim())
      return value !== undefined ? String(value) : match
    })
  }

  private log(entry: FlowLog): void {
    this.context.logs.push(entry)
  }
}

/**
 * Templates de fluxos pré-definidos
 */
export const FLOW_TEMPLATES: Partial<AIFlow>[] = [
  {
    name: 'Análise de Risco no Diário',
    description: 'Analisa entradas do diário e cria alertas se necessário',
    trigger: { type: 'event', config: { event: 'journal_entry_created' } },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        name: 'Nova Entrada',
        config: {},
        position: { x: 100, y: 100 },
        nextNodes: ['ai_analyze']
      },
      {
        id: 'ai_analyze',
        type: 'ai_call',
        name: 'Analisar Risco',
        config: {
          prompt: 'Analise o seguinte texto e retorne um JSON com { riskLevel: "low"|"medium"|"high"|"critical", reasons: [] }:\n\n{{entry.content}}',
          outputVariable: 'analysis'
        },
        position: { x: 300, y: 100 },
        nextNodes: ['check_risk']
      },
      {
        id: 'check_risk',
        type: 'condition',
        name: 'Risco Alto?',
        config: {
          field: 'analysis.riskLevel',
          operator: 'equals',
          value: 'high',
          trueNode: 'create_alert',
          falseNode: 'end'
        },
        position: { x: 500, y: 100 },
        nextNodes: []
      },
      {
        id: 'create_alert',
        type: 'action',
        name: 'Criar Alerta',
        config: {
          actionType: 'create_alert',
          userId: '{{entry.user_id}}',
          riskLevel: '{{analysis.riskLevel}}',
          riskType: 'journal_analysis'
        },
        position: { x: 700, y: 50 },
        nextNodes: ['end']
      },
      {
        id: 'end',
        type: 'output',
        name: 'Fim',
        config: { outputVariable: 'analysis' },
        position: { x: 700, y: 150 },
        nextNodes: []
      }
    ]
  },
  {
    name: 'Resumo Semanal',
    description: 'Gera resumo semanal das atividades do usuário',
    trigger: { type: 'schedule', config: { cron: '0 9 * * 1' } }, // Segunda às 9h
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        name: 'Início Semanal',
        config: {},
        position: { x: 100, y: 100 },
        nextNodes: ['ai_summary']
      },
      {
        id: 'ai_summary',
        type: 'ai_call',
        name: 'Gerar Resumo',
        config: {
          prompt: 'Gere um resumo empático e encorajador da semana do usuário baseado em:\n- Entradas do diário: {{weekEntries}}\n- Humor médio: {{avgMood}}\n- Conquistas: {{achievements}}',
          outputVariable: 'summary'
        },
        position: { x: 300, y: 100 },
        nextNodes: ['notify']
      },
      {
        id: 'notify',
        type: 'action',
        name: 'Enviar Notificação',
        config: {
          actionType: 'send_notification',
          userId: '{{userId}}',
          title: 'Seu Resumo da Semana',
          message: '{{summary}}',
          type: 'weekly_summary'
        },
        position: { x: 500, y: 100 },
        nextNodes: ['end']
      },
      {
        id: 'end',
        type: 'output',
        name: 'Fim',
        config: {},
        position: { x: 700, y: 100 },
        nextNodes: []
      }
    ]
  }
]
