/* PPT / Excel 내보내기 — 브라우저에서 직접 생성(서버 불필요) */
(function () {
  'use strict';
  var TD = window.TD, R = TD.R;
  var FONT = 'Malgun Gothic';
  var C = { ink: '1D1D1B', ink2: '55524A', ink3: '8A867B', line: 'E1DED3', bg: 'F6F5F1', card: 'FFFFFF', accent: 'C2410C', ok: '1B7A43', sec: '9A6200', unv: 'B3261E', yt: 'D6001C', com: '1A6FB5' };
  var CONF_COLOR = { ok: C.ok, sec: C.sec, unv: C.unv };
  var stamp = function () { return R.meta.asOf.replace(/-/g, ''); };

  function clip(str, n) { str = String(str || ''); return str.length > n ? str.slice(0, n - 1) + '…' : str; }
  function stripHash(c) { return String(c || '').replace('#', ''); }

  /* ═════════ PPT ═════════ */
  function buildPpt() {
    if (!window.PptxGenJS) throw new Error('PPT 라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도하세요.');
    var pres = new window.PptxGenJS();
    pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
    pres.title = R.meta.title; pres.subject = R.headline;
    var page = 0;

    function base(kicker, title, accent) {
      var s = pres.addSlide(); page++;
      s.background = { color: C.bg };
      s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: stripHash(accent || C.accent) }, line: { color: stripHash(accent || C.accent), width: 0 } });
      if (kicker) s.addText(kicker, { x: 0.6, y: 0.32, w: 9, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: stripHash(accent || C.accent), margin: 0 });
      s.addText(title, { x: 0.6, y: 0.62, w: 12.1, h: 0.8, fontFace: FONT, fontSize: 24, bold: true, color: C.ink, valign: 'top', margin: 0 });
      s.addText(R.meta.title + ' · ' + R.meta.asOf, { x: 0.6, y: 7.08, w: 8, h: 0.25, fontFace: FONT, fontSize: 9, color: C.ink3, margin: 0 });
      s.addText(String(page), { x: 12.2, y: 7.08, w: 0.6, h: 0.25, fontFace: FONT, fontSize: 9, color: C.ink3, align: 'right', margin: 0 });
      return s;
    }
    function confRun(conf) { return { text: TD.CONF[conf], options: { color: CONF_COLOR[conf], bold: true } }; }

    /* 1. 표지 */
    var s = pres.addSlide(); page++;
    s.background = { color: C.ink };
    s.addShape(pres.ShapeType.rect, { x: 0.6, y: 2.2, w: 0.9, h: 0.09, fill: { color: C.accent }, line: { color: C.accent, width: 0 } });
    s.addText(R.meta.title, { x: 0.6, y: 2.4, w: 12, h: 1.1, fontFace: FONT, fontSize: 40, bold: true, color: 'FFFFFF', margin: 0 });
    s.addText(R.headline, { x: 0.6, y: 3.55, w: 12, h: 0.6, fontFace: FONT, fontSize: 22, color: 'F0B38A', margin: 0 });
    s.addText(R.meta.subtitle + '  |  기준일 ' + R.meta.asOf, { x: 0.6, y: 4.3, w: 12, h: 0.4, fontFace: FONT, fontSize: 14, color: 'BDB9AC', margin: 0 });
    s.addText('검색 결과 요약문 기반 · 항목별 신뢰도 표기(확인 / 2차 인용 / 미검증)', { x: 0.6, y: 6.7, w: 12, h: 0.3, fontFace: FONT, fontSize: 11, color: '8F8B7E', margin: 0 });

    /* 2. 요약 */
    s = base('SUMMARY', R.headline);
    s.addText(R.deckBullets.map(function (b) { return { text: b, options: { bullet: { indent: 18 }, breakLine: true } }; }),
      { x: 0.6, y: 1.7, w: 12.1, h: 5.1, fontFace: FONT, fontSize: 18, color: C.ink, valign: 'top', paraSpaceAfter: 14, margin: 0 });

    /* 3. KPI */
    s = base('KEY NUMBERS', '확인된 핵심 수치');
    R.kpis.forEach(function (k, i) {
      var col = i % 4, row = Math.floor(i / 4), x = 0.6 + col * 3.07, y = 1.75 + row * 2.6;
      s.addShape(pres.ShapeType.roundRect, { x: x, y: y, w: 2.9, h: 2.4, fill: { color: C.card }, line: { color: C.line, width: 1 }, rectRadius: 0.08 });
      s.addText(k.v, { x: x + 0.15, y: y + 0.12, w: 2.6, h: 0.65, fontFace: FONT, fontSize: 28, bold: true, color: C.ink, margin: 0 });
      s.addText(k.l, { x: x + 0.15, y: y + 0.8, w: 2.6, h: 0.95, fontFace: FONT, fontSize: 11.5, color: C.ink2, valign: 'top', margin: 0 });
      s.addText([confRun(k.conf), { text: '  ' }, { text: clip(k.src.label, 22) + ' ↗', options: { hyperlink: { url: k.src.url, tooltip: k.src.label }, color: C.com, underline: true } }],
        { x: x + 0.15, y: y + 1.85, w: 2.6, h: 0.4, fontFace: FONT, fontSize: 10, margin: 0, valign: 'top' });
    });

    /* 세대별 */
    R.generations.forEach(function (g) {
      var gc = stripHash(g.color);
      var a = base(g.range, g.name + ' — ' + g.tagline, gc);
      a.addText(g.insight, { x: 0.6, y: 1.5, w: 12.1, h: 2.25, fontFace: FONT, fontSize: 14.5, color: C.ink, valign: 'top', margin: 0 });
      a.addText('브랜드 시사점', { x: 0.6, y: 3.9, w: 6, h: 0.3, fontFace: FONT, fontSize: 13, bold: true, color: gc, margin: 0 });
      a.addText(g.implications.map(function (t) { return { text: t, options: { bullet: { indent: 16 }, breakLine: true } }; }),
        { x: 0.6, y: 4.25, w: 12.1, h: 2.3, fontFace: FONT, fontSize: 12, color: C.ink, valign: 'top', paraSpaceAfter: 5, margin: 0 });
      var srcRuns = [{ text: '근거: ', options: { color: C.ink3 } }];
      g.insightSrc.concat(g.implSrc).slice(0, 6).forEach(function (e, i) {
        if (i) srcRuns.push({ text: '  ·  ', options: { color: C.ink3 } });
        srcRuns.push({ text: clip(e.label, 26), options: { hyperlink: { url: e.url, tooltip: e.label }, color: C.com, underline: true } });
      });
      a.addText(srcRuns, { x: 0.6, y: 6.6, w: 12.1, h: 0.4, fontFace: FONT, fontSize: 10, margin: 0, valign: 'top' });

      var ts = TD.trendsFor(g.id), per = 5;
      for (var i = 0; i < ts.length; i += per) {
        var chunk = ts.slice(i, i + per);
        var t = base(g.name + ' · 대표 밈·트렌드 ' + (i / per + 1) + '/' + Math.ceil(ts.length / per), g.name + ' 트렌드 한눈에', gc);
        var head = ['트렌드', '시점', '플랫폼', '상태', '신뢰도'].map(function (x) { return { text: x, options: { bold: true, color: 'FFFFFF', fill: { color: gc }, fontFace: FONT, fontSize: 11 } }; });
        var rows = [head].concat(chunk.map(function (x) {
          return [
            { text: x.name, options: { bold: true, fontFace: FONT, fontSize: 12.5 } },
            { text: clip(x.period, 70), options: { fontFace: FONT, fontSize: 11 } },
            { text: clip(x.platform, 30), options: { fontFace: FONT, fontSize: 11 } },
            { text: TD.STATUS[x.status], options: { fontFace: FONT, fontSize: 11.5, align: 'center' } },
            { text: TD.CONF[x.conf], options: { fontFace: FONT, fontSize: 11.5, bold: true, color: CONF_COLOR[x.conf], align: 'center' } }
          ];
        }));
        t.addTable(rows, { x: 0.6, y: 1.55, w: 12.1, colW: [3.5, 4.4, 2.3, 0.9, 1.0], border: { type: 'solid', color: C.line, pt: 0.75 }, fill: { color: C.card }, color: C.ink, valign: 'middle', margin: [0.06, 0.08, 0.06, 0.08], rowH: 0.8 });
        t.addText('요약·기원·근거 링크는 대시보드 또는 Excel(‘트렌드’, ‘근거 링크’ 시트)에서 확인', { x: 0.6, y: 6.7, w: 12, h: 0.3, fontFace: FONT, fontSize: 9.5, color: C.ink3, margin: 0 });
      }
    });

    /* 확산: 수명 + 릴레이 */
    var d = R.diffusion;
    s = base('DIFFUSION', '수명은 짧아지고, 습관형만 남는다');
    var x0 = 3.6, cw = (12.7 - x0) / 12, y0 = 2.15;
    for (var m = 0; m <= 12; m += 3) {
      s.addText(m + (m === 12 ? '개월+' : '개월'), { x: x0 + cw * m - 0.5, y: 1.65, w: 1, h: 0.3, fontFace: FONT, fontSize: 10, color: C.ink3, align: 'center', margin: 0 });
      s.addShape(pres.ShapeType.line, { x: x0 + cw * m, y: 1.95, w: 0, h: 2.6, line: { color: C.line, width: 0.75 } });
    }
    d.lifecycle.forEach(function (r, i) {
      var y = y0 + i * 0.62;
      s.addText(r.name, { x: 0.6, y: y, w: 2.9, h: 0.4, fontFace: FONT, fontSize: 12, bold: true, color: C.ink, margin: 0, valign: 'middle' });
      s.addShape(pres.ShapeType.roundRect, { x: x0 + cw * r.from, y: y, w: cw * (r.to - r.from), h: 0.4, fill: { color: r.open ? C.ok : C.accent }, line: { color: r.open ? C.ok : C.accent, width: 0 }, rectRadius: 0.05 });
      s.addText(r.note, { x: x0 + cw * r.to + (r.open ? -3.2 : 0.1), y: y, w: 3.1, h: 0.4, fontFace: FONT, fontSize: 10.5, color: r.open ? 'FFFFFF' : C.ink2, align: r.open ? 'right' : 'left', margin: 0, valign: 'middle', bold: !!r.open });
    });
    s.addText('조사자 추정. 정량 데이터는 확보하지 못했고 보도·전문가 증언을 바탕으로 한다.', { x: 0.6, y: 4.65, w: 12, h: 0.3, fontFace: FONT, fontSize: 10, color: C.ink3, margin: 0 });
    s.addText(d.paths.map(function (p) { return { text: p.t + ' — ' + clip(p.d, 90), options: { bullet: { indent: 14 }, breakLine: true } }; }),
      { x: 0.6, y: 5.05, w: 12.1, h: 1.9, fontFace: FONT, fontSize: 11.5, color: C.ink, valign: 'top', paraSpaceAfter: 4, margin: 0 });

    s = base('DESSERT RELAY', '두쫀쿠 이후 2~3개월 단위로 갈아 끼워지는 디저트');
    var rx0 = 2.4, rcw = (12.7 - rx0) / 14, labels = ['25.10', '11', '12', '26.1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
    labels.forEach(function (l, i) {
      s.addText(l, { x: rx0 + rcw * i, y: 1.6, w: rcw, h: 0.3, fontFace: FONT, fontSize: 10, color: C.ink3, align: 'center', margin: 0 });
      s.addShape(pres.ShapeType.line, { x: rx0 + rcw * i, y: 1.9, w: 0, h: 4.4, line: { color: C.line, width: 0.5 } });
    });
    d.relay.forEach(function (r, i) {
      var y = 2.05 + i * 0.6;
      s.addText(r.name, { x: 0.6, y: y, w: 1.7, h: 0.4, fontFace: FONT, fontSize: 12, bold: true, color: C.ink, margin: 0, valign: 'middle' });
      s.addShape(pres.ShapeType.roundRect, { x: rx0 + rcw * r.from, y: y, w: Math.max(rcw * (r.to - r.from) - 0.03, 0.15), h: 0.4, fill: { color: i === 0 ? C.accent : '7048E8' }, line: { color: i === 0 ? C.accent : '7048E8', width: 0 }, rectRadius: 0.05 });
      var right = rx0 + rcw * r.to + 0.1, w = 3.2, al = 'left';
      if (right + w > 13) { right = rx0 + rcw * r.from - w - 0.1; al = 'right'; }
      s.addText(r.note, { x: right, y: y, w: w, h: 0.4, fontFace: FONT, fontSize: 10.5, color: C.ink2, align: al, margin: 0, valign: 'middle' });
    });
    s.addText('막대는 보도에서 언급된 시점의 월 단위 표시이며 빈 구간은 자료 없음. 근거: WOWTV 2026-11-26, 네이트 2026-03-17, 뉴시스·서울신문(두쫀쿠 정점 1.13).', { x: 0.6, y: 6.5, w: 12.1, h: 0.45, fontFace: FONT, fontSize: 10, color: C.ink3, margin: 0, valign: 'top' });

    /* 타임라인 */
    var tl = d.timeline, per2 = 6;
    for (var j = 0; j < tl.length; j += per2) {
      var slide = base('TIMELINE ' + (j / per2 + 1) + '/' + Math.ceil(tl.length / per2), '2025~2026 타임라인');
      var rows2 = [['시점', '이벤트', '신뢰도', '근거'].map(function (x) { return { text: x, options: { bold: true, color: 'FFFFFF', fill: { color: C.ink }, fontFace: FONT, fontSize: 11 } }; })]
        .concat(tl.slice(j, j + per2).map(function (r) {
          return [
            { text: r.when, options: { bold: true, fontFace: FONT, fontSize: 11 } },
            { text: clip(r.ev, 120), options: { fontFace: FONT, fontSize: 12 } },
            { text: TD.CONF[r.conf], options: { fontFace: FONT, fontSize: 10.5, bold: true, color: CONF_COLOR[r.conf], align: 'center' } },
            { text: clip(r.src.label, 24) + ' ↗', options: { fontFace: FONT, fontSize: 10, color: C.com, underline: true, hyperlink: { url: r.src.url, tooltip: r.src.label } } }
          ];
        }));
      slide.addTable(rows2, { x: 0.6, y: 1.55, w: 12.1, colW: [1.4, 6.6, 1.0, 3.1], border: { type: 'solid', color: C.line, pt: 0.75 }, fill: { color: C.card }, color: C.ink, valign: 'middle', margin: [0.06, 0.08, 0.06, 0.08], rowH: 0.75 });
    }

    /* AI slop */
    s = base('AI SLOP', 'AI가 넘칠수록 사람 냄새가 값이 된다');
    s.addText(d.aiSlop.text, { x: 0.6, y: 1.6, w: 12.1, h: 4.0, fontFace: FONT, fontSize: 16, color: C.ink, valign: 'top', margin: 0 });
    s.addText(d.aiSlop.src.slice(0, 3).map(function (e, i) { return { text: (i ? '  ·  ' : '') + clip(e.label, 36), options: { hyperlink: { url: e.url, tooltip: e.label }, color: C.com, underline: true } }; }),
      { x: 0.6, y: 6.0, w: 12.1, h: 0.7, fontFace: FONT, fontSize: 11, margin: 0, valign: 'top' });

    /* 사례 */
    function caseSlide(title, list, color) {
      var cs = base('BRAND CASES', title, color);
      cs.addText(list.map(function (c) {
        return [{ text: c.brand + '  ', options: { bold: true, color: C.ink } }, { text: c.what + '  ', options: { color: C.ink2 } }, confRun(c.conf), { text: '', options: { breakLine: true } }];
      }).reduce(function (a, b) { return a.concat(b); }, []), { x: 0.6, y: 1.6, w: 12.1, h: 4.1, fontFace: FONT, fontSize: 14.5, valign: 'top', paraSpaceAfter: 12, margin: 0 });
      return cs;
    }
    caseSlide('성공 사례 — 속도와 참여 설계', R.cases.success, C.ok);
    var fs = caseSlide('실패·리스크 — 끝물 진입과 맥락 이탈', R.cases.fail, C.unv);
    fs.addText('종합: ' + R.cases.lesson, { x: 0.6, y: 5.8, w: 12.1, h: 1.2, fontFace: FONT, fontSize: 12.5, color: C.ink, valign: 'top', margin: 0 });

    /* 한계 / 검증 */
    s = base('LIMITS', '한계');
    s.addText(R.limits.map(function (x) { return { text: x, options: { bullet: { indent: 16 }, breakLine: true } }; }), { x: 0.6, y: 1.6, w: 12.1, h: 5.2, fontFace: FONT, fontSize: 16, color: C.ink, valign: 'top', paraSpaceAfter: 12, margin: 0 });
    s = base('NEXT', '추가 검증 우선순위');
    s.addText(R.todo.map(function (x) { return { text: x, options: { bullet: { type: 'number', indent: 20 }, breakLine: true } }; }), { x: 0.6, y: 1.6, w: 12.1, h: 5.2, fontFace: FONT, fontSize: 16, color: C.ink, valign: 'top', paraSpaceAfter: 12, margin: 0 });

    /* 부록: 영상·커뮤니티·DB 근거 링크 */
    var media = TD.allSources().filter(function (e) { return e.t !== 'src'; }), per3 = 8;
    for (var k = 0; k < media.length; k += per3) {
      var ap = base('APPENDIX · 영상·커뮤니티 근거 ' + (k / per3 + 1) + '/' + Math.ceil(media.length / per3), '직접 열어 확인할 근거 링크');
      var rows3 = [['유형', '링크(클릭)', '연결된 항목', '메모'].map(function (x) { return { text: x, options: { bold: true, color: 'FFFFFF', fill: { color: C.ink }, fontFace: FONT, fontSize: 10.5 } }; })]
        .concat(media.slice(k, k + per3).map(function (e) {
          return [
            { text: TD.TYPE[e.t], options: { fontFace: FONT, fontSize: 10, bold: true, color: e.t === 'yt' ? C.yt : e.t === 'com' ? C.com : C.ink2 } },
            { text: clip(e.label, 58), options: { fontFace: FONT, fontSize: 10, color: C.com, underline: true, hyperlink: { url: e.url, tooltip: e.label } } },
            { text: clip(e.where[0], 30), options: { fontFace: FONT, fontSize: 9.5, color: C.ink2 } },
            { text: clip(e.note, 28), options: { fontFace: FONT, fontSize: 9.5, color: C.ink3 } }
          ];
        }));
      ap.addTable(rows3, { x: 0.6, y: 1.5, w: 12.1, colW: [1.0, 6.3, 2.9, 1.9], border: { type: 'solid', color: C.line, pt: 0.5 }, fill: { color: C.card }, color: C.ink, valign: 'middle', margin: [0.04, 0.08, 0.04, 0.08], rowH: 0.55 });
    }
    return pres;
  }

  function pptExport() {
    var pres = buildPpt();
    return pres.writeFile({ fileName: 'generation-trend-report_' + stamp() + '.pptx' });
  }

  /* ═════════ Excel ═════════ */
  function download(blob, name) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function xlsxExport() {
    if (!window.ExcelJS) return Promise.reject(new Error('Excel 라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도하세요.'));
    var wb = new window.ExcelJS.Workbook(); wb.creator = R.meta.title; wb.created = new Date();
    var HFILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D1D1B' } };
    function sheet(name, cols, rows, opts) {
      var ws = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
      ws.columns = cols.map(function (c) { return { header: c[0], key: c[1], width: c[2] }; });
      var hr = ws.getRow(1); hr.font = { bold: true, color: { argb: 'FFFFFFFF' } }; hr.fill = HFILL; hr.alignment = { vertical: 'middle', wrapText: true }; hr.height = 24;
      rows.forEach(function (r) { ws.addRow(r); });
      ws.eachRow(function (row, n) { if (n > 1) row.alignment = { vertical: 'top', wrapText: true }; });
      ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } };
      (opts && opts.links || []).forEach(function (l) { // [colKey, labelKey, urlKey]
        ws.eachRow(function (row, n) {
          if (n === 1) return; var u = row.getCell(l[2]).value; var lab = row.getCell(l[1]).value;
          if (u) { row.getCell(l[1]).value = { text: String(lab || u), hyperlink: String(u) }; row.getCell(l[1]).font = { color: { argb: 'FF1A6FB5' }, underline: true }; }
        });
      });
      return ws;
    }
    var gname = function (ids) { return ids.map(function (i) { return TD.GENS[i].name; }).join(', '); };

    var ws0 = wb.addWorksheet('요약'); ws0.getColumn(1).width = 22; ws0.getColumn(2).width = 110;
    ws0.addRow([R.meta.title]).font = { bold: true, size: 16 };
    ws0.addRow(['기준일', R.meta.asOf]); ws0.addRow(['범위', R.meta.subtitle]); ws0.addRow(['방법', R.meta.method]); ws0.addRow([]);
    ws0.addRow(['핵심 결론']).font = { bold: true };
    R.deckBullets.forEach(function (b, i) { ws0.addRow([String(i + 1), b]); });
    ws0.addRow([]); ws0.addRow(['핵심 수치']).font = { bold: true };
    R.kpis.forEach(function (k) { var r = ws0.addRow([k.v, k.l + ' [' + TD.CONF[k.conf] + ']']); r.getCell(2).value = { text: k.l + ' [' + TD.CONF[k.conf] + '] ↗ ' + k.src.label, hyperlink: k.src.url }; r.getCell(2).font = { color: { argb: 'FF1A6FB5' }, underline: true }; });
    ws0.addRow([]); ws0.addRow(['신뢰도 기준']).font = { bold: true };
    ['ok', 'sec', 'unv'].forEach(function (k) { ws0.addRow([TD.CONF[k], R.meta.confLegend[k]]); });
    ws0.eachRow(function (row) { row.alignment = { vertical: 'top', wrapText: true }; });

    sheet('트렌드', [['세대', 'gen', 14], ['트렌드', 'name', 30], ['범위', 'scope', 9], ['상태', 'status', 8], ['신뢰도', 'conf', 10], ['시점', 'period', 34], ['기원', 'origin', 52], ['플랫폼', 'platform', 20], ['요약', 'summary', 52], ['왜 퍼지나', 'why', 34], ['브랜드 시사점', 'brand', 34], ['근거 수', 'n', 8]],
      R.trends.map(function (t) { return { gen: gname(t.gens), name: t.name, scope: t.scope, status: TD.STATUS[t.status], conf: TD.CONF[t.conf], period: t.period, origin: t.origin, platform: t.platform, summary: t.summary, why: t.why, brand: t.brand, n: t.ev.length }; }));

    var evRows = [];
    R.trends.forEach(function (t) { t.ev.forEach(function (e) { evRows.push({ gen: gname(t.gens), trend: t.name, type: TD.TYPE[e.t], label: e.label, url: e.url, note: e.note, conf: TD.CONF[t.conf] }); }); });
    sheet('근거 링크', [['세대', 'gen', 14], ['트렌드', 'trend', 30], ['유형', 'type', 10], ['제목(클릭)', 'label', 60], ['URL', 'url', 50], ['메모', 'note', 28], ['트렌드 신뢰도', 'conf', 12]], evRows, { links: [['label', 4, 5]] });
    // links option uses column indexes
    sheet('직접 확인(검색 링크)', [['트렌드', 'trend', 30], ['플랫폼', 'plat', 26], ['검색 링크(클릭)', 'label', 40], ['URL', 'url', 60]],
      R.trends.reduce(function (a, t) { TD.liveLinks(t).forEach(function (l) { a.push({ trend: t.name, plat: l[0], label: t.q + ' — ' + l[0], url: l[1] }); }); return a; }, []), { links: [['label', 3, 4]] });

    sheet('타임라인', [['시점', 'when', 12], ['이벤트', 'ev', 80], ['신뢰도', 'conf', 10], ['근거', 'label', 30], ['URL', 'url', 50]],
      R.diffusion.timeline.map(function (r) { return { when: r.when, ev: r.ev, conf: TD.CONF[r.conf], label: r.src.label, url: r.src.url }; }), { links: [['label', 4, 5]] });

    var caseRows = [];
    [['성공', R.cases.success], ['실패·리스크', R.cases.fail]].forEach(function (g) {
      g[1].forEach(function (c) { caseRows.push({ kind: g[0], brand: c.brand, what: c.what, conf: TD.CONF[c.conf], links: c.src.map(function (e) { return e.label + ' ' + e.url; }).join('\n') }); });
    });
    sheet('브랜드 사례', [['구분', 'kind', 12], ['브랜드/사례', 'brand', 34], ['내용', 'what', 70], ['신뢰도', 'conf', 10], ['근거 링크', 'links', 80]], caseRows);

    sheet('한계·검증', [['구분', 'k', 14], ['내용', 'v', 120]],
      R.limits.map(function (x) { return { k: '한계', v: x }; }).concat(R.todo.map(function (x, i) { return { k: '검증 ' + (i + 1), v: x }; }),
        R.generations.reduce(function (a, g) { g.gaps.forEach(function (x) { a.push({ k: g.name + ' 공백', v: x }); }); return a; }, [])));

    var lib = TD.allSources();
    sheet('출처 전체', [['유형', 't', 10], ['제목(클릭)', 'label', 62], ['URL', 'url', 56], ['연결된 항목', 'where', 50], ['신뢰도', 'conf', 10], ['메모', 'note', 28]],
      lib.map(function (e) { return { t: TD.TYPE[e.t], label: e.label, url: e.url, where: e.where.join(' / '), conf: TD.CONF[e.conf], note: e.note }; }), { links: [['label', 2, 3]] });

    return wb.xlsx.writeBuffer().then(function (buf) {
      download(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'generation-trend-report_' + stamp() + '.xlsx');
    });
  }

  window.TDExport = { ppt: pptExport, xlsx: xlsxExport };
})();
