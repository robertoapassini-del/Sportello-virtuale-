// Ogni citazione di legge del sito («art. 33 L. 104/1992», «art. 4, comma 2, L. 24/2017») è stata riletta
// sulla fonte ed è scritta in tests/citazioni.txt. Una citazione nuova o cambiata («art. 33» → «art. 34»)
// fa fallire il test finché qualcuno non la rilegge sul testo ufficiale (Normattiva, Gazzetta Ufficiale)
// e la aggiunge all'elenco (audit dei mutanti del 21/10/2026: un articolo sbagliato non lo vedeva nessuno).
// Ogni riga dell'elenco è «art. N [comma M] | legge»: la legge è quella scritta subito dopo l'articolo
// o, se manca, l'ultima nominata prima nella stessa frase o paragrafo («?» se non c'è).
// Una riga che non serve più fa fallire il test: va tolta.
// Rigenerare l'elenco (solo dopo aver riletto le citazioni nuove): CITAZIONI=scrivi node --test tests/citazioni.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ELENCO = path.join(SITE, 'tests', 'citazioni.txt');
// Cartelle che non sono il sito (e quelle che iniziano con il punto: .git, .claude…).
const SALTA = new Set(['node_modules', 'tests', 'tools', 'docs', 'fonts', 'css']);
function files(dir = SITE) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (SALTA.has(e.name) || e.name.startsWith('.')) return [];
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return files(p);
    return /\.(html|js|json)$/.test(e.name) ? [p] : [];
  });
}

const MESI = { gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6, luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12 };
// Le leggi, scritte nei modi che usa il sito, con il nome breve che va nell'elenco.
const LEGGI = [
  [/(?<![\w.])(?:L\.|[Ll]egge)\s*(?:n\.\s*)?(\d+)\/(\d{4})/g, (m) => `L. ${m[1]}/${m[2]}`],
  [/\b[Ll]egge\s+(\d+)(?![/\d]|º|\s+[a-z]+\s+\d{4})/g, (m) => `L. ${m[1]}`],
  [/\b[Ll]egge\s+\d{1,2}º?\s+[a-z]+\s+(\d{4}),?\s+n\.\s*(\d+)/g, (m) => `L. ${m[2]}/${m[1]}`],
  [/\bD\.\s?Lgs\.?\s*(?:n\.\s*)?(\d+)\/(\d{4})/g, (m) => `D.Lgs. ${m[1]}/${m[2]}`],
  [/\b(?:D\.L\.|[Dd]ecreto-legge)\s*(?:n\.\s*)?(\d+)\/(\d{4})/g, (m) => `D.L. ${m[1]}/${m[2]}`],
  [/\b(?:D\.P\.R\.|DPR)\s*(?:n\.\s*)?(\d+)\/(\d{4})/g, (m) => `D.P.R. ${m[1]}/${m[2]}`],
  [/\bRegolamento del Codice della strada/g, () => 'Regolamento CdS'],
  [/(?<!Regolamento del )\bCodice della strada/g, () => 'CdS'],
  [/\b(?:disp\. att\.|[Dd]isposizioni di attuazione del) c\.p\.c\./g, () => 'disp. att. c.p.c.'],
  [/\bACN(?: del)? (\d{4})\b/g, (m) => `ACN ${m[1]}`],
  [/\bDPCM(?:\s+del)?\s+(\d{1,2})[/.](\d{1,2})[/.](\d{4})/g, (m) => `DPCM ${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3]}`],
  [/\bDPCM(?:\s+del)?\s+(\d{1,2})\s+([a-z]+)\s+(\d{4})/g, (m) => `DPCM ${m[1].padStart(2, '0')}/${String(MESI[m[2]] || 0).padStart(2, '0')}/${m[3]}`],
  [/\bDPCM(?:\s+del)?\s+(\d{4})\b/g, (m) => `DPCM ${m[1]}`],
  [/\bDM\s+(?:n\.\s*)?(\d+)\/(\d{4})/g, (m) => `DM ${m[1]}/${m[2]}`],
  [/(?<!(?:disp\. att\.|attuazione del) )\bc\.p\.c\.|codice di procedura civile/g, () => 'c.p.c.'],
  [/\bc\.c\.(?![a-z])|[Cc]odice civile/g, () => 'c.c.'],
  [/\bc\.p\.(?![a-z.])|[Cc]odice penale/g, () => 'c.p.'],
  [/\bGDPR\b|Regolamento (?:UE|\(UE\)) (?:n\.\s*)?2016\/679/g, () => 'GDPR'],
  [/\bCostituzione\b/g, () => 'Costituzione'],
];
// «art. 4, comma 2», «art. 33 c. 3», «artt. 24, 25 e 26», «articolo 18», «art. 8-bis».
const ART = /\b(?:artt?\.|articol[oi])\s*(\d+(?:-?(?:bis|ter|quater))?(?:\s*(?:,|e|-)\s*\d+(?:-?(?:bis|ter))?)*)(?:\s*,?\s*(?:commi|comma|c\.)\s*(\d+(?:-?(?:bis|ter|quater))?(?:\s*(?:,|e|-)\s*\d+)*))?/gi;

