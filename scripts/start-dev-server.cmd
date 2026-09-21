@echo off
setlocal
cd /d "%~dp0.."

:restart
call npm.cmd run dev
timeout /t 5 /nobreak >nul
goto restart
