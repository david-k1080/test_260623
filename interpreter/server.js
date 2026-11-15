import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import WebSocket, { WebSocketServer } from 'ws';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
// ---------------- 번역 제공자 선택 ----------------
// TRANSLATE_PROVIDER=gemini|anthropic 로 강제 가능. 없으면 키가 있는 쪽을 자동 선택 (Gemini 우선).
const PROVIDER = process.env.TRANSLATE_PROVIDER ||
  (process.env.GEMINI_API_KEY ? 'gemini' : process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'mock');
const MODEL = process.env.TRANSLATE_MODEL ||
  (PROVIDER === 'gemini' ? 'gemini-2.5-flash' : 'claude-haiku-5-5');
const GEMINI_BASE = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
const client = PROVIDER === 'anthropic' && process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
if (PROVIDER === 'mock') console.warn('⚠ GEMINI_API_KEY / ANTHROPIC_API_KEY 없음 → 번역 대신 [MOCK] 표시');
else console.log(`[번역] provider=${PROVIDER} model=${MODEL}`);

// 용어집 로드 (서버 시작 시 1회, glossary.json 수정 후 재시작)
let GLOSSARY = '';
let KEYTERMS = { ko: [], en: [] };
try {
  // glossary.local.json(실제 회사/고객 용어, git 제외)이 있으면 우선 사용
  const gfile = fs.existsSync(path.join(__dirname, 'glossary.local.json')) ? 'glossary.local.json' : 'glossary.json';
  const g = JSON.parse(fs.readFileSync(path.join(__dirname, gfile), 'utf8'));
  console.log('용어집 파일:', gfile);
  if (g.context) GLOSSARY += `\n\nMeeting context: ${g.context}`;
  const lines = (g.terms || []).map(t => `- ${t.ko} <-> ${t.en}`);
  if (lines.length) GLOSSARY += `\n\nGlossary (always use these exact renderings):\n${lines.join('\n')}`;
  const mh = Object.entries(g.misheard || {}).map(([k, v]) => `- "${k}" is often mis-transcribed as: ${v.join(', ')}`);
  if (mh.length) GLOSSARY += `\n\nCommon speech-recognition errors (correct them to the term on the left):\n${mh.join('\n')}`;
  if ((g.keep_as_is || []).length) GLOSSARY += `\n\nNames to keep unchanged (transliterate only if needed): ${g.keep_as_is.join(', ')}`;
  const uniq = a => [...new Set(a.map(x => String(x).trim()).filter(x => x && x.length <= 40))].slice(0, 100);
  KEYTERMS.en = uniq([...(g.terms || []).map(t => t.en), ...(g.keep_as_is || []), ...Object.keys(g.misheard || {})]);
  KEYTERMS.ko = uniq((g.terms || []).map(t => t.ko));
  if (g.keyterms) { KEYTERMS.en = uniq(g.keyterms.en || []); KEYTERMS.ko = uniq(g.keyterms.ko || []); }
  console.log(`용어집 ${(g.terms || []).length}개 로드, keyterm en=${KEYTERMS.en.length} ko=${KEYTERMS.ko.length}`);
} catch (e) { console.warn('용어집 없음:', e.message); }

const LANG_NAME = { ko: 'Korean', en: 'English' };
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  const file = path.join(__dirname, 'public', url === '/' ? 'index.html' : url);
  if (!file.startsWith(path.join(__dirname, 'public'))) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

// rooms: code -> { clients:Set<ws>, history:[{name,text}] }
const rooms = new Map();

function systemPrompt(from, to, history) {
  const ctx = history.slice(-6).map(h => `${h.name}: ${h.text}`).join('\n');
  return `You are a live interpreter in a business meeting. Translate the user's utterance from ${LANG_NAME[from]} to ${LANG_NAME[to]}. Output ONLY the translation, natural spoken style, keep names and numbers exact. Do not answer or comment on the content. The input is speech-recognition output and may contain mis-heard words; if a word is clearly a mis-hearing of a glossary term, use the glossary term.` + GLOSSARY +
    (ctx ? `\n\nRecent conversation (for context only):\n${ctx}` : '');
}

