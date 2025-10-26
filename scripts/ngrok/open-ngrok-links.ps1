# Open Ngrok Related Links
# Quick access to important ngrok URLs

param(
    [switch]$Dashboard,
    [switch]$Download,
    [switch]$Signup,
    [switch]$Docs,
    [switch]$Local,
    [switch]$All
)

function Open-Url {
    param([string]$Url, [string]$Description)
    Write-Host "🌐 Opening: $Description" -ForegroundColor Cyan
    Start-Process $Url
}

Write-Host "`n🔗 Ngrok Quick Links`n" -ForegroundColor Green -BackgroundColor Black

if ($Dashboard -or $All) {
    Open-Url "https://dashboard.ngrok.com" "Ngrok Dashboard"
}

if ($Download -or $All) {
    Open-Url "https://ngrok.com/download" "Ngrok Download Page"
}

if ($Signup -or $All) {
    Open-Url "https://dashboard.ngrok.com/signup" "Ngrok Signup"
}

if ($Docs -or $All) {
    Open-Url "https://ngrok.com/docs" "Ngrok Documentation"
}

if ($Local -or $All) {
    Write-Host "`n⚠️  Checking local ngrok web interface..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:4040" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Open-Url "http://127.0.0.1:4040" "Local Ngrok Web Interface"
    } catch {
        Write-Host "❌ Ngrok is not running locally" -ForegroundColor Red
        Write-Host "   Start a tunnel first, then this interface will be available" -ForegroundColor Gray
    }
}

if (-not ($Dashboard -or $Download -or $Signup -or $Docs -or $Local -or $All)) {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\open-ngrok-links.ps1 -Dashboard   # Open dashboard" -ForegroundColor White
    Write-Host "  .\open-ngrok-links.ps1 -Download    # Open download page" -ForegroundColor White
    Write-Host "  .\open-ngrok-links.ps1 -Signup      # Open signup page" -ForegroundColor White
    Write-Host "  .\open-ngrok-links.ps1 -Docs        # Open documentation" -ForegroundColor White
    Write-Host "  .\open-ngrok-links.ps1 -Local       # Open local web UI (4040)" -ForegroundColor White
    Write-Host "  .\open-ngrok-links.ps1 -All         # Open all links" -ForegroundColor White
    Write-Host ""
}

Write-Host ""

