@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title METLAS ERP YONETICI

:: =============================================
:: ANSI Renk Tanimlari (Win11 native)
:: =============================================
for /f %%a in ('powershell -Command "Write-Output ([char]27)"') do set "ESC=%%a"

set "C_RED=%ESC%[31m"
set "C_GREEN=%ESC%[32m"
set "C_YELLOW=%ESC%[33m"
set "C_BLUE=%ESC%[34m"
set "C_MAGENTA=%ESC%[35m"
set "C_CYAN=%ESC%[36m"
set "C_WHITE=%ESC%[37m"
set "C_GRAY=%ESC%[90m"
set "C_BOLD=%ESC%[1m"
set "C_RESET=%ESC%[0m"

set "SCRIPT_DIR=%~dp0"
set "PS_CMD=powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%metlas.ps1""
set "STATUS_CACHE_FILE=%SCRIPT_DIR%metlas_cache.tmp"

:: =============================================
:: Basimlilik Kontrolleri
:: =============================================
:BASIMLILIK
if not exist "%SCRIPT_DIR%package.json" (
    cls
    echo %C_YELLOW%+==================================================================================================================+%C_RESET%
    echo %C_YELLOW%# %C_RESET%%C_BOLD%                    UYARI                      %C_RESET%%C_YELLOW% #%C_RESET%
    echo %C_YELLOW%+==================================================================================================================+%C_RESET%
    echo.
    echo %C_RED%package.json bulunamadi!%C_RESET%
    echo Bu bir Next.js projesi degil gibi gorunuyor.
    echo.
    echo Devam etmekte sorun yasayabilirsiniz.
    echo.
    choice /c DE /n /t 5 /d E /m "Devam etmek icin D, cikmak icin E [D/E] (5sn):"
    if errorlevel 2 exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    cls
    echo %C_RED%+==================================================================================================================+%C_RESET%
    echo %C_RED%# %C_RESET%%C_BOLD%                     HATA                       %C_RESET%%C_RED% #%C_RESET%
    echo %C_RED%+==================================================================================================================+%C_RESET%
    echo.
    echo %C_BOLD%Node.js / npm bulunamadi!%C_RESET%
    echo.
    echo Lutfen https://nodejs.org adresinden Node.js'i indirin.
    echo.
    pause
    exit /b 1
)
goto MENU

:: =============================================
:: Durum Bilgisi Topla (ps1 status cagrisi)
:: =============================================
:: Durum Bilgisi Topla (ps1 status cagrisi)
:: =============================================
:STATUS_REFRESH
set "SRV_STATUS=STOPPED"
set "SRV_PID="
set "SRV_UPTIME=00:00:00"
set "SRV_IP=127.0.0.1"
set "SRV_PORT_MSG="

if exist "%STATUS_CACHE_FILE%" del /q "%STATUS_CACHE_FILE%" >nul 2>&1
%PS_CMD% status-line >"%STATUS_CACHE_FILE%" 2>nul

if exist "%STATUS_CACHE_FILE%" (
    for /f "usebackq tokens=1-5 delims=|" %%a in ("%STATUS_CACHE_FILE%") do (
        set "SRV_STATUS=%%a"
        set "SRV_PID=%%b"
        set "SRV_UPTIME=%%c"
        set "SRV_IP=%%d"
        set "SRV_PORT_MSG=%%e"
    )
)
if exist "%STATUS_CACHE_FILE%" del /q "%STATUS_CACHE_FILE%" >nul 2>&1
if "!SRV_STATUS!"=="" set "SRV_STATUS=STOPPED"
if "!SRV_IP!"=="" set "SRV_IP=127.0.0.1"
if "!SRV_UPTIME!"=="" set "SRV_UPTIME=00:00:00"
goto :EOF

:: =============================================
:: Ana Menu
:: =============================================
:MENU
cls
call :STATUS_REFRESH

