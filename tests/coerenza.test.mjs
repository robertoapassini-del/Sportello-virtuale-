// Coerenza tra le parti del sito che nessun altro test confronta (audit dei mutanti del 22/10/2026, giro 6:
// 30 errori messi apposta, elenco in docs/mutanti.md). Ogni controllo dice tra parentesi quale errore lo ha fatto
// nascere. Se fallisce: correggi il sito o i dati, non il test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { zoneLettera, conZona } from '../js/letters.js';

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

// Una regione con «moduli» accende un modulo solo se ha i dati che quel modulo legge (docs/regioni.md, «Aggiungere le
// lettere di una regione (checklist)»). Senza, il modulo si rompe (a.scelta_medico.how di un'azienda senza
// scelta_medico) o scrive a un indirizzo vuoto. Nato il 22/10/2026 con l'invalidità in Umbria: con «regime» null la
// provincia di Perugia, nella riforma dal 2025, avrebbe avuto la procedura vecchia.
const CAMPI_MODULO = {
  'liste-attesa': (a) => [
    ...['channel', 'letter_mode', 'how_to', 'documents_required', 'what_next', 'notes', 'details', 'emails', 'sources', 'phones', 'last_verified']
      .filter((k) => !(k in a) || a[k] === null || a[k] === ''),
    ...(a.letter_mode === 'portal' && !a.portal_url ? ['portal_url'] : []),
    // Il pulsante dice «Vai al sito dell'ASL»: se il portale è su un altro sito (Lazio: Salute Lazio, della Regione), serve portal_label.
    ...(a.letter_mode === 'portal' && a.portal_url && a.site_url && !a.portal_label
      && new URL(a.portal_url).hostname.replace(/^www\./, '') !== new URL(a.site_url).hostname.replace(/^www\./, '') ? ['portal_label (il portale non è sul sito dell\'azienda)'] : []),
    ...(a.letter_mode === 'official_form' && !(a.form_url && (a.form_fields || []).length) ? ['form_url e form_fields'] : []),
    ...(a.letter_mode && a.letter_mode !== 'portal' && !a.send_to && !a.pec ? ['send_to o pec'] : []),
  ],
  'cartella-clinica': (a) => ['emails', 'phones', 'sources'].filter((k) => !Array.isArray(a[k])).concat(a.pec || (a.emails || []).length ? [] : ['pec o emails']),
  // Medico: senza email né PEC la lettera si stampa e si consegna allo sportello o all'URP (js/medico.js, «Stampa la lettera e consegnala»).
  'medico-famiglia': (a) => (a.scelta_medico && a.scelta_medico.how ? [] : ['scelta_medico.how']),
  'assistenza-domiciliare': (a) => ((a.emails || []).length || a.pec ? [] : ['emails o pec']),
  'cure-palliative': (a) => ((a.emails || []).length || a.pec ? [] : ['emails o pec']),
  ausili: (a) => (a.pec ? [] : ['pec']),
  // Prevenzione: il numero dello screening dell'azienda (contacts con topic «screening»). Senza, il risultato non dice chi
  // chiamare (22/10/2026: acceso solo dove ogni azienda ce l'ha).
  prevenzione: (a) => ((a.contacts || []).some((c) => c.topic === 'screening') ? [] : ['un contatto «screening»']),
};
// I moduli che scrivono all'azienda sanitaria (docs/regioni.md, sezione 9). Problemi trovati aggiungendo le regioni
// (22/10/2026): le lettere scrivevano «USL di Perugia», «ATS di Genova», «ASREM di Campobasso», aziende che con quel nome
// non esistono; e in una provincia con più aziende (Roma, Napoli, Torino, Cuneo, Perugia, Lombardia) la lettera andava
// sempre alla prima. Ora:
// - con un modulo così acceso, ogni azienda (e ogni sua zona) ha il nome per la lettera «nome_lettera», se la regione
//   non ha «asl_intestazione» in index.json (la Sicilia: «Azienda Sanitaria Provinciale di Palermo»);
// - un'azienda con «aziende_multiple: true» ha le zone in sub_areas (almeno una: con una sola, come le province lombarde
//   con l'ATS e una ASST, la lettera va a quella senza domanda), ognuna con nome_lettera e pec,
//   emails o send_to suoi; ogni zona ha anche i campi che il modulo legge (CAMPI_MODULO sull'azienda con la zona).
const MODULI_LETTERA = ['cartella-clinica', 'medico-famiglia', 'assistenza-domiciliare', 'cure-palliative', 'liste-attesa', 'ausili'];
function erroriLettere(r, asl) {
  const err = [];
  const moduli = r.moduli || [];
  for (const a of asl) {
    const zone = zoneLettera(a);
    const ids = zone.map((z) => z.id);
    const conZone = [a, ...ids.map((id) => conZona(a, id))];
    const dove = (x) => (x.zona ? `${a.id}/${x.zona.id}` : a.id);
    for (const z of zone) {
      if (ids.indexOf(z.id) !== ids.lastIndexOf(z.id)) err.push(`${r.id}/${a.id}: zona «${z.id}» ripetuta`);
      if (!z.label && !z.name) err.push(`${r.id}/${a.id}/${z.id}: zona senza label (il pulsante «In quale zona?»)`);
    }
    for (const m of moduli.filter((x) => CAMPI_MODULO[x])) {
      for (const x of conZone) for (const k of CAMPI_MODULO[m](x)) err.push(`${r.id}/${dove(x)}: «${m}» acceso ma manca ${k}`);
    }
    for (const m of moduli.filter((x) => MODULI_LETTERA.includes(x))) {
      if (a.aziende_multiple) {
        if (zone.length < 1) err.push(`${r.id}/${a.id}: «${m}» acceso, ma la provincia ha più aziende (aziende_multiple) e mancano le zone in sub_areas`);
        for (const z of zone) {
          if (!z.pec && !(z.emails || []).length && !z.send_to) err.push(`${r.id}/${a.id}/${z.id}: «${m}» acceso, ma la zona non ha pec, emails o send_to suoi`);
          if (!z.nome_lettera) err.push(`${r.id}/${a.id}/${z.id}: «${m}» acceso, ma la zona non ha nome_lettera`);
        }
      } else if (!r.asl_intestazione) {
        for (const x of conZone) if (!x.nome_lettera) err.push(`${r.id}/${dove(x)}: «${m}» acceso ma manca nome_lettera (il nome dell'azienda nella lettera)`);
      }
    }
  }
  return [...new Set(err)];
}

