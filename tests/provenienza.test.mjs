// Ogni cifra di legge nei file data/rules*.json ha la sua scheda nel blocco «provenienza»
// (docs/regola-cifre.md): la pagina ufficiale, il giorno del controllo, come è stata controllata
// e la data entro cui va ricontrollata. Come per i numeri di telefono (contatti.test.mjs):
// se un dato è senza scheda o la data di ricontrollo è passata, il test fallisce e il sito non va
// pubblicato. Se fallisce: ricontrolla la cifra sulla fonte e aggiorna la scheda, non il test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const site = new URL('../', import.meta.url);
const files = readdirSync(new URL('data/', site)).filter((f) => f.startsWith('rules') && f.endsWith('.json'));
const load = (f) => JSON.parse(readFileSync(new URL(`data/${f}`, site), 'utf8'));

// «testo»: letto il testo ufficiale per intero. «estratto»: solo l'estratto mostrato dal motore di ricerca
// o un pezzo della pagina. «secondaria»: una fonte non ufficiale (ASP, operatori, stampa) da confermare.
// «sito»: non è una regola di legge ma una scelta del sito (per esempio dopo quanti giorni sollecitare).
const PROVE = ['testo', 'estratto', 'secondaria', 'sito'];
const ISO = /^\d{4}-\d{2}-\d{2}$/;
// Si può far finta di essere in un altro giorno: OGGI=2027-02-01 npm test
const today = process.env.OGGI ? new Date(`${process.env.OGGI}T12:00:00Z`) : new Date();
const giorni = (iso) => Math.floor((new Date(`${iso}T12:00:00Z`) - today) / 86400000);

// Chiavi che non sono cifre di legge: fonti, date di controllo, icone, note interne.
const SALTA = new Set(['sources', 'provenienza', 'last_verified', 'icon', 'todo', 'notes_internal', 'screening_numbers', 'inps_contacts']);

// Tutte le cifre del file: numeri e date (AAAA-MM-GG), con il loro percorso («codes.E01.income_max»,
// «screening.pap.min»: negli elenchi si usa l'«id» dell'elemento, se c'è, altrimenti la posizione).
function cifre(v, dove, out) {
  if (Array.isArray(v)) v.forEach((x, i) => cifre(x, `${dove}.${x && x.id ? x.id : i}`, out));
  else if (v && typeof v === 'object') { for (const [k, x] of Object.entries(v)) if (!SALTA.has(k)) cifre(x, dove ? `${dove}.${k}` : k, out); }
  else if (typeof v === 'number' || (typeof v === 'string' && ISO.test(v))) out.push({ dove, valore: v });
  return out;
}

// Il percorso di una scheda vale per la cifra con lo stesso percorso e per tutto quello che sta sotto.
const copre = (scheda, dove) => dove === scheda || dove.startsWith(`${scheda}.`);
const esiste = (obj, percorso) => percorso.split('.').every((k) => {
  if (obj == null || typeof obj !== 'object') return false;
  obj = Array.isArray(obj) ? obj.find((x) => x && x.id === k) ?? obj[Number(k)] : obj[k];
  return obj !== undefined;
});