echo.
echo %C_BOLD%%C_CYAN%+================================================================================================+%C_RESET%
echo %C_BOLD%%C_CYAN%#        METLAS ERP YONETICI              #%C_RESET%
echo %C_BOLD%%C_CYAN%+================================================================================================+%C_RESET%
echo.
if "%SRV_STATUS%"=="RUNNING" goto MENU_RUNNING
echo  %C_BOLD%Sunucu : %C_RED%KAPALI%C_RESET%
goto MENU_STATUS_DONE
:MENU_RUNNING
echo  %C_BOLD%Sunucu : %C_GREEN%CALISIYOR%C_RESET%  %C_GRAY%Port : 3000  PID : %SRV_PID%%C_RESET%
:MENU_STATUS_DONE
echo  %C_GRAY%--------------------------------------------------%C_RESET%
echo.
echo  %C_BOLD% 1.%C_RESET%  Arkaplanda Baslat
echo  %C_BOLD% 2.%C_RESET%  Developer Modu
echo  %C_BOLD% 3.%C_RESET%  Sunucuyu Durdur
echo  %C_BOLD% 4.%C_RESET%  Sunucu Durumu
echo  %C_BOLD% 5.%C_RESET%  Tarayiciyi Ac
echo  %C_BOLD% 6.%C_RESET%  Loglari Goruntule
echo  %C_GRAY%-------------------------------------------------%C_RESET%
echo  %C_BOLD% 7.%C_RESET%  npm install
echo  %C_BOLD% 8.%C_RESET%  Prisma Generate
echo  %C_BOLD% 9.%C_RESET%  Prisma Migrate
echo  %C_GRAY%-------------------------------------------------%C_RESET%
echo  %C_BOLD%10.%C_RESET%  Git Pull
echo  %C_BOLD%11.%C_RESET%  Git Push
echo  %C_GRAY%-------------------------------------------------%C_RESET%
echo  %C_BOLD%12.%C_RESET%  Cikis
echo.
set /p secim="%C_CYAN%Secenek [1-12]: %C_RESET%"

if "%secim%"=="1" goto ARKAPLAN_BASLAT
if "%secim%"=="2" goto DEVELOPER_MOD
if "%secim%"=="3" goto SUNUCU_DURDUR
if "%secim%"=="4" goto SUNUCU_DURUM
if "%secim%"=="5" goto TARAYICI_AC
if "%secim%"=="6" goto LOG_GORUNTULE
if "%secim%"=="7" goto NPM_INSTALL
if "%secim%"=="8" goto PRISMA_GENERATE
if "%secim%"=="9" goto PRISMA_MIGRATE
if "%secim%"=="10" goto GIT_PULL
if "%secim%"=="11" goto GIT_PUSH
if "%secim%"=="12" goto CIKIS
goto MENU

:: =============================================
:: 1) Arkaplanda Baslat
:: =============================================
:ARKAPLAN_BASLAT
if "%SRV_STATUS%"=="RUNNING" goto ARKAPLAN_ZATEN_CALISIYOR
goto ARKAPLAN_BASLAT_DEVAM

:ARKAPLAN_ZATEN_CALISIYOR
echo.
echo %C_YELLOW%[!] Sunucu zaten calisiyor. PID: %SRV_PID%%C_RESET%
echo %C_YELLOW%    Once durdurmak icin 3) Sunucuyu Durdur secenegini kullanin.%C_RESET%
echo.
pause
goto MENU

:ARKAPLAN_BASLAT_DEVAM

echo.
echo %C_CYAN%[*] Sunucu arkaplanda baslatiliyor...%C_RESET%
echo.

set "TMPFILE=%SCRIPT_DIR%metlas_start.tmp"
if exist "%TMPFILE%" del /q "%TMPFILE%" >nul 2>&1

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%metlas.ps1" start-background >"%TMPFILE%" 2>&1

set "PS_RESULT="
if not exist "%TMPFILE%" goto BASLAT_SONUC
for /f "usebackq delims=" %%a in ("%TMPFILE%") do if not defined PS_RESULT set "PS_RESULT=%%a"
del /q "%TMPFILE%" >nul 2>&1

:BASLAT_SONUC

if "%PS_RESULT%"=="null" set "PS_RESULT="
if "%PS_RESULT%"=="" (
    echo.
    echo %C_RED%[!] Sunucu baslatilamadi.%C_RESET%
    if exist "%SCRIPT_DIR%metlas.log" (
        echo    Son log satirlari:
        powershell -Command "Get-Content '%SCRIPT_DIR%metlas.log' -Tail 5 2>$null"
    )
    echo    Node.js ve npm kurulumunu kontrol edin.
    pause
    goto MENU
)

set "EX_PID="
set "OC_PID="
set "NEW_PID="

for /f "tokens=1,* delims=:" %%a in ("%PS_RESULT%") do (
    if "%%a"=="ALREADY_RUNNING" set "EX_PID=%%b"
    if "%%a"=="PORT_IN_USE" set "OC_PID=%%b"
    if "%%a"=="STARTED" set "NEW_PID=%%b"
)