let geminiThinkingOk = true;   // 모델이 thinkingConfig를 거부하면 자동으로 끔
async function geminiTranslate(text, sys) {
  const call = async withThinking => {
    const body = {
      systemInstruction: { parts: [{ text: sys }] },
      contents: [{ role: 'user', parts: [{ text }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
    };
    if (withThinking) body.generationConfig.thinkingConfig = { thinkingBudget: 0 };   // 번역은 생각 시간 불필요 → 지연 감소
    const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 12000);
    try {
      const r = await fetch(`${GEMINI_BASE}/models/${MODEL}:generateContent`, {
        method: 'POST', signal: ctl.signal,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY || '' },
        body: JSON.stringify(body),
      });
      if (!r.ok) { const e = new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 200)}`); e.status = r.status; throw e; }
      return r.json();
    } finally { clearTimeout(timer); }
  };
  let data;
  try { data = await call(geminiThinkingOk); }
  catch (e) {
    if (e.status === 400 && geminiThinkingOk) { geminiThinkingOk = false; console.warn('[번역] thinkingConfig 거부됨 → 끄고 재시도'); data = await call(false); }
    else throw e;
  }
  const out = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
  if (!out) throw new Error('Gemini 빈 응답(차단 또는 오류): ' + (data.promptFeedback?.blockReason || data.candidates?.[0]?.finishReason || ''));
  return out;
}

async function translate(text, from, to, history) {
  if (from === to) return text;
  if (PROVIDER === 'mock') return `[MOCK ${to}] ${text}`;
  const sys = systemPrompt(from, to, history);
  if (PROVIDER === 'gemini') return geminiTranslate(text, sys);
  const msg = await client.messages.create({
    model: MODEL, max_tokens: 400, system: sys,
    messages: [{ role: 'user', content: text }],
  });
  return msg.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();
}

const send = (ws, obj) => ws.readyState === 1 && ws.send(JSON.stringify(obj));
const broadcastRoster = room => {
  const roster = [...room.clients].map(c => ({ name: c.meta.name, lang: c.meta.lang }));
  room.clients.forEach(c => send(c, { type: 'roster', roster }));
};

// ---------------- Deepgram 실시간 음성 인식 ----------------
const DG_KEY = process.env.DEEPGRAM_API_KEY;
const DG_URL = process.env.DEEPGRAM_URL || 'wss://api.deepgram.com/v1/listen';
const DG_MODEL = process.env.DEEPGRAM_MODEL || 'nova-3';
if (!DG_KEY && !process.env.DEEPGRAM_URL) console.warn('⚠ DEEPGRAM_API_KEY 없음 → 폰 브라우저 내장 음성 인식으로 대체');

function dgUrl(lang, model, withKeyterms) {
  const p = new URLSearchParams({
    model, language: lang === 'ko' ? 'ko' : 'en',
    encoding: 'linear16', sample_rate: '16000', channels: '1',
    interim_results: 'true', smart_format: 'true', punctuate: 'true',
    endpointing: process.env.DG_ENDPOINTING || '400', utterance_end_ms: '1200',
  });
  let u = `${DG_URL}?${p}`;
  if (withKeyterms) for (const k of KEYTERMS[lang]) u += `&keyterm=${encodeURIComponent(k)}`;
  return u;
}

// 시도 순서: nova-3+용어부스팅 → nova-3 → nova-2 (해당 언어/옵션을 서버가 거부하면 다음으로)
function openDeepgram(ws, attempt = 0) {
  const plans = [[DG_MODEL, true], [DG_MODEL, false], ['nova-2', false]];
  if (attempt >= plans.length) { send(ws, { type: 'stt_error', message: 'Deepgram 연결 실패' }); return; }
  const [model, kt] = plans[attempt];
  const dg = new WebSocket(dgUrl(ws.meta.lang, model, kt), { headers: { Authorization: `Token ${DG_KEY || 'test'}` } });
  const st = ws.stt = { dg, buf: '', ka: null, opened: false, closing: false, pending: ws.stt?.pending || [] };
  dg.on('open', () => {
    st.opened = true;
    st.pending.forEach(b => dg.send(b)); st.pending = [];   // 연결 전에 들어온 오디오 전송
    console.log(`[STT] ${ws.meta.name} ${ws.meta.lang} model=${model} keyterms=${kt}`);
    send(ws, { type: 'stt_ready', model });
    st.ka = setInterval(() => dg.readyState === 1 && dg.send(JSON.stringify({ type: 'KeepAlive' })), 8000);
  });
  dg.on('unexpected-response', (_req, res) => {
    console.warn(`[STT] 거부됨 (${res.statusCode}) model=${model} keyterms=${kt} → 다음 방식 시도`);
    openDeepgram(ws, attempt + 1);
  });
  dg.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.type === 'Results') {
      const t = (m.channel?.alternatives?.[0]?.transcript || '').trim();
      if (!t) return;
      if (!m.is_final) return send(ws, { type: 'interim', text: (st.buf + ' ' + t).trim() });
      st.buf = (st.buf + ' ' + t).trim();
      if (m.speech_final || st.buf.length > 220) flushStt(ws); else send(ws, { type: 'interim', text: st.buf });
    } else if (m.type === 'UtteranceEnd') flushStt(ws);
  });
  dg.on('close', () => {
    clearInterval(st.ka);
    flushStt(ws);
    if (ws.stt === st && !st.closing && st.opened && ws.readyState === 1) { console.log('[STT] 끊김 → 재연결'); setTimeout(() => ws.stt === st && openDeepgram(ws, 0), 500); }
  });
  dg.on('error', e => { if (!st.opened) return; console.error('[STT] error', e.message); });
}
function flushStt(ws) {
  const st = ws.stt; if (!st || !st.buf) return;
  const text = st.buf; st.buf = '';
  send(ws, { type: 'interim', text: '' });
  handleUtterance(ws, text, String(Date.now()));
}
function closeStt(ws) {
  const st = ws.stt; if (!st) return;
  st.closing = true; flushStt(ws); clearInterval(st.ka);
  try { st.dg.readyState === 1 && st.dg.send(JSON.stringify({ type: 'CloseStream' })); st.dg.close(); } catch {}
  ws.stt = null;
}

// ---------------- 발화 처리(번역 + 배포) ----------------
async function handleUtterance(ws, rawText, id) {
  const text = String(rawText || '').trim().slice(0, 1000);
  if (!text || !ws.meta) return;
  const { code, lang, name } = ws.meta;
  const room = rooms.get(code); if (!room) return;
  const other = lang === 'ko' ? 'en' : 'ko';
  room.clients.forEach(c => c.meta.lang === lang &&
    send(c, { type: 'caption', id, name, lang, text, original: true, self: c === ws }));
  try {
    const t = await translate(text, lang, other, room.history);
    room.clients.forEach(c => c.meta.lang === other &&
      send(c, { type: 'caption', id, name, lang: other, text: t, original: false }));
  } catch (e) {
    console.error('translate error', e.message);
    room.clients.forEach(c => c.meta.lang === other &&
      send(c, { type: 'caption', id, name, lang: other, text: '(번역 실패 / translation failed)', original: false }));
  }
  room.history.push({ name, text });
  if (room.history.length > 30) room.history.shift();
}

const wss = new WebSocketServer({ server });
wss.on('connection', ws => {
  ws.on('message', (raw, isBinary) => {
    // 마이크 오디오 (PCM16 16kHz) → Deepgram
    if (isBinary) { const st = ws.stt; if (!st) return; if (st.dg.readyState === 1) st.dg.send(raw); else if (st.pending.length < 100) st.pending.push(raw); return; }
    let m; try { m = JSON.parse(raw); } catch { return; }

    if (m.type === 'join') {
      const code = String(m.room || '').toUpperCase().slice(0, 12) || 'MEET';
      const lang = m.lang === 'en' ? 'en' : 'ko';
      const name = String(m.name || 'Guest').slice(0, 30);
      ws.meta = { code, lang, name };
      if (!rooms.has(code)) rooms.set(code, { clients: new Set(), history: [] });
      const room = rooms.get(code);
      room.clients.add(ws);
      send(ws, { type: 'joined', room: code, stt: (DG_KEY || process.env.DEEPGRAM_URL) ? 'deepgram' : 'browser' });
      broadcastRoster(room);
    }
    if (m.type === 'mic_start' && ws.meta && (DG_KEY || process.env.DEEPGRAM_URL)) { closeStt(ws); openDeepgram(ws, 0); }
    if (m.type === 'mic_stop') closeStt(ws);
    // 브라우저 내장 음성 인식 대체 경로 (Deepgram 키 없을 때)
    if (m.type === 'utterance' && ws.meta) handleUtterance(ws, m.text, m.id || String(Date.now()));
  });

  ws.on('close', () => {
    closeStt(ws);
    if (!ws.meta) return;
    const room = rooms.get(ws.meta.code);
    if (!room) return;
    room.clients.delete(ws);
    if (room.clients.size === 0) rooms.delete(ws.meta.code);
    else broadcastRoster(room);
  });
});

server.listen(PORT, () => console.log(`Interpreter running: http://localhost:${PORT}`));
