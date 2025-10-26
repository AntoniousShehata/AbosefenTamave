# Start Ngrok Tunnel for MongoDB
# This script exposes your local MongoDB to the internet

Write-Host "🚀 Starting Ngrok Tunnel for MongoDB..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker services are running
Write-Host "📦 Checking Docker services..." -ForegroundColor Yellow
$dockerRunning = docker ps --filter "name=mongodb" --format "{{.Names}}"

if ($dockerRunning -match "mongodb") {
    Write-Host "✅ MongoDB container is running" -ForegroundColor Green
} else {
    Write-Host "❌ MongoDB container is not running!" -ForegroundColor Red
    Write-Host "Please start Docker services first:" -ForegroundColor Yellow
    Write-Host "  cd backend && docker-compose up -d" -ForegroundColor Cyan
    exit 1
}

# Find ngrok executable
Write-Host ""
Write-Host "Checking ngrok installation..." -ForegroundColor Yellow

$ngrokCmd = $null

# Try common locations
$locations = @(
    "ngrok",  # In PATH
    "$env:USERPROFILE\ngrok\ngrok.exe",  # User directory
    ".\ngrok.exe",  # Current directory
    "$PSScriptRoot\..\..\ngrok.exe"  # Project root
)

foreach ($loc in $locations) {
    try {
        $testCmd = Get-Command $loc -ErrorAction Stop 2>$null
        if ($testCmd) {
            $ngrokCmd = $loc
            break
        }
    } catch {
        try {
            if (Test-Path $loc) {
                $ngrokCmd = $loc
                break
            }
        } catch {}
    }
}

if ($ngrokCmd) {
    $version = & $ngrokCmd version 2>$null
    Write-Host "[OK] Ngrok found: $version" -ForegroundColor Green
    Write-Host "     Location: $ngrokCmd" -ForegroundColor Gray
} else {
    Write-Host "[ERROR] Ngrok not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Quick install:" -ForegroundColor Yellow
    Write-Host "  1. Download: https://ngrok.com/download" -ForegroundColor Cyan
    Write-Host "  2. Extract ngrok.exe to: $env:USERPROFILE\ngrok\" -ForegroundColor Cyan
    Write-Host "  3. Run this script again" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or read: INSTALL_NGROK_WINDOWS.md" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "🌐 Starting ngrok tunnel on port 27017..." -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "📊 Database Information:" -ForegroundColor Yellow
Write-Host "  Database: MongoDB 7.0" -ForegroundColor White
Write-Host "  Local Port: 27017" -ForegroundColor White
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: AbosefenMongo2024!" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Databases:" -ForegroundColor Yellow
Write-Host "  - abosefen-auth (Users & Sessions)" -ForegroundColor White
Write-Host "  - abosefen-catalog (Products & Categories)" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "📱 After ngrok starts:" -ForegroundColor Green
Write-Host "  1. Copy the Forwarding URL (e.g., tcp://0.tcp.ngrok.io:12345)" -ForegroundColor Cyan
Write-Host "  2. Use this connection string:" -ForegroundColor Cyan
Write-Host "     mongodb://admin:AbosefenMongo2024!@<NGROK-HOST>:<PORT>/abosefen-catalog?authSource=admin" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Ngrok Web Interface: http://127.0.0.1:4040" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press Ctrl+C to stop the tunnel" -ForegroundColor Yellow
Write-Host ""

# Start ngrok
& $ngrokCmd tcp 27017

