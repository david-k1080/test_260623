#!/usr/bin/env bash
# 새 버전을 반영하고 다시 시작합니다.   사용법:  cd deploy && ./update.sh
set -euo pipefail
cd "$(dirname "$0")"
docker compose build --pull
docker compose pull caddy
docker compose up -d
sleep 4
docker compose ps
DOMAIN=$(grep -E '^DOMAIN=' .env | cut -d= -f2- | tr -d '"')
echo "--- 상태 확인"
curl -fsS "https://${DOMAIN}/healthz" && echo || { echo "상태 확인 실패: docker compose logs --tail 50"; exit 1; }
