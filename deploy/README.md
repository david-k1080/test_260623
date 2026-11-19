# 통역 서버 배포 가이드 (클라우드 VM · Docker · 자동 HTTPS)

폰에서 마이크를 쓰려면 **https 주소**가 필요합니다. 이 가이드는 클라우드 VM 한 대에 통역 서버를 올리고, 인증서를 자동으로 받아 **고정 주소**로 쓰는 방법입니다. 노트북과 터널(cloudflared)은 더 이상 필요 없습니다.

```
폰/태블릿 ──https──▶ Caddy(인증서·HTTPS) ──▶ 통역 서버(app) ──▶ Gemini(번역) · Deepgram(음성 인식)
                         (80, 443만 공개)        (밖에 직접 공개 안 함)
```

> **이 서버가 하는 일:** 미팅 대화(음성과 문장)가 이 서버를 거쳐 Google(번역)과 Deepgram(음성 인식)으로 전달됩니다. 회의록은 서버 디스크에 저장됩니다. 고객사 기밀 미팅이라면 사내 보안 정책과 고객사 동의를 먼저 확인하세요.

---

## 1. 준비물
| 항목 | 내용 |
|---|---|
| 서버(VM) | Ubuntu 22.04 또는 24.04, **1 vCPU / 1~2GB 메모리**면 충분합니다. 한국에서 쓰면 서울 리전이 좋습니다. |
| 공인 IP | VM에 붙은 고정 IP (AWS Elastic IP, GCP 고정 외부 IP, 네이버클라우드 공인 IP 등) |
| 도메인 | 있으면 좋고, **없어도 됩니다** (아래 3번) |
| 키 | Gemini API 키(번역), Deepgram API 키(음성 인식, 권장) |
| 참가 코드 | 직접 정하는 8자 이상 문자열. 이 코드를 아는 사람만 입장합니다. |

## 2. 방화벽 열기 (클라우드 콘솔에서)
| 방향 | 프로토콜/포트 | 허용 대상 |
|---|---|---|
| 인바운드 | **TCP 80, TCP 443** | 모두 (인증서 발급과 접속에 필요) |
| 인바운드 | UDP 443 | 모두 (선택, HTTP/3) |
| 인바운드 | TCP 22 (SSH) | **내 IP만** |

이름은 서비스마다 다릅니다: AWS는 *보안 그룹*, GCP는 *VPC 방화벽 규칙*, Azure는 *네트워크 보안 그룹*, 네이버클라우드는 *ACG*.
서버 안의 방화벽을 쓰고 있다면 `sudo ufw allow 80,443/tcp && sudo ufw allow from <내IP> to any port 22` 도 함께 하세요.

## 3. 도메인 정하기
- **도메인이 있을 때:** DNS에 `A 레코드`로 `meet.내도메인.com → 서버 공인 IP` 를 추가합니다. (적용까지 몇 분)
- **도메인이 없을 때:** 서버 IP가 `203.0.113.10` 이면 `203-0-113-10.sslip.io` 를 그대로 주소로 쓸 수 있습니다. (점 대신 하이픈, 가입 필요 없음)

