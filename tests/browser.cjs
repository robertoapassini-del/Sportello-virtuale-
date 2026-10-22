// Prova tutte le pagine del sito in un browser vero (telefono piccolo), come le vede chi abita in Sicilia,
// chi abita nel Lazio (una regione con solo i Numeri utili) e chi non ha ancora scelto la regione.
// Poi, come utente del Lazio, entra in ogni modulo e clicca le scelte una dopo l'altra.
// Fallisce se trova:
// - errori JavaScript;
// - «undefined», «NaN» o «[object Object]» nel testo;
// - una pagina più larga dello schermo;
// - stampando: titolo assente o bianco, pulsanti sul foglio;
// - pulsanti e link più bassi di 44 px, o pagine troppo larghe con il testo al 250% (accessibilità);
// - con la tastiera (audit del 22/10/2026, giro 6): il primo Tab che non porta a «Vai al contenuto», elementi senza
//   un contorno ben visibile quando li raggiungi con Tab, errori dei campi non collegati al campo (aria-describedby,
//   aria-invalid, focus sul campo);
// - in Sicilia, il riquadro «Chi può aiutarti» delle pagine delle aree senza «ASP»;
// - per chi non è siciliano, una frase su uffici o servizi siciliani (ASP, SovraCUP, Palermo…) che non dice
//   «Sicilia» (stessa regola di tests/nazionale.test.mjs, ma sul testo creato dal JavaScript);
// - audit dei mutanti del 22/10/2026, giro 6 (docs/mutanti.md): nelle pagine dei moduli la guida scritta (#guida) che
//   non si vede, la classe «pronto» che manca su <html>, il pulsante Stampa nascosto; un campo dei moduli senza
//   etichetta; «Ricomincia da capo» che non torna alla prima schermata.
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
// Le regioni dall'indice, non scritte a mano: quando una regione diventa attiva o accende un modulo, i controlli
// sotto la seguono (22/10/2026: la Campania attivata faceva fallire il controllo «regione non attiva»).
const indiceRegioni = JSON.parse(fs.readFileSync(path.join(SITE, 'data/regioni/index.json'), 'utf8')).regioni;
// Dal 22/10/2026 sono attive tutte: se nessuna è non attiva, nel browser (page.route) si aggiunge all'indice una
// regione finta non attiva, così la schermata «La tua regione non c'è ancora» resta provata qualunque siano i dati.
const FINTA = { id: 'prova-inattiva', name: 'Regione di prova', attiva: false, asl_label: 'ASL' };
// «ASP» non è siciliano dove la regione chiama così le sue aziende: la sigla della regione è ASP (Calabria) o
// un'azienda ha «ASP» nel nome ufficiale («ASP Basilicata»). Si legge dai dati, non da un elenco scritto qui.
const aspNellaRegione = (id) => {
  const r = indiceRegioni.find((x) => x.id === id) || {};
  if (r.asl_label === 'ASP') return true;
  const f = path.join(SITE, `data/regioni/${id}/${(r.files && r.files.asl) || 'asl'}.json`);
  if (!fs.existsSync(f)) return false;
  return (JSON.parse(fs.readFileSync(f, 'utf8')).asl || []).some((a) => /\bASP\b/.test(`${a.name || ''} ${a.nome_lettera || ''}`));
};
const INATTIVA = (indiceRegioni.find((r) => !r.attiva) || FINTA).id;
const LOMBARDIA = indiceRegioni.find((r) => r.id === 'lombardia') || { moduli: [] };
// Le pagine delle aree («Visite ed esami»…): il riquadro «Chi può aiutarti» deve aspettare la regione (in Sicilia «ASP»).
const aree = JSON.parse(fs.readFileSync(path.join(SITE, 'data/moduli.json'), 'utf8')).groups.map((g) => `${BASE}${g.page}/`);

