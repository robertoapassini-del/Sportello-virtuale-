// Confronta i dati regionali con le copie testuali delle pagine ufficiali (branch «copie-siti»,
// fatte ogni notte dal server in Italia con tools/copie.mjs). Per ogni regione attiva, o per quelle
// indicate, legge data/regioni/<regione>/(asp|asl).json e <cartella-copie>/<regione>/indice.json e segnala:
//   1. contatti e numeri principali con proof «pagina» le cui cifre non compaiono nella copia del loro url;
//   2. pec e send_to di ogni azienda che non compaiono in nessuna copia di quell'azienda;
//   3. url dei dati senza copia (pagina non copiata, errore, o non presente nell'indice).
// I file (PDF, DOC…) non si copiano: si elencano a parte e non contano come problemi.
// Regole in docs/regola-numeri.md e docs/protocollo-test.md.
//
// Uso: node tools/confronta-copie.mjs <cartella-copie> [regione…]
// Esce con codice 3 se trova problemi (0 se nessuno, 2 se mancano le copie, 1 se il programma si rompe).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [copieArg, ...scelte] = process.argv.slice(2);
if (!copieArg) {
  console.error('Uso: node tools/confronta-copie.mjs <cartella-copie> [regione…]');
  process.exit(2);
}
const COPIE = path.resolve(copieArg);
const FILE = /\.(pdf|docx?|xlsx?|odt|zip)(\?|$)/i;
const URL_KEYS = ['site_url', 'info_url', 'form_url', 'portal_url', 'guardia_medica_url', 'pua_url'];

const leggi = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const indice = leggi(path.join(SITE, 'data/regioni/index.json'));
const tutte = indice.regioni.filter((r) => r.attiva);
const ignote = scelte.filter((id) => !indice.regioni.some((r) => r.id === id));
if (ignote.length) {
  console.error(`Regioni sconosciute: ${ignote.join(', ')}`);
  process.exit(2);
}
const regioni = scelte.length ? indice.regioni.filter((r) => scelte.includes(r.id)) : tutte;

// Cifre del numero, con separatori qualsiasi tra l'una e l'altra (spazi, punti, trattini, barre…).
const regexNumero = (numero) => {
  const cifre = String(numero).replace(/\D/g, '');
  return cifre ? new RegExp(`(?<!\\d)${cifre.split('').join('[^\\d\\n]{0,3}')}(?!\\d)`) : null;
};
// Per cercare le email si tolgono gli spazi strani e si confronta in minuscolo.
const normEmail = (s) => s.toLowerCase().replace(/\s+/g, '');
// Lo stesso indirizzo scritto con o senza la barra finale è la stessa pagina.
const normUrl = (u) => String(u).trim().replace(/#.*$/, '').replace(/\/+$/, '');
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase(); } catch { return null; } };

