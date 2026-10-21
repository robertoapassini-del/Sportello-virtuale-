import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  parseDate, daysBetween, addDays, formatIt, checkWaiting, callbackDeadline,
  invRegime, invDeadline, maxWaitDays, art,
} from '../js/engine.js';
import { tutelaLetter, inpsReminder, mailtoHref } from '../js/letters.js';

const load = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const rules = load('../data/rules.json');
const rulesInv = load('../data/rules-invalidita.json');
const asp = load('../data/regioni/sicilia/asp.json');
const inps = load('../data/regioni/sicilia/inps.json');

test('date helpers', () => {
  assert.equal(parseDate('2026-02-31'), null);
  assert.equal(parseDate('18/10/2026'), null);
  assert.equal(daysBetween('2026-10-18', '2026-10-28'), 10);
  assert.equal(daysBetween('2026-03-28', '2026-03-30'), 2); // across DST change
  assert.equal(addDays('2026-12-25', 10), '2027-01-04');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29'); // leap year
  assert.equal(formatIt('2026-10-18'), '18/10/2026');
});

test("«il 18/10» ma «l'11/10» e «l'08/10»", () => {
  assert.equal(art('il', '2026-10-18'), 'il ');
  assert.equal(art('il', '2026-10-11'), "l'");
  assert.equal(art('il', '2026-10-08'), "l'");
  assert.equal(art('il', '2026-10-01'), 'il ');
  assert.equal(art('del', '2026-10-11'), "dell'");
  assert.equal(art('al', '2026-10-08'), "all'");
  assert.equal(art('fino al', '2026-11-11'), "fino all'");
  assert.equal(art('il', ''), 'il ');
  assert.equal(art('il', undefined), 'il ');
});

test('max wait per class', () => {
  assert.equal(maxWaitDays(rules, 'U'), 3);
  assert.equal(maxWaitDays(rules, 'B'), 10);
  assert.equal(maxWaitDays(rules, 'D', 'visit'), 30);
  assert.equal(maxWaitDays(rules, 'D', 'exam'), 60);
  assert.equal(maxWaitDays(rules, 'D'), null); // D needs visit/exam
  assert.equal(maxWaitDays(rules, 'P'), 120);
});

const cases = [
  // [cls, kind, limit]
  ['U', null, 3],
  ['B', null, 10],
  ['D', 'visit', 30],
  ['D', 'exam', 60],
  ['P', null, 120],
];

for (const [cls, kind, limit] of cases) {
  const label = kind ? `${cls}-${kind}` : cls;
  const booking = '2026-10-01';

  test(`${label}: same day is within`, () => {
    const r = checkWaiting(rules, { cls, kind, bookingDate: booking, appointmentDate: booking });
    assert.equal(r.status, 'within');
    assert.equal(r.days, 0);
  });

  test(`${label}: exactly at limit is within`, () => {
    const r = checkWaiting(rules, { cls, kind, bookingDate: booking, appointmentDate: addDays(booking, limit) });
    assert.equal(r.status, 'within');
    assert.equal(r.days, limit);
  });

  test(`${label}: one day over is exceeded`, () => {
    const r = checkWaiting(rules, { cls, kind, bookingDate: booking, appointmentDate: addDays(booking, limit + 1) });
    assert.equal(r.status, 'exceeded');
    assert.equal(r.excess, 1);
    assert.equal(r.deadline, addDays(booking, limit));
  });
}

test('appointment before booking is an error', () => {
  const r = checkWaiting(rules, { cls: 'B', bookingDate: '2026-10-10', appointmentDate: '2026-10-01' });
  assert.equal(r.status, 'error');
  assert.equal(r.error, 'order');
});

test('call-back deadlines (Result C)', () => {
  assert.deepEqual(callbackDeadline(rules, { cls: 'B', requestDate: '2026-10-01', today: '2026-10-06' }),
    { status: 'waiting', days: 5, deadline: '2026-10-06' });
  assert.equal(callbackDeadline(rules, { cls: 'B', requestDate: '2026-10-01', today: '2026-10-07' }).status, 'passed');
  assert.equal(callbackDeadline(rules, { cls: 'D', kind: 'visit', requestDate: '2026-10-01' }).days, 10);
  assert.equal(callbackDeadline(rules, { cls: 'D', kind: 'exam', requestDate: '2026-10-01' }).days, 15);
  assert.equal(callbackDeadline(rules, { cls: 'P', requestDate: '2026-10-01' }).days, 30);
  assert.equal(callbackDeadline(rules, { cls: 'U', requestDate: '2026-10-01' }).status, 'none');
  assert.equal(callbackDeadline(rules, { cls: 'P' }).status, 'no_date');
});

