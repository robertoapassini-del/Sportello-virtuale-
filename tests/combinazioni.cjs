// Prova TUTTE le combinazioni di risposte nei due moduli, in un browser vero
// (dimensioni di un telefono piccolo), e confronta ogni risultato con un
// calcolo fatto qui in modo indipendente dal sito.
//
// Uso:  python3 -m http.server 8080   (in un altro terminale)
//       node tests/combinazioni.cjs [http://localhost:8080/]
// Serve Playwright (npm i -g playwright, oppure già installato).
const path = require('path');
const fs = require('fs');

function loadPlaywright() {
  try { return require('playwright'); } catch { /* prova quello globale */ }
  const root = require('child_process').execSync('npm root -g').toString().trim();
  return require(path.join(root, 'playwright'));
}
const { chromium, devices } = loadPlaywright();

const BASE = process.argv[2] || 'http://localhost:8080/';
const DATA = path.join(__dirname, '..', 'data');
const asp = JSON.parse(fs.readFileSync(path.join(DATA, 'asp-sicilia.json'), 'utf8'));
const inps = JSON.parse(fs.readFileSync(path.join(DATA, 'inps-sicilia.json'), 'utf8'));

// ---------- calcoli indipendenti (non usano js/engine.js) ----------
const pad = (n) => String(n).padStart(2, '0');
const now = new Date();
const TODAY = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
function add(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}
const fmt = (iso) => iso.split('-').reverse().join('/');
const LIMIT = { U: 3, B: 10, 'D-visit': 30, 'D-exam': 60, P: 120 };
const CALLBACK = { B: 5, 'D-visit': 10, 'D-exam': 15, P: 30 };
const INV_NEW = { oncological: 15, minor: 30, other: 90 };
const CLASSES = [
  { key: 'U', btn: /^Lettera U/ },
  { key: 'B', btn: /^Lettera B/ },
  { key: 'D-visit', btn: /^Lettera D/, kind: /^Una visita/ },
  { key: 'D-exam', btn: /^Lettera D/, kind: /^Un esame/ },
  { key: 'P', btn: /^Lettera P/ },
];

// ---------- elenco dei casi ----------
const cases = [];
for (const a of asp.asl) {
  const p = a.province;
  cases.push({ mod: 1, name: `${p} · controllo`, p, access: 'followup', expectH1: 'Per i controlli questa regola non vale' });
  cases.push({ mod: 1, name: `${p} · "non lo so" → controllo`, p, access: 'unknown-followup', expectH1: 'Per i controlli questa regola non vale' });
  cases.push({ mod: 1, name: `${p} · "non lo so" → prima volta · senza lettera`, p, access: 'unknown-first', cls: 'none', expectH1: 'Senza la lettera non possiamo calcolare' });
  cases.push({ mod: 1, name: `${p} · senza lettera`, p, access: 'first', cls: 'none', expectH1: 'Senza la lettera non possiamo calcolare' });
  for (const c of CLASSES) {
    const L = LIMIT[c.key];
    const base = { mod: 1, p, a, access: 'first', cls: c };
    cases.push({ ...base, name: `${p} · ${c.key} · data rifiutata`, cup: 'date', accepted: false, expectH1: 'Così la legge non ti aiuta' });
    const booking = add(TODAY, -2);
    cases.push({ ...base, name: `${p} · ${c.key} · stesso giorno`, cup: 'date', accepted: true, booking, appt: booking, expectH1: 'Va tutto bene' });
    cases.push({ ...base, name: `${p} · ${c.key} · esattamente al limite`, cup: 'date', accepted: true, booking, appt: add(booking, L), expectH1: 'Va tutto bene' });
    cases.push({ ...base, name: `${p} · ${c.key} · un giorno oltre`, cup: 'date', accepted: true, booking, appt: add(booking, L + 1), expectH1: 'La data è troppo lontana. Hai diritto a fare prima!', excess: 1, full: true });
    cases.push({ ...base, name: `${p} · ${c.key} · date invertite`, cup: 'date', accepted: true, booking, appt: add(booking, -1), expectError: true });
    cases.push({ ...base, name: `${p} · ${c.key} · prenotazione nel futuro`, cup: 'date', accepted: true, booking: add(TODAY, 1), appt: add(TODAY, 2), expectFutureError: true });
    if (c.key === 'U') {
      cases.push({ ...base, name: `${p} · U · nessuna data`, cup: 'none', expectH1: 'Lettera U: è urgente' });
    } else {
      const N = CALLBACK[c.key];
      cases.push({ ...base, name: `${p} · ${c.key} · nessuna data, giorno nel futuro`, cup: 'none', req: add(TODAY, 1), expectReqError: true });
      cases.push({ ...base, name: `${p} · ${c.key} · nessuna data, senza giorno`, cup: 'none', expectH1: 'Il CUP non ti ha dato una data', cbDays: N });
      cases.push({ ...base, name: `${p} · ${c.key} · nessuna data, scade oggi`, cup: 'none', req: add(TODAY, -N), expectH1: 'Il CUP non ti ha dato una data', cbDays: N, cbStatus: 'waiting' });
      cases.push({ ...base, name: `${p} · ${c.key} · nessuna data, scaduto ieri`, cup: 'none', req: add(TODAY, -N - 1), expectH1: 'Il CUP non ti ha dato una data', cbDays: N, cbStatus: 'passed', full: true });
    }
  }
}

