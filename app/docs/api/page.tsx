'use client'

/**
 * Documentação Interativa da API do Oráculo
 * ETAPA 40 - Documentação com exemplos e playground
 */

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Book,
  Code,
  Play,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Key,
  Globe,
  Webhook,
  CreditCard,
  BarChart3,
  Shield,
  Zap
} from 'lucide-react'

// Tipos
interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  description: string
  auth: 'api_key' | 'admin' | 'none'
  params?: { name: string; type: string; required: boolean; description: string }[]
  body?: { name: string; type: string; required: boolean; description: string }[]
  response: string
  example: {
    request?: string
    response: string
  }
}

interface Section {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  endpoints: Endpoint[]
}

// Dados da documentação
const API_SECTIONS: Section[] = [
  {
    id: 'public',
    title: 'API Pública',
    icon: <Globe className="w-5 h-5" />,
    description: 'Endpoints para consumo do Oráculo por instâncias whitelabel',
    endpoints: [
      {
        method: 'POST',
        path: '/api/oraculo-public',
        description: 'Envia uma pergunta ao Oráculo e recebe uma resposta estruturada',
        auth: 'api_key',
        params: [
          { name: 'instance', type: 'string', required: true, description: 'Slug da instância (ex: meu-saas)' }
        ],
        body: [
          { name: 'question', type: 'string', required: true, description: 'Pergunta do usuário (máx 2000 chars)' },
          { name: 'user_role', type: 'string', required: false, description: 'Role do usuário: usuaria, profissional, admin' },
          { name: 'context', type: 'object', required: false, description: 'Contexto adicional (url_atual, manual_context)' }
        ],
        response: 'OraculoResponse',
        example: {
          request: `{
  "question": "Como identificar manipulação emocional?",
  "user_role": "usuaria",
  "context": {
    "url_atual": "/dashboard"
  }
}`,
          response: `{
  "success": true,
  "instance": {
    "slug": "meu-saas",
    "name": "Meu SaaS",
    "assistant": "Assistente Virtual"
  },
  "response": {
    "modo": "educativo",
    "risco": "baixo",
    "titulo_curto": "Sinais de Manipulação",
    "resposta_principal": "A manipulação emocional...",
    "passos": ["Observe padrões", "Confie em si"],
    "links_sugeridos": []
  },
  "meta": {
    "latency_ms": 1234,
    "model": "gpt-4o-mini"
  }
}`
        }
      },
      {
        method: 'GET',
        path: '/api/oraculo-public',
        description: 'Health check da instância',
        auth: 'none',
        params: [
          { name: 'instance', type: 'string', required: true, description: 'Slug da instância' }
        ],
        response: 'HealthCheckResponse',
        example: {
          response: `{
  "status": "ok",
  "instance": {
    "slug": "meu-saas",
    "name": "Meu SaaS",
    "assistant": "Assistente Virtual"
  },
  "timestamp": "2024-12-01T22:00:00.000Z"
}`
        }
      }
    ]
  },
  {
    id: 'keys',
    title: 'API Keys',
    icon: <Key className="w-5 h-5" />,
    description: 'Gerenciamento de chaves de API para autenticação',
    endpoints: [
      {
        method: 'GET',
        path: '/api/admin/oraculo-instances/[id]/keys',
        description: 'Lista todas as API keys de uma instância',
        auth: 'admin',
        response: 'ApiKeyList',
        example: {
          response: `{
  "success": true,
  "keys": [
    {
      "id": "uuid",
      "key_name": "Produção",
      "key_preview": "orak_****abc123",
      "status": "active",
      "last_used_at": "2024-12-01T20:00:00Z",
      "total_requests": 1500
    }
  ]
}`
        }
      },
      {
        method: 'POST',
        path: '/api/admin/oraculo-instances/[id]/keys',
        description: 'Cria uma nova API key',
        auth: 'admin',
        body: [
          { name: 'key_name', type: 'string', required: true, description: 'Nome identificador da key' },
          { name: 'rate_limit_per_minute', type: 'number', required: false, description: 'Limite de requisições por minuto' }
        ],
        response: 'ApiKeyCreated',
        example: {
          request: `{
  "key_name": "Produção",
  "rate_limit_per_minute": 60
}`,
          response: `{
  "success": true,
  "key": {
    "id": "uuid",
    "key_name": "Produção",
    "full_key": "orak_abc123xyz789..."
  },
  "warning": "Guarde esta chave! Ela não será exibida novamente."
}`
        }
      }
    ]
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    icon: <Webhook className="w-5 h-5" />,
    description: 'Receba notificações em tempo real sobre eventos',
    endpoints: [
      {
        method: 'GET',
        path: '/api/admin/oraculo-instances/[id]/webhooks',
        description: 'Lista webhooks configurados',
        auth: 'admin',
        response: 'WebhookList',
        example: {
          response: `{
  "success": true,
  "webhooks": [
    {
      "id": "uuid",
      "webhook_name": "Notificações",
      "webhook_url": "https://meu-site.com/webhook",
      "events": ["oraculo.query", "oraculo.response"],
      "status": "active"
    }
  ]
}`
        }
      },
      {
        method: 'POST',
        path: '/api/admin/oraculo-instances/[id]/webhooks',
        description: 'Cria um novo webhook',
        auth: 'admin',
        body: [
          { name: 'webhook_name', type: 'string', required: true, description: 'Nome do webhook' },
          { name: 'webhook_url', type: 'string', required: true, description: 'URL de destino (HTTPS)' },
          { name: 'events', type: 'string[]', required: false, description: 'Eventos a escutar' }
        ],
        response: 'WebhookCreated',
        example: {
          request: `{
  "webhook_name": "Notificações",
  "webhook_url": "https://meu-site.com/webhook",
  "events": ["oraculo.query", "oraculo.response"]
}`,
          response: `{
  "success": true,
  "webhook": {
    "id": "uuid",
    "webhook_name": "Notificações",
    "secret_key": "whsec_abc123..."
  }
}`
        }
      }
    ]
  },
  {
    id: 'billing',
    title: 'Billing',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Informações de plano e uso da instância',
    endpoints: [
      {
        method: 'GET',
        path: '/api/admin/oraculo-instances/[id]/billing',
        description: 'Retorna informações de billing da instância',
        auth: 'admin',
        response: 'BillingInfo',
        example: {
          response: `{
  "success": true,
  "subscription": {
    "plan": {
      "plan_name": "Pro",
      "max_queries_per_month": 10000,
      "price_cents": 14900
    },
    "status": "active",
    "queries_used": 2500,
    "tokens_used": 1250000
  },
  "plans": [...],
  "usage": {...}
}`
        }
      }
    ]
  },
  {
    id: 'logs',
    title: 'Logs',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Logs detalhados de uso e métricas',
    endpoints: [
      {
        method: 'GET',
        path: '/api/admin/oraculo-instances/[id]/logs',
        description: 'Lista logs de uso com filtros',
        auth: 'admin',
        params: [
          { name: 'view', type: 'string', required: false, description: 'logs, stats, summary, errors' },
          { name: 'limit', type: 'number', required: false, description: 'Limite de resultados' },
          { name: 'status', type: 'string', required: false, description: 'Filtrar por status' }
        ],
        response: 'LogsList',
        example: {
          response: `{
  "success": true,
  "logs": [
    {
      "id": "uuid",
      "request_id": "req_123",
      "question": "Como identificar...",
      "tokens_total": 450,
      "response_time_ms": 1234,
      "status": "success",
      "created_at": "2024-12-01T22:00:00Z"
    }
  ],
  "total": 150
}`
        }
      }
    ]
  }
]