test('invalidità: regime by province and date', () => {
  const pa = inps.provinces.find((p) => p.id === 'palermo');
  const ct = inps.provinces.find((p) => p.id === 'catania');
  const tp = inps.provinces.find((p) => p.id === 'trapani');
  assert.equal(invRegime(pa, '2025-10-01'), 'new');
  assert.equal(invRegime(pa, '2025-09-29'), 'old');
  assert.equal(invRegime(ct, '2026-03-01'), 'new');
  assert.equal(invRegime(ct, '2026-02-28'), 'old');
  assert.equal(invRegime(tp, '2026-10-01'), 'old');
  assert.equal(invRegime(tp, '2027-01-01'), 'new');
});

test('invalidità: new regime deadlines 15/30/90', () => {
  const base = { regime: 'new', certDate: '2026-07-01', today: '2026-10-18' };
  const onc = invDeadline(rulesInv, { ...base, category: 'oncological' });
  assert.equal(onc.deadline, '2026-07-16');
  assert.equal(onc.status, 'passed');
  assert.equal(invDeadline(rulesInv, { ...base, category: 'minor' }).deadline, '2026-07-31');
  const other = invDeadline(rulesInv, { ...base, category: 'other' });
  assert.equal(other.deadline, '2026-09-29');
  assert.equal(other.status, 'passed');
  assert.equal(other.daysLate, 19);
  assert.equal(invDeadline(rulesInv, { ...base, category: 'other', today: '2026-09-29' }).status, 'waiting');
});

test('invalidità: old regime', () => {
  const dom = invDeadline(rulesInv, { regime: 'old', category: 'other', certDate: '2026-09-01', today: '2026-10-18' });
  assert.equal(dom.kind, 'domanda');
  assert.equal(dom.deadline, '2026-11-30');
  assert.equal(dom.status, 'waiting');
  const onc = invDeadline(rulesInv, { regime: 'old', category: 'oncological', certDate: '2026-09-01', domandaDate: '2026-09-10', today: '2026-10-18' });
  assert.equal(onc.kind, 'visit');
  assert.equal(onc.deadline, '2026-09-25');
  assert.equal(onc.status, 'passed');
  const ord = invDeadline(rulesInv, { regime: 'old', category: 'other', certDate: '2026-09-01', domandaDate: '2026-09-10', today: '2026-10-18' });
  assert.equal(ord.indicative, true);
  assert.equal(ord.deadline, '2026-10-10');
  assert.equal(invDeadline(rulesInv, { regime: 'old', category: 'other', certDate: '2026-09-10', domandaDate: '2026-09-01' }).error, 'order');
  // Domanda fatta oltre i 90 giorni dal certificato: niente sollecito «regolare», è il caso del tempo finito.
  const t = '2026-10-18';
  const late = invDeadline(rulesInv, { regime: 'old', category: 'other', certDate: addDays(t, -200), domandaDate: addDays(t, -40), today: t });
  assert.equal(late.kind, 'domanda');
  assert.equal(late.status, 'passed');
  assert.equal(late.lateDomanda, true);
  assert.equal(late.deadline, addDays(t, -200 + rulesInv.old_regime.domanda_window_days));
  assert.equal(late.daysLate, 200 - 40 - rulesInv.old_regime.domanda_window_days);
  // Al 90° giorno la domanda vale ancora.
  const ok = invDeadline(rulesInv, { regime: 'old', category: 'other', certDate: '2026-06-01', domandaDate: addDays('2026-06-01', rulesInv.old_regime.domanda_window_days), today: t });
  assert.equal(ok.kind, 'visit');
  assert.equal(invDeadline(rulesInv, { regime: 'new', category: 'other', certDate: '2026-12-01', today: '2026-10-18' }).error, 'future');
});

test('data files are complete', () => {
  assert.equal(asp.asl.length, 9);
  assert.equal(inps.provinces.length, 9);
  const required = ['id', 'name', 'channel', 'emails', 'pec', 'form_url', 'info_url', 'portal_url', 'phones',
    'fast_track', 'documents_required', 'notes', 'last_verified', 'status', 'letter_mode'];
  for (const a of asp.asl) {
    for (const k of required) assert.ok(k in a, `${a.id} missing ${k}`);
    assert.ok(['email', 'pec', 'online_portal', 'urp', 'mixed'].includes(a.channel), a.id);
    assert.ok(['verified', 'partial', 'todo'].includes(a.status), a.id);
    assert.ok(parseDate(a.last_verified), a.id);
  }
});

