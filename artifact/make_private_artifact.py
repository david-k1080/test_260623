#!/usr/bin/env python3
"""Build artifact/live-interpreter.private.html: the generic page plus the Intuition glossary and meeting background.

The output contains client names, so it is git-ignored. Rebuild after glossary.local.json changes:
    python3 artifact/make_private_artifact.py
Then publish the .private.html file to the existing artifact URL.
"""
import json, re, sys, pathlib

root = pathlib.Path(__file__).resolve().parent
src = (root / 'live-interpreter.html').read_text(encoding='utf-8')
g = json.loads((root.parent / 'interpreter' / 'glossary.local.json').read_text(encoding='utf-8'))

# neutral meeting background: facts the translator needs, no positions or figures
CONTEXT = ("In-person meeting in Seoul between INNORED (Korean marketing agency; the Korean-speaking host is David, Strategic Partnership Manager) "
           "and Edgewell (maker of Schick Intuition): Senior Brand Manager Fanny Wong, Ryan Kim (Korean-speaking), Regional VP Pierre, the Marketing Head and the Commercial team. "
           "Agenda: full results of Phase 1 and Phase 2, learnings beyond ROAS, recommendations for future campaigns, roles among Edgewell, LG H&H / Olive Young and INNORED, "
           "and INNORED's possible role for FY27. Channels: Olive Young, Coupang, Naver, influencer marketing, pop-up store. "
           "Always spell the product 'Intuition' and the new line 'Skin Bar' (never 'Beauty Bar'). Style: polite, collaborative business Korean/English.")

seen, lines = set(), ['# 한국어=English  (번역하지 않을 단어는 단어만 한 줄에)']
for t in g['terms']:
    ko, en = str(t['ko']).strip(), str(t['en']).strip()
    if len(ko) < 2 or not en or '\n' in ko + en or ko in seen:
        continue
    seen.add(ko); lines.append(f'{ko}={en}')
for k in g['keep_as_is']:
    k = str(k).strip()
    if len(k) >= 2 and '=' not in k and k not in seen:
        seen.add(k); lines.append(k)

glossary_js = json.dumps('\n'.join(lines), ensure_ascii=False)
context_js = json.dumps(CONTEXT, ensure_ascii=False)

# 1) replace the generic default glossary with the full one
a = src.index('const DEFAULT_GLOSSARY = [')
b = src.index("].join('\\n');", a) + len("].join('\\n');")
src = src[:a] + f'const DEFAULT_GLOSSARY = {glossary_js};\nconst DEFAULT_CTX = {context_js};' + src[b:]

# 2) new storage keys, migrating anything the user saved before (their own lines are kept, ours win on conflicts)
old_init = "voice: store.get('voice', false), glossary: store.get('glossary', DEFAULT_GLOSSARY), ctx: store.get('ctx', ''),"
assert old_init in src
src = src.replace(old_init, "voice: store.get('voice', false), glossary: initialGlossary(), ctx: store.get('ctx2', null) ?? (store.get('ctx', '') || DEFAULT_CTX),")
helper = r"""
function initialGlossary() {
  const saved = store.get('glossary2', null);
  if (saved !== null) return saved;
  const old = store.get('glossary', null);                       // from an earlier version of this page: keep the user's own lines
  if (!old) return DEFAULT_GLOSSARY;
  const have = new Set(DEFAULT_GLOSSARY.split('\n').map(l => l.split('=')[0].trim()));
  const extra = String(old).split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith('#') && !have.has(l.split('=')[0].trim()));
  return extra.length ? DEFAULT_GLOSSARY + '\n' + extra.join('\n') : DEFAULT_GLOSSARY;
}
"""
marker = "const S = {"
src = src.replace(marker, helper + marker, 1)
src = src.replace("store.set('glossary', S.glossary); store.set('ctx', S.ctx);", "store.set('glossary2', S.glossary); store.set('ctx2', S.ctx);")
assert "store.set('glossary2'" in src

out = root / 'live-interpreter.private.html'
out.write_text(src, encoding='utf-8')
print(f'wrote {out.name}: {len(lines) - 1} glossary entries, context {len(CONTEXT)} chars, {len(src)} bytes')
