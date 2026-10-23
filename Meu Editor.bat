@echo off
title Meu Editor
rem Abre o Meu Editor no navegador. Pode ficar na pasta do projeto ou na
rem area de trabalho: fora do projeto, usa a pasta %USERPROFILE%\meu-editor.

set "PASTA=%~dp0"
if not exist "%PASTA%package.json" set "PASTA=%USERPROFILE%\meu-editor\"
if not exist "%PASTA%package.json" (
  echo Nao encontrei a pasta do Meu Editor em %USERPROFILE%\meu-editor
  echo Abra o PowerShell e rode:
  echo   git clone https://github.com/Rinaldomatias92-lgtm/meu-editor
  pause
  exit /b 1
)
cd /d "%PASTA%"

where node >nul 2>nul
if errorlevel 1 (
  echo O Node.js nao esta instalado. Baixe a versao LTS em https://nodejs.org
  echo Depois de instalar, abra este atalho de novo.
  pause
  exit /b 1
)

where git >nul 2>nul
if not errorlevel 1 (
  echo Buscando atualizacoes...
  git pull --ff-only --quiet 2>nul
)

echo Preparando o editor, aguarde...
call npm.cmd install --no-audit --no-fund --loglevel=error
if errorlevel 1 (
  echo Falha ao instalar as dependencias. Veja a mensagem acima.
  pause
  exit /b 1
)

echo.
echo O editor vai abrir no navegador. Deixe esta janela aberta enquanto usa.
echo Para fechar o editor, feche esta janela.
echo.
call npm.cmd run dev -- --open
pause
