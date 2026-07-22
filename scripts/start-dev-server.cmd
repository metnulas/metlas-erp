@echo off
cd /d "C:\Users\metin\Desktop\METLAS"

:restart
call npm.cmd run dev
timeout /t 5 /nobreak >nul
goto restart
