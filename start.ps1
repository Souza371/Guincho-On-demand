#!/usr/bin/env pwsh

param(
    [string]$Component = "all"
)

Write-Host "=== Guincho On-Demand - Sistema Completo ===" -ForegroundColor Cyan
Write-Host "Iniciando componente: $Component" -ForegroundColor Yellow
Write-Host ""

function Start-Backend {
    Write-Host "🚀 Iniciando Backend (API)..." -ForegroundColor Green
    
    Set-Location "backend"
    
    # Verificar se Docker está rodando
    $dockerRunning = docker ps 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Docker não está rodando. Inicie o Docker Desktop primeiro." -ForegroundColor Red
        return
    }
    
    # Instalar dependências se necessário
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
        npm install
    }
    
    # Iniciar banco de dados
    Write-Host "🐘 Iniciando PostgreSQL..." -ForegroundColor Yellow
    docker-compose up -d
    
    Start-Sleep -Seconds 5
    
    # Configurar banco
    Write-Host "🔧 Configurando banco de dados..." -ForegroundColor Yellow
    npx prisma generate
    npx prisma db push
    
    # Iniciar servidor
    Write-Host "🌐 Iniciando servidor API..." -ForegroundColor Green
    npm run dev
    
    Set-Location ".."
}

function Start-Mobile {
    Write-Host "📱 Preparando Aplicativo Mobile..." -ForegroundColor Green
    
    Set-Location "mobile"
    
    # Instalar dependências se necessário
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host "✅ Mobile app preparado!" -ForegroundColor Green
    Write-Host "Para executar:"
    Write-Host "  Android: npx react-native run-android" -ForegroundColor Cyan
    Write-Host "  iOS: npx react-native run-ios" -ForegroundColor Cyan
    
    Set-Location ".."
}

function Start-WebAdmin {
    Write-Host "💻 Iniciando Painel Web Admin..." -ForegroundColor Green
    
    Set-Location "web-admin"
    
    # Instalar dependências se necessário
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
        npm install
    }
    
    # Iniciar servidor de desenvolvimento
    Write-Host "🌐 Iniciando servidor web..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"
    
    Set-Location ".."
}

function Show-Status {
    Write-Host "📊 Status dos Serviços:" -ForegroundColor Cyan
    Write-Host ""
    
    # Verificar Docker
    $dockerRunning = docker ps 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker: Rodando" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker: Parado" -ForegroundColor Red
    }
    
    # Verificar PostgreSQL
    $postgresRunning = docker ps --filter "name=postgres" --format "table {{.Names}}" 2>$null
    if ($postgresRunning -match "postgres") {
        Write-Host "✅ PostgreSQL: Rodando" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL: Parado" -ForegroundColor Red
    }
    
    # Verificar portas
    $apiRunning = netstat -an | Select-String ":3001"
    if ($apiRunning) {
        Write-Host "✅ API Backend: Rodando (porta 3001)" -ForegroundColor Green
    } else {
        Write-Host "⏸️  API Backend: Parado" -ForegroundColor Yellow
    }
    
    $webRunning = netstat -an | Select-String ":3000"
    if ($webRunning) {
        Write-Host "✅ Web Admin: Rodando (porta 3000)" -ForegroundColor Green
    } else {
        Write-Host "⏸️  Web Admin: Parado" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🌐 URLs de Acesso:" -ForegroundColor Cyan
    Write-Host "  API Backend: http://localhost:3001" -ForegroundColor White
    Write-Host "  Painel Admin: http://localhost:3000" -ForegroundColor White
    Write-Host ""
    Write-Host "🔐 Login Admin:" -ForegroundColor Cyan
    Write-Host "  Email: admin@guincho.com" -ForegroundColor White
    Write-Host "  Senha: 123456" -ForegroundColor White
}

function Show-Help {
    Write-Host "🔧 Uso: .\start.ps1 [componente]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Componentes disponíveis:" -ForegroundColor Yellow
    Write-Host "  all      - Inicia todos os componentes" -ForegroundColor White
    Write-Host "  backend  - Inicia apenas o backend (API + DB)" -ForegroundColor White
    Write-Host "  web      - Inicia apenas o painel web admin" -ForegroundColor White
    Write-Host "  mobile   - Prepara o aplicativo mobile" -ForegroundColor White
    Write-Host "  status   - Mostra status dos serviços" -ForegroundColor White
    Write-Host "  help     - Mostra esta ajuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Exemplos:" -ForegroundColor Yellow
    Write-Host "  .\start.ps1" -ForegroundColor Cyan
    Write-Host "  .\start.ps1 backend" -ForegroundColor Cyan
    Write-Host "  .\start.ps1 status" -ForegroundColor Cyan
}

# Função principal
switch ($Component.ToLower()) {
    "backend" {
        Start-Backend
    }
    "web" {
        Start-WebAdmin
    }
    "mobile" {
        Start-Mobile
    }
    "status" {
        Show-Status
    }
    "help" {
        Show-Help
    }
    "all" {
        Write-Host "🚀 Iniciando sistema completo..." -ForegroundColor Cyan
        Write-Host ""
        
        # Iniciar backend em background
        Write-Host "1️⃣ Iniciando Backend..." -ForegroundColor Yellow
        Start-Job -ScriptBlock {
            Set-Location $using:PWD
            Start-Backend
        } -Name "GuinchoBackend"
        
        Start-Sleep -Seconds 10
        
        # Iniciar web admin
        Write-Host "2️⃣ Iniciando Web Admin..." -ForegroundColor Yellow
        Start-WebAdmin
        
        Start-Sleep -Seconds 5
        
        # Preparar mobile
        Write-Host "3️⃣ Preparando Mobile..." -ForegroundColor Yellow
        Start-Mobile
        
        Write-Host ""
        Write-Host "🎉 Sistema iniciado com sucesso!" -ForegroundColor Green
        Show-Status
    }
    default {
        Show-Help
    }
}

Write-Host ""
Write-Host "✨ Comando concluído!" -ForegroundColor Green