// Nel browser: le frasi siciliane senza «Sicilia» (fuori dal riquadro delle fonti).
// aspOk: la regione chiama ASP anche le sue aziende (la Calabria): lì «ASP» da solo non è siciliano.
function fraseSiciliane(aspOk) {
  const SIC = aspOk ? /SovraCUP|ASPConTe|Regione Siciliana|\b(Palermo|Catania|Messina|Trapani|Siracusa|Agrigento|Enna|Ragusa|Caltanissetta)\b/
    : /\bASP\b|SovraCUP|ASPConTe|Regione Siciliana|\b(Palermo|Catania|Messina|Trapani|Siracusa|Agrigento|Enna|Ragusa|Caltanissetta)\b/;
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
  if (regione !== 'sicilia' && !dove.includes('/fonti.html')) for (const f of await page.evaluate(fraseSiciliane, aspNellaRegione(regione))) problemi.push(`${dove}: frase siciliana senza «Sicilia»: «${f}»`);
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

// Pagina di un modulo (audit dei mutanti del 22/10/2026, giro 6: N18, N20): la guida scritta si vede, il JavaScript ha
// messo la classe «pronto» su <html> (senza, la pagina resta come se il JavaScript non ci fosse), il pulsante Stampa si vede.
async function paginaModulo(page, dove, problemi) {
  const r = await page.evaluate(() => {
    const vis = (e) => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
    const g = document.getElementById('guida');
    return {
      guida: vis(g) && g.getBoundingClientRect().height > 100,
      pronto: document.documentElement.classList.contains('pronto'),
      stampa: vis(document.querySelector('[data-action="print-page"]')),
    };
  });
  if (!r.guida) problemi.push(`${dove}: la guida scritta (#guida) non si vede`);
  if (!r.pronto) problemi.push(`${dove}: manca la classe «pronto» su <html>`);
  if (!r.stampa) problemi.push(`${dove}: il pulsante Stampa non si vede`);
}

// Ogni campo visibile di un modulo ha un'etichetta: <label for>, aria-label o aria-labelledby (giro 6, N25).
async function campiEtichettati(page, dove, problemi) {
  const senza = await page.evaluate(() => [...document.querySelectorAll('#app input:not([type=hidden]), #app select, #app textarea')]
    .filter((e) => e.getClientRects().length && !(e.labels && e.labels.length) && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby'))
    .map((e) => e.id || e.name || e.type));
  for (const x of senza) problemi.push(`${dove}: campo senza etichetta «${x}»`);
}

// Tastiera (audit del 22/10/2026, giro 6). Il primo Tab porta a «Vai al contenuto»: nessuna pagina sposta il focus
// da sola quando si apre (prima i moduli lo mettevano sul titolo e il primo Tab saltava il link).
async function primoTab(page, dove, problemi) {
  await page.keyboard.press('Tab');
  if (!(await page.evaluate(() => document.activeElement.classList.contains('skip-link')))) problemi.push(`${dove}: il primo Tab non porta a «Vai al contenuto» (focus spostato all'apertura?)`);
}

// Ogni elemento raggiunto con Tab ha un contorno di almeno 2 px (non quello sottile del browser) o un'ombra.
async function contornoFocus(page, dove, problemi) {
  const visti = new Set();
  for (let i = 0; i < 120; i++) {
    await page.keyboard.press('Tab');
    const r = await page.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return null;
      if (!e.matches(':focus')) return { salta: true }; // per esempio l'icona del calendario dentro un campo data
      const cs = getComputedStyle(e);
      const ok = (cs.outlineStyle !== 'none' && cs.outlineStyle !== 'auto' && parseFloat(cs.outlineWidth) >= 2) || cs.boxShadow !== 'none';
      return { ok, k: `${e.tagName.toLowerCase()} «${(e.innerText || e.name || '').trim().replace(/\s+/g, ' ').slice(0, 40)}»` };
    });
    if (!r) break;
    if (r.salta || r.ok || visti.has(r.k)) continue;
    visti.add(r.k);
    problemi.push(`${dove}: con la tastiera non si vede bene dove sei: ${r.k}`);
  }
}

