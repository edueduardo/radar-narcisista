# ============================================
# SCRIPT DE TESTE - MAPA DE IAS
# Execute: .\scripts\test-mapa-ias.ps1
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   TESTE AUTOMATIZADO - MAPA DE IAS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$passed = 0
$failed = 0

# ============================================
# PARTE 1: VERIFICAR ARQUIVOS
# ============================================
Write-Host "📁 PARTE 1: Verificando arquivos..." -ForegroundColor Yellow
Write-Host ""

$files = @(
    "app\admin\mapa-ias\page.tsx",
    "app\admin\mapa-ias\AIMapClient.tsx",
    "app\api\admin\ai-map\route.ts",
    "database\migrate-ai-agents.sql",
    "database\ai-agents-mock.json",
    "components\AITreeView.tsx",
    "components\AIMetricsCharts.tsx",
    "components\AIBackupManager.tsx",
    "components\AIGuardian.tsx",
    "components\AILayerView.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ❌ $file - NAO ENCONTRADO!" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""

# ============================================
# PARTE 2: TESTAR API
# ============================================
Write-Host "🔌 PARTE 2: Testando API..." -ForegroundColor Yellow
Write-Host ""

# Teste API Real
Write-Host "  Testando /api/admin/ai-map (modo real)..." -ForegroundColor Gray
try {
    $responseReal = Invoke-RestMethod -Uri "$baseUrl/api/admin/ai-map" -Method GET -TimeoutSec 10
    if ($responseReal.success -eq $true) {
        Write-Host "  ✅ API Real respondeu - mode: $($responseReal.mode)" -ForegroundColor Green
        $passed++
        
        if ($responseReal.mode -eq "real") {
            Write-Host "     → Conectado ao Supabase!" -ForegroundColor Cyan
        } elseif ($responseReal.mode -eq "real_empty") {
            Write-Host "     → Supabase conectado mas tabelas vazias" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ❌ API Real retornou erro" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ API Real FALHOU - Servidor rodando? (npm run dev)" -ForegroundColor Red
    Write-Host "     Erro: $($_.Exception.Message)" -ForegroundColor DarkRed
    $failed++
}

# Teste API Mock
Write-Host "  Testando /api/admin/ai-map?mock=true..." -ForegroundColor Gray
try {
    $responseMock = Invoke-RestMethod -Uri "$baseUrl/api/admin/ai-map?mock=true" -Method GET -TimeoutSec 10
    if ($responseMock.success -eq $true -and $responseMock.mode -eq "mock") {
        Write-Host "  ✅ API Mock respondeu - mode: mock" -ForegroundColor Green
        Write-Host "     → $($responseMock.data.agents.Count) IAs no mock" -ForegroundColor Cyan
        $passed++
    } else {
        Write-Host "  ❌ API Mock nao retornou mode=mock" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ API Mock FALHOU" -ForegroundColor Red
    $failed++
}

Write-Host ""

# ============================================
# PARTE 3: COMPARAR REAL vs MOCK
# ============================================
Write-Host "🔍 PARTE 3: Comparando Real vs Mock..." -ForegroundColor Yellow
Write-Host ""

try {
    $realJson = (Invoke-RestMethod -Uri "$baseUrl/api/admin/ai-map" -Method GET) | ConvertTo-Json -Depth 1
    $mockJson = (Invoke-RestMethod -Uri "$baseUrl/api/admin/ai-map?mock=true" -Method GET) | ConvertTo-Json -Depth 1
    
    if ($realJson -ne $mockJson) {
        Write-Host "  ✅ Real e Mock sao DIFERENTES (correto!)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ⚠️ Real e Mock sao IGUAIS - modo real pode nao estar funcionando" -ForegroundColor Yellow
        $failed++
    }
} catch {
    Write-Host "  ❌ Nao foi possivel comparar" -ForegroundColor Red
    $failed++
}

Write-Host ""

# ============================================
# PARTE 4: TESTAR PAGINA
# ============================================
Write-Host "🖥️ PARTE 4: Testando pagina..." -ForegroundColor Yellow
Write-Host ""

try {
    $pageResponse = Invoke-WebRequest -Uri "$baseUrl/admin/mapa-ias" -Method GET -TimeoutSec 15 -UseBasicParsing
    if ($pageResponse.StatusCode -eq 200) {
        Write-Host "  ✅ Pagina /admin/mapa-ias carrega (status 200)" -ForegroundColor Green
        $passed++
        
        # Verificar se contem elementos esperados
        $content = $pageResponse.Content
        
        if ($content -match "Mapa das IAs" -or $content -match "mapa-ias") {
            Write-Host "  ✅ Titulo 'Mapa das IAs' encontrado" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "  ⚠️ Titulo nao encontrado no HTML" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "  ❌ Pagina retornou status $($pageResponse.StatusCode)" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ Pagina FALHOU ao carregar" -ForegroundColor Red
    Write-Host "     Erro: $($_.Exception.Message)" -ForegroundColor DarkRed
    $failed++
}

Write-Host ""

# ============================================
# RESUMO FINAL
# ============================================
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   RESUMO DO TESTE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ✅ Passou: $passed" -ForegroundColor Green
Write-Host "  ❌ Falhou: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "  🎉 TODOS OS TESTES PASSARAM!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Proximo passo: Abra o navegador em:" -ForegroundColor Cyan
    Write-Host "  $baseUrl/admin/mapa-ias" -ForegroundColor White
} elseif ($failed -le 2) {
    Write-Host "  ⚠️ ALGUNS TESTES FALHARAM" -ForegroundColor Yellow
    Write-Host "  Verifique se o servidor esta rodando: npm run dev" -ForegroundColor Gray
} else {
    Write-Host "  🚨 MUITOS TESTES FALHARAM" -ForegroundColor Red
    Write-Host "  Verifique:" -ForegroundColor Gray
    Write-Host "  1. npm run dev esta rodando?" -ForegroundColor Gray
    Write-Host "  2. Arquivos foram criados corretamente?" -ForegroundColor Gray
    Write-Host "  3. Variaveis .env.local estao configuradas?" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
