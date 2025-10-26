# Install Ngrok for Windows
# This script downloads and installs ngrok

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "   NGROK INSTALLER" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# Check if Chocolatey is installed
Write-Host "Checking for Chocolatey..." -ForegroundColor Yellow
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

if ($chocoInstalled) {
    Write-Host "[OK] Chocolatey is installed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Installing ngrok via Chocolatey..." -ForegroundColor Cyan
    
    if ($isAdmin) {
        choco install ngrok -y
        Write-Host ""
        Write-Host "[OK] Ngrok installed successfully!" -ForegroundColor Green
        
        # Verify installation
        $ngrokVersion = ngrok version 2>$null
        if ($ngrokVersion) {
            Write-Host "[OK] Verified: $ngrokVersion" -ForegroundColor Green
        }
    } else {
        Write-Host "[WARN] Please run PowerShell as Administrator to install via Chocolatey" -ForegroundColor Yellow
        Write-Host "   Right-click PowerShell -> Run as Administrator" -ForegroundColor Gray
        Write-Host "   Then run: choco install ngrok -y" -ForegroundColor Cyan
    }
} else {
    Write-Host "[INFO] Chocolatey not installed" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Downloading ngrok manually..." -ForegroundColor Cyan
    Write-Host ""
    
    # Create ngrok directory
    $ngrokDir = "$env:USERPROFILE\ngrok"
    if (!(Test-Path $ngrokDir)) {
        New-Item -ItemType Directory -Path $ngrokDir -Force | Out-Null
        Write-Host "[OK] Created directory: $ngrokDir" -ForegroundColor Green
    }
    
    # Download ngrok
    $ngrokZip = "$ngrokDir\ngrok.zip"
    $downloadUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
    
    Write-Host "Downloading ngrok from official source..." -ForegroundColor Cyan
    Write-Host "   URL: $downloadUrl" -ForegroundColor Gray
    
    try {
        # Download using Invoke-WebRequest
        Invoke-WebRequest -Uri $downloadUrl -OutFile $ngrokZip -UseBasicParsing
        Write-Host "[OK] Download complete!" -ForegroundColor Green
        
        # Extract
        Write-Host "Extracting..." -ForegroundColor Cyan
        Expand-Archive -Path $ngrokZip -DestinationPath $ngrokDir -Force
        Remove-Item $ngrokZip
        Write-Host "[OK] Extracted to: $ngrokDir" -ForegroundColor Green
        
        # Add to PATH
        Write-Host ""
        Write-Host "Adding to PATH..." -ForegroundColor Cyan
        
        $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($currentPath -notlike "*$ngrokDir*") {
            $newPath = "$currentPath;$ngrokDir"
            [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
            Write-Host "[OK] Added to PATH (restart terminal to use)" -ForegroundColor Green
            
            # Also add to current session
            $env:Path = "$env:Path;$ngrokDir"
            Write-Host "[OK] Added to current session" -ForegroundColor Green
        } else {
            Write-Host "[OK] Already in PATH" -ForegroundColor Green
        }
        
        # Verify
        Write-Host ""
        Write-Host "Verifying installation..." -ForegroundColor Yellow
        $ngrokExe = Join-Path $ngrokDir "ngrok.exe"
        
        if (Test-Path $ngrokExe) {
            $version = & $ngrokExe version 2>$null
            Write-Host "[OK] Installation successful!" -ForegroundColor Green
            Write-Host "   Version: $version" -ForegroundColor Cyan
            Write-Host "   Location: $ngrokExe" -ForegroundColor Cyan
        }
        
    } catch {
        Write-Host "[ERROR] Download failed: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please download manually:" -ForegroundColor Yellow
        Write-Host "  1. Visit: https://ngrok.com/download" -ForegroundColor Cyan
        Write-Host "  2. Download Windows (64-bit) version" -ForegroundColor Cyan
        Write-Host "  3. Extract to: $ngrokDir" -ForegroundColor Cyan
        exit 1
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "   NEXT STEPS" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Get your free authtoken:" -ForegroundColor Yellow
Write-Host "   https://dashboard.ngrok.com/signup" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Configure ngrok:" -ForegroundColor Yellow
Write-Host "   ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor Magenta
Write-Host ""
Write-Host "3. Start a tunnel:" -ForegroundColor Yellow
Write-Host "   .\scripts\ngrok\start-mongo-express-tunnel.ps1" -ForegroundColor Magenta
Write-Host ""
Write-Host "Need help? Read: QUICK_START_NGROK.md" -ForegroundColor Gray
Write-Host ""
Write-Host "[!] If ngrok command not found, restart your terminal!" -ForegroundColor Yellow
Write-Host ""
