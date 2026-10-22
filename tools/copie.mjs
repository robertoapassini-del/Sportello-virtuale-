// Salva una copia in testo semplice delle pagine ufficiali elencate nei dati regionali
// (data/regioni/<regione>/asl.json, in Sicilia asp.json: site_url, info_url, form_url, portal_url,
// guardia_medica_url, pua_url, scelta_medico.url, url di phones, contacts e pagine; in cima al file gli url di
// regole_fonti, nella cartella «regole»; data/regioni/<regione>/inps.json: la pagina di ogni sede INPS, sources e
// pagine, nella cartella «inps-<regione>») e nei numeri nazionali (data/numeri.json: url dei numeri, nella cartella
// «nazionali»). Legge anche data/regioni/<regione>/fonti.json, se c'è, per ogni regione, attiva o no:
// stessa forma ({ asl: [{ id, site_url, pagine: [{ tipo, url }] }] }), solo gli indirizzi da copiare,
// così i numeri della regione nuova si scrivono leggendo le copie (docs/regola-numeri.md, proof «pagina»).
// Regola semplice: si copia ogni url scritto nei file della regione. Le cartelle delle aziende che non sono più in
// nessun file si cancellano (docs/regioni.md, sezione 8). Serve al controllo periodico dei numeri (docs/regioni.md, «Aggiornamento assistito»):
// gira ogni notte su un server in Italia, perché molti siti delle ASL non rispondono dall'estero,
// e carica le copie nel branch «copie-siti». Claude poi le confronta con i dati e propone le modifiche.
//
// Regole di buona educazione (sono siti pubblici, non vogliamo pesare): una richiesta alla volta,
// una pausa tra una pagina e l'altra, ci presentiamo con nome e sito nel User-Agent, mai pagine con
// login o CAPTCHA, mai i portali di prenotazione (CUP).
//
// Pagine fatte con JavaScript: se il testo scaricato è quasi vuoto, la pagina si riapre in un browser
// vero (Chromium con Playwright, se è installato sul server) e si salva il testo che compare. Le pagine
// che mostrano un CAPTCHA o un controllo anti-robot non si copiano: si segnano e basta.
// Email nascoste ai robot (Cloudflare, Joomla): si rimettono in chiaro prima di fare il testo (tools/email-nascoste.mjs).
// PDF (moduli, allegati delle delibere): se sul server c'è pdftotext (pacchetto poppler-utils), si scaricano fino a
// 5 MB e si salva il testo come per una pagina («"pdf": true» nell'indice). Senza pdftotext si segnano e basta.
//
// Uso: node tools/copie.mjs [cartella di destinazione]   (default: ../copie accanto al sito)
// Per le prove (tests/copie-giro.test.mjs): COPIE_SITO=<cartella con data/> legge i dati da lì, COPIE_PAUSA_MS cambia
// la pausa, COPIE_SENZA_BROWSER=1 e COPIE_SENZA_PDF=1 fanno come se Playwright o pdftotext non ci fossero.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { svelaEmail } from './email-nascoste.mjs';