for (const pr of inps.provinces) {
  const certs = [add(TODAY, -10), add(TODAY, -90), add(TODAY, -91), add(TODAY, -200)];
  if (pr.regime_since) certs.push(pr.regime_since, add(pr.regime_since, -1));
  for (const cert of [...new Set(certs)]) {
    const isNew = pr.regime === 'new' && pr.regime_since && cert >= pr.regime_since;
    for (const cat of ['oncological', 'minor', 'other']) {
      const base = { mod: 2, pr, p: pr.name, cert, cat, isNew };
      if (isNew) {
        const dl = add(cert, INV_NEW[cat]);
        base.name = `INV ${pr.name} · nuova · ${cat} · cert ${cert}`;
        cases.push({ ...base, name: `${base.name} · convocato`, conv: true, expectH1: 'Cosa portare alla visita' });
        cases.push({ ...base, name: `${base.name} · non convocato`, conv: false, deadline: dl, passed: TODAY > dl,
          expectH1: TODAY > dl ? 'È tardi! Puoi sollecitare l\'INPS' : 'Non è ancora tardi' });
      } else {
        base.name = `INV ${pr.name} · vecchia · ${cat} · cert ${cert}`;
        const dDl = add(cert, 90);
        cases.push({ ...base, name: `${base.name} · senza domanda`, domanda: null, deadline: dDl, passed: TODAY > dDl,
          expectH1: TODAY > dDl ? 'Il tempo per la domanda è finito' : 'Prima devi fare la domanda' });
        const dom = add(cert, 5) > TODAY ? cert : add(cert, 5);
        const vDl = add(dom, cat === 'oncological' ? 15 : 30);
        cases.push({ ...base, name: `${base.name} · domanda · convocato`, domanda: dom, conv: true, expectH1: 'Cosa portare alla visita' });
        cases.push({ ...base, name: `${base.name} · domanda · non convocato`, domanda: dom, conv: false, deadline: vDl, passed: TODAY > vDl,
          expectH1: TODAY > vDl ? 'È tardi! Puoi sollecitare l\'INPS' : 'Non è ancora tardi' });
        cases.push({ ...base, name: `${base.name} · domanda prima del certificato`, domanda: add(cert, -1), expectDomError: true });
        if (cert < TODAY) cases.push({ ...base, name: `${base.name} · domanda nel futuro`, domanda: add(TODAY, 1), expectDomError: true });
      }
    }
  }
  cases.push({ mod: 2, name: `INV ${pr.name} · certificato nel futuro`, pr, p: pr.name, cert: add(TODAY, 1), expectCertError: true });
}

// Moduli 3 (cartella clinica, 30 giorni) e 4 (ausili, 20 giorni).
const M34 = [
  { mod: 3, url: 'cartella-clinica/index.html', days: 30, late: 'Sono in ritardo: puoi sollecitare', ok: 'Non è ancora tardi' },
  { mod: 4, url: 'ausili/index.html', days: 20, late: "I 20 giorni sono passati: l'autorizzazione vale lo stesso", ok: 'Non è ancora tardi' },
];
for (const m of M34) {
  for (const a of asp.asl) {
    const p = a.province;
    const base = { mod: m.mod, m, p, a };
    if (m.mod === 3) {
      cases.push({ ...base, name: `CART ${p} · non ancora chiesta`, path: 'none', expectH1: 'Prima fai la richiesta per iscritto' });
      cases.push({ ...base, name: `CART ${p} · chiesta a voce`, path: 'voice', expectH1: 'Prima fai la richiesta per iscritto' });
    } else {
      cases.push({ ...base, name: `AUS ${p} · senza prescrizione`, path: 'none', expectH1: 'Si parte dallo specialista' });
      cases.push({ ...base, name: `AUS ${p} · autorizzato non consegnato`, path: 'authorized', expectH1: 'Autorizzato ma non consegnato' });
    }
    const tag = m.mod === 3 ? 'CART' : 'AUS';
    cases.push({ ...base, name: `${tag} ${p} · richiesta oggi`, path: 'date', req: TODAY, expectH1: m.ok, deadline: add(TODAY, m.days) });
    cases.push({ ...base, name: `${tag} ${p} · scade oggi`, path: 'date', req: add(TODAY, -m.days), expectH1: m.ok, deadline: TODAY });
    cases.push({ ...base, name: `${tag} ${p} · scaduta ieri`, path: 'date', req: add(TODAY, -m.days - 1), expectH1: m.late, deadline: add(TODAY, -1), late: 1, full: true });
    cases.push({ ...base, name: `${tag} ${p} · scaduta da 40 giorni`, path: 'date', req: add(TODAY, -m.days - 40), expectH1: m.late, late: 40 });
    cases.push({ ...base, name: `${tag} ${p} · data nel futuro`, path: 'date', req: add(TODAY, 1), expectReqError: true });
  }
}

