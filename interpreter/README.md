# Live Interpreter (한↔영 실시간 통역)

## 로컬 실행 + 터널 (노트북에서)
```bash
cd interpreter
npm install
export ANTHROPIC_API_KEY=sk-ant-...      # Windows PowerShell: $env:ANTHROPIC_API_KEY="sk-ant-..."
npm start                                 # http://localhost:3000

# 다른 터미널에서 (계정 불필요, HTTPS 주소가 출력됨)
cloudflared tunnel --url http://localhost:3000
```
출력된 `https://xxxx.trycloudflare.com` 을 참석자 폰에서 열고, 같은 방 코드로 입장.
`?room=MEET` 를 주소 뒤에 붙이면 방 코드가 자동 입력됩니다.

cloudflared 설치: macOS `brew install cloudflared` / Windows `winget install Cloudflare.cloudflared`
