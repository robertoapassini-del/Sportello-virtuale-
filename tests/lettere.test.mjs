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
  const lettere = Object.keys(L).filter((k) => !['mailtoHref', 'delegateRole', 'delegateAttachment'].includes(k));
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