let totale = 0;
const riepilogo = [];
for (const reg of regioni) {
  const fileDati = path.join(SITE, `data/regioni/${reg.id}/${(reg.files && reg.files.asl) || 'asl'}.json`);
  const fileIndice = path.join(COPIE, reg.id, 'indice.json');
  const problemi = [];
  const fileNonCopiati = [];
  if (!fs.existsSync(fileDati)) {
    problemi.push(`manca il file dei dati ${path.relative(SITE, fileDati)}`);
  } else if (!fs.existsSync(fileIndice)) {
    problemi.push(`manca l'indice delle copie ${fileIndice}`);
  } else {
    const dati = leggi(fileDati);
    const pagine = leggi(fileIndice).pagine || [];
    // Una pagina si trova col suo indirizzo o con quello finale dopo i redirect, con o senza la barra finale.
    const perUrl = new Map();
    for (const p of pagine) {
      for (const u of [p.url, p.finale].filter(Boolean)) {
        const k = normUrl(u);
        if (!perUrl.has(k) || (!perUrl.get(k).file && p.file)) perUrl.set(k, p);
      }
    }
    const cache = new Map();
    const testo = (p) => {
      if (!p || !p.file) return null;
      if (!cache.has(p.file)) {
        const f = path.join(COPIE, reg.id, p.file);
        cache.set(p.file, fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null);
      }
      return cache.get(p.file);
    };

    for (const a of dati.asl || []) {
      const dove = `${a.id}`;
      const copia = (url) => perUrl.get(normUrl(url));

      // 3. url senza copia
      const urls = new Set();
      for (const k of URL_KEYS) if (a[k]) urls.add(a[k]);
      for (const c of [...(a.phones || []), ...(a.contacts || [])]) if (c.url) urls.add(c.url);
      for (const url of urls) {
        const p = copia(url);
        if (FILE.test(url)) { if (!testo(p)) fileNonCopiati.push(`${dove}: ${url}`); continue; }
        if (!p) problemi.push(`${dove}: url senza copia (non è nell'indice): ${url}`);
        else if (!testo(p)) problemi.push(`${dove}: url senza copia (${p.http || p.errore || p.nota || 'nessun file'}): ${url}`);
      }

      // 1. cifre dei numeri con proof «pagina»
      for (const c of [...(a.phones || []), ...(a.contacts || [])]) {
        if (c.proof !== 'pagina' || !c.number || !c.url) continue;
        const t = testo(copia(c.url));
        if (t == null) continue; // già segnalato al punto 3 (o file non copiato)
        const re = regexNumero(c.number);
        if (re && !re.test(t)) {
          problemi.push(`${dove}: ${c.number} («${c.label || c.title || c.topic}») non compare nella copia di ${c.url}`);
        }
      }

      // 2. pec e send_to in almeno una copia dell'azienda. Le copie di un'azienda sono quelle con il suo id
      // nell'indice, oppure su uno dei suoi domini (site_url, official_domains, url dei dati): le regioni copiate
      // da fonti.json hanno nell'indice id diversi da quelli dei dati (es. «asl-roma1» invece di «roma»).
      const domini = new Set([...urls].map(host).filter(Boolean));
      for (const d of a.official_domains || []) domini.add(String(d).replace(/^www\./, '').toLowerCase());
      const suoDominio = (u) => { const h = host(u); return h && [...domini].some((d) => h === d || h.endsWith(`.${d}`)); };
      const testiAzienda = pagine.filter((p) => p.asl === a.id || suoDominio(p.url) || suoDominio(p.finale || ''))
        .map(testo).filter(Boolean).map(normEmail);
      for (const k of ['pec', 'send_to']) {
        const v = a[k];
        if (!v || typeof v !== 'string' || !v.includes('@')) continue;
        if (k === 'send_to' && v === a.pec) continue;
        if (!testiAzienda.some((t) => t.includes(normEmail(v)))) {
          problemi.push(`${dove}: ${k} ${v} non compare in nessuna copia di questa azienda`);
        }
      }
    }
  }

  totale += problemi.length;
  riepilogo.push(`${reg.id}: ${problemi.length}`);
  if (problemi.length || fileNonCopiati.length) {
    console.log(`\n== ${reg.name} (${reg.id}): ${problemi.length} ${problemi.length === 1 ? 'problema' : 'problemi'}`);
    for (const p of problemi) console.log(`  - ${p}`);
    if (fileNonCopiati.length) {
      console.log(`  File non copiati (da controllare a mano, non contano): ${fileNonCopiati.length}`);
      for (const f of fileNonCopiati) console.log(`    · ${f}`);
    }
  }
}
console.log(`\nRiepilogo: ${riepilogo.join(', ')}`);
console.log(totale ? `Totale: ${totale} problemi.` : 'Nessun problema: dati e copie vanno d\'accordo.');
process.exit(totale ? 3 : 0); // 3 = differenze trovate (1 resta per un errore del programma)