const SITE = path.resolve(process.env.COPIE_SITO || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const OUT = path.resolve(process.argv[2] || path.join(SITE, '..', 'copie'));
const UA = 'Mozilla/5.0 (compatible; GuidaSanita-controllo/1.0; +https://guidasanita.it/fonti.html; info@guidasanita.it)';
const PAUSA_MS = process.env.COPIE_PAUSA_MS ? +process.env.COPIE_PAUSA_MS : 1500;
const SKIP = /\.(pdf|docx?|xlsx?|odt|zip)(\?|$)/i; // file da scaricare: ne registriamo solo che esistono
const PDF = /\.pdf(\?|$)/i; // …tranne i PDF, se c'è pdftotext
const MAX_PDF = 5 * 1024 * 1024;
const comando = (cmd, args) => { try { execFileSync(cmd, args, { stdio: 'ignore' }); return true; } catch { return false; } };
const CON_PDF = !process.env.COPIE_SENZA_PDF && comando('pdftotext', ['-v']);

const read = (f) => JSON.parse(fs.readFileSync(path.join(SITE, f), 'utf8'));
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// HTML → testo leggibile: via script, stili e tag; a capo per i blocchi; entità più comuni.
function toText(html) {
  return html
    .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/tr|\/h[1-6]|\/td|\/th|\/dt|\/dd|\/section|\/article)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/[ \t\r\f\v]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

// Scarica con curl (segue i redirect, tempo massimo 30 s). Se il certificato del sito è installato
// male (succede, es. ASP Messina) riprova senza controllarlo e lo segna: il contenuto è lo stesso.
// I PDF hanno un limite di grandezza (MAX_PDF): oltre, curl si ferma (codice 63).
function scarica(url, maxByte) {
  const tmp = path.join(OUT, '.tmp.scaricata');
  const args = ['-sS', '-L', '--max-time', maxByte ? '60' : '30', ...(maxByte ? ['--max-filesize', String(maxByte)] : []),
    '-A', UA, '-o', tmp, '-w', '%{http_code}\t%{content_type}\t%{url_effective}', url];
  const run = (extra) => {
    try {
      const w = execFileSync('curl', [...extra, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      const [http, type, finale] = w.trim().split('\t');
      const buf = fs.existsSync(tmp) ? fs.readFileSync(tmp) : Buffer.alloc(0);
      return { http: +http, type, finale, buf, body: buf.toString('utf8') };
    } catch (e) {
      const errore = e.status === 63 ? `file più grande di ${Math.round(maxByte / 1048576)} MB: non copiato` : (e.stderr || e.message || '').toString().trim().split('\n')[0];
      return { http: 0, errore, curl: e.status };
    } finally { if (fs.existsSync(tmp)) fs.rmSync(tmp); }
  };
  let r = run([]);
  if (r.curl === 60) { r = run(['-k']); r.certificato = 'non valido'; }
  return r;
}

// Browser vero per le pagine fatte con JavaScript. Playwright è facoltativo: locale (npm i playwright
// nella cartella del sito) o globale (npm i -g playwright); senza, le pagine restano quelle scaricate.
const VUOTA = (testo) => testo.length < 500 || /enable javascript|attiva(re)? (il )?javascript|abilita(re)? (il )?javascript|^loading\.{3}/im.test(testo);
const ANTIROBOT = /captcha|radware|verify you are human|are you a robot|sei un robot|access denied|attention required/i;
let browser; let senzaBrowser = !!process.env.COPIE_SENZA_BROWSER;
async function apriBrowser() {
  if (browser || senzaBrowser) return browser;
  const req = createRequire(import.meta.url);
  let pw;
  try { pw = req('playwright'); } catch {
    try { pw = req(path.join(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim(), 'playwright')); } catch { senzaBrowser = true; return null; }
  }
  browser = await pw.chromium.launch();
  return browser;
}
async function rendi(url) {
  const b = await apriBrowser();
  if (!b) return null;
  const page = await b.newPage({ userAgent: UA });
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    return { http: resp ? resp.status() : 0, type: 'text/html', finale: page.url(), body: await page.content() };
  } catch (e) {
    return { http: 0, errore: String(e.message || e).split('\n')[0] };
  } finally { await page.close(); }
}

// Testo di un PDF con pdftotext (-layout: le righe delle tabelle restano insieme, numero accanto all'ufficio).
// Il titolo è quello del file (pdfinfo), se no la prima riga. Un PDF fatto di sole immagini (scansione) non ha testo.
const seiPdf = (r) => !!r.buf && r.buf.subarray(0, 5).toString('latin1') === '%PDF-';
function testoPdf(buf) {
  const tmp = path.join(OUT, '.tmp.pdf');
  fs.writeFileSync(tmp, buf);
  try {
    const t = execFileSync('pdftotext', ['-layout', '-enc', 'UTF-8', '-q', tmp, '-'], { encoding: 'utf8', timeout: 60000, maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] })
      .replace(/\f/g, '\n').replace(/[ \t\r\v]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    let titolo = '';
    try {
      const info = execFileSync('pdfinfo', ['-enc', 'UTF-8', tmp], { encoding: 'utf8', timeout: 30000, stdio: ['ignore', 'pipe', 'ignore'] });
      titolo = ((info.match(/^Title:\s*(.*)$/m) || [])[1] || '').trim();
    } catch { /* senza pdfinfo: la prima riga */ }
    return { testo: t, titolo: titolo || (t.split('\n').find((r) => r.trim()) || '').slice(0, 150) };
  } catch (e) {
    return { testo: '', titolo: '', errore: `pdftotext: ${String(e.message || e).split('\n')[0]}` };
  } finally { fs.rmSync(tmp, { force: true }); }
}

// Regioni in preparazione: dalla homepage di ogni azienda si seguono anche i link dello stesso sito
// che parlano di contatti e servizi, così il server trova da solo le pagine giuste. Mai login,
// area riservata o prenotazione online; al massimo MAX_SCOPERTE pagine in più per sito.
const PAROLE = /contatt|urp|relazioni.con.il.pubblico|cup|prenota|guardia.medica|continuit|116.?117|pua|punto.unico|domiciliar|adi\b|numeri.utili|centralino/i;
const VIETATE = /login|accedi|area.riservata|registrazione|prenota.?online|carrello|\.(pdf|docx?|xlsx?|zip|jpe?g|png)(\?|$)/i;
const MAX_SCOPERTE = 15;
function scopri(html, base) {
  const host = (u) => u.hostname.replace(/^www\./, '');
  const da = new URL(base);
  const trovati = new Set();
  for (const [, href, testo] of html.matchAll(/<a\b[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    let u;
    try { u = new URL(href.replace(/&amp;/g, '&'), base); } catch { continue; }
    if (!/^https?:$/.test(u.protocol) || host(u) !== host(da) || VIETATE.test(u.href)) continue;
    if (PAROLE.test(u.pathname) || PAROLE.test(toText(testo))) trovati.add(u.href);
    if (trovati.size >= MAX_SCOPERTE) break;
  }
  return [...trovati];
}

const regioni = read('data/regioni/index.json');
let totale = 0; let ok = 0; let cambiate = 0; const problemi = []; const cartelleTolte = [];

// I file di una regione. Attiva: le aziende sanitarie (asl.json) e le sedi INPS (inps.json). Sempre, anche
// dopo l'attivazione: fonti.json, se c'è (le pagine trovate prima di scrivere i dati restano aggiornate).
const fileDati = (reg, tipo) => `data/regioni/${reg.id}/${(reg.files && reg.files[tipo]) || tipo}.json`;
const esiste = (f) => fs.existsSync(path.join(SITE, f));
const urlDi = (x) => (typeof x === 'string' ? x : x && x.url);

// Le regole regionali in cima ad asl.json hanno le loro fonti (regole_fonti: { campo: { url, proof } }):
// sono un'azienda in più, «regole».
const regoleRegione = (dati) => {
  const urls = Object.values(dati.regole_fonti || {}).flatMap((v) => (Array.isArray(v) ? v : [v])).map(urlDi).filter(Boolean);
  return urls.length ? [{ id: 'regole', pagine: [...new Set(urls)].map((url) => ({ url })) }] : [];
};
// Le sedi INPS di una regione attiva (inps.json), come un'azienda in più: tools/confronta-copie.mjs controlla
// pec, indirizzo e orari sulla pagina della sede. Con le pagine delle sedi anche le fonti del file (sources) e
// le pagine da copiare (pagine, in cima al file o in una sede): sono le prove di «regime» e «regime_since».
// Stesso id «inps-<regione>» di fonti.json.
const sediInps = (reg) => {
  const f = fileDati(reg, 'inps');
  if (!reg.attiva || !esiste(f)) return [];
  const j = read(f);
  const urls = [
    ...(j.provinces || []).flatMap((p) => [p.url, ...(p.pagine || []).map(urlDi)]),
    ...(j.pagine || []).map(urlDi), ...(j.sources || []).map(urlDi),
  ].filter(Boolean);
  return urls.length ? [{ id: `inps-${reg.id}`, pagine: [...new Set(urls)].map((url) => ({ url })) }] : [];
};
// Tutte le aziende da copiare di una regione. «fonti: true»: viene da fonti.json.
const aziendeRegione = (reg) => {
  const lista = [];
  if (reg.attiva && esiste(fileDati(reg, 'asl'))) {
    const dati = read(fileDati(reg, 'asl'));
    lista.push(...(dati.asl || []), ...regoleRegione(dati));
  }
  lista.push(...sediInps(reg));
  const fonti = `data/regioni/${reg.id}/fonti.json`;
  if (esiste(fonti)) lista.push(...(read(fonti).asl || []).map((a) => ({ ...a, fonti: true })));
  return lista;
};
// I numeri nazionali (data/numeri.json): un gruppo per sezione della pagina Numeri utili.
const nazionali = () => ({
  asl: read('data/numeri.json').groups.map((g) => ({ id: g.id, pagine: (g.items || []).filter((n) => n.url).map((n) => ({ url: n.url })) })).filter((g) => g.pagine.length),
});

const daCopiare = regioni.regioni.map((reg) => ({ reg, asl: { asl: aziendeRegione(reg) } })).filter((x) => x.asl.asl.length);
daCopiare.push({ reg: { id: 'nazionali', attiva: true }, asl: nazionali() });

// Il testo da salvare di una risposta: pagina HTML (con le email nascoste in chiaro) o PDF. null se non è né l'una né l'altro.
function testoRisposta(r) {
  if (seiPdf(r)) return CON_PDF ? { ...testoPdf(r.buf), pdf: true } : null;
  if (!/html/i.test(r.type || '')) return null;
  const { html, trovate } = svelaEmail(r.body);
  const titolo = toText((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ''])[1]).replace(/\s+/g, ' ').trim();
  return { testo: toText(html), titolo, email: trovate || undefined };
}

for (const { reg, asl } of daCopiare) {
  const dir = path.join(OUT, reg.id);
  fs.mkdirSync(dir, { recursive: true });
  const indiceFile = path.join(dir, 'indice.json');
  const prima = fs.existsSync(indiceFile) ? JSON.parse(fs.readFileSync(indiceFile, 'utf8')).pagine : [];
  const primaPerUrl = new Map(prima.map((p) => [p.url, p]));
  const pagine = [];
  const giaCopiati = new Set(); // url già copiati in questa regione: quelli di fonti.json non si riscaricano

  for (const a of asl.asl) {
    const urls = new Set();
    for (const k of ['site_url', 'info_url', 'form_url', 'portal_url', 'guardia_medica_url', 'pua_url']) if (a[k]) urls.add(a[k]);
    if (a.scelta_medico && a.scelta_medico.url) urls.add(a.scelta_medico.url);
    for (const c of [...(a.phones || []), ...(a.contacts || []), ...(a.pagine || [])]) if (c.url) urls.add(c.url);
    fs.mkdirSync(path.join(dir, a.id), { recursive: true });
    for (const url of urls) {
      if (a.fonti && giaCopiati.has(url)) continue;
      giaCopiati.add(url);
      totale++;
      const voce = { asl: a.id, url, controllata: new Date().toISOString().slice(0, 10) };
      if (SKIP.test(url) && !(CON_PDF && PDF.test(url))) { voce.nota = 'file, non controllato'; pagine.push(voce); continue; }
      let r = scarica(url, PDF.test(url) ? MAX_PDF : undefined);
      if (r.http === 200 && /html/i.test(r.type || '') && VUOTA(toText(r.body)) && !ANTIROBOT.test(r.body)) {
        const rb = await rendi(url);
        if (rb && rb.http === 200 && toText(rb.body).length > toText(r.body).length) { r = rb; voce.browser = true; }
      }
      if (!seiPdf(r) && ANTIROBOT.test(toText(r.body || '')) && VUOTA(toText(r.body || ''))) {
        voce.http = r.http; voce.nota = 'controllo anti-robot (CAPTCHA): non copiata';
        problemi.push(`${reg.id}/${a.id}: CAPTCHA ${url}`);
        pagine.push(voce); await sleep(PAUSA_MS); continue;
      }
      Object.assign(voce, { http: r.http, finale: r.finale && r.finale !== url ? r.finale : undefined, certificato: r.certificato, errore: r.errore });
      const t = r.http === 200 ? testoRisposta(r) : null;
      if (t && t.pdf && !t.testo) {
        voce.pdf = true; voce.nota = t.errore || 'PDF senza testo (forse una scansione): non copiato';
        problemi.push(`${reg.id}/${a.id}: ${voce.nota} ${url}`);
      } else if (t) {
        if (!reg.attiva && !t.pdf && url === a.site_url) for (const u of scopri(r.body, r.finale || url)) urls.add(u);
        const { testo, titolo } = t;
        const nome = `${a.id}/${sha(url).slice(0, 12)}.txt`;
        fs.writeFileSync(path.join(dir, nome), `${url}\n${titolo}\n\n${testo}\n`);
        voce.file = nome; voce.titolo = titolo; voce.sha = sha(testo); voce.caratteri = testo.length;
        if (t.pdf) voce.pdf = true;
        if (t.email) voce.email_nascoste = t.email;
        const p = primaPerUrl.get(url);
        voce.cambiata = !p || p.sha !== voce.sha;
        if (p && p.sha !== voce.sha) cambiate++;
        ok++;
      } else if (r.http === 200 && (seiPdf(r) || SKIP.test(r.finale || url))) {
        voce.nota = 'file, non controllato'; // un file (anche un PDF dietro un indirizzo senza «.pdf») senza pdftotext
      } else {
        problemi.push(`${reg.id}/${a.id}: ${r.http || r.errore} ${url}`);
      }
      pagine.push(voce);
      await sleep(PAUSA_MS);
    }
  }
  // Via i file di pagine che non sono più nei dati.
  const validi = new Set(pagine.filter((p) => p.file).map((p) => p.file));
  for (const a of asl.asl) for (const f of fs.readdirSync(path.join(dir, a.id))) if (!validi.has(`${a.id}/${f}`)) fs.rmSync(path.join(dir, a.id, f));
  // Via le cartelle delle aziende che non sono più in nessun file della regione (per esempio un'azienda tolta da
  // fonti.json). Solo cartelle, mai indice.json; mai la cartella di un'azienda che è ancora nei dati.
  const vive = new Set(asl.asl.map((a) => a.id));
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!d.isDirectory() || vive.has(d.name)) continue;
    fs.rmSync(path.join(dir, d.name), { recursive: true, force: true });
    cartelleTolte.push(`${reg.id}/${d.name}`);
  }
  fs.writeFileSync(indiceFile, `${JSON.stringify({ regione: reg.id, aggiornato: new Date().toISOString(), pagine }, null, 1)}\n`);
}

if (browser) await browser.close();
if (senzaBrowser) console.log('Playwright non installato: le pagine fatte con JavaScript sono rimaste quasi vuote.');
if (!CON_PDF) console.log('pdftotext non installato (sudo apt-get install -y poppler-utils): i PDF non sono stati copiati.');
if (cartelleTolte.length) console.log(`Cartelle di aziende che non sono più nei dati, tolte: ${cartelleTolte.join(', ')}`);
console.log(`${ok} pagine salvate su ${totale} (${cambiate} cambiate dall'ultima volta). Problemi: ${problemi.length}`);
for (const p of problemi) console.log('  ', p);
