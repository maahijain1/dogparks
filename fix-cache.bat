@echo off
echo Stopping all Node processes...
taskkill /f /im node.exe >nul 2>&1

echo Removing .next cache...
rmdir /s /q .next >nul 2>&1

echo Starting development server...
npm run dev