if not "%EX_PID%"=="" (
    echo.
    echo %C_YELLOW%[!] Sunucu zaten calisiyor. PID: %EX_PID%%C_RESET%
    pause
    goto MENU
)
if not "%OC_PID%"=="" (
    echo.
    echo %C_RED%[!] Port 3000 zaten kullanimda. PID: %OC_PID%%C_RESET%
    echo    Baska bir uygulama portu kullaniyor olabilir.
    pause
    goto MENU
)
if not "%NEW_PID%"=="" (
    echo.
    echo %C_GREEN%[+] Sunucu baslatildi! PID: %NEW_PID%%C_RESET%
    echo    Loglar metlas.log dosyasina yaziliyor.
    echo    6^) Loglari Goruntule ile canli takip edebilirsiniz.
    pause
    goto MENU
)

echo.
echo %C_RED%[!] Sunucu baslatma hatasi: %PS_RESULT%%C_RESET%
echo    Ayrintili log: %SCRIPT_DIR%metlas.log
pause
goto MENU

:: =============================================
:: 2) Developer Modu
:: =============================================
:DEVELOPER_MOD
cls
echo.
echo %C_CYAN%+================================================================================================+%C_RESET%
echo %C_CYAN%#        DEVELOPER MODU                   #%C_RESET%
echo %C_CYAN%+================================================================================================+%C_RESET%
echo.
call :STATUS_REFRESH
echo %C_GREEN%Erisim Adresleri:%C_RESET%
powershell -NoProfile -Command "$esc=[char]27; $ip='!SRV_IP!'; if([string]::IsNullOrWhiteSpace($ip)){$ip='127.0.0.1'}; Write-Host '  Local :' -NoNewline; Write-Host \"$esc]8;;https://localhost:3000$([char]7)https://localhost:3000$esc]8;;$([char]7)\"; Write-Host '  LAN   :' -NoNewline; Write-Host \"$esc]8;;https://$ip:3000$([char]7)https://$ip:3000$esc]8;;$([char]7)\""
echo.
echo %C_YELLOW%npm run dev:https baslatiliyor...%C_RESET%
echo %C_GRAY%Durdurmak icin Ctrl+C kullanin.%C_RESET%
echo %C_GRAY%--------------------------------------------------%C_RESET%
echo.

cd /d "%SCRIPT_DIR%"
cmd /c "npm run dev:https"

echo.
echo %C_CYAN%+================================================================================================+%C_RESET%
echo %C_CYAN%#        SUNUCU DURDURULDU                #%C_RESET%
echo %C_CYAN%+================================================================================================+%C_RESET%
echo.
echo  %C_BOLD%Q%C_RESET% = Ana Menu
echo  %C_BOLD%X%C_RESET% = Programdan Cik
echo.
:DEV_LOOP
choice /c QX /n /m "Secenek [Q/X]:"
if errorlevel 2 exit /b 0
if errorlevel 1 goto MENU
goto DEV_LOOP

:: =============================================
:: 3) Sunucuyu Durdur
:: =============================================
:SUNUCU_DURDUR
if "%SRV_STATUS%"=="STOPPED" (
    echo.
    echo %C_YELLOW%[!] Sunucu zaten calismiyor.%C_RESET%
    timeout /t 2 /nobreak >nul
    goto MENU
)

echo.
echo %C_CYAN%[*] Sunucu durduruluyor... (PID: %SRV_PID%)%C_RESET%

set "STOP_RESULT_FILE=%SCRIPT_DIR%metlas_stop.tmp"
if exist "%STOP_RESULT_FILE%" del /q "%STOP_RESULT_FILE%" >nul 2>&1
%PS_CMD% stop >"%STOP_RESULT_FILE%" 2>nul
set "PS_RESULT="
if exist "%STOP_RESULT_FILE%" for /f "usebackq delims=" %%a in ("%STOP_RESULT_FILE%") do if not defined PS_RESULT set "PS_RESULT=%%a"
if exist "%STOP_RESULT_FILE%" del /q "%STOP_RESULT_FILE%" >nul 2>&1

if "%PS_RESULT%"=="NOT_RUNNING" (
    echo %C_YELLOW%[!] Sunucu zaten calismiyor.%C_RESET%
) else (
    if "%PS_RESULT%"=="STOPPED" (
        echo %C_GREEN%[+] Sunucu basariyla durduruldu.%C_RESET%
    ) else (
        echo %C_RED%[!] Durdurma hatasi: %PS_RESULT%%C_RESET%
        echo %C_YELLOW%[*] node.exe tum surecleri sonlandiriliyor ^(guvenli^)...%C_RESET%
        taskkill /f /im node.exe >nul 2>&1
        if exist "%SCRIPT_DIR%metlas.pid" del "%SCRIPT_DIR%metlas.pid"
        echo %C_GREEN%[+] Tum node surecleri sonlandirildi.%C_RESET%
    )
)
echo.
pause
goto MENU

