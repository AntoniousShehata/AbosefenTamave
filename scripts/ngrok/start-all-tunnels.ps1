# Start All Ngrok Tunnels
# This script sets up multiple ngrok tunnels using a configuration file

Write-Host "🚀 Starting All Ngrok Tunnels..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker services are running
Write-Host "📦 Checking Docker services..." -ForegroundColor Yellow
$services = @("mongodb", "mongo-express", "api-gateway")
$allRunning = $true

foreach ($service in $services) {
    $dockerRunning = docker ps --filter "name=$service" --format "{{.Names}}"
    if ($dockerRunning -match $service) {
        Write-Host "  ✅ $service is running" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $service is NOT running" -ForegroundColor Red
        $allRunning = $false
    }
}

if (-not $allRunning) {
    Write-Host ""
    Write-Host "Please start Docker services first:" -ForegroundColor Yellow
    Write-Host "  cd backend && docker-compose up -d" -ForegroundColor Cyan
    exit 1
}

# Check if ngrok is installed
Write-Host ""
Write-Host "🔍 Checking ngrok installation..." -ForegroundColor Yellow

try {
    $ngrokVersion = ngrok version
    Write-Host "✅ Ngrok is installed: $ngrokVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Ngrok is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install ngrok:" -ForegroundColor Yellow
    Write-Host "  1. Visit: https://ngrok.com/download" -ForegroundColor Cyan
    Write-Host "  2. Download and extract ngrok.exe" -ForegroundColor Cyan
    Write-Host "  3. Add to PATH or use full path" -ForegroundColor Cyan
    exit 1
}

# Check for ngrok config
$ngrokConfigPath = Join-Path $env:USERPROFILE "AppData\Local\ngrok\ngrok.yml"
Write-Host ""
Write-Host "🔍 Checking ngrok configuration..." -ForegroundColor Yellow

if (Test-Path $ngrokConfigPath) {
    Write-Host "✅ Found ngrok config at: $ngrokConfigPath" -ForegroundColor Green
    
    $configContent = Get-Content $ngrokConfigPath -Raw
    if ($configContent -match "tunnels:") {
        Write-Host "✅ Configuration has tunnel definitions" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Starting all tunnels..." -ForegroundColor Cyan
        Write-Host ""
        ngrok start --all
    } else {
        Write-Host "⚠️  Config exists but no tunnels defined" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Please add tunnel configuration. Example:" -ForegroundColor Yellow
        Write-Host @"

tunnels:
  mongodb:
    proto: tcp
    addr: 27017
    
  mongo-express:
    proto: http
    addr: 8081
    
  api-gateway:
    proto: http
    addr: 8080
"@ -ForegroundColor Cyan
        exit 1
    }
} else {
    Write-Host "⚠️  No ngrok configuration found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Creating default configuration..." -ForegroundColor Cyan
    
    # Create config directory
    $configDir = Split-Path $ngrokConfigPath
    if (!(Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    
    # Get authtoken if available
    Write-Host ""
    Write-Host "⚠️  You need an ngrok authtoken!" -ForegroundColor Yellow
    Write-Host "  1. Sign up at: https://dashboard.ngrok.com/signup" -ForegroundColor Cyan
    Write-Host "  2. Get your token: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor Cyan
    Write-Host "  3. Run: ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor Cyan
    Write-Host ""
    
    # Create basic config
    $configContent = @"
version: "2"
authtoken: YOUR_AUTHTOKEN_HERE

tunnels:
  mongodb:
    proto: tcp
    addr: 27017
    
  mongo-express:
    proto: http
    addr: 8081
    
  api-gateway:
    proto: http
    addr: 8080
"@
    
    Set-Content -Path $ngrokConfigPath -Value $configContent
    Write-Host "✅ Created config at: $ngrokConfigPath" -ForegroundColor Green
    Write-Host "⚠️  Please add your authtoken and run this script again" -ForegroundColor Yellow
    
    # Open config in notepad
    notepad $ngrokConfigPath
}

