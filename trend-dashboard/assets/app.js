/* 세대별 밈·트렌드 리포트 대시보드 — 렌더링·필터·공유 (외부 의존성 없음) */
(function () {
  'use strict';
  var R = window.REPORT;
  var CONF = { ok: '확인', sec: '2차 인용', unv: '미검증' };
  var STATUS = { rising: '상승', peak: '정점', fading: '하락', steady: '지속', unknown: '미상' };
  var TYPE = { src: '기사·자료', yt: '유튜브', com: '커뮤니티', db: '밈 DB' };
  var TYPE_IC = { src: '기사', yt: '▶ YT', com: '커뮤', db: 'DB' };
  var GENS = {}; R.generations.forEach(function (g) { GENS[g.id] = g; });

  /* ───────── helpers ───────── */
  function h(tag, props) {
    var e = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
    return e;
  }
  function add(e, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) c.forEach(function (x) { add(e, x); });
    else e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  function safeUrl(u) { return /^https?:\/\//i.test(u) ? u : '#'; }
  function link(label, url, cls) { return h('a', { href: safeUrl(url), target: '_blank', rel: 'noopener noreferrer', class: cls, text: label }); }
  function badge(conf) { return h('span', { class: 'badge ' + conf, text: CONF[conf], title: R.meta.confLegend[conf] }); }
  var NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text != null) e.textContent = text;
    return e;
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  var toastT;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }

  /* ───────── 검색 링크 (실시간 확인용) ───────── */
  function liveLinks(t) {
    var q = encodeURIComponent(t.q);
    var site = encodeURIComponent(t.q + ' site:dcinside.com OR site:fmkorea.com OR site:theqoo.net OR site:clien.net');
    var out = [
      ['YouTube', 'https://www.youtube.com/results?search_query=' + q],
      ['네이버 뉴스', 'https://search.naver.com/search.naver?where=news&query=' + q],
      ['구글 트렌드', 'https://trends.google.com/trends/explore?geo=KR&q=' + q],
      ['틱톡', 'https://www.tiktok.com/search?q=' + q],
      ['커뮤니티(디시·에펨·더쿠·클리앙)', 'https://www.google.com/search?q=' + site]
    ];
    if (t.tag) out.splice(3, 0, ['인스타 태그', 'https://www.instagram.com/explore/tags/' + encodeURIComponent(t.tag) + '/']);
    return out;
  }

  /* ───────── 데이터 집계 ───────── */
  function trendsFor(gid) { return R.trends.filter(function (t) { return t.gens.indexOf(gid) >= 0; }); }
  function allSources() {
    var seen = {}, out = [];
    function push(ev, where, conf) {
      if (!ev || !ev.url) return;
      var key = ev.url;
      if (seen[key]) { if (seen[key].where.indexOf(where) < 0) seen[key].where.push(where); return; }
      seen[key] = { t: ev.t, label: ev.label, url: ev.url, note: ev.note || '', where: [where], conf: conf || 'sec' };
      out.push(seen[key]);
    }
    R.trends.forEach(function (t) { t.ev.forEach(function (e) { push(e, t.name, t.conf); }); });
    R.generations.forEach(function (g) {
      (g.insightSrc || []).forEach(function (e) { push(e, g.name + ' 인사이트'); });
      (g.implSrc || []).forEach(function (e) { push(e, g.name + ' 시사점'); });
    });
    R.kpis.forEach(function (k) { push(k.src, '핵심 수치: ' + k.l, k.conf); });
    R.diffusion.paths.forEach(function (p) { push(p.src, '확산 경로: ' + p.t, p.conf); });
    R.diffusion.timeline.forEach(function (p) { push(p.src, '타임라인 ' + p.when, p.conf); });
    R.diffusion.aiSlop.src.forEach(function (e) { push(e, 'AI slop'); });
    R.cases.success.concat(R.cases.fail).forEach(function (c) { c.src.forEach(function (e) { push(e, '브랜드 사례: ' + c.brand, c.conf); }); });
    R.cases.lessonSrc.forEach(function (e) { push(e, '브랜드 사례 종합'); });
    R.frames.forEach(function (f) { push(f.src, '트렌드 프레임: ' + f.name, f.conf); });
    return out;
  }
  window.TD = { R: R, CONF: CONF, STATUS: STATUS, TYPE: TYPE, GENS: GENS, trendsFor: trendsFor, allSources: allSources, liveLinks: liveLinks };

  /* ───────── 상태 · 해시(공유 링크) ───────── */
  var state = { g: 'all', c: 'all', q: '', t: '', ty: 'all' };
  function readHash() {
    var p = new URLSearchParams(location.hash.replace(/^#/, ''));
    state.g = (p.get('g') === 'all' || GENS[p.get('g')]) ? p.get('g') : 'all';
    state.c = CONF[p.get('c')] ? p.get('c') : 'all';
    state.q = (p.get('q') || '').slice(0, 80);
    state.t = p.get('t') || '';
    state.ty = TYPE[p.get('ty')] ? p.get('ty') : 'all';
  }
  function hashFor(st) {
    var p = new URLSearchParams();
    if (st.g && st.g !== 'all') p.set('g', st.g);
    if (st.c && st.c !== 'all') p.set('c', st.c);
    if (st.q) p.set('q', st.q);
    if (st.ty && st.ty !== 'all') p.set('ty', st.ty);
    if (st.t) p.set('t', st.t);
    var str = p.toString();
    return str ? '#' + str : '';
  }
  function writeHash() {
    var hs = hashFor(state);
    try { history.replaceState(null, '', location.pathname + location.search + hs); } catch (e) { location.hash = hs; }
  }
  function shareUrl(st) { return location.href.split('#')[0] + hashFor(st || state); }
  function copy(text, okMsg) {
    function fb() {
      var ta = h('textarea', { style: 'position:fixed;opacity:0' }); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast(okMsg); } catch (e) { window.prompt('복사해서 사용하세요', text); }
      ta.remove();
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { toast(okMsg); }, fb);
    else fb();
  }

  /* ───────── 필터 ───────── */
  function matches(t) {
    if (state.c !== 'all' && t.conf !== state.c) return false;
    if (state.q) {
      var hay = [t.name, t.origin, t.summary, t.why, t.brand, t.platform, t.period].concat(t.ev.map(function (e) { return e.label; })).join(' ').toLowerCase();
      if (hay.indexOf(state.q.toLowerCase()) < 0) return false;
    }
    return true;
  }

  /* ───────── 정적 섹션 ───────── */
  function renderBluf() {
    var root = $('#bluf'); root.textContent = '';
    root.appendChild(h('div', { class: 'card bluf' }, h('h3', { text: R.headline }), R.bluf.map(function (p) { return h('p', { text: p }); })));
    var k = h('div', { class: 'kpis' });
    R.kpis.forEach(function (x) {
      k.appendChild(h('div', { class: 'card kpi' }, h('div', { class: 'v', text: x.v }), h('div', { class: 'l', text: x.l }),
        h('div', { class: 'f' }, badge(x.conf), link('근거 ↗', x.src.url))));
    });
    root.appendChild(k);
    root.appendChild(confChart());
  }

  function confChart() {
    var W = 560, rowH = 34, H = rowH * R.generations.length + 40;
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': '세대별 트렌드 신뢰도 분포' });
    var max = 1; R.generations.forEach(function (g) { max = Math.max(max, trendsFor(g.id).length); });
    var x0 = 110, bw = W - x0 - 20;
    R.generations.forEach(function (g, i) {
      var y = 14 + i * rowH, ts = trendsFor(g.id), x = x0, per = bw / max;
      svg.appendChild(s('text', { x: 0, y: y + 15, 'font-size': 13, 'font-weight': 700 }, g.name));
      ['ok', 'sec', 'unv'].forEach(function (cf) {
        var n = ts.filter(function (t) { return t.conf === cf; }).length;
        if (!n) return;
        var w = n * per;
        svg.appendChild(s('rect', { x: x, y: y, width: w - 2, height: 22, rx: 4, fill: 'var(--' + cf + ')', opacity: 0.85 }));
        svg.appendChild(s('text', { x: x + (w - 2) / 2, y: y + 16, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, style: 'fill:#fff' }, String(n)));
        x += w;
      });
    });
    var lg = 14 + R.generations.length * rowH, lx = x0;
    ['ok', 'sec', 'unv'].forEach(function (cf) {
      svg.appendChild(s('rect', { x: lx, y: lg + 2, width: 12, height: 12, rx: 3, fill: 'var(--' + cf + ')' }));
      svg.appendChild(s('text', { x: lx + 18, y: lg + 13, 'font-size': 12 }, CONF[cf])); lx += 90;
    });
    return h('div', { class: 'card chart', style: 'margin-top:14px' }, h('h4', { text: '세대별 트렌드 신뢰도 분포' }),
      h('p', { class: 'cap', text: '트렌드 카드 수 기준. 여러 세대에 걸친 항목은 각 세대에 포함된다. X세대·시니어에는 확인 등급 트렌드가 없고, 밀레니얼의 확인 3건은 모두 글로벌 항목이다.' }), svg);
  }

  /* ───────── 트렌드 카드 ───────── */
  function evList(list) {
    return h('ul', { class: 'evl' }, list.map(function (e) {
      return h('li', null, h('span', { class: 'ic ' + e.t, text: TYPE_IC[e.t] }), link(e.label, e.url), e.note ? h('span', { class: 'nt', text: '— ' + e.note }) : null);
    }));
  }
  function trendCard(t, gid) {
    var g = GENS[gid];
    var counts = { yt: 0, com: 0, src: 0, db: 0 }; t.ev.forEach(function (e) { counts[e.t]++; });
    var det = h('details', { class: 'ev', id: 'ev-' + t.id + '-' + gid },
      h('summary', null, '근거 ' + t.ev.length + '건',
        counts.yt ? h('span', { class: 'ic yt', text: '▶ ' + counts.yt }) : null,
        counts.com ? h('span', { class: 'ic com', text: '커뮤 ' + counts.com }) : null,
        counts.src ? h('span', { class: 'ic src', text: '기사 ' + counts.src }) : null,
        counts.db ? h('span', { class: 'ic db', text: 'DB ' + counts.db }) : null),
      evList(t.ev));
    var live = h('div', { class: 'live' }, h('span', { class: 'lb', text: '직접 확인' }), liveLinks(t).map(function (l) { return link(l[0] + ' ↗', l[1]); }));
    var card = h('article', { class: 'card tc', id: 't-' + t.id + '-' + gid, 'data-t': t.id, style: '--gc:' + g.color },
      h('div', { class: 'badges' },
        t.gens.map(function (id) { return h('span', { class: 'badge gen', style: 'background:' + GENS[id].color, text: GENS[id].name }); }),
        h('span', { class: 'badge st', text: STATUS[t.status] }), badge(t.conf), h('span', { class: 'badge st', text: t.scope })),
      h('h4', { text: t.name }),
      h('dl', null, h('dt', { text: '시점' }), h('dd', { text: t.period }), h('dt', { text: '기원' }), h('dd', { text: t.origin }), h('dt', { text: '플랫폼' }), h('dd', { text: t.platform })),
      h('p', { class: 'sum', text: t.summary }),
      h('p', { class: 'why' }, h('b', { text: '왜 퍼지나 ' }), t.why),
      h('p', { class: 'br' }, h('b', { text: '브랜드 시사점 ' }), t.brand),
      det, live,
      h('div', { class: 'acts' }, h('button', { class: 'btn', type: 'button', onclick: function () {
        copy(shareUrl({ g: 'all', c: 'all', q: '', t: t.id, ty: 'all' }), '이 트렌드 링크를 복사했습니다'); } }, '🔗 이 카드 링크')));
    return card;
  }

  function renderGens() {
    var root = $('#gens'); root.textContent = '';
    var any = false;
    R.generations.forEach(function (g) {
      if (state.g !== 'all' && state.g !== g.id) return;
      var ts = trendsFor(g.id).filter(matches);
      var sec = h('div', { id: 'gen-' + g.id, style: '--gc:' + g.color, 'data-gen': g.id, class: 'genblk' });
      sec.appendChild(h('div', { class: 'card gen-h' }, h('div', { class: 'rng', text: g.range }), h('h3', { text: g.name }), h('div', { class: 'tag', text: g.tagline }),
        h('p', { text: g.insight }), h('div', { class: 'srcrow' }, g.insightSrc.map(function (e) { return h('span', null, link(e.label + ' ↗', e.url), e.note ? h('span', { class: 'nt', text: ' (' + e.note + ')' }) : null); }))));
      var two = h('div', { class: 'two' },
        h('div', { class: 'card box' }, h('h4', { text: '브랜드 시사점' }), h('ul', null, g.implications.map(function (x) { return h('li', { text: x }); })),
          h('div', { class: 'srcrow' }, g.implSrc.map(function (e) { return link(e.label + ' ↗', e.url); }))),
        h('div', { class: 'card box' }, h('h4', { text: '근거를 찾지 못한 것' }), h('ul', null, g.gaps.map(function (x) { return h('li', { text: x }); }))));
      sec.appendChild(two);
      var grid = h('div', { class: 'tgrid' });
      if (ts.length) { any = true; ts.forEach(function (t) { grid.appendChild(trendCard(t, g.id)); }); }
      else grid.appendChild(h('div', { class: 'card empty', text: '조건에 맞는 트렌드가 없습니다.' }));
      sec.appendChild(h('div', { class: 'sec-h', style: 'margin-top:8px' }, h('h2', { text: g.name + ' 대표 밈·트렌드' }), h('span', { class: 'lead', text: ts.length + '건' })));
      sec.appendChild(grid);
      root.appendChild(sec);
    });
    $('#gens-count').textContent = state.q || state.c !== 'all' ? '필터 적용 중' : '전체';
  }

  /* ───────── 확산 구조 · 차트 ───────── */
  function lineChart(series) {
    var W = 250, H = 170, pl = 30, pr = 12, pt = 16, pb = 36;
    var maxX = series.points[series.points.length - 1][0] || 1;
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': series.name + ' 검색량 감쇠' });
    [0, 50, 100].forEach(function (v) {
      var y = pt + (H - pt - pb) * (1 - v / 100);
      svg.appendChild(s('line', { x1: pl, x2: W - pr, y1: y, y2: y, stroke: 'var(--line)' }));
      svg.appendChild(s('text', { x: pl - 5, y: y + 4, 'text-anchor': 'end', 'font-size': 10 }, String(v)));
    });
    var pts = series.points.map(function (p) { return [pl + (W - pl - pr) * (p[0] / maxX), pt + (H - pt - pb) * (1 - p[1] / 100), p]; });
    svg.appendChild(s('polyline', { points: pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' '), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.5 }));
    pts.forEach(function (p, i) {
      svg.appendChild(s('circle', { cx: p[0], cy: p[1], r: 4.5, fill: 'var(--accent)' }));
      var anchor = i === 0 ? 'start' : (i === pts.length - 1 ? 'end' : 'middle');
      svg.appendChild(s('text', { x: p[0], y: p[1] - 8, 'text-anchor': anchor, 'font-size': 11, 'font-weight': 700, style: 'fill:var(--ink)' }, (p[2][1] >= 30 && i > 0 && i === pts.length - 1 && series.name === '두쫀쿠' ? '≤' : '') + p[2][1]));
      svg.appendChild(s('text', { x: p[0], y: H - 20, 'text-anchor': anchor, 'font-size': 10 }, p[2][0] + series.unit));
    });
    svg.appendChild(s('text', { x: W / 2, y: H - 4, 'text-anchor': 'middle', 'font-size': 10 }, '정점 이후 경과 · 정점=100'));
    return h('div', null, h('div', { style: 'font-weight:700;font-size:14px;margin-bottom:4px', text: series.name }), svg);
  }
  function relayChart() {
    var rows = R.diffusion.relay, W = 620, rowH = 30, pl = 100, pt = 30, H = pt + rows.length * rowH + 14, span = 14;
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': '디저트 유행 릴레이 타임라인' });
    var labels = ['25.10', '11', '12', '26.1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
    var cw = (W - pl - 10) / span;
    labels.forEach(function (l, i) {
      svg.appendChild(s('line', { x1: pl + cw * i, x2: pl + cw * i, y1: pt - 6, y2: H - 10, stroke: 'var(--line)' }));
      svg.appendChild(s('text', { x: pl + cw * i + cw / 2, y: pt - 12, 'text-anchor': 'middle', 'font-size': 10 }, l));
    });
    rows.forEach(function (r, i) {
      var y = pt + i * rowH;
      svg.appendChild(s('text', { x: 0, y: y + 17, 'font-size': 12, 'font-weight': 700, style: 'fill:var(--ink)' }, r.name));
      svg.appendChild(s('rect', { x: pl + cw * r.from, y: y + 4, width: Math.max(cw * (r.to - r.from) - 2, 6), height: 18, rx: 5, fill: i === 0 ? 'var(--accent)' : '#7048e8', opacity: r.open ? 1 : .8 }));
      if (r.peak) {
        svg.appendChild(s('path', { d: 'M' + (pl + cw * r.peak) + ' ' + (y + 2) + ' l5 -8 l-10 0 z', fill: 'var(--ink)' }));
        svg.appendChild(s('text', { x: pl + cw * r.peak, y: y + 36, 'font-size': 10, 'text-anchor': 'middle' }, ''));
      }
      if (r.open) svg.appendChild(s('text', { x: pl + cw * r.to - 4, y: y + 17, 'font-size': 12, 'text-anchor': 'end', style: 'fill:#fff;font-weight:700' }, '▶'));
      var tx = pl + cw * r.to + 6; var anchor = 'start';
      if (tx > W - 130) { tx = pl + cw * r.from - 6; anchor = 'end'; }
      svg.appendChild(s('text', { x: tx, y: y + 17, 'font-size': 11, 'text-anchor': anchor }, r.note));
    });
    return svg;
  }
  function lifeChart() {
    var rows = R.diffusion.lifecycle, W = 620, rowH = 32, pl = 190, pt = 26, H = pt + rows.length * rowH + 22, max = 12;
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': '유행 유형별 수명 추정' });
    var cw = (W - pl - 12) / max;
    for (var m = 0; m <= max; m += 3) {
      svg.appendChild(s('line', { x1: pl + cw * m, x2: pl + cw * m, y1: pt - 4, y2: H - 18, stroke: 'var(--line)' }));
      svg.appendChild(s('text', { x: pl + cw * m, y: pt - 10, 'text-anchor': 'middle', 'font-size': 10 }, m + (m === max ? '개월+' : '개월')));
    }
    rows.forEach(function (r, i) {
      var y = pt + i * rowH;
      svg.appendChild(s('text', { x: 0, y: y + 17, 'font-size': 12, 'font-weight': 700, style: 'fill:var(--ink)' }, r.name));
      svg.appendChild(s('rect', { x: pl + cw * r.from, y: y + 4, width: cw * (r.to - r.from), height: 18, rx: 5, fill: r.open ? 'var(--ok)' : 'var(--accent)', opacity: .85 }));
      if (r.open) svg.appendChild(s('text', { x: pl + cw * r.to - 6, y: y + 17, 'font-size': 11, 'text-anchor': 'end', style: 'fill:#fff;font-weight:700' }, r.note));
      else svg.appendChild(s('text', { x: pl + cw * r.to + 6, y: y + 17, 'font-size': 11 }, r.note));
    });
    return svg;
  }
  function renderDiffusion() {
    var d = R.diffusion, root = $('#diffusion-body'); root.textContent = '';
    var paths = h('div', { class: 'two' }, d.paths.map(function (p) {
      return h('div', { class: 'card box' }, h('h4', { text: p.t }), h('p', { style: 'margin:0 0 8px;font-size:14.5px', text: p.d }), h('div', { class: 'srcrow' }, badge(p.conf), link(p.src.label + ' ↗', p.src.url)));
    }));
    root.appendChild(paths);
    var charts = h('div', { class: 'charts' },
      h('div', { class: 'card chart' }, h('h4', { text: '유행 감쇠 곡선 (확인된 지점만)' }), h('p', { class: 'cap', text: '점선 보간 없이 보도에서 확인된 지점만 연결했다. 정점 이후 반감 속도를 비교하는 용도이며, 정확한 곡선은 네이버 데이터랩·구글 트렌드로 교체해야 한다.' }),
        h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px' }, d.decay.map(lineChart)),
        h('div', { class: 'srcrow' }, link('두쫀쿠: 뉴시스 ↗', 'https://www.newsis.com/view/NISX20260213_0003515572'), link('서울신문 ↗', 'https://nownews.seoul.co.kr/news/newsView.php?id=20260226601015'), link('라부부: 세계일보 ↗', 'https://www.segye.com/newsView/20251108501044'))),
      h('div', { class: 'card chart' }, h('h4', { text: '유행 유형별 수명 (조사자 추정)' }), h('p', { class: 'cap', text: '정량 데이터는 확보하지 못했고 보도·전문가 증언을 바탕으로 한 추정이다.' }), lifeChart()),
      h('div', { class: 'card chart', style: 'grid-column:1/-1' }, h('h4', { text: '디저트 유행 릴레이, 2025.10 ~ 2026.11' }), h('p', { class: 'cap', text: '막대는 보도에서 언급된 시점의 월 단위 표시이며 빈 구간은 자료가 없다는 뜻이다. ▼는 두쫀쿠 정점(1월 13일).' }), relayChart(),
        h('div', { class: 'srcrow' }, link('WOWTV ↗', 'https://www.wowtv.co.kr/NewsCenter/News/Read?articleId=A202611260091'), link('네이트 ↗', 'https://m.news.nate.com/view/20260317n33066'))));
    root.appendChild(charts);
    root.appendChild(h('div', { class: 'sec-h', style: 'margin-top:20px' }, h('h2', { text: '2025~2026 타임라인' }), h('span', { class: 'lead', text: '월별 완전한 타임라인은 구성하지 못했다. 확인되는 범위만 정리.' })));
    var rows = d.timeline.map(function (r) { return h('tr', null, h('td', { text: r.when, style: 'white-space:nowrap;font-weight:700' }), h('td', { text: r.ev }), h('td', null, badge(r.conf)), h('td', null, link(r.src.label + ' ↗', r.src.url))); });
    root.appendChild(h('div', { class: 'card tbl-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['시점', '이벤트', '신뢰도', '근거'].map(function (x) { return h('th', { text: x }); }))), h('tbody', null, rows))));
    root.appendChild(h('div', { class: 'sec-h', style: 'margin-top:20px' }, h('h2', { text: 'AI slop' })));
    root.appendChild(h('div', { class: 'card box' }, h('p', { style: 'margin:0 0 10px;max-width:90ch', text: d.aiSlop.text }), evList(d.aiSlop.src)));
  }

  function renderCases() {
    var root = $('#cases-body'); root.textContent = '';
    function col(title, list) {
      return h('div', { class: 'card box' }, h('h4', { text: title }), list.map(function (c) {
        return h('div', { class: 'case' }, h('b', { text: c.brand }), h('span', { text: c.what + ' ' }), badge(c.conf),
          c.src.length ? h('div', { class: 'srcrow' }, c.src.map(function (e) { return h('span', null, e.t === 'yt' ? h('span', { class: 'ic yt', text: '▶ YT' }) : null, link(e.label + ' ↗', e.url)); })) : null);
      }));
    }
    root.appendChild(h('div', { class: 'cases' }, col('성공 사례', R.cases.success), col('실패·리스크', R.cases.fail)));
    root.appendChild(h('div', { class: 'card box', style: 'margin-top:14px' }, h('h4', { text: '종합 시사점' }), h('p', { style: 'margin:0 0 8px;max-width:90ch', text: R.cases.lesson }), h('div', { class: 'srcrow' }, R.cases.lessonSrc.map(function (e) { return link(e.label + ' ↗', e.url); }))));
    root.appendChild(h('div', { class: 'sec-h', style: 'margin-top:24px' }, h('h2', { text: '연간 트렌드 리포트 프레임' }), h('span', { class: 'lead', text: '2026~2027 방향을 읽는 외부 리포트' })));
    root.appendChild(h('div', { class: 'frames' }, R.frames.map(function (f) {
      return h('div', { class: 'card box' }, h('h4', { text: f.name }), h('p', { text: f.body }), h('div', { class: 'srcrow' }, badge(f.conf), f.src ? link(f.src.label + ' ↗', f.src.url) : h('span', { class: 'nt', text: '링크 미확보' })));
    })));
  }
  function renderLimits() {
    var root = $('#limits-body'); root.textContent = '';
    root.appendChild(h('div', { class: 'two' },
      h('div', { class: 'card box' }, h('h4', { text: '한계' }), h('ul', null, R.limits.map(function (x) { return h('li', { text: x }); }))),
      h('div', { class: 'card box' }, h('h4', { text: '추가 검증 우선순위' }), h('ol', { style: 'margin:0;padding-left:20px' }, R.todo.map(function (x) { return h('li', { text: x, style: 'margin-bottom:7px;font-size:15px' }); })))));
    root.appendChild(h('div', { class: 'card box' }, h('h4', { text: '신뢰도 표기 기준' }), h('ul', null, ['ok', 'sec', 'unv'].map(function (k) { return h('li', null, badge(k), ' ' + R.meta.confLegend[k]); }))));
  }

  /* ───────── 출처 라이브러리 ───────── */
  function renderLibrary() {
    var root = $('#library-body'); root.textContent = '';
    var all = allSources();
    var list = all.filter(function (e) {
      if (state.ty !== 'all' && e.t !== state.ty) return false;
      if (state.c !== 'all' && e.conf !== state.c) return false;
      if (state.q && (e.label + ' ' + e.where.join(' ') + ' ' + e.url).toLowerCase().indexOf(state.q.toLowerCase()) < 0) return false;
      return true;
    });
    var counts = { src: 0, yt: 0, com: 0, db: 0 }; all.forEach(function (e) { counts[e.t]++; });
    var ctl = h('div', { class: 'lib-ctl' }, h('div', { class: 'chips', role: 'group', 'aria-label': '근거 유형' },
      [['all', '전체 ' + all.length]].concat(Object.keys(TYPE).map(function (k) { return [k, TYPE[k] + ' ' + counts[k]]; })).map(function (x) {
        return h('button', { class: 'chip', type: 'button', 'aria-pressed': String(state.ty === x[0]), onclick: function () { state.ty = x[0]; writeHash(); renderLibrary(); } }, x[1]);
      })), h('span', { class: 'lib-count', text: list.length + '건 표시' }));
    root.appendChild(ctl);
    var rows = list.map(function (e) {
      return h('tr', null, h('td', null, h('span', { class: 'ic ' + e.t, text: TYPE_IC[e.t] })), h('td', null, link(e.label, e.url), e.note ? h('div', { class: 'nt', style: 'font-size:12px;color:var(--ink3)', text: e.note }) : null),
        h('td', { text: e.where.slice(0, 2).join(' · ') + (e.where.length > 2 ? ' 외 ' + (e.where.length - 2) : ''), style: 'color:var(--ink2);font-size:13px' }), h('td', null, badge(e.conf)));
    });
    root.appendChild(h('div', { class: 'card tbl-wrap', style: 'max-height:640px;overflow:auto' }, h('table', { class: 't' },
      h('thead', null, h('tr', null, ['유형', '출처', '연결된 항목', '신뢰도'].map(function (x) { return h('th', { text: x }); }))), h('tbody', null, rows))));
  }

  /* ───────── 툴바 ───────── */
  function setupBar() {
    var chips = $('#gen-chips'); chips.textContent = '';
    [['all', '전체 세대']].concat(R.generations.map(function (g) { return [g.id, g.name]; })).forEach(function (x) {
      chips.appendChild(h('button', { class: 'chip', type: 'button', 'data-g': x[0], 'aria-pressed': 'false', onclick: function () { state.g = x[0]; state.t = ''; apply(); } }, x[1]));
    });
    $('#q').addEventListener('input', function (e) { state.q = e.target.value.trim(); state.t = ''; apply(); });
    $('#conf').addEventListener('change', function (e) { state.c = e.target.value; state.t = ''; apply(); });
    $('#b-link').addEventListener('click', function () { copy(shareUrl(), '현재 보기 링크를 복사했습니다'); });
    $('#b-share').addEventListener('click', function () {
      var data = { title: R.meta.title, text: R.headline, url: shareUrl() };
      if (navigator.share) navigator.share(data).catch(function () {}); else copy(shareUrl(), '공유 기능이 없어 링크를 복사했습니다');
    });
    $('#b-sum').addEventListener('click', function () {
      var t = R.meta.title + ' (' + R.meta.asOf + ')\n' + R.headline + '\n\n' + R.deckBullets.map(function (p) { return '· ' + p; }).join('\n') + '\n\n' + shareUrl();
      copy(t, '요약 텍스트를 복사했습니다 (메신저·메일에 붙여넣기)');
    });
    $('#b-print').addEventListener('click', function () {
      document.querySelectorAll('details.ev').forEach(function (d) { d.open = true; }); window.print();
    });
    $('#b-theme').addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      var dark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      var next = dark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('td-theme', next); } catch (e) {}
    });
    try { var th = localStorage.getItem('td-theme'); if (th) document.documentElement.setAttribute('data-theme', th); } catch (e) {}
    $('#b-ppt').addEventListener('click', function () { runExport(this, window.TDExport && window.TDExport.ppt, 'PPT'); });
    $('#b-xls').addEventListener('click', function () { runExport(this, window.TDExport && window.TDExport.xlsx, 'Excel'); });
    $('#b-ppt2').addEventListener('click', function () { $('#b-ppt').click(); });
    $('#b-xls2').addEventListener('click', function () { $('#b-xls').click(); });
    $('#b-link2').addEventListener('click', function () { $('#b-link').click(); });
  }
  function runExport(btn, fn, name) {
    if (!fn) { toast(name + ' 생성 모듈을 불러오지 못했습니다'); return; }
    var old = btn.textContent; btn.disabled = true; btn.textContent = name + ' 생성 중…';
    Promise.resolve().then(function () { return fn(); }).then(function () { toast(name + ' 파일을 내려받았습니다'); },
      function (err) { console.error(err); toast(name + ' 생성 실패: ' + (err && err.message || err)); }).then(function () { btn.disabled = false; btn.textContent = old; });
  }

  function syncBar() {
    document.querySelectorAll('#gen-chips .chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-g') === state.g)); });
    var q = $('#q'); if (q.value !== state.q) q.value = state.q;
    $('#conf').value = state.c;
  }
  function apply() { writeHash(); syncBar(); renderGens(); renderLibrary(); focusTarget(); }
  function focusTarget() {
    if (!state.t) return;
    var cards = document.querySelectorAll('[data-t="' + state.t.replace(/[^a-z0-9-]/gi, '') + '"]');
    if (!cards.length) return;
    var el = cards[0]; el.classList.add('hl');
    var d = el.querySelector('details.ev'); if (d) d.open = true;
    setTimeout(function () { el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 60);
  }

  function spy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
    var secs = links.map(function (a) { return document.getElementById(a.getAttribute('data-to')); });
    links.forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); if (secs[i]) secs[i].scrollIntoView({ behavior: 'smooth', block: 'start' }); }); });
    function on() {
      var y = window.scrollY + 160, cur = 0;
      secs.forEach(function (el, i) { if (el && el.offsetTop <= y) cur = i; });
      links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
    }
    window.addEventListener('scroll', on, { passive: true }); on();
  }

  function init() {
    document.title = R.meta.title;
    $('#h-title').textContent = R.meta.title; $('#h-sub').textContent = R.meta.subtitle;
    $('#h-asof').textContent = '기준일 ' + R.meta.asOf + ' · ' + R.meta.method;
    var cs = $('#conf'); ['all', 'ok', 'sec', 'unv'].forEach(function (k) { cs.appendChild(h('option', { value: k, text: k === 'all' ? '신뢰도 전체' : CONF[k] })); });
    setupBar(); readHash(); renderBluf(); renderDiffusion(); renderCases(); renderLimits();
    syncBar(); renderGens(); renderLibrary(); focusTarget(); spy();
    window.addEventListener('hashchange', function () { readHash(); syncBar(); renderGens(); renderLibrary(); focusTarget(); });
    $('#n-trends').textContent = R.trends.length; $('#n-src').textContent = allSources().length;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
