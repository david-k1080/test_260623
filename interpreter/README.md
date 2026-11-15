# Live Interpreter (한↔영 실시간 통역)

## 로컬 실행 + 터널 (노트북에서)
```bash
cd interpreter
npm install
export ANTHROPIC_API_KEY=sk-ant-...      # 번역 (Windows PowerShell: $env:ANTHROPIC_API_KEY="sk-ant-...")
export DEEPGRAM_API_KEY=...              # 음성 인식 (없으면 폰 브라우저 내장 인식으로 대체)
npm start                                 # http://localhost:3000

# 다른 터미널에서 (계정 불필요, HTTPS 주소가 출력됨)
cloudflared tunnel --url http://localhost:3000
```
출력된 `https://xxxx.trycloudflare.com` 을 참석자 폰에서 열고, 같은 방 코드로 입장.
`?room=MEET` 를 주소 뒤에 붙이면 방 코드가 자동 입력됩니다.

cloudflared 설치: macOS `brew install cloudflared` / Windows `winget install Cloudflare.cloudflared`

## 음성 인식
- `DEEPGRAM_API_KEY` 가 있으면 Deepgram(nova-3)으로 실시간 인식합니다. `glossary.local.json`의 용어를 keyterm으로 보내 인식률을 높입니다.
- 서버가 keyterm/모델을 거부하면 자동으로 `nova-3` → `nova-2` 순으로 낮춰 재시도합니다. 서버 로그의 `[STT]` 줄에서 실제 사용된 방식을 확인하세요.
- 끊기는 시점이 너무 빠르면 `DG_ENDPOINTING=700` 처럼 값을 올려보세요 (ms, 기본 400).
