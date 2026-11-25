import json, csv, subprocess, sys, re
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

REPO = "/home/user/test_260623"
html = open(f"{REPO}/media-mindmap.html", encoding="utf-8").read()
a = html.index("var ZONES = ") + len("var ZONES = ")
b = html.index("];", a) + 1
ZONES = json.loads(html[a:b])
SL = {"ok": "검증됨", "part": "부분 확인", "src": "소스 후보", "none": "미착수"}
ZN = {z["id"]: z["name"] for z in ZONES}

# (매체, 지면·상품, 항목, 값, 출처, 등급, 상태, 확인일)
SPEC = [
# --- 디지털 ---
("Google", "실적 최대화(PMax)", "이미지 가로 1.91:1", "1200x628 권장, 최소 600x314, 5,120KB 이하, jpg/png", "support.google.com 한국어 도움말", "A", "official", "2026-11-24"),
("Google", "실적 최대화(PMax)", "이미지 정사각 1:1", "1200x1200 권장, 최소 300x300", "support.google.com 한국어 도움말", "A", "official", "2026-11-24"),
("Google", "실적 최대화(PMax)", "로고", "1:1 1200x1200(최소 128x128), 가로 4:1 1200x300(최소 512x128)", "support.google.com 한국어 도움말", "A", "official", "2026-11-24"),
("Google", "실적 최대화(PMax)", "텍스트 글자수", "한·중·일 문자는 한 글자를 2자로 계산", "support.google.com 한국어 도움말", "A", "official", "2026-11-24"),
("YouTube", "건너뛸 수 있는 인스트림", "길이·건너뛰기", "5초 후 건너뛰기, 15초 또는 20초형(TV는 30초 가능)", "support.google.com/youtube 한국어 도움말", "A", "official", "2026-11-24"),
("YouTube", "범퍼", "길이", "건너뛸 수 없음, 최대 6초", "support.google.com/youtube 한국어 도움말", "A", "official", "2026-11-24"),
("YouTube", "컴패니언 배너", "크기·용량", "300x60, 150KB 미만, JPG/PNG/GIF, PC 전용", "내부 제작가이드(알페신 v5) · 공식 도움말 스니펫 일치", "A+C", "verified", "2026-11-24"),
("Kakao", "비즈보드(톡보드)", "크기·용량", "960x300px, 300KB 이하(PNG)", "kakaobusiness.gitbook.io 톡보드 가이드 + 외부DSP 문서", "A", "verified", "2026-11-24"),
("Kakao", "비즈보드(톡보드)", "카피 텍스트 길이", "최소 240px, 최대 526px", "kakaobusiness.gitbook.io 톡보드 가이드", "A", "official", "2026-11-24"),
("Kakao", "모먼트 동영상 16:9", "해상도·용량", "1280x720 이상, 1GB 이하, 3초 이상, AVI·FLV·MP4 권장", "kakaobusiness.gitbook.io 동영상 가이드", "A", "official", "2026-11-24"),
("Kakao", "모먼트 동영상 9:16", "해상도·용량", "720x1280 이상, 1GB 이하, 3초 이상", "kakaobusiness.gitbook.io 동영상 가이드", "A", "official", "2026-11-24"),
("Kakao", "모먼트 동영상 썸네일", "크기·용량", "300x300 이상 1:1 또는 비율별 최소 크기, 500KB 이하 JPG/JPEG/PNG", "kakaobusiness.gitbook.io 동영상 가이드", "A", "official", "2026-11-24"),
("TikTok", "인피드 광고(ko)", "해상도", "9:16 540x960 이상, 16:9 960x540 이상, 1:1 640x640 이상", "ads.tiktok.com 한국어 도움말 + 내부 제작가이드 v5", "A+내부", "verified", "2026-11-24"),
("TikTok", "인피드 광고(ko)", "파일", "mp4·mov(Spark 계열 포함), 500MB 이하, 516kbps 이상", "ads.tiktok.com 한국어 도움말 + 내부 제작가이드 v5", "A+내부", "verified", "2026-11-24"),
("TikTok", "프로필 이미지", "크기·용량", "98x98, JPG/JPEG/PNG, 50KB 미만", "ads.tiktok.com 한국어 도움말", "A", "official", "2026-11-24"),
("LinkedIn", "단일 이미지", "크기·용량", "1200x627, PNG/JPG, 5MB 미만", "business.linkedin.com 광고 가이드", "A", "official", "2026-11-24"),
("LinkedIn", "영상", "파일", "MP4, 500MB 미만", "business.linkedin.com 광고 가이드", "A", "official", "2026-11-24"),
("Meta", "Facebook 피드 영상(공식)", "비율·해상도·용량", "4:5, 1440x1800, 4GB, 1초~241분, H.264, AAC 128kbps 이상, 최소 120x120", "facebook.com/business/ads-guide (2026-11-23 렌더)", "A", "official", "2026-11-23"),
("Meta", "Instagram 피드 영상", "비율·해상도·용량", "4:5, 1440x1800, 4GB, MP4/MOV", "공식 Facebook 피드 페이지 + 내부 가이드 2건 일치", "A+내부", "verified", "2026-11-24"),
("Meta", "Instagram 스토리·릴스 영상", "비율·해상도", "9:16, 1440x2560, 용량 4GB, 릴스 15분, 피드 60분(내부)", "내부 제작가이드(정관장·알페신 v5), 웹 2차 일치", "내부+C", "consistent-secondary", "2026-11-24"),
("Meta", "Instagram 스토리·릴스 이미지", "세이프존", "상 14%(358px), 하 35%(896px), 좌우 6%(86px), 1440x2560 기준", "내부 제작가이드(알페신 v5)", "내부", "unverified", "2026-11-24"),
("Meta", "Threads 피드", "비율", "이미지 1:1~4:5, 영상 1.91:1~9:16, 4:5보다 길면 중앙 4:5로 크롭", "Meta 개발자 문서 스니펫 + 내부 가이드", "A+내부", "consistent-secondary", "2026-11-24"),
("Toss", "디스플레이 이미지", "크기·용량", "1200x628, 1200x1200(최소 1200x1200), 1080x1920(최소 1000x1000 등), 10MB 이하, 투명 배경 불가, 로고·브랜드명 필수", "내부 제작가이드(알페신 v5) — 토스 공식 본문 대조 미완", "내부", "unverified", "2026-11-24"),
("ChatGPT", "디스플레이", "크기", "1:1 최대 1200x1200 PNG/JPG, CTA는 '자세히 알아보기'만", "내부 제작가이드(알페신 v5, OpenAI 문서 인용)", "내부", "unverified", "2026-11-24"),
("TVING", "인스트림(일반·KBO)", "영상", "1920x1080, 논스킵 15·30초, 스키퍼블(5초) 6~120초, mp4·mov·mpg·wmv·avi, 300MB 이하, 24fps 이상, 128kbps", "tvingads.gitbook.io 소재 가이드", "A", "official", "2026-11-24"),
("TVING", "이미지", "크기·용량", "1200x364 / 2208x364, JPG/JPEG/PNG, 200KB 이하", "tvingads.gitbook.io 소재 가이드", "A", "official", "2026-11-24"),
("TVING", "생성형 AI 소재", "표기", "영상 시작과 동시에 최소 3초 이상 노출, Full HD 기준 화면 높이 3% 이상 권장", "tvingads.gitbook.io 소재 가이드", "A", "official", "2026-11-24"),
("나스미디어", "nap DSP 브랜드 리프트", "배너 사이즈", "PC 970x90, 728x90, 250x250, 160x600, 120x600, 300x600 / 모바일 320x50, 320x100, 300x250, 320x480 / Native 1200x627", "napdsp 매체상품소개서 202603 PDF", "B(렙사)", "official", "2026-11-24"),
("나스미디어", "nap DSP 영상", "길이", "브랜드 리프트 15~240초(CTV 15초), 범퍼 5~7초", "napdsp 매체상품소개서 202603 PDF", "B(렙사)", "official", "2026-11-24"),
# --- 옥외 ---
("CGV", "스크린", "영상", "30초 기본·15초 가능, 1920x1080(pptx 표기), H.264·QuickTime, 2ch, MP4 권장", "이메일 pptx + CGV 공식 PDF(2026-03-11)", "A+B", "verified", "2026-11-23"),
("CGV", "스크린", "용량", "30초 영상 기준 300MB 제한, 무압축 입고 자제", "CGV 공식 PDF", "A", "official", "2026-11-23"),
("CGV", "스크린", "납품·심의", "송출 예정일 D-3(공휴일 제외) 입고, 심의 접수 평일 16시까지, 필증 발급 월·화·목·금", "이메일 pptx + CGV 공식 PDF", "A+B", "verified", "2026-11-23"),
("CGV", "메트로라이브", "영상", "1,920x540, MP4 AVC(H.264) Profile Level 4.1 이하, 5Mbps 권장, 5영업일 전 입고", "이메일 pptx(해상도는 공식 PDF 97쪽과 일치)", "A+B", "verified", "2026-11-23"),
("서울지하철(올이즈웰)", "디지털종합안내도 Big Screen", "영상", "1,920x1,080, MP4·JPG, 15초, 사운드 지원", "올이즈웰 매체소개서 PDF", "B(렙사)", "official", "2026-11-24"),
("서울지하철(올이즈웰)", "디지털종합안내도 Mobile Poster", "영상", "1,080x1,920, MP4·JPG, 15초, 사운드 미지원", "올이즈웰 매체소개서 PDF", "B(렙사)", "official", "2026-11-24"),
("서울지하철(올이즈웰)", "디지털종합안내도 Rolling Banner", "영상", "1,920x540, MP4·JPG, 15초, 사운드 미지원", "올이즈웰 매체소개서 PDF", "B(렙사)", "official", "2026-11-24"),
("서울지하철(올이즈웰)", "디지털종합안내도 공통", "납품·심의", "게첨 5영업일 전 마감, 서울교통공사 심의 필수, 외국어 자막 한글 병기, 게임·영화 등급 고지, 소재 교체는 동일 초수·개수로만", "올이즈웰 매체소개서 PDF", "B(렙사)", "official", "2026-11-24"),
("타운보드(중앙일보)", "25인치", "해상도", "분할 1080x1920, 전면 1080x2480", "타운보드 Media Kit(2026.08) + 제작가이드(26.01) 일치", "B", "verified", "2026-11-24"),
("타운보드(중앙일보)", "50/55인치", "해상도", "전면 1080x2560", "타운보드 Media Kit(2026.08) + 제작가이드(26.01) 일치", "B", "verified", "2026-11-24"),
("타운보드(중앙일보)", "공통", "파일", "MP4, H.264, 4096kbps, 29.97~30fps, 2.5GB 미만, -6db, 15·30·45·60초", "타운보드 Media Kit + 제작가이드 일치", "B", "verified", "2026-11-24"),
("룩스 LUUX(동아일보)", "광화문 풀스크린", "해상도·파일", "4,728x5,760px(블랙바 제외 면 4,728x5,500), MP4 H.265 VBR, 50~100Mbps, 30~60fps, 음향 없음, 20·30초", "동아일보 소개서·콘텐츠제작가이드", "B", "official", "2026-11-24"),
("루미미디어(스푼)", "광화문 전광판", "해상도·운영", "2,192x2,976px, 20초 일 100회, 30초 일 70회, 06~24시", "스푼 소개서", "B", "official", "2026-11-24"),
("카카오모빌리티 옥외", "전광판", "파일", "JPG/MP4, 100MB, 디지털 라이브 4영업일 전 전달, 노출 기간 중 소재 변경 불가", "카카오모빌리티 소개서 Ver 6.1", "B", "official", "2026-11-24"),
("카카오모빌리티 옥외", "버스쉘터·편의점", "파일", "버스쉘터 JPG/PNG 200MB(2주 전 전달), 편의점 60MB", "카카오모빌리티 소개서 Ver 6.1", "B", "official", "2026-11-24"),
("현대백화점 On·Off", "오프라인·온라인", "납품", "게첨 마감: 심의 소재 7영업일 전, 일반 소재 5영업일 전, 소재 변경 주 1회", "현대백화점 광고상품소개서(26.06.17)", "B", "official", "2026-11-24"),
("더스퀘어+강남", "디지털", "운영", "15초 영상, 60 PLAN 일 60회 이상, 120 PLAN 일 120회 이상", "kt nasmedia 소개서 2026", "B", "official", "2026-11-24"),
("더스퀘어+강남", "인쇄", "납품", "AI 파일, 300dpi(최하 200dpi), CMYK, 폰트 아웃라인, 준불연 소재, 외부 출력 불가", "kt nasmedia 소개서 2026", "B", "official", "2026-11-24"),
("포커스미디어", "엘리베이터TV", "운영", "15초(일부 15/20초), 매주 월요일 송출, 편성 마감 송출일 기준 D-2, 25인치 세로형", "포커스미디어 제안서 2026.11 PDF", "B", "official", "2026-11-24"),
("울산역 KTX(렙사 전달)", "영상", "길이", "20초 이하 불가, 30초 소재, 15구좌, 일 204회", "애드타입 메일 2026-11-12", "B", "unverified", "2026-11-12"),
]

