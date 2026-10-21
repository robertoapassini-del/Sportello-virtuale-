// Prova tutte le pagine del sito in un browser vero (telefono piccolo), come le vede chi abita in Sicilia,
// chi abita nel Lazio (una regione con solo i Numeri utili) e chi non ha ancora scelto la regione.
// Poi, come utente del Lazio, entra in ogni modulo e clicca le scelte una dopo l'altra.
// Fallisce se trova:
// - errori JavaScript;
// - «undefined», «NaN» o «[object Object]» nel testo;
// - una pagina più larga dello schermo;
// - pulsanti e link più bassi di 44 px, o pagine troppo larghe con il testo al 250% (accessibilità);
// - per chi non è siciliano, una frase su uffici o servizi siciliani (ASP, SovraCUP, Palermo…) che non dice
//   «Sicilia» (stessa regola di tests/nazionale.test.mjs, ma sul testo creato dal JavaScript).
// Lo lancia la CI a ogni modifica (.github/workflows/test.yml).
// Uso:  python3 -m http.server 8080   (in un altro terminale)
//       node tests/browser.cjs [http://localhost:8080/]
const path = require('path');
const fs = require('fs');

function loadPlaywright() {
  try { return require('playwright'); } catch { /* prova quello globale */ }
  const root = require('child_process').execSync('npm root -g').toString().trim();
  return require(path.join(root, 'playwright'));
}

const BASE = process.argv[2] || 'http://localhost:8080/';
const SITE = path.resolve(__dirname, '..');
const urls = fs.readFileSync(path.join(SITE, 'sitemap.xml'), 'utf8').match(/<loc>(.*?)<\/loc>/g)
  .map((x) => x.slice(5, -6).replace('https://guidasanita.it/', BASE));
const moduli = JSON.parse(fs.readFileSync(path.join(SITE, 'data/moduli.json'), 'utf8')).modules.map((m) => m.id);

// Nel browser: le frasi siciliane senza «Sicilia» (fuori dal riquadro delle fonti).
function fraseSiciliane() {
  const SIC = /\bASP\b|SovraCUP|ASPConTe|Regione Siciliana|\b(Palermo|Catania|Messina|Trapani|Siracusa|Agrigento|Enna|Ragusa|Caltanissetta)\b/;
  const out = [];
  let titoletto = '';
  for (const el of document.querySelectorAll('main h2, main h3, main h4, main p, main li, main dd, main td, main summary, section.guida h2, section.guida h3, section.guida p, section.guida li')) {
    if (el.closest('details.fonti, .guida-indice, #print-area, .letter, textarea')) continue;
    const t = el.innerText.replace(/\s+/g, ' ').trim();
    if (/^H[2-4]$/.test(el.tagName)) titoletto = t;
    if (!SIC.test(t) || /Sicili/.test(t) || /Sicili|Da dove vengono/.test(titoletto)) continue;
    if (/\b(ASL|ATS)\b[^.]{0,12}\bASP\b|\bASP\b[^.]{0,12}\b(ASL|ATS)\b/.test(t)) continue;
    out.push(t.slice(0, 120));
  }
  return out;
}

async function controlla(page, dove, regione, problemi) {
  const testo = await page.evaluate(() => document.body.innerText);
  const strano = testo.match(/.{0,40}(\bundefined\b|\bNaN\b|\[object Object\]).{0,30}/);
  if (strano) problemi.push(`${dove}: testo strano «${strano[0]}»`);
  if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) problemi.push(`${dove}: più larga dello schermo`);
  // fonti.html è l'elenco delle fonti di tutte le regioni (anche Calabria e Basilicata hanno le ASP): lì i nomi vanno bene.
  if (regione !== 'sicilia' && !dove.includes('/fonti.html')) for (const f of await page.evaluate(fraseSiciliane)) problemi.push(`${dove}: frase siciliana senza «Sicilia»: «${f}»`);
}

// Accessibilità (audit del 21/10/2026): pulsanti e link da toccare alti almeno 44 px; con il testo
// al 250% (persone che ingrandiscono i caratteri) la pagina non deve diventare più larga dello schermo.
async function accessibile(page, dove, problemi) {
  const bassi = await page.evaluate(() => [...document.querySelectorAll('a.breadcrumb-back, .site-footer nav a, #app button.link, #app .btn, #app button.choice')]
    .filter((e) => e.offsetParent && e.getBoundingClientRect().height < 43.5)
    .map((e) => `${e.innerText.trim().slice(0, 30)} (${Math.round(e.getBoundingClientRect().height)} px)`));
  for (const b of bassi) problemi.push(`${dove}: da toccare ma basso: ${b}`);
  await page.addStyleTag({ content: 'html { font-size: 250% !important; }' });
  if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) problemi.push(`${dove}: con il testo al 250% è più larga dello schermo`);
}

(async () => {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const problemi = [];
  const nuova = async (regione) => {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
    if (regione) await ctx.addInitScript((r) => { try { localStorage.setItem('gs-regione', r); } catch { /* niente */ } }, regione);
    return ctx;
  };
  const errori = (page, dove) => {
    page.on('pageerror', (e) => problemi.push(`${dove()}: errore JavaScript ${e.message}`));
    page.on('dialog', (d) => d.dismiss());
  };

  for (const regione of ['sicilia', 'lazio', null]) {
    const ctx = await nuova(regione);
    for (const u of urls) {
      const page = await ctx.newPage();
      const dove = `${regione || 'nessuna regione'} ${u.replace(BASE, '/')}`;
      errori(page, () => dove);
      await page.goto(u, { waitUntil: 'networkidle' });
      await controlla(page, dove, regione, problemi);
      if (!regione) await accessibile(page, dove, problemi);
      await page.close();
    }
    await ctx.close();
  }

  // Percorsi nei moduli come utente del Lazio: clic sulle scelte, in tre ordini diversi.
  for (const m of moduli) {
    for (let giro = 0; giro < 3; giro++) {
      const ctx = await nuova('lazio');
      const page = await ctx.newPage();
      let dove = `lazio /${m}/ giro ${giro}`;
      errori(page, () => dove);
      await page.goto(`${BASE}${m}/`, { waitUntil: 'networkidle' });
      for (let passo = 0; passo < 10; passo++) {
        dove = `lazio /${m}/ giro ${giro} passo ${passo}`;
        await controlla(page, dove, 'lazio', problemi);
        for (const d of await page.$$('#app input[type=date]')) await d.fill('2026-09-01').catch(() => {});
        const scelte = [];
        for (const b of await page.$$('#app button:not([disabled]):not([data-action=back]):not([data-action=restart]):not(.link), #app a.btn.choice')) {
          if (await b.isVisible()) scelte.push(b);
        }
        if (!scelte.length) break;
        const b = scelte[(giro * 3 + passo) % scelte.length];
        if (/WhatsApp|Stampa|Copia|email|Scarica|Chiama/i.test(await b.innerText())) break;
        await b.click().catch(() => {});
        await page.waitForTimeout(200);
        if (!page.url().startsWith(`${BASE}${m}`)) break;
      }
      await ctx.close();
    }
  }

  await browser.close();
  // Lo stesso problema in più passi dello stesso modulo si conta una volta.
  const unici = [...new Set(problemi.map((p) => p.replace(/ giro \d+ passo \d+| giro \d+/, '')))];
  console.log(`Pagine: ${urls.length} × 3 regioni; moduli: ${moduli.length} × 3 giri. Problemi: ${unici.length}`);
  for (const p of unici) console.log(`  ${p}`);
  process.exit(unici.length ? 1 : 0);
})();
