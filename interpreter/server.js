import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import WebSocket, { WebSocketServer } from 'ws';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env 파일 읽기: interpreter/.env 에 KEY=VALUE 형식으로 적어두면 서버가 켜질 때 자동으로 불러옵니다.
// (이미 터미널에 설정된 환경 변수가 있으면 그 값을 우선합니다)
// (탐색기가 점(.)으로 시작하는 파일을 숨기거나 못 만들게 하는 경우를 위해 interpreter.env 이름도 인식합니다)
for (const fname of ['.env', 'interpreter.env']) {
  try {
    for (const line of fs.readFileSync(path.join(__dirname, fname), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m || line.trim().startsWith('#')) continue;
      const v = m[2].replace(/^(['"])(.*)\1$/, '$2');
      if (process.env[m[1]] === undefined) process.env[m[1]] = v;
    }
    console.log(`${fname} 파일 로드됨`);
  } catch {}
}

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

// ---------------- 회의록 ----------------
// 방(room)별로 대화를 기록하고 minutes/ 폴더에 마크다운으로 자동 저장합니다.
// 다운로드는 HTTP가 아니라 방에 접속한 참가자의 웹소켓 요청으로만 제공됩니다 (터널 주소가 노출돼도 내려받을 수 없음).
const MINUTES_DIR = process.env.MINUTES_DIR || path.join(__dirname, 'minutes');
const SAVE_MINUTES = process.env.MINUTES_SAVE !== '0';
const pad = n => String(n).padStart(2, '0');
const fmtDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtTime = d => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const safeName = s => String(s).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 24) || 'room';
const LANG_LABEL = { ko: '한국어', en: 'English' };

function renderMinutes(room) {
  const people = [...room.participants.entries()].map(([n, l]) => `${n} (${LANG_LABEL[l]})`).join(', ');
  const lines = [
    `# 회의록 / Meeting Minutes`,
    ``,
    `- 방 / Room: ${room.code}`,
    `- 시작 / Started: ${fmtDate(room.startedAt)} ${fmtTime(room.startedAt)}`,
    `- 참석자 / Participants: ${people || '-'}`,
    `- 발언 수 / Utterances: ${room.log.length}`,
    ``,
    `> 이 기록은 음성 인식과 기계 번역으로 자동 생성되었습니다. 가격·일정·계약 등 중요한 내용은 반드시 원문으로 다시 확인하세요.`,
    `> Auto-generated by speech recognition and machine translation. Please verify important items (prices, dates, contract terms).`,
    ``, `---`, ``,
  ];
  for (const e of [...room.log].sort((a, b) => a.ts - b.ts)) {
    const other = e.lang === 'ko' ? 'en' : 'ko';
    lines.push(`**[${fmtTime(e.ts)}] ${e.name} (${LANG_LABEL[e.lang]})**`, ``,
      `> ${e.text}`, `>`,
      `> ${other.toUpperCase()}: ${e.failed ? '(번역 실패 / translation failed)' : e.translation}`, ``);
  }
  return lines.join('\n');
}
function minutesFilename(room) {
  return `${safeName(room.code)}_${fmtDate(room.startedAt)}_${pad(room.startedAt.getHours())}${pad(room.startedAt.getMinutes())}.md`;
}
function saveMinutes(room) {
  if (!SAVE_MINUTES || room.log.length === 0) return;   // 발언이 없으면 파일을 만들지 않음
  try {
    fs.mkdirSync(MINUTES_DIR, { recursive: true });
    fs.writeFileSync(path.join(MINUTES_DIR, minutesFilename(room)), renderMinutes(room), 'utf8');
  } catch (e) { console.error('[회의록] 저장 실패', e.message); }
}

// rooms: code -> { clients:Set<ws>, history:[{name,text}] }
const rooms = new Map();

function systemPrompt(from, to, history) {
  const ctx = history.slice(-6).map(h => `${h.name}: ${h.text}`).join('\n');
  return `You are a live interpreter in a business meeting. Translate the user's utterance from ${LANG_NAME[from]} to ${LANG_NAME[to]}. Output ONLY the translation, natural spoken style, keep names and numbers exact. Do not answer or comment on the content. The input is speech-recognition output and may contain mis-heard words; if a word is clearly a mis-hearing of a glossary term, use the glossary term.` + GLOSSARY +
    (ctx ? `\n\nRecent conversation (for context only):\n${ctx}` : '');
}

let geminiThinkingOk = true;   // 모델이 thinkingConfig를 거부하면 자동으로 끔
async function geminiGenerate(sys, user, { maxTokens = 600, temperature = 0.2, timeoutMs = 12000 } = {}) {
  const call = async withThinking => {
    const body = {
      systemInstruction: { parts: [{ text: sys }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    };
    if (withThinking) body.generationConfig.thinkingConfig = { thinkingBudget: 0 };   // 생각 시간 끄기 → 지연 감소
    const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), timeoutMs);
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
    if (e.status === 400 && geminiThinkingOk) { geminiThinkingOk = false; console.warn('[LLM] thinkingConfig 거부됨 → 끄고 재시도'); data = await call(false); }
    else throw e;
  }
  const out = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
  if (!out) throw new Error('Gemini 빈 응답(차단 또는 오류): ' + (data.promptFeedback?.blockReason || data.candidates?.[0]?.finishReason || ''));
  return out;
}

// 제공자와 무관하게 쓰는 공통 호출 (번역·요약 공용)
async function llm(sys, user, opts = {}) {
  if (PROVIDER === 'gemini') return geminiGenerate(sys, user, opts);
  const msg = await client.messages.create({
    model: MODEL, max_tokens: opts.maxTokens || 400, system: sys,
    messages: [{ role: 'user', content: user }],
  });
  return msg.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();
}

async function translate(text, from, to, history) {
  if (from === to) return text;
  if (PROVIDER === 'mock') return `[MOCK ${to}] ${text}`;
  return llm(systemPrompt(from, to, history), text, { maxTokens: 600 });
}

// ---------------- 회의록 요약 ----------------
const MAX_SUMMARY_CHARS = 120000;
async function summarizeRoom(room) {
  if (!room.log.length) throw new Error('empty');
  const sorted = [...room.log].sort((a, b) => a.ts - b.ts);
  let transcript = sorted.map(e => `[${fmtTime(e.ts)}] ${e.name} (${LANG_LABEL[e.lang]}): ${e.text}`).join('\n');
  let truncated = false;
  if (transcript.length > MAX_SUMMARY_CHARS) {            // 아주 긴 회의: 앞/뒤만 사용 (중간 생략)
    const half = MAX_SUMMARY_CHARS / 2;
    transcript = transcript.slice(0, half) + '\n[... middle of the meeting omitted for length ...]\n' + transcript.slice(-half);
    truncated = true;
  }
  let body;
  if (PROVIDER === 'mock') body = `[MOCK 요약] 발언 ${room.log.length}건. (번역 API 키가 없어 실제 요약은 생성되지 않았습니다.)`;
  else {
    const sys = `You are a meeting secretary. Below is the transcript of a bilingual Korean/English business meeting captured by speech recognition, so some words may be mis-heard. Write concise meeting minutes.

Rules:
- Use ONLY what is in the transcript. Never invent decisions, numbers, dates, names, owners or deadlines. If something is unclear or may be a recognition error, list it under "확인 필요 / To verify" instead of stating it as fact.
- Mention an owner or deadline only if it was explicitly said.
- Use the glossary spellings for company, product and people names.
- Write the minutes first in Korean, then a line with only "---", then the same content in English.
- Sections (in this order, use markdown headings): 한 줄 요약 / One-line summary; 핵심 논의 / Key discussion; 결정 사항 / Decisions; 후속 조치 / Action items; 확인 필요 / To verify. If a section has nothing, write "없음" / "None".` + GLOSSARY;
    body = await llm(sys, transcript, { maxTokens: 3000, temperature: 0.2, timeoutMs: 90000 });
  }
  const head = [`# 회의 요약 / Meeting Summary`, ``, `- 방 / Room: ${room.code}`, `- 시작 / Started: ${fmtDate(room.startedAt)} ${fmtTime(room.startedAt)}`,
    `- 기준 / Based on: ${room.log.length} utterances${truncated ? ' (긴 회의라 중간 부분은 요약에서 생략됨 / middle omitted for length)' : ''}`,
    ``, `> AI가 자동 생성한 요약입니다. 가격·일정·계약 등 중요한 내용은 전체 회의록과 원문으로 확인하세요.`,
    `> AI-generated summary. Verify important items against the full minutes.`, ``, `---`, ``].join('\n');
  return head + body + '\n';
}

const send = (ws, obj) => ws.readyState === 1 && ws.send(JSON.stringify(obj));
const broadcastRoster = room => {
  const roster = [...room.clients].map(c => ({ name: c.meta.name, lang: c.meta.lang, mode: c.meta.mode }));
  room.clients.forEach(c => send(c, { type: 'roster', roster }));
};

// ---------------- 화자 중재 (여러 폰이 한 방에서 동시에 켜져 있을 때) ----------------
// 같은 방에서는 모든 폰이 모든 사람의 목소리를 듣습니다. 그대로 두면 한 마디가 여러 번(또는 엉뚱한 언어로) 통역됩니다.
// 각 폰이 보내는 음량을 비교해, 그 발언 동안 '가장 크게 들은 폰 = 말한 사람의 폰'의 결과만 통과시키고,
// 혹시 남는 거의 같은 문장은 중복으로 제거합니다. 끄려면 ARBITRATE=0.
const ARBITRATE = process.env.ARBITRATE !== '0';
let connSeq = 0;
const topMean = (arr, since) => {
  const v = arr.filter(x => x.t >= since).map(x => x.v).sort((a, b) => b - a);
  if (!v.length) return 0;
  const k = Math.max(1, Math.ceil(v.length * 0.2));
  return v.slice(0, k).reduce((a, b) => a + b, 0) / k;
};
const bigrams = t => { const s = t.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''); const m = new Map(); for (let i = 0; i < s.length - 1; i++) { const g = s.slice(i, i + 2); m.set(g, (m.get(g) || 0) + 1); } return m; };
function similar(a, b) {
  const A = bigrams(a), B = bigrams(b); let inter = 0, na = 0, nb = 0;
  for (const [, n] of A) na += n; for (const [, n] of B) nb += n;
  for (const [g, n] of A) inter += Math.min(n, B.get(g) || 0);
  return na && nb ? (2 * inter) / (na + nb) : 0;
}
function rivalCheck(ws, since) {
  const room = rooms.get(ws.meta.code);
  const now = Date.now();
  ws.levels = ws.levels.filter(x => now - x.t < 15000);
  const mine = topMean(ws.levels, since);
  if (ws.meta.mode === 'ptt') return { lost: false, mine, rivals: [], louder: null };   // 버튼을 누른 사람은 항상 우선
  const rivals = room ? [...room.clients].filter(c => c !== ws && c.stt && c.levels?.length) : [];
  if (!(mine > 0 && rivals.length)) return { lost: false, mine, rivals, louder: null };
  let louder = null, lv = -1;
  for (const c of rivals) { const p = topMean(c.levels, since); if (p > lv) { lv = p; louder = c; } }
  const lost = lv > mine || (lv === mine && louder.id < ws.id);   // 동점이면 먼저 접속한 폰이 이김
  return { lost, mine, rivals, louder: lost ? louder : null };
}
function allowUtterance(ws, text, since) {
  if (!ARBITRATE && ws.meta.mode !== 'ptt') return true;
  const room = rooms.get(ws.meta.code); if (!room) return true;
  const now = Date.now();
  const r = rivalCheck(ws, since);
  if (ws.meta.mode === 'ptt') {                       // 버튼 방식: 중재/중복 검사 없이 통과, 다른 폰의 같은 문장만 걸러내도록 기록
    room.recent = (room.recent || []).filter(x => now - x.t < 5000);
    room.recent.push({ t: now, id: ws.id, text });
    return true;
  }
  if (r.rivals.length && r.mine > 0) {
    console.log(`[중재] ${ws.meta.name} ${r.mine.toFixed(3)} vs ` + r.rivals.map(c => `${c.meta.name} ${topMean(c.levels, since).toFixed(3)}`).join(', ') + (r.lost ? ` → 제외 (${r.louder.meta.name}이(가) 더 크게 들음)` : ' → 통과'));
    if (r.lost) return false;
  }
  room.recent = (room.recent || []).filter(x => now - x.t < 5000);
  if (room.recent.some(x => x.id !== ws.id && similar(x.text, text) >= 0.7)) { console.log(`[중재] ${ws.meta.name}: 같은 문장 중복 → 제외`); return false; }
  room.recent.push({ t: now, id: ws.id, text });
  return true;
}

// ---------------- 실시간 초안 번역 ----------------
// 말하는 도중(음성 인식 중간 결과)에도 번역을 미리 보여줘서, 말이 끝나고 기다리는 시간을 줄입니다.
// 초안은 회색 기울임으로 표시되다가 문장이 확정되면 같은 자리에서 확정 번역으로 바뀝니다. 끄려면 LIVE_DRAFT=0.
const LIVE_DRAFT = process.env.LIVE_DRAFT !== '0';
function maybeDraft(ws, st, text) {
  if (!LIVE_DRAFT || !st.draftId || !ws.meta) return;
  const now = Date.now();
  if (st.draftBusy || now - (st.lastDraftAt || 0) < 1100 || text.length < 6 || text === st.lastDraftText) return;
  const room = rooms.get(ws.meta.code); if (!room) return;
  const other = ws.meta.lang === 'ko' ? 'en' : 'ko';
  if (![...room.clients].some(c => c.meta.lang === other)) return;
  if (ARBITRATE && rivalCheck(ws, (st.utterStart || now - 3000) - 200).lost) return;   // 옆 사람 목소리면 초안도 만들지 않음
  const id = st.draftId;
  st.draftBusy = true; st.lastDraftAt = now; st.lastDraftText = text;
  translate(text, ws.meta.lang, other, room.history).then(t => {
    if (ws.stt !== st || st.draftId !== id) return;   // 이미 확정되었거나 취소됨
    room.clients.forEach(c => c.meta.lang === other && send(c, { type: 'draft', id, name: ws.meta.name, lang: other, text: t }));
  }).catch(() => {}).finally(() => { st.draftBusy = false; });
}

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
      if (!st.utterStart) { st.utterStart = Date.now() - 800; st.draftId = `d${ws.id}-${Date.now()}`; st.lastDraftText = ''; }
      if (!m.is_final) { const cur = (st.buf + ' ' + t).trim(); maybeDraft(ws, st, cur); return send(ws, { type: 'interim', text: cur }); }
      st.buf = (st.buf + ' ' + t).trim();
      if (m.speech_final || m.from_finalize || st.buf.length > 220) { clearTimeout(st.finTimer); flushStt(ws); } else { maybeDraft(ws, st, st.buf); send(ws, { type: 'interim', text: st.buf }); }
    } else if (m.type === 'UtteranceEnd') flushStt(ws);
  });
  dg.on('close', () => {
    clearInterval(st.ka);
    flushStt(ws);
    if (ws.stt === st && !st.closing && st.opened && ws.readyState === 1) { console.log('[STT] 끊김 → 재연결'); setTimeout(() => ws.stt === st && openDeepgram(ws, 0), 500); }
  });
  dg.on('error', e => { if (!st.opened) return; console.error('[STT] error', e.message); });
}
function clearDraft(ws, st) {                                  // 확정 없이 끝난 초안(마이크 끔·끊김 등)을 상대 화면에서 지움
  const id = st.draftId; st.draftId = null; st.utterStart = null; st.lastDraftText = '';
  const room = ws.meta && rooms.get(ws.meta.code);
  if (id && room) room.clients.forEach(c => c.meta.lang !== ws.meta.lang && send(c, { type: 'draft_clear', id }));
}
function flushStt(ws) {
  const st = ws.stt; if (!st) return;
  if (!st.buf) { if (st.draftId) clearDraft(ws, st); return; }
  const text = st.buf; st.buf = '';
  const since = (st.utterStart || Date.now() - 3000) - 200; st.utterStart = null;
  const draftId = st.draftId; st.draftId = null; st.lastDraftText = '';
  send(ws, { type: 'interim', text: '' });
  if (!allowUtterance(ws, text, since)) {             // 옆 사람 목소리를 들은 폰이면 버림
    const room = rooms.get(ws.meta.code);
    if (room && draftId) room.clients.forEach(c => c.meta.lang !== ws.meta.lang && send(c, { type: 'draft_clear', id: draftId }));
    return;
  }
  handleUtterance(ws, text, String(Date.now()), draftId);
}
function closeStt(ws) {
  const st = ws.stt; if (!st) return;
  st.closing = true; flushStt(ws); clearInterval(st.ka);
  try { st.dg.readyState === 1 && st.dg.send(JSON.stringify({ type: 'CloseStream' })); st.dg.close(); } catch {}
  ws.stt = null;
}

