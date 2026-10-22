// Telefoni vecchi e reti lente (audit del 22/10/2026, giro 7), in un browser vero, su tutte le pagine della sitemap:
// - JavaScript che non parte (browser vecchio, file non arrivato): titolo e testo scritto visibili,
//   niente «Un momento…» per sempre, niente pulsanti bloccati in vista;
// - file di dati (data/*.json) che non arrivano: la risposta scritta della pagina resta, con l'avviso sopra;
// - errore nello script della pagina (per esempio js/liste-attesa.js): come sopra, non un pulsante che non fa niente;
// - telefono in orizzontale (640x360) con il testo al 200%: niente scorrimento laterale.
// Che il JavaScript si possa leggere su Safari 12 e Chrome 70 lo controlla tests/compat.test.mjs.
// Esce con 1 se trova problemi e li stampa.
// Uso:  python3 -m http.server 8080   (in un altro terminale)
//       node tests/telefoni-vecchi.cjs [http://localhost:8080/]
const path = require('path');
const fs = require('fs');

function loadPlaywright() {
  try { return require('playwright'); } catch { /* prova quello globale */ }
  const root = require('child_process').execSync('npm root -g').toString().trim();
  return require(path.join(root, 'playwright'));
}

const BASE = process.argv[2] || 'http://localhost:8080/';
const SITE = path.join(__dirname, '..');
const pagine = fs.readFileSync(path.join(SITE, 'sitemap.xml'), 'utf8').match(/<loc>(.*?)<\/loc>/g)
  .map((x) => x.slice(5, -6).replace('https://guidasanita.it/', ''));
const at = (p) => new URL(p, BASE).href;
// Il file HTML di una pagina: ha un modulo che parte da un pulsante o da «Un momento…» (.js-only scritto nella
// pagina)? Ha uno script suo in js/ (non uno usato da tutte le pagine)?
const html = (p) => fs.readFileSync(path.join(SITE, p === '' || p.endsWith('/') ? `${p}index.html` : p), 'utf8');
// I file di js/ usati da più pagine: l'errore si mette solo nello script della pagina.
const COMUNI = /\/js\/(common|engine|flow|letters|icons|ricetta-svg|controlla|cerca)\.js$/;
const conJsOnly = (p) => /class="js-only/.test(html(p));
const conScriptSuo = (p) => [...html(p).matchAll(/<script type="module" src="([^"]+)"/g)].some((m) => !COMUNI.test(`/${m[1].replace(/^(\.\.?\/)+/, '')}`));
const problemi = [];

// Cosa vede chi apre la pagina.
const leggibile = () => {
  const vis = (e) => !!e && e.offsetParent !== null && getComputedStyle(e).visibility !== 'hidden';
  const app = document.getElementById('app') || document.querySelector('main') || document.body;
  const testo = [...app.querySelectorAll('p, li, h1, h2, h3, dd, td')].filter(vis).map((e) => e.innerText).join(' ').trim();
  return {
    h1: vis(document.querySelector('h1')),
    len: testo.length,
    momento: /(^|\n)\s*Un momento/.test(app.innerText),
    bloccati: [...document.querySelectorAll('button[disabled]')].filter(vis).map((b) => b.innerText.replace(/\s+/g, ' ').trim().slice(0, 40)),
    avviso: [...document.querySelectorAll('#app .notice.bad')].some((e) => vis(e) && /Non riusciamo/.test(e.innerText)),
  };
};

const MODI = [
  { nome: 'senza JavaScript', senzaJs: true, prepara: (ctx) => ctx.route(/\/js\/.*\.js$/, (r) => r.abort()) },
  { nome: 'senza dati', avviso: () => true, prepara: (ctx) => ctx.route(/\/data\/.*\.json$/, (r) => r.abort()) },
  {
    nome: 'errore nello script della pagina',
    avviso: conScriptSuo,
    atteso: true, // l'errore JavaScript c'è apposta
    prepara: (ctx) => ctx.route(/\/js\/[\w-]+\.js$/, async (r) => {
      if (COMUNI.test(r.request().url())) return r.continue();
      const resp = await r.fetch();
      return r.fulfill({ response: resp, body: `throw new Error('errore di prova');\n${await resp.text()}` });
    }),
  },
];

(async () => {
  const browser = await loadPlaywright().chromium.launch();
  for (const modo of MODI) {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 640 } });
    await modo.prepara(ctx);
    const page = await ctx.newPage();
    let errori = [];
    page.on('pageerror', (e) => errori.push(e.message));
    for (const p of pagine) {
      errori = [];
      await page.goto(at(p), { waitUntil: 'load' });
      const dove = `${modo.nome}: /${p}`;
      if (modo.senzaJs) {
        // Senza «pronto» la pagina si mostra dopo mezzo secondo (css/style.css): su una rete lenta non di più.
        await page.waitForTimeout(700);
        if (!(await page.evaluate(leggibile)).h1) problemi.push(`${dove}: il titolo non si vede dopo 0,7 secondi (css/style.css, .js:not(.pronto))`);
        await page.addStyleTag({ content: '.js:not(.pronto) body > * { visibility: visible !important; animation: none !important; }' });
      } else {
        await page.waitForFunction(() => document.documentElement.classList.contains('pronto'), null, { timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(300);
        // fonti.html carica i dati di tutte le regioni (80 richieste): su una macchina carica «Un momento…» resta
        // qualche istante in più. Si aspetta fino a 3 secondi; se resta ancora, è il difetto «per sempre».
        await page.waitForFunction(() => { const app = document.getElementById('app') || document.querySelector('main') || document.body; return !/(^|\n)\s*Un momento/.test(app.innerText); }, null, { timeout: 3000 }).catch(() => {});
      }
      const r = await page.evaluate(leggibile);
      if (!r.h1) problemi.push(`${dove}: il titolo non si vede`);
      if (r.len < 150) problemi.push(`${dove}: solo ${r.len} caratteri di testo visibili`);
      if (r.momento) problemi.push(`${dove}: «Un momento…» per sempre`);
      if (r.bloccati.length) problemi.push(`${dove}: pulsante bloccato in vista («${r.bloccati.join('», «')}»)`);
      if (modo.avviso && modo.avviso(p) && conJsOnly(p) && !r.avviso) problemi.push(`${dove}: manca l'avviso «Non riusciamo a caricare…»`);
      if (!modo.atteso) for (const e of new Set(errori)) problemi.push(`${dove}: errore JavaScript «${e}»`);
    }
    await ctx.close();
  }

  // Telefono in orizzontale con il testo al 200% (impostazioni di accessibilità del telefono).
  const ctx = await browser.newContext({ viewport: { width: 640, height: 360 } });
  const page = await ctx.newPage();
  for (const p of pagine) {
    await page.goto(at(p));
    await page.waitForFunction(() => document.documentElement.classList.contains('pronto'), null, { timeout: 5000 }).catch(() => {});
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    const larga = await page.evaluate(() => document.documentElement.scrollWidth);
    if (larga > 641) problemi.push(`640x360, testo al 200%: /${p}: la pagina è larga ${larga}px (scorre di lato)`);
  }
  await ctx.close();
  await browser.close();

  if (problemi.length) {
    console.log(`${problemi.length} problemi:\n${problemi.join('\n')}`);
    process.exit(1);
  }
  console.log(`Telefoni vecchi: nessun problema (${pagine.length} pagine: senza JavaScript, senza dati, errore nello script, 640x360 al 200%).`);
})().catch((e) => { console.error(e); process.exit(1); });
