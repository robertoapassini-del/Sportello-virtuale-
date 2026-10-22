// Salva una copia in testo semplice delle pagine ufficiali elencate nei dati regionali
// (data/regioni/<regione>/asp.json: site_url, info_url, portal_url, guardia_medica_url, pua_url,
// url dei contatti; data/regioni/<regione>/inps.json: la pagina di ogni sede INPS, nella cartella «inps-<regione>»)
// e nei numeri nazionali (data/numeri.json: url dei numeri, nella cartella «nazionali»). Per una regione non ancora attiva legge data/regioni/<regione>/fonti.json:
// stessa forma ({ asl: [{ id, site_url, pagine: [{ tipo, url }] }] }), solo gli indirizzi da copiare,
// così i numeri della regione nuova si scrivono leggendo le copie (docs/regola-numeri.md, proof «pagina»). Serve al controllo periodico dei numeri (docs/regioni.md, «Aggiornamento assistito»):
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
//
// Uso: node tools/copie.mjs [cartella di destinazione]   (default: ../copie accanto al sito)
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.argv[2] || path.join(SITE, '..', 'copie'));
const UA = 'Mozilla/5.0 (compatible; GuidaSanita-controllo/1.0; +https://guidasanita.it/fonti.html; info@guidasanita.it)';
const PAUSA_MS = 1500;
const SKIP = /\.(pdf|docx?|xlsx?|odt|zip)(\?|$)/i; // file da scaricare: ne registriamo solo che esistono

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
    .replace(/[ \t\r\f\v]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

// Scarica con curl (segue i redirect, tempo massimo 30 s). Se il certificato del sito è installato
// male (succede, es. ASP Messina) riprova senza controllarlo e lo segna: il contenuto è lo stesso.
function scarica(url) {
  const tmp = path.join(OUT, '.tmp.html');
  const args = ['-sS', '-L', '--max-time', '30', '-A', UA, '-o', tmp, '-w', '%{http_code}\t%{content_type}\t%{url_effective}', url];
  const run = (extra) => {
    try {
      const w = execFileSync('curl', [...extra, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      const [http, type, finale] = w.trim().split('\t');
      return { http: +http, type, finale, body: fs.existsSync(tmp) ? fs.readFileSync(tmp, 'utf8') : '' };
    } catch (e) {
      return { http: 0, errore: (e.stderr || e.message || '').toString().trim().split('\n')[0], curl: e.status };
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
let browser; let senzaBrowser = false;
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
let totale = 0; let ok = 0; let cambiate = 0; const problemi = [];

// Regioni attive: il file delle aziende sanitarie. Regioni in preparazione: fonti.json, se c'è.
const fileAsl = (reg) => (reg.attiva
  ? `data/regioni/${reg.id}/${(reg.files && reg.files.asl) || 'asl'}.json`
  : `data/regioni/${reg.id}/fonti.json`);

// Le sedi INPS di una regione attiva (inps.json), come un'azienda in più: tools/confronta-copie.mjs controlla
// pec, indirizzo e orari sulla pagina della sede. Stesso id «inps-<regione>» delle regioni in preparazione.
const sediInps = (reg) => {
  const f = `data/regioni/${reg.id}/${(reg.files && reg.files.inps) || 'inps'}.json`;
  if (!reg.attiva || !fs.existsSync(path.join(SITE, f))) return [];
  const pagine = (read(f).provinces || []).filter((p) => p.url).map((p) => ({ url: p.url }));
  return pagine.length ? [{ id: `inps-${reg.id}`, pagine }] : [];
};
// I numeri nazionali (data/numeri.json): un gruppo per sezione della pagina Numeri utili.
const nazionali = () => ({
  asl: read('data/numeri.json').groups.map((g) => ({ id: g.id, pagine: (g.items || []).filter((n) => n.url).map((n) => ({ url: n.url })) })).filter((g) => g.pagine.length),
});

const daCopiare = regioni.regioni.filter((r) => fs.existsSync(path.join(SITE, fileAsl(r))))
  .map((reg) => ({ reg, asl: { asl: [...read(fileAsl(reg)).asl, ...sediInps(reg)] } }));
daCopiare.push({ reg: { id: 'nazionali', attiva: true }, asl: nazionali() });

for (const { reg, asl } of daCopiare) {
  const dir = path.join(OUT, reg.id);
  fs.mkdirSync(dir, { recursive: true });
  const indiceFile = path.join(dir, 'indice.json');
  const prima = fs.existsSync(indiceFile) ? JSON.parse(fs.readFileSync(indiceFile, 'utf8')).pagine : [];
  const primaPerUrl = new Map(prima.map((p) => [p.url, p]));
  const pagine = [];

  for (const a of asl.asl) {
    const urls = new Set();
    for (const k of ['site_url', 'info_url', 'form_url', 'portal_url', 'guardia_medica_url', 'pua_url']) if (a[k]) urls.add(a[k]);
    for (const c of [...(a.contacts || []), ...(a.pagine || [])]) if (c.url) urls.add(c.url);
    fs.mkdirSync(path.join(dir, a.id), { recursive: true });
    for (const url of urls) {
      totale++;
      const voce = { asl: a.id, url, controllata: new Date().toISOString().slice(0, 10) };
      if (SKIP.test(url)) { voce.nota = 'file, non controllato'; pagine.push(voce); continue; }
      let r = scarica(url);
      if (r.http === 200 && /html/i.test(r.type || '') && VUOTA(toText(r.body)) && !ANTIROBOT.test(r.body)) {
        const rb = await rendi(url);
        if (rb && rb.http === 200 && toText(rb.body).length > toText(r.body).length) { r = rb; voce.browser = true; }
      }
      if (ANTIROBOT.test(toText(r.body || '')) && VUOTA(toText(r.body || ''))) {
        voce.http = r.http; voce.nota = 'controllo anti-robot (CAPTCHA): non copiata';
        problemi.push(`${reg.id}/${a.id}: CAPTCHA ${url}`);
        pagine.push(voce); await sleep(PAUSA_MS); continue;
      }
      Object.assign(voce, { http: r.http, finale: r.finale && r.finale !== url ? r.finale : undefined, certificato: r.certificato, errore: r.errore });
      if (r.http === 200 && /html/i.test(r.type || '')) {
        if (!reg.attiva && url === a.site_url) for (const u of scopri(r.body, r.finale || url)) urls.add(u);
        const testo = toText(r.body);
        const titolo = toText((r.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ''])[1]).replace(/\s+/g, ' ').trim();
        const nome = `${a.id}/${sha(url).slice(0, 12)}.txt`;
        fs.writeFileSync(path.join(dir, nome), `${url}\n${titolo}\n\n${testo}\n`);
        voce.file = nome; voce.titolo = titolo; voce.sha = sha(testo); voce.caratteri = testo.length;
        const p = primaPerUrl.get(url);
        voce.cambiata = !p || p.sha !== voce.sha;
        if (p && p.sha !== voce.sha) cambiate++;
        ok++;
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
  fs.writeFileSync(indiceFile, `${JSON.stringify({ regione: reg.id, aggiornato: new Date().toISOString(), pagine }, null, 1)}\n`);
}

if (browser) await browser.close();
if (senzaBrowser) console.log('Playwright non installato: le pagine fatte con JavaScript sono rimaste quasi vuote.');
console.log(`${ok} pagine salvate su ${totale} (${cambiate} cambiate dall'ultima volta). Problemi: ${problemi.length}`);
for (const p of problemi) console.log('  ', p);
