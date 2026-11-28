/* 세대별 최신 밈·트렌드 리포트 — 데이터
 * 원본: reports/세대별 최신 밈 트렌드 리포트(.md) + 추가 근거 링크 검색(2026-11-28)
 * 근거 유형: src=기사·리포트·공식자료 / yt=유튜브 / com=커뮤니티 / db=밈 데이터베이스
 * 신뢰도: ok=확인, sec=2차 인용, unv=미검증 (검색 결과 요약문 기준, 원문 대조 전)
 * 유튜브·커뮤니티 링크는 검색 엔진에서 실제로 잡힌 URL이며 제목은 검색 결과 그대로다.
 * 링크된 페이지의 본문은 열람하지 못했으므로 내용은 열어서 직접 확인해야 한다.
 */
(function () {
  var S = function (label, url, note) { return { t: 'src', label: label, url: url, note: note || '' }; };
  var Y = function (label, url, note) { return { t: 'yt', label: label, url: url, note: note || '' }; };
  var C = function (label, url, note) { return { t: 'com', label: label, url: url, note: note || '' }; };
  var D = function (label, url, note) { return { t: 'db', label: label, url: url, note: note || '' }; };

  window.REPORT = {
    meta: {
      title: '세대별 밈·트렌드 리포트',
      subtitle: '한국 중심(글로벌 보조) · 알파 · Z · 밀레니얼 · X/시니어',
      asOf: '2026-11-28',
      method: '검색 결과 요약문(스니펫) 기반. 외부 원문 열람이 막혀 있어 수치 다수가 2차 인용이다. 항목마다 신뢰도를 표시했다.',
      confLegend: {
        ok: '복수 매체가 일관되게 보도했거나 1차 발표가 확인된 것(스니펫 기준)',
        sec: '다른 기사·블로그가 인용한 수치이거나 단일 출처',
        unv: '블로그·리스트형 콘텐츠이거나 원문을 확인하지 못한 것'
      }
    },

    headline: '밈은 세대를 건너며 의미를 갈아입는다',
    bluf: [
      '2026년 11월, 한국 밈의 지도에는 선이 두 개 그어져 있다. 하나는 속도다. 두바이 쫀득쿠키는 2025년 10월 말에 시작해 2026년 1월 중순에 정점을 찍고 2월에 식었다. 한국 Z세대의 푸드·굿즈 유행은 정점 후 2~4주에 반토막이 나고, 1~3개월이면 다른 것으로 바뀐다. 다른 하나는 사람 냄새다. AI가 만든 것이 넘칠수록 직접 만지고 듣고 줄 서는 감각이 주목받는다.',
      '같은 밈이 세대마다 다른 뜻을 입는다. 알파세대에게 67과 AI 합성 이탈리안 브레인롯은 뜻이 없어서 더 잘 통하는 교실의 암호다. 밀레니얼은 한국에서 전용 밈이 거의 확인되지 않고, 글로벌에서는 2016 감성과 밀레니얼 vs Z세대 마케팅 포맷에 향수를 대 주는 쪽이다. X세대·시니어는 보는 쪽에서 만드는 쪽으로 옮겨 가는 중이며, 한국 X세대 고유 밈은 근거를 찾지 못했다.',
      '브랜드가 챙길 것은 셋이다. 속도형 유행에는 한정 SKU와 짧은 재고 주기, 습관형 트렌드(러닝 등)에는 커뮤니티, AI로 만든 티가 나는 노출에는 반감이라는 비용.'
    ],

    deckBullets: [
      '속도: 한국 푸드·굿즈 유행은 정점 후 2~4주에 반토막, 1~3개월이면 교체된다(두쫀쿠 2026.1.13 정점 → 2월 급랭, 후속 디저트 6종 릴레이)',
      '사람 냄새: AI 생성물이 넘칠수록 직접 만지고 듣고 줄 서는 감각이 주목받는다(slop 반감, Great Meme Reset)',
      '알파세대: 67·이탈리안 브레인롯은 뜻이 없어서 통하는 교실의 암호. 67은 이미 10대 사이 조롱 단계',
      '밀레니얼: 한국 전용 밈 근거는 거의 없고, 글로벌에서는 2016 감성·세대 마케팅 밈에 향수를 공급한다',
      'X세대·시니어: 보는 쪽에서 만드는 쪽으로(유튜브·생성형 AI·트로트 팬덤). 한국 X세대 고유 밈은 근거 없음',
      '브랜드: 속도형은 한정 SKU·짧은 재고 주기, 습관형(러닝)은 커뮤니티, AI 티 나는 노출은 반감이라는 비용'
    ],

    kpis: [
      { v: '17일', l: '두쫀쿠 검색량이 정점 후 절반이 되기까지', conf: 'sec', src: S('서울신문(NYT 인용)', 'https://nownews.seoul.co.kr/news/newsView.php?id=20260226601015') },
      { v: '6종', l: '2026년 3~11월 이어진 후속 디저트(버터떡→머랭롤)', conf: 'ok', src: S('WOWTV 2026-11-26', 'https://www.wowtv.co.kr/NewsCenter/News/Read?articleId=A202611260091') },
      { v: '100 → 4', l: '라부부 네이버 검색량(2025.7 → 11월 초)', conf: 'ok', src: S('세계일보', 'https://www.segye.com/newsView/20251108501044') },
      { v: '-88%', l: "라부부 '자아 키링' 리셀가, 5개월", conf: 'ok', src: S('세계일보', 'https://www.segye.com/newsView/20251108501044') },
      { v: '61%', l: '50대 유튜브 뉴스 이용률(전 연령 최고)', conf: 'sec', src: S('쿠키뉴스(언론진흥재단 2025)', 'https://www.kukinews.com/article/view/kuk202511190034') },
      { v: '9 → 30%', l: '미국 50+ 생성형 AI 이용(2023 → 2025)', conf: 'ok', src: S('AARP', 'https://www.aarp.org/pri/topics/technology/internet-media-devices/2026-technology-trends-older-adults/') },
      { v: '63%', l: '2030 남성의 영포티 부정 인식(한국리서치, 재게시 기사 인용)', conf: 'sec', src: C('더쿠 재게시 기사', 'https://theqoo.net/square/4155688026') },
      { v: '39% vs 20%', l: 'AI 광고 부정 정서 Gen Z vs 밀레니얼(IAB)', conf: 'sec', src: S('Digiday', 'https://digiday.com/marketing/backlash-grows-against-ai-slop-but-marketers-remain-unfazed/') }
    ],

    generations: [
      {
        id: 'alpha', name: '알파세대', range: '2010~2024년생 · 약 8~16세', color: '#e8590c',
        tagline: '의미 없음이 가장 강한 암호가 된다',
        insight: '알파세대는 글보다 이미지로, 이미지보다 밈으로 말한다. AI 네이티브라는 설명이 따라붙는다. 이 아이들이 67이나 브레인롯을 나누는 이유는 뜻을 알아서가 아니라 같은 순간에 같이 웃기 위해서다. 뜻이 없으니 아는 아이끼리만 터진다. 이 해석은 조사자의 추론이며 검증이 필요하다. 한국 알파세대의 소비 동기를 직접 물은 자료는 확보하지 못했다.',
        insightSrc: [S('토스페이먼츠 블로그', 'https://www.tosspayments.com/blog/articles/42325', '2차 인용'), S('NPR', 'https://www.npr.org/2025/10/19/nx-s1-5578929/why-the-numbers-6-7-are-driving-math-teachers-up-the-wall'), S('머니투데이', 'https://www.mt.co.kr/world/2025/11/09/2025110615282321202', '"67쪽 펴" 교실 반응')],
        implications: [
          '밈 직접 차용은 교실의 소음 문제와 부딪힌다. 67은 영국 일부 교사가 사용을 제한했고 미국 교사들이 벌칙·에세이로 대응했다. 학부모·학교 환경에서 직접 쓰면 반발 위험이 크다.',
          '한국 알파세대의 IP 소비는 케데헌 굿즈와 다이소·아트박스 같은 저가 캐릭터 채널로 이동하고 있다(본문 미확인). 저가 수집형·참여형 굿즈가 안전하다는 것은 가설이다.',
          '로블록스 인기작은 수개월 단위로 급등락하는 버스트형으로 보인다(추정). 장기 계약형 플랫폼 투자는 신중해야 한다.',
          '팬메이드 스키비디 영상 중 폭력적·섬뜩한 것이 있어 브랜드 세이프티 점검이 필요하다.'
        ],
        implSrc: [S('The 74', 'https://www.the74million.org/article/the-6-7-craze-offered-a-brief-window-into-the-hidden-world-of-children/'), S('한국경제(다이소·아트박스, 본문 미확인)', 'https://www.hankyung.com/amp/202607056343i'), S('Screenwise', 'https://screenwiseapp.com/guides/navigating-online-trends-challenges')],
        gaps: ['한국 알파세대의 2026 유행어 순위·설문(대학내일·오픈서베이·나스미디어)', '로블록스 한국 MAU, 브롤스타즈·마인크래프트 점유율', '아자스·밤티·평반·임구 등 신조어의 뜻과 사용 연령(제목 수준만 확인)']
      },
      {
        id: 'z', name: 'Z세대', range: '1997~2009년생 · 10대~20대 후반', color: '#7048e8',
        tagline: '한국에서 가장 빠르게 태어나고 가장 빨리 식는다',
        insight: 'Z세대가 유행을 나누는 이유는 넷이다(조사자의 추론이며 설문 수치는 없다). 첫째, 오픈런과 인증샷은 나는 지금 그 한복판에 있다는 증명이다. 둘째, 무맥락과 아이러니는 아는 사람끼리의 암호다. 셋째, AI로 가짜 이미지가 쉬워진 만큼 직접 만지고 느끼는 감각이 귀해졌다. 넷째, 따라 하고 바꿔 찍는 것이 곧 참여여서 문턱이 낮다. 정체성의 신호는 귀해야 값이 나가고, 공급이 늘면 값이 먼저 무너진다(두쫀쿠, 라부부).',
        insightSrc: [S('코리아센터 게재본(틱톡×대학내일)', 'https://www.koreancenter.or.kr/news/articleView.html?idxno=1437696'), S('뉴스와이어(Z세대 트렌드 2026)', 'https://www.newswire.co.kr/newsRead.php?no=1021531')],
        implications: [
          '한국 Z세대 유행에서 돈을 번 쪽은 속도를 쥔 유통사였고, 손해를 본 쪽은 끝물에 고정비를 넣은 자영업자였다.',
          '정점 전에 들어갈 수 없는 유행이면 들어가지 않는다. 나올 기준도 들어가기 전에 정해 둔다.',
          '단일 히트 의존은 위험하다(라부부 → 팝마트 IP 다변화). 반대로 재료·식감을 바꿔 진화하면 롱런이 가능하다는 전문가 의견도 있다.',
          '텍스처 플레이와 진짜 선호는 AI 시대에 실물 체험(팝업, 샘플링, 소리·질감 중심 영상)을 설계할 근거가 된다.'
        ],
        implSrc: [S('Dazed(라부부 거품)', 'https://www.dazeddigital.com/fashion/article/70073/1/labubu-bubble-bursting-obituary-pop-mart-stock-plummet'), S('서울신문(이은희 교수)', 'https://nownews.seoul.co.kr/news/newsView.php?id=20260226601015')],
        gaps: ['에브리타임·X·스레드 구체 밈', '오픈서베이·나스미디어 수치, 제로 유행 사이클', '2026년 10~11월 한국 밈 톱 리스트(머랭롤 외 거의 미확인)', '챌린지·신조어 목록은 블로그 기반이라 날짜 교차확인 필요']
      },
      {
        id: 'm', name: '밀레니얼', range: '1981~1996년생 · 약 30~45세', color: '#1c7ed6',
        tagline: '한국에서는 전용 밈이 희미하고 글로벌에서는 향수의 공급자다',
        insight: '결론부터 말한다. 한국 밀레니얼에게 귀속되는 2026년 밈의 근거는 거의 없다. 직장, 육아, 영끌, 오마카세, 골프, 피클볼의 2026년 한국 밀레니얼 밈과 수치는 찾지 못했다. 그래서 이 세대는 무엇이 있는지보다 무엇이 확인되고 무엇이 비어 있는지를 가른다. 확인된 소비 동기는 피로와 불안 속에서 기분을 되찾는 것(필코노미, 향수), 소속감, 가성비다.',
        insightSrc: [S('Daum(트렌드 코리아 2026 필코노미)', 'https://v.daum.net/v/20251227000318332', '2차 인용')],
        implications: [
          '속도형(두쫀쿠)에는 한정 SKU와 짧은 재고 주기를, 습관형(러닝)에는 커뮤니티와 클럽을 쓴다는 구분이 합리적이다(추론). 한국 밀레니얼 타깃 밈 캠페인의 정량 성과는 확보하지 못했다.',
          '향수 마케팅은 2026년에 가끔의 장치에서 상시 도구가 되었다. 다만 Digiday는 crutch가 될 수 있다고 경고하고, 시대를 문자 그대로 재현하지 말라는 조언이 있다.',
          'Y2K 향수의 어두운 면(인종차별 논란)도 점검 대상이다.'
        ],
        implSrc: [S('Dynamic Business(Dove Hot Like Us)', 'https://dynamicbusiness.com/topics/news/how-brands-are-bringing-back-the-90s-to-win-over-exhausted-consumers-in-2026'), S('Digiday(crutch)', 'https://digiday.com/marketing/marketing-briefing-why-nostalgia-marketing-can-be-a-crutch'), S('CosmeticsDesign', 'https://www.cosmeticsdesign-europe.com/Article/2026/03/04/how-can-brands-tap-the-nostalgia-craze-without-looking-dated'), S('Fortune(Y2K 어두운 면)', 'https://fortune.com/2025/10/21/gen-z-nostalgia-y2k-year-2000-racism-nazi-controversy-dark-side-retro/')],
        gaps: ['한국 밀레니얼 직장·육아·영끌 밈', '오마카세·골프·피클볼 한국 수치', '한국의 밀레니얼 vs Z세대 밈 갈등(아재 개그 담론)', '낳음 당했다(2026-10-24 보도): 제목만 확인']
      },
      {
        id: 'x', name: 'X세대·시니어', range: '1955~1980년생 · 40대 후반~70대', color: '#2b8a3e',
        tagline: '소비자에서 제작 참여자로 올라서고 있다',
        insight: '한국에서 5060은 유튜브·생성형 AI·트로트 팬덤·시니어 크리에이터를 축으로 디지털 소비의 주류로 올라섰다는 것이 오픈서베이 2026 전망의 소제목이다(스니펫만 확인). 조사자의 추론은 소비에서 생산으로 넘어간다는 것이다. 신뢰와 프라이버시가 AI 도입의 최대 장벽이라는 점은 AARP 자료가 뒷받침한다(미국 데이터).',
        insightSrc: [S('오픈서베이 트렌드리포트 2026', 'https://blog.opensurvey.co.kr/news/trendreport-2026-trend-1/', '스니펫만 확인'), S('AARP', 'https://www.aarp.org/pri/topics/technology/internet-media-devices/2026-technology-trends-older-adults/', '미국 데이터')],
        implications: [
          '근거가 있는 접점은 두 가지다. 신뢰 확보형 교육(카카오임팩트의 복지관 AI 교육)과 팬덤 기반 굿즈. 두 사례 모두 성과 수치는 없다.',
          '시니어 타깃 밈 마케팅은 젊은 밈 이식보다 이 세대가 이미 소비하는 플랫폼(유튜브, 트로트)에서 제작 참여를 지원하는 쪽이 근거에 가깝다(추론).',
          '꼰대 낙인이 나이든 상사에서 소비력 있는 40대로 옮겨 가는 신호가 있다(정량 조사는 제한적).'
        ],
        implSrc: [S('Korea Daily(복지관 AI 교육)', 'https://www.koreadaily.com/article/20260513133058822'), S('Kakao(시니어 작가 협업)', 'https://www.kakaocorp.com/page/detail/11457', '연도·성과 미확인')],
        gaps: ['한국 X세대(40대 후반~50대 중반) 고유 밈', '카톡 꽃·인사 이미지(AI 생성 포함), 밴드, 7080 복고', '닐슨·나스미디어 시니어 수치, 5060 골프·러닝', '부머가 젊은 밈을 채택한 구체 사례, 해외 할머니·할아버지 크리에이터']
      }
    ],

    trends: [
      /* ───────── 알파 ───────── */
      {
        id: 'six-seven', name: '67 (식스-세븐)', gens: ['alpha'], scope: 'GL+KR', status: 'fading', conf: 'ok',
        period: '2024.12 곡 발매 · 2025.1 농구 편집으로 확산 · 2026.3 10대 사이 조롱 단계',
        origin: "래퍼 Skrilla의 'Doot Doot (6 7)'(Know Your Meme 요약 기준 2024년 12월 발매)과 농구 선수 LaMelo Ball 편집이 틱톡에서 결합. 노트 간에 갈리던 연도·선수는 KYM 요약으로 보정했으나 원문은 열람하지 못했다.",
        platform: '틱톡, 교실',
        summary: "Dictionary.com 2025 올해의 단어, Merriam-Webster 2025 준우승. 뜻이 정의되지 않은 것이 특징이고, 한국에서는 '67쪽 펴'에 학생들이 웃는다는 보도가 있다(단일 기사). 2026년 3월 기사 기준 10대 사이에서는 이미 조롱 대상이다.",
        why: '해석이 아니라 반응의 동시성. 뜻이 없으니 아는 사람끼리만 터지는 내집단 신호가 된다.',
        brand: '교실·학부모 환경에서 직접 차용 금지. 이미 식은 밈이라 지금 진입은 늦다.',
        q: '67 밈', tag: '67밈',
        ev: [
          D('Know Your Meme — 67 Meme / Six Seven', 'https://knowyourmeme.com/memes/67-meme', '곡·확산 시점 요약 확인'),
          S('EdWeek — Dictionary.com 2025 올해의 단어', 'https://www.edweek.org/teaching-learning/six-seven-the-2025-dictionary-com-word-of-the-year-causes-school-chaos/2025/10'),
          S('NPR — 수학 교사를 괴롭히는 6-7', 'https://www.npr.org/2025/10/19/nx-s1-5578929/why-the-numbers-6-7-are-driving-math-teachers-up-the-wall'),
          S('머니투데이 — "67쪽 펴" 한국 교실', 'https://www.mt.co.kr/world/2025/11/09/2025110615282321202', '단일 기사'),
          S('ScreenWise — 2026-03 하락·조롱 단계', 'https://screenwiseapp.com/guides/when-online-trends-spill-into-real-life-conversations', '2차 인용'),
          S('PBS — Merriam-Webster 2025 (준우승 6-7)', 'https://www.pbs.org/newshour/nation/merriam-websters-word-of-the-year-for-2025-is-ais-slop'),
          Y('67 Meme EXPLAINED', 'https://www.youtube.com/watch?v=sdgqPvjDxkI'),
          Y('The 67 Meme: Explained with Music (Six Seven)', 'https://www.youtube.com/watch?v=QJRFrVE7JvY'),
          Y('The "6-7" Meme Explained: How Two Numbers Took Over 2025', 'https://www.youtube.com/watch?v=9p_hiuTFSi8')
        ]
      },
      {
        id: 'it-brainrot', name: '이탈리안 브레인롯 · 퉁퉁퉁 사후르', gens: ['alpha', 'z'], scope: 'GL+KR', status: 'fading', conf: 'ok',
        period: '2025.1 틱톡에서 시작 · 2025 여름 이후 피크 경과(학자 평가, 시점 추정)',
        origin: "AI 합성 이미지, 무의미한 이탈리아어 내레이션, 중독성 반복 사운드. Know Your Meme 요약 기준 2025년 1월 초 틱톡의 Tralalero Tralala(나이키 신은 상어)에서 시작. 퉁퉁퉁 사후르는 야구배트 캐릭터.",
        platform: '틱톡·쇼츠·릴스, 굿즈',
        summary: '한국에서는 KOCCA와 토스페이먼츠가 소개했고, Esquire Korea는 퉁퉁퉁 사후르와 그룹 라이즈 성찬의 관련 티셔츠 착용 사례를 다뤘다. AFP를 인용한 기사에서 학자는 이미 피크가 지났다고 평가했다.',
        why: '황당한데 묘하게 중독적이라는 반응. AI 합성물인데도 아이들에게는 놀이 코드다.',
        brand: 'AI 생성물 자체가 성인층에서는 slop 반감의 대상이다. 같은 소재가 세대별로 정반대로 읽힌다.',
        q: '이탈리안 브레인롯', tag: '이탈리안브레인롯',
        ev: [
          D('Know Your Meme — Italian Brainrot / AI Italian Animals', 'https://knowyourmeme.com/memes/italian-brainrot-ai-italian-animals', '시작 시점 요약 확인'),
          S('KOCCA — 이탈리안 브레인롯 소개', 'https://www.kocca.kr/n_content/kocca_vol35/02.html'),
          S('Esquire Korea — 퉁퉁퉁 사후르', 'https://www.esquirekorea.co.kr/article/1882152', '2차 인용'),
          S('inkl/AFP — 피크 경과 평가', 'https://www.inkl.com/news/italian-brainrot-the-ai-memes-only-kids-know', '2차 인용'),
          Y('퉁퉁퉁사후르의 모든 것', 'https://www.youtube.com/watch?v=Dj4fwXZaX9k'),
          Y('이탈리안 브레인롯 공식 뮤직비디오', 'https://www.youtube.com/watch?v=WX5UVMpEyzo', '채널 정체·공식 여부 미확인'),
          Y('Italy Brainrot Memes EXPLAINED: Why Gen Z Loves AI', 'https://www.youtube.com/watch?v=EEqkB3xtXHM')
        ]
      },
      {
        id: 'roblox', name: '로블록스 · Steal a Brainrot', gens: ['alpha'], scope: 'GL', status: 'peak', conf: 'ok',
        period: '2025.8 동시접속 47.4M · 2025.10 Steal a Brainrot 25.4M',
        origin: '로블록스 인기 체험이 수개월 단위로 급등락. 알파 슬랭은 로블록스 → 트위치 → 틱톡 경로로 퍼진다는 보도가 있다.',
        platform: '로블록스, 트위치, 틱톡',
        summary: '접속 수치는 확인되지만 대부분 2025년 정점이라 2026년 상태는 제한적이다. 일본 초등생 367명 조사에서 로블록스 12.7%(전년 1.5%), 마인크래프트 31.8%이나 표본이 작고 조사 주체가 로블록스 게임 운영사라 한국 비교용으로 쓸 수 없다. 한국에서는 연령 기반 접근·채팅 제한 도입 예정 보도가 있다.',
        why: '게임이 곧 놀이터이자 슬랭 공장.',
        brand: '인기작 수명이 짧아 장기 계약형 플랫폼 투자는 신중(추정).',
        q: '로블록스 브레인롯', tag: '로블록스',
        ev: [
          S('PocketGamer.biz — Steal a Brainrot 25M 동시접속', 'https://www.pocketgamer.biz/robloxs-steal-a-brainrot-becomes-first-game-to-surpass-25m-concurrent-players'),
          S('NBC News — 알파 슬랭 전파 경로', 'https://www.nbcnews.com/news/amp/rcna162227'),
          S('GameBusiness.jp — 일본 초등생 조사', 'https://www.gamebusiness.jp/article/2026/06/29/27345.html', '일본·소표본'),
          S('비즈워치 — 로블록스 연령 제한', 'https://news.bizwatch.co.kr/article/mobile/2026/04/14/0043', '2차 인용')
        ]
      },
      {
        id: 'kdh', name: '케데헌 (KPop Demon Hunters)', gens: ['alpha', 'z'], scope: 'GL+KR', status: 'steady', conf: 'ok',
        period: '2025.6 공개 · 2026.2 뉴욕 토이페어 완구 라인업',
        origin: '넷플릭스 애니메이션. 2026년 2월 마텔·해즈브로·레고 신제품 발표. Google 2025 Year in Search에서 미국 2위.',
        platform: '넷플릭스, 유튜브, 굿즈',
        summary: '한국 파급으로 국립중앙박물관 호랑이 뱃지 품절, 농심 한정 패키지가 있었다. Meltwater는 2025년 5~8월 참여 1억 1,700만 건으로 집계했다(2차 인용).',
        why: '밈이 아니라 IP가 세대를 가로지르는 사례.',
        brand: '저가 수집형·참여형 굿즈 채널로 이동. 이 IP 위의 협업은 가장 안전한 알파·Z 접점이다.',
        q: '케데헌', tag: '케데헌',
        ev: [
          S('Tribune PH — 토이페어 완구 확장', 'https://tribune.net.ph/2026/02/18/kpop-demon-hunters-toys-expand-globally-after-ny-toy-fair'),
          Y('"Golden" Official Lyric Video (Sony Pictures Animation)', 'https://www.youtube.com/watch?v=yebNIHKAC4A', '검색 결과 기준 약 18.5억 뷰(수집 시점)')
        ]
      },
      /* ───────── Z ───────── */
      {
        id: 'dduzzonku', name: '두바이 쫀득쿠키 (두쫀쿠)', gens: ['z'], scope: 'KR', status: 'fading', conf: 'ok',
        period: '2025.10 말 급등(또는 12월, 노트 간 상이) · 2026.1.13 정점 · 2월 급랭',
        origin: '두바이 초콜릿(카다이프)과 쫀득쿠키의 결합. 아이브 장원영이 계기로 언급. 네이버 데이터랩 검색량은 1월 13일 정점 후 49일 만에 30% 이하, NYT 인용 보도로는 17일 만에 절반.',
        platform: '인스타, 유튜브, 편의점',
        summary: 'CU 두바이 디저트 2종은 출시 1주일에 10만 개, 두바이 쫀득 찹쌀떡은 46만 개로 보도됐다. 정점 전 오픈런·품절·리셀, 정점 후 재고 폭탄. 19~59세 조사에서 43.6%가 매력을 잘 모르겠다고 답했다(연령 분해 없음).',
        why: '유행의 한복판에 있다는 증명(오픈런·인증). 공급이 늘면 값이 먼저 무너진다.',
        brand: '진입은 정점 이전, 퇴출 기준은 사전 설정. 한정 SKU와 짧은 재고 주기.',
        q: '두쫀쿠', tag: '두쫀쿠',
        ev: [
          S('한국경제 — 급등 시점(2025-11-14)', 'https://www.hankyung.com/article/2025111443797'),
          S('뉴시스 — 정점 후 49일 30% 이하', 'https://www.newsis.com/view/NISX20260213_0003515572'),
          S('서울신문 — NYT 인용 17일 반감', 'https://nownews.seoul.co.kr/news/newsView.php?id=20260226601015', '2차 인용'),
          S('MTN — 반년 새 소멸각', 'https://news.mtn.co.kr/news-detail/2026082310220044469'),
          S('FN뉴스 — CU 1주 10만 개', 'https://www.fnnews.com/news/202512130550573134'),
          S('이투데이 — 43.6% 매력 모르겠다', 'https://www.etoday.co.kr/news/view/2554288', '2차 인용'),
          Y('안성재 셰프님 두바이쫀득쿠키 직접 먹어봤습니다', 'https://www.youtube.com/watch?v=iVkGpwRWa38'),
          Y('품절대란 났다는 두바이쫀득쿠키 드디어 먹어봤습니다', 'https://www.youtube.com/watch?v=8kCfvL0OLvo'),
          Y('미국 땅바닥에 던져진 두바이 쫀득 쿠키!', 'https://www.youtube.com/watch?v=TGU9ZDaP5zI'),
          C('디시인사이드 — 두바이 쫀득 쿠키 마이너 갤러리', 'https://m.dcinside.com/board/dubaicookies'),
          C('에펨코리아 — 두쫀쿠 대유행 피크 지난 듯', 'https://www.fmkorea.com/index.php?mid=best2&sort_index=pop&order_type=desc&document_srl=9460523742'),
          C('에펨코리아 — 회사 근처 두쫀쿠 재고 1600개', 'https://www.fmkorea.com/best/9398918161'),
          C('더쿠 — 두쫀쿠 최신 근황', 'https://theqoo.net/square/4100121945')
        ]
      },
      {
        id: 'dessert-relay', name: '후속 디저트 릴레이 (버터떡 → 머랭롤)', gens: ['z'], scope: 'KR', status: 'rising', conf: 'ok',
        period: '2026.3 버터떡 · 4 우베 · 5~6 양즈깐루 · 8~9 피자설기 · 9~10 과일 찹쌀떡 · 11 머랭롤',
        origin: '두쫀쿠 이후 2~3개월 단위로 교체. 머랭롤은 네이버 데이터랩 관심도가 나흘 만에 5배 이상(보도). GS25 피자설기 한정 상품은 10일 만에 38만 개.',
        platform: '숏폼 ASMR, 편의점, 떡집·디저트 카페',
        summary: '탕후루(수개월 이상) → 두쫀쿠(약 3개월) → 후속 디저트(2~3개월)로 수명이 짧아졌다는 전문가·자영업자 증언. 더쿠 11월 25일 글에서는 머랭롤 유행이 시작되자 기존 인기 디저트 가게 웨이팅이 사라졌다는 후기도 나왔다.',
        why: '새 것을 먼저 먹어 본 사람이 되는 경쟁. 질감·소리가 콘텐츠가 된다(텍스처 플레이).',
        brand: '유통사는 속도로 이기고 자영업자는 끝물에 진다. 머랭롤은 현재 진행형이라 이미 입장 시점을 다시 판단할 때다.',
        q: '머랭롤', tag: '머랭롤',
        ev: [
          S('WOWTV 2026-11-26 — 머랭롤', 'https://www.wowtv.co.kr/NewsCenter/News/Read?articleId=A202611260091'),
          S('네이트 2026-03-17 — 유행 두세 달 단위', 'https://m.news.nate.com/view/20260317n33066'),
          S('네이트 2026-10-08 — GS25 피자설기 38만 개', 'https://m.news.nate.com/view/20261008n00480'),
          Y('2시간 줄서서 먹는다는 피자설기 진짜 맛있을까?', 'https://www.youtube.com/watch?v=dOf1ll5UEyU'),
          Y('요즘 난리난 피자설기.. 다음은 엽떡설기라고?', 'https://www.youtube.com/watch?v=MDdKCruf4Q4'),
          Y('하루 1,500명이 몰린다?! 피자설기부터 모나카떡까지 난리 난 떡픈런 현장 [생방송오늘아침]', 'https://www.youtube.com/watch?v=89iR0bjO0ig'),
          Y('천국의 맛 머랭롤? 직접 검증해봤습니다｜갓나온 맛도리 EP.200', 'https://www.youtube.com/watch?v=9oo4Un7kTL4'),
          C('더쿠 — 한정선 다음으로 유행하는 디저트(머랭롤 후기, 2026-11-25)', 'https://theqoo.net/square/4417179587')
        ]
      },
      {
        id: 'shortform3', name: '숏폼 3대 트렌드 (드라마피케이션 · 텍스처 플레이 · 카피 투 크리에이트)', gens: ['z'], scope: 'KR', status: 'steady', conf: 'sec',
        period: '2026 상반기(틱톡×대학내일)',
        origin: '드라마피케이션: 일부러 어설픈 연기. 텍스처 플레이: 촉감·식감 대리체험. 카피 투 크리에이트: 유행 영상을 변형해 재창작.',
        platform: '틱톡, 쇼츠, 릴스',
        summary: '따라하기 → 재창작 순환이 한국 숏폼 밈의 구조다. 정량 수치는 확보하지 못했다.',
        why: '모방과 변형이 곧 참여. 진입 장벽이 낮다.',
        brand: '질감·소리 중심 영상, 참여 템플릿 설계.',
        q: '숏폼 트렌드 2026', tag: '숏폼',
        ev: [S('코리아센터 게재본 — 틱톡×대학내일 2026 상반기', 'https://www.koreancenter.or.kr/news/articleView.html?idxno=1437696', '2차 인용')]
      },
      {
        id: 'labubu', name: '라부부 (팝마트)', gens: ['z', 'alpha'], scope: 'KR+GL', status: 'fading', conf: 'ok',
        period: '2025.4 발매 · 2025.7 정점 · 2025.11 검색 4(정점=100)',
        origin: "'자아 키링' 발매가 2.1만 원이 6월 리셀 109.9만 원이었다가 5개월 후 88% 하락. 원인으로 중복구매 스트레스, 공급 확대로 희소성 약화, 관심 이동이 거론된다.",
        platform: '팝업, 리셀, 인스타',
        summary: '팝마트는 Dimoo·Molly 등으로 IP를 다변화하며 대응. KOTRA는 아트토이 시장 자체는 성장 중이라고 본다. 크리스마스 2025에는 아이들이 라부부를 찾았으나 성인 Z세대가 열풍을 이끌었다는 분석도 있다.',
        why: '정체성의 신호는 귀해야 값이 나간다.',
        brand: '단일 IP 의존 위험. 희소성이 무너지는 속도를 계산에 넣을 것.',
        q: '라부부', tag: '라부부',
        ev: [
          S('세계일보 — 검색량·리셀가 하락', 'https://www.segye.com/newsView/20251108501044'),
          S('Dazed — Labubu bubble bursting', 'https://www.dazeddigital.com/fashion/article/70073/1/labubu-bubble-bursting-obituary-pop-mart-stock-plummet'),
          Y('이 인형의 매력이 뭔지 아시는 분? #라부부 / 스브스뉴스', 'https://www.youtube.com/watch?v=WPFwn5kHamc')
        ]
      },
      {
        id: 'challenges', name: '챌린지·밈 (윤정아 챌린지, 난리자베스 등)', gens: ['z'], scope: 'KR', status: 'unknown', conf: 'unv',
        period: '2026 상반기(윤정아 챌린지 2026-01-05 시작)',
        origin: '윤정아 챌린지, 좋다 쑥부르스, 난리자베스, 장항준적 사고, 자려고 누웠는데 양의지 등. Q2 챌린지 밈은 무맥락+당당함이 특징이라는 분석(유료 일부 스니펫).',
        platform: '릴스, 쇼츠',
        summary: '블로그·리스티클 기반이라 날짜·유래 교차확인이 필요하다. 11월 현재 진행형인지 확인되지 않았다.',
        why: '무맥락과 당당함, 낮은 진입장벽.',
        brand: '수 주짜리 밈에 캠페인을 걸지 말 것(추정).',
        q: '윤정아 챌린지', tag: '윤정아챌린지',
        ev: [
          S('4formance — 2026 상반기 밈', 'https://4formance.com/Meme2026H1', '블로그'),
          S('캐릿 — Q2 챌린지 밈 분석(유료 일부)', 'https://www.careet.net/Content/Secret/261116-d7f3c92f-19f2-486c-a081-d8d3ab8c37a4', '스니펫만 확인')
        ]
      },
      {
        id: 'slang-global', name: '2026 글로벌 슬랭 (mogging · larp · beige flag · clanker)', gens: ['z', 'alpha'], scope: 'GL', status: 'unknown', conf: 'unv',
        period: '2026 (Unscrambler: US 구글 검색 2026-01-01~08-27)',
        origin: "Euronews는 Unscrambler 분석에서 chud, bop, mogging, 6 7이 상위라고 보도했으나 순위·정의는 확인하지 못했다. Collins 2026 올해의 단어 mogging 주장은 공식 확인 못 함.",
        platform: '틱톡, 레딧',
        summary: '리스티클 중심이라 [미검증]. clanker는 AI 비하어로 거론된다.',
        why: '슬랭은 소속의 표식이고 수명이 짧다.',
        brand: '직접 사용보다 모니터링 대상.',
        q: 'mogging 슬랭', tag: 'mogging',
        ev: [
          S('Euronews — 2026 알파 슬랭 검색 순위', 'https://www.euronews.com/2026/09/28/from-chud-to-bop-most-searched-gen-alpha-slang-terms-of-2026-so-far-revealed', '순위 본문 미확인'),
          S('하퍼스바자 코리아 — Collins·Dictionary.com 소개', 'https://www.harpersbazaar.co.kr/article/1913205', '2차 인용')
        ]
      },
      {
        id: 'tiktok-next', name: 'TikTok Next 2026 (Reali-TEA · Curiosity Detours · Emotional ROI)', gens: ['z'], scope: 'GL', status: 'steady', conf: 'ok',
        period: '2026-01-14 발표',
        origin: 'Reali-TEA(탈현실 도피), Curiosity Detours(틱톡의 검색 도구화), Emotional ROI(충동 → 의도 소비).',
        platform: '틱톡',
        summary: '이 자료의 미국 소비자 49%, Gen Z 65% 수치는 2차 인용이라 원문 확인이 필요하다.',
        why: '플랫폼이 스스로 말하는 2026 방향.',
        brand: '의도 소비로 이동하는 검색형 콘텐츠 설계.',
        q: 'TikTok Next 2026', tag: 'tiktoknext',
        ev: [S('TikTok Newsroom — Next 2026', 'https://newsroom.tiktok.com/introducing-tiktok-next-2026-our-trend-forecast-for-marketers-for-the-year-ahead?lang=en')]
      },
      /* ───────── 밀레니얼 ───────── */
      {
        id: 'new2016', name: '2026 is the new 2016 (2016 감성)', gens: ['m', 'z'], scope: 'GL', status: 'fading', conf: 'ok',
        period: '2025 말 ~ 2026.1 정점(2주 안에 대량 확산)',
        origin: '밀레니얼 주도의 향수 물결을 Z세대가 바이럴시키는 구조(Fortune). Z세대가 SNS 황금기를 누리지 못한 좌절감과 낙관·디지털 단순함에 대한 욕구가 반영됐다는 해석.',
        platform: '틱톡, 인스타',
        summary: '알고리즘·피로 이전의 시대를 불러오는 향수. 반론으로 곧 잊힐 밈이라는 영상도 있다.',
        why: '알고리즘 이전의 단순함에 대한 그리움.',
        brand: '향수는 레이어로, 시대를 문자 그대로 재현하지 말 것.',
        q: '2026 is the new 2016', tag: '2016',
        ev: [
          S('Fortune — 2016 vibes trend', 'https://fortune.com/2026/01/20/what-is-2016-vibes-trend-why-is-everyone-posting-2016-pics-talking-gen-z-nostalgia/'),
          Y('Why Everyone Is Obsessed With 2016 Again (Gen Z & Millennials Explained)', 'https://www.youtube.com/watch?v=ue8C88Qf_rI'),
          Y('How the year 2016 became the first viral trend of 2026', 'https://www.youtube.com/watch?v=ou9X0EratFo'),
          Y('Is it 2026 or 2016? Social media users turn back the clock in viral trend', 'https://www.youtube.com/watch?v=BBvzfjwMfFA'),
          Y('Nobody Wants 2026 to be the New 2016 (반론)', 'https://www.youtube.com/watch?v=bhThCBnuHeE')
        ]
      },
      {
        id: 'meme-reset', name: 'The Great Meme Reset of 2026', gens: ['z', 'm'], scope: 'GL', status: 'fading', conf: 'ok',
        period: '2026.1 틱톡 주도',
        origin: '2026년 1월 1일부로 모든 인터넷 밈을 2016년식 dank meme으로 되돌리자는 틱톡발 농담·트렌드. 최근 밈이 브레인롯이고 억지스럽다는 인식에 대한 반동. 68 밈 같은 파생 밈도 생겼다.',
        platform: '틱톡, 레딧',
        summary: 'Know Your Meme 요약 기준. 본문은 스니펫만 확인했다.',
        why: '알고리즘·AI 피로에 대한 반동.',
        brand: '사람 손맛(저화질·로파이) 포맷이 신선해질 수 있다.',
        q: 'Great Meme Reset 2026', tag: 'greatmemereset',
        ev: [
          D('KYM Trending — What Is The Great Meme Reset Of 2026?', 'https://trending.knowyourmeme.com/editorials/guides/what-is-the-great-meme-reset-of-2026-the-tiktok-trend-calling-for-a-return-to-2016-dank-memes-explained'),
          D('KYM — The Great Meme Reset Is Coming (video)', 'https://knowyourmeme.com/videos/434407-the-great-meme-reset-of-2026')
        ]
      },
      {
        id: 'mil-vs-z', name: "'밀레니얼 PR팀 vs Z세대 소셜팀' 마케팅 밈", gens: ['m', 'z'], scope: 'GL', status: 'fading', conf: 'ok',
        period: '2026.4.29 Tide 게시물이 첫 사례(KYM) · 5월 확산',
        origin: 'Gen Z가 밀레니얼 cringe를 조롱하다 2025~2026년에는 향수·진정성의 이름으로 채택하는 쪽으로 이동했다는 보도가 일관된다.',
        platform: '인스타, X, 틱톡',
        summary: 'Tide, 배스킨라빈스, 스탠리, 크록스, 스타벅스가 편승했으나 매출 효과 수치는 없다. 한국에서 밀레니얼 vs Z세대 밈 갈등이나 아재 개그 담론을 직접 다룬 자료는 찾지 못했다.',
        why: '세대 갈등을 브랜드가 놀이로 받는 포맷.',
        brand: '포맷 편승은 빠를수록 좋고 수명은 짧다. 한국 적용은 근거 없음.',
        q: 'millennial vs gen z marketing', tag: 'millennialvsgenz',
        ev: [
          D('Know Your Meme — Millennial vs Gen Z Marketing Trend', 'https://knowyourmeme.com/memes/millennial-vs-gen-z-marketing-trend'),
          S('한경매거진 — 편승 브랜드', 'https://magazine.hankyung.com/business/article/202605121726b', '2차 인용'),
          S('Ypulse — Gen Z가 밀레니얼 cringe를 받아들이다', 'https://www.ypulse.com/newsfeed/2026/01/05/gen-z-spent-years-mocking-millennial-cringe-now-theyre-fully-embracing-it/'),
          S('NBC News — 밀레니얼 cringe의 매력', 'https://www.nbcnews.com/pop-culture/lifestyle/gen-z-nostalgia-millennial-cringe-charm-rcna196957')
        ]
      },
      {
        id: 'running', name: '러닝 · 러닝 크루', gens: ['m'], scope: 'KR', status: 'steady', conf: 'sec',
        period: '2024~2026 지속(2026-07 백화점 러닝 클럽 경쟁)',
        origin: '신한카드 빅데이터연구소 인용 기사에서 2024년 러닝 소비 증가율이 30대 232%, 40대 225%로 20대 177%보다 높았다. 사이클 크루가 다음 단계로 소개되나 근거는 단일 기사.',
        platform: '유튜브·뉴스, 오프라인 크루, 백화점',
        summary: '단명 푸드·밈과 달리 습관형 유행으로 이분화되는 가장 뚜렷한 사례. 반면 소음·통행 방해·과시성 인증샷 민폐 논란과 지자체 제한 조치(서초구 2024)도 있었다.',
        why: '기분 회복(필코노미)과 소속감.',
        brand: '습관형에는 커뮤니티·클럽. 단 민폐 리스크 관리.',
        q: '러닝 크루', tag: '러닝크루',
        ev: [
          S('한국경제 — 신한카드 인용 러닝 소비 증가율', 'https://www.hankyung.com/article/2025071595617', '2차 인용'),
          S('뉴시스 — 2026-07 백화점 러닝 클럽 경쟁', 'https://mobile.newsis.com/view/NISX20260731_0003731551'),
          S('Korea Times — 러닝 트렌드 2026', 'https://www.koreatimes.co.kr/southkorea/society/20260102/koreas-running-trend-shows-no-signs-of-slowing-in-2026'),
          S('GQ Korea — 사이클 크루', 'https://www.gqkorea.co.kr/?p=369383', '단일 기사'),
          Y('달리기에 빠진 MZ...마라톤대회도 2030이 60% / YTN', 'https://www.youtube.com/watch?v=uuxksRu0IwQ'),
          Y('[출근길인터뷰] 러닝 열풍…부상 없이 건강하고 안전하게 달리려면? / 연합뉴스TV', 'https://www.youtube.com/watch?v=Stf8vp4L0jE'),
          Y('[밀착카메라] 논란 커지는 러닝 크루 / JTBC 뉴스룸', 'https://www.youtube.com/watch?v=JWNcmKLN5b0', '민폐 논란 측면')
        ]
      },
      {
        id: 'feelconomy', name: '필코노미 · 트렌드 코리아 2026 키워드', gens: ['m'], scope: 'KR', status: 'steady', conf: 'sec',
        period: '2025-12 보도(트렌드 코리아 2026)',
        origin: '10대 키워드: 휴먼인더루프, 제로클릭, 필코노미, 레디코어, AX조직, 픽셀라이프, 프라이스 디코딩, 건강지능HQ, 1.5가구, 근본이즘. 필코노미는 기분을 바꾸기 위한 소비로 소개되나 세부 설명은 스니펫에 부족했다.',
        platform: '—',
        summary: '밀레니얼 귀속은 해석이다. 두쫀쿠는 연령 분해가 없어 밀레니얼 귀속이 불확실하다.',
        why: '피로와 불안 속에서 기분을 되찾는 소비.',
        brand: '감정 회복형 소비 설계.',
        q: '트렌드 코리아 2026 필코노미', tag: '필코노미',
        ev: [S('Daum — 트렌드 코리아 2026 필코노미', 'https://v.daum.net/v/20251227000318332', '2차 인용')]
      },
      {
        id: 'jeonup', name: "'전업자녀' 담론", gens: ['m', 'z'], scope: 'KR', status: 'unknown', conf: 'sec',
        period: '2026-06 보도(SNL 코리아 콩트)',
        origin: '중국 신조어에서 유입. 부모 집에 사는 청년이 집안일을 하고 월급을 받는 현상. 청년 고용률 43.8%(25개월 연속 하락), 그냥 쉬었다 청년 48.5만 명이 근거로 인용된다.',
        platform: 'SNL, 커뮤니티',
        summary: '주로 20대와 일부 30대의 이야기이고 밀레니얼 후반에게는 부모 세대 쪽 이야기다.',
        why: '고용 불안이 만든 자조.',
        brand: '직접 차용은 위험(청년 고용 이슈).',
        q: '전업자녀', tag: '전업자녀',
        ev: [S('머니투데이 — 전업자녀', 'https://www.mt.co.kr/article/2026062612581098951', '2차 인용')]
      },
      /* ───────── X · 시니어 ───────── */
      {
        id: 'senior-yt-ai', name: '5060의 유튜브 · 생성형 AI', gens: ['x'], scope: 'KR+GL', status: 'rising', conf: 'sec',
        period: '2025~2026',
        origin: '언론진흥재단 2025: 유튜브 뉴스 이용률 50대 61%(전 연령 최고), 60대 이상 53%. CJ메조미디어 리포트 보도: 50대 83%가 생성형 AI 이용 경험(원문 미확인). 미국 AARP: 50+ 생성형 AI 이용 9%(2023) → 18%(2024) → 30%(2025), 도입 망설임 최상위 이유는 신뢰·프라이버시·보안.',
        platform: '유튜브, 카카오톡(ChatGPT)',
        summary: '노인복지관 AI 교육에 카톡 탑재 ChatGPT 사용법이 포함됐다(2026-05). Pew는 챗봇 이용이 50세 미만 약 63%, 50~64세 약 40%로 세대 격차가 있다고 밝혔다.',
        why: '이미 쓰는 플랫폼 안에서 쓴다. 신뢰가 장벽.',
        brand: '신뢰 확보형 교육과 안내 설계.',
        q: '5060 유튜브 AI', tag: '액티브시니어',
        ev: [
          S('오픈서베이 — 트렌드리포트 2026(액티브 시니어)', 'https://blog.opensurvey.co.kr/news/trendreport-2026-trend-1/', '스니펫만 확인'),
          S('쿠키뉴스 — 언론진흥재단 유튜브 뉴스 이용률', 'https://www.kukinews.com/article/view/kuk202511190034', '2차 인용'),
          S('이투데이 — CJ메조미디어 50대 AI 83%', 'https://bravo.etoday.co.kr/view/atc_view/17535', '원문 미확인'),
          S('AARP — 2026 기술 트렌드(50+)', 'https://www.aarp.org/pri/topics/technology/internet-media-devices/2026-technology-trends-older-adults/', '미국'),
          S('Korea Daily — 복지관 AI 교육(카톡 ChatGPT)', 'https://www.koreadaily.com/article/20260513133058822')
        ]
      },
      {
        id: 'trot', name: '트로트 팬덤 (50~70대의 부상)', gens: ['x'], scope: 'KR', status: 'peak', conf: 'sec',
        period: '2025~2026 (2026-05 흥행 균열 지적)',
        origin: '50~70대가 팬덤의 새 주류. 팬클럽이 기부하고 직접 굿즈를 제작하며, 임영웅 2025~2026 전국 투어가 약 25만 2천 명을 동원했다. 다만 2026년 5월 칼럼은 방송 트롯 경연의 공연 흥행 균열을 지적했다.',
        platform: '공연, 유튜브, 팬카페',
        summary: '시니어가 소비를 넘어 제작 참여로 올라서는 대표 사례. 하락 신호는 이 칼럼 외에 근거 없음.',
        why: '팬덤을 통한 소속감과 영향력.',
        brand: '팬덤 기반 굿즈. 성과 수치는 없다.',
        q: '임영웅 투어', tag: '임영웅',
        ev: [
          S('TF프리즘 — 50~70대 팬덤, 임영웅 투어', 'https://news.tf.co.kr/read/ogmeta/2301807.htm'),
          S('TF 칼럼 — 흥행 균열(2026-05)', 'https://news.tf.co.kr/read/column/2319163.htm')
        ]
      },
      {
        id: 'senior-creator', name: '시니어 크리에이터 (박막례 등)', gens: ['x'], scope: 'KR', status: 'steady', conf: 'sec',
        period: '2017~ · 2026 복지관 시니어 유튜버 양성 교육',
        origin: "박막례 할머니 채널(@Koreagrandma)은 2017년 손녀와의 호주 여행 영상에서 출발해 구독자 100만 이상 규모로 성장(수치는 기사마다 엇갈림). 글로벌 브랜드 협업 사례.",
        platform: '유튜브',
        summary: '2026-09에는 79세 쇼츠 제작 강연이 있었다. 카카오는 시니어 작가 협업 이모티콘·굿즈를 냈다(연도·성과 미확인).',
        why: '나이 든 사람이 주인공이 되는 콘텐츠에 젊은 세대도 반응.',
        brand: '젊은 밈 이식보다 제작 참여 지원.',
        q: '박막례 할머니', tag: '박막례',
        ev: [
          S('YouTube 블로그 — creator×brands 2026 Korea grandma', 'https://blog.youtube/intl/ko-kr/creator-and-artist-stories/creatorxbrands-2026-koreagrandma/'),
          S('Kakao — 시니어 작가 협업', 'https://www.kakaocorp.com/page/detail/11457', '연도·성과 미확인'),
          Y('YouTube와 성장한 50인: 박막례 할머니 편', 'https://www.youtube.com/watch?v=J9WQ_GAMjVE'),
          Y('(Eng)막례할머니, 뉴욕을 가다! [박막례 할머니]', 'https://www.youtube.com/watch?v=K7M1najhRfs'),
          Y('박막례 할머니 Korea_Grandma 채널', 'https://www.youtube.com/@Koreagrandma/posts')
        ]
      },
      {
        id: 'youngforty', name: "꼰대 → '영포티' 낙인의 이동", gens: ['x', 'm'], scope: 'KR', status: 'rising', conf: 'sec',
        period: '2022 남초 커뮤니티 → 2030 확산 · 2026-07 Z세대 vs 65세 · 2026-10 40대 반격',
        origin: "영포티는 2015년 김용섭 소장이 X세대를 겨냥해 처음 쓴 유행에 민감한 중년의 라이프스타일. 지금은 멸칭. 썸트렌드: 최근 1년 언급 10만 4,160건 중 부정 연관 55.9%. 한국리서치: 2030 남성 63%가 부정적, 60대·70대 이상은 긍정 우세(재게시 기사 인용). BBC는 꼰대 자리를 영포티가 대체하고 있다고 해석.",
        platform: '더쿠, 에펨코리아, 클리앙, SNS',
        summary: "중앙일보 보도에 따르면 Z세대가 열광한 65세 어르신에게 어, 꼰대 아니네? 반응이 있었고, 2026-10 영포티 무시하지 마라 글로 40대가 반격했다. 정치 성향에 따라 해석이 크게 갈린다.",
        why: '권위가 아니라 젊은 척하는 태도가 새 낙인의 대상이 된다.',
        brand: '소비력 있는 40대를 조롱하는 밈의 직접 차용은 반발 위험. 정량 조사는 제한적.',
        q: '영포티', tag: '영포티',
        ev: [
          S('Korea Daily — 65세 어르신에 열광한 Z세대', 'https://www.koreadaily.com/article/20260729140035342', '스니펫 기반'),
          S('인사이트 — 영포티 무시하지 마라', 'https://www.insight.co.kr/news/544750', '스니펫 기반'),
          C('더쿠 — 젊은 척 하는 꼰대…2030男 10명 중 6명 영포티 싫어', 'https://theqoo.net/square/4155688026', '기사 재게시, 수치 2차 인용'),
          C('더쿠 — 꼰대 대신 영포티…외신도 주목했다', 'https://theqoo.net/square/4065262942', '기사 재게시'),
          C('더쿠 — 멋진 중년→민폐 꼰대 추락…MZ는 왜 영포티 조롱할까', 'https://theqoo.net/square/3931673507', '기사 재게시'),
          C('에펨코리아 — 상사가 영포티가 도대체 어떤거냐길래', 'https://www.fmkorea.com/best/10598379762'),
          C('클리앙 — 젊은세대가 왜 영포티를 싫어하는지 알겠어요', 'https://www.clien.net/service/board/park/19091224'),
          C('루리웹 — 긁힌 영포티 상사', 'https://bbs.ruliweb.com/community/board/300148/read/38828010')
        ]
      },
      {
        id: 'genx-global', name: '글로벌 Gen X 밈 (샌드위치 세대)', gens: ['x'], scope: 'GL', status: 'unknown', conf: 'unv',
        period: '상시(2026 고유성 불명)',
        origin: 'Gen X 밈은 부모 부양과 자녀 지원 사이의 샌드위치 세대 소재가 많고, 밀레니얼과 부머의 세대 전쟁을 관망하는 톤. Daily Dot(2026-08)은 세대 고정관념 스킷에서 Gen X 묘사가 가장 큰 반응을 얻었다고 했다(본문 미확인).',
        platform: '레딧, 틱톡',
        summary: '리스트형 콘텐츠 기반이라 미검증. 한국 X세대 고유 밈은 근거 없음.',
        why: '관망과 자조.',
        brand: '근거 부족. 모니터링 대상.',
        q: 'gen x memes', tag: 'genx',
        ev: [S('Upworthy — 17 Gen X memes', 'https://www.upworthy.com/17-gen-x-memes?rebelltitem=12', '리스트형')]
      }
    ],

    diffusion: {
      paths: [
        { t: '플랫폼 중심축의 이동', d: '틱톡 단독에서 릴스+쇼츠 묶음으로 이동하고, 숏폼 알고리즘이 특정 음원 기반으로 노출한다는 보도(스니펫, 날짜 추정).', conf: 'unv', src: S('한국경제 2026-11-11(본문 미확인)', 'https://www.hankyung.com/article/202611119661H') },
        { t: '따라하기 → 재창작 순환', d: '드라마피케이션·텍스처 플레이·카피 투 크리에이트로 모방과 변형이 참여가 된다.', conf: 'sec', src: S('코리아센터 게재본', 'https://www.koreancenter.or.kr/news/articleView.html?idxno=1437696') },
        { t: '알파의 슬랭 경로', d: '로블록스 → 트위치 → 틱톡.', conf: 'ok', src: S('NBC News', 'https://www.nbcnews.com/news/amp/rcna162227') },
        { t: "통설: 커뮤니티 → 숏폼 → 인스타·스레드 → 브랜드", d: '이번 조사에서 측정 자료를 찾지 못한 가설. 디시·에펨·더쿠 글이 실제 유행의 초기 신호로 쓰이는지는 근거 링크(커뮤니티 열람)로 직접 확인해야 한다.', conf: 'unv', src: C('디시인사이드 — 두바이 쫀득 쿠키 마이너 갤러리(예시)', 'https://m.dcinside.com/board/dubaicookies') }
      ],
      lifecycle: [
        { name: '챌린지 밈', from: 0, to: 1, note: '수 주(추정)' },
        { name: '푸드 유행(두쫀쿠·후속 디저트)', from: 1, to: 3, note: '1~3개월(추정, 보도 다수)' },
        { name: '굿즈 IP(라부부)', from: 3, to: 6, note: '정점 후 장기 침체, 3~6개월(추정)' },
        { name: '습관형 트렌드(러닝)', from: 6, to: 12, open: true, note: '2026년에도 지속' }
      ],
      decay: [
        { name: '두쫀쿠', points: [[0, 100, '정점(2026-01-13)'], [17, 50, '17일 후 절반(NYT 인용 보도)'], [49, 30, '49일 후 30% 이하(뉴시스)']], unit: '일' },
        { name: '라부부', points: [[0, 100, '2025-07 정점'], [4, 4, '2025-11 초(약 4개월 후)']], unit: '개월' }
      ],
      relay: [
        { name: '두쫀쿠', from: 0.97, to: 5.0, peak: 3.4, note: '2025.10 말~2026.2 (정점 1.13)' },
        { name: '버터떡', from: 5, to: 6, note: '3월' },
        { name: '우베', from: 6, to: 7, note: '4월' },
        { name: '양즈깐루', from: 7, to: 9, note: '5~6월' },
        { name: '피자설기', from: 10, to: 12, note: '8~9월' },
        { name: '과일 찹쌀떡', from: 11, to: 13, note: '9~10월' },
        { name: '머랭롤', from: 13, to: 14, open: true, note: '11월 현재' }
      ],
      timeline: [
        { when: '2025년', ev: '흑백요리사 밈 공장화(비빔대왕, 나야 들기름 등), 한국 넷플릭스 예능 최초 3주 연속 비영어권 TV 글로벌 1위 보도', conf: 'sec', src: S('OSEN', 'https://www.osen.co.kr/article/G1112431653') },
        { when: '2025.4~7', ev: '라부부 발매 → 7월 정점', conf: 'ok', src: S('세계일보', 'https://www.segye.com/newsView/20251108501044') },
        { when: '2025 여름', ev: '이탈리안 브레인롯 확산, 학자가 피크 경과 평가(시점 추정)', conf: 'sec', src: S('inkl/AFP', 'https://www.inkl.com/news/italian-brainrot-the-ai-memes-only-kids-know') },
        { when: '2025.8', ev: '로블록스 동시접속 47.4M', conf: 'ok', src: S('PocketGamer.biz', 'https://www.pocketgamer.biz/robloxs-steal-a-brainrot-becomes-first-game-to-surpass-25m-concurrent-players') },
        { when: '2025.10 말', ev: '두쫀쿠 급등 시작, Steal a Brainrot 25.4M', conf: 'ok', src: S('한국경제', 'https://www.hankyung.com/article/2025111443797') },
        { when: '2025.12', ev: "Merriam-Webster 올해의 단어 'slop'(12.15), 준우승 '6-7'", conf: 'ok', src: S('PBS', 'https://www.pbs.org/newshour/nation/merriam-websters-word-of-the-year-for-2025-is-ais-slop') },
        { when: '2026.1', ev: '두쫀쿠 정점(13일), 2016 감성, TikTok Next 발표(14일), AI기본법 시행(22일)', conf: 'ok', src: S('뉴시스(AI기본법)', 'https://www.newsis.com/view/NISX20260121_0003485509') },
        { when: '2026.2', ev: '두쫀쿠 급랭, 케데헌 완구 라인업 발표', conf: 'ok', src: S('Tribune PH', 'https://tribune.net.ph/2026/02/18/kpop-demon-hunters-toys-expand-globally-after-ny-toy-fair') },
        { when: '2026.3~10', ev: '버터떡 → 우베 → 양즈깐루 → 피자설기 → 과일 찹쌀떡 교체, 4~5월 밀레니얼 vs Z세대 마케팅 밈', conf: 'ok', src: S('네이트', 'https://m.news.nate.com/view/20260317n33066') },
        { when: '2026.6~7', ev: '전업자녀 담론, 꼰대 관련 보도(7.29)', conf: 'sec', src: S('Korea Daily', 'https://www.koreadaily.com/article/20260729140035342') },
        { when: '2026.11', ev: '머랭롤(ASMR 소리 영상) 진행 중', conf: 'ok', src: S('WOWTV', 'https://www.wowtv.co.kr/NewsCenter/News/Read?articleId=A202611260091') }
      ],
      aiSlop: {
        text: "2025년 Merriam-Webster는 slop을 올해의 단어로 뽑았다. 정의는 AI로 대량 생산되는 저품질 디지털 콘텐츠이고 편집진은 두려움보다 조롱의 톤이라고 설명했다. 글로벌 밈에서는 Great Meme Reset of 2026이 알고리즘·AI 피로에 대한 반동으로 2010년대식 dank meme 회귀를 내세웠다. IAB 2026 자료는 Gen Z의 AI 광고 부정 정서가 39%로 밀레니얼 20%의 약 두 배라고 하며 이는 Digiday 계열 2차 인용이다. 한국에서는 2026년 1월 22일 AI기본법이 시행되어 생성형 AI 사업자의 사전 고지와 워터마크 표시 의무가 생겼으나 최대 3,000만 원 과태료는 1년 이상 계도기간이 있다. 세대 차이는 가설로만 남는다. 아이들이 소비하는 AI 밈(브레인롯)과 성인층의 slop 반감이 인식 차를 만든다는 해석은 근거가 부분적이다.",
        src: [
          S('PBS — slop 2025 올해의 단어', 'https://www.pbs.org/newshour/nation/merriam-websters-word-of-the-year-for-2025-is-ais-slop'),
          S('Digiday — AI slop 반발(IAB 39 vs 20)', 'https://digiday.com/marketing/backlash-grows-against-ai-slop-but-marketers-remain-unfazed/', '2차 인용'),
          S('뉴시스 — AI기본법 시행', 'https://www.newsis.com/view/NISX20260121_0003485509'),
          Y('The AI Backlash Has Begun', 'https://www.youtube.com/watch?v=i7XLeovwfY8'),
          Y('The Generation That Grew Up With Algorithms Just Called Bullshit on AI', 'https://www.youtube.com/watch?v=yMzHGzLyqgE'),
          Y('Why Is Gen Z Turning Against AI; What\'s Behind the Trend?', 'https://www.youtube.com/watch?v=xoJrPI1ed4M')
        ]
      }
    },

    cases: {
      success: [
        { brand: 'CU · 두바이 디저트', what: '출시 1주일 10만 개, 두바이 쫀득 찹쌀떡 46만 개', conf: 'ok', src: [S('FN뉴스', 'https://www.fnnews.com/news/202512130550573134'), S('뉴시스', 'https://www.newsis.com/view/NISX20260213_0003515572')] },
        { brand: 'GS25 · 피자설기', what: '한정 상품 출시 10일 만에 38만 개', conf: 'ok', src: [S('네이트', 'https://m.news.nate.com/view/20261008n00480'), Y('품절대란 피자설기, 원조의 반응은? [휙썰]', 'https://www.youtube.com/watch?v=4UCx11Fy8p8')] },
        { brand: '올리브영N 성수', what: '개점 1년 누적 방문객 250만 명(회사 발표)', conf: 'sec', src: [S('CJ뉴스룸', 'https://cjnews.cj.net/?p=62166')] },
        { brand: '노브랜드 버거 · 선수 밈 영상', what: '매장 매출 +47%(큐레이션 글 2차 인용)', conf: 'unv', src: [S('위픽레터', 'https://letter.wepick.kr/wiki/meme-viral-content-tracking')] },
        { brand: '칸쵸 이름찾기', what: '2주 100만 개 판매(큐레이션 글 2차 인용), 매출 2~3배는 업계 관계자 주장', conf: 'unv', src: [S('위픽레터', 'https://letter.wepick.kr/wiki/meme-viral-content-tracking')] },
        { brand: 'G마켓 명대사 광고', what: '누적 약 5,600만 회 노출(2차 인용)', conf: 'unv', src: [S('허프포스트코리아', 'https://www.huffingtonpost.kr/article/257105')] },
        { brand: '밀레니얼 PR팀 vs Z세대 소셜팀 포맷', what: 'Tide·배스킨라빈스·스탠리·크록스·스타벅스 편승, 매출 효과 수치 없음', conf: 'ok', src: [S('한경매거진', 'https://magazine.hankyung.com/business/article/202605121726b')] }
      ],
      fail: [
        { brand: '두쫀쿠 끝물 진입 자영업자', what: '2,000원 떨이에도 안 팔린다, 악성 재고. 프랜차이즈도 끝물 재고 부담', conf: 'ok', src: [S('포춘코리아', 'https://www.fortunekorea.co.kr/news/articleView.html?idxno=51662'), S('네이트', 'https://m.news.nate.com/view/20260218n04434'), S('경인일보', 'https://www.kyeongin.com/article/1759871')] },
        { brand: '페리카나 · 딸기녀 AI 밈 패러디', what: '불륜 희화화 비판으로 삭제·공식 사과(연도 불명)', conf: 'sec', src: [S('허프포스트코리아', 'https://www.huffingtonpost.kr/article/257105')] },
        { brand: 'Equinox · Almond Breeze 등 AI 광고', what: '불쾌 논란, AI slop 댓글에 자조로 대응. 결과 수치 없음', conf: 'ok', src: [S('Marketing Brew', 'https://www.marketingbrew.com/stories/2026/01/28/brands-using-generative-ai-almond-breeze-equinox-dollar-shave-club')] },
        { brand: 'American Eagle · Swatch (2025)', what: '해외 실패 모음. Swatch는 비백인 소외 지적', conf: 'ok', src: [S('NBC', 'https://www.nbcnews.com/business/business-news/american-eagle-brands-keep-getting-it-wrong-rcna226850')] },
        { brand: '역사 감수성 논란(아이소이 버스 광고, 스타벅스)', what: '2026년 재확산', conf: 'sec', src: [S('위픽레터', 'https://letter.wepick.kr/post/25588')] },
        { brand: '탕후루 전문점 난립', what: "폐업. '폐업률 98%'는 원 출처 미확인 수치", conf: 'unv', src: [] }
      ],
      lesson: '성공의 공통점은 소비자 참여형 설계, 인물·소재와 맥락의 일치, 유행 초중반 진입이다. 실패는 말기 진입과 고정비 투자, 타인의 고통이나 윤리 소재의 희화화, 어색한 AI 노출이다. 소수 사례에 기반한 추론이며, 밈은 포맷이 아니라 맥락이라는 조언도 있다.',
      lessonSrc: [S('브런치 — 밈은 포맷이 아니라 맥락', 'https://brunch.co.kr/@swesone/301', '조언')]
    },

    frames: [
      { name: '트렌드 코리아 2026', body: '휴먼인더루프, 제로클릭, 필코노미, 레디코어, AX조직, 픽셀라이프, 프라이스 디코딩, 건강지능HQ, 1.5가구, 근본이즘', conf: 'sec', src: S('Daum', 'https://v.daum.net/v/20251227000318332') },
      { name: '대학내일20대연구소 Z세대 트렌드 2026', body: '메타센싱, 적시소비, 개인안식구역, 리퀴드 콘텐츠(그 외 키워드는 확인하지 못했다)', conf: 'sec', src: S('뉴스와이어', 'https://www.newswire.co.kr/newsRead.php?no=1021531') },
      { name: 'TikTok Next 2026', body: 'Reali-TEA, Curiosity Detours, Emotional ROI', conf: 'ok', src: S('TikTok Newsroom', 'https://newsroom.tiktok.com/introducing-tiktok-next-2026-our-trend-forecast-for-marketers-for-the-year-ahead?lang=en') },
      { name: 'Pinterest Predicts 2026', body: '21개 트렌드(적중률 88% 주장은 2차 인용, 링크 미확보)', conf: 'unv', src: null },
      { name: '2027 전망서 (트렌드 코리아 2027, Pinterest Predicts 2027, Google Year in Search 2026)', body: '조사 시점(2026-11-27)까지 미발표 또는 미노출. 연말 발표가 나오면 가장 먼저 확인할 것', conf: 'unv', src: null }
    ],

    limits: [
      '조사에서 외부 호스트 열람(WebFetch)이 막혀 모든 내용이 검색 결과 요약문(스니펫)에 의존한다. 수치 다수가 2차 인용이며 블로그·리스티클 출처를 포함한다.',
      '검색 최신성이 2026년 9~10월 이전에 치우쳐 있어 11월 현재 신규 밈은 머랭롤 외에 거의 잡히지 않았다.',
      '노트 간 불일치: 두쫀쿠 시작 시점(10월 말 vs 12월), 67의 원곡 연도·확산 계기 선수. 이 대시보드는 Know Your Meme 요약으로 보정했으나 원문 대조 전이다.',
      '유튜브·커뮤니티 링크는 검색에서 잡힌 실제 URL이지만 영상·글의 본문과 날짜는 열람하지 못했다. 링크를 열어 내용이 주장과 맞는지 확인해야 한다. 일부 영상은 채널 정체나 공식 여부가 확인되지 않았다.',
      '커뮤니티 글은 개인 게시물과 댓글이라 여론의 일부일 뿐이다.',
      '세대별 채택 시차, 평균 수명, 밈 피로 설문, 월별 한국 밈 타임라인(2025.1~12, 2026.3~11)은 확보하지 못했다.'
    ],
    todo: [
      '대학내일20대연구소·오픈서베이·나스미디어·닐슨 원문과 트렌드 코리아 2026 키워드 해설서 확인',
      '네이버 데이터랩·구글 트렌드로 두쫀쿠·라부부·67·머랭롤의 정점 날짜와 하락 곡선을 직접 조회해 이 대시보드의 감쇠 지점을 원데이터로 교체',
      'Know Your Meme·나무위키로 밈 기원(67, 이탈리안 브레인롯, 퉁퉁퉁 사후르) 확인',
      '브랜드 성과 수치(노브랜드 버거 47%, 칸쵸 100만 개 등)의 원출처 추적',
      'Collins·Dictionary.com 2026 올해의 단어와 IAB 39% vs 20% 수치의 원문 확인',
      '트렌드 코리아 2027, 대학내일 2027 전망서, Pinterest Predicts 2027, Google Year in Search 2026 등 연말 발표 자료 확인',
      '로블록스 한국 연령제한 도입 후 영향, 밈 이미지·인물 얼굴·음원의 저작권·초상권 한국 판례 점검'
    ]
  };
})();
