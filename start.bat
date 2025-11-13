@echo off
echo ========================================
echo   Installation du Site Immersif
echo ========================================
echo.

echo [1/3] Installation des dependances...
call npm install

echo.
echo [2/3] Dependencies installees avec succes!
echo.
echo [3/3] Lancement du site...
echo.

start npm start

echo.
echo ========================================
echo   Le site va s'ouvrir dans votre navigateur
echo   URL: http://localhost:3000
echo ========================================
echo.
pause
