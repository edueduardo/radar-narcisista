# 🔄 SISTEMA DE BACKUP E REDUNDÂNCIA
## Radar Narcisista BR

---

# 📁 ESTRUTURA DE 3 NÍVEIS

```
c:\Users\teste\Desktop\BACKUPS_RADAR\
│
├── ATUAL/                    ← Espelho da versão atual
│   └── radar-narcisista/
│
├── ANTERIOR/                 ← 1 backup atrás
│   └── radar-narcisista_BACKUP_[DATA]/
│
└── ANTERIOR_2/               ← 2 backups atrás
    └── radar-narcisista_BACKUP_[DATA]/
```

---

# 🔧 SCRIPT DE BACKUP ROTATIVO

```javascript
// scripts/backup-rotativo.js

const fs = require('fs-extra')
const path = require('path')

const BACKUP_DIR = 'c:\\Users\\teste\\Desktop\\BACKUPS_RADAR'
const SOURCE_DIR = 'c:\\Users\\teste\\Desktop\\SaaS sobre narcisismo\\radar-narcisista'

const PASTAS_COPIAR = ['app', 'components', 'lib', 'database', 'types', 'public', 'scripts', 'docs']
const ARQUIVOS_COPIAR = [
  'package.json',
  'package-lock.json', 
  'tailwind.config.ts',
  'tsconfig.json',
  'next.config.ts',
  '.env.local',
  'BACKUP_AUTOMATICO.md',
  'README.md'
]

async function backupRotativo() {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
  
  console.log('🔄 Iniciando backup rotativo...')
  
  // Caminhos
  const anterior2 = path.join(BACKUP_DIR, 'ANTERIOR_2')
  const anterior = path.join(BACKUP_DIR, 'ANTERIOR')
  const atual = path.join(BACKUP_DIR, 'ATUAL')
  
  try {
    // 1. Deletar ANTERIOR_2 (mais antigo)
    if (await fs.pathExists(anterior2)) {
      console.log('🗑️ Removendo ANTERIOR_2...')
      await fs.remove(anterior2)
    }
    
    // 2. Mover ANTERIOR para ANTERIOR_2
    if (await fs.pathExists(anterior)) {
      console.log('📦 Movendo ANTERIOR → ANTERIOR_2...')
      await fs.move(anterior, anterior2)
    }
    
    // 3. Mover ATUAL para ANTERIOR
    if (await fs.pathExists(atual)) {
      console.log('📦 Movendo ATUAL → ANTERIOR...')
      await fs.move(anterior, anterior)
    }
    
    // 4. Criar novo ATUAL
    const novoAtual = path.join(atual, 'radar-narcisista')
    await fs.ensureDir(novoAtual)
    
    // 5. Copiar pastas
    for (const pasta of PASTAS_COPIAR) {
      const origem = path.join(SOURCE_DIR, pasta)
      const destino = path.join(novoAtual, pasta)
      if (await fs.pathExists(origem)) {
        await fs.copy(origem, destino)
        console.log(`✅ Pasta copiada: ${pasta}`)
      }
    }
    
    // 6. Copiar arquivos
    for (const arquivo of ARQUIVOS_COPIAR) {
      const origem = path.join(SOURCE_DIR, arquivo)
      const destino = path.join(novoAtual, arquivo)
      if (await fs.pathExists(origem)) {
        await fs.copy(origem, destino)
        console.log(`✅ Arquivo copiado: ${arquivo}`)
      }
    }
    
    // 7. Criar arquivo de timestamp
    const infoPath = path.join(novoAtual, 'BACKUP_INFO.txt')
    await fs.writeFile(infoPath, `
BACKUP ROTATIVO
===============
Data: ${new Date().toLocaleString('pt-BR')}
Timestamp: ${timestamp}
Origem: ${SOURCE_DIR}
Destino: ${atual}
    `.trim())
    
    console.log('')
    console.log('✅ BACKUP ROTATIVO CONCLUÍDO!')
    console.log(`📁 ATUAL: ${atual}`)
    console.log(`📁 ANTERIOR: ${anterior}`)
    console.log(`📁 ANTERIOR_2: ${anterior2}`)
    
  } catch (error) {
    console.error('❌ Erro no backup:', error)
  }
}

backupRotativo()
```

---

# 🔄 COMO FUNCIONA A ROTAÇÃO

```
ANTES DO BACKUP:
├── ATUAL/      → Versão de ontem
├── ANTERIOR/   → Versão de anteontem
└── ANTERIOR_2/ → Versão de 3 dias atrás

APÓS O BACKUP:
├── ATUAL/      → Versão de HOJE (nova)
├── ANTERIOR/   → Versão de ontem (era ATUAL)
└── ANTERIOR_2/ → Versão de anteontem (era ANTERIOR)

* A versão de 3 dias atrás é DELETADA
```

