const { chromium } = require('playwright');
(async () => {
  const [url, out] = process.argv.slice(2);
  const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY || 'http://127.0.0.1:42243' } });
  const p = await b.newPage({ locale: 'ko-KR' });
  await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(3000);
  const txt = await p.evaluate(() => document.body.innerText);
  require('fs').writeFileSync(out, txt);
  console.log('chars', txt.length, 'title', await p.title());
  await b.close();
})().catch(e => { console.error('ERR', e.message.split('\n')[0]); process.exit(1); });
