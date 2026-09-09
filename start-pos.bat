@echo off
title POS 1994 Coffee
echo ===================================================
echo   Dang khoi dong he thong POS 1994 Coffee...
echo ===================================================
cd /d "%~dp0"
start http://localhost:5173
npm run dev
pause