// Errori dei campi: dopo un invio vuoto il messaggio è collegato al campo (aria-describedby), il campo è segnato
// (aria-invalid) e ha il focus, così chi usa un lettore di schermo sa quale campo correggere.
async function erroriCollegati(page, dove, problemi) {
  const forms = await page.$$eval('#app form', (fs) => fs.filter((f) => f.querySelector('.field-error') && f.offsetParent && f.querySelector('button[type=submit]')).map((f) => f.id));
  for (const id of forms) {
    await page.evaluate((id) => { for (const i of document.getElementById(id).querySelectorAll('input:not([type=checkbox]):not([type=radio])')) i.value = ''; }, id);
    const h1 = await page.evaluate(() => document.querySelector('#app h1')?.innerText);
    await page.click(`#${id} button[type=submit]`);
    await page.waitForTimeout(150);
    if (await page.evaluate(() => document.querySelector('#app h1')?.innerText) !== h1) continue; // vuoto accettato: niente errore
    const r = await page.evaluate((id) => {
      const f = document.getElementById(id);
      const out = [];
      for (const e of f.querySelectorAll('.field-error')) {
        if (e.hidden || !e.textContent.trim()) continue;
        if (!f.querySelector(`[aria-describedby~="${e.id}"]`)) out.push(`errore «${e.textContent.trim()}» non collegato al campo (aria-describedby)`);
        const segnato = f.querySelector('[aria-invalid="true"]');
        if (!segnato) out.push(`errore «${e.textContent.trim()}» ma nessun campo con aria-invalid`);
        else if (document.activeElement !== segnato) out.push(`errore «${e.textContent.trim()}» ma il focus non è sul campo da correggere`);
      }
      return out;
    }, id);
    for (const x of r) problemi.push(`${dove} (#${id}): ${x}`);
  }
}

