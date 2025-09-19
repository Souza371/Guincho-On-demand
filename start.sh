#!/bin/bash

# Script de inicialização do projeto Guincho On-demand
# Usage: ./start.sh [backend|mobile|admin|all]

set -e

echo "🚛 Guincho On-demand - Inicializador de Desenvolvimento"
echo "=================================================="

# Função para iniciar backend
start_backend() {
    echo "🚀 Iniciando Backend API..."
    cd backend
    
    # Verificar se .env existe
    if [ ! -f .env ]; then
        echo "📄 Criando arquivo .env..."
        cp .env.example .env
    fi
    
    # Instalar dependências se necessário
    if [ ! -d node_modules ]; then
        echo "📦 Instalando dependências..."
        npm install
    fi
    
    # Gerar cliente Prisma
    echo "🔧 Gerando cliente Prisma..."
    npx prisma generate
    
    # Iniciar servidor
    echo "✅ Iniciando servidor em http://localhost:3000"
    npm run dev &
    cd ..
}

# Função para iniciar mobile
start_mobile() {
    echo "📱 Iniciando Mobile App..."
    cd mobile
    
    # Instalar dependências se necessário
    if [ ! -d node_modules ]; then
        echo "📦 Instalando dependências..."
        npm install
    fi
    
    echo "✅ Mobile App pronto para desenvolvimento"
    echo "Para Android: npx react-native run-android"
    echo "Para iOS: npx react-native run-ios"
    cd ..
}

# Função para iniciar web admin
start_admin() {
    echo "🖥️  Iniciando Web Admin..."
    cd web-admin
    
    # Instalar dependências se necessário
    if [ ! -d node_modules ]; then
        echo "📦 Instalando dependências..."
        npm install
    fi
    
    # Iniciar servidor
    echo "✅ Iniciando web admin em http://localhost:3001"
    npm start &
    cd ..
}

# Função para iniciar tudo
start_all() {
    echo "🌟 Iniciando todos os serviços..."
    start_backend
    sleep 3
    start_admin
    start_mobile
    
    echo ""
    echo "🎉 Todos os serviços foram iniciados!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔗 Backend API: http://localhost:3000"
    echo "🔗 Web Admin: http://localhost:3001"
    echo "📱 Mobile: Configure o emulador e rode npx react-native run-android"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: ./start.sh [OPÇÃO]"
    echo ""
    echo "Opções:"
    echo "  backend    Inicia apenas o backend API"
    echo "  mobile     Prepara o mobile app"
    echo "  admin      Inicia apenas o web admin"
    echo "  all        Inicia backend e web admin (padrão)"
    echo "  help       Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  ./start.sh backend"
    echo "  ./start.sh all"
}

# Verificar argumentos
case "${1:-all}" in
    backend)
        start_backend
        ;;
    mobile)
        start_mobile
        ;;
    admin)
        start_admin
        ;;
    all)
        start_all
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ Opção inválida: $1"
        show_help
        exit 1
        ;;
esac

echo ""
echo "🔄 Para parar os serviços, pressione Ctrl+C"
echo "📚 Consulte IMPLEMENTATION_STATUS.md para mais informações"

# Aguardar Ctrl+C
if [ "${1:-all}" = "all" ] || [ "$1" = "backend" ] || [ "$1" = "admin" ]; then
    wait
fi