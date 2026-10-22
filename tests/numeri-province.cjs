// Numeri utili, provincia per provincia: per ogni regione attiva (data/regioni/index.json) e ogni azienda
// sanitaria della regione apre numeri-utili/#<id> con quella regione scelta. È il ramo che browser.cjs non
// vede (lì si apre la pagina senza provincia). Audit del 21/10/2026, giro 5: un errore JavaScript nel blocco
// della sede INPS e un numero della Regione Siciliana mostrato a tutti passavano i controlli.
// Fallisce se trova:
// - errori JavaScript;
// - «undefined», «NaN» o «[object Object]» nel testo;
// - il blocco dell'azienda sanitaria (#asp-numeri) assente, o senza il nome dell'azienda;
// - il blocco della sede INPS assente (ogni provincia ha la sua sede in data/regioni/<regione>/inps.json);
// - fuori dalla Sicilia, la parola «Sicilia»/«Siciliana» nella pagina (un numero o una nota solo siciliani);
// - il pulsante «Stampa» che non chiama window.print (provato su alcune pagine).
// Lo lancia la CI a ogni modifica (.github/workflows/test.yml).
// Uso:  python3 -m http.server 8080   (in un altro terminale)
//       node tests/numeri-province.cjs [http://localhost:8080/]
const path = require('path');
const fs = require('fs');

function loadPlaywright() {
  try { return require('playwright'); } catch { /* prova quello globale */ }
  const root = require('child_process').execSync('npm root -g').toString().trim();
  return require(path.join(root, 'playwright'));
}

const BASE = process.argv[2] || 'http://localhost:8080/';
const SITE = path.resolve(__dirname, '..');
const leggi = (f) => JSON.parse(fs.readFileSync(path.join(SITE, f), 'utf8'));
const regioni = leggi('data/regioni/index.json').regioni.filter((r) => r.attiva);

// Pagine dove provare il pulsante «Stampa» (barra in fondo alla guida, creata da tools/pagine.mjs).
const PAGINE_STAMPA = ['liste-attesa/', 'invalidita/', 'visite-esami/', 'assistenza-domiciliare/dimissione-protetta/'];

(async () => {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const problemi = [];
  let province = 0;

  for (const reg of regioni) {
    const fileAsl = `data/regioni/${reg.id}/${(reg.files && reg.files.asl) || 'asl'}.json`;
    if (!fs.existsSync(path.join(SITE, fileAsl))) { problemi.push(`${reg.id}: manca ${fileAsl}`); continue; }
    const aziende = leggi(fileAsl).asl || [];
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
    await ctx.addInitScript((r) => { try { localStorage.setItem('gs-regione', r); } catch { /* niente */ } }, reg.id);
    const page = await ctx.newPage();
    let dove = `${reg.id}`;
    page.on('pageerror', (e) => problemi.push(`${dove}: errore JavaScript ${e.message}`));
    await page.goto(`${BASE}numeri-utili/`, { waitUntil: 'networkidle' });
    for (const a of aziende) {
      province++;
      dove = `${reg.id} numeri-utili/#${a.id}`;
      await page.evaluate((id) => { location.hash = id; }, a.id);
      await page.waitForFunction((id) => {
        const s = document.getElementById('asp-numeri');
        return !!s && document.querySelector(`a[href="#${CSS.escape(id)}"][aria-current="true"]`);
      }, a.id, { timeout: 3000 }).catch(() => {});
      const r = await page.evaluate(() => {
        const s = document.getElementById('asp-numeri');
        return {
          testo: document.body.innerText,
          app: (document.getElementById('app') || document.body).innerText,
          blocco: !!s,
          titolo: s ? (s.querySelector('h2') || {}).innerText || '' : '',
          inps: s ? [...s.querySelectorAll('h3')].some((h) => /INPS/.test(h.innerText)) : false,
        };
      });
      if (!r.blocco) { problemi.push(`${dove}: manca il blocco dell'azienda sanitaria (#asp-numeri)`); continue; }
      if (a.name && !r.titolo.includes(a.name)) problemi.push(`${dove}: il blocco non ha il nome «${a.name}» (c'è «${r.titolo}»)`);
      if (!r.inps) problemi.push(`${dove}: manca il blocco della sede INPS`);
      const strano = r.testo.match(/.{0,40}(\bundefined\b|\bNaN\b|\[object Object\]).{0,30}/);
      if (strano) problemi.push(`${dove}: testo strano «${strano[0]}»`);
      if (reg.id !== 'sicilia') {
        const sic = r.app.match(/.{0,50}Sicili.{0,30}/);
        if (sic) problemi.push(`${dove}: testo siciliano a chi non è in Sicilia: «${sic[0].replace(/\s+/g, ' ')}»`);
      }
    }
    await ctx.close();
  }

  // Il pulsante «Stampa»: window.print sostituito da una funzione che conta le chiamate.
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
  await ctx.addInitScript(() => {
    try { localStorage.setItem('gs-regione', 'lazio'); } catch { /* niente */ }
    window.__stampe = 0;
    window.print = () => { window.__stampe++; };
  });
  for (const p of PAGINE_STAMPA) {
    const page = await ctx.newPage();
    page.on('pageerror', (e) => problemi.push(`${p}: errore JavaScript ${e.message}`));
    await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle' });
    const bottoni = await page.$$('[data-action="print-page"]');
    if (!bottoni.length) { problemi.push(`${p}: manca il pulsante Stampa ([data-action=print-page])`); await page.close(); continue; }
    for (let i = 0; i < bottoni.length; i++) {
      const prima = await page.evaluate(() => window.__stampe);
      await bottoni[i].scrollIntoViewIfNeeded();
      await bottoni[i].click();
      const dopo = await page.evaluate(() => window.__stampe);
      if (dopo !== prima + 1) problemi.push(`${p}: il pulsante Stampa n. ${i + 1} non stampa (window.print non chiamato)`);
    }
    await page.close();
  }
  await ctx.close();
  await browser.close();

  const unici = [...new Set(problemi)];
  console.log(`Numeri utili: ${province} province in ${regioni.length} regioni; Stampa su ${PAGINE_STAMPA.length} pagine. Problemi: ${unici.length}`);
  for (const p of unici) console.log(`  ${p}`);
  process.exit(unici.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
