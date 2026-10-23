// Statistiche anonime (GoatCounter, js/common.js count()): servono a capire cosa cercano le persone
// (docs/ricerche-frequenti.md), ma la privacy promette che non vediamo mai cosa scrivono.
// Qui: i nomi degli eventi, nessuna parola scritta nei conteggi, la pagina privacy che li descrive.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { eventoUtile, eventoRicerca, eventoClic, idRegioneScelta } from '../js/common.js';

const site = new URL('../', import.meta.url);
const read = (f) => readFileSync(new URL(f, site), 'utf8');

test('nomi degli eventi: pagina, risposta e regione', () => {
  assert.equal(eventoUtile('no', '/esenzione-ticket/', 'lombardia'), 'utile-no/esenzione-ticket/lombardia');
  assert.equal(eventoUtile('si', '/esenzione-ticket/index.html', 'sicilia'), 'utile-si/esenzione-ticket/sicilia');
  assert.equal(eventoUtile('si', '/privacy.html', ''), 'utile-si/privacy.html/nessuna');
  assert.equal(eventoUtile('si', '/', null), 'utile-si/nessuna');
  assert.equal(eventoRicerca('vuota', 'valle-d-aosta'), 'ricerca-vuota/valle-d-aosta');
  assert.equal(eventoRicerca('fatta', ''), 'ricerca-fatta/nessuna');
  assert.equal(eventoClic('legge-104'), 'ricerca-clic/legge-104');
  assert.equal(eventoClic('invalidita/domanda'), 'ricerca-clic/invalidita/domanda');
});

// 23/10/2026: sulle pagine che non caricano l'elenco delle regioni (legge-104/) il «No» arrivava con «nessuna».
test('la regione dei conteggi si legge dal browser, senza l\'elenco delle regioni', () => {
  const prima = globalThis.localStorage;
  globalThis.localStorage = { getItem: (k) => (k === 'gs-regione' ? 'lombardia' : null), setItem() {} };
  try { assert.equal(idRegioneScelta(), 'lombardia'); } finally { globalThis.localStorage = prima; }
});

test('nei conteggi non entra mai un testo scritto', () => {
  // Anche se arrivasse un testo libero al posto della regione o del modulo, non passa.
  assert.equal(eventoRicerca('mia madre ha il cancro', 'mia madre ha il cancro'), 'ricerca-fatta/nessuna');
  assert.equal(eventoUtile('no', '/', 'Mario Rossi'), 'utile-no/nessuna');
  assert.equal(eventoClic('tumore al seno'), 'ricerca-clic/altro');
});

test('nei js, count() non riceve la ricerca né i campi dei moduli', () => {
  const brutti = [];
  for (const f of readdirSync(new URL('js/', site)).filter((n) => n.endsWith('.js'))) {
    const src = read(`js/${f}`);
    const re = /\bcount\(([^;]*)\);/g;
    let m;
    while ((m = re.exec(src))) {
      if (/\.value\b|\bq\b|\btext\b|\bhq\b|location\.(hash|search|href)/.test(m[1])) brutti.push(`js/${f}: count(${m[1]})`);
    }
  }
  assert.deepEqual(brutti, []);
});

test('la pagina privacy descrive i conteggi della ricerca e la regione', () => {
  const p = read('privacy.html');
  assert.match(p, /ricerche restano senza risultati/);
  assert.match(p, /mai le parole che scrivi/);
  assert.match(p, /con la regione che hai scelto/);
});
