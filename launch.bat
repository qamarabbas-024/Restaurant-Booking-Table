@echo off
title The Royal Spice - Restaurant Table Booking System
color 0F

echo ================================================================================
echo                   THE ROYAL SPICE - RESTAURANT MANAGEMENT OS
echo ================================================================================
echo.

cd /d "%~dp0Code"

if not exist "system.exe" (
    echo [INFO] Compiling C++17 Core Engine and Server...
    g++ -Wall -Wextra -Wpedantic -std=c++17 main.cpp Table.cpp Booking.cpp BookingManager.cpp FileHandler.cpp Utils.cpp Server.cpp -lws2_32 -o system.exe
    if errorlevel 1 (
        echo [ERROR] Compilation failed! Ensure MinGW/g++ is installed in your PATH.
        pause
        exit /b 1
    )
    echo [OK] Compilation successful!
    echo.
)

echo [INFO] Launching Background HTTP Server on http://localhost:8080...
start "" "system.exe" --serve

timeout /t 2 /nobreak >nul

echo [INFO] Opening Web Companion in default browser...
start http://localhost:8080

echo.
echo ================================================================================
echo  * Web Application:  http://localhost:8080
echo  * Embedded Server:  Port 8080 (Running)
echo ================================================================================
echo.
echo To run the interactive C++ Console Terminal interface instead:
echo   cd Code
echo   .\system.exe
echo.
pause