SPEC += [
("나스미디어 N.square(서울지하철 디지털 사이니지)", "상품별", "해상도", "3,840x1,080 / 5,760x1,080 / 2,048x1,024 / 3,584x1,280px (상품 대응 불명확)", "나스미디어 소개서 OCR", "B(렙사)·OCR", "unverified", "2026-11-25"),
("나스미디어 N.square(서울지하철 디지털 사이니지)", "공통", "파일", "MP4·JPG, 15·20·30초, 30fps, 사운드 불가, 용량 500MB 이하로 읽힘(낮은 확실도), 비트레이트 10Mbps로 읽힘(낮은 확실도)", "나스미디어 소개서 OCR", "B(렙사)·OCR", "unverified", "2026-11-25"),
("나스미디어 N.square(서울지하철 디지털 사이니지)", "공통", "심의", "서울교통공사 심의 통과 후에도 민원 시 송출 중단 가능", "나스미디어 소개서 OCR", "B(렙사)·OCR", "unverified", "2026-11-25"),
("서울지하철 인쇄(나스미디어)", "래핑 Special / Large", "크기", "Special 3,300x1,700mm, Large 2,600x1,700mm, 방염 원단", "나스미디어 지하철 12578 소개서 OCR", "B(렙사)·OCR", "unverified", "2026-11-25"),
("서울지하철 인쇄(나스미디어)", "포스터·액자·차내조명", "크기", "포스터 800x1,100mm, 액자형 510x364mm, 차내조명 393x230mm", "나스미디어 지하철 12578 소개서 OCR", "B(렙사)·OCR", "unverified", "2026-11-25"),
("서울지하철 인쇄(나스미디어)", "공통", "파일", "AI 단일 파일, 300dpi(최하 200dpi), CMYK, 폰트 아웃라인, 이미지 포함. 방염 소재, 외부 제작사는 소방 시험성적서 제출", "나스미디어 지하철 12578 소개서 OCR", "B(렙사)·OCR", "unverified", "2026-11-25"),
("서울지하철(공통 심의)", "사전심의 요건", "업종별", "의약품 한국제약바이오협회, 의료기기 한국의료기기산업협회, 병원 대한의사협회, 건강기능식품 한국건강기능식품협회, 금융 금융투자협회·준법감시인 심의필증. '최고·가장·최초' 증빙 필수", "나스미디어 소개서 OCR(지하철·N.square 일치)", "B(렙사)·OCR", "consistent-secondary", "2026-11-25"),
("IPTV 광고(나스미디어)", "노출 기준", "viewability", "영상 광고 2초 이상 지속, 화면 내 50% 이상 노출이 최소 기준", "나스미디어 IPTV 통합 소개서 OCR", "B(렙사)·OCR", "unverified", "2026-11-25"),
]

