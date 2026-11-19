@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 미팅 통역 (이 창을 닫으면 종료됩니다)

where node >nul 2>nul
if errorlevel 1 (
  echo [!] Node.js 가 설치되어 있지 않습니다.
  echo     https://nodejs.org 에서 LTS 버전을 설치한 뒤 이 파일을 다시 실행하세요.
  pause
  exit /b 1
)
if not exist node_modules (
  echo 처음 한 번만: 필요한 파일을 설치합니다 (1~2분)...
  call npm install --omit=dev
  if errorlevel 1 ( echo [!] 설치 실패 & pause & exit /b 1 )
)
if not exist interpreter.env if not exist .env (
  echo [!] interpreter.env 파일이 없습니다. interpreter.env.example 을 복사해 이름을 interpreter.env 로 바꾸고 키를 넣으세요.
  echo     키가 없어도 실행은 되지만 번역이 [MOCK] 으로 나옵니다.
  echo.
)

echo 브라우저를 엽니다: http://localhost:3000   (Chrome 권장)
start "" /min cmd /c "timeout /t 3 >nul & start http://localhost:3000"
node server.js
echo.
echo 서버가 종료되었습니다.
pause