:: =============================================
:: 4) Sunucu Durumu (Detayli)
:: =============================================
:SUNUCU_DURUM
cls
echo.
echo %C_CYAN%+================================================================================================+%C_RESET%
echo %C_CYAN%#          SUNUCU DURUMU                  #%C_RESET%
echo %C_CYAN%+================================================================================================+%C_RESET%
echo.

if "%SRV_STATUS%"=="RUNNING" (
    echo  %C_BOLD%Sunucu         : %C_GREEN%CALISIYOR%C_RESET%
    echo  %C_BOLD%PID             :%C_RESET% %SRV_PID%
    echo  %C_BOLD%Port            :%C_RESET% 3000
    echo.
    echo  %C_BOLD%Localhost       :%C_RESET% %C_CYAN%https://localhost:3000%C_RESET%
    echo  %C_BOLD%Yerel Ag       :%C_RESET% %C_CYAN%https://%SRV_IP%:3000%C_RESET%
    echo.
    echo  %C_BOLD%Calisma Suresi  :%C_RESET% %SRV_UPTIME%
) else (
    echo  %C_BOLD%Sunucu         : %C_RED%KAPALI%C_RESET%
)

echo.
echo  %C_BOLD%Node Surumu     :%C_RESET%
for /f "tokens=*" %%a in ('node --version 2^>nul') do echo                    %%a
echo  %C_BOLD%npm Surumu      :%C_RESET%
for /f "tokens=*" %%a in ('npm --version 2^>nul') do echo                    %%a

echo.
if "%SRV_PORT_MSG%"=="PORT_OK" goto PORT_FREE
echo  %C_RED%[!] Port 3000 baska bir islem tarafindan kullaniliyor.%C_RESET%
goto PORT_END
:PORT_FREE
if "%SRV_STATUS%"=="STOPPED" echo  %C_GREEN%[i] Port 3000 kullanima hazir.%C_RESET%
:PORT_END

echo.
pause
goto MENU

:: =============================================
:: 5) Tarayiciyi Ac
:: =============================================
:TARAYICI_AC
echo.
echo %C_CYAN%[*] https://localhost:3000 aciliyor...%C_RESET%
start https://localhost:3000
timeout /t 1 /nobreak >nul
goto MENU

:: =============================================
:: 6) Loglari Goruntule
:: =============================================
:LOG_GORUNTULE
if not exist "%SCRIPT_DIR%metlas.log" (
    echo.
    echo %C_YELLOW%[!] Henuz log dosyasi bulunmuyor.%C_RESET%
    echo    Sunucuyu baslattiktan sonra loglar olusacaktir.
    echo.
    pause
    goto MENU
)
cls
echo.
echo %C_CYAN%+================================================================================================+%C_RESET%
echo %C_CYAN%#          CANLI LOG TAKIBI               #%C_RESET%
echo %C_CYAN%+================================================================================================+%C_RESET%
echo.
echo %C_YELLOW%Cikis yapmak icin Ctrl+C%C_RESET%
echo %C_GRAY%--------------------------------------------------%C_RESET%
echo.

cd /d "%SCRIPT_DIR%"
powershell -ExecutionPolicy Bypass -Command "Get-Content -Path '.\metlas.log' -Wait -Tail 30"

echo.
echo %C_YELLOW%[!] Log takibi sonlandi.%C_RESET%
pause
goto MENU

:: =============================================
:: 7) npm install
:: =============================================
:NPM_INSTALL
cls
echo.
echo %C_CYAN%+================================================================================================+%C_RESET%
echo %C_CYAN%#             npm install                  #%C_RESET%
echo %C_CYAN%+================================================================================================+%C_RESET%
echo.
if not exist "%SCRIPT_DIR%package.json" (
    echo %C_RED%[!] package.json bulunamadi.%C_RESET%
    pause
    goto MENU
)
cd /d "%SCRIPT_DIR%"
echo %C_CYAN%[*] npm install calistiriliyor...%C_RESET%
echo.
cmd /c "npm install"
echo.
echo %C_GREEN%[+] npm install tamamlandi.%C_RESET%
pause
goto MENU

