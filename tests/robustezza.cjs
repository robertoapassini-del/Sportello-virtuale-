// Prove di robustezza in un browser vero: cosa succede quando qualcosa va storto.
// - ?torna= che porta fuori dal sito (/\altro-sito, /%09/altro-sito): dopo la scelta della regione si resta qui;
// - localStorage bloccato (cookie bloccati): la scelta della regione vale lo stesso e si va avanti;
// - un file di dati che non arriva (Numeri utili, Fonti): restano i numeri nazionali (112), mai «Un momento…» per sempre;
// - indirizzo rotto (numeri-utili/#%);
// - in tutti i casi nessun errore JavaScript.
// Esce con 1 se trova problemi e li stampa.
// Uso:  python3 -m http.server 8080   (in un altro terminale)
//       node tests/robustezza.cjs [http://localhost:8080/]
const path = require('path');
// Una regione non ancora attiva, dall'indice (prima era la Campania, scritta a mano). Dal 22/10/2026 sono attive tutte:
// allora si aggiunge all'indice, solo nel browser (page.route), una regione finta non attiva. Così la schermata
// «La tua regione non c'è ancora» resta provata qualunque siano i dati veri.
const FINTA = { id: 'prova-inattiva', name: 'Regione di prova', attiva: false, asl_label: 'ASL' };
const INATTIVA = (JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'data/regioni/index.json'), 'utf8')).regioni.find((r) => !r.attiva) || FINTA).id;
// L'indice con la regione finta in fondo (se serve).
async function conRegioneFinta(ctx) {
  if (INATTIVA !== FINTA.id) return;
  await ctx.route('**/data/regioni/index.json', async (route) => {
    const res = await route.fetch();
    const j = await res.json();
    j.regioni.push(FINTA);
    await route.fulfill({ response: res, json: j });
  });
}

function loadPlaywright() {
  try { return require('playwright'); } catch { /* prova quello globale */ }
  const root = require('child_process').execSync('npm root -g').toString().trim();
  return require(path.join(root, 'playwright'));
}

const BASE = process.argv[2] || 'http://localhost:8080/';
const ORIGIN = new URL(BASE).origin;
const at = (p) => new URL(p, BASE).href;
const problemi = [];

// localStorage che lancia eccezioni, come con i cookie bloccati.
const STORAGE_BLOCCATO = () => {
  const no = () => { throw new DOMException('Accesso negato', 'SecurityError'); };
  Storage.prototype.getItem = no;
  Storage.prototype.setItem = no;
  Storage.prototype.removeItem = no;
};

