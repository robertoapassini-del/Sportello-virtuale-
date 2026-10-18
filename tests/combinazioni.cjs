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
    return text;
  };

  if (c.mod === 1) {
    await page.goto(`${BASE}liste-attesa/index.html`);
    await btn(/Comincia/);
    await btn(new RegExp(`^${c.p}$`));
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
