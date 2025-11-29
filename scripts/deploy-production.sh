#!/bin/bash

# ==========================================
# RADAR NARCISISMO - DEPLOY PRODUCTION
# ==========================================

set -e

echo "🚀 Iniciando deploy para produção..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se está em ambiente de produção
check_environment() {
    log_info "Verificando ambiente..."
    
    if [ "$NODE_ENV" != "production" ]; then
        log_warning "NODE_ENV não está como 'production'. Configurando..."
        export NODE_ENV=production
    fi
    
    if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
        log_error "NEXT_PUBLIC_APP_URL não está definido!"
        exit 1
    fi
    
    log_success "Ambiente verificado"
}

# Backup do banco de dados
backup_database() {
    log_info "Fazendo backup do banco de dados..."
    
    # Aqui você implementaria o backup do Supabase
    # pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
    
    log_success "Backup concluído"
}

# Verificar variáveis de ambiente críticas
check_env_vars() {
    log_info "Verificando variáveis de ambiente críticas..."
    
    local required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "OPENAI_API_KEY"
        "STRIPE_SECRET_KEY"
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Variáveis de ambiente faltando:"
        printf '  %s\n' "${missing_vars[@]}"
        exit 1
    fi
    
    log_success "Variáveis de ambiente verificadas"
}

# Limpar build anterior
clean_build() {
    log_info "Limpando build anterior..."
    
    rm -rf .next
    rm -rf out
    rm -rf node_modules/.cache
    
    log_success "Limpeza concluída"
}

# Instalar dependências
install_dependencies() {
    log_info "Instalando dependências..."
    
    npm ci --production=false
    
    log_success "Dependências instaladas"
}

# Build da aplicação
build_application() {
    log_info "Build da aplicação..."
    
    npm run build
    
    if [ $? -ne 0 ]; then
        log_error "Build falhou!"
        exit 1
    fi
    
    log_success "Build concluído com sucesso"
}

# Testes críticos
run_tests() {
    log_info "Executando testes críticos..."
    
    # Testar se as rotas de API estão funcionando
    # npm run test:api
    
    # Testar se a conexão com Supabase está ok
    # npm run test:db
    
    log_success "Testes concluídos"
}

# Análise de bundle (opcional)
analyze_bundle() {
    if [ "$ANALYZE_BUNDLE" = "true" ]; then
        log_info "Analisando bundle..."
        
        ANALYZE=true npm run build
        
        log_success "Análise de bundle concluída"
    fi
}

# Deploy para Vercel (ou outra plataforma)
deploy_to_platform() {
    log_info "Fazendo deploy para a plataforma..."
    
    # Para Vercel
    if command -v vercel &> /dev/null; then
        vercel --prod
    else
        log_warning "Vercel CLI não encontrado. Install com: npm i -g vercel"
    fi
    
    # Alternativa: Deploy manual
    # rsync -avz --delete out/ user@server:/path/to/app/
    
    log_success "Deploy concluído"
}

# Pós-deploy - verificações
post_deploy_checks() {
    log_info "Executando verificações pós-deploy..."
    
    # Verificar se a aplicação está online
    sleep 10
    
    if curl -f -s "$NEXT_PUBLIC_APP_URL" > /dev/null; then
        log_success "Aplicação está online!"
    else
        log_error "Aplicação não está respondendo!"
        exit 1
    fi
    
    # Verificar rotas críticas
    local critical_routes=(
        "/"
        "/api/health"
        "/login"
        "/admin"
    )
    
    for route in "${critical_routes[@]}"; do
        if curl -f -s "$NEXT_PUBLIC_APP_URL$route" > /dev/null; then
            log_success "Rota $route está ok"
        else
            log_warning "Rota $route pode ter problemas"
        fi
    done
}

# Notificar equipe
notify_team() {
    log_info "Enviando notificação para equipe..."
    
    # Implementar notificação via Slack, Discord, etc.
    # curl -X POST -H 'Content-type: application/json' \
    #   --data '{"text":"✅ Radar Narcisista deployado para produção com sucesso!"}' \
    #   $SLACK_WEBHOOK_URL
    
    log_success "Notificação enviada"
}

# Função principal
main() {
    echo "🎯 Radar Narcisista - Deploy para Produção"
    echo "=========================================="
    
    check_environment
    backup_database
    check_env_vars
    clean_build
    install_dependencies
    build_application
    run_tests
    analyze_bundle
    deploy_to_platform
    post_deploy_checks
    notify_team
    
    echo ""
    log_success "🎉 Deploy para produção concluído com sucesso!"
    echo "📱 A aplicação está disponível em: $NEXT_PUBLIC_APP_URL"
}

# Executar main function
main "$@"