// Modulo 5: esenzione ticket (calcolo indipendente dal sito).
const ESE = JSON.parse(fs.readFileSync(path.join(DATA, 'rules-esenzione.json'), 'utf8')).codes;
function expectedCodes({ ageBand, status, spouse, children, income }) {
  const fam = (k) => ESE[k].income_base + (spouse ? ESE[k].income_with_spouse - ESE[k].income_base : 0) + ESE[k].income_per_child * children;
  const codes = [], maybe = [];
  const has = income !== null;
  if (ageBand === 'under6' || ageBand === 'over65') (has ? (income <= ESE.E01.income_max && codes.push('E01')) : maybe.push('E01'));
  if (status === 'disoccupato') (has ? (income <= fam('E02') && codes.push('E02')) : maybe.push('E02'));
  if (status === 'sociale') codes.push('E03');
  if (status === 'minimo' && (ageBand === '60to65' || ageBand === 'over65')) (has ? (income <= fam('E04') && codes.push('E04')) : maybe.push('E04'));
  return { codes, maybe, fam };
}
const AGE = { under6: /^Meno di 6/, '6to59': /^Da 6 a 59/, '60to65': /^Da 60 a 65/, over65: /^Più di 65/ };
const STATUS = { disoccupato: /^Disoccupato/, sociale: /assegno sociale/, minimo: /pensione al minimo/, none: /^Nessuna di queste/ };
for (const ageBand of Object.keys(AGE)) for (const status of Object.keys(STATUS)) for (const spouse of [false, true]) for (const children of [0, 2]) {
  const { fam } = expectedCodes({ ageBand, status, spouse, children, income: 0 });
  const incomes = new Set([null, 0, 5000, 36151.98, 36151.99, 100000, fam('E02'), fam('E02') + 1]);
  for (const income of incomes) {
    const exp = expectedCodes({ ageBand, status, spouse, children, income });
    cases.push({ mod: 5, name: `ESE ${ageBand} · ${status} · coniuge ${spouse} · figli ${children} · reddito ${income}`, ageBand, status, spouse, children, income, exp });
  }
}
// Modulo 6: ricorso entro 6 mesi.
const addM = (iso, n) => { const [y, m, d] = iso.split('-').map(Number); const t = new Date(Date.UTC(y, m - 1 + n, 1)); const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate(); t.setUTCDate(Math.min(d, last)); return t.toISOString().slice(0, 10); };
cases.push({ mod: 6, name: 'RIC · senza verbale', path: 'notyet', expectH1: 'Prima serve il verbale' });
cases.push({ mod: 6, name: 'RIC · verbale oggi', verbale: TODAY, expectH1: 'Sei ancora in tempo', deadline: addM(TODAY, 6) });
cases.push({ mod: 6, name: 'RIC · verbale 5 mesi fa (31 giorni: non urgente)', verbale: addM(TODAY, -5), expectH1: 'Sei ancora in tempo', deadline: addM(TODAY, 1) });
cases.push({ mod: 6, name: 'RIC · mancano 10 giorni (urgente)', verbale: add(addM(TODAY, -6), 10), expectH1: 'Muoviti subito: manca poco', deadline: add(TODAY, 10) });
cases.push({ mod: 6, name: 'RIC · scade oggi', verbale: addM(TODAY, -6), expectH1: 'Muoviti subito: manca poco', deadline: TODAY, today: true });
cases.push({ mod: 6, name: 'RIC · scaduto ieri', verbale: add(addM(TODAY, -6), -1), expectH1: 'I 6 mesi sono passati', deadline: add(TODAY, -1) });
cases.push({ mod: 6, name: 'RIC · scaduto da un anno', verbale: addM(TODAY, -18), expectH1: 'I 6 mesi sono passati', deadline: addM(TODAY, -12) });
cases.push({ mod: 6, name: 'RIC · data nel futuro', verbale: add(TODAY, 1), expectReqError: true });

