// Crea og-image.png (1200 x 630): l'immagine che compare quando si condivide un link del sito
// (WhatsApp, Facebook…) e nei dati strutturati delle guide. Logo, nome e frase del sito, colore #0b5f5c.
// Uso: node tools/og-image.cjs   (serve Playwright, come per i controlli col browser)
const path = require('path');
const fs = require('fs');

function playwright() {
  try { return require('playwright'); } catch { /* prova quello globale */ }
  const root = require('child_process').execSync('npm root -g').toString().trim();
  return require(path.join(root, 'playwright'));
}

const SITE = path.resolve(__dirname, '..');
const MARK = fs.readFileSync(path.join(SITE, 'index.html'), 'utf8').match(/<svg class="brand-mark"[\s\S]*?<\/svg>/)[0];
const font = (w) => `@font-face { font-family: Nunito; font-weight: ${w}; src: url("data:font/woff2;base64,${fs.readFileSync(path.join(SITE, `fonts/nunito-latin-${w}-normal.woff2`)).toString('base64')}") format("woff2"); }`;

const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><style>
${font(700)} ${font(800)}
html, body { margin: 0; width: 1200px; height: 630px; }
body { background: #0b5f5c; color: #fff; font-family: Nunito, sans-serif; display: flex; flex-direction: column; justify-content: center; padding: 0 96px; box-sizing: border-box; }
.top { display: flex; align-items: center; gap: 36px; }
.top svg { width: 168px; height: 168px; flex: none; }
h1 { font-size: 104px; font-weight: 800; margin: 0; letter-spacing: -1px; }
p { font-size: 46px; font-weight: 700; line-height: 1.25; margin: 48px 0 0; max-width: 1000px; }
.url { font-size: 34px; font-weight: 700; margin-top: 40px; color: #bfe8e2; }
</style></head><body>
<div class="top">${MARK.replace('class="brand-mark" ', '')}<h1>Guida Sanità</h1></div>
<p>La sanità pubblica: come si fa, con parole semplici e fonti ufficiali.</p>
<div class="url">guidasanita.it · gratis, fatto da volontari</div>
</body></html>`;

(async () => {
  const browser = await playwright().chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(SITE, 'og-image.png') });
  await browser.close();
  console.log('ok og-image.png');
})();
