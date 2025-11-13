@echo off
echo Killing Node processes...
taskkill /F /IM node.exe /T 2>nul

echo Waiting for processes to close...
timeout /t 3 /nobreak >nul 2>&1

echo Removing node_modules...
rd /s /q node_modules 2>nul

echo Removing package-lock.json...
del /f package-lock.json 2>nul

echo Installing dependencies...
call npm install

echo.
echo Done! You can now run: npm start
pause
