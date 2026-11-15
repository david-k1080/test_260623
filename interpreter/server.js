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
    system: `You are a live interpreter in a business meeting. Translate the user's utterance from ${LANG_NAME[from]} to ${LANG_NAME[to]}. Output ONLY the translation, natural spoken style, keep names and numbers exact. Do not answer or comment on the content.` +
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