---

# 🚨 RECUPERAÇÃO DE BACKUP

## Opção 1: Recuperar Versão ATUAL
```bash
# Se algo deu errado AGORA
xcopy /E /I "BACKUPS_RADAR\ATUAL\radar-narcisista" "radar-narcisista" /Y
```

## Opção 2: Recuperar Versão ANTERIOR
```bash
# Se o problema começou hoje
xcopy /E /I "BACKUPS_RADAR\ANTERIOR\radar-narcisista" "radar-narcisista" /Y
```

## Opção 3: Recuperar Versão ANTERIOR_2
```bash
# Se o problema começou ontem
xcopy /E /I "BACKUPS_RADAR\ANTERIOR_2\radar-narcisista" "radar-narcisista" /Y
```

---

# 🔄 REDUNDÂNCIA EM PRODUÇÃO

## Cenário: Atualização sem Downtime

```
┌─────────────────────────────────────────────────────────────┐
│                    ARQUITETURA                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   USUÁRIOS                                                  │
│      │                                                      │
│      ▼                                                      │
│   ┌─────────────┐                                           │
│   │ LOAD        │                                           │
│   │ BALANCER    │                                           │
│   └──────┬──────┘                                           │
│          │                                                  │
│     ┌────┴────┐                                             │
│     │         │                                             │
│     ▼         ▼                                             │
│  ┌──────┐  ┌──────┐                                         │
│  │ APP  │  │ APP  │                                         │
│  │  A   │  │  B   │                                         │
│  │(v1.0)│  │(v1.0)│                                         │
│  └──────┘  └──────┘                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Processo de Atualização

```
PASSO 1: Tirar APP B do balanceador
         Usuários vão só para APP A

PASSO 2: Atualizar APP B para v1.1
         Testar APP B isoladamente

PASSO 3: Colocar APP B de volta
         Usuários vão para A ou B

PASSO 4: Tirar APP A do balanceador
         Usuários vão só para APP B (v1.1)

PASSO 5: Atualizar APP A para v1.1
         Testar APP A isoladamente

PASSO 6: Colocar APP A de volta
         Ambos em v1.1

RESULTADO: Zero downtime!
```

---

# 🔧 IMPLEMENTAÇÃO COM VERCEL

A Vercel já faz isso automaticamente:

1. **Deploy Atômico**: Nova versão só fica ativa quando 100% pronta
2. **Rollback Instantâneo**: Um clique para voltar versão anterior
3. **Preview Deployments**: Testar antes de ir para produção

## Como fazer rollback na Vercel:

```
1. Acessar dashboard.vercel.com
2. Ir em Deployments
3. Encontrar versão anterior
4. Clicar em "..." → "Promote to Production"
5. Confirmar
```

---

# 📊 BANCO DE DADOS (SUPABASE)

## Backups Automáticos
- Diários (últimos 7 dias)
- Point-in-time recovery
- Retenção configurável

## Como restaurar:
```
1. Acessar app.supabase.com
2. Ir em Settings → Database
3. Clicar em "Backups"
4. Selecionar data/hora
5. Clicar em "Restore"
```

---

# ⏰ AGENDAMENTO DE BACKUPS

## Windows (Task Scheduler)

```xml
<!-- backup-task.xml -->
<?xml version="1.0" encoding="UTF-16"?>
<Task>
  <Triggers>
    <CalendarTrigger>
      <StartBoundary>2025-01-01T03:00:00</StartBoundary>
      <ScheduleByDay>
        <DaysInterval>1</DaysInterval>
      </ScheduleByDay>
    </CalendarTrigger>
  </Triggers>
  <Actions>
    <Exec>
      <Command>node</Command>
      <Arguments>scripts/backup-rotativo.js</Arguments>
      <WorkingDirectory>C:\radar-narcisista</WorkingDirectory>
    </Exec>
  </Actions>
</Task>
```

## Comando para criar tarefa:
```bash
schtasks /create /tn "Backup Radar" /xml backup-task.xml
```

---

# ✅ CHECKLIST DE BACKUP

- [ ] Script backup-rotativo.js criado
- [ ] Pasta BACKUPS_RADAR existe
- [ ] Tarefa agendada no Windows
- [ ] Testado recuperação ATUAL
- [ ] Testado recuperação ANTERIOR
- [ ] Testado recuperação ANTERIOR_2
- [ ] Vercel configurado
- [ ] Supabase backups ativos

---

**Documento criado em 24/11/2025**
