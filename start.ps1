# The Royal Spice — Quick Launcher Script
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "                  THE ROYAL SPICE - RESTAURANT MANAGEMENT OS                     " -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan

$codeDir = Join-Path $PSScriptRoot "Code"
Set-Location $codeDir

if (-not (Test-Path "system.exe")) {
    Write-Host "[INFO] Compiling C++17 Core Engine and Server..." -ForegroundColor Cyan
    & g++ -Wall -Wextra -Wpedantic -std=c++17 main.cpp Table.cpp Booking.cpp BookingManager.cpp FileHandler.cpp Utils.cpp Server.cpp -lws2_32 -o system.exe
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Compilation failed! Ensure g++ is in your PATH." -ForegroundColor Red
        return
    }
    Write-Host "[OK] Compilation Successful." -ForegroundColor Green
}

Write-Host "[INFO] Launching Background Server on http://localhost:8080..." -ForegroundColor Cyan
Start-Process -FilePath ".\system.exe" -ArgumentList "--serve" -WindowStyle Hidden

Start-Sleep -Seconds 2

Write-Host "[INFO] Opening http://localhost:8080 in default browser..." -ForegroundColor Green
Start-Process "http://localhost:8080"

Write-Host "`nSystem is live and running at: http://localhost:8080" -ForegroundColor Yellow