:: =============================================
:: 8) Prisma Generate
:: =============================================
:PRISMA_GENERATE
cls
echo.
echo %C_CYAN%+================================================================================================+%C_RESET%
echo %C_CYAN%#          Prisma Generate                #%C_RESET%
echo %C_CYAN%+================================================================================================+%C_RESET%
echo.
if not exist "%SCRIPT_DIR%prisma\schema.prisma" (
    echo %C_RED%[!] prisma/schema.prisma bulunamadi.%C_RESET%
    pause
    goto MENU
)
cd /d "%SCRIPT_DIR%"
echo %C_CYAN%[*] npx prisma generate calistiriliyor...%C_RESET%
echo.
cmd /c "npx prisma generate"
echo.
echo %C_GREEN%[+] Prisma Generate tamamlandi.%C_RESET%
pause
goto MENU

:: =============================================
:: 9) Prisma Migrate
:: =============================================
:PRISMA_MIGRATE
cls
echo.
echo %C_CYAN%+================================================================================================+%C_RESET%
echo %C_CYAN%#          Prisma Migrate                 #%C_RESET%
echo %C_CYAN%+================================================================================================+%C_RESET%
echo.
if not exist "%SCRIPT_DIR%prisma\schema.prisma" (
    echo %C_RED%[!] prisma/schema.prisma bulunamadi.%C_RESET%
    pause
    goto MENU
)
cd /d "%SCRIPT_DIR%"
echo %C_YELLOW%[!] Bu islem veritabanina migration uygulayacak.%C_RESET%
echo.
choice /c YN /m "Devam etmek istiyor musunuz? Y/N:"
if errorlevel 2 goto MENU

echo.
echo %C_CYAN%[*] npx prisma migrate dev calistiriliyor...%C_RESET%
echo.
cmd /c "npx prisma migrate dev"
echo.
echo %C_GREEN%[+] Prisma Migrate tamamlandi.%C_RESET%
pause
goto MENU

:: =============================================
:: 10) Git Pull
:: =============================================
:GIT_PULL
cls
echo.
echo %C_CYAN%+================================================================================================+%C_RESET%
echo %C_CYAN%#             Git Pull                     #%C_RESET%
echo %C_CYAN%+================================================================================================+%C_RESET%
echo.
if not exist "%SCRIPT_DIR%.git" (
    echo %C_RED%[!] Git reposu bulunamadi.%C_RESET%
    pause
    goto MENU
)
cd /d "%SCRIPT_DIR%"
echo %C_CYAN%[*] git pull calistiriliyor...%C_RESET%
echo.
cmd /c "git pull"
echo.
echo %C_GREEN%[+] Git Pull tamamlandi.%C_RESET%
pause
goto MENU

:: =============================================
:: 11) Git Push
:: =============================================
:GIT_PUSH
cls
echo.
echo %C_CYAN%+================================================================================================+%C_RESET%
echo %C_CYAN%#             Git Push                     #%C_RESET%
echo %C_CYAN%+================================================================================================+%C_RESET%
echo.
if not exist "%SCRIPT_DIR%.git" (
    echo %C_RED%[!] Git reposu bulunamadi.%C_RESET%
    pause
    goto MENU
)
cd /d "%SCRIPT_DIR%"
echo.
echo %C_YELLOW%Commit mesaji girin (bos girilirse islem iptal edilir):%C_RESET%
set /p "commit_msg=>> "

if "%commit_msg%"=="" (
    echo %C_RED%[!] Commit mesaji bos. Islem iptal edildi.%C_RESET%
    pause
    goto MENU
)

rem Sanitizasyon: tirnaklari temizle, %% karakterini ciftle
set "commit_msg=%commit_msg:"=%"
set "commit_msg=%commit_msg:%%=%%%%%"

echo.
echo %C_CYAN%[*] git add . calistiriliyor...%C_RESET%
cmd /c "git add ."
echo.
echo %C_CYAN%[*] git commit -m "!commit_msg!" calistiriliyor...%C_RESET%
cmd /c "git commit -m "!commit_msg!""
echo.
echo %C_CYAN%[*] git push calistiriliyor...%C_RESET%
cmd /c "git push"
echo.
echo %C_GREEN%[+] Git Push tamamlandi.%C_RESET%
pause
goto MENU

:: =============================================
:: 12) Cikis
:: =============================================
:CIKIS
cls
echo.
echo %C_CYAN%+================================================================================================+%C_RESET%
echo %C_CYAN%#         GORUSMEK UZERE                  #%C_RESET%
echo %C_CYAN%+================================================================================================+%C_RESET%
echo.
echo  METLAS ERP Yonetici sonlandiriliyor...
timeout /t 2 /nobreak >nul
exit /b 0
