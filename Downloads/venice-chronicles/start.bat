@echo off
echo ========================================
echo    Venice Chronicles - Story Generator
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [1/3] Installing dependencies...
    call npm install
    echo.
) else (
    echo [1/3] Dependencies already installed
)

REM Start the development server in a new window
echo [2/3] Starting development server...
start "Venice Chronicles Server" cmd /c npm run dev

REM Wait for server to start (5 seconds)
echo [3/3] Launching browser...
timeout /t 5 /nobreak > nul

REM Open the app in default browser
start http://localhost:5173

echo.
echo ========================================
echo Venice Chronicles is now running!
echo.
echo The app should open in your browser.
echo Keep the server window open while using the app.
echo.
echo To stop: Close the server window
echo ========================================
echo.
pause