(async () => {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const problemi = [];
  const nuova = async (regione) => {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
    if (regione) await ctx.addInitScript((r) => { try { localStorage.setItem('gs-regione', r); } catch { /* niente */ } }, regione);
    if (regione === FINTA.id && INATTIVA === FINTA.id) {
      await ctx.route('**/data/regioni/index.json', async (route) => {
        const res = await route.fetch();
        const j = await res.json();
        j.regioni.push(FINTA);
        await route.fulfill({ response: res, json: j });
      });
    }
    return ctx;
  };
  const errori = (page, dove) => {
    page.on('pageerror', (e) => problemi.push(`${dove()}: errore JavaScript ${e.message}`));
    page.on('dialog', (d) => d.dismiss());
  };

  // SOLO_REGIONI=1 salta i due giri lunghi qui sotto (pagine e percorsi a caso): per provare in fretta i percorsi delle regioni.
  const SOLO = !!process.env.SOLO_REGIONI;
  for (const regione of SOLO ? [] : ['sicilia', 'lazio', null]) {
    const ctx = await nuova(regione);
    for (const u of urls) {
      const page = await ctx.newPage();
      const dove = `${regione || 'nessuna regione'} ${u.replace(BASE, '/')}`;
      errori(page, () => dove);
      await page.goto(u, { waitUntil: 'networkidle' });
      await controlla(page, dove, regione, problemi);
      if (!regione && moduli.some((m) => u === `${BASE}${m}/`)) await paginaModulo(page, dove, problemi);
      if (!regione) await accessibile(page, dove, problemi);
      if (regione === 'sicilia') {
        await primoTab(page, dove, problemi);
        await contornoFocus(page, dove, problemi);
        await stampa(page, dove, problemi);
      }
      if (regione === 'sicilia' && aree.includes(u)) {
        const aiuto = await page.evaluate(() => (document.querySelector('details.help') || {}).textContent || '');
        if (!/\bASP\b/.test(aiuto)) problemi.push(`${dove}: il riquadro «Chi può aiutarti» non dice «ASP» a chi abita in Sicilia`);
      }
      await page.close();
    }
    await ctx.close();
  }

  // Percorsi nei moduli come utente del Lazio e della Sicilia (che ha anche uffici e lettere): clic sulle scelte,
  // in tre ordini diversi. A ogni passo si prova anche a mandare vuoti i campi (erroriCollegati).
  for (const regione of SOLO ? [] : ['lazio', 'sicilia']) for (const m of moduli) {
    for (let giro = 0; giro < 3; giro++) {
      const ctx = await nuova(regione);
      const page = await ctx.newPage();
      let dove = `${regione} /${m}/ giro ${giro}`;
      errori(page, () => dove);
      await page.goto(`${BASE}${m}/`, { waitUntil: 'networkidle' });
      for (let passo = 0; passo < 10; passo++) {
        dove = `${regione} /${m}/ giro ${giro} passo ${passo}`;
        await controlla(page, dove, regione, problemi);
        // Prima delle etichette: erroriCollegati manda il modulo vuoto, e un modulo vuoto accettato (l'età vuota vale 0)
        // porta alla schermata dopo.
        await campiEtichettati(page, dove, problemi);
        await erroriCollegati(page, dove, problemi);
        for (const d of await page.$$('#app input[type=date]')) await d.fill('2026-09-01').catch(() => {});
        for (const d of await page.$$('#app input[type=number]')) await d.fill('55').catch(() => {});
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

  // Chi non abita in Sicilia (Lombardia: solo alcuni moduli; INATTIVA: una regione non ancora attiva, dall'indice):
  // la schermata di blocco dei moduli con dati regionali deve portare alla guida scritta (#guida), mai alla prima
  // schermata (il cui pulsante riporterebbe al blocco: giro senza uscita). Per la regione non attiva anche i Numeri utili nazionali.
  // In Lombardia i moduli che sanno fare il conto senza la provincia non hanno il blocco: li prova il blocco più sotto.
  const regionali = ['liste-attesa', 'invalidita', 'cartella-clinica', 'medico-famiglia', 'assistenza-domiciliare', 'ausili', 'cure-palliative', 'prevenzione'];
  // I moduli che senza uffici non sanno fare il conto, se la Lombardia non li ha ancora accesi.
  const bloccatiLombardia = ['invalidita', 'ausili', 'prevenzione'].filter((m) => !(LOMBARDIA.moduli || []).includes(m));
  for (const regione of ['lombardia', INATTIVA].filter(Boolean)) {
    for (const m of regionali.filter((x) => regione !== 'lombardia' || bloccatiLombardia.includes(x))) {
      const ctx = await nuova(regione);
      const page = await ctx.newPage();
      const dove = `${regione} /${m}/ blocco regione`;
      errori(page, () => dove);
      await page.goto(`${BASE}${m}/`, { waitUntil: 'networkidle' });
      const start = page.locator('#app button[data-go="province"]:not([disabled]), #app .btn.primary:not([disabled])').first();
      if (!(await start.count())) { problemi.push(`${dove}: non trovo il pulsante principale`); await ctx.close(); continue; }
      // Un pulsante che non si può cliccare è un problema da elencare, non un motivo per fermare tutti i controlli
      // (giro 6, N20: senza la classe «pronto» il pulsante resta nascosto).
      try { await start.click({ timeout: 5000 }); } catch { problemi.push(`${dove}: il pulsante principale non si può cliccare`); await ctx.close(); continue; }
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
      if (regione === INATTIVA && !r.numeri) problemi.push(`${dove}: manca il link ai Numeri utili`);
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
    // Solo i moduli che la Lombardia non ha ancora acceso (quelli accesi hanno gli uffici e la lettera).
    for (const m of [...Object.keys(percorsi), 'invalidita', 'ausili'].filter((x) => !(LOMBARDIA.moduli || []).includes(x))) {
      const ctx = await nuova('lombardia');
      const page = await ctx.newPage();
      const dove = `lombardia /${m}/ conto senza uffici`;
      errori(page, () => dove);
      await page.goto(`${BASE}${m}/`, { waitUntil: 'networkidle' });
      const start = page.locator('#app .btn.primary:not([disabled])').first();
      const etichetta = await start.innerText();
      try { await start.click({ timeout: 5000 }); } catch { problemi.push(`${dove}: il pulsante principale non si può cliccare`); await ctx.close(); continue; }
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
      try {
        await page.click('#app .btn.primary:not([disabled])', { timeout: 5000 });
        await page.waitForTimeout(200);
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

    // Tutte le regioni con «moduli» (22/10/2026: prima i percorsi giravano solo in Sicilia, nel Lazio e senza regione).
    // Per ogni modulo acceso (tranne i Numeri utili) una provincia (a turno), il pulsante principale, la provincia,
    // la zona se c'è, poi sempre la prima scelta fino alla fine; per i moduli con una lettera anche il percorso fino alla
    // lettera (percorsi qui sopra). L'invalidità in tutte le province la prova già tests/combinazioni.cjs.
    // A ogni schermata: errori JavaScript, «undefined», «Sicilia» e «ASP» fuori dalla Sicilia (la Calabria ha le ASP),
    // «non abbiamo ancora i dati» in un modulo acceso, email che non sono nei dati della regione; nella lettera
    // all'azienda, in testa il nome dell'azienda della regione (nome_lettera, o la sigla + «di» + provincia) e l'email
    // a un indirizzo di quell'azienda (o della sua zona).
    const LETTERA_AZIENDA = ['medico-famiglia', 'assistenza-domiciliare', 'cure-palliative', 'liste-attesa', 'ausili'];
    const fileRegione = (r, n) => path.join(SITE, `data/regioni/${r.id}/${(r.files && r.files[n]) || n}.json`);
    const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
    const emailDi = (testo) => (testo.match(EMAIL) || []).map((x) => x.toLowerCase());
    const emailRegione = (r, extra = []) => new Set([...['asl', 'inps'].flatMap((n) => (fs.existsSync(fileRegione(r, n)) ? emailDi(fs.readFileSync(fileRegione(r, n), 'utf8')) : [])), ...extra, 'info@guidasanita.it']);
    // L'azienda con la zona (stessa regola di js/letters.js, scritta qui a parte).
    const conLaZona = (a, z) => (z ? { ...a, ...z, id: a.id, province: a.province } : a);
    const testaAttesa = (r, a) => `Spett.le ${a.nome_lettera || `${r.asl_intestazione || r.asl_label} di ${a.province}`}`;
    async function percorri({ r, a, m, zona = null, finoAllaLettera = false, prepara = null, extraEmail = [], chiedeZona = !!zona }) {
      const ctx = await nuova(r.id);
      if (prepara) await prepara(ctx);
      const page = await ctx.newPage();
      const base = `${r.id} /${m}/ ${a.province}${zona ? ` zona «${zona.label}»` : ''}${finoAllaLettera ? ' fino alla lettera' : ''}`;
      let dove = base;
      errori(page, () => dove);
      const az = conLaZona(a, zona);
      const permesse = emailRegione(r, extraEmail);
      const sic = r.id === 'sicilia';
      const guarda = async () => {
        await controlla(page, dove, r.id, problemi);
        const t = await page.evaluate(() => {
          const app = document.getElementById('app').cloneNode(true);
          for (const d of app.querySelectorAll('details.fonti, .sources')) d.remove();
          return { testo: app.innerText, mail: [...document.querySelectorAll('#app a[href^="mailto:"]')].map((x) => decodeURIComponent(x.getAttribute('href').slice(7).split('?')[0])).filter(Boolean) };
        });
        if (/non abbiamo ancora i dati|non li abbiamo ancora/.test(t.testo)) problemi.push(`${dove}: «non abbiamo ancora i dati» in un modulo acceso`);
        if (!sic) {
          const s = t.testo.match(/.{0,40}\bSicili.{0,30}/);
          if (s) problemi.push(`${dove}: «Sicilia» fuori dalla Sicilia: «${s[0]}»`);
          const asp = !aspNellaRegione(r.id) && t.testo.match(/.{0,40}\bASP\b.{0,30}/);
          if (asp) problemi.push(`${dove}: «ASP» fuori dalla Sicilia: «${asp[0]}»`);
        }
        for (const x of t.mail.flatMap((y) => y.split(','))) if (!permesse.has(x.toLowerCase())) problemi.push(`${dove}: email ${x} che non è nei dati della regione`);
      };
      const titolo = () => page.evaluate(() => (document.querySelector('#app h1') || {}).innerText || '');
      const lettera = async () => {
        const testo = await page.evaluate(() => ((document.getElementById('preview') || {}).innerText || '').trim());
        if (!/^Spett\.le/.test(testo)) return false;
        if (LETTERA_AZIENDA.includes(m)) {
          const prima = testo.split('\n')[0];
          if (prima !== testaAttesa(r, az)) problemi.push(`${dove}: la lettera comincia con «${prima}», non «${testaAttesa(r, az)}»`);
          const href = await page.evaluate(() => (document.getElementById('mail-btn') || {}).getAttribute && document.getElementById('mail-btn').getAttribute('href'));
          const a2 = decodeURIComponent((href || '').replace(/^mailto:/, '').split('?')[0]);
          const sue = new Set([az.pec, az.send_to, ...(az.emails || [])].filter(Boolean).map((x) => x.toLowerCase()));
          if (a2 && !sue.has(a2.toLowerCase())) problemi.push(`${dove}: la lettera va a ${a2}, che non è un indirizzo di ${az.nome_lettera || az.name}`);
        }
        return true;
      };
      try {
        await page.goto(`${BASE}${m}/`, { waitUntil: 'networkidle' });
        await page.click('#app .btn.primary:not([disabled])', { timeout: 5000 });
        await page.waitForTimeout(200);
        // Prevenzione: prima sesso ed età (js/prevenzione.js), poi la provincia.
        if (m === 'prevenzione') {
          dove = `${base} sesso ed età`;
          await guarda();
          await page.click('#app button.choice:has-text("Una donna")', { timeout: 5000 });
          await page.waitForTimeout(200);
          await page.fill('#app #age', '55');
          await page.click('#app #age-form button[type=submit]', { timeout: 5000 });
          await page.waitForTimeout(200);
        }
        dove = `${base} provincia`;
        await guarda();
        await page.click(`#app button.choice[data-set*='"province":"${a.id}"']`, { timeout: 5000 });
        await page.waitForTimeout(200);
        const h = await titolo();
        if (/In quale zona/.test(h) !== chiedeZona) problemi.push(`${dove}: ${chiedeZona ? 'manca' : 'c\'è'} la domanda «In quale zona?» («${h}»)`);
        if (zona && /In quale zona/.test(h)) {
          dove = `${base} zona`;
          await guarda();
          await page.click(`#app button.choice[data-set*='"zona":"${zona.id}"']`, { timeout: 5000 });
          await page.waitForTimeout(200);
        }
        if (finoAllaLettera) {
          await segui(page, percorsi[m].passi);
          dove = `${base} risultato`;
          await guarda();
          const b = page.locator('#app [data-go="letter"]').first();
          if (!(await b.count())) problemi.push(`${dove}: manca il pulsante della lettera`);
          else {
            await b.click();
            await page.waitForTimeout(300);
            dove = `${base} lettera`;
            await guarda();
            if (!(await lettera())) problemi.push(`${dove}: la lettera non comincia con «Spett.le»`);
          }
        } else {
          for (let passo = 0; passo < 14; passo++) {
            dove = `${base} passo ${passo} «${(await titolo()).trim().slice(0, 40)}»`;
            await guarda();
            if (await lettera()) break;
            for (const d of await page.$$('#app input[type=date]')) if (await d.isVisible()) await d.fill(iso(-60)).catch(() => {});
            for (const d of await page.$$('#app input[type=number]')) if (await d.isVisible()) await d.fill('55').catch(() => {});
            let b = null;
            for (const x of await page.$$('#app button.choice:not(.link), #app [data-go="letter"]')) if (await x.isVisible()) { b = x; break; }
            if (!b) for (const x of await page.$$('#app form button[type=submit]')) if (await x.isVisible()) { b = x; break; }
            if (!b) break;
            await b.click().catch(() => {});
            await page.waitForTimeout(200);
            if (!page.url().startsWith(`${BASE}${m}`)) break;
          }
        }
      } catch (e) { problemi.push(`${dove}: percorso interrotto (${e.message.split('\n')[0]})`); }
      await ctx.close();
    }
    let giro = 0;
    for (const r of indiceRegioni.filter((x) => x.attiva && x.moduli)) {
      const asl = JSON.parse(fs.readFileSync(fileRegione(r, 'asl'), 'utf8')).asl;
      for (const m of r.moduli.filter((x) => x !== 'numeri-utili')) {
        const a = asl[giro++ % asl.length];
        const zone = (a.sub_areas || []).filter((z) => z && typeof z === 'object' && z.id);
        // La domanda «In quale zona?» la fanno solo i moduli con una lettera all'azienda, e solo con due zone o più
        // (con una zona sola si usa quella: js/flow.js, provinceChoice). L'invalidità scrive all'INPS: nessuna zona.
        const chiedeZona = zone.length > 1 && ['cartella-clinica', ...LETTERA_AZIENDA].includes(m);
        await percorri({ r, a, m, zona: zone[0] || null, chiedeZona });
        if (percorsi[m]) await percorri({ r, a, m, zona: zone[zone.length - 1] || null, finoAllaLettera: true, chiedeZona });
      }
    }

    // «In quale zona?» con dati finti (fixture): l'ASP di Messina con due zone, ognuna con nome e indirizzi suoi.
    // La lettera va alla zona scelta. Senza le zone finte Messina non chiede la zona (le sue sub_areas sono frasi).
    {
      const sic = indiceRegioni.find((x) => x.id === 'sicilia');
      const messina = JSON.parse(fs.readFileSync(fileRegione(sic, 'asl'), 'utf8')).asl.find((x) => x.id === 'messina');
      const ZONE = [
        { id: 'prova-uno', label: 'Zona di prova uno', comuni: ['Messina'], nome_lettera: 'ASP Prova Zona Uno', pec: 'zona.uno@pec.prova.it', emails: [] },
        { id: 'prova-due', label: 'Zona di prova due', nome_lettera: 'ASP Prova Zona Due', pec: 'zona.due@pec.prova.it', emails: ['urp@zona-due.prova.it'] },
      ];
      const prepara = (ctx) => ctx.route('**/data/regioni/sicilia/asp.json', async (route) => {
        const res = await route.fetch();
        const j = await res.json();
        j.asl.find((x) => x.id === 'messina').sub_areas = ZONE;
        await route.fulfill({ response: res, json: j });
      });
      const extraEmail = ZONE.flatMap((z) => [z.pec, ...z.emails]);
      for (const m of ['medico-famiglia', 'cure-palliative', 'assistenza-domiciliare']) {
        await percorri({ r: sic, a: { ...messina, sub_areas: ZONE }, m, zona: ZONE[1], finoAllaLettera: true, prepara, extraEmail });
      }
      await percorri({ r: sic, a: messina, m: 'medico-famiglia', finoAllaLettera: true, chiedeZona: false });
    }
  }
  {
    // Lombardia, prevenzione: donna di 55 anni → il risultato nazionale (con la mammografia), senza blocco.
    const ctx = await nuova('lombardia');
    const page = await ctx.newPage();
    const dove = 'lombardia /prevenzione/ donna 55 anni';
    errori(page, () => dove);
    await page.goto(`${BASE}prevenzione/`, { waitUntil: 'networkidle' });
    try {
      await page.click('#app .btn.primary:not([disabled])', { timeout: 5000 });
      await page.waitForTimeout(200);
      await page.click('#app button.choice[data-set*="F"]');
      await page.waitForTimeout(200);
      await page.fill('#age', '55');
      await page.click('#age-form button[type=submit]');
      await page.waitForTimeout(300);
      const t = await page.evaluate(() => document.getElementById('app').innerText);
      if (!/Mammografia/.test(t)) problemi.push(`${dove}: il risultato non contiene «Mammografia» («${t.slice(0, 80)}»)`);
    } catch (e) { problemi.push(`${dove}: percorso interrotto (${e.message.split('\n')[0]})`); }
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
  {
    // «Ricomincia da capo» dopo tre schermate torna alla prima, e il tasto Indietro del browser poi esce dal modulo
    // (giro 6, N10: la pila delle schermate teneva solo l'ultima, e «Ricomincia» lasciava le altre nella cronologia).
    const ctx = await nuova('sicilia');
    const page = await ctx.newPage();
    const dove = 'sicilia /ricorso-invalidita/ Ricomincia da capo';
    errori(page, () => dove);
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.goto(`${BASE}ricorso-invalidita/`, { waitUntil: 'networkidle' });
    const primo = await page.evaluate(() => (document.querySelector('#app h1') || {}).innerText || '');
    try {
      await page.click('#app .btn.primary:not([disabled])');
      await page.waitForTimeout(150);
      await page.click('#app button.choice:has-text("Sì, ce l")');
      await page.waitForTimeout(150);
      await page.fill('#app #verbaleDate', new Date(Date.now() - 20 * 864e5).toISOString().slice(0, 10));
      await page.click('#app form button[type=submit]');
      await page.waitForTimeout(150);
      await page.click('#app [data-action="restart"]');
      await page.waitForTimeout(300);
      const dopo = await page.evaluate(() => (document.querySelector('#app h1') || {}).innerText || '');
      if (dopo !== primo) problemi.push(`${dove}: porta a «${dopo}», non alla prima schermata «${primo}»`);
      await page.goBack({ waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      if (page.url() !== BASE) problemi.push(`${dove}: dopo «Ricomincia», Indietro resta nel modulo (${page.url().replace(BASE, '/')}) invece di tornare alla pagina di prima`);
    } catch (e) { problemi.push(`${dove}: percorso interrotto (${e.message.split('\n')[0]})`); }
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
  console.log(`Pagine: ${urls.length} × 3 regioni; moduli: ${moduli.length} × 2 regioni × 3 giri. Problemi: ${unici.length}`);
  for (const p of unici) console.log(`  ${p}`);
  process.exit(unici.length ? 1 : 0);
})();