SPEC += [
("성수역 출구 디지털 안내도(올이즈웰)", "2번 출구", "해상도", "2,560x1,584px 단일 파일(표에 2,980x1,584로도 읽힘)", "올이즈웰 DOOH PKG 소개서 OCR", "B(렙사)·OCR", "unverified", "2026-11-25"),
("성수역 출구 디지털 안내도(올이즈웰)", "3번 출구", "해상도", "2,432x1,584px 단일 파일", "올이즈웰 DOOH PKG 소개서 OCR", "B(렙사)·OCR", "unverified", "2026-11-25"),
("성수역 출구 디지털 안내도(올이즈웰)", "4번 출구", "해상도", "2,048x1,440px 단일 파일", "올이즈웰 DOOH PKG 소개서 OCR", "B(렙사)·OCR", "unverified", "2026-11-25"),
("성수역 출구 디지털 안내도(올이즈웰)", "공통", "파일·표기", "mp4·mkv(4번 avi 포함) 15~60Mbps 30~60fps, jpg·bmp 72dpi, 15초(20초 불가), 출구별 최대 2종, 외국어 자막 한글 병기, 게임·영화 등급 고지", "올이즈웰 DOOH PKG 소개서 OCR", "B(렙사)·OCR", "consistent-secondary", "2026-11-25"),
("서울버스TV(메가박스)", "스테이션익스클루시브", "소재", "고정 이미지 JPG·PNG, 사운드 없음, 무빙 효과 불가, 정류장 도착 직전 10초 노출, 라이브·교체 3영업일 전 입고", "서울버스TV 스테이션익스클루시브 제안서 OCR", "B(매체사)·OCR", "unverified", "2026-11-25"),
("헬로미디어(루크코리아 병·의원 TV)", "병·의원 대기실", "영상", "MP4, 1920x1080, 30fps, 15초, 음향 미지원, 게재 3일 전 입고·소재 심의(D-3), 기본 30구좌, 하루 10시간", "헬로미디어 media proposal 26.08 OCR", "B(렙사)·OCR", "unverified", "2026-11-25"),
("스푼 잠실 지하광장", "사각기둥 라이트박스", "규격(외경/내경)", "기본 1,410x2,307 / 1,310x2,207, 연동 1,060x2,307 / 960x2,207, 소형 1,410x1,705 / 1,310x1,605 (단위 불명)", "스푼 잠실 지하광장 소개서 OCR", "B(렙사)·OCR", "unverified", "2026-11-25"),
]

