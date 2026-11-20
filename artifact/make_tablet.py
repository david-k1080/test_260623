#!/usr/bin/env python3
"""Build artifact/live-interpreter.tablet.html: a standalone page (no claude.ai login needed) for a tablet or any Chrome.

It takes the generic artifact page and swaps the claude.ai capability layer for:
  - the browser's own speech recognition (Chrome),
  - Gemini called straight from the browser with an API key the user types in (kept only in that browser),
  - the browser's speech synthesis and a plain file download.
The output holds NO glossary, key or client name, so it is safe to host anywhere. Load the private glossary on the device itself.
"""
import pathlib
root = pathlib.Path(__file__).resolve().parent
s = (root / 'live-interpreter.html').read_text(encoding='utf-8')

def rep(old, new):
    global s
    assert s.count(old) == 1, f'patch target not unique/found: {old[:70]!r}'
    s = s.replace(old, new)

# ---- title / key storage ----
rep('<title>Live Interpreter</title>', '<title>Live Interpreter (Tablet)</title>')
rep("S = {\n  name: store.get('name', ''),", "S = {\n  gkey: store.get('gkey', ''), model: store.get('gmodel', 'gemini-2.5-flash'),\n  name: store.get('name', ''),") if "S = {\n  name: store.get('name', ''), " in s else None
if 'gkey:' not in s:
    rep("const S = {\n  name: store.get('name', ''),", "const S = {\n  gkey: store.get('gkey', ''), model: store.get('gmodel', 'gemini-2.5-flash'),\n  name: store.get('name', ''),")

# ---- settings: Gemini key field ----
rep('<div class="field"><label for="iName">내 이름</label>',
    '<div class="field"><label for="iKey">Gemini API 키 (이 기기 안에만 저장됩니다)</label><input type="password" id="iKey" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="AIza…">'
    '<div class="row-btns"><button class="btn primary" type="button" id="bKey">저장하고 확인</button></div>'
    '<span class="hint" id="keyHint">번역에 쓰입니다. 결제가 연결된 유료 프로젝트의 키를 쓰세요. 다른 사람과 쓰는 기기에는 입력하지 마세요.</span></div>\n    <div class="field"><label for="iName">내 이름</label>')
rep(".field input[type=text] {", ".field input[type=text], .field input[type=password] {")

# ---- notices ----
rep("if (!smp || !smpOK) msgs.push('이 화면에서는 번역을 쓸 수 없습니다. 아티팩트 권한 메뉴에서 Claude 호출(sample)을 허용해 주세요.');",
    "if (!smp) msgs.push('번역하려면 설정에서 Gemini API 키를 입력하세요.'); else if (!smpOK) msgs.push('Gemini가 키를 받아들이지 않았습니다. 설정에서 키를 다시 입력하세요.');")
rep("if (!dict) msgs.push('음성 입력을 쓸 수 없는 화면입니다 (회사 계정으로 로그인한 PC·안드로이드의 Chrome/Edge에서 지원). \"직접 입력\"이나 키보드의 마이크 버튼을 쓰세요.');",
    "if (!dict) msgs.push('이 브라우저는 음성 인식을 지원하지 않습니다. 안드로이드는 Chrome을 쓰세요. \"직접 입력\"과 키보드의 마이크 버튼은 쓸 수 있습니다.');")
rep("if (c === 'not_granted' || c === 'sampling_disabled' || c === 'not_declared' || c === 'capability_disabled') { smpOK = false; showNotices(); repaintAll(); }",
    "if (c === 'not_granted' || c === 'sampling_disabled' || c === 'not_declared' || c === 'capability_disabled') { smpOK = false; showNotices(); repaintAll(); if (!quiet) toast('Gemini 키가 거부되었습니다. 설정에서 확인하세요.'); }")
rep("else if (!quiet && c !== 'cancelled') toast('번역에 실패했습니다. 다시 말씀해 주세요.');",
    "else if (!quiet && c !== 'cancelled') toast(c === 'network' ? '인터넷 연결을 확인하세요.' : '번역에 실패했습니다. 다시 말씀해 주세요.');")
rep("else toast('마이크 사용이 허용되지 않았습니다. 아티팩트 권한 메뉴에서 음성 입력을 켜 주세요.');" if False else "if (c === 'not_granted') toast('마이크 사용이 허용되지 않았습니다. 아티팩트 권한 메뉴에서 음성 입력을 켜 주세요.');",
    "if (c === 'not_granted') toast('마이크 사용이 허용되지 않았습니다. 주소창 왼쪽 아이콘 → 권한 → 마이크 허용.');")

# ---- summary can be long ----
rep("const r = await smp(prompt, { signal: sumCtl.signal, onText:", "const r = await smp(prompt, { signal: sumCtl.signal, maxTokens: 4000, onText:")

