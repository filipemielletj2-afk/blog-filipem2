@echo off
title BLOG FILIPEM2 - Painel Administrativo Exclusivo
echo ========================================================
echo  INICIANDO APLICATIVO EXCLUSIVO BLOG FILIPEM2
echo ========================================================
echo.
echo Abrindo seu painel com credenciais exclusivas...
set APP_URL=https://blogfilipem2.site/app?key=miellet-admin-secret-2026

REM 1. Tentar abrir no Microsoft Edge em modo Standalone App (sem barra de URL)
where msedge >nul 2>nul
if %errorlevel% equ 0 (
    start msedge --app="%APP_URL%" --window-size=1360,880
    exit
)

REM 2. Tentar abrir no Google Chrome em modo Standalone App (sem barra de URL)
where chrome >nul 2>nul
if %errorlevel% equ 0 (
    start chrome --app="%APP_URL%" --window-size=1360,880
    exit
)

REM 3. Fallback Navegador Padrao
start "" "%APP_URL%"
exit
