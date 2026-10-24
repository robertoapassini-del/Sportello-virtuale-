// La ricerca della home (js/cerca.js): il risultato giusto deve essere il primo.
// Ogni coppia viene da un caso reale (audit della ricerca): ordine, pezzi di parola,
// parole vuote, accenti, errori di battitura, parole comuni senza risultati.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cerca, paroleRicerca } from '../js/cerca.js';

const site = new URL('../', import.meta.url);
const read = (f) => readFileSync(new URL(f, site), 'utf8');
const reg = JSON.parse(read('data/moduli.json'));
// La voce «Numeri utili» è in js/home.js (NUMERI): ne leggiamo le parole chiave.
const home = read('js/home.js');
const kw = home.match(/const NUMERI = \{[\s\S]*?keywords: '([^']*)'/);
assert.ok(kw, 'js/home.js: non trovo NUMERI.keywords');
const NUMERI = { id: 'numeri-utili', icon: '📞', title: 'Numeri utili', small: 'Guardia medica, CUP, ASL, INPS', keywords: kw[1] };
const voci = [NUMERI, ...reg.modules];
const ids = (q) => cerca(q, voci).map((r) => r.id);
const primo = (q) => ids(q)[0];

const CASI = [
  ['casa di riposo', 'rsa'],
  ['ospizio', 'rsa'],
  ['RSA', 'rsa'],
  ['dentista gratis', 'dentista'],
  ['medico di base', 'medico-famiglia'],
  ['pediatra', 'medico-famiglia'],
  ['la mia carrozzina non arriva', 'ausili'],
  ['carozzina', 'ausili'],
  ['pannolini', 'ausili'],
  ['sedia a rotelle', 'ausili'],
  ['invalidità', 'invalidita'],
  ['invalidita', 'invalidita'],
  ['invalidta', 'invalidita'],
  ['legge 104', 'legge-104'],
  ['104', 'legge-104'],
  ['cup', 'prenotare-cup'],
  ['tiket', 'esenzione-ticket'],
  ['esenzone', 'esenzione-ticket'],
  ['esenzione per reddito', 'esenzione-ticket'],
  ['pensionato', 'esenzione-ticket'],
  ['accompagnamneto', 'accompagnamento'],
  ['adi', 'assistenza-domiciliare'],
  ['ossigeno', 'assistenza-domiciliare'],
  ['badante', 'assistenza-domiciliare'],
  ['alzheimer', 'assistenza-domiciliare'],
  ['demenza', 'assistenza-domiciliare'],
  ['riabilitazione', 'assistenza-domiciliare'],
  ['pronto soccorso', 'pronto-soccorso'], // dal 24/10/2026 c'è la pagina; prima portava ai numeri utili
  ['codice bianco', 'pronto-soccorso'],
  ['visita fiscale', 'visita-fiscale'],
  ['certificato di malattia', 'certificato-malattia'],
  ['ambulanza', 'numeri-utili'],
  ['urgente', 'numeri-utili'],
  ['guardia medica', 'numeri-utili'],
  ['psicologo', 'psicologo'],
  ['cartella clinica', 'cartella-clinica'],
  ['visita troppo lontana', 'liste-attesa'],
  ['tessera persa', 'tessera-sanitaria'],
  ['Tessera sanitaria scaduta', 'tessera-sanitaria'],
  ['contrassegno auto', 'contrassegno-disabili'],
  ['hospice', 'cure-palliative'],
  ['ricorso verbale', 'ricorso-invalidita'],
  ['vaccino influenza', 'prevenzione'],
  // Audit giro 5: scenari reali. Chi esce dall'ospedale cerca aiuto a casa, non la cartella.
  ['mia madre esce dall ospedale', 'assistenza-domiciliare'],
  ['dimessa dall ospedale', 'assistenza-domiciliare'],
  ['mamma esce dall ospedale non cammina', 'assistenza-domiciliare'],
  // Chi vuole prenotare un esame cerca il CUP, non i tempi d'attesa.
  ['prenotare una tac', 'prenotare-cup'],
  ['prenotare risonanza', 'prenotare-cup'],
  ['prenotare ecografia', 'prenotare-cup'],
  // Ricerche frequenti in tutta Italia (docs/ricerche-frequenti.md, 23/10/2026).
  ['impegnativa', 'prenotare-cup'],
  ['disdire prenotazione', 'prenotare-cup'],
  ['ats', 'numeri-utili'],
  ['ulss', 'numeri-utili'],
  ['azienda sanitaria', 'numeri-utili'],
  ['116117', 'numeri-utili'],
  ['farmacia di turno', 'numeri-utili'],
  ['pensione invalidità', 'invalidita'],
  ['assegno invalidità', 'invalidita'],
  ['importo accompagnamento', 'accompagnamento'],
  ['permessi 104', 'legge-104'],
  ['congedo straordinario', 'legge-104'],
  ['fascicolo sanitario', 'fascicolo-e-ricetta'],
  ['ricetta elettronica', 'fascicolo-e-ricetta'],
  ['cambio medico', 'medico-famiglia'],
  ['scelta in deroga', 'medico-famiglia'],
  ['rinnovo esenzione', 'esenzione-ticket'],
  ['esenzione over 65', 'esenzione-ticket'],
  ['tessera sanitaria smarrita', 'tessera-sanitaria'],
  ['pass disabili', 'contrassegno-disabili'],
  // Google Trends Italia e 7 regioni, 23/10/2026: le frasi più cercate e in crescita.
  ['fse', 'fascicolo-e-ricetta'],
  ['fascicolo sanitario lombardia', 'fascicolo-e-ricetta'],
  ['come accedere al fascicolo sanitario', 'fascicolo-e-ricetta'],
  ['cup online', 'prenotare-cup'],
  ['numero prenotazione cup', 'prenotare-cup'],
  ['annullare prenotazione cup', 'prenotare-cup'],
  ['stampa prenotazione cup', 'prenotare-cup'],
  ['cambio medico di base vicino a me', 'medico-famiglia'],
  ['cambio medico curante', 'medico-famiglia'],
  ['cambio residenza', 'medico-famiglia'],
  ['rinnovo esenzione ticket 2026', 'esenzione-ticket'],
  ['quando scade esenzione ticket', 'esenzione-ticket'],
  ['esenzione e02', 'esenzione-ticket'],
];