CONFLICT = [
("타운보드M 게시판 해상도", "제작가이드(26.01.20): 1080x1810", "Media Kit(2026.08)와 카카오모빌리티 Ver 6.1: 1080x1920", "Media Kit·카카오모빌리티가 더 최신이고 둘이 일치 → 1920이 현행일 가능성. 매체사에 확인 필요(제작 전 필수)", "미해결"),
("타운보드 파일 용량 한도", "Media Kit·제작가이드: 2.5GB 미만", "카카오모빌리티 판매분: 최대 1GB", "판매사에 따라 더 보수적으로 안내. 1GB 이하로 만들면 두 쪽 모두 안전", "미해결(안전 기준 있음)"),
("카카오 비즈보드 크기", "나스미디어 2026.03 소개서: bizboard 1029*258", "카카오 공식(톡보드·외부DSP): 960x300", "공식 기준 960x300. 소개서는 구판 표기", "해소"),
("TikTok 인피드 해상도", "2차 자료: 720x1280·1080x1920 등", "공식: 9:16 540x960 이상", "공식은 최소값, 2차는 권장치", "해소"),
("LinkedIn 영상 용량", "2차 자료: 200MB", "공식: 500MB 미만", "공식 기준 채택", "해소"),
("Instagram 피드 영상 길이", "내부 가이드: 최대 60분", "Meta 공식(Facebook 피드): 1초~241분", "노출 위치가 다름. 인스타그램 전용 페이지의 값은 미확인", "미해결"),
("카카오 네이티브 4:5 세이프존", "내부 가이드 v1·v2에서 짝이 다르게 읽힘", "카카오 디스플레이 공식 문서", "공식 문서 본문 확인 필요", "미해결"),
("X 크리에이티브 사양", "help.x.com/ko: 비디오·이미지 규격", "business.x.com 캐러셀 등 다른 페이지", "페이지 간 수치 충돌 보고됨. help.x.com은 봇 차단(403)이라 직접 확인 못함", "미확인"),
("Google 비건너뛰기 인스트림 길이", "비즈니스 자료: 15초 이내", "도움말: 15초형 7~15초, 30초형(CTV) 16~30초", "도움말 기준을 우선", "미해결"),
("스페이스애드 버스쉘터 수", "판매안 문서 내 2,121개", "같은 문서 내 2,232개", "문서 안에서 다르게 표기. 원문 확인 필요", "미해결"),
("N.square 해상도 4종의 상품 대응", "OCR로 숫자 4개는 읽힘", "상품별 도식은 이미지", "원본 PDF 35~36쪽을 눈으로 확인해야 대응 확정", "미해결"),
("서울버스TV 소재 규격", "960x540px로 읽힘", "1,920px 계열로도 읽힘", "OCR이 불명확. 원본 13쪽 확인 필요", "미해결"),
("성수역 2번 출구 해상도", "제목: 2,560x1,584", "표: 2,980x1,584로 읽힘", "OCR 오타 가능. 원본 15쪽 확인 필요", "미해결"),
("지디아(지하철 디지털종합안내도) 운영사", "올이즈웰 2026-11-26까지 연장", "이후 재입찰 예정, 미확정", "운영사 변경 시 규격·마감이 달라질 수 있음", "주시"),
]