// Un nome che elenca più aziende («ASL CN1 e ASL CN2», «ASL di Roma (Roma 1–6)», «USL Umbria 1 (e USL Umbria 2 …)»)
// o email URP di più aziende lombarde (ATS e ASST) vogliono «aziende_multiple: true»: così il controllo qui sopra
// non si aggira dimenticando il campo.
const PIU_AZIENDE = [/\b(e|ed)\s+(ASL|AUSL|USL|ULSS|ATS|ASST)\b/, /\(e\s+(ASL|AUSL|USL|ULSS)\b/, /\d\s*[–-]\s*\d\)/, /\(\D*\b1\b[^)]*,[^)]*\b2\b/, /, (ASL|AUSL|USL|ULSS) /];
function sembraPiuAziende(a) {
  if (PIU_AZIENDE.some((re) => re.test(a.name || ''))) return true;
  const em = a.emails || [];
  const asst = new Set(em.map((e) => (e.match(/@(asst-[\w-]+)\./) || [])[1]).filter(Boolean));
  return asst.size > 1 || (asst.size > 0 && em.some((e) => /@ats-/.test(e)));
}
test('aziende: un nome con più aziende ha aziende_multiple', () => {
  const err = [];
  for (const r of attive) {
    for (const a of json(fileDi(r, 'asl')).asl) {
      if (sembraPiuAziende(a) && a.aziende_multiple !== true) err.push(`${r.id}/${a.id}: «${a.name}» sembra più aziende: aggiungi aziende_multiple: true (e le zone, per le lettere)`);
    }
  }
  assert.deepEqual(err, [], err.join('\n'));
});