const testo = (f, s) => (f.endsWith('.html')
  ? s.replace(/<head>[\s\S]*?<\/head>/, (h) => h.match(/<title>[\s\S]*?<\/title>|content="[^"]*"/g)?.join(' ') ?? '')
    .replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'")
  : s).replace(/\s+/g, ' ');

function leggi(t) {
  const out = [];
  for (const [re, nome] of LEGGI) for (const m of t.matchAll(re)) out.push({ i: m.index, fine: m.index + m[0].length, nome: nome(m) });
  return out.sort((a, b) => a.i - b.i);
}

export function citazioni(t) {
  const ll = leggi(t);
  const out = [];
  for (const m of t.matchAll(ART)) {
    const fine = m.index + m[0].length;
    const n = m[1].replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ');
    const c = m[2] ? ` comma ${m[2].replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ')}` : '';
    // La legge dopo: entro 40 caratteri («art. 33 della L. 104/1992», «art. 4, comma 2, L. 24/2017»).
    let legge = ll.find((l) => l.i >= fine && l.i - fine <= 40 && !/[.;:]\s/.test(t.slice(fine, l.i)));
    // Se no, l'ultima prima, nella stessa frase o nelle 300 lettere prima («La legge … n. 104 … i permessi (art. 33)»).
    if (!legge) legge = [...ll].reverse().find((l) => l.fine <= m.index && m.index - l.fine <= 300);
    out.push(`art. ${n}${c} | ${legge ? legge.nome : '?'}`);
  }
  return out;
}

function tutte() {
  const dove = new Map();
  for (const f of files()) {
    const rel = path.relative(SITE, f).split(path.sep).join('/');
    for (const c of citazioni(testo(f, fs.readFileSync(f, 'utf8')))) {
      if (!dove.has(c)) dove.set(c, new Set());
      dove.get(c).add(rel);
    }
  }
  return dove;
}

test('il riconoscimento delle citazioni funziona', () => {
  assert.deepEqual(citazioni('art. 4, comma 2, L. 24/2017'), ['art. 4 comma 2 | L. 24/2017']);
  assert.deepEqual(citazioni('La legge 5 febbraio 1992, n. 104 prevede i permessi (art. 33).'), ['art. 33 | L. 104/1992']);
  assert.deepEqual(citazioni("l'art. 42, comma 5, del D.Lgs. 151/2001"), ['art. 42 comma 5 | D.Lgs. 151/2001']);
});

test('ogni citazione di legge è nell\'elenco delle citazioni rilette (tests/citazioni.txt)', () => {
  const dove = tutte();
  if (process.env.CITAZIONI === 'scrivi') {
    fs.writeFileSync(ELENCO, `# Citazioni di legge rilette sulla fonte (tests/citazioni.test.mjs). Una per riga: «art. N [comma M] | legge».\n${[...dove.keys()].sort().join('\n')}\n`);
  }
  const elenco = new Set(fs.readFileSync(ELENCO, 'utf8').split('\n').map((r) => r.trim()).filter((r) => r && !r.startsWith('#')));
  const nuove = [...dove.keys()].filter((c) => !elenco.has(c)).map((c) => `nuova citazione: rileggila sulla fonte e aggiungila a tests/citazioni.txt: «${c}» (${[...dove.get(c)].join(', ')})`);
  const vecchie = [...elenco].filter((c) => !dove.has(c)).map((c) => `«${c}» non è più sul sito: togli la riga da tests/citazioni.txt`);
  assert.deepEqual([...nuove, ...vecchie], []);
});
