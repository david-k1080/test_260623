# Live Interpreter (한↔영 실시간 통역)

## 로컬 실행 + 터널 (노트북에서)
```bash
cd interpreter
npm install
export GEMINI_API_KEY=...                # 번역 (Google AI Studio에서 발급. PowerShell: $env:GEMINI_API_KEY="...")
# 또는 Claude 사용: export ANTHROPIC_API_KEY=sk-ant-...
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

## 번역 엔진 (Gemini / Claude)
- `GEMINI_API_KEY`가 있으면 Gemini(기본 `gemini-2.5-flash`), 없고 `ANTHROPIC_API_KEY`가 있으면 Claude를 씁니다. 둘 다 있으면 Gemini 우선.
- 강제로 고르려면 `TRANSLATE_PROVIDER=gemini` 또는 `anthropic`, 모델 변경은 `TRANSLATE_MODEL=...`.
- 서버 로그 첫 줄의 `[번역] provider=... model=...` 로 실제 사용 중인 엔진을 확인하세요.
- Gemini 모델이 `thinkingConfig`를 거부하면 자동으로 끄고 재시도합니다 (로그에 표시).

## 회의록 (자동 저장)
- 대화가 오갈 때마다 `interpreter/minutes/` 폴더에 마크다운 파일이 자동 저장됩니다 (`방코드_날짜_시작시각.md`). 발언마다 시각, 화자, 원문과 번역이 함께 기록됩니다.
- 화면 오른쪽 위 💾 버튼을 누르면 지금까지의 회의록을 내 폰/노트북으로 내려받을 수 있습니다.
- 내려받기는 방에 접속한 참가자만 가능합니다 (공개 주소로는 파일에 접근할 수 없음). 파일은 서버가 켜진 컴퓨터에만 저장되며 git에는 올라가지 않습니다.
- 모두 나가도 10분간은 같은 회의록이 유지돼, 네트워크가 끊겼다 다시 들어와도 이어서 기록됩니다.
- 끄려면 `MINUTES_SAVE=0`, 저장 위치를 바꾸려면 `MINUTES_DIR=/원하는/경로`.
- 회의록에는 고객사 기밀이 들어갑니다. 미팅 후 안전한 곳으로 옮기고, 필요 없으면 삭제하세요.