// Eventos de webhook
const WEBHOOK_EVENTS = [
  { event: 'oraculo.query', description: 'Quando uma pergunta é feita' },
  { event: 'oraculo.response', description: 'Quando uma resposta é gerada' },
  { event: 'oraculo.error', description: 'Quando ocorre um erro' },
  { event: 'oraculo.limit_reached', description: 'Quando limite é atingido' },
  { event: 'instance.updated', description: 'Quando instância é atualizada' },
  { event: 'apikey.created', description: 'Quando API key é criada' },
  { event: 'apikey.revoked', description: 'Quando API key é revogada' }
]

// Códigos de exemplo
const CODE_EXAMPLES = {
  javascript: `// JavaScript / Node.js
const response = await fetch('https://radar-narcisista.vercel.app/api/oraculo-public?instance=meu-saas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'orak_sua_chave_aqui'
  },
  body: JSON.stringify({
    question: 'Como identificar manipulação emocional?',
    user_role: 'usuaria'
  })
});

const data = await response.json();
console.log(data.response.resposta_principal);`,

  python: `# Python
import requests

response = requests.post(
    'https://radar-narcisista.vercel.app/api/oraculo-public',
    params={'instance': 'meu-saas'},
    headers={
        'Content-Type': 'application/json',
        'x-api-key': 'orak_sua_chave_aqui'
    },
    json={
        'question': 'Como identificar manipulação emocional?',
        'user_role': 'usuaria'
    }
)

data = response.json()
print(data['response']['resposta_principal'])`,

  curl: `# cURL
curl -X POST "https://radar-narcisista.vercel.app/api/oraculo-public?instance=meu-saas" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: orak_sua_chave_aqui" \\
  -d '{
    "question": "Como identificar manipulação emocional?",
    "user_role": "usuaria"
  }'`,

  php: `<?php
// PHP
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => 'https://radar-narcisista.vercel.app/api/oraculo-public?instance=meu-saas',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: orak_sua_chave_aqui'
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'question' => 'Como identificar manipulação emocional?',
        'user_role' => 'usuaria'
    ])
]);

$response = curl_exec($ch);
$data = json_decode($response, true);
echo $data['response']['resposta_principal'];`
}

