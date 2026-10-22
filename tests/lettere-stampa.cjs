// Le lettere come arrivano all'ufficio (audit del 22/10/2026, giro 8): 17 lettere dei moduli, in Sicilia,
// con dati lunghi e veri (apostrofi, accenti, PEC, delegato), stampate, copiate e mandate per email.
// Fallisce se trova:
// - stampa col pulsante «Stampa o salva» di più di 2 pagine, con il testo del sito (testata, pulsanti, modulo
//   dei dati) o senza «Spett.le», «Oggetto:», il nome, luogo e data accanto alla firma;
// - stampa dal menu del browser (Ctrl+P) su una schermata con la lettera: più di 2 pagine o con il modulo dei
//   dati personali (anche sul modulo ufficiale dell'ASP di Palermo, dove si stampa solo «Cosa scrivere nel modulo»);
// - sul telefono window.print() non aspetta: la classe che stampa solo la lettera non deve sparire dopo un tempo
//   fisso (si toglie a «afterprint» o quando cambia la schermata), anche per «Stampa la guida»;
// - testo copiato con entità HTML («&#39;», «&amp;»), accenti persi o senza righe vuote;
// - link «Manda per email» oltre 2000 caratteri, senza il testo o senza il nome nell'oggetto;
// - «dott. dott.», «Distretto – Distretto», la PEC scritta nel modulo che non è nella lettera, la firma che non
//   dice chi firma, righe spezzate a mano in mezzo alla frase.
// Usa pdfinfo e pdftotext (poppler-utils) se ci sono; se no conta le pagine nel PDF e legge il testo che il
// browser mostra in stampa.
// Uso:  python3 -m http.server 8080   (in un altro terminale)
//       node tests/lettere-stampa.cjs [http://localhost:8080/]
//       LETTERE_STAMPA_DIR=/tmp/lettere node tests/lettere-stampa.cjs …   (tiene i PDF per guardarli)
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

function loadPlaywright() {
  try { return require('playwright'); } catch { /* prova quello globale */ }
  const root = execSync('npm root -g').toString().trim();
  return require(path.join(root, 'playwright'));
}
const { chromium, devices } = loadPlaywright();

const BASE = process.argv[2] || 'http://localhost:8080/';
// LETTERE_STAMPA_DIR=<cartella>: tiene i PDF per guardarli.
const KEEP = process.env.LETTERE_STAMPA_DIR;
if (KEEP) fs.mkdirSync(KEEP, { recursive: true });
const OUT = KEEP || fs.mkdtempSync(path.join(os.tmpdir(), 'lettere-stampa-'));
const has = (cmd) => { try { execSync(`command -v ${cmd}`, { stdio: 'ignore', shell: '/bin/sh' }); return true; } catch { return false; } };
const POPPLER = has('pdfinfo') && has('pdftotext');
const pad = (n) => String(n).padStart(2, '0');
const now = new Date();
const TODAY = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const add = (iso, n) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };

const P = {
  fullName: "Maria Grazia D'Agostino-Lo Presti", birthPlace: "Sant'Agata di Militello", birthDate: '1948-03-17',
  cf: 'DGSMGR48C57I199X', address: "Via dell'Indipendenza Siciliana 123/B, scala C, interno 14, 90146 Palermo (PA)",
  city: "Sant'Agata Li Battiati", phone: '+39 333 123 4567', email: 'mariagrazia.dagostino.lopresti@example.it',
  pec: 'mg.dagostino@pec.example.it', idDoc: "CA12345AB rilasciata il 10/05/2020 dal Comune di Sant'Agata di Militello",
};
const DELEG = { delegateName: "Giuseppe D'Agostino-Lo Presti", delegateCf: 'DGSGPP75A01G273Z' };
// Testo del sito che non deve finire sul foglio della lettera.
const SITO = /Guida Sanità|Torna indietro|Stampa o salva|Manda per email|Segnala un errore|Nome e cognome|Cambia regione|Dove è nato|Indirizzo di casa|I dati restano/;
// Le etichette del modulo dei dati personali (js/common.js, personFields).
const MODULO = /Dove è nato\/a|Indirizzo di casa|Scrivi per un'altra persona|Numero di telefono/;

const problems = [];
const bad = (n, m) => problems.push(`${n}: ${m}`);

