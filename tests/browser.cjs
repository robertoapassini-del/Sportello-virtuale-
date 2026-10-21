// Prova tutte le pagine del sito in un browser vero (telefono piccolo), come le vede chi abita in Sicilia,
// chi abita nel Lazio (una regione con solo i Numeri utili) e chi non ha ancora scelto la regione.
// Poi, come utente del Lazio, entra in ogni modulo e clicca le scelte una dopo l'altra.
// Fallisce se trova:
// - errori JavaScript;
// - «undefined», «NaN» o «[object Object]» nel testo;
// - una pagina più larga dello schermo;
// - stampando: titolo assente o bianco, pulsanti sul foglio;
// - pulsanti e link più bassi di 44 px, o pagine troppo larghe con il testo al 250% (accessibilità);
// - in Sicilia, il riquadro «Chi può aiutarti» delle pagine delle aree senza «ASP»;
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
// Le pagine delle aree («Visite ed esami»…): il riquadro «Chi può aiutarti» deve aspettare la regione (in Sicilia «ASP»).
const aree = JSON.parse(fs.readFileSync(path.join(SITE, 'data/moduli.json'), 'utf8')).groups.map((g) => `${BASE}${g.page}/`);

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

// Stampa (audit del 21/10/2026): il titolo non deve restare bianco (banda colorata senza sfondo), niente
// pulsanti sul foglio, e «Stampa la guida» deve stampare anche il titolo della pagina, non solo l'indice.
async function stampa(page, dove, problemi) {
  const guida = await page.$('button[data-print="guida"]');
  await page.emulateMedia({ media: 'print' });
  if (guida) await page.evaluate(() => document.body.classList.add('printing-guide'));
  const r = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const vis = (e) => e && e.offsetParent !== null && getComputedStyle(e).visibility !== 'hidden';
    return {
      h1: vis(h1), bianco: h1 && getComputedStyle(h1).color === 'rgb(255, 255, 255)',
      bottoni: [...document.querySelectorAll('main button, #app button')].filter(vis).map((b) => b.innerText.trim().slice(0, 30)),
    };
  });
  if (!r.h1) problemi.push(`${dove}: stampando, il titolo non c'è`);
  if (r.bianco) problemi.push(`${dove}: stampando, il titolo è bianco`);
  for (const b of r.bottoni) problemi.push(`${dove}: stampando, si vede il pulsante «${b}»`);
  await page.emulateMedia({ media: 'screen' });
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
      if (regione === 'sicilia') await stampa(page, dove, problemi);
      if (regione === 'sicilia' && aree.includes(u)) {
        const aiuto = await page.evaluate(() => (document.querySelector('details.help') || {}).textContent || '');
        if (!/\bASP\b/.test(aiuto)) problemi.push(`${dove}: il riquadro «Chi può aiutarti» non dice «ASP» a chi abita in Sicilia`);
      }
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

  // Chi non abita in Sicilia (Lombardia: solo i Numeri utili; Campania: non ancora attiva): la schermata di blocco
  // dei moduli con dati regionali deve portare alla guida scritta (#guida), mai alla prima schermata
  // (il cui pulsante riporterebbe al blocco: giro senza uscita). Per la Campania anche i Numeri utili nazionali.
  // In Lombardia i moduli che sanno fare il conto senza la provincia non hanno il blocco: li prova il blocco più sotto.
  const regionali = ['liste-attesa', 'invalidita', 'cartella-clinica', 'medico-famiglia', 'assistenza-domiciliare', 'ausili', 'cure-palliative', 'prevenzione'];
  const bloccatiLombardia = ['invalidita', 'ausili', 'prevenzione'];
  for (const regione of ['lombardia', 'campania']) {
    for (const m of regionali.filter((x) => regione !== 'lombardia' || bloccatiLombardia.includes(x))) {
      const ctx = await nuova(regione);
      const page = await ctx.newPage();
      const dove = `${regione} /${m}/ blocco regione`;
      errori(page, () => dove);
      await page.goto(`${BASE}${m}/`, { waitUntil: 'networkidle' });
      const start = page.locator('#app button[data-go="province"]:not([disabled]), #app .btn.primary:not([disabled])').first();
      if (!(await start.count())) { problemi.push(`${dove}: non trovo il pulsante principale`); await ctx.close(); continue; }
      await start.click();
      await page.waitForTimeout(300);
      // Prevenzione: prima sesso ed età, poi il risultato nazionale (vedi sotto); qui basta il pulsante principale.
      if (m === 'prevenzione') { await ctx.close(); continue; }
      const r = await page.evaluate(() => ({
        h1: (document.querySelector('#app h1') || {}).innerText || '',
        guida: !!document.getElementById('guida'),
        link: !!document.querySelector('#app a[href="#guida"]'),
        inizio: !!document.querySelector('#app button[data-go="intro"]'),
        numeri: !!document.querySelector('#app a[href$="numeri-utili/"]'),
      }));
      if (!/📍/.test(r.h1) && !/non abbiamo ancora i dati|regione non c'è ancora/.test(r.h1)) problemi.push(`${dove}: non si vede la schermata di blocco («${r.h1}»)`);
      if (r.guida && !r.link) problemi.push(`${dove}: manca il link alla guida (#guida)`);
      if (r.inizio) problemi.push(`${dove}: c'è ancora il pulsante che riporta all'inizio (giro senza uscita)`);
      if (regione === 'campania' && !r.numeri) problemi.push(`${dove}: manca il link ai Numeri utili`);
      if (r.link) {
        // Il link alla guida scorre alla guida.
        await page.click('#app a[href="#guida"]');
        await page.waitForTimeout(300);
        const vista = await page.evaluate(() => Math.abs(document.getElementById('guida').getBoundingClientRect().top) < 5);
        if (!vista) problemi.push(`${dove}: il link alla guida non porta alla guida`);
      }
      await ctx.close();
    }
  }
  // Regione attiva ma senza i dati di questi moduli (Lombardia, audit del 21/10/2026, giro 5): le domande e il conto
  // valgono in tutta Italia e si devono poter fare; al posto di uffici e lettera c'è regionMissing().
  // Invalidità (la procedura dipende dalla provincia) e ausili (i giorni li fissa la Regione) restano bloccati,
  // ma il pulsante non deve promettere il «conto». In Sicilia lo stesso percorso arriva fino alla lettera.
  {
    const iso = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
    const it = (d) => d.split('-').reverse().join('/');
    const prima = iso(-60);
    const percorsi = {
      'liste-attesa': { passi: ['È la prima volta', 'Lettera B', 'Mi ha dato una data', 'Sì', { bookingDate: prima, appointmentDate: iso(200) }], data: it(iso(-50)) },
      'cartella-clinica': { passi: ['La cartella clinica', 'Sì, ho già fatto', { requestDate: prima }], data: it(iso(-53)) },
      'assistenza-domiciliare': { passi: ['Il medico ha mandato', { requestDate: prima }], data: it(prima), testo: /60 giorni/ },
      'cure-palliative': { passi: ['Il medico ha fatto la richiesta', { requestDate: prima }], data: it(prima), testo: /60 giorni/ },
      'medico-famiglia': { passi: ['Un adulto', 'Non trovo nessuno'], testo: /medico di famiglia/ },
    };
    const segui = async (page, passi) => {
      for (const p of passi) {
        if (typeof p === 'string') await page.click(`#app button.choice:has-text("${p}")`);
        else {
          for (const [k, v] of Object.entries(p)) await page.fill(`#app #${k}`, v);
          await page.click('#app form button[type=submit]');
        }
        await page.waitForTimeout(200);
      }
    };
    const leggi = (page) => page.evaluate(() => ({
      h1: (document.querySelector('#app h1') || {}).innerText || '',
      testo: document.getElementById('app').innerText,
      lettera: !!document.querySelector('#app [data-go="letter"]'),
      manca: /uffici e numeri della tua regione non li abbiamo ancora/.test(document.getElementById('app').innerText),
    }));
    for (const m of [...Object.keys(percorsi), 'invalidita', 'ausili']) {
      const ctx = await nuova('lombardia');
      const page = await ctx.newPage();
      const dove = `lombardia /${m}/ conto senza uffici`;
      errori(page, () => dove);
      await page.goto(`${BASE}${m}/`, { waitUntil: 'networkidle' });
      const start = page.locator('#app .btn.primary:not([disabled])').first();
      const etichetta = await start.innerText();
      await start.click();
      await page.waitForTimeout(300);
      let r = await leggi(page);
      if (!percorsi[m]) {
        if (/conto/i.test(etichetta)) problemi.push(`${dove}: il pulsante promette il conto («${etichetta}») ma il conto non c'è`);
        if (!/non abbiamo ancora i dati/.test(r.h1)) problemi.push(`${dove}: non si vede la schermata di blocco («${r.h1}»)`);
        await ctx.close();
        continue;
      }
      if (/non abbiamo ancora i dati/.test(r.h1)) { problemi.push(`${dove}: dopo il pulsante c'è il blocco («${r.h1}»)`); await ctx.close(); continue; }
      try { await segui(page, percorsi[m].passi); } catch (e) { problemi.push(`${dove}: percorso interrotto (${e.message.split('\n')[0]})`); await ctx.close(); continue; }
      r = await leggi(page);
      const { data, testo } = percorsi[m];
      if (data && !r.testo.includes(data)) problemi.push(`${dove}: manca la data calcolata ${data} («${r.h1}»)`);
      if (testo && !testo.test(r.testo)) problemi.push(`${dove}: manca «${testo.source}» («${r.h1}»)`);
      if (!r.manca) problemi.push(`${dove}: manca l'avviso «uffici e numeri non li abbiamo ancora»`);
      if (r.lettera) problemi.push(`${dove}: c'è il pulsante della lettera senza l'ufficio a cui mandarla`);
      await controlla(page, dove, 'lombardia', problemi);
      await ctx.close();
    }
    // Sicilia: stesso percorso, con la provincia, fino alla lettera.
    for (const m of ['liste-attesa', 'cartella-clinica']) {
      const ctx = await nuova('sicilia');
      const page = await ctx.newPage();
      const dove = `sicilia /${m}/ fino alla lettera`;
      errori(page, () => dove);
      await page.goto(`${BASE}${m}/`, { waitUntil: 'networkidle' });
      await page.click('#app .btn.primary:not([disabled])');
      await page.waitForTimeout(200);
      try {
        await segui(page, ['Palermo', ...percorsi[m].passi]);
        const r = await leggi(page);
        if (!r.testo.includes(percorsi[m].data)) problemi.push(`${dove}: manca la data calcolata ${percorsi[m].data}`);
        if (r.manca) problemi.push(`${dove}: c'è l'avviso «non li abbiamo ancora» anche in Sicilia`);
        // Liste d'attesa a Palermo: la richiesta si fa sul portale dell'ASP o con la lettera, secondo i dati.
        if (m === 'liste-attesa' && !/Fai la richiesta all/.test(r.testo)) problemi.push(`${dove}: mancano i passi per la richiesta all'ASP`);
        const lettera = page.locator('#app [data-go="letter"]').first();
        if (await lettera.count()) {
          await lettera.click();
          await page.waitForTimeout(300);
          if (!(await page.evaluate(() => (document.getElementById('preview') || {}).innerText || '')).trim()) problemi.push(`${dove}: la lettera è vuota`);
        } else if (m === 'cartella-clinica') problemi.push(`${dove}: manca il pulsante della lettera`);
      } catch (e) { problemi.push(`${dove}: percorso interrotto (${e.message.split('\n')[0]})`); }
      await controlla(page, dove, 'sicilia', problemi);
      await ctx.close();
    }
  }
  {
    // Lombardia, prevenzione: donna di 55 anni → il risultato nazionale (con la mammografia), senza blocco.
    const ctx = await nuova('lombardia');
    const page = await ctx.newPage();
    const dove = 'lombardia /prevenzione/ donna 55 anni';
    errori(page, () => dove);
    await page.goto(`${BASE}prevenzione/`, { waitUntil: 'networkidle' });
    await page.click('#app .btn.primary:not([disabled])');
    await page.waitForTimeout(200);
    await page.click('#app button.choice[data-set*="F"]');
    await page.waitForTimeout(200);
    await page.fill('#age', '55');
    await page.click('#age-form button[type=submit]');
    await page.waitForTimeout(300);
    const t = await page.evaluate(() => document.getElementById('app').innerText);
    if (!/Mammografia/.test(t)) problemi.push(`${dove}: il risultato non contiene «Mammografia» («${t.slice(0, 80)}»)`);
    await controlla(page, dove, 'lombardia', problemi);
    await ctx.close();
  }
  {
    // Lombardia, home: dice che per ora ci sono i numeri utili.
    const ctx = await nuova('lombardia');
    const page = await ctx.newPage();
    const dove = 'lombardia / home';
    errori(page, () => dove);
    await page.goto(BASE, { waitUntil: 'networkidle' });
    if (!(await page.evaluate(() => /numeri utili/.test(document.body.innerText)))) problemi.push(`${dove}: manca la riga «numeri utili»`);
    await ctx.close();
  }
  // La ricerca della home: i testi di data/moduli.json dicono «ASL», ma in Sicilia è l'ASP e in Lombardia l'ATS.
  for (const [regione, sigla] of [['sicilia', 'ASP'], ['lombardia', 'ATS']]) {
    const ctx = await nuova(regione);
    const page = await ctx.newPage();
    const dove = `${regione} / ricerca «carrozzina»`;
    errori(page, () => dove);
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.fill('#hq', 'carrozzina');
    await page.waitForTimeout(300);
    const t = await page.evaluate(() => (document.getElementById('q-results') || {}).innerText || '');
    if (!t) problemi.push(`${dove}: nessun risultato`);
    if (/\bASL\b/.test(t)) problemi.push(`${dove}: i risultati dicono «ASL» invece di «${sigla}»`);
    if (!t.includes(sigla)) problemi.push(`${dove}: i risultati non dicono «${sigla}»`);
    await ctx.close();
  }

  await browser.close();
  // Lo stesso problema in più passi dello stesso modulo si conta una volta.
  const unici = [...new Set(problemi.map((p) => p.replace(/ giro \d+ passo \d+| giro \d+/, '')))];
  console.log(`Pagine: ${urls.length} × 3 regioni; moduli: ${moduli.length} × 3 giri. Problemi: ${unici.length}`);
  for (const p of unici) console.log(`  ${p}`);
  process.exit(unici.length ? 1 : 0);
})();