wb = Workbook()
HF = PatternFill("solid", fgColor="1F2A37"); HFONT = Font(bold=True, color="FFFFFF", name="Malgun Gothic", size=10)
BODY = Font(name="Malgun Gothic", size=10); THIN = Side(style="thin", color="D0D7DE")
FILL = {"검증됨": "C6EFCE", "부분 확인": "FFF2CC", "소스 후보": "DDEBF7", "미착수": "EDEDED", "verified": "C6EFCE", "official": "E2F0D9", "consistent-secondary": "FFF2CC", "unverified": "FCE4D6", "해소": "C6EFCE", "미해결": "FCE4D6", "미확인": "EDEDED", "주시": "FFF2CC", "미해결(안전 기준 있음)": "FFF2CC"}
def sheet(ws, headers, rows, widths, statcol=None):
    ws.append(headers)
    for c in ws[1]:
        c.fill = HF; c.font = HFONT; c.alignment = Alignment(vertical="center", wrap_text=True)
    for r in rows: ws.append(list(r))
    for row in ws.iter_rows(min_row=2):
        for c in row:
            c.font = BODY; c.alignment = Alignment(vertical="top", wrap_text=True); c.border = Border(bottom=THIN)
        if statcol is not None:
            v = row[statcol].value
            if v in FILL: row[statcol].fill = PatternFill("solid", fgColor=FILL[v])
    for i, w in enumerate(widths, 1): ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A2"; ws.auto_filter.ref = ws.dimensions; ws.row_dimensions[1].height = 22

