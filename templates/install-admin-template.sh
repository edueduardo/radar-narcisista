#!/bin/bash

# ============================================
# INSTALL ADMIN TEMPLATE - Para Novos SaaS
# ============================================
# Uso: ./install-admin-template.sh <nome-do-saas> <cor-principal>
# Exemplo: ./install-admin-template.sh "Padaria Digital" blue

set -e

# Verificar argumentos
if [ $# -lt 2 ]; then
    echo "❌ Erro: Argumentos insuficientes"
    echo "Uso: $0 \"<Nome do SaaS>\" <cor-principal>"
    echo "Exemplo: $0 \"Padaria Digital\" blue"
    echo "Cores disponíveis: blue, green, red, yellow, purple, pink, indigo"
    exit 1
fi

NOME_SAAS="$1"
COR_PRINCIPAL="$2"
SLUG_SAAS=$(echo "$NOME_SAAS" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')

echo "🚀 Instalando Admin Template..."
echo "📦 SaaS: $NOME_SAAS"
echo "🎨 Cor: $COR_PRINCIPAL"
echo "🏷️  Slug: $SLUG_SAAS"

# Verificar se estamos no diretório certo
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto Next.js"
    exit 1
fi

# Criar estrutura de diretórios
echo "📁 Criando estrutura de diretórios..."
mkdir -p app/admin/menu-config
mkdir -p app/api/admin
mkdir -p lib
mkdir -p components

# Copiar arquivos do template
echo "📋 Copiando arquivos do template..."

# App Router
cp app/admin/page.tsx app/admin/page.tsx.bak 2>/dev/null || true
cp app/admin/AdminClient.tsx app/admin/AdminClient.tsx.bak 2>/dev/null || true
cp app/admin/menu-config/page.tsx app/admin/menu-config/page.tsx.bak 2>/dev/null || true

# Libraries
cp lib/admin-menu-config.ts lib/admin-menu-config.ts.bak 2>/dev/null || true
cp lib/admin-storage.ts lib/admin-storage.ts.bak 2>/dev/null || true
cp lib/ia-registry.ts lib/ia-registry.ts.bak 2>/dev/null || true

# Components
cp components/AdminSidebar.tsx components/AdminSidebar.tsx.bak 2>/dev/null || true

# Substituir placeholders
echo "🔄 Personalizando template..."

find app/admin lib components -name "*.tsx" -o -name "*.ts" | while read file; do
    if [ -f "$file" ]; then
        sed -i.bak "s/Radar Narcisista/$NOME_SAAS/g" "$file"
        sed -i.bak "s/narcisista/$SLUG_SAAS/g" "$file"
        sed -i.bak "s/purple-400/$COR_PRINCIPAL-400/g" "$file"
        sed -i.bak "s/purple-600/$COR_PRINCIPAL-600/g" "$file"
        sed -i.bak "s/purple-500/$COR_PRINCIPAL-500/g" "$file"
        echo "✅ Processado: $file"
    fi
done

# Criar menu personalizado
echo "⚙️ Criando menu personalizado..."
cat > lib/admin-menu-config.ts << EOF
// Menu personalizado para $NOME_SAAS
export const DEFAULT_MENU_ITEMS: AdminMenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'Layout', enabled: true, order: 1 },
  { id: 'users', label: 'Usuários', icon: 'Users', enabled: true, order: 2 },
  { id: 'settings', label: 'Configurações', icon: 'Settings', enabled: true, order: 3 },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3', enabled: true, order: 4 },
]

// Adicione mais itens conforme necessário...
EOF

# Instalar dependências
echo "📦 Instalando dependências..."
npm install @supabase/auth-helpers-nextjs lucide-react

# Criar arquivo de configuração
echo "📝 Criando arquivo de configuração..."
cat > admin-config.json << EOF
{
  "nome": "$NOME_SAAS",
  "slug": "$SLUG_SAAS",
  "corPrincipal": "$COR_PRINCIPAL",
  "instaladoEm": "$(date)",
  "versao": "1.0.0"
}
EOF

# Limpar arquivos .bak
echo "🧹 Limpando arquivos temporários..."
find . -name "*.bak" -delete 2>/dev/null || true

echo ""
echo "🎉 Admin Template instalado com sucesso!"
echo ""
echo "📋 Resumo:"
echo "   • Nome: $NOME_SAAS"
echo "   • Slug: $SLUG_SAAS"
echo "   • Cor: $COR_PRINCIPAL"
echo "   • Menu: Configurado com itens básicos"
echo ""
echo "🚀 Próximos passos:"
echo "   1. Configure o Supabase (.env.local)"
echo "   2. Personalize os itens do menu em lib/admin-menu-config.ts"
echo "   3. Adicione suas páginas específicas"
echo "   4. npm run dev"
echo ""
echo "📚 Documentação: templates/README_ADMIN_TEMPLATE.md"
echo ""
echo "✨ Divirta-se desenvolvendo seu SaaS!"