test(`almeno 35 ricerche hanno il risultato giusto per primo`, () => {
  assert.ok(CASI.length >= 35);
  const sbagliate = CASI.filter(([q, id]) => primo(q) !== id).map(([q, id]) => `«${q}»: atteso ${id}, primo ${primo(q)} (${ids(q).slice(0, 4).join(', ')})`);
  assert.deepEqual(sbagliate, []);
});

test('ricetta scaduta: piano terapeutico o fascicolo e ricetta', () => {
  assert.ok(['piano-terapeutico', 'fascicolo-e-ricetta'].includes(primo('ricetta scaduta')), primo('ricetta scaduta'));
});

test('parole corte solo intere: niente pezzi di parola', () => {
  assert.ok(!ids('rsa').includes('tessera-sanitaria'), 'rsa trova «persa»');
  assert.ok(!ids('cup').includes('esenzione-ticket'), 'cup trova «disoccupato»');
  assert.ok(!ids('adi').includes('cartella-clinica'), 'adi trova «radiografia»');
  assert.ok(!ids('eco').some((id) => id.startsWith('assegno-inclusione')), 'eco trova «economico»');
});

test('le parole vuote non contano', () => {
  const r = ids('esenzione per reddito');
  assert.ok(r.length <= 5, `${r.length} risultati: ${r.join(', ')}`);
  assert.equal(r[0], 'esenzione-ticket');
  assert.deepEqual(paroleRicerca('la mia carrozzina non arriva'), ['carrozzina', 'arriva']);
  assert.deepEqual(cerca('per non del', voci), []);
});

test('accenti e maiuscole non contano', () => {
  assert.deepEqual(ids('INVALIDITÀ'), ids('invalidita'));
  assert.deepEqual(ids('età'), ids('eta'));
});

test('le pagine corte stanno subito sotto il loro modulo', () => {
  for (const q of ['esenzione', 'medico di base', 'ossigeno', 'cup', 'tessera persa']) {
    const r = ids(q);
    r.forEach((id, i) => {
      if (!id.includes('/')) return;
      const mod = id.split('/')[0];
      if (!r.includes(mod)) return; // modulo non trovato: la pagina sta da sola
      const prev = r[i - 1];
      assert.ok(prev === mod || prev.startsWith(`${mod}/`), `«${q}»: ${id} non è sotto ${mod} (${r.join(', ')})`);
    });
  }
});

test('le pagine corte si trovano ancora per titolo', () => {
  assert.ok(ids('hospice').length >= 1);
  assert.equal(primo('dimissione protetta'), 'assistenza-domiciliare');
  assert.ok(ids('dimissione protetta').includes('assistenza-domiciliare/dimissione-protetta'));
  assert.ok(ids('TEAM estero').includes('tessera-sanitaria/estero'));
});

test('ogni modulo si trova cercando il suo titolo', () => {
  for (const m of reg.modules) assert.equal(primo(m.title), m.id, m.title);
});

test('risultati con link alla cartella', () => {
  for (const r of cerca('esenzione', voci)) assert.match(r.href, /^[a-z0-9-]+\/([a-z0-9-]+\/)?$/);
});