# ---- replace the capability layer ----
a = s.index('async function diagnose() {')
a = s.rfind('// Shows which platform features', 0, a)
b = s.index('init(); initCaps();')
adapter = r'''// ---------- stand-alone capability layer: Gemini straight from the browser, browser speech recognition, browser voice ----------
function geminiSample() {
  return async function sample(prompt, o = {}) {
    const key = S.gkey; if (!key) throw { code: 'not_granted', message: 'no key' };
    const model = S.model || 'gemini-2.5-flash';
    const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 30000);
    if (o.signal) o.signal.addEventListener('abort', () => ctl.abort());
    const cancelled = () => !!(o.signal && o.signal.aborted);
    let think = true;
    for (let attempt = 0; attempt < 2; attempt++) {
      const body = { contents: [{ role: 'user', parts: [{ text: String(prompt) }] }], generationConfig: { temperature: 0.2, maxOutputTokens: o.maxTokens || 1500, ...(think ? { thinkingConfig: { thinkingBudget: 0 } } : {}) } };
      let res;
      try { res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body), signal: ctl.signal }); }
      catch (e) { clearTimeout(timer); throw cancelled() ? { code: 'cancelled' } : { code: 'network', message: String((e && e.message) || e) }; }
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        if (res.status === 400 && think && /thinking/i.test(txt)) { think = false; continue; }   // this model does not accept the setting: retry without it
        clearTimeout(timer);
        throw { code: res.status === 401 || res.status === 403 || /API key/i.test(txt) ? 'not_granted' : res.status === 429 ? 'rate_limited' : 'error', message: res.status + ' ' + txt.slice(0, 160) };
      }
      const reader = res.body.getReader(), dec = new TextDecoder(); let buf = '', full = '';
      try {
        for (;;) {
          const { done, value } = await reader.read(); if (done) break;
          buf += dec.decode(value, { stream: true });
          let i;
          while ((i = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
            if (!line.startsWith('data:')) continue;
            const d = line.slice(5).trim(); if (!d || d === '[DONE]') continue;
            try { const j = JSON.parse(d); const part = ((j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || []).map(p => p.text || '').join(''); if (part) { full += part; if (o.onText) o.onText({ text: full, delta: part }); } } catch {}
          }
        }
      } catch (e) { clearTimeout(timer); throw cancelled() ? { code: 'cancelled', text: full } : { code: 'network', message: String((e && e.message) || e), text: full }; }
      clearTimeout(timer);
      if (!full.trim()) throw { code: 'error', message: 'empty answer' };
      return { text: full, truncated: false };
    }
  };
}
const browserTts = () => ('speechSynthesis' in window && window.SpeechSynthesisUtterance) ? {
  speak: (text, o) => new Promise((res, rej) => { const u = new SpeechSynthesisUtterance(text); u.lang = o && o.language === 'en' ? 'en-US' : 'ko-KR'; u.onend = () => res(); u.onerror = () => rej({ code: 'error' }); speechSynthesis.cancel(); speechSynthesis.speak(u); }),
  stop: () => speechSynthesis.cancel(),
} : null;
const fileSaver = { save: ({ filename, data }) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'text/markdown;charset=utf-8' })); a.download = filename; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); return Promise.resolve({ status: 'saved' }); } };

async function testKey() {
  if (!smp) return;
  try { await smp('Reply with the single word OK.', { maxTokens: 20 }); smpOK = true; showNotices(); toast('Gemini 연결 확인됨'); $('keyHint').textContent = '저장됨 · 연결 확인됨'; }
  catch (e) { if (e && e.code === 'not_granted') { smpOK = false; showNotices(); toast('Gemini가 이 키를 거부했습니다. 키를 확인하세요.'); $('keyHint').textContent = '키가 거부되었습니다 (' + String(e.message || '').slice(0, 80) + ')'; } else toast(e && e.code === 'network' ? '인터넷 연결을 확인하세요.' : '확인하지 못했습니다: ' + (e && (e.message || e.code))); }
}
function wireKey() {
  $('iKey').placeholder = S.gkey ? '저장됨 •••• (바꾸려면 새 키 입력)' : 'AIza…';
  $('bKey').addEventListener('click', async () => {
    const v = $('iKey').value.trim();
    if (v) { S.gkey = v; store.set('gkey', v); $('iKey').value = ''; $('iKey').placeholder = '저장됨 •••• (바꾸려면 새 키 입력)'; }
    if (!S.gkey) { toast('키를 입력하세요.'); return; }
    smp = geminiSample(); smpOK = true; showNotices(); $('keyHint').textContent = '확인 중…'; await testKey();
  });
}

async function diagnose() {
  const box = $('diag'); box.hidden = false; box.textContent = '확인 중…';
  const L = [];
  L.push('음성 인식(브라우저): ' + (dict ? '사용 가능' : '없음 — 이 브라우저는 지원하지 않음'));
  L.push('Gemini 키: ' + (S.gkey ? '저장됨' : '없음'));
  if (smp) { try { const r = await smp('Reply with the single word OK.', { maxTokens: 20 }); L.push('번역 시험 호출: 성공 → ' + String(r.text).slice(0, 30)); smpOK = true; showNotices(); } catch (e) { L.push('번역 시험 호출: 실패 → code=' + (e && e.code) + ' ' + String((e && e.message) || '').slice(0, 140)); } }
  L.push('읽어주기: ' + (tts ? '사용 가능' : '없음'));
  L.push('보안 연결: ' + (window.isSecureContext ? '예 (마이크 사용 가능)' : '아니오 — 마이크가 막힙니다. https 주소로 여세요'));
  L.push('주소: ' + location.protocol + '//' + location.hostname);
  L.push('브라우저: ' + navigator.userAgent.slice(0, 110));
  box.textContent = L.join('\n');
}

async function initCaps() {
  dict = webSpeechShim(); tts = browserTts(); dls = fileSaver;
  smp = S.gkey ? geminiSample() : null; smpOK = true;
  capsReady = true;
  if (dict) bindDict();
  syncVoice(); showNotices(); repaintAll();
  if (!S.gkey) open('sheet');                      // first run: ask for the key right away
}
'''
s = s[:a] + adapter + s[b:]
# wire the key button once the page is built
rep("init(); initCaps();", "init(); wireKey(); initCaps();")
# the page is stand-alone: wrap it as a full document
s = '<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>\n' + s + '\n</body></html>\n'
(root / 'live-interpreter.tablet.html').write_text(s, encoding='utf-8')
print('wrote live-interpreter.tablet.html', len(s.encode()), 'bytes')