// ---------------- 발화 처리(번역 + 배포) ----------------
async function handleUtterance(ws, rawText, id, draftId) {
  const text = String(rawText || '').trim().slice(0, 1000);
  if (!text || !ws.meta) return;
  const { code, lang, name } = ws.meta;
  const room = rooms.get(code); if (!room) return;
  const other = lang === 'ko' ? 'en' : 'ko';
  const ts = new Date();
  room.clients.forEach(c => c.meta.lang === lang &&
    send(c, { type: 'caption', id, name, lang, text, original: true, self: c === ws }));
  try {
    const t = await translate(text, lang, other, room.history);
    room.clients.forEach(c => c.meta.lang === other &&
      send(c, { type: 'caption', id, name, lang: other, text: t, original: false, replaces: draftId }));
    room.log.push({ ts, name, lang, text, translation: t });
  } catch (e) {
    room.log.push({ ts, name, lang, text, failed: true });
    console.error('translate error', e.message);
    room.clients.forEach(c => c.meta.lang === other &&
      send(c, { type: 'caption', id, name, lang: other, text: '(번역 실패 / translation failed)', original: false, replaces: draftId }));
  }
  room.history.push({ name, text });
  if (room.history.length > 30) room.history.shift();
  saveMinutes(room);
}

const wss = new WebSocketServer({ server });
wss.on('connection', ws => {
  ws.id = ++connSeq; ws.levels = [];
  ws.on('message', (raw, isBinary) => {
    // 마이크 오디오 (PCM16 16kHz) → Deepgram
    if (isBinary) { const st = ws.stt; if (!st) return; if (st.dg.readyState === 1) st.dg.send(raw); else if (st.pending.length < 100) st.pending.push(raw); return; }
    let m; try { m = JSON.parse(raw); } catch { return; }

    if (m.type === 'join') {
      const code = String(m.room || '').toUpperCase().slice(0, 12) || 'MEET';
      const lang = m.lang === 'en' ? 'en' : 'ko';
      const name = String(m.name || 'Guest').slice(0, 30);
      const mode = m.mode === 'ptt' ? 'ptt' : 'free';
      ws.meta = { code, lang, name, mode };
      if (!rooms.has(code)) rooms.set(code, { code, clients: new Set(), history: [], log: [], participants: new Map(), startedAt: new Date() });
      const room = rooms.get(code);
      clearTimeout(room.expire);          // 재접속이면 같은 회의록 유지
      room.participants.set(name, lang);
      room.clients.add(ws);
      send(ws, { type: 'joined', room: code, stt: (DG_KEY || process.env.DEEPGRAM_URL) ? 'deepgram' : 'browser' });
      broadcastRoster(room);
    }
    if (m.type === 'mic_start' && ws.meta && (DG_KEY || process.env.DEEPGRAM_URL)) { closeStt(ws); openDeepgram(ws, 0); }
    if (m.type === 'mic_stop') { closeStt(ws); ws.levels = []; }
    if (m.type === 'set_mode' && ws.meta) {                      // 프리토킹 ↔ 버튼 방식 전환
      ws.meta.mode = m.mode === 'ptt' ? 'ptt' : 'free';
      const room = rooms.get(ws.meta.code); if (room) broadcastRoster(room);
    }
    if (m.type === 'ptt_end' && ws.stt?.dg?.readyState === 1) {  // 버튼에서 손을 뗌 → 남은 음성을 즉시 확정
      const st = ws.stt;
      try { st.dg.send(JSON.stringify({ type: 'Finalize' })); } catch {}
      clearTimeout(st.finTimer);
      st.finTimer = setTimeout(() => flushStt(ws), 900);        // Finalize 응답이 없을 때를 대비한 안전장치
    }
    if (m.type === 'level' && typeof m.v === 'number') { ws.levels.push({ t: Date.now(), v: Math.min(1, Math.max(0, m.v)) }); if (ws.levels.length > 200) ws.levels.shift(); }
    if (m.type === 'summarize' && ws.meta) {
      const room = rooms.get(ws.meta.code);
      if (!room || !room.log.length) return send(ws, { type: 'summary', error: 'empty' });
      if (room.summarizing) return send(ws, { type: 'summary', error: 'busy' });
      room.summarizing = true;
      summarizeRoom(room).then(text => {
        const filename = minutesFilename(room).replace(/\.md$/, '_summary.md');
        if (SAVE_MINUTES) try { fs.mkdirSync(MINUTES_DIR, { recursive: true }); fs.writeFileSync(path.join(MINUTES_DIR, filename), text, 'utf8'); } catch (e) { console.error('[요약] 저장 실패', e.message); }
        send(ws, { type: 'summary', filename, text });
      }).catch(e => { console.error('[요약] 실패', e.message); send(ws, { type: 'summary', error: 'failed' }); })
        .finally(() => { room.summarizing = false; });
    }
    if (m.type === 'get_minutes' && ws.meta) {
      const room = rooms.get(ws.meta.code);
      if (room) send(ws, { type: 'minutes', filename: minutesFilename(room), text: renderMinutes(room), count: room.log.length });
    }
    // 브라우저 내장 음성 인식 대체 경로 (Deepgram 키 없을 때)
    if (m.type === 'utterance' && ws.meta) handleUtterance(ws, m.text, m.id || String(Date.now()));
  });

  ws.on('close', () => {
    closeStt(ws);
    if (!ws.meta) return;
    const room = rooms.get(ws.meta.code);
    if (!room) return;
    room.clients.delete(ws);
    if (room.clients.size === 0) { saveMinutes(room); room.expire = setTimeout(() => rooms.delete(ws.meta.code), 10 * 60 * 1000); }   // 10분간 방 유지 (재접속 대비)
    else broadcastRoster(room);
  });
});

server.listen(PORT, () => console.log(`Interpreter running: http://localhost:${PORT}`));
