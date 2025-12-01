# Integração Oráculo Whitelabel

## Visão Geral

O Oráculo V2 suporta múltiplas instâncias whitelabel, permitindo que parceiros integrem a IA em seus próprios produtos com branding e configurações personalizadas.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    RADAR NARCISISTA                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              ORÁCULO V2 CORE                         │    │
│  │  - Prompts base                                      │    │
│  │  - Chamada OpenAI                                    │    │
│  │  - Parsing de respostas                              │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│  ┌───────────┬───────────┼───────────┬───────────┐          │
│  │           │           │           │           │          │
│  ▼           ▼           ▼           ▼           ▼          │
│ ┌───┐      ┌───┐      ┌───┐      ┌───┐      ┌───┐          │
│ │ I1│      │ I2│      │ I3│      │ I4│      │ IN│          │
│ └───┘      └───┘      └───┘      └───┘      └───┘          │
│ Radar      Clínica    Escritório  Coach     Seu SaaS       │
└─────────────────────────────────────────────────────────────┘
```

## Endpoints

### API Pública

```
POST /api/oraculo-public?instance={slug}
GET  /api/oraculo-public?instance={slug}  (health check)
```

### Headers

| Header | Obrigatório | Descrição |
|--------|-------------|-----------|
| `x-api-key` | Recomendado | Chave de API da instância |
| `Content-Type` | Sim | `application/json` |
| `Origin` | Automático | Validado contra domínios permitidos |

### Request Body

```json
{
  "question": "Como posso ajudar meu cliente?",
  "user_role": "profissional",
  "context": {
    "url_atual": "https://meusite.com/dashboard",
    "manual_context": "Contexto adicional opcional"
  }
}
```

### Response

```json
{
  "success": true,
  "instance": {
    "slug": "minha-clinica",
    "name": "Clínica Bem-Estar",
    "assistant": "Assistente Clara"
  },
  "response": {
    "modo": "sugestao",
    "risco": "baixo",
    "titulo_curto": "Sugestão de Abordagem",
    "resposta_principal": "...",
    "passos": ["Passo 1", "Passo 2"],
    "links_sugeridos": []
  },
  "meta": {
    "latency_ms": 1234,
    "model": "gpt-4o-mini"
  }
}
```

## Criando uma Instância

### Via Painel Admin

1. Acesse `/admin/oraculo-instances`
2. Clique em "Nova Instância"
3. Preencha os campos:
   - **Slug**: identificador único (ex: `minha-clinica`)
   - **Nome**: nome da instância
   - **Assistente**: nome do assistente IA
   - **Tom**: acolhedor, profissional, técnico ou casual
   - **Cores**: branding da instância
4. Configure prompts na aba "Contexto"
5. Salve

### Via Código

```typescript
import { createSaaSInstance, applyTemplate } from '@/lib/oraculo-saas-generator'

const config = applyTemplate('clinica-saude-mental', {
  slug: 'minha-clinica',
  name: 'Clínica Bem-Estar',
  product_context: 'Clínica especializada em saúde mental...',
  assistant_name: 'Assistente Clara',
  primary_color: '#10B981',
  allowed_domains: ['minhaclinica.com.br', '*.minhaclinica.com.br']
})

const instance = await createSaaSInstance(config)
console.log(instance.integration_code)
```

## Templates Disponíveis

| Template | Descrição | Tom |
|----------|-----------|-----|
| `clinica-saude-mental` | Clínicas e consultórios | Acolhedor |
| `escritorio-advocacia` | Escritórios de advocacia | Profissional |
| `coaching` | Coaches e mentores | Casual |
| `educacao` | Plataformas educacionais | Profissional |
| `generico` | Uso geral | Profissional |

## Configurações por Instância

### Identificação
- `instance_slug`: Identificador único
- `instance_name`: Nome da instância
- `owner_id`: ID do proprietário (opcional)

### IA
- `modelo_ia`: Modelo OpenAI (gpt-4o-mini, gpt-4o, etc)
- `temperatura`: Criatividade (0.0 - 2.0)
- `max_tokens`: Limite de tokens por resposta

### Personalização
- `nome_assistente`: Nome do assistente
- `tom_comunicacao`: acolhedor | profissional | tecnico | casual
- `prompt_base_override`: Substitui prompt base
- `prompt_adicional`: Instruções extras
- `contexto_produto`: Descrição do produto
- `contexto_empresa`: Descrição da empresa

### Branding
- `cor_primaria`: Cor principal (#RRGGBB)
- `cor_secundaria`: Cor secundária (#RRGGBB)
- `logo_url`: URL do logo

### Limites
- `limite_diario_global`: Limite diário de perguntas
- `limite_mensal_global`: Limite mensal de perguntas
- `dominios_permitidos`: Lista de domínios autorizados

### Features
- `analise`: Modo análise habilitado
- `sugestao`: Modo sugestão habilitado
- `alerta`: Modo alerta habilitado
- `explicacao`: Modo explicação habilitado

## Exemplo de Integração

### JavaScript/TypeScript

```typescript
async function askOraculo(question: string) {
  const response = await fetch(
    'https://radar-narcisista.vercel.app/api/oraculo-public?instance=minha-clinica',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ORACULO_API_KEY
      },
      body: JSON.stringify({
        question,
        user_role: 'usuaria'
      })
    }
  )
  
  return response.json()
}
```

### React Component

```tsx
import { useState } from 'react'

export function OraculoChat({ instanceSlug, apiKey }) {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const handleAsk = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/oraculo-public?instance=${instanceSlug}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({ question, user_role: 'usuaria' })
        }
      )
      const data = await res.json()
      setResponse(data.response)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div>
      <input
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Faça sua pergunta..."
      />
      <button onClick={handleAsk} disabled={loading}>
        {loading ? 'Pensando...' : 'Perguntar'}
      </button>
      {response && (
        <div>
          <h4>{response.titulo_curto}</h4>
          <p>{response.resposta_principal}</p>
        </div>
      )}
    </div>
  )
}
```

## Rate Limiting

- **30 requisições por minuto** por IP/API key
- Resposta 429 quando excedido
- Header `Retry-After` indica tempo de espera

## Segurança

1. **Domínios Permitidos**: Configure `dominios_permitidos` para restringir origens
2. **API Keys**: Use `x-api-key` para autenticação
3. **HTTPS**: Sempre use HTTPS em produção
4. **Validação**: Perguntas limitadas a 2000 caracteres

## Monitoramento

Acesse `/admin/oraculo-instances/{id}` para ver:
- Total de perguntas
- Tokens consumidos
- Custo estimado
- Uso diário/mensal

## Suporte

- Documentação: `/docs/INTEGRACAO-ORACULO-WHITELABEL.md`
- Painel Admin: `/admin/oraculo-instances`
- Contato: suporte@radarnarcisista.com.br