// Una scheda nuova (contesto pulito), con gli errori JavaScript raccolti in problemi.
async function scheda(browser, nome, { init, blocca = [], finta = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
  if (finta) await conRegioneFinta(ctx);
  if (init) await ctx.addInitScript(init);
  for (const r of blocca) await ctx.route(r, (route) => route.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => problemi.push(`${nome}: errore JavaScript «${e.message}»`));
  return { ctx, page };
}

async function apri(page, url) {
  await page.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(300);
}

// Vero se il 112 si vede (un link tel:112 visibile).
const si112 = (page) => page.evaluate(() => [...document.querySelectorAll('a[href="tel:112"]')].some((a) => a.offsetParent && a.getBoundingClientRect().height > 0));
// Vero se «Un momento…» si vede ancora.
const attesa = (page) => page.evaluate(() => [...document.querySelectorAll('main *')].some((e) => !e.children.length && /Un momento/.test(e.textContent) && e.offsetParent));
const h1 = (page) => page.evaluate(() => (document.querySelector('main h1') || {}).innerText || '');

async function clicca(page, sel, nome) {
  const el = page.locator(sel).first();
  if (!(await el.count())) { problemi.push(`${nome}: non trovo ${sel} (titolo: «${await h1(page)}»)`); return false; }
  await el.click();
  await page.waitForTimeout(400);
  return true;
}

async function main() {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();

  // (a) ?torna= verso un altro sito: dopo la scelta si resta qui. Uno buono invece porta alla pagina.
  for (const t of ['/%5Cesempio.invalid', '/%09/esempio.invalid', '/%5C%5Cesempio.invalid', '//esempio.invalid', 'https://esempio.invalid/']) {
    const nome = `numeri-utili/?torna=${t}`;
    const { ctx, page } = await scheda(browser, nome);
    await apri(page, at(`numeri-utili/?torna=${t}`));
    if (await clicca(page, 'button[data-action="region"][data-region="sicilia"]', nome)) {
      await page.waitForTimeout(500);
      const u = page.url();
      if (!u.startsWith(`${ORIGIN}/`)) problemi.push(`${nome}: dopo la scelta della regione si va fuori dal sito (${u})`);
    }
    await ctx.close();
  }
  // (a2) Audit giro 6: «/.//altro-sito/» si risolve in un pathname «//altro-sito/», che location.assign() leggeva
  // come indirizzo di un altro sito. Le pagine fuori dal sito rispondono «FUORI» (niente rete vera).
  for (const t of ['/.//esempio.invalid/', '/..//esempio.invalid/', '/a/..//esempio.invalid/', '/./\\esempio.invalid/', '//esempio.invalid/', '/\\esempio.invalid/', '/%09/esempio.invalid', 'javascript:alert(1)', '/legge-104/']) {
    const nome = `numeri-utili/?torna=${t}`;
    const { ctx, page } = await scheda(browser, nome);
    await ctx.route((u) => u.origin !== ORIGIN, (r) => r.fulfill({ status: 200, contentType: 'text/plain', body: 'FUORI' }));
    page.on('dialog', (d) => { problemi.push(`${nome}: si apre una finestra di JavaScript`); d.dismiss().catch(() => {}); });
    await apri(page, at(`numeri-utili/?torna=${encodeURIComponent(t)}`));
    if (await clicca(page, 'button[data-action="region"][data-region="sicilia"]', nome)) {
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(300);
      const u = new URL(page.url());
      if (u.origin !== ORIGIN) problemi.push(`${nome}: dopo la scelta della regione si va fuori dal sito (${u.href})`);
      else if (t === '/legge-104/' && u.pathname !== new URL('legge-104/', BASE).pathname) problemi.push(`${nome}: non torna alla pagina giusta (${u.href})`);
    }
    await ctx.close();
  }
  {
    const nome = 'numeri-utili/?torna=/privacy.html';
    const { ctx, page } = await scheda(browser, nome);
    const dest = new URL('privacy.html', BASE).pathname;
    await apri(page, at(`numeri-utili/?torna=${encodeURIComponent(dest)}`));
    if (await clicca(page, 'button[data-action="region"][data-region="sicilia"]', nome)) {
      await page.waitForLoadState('networkidle').catch(() => {});
      if (new URL(page.url()).pathname !== dest) problemi.push(`${nome}: non torna alla pagina giusta (${page.url()})`);
    }
    await ctx.close();
  }

  // (b) localStorage bloccato: la scelta della regione vale lo stesso.
  {
    const nome = 'numeri-utili/ senza localStorage';
    const { ctx, page } = await scheda(browser, nome, { init: STORAGE_BLOCCATO });
    await apri(page, at('numeri-utili/'));
    if (await clicca(page, 'button[data-action="region"][data-region="lazio"]', nome)) {
      await page.waitForTimeout(500);
      const prov = await page.locator('#app a.btn.choice[href^="#"]').count();
      if (!prov) problemi.push(`${nome}: scelto il Lazio non compaiono le province`);
      if (await page.locator('button[data-action="region"]').count()) problemi.push(`${nome}: dopo la scelta chiede ancora la regione`);
    }
    await ctx.close();
  }
  // Lazio e Lombardia non hanno ancora gli uffici di questo modulo: si salta la provincia e si va alla prima domanda (js/flow.js, withRegion).
  for (const [reg, atteso] of [['sicilia', /Dove abita/], ['lazio', /Per chi è/], ['lombardia', /Per chi è/], [INATTIVA, /La tua regione non c'è ancora/]]) {
    const nome = `medico-famiglia/ senza localStorage (${reg})`;
    const { ctx, page } = await scheda(browser, nome, { init: STORAGE_BLOCCATO, finta: reg === INATTIVA });
    await apri(page, at('medico-famiglia/'));
    if (await clicca(page, 'button[data-go="province"]', nome)
      && await clicca(page, `button[data-action="region"][data-region="${reg}"]`, nome)) {
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(300);
      const t = await h1(page);
      if (!atteso.test(t)) problemi.push(`${nome}: dopo la scelta della regione il titolo è «${t}»`);
      if (reg === 'sicilia' && await clicca(page, '#app button.choice[data-go="who"]', nome) && !/Per chi/.test(await h1(page))) {
        problemi.push(`${nome}: scelta la provincia non si va avanti («${await h1(page)}»)`);
      }
    }
    await ctx.close();
  }
  {
    // Scelta in Numeri utili e ritorno a un'altra pagina (?torna=): la regione resta anche cambiando pagina.
    const nome = 'numeri-utili/?torna=/medico-famiglia/ senza localStorage';
    const { ctx, page } = await scheda(browser, nome, { init: STORAGE_BLOCCATO });
    const dest = new URL('medico-famiglia/', BASE).pathname;
    await apri(page, at(`numeri-utili/?torna=${encodeURIComponent(dest)}`));
    if (await clicca(page, 'button[data-action="region"][data-region="sicilia"]', nome)) {
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(300);
      if (await clicca(page, 'button[data-go="province"]', nome) && !/Dove abita/.test(await h1(page))) {
        problemi.push(`${nome}: tornati al modulo chiede di nuovo la regione («${await h1(page)}»)`);
      }
    }
    await ctx.close();
  }

  // (c) Numeri utili con un file di dati che non arriva: il 112 si vede sempre.
  const casi = [
    ['data/numeri.json bloccato', { blocca: ['**/data/numeri.json'] }, 'numeri-utili/'],
    ['file della regione bloccato', { blocca: ['**/data/regioni/sicilia/**'] }, 'numeri-utili/'],
    ['file della regione scelta bloccato', { blocca: ['**/data/regioni/lazio/**'], init: () => { try { localStorage.setItem('gs-regione', 'lazio'); } catch { /* */ } } }, 'numeri-utili/'],
    ['file della regione scelta bloccato, provincia nell\'indirizzo', { blocca: ['**/data/regioni/lazio/**'], init: () => { try { localStorage.setItem('gs-regione', 'lazio'); } catch { /* */ } } }, 'numeri-utili/#roma'],
    // (d) indirizzo rotto
    ['indirizzo #%', {}, 'numeri-utili/#%'],
    ['indirizzo #%E0%A4%A', {}, 'numeri-utili/#%E0%A4%A'],
  ];
  for (const [quale, opz, url] of casi) {
    const nome = `${url} (${quale})`;
    const { ctx, page } = await scheda(browser, nome, opz);
    await apri(page, at(url));
    if (!(await si112(page))) problemi.push(`${nome}: il 112 non si vede`);
    if (await attesa(page)) problemi.push(`${nome}: resta «Un momento…»`);
    // Senza regione scelta si vede la scelta; scelta la Sicilia (i cui dati non arrivano) compare l'avviso.
    if (quale === 'file della regione bloccato') {
      await clicca(page, 'button[data-action="region"][data-region="sicilia"]', nome);
      if (!(await si112(page))) problemi.push(`${nome}: scelta la regione il 112 non si vede`);
    }
    if (opz.blocca && !(await page.evaluate(() => /Non riusciamo/.test(document.getElementById('app').innerText)))) {
      problemi.push(`${nome}: manca l'avviso che qualcosa non si è caricato`);
    }
    if (quale === 'data/numeri.json bloccato' && !(await page.evaluate(() => [...document.querySelectorAll('a[href="tel:1522"]')].some((a) => a.offsetParent)))) {
      problemi.push(`${nome}: il 1522 non si vede (contenuto scritto nella pagina nascosto: manca la regola CSS .errore-js .static-fallback?)`);
    }
    await ctx.close();
  }

  // (e) Fonti con un file che non arriva: nessun errore, mai «Un momento…».
  for (const [quale, blocca] of [
    ['rules-ausili.json bloccato', ['**/data/rules-ausili.json']],
    ['tutti i rules-*.json bloccati', ['**/data/rules*.json']],
    ['file di una regione bloccato', ['**/data/regioni/lazio/**']],
    ['indice delle regioni bloccato', ['**/data/regioni/index.json']],
    ['moduli.json bloccato', ['**/data/moduli.json']],
  ]) {
    const nome = `fonti.html (${quale})`;
    const { ctx, page } = await scheda(browser, nome, { blocca });
    await apri(page, at('fonti.html'));
    if (await attesa(page)) problemi.push(`${nome}: resta «Un momento…»`);
    await ctx.close();
  }
  {
    // Fonti senza problemi: c'è l'elenco delle regole.
    const nome = 'fonti.html';
    const { ctx, page } = await scheda(browser, nome);
    await apri(page, at('fonti.html'));
    if (await attesa(page)) problemi.push(`${nome}: resta «Un momento…»`);
    if (!(await page.evaluate(() => /Medico di famiglia e pediatra – controllato/.test(document.body.innerText)))) problemi.push(`${nome}: manca l'elenco delle regole`);
    await ctx.close();
  }

  await browser.close();
  if (problemi.length) {
    console.log(`Problemi trovati (${problemi.length}):`);
    for (const p of problemi) console.log(`- ${p}`);
    process.exit(1);
  }
  console.log('Robustezza: nessun problema.');
}

main().catch((e) => { console.error(e); process.exit(1); });
