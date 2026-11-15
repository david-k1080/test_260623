import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const MODEL = process.env.TRANSLATE_MODEL || 'claude-haiku-5-5';
const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
if (!client) console.warn('⚠ ANTHROPIC_API_KEY 없음 → 번역 대신 [MOCK] 표시');

// 용어집 로드 (서버 시작 시 1회, glossary.json 수정 후 재시작)
let GLOSSARY = '';
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
  console.log(`용어집 ${(g.terms || []).length}개 로드`);
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

async function translate(text, from, to, history) {
  if (from === to) return text;
  if (!client) return `[MOCK ${to}] ${text}`;
  const ctx = history.slice(-6).map(h => `${h.name}: ${h.text}`).join('\n');
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: `You are a live interpreter in a business meeting. Translate the user's utterance from ${LANG_NAME[from]} to ${LANG_NAME[to]}. Output ONLY the translation, natural spoken style, keep names and numbers exact. Do not answer or comment on the content. The input is speech-recognition output and may contain mis-heard words; if a word is clearly a mis-hearing of a glossary term, use the glossary term.` + GLOSSARY +
      (ctx ? `\n\nRecent conversation (for context only):\n${ctx}` : ''),
    messages: [{ role: 'user', content: text }],
  });
  return msg.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();
}

const send = (ws, obj) => ws.readyState === 1 && ws.send(JSON.stringify(obj));
const broadcastRoster = room => {
  const roster = [...room.clients].map(c => ({ name: c.meta.name, lang: c.meta.lang }));
  room.clients.forEach(c => send(c, { type: 'roster', roster }));
};

const wss = new WebSocketServer({ server });
wss.on('connection', ws => {
  ws.on('message', async raw => {
    let m; try { m = JSON.parse(raw); } catch { return; }

    if (m.type === 'join') {
      const code = String(m.room || '').toUpperCase().slice(0, 12) || 'MEET';
      const lang = m.lang === 'en' ? 'en' : 'ko';
      const name = String(m.name || 'Guest').slice(0, 30);
      ws.meta = { code, lang, name };
      if (!rooms.has(code)) rooms.set(code, { clients: new Set(), history: [] });
      const room = rooms.get(code);
      room.clients.add(ws);
      send(ws, { type: 'joined', room: code });
      broadcastRoster(room);
    }

    if (m.type === 'utterance' && ws.meta) {
      const text = String(m.text || '').trim().slice(0, 1000);
      if (!text) return;
      const { code, lang, name } = ws.meta;
      const room = rooms.get(code);
      const other = lang === 'ko' ? 'en' : 'ko';
      // 화자와 같은 언어 사용자에게는 원문을 즉시 전송 (지연 0)
      const id = m.id || String(Date.now());
      room.clients.forEach(c => c.meta.lang === lang &&
        send(c, { type: 'caption', id, name, lang, text, original: true, self: c === ws }));
      // 다른 언어 사용자에게는 번역 후 전송
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
  });

  ws.on('close', () => {
    if (!ws.meta) return;
    const room = rooms.get(ws.meta.code);
    if (!room) return;
    room.clients.delete(ws);
    if (room.clients.size === 0) rooms.delete(ws.meta.code);
    else broadcastRoster(room);
  });
});

server.listen(PORT, () => console.log(`Interpreter running: http://localhost:${PORT}`));