## 4. Docker 설치 (서버에서, 처음 한 번)
SSH로 서버에 접속한 뒤:
```bash
curl -fsSL https://get.docker.com | sudo sh        # Docker 공식 설치 스크립트
sudo usermod -aG docker $USER                      # 이 줄 실행 후 SSH를 끊었다가 다시 접속
docker compose version                             # 버전이 나오면 성공
```
(스크립트가 마음에 걸리면 https://docs.docker.com/engine/install/ubuntu/ 의 apt 방식으로 설치해도 됩니다.)

## 5. 파일 올리기
내 컴퓨터에서 (받은 `interpreter-deploy.tar.gz` 가 있는 폴더에서):
```bash
scp interpreter-deploy.tar.gz ubuntu@서버IP:~/          # 사용자 이름은 서버마다 다릅니다 (ubuntu, ec2-user 등)
ssh ubuntu@서버IP
tar xzf interpreter-deploy.tar.gz && cd interpreter-deploy/deploy
```
용어집이 있다면 (내 컴퓨터에서, 한 번만):
```bash
ssh ubuntu@서버IP "mkdir -p ~/interpreter-deploy/deploy/data/config"
scp glossary.local.json ubuntu@서버IP:~/interpreter-deploy/deploy/data/config/
```

## 6. 설정
```bash
./setup.sh          # 처음에는 .env 를 만들어 주고 멈춥니다
nano .env           # DOMAIN, ACCESS_CODE, GEMINI_API_KEY, DEEPGRAM_API_KEY 입력
./setup.sh          # 모두 ✔ 가 나오면 준비 완료
```
참가 코드 만들기: `openssl rand -base64 12`

## 7. 시작
```bash
docker compose up -d --build
docker compose ps                       # app 은 healthy, caddy 는 running 이어야 합니다
docker compose logs -f app              # 아래 줄들이 보이면 정상 (Ctrl+C 로 빠져나오기)
```
정상 로그: `[번역] provider=gemini ...` · `용어집 ... 로드` · `Interpreter running ... (참가 코드 필요)`

## 8. 확인
1. `curl https://내도메인/healthz` → `{"ok":true,...}`
2. 폰에서 `https://내도메인` 열기 → **참가 코드 입력칸**이 보이는지 확인
3. 일부러 **틀린 코드**로 들어가 보기 → "참가 코드가 맞지 않습니다"가 나와야 합니다
4. 맞는 코드로 입장 → 마이크 허용 → 말해 보기

코드를 주소에 붙여 보낼 수도 있습니다: `https://내도메인/?room=MEET&code=참가코드`
(화면이 열리면 주소창에서 코드가 지워집니다. 다만 메신저 대화방에는 남으니 미팅이 끝나면 코드를 바꾸세요.)

## 9. 미팅 당일
- 30분 전: `curl https://내도메인/healthz` 로 서버가 살아 있는지 확인
- 참가 코드는 **미팅마다 새로** 정하고, 필요한 사람에게만 알려 주세요 (`.env` 수정 후 `docker compose up -d`)
- 리허설: 폰 2~3대로 입장해 한국어/영어를 번갈아 말해 보세요

## 10. 운영
| 하고 싶은 일 | 명령 (deploy 폴더에서) |
|---|---|
| 새 버전 반영 | 새 `tar.gz` 를 올려 풀고 `./update.sh` |
| 재시작 | `docker compose restart app` |
| 설정(.env) 변경 반영 | `docker compose up -d` |
| 로그 보기 | `docker compose logs --tail 100 app` |
| 중지 | `docker compose down` |
| 회의록 보기 | `ls data/minutes` (마크다운 파일) |
| 회의록 모두 삭제 | `rm data/minutes/*.md` |
| 회의록 자동 삭제 | `.env` 에 `MINUTES_RETENTION_DAYS=30` |
| 회의록 내 컴퓨터로 가져오기 | `scp -r ubuntu@서버IP:~/interpreter-deploy/deploy/data/minutes .` |

## 11. 보안 점검표
- [ ] SSH는 **키 로그인만** 허용 (비밀번호 로그인 끄기), 22번 포트는 내 IP만
- [ ] `.env` 파일 권한 600 (`setup.sh` 가 설정), 채팅·메일·깃에 올리지 않기
- [ ] **참가 코드**를 미팅마다 교체
- [ ] Google AI Studio와 Deepgram 콘솔에서 **사용량 알림이나 한도** 설정 (비용 사고 방지)
- [ ] `MINUTES_RETENTION_DAYS` 로 회의록 보관 기간 제한
- [ ] 서버 OS 업데이트: `sudo apt update && sudo apt -y upgrade` (정기적으로)
- [ ] 키가 노출됐다고 의심되면 콘솔에서 **즉시 폐기하고 재발급**한 뒤 `.env` 수정 → `docker compose up -d`

서버가 이미 막아 주는 것: 참가 코드(틀리면 5회 후 10분 잠김), 허용 출처 확인, 한 IP 동시 접속·방 수·방 인원·동시 음성 인식 수·문장 속도 제한, 큰 메시지 거부, 끊긴 접속 자동 정리, 보안 헤더. 한도는 `.env` 에서 조정합니다.

## 12. 문제 해결
| 증상 | 확인할 것 |
|---|---|
| `docker compose up` 이 `ACCESS_CODE` 때문에 종료 | `.env` 의 `ACCESS_CODE` 가 비어 있음 |
| 주소가 열리지 않음/인증서 오류 | ① 방화벽 80·443 열림 ② 도메인이 서버 IP를 가리키는지(`nslookup 도메인`) ③ `docker compose logs caddy` |
| "연결할 수 없음"이 계속 뜸 | 접속한 주소가 `.env` 의 `DOMAIN` 과 같은지 (다르면 출처 확인에서 거부됨) |
| 입장이 거부됨 | 참가 코드 오타. 5번 틀리면 10분 잠김 (`docker compose restart app` 으로 즉시 해제) |
| 번역이 `[MOCK]` 으로 나옴 | `GEMINI_API_KEY` 가 비었거나 잘못됨 (`docker compose logs app` 의 첫 줄 확인) |
| 음성 인식이 부정확 | `DEEPGRAM_API_KEY` 가 비어 있음 → 폰 내장 인식으로 동작 중 |
| 마이크가 안 켜짐 | 주소가 `https://` 인지, 브라우저 마이크 권한 허용 |

---

### 아직 확인하지 못한 것 (첫 배포 때 꼭 확인)
이 가이드와 파일은 **Docker가 없는 환경에서 만들었습니다.** 서버 코드(참가 코드·제한·보안 헤더 등)는 실제로 실행해 시험했지만, 아래는 **실제 VM에서 처음 켜 볼 때** 확인하세요.
- Docker 이미지 빌드가 성공하는지, `app` 이 `healthy` 가 되는지
- Caddy가 Let's Encrypt 인증서를 정상 발급하는지 (도메인/방화벽 문제면 `docker compose logs caddy`)
- 실제 Gemini·Deepgram 키로 번역과 음성 인식이 도는지 (서버 로그 `[STT] ... model=nova-3 keyterms=true` 확인)
- 아이폰/갤럭시에서 https 주소로 마이크가 켜지는지
