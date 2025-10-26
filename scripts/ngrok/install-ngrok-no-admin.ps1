# Install Ngrok for Windows (No Admin Required)
# This script downloads ngrok to your user directory

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "   NGROK INSTALLER (No Admin)" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Create ngrok directory in user profile
$ngrokDir = "$env:USERPROFILE\ngrok"
Write-Host "Installation directory: $ngrokDir" -ForegroundColor Cyan
Write-Host ""

if (!(Test-Path $ngrokDir)) {
    New-Item -ItemType Directory -Path $ngrokDir -Force | Out-Null
    Write-Host "[OK] Created directory" -ForegroundColor Green
} else {
    Write-Host "[OK] Directory exists" -ForegroundColor Green
}

# Download ngrok
$ngrokZip = "$ngrokDir\ngrok.zip"
$downloadUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"

Write-Host ""
Write-Host "Downloading ngrok..." -ForegroundColor Cyan
Write-Host "Source: $downloadUrl" -ForegroundColor Gray
Write-Host ""

try {
    # Download with progress
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $downloadUrl -OutFile $ngrokZip -UseBasicParsing
    $ProgressPreference = 'Continue'
    
    Write-Host "[OK] Downloaded successfully" -ForegroundColor Green
    
    # Extract
    Write-Host ""
    Write-Host "Extracting..." -ForegroundColor Cyan
    Expand-Archive -Path $ngrokZip -DestinationPath $ngrokDir -Force
    Remove-Item $ngrokZip
    Write-Host "[OK] Extraction complete" -ForegroundColor Green
    
    # Verify
    $ngrokExe = "$ngrokDir\ngrok.exe"
    if (Test-Path $ngrokExe) {
        Write-Host ""
        Write-Host "Verifying installation..." -ForegroundColor Cyan
        
        # Test ngrok
        $version = & $ngrokExe version 2>$null
        if ($version) {
            Write-Host "[OK] Installation successful!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Version: $version" -ForegroundColor White
            Write-Host "Location: $ngrokExe" -ForegroundColor White
        }
        
        # Add to PATH for current session
        Write-Host ""
        Write-Host "Adding to current session PATH..." -ForegroundColor Cyan
        $env:Path = "$env:Path;$ngrokDir"
        Write-Host "[OK] Done - ngrok is ready to use!" -ForegroundColor Green
        
        # Add to user PATH permanently
        Write-Host ""
        Write-Host "Adding to permanent PATH..." -ForegroundColor Cyan
        $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($currentPath -notlike "*$ngrokDir*") {
            $newPath = "$currentPath;$ngrokDir"
            [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
            Write-Host "[OK] Added - will be available in new terminals" -ForegroundColor Green
        } else {
            Write-Host "[OK] Already in PATH" -ForegroundColor Green
        }
        
    } else {
        Write-Host "[ERROR] ngrok.exe not found after extraction" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "[ERROR] Installation failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Download manually" -ForegroundColor Yellow
    Write-Host "  1. Visit: https://ngrok.com/download" -ForegroundColor Cyan
    Write-Host "  2. Download Windows (64-bit)" -ForegroundColor Cyan
    Write-Host "  3. Extract to: $ngrokDir" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "   INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "What's next?" -ForegroundColor Yellow
Write-Host ""
Write-Host "STEP 1: Get your authtoken" -ForegroundColor White
Write-Host "  -> Sign up: https://dashboard.ngrok.com/signup" -ForegroundColor Cyan
Write-Host "  -> Get token: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor Cyan
Write-Host ""
Write-Host "STEP 2: Configure ngrok (in this terminal)" -ForegroundColor White
Write-Host "  -> Run: " -NoNewline
Write-Host "$ngrokDir\ngrok.exe config add-authtoken YOUR_TOKEN" -ForegroundColor Magenta
Write-Host ""
Write-Host "STEP 3: Test it!" -ForegroundColor White
Write-Host "  -> Run: " -NoNewline
Write-Host "$ngrokDir\ngrok.exe version" -ForegroundColor Magenta
Write-Host ""
Write-Host "STEP 4: Start exposing your database" -ForegroundColor White
Write-Host "  -> Run: " -NoNewline
Write-Host ".\scripts\ngrok\start-mongo-express-tunnel.ps1" -ForegroundColor Magenta
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "TIP: You can use ngrok directly from this terminal now!" -ForegroundColor Yellow
Write-Host "     For new terminals, it will be available after restart." -ForegroundColor Gray
Write-Host ""

