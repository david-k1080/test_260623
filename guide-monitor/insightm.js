const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY } });
  const p = await b.newPage({ locale: 'ko-KR' });
  await p.goto('https://cjmezzomedia.com/insight-m', { waitUntil: 'networkidle', timeout: 60000 });
  const all = []; const seen = new Set();
  const grab = async () => p.evaluate(() => [...document.querySelectorAll('a[href$=".pdf"]')].map(a => {
    let n = a; for (let i = 0; i < 6 && n && !/\d{4}\.\d{2}\.\d{2}/.test(n.innerText || ''); i++) n = n.parentElement;
    return { href: a.href, text: (n ? n.innerText : '').replace(/\s+/g, ' ').trim().slice(0, 200) };
  }));
  for (let page = 1; page <= 80; page++) {
    const items = await grab(); let added = 0;
    for (const it of items) if (!seen.has(it.href)) { seen.add(it.href); all.push({ page, ...it }); added++; }
    const nxt = p.getByText('Next', { exact: true }).first();
    const target = p.locator('a,button,li', { hasText: new RegExp('^' + (page + 1) + '$') }).first();
    let moved = false;
    try { if (await target.count()) { await target.click({ timeout: 4000 }); moved = true; } } catch (e) {}
    if (!moved) { try { await nxt.click({ timeout: 4000 }); moved = true; } catch (e) {} }
    if (!moved) break;
    await p.waitForTimeout(700);
    if (page > 3 && added === 0) { const again = await grab(); if (!again.some(x => !seen.has(x.href))) break; }
  }
  require('fs').writeFileSync('data/insightm_catalog.json', JSON.stringify(all, null, 1));
  console.log('items', all.length);
  await b.close();
})().catch(e => { console.error('ERR', e.message.split('\n')[0]); process.exit(1); });