export default function ApiDocsPage() {
  const [expandedSection, setExpandedSection] = useState<string>('public')
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof CODE_EXAMPLES>('javascript')
  const [copiedCode, setCopiedCode] = useState(false)
  const [playgroundQuestion, setPlaygroundQuestion] = useState('')
  const [playgroundResponse, setPlaygroundResponse] = useState<string | null>(null)
  const [playgroundLoading, setPlaygroundLoading] = useState(false)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const testPlayground = async () => {
    if (!playgroundQuestion.trim()) return
    
    setPlaygroundLoading(true)
    setPlaygroundResponse(null)
    
    try {
      // Simular resposta para demo (em produção, chamaria a API real)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setPlaygroundResponse(JSON.stringify({
        success: true,
        response: {
          modo: 'educativo',
          risco: 'baixo',
          titulo_curto: 'Resposta de Exemplo',
          resposta_principal: 'Esta é uma resposta de demonstração. Em produção, você receberia uma resposta real do Oráculo.',
          passos: ['Passo 1', 'Passo 2'],
          links_sugeridos: []
        },
        meta: {
          latency_ms: 1234,
          model: 'gpt-4o-mini'
        }
      }, null, 2))
    } catch {
      setPlaygroundResponse(JSON.stringify({ error: 'Erro ao testar' }, null, 2))
    } finally {
      setPlaygroundLoading(false)
    }
  }

  const methodColors: Record<string, string> = {
    GET: 'bg-green-500/20 text-green-400 border-green-500/30',
    POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PUT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    PATCH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    DELETE: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/oraculo-instances" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Book className="w-6 h-6 text-purple-400" />
              <h1 className="text-xl font-bold">Documentação da API</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Shield className="w-4 h-4" />
            <span>v1.0</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="sticky top-24 space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Seções</p>
              {API_SECTIONS.map(section => (
                <button
                  key={section.id}
                  onClick={() => setExpandedSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    expandedSection === section.id 
                      ? 'bg-purple-500/20 text-purple-400' 
                      : 'hover:bg-slate-700/50 text-gray-400'
                  }`}
                >
                  {section.icon}
                  <span>{section.title}</span>
                </button>
              ))}
              <div className="border-t border-slate-700 my-4" />
              <button
                onClick={() => setExpandedSection('examples')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  expandedSection === 'examples' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'hover:bg-slate-700/50 text-gray-400'
                }`}
              >
                <Code className="w-5 h-5" />
                <span>Exemplos de Código</span>
              </button>
              <button
                onClick={() => setExpandedSection('playground')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  expandedSection === 'playground' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'hover:bg-slate-700/50 text-gray-400'
                }`}
              >
                <Play className="w-5 h-5" />
                <span>Playground</span>
              </button>
              <button
                onClick={() => setExpandedSection('webhooks-events')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  expandedSection === 'webhooks-events' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'hover:bg-slate-700/50 text-gray-400'
                }`}
              >
                <Zap className="w-5 h-5" />
                <span>Eventos de Webhook</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-8">
            {/* Intro */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">API do Oráculo Whitelabel</h2>
              <p className="text-gray-400 mb-4">
                A API do Oráculo permite que você integre nossa IA de suporte em seu próprio produto.
                Com ela, você pode fazer perguntas, receber respostas estruturadas e monitorar o uso.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Base URL: <code className="text-purple-400">https://radar-narcisista.vercel.app</code></span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Auth: <code className="text-purple-400">x-api-key</code> header</span>
                </div>
              </div>
            </div>

            {/* API Sections */}
            {API_SECTIONS.map(section => (
              expandedSection === section.id && (
                <div key={section.id} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      {section.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{section.title}</h2>
                      <p className="text-gray-400 text-sm">{section.description}</p>
                    </div>
                  </div>

                  {section.endpoints.map((endpoint, idx) => (
                    <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                      {/* Endpoint Header */}
                      <div className="p-4 border-b border-slate-700 flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-mono font-bold rounded border ${methodColors[endpoint.method]}`}>
                          {endpoint.method}
                        </span>
                        <code className="text-purple-400 font-mono">{endpoint.path}</code>
                        {endpoint.auth !== 'none' && (
                          <span className="ml-auto text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">
                            {endpoint.auth === 'api_key' ? '🔑 API Key' : '🔒 Admin'}
                          </span>
                        )}
                      </div>

                      <div className="p-4 space-y-4">
                        <p className="text-gray-300">{endpoint.description}</p>

                        {/* Parameters */}
                        {endpoint.params && endpoint.params.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">Query Parameters</h4>
                            <div className="bg-slate-900/50 rounded-lg overflow-hidden">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-slate-700">
                                    <th className="text-left p-2 text-gray-400">Nome</th>
                                    <th className="text-left p-2 text-gray-400">Tipo</th>
                                    <th className="text-left p-2 text-gray-400">Descrição</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {endpoint.params.map((param, i) => (
                                    <tr key={i} className="border-b border-slate-700/50">
                                      <td className="p-2">
                                        <code className="text-purple-400">{param.name}</code>
                                        {param.required && <span className="text-red-400 ml-1">*</span>}
                                      </td>
                                      <td className="p-2 text-cyan-400">{param.type}</td>
                                      <td className="p-2 text-gray-400">{param.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Body */}
                        {endpoint.body && endpoint.body.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">Request Body</h4>
                            <div className="bg-slate-900/50 rounded-lg overflow-hidden">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-slate-700">
                                    <th className="text-left p-2 text-gray-400">Campo</th>
                                    <th className="text-left p-2 text-gray-400">Tipo</th>
                                    <th className="text-left p-2 text-gray-400">Descrição</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {endpoint.body.map((field, i) => (
                                    <tr key={i} className="border-b border-slate-700/50">
                                      <td className="p-2">
                                        <code className="text-purple-400">{field.name}</code>
                                        {field.required && <span className="text-red-400 ml-1">*</span>}
                                      </td>
                                      <td className="p-2 text-cyan-400">{field.type}</td>
                                      <td className="p-2 text-gray-400">{field.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Example */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2">Exemplo</h4>
                          <div className="space-y-2">
                            {endpoint.example.request && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Request:</p>
                                <pre className="bg-slate-900 p-3 rounded-lg text-sm overflow-x-auto">
                                  <code className="text-green-400">{endpoint.example.request}</code>
                                </pre>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Response:</p>
                              <pre className="bg-slate-900 p-3 rounded-lg text-sm overflow-x-auto">
                                <code className="text-green-400">{endpoint.example.response}</code>
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ))}

            {/* Code Examples */}
            {expandedSection === 'examples' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-400" />
                  Exemplos de Código
                </h2>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                  {/* Language Tabs */}
                  <div className="flex border-b border-slate-700">
                    {(Object.keys(CODE_EXAMPLES) as Array<keyof typeof CODE_EXAMPLES>).map(lang => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          selectedLanguage === lang
                            ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Code */}
                  <div className="relative">
                    <button
                      onClick={() => copyCode(CODE_EXAMPLES[selectedLanguage])}
                      className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <pre className="p-4 overflow-x-auto">
                      <code className="text-sm text-green-400">{CODE_EXAMPLES[selectedLanguage]}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Playground */}
            {expandedSection === 'playground' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Play className="w-5 h-5 text-purple-400" />
                  Playground
                </h2>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-gray-400 mb-4">
                    Teste a API diretamente aqui. Esta é uma demonstração - em produção, use sua API key.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Pergunta</label>
                      <textarea
                        value={playgroundQuestion}
                        onChange={(e) => setPlaygroundQuestion(e.target.value)}
                        placeholder="Digite sua pergunta..."
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                        rows={3}
                      />
                    </div>

                    <button
                      onClick={testPlayground}
                      disabled={playgroundLoading || !playgroundQuestion.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      {playgroundLoading ? 'Testando...' : 'Testar'}
                    </button>

                    {playgroundResponse && (
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Resposta</label>
                        <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto">
                          <code className="text-sm text-green-400">{playgroundResponse}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Webhook Events */}
            {expandedSection === 'webhooks-events' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Eventos de Webhook
                </h2>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-4 text-gray-400">Evento</th>
                        <th className="text-left p-4 text-gray-400">Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {WEBHOOK_EVENTS.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-700/50">
                          <td className="p-4">
                            <code className="text-purple-400">{item.event}</code>
                          </td>
                          <td className="p-4 text-gray-300">{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="font-semibold mb-3">Formato do Payload</h3>
                  <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-green-400">{`{
  "event": "oraculo.query",
  "event_id": "evt_1701234567890_abc123",
  "timestamp": "2024-12-01T22:00:00.000Z",
  "instance": {
    "id": "uuid",
    "slug": "meu-saas",
    "name": "Meu SaaS"
  },
  "data": {
    "question": "...",
    "user_role": "usuaria"
  }
}`}</code>
                  </pre>

                  <h3 className="font-semibold mt-6 mb-3">Verificação de Assinatura</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    Todos os webhooks são assinados com HMAC-SHA256. Verifique o header <code className="text-purple-400">X-Webhook-Signature</code>.
                  </p>
                  <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-green-400">{`// Node.js
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return signature === expected;
}`}</code>
                  </pre>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