// Modulo 7: assegno di inclusione.
const RADI = JSON.parse(fs.readFileSync(path.join(DATA, 'rules-adi.json'), 'utf8'));
for (const household of [true, false, null]) for (const residency of [true, false, null]) for (const isee of [null, 0, RADI.isee_max, RADI.isee_max + 1, 50000]) {
  const no = household === false || residency === false || (isee !== null && isee > RADI.isee_max);
  const exp = no ? 'no' : (isee === null || household === null || residency === null) ? 'maybe' : 'yes';
  cases.push({ mod: 7, name: `ADI · famiglia ${household} · residenza ${residency} · ISEE ${isee}`, household, residency, isee, exp });
}
// Modulo 8: permesso di soggiorno. Modulo 9: piano terapeutico.
for (const [off, exp] of [[120, 'Hai tempo'], [61, 'Hai tempo'], [60, 'È il momento'], [0, 'È il momento'], [-1, 'È scaduto da poco'], [-60, 'È scaduto da poco'], [-61, 'È scaduto da più di 60'], [-400, 'È scaduto da più di 60']]) {
  cases.push({ mod: 8, name: `PERM · scadenza tra ${off} giorni`, expiry: add(TODAY, off), expectH1: exp, startBy: add(add(TODAY, off), -60) });
}
for (const [off, exp] of [[120, 'Hai tempo'], [61, 'Hai tempo'], [60, 'Prenota adesso'], [0, 'Prenota adesso'], [-1, 'Il piano è scaduto'], [-200, 'Il piano è scaduto']]) {
  cases.push({ mod: 9, name: `PIANO · scadenza tra ${off} giorni`, expiry: add(TODAY, off), expectH1: exp });
}
cases.push({ mod: 9, name: 'PIANO · prima volta', first: true, expectH1: 'Si parte dallo specialista' });
// Moduli 10 e 11: per ogni provincia, i percorsi principali.
for (const a of asp.asl) {
  const p = a.province;
  cases.push({ mod: 10, p, a, name: `DOM ${p} · come si chiede`, path: 'none', expectH1: 'Si parte dal medico di famiglia' });
  cases.push({ mod: 10, p, a, name: `DOM ${p} · interrotta`, path: 'reduced', expectH1: "Se l'assistenza si ferma o non basta", letter: true });
  cases.push({ mod: 10, p, a, name: `DOM ${p} · richiesta da 10 giorni`, path: 'date', req: add(TODAY, -10), expectH1: 'La richiesta è partita' });
  cases.push({ mod: 10, p, a, name: `DOM ${p} · richiesta da 31 giorni`, path: 'date', req: add(TODAY, -31), expectH1: 'Aspetti da troppo', letter: true });
  cases.push({ mod: 10, p, a, name: `DOM ${p} · data nel futuro`, path: 'date', req: add(TODAY, 1), expectReqError: true });
  cases.push({ mod: 11, p, a, name: `PAL ${p} · come funziona`, path: 'none', expectH1: 'Come funziona', letter: true });
  cases.push({ mod: 11, p, a, name: `PAL ${p} · dolore`, path: 'pain', expectH1: 'Il dolore si può curare' });
  cases.push({ mod: 11, p, a, name: `PAL ${p} · richiesta da 3 giorni`, path: 'date', req: add(TODAY, -3), expectH1: 'La richiesta è partita' });
  cases.push({ mod: 11, p, a, name: `PAL ${p} · richiesta da 8 giorni`, path: 'date', req: add(TODAY, -8), expectH1: 'Troppo tempo', letter: true });
}

