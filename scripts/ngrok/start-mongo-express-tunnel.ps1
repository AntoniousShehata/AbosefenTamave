# Start Ngrok Tunnel for Mongo Express UI
# This script exposes the MongoDB web admin interface to the internet

Write-Host "🚀 Starting Ngrok Tunnel for Mongo Express UI..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker services are running
Write-Host "📦 Checking Docker services..." -ForegroundColor Yellow
$dockerRunning = docker ps --filter "name=mongo-express" --format "{{.Names}}"

if ($dockerRunning -match "mongo-express") {
    Write-Host "✅ Mongo Express container is running" -ForegroundColor Green
} else {
    Write-Host "❌ Mongo Express container is not running!" -ForegroundColor Red
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
Write-Host "🌐 Starting ngrok tunnel on port 8081..." -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "📊 Mongo Express Information:" -ForegroundColor Yellow
Write-Host "  Service: MongoDB Admin UI" -ForegroundColor White
Write-Host "  Local URL: http://localhost:8081" -ForegroundColor White
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "📱 After ngrok starts:" -ForegroundColor Green
Write-Host "  1. Copy the Forwarding URL (e.g., https://xxxx-xx-xx-xx-xx.ngrok-free.app)" -ForegroundColor Cyan
Write-Host "  2. Open that URL in any browser" -ForegroundColor Cyan
Write-Host "  3. Login with credentials above" -ForegroundColor Cyan
Write-Host "  4. Browse and manage your MongoDB databases!" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Ngrok Web Interface: http://127.0.0.1:4040" -ForegroundColor Magenta
Write-Host ""
Write-Host "⚠️  Security Note: Anyone with the URL can access the login page!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the tunnel" -ForegroundColor Yellow
Write-Host ""

# Start ngrok
& $ngrokCmd http 8081

