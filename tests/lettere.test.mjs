// Le lettere già scritte non lasciano segnaposto da riempire a mano («[COMUNE]», «{{nome}}», «XXX»)
// né parole uscite dal programma («undefined», «null», «NaN»). Un campo che l'utente lascia vuoto
// diventa «__________», da scrivere a penna (audit dei mutanti del 21/10/2026).
// Due controlli: le funzioni di js/letters.js chiamate con i campi dell'utente vuoti, e i testi
// dei js che compongono le lettere (un «|| '[COMUNE]'» in js/medico.js non lo vede nessun'altra prova).
// Se fallisce: nel js usa «__________» (o blank() di letters.js) per il campo vuoto.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import * as L from '../js/letters.js';

// «null» ma non «annullare», «nulla»; «undefined»; «NaN»; segnaposto in maiuscolo tra quadre; {{…}}; XXX.
const SEGNAPOSTO = /\[[A-ZÀ-Ü][A-ZÀ-Ü ]{2,}\]|\{\{|\}\}|XXX|undefined|\bnull(?![a-zà-ù])|\bNaN\b|\[object /;
const trova = (s) => { const m = String(s).match(SEGNAPOSTO); return m && `«${m[0]}» in …${String(s).slice(Math.max(0, m.index - 60), m.index + 30)}…`; };

const oggi = '2026-10-21';
const vuota = { fullName: '', birthPlace: '', birthDate: '', cf: '', address: '', phone: '', email: '', city: '' };
// Le persone: tutto vuoto; nessun campo; chi scrive per un altro (delegato, genitore, tutore) senza i suoi dati.
const persone = [vuota, {}, { ...vuota, isDelegate: true }, { ...vuota, isDelegate: true, delegateRole: 'genitore' }, { ...vuota, isDelegate: true, delegateRole: 'tutore', guardianKind: 'amministratore', decreeRef: '' }];
// I campi che vengono dai dati o dal percorso (nome dell'azienda, classe, termini) ci sono sempre; quelli
// che scrive l'utente (nome, ricetta, protocollo, prestazione, date facoltative) sono vuoti.
const casi = {
  tutelaLetter: [
    { aspName: 'Palermo', cls: 'B', maxDays: 10, bookingDate: '2026-09-01', appointmentDate: '2026-12-01', deadline: '2026-09-11', today: oggi },
    { aspName: 'Palermo', cls: 'D', maxDays: 30, noDateOffered: true, requestDate: '', today: oggi },
    { aspName: 'Palermo', cls: 'P', maxDays: 120, noDateOffered: true, requestDate: '2026-09-01', callbackDays: 10, callbackDeadline: '2026-09-11', today: oggi },
  ],
  tutelaReminder: [{ aspName: 'Palermo', cls: 'B', firstRequestDate: '', today: oggi }],
  inpsReminder: [
    { provinceName: 'Palermo', regime: 'new', category: 'other', certDate: '2026-09-01', deadlineInfo: { days: 30, legal: 'art. 7, D.Lgs. 62/2024', deadline: '2026-10-01' }, today: oggi },
    { provinceName: 'Palermo', regime: 'old', category: 'other', certDate: '2026-09-01', domandaDate: '', deadlineInfo: { days: 30 }, today: oggi },
    { provinceName: 'Palermo', regime: 'old', category: 'oncological', certDate: '2026-09-01', domandaDate: '2026-09-02', deadlineInfo: { days: 15, legal: 'art. 6, c. 3-bis, D.L. 4/2006', deadline: '2026-09-17' }, today: oggi },
  ],
  cartellaReminder: [{ requestDate: '', deadline: '', today: oggi }, { structure: 'Ospedale', what: 'referti o immagini', requestDate: '2026-09-01', deadline: '2026-09-08', today: oggi }],
  ausiliReminder: [{ aspName: 'Palermo', requestDate: '', deadline: '', today: oggi }],
  genericRequest: [{ to: '', subject: 'Richiesta', request: 'una risposta scritta.', today: oggi }, { to: 'Distretto', subject: 'Richiesta', premise: ['una premessa'], request: 'x', today: oggi }],
};

test('ogni lettera di js/letters.js è provata qui', () => {
  // Non sono lettere: il link mailto e le parti su chi scrive per un altro (provate con ogni lettera qui sotto).
  // doctorName e districtLine: pezzi dell'intestazione e delle premesse, provati più sotto.
  // zoneLettera, nomeZona, conZona, intestazioneDi: aziende e zone, provate in tests/aziende.test.mjs.
  const lettere = Object.keys(L).filter((k) => !['mailtoHref', 'delegateRole', 'delegateAttachment', 'doctorName', 'districtLine', 'zoneLettera', 'nomeZona', 'conZona', 'intestazioneDi'].includes(k));
  assert.deepEqual(lettere.filter((k) => !casi[k]), [], 'lettera nuova: aggiungi i suoi casi in tests/lettere.test.mjs');
});

test('le lettere con i campi dell\'utente vuoti non hanno segnaposto né «undefined»', () => {
  const errori = [];
  for (const [nome, lista] of Object.entries(casi)) {
    for (const c of lista) for (const person of persone) {
      const testo = L[nome]({ ...c, person });
      const e = trova(testo);
      if (e) errori.push(`${nome}: ${e}`);
      if (!/__________/.test(testo)) errori.push(`${nome}: con i campi vuoti non c'è nessun «__________» da riempire`);
    }
  }
  assert.deepEqual([...new Set(errori)], []);
});

test('nei js nessun segnaposto tipo «[COMUNE]» o «{{nome}}» al posto di un campo vuoto', () => {
  const errori = [];
  for (const f of readdirSync(new URL('../js/', import.meta.url)).filter((x) => x.endsWith('.js'))) {
    readFileSync(new URL(`../js/${f}`, import.meta.url), 'utf8').split('\n').forEach((riga, i) => {
      // Solo dentro le stringhe: un «|| '[COMUNE]'», un «{{nome}}» o «XXX» in un testo.
      if (/['"`][^'"`\n]*(\[[A-ZÀ-Ü][A-ZÀ-Ü ]{2,}\]|\{\{\s*\w+\s*\}\}|XXX)[^'"`\n]*['"`]/.test(riga)) errori.push(`js/${f}:${i + 1}: ${riga.trim().slice(0, 140)}`);
    });
  }
  assert.deepEqual(errori, [], `Segnaposto nei js (usa «__________»):\n${errori.join('\n')}`);
});

// mailtoHref: l'indirizzo scritto da chi usa il sito (Cartella clinica: «Email o PEC dell'ospedale») non deve
// poter aggiungere destinatari o campi (?cc=, &bcc=, &body=) né spezzare il link (#, %, spazi). Audit giro 6.
test('mailtoHref: niente campi in più dall\'indirizzo', () => {
  for (const to of ['a@b.it?cc=x@evil.example', 'a@b.it&bcc=x@evil.example', 'a@b.it?body=altro', 'a@b.it#x', 'a@b.it%0Abcc:x@evil.example', 'a @b.it', 'a@b.it;x@evil.example', '<a@b.it>']) {
    const h = L.mailtoHref(to, 'Oggetto', 'Testo\nriga 2');
    const q = new URL(h).search.slice(1).split('&').map((x) => x.split('=')[0]);
    assert.deepEqual(q, ['subject', 'body'], `${to} → ${h}`);
    assert.doesNotMatch(decodeURIComponent(h.slice(7).split('?')[0]), /[?&#\s]|cc|bcc/i, `${to} → ${h}`);
  }
  assert.equal(L.mailtoHref('urp@asp.it', 'S', 'B'), 'mailto:urp@asp.it?subject=S&body=B');
  assert.equal(L.mailtoHref(' urp@asp.it ', 'S', 'B'), 'mailto:urp@asp.it?subject=S&body=B');
  assert.equal(L.mailtoHref('a@pec.it,b@pec.it', 'S', ''), 'mailto:a@pec.it,b@pec.it?subject=S');
  assert.equal(L.mailtoHref('', 'S', ''), 'mailto:?subject=S');
});

test('mailtoHref: tutti gli indirizzi dei dati (data/) restano nel link', () => {
  const dir = new URL('../data/', import.meta.url);
  const indirizzi = new Set();
  const visita = (x) => {
    if (typeof x === 'string') { if (/^\S+@\S+$/.test(x.trim())) indirizzi.add(x); } else if (x && typeof x === 'object') Object.values(x).forEach(visita);
  };
  for (const f of readdirSync(dir, { recursive: true }).filter((x) => x.endsWith('.json'))) visita(JSON.parse(readFileSync(new URL(f, dir), 'utf8')));
  assert.ok(indirizzi.size > 50, `trovati solo ${indirizzi.size} indirizzi in data/`);
  const persi = [...indirizzi].filter((a) => L.mailtoHref(a, 'S', '') !== `mailto:${a.trim()}?subject=S`);
  assert.deepEqual(persi, [], 'indirizzi dei dati che mailtoHref toglie');
});

// Audit del 22/10/2026, giro 8 (lettere stampate): la PEC chiesta nel modulo non arrivava nella lettera, la firma
// non diceva chi firma, «dott. dott.» e «Distretto – Distretto», righe spezzate a mano in mezzo alla frase.
const persona = { fullName: 'Maria Rossi', birthPlace: 'Palermo', birthDate: '1950-01-02', cf: 'RSSMRA50A42G273X', address: 'Via Roma 1, Palermo', phone: '333', email: 'm@example.it', city: 'Palermo' };
const tutte = (person) => Object.entries(casi).flatMap(([nome, lista]) => lista.map((c) => [nome, L[nome]({ ...c, person })]));

test('la PEC scritta nel modulo è nei dati di chi scrive', () => {
  for (const [nome, t] of tutte({ ...persona, pec: 'maria.rossi@pec.example.it' })) {
    assert.match(t, /email m@example\.it, PEC maria\.rossi@pec\.example\.it,/, nome);
  }
  for (const [nome, t] of tutte(persona)) assert.doesNotMatch(t, /PEC/, `${nome}: «PEC» senza la PEC`);
});

test('la firma dice chi firma: la persona, o chi scrive per lei con il suo ruolo', () => {
  const firma = (t) => t.slice(t.lastIndexOf('Firma'));
  for (const [nome, t] of tutte(persona)) {
    assert.match(firma(t), /^Firma _+\n\s*Maria Rossi\n$/, nome);
    assert.match(t, /Palermo, \d{2}\/\d{2}\/\d{4}\n\n\s*Firma/, `${nome}: luogo e data sopra la firma`);
  }
  const chi = { ...persona, isDelegate: true, delegateName: 'Anna Rossi', delegateCf: 'X' };
  for (const [role, kind, scritto] of [['delegato', undefined, 'delegato/a'], ['genitore', undefined, 'genitore'], ['tutore', 'tutore', 'tutore'], ['tutore', 'amministratore', 'amministratore di sostegno']]) {
    for (const [nome, t] of tutte({ ...chi, delegateRole: role, guardianKind: kind })) {
      assert.match(firma(t), new RegExp(`^Firma di Anna Rossi \\(${scritto}\\)\\n\\s*_+\\n$`), `${nome} (${role})`);
    }
  }
  // Senza il nome del delegato: lo spazio per scriverlo a penna.
  assert.match(L.genericRequest({ to: 'X', subject: 'S', request: 'r', person: { isDelegate: true }, today: oggi }), /Firma di __________ \(delegato\/a\)/);
});

test('ogni frase e ogni punto «- » su una riga sola (in stampa va a capo da sé)', () => {
  const p = { ...persona, pec: 'p@pec.it', idDoc: 'CA123', isDelegate: true, delegateName: 'Anna Rossi', delegateCf: 'X' };
  for (const [nome, t] of tutte(p)) {
    const righe = t.split('\n');
    righe.forEach((r, i) => {
      assert.doesNotMatch(r, /^ {1,4}\S/, `${nome}: riga col rientro «${r}»`);
      if (i + 1 < righe.length && /^[a-zà-ù(]/.test(righe[i + 1])) assert.match(r, /[;:.,]$|^$|^[A-Z ]+$/, `${nome}: frase spezzata «…${r.slice(-30)}» / «${righe[i + 1].slice(0, 30)}…»`);
    });
  }
});

test('nome del medico e distretto: niente titolo o «Distretto» ripetuti', () => {
  assert.equal(L.doctorName('Salvatore Rossi'), 'dott. Salvatore Rossi');
  for (const n of ['dott. Rossi', 'Dott Rossi', 'dott.ssa Anna Rossi', 'Dr. Rossi', 'dr Rossi', 'prof. Verdi', 'Prof.ssa Verdi']) assert.equal(L.doctorName(` ${n} `), n);
  assert.equal(L.doctorName('Drago Rossi'), 'dott. Drago Rossi');
  assert.equal(L.doctorName(''), '');
  assert.equal(L.districtLine('Bagheria'), 'Distretto – Bagheria');
  assert.equal(L.districtLine('Distretto di Bagheria'), 'Distretto di Bagheria');
  assert.equal(L.districtLine('distretto sanitario 42'), 'distretto sanitario 42');
  assert.equal(L.districtLine(' '), '');
});

test('sollecito del percorso di tutela: allega anche la delega o il decreto', () => {
  const t = L.tutelaReminder({ aspName: 'Palermo', cls: 'B', firstRequestDate: '2026-10-01', today: oggi, person: { ...persona, isDelegate: true, delegateRole: 'tutore' } });
  assert.match(t, /Allega: copia della richiesta del 01\/10\/2026 e relativi allegati; copia del decreto di nomina/);
});

test('ausili: «su prescrizione di …», non «del/della»', () => {
  const t = L.ausiliReminder({ aspName: 'Palermo', person: persona, prescriber: "dott.ssa Anna Dell'Utri, fisiatra", requestDate: '2026-10-01', deadline: '2026-10-21', today: oggi });
  assert.match(t, /su prescrizione di dott\.ssa Anna Dell'Utri, fisiatra;/);
  assert.doesNotMatch(t, /del\/della/);
});
