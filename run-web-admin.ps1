#!/usr/bin/env pwsh

Write-Host "=== Instalando dependências do Painel Web Admin ===" -ForegroundColor Cyan

# Navegar para o diretório web-admin
Set-Location "web-admin"

# Instalar dependências
Write-Host "Instalando dependências..." -ForegroundColor Yellow
npm install

# Verificar se a instalação foi bem-sucedida
if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependências instaladas com sucesso!" -ForegroundColor Green
    
    # Iniciar o servidor de desenvolvimento
    Write-Host "Iniciando servidor de desenvolvimento..." -ForegroundColor Yellow
    npm start
} else {
    Write-Host "Erro ao instalar dependências!" -ForegroundColor Red
    exit 1
}