test('letters fill in the facts', () => {
  const person = { fullName: 'Maria Rossi', cf: 'RSSMRA50A41G273X', city: 'Palermo' };
  const t = tutelaLetter({ aspName: 'Palermo', person, service: 'Visita cardiologica', nre: '190A1', cls: 'B', maxDays: 10,
    bookingDate: '2026-10-01', appointmentDate: '2026-11-20', today: '2026-10-18' });
  assert.match(t, /Maria Rossi/);
  assert.match(t, /classe di priorità B/);
  assert.match(t, /01\/10\/2026/);
  assert.match(t, /20\/11\/2026/);
  assert.doesNotMatch(t, /delegato\/a dell'assistito/);
  const d = tutelaLetter({ aspName: 'Palermo', person: { ...person, isDelegate: true, delegateName: 'Luca Rossi' },
    cls: 'B', maxDays: 10, bookingDate: '2026-10-01', appointmentDate: '2026-11-20', today: '2026-10-18' });
  assert.match(d, /Luca Rossi/);
  const i = inpsReminder({ provinceName: 'Palermo', person, certNumber: 'X1', certDate: '2026-07-01', regime: 'new',
    deadlineInfo: { legal: 'art. 6 D.Lgs. 62/2024', days: 90, deadline: '2026-09-29' }, today: '2026-10-18' });
  assert.match(i, /D\.Lgs\. 62\/2024/);
  assert.match(i, /29\/09\/2026/);
  assert.ok(mailtoHref('a@b.it', 'Oggetto è', 'ciao').startsWith('mailto:a@b.it?subject=Oggetto%20%C3%A8&body=ciao'));
});

test('lettere lette da chi le riceve (audit del 21/10/2026)', async () => {
  const { cartellaReminder, ausiliReminder, tutelaReminder } = await import('../js/letters.js');
  const person = { fullName: 'Maria Rossi', city: 'Palermo' };
  const today = '2026-10-21';
  const inps = (o) => inpsReminder({ provinceName: 'Palermo', person, certNumber: 'X1', certDate: '2026-06-01', domandaDate: '2026-06-10', today, ...o });
  // Nuova procedura: perché vale il termine (oncologici, minori) e cosa doveva concludersi.
  const onc = inps({ regime: 'new', category: 'oncological', deadlineInfo: { legal: 'art. 6 D.Lgs. 62/2024', days: 15, deadline: '2026-06-16' } });
  assert.match(onc, /trattandosi di persona con patologia oncologica, come indicato nel certificato,/);
  assert.match(onc, /il procedimento di valutazione di base doveva concludersi entro 15 giorni dalla trasmissione del certificato/);
  const min = inps({ regime: 'new', category: 'minor', deadlineInfo: { legal: 'art. 6 D.Lgs. 62/2024', days: 30, deadline: '2026-07-01' } });
  assert.match(min, /trattandosi di minore,/);
  const adult = inps({ regime: 'new', category: 'other', deadlineInfo: { legal: 'art. 6 D.Lgs. 62/2024', days: 90, deadline: '2026-08-30' } });
  assert.doesNotMatch(adult, /trattandosi/);
  // Vecchia procedura oncologica: la visita entro 15 giorni dalla domanda.
  const oldOnc = inps({ regime: 'old', category: 'oncological', deadlineInfo: { legal: 'art. 6 c. 3-bis D.L. 4/2006', days: 15, deadline: '2026-06-25' } });
  assert.match(oldOnc, /trattandosi di persona con patologia oncologica[^]*la visita doveva svolgersi entro 15 giorni dalla domanda/);
  // Vecchia procedura ordinaria: niente termine «ordinario», una sola riga sulla convocazione.
  const old = inps({ regime: 'old', category: 'minor', deadlineInfo: { legal: null, days: 30, deadline: '2026-07-10' } });
  assert.match(old, /sono trascorsi 133 giorni dalla presentazione della domanda senza che sia pervenuta alcuna convocazione;/);
  assert.doesNotMatch(old, /termine indicato come ordinario|trattandosi/);
  assert.equal(old.match(/non è pervenuta alcuna convocazione/g)?.length ?? 0, 0);
  assert.equal(old.match(/pervenuta alcuna convocazione/g).length, 1);
  assert.equal(onc.match(/non è pervenuta alcuna convocazione/g).length, 1);

  // Percorso di tutela: oggetto con prestazione, ricetta e classe; termini con le date.
  const t = tutelaLetter({ aspName: 'Palermo', person, service: 'Ecografia addome', nre: '190A1', cls: 'D (visita)', maxDays: 30,
    noDateOffered: true, requestDate: '2026-10-01', prescriptionDate: '2026-09-28', callbackDays: 10, callbackDeadline: '2026-10-11', today });
  assert.match(t, /Oggetto: Richiesta di attivazione del percorso di tutela – "Ecografia addome", ricetta n\. 190A1, classe D \(visita\)/);
  assert.match(t, /ricetta n\. 190A1 del 28\/09\/2026/);
  assert.match(t, /entro i 10 giorni previsti dal PNGLA per la classe D \(visita\)\s+\(termine scaduto l'11\/10\/2026\)/);
  const tu = tutelaLetter({ aspName: 'Palermo', person, service: 'Visita', nre: '', cls: 'U', maxDays: 3, noDateOffered: true, requestDate: '2026-10-19', today });
  assert.match(tu, /ricetta n\./);
  assert.doesNotMatch(tu, /ricontattato|PNGLA per la classe/);
  const tb = tutelaLetter({ aspName: 'Palermo', person, service: 'Visita', nre: '190A1', cls: 'B', maxDays: 10,
    bookingDate: '2026-10-01', appointmentDate: '2026-11-20', deadline: '2026-10-11', today });
  assert.match(tb, /oltre il tempo massimo previsto\s+\(termine scaduto l'11\/10\/2026\)/);

  // Sollecito: protocollo della prima richiesta e libera professione con il solo ticket.
  const r = tutelaReminder({ aspName: 'Palermo', person, service: 'Visita', nre: '190A1', cls: 'B', firstRequestDate: '2026-10-01', today });
  assert.match(r, /protocollo n\. ___\)/);
  assert.match(r, /libero-professionale intramurario con il solo pagamento del ticket \(D\.Lgs\. 124\/1998, art\. 3, c\. 13\)/);
  assert.match(tutelaReminder({ aspName: 'Palermo', person, cls: 'B', firstRequestDate: '2026-10-01', protocol: 'PG/123', today }), /protocollo n\. PG\/123/);

  // Ausili: il silenzio-assenso non si afferma finché il D.A. siciliano non è letto.
  const a = ausiliReminder({ aspName: 'Palermo', person, device: 'carrozzina', requestDate: '2026-09-20', deadline: '2026-10-10', today });
  assert.doesNotMatch(a, /si intende concessa|silenzio-assenso/);
  assert.match(a, /in Sicilia: direttive regionali sul DM 332\/1999/);
  assert.match(a, /senza ulteriore ritardo/);

  // Cartella: periodo e reparto da scrivere a penna; «copia della cartella clinica».
  const c = cartellaReminder({ structure: 'Ospedale Civico', person, requestDate: '2026-10-01', what: 'cartella clinica', episode: '', deadline: '2026-10-08', today });
  assert.match(c, /copia della cartella clinica relativa a ____________ \(periodo e reparto\)/);
  assert.doesNotMatch(c, /copia di cartella/);
  assert.match(cartellaReminder({ person, what: 'referti o immagini', episode: 'visita del 5 settembre', today }), /copia dei referti o delle immagini relativi a visita del 5 settembre/);
});

test('chi scrive per un altro: delegato, genitore di un minore, tutore o amministratore di sostegno', async () => {
  const { genericRequest, delegateAttachment } = await import('../js/letters.js');
  const base = { fullName: 'Giulia Bianchi', isDelegate: true, delegateName: 'Anna Bianchi', delegateCf: 'BNCNNA80A41G273X' };
  const certo = { certNumber: 'X1', certDate: '2026-07-01', regime: 'new', deadlineInfo: { legal: 'art. 6 D.Lgs. 62/2024', days: 90, deadline: '2026-09-29' }, today: '2026-10-18' };
  // Delegato (anche quando il ruolo non è scritto: come prima)
  for (const p of [base, { ...base, delegateRole: 'delegato' }]) {
    const t = inpsReminder({ provinceName: 'Palermo', person: p, ...certo });
    assert.match(t, /in qualità di delegato\/a dell'assistito\/a, come da delega allegata/);
    assert.match(t, /Allega: [^\n]*delega e documento del delegato/);
  }
  // Genitore di un minore: niente delega, «responsabilità genitoriale», «figlio/a minore»
  const g = inpsReminder({ provinceName: 'Palermo', person: { ...base, delegateRole: 'genitore' }, ...certo });
  assert.doesNotMatch(g, /delega/i);
  assert.match(g, /Anna Bianchi[^\n]*\n?[^\n]*genitore esercente la responsabilità genitoriale/);
  assert.match(g, /per il\/la figlio\/a minore/);
  assert.match(g, /artt\. 316 e 320 c\.c\./);
  // Tutore, amministratore di sostegno, curatore: decreto di nomina, niente delega
  for (const [kind, name] of [['tutore', 'tutore'], ['amministratore', 'amministratore di sostegno'], ['curatore', 'curatore'], [undefined, 'amministratore di sostegno']]) {
    const p = { ...base, delegateRole: 'tutore', guardianKind: kind, decreeRef: 'del Tribunale di Palermo n. 12/2025' };
    const t = genericRequest({ to: 'Distretto', person: p, subject: 'Richiesta', premise: ['x'], request: 'y', attachments: ['copia del documento di identità'], today: '2026-10-18' });
    assert.match(t, new RegExp(`in qualità di ${name} dell'assistito/a`));
    assert.match(t, /decreto del Tribunale di Palermo n\. 12\/2025/);
    assert.match(t, /Allega: [^\n]*copia del decreto di nomina/);
    assert.doesNotMatch(t, /delega/i);
  }
  const senzaDecreto = tutelaLetter({ aspName: 'Palermo', person: { ...base, delegateRole: 'tutore' }, cls: 'B', maxDays: 10, bookingDate: '2026-10-01', appointmentDate: '2026-11-20', today: '2026-10-18' });
  assert.match(senzaDecreto, /decreto del Tribunale di __________/);
  // Chi scrive per sé: nessun allegato in più, anche se è rimasto scelto un ruolo
  assert.equal(delegateAttachment({ delegateRole: 'genitore' }), '');
  assert.doesNotMatch(tutelaLetter({ aspName: 'Palermo', person: { fullName: 'Maria', delegateRole: 'tutore' }, cls: 'B', maxDays: 10, bookingDate: '2026-10-01', appointmentDate: '2026-11-20', today: '2026-10-18' }), /decreto|delega|genitore/);
});

test('i testi mostrati agli utenti non contengono note interne (TODO)', () => {
  const shown = (a) => JSON.stringify([a.how_to, a.documents_required, a.what_next, a.notes, a.details, a.fast_track, a.phones, a.scelta_medico]);
  for (const a of asp.asl) {
    assert.doesNotMatch(shown(a), /TODO|VERIFY/i, a.id);
    assert.ok(Array.isArray(a.todo) && Array.isArray(a.details), a.id);
  }
});

test('ogni fonte ha un nome e un link https', () => {
  const all = [...rules.sources, ...rulesInv.sources, ...inps.sources, ...asp.asl.flatMap((a) => a.sources)];
  assert.ok(rules.sources.length >= 3 && rulesInv.sources.length >= 3);
  for (const s of all) {
    assert.ok(s.label && s.label.length > 5, JSON.stringify(s));
    if (s.url) assert.match(s.url, /^https:\/\//, s.label);
  }
  for (const a of asp.asl) assert.ok(a.sources.some((s) => s.url) || a.info_url, `${a.id}: nessun link ufficiale`);
});

test('scadenza semplice (cartella clinica 7 giorni, ausili 20 giorni)', async () => {
  const { simpleDeadline } = await import('../js/engine.js');
  const { cartellaReminder, ausiliReminder } = await import('../js/letters.js');
  const rc = load('../data/rules-cartella.json');
  const ra = load('../data/rules-ausili.json');
  assert.equal(rc.deadline_days, 7);
  assert.equal(rc.integration_days, 30);
  assert.equal(ra.authorization_days, 20);
  const r = simpleDeadline({ fromDate: '2026-09-01', days: 30, today: '2026-10-01' });
  assert.equal(r.deadline, '2026-10-01');
  assert.equal(r.status, 'waiting'); // il giorno della scadenza è ancora in tempo
  assert.equal(simpleDeadline({ fromDate: '2026-09-01', days: 30, today: '2026-10-02' }).status, 'passed');
  assert.equal(simpleDeadline({ fromDate: '2026-09-01', days: 30, today: '2026-10-02' }).daysLate, 1);
  assert.equal(simpleDeadline({ fromDate: '2026-09-20', days: 20, today: '2026-10-18' }).deadline, '2026-10-10');
  assert.equal(simpleDeadline({ fromDate: '2026-12-01', days: 20, today: '2026-10-18' }).error, 'future');
  assert.equal(simpleDeadline({ fromDate: 'boh', days: 20 }).error, 'date');
  for (const s of [...rc.sources, ...ra.sources]) assert.match(s.url, /^https:\/\//);
  const l1 = cartellaReminder({ structure: 'Ospedale Civico', person: { fullName: 'Maria Rossi' }, requestDate: '2026-09-01', what: 'cartella clinica', deadline: '2026-10-01', today: '2026-10-18' });
  assert.match(l1, /Maria Rossi/); assert.match(l1, /01\/10\/2026/); assert.match(l1, /L\. 24\/2017/); assert.match(l1, /entro 7 giorni/);
  const l2 = ausiliReminder({ aspName: 'Palermo', person: { fullName: 'Maria Rossi', isDelegate: true, delegateName: 'Luca' }, device: 'carrozzina', requestDate: '2026-09-20', deadline: '2026-10-10', today: '2026-10-18' });
  assert.match(l2, /carrozzina/); assert.match(l2, /10\/10\/2026/); assert.match(l2, /Luca/); assert.match(l2, /DPCM 12\/01\/2017/);
});

test('mesi e euro', async () => {
  const { addMonths, formatEuro } = await import('../js/engine.js');
  assert.equal(addMonths('2026-04-18', 6), '2026-10-18');
  assert.equal(addMonths('2026-08-31', 6), '2027-02-28'); // il 31 febbraio non esiste
  assert.equal(addMonths('2027-08-31', 6), '2028-02-29'); // anno bisestile
  assert.equal(addMonths('2026-10-18', 6), '2027-04-18');
  assert.equal(formatEuro(36151.98), '36.151,98 €');
  assert.equal(formatEuro(8263.31), '8.263,31 €'); // anche sotto 10.000
  assert.equal(formatEuro(516.46), '516,46 €');
  assert.equal(formatEuro(0), '0,00 €');
  assert.equal(formatEuro(1234567.5), '1.234.567,50 €');
});

test('esenzione ticket per reddito', async () => {
  const { esenzioneReddito } = await import('../js/engine.js');
  const r = load('../data/rules-esenzione.json');
  const e = (o) => esenzioneReddito(r, o);
  assert.deepEqual(e({ ageBand: '65plus', status: 'none', income: 36151.98 }).codes, ['E01']); // uguale alla soglia: sì
  assert.deepEqual(e({ ageBand: '65plus', status: 'none', income: 36151.99 }).codes, []);      // un centesimo in più: no
  assert.deepEqual(e({ ageBand: 'under6', status: 'none', income: 20000 }).codes, ['E01']);
  assert.deepEqual(e({ ageBand: '6to59', status: 'none', income: 1000 }).codes, []);
  assert.deepEqual(e({ ageBand: '6to59', status: 'disoccupato', income: 8263.31 }).codes, ['E02']);
  assert.deepEqual(e({ ageBand: '6to59', status: 'disoccupato', income: 8263.32 }).codes, []);
  assert.deepEqual(e({ ageBand: '6to59', status: 'disoccupato', spouse: true, income: 11362.05 }).codes, ['E02']);
  assert.deepEqual(e({ ageBand: '6to59', status: 'disoccupato', spouse: true, children: 2, income: 11362.05 + 2 * 516.46 }).codes, ['E02']);
  assert.deepEqual(e({ ageBand: '6to59', status: 'disoccupato', spouse: false, children: 1, income: 8263.31 + 516.46 + 0.01 }).codes, []);
  assert.deepEqual(e({ ageBand: '6to59', status: 'sociale', income: 99999 }).codes, ['E03']);      // senza limite di reddito
  assert.deepEqual(e({ ageBand: '60to64', status: 'minimo', income: 8000 }).codes, ['E04']);
  assert.deepEqual(e({ ageBand: '6to59', status: 'minimo', income: 8000 }).codes, ['E04']);       // a carico di chi ha la pensione al minimo
  assert.deepEqual(e({ ageBand: '65plus', status: 'minimo', income: 8000 }).codes, ['E01', 'E04']);
  const m = e({ ageBand: '65plus', status: 'disoccupato', income: null });
  assert.deepEqual(m.codes, []); assert.deepEqual(m.maybe, ['E01', 'E02']);
  assert.equal(m.thresholds.E01, 36151.98);
});

test('date del 01/01/1970: parseDate vale 0, ma la data esiste', () => {
  assert.equal(parseDate('1970-01-01'), 0);
  assert.equal(formatIt('1970-01-01'), '01/01/1970');
  assert.equal(art('il', '1970-01-01'), 'il ');
});

test('ricorso: 6 mesi dal verbale', async () => {
  const { ricorsoDeadline } = await import('../js/engine.js');
  const r = load('../data/rules-ricorso.json');
  assert.equal(r.appeal_months, 6);
  const a = ricorsoDeadline(r, { verbaleDate: '2026-04-21', today: '2026-10-21' });
  assert.equal(a.deadline, '2026-10-21'); assert.equal(a.status, 'waiting'); assert.equal(a.daysLeft, 0); assert.equal(a.slittato, false);
  assert.equal(ricorsoDeadline(r, { verbaleDate: '2026-04-20', today: '2026-10-21' }).status, 'passed');
  // Sabato, domenica e festivi: il termine slitta al primo giorno lavorativo (art. 155 c.p.c.).
  const dom = ricorsoDeadline(r, { verbaleDate: '2026-04-18', today: '2026-10-19' });
  assert.equal(dom.deadline, '2026-10-19'); assert.equal(dom.status, 'waiting'); assert.equal(dom.slittato, true);
  assert.equal(ricorsoDeadline(r, { verbaleDate: '2026-06-08', today: '2026-12-09' }).deadline, '2026-12-09'); // 8/12 Immacolata
  assert.equal(ricorsoDeadline(r, { verbaleDate: '2026-09-29', today: '2026-10-01' }).deadline, '2027-03-30'); // 29/3/2027 Lunedì dell'Angelo
  assert.equal(ricorsoDeadline(r, { verbaleDate: '2026-04-04', today: '2026-10-01' }).deadline, '2026-10-05'); // 4/10/2026 domenica
  assert.equal(ricorsoDeadline(r, { verbaleDate: '2026-10-01', today: '2026-10-18' }).daysLeft, 165);
  assert.equal(ricorsoDeadline(r, { verbaleDate: '2026-12-01', today: '2026-10-18' }).error, 'future');
  for (const s of [...r.sources, ...load('../data/rules-esenzione.json').sources]) assert.match(s.url, /^https:\/\//);
});

test('assegno di inclusione, piano terapeutico', async () => {
  const { adiCheck, pianoStatus } = await import('../js/engine.js');
  const { genericRequest } = await import('../js/letters.js');
  const ra = load('../data/rules-adi.json'); const rt = load('../data/rules-piano.json');
  assert.equal(adiCheck(ra, { household: true, residency: true, isee: 10140 }).status, 'yes');
  assert.equal(adiCheck(ra, { household: true, residency: true, isee: 10140.01 }).status, 'no');
  assert.deepEqual(adiCheck(ra, { household: false, residency: false, isee: 50000 }).reasons, ['household', 'residency', 'isee']);
  assert.equal(adiCheck(ra, { household: true, residency: true, isee: null }).status, 'maybe');
  assert.equal(adiCheck(ra, { household: null, residency: true, isee: 5000 }).status, 'maybe');

  const T = '2026-10-18';

  assert.equal(pianoStatus(rt, { expiryDate: '2027-01-18', today: T }).status, 'ok');
  assert.equal(pianoStatus(rt, { expiryDate: '2026-12-17', today: T }).status, 'soon');
  assert.equal(pianoStatus(rt, { expiryDate: '2026-10-17', today: T }).status, 'expired');
  assert.equal(pianoStatus(rt, { expiryDate: '2027-01-18', today: T }).bookBy, '2026-11-19');

  const l = genericRequest({ to: 'Distretto', subject: 'Richiesta', person: { fullName: 'Maria Rossi' }, premise: ['a', 'b'], request: 'x', attachments: ['y'], today: T });
  assert.match(l, /Maria Rossi/); assert.match(l, /- a;\n- b;/); assert.match(l, /Allega: y\./);
  for (const r of [ra, rt, load('../data/rules-domiciliare.json'), load('../data/rules-palliative.json')]) for (const s of r.sources) assert.match(s.url, /^https:\/\//);
});

test('prevenzione per età e sesso; medico o pediatra', async () => {
  const { prevenzione, medicoChoice } = await import('../js/engine.js');
  const r = load('../data/rules-prevenzione.json');
  const ids = (o) => [...o.screening, ...o.vaccines].map((x) => x.id).sort().join(',');
  assert.equal(ids(prevenzione(r, { age: 49, sex: 'F' })), 'hpv,tetano');
  assert.equal(ids(prevenzione(r, { age: 50, sex: 'F' })), 'colon,hpv,mammografia,tetano');
  assert.equal(ids(prevenzione(r, { age: 50, sex: 'M' })), 'colon,tetano');
  assert.equal(ids(prevenzione(r, { age: 29, sex: 'F' })), 'pap,tetano');
  assert.equal(ids(prevenzione(r, { age: 30, sex: 'F' })), 'hpv,tetano');
  assert.equal(ids(prevenzione(r, { age: 24, sex: 'F' })), 'tetano');
  assert.equal(ids(prevenzione(r, { age: 59, sex: 'M' })), 'colon,tetano');
  assert.equal(ids(prevenzione(r, { age: 60, sex: 'M' })), 'colon,influenza,tetano');
  assert.equal(ids(prevenzione(r, { age: 64, sex: 'F' })), 'colon,hpv,influenza,mammografia,tetano');
  assert.equal(ids(prevenzione(r, { age: 65, sex: 'F' })), 'colon,influenza,mammografia,pneumococco,tetano,zoster');
  assert.equal(ids(prevenzione(r, { age: 69, sex: 'F' })), 'colon,influenza,mammografia,pneumococco,tetano,zoster');
  assert.equal(ids(prevenzione(r, { age: 70, sex: 'F' })), 'influenza,pneumococco,tetano,zoster');
  assert.equal(ids(prevenzione(r, { age: 10, sex: 'M' })), '');
  assert.equal(prevenzione(r, { age: 40, sex: 'M' }).later[0].min, 50);
  assert.equal(prevenzione(r, { age: -1, sex: 'M' }), null);
  const m = load('../data/rules-medico.json');
  assert.equal(medicoChoice(m, { age: 0 }), 'pediatra');
  assert.equal(medicoChoice(m, { age: 5 }), 'pediatra');
  assert.equal(medicoChoice(m, { age: 6 }), 'pediatra-o-medico');
  assert.equal(medicoChoice(m, { age: 13 }), 'pediatra-o-medico');
  assert.equal(medicoChoice(m, { age: 14 }), 'medico');
  for (const s of [...r.sources, ...m.sources]) assert.match(s.url, /^https:\/\//);
});

// Audit dei mutanti del 21/10/2026: errori che nessun test prendeva.
test('festivi nazionali 2026-2030, giorno per giorno', async () => {
  const { festivo } = await import('../js/engine.js');
  // Elenco scritto a mano (L. 260/1949 e successive; 4 ottobre dal 2026, L. 151/2025). Non ci sono i santi patroni.
  const fissi = ['01-01', '01-06', '04-25', '05-01', '06-02', '08-15', '10-04', '11-01', '12-08', '12-25', '12-26'];
  const lunediAngelo = ['2026-04-06', '2027-03-29', '2028-04-17', '2029-04-02', '2030-04-22'];
  const attesi = new Set([...[2026, 2027, 2028, 2029, 2030].flatMap((y) => fissi.map((md) => `${y}-${md}`)), ...lunediAngelo]);
  const sbagliati = [];
  for (let d = '2026-01-01'; d <= '2030-12-31'; d = addDays(d, 1)) {
    if (festivo(d) !== attesi.has(d)) sbagliati.push(`${d}: festivo() dice ${festivo(d)}`);
  }
  assert.deepEqual(sbagliati, []);
  assert.equal(festivo('2025-10-04'), false); // San Francesco festivo solo dal 2026
});

test('cartella clinica: ricorso al TAR dopo 30 giorni di silenzio, entro altri 30 (art. 25 L. 241/1990)', () => {
  const rc = load('../data/rules-cartella.json');
  assert.equal(rc.integration_days, 30);
  assert.equal(rc.appeal_days, 30, 'appeal_days: 30 giorni per il ricorso al TAR (art. 25 c. 4 L. 241/1990). Se cambia, rileggi la legge');
  // Lo stesso conto di js/cartella.js: dalla richiesta + integration_days, poi + appeal_days.
  const src = readFileSync(new URL('../js/cartella.js', import.meta.url), 'utf8');
  assert.match(src, /const from = addDays\(state\.requestDate, rules\.integration_days\);\s*const until = addDays\(from, rules\.appeal_days\);/);
  const from = addDays('2026-09-01', rc.integration_days);
  assert.equal(from, '2026-10-01');
  assert.equal(addDays(from, rc.appeal_days), '2026-10-31');
});
