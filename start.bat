@echo off
echo 🎬 Starting CineHub Development Server...
echo.
echo Choose your preferred server:
echo 1. Python HTTP Server (Port 8000)
echo 2. Node.js Live Server (Port 3000) - Requires npm install -g live-server
echo 3. Open directly in browser
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo Starting Python server on http://localhost:8000
    python -m http.server 8000
) else if "%choice%"=="2" (
    echo Starting Live Server on http://localhost:3000
    live-server --port=3000 --open=/index.html
) else if "%choice%"=="3" (
    echo Opening index.html in default browser...
    start index.html
) else (
    echo Invalid choice. Opening in browser...
    start index.html
)

pause