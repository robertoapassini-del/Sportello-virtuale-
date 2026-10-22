// Coerenza tra le parti del sito che nessun altro test confronta (audit dei mutanti del 22/10/2026, giro 6:
// 30 errori messi apposta, elenco in docs/mutanti.md). Ogni controllo dice tra parentesi quale errore lo ha fatto
// nascere. Se fallisce: correggi il sito o i dati, non il test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(path.join(SITE, f), 'utf8');
const json = (f) => JSON.parse(read(f));
const indice = json('data/regioni/index.json');
const reg = json('data/moduli.json');
const sitemap = read('sitemap.xml');
const pagine = sitemap.match(/<loc>(.*?)<\/loc>/g).map((x) => x.slice(5, -6).replace('https://guidasanita.it/', ''))
  .map((u) => (u === '' || u.endsWith('/') ? `${u}index.html` : u));

// N05: i link interni scritti nei js portano a una cartella che esiste (tests/link.test.mjs legge solo l'HTML).
test('i link interni nei js portano a pagine che esistono', () => {
  const rotti = [];
  for (const f of readdirSync(path.join(SITE, 'js')).filter((x) => x.endsWith('.js'))) {
    const s = read(`js/${f}`);
    for (const m of s.matchAll(/href=\\?["'](\.\.\/[a-z0-9\/.-]*)/g)) {
      const t = path.join(SITE, 'x', m[1]); // i js dei moduli girano in /<modulo>/
      const file = m[1].endsWith('/') ? path.join(t, 'index.html') : t;
      if (!existsSync(file)) rotti.push(`js/${f}: ${m[1]}`);
    }
    for (const m of s.matchAll(/\$\{(?:ROOT|root|siteRoot\(\))\}([a-z0-9][a-z0-9\/.-]*\/)(?=["'`#?])/g)) {
      if (!existsSync(path.join(SITE, m[1], 'index.html'))) rotti.push(`js/${f}: ${m[1]}`);
    }
  }
  assert.deepEqual(rotti, []);
});

// N12, N13, N14, N16: dati regionali coerenti. Un id o una provincia ripetuti fanno sparire un'azienda dai pulsanti;
// un topic che js/numeri.js non conosce fa sparire la sezione; senza asl_label la Calabria dice «ASL» invece di «ASP».
const attive = indice.regioni.filter((r) => r.attiva);
const fileDi = (r, n) => `data/regioni/${r.id}/${(r.files && r.files[n]) || n}.json`;
const TOPICS = [...read('js/numeri.js').matchAll(/^\s*\['([a-z]+)', '/gm)].map((m) => m[1]);
test('regioni: id e province unici, sedi INPS con gli stessi id, topic conosciuti, asl_label', () => {
  const err = [];
  assert.ok(TOPICS.length >= 8, `topic letti da js/numeri.js: ${TOPICS}`);
  for (const r of indice.regioni) if (!r.asl_label) err.push(`${r.id}: manca asl_label in index.json`);
  for (const r of attive) {
    const asl = json(fileDi(r, 'asl')).asl;
    const dup = (k) => asl.map((a) => a[k]).filter((v, i, a) => a.indexOf(v) !== i);
    for (const k of ['id', 'province']) for (const v of dup(k)) err.push(`${r.id}: ${k} «${v}» ripetuto`);
    for (const a of asl) {
      for (const c of a.contacts || []) if (!TOPICS.includes(c.topic)) err.push(`${r.id}/${a.id}: topic «${c.topic}» sconosciuto (${c.label})`);
    }
    if (existsSync(path.join(SITE, fileDi(r, 'inps')))) {
      const inps = json(fileDi(r, 'inps')).provinces;
      const ids = new Set(inps.map((p) => p.id));
      for (const a of asl) if (!ids.has(a.id)) err.push(`${r.id}/${a.id}: nessuna sede INPS con lo stesso id`);
    }
  }
  assert.deepEqual(err, [], err.join('\n'));
});

// N15: una regione attiva senza «moduli» si crede pronta per tutti i moduli:
// deve avere i dati che servono ai moduli regionali (liste d'attesa: how_to e letter_mode).
test('regioni attive senza «moduli»: hanno i dati di tutti i moduli', () => {
  const err = [];
  for (const r of attive.filter((x) => !x.moduli)) {
    for (const a of json(fileDi(r, 'asl')).asl) for (const k of ['how_to', 'letter_mode', 'documents_required', 'what_next']) if (!(k in a)) err.push(`${r.id}/${a.id}: manca «${k}» (aggiungi «moduli» in index.json)`);
    if (!existsSync(path.join(SITE, fileDi(r, 'inps')))) err.push(`${r.id}: manca il file inps`);
  }
  assert.deepEqual(err, [], err.join('\n'));
});

// N22: ogni pagina del sito è nella sitemap (una pagina tolta da moduli.json resta online, vecchia).
test('ogni pagina .html del sito è nella sitemap (tranne la 404)', () => {
  const salta = new Set(['node_modules', 'tests', 'tools', 'docs', 'data', 'js', 'css', 'fonts', 'copie']); // e le cartelle che cominciano con «.»
  const out = [];
  const giro = (d) => {
    for (const x of readdirSync(path.join(SITE, d))) {
      const rel = d ? `${d}/${x}` : x;
      if (x.startsWith('.') || (!d && salta.has(x))) continue;
      if (statSync(path.join(SITE, rel)).isDirectory()) giro(rel);
      else if (x.endsWith('.html') && rel !== '404.html' && !pagine.includes(rel)) out.push(rel);
    }
  };
  giro('');
  assert.deepEqual(out, [], `pagine fuori dalla sitemap (tolte da moduli.json?):\n${out.join('\n')}`);
});

// N24: lo stesso numero di legge non compare con due anni diversi (38/2010 e 38/2001).
const TIPO = (t) => t.replace(/\s+/g, ' ').replace(/^legge$/i, 'L.').replace(/^D\. ?Lgs\.?$/i, 'D.Lgs.').replace(/^D\. ?L\.?$/, 'D.L.');
test('ogni legge citata ha un solo anno', () => {
  const visti = new Map();
  for (const f of [...pagine, ...readdirSync(path.join(SITE, 'js')).map((x) => `js/${x}`), ...readdirSync(path.join(SITE, 'data')).filter((x) => x.endsWith('.json')).map((x) => `data/${x}`)]) {
    const s = read(f).replace(/<[^>]+>/g, ' ');
    for (const m of s.matchAll(/\b(L\.|legge|D\. ?Lgs\.?|D\. ?L\.|DPCM|D\.P\.R\.|DPR|D\.M\.|DM)\s*(?:n\.\s*)?(\d{1,4})\/(\d{4})\b/gi)) {
      const k = `${TIPO(m[1])} ${m[2]}`;
      if (!visti.has(k)) visti.set(k, new Map());
      visti.get(k).set(m[3], `${f}`);
    }
  }
  const doppi = [...visti].filter(([, anni]) => anni.size > 1).map(([k, anni]) => `${k}: ${[...anni].map(([a, f]) => `${a} (${f})`).join(', ')}`);
  assert.deepEqual(doppi, [], doppi.join('\n'));
});

// N26: ogni <button> nelle pagine ha un nome (testo o aria-label).
test('ogni pulsante delle pagine ha un nome', () => {
  const out = [];
  for (const f of [...pagine, '404.html']) {
    for (const [b, attr, body] of read(f).matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/g)) {
      const testo = body.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '').trim();
      if (!testo && !/aria-label="[^"]+"/.test(attr)) out.push(`${f}: ${b.slice(0, 80)}`);
    }
  }
  assert.deepEqual(out, [], out.join('\n'));
});

// N28: il link «‹ …» del telefono porta all'ultimo livello del percorso.
test('il link indietro del percorso porta al livello sopra', () => {
  const out = [];
  for (const f of pagine) {
    const nav = read(f).match(/<nav class="breadcrumb"[\s\S]*?<\/nav>/);
    if (!nav) continue;
    const ultimi = [...nav[0].matchAll(/<li><a href="([^"]*)">([^<]*)<\/a><\/li>/g)].pop();
    const back = nav[0].match(/<a class="breadcrumb-back" href="([^"]*)"><span aria-hidden="true">‹ <\/span>([^<]*)<\/a>/);
    if (!back || !ultimi || back[1] !== ultimi[1] || back[2] !== ultimi[2]) out.push(`${f}: indietro «${back && back[2]}» ma l'ultimo livello è «${ultimi && ultimi[2]}»`);
  }
  assert.deepEqual(out, [], out.join('\n'));
});

// N29: «Informazioni controllate il» = la data più vecchia dei file del modulo (calcolo indipendente).
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
test('la data «Informazioni controllate il» è la più vecchia dei dati del modulo', () => {
  const out = [];
  for (const m of reg.modules) {
    const date = [];
    const giro = (v, k) => { if (Array.isArray(v)) v.forEach((x) => giro(x)); else if (v && typeof v === 'object') Object.entries(v).forEach(([kk, x]) => giro(x, kk)); else if (k === 'last_verified') date.push(v); };
    for (const f of m.data || []) giro(json(`data/${f}.json`));
    if (!date.length) continue;
    const [y, mm, g] = date.sort()[0].split('-').map(Number);
    const atteso = `Informazioni controllate il ${g === 1 ? '1º' : g} ${MESI[mm - 1]} ${y}.`;
    if (!read(`${m.id}/index.html`).includes(atteso)) out.push(`${m.id}: manca «${atteso}»`);
  }
  assert.deepEqual(out, [], out.join('\n'));
});

// N30: «Condividi su WhatsApp» manda l'indirizzo della pagina stessa (il canonical).
test('Condividi su WhatsApp manda l\'indirizzo della pagina', () => {
  const out = [];
  for (const f of pagine) {
    const html = read(f);
    const can = (html.match(/<link rel="canonical" href="([^"]+)">/) || [])[1];
    const wa = (html.match(/href="https:\/\/wa\.me\/\?text=([^"]+)"/) || [])[1];
    if (!can || !wa || !decodeURIComponent(wa).endsWith(`\n${can}`)) out.push(`${f}: canonical ${can}, WhatsApp «${wa && decodeURIComponent(wa).split('\n').pop()}»`);
  }
  assert.deepEqual(out, [], out.join('\n'));
});

// N27: le parole della ricerca non spariscono per sbaglio. L'elenco è in tests/ricerca-parole.txt, come
// tests/citazioni.txt: una parola nuova passa; una parola tolta fa fallire il test. Se la parola è stata tolta apposta,
// si rifà l'elenco con «PAROLE=scrivi npm test» e chi rivede la PR guarda le righe tolte.
test('nessuna parola della ricerca è sparita', () => {
  const ora = new Set(reg.modules.flatMap((m) => (m.keywords || '').split(/\s+/).filter(Boolean).map((w) => `${m.id} ${w}`)));
  const elenco = path.join(path.dirname(fileURLToPath(import.meta.url)), 'ricerca-parole.txt');
  if (process.env.PAROLE === 'scrivi') { writeFileSync(elenco, `${[...ora].sort().join('\n')}\n`); return; }
  const prima = readFileSync(elenco, 'utf8').split('\n').filter(Boolean);
  const sparite = prima.filter((x) => !ora.has(x));
  assert.deepEqual(sparite, [], `parole tolte dalla ricerca:\n${sparite.join('\n')}`);
});

// Invalidità accesa in una regione: ogni sede INPS deve dire se la provincia usa la procedura nuova o la vecchia
// (riforma della disabilità). Senza, il modulo la tratterebbe come vecchia senza dirlo (22/10/2026, gruppo 3:
// le sedi sarde di Olbia, Lanusei, Sanluri e Carbonia non sono nominate da INPS).
test('regioni con l\'invalidità accesa: ogni sede INPS ha il regime', () => {
  const errori = [];
  for (const r of indice.regioni.filter((x) => x.attiva && (!x.moduli || x.moduli.includes('invalidita')))) {
    const f = `data/regioni/${r.id}/${(r.files && r.files.inps) || 'inps'}.json`;
    if (!existsSync(path.join(SITE, f))) { errori.push(`${r.id}: manca ${f}`); continue; }
    for (const p of json(f).provinces || []) if (!['new', 'old'].includes(p.regime)) errori.push(`${r.id}/${p.id || p.name}: regime «${p.regime}»`);
  }
  assert.deepEqual(errori, []);
});