ws = wb.active; ws.title = "매체 마스터"
rows = []
for z in ZONES:
    for r in z["regions"]:
        for it in r["items"]:
            rows.append((z["name"], r["name"], it["n"], SL[it["s"]], r["form"], r["route"], it["note"]))
sheet(ws, ["영역", "구역", "매체", "수집 상태", "소재 형태", "가이드 경로", "확인한 내용 / 남은 일"], rows, [14, 22, 30, 11, 20, 22, 90], statcol=3)

ws2 = wb.create_sheet("확인된 규격")
sheet(ws2, ["매체", "지면·상품", "항목", "값", "출처", "출처 등급", "검증 상태", "확인일"], SPEC, [18, 24, 18, 70, 42, 9, 18, 11], statcol=6)

ws3 = wb.create_sheet("충돌·확인 필요")
sheet(ws3, ["항목", "소스 A", "소스 B", "판단·메모", "상태"], CONFLICT, [26, 38, 42, 60, 14], statcol=4)

ws4 = wb.create_sheet("가이드 URL")
reg = list(csv.DictReader(open(f"{REPO}/guide-monitor/guide-registry.csv", encoding="utf-8")))
sheet(ws4, ["ID", "매체", "문서", "URL", "유형", "상태", "감지 방식", "메모", "확인일"], [(r["guide_id"], r["media"], r["guide"], r["url"], r["url_type"], r["status"], r["method"], r["notes"], r["probed_at"]) for r in reg], [26, 16, 34, 60, 14, 12, 10, 60, 11])

ws5 = wb.create_sheet("읽는 법")
for line in [
    "매체 마스터: 지도(media-mindmap.html)와 같은 98개 매체, 수집 상태와 확인한 내용.",
    "확인된 규격: 문서 본문에서 직접 읽은 값만. 출처 등급 A=공식 문서, B=렙사·매체사 자료, 내부=이노레드 내부 가이드, C=2차 자료.",
    "검증 상태: verified=독립 소스 2개 이상 일치, official=공식/매체사 단일 소스, consistent-secondary=2차 자료와만 일치, unverified=단일·비공식.",
    "충돌·확인 필요: 소스끼리 값이 다르거나 아직 못 읽은 항목. 제작 전에 원문 확인이 필요한 것은 미해결로 표시.",
    "단가·견적·수수료·연락처는 포함하지 않았다.",
    "작성일 2026-11-25. 이후 변경은 반영되지 않는다.",
]: ws5.append([line])
ws5.column_dimensions["A"].width = 130
for row in ws5.iter_rows():
    for c in row: c.font = BODY; c.alignment = Alignment(wrap_text=True, vertical="top")
wb.move_sheet("읽는 법", offset=-4)
out = f"{REPO}/media-master.xlsx"; wb.save(out); print(out, len(rows), "media", len(SPEC), "spec", len(CONFLICT), "conflict", len(reg), "urls")