for (const file of files) {
  test(`${file}: ogni cifra ha fonte, data, prova e data di ricontrollo`, () => {
    const d = load(file);
    const prov = d.provenienza || {};
    const errori = [];
    for (const c of cifre(d, '', [])) {
      if (!Object.keys(prov).some((p) => copre(p, c.dove))) errori.push(`«${c.dove}» = ${c.valore}: manca la scheda in «provenienza»`);
    }
    for (const [p, s] of Object.entries(prov)) {
      if (!esiste(d, p)) { errori.push(`provenienza «${p}»: nel file non c'è nessun campo con questo nome`); continue; }
      if (!PROVE.includes(s.proof)) errori.push(`provenienza «${p}»: «proof» deve essere ${PROVE.join(' / ')}`);
      if (s.proof !== 'sito') {
        if (!s.url) errori.push(`provenienza «${p}»: manca «url», la pagina ufficiale da cui viene`);
        else if (!/^https:\/\//.test(s.url)) errori.push(`provenienza «${p}»: «url» deve iniziare con https://`);
      }
      if (!ISO.test(s.verified || '')) errori.push(`provenienza «${p}»: manca «verified» (AAAA-MM-GG)`);
      else if (giorni(s.verified) > 1) errori.push(`provenienza «${p}»: «verified» è nel futuro`);
      if (!ISO.test(s.review_by || '')) errori.push(`provenienza «${p}»: manca «review_by», la data entro cui ricontrollare`);
      else if (giorni(s.review_by) < 0) errori.push(`provenienza «${p}»: andava ricontrollata entro il ${s.review_by} (${-giorni(s.review_by)} giorni fa). Rileggi la fonte, poi aggiorna «verified» e «review_by»`);
    }
    assert.equal(errori.length, 0, `\n- ${errori.join('\n- ')}\n`);
  });
}

test('la provenienza non arriva agli utenti', () => {
  const js = readdirSync(new URL('js/', site)).filter((f) => f.endsWith('.js'));
  for (const f of js) assert.doesNotMatch(readFileSync(new URL(`js/${f}`, site), 'utf8'), /\.provenienza\b|\[['"]provenienza['"]\]/, `js/${f} legge il campo «provenienza»: è interno, non va mostrato`);
});

// Ogni file di regole ha almeno una fonte («sources»): è l'elenco «Da dove vengono queste informazioni»
// in fondo alla guida. Con «sources» vuoto la pagina resta senza fonti e nessuno se ne accorge (audit dei mutanti del 21/10/2026).
test('ogni file data/rules*.json ha almeno una fonte con url e nome', () => {
  for (const file of files) {
    const s = load(file).sources;
    assert.ok(Array.isArray(s) && s.length >= 1, `${file}: «sources» è vuoto: la guida resterebbe senza fonti`);
    for (const x of s) assert.ok(/^https:\/\//.test(x.url || '') && x.label, `${file}: fonte senza url https o senza nome (${JSON.stringify(x)})`);
  }
});

// Se la nota di una scheda riporta tra «…» la frase della fonte con una cifra, la cifra dei dati deve stare
// in quella frase. Così un dato cambiato insieme alla guida («551,53» → «515,53», coerente ma falso) non passa:
// la frase copiata dalla fonte resta quella vera (audit dei mutanti del 21/10/2026).
// Per una scheda che copre un gruppo di cifre basta che una delle cifre stia nella frase.
const comeNelTesto = (n) => {
  const [i, dec] = String(n).split('.');
  return [String(n), `${i.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}${dec ? `,${dec.padEnd(2, '0')}` : ''}`, String(n).replace('.', ',')];
};
const valore = (obj, percorso) => percorso.split('.').reduce((a, k) => (a == null ? a : Array.isArray(a) ? a.find((x) => x && x.id === k) ?? a[Number(k)] : a[k]), obj);
test('la cifra dei dati sta nella frase della fonte copiata nella nota', () => {
  const errori = [];
  for (const file of files) {
    const d = load(file);
    for (const [p, s] of Object.entries(d.provenienza || {})) {
      const frase = [...(s.nota || '').matchAll(/«([^»]*)»/g)].map((m) => m[1]).join(' | ');
      if (!/\d/.test(frase)) continue;
      const v = valore(d, p);
      const nums = typeof v === 'number' ? [v] : cifre(v, '', []).map((c) => c.valore).filter((x) => typeof x === 'number');
      if (!nums.length) continue;
      const c = (n) => comeNelTesto(n).some((x) => new RegExp(`(?<![\\d.,])${x.replace(/\./g, '\\.')}(?![\\d]|,\\d)`).test(frase));
      if (!nums.some(c)) errori.push(`${file} «${p}» = ${nums.join(', ')}: la nota cita «${frase.slice(0, 120)}». Rileggi la fonte: è sbagliato il dato o la nota?`);
    }
  }
  assert.deepEqual(errori, [], errori.join('\n'));
});