// Pagine e testo di un PDF. Senza poppler: «/Type /Page» nel file e il testo che il browser mostra in stampa.
function pdfInfo(file, printText) {
  if (POPPLER) {
    const pages = Number(execSync(`pdfinfo "${file}"`).toString().match(/^Pages:\s+(\d+)/m)[1]);
    return { pages, text: execSync(`pdftotext -layout "${file}" -`).toString() };
  }
  const bytes = fs.readFileSync(file).toString('latin1');
  return { pages: (bytes.match(/\/Type\s*\/Page(?![s\w])/g) || []).length, text: printText };
}

async function printPdf(page, file) {
  await page.emulateMedia({ media: 'print' });
  const text = await page.evaluate(() => document.body.innerText);
  await page.pdf({ path: file, format: 'A4', preferCSSPageSize: true });
  await page.emulateMedia({ media: 'screen' });
  return pdfInfo(file, text);
}

async function fillPerson(page, delegate = true) {
  for (const [k, v] of Object.entries(P)) if (await page.locator(`#f-${k}`).count()) await page.fill(`#f-${k}`, v);
  if (delegate) {
    await page.check('input[name=isDelegate]');
    for (const [k, v] of Object.entries(DELEG)) await page.fill(`#f-${k}`, v);
  }
}

// La lettera della schermata: stampa col pulsante, Ctrl+P, testo copiato, email.
async function capture(page, n, prefix = '', delegate = true) {
  await page.evaluate(() => {
    window.__copied = null; window.__printed = 0;
    navigator.clipboard.writeText = async (t) => { window.__copied = t; };
    window.print = () => { window.__printed += 1; }; // come sul telefono: non aspetta
  });
  await page.click(`#${prefix}copy-btn`);
  const txt = await page.evaluate(() => window.__copied) || '';
  const mail = await page.locator(`#${prefix}mail-btn`).getAttribute('href');
  const mailHidden = await page.locator(`#${prefix}mail-btn`).isHidden();

  // Stampa col pulsante. Sul telefono la finestra di stampa arriva dopo: la classe deve restare.
  await page.click(`#${prefix}pdf-btn`);
  if (!(await page.evaluate(() => window.__printed))) bad(n, 'il pulsante «Stampa o salva» non chiama la stampa');
  await page.waitForTimeout(1200);
  if (!(await page.evaluate(() => document.body.classList.contains('printing')))) {
    bad(n, 'dopo 1 secondo senza «afterprint» la pagina non stampa più solo la lettera (sul telefono si stampa tutto)');
    await page.evaluate(() => document.body.classList.add('printing'));
  }
  const btn = await printPdf(page, path.join(OUT, `${n}.pdf`));
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  if (await page.evaluate(() => document.body.classList.contains('printing'))) bad(n, 'la classe «printing» resta dopo «afterprint»');

  // Ctrl+P: senza il pulsante (e senza la classe che mette il pulsante).
  await page.evaluate(() => document.body.classList.remove('printing'));
  const ctrlp = await printPdf(page, path.join(OUT, `${n}-ctrlp.pdf`));

  const flat = btn.text.replace(/\s+/g, ' ');
  if (btn.pages > 2) bad(n, `stampa di ${btn.pages} pagine`);
  if (SITO.test(btn.text)) bad(n, `nella stampa c'è il sito: «${btn.text.match(SITO)[0]}»`);
  for (const w of ['Spett.le', 'Oggetto:', 'Firma', P.fullName]) if (!flat.includes(w)) bad(n, `stampa senza «${w}»`);
  if (!/\d{2}\/\d{2}\/\d{4}\s+Firma/.test(btn.text)) bad(n, 'luogo e data non accanto alla firma');
  if (ctrlp.pages > 2) bad(n, `Ctrl+P stampa ${ctrlp.pages} pagine (la pagina intera)`);
  if (MODULO.test(ctrlp.text) || /Guida Sanità/.test(ctrlp.text)) bad(n, `Ctrl+P stampa il modulo con i dati o il sito («${(ctrlp.text.match(MODULO) || ctrlp.text.match(/Guida Sanità/))[0]}»)`);
  if (!ctrlp.text.replace(/\s+/g, ' ').includes('Oggetto:')) bad(n, 'Ctrl+P non stampa la lettera');

  if (/&(#\d+|#x[0-9a-f]+|amp|quot|lt|gt|apos|nbsp);/i.test(txt)) bad(n, 'entità HTML nel testo copiato');
  if (!txt.includes(P.fullName) || !/[àèéòùì]/.test(txt)) bad(n, 'apostrofi o accenti persi nel testo copiato');
  if (/\r/.test(txt) || !/\n\n/.test(txt)) bad(n, 'a capo non conservati nel testo copiato');
  if (!mail) bad(n, 'manca il link «Manda per email»');
  else {
    const q = new URL(mail.replace(/^mailto:[^?]*/, 'http://x/')).searchParams;
    if (mail.length > 2000) bad(n, `mailto di ${mail.length} caratteri (oltre 2000)`);
    if (!mailHidden && !q.get('body')) bad(n, 'mailto senza testo');
    if (!(q.get('subject') || '').includes(P.fullName)) bad(n, `oggetto dell'email senza il nome: «${q.get('subject')}»`);
  }

  if (/\b(dott|dr)\.(ssa)?\s+(dott|dr)\b/i.test(txt)) bad(n, `titolo ripetuto «${txt.match(/\b(dott|dr)\.(ssa)?\s+(dott|dr)\.?(ssa)?/i)[0]}»`);
  if (/Distretto – Distretto/i.test(txt)) bad(n, 'destinatario «Distretto – Distretto»');
  if (!txt.includes(P.pec)) bad(n, 'la PEC scritta nel modulo non è nella lettera');
  const firma = txt.slice(txt.lastIndexOf('Firma'));
  if (delegate) {
    if (!new RegExp(`Firma di ${DELEG.delegateName} \\((delegato/a|genitore|tutore|amministratore di sostegno)\\)`).test(firma)) bad(n, `scrive un delegato ma la firma non dice chi firma: «${firma.trim().slice(0, 80)}»`);
  } else if (!firma.includes(P.fullName)) bad(n, `la firma non dice chi firma: «${firma.trim().slice(0, 80)}»`);
  // Righe spezzate a mano: una riga lunga che non finisce la frase, seguita da una riga che la continua.
  // Solo dal testo dopo l'intestazione: lì «e p.c.» o l'indirizzo vanno a capo apposta.
  const lines = txt.slice(Math.max(0, txt.indexOf('Oggetto:'))).split('\n');
  const ragged = lines.filter((l, i) => l.length > 60 && i + 1 < lines.length && /^\s*[a-zà-ù(]/.test(lines[i + 1]) && !/[;:.]$/.test(l.trim()));
  const indent = lines.filter((l) => /^ {2}\S/.test(l));
  if (ragged.length) bad(n, `${ragged.length} righe spezzate a mano in mezzo alla frase, es. «…${ragged[0].slice(-40)}»`);
  if (indent.length) bad(n, `${indent.length} righe che continuano la frase con il rientro, es. «${indent[0].trim().slice(0, 40)}…»`);
}

async function main() {
  const browser = await chromium.launch();
  let count = 0;
  const run = async (name, fn, device) => {
    const ctx = await browser.newContext(device || { viewport: { width: 1000, height: 900 } });
    await ctx.addInitScript(() => { try { localStorage.setItem('gs-regione', 'sicilia'); } catch (e) { /* niente */ } });
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);
    page.on('pageerror', (e) => bad(name, `errore JavaScript: ${e.message}`));
    try { await fn(page); } catch (e) { bad(name, `percorso interrotto: ${e.message.split('\n')[0]}`); }
    await ctx.close();
  };
  const btn = (page, n) => page.getByRole('button', { name: n }).first().click();
  const start = (page) => page.locator('main button.btn.primary.big[data-go]').first().click();
  const lettera = async (page, n, prefix, delegate) => { count += 1; await capture(page, n, prefix, delegate); };

  // Liste d'attesa: lettera (Catania, Siracusa) o modulo ufficiale (Palermo), poi il sollecito.
  for (const prov of ['Catania', 'Siracusa', 'Palermo']) {
    await run(`tutela-${prov}`, async (page) => {
      await page.goto(`${BASE}liste-attesa/`); await start(page);
      await btn(page, new RegExp(`^${prov}$`)); await btn(page, /^Sì, è la prima volta/);
      await btn(page, /^Lettera B/); await btn(page, /^Mi ha dato una data/); await btn(page, /^Sì$/);
      const b = add(TODAY, -2); await page.fill('#bookingDate', b); await page.fill('#appointmentDate', add(b, 60)); await btn(page, /Controlla/);
      await btn(page, /Ti aiutiamo a compilare il modulo|Scriviamo la lettera insieme/);
      await fillPerson(page);
      await page.fill('#f-service', 'Visita cardiologica con elettrocardiogramma ed ecocardiogramma color-doppler');
      await page.fill('#f-nre', '190A01234567890'); await page.fill('#f-prescriptionDate', add(TODAY, -5));
      if (await page.locator('#copy-btn').count()) await lettera(page, `tutela-${prov}`);
      else {
        // Modulo ufficiale dell'ASP: si stampa solo la tabella «Cosa scrivere nel modulo».
        const n = `tutela-${prov}-modulo`;
        if (!(await page.locator('#pdf-btn').count())) bad(n, 'manca il pulsante per stampare «Cosa scrivere nel modulo»');
        else {
          await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed += 1; }; });
          await page.click('#pdf-btn');
          if (!(await page.evaluate(() => window.__printed))) bad(n, 'il pulsante di stampa non chiama la stampa');
          await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
        }
        const c = await printPdf(page, path.join(OUT, `${n}-ctrlp.pdf`));
        if (c.pages > 2) bad(n, `Ctrl+P stampa ${c.pages} pagine`);
        if (MODULO.test(c.text)) bad(n, `Ctrl+P stampa il modulo con i dati («${c.text.match(MODULO)[0]}»)`);
        if (!c.text.includes(P.cf)) bad(n, 'Ctrl+P non stampa la tabella «Cosa scrivere nel modulo»');
      }
      await btn(page, /Fatto! E adesso/);
      await page.fill('#firstRequestDate', add(TODAY, -12)); await page.dispatchEvent('#firstRequestDate', 'change');
      await page.fill('#f-reqProtocol', 'ASP/2026/0123456');
      await lettera(page, `sollecito-tutela-${prov}`, 'r');
    });
  }
  // Invalidità: sollecito all'INPS.
  for (const prov of ['Palermo', 'Messina']) {
    await run(`inps-${prov}`, async (page) => {
      await page.goto(`${BASE}invalidita/`); await start(page);
      await btn(page, new RegExp(`^${prov}$`)); await page.fill('#certDate', add(TODAY, -200)); await btn(page, /Avanti/);
      await btn(page, /^Per un adulto/);
      if (await page.locator('#domandaDate').count()) { await page.fill('#domandaDate', add(TODAY, -195)); await btn(page, /Sì, l'ho fatta/); }
      await btn(page, /^No, non ancora/);
      await btn(page, /Scriviamo il sollecito insieme/);
      await fillPerson(page);
      await page.fill('#f-certNumber', 'A1B2C3D4E5F6G7H8');
      if (await page.locator('#f-domandaNumber').count()) await page.fill('#f-domandaNumber', '2026-INV-0098765');
      await lettera(page, `inps-${prov}`);
    });
  }
  for (const prov of ['Palermo', 'Messina']) {
    await run(`cartella-${prov}`, async (page) => {
      await page.goto(`${BASE}cartella-clinica/`); await start(page);
      await btn(page, new RegExp(`^${prov}$`)); await btn(page, /^La cartella clinica/); await btn(page, /^Sì, ho già fatto/);
      await page.fill('#requestDate', add(TODAY, -30)); await btn(page, /Controlla/);
      await btn(page, /Scriviamo il sollecito insieme/);
      await fillPerson(page);
      await page.fill('#f-structure', 'Azienda Ospedaliera Ospedali Riuniti Villa Sofia-Cervello – Direzione Sanitaria');
      await page.fill('#f-structureEmail', 'direzionesanitaria@pec.example.it');
      await page.fill('#f-episode', "ricovero dal 03/02/2026 al 15/02/2026 presso l'U.O.C. di Cardiologia con UTIC");
      await page.fill('#f-protocol', 'PROT-2026-000456');
      await lettera(page, `cartella-${prov}`);
    });
    await run(`ausili-${prov}`, async (page) => {
      await page.goto(`${BASE}ausili/`); await start(page);
      await btn(page, new RegExp(`^${prov}$`)); await btn(page, /^Ho fatto la domanda/);
      await page.fill('#requestDate', add(TODAY, -45)); await btn(page, /Controlla/);
      await btn(page, /Scriviamo il sollecito insieme/);
      await fillPerson(page);
      await page.fill('#f-device', 'carrozzina elettronica con comandi personalizzati e sistema di postura');
      await page.fill('#f-prescriber', "dott.ssa Anna Maria Dell'Utri, fisiatra");
      await page.fill('#f-protocol', 'PROT-2026-000789');
      await lettera(page, `ausili-${prov}`);
    });
    await run(`domiciliare-${prov}`, async (page) => {
      await page.goto(`${BASE}assistenza-domiciliare/`); await start(page);
      await btn(page, new RegExp(`^${prov}$`)); await btn(page, /ha mandato la richiesta/);
      await page.fill('#requestDate', add(TODAY, -40)); await btn(page, /Controlla/);
      await btn(page, /Scriviamo il sollecito insieme/);
      await fillPerson(page);
      // Come suggerisce il modulo («Per esempio "Distretto di Bagheria"») e con il titolo già scritto.
      await page.fill('#f-district', 'Distretto sanitario n. 42 di Palermo – PUA');
      await page.fill('#f-doctor', "dott. Salvatore Dell'Aria");
      await lettera(page, `domiciliare-${prov}`);
    });
    await run(`palliative-${prov}`, async (page) => {
      await page.goto(`${BASE}cure-palliative/`); await start(page);
      await btn(page, new RegExp(`^${prov}$`)); await btn(page, /ha fatto la richiesta/);
      await page.fill('#requestDate', add(TODAY, -8)); await btn(page, /Controlla/);
      await btn(page, /Scriviamo la richiesta insieme/);
      await fillPerson(page);
      await page.fill('#f-doctor', "Dr. Salvatore Dell'Aria");
      await lettera(page, `palliative-${prov}`);
    });
    await run(`medico-${prov}`, async (page) => {
      await page.goto(`${BASE}medico-famiglia/`); await start(page);
      await btn(page, new RegExp(`^${prov}$`)); await btn(page, /sotto i 6 anni/); await btn(page, /Non trovo nessuno/);
      await btn(page, /Scriviamo la lettera insieme/);
      await fillPerson(page, false);
      await page.fill('#f-comune', "Sant'Agata Li Battiati");
      if (await page.locator('#f-child').count()) { await page.fill('#f-child', "Francesco D'Agostino-Lo Presti"); await page.fill('#f-childCf', 'DGSFNC24A01G273K'); }
      await lettera(page, `medico-${prov}`, '', false);
    });
  }

  // «Stampa la guida» su un telefono: window.print() non aspetta, la classe deve restare fino a «afterprint».
  await run('stampa-la-guida', async (page) => {
    await page.goto(`${BASE}liste-attesa/`);
    const b = page.locator('button[data-action="print-page"][data-print="guida"]');
    if (!(await b.count())) { bad('stampa-la-guida', 'manca il pulsante «Stampa la guida»'); return; }
    await page.evaluate(() => { window.print = () => {}; });
    await b.first().click();
    await page.waitForTimeout(1200);
    if (!(await page.evaluate(() => document.body.classList.contains('printing-guide')))) bad('stampa-la-guida', 'dopo 1 secondo senza «afterprint» si stampa tutta la pagina');
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    if (await page.evaluate(() => document.body.classList.contains('printing-guide'))) bad('stampa-la-guida', 'la classe resta dopo «afterprint»');
  }, devices['Pixel 5']);

  await browser.close();
  if (!KEEP) fs.rmSync(OUT, { recursive: true, force: true });
  if (count < 17) bad('lettere', `prodotte ${count} lettere su 17`);
  console.log(`${count} lettere controllate (${POPPLER ? 'pdfinfo/pdftotext' : 'senza poppler: pagine dal PDF, testo dal browser'})`);
  if (problems.length) {
    console.log(`${problems.length} problemi:\n${problems.join('\n')}`);
    process.exit(1);
  }
  console.log('0 problemi');
}
main().catch((e) => { console.error(e); process.exit(1); });