// ---------- esecuzione ----------
const BAD_TEXT = /undefined|\bnull\b|NaN|TODO|VERIFY|\[object/;

async function runCase(page, c) {
  const problems = [];
  const btn = (name) => page.getByRole('button', { name }).first().click();
  const h1 = async () => (await page.locator('h1').first().innerText()).trim();
  const checkScreen = async (label) => {
    const text = await page.locator('main').innerText();
    const m = text.match(BAD_TEXT);
    if (m) problems.push(`${label}: testo sospetto «${m[0]}»`);
    if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) problems.push(`${label}: la pagina esce dallo schermo`);
    // Riquadro «Fonti» con almeno un link ufficiale.
    const nLinks = await page.locator('details.fonti a[href^="http"]').count();
    if (!nLinks) problems.push(`${label}: manca il riquadro Fonti con i link`);
    // «Ascolta»: la voce deve leggere qualcosa, senza emoji.
    window_speech: {
      await page.evaluate(() => { window.__spoken = []; });
      const listen = page.locator('button[data-action="listen"]');
      if (!(await listen.count())) { problems.push(`${label}: manca il pulsante Ascolta`); break window_speech; }
      await listen.click();
      const spoken = await page.evaluate(() => window.__spoken.join(' '));
      if (spoken.length < 10) problems.push(`${label}: la voce non legge niente`);
      const emo = spoken.match(/[\p{Extended_Pictographic}\uFE0F\u200D]/u);
      if (emo) problems.push(`${label}: la voce legge un'emoji «${emo[0]}»`);
      await listen.click(); // ferma la voce
    }
    return text;
  };

  if (c.mod === 1) {
    await page.goto(`${BASE}liste-attesa/index.html`);
    await btn(/Comincia/);
    if (c.access === 'followup' && c.p === 'Palermo') await checkScreen('domanda provincia');
    await btn(new RegExp(`^${c.p}$`));
    if (c.access === 'followup' && c.p === 'Palermo') await checkScreen('domanda prima volta');
    if (c.access === 'followup') await btn(/^No, è un controllo/);
    else if (c.access === 'unknown-followup') { await btn(/^Non lo so/); await btn(/^È un controllo/); }
    else if (c.access === 'unknown-first') { await btn(/^Non lo so/); await btn(/^È la prima volta/); }
    else await btn(/^Sì, è la prima volta/);
    if (c.cls === 'none') await btn(/^Non c'è nessuna lettera/);
    else if (c.cls) {
      await btn(c.cls.btn);
      if (c.cls.kind) await btn(c.cls.kind);
      await btn(c.cup === 'date' ? /^Mi ha dato una data/ : /^Non mi ha dato nessuna data/);
      if (c.cup === 'date') {
        await btn(c.accepted ? /^Sì$/ : /^No, ne ho scelta/);
        if (c.accepted) {
          await page.fill('#bookingDate', c.booking);
          await page.fill('#appointmentDate', c.appt);
          await btn(/Controlla/);
          if (c.expectError || c.expectFutureError) {
            const e = page.locator('#dates-error');
            if (!(await e.isVisible())) problems.push('date invertite: nessun messaggio di errore');
            return problems;
          }
        }
      } else if (c.req) {
        await page.fill('#requestDate', c.req);
        await btn(/Calcola/);
        if (c.expectReqError) {
          if (!(await page.locator('#req-error').isVisible())) problems.push('giorno nel futuro accettato');
          return problems;
        }
      }
    }
    const got = await h1();
    if (!got.includes(c.expectH1)) problems.push(`titolo atteso «${c.expectH1}», trovato «${got}»`);
    const text = await checkScreen('risultato');

    if (c.appt && c.expectH1 === 'Va tutto bene') {
      const dl = add(c.booking, LIMIT[c.cls.key]);
      if (!text.includes(fmt(dl))) problems.push(`limite atteso ${fmt(dl)} non mostrato`);
    }
    if (c.excess) {
      const dl = add(c.booking, LIMIT[c.cls.key]);
      if (!text.includes(fmt(dl))) problems.push(`limite atteso ${fmt(dl)} non mostrato`);
      if (!text.includes(`${c.excess} giorno di troppo`)) problems.push('giorni di troppo sbagliati');
    }
    if (c.cbDays) {
      if (!text.includes(`entro ${c.cbDays} giorni`)) problems.push(`giorni di richiamata attesi ${c.cbDays}`);
      if (c.cbStatus) {
        const dl = fmt(add(c.req, c.cbDays));
        const want = c.cbStatus === 'waiting' ? `deve richiamarti entro il ${dl}` : `Dovevano richiamarti entro il ${dl}`;
        if (!text.includes(want)) problems.push(`atteso «${want}»`);
      }
    }
    // Fast track: solo per le classi previste dall'ASP.
    if (c.a && c.cls && c.cls !== 'none' && (c.excess || c.cbStatus === 'passed' || c.expectH1.startsWith('Lettera U'))) {
      const ftKey = c.cls.key.startsWith('D') ? 'D' : c.cls.key;
      const wantFT = !!(c.a.fast_track && c.a.fast_track.by_class[ftKey]);
      if (wantFT !== text.includes('Prima prova questo')) problems.push(`fast track ${wantFT ? 'mancante' : 'mostrato per errore'}`);
      if (wantFT) {
        const ph = c.a.fast_track.by_class[ftKey].phone;
        const box = await page.locator('.notice.info', { hasText: 'Prima prova questo' }).innerText();
        if (ph && !box.includes(ph)) problems.push('telefono del fast track mancante');
        if (!ph && box.includes('Chiama')) problems.push('telefono del fast track mostrato per errore');
      }
    }

    if (c.full) {
      const a = c.a;
      if (a.letter_mode === 'portal') {
        const href = await page.locator('a', { hasText: 'Vai al sito dell\'ASP' }).first().getAttribute('href');
        if (href !== a.portal_url) problems.push('link al portale sbagliato');
        await btn(/Ho fatto la richiesta/);
      } else {
        await btn(/Ti aiutiamo a compilare il modulo|Scriviamo la lettera insieme/);
        await page.fill('#f-fullName', 'Maria Rossi');
        await page.fill('#f-service', 'Visita di prova');
        await page.fill('#f-nre', '190A0TEST');
        await page.check('input[name=isDelegate]');
        await page.fill('#f-delegateName', 'Luca Rossi');
        const mail = await page.locator('#mail-btn').getAttribute('href');
        if (a.send_to && !mail.startsWith(`mailto:${a.send_to}?`)) problems.push(`email al destinatario sbagliato: ${mail.slice(0, 60)}`);
        if (a.letter_mode === 'official_form') {
          const t = await page.locator('#preview').innerText();
          if (!t.includes('Maria Rossi') || !t.includes('190A0TEST')) problems.push('tabella del modulo non compilata');
        } else {
          const t = await page.locator('#preview').innerText();
          const clsTxt = c.cls.key === 'D-visit' ? 'D (visita)' : c.cls.key === 'D-exam' ? 'D (esame diagnostico)' : c.cls.key;
          for (const want of ['Maria Rossi', 'Luca Rossi', '190A0TEST', `classe di priorità ${clsTxt}`, `di ${LIMIT[c.cls.key]} giorni`, `Azienda Sanitaria Provinciale di ${a.province}`]) {
            if (!t.includes(want)) problems.push(`lettera senza «${want}»`);
          }
          if (c.appt && !t.includes(fmt(c.appt))) problems.push('lettera senza data appuntamento');
          if (c.req && !t.includes(fmt(c.req))) problems.push('lettera senza data della richiesta al CUP');
          if (/undefined|NaN|null/.test(t)) problems.push('lettera con testo sospetto');
        }
        await checkScreen('lettera');
        await btn(/Fatto! E adesso/);
      }
      const after = await h1();
      if (after !== 'E adesso?') problems.push(`schermata finale: «${after}»`);
      const t = await page.locator('#reminder').innerText();
      if (!t.includes('SOLLECITO')) problems.push('sollecito mancante');
      await checkScreen('E adesso');
      await btn(/Torna indietro/);
      if (!(await h1()).length) problems.push('Indietro non funziona');
    }
    return problems;
  }

  // ---- modulo 5: esenzione ----
  if (c.mod === 5) {
    await page.goto(`${BASE}esenzione-ticket/index.html`);
    await btn(/Comincia/);
    await btn(AGE[c.ageBand]);
    await btn(STATUS[c.status]);
    if (c.spouse) await page.check('input[name=spouse]');
    await page.fill('#children', String(c.children));
    await btn(/Avanti/);
    if (c.income === null) await page.click('#no-income');
    else { await page.fill('#income', String(c.income)); await btn(/Controlla/); }
    const got = await h1();
    const text = await checkScreen('risultato');
    const found = ['E01', 'E02', 'E03', 'E04'].filter((k) => new RegExp(`(Codice|codice) ${k}\\b`).test(text));
    if (c.exp.codes.length) {
      if (!got.startsWith('Non devi pagare')) problems.push(`atteso esente (${c.exp.codes}), trovato «${got}»`);
      if (found.join() !== c.exp.codes.join()) problems.push(`codici attesi ${c.exp.codes} trovati ${found}`);
    } else if (c.exp.maybe.length) {
      if (!got.startsWith('Dipende dal reddito')) problems.push(`atteso «Dipende dal reddito», trovato «${got}»`);
      if (found.join() !== c.exp.maybe.join()) problems.push(`codici attesi ${c.exp.maybe} trovati ${found}`);
    } else if (!got.startsWith('Per il reddito non c')) problems.push(`atteso «nessuna esenzione», trovato «${got}»`);
    return problems;
  }

  // ---- modulo 6: ricorso ----
  if (c.mod === 6) {
    await page.goto(`${BASE}ricorso-invalidita/index.html`);
    await btn(/Comincia/);
    if (c.path === 'notyet') await btn(/^No, aspetto/);
    else {
      await btn(/^Sì, ce l/);
      await page.fill('#verbaleDate', c.verbale);
      await btn(/Controlla/);
      if (c.expectReqError) {
        if (!(await page.locator('#v-form-error').isVisible())) problems.push('giorno nel futuro accettato');
        return problems;
      }
    }
    const got = await h1();
    if (!got.includes(c.expectH1)) problems.push(`titolo atteso «${c.expectH1}», trovato «${got}»`);
    const text = await checkScreen('risultato');
    if (c.deadline && !text.includes(fmt(c.deadline))) problems.push(`scadenza attesa ${fmt(c.deadline)} non mostrata`);
    if (c.today && !text.includes('Scade oggi')) problems.push('manca «Scade oggi»');
    return problems;
  }

  // ---- modulo 7: assegno di inclusione ----
  if (c.mod === 7) {
    await page.goto(`${BASE}assegno-inclusione/index.html`);
    await btn(/Comincia/);
    await btn(c.household === true ? /^Sì$/ : c.household === false ? /^No, nessuna/ : /^Non lo so/);
    await btn(c.residency === true ? /^Sì$/ : c.residency === false ? /^No$/ : /^Non sono sicuro/);
    if (c.isee === null) await page.click('#no-isee'); else { await page.fill('#isee', String(c.isee)); await btn(/Controlla/); }
    const got = await h1();
    const want = { yes: 'Le condizioni principali ci sono', maybe: 'Forse sì', no: 'Con questi dati non ci sono le condizioni' }[c.exp];
    if (!got.startsWith(want)) problems.push(`atteso «${want}», trovato «${got}»`);
    await checkScreen('risultato');
    return problems;
  }
  // ---- moduli 8 e 9: permesso / piano ----
  if (c.mod === 8 || c.mod === 9) {
    await page.goto(`${BASE}${c.mod === 8 ? 'permesso-soggiorno' : 'piano-terapeutico'}/index.html`);
    await btn(/Comincia/);
    if (c.mod === 9) await btn(c.first ? /^No, devo farlo/ : /^Sì, ce l/);
    if (!c.first) { await page.fill('#expiryDate', c.expiry); await btn(/Controlla/); }
    const got = await h1();
    if (!got.startsWith(c.expectH1)) problems.push(`titolo atteso «${c.expectH1}», trovato «${got}»`);
    const text = await checkScreen('risultato');
    if (c.expiry && !text.includes(fmt(c.expiry))) problems.push('data di scadenza non mostrata');
    if (c.startBy && c.expectH1 === 'Hai tempo' && !text.includes(fmt(c.startBy))) problems.push(`data entro cui cominciare attesa ${fmt(c.startBy)}`);
    return problems;
  }
  // ---- moduli 10 e 11: domiciliare / palliative ----
  if (c.mod === 10 || c.mod === 11) {
    await page.goto(`${BASE}${c.mod === 10 ? 'assistenza-domiciliare' : 'cure-palliative'}/index.html`);
    await btn(/Comincia/);
    await btn(new RegExp(`^${c.p}$`));
    if (c.path === 'none') await btn(c.mod === 10 ? /^Non ho ancora chiesto/ : /come funziona/);
    else if (c.path === 'reduced') await btn(/si è interrotta/);
    else if (c.path === 'pain') await btn(/Il dolore non/);
    else {
      await btn(c.mod === 10 ? /ha mandato la richiesta/ : /ha fatto la richiesta/);
      await page.fill('#requestDate', c.req);
      await btn(/Controlla/);
      if (c.expectReqError) {
        if (!(await page.locator('#req-form-error').isVisible())) problems.push('giorno nel futuro accettato');
        return problems;
      }
    }
    const got = await h1();
    if (!got.startsWith(c.expectH1)) problems.push(`titolo atteso «${c.expectH1}», trovato «${got}»`);
    await checkScreen('risultato');
    if (c.letter) {
      await btn(/Scriviamo (il sollecito|la lettera|la richiesta) insieme|Prepara una richiesta scritta/);
      await page.fill('#f-fullName', 'Maria Rossi');
      await page.check('input[name=isDelegate]'); await page.fill('#f-delegateName', 'Luca Rossi');
      const t = await page.locator('#preview').innerText();
      for (const w of ['Maria Rossi', 'Luca Rossi', `Azienda Sanitaria Provinciale di ${c.p}`]) if (!t.includes(w)) problems.push(`lettera senza «${w}»`);
      if (c.req && !t.includes(fmt(c.req))) problems.push('lettera senza data della richiesta');
      if (/undefined|NaN|null/.test(t)) problems.push('lettera con testo sospetto');
      const mail = await page.locator('#mail-btn').getAttribute('href');
      const urp = c.a.emails.find((e) => /urp/i.test(e)) || c.a.pec || c.a.emails[0] || '';
      if (!mail.startsWith(`mailto:${urp}?`)) problems.push(`email al destinatario sbagliato: ${mail.slice(0, 60)}`);
      if (/percorsoditutela|percorso\.tutela/.test(mail)) problems.push('email alla casella del percorso di tutela (sbagliata per questo modulo)');
      await checkScreen('lettera');
    }
    return problems;
  }

  // ---- moduli 3 e 4 ----
  if (c.mod === 3 || c.mod === 4) {
    await page.goto(BASE + c.m.url);
    await btn(/Comincia/);
    await btn(new RegExp(`^${c.p}$`));
    if (c.mod === 3) {
      await btn(/^La cartella clinica/);
      if (c.path === 'none') await btn(/^No, non ancora/);
      else if (c.path === 'voice') await btn(/solo a voce/);
      else await btn(/^Sì, ho già fatto/);
    } else {
      if (c.path === 'none') await btn(/^Non ho ancora la prescrizione/);
      else if (c.path === 'authorized') await btn(/ha detto sì/);
      else await btn(/^Ho fatto la domanda/);
    }
    if (c.path === 'date') {
      await page.fill('#requestDate', c.req);
      await btn(/Controlla/);
      if (c.expectReqError) {
        if (!(await page.locator('#req-form-error').isVisible())) problems.push('giorno nel futuro accettato');
        return problems;
      }
    }
    const got = await h1();
    if (!got.includes(c.expectH1)) problems.push(`titolo atteso «${c.expectH1}», trovato «${got}»`);
    const text = await checkScreen('risultato');
    if (c.deadline && !text.includes(fmt(c.deadline))) problems.push(`scadenza attesa ${fmt(c.deadline)} non mostrata`);
    if (c.late && !text.includes(`${c.late} ${c.late === 1 ? 'giorno' : 'giorni'} in più`)) problems.push(`giorni di ritardo attesi ${c.late}`);
    if (c.full) {
      await btn(/Scriviamo il sollecito insieme/);
      await page.fill('#f-fullName', 'Maria Rossi');
      await page.check('input[name=isDelegate]');
      await page.fill('#f-delegateName', 'Luca Rossi');
      if (c.mod === 3) { await page.fill('#f-structure', 'Ospedale di prova'); await page.fill('#f-structureEmail', 'prova@example.org'); }
      else await page.fill('#f-device', 'carrozzina di prova');
      const t = await page.locator('#preview').innerText();
      const wants = ['Maria Rossi', 'Luca Rossi', fmt(c.req), fmt(c.deadline), c.mod === 3 ? 'Ospedale di prova' : `Azienda Sanitaria Provinciale di ${c.p}`];
      for (const w of wants) if (!t.includes(w)) problems.push(`sollecito senza «${w}»`);
      if (/undefined|NaN|null/.test(t)) problems.push('sollecito con testo sospetto');
      const mail = await page.locator('#mail-btn').getAttribute('href');
      const to = c.mod === 3 ? 'prova@example.org' : (c.a.pec || '');
      if (!mail.startsWith(`mailto:${to}?`)) problems.push(`email al destinatario sbagliato: ${mail.slice(0, 60)}`);
      await checkScreen('sollecito');
      await btn(/Torna indietro/);
      if (!(await h1()).includes(c.expectH1)) problems.push('Indietro non torna al risultato');
    }
    return problems;
  }

  // ---- modulo 2 ----
  await page.goto(`${BASE}invalidita/index.html`);
  await btn(/Comincia/);
  await btn(new RegExp(`^${c.p}$`));
  await page.fill('#certDate', c.cert);
  await btn(/Avanti/);
  if (c.expectCertError) {
    if (!(await page.locator('#cert-error').isVisible())) problems.push('certificato nel futuro accettato');
    return problems;
  }
  await btn({ oncological: /^Per una persona con un tumore/, minor: /^Per un bambino/, other: /^Per un adulto/ }[c.cat]);
  const regText = await page.locator('main').innerText();
  const saysNew = regText.includes('Questa è già la domanda');
  if (saysNew !== c.isNew) problems.push(`procedura sbagliata: attesa ${c.isNew ? 'nuova' : 'vecchia'}`);
  if (c.isNew) {
    await btn(c.conv ? /^Sì, ho il giorno della visita/ : /^No, non ancora/);
  } else if (c.domanda === null) {
    await btn(/^❌|^No, non ancora/);
  } else {
    await page.fill('#domandaDate', c.domanda);
    await btn(/Sì, l'ho fatta/);
    if (c.expectDomError) {
      if (!(await page.locator('#dom-error').isVisible())) problems.push('domanda prima del certificato accettata');
      return problems;
    }
    await btn(c.conv ? /^Sì, ho il giorno della visita/ : /^No, non ancora/);
  }
  const got = await h1();
  if (!got.includes(c.expectH1)) problems.push(`titolo atteso «${c.expectH1}», trovato «${got}»`);
  const text = await checkScreen('risultato');
  if (c.deadline && !text.includes(fmt(c.deadline))) problems.push(`scadenza attesa ${fmt(c.deadline)} non mostrata`);
  if (c.passed && c.deadline) {
    const late = Math.round((Date.parse(TODAY) - Date.parse(c.deadline)) / 864e5);
    if (c.domanda !== null && !text.includes(`${late} ${late === 1 ? 'giorno' : 'giorni'} in più`)) problems.push(`giorni di ritardo attesi ${late}`);
  }
  if (c.passed && got.startsWith('È tardi')) {
    await btn(/Scriviamo il sollecito insieme/);
    await page.fill('#f-fullName', 'Maria Rossi');
    await page.fill('#f-certNumber', 'CERT123');
    if (!c.isNew) await page.fill('#f-domandaNumber', 'DOM456');
    const t = await page.locator('#preview').innerText();
    const wants = ['Maria Rossi', 'CERT123', fmt(c.cert), fmt(c.deadline), `Direzione provinciale di ${c.p}`];
    if (!c.isNew) wants.push('DOM456', fmt(c.domanda));
    for (const w of wants) if (!t.includes(w)) problems.push(`sollecito senza «${w}»`);
    if (/undefined|NaN|null/.test(t)) problems.push('sollecito con testo sospetto');
    const mail = await page.locator('#mail-btn').getAttribute('href');
    if (!mail.startsWith(`mailto:${c.pr.pec}?`)) problems.push('PEC INPS sbagliata');
    await checkScreen('sollecito');
  }
  return problems;
}

(async () => {
  const browser = await chromium.launch();
  const WORKERS = 6;
  const failures = [];
  const jsErrors = [];
  let done = 0;
  const queue = [...cases];
  await Promise.all(Array.from({ length: WORKERS }, async () => {
    const ctx = await browser.newContext({ ...devices['iPhone SE'] });
    // Finta voce del telefono: registra cosa verrebbe letto.
    await ctx.addInitScript(() => {
      let speaking = false;
      window.__spoken = [];
      window.SpeechSynthesisUtterance = function (text) { this.text = text; };
      Object.defineProperty(window, 'speechSynthesis', { value: {
        get speaking() { return speaking; },
        speak(u) { window.__spoken.push(u.text); speaking = true; },
        cancel() { speaking = false; },
        getVoices() { return []; },
      } });
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => jsErrors.push(e.message));
    while (queue.length) {
      const c = queue.shift();
      let problems;
      try { problems = await runCase(page, c); } catch (e) { problems = [`il percorso si è bloccato: ${e.message.split('\n')[0]}`]; }
      if (problems.length) failures.push({ name: c.name, problems });
      done++;
    }
    await ctx.close();
  }));
  await browser.close();
  console.log(`Oggi: ${TODAY}. Casi provati: ${done}. Con problemi: ${failures.length}. Errori JavaScript: ${jsErrors.length}.`);
  for (const f of failures) console.log(`✗ ${f.name}\n    - ${f.problems.join('\n    - ')}`);
  for (const e of [...new Set(jsErrors)]) console.log(`JS: ${e}`);
  process.exit(failures.length || jsErrors.length ? 1 : 0);
})();