// Le regole qui sopra provate su dati finti: se un giorno nessuna regione vera ha zone, il controllo resta provato.
test('lettere all\'azienda: il controllo prende i casi finti', () => {
  const zona = (id, extra = {}) => ({ id, label: `Zona ${id}`, nome_lettera: `ASL Prova ${id}`, pec: `${id}@pec.prova.it`, ...extra });
  const base = { id: 'prova', name: 'ASL Prova 1 e ASL Prova 2', province: 'Prova', emails: ['urp@prova.it'], phones: [], sources: [], pec: 'a@pec.prova.it', scelta_medico: { how: 'Allo sportello.' } };
  const finta = (moduli, extra = {}) => ({ id: 'finta', moduli, ...extra });
  const testo = (r, asl) => erroriLettere(r, asl).join('\n');
  // Più aziende senza zone, medico acceso: errore.
  assert.match(testo(finta(['medico-famiglia']), [{ ...base, aziende_multiple: true }]), /mancano le zone/);
  // Una zona senza pec né email: errore.
  assert.match(testo(finta(['ausili']), [{ ...base, aziende_multiple: true, sub_areas: [zona('a', { pec: '' }), zona('b')] }]), /prova\/a: «ausili» acceso, ma la zona non ha pec/);
  // Zone giuste: nessun errore.
  assert.deepEqual(erroriLettere(finta(['medico-famiglia', 'ausili']), [{ ...base, aziende_multiple: true, sub_areas: [zona('a'), zona('b')] }]), []);
  // Senza nome_lettera e senza asl_intestazione: errore; con asl_intestazione (la Sicilia) no.
  assert.match(testo(finta(['cure-palliative']), [{ ...base, name: 'ASL Prova' }]), /manca nome_lettera/);
  assert.deepEqual(erroriLettere(finta(['cure-palliative'], { asl_intestazione: 'Azienda Sanitaria Provinciale' }), [{ ...base, name: 'ASL Prova' }]), []);
  // Una zona che toglie un campo che il modulo legge: errore sulla zona.
  assert.match(testo(finta(['medico-famiglia']), [{ ...base, aziende_multiple: true, sub_areas: [zona('a', { scelta_medico: {} }), zona('b')] }]), /prova\/a: «medico-famiglia» acceso ma manca scelta_medico\.how/);
  // Le zone scritte come frase (Messina) non contano come zone della lettera.
  assert.match(testo(finta(['ausili']), [{ ...base, aziende_multiple: true, sub_areas: ['Messina – Taormina', 'Milazzo'] }]), /mancano le zone/);
  // Il nome con più aziende si riconosce; quello di una sola no.
  for (const n of ['ASL CN1 e ASL CN2', 'ASL di Roma (Roma 1–6)', 'USL Umbria 1 (e USL Umbria 2 per Foligno)', 'ASL di Napoli (Napoli 1 Centro, Napoli 2 Nord, Napoli 3 Sud)', 'ASL Città di Torino, ASL TO3, ASL TO4 e ASL TO5', 'AUSL di Bologna e AUSL di Imola']) assert.ok(sembraPiuAziende({ name: n }), n);
  for (const n of ['ASP Palermo', 'ASL 2 Lanciano – Vasto – Chieti', 'ATS Liguria – Aree sociosanitarie locali 3 (Area Metropolitana di Genova) e 4 (Tigullio)', 'Azienda USL Toscana Sud Est', 'ASReM – Azienda Sanitaria Regionale del Molise']) assert.ok(!sembraPiuAziende({ name: n }), n);
  assert.ok(sembraPiuAziende({ name: 'ATS di Bergamo', emails: ['urp@ats-bg.it', 'urp@asst-pg23.it'] }));
});

