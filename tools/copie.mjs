// Salva una copia in testo semplice delle pagine ufficiali elencate nei dati regionali
// (data/regioni/<regione>/asp.json: site_url, info_url, portal_url, guardia_medica_url, pua_url,
// url dei contatti). Serve al controllo periodico dei numeri (docs/regioni.md, «Aggiornamento assistito»):
// gira ogni notte su un server in Italia, perché molti siti delle ASL non rispondono dall'estero,
// e carica le copie nel branch «copie-siti». Claude poi le confronta con i dati e propone le modifiche.
//
// Regole di buona educazione (sono siti pubblici, non vogliamo pesare): una richiesta alla volta,
// una pausa tra una pagina e l'altra, ci presentiamo con nome e sito nel User-Agent, mai pagine con
// login o CAPTCHA, mai i portali di prenotazione (CUP).
//
// Uso: node tools/copie.mjs [cartella di destinazione]   (default: ../copie accanto al sito)
import fs from 'node:fs';
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

const regioni = read('data/regioni/index.json');
let totale = 0; let ok = 0; let cambiate = 0; const problemi = [];

for (const reg of regioni.regioni.filter((r) => r.attiva)) {
  const asl = read(`data/regioni/${reg.id}/${(reg.files && reg.files.asl) || 'asl'}.json`);
  const dir = path.join(OUT, reg.id);
  fs.mkdirSync(dir, { recursive: true });
  const indiceFile = path.join(dir, 'indice.json');
  const prima = fs.existsSync(indiceFile) ? JSON.parse(fs.readFileSync(indiceFile, 'utf8')).pagine : [];
  const primaPerUrl = new Map(prima.map((p) => [p.url, p]));
  const pagine = [];

  for (const a of asl.asl) {
    const urls = new Set();
    for (const k of ['site_url', 'info_url', 'form_url', 'portal_url', 'guardia_medica_url', 'pua_url']) if (a[k]) urls.add(a[k]);
    for (const c of a.contacts || []) if (c.url) urls.add(c.url);
    fs.mkdirSync(path.join(dir, a.id), { recursive: true });
    for (const url of urls) {
      totale++;
      const voce = { asl: a.id, url, controllata: new Date().toISOString().slice(0, 10) };
      if (SKIP.test(url)) { voce.nota = 'file, non controllato'; pagine.push(voce); continue; }
      const r = scarica(url);
      Object.assign(voce, { http: r.http, finale: r.finale && r.finale !== url ? r.finale : undefined, certificato: r.certificato, errore: r.errore });
      if (r.http === 200 && /html/i.test(r.type || '')) {
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

console.log(`${ok} pagine salvate su ${totale} (${cambiate} cambiate dall'ultima volta). Problemi: ${problemi.length}`);
for (const p of problemi) console.log('  ', p);
