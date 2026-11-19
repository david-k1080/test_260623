#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null; then echo "[!] Node.js 가 필요합니다: https://nodejs.org (LTS)"; read -p "Enter 를 누르면 닫습니다"; exit 1; fi
[ -d node_modules ] || { echo "처음 한 번만: 필요한 파일을 설치합니다..."; npm install --omit=dev || exit 1; }
[ -f interpreter.env ] || [ -f .env ] || echo "[!] interpreter.env 가 없습니다 (interpreter.env.example 참고). 키 없이 실행하면 번역이 [MOCK] 으로 나옵니다."
(sleep 3; open "http://localhost:3000") &
node server.js
read -p "서버가 종료되었습니다. Enter 를 누르면 닫습니다"