test('regioni con «moduli»: ogni modulo acceso ha i dati che legge', () => {
  const err = [];
  for (const r of attive.filter((x) => x.moduli)) {
    for (const m of r.moduli) if (!reg.modules.some((x) => x.id === m) && m !== 'numeri-utili') err.push(`${r.id}: modulo «${m}» sconosciuto`);
    const asl = json(fileDi(r, 'asl')).asl;
    err.push(...erroriLettere(r, asl));
    if (r.moduli.includes('invalidita')) {
      const f = fileDi(r, 'inps');
      if (!existsSync(path.join(SITE, f))) { err.push(`${r.id}: «invalidita» acceso ma manca ${f}`); continue; }
      const ids = new Set(asl.map((a) => a.id));
      for (const p of json(f).provinces) {
        if (!ids.has(p.id)) err.push(`${r.id}: sede INPS «${p.id}» senza azienda con lo stesso id`);
        if (!['old', 'new'].includes(p.regime)) err.push(`${r.id}/${p.id}: «invalidita» acceso ma regime è ${p.regime} (old o new)`);
        if (p.regime === 'new' && !/^\d{4}-\d{2}-\d{2}$/.test(p.regime_since || '')) err.push(`${r.id}/${p.id}: regime new senza regime_since`);
        for (const k of ['name', 'pec', 'address', 'url', 'verified', 'proof']) if (!p[k]) err.push(`${r.id}/${p.id}: «invalidita» acceso ma manca ${k}`);
      }
    }
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

// Ausili: il modulo fa il conto con i giorni della Sicilia (data/rules-ausili.json, authorization_days 20) e dice
// «se non risponde vale come un sì» (silenzio-assenso), che è una regola siciliana. Nelle altre regioni i giorni li fissa
// la Regione (DPCM 12/01/2017, allegato 12): finché il modulo non ha i giorni di ogni regione con la loro fonte, si accende
// solo in Sicilia (22/10/2026: il secondo giro lo aveva acceso in Toscana, Umbria, Liguria e Valle d'Aosta).
test('ausili: acceso solo in Sicilia (i 20 giorni e il silenzio-assenso sono siciliani)', () => {
  const accesi = indice.regioni.filter((r) => r.attiva && r.id !== 'sicilia' && (!r.moduli || r.moduli.includes('ausili'))).map((r) => r.id);
  assert.deepEqual(accesi, []);
});

// 23/10/2026: le guide dicevano «per ora solo per la Sicilia» anche dove il modulo era acceso in altre regioni
// (liste d'attesa, cartella, assistenza a casa, cure palliative, invalidità). Poi la regola: il sito dice quello che c'è,
// non quello che manca («per ora solo…», «non ancora in tutte le regioni», «se li abbiamo»). Se il modulo è acceso solo
// in Sicilia, la frase sul percorso («Il percorso in questa guida la prepara…») lo dice come regola della Sicilia.
test('guide: niente «per ora solo…» né «non ancora in tutte le regioni»; i moduli solo siciliani lo dicono', () => {
  const MANCA = /per ora,? (li abbiamo )?solo (per|in) (la )?Sicilia|solo quelle della Sicilia|non ancora (in|per) tutte|se li abbiamo|non abbiamo ancora|non li abbiamo ancora/;
  const errori = [];
  for (const dir of readdirSync(SITE, { withFileTypes: true }).filter((e) => e.isDirectory() && existsSync(path.join(SITE, e.name, 'index.html')))) {
    const fuori = indice.regioni.some((r) => r.attiva && r.id !== 'sicilia' && (!r.moduli || r.moduli.includes(dir.name)));
    const pagine = [path.join(dir.name, 'index.html'), ...readdirSync(path.join(SITE, dir.name), { withFileTypes: true })
      .filter((e) => e.isDirectory() && existsSync(path.join(SITE, dir.name, e.name, 'index.html'))).map((e) => path.join(dir.name, e.name, 'index.html'))];
    for (const f of pagine) {
      readFileSync(path.join(SITE, f), 'utf8').split('\n').forEach((riga, i) => {
        if (MANCA.test(riga)) errori.push(`${f}:${i + 1}: «${riga.match(MANCA)[0]}»: di' quello che c'è, non quello che manca`);
        if (!fuori && /in questa guida<\/a> /.test(riga) && !/Sicilia/.test(riga)) errori.push(`${f}:${i + 1}: il modulo «${dir.name}» è acceso solo in Sicilia: dillo («In Sicilia il percorso…»)`);
      });
    }
  }
  assert.deepEqual(errori, []);
});

// Il link al Fascicolo Sanitario della Regione (link.fse dell'indice) ha la sua prova in regole_fonti.fse del file della
// regione: stesso indirizzo, letto sulla pagina (proof «pagina») in un giorno preciso. Il server copia ogni notte gli
// url di regole_fonti, così una pagina che sparisce si vede. Una voce senza proof è solo «da copiare»: niente link.
// 23/10/2026: il fascicolo è la cosa più cercata (docs/ricerche-frequenti.md, punto 3b), ma il link c'era solo in Sicilia.
test('link al Fascicolo della Regione: solo con la prova in regole_fonti.fse', () => {
  const errori = [];
  for (const r of indice.regioni) {
    const f = `data/regioni/${r.id}/${(r.files && r.files.asl) || 'asl'}.json`;
    const prova = existsSync(path.join(SITE, f)) ? (json(f).regole_fonti || {}).fse : null;
    // Un indirizzo, o uno per zona ({ in, url }: Trento e Bolzano); la prova ha la stessa forma.
    const lista = (x) => (x ? (Array.isArray(x) ? x : [typeof x === 'string' ? { url: x } : x]) : []);
    const link = lista(r.link && r.link.fse);
    const prove = lista(prova);
    if (link.length && !prove.length) errori.push(`${r.id}: link.fse senza regole_fonti.fse in ${f}`);
    if (link.length && prove.length) {
      const bene = link.length === prove.length && link.every((l, i) => prove[i].url === l.url && prove[i].proof === 'pagina'
        && /^\d{4}-\d{2}-\d{2}$/.test(prove[i].verified || '') && prove[i].nota && (link.length === 1 || (l.in && l.in === prove[i].in)));
      if (!bene) errori.push(`${r.id}: regole_fonti.fse non prova il link (url, proof «pagina», verified, nota)`);
    }
    if (!link.length && prove.some((x) => x.proof)) errori.push(`${r.id}: regole_fonti.fse ha la prova ma manca link.fse nell'indice`);
  }
  assert.deepEqual(errori, []);
});

// 24/10/2026: le pagine dei temi da scrivere (data/fonti-nazionali.json) le copia il server, e le pagine del sito
// si scrivono leggendo le copie: devono essere pagine ufficiali (Ministero, INPS, leggi, Conferenza Stato-Regioni).
test('fonti-nazionali.json: solo indirizzi ufficiali, ogni tema con un id e almeno una pagina', () => {
  const UFFICIALI = /^https:\/\/(www\.)?(salute\.gov\.it|inps\.it|normattiva\.it|gazzettaufficiale\.it|statoregioni\.it|agenziaentrate\.gov\.it|lavoro\.gov\.it|aifa\.gov\.it|iss\.it)\//;
  const { temi } = JSON.parse(read('data/fonti-nazionali.json'));
  const brutti = [];
  const ids = new Set();
  for (const t of temi) {
    if (!/^[a-z0-9-]+$/.test(t.id || '') || ids.has(t.id)) brutti.push(`id non valido o ripetuto: ${t.id}`);
    ids.add(t.id);
    if (!(t.pagine || []).length) brutti.push(`${t.id}: nessuna pagina`);
    for (const p of t.pagine || []) if (!UFFICIALI.test(p.url || '')) brutti.push(`${t.id}: non è un sito ufficiale: ${p.url}`);
  }
  assert.deepEqual(brutti, []);
});
