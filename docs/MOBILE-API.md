# Mobile API - Documentação

## Visão Geral

API otimizada para aplicativos mobile (iOS e Android) com suporte a:
- Autenticação
- Sincronização offline
- Push notifications
- WhatsApp integration

## Autenticação

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

Resposta:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "usuario@email.com"
  }
}
```

### Refresh Token

```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ..."
}
```

## Registro de Dispositivo

### Registrar

```bash
POST /api/mobile
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "register",
  "deviceId": "device-uuid",
  "platform": "ios",
  "appVersion": "1.0.0",
  "pushToken": "fcm-token-ou-apns-token",
  "deviceModel": "iPhone 15",
  "osVersion": "17.0"
}
```

### Atualizar Push Token

```bash
POST /api/mobile
Authorization: Bearer <token>

{
  "action": "updatePushToken",
  "deviceId": "device-uuid",
  "pushToken": "novo-token"
}
```

### Heartbeat

```bash
POST /api/mobile
Authorization: Bearer <token>

{
  "action": "heartbeat",
  "deviceId": "device-uuid"
}
```

## Dados do Usuário

### Buscar Perfil

```bash
GET /api/mobile?action=user
Authorization: Bearer <token>
```

Resposta:
```json
{
  "id": "uuid",
  "email": "usuario@email.com",
  "name": "Maria",
  "avatar": "https://...",
  "plan": "completo",
  "features": ["chat", "diary", "safety_plan"],
  "stats": {
    "journalEntries": 42,
    "chatMessages": 156,
    "clarityTests": 3,
    "currentStreak": 7
  }
}
```

## Sincronização Offline

### Buscar Dados para Sync

```bash
GET /api/mobile?action=sync&lastSync=2024-01-01T00:00:00Z
Authorization: Bearer <token>
```

Resposta:
```json
{
  "lastSyncAt": "2024-01-15T10:30:00Z",
  "journalEntries": [...],
  "chatMessages": [...],
  "notifications": [...],
  "achievements": [...]
}
```

### Enviar Dados Offline

```bash
PUT /api/mobile
Authorization: Bearer <token>
Content-Type: application/json

{
  "journalEntries": [
    {
      "id": "local_123",
      "content": "Hoje me senti...",
      "mood": 3,
      "created_at": "2024-01-15T08:00:00Z"
    }
  ],
  "chatMessages": [...]
}
```

Resposta:
```json
{
  "success": true,
  "synced": 5,
  "errors": []
}
```

## Push Notifications

### Formatos

#### FCM (Android/Web)
```json
{
  "to": "device-token",
  "notification": {
    "title": "Título",
    "body": "Mensagem",
    "icon": "/icon.png"
  },
  "data": {
    "type": "risk_alert",
    "level": "high"
  }
}
```

#### APNs (iOS)
```json
{
  "aps": {
    "alert": {
      "title": "Título",
      "body": "Mensagem"
    },
    "badge": 1,
    "sound": "default"
  }
}
```

### Tipos de Notificação

| Tipo | Descrição |
|------|-----------|
| `risk_alert` | Alerta de risco detectado |
| `achievement` | Nova conquista desbloqueada |
| `reminder` | Lembrete de atividade |
| `weekly_report` | Resumo semanal |
| `new_content` | Novo conteúdo disponível |

## WhatsApp

### Webhook

```bash
POST /api/whatsapp/webhook
```

### Comandos do Bot

| Comando | Descrição |
|---------|-----------|
| `oi` / `olá` | Menu de ajuda |
| `status` | Ver progresso |
| `emergencia` | Recursos de emergência |
| `ajuda` | Lista de comandos |

### Templates

```typescript
// Boas-vindas
"Olá {{name}}! Bem-vinda ao Radar Narcisista."

// Alerta de risco
"⚠️ {{name}}, detectamos sinais de risco. Acesse: {{link}}"

// Lembrete
"📝 {{name}}, que tal registrar como você está?"

// Conquista
"🎉 Parabéns {{name}}! Você desbloqueou: {{achievement}}"
```

## Modo Offline

### Armazenamento Local

O app deve armazenar localmente:
- Entradas do diário (últimas 100)
- Mensagens do chat (últimas 100)
- Perfil do usuário
- Configurações

### Resolução de Conflitos

Estratégias:
- `server_wins` - Servidor tem prioridade
- `client_wins` - Cliente tem prioridade
- `merge` - Mesclar alterações
- `manual` - Usuário decide

### Fila de Sincronização

```typescript
interface OfflineEntry {
  id: string
  type: 'journal' | 'chat'
  data: any
  createdAt: string
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed'
  retryCount: number
}
```

## Erros

### Códigos HTTP

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 429 | Rate limit |
| 500 | Erro interno |

### Formato de Erro

```json
{
  "error": "Mensagem de erro",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Rate Limiting

| Endpoint | Limite |
|----------|--------|
| `/api/mobile` | 100/min |
| `/api/chat` | 30/min |
| `/api/diario` | 60/min |

## Segurança

### Headers Requeridos

```
Authorization: Bearer <token>
X-Device-ID: <device-uuid>
X-App-Version: 1.0.0
X-Platform: ios|android
```

### Certificado SSL

Todas as requisições devem usar HTTPS.

### Token Refresh

Tokens expiram em 1 hora. Use refresh token para renovar.

## Exemplos

### React Native

```typescript
import { useState, useEffect } from 'react';

const API_URL = 'https://radarnarcisista.com.br/api';

async function fetchUserData(token: string) {
  const response = await fetch(`${API_URL}/mobile?action=user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Platform': 'ios'
    }
  });
  return response.json();
}

async function syncOfflineData(token: string, data: any) {
  const response = await fetch(`${API_URL}/mobile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}
```

### Flutter

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class MobileApi {
  static const String baseUrl = 'https://radarnarcisista.com.br/api';
  
  Future<Map<String, dynamic>> getUserData(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/mobile?action=user'),
      headers: {'Authorization': 'Bearer $token'},
    );
    return jsonDecode(response.body);
  }
}
```

## Suporte

- Documentação: /docs/api
- Status: /status
- Email: dev@radarnarcisista.com.br
