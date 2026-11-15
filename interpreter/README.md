# Live Interpreter (한↔영 실시간 통역)

## 로컬 실행 + 터널 (노트북에서)
```bash
cd interpreter
npm install
export GEMINI_API_KEY=...                # 번역 (Google AI Studio에서 발급. PowerShell: $env:GEMINI_API_KEY="...")  ← 매번 입력하기 번거로우면 아래 '.env 파일' 방법 사용
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

## API 키 넣는 곳: `.env` 파일 (가장 쉬움)
1. `interpreter/.env.example` 파일을 복사해서 이름을 **`.env`** 로 바꿉니다 (`interpreter` 폴더 안, 점으로 시작).
2. 메모장으로 열어 `=` 뒤에 키를 붙여 넣고 저장합니다 (따옴표 없이).
   ```
   GEMINI_API_KEY=여기에_키
   DEEPGRAM_API_KEY=여기에_키
   ```
3. 서버를 켜면 로그에 `.env 파일 로드됨`이 보입니다. 터미널에 이미 설정한 환경 변수가 있으면 그 값이 우선합니다.
- `.env`는 git에 올라가지 않습니다. 키를 채팅이나 메일에 붙여 넣지 마세요.

## 회의 요약 (📝)
- 화면 오른쪽 위 📝 버튼 → 지금까지의 회의를 **한국어 + 영어**로 요약합니다 (한 줄 요약 / 핵심 논의 / 결정 사항 / 후속 조치 / 확인 필요).
- 결과는 화면에서 바로 읽고, 💾 저장 · 📋 복사할 수 있으며 `minutes/` 폴더에도 `..._summary.md`로 저장됩니다.
- 발언에 없던 결정·숫자·담당자를 지어내지 않도록 지시했고, 불확실한 내용은 '확인 필요'로 따로 모읍니다. 그래도 AI 요약이므로 **중요한 내용은 전체 회의록으로 확인**하세요.
- 아주 긴 회의(약 12만 자 이상)는 중간이 생략됩니다. 요약은 번역과 같은 엔진(Gemini/Claude)을 사용합니다.
