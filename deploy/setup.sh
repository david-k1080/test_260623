#!/usr/bin/env bash
# 처음 한 번 실행: 폴더를 만들고 설정을 점검합니다.   사용법:  cd deploy && ./setup.sh
set -euo pipefail
cd "$(dirname "$0")"
ok(){ printf '  \033[32m✔\033[0m %s\n' "$1"; }
bad(){ printf '  \033[31m✖\033[0m %s\n' "$1"; FAIL=1; }
FAIL=0

echo "1) Docker 확인"
command -v docker >/dev/null && ok "docker $(docker --version | cut -d' ' -f3 | tr -d ,)" || bad "Docker가 없습니다. README의 '4. Docker 설치'를 먼저 하세요."
docker compose version >/dev/null 2>&1 && ok "docker compose" || bad "docker compose 플러그인이 없습니다."

echo "2) 폴더 준비"
mkdir -p data/minutes data/config
chown 1000:1000 data/minutes 2>/dev/null || sudo chown 1000:1000 data/minutes     # 컨테이너 안의 node 사용자(1000)가 회의록을 쓸 수 있게
ok "data/minutes (회의록), data/config (용어집)"

echo "3) 설정 파일(.env) 점검"
if [ ! -f .env ]; then cp .env.example .env; chmod 600 .env; bad ".env 를 새로 만들었습니다. 열어서 DOMAIN, ACCESS_CODE, GEMINI_API_KEY 를 채운 뒤 다시 실행하세요."; else
  chmod 600 .env
  val(){ grep -E "^$1=" .env | head -1 | cut -d= -f2- | tr -d '"' ; }
  D=$(val DOMAIN); C=$(val ACCESS_CODE); G=$(val GEMINI_API_KEY); A=$(val ANTHROPIC_API_KEY)
  [ -n "$D" ] && [ "$D" != "meet.example.com" ] && ok "DOMAIN=$D" || bad "DOMAIN 을 실제 도메인(또는 IP.sslip.io)으로 바꾸세요."
  [ ${#C} -ge 8 ] && ok "ACCESS_CODE (${#C}자)" || bad "ACCESS_CODE 는 8자 이상이어야 합니다.  만들기: openssl rand -base64 12"
  { [ -n "$G" ] || [ -n "$A" ]; } && ok "번역 API 키 있음" || bad "GEMINI_API_KEY (또는 ANTHROPIC_API_KEY) 가 필요합니다."
  [ -n "$(val DEEPGRAM_API_KEY)" ] && ok "DEEPGRAM_API_KEY 있음 (정확한 음성 인식)" || echo "  - DEEPGRAM_API_KEY 없음: 폰 내장 음성 인식으로 동작합니다 (정확도가 낮을 수 있음)"
fi

echo "4) 용어집"
[ -f data/config/glossary.local.json ] && ok "용어집 있음" || echo "  - data/config/glossary.local.json 없음: 기본 용어집으로 동작합니다 (용어집 파일을 scp로 올리세요)"

echo
if [ "$FAIL" = 1 ]; then echo "위의 ✖ 항목을 해결한 뒤 다시 실행하세요."; exit 1; fi
echo "준비 완료. 시작:  docker compose up -d --build"
