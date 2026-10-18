import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  parseDate, daysBetween, addDays, formatIt, checkWaiting, callbackDeadline,
  invRegime, invDeadline, maxWaitDays,
} from '../js/engine.js';
import { tutelaLetter, inpsReminder, mailtoHref } from '../js/letters.js';
import { stripEmoji } from '../js/common.js';

const load = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const rules = load('../data/rules.json');
const rulesInv = load('../data/rules-invalidita.json');
const asp = load('../data/asp-sicilia.json');
const inps = load('../data/inps-sicilia.json');

test('date helpers', () => {
  assert.equal(parseDate('2026-02-31'), null);
  assert.equal(parseDate('18/10/2026'), null);
  assert.equal(daysBetween('2026-10-18', '2026-10-28'), 10);
  assert.equal(daysBetween('2026-03-28', '2026-03-30'), 2); // across DST change
  assert.equal(addDays('2026-12-25', 10), '2027-01-04');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29'); // leap year
  assert.equal(formatIt('2026-10-18'), '18/10/2026');
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

test('i testi mostrati agli utenti non contengono note interne (TODO)', () => {
  const shown = (a) => JSON.stringify([a.how_to, a.documents_required, a.what_next, a.notes, a.details, a.fast_track, a.phones]);
  for (const a of asp.asl) {
    assert.doesNotMatch(shown(a), /TODO|VERIFY/i, a.id);
    assert.ok(Array.isArray(a.todo) && Array.isArray(a.details), a.id);
  }
});

test('la voce non legge le emoji', () => {
  assert.equal(stripEmoji('📍 Dove abiti?'), 'Dove abiti?');
  assert.equal(stripEmoji('👨‍👩‍👧 Un figlio ✅ 🙋🏽 ✔️ ▶️ Comincia ⚠️'), 'Un figlio Comincia');
  assert.equal(stripEmoji('Lettera U: entro 3 giorni, 72 ore. Numero 800 954414 #1'), 'Lettera U: entro 3 giorni, 72 ore. Numero 800 954414 #1');
  assert.equal(stripEmoji('Perché è già così?'), 'Perché è già così?');
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

test('scadenza semplice (cartella clinica 30 giorni, ausili 20 giorni)', async () => {
  const { simpleDeadline } = await import('../js/engine.js');
  const { cartellaReminder, ausiliReminder } = await import('../js/letters.js');
  const rc = load('../data/rules-cartella.json');
  const ra = load('../data/rules-ausili.json');
  assert.equal(rc.deadline_days, 30);
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
  assert.match(l1, /Maria Rossi/); assert.match(l1, /01\/10\/2026/); assert.match(l1, /L\. 241\/1990/);
  const l2 = ausiliReminder({ aspName: 'Palermo', person: { fullName: 'Maria Rossi', isDelegate: true, delegateName: 'Luca' }, device: 'carrozzina', requestDate: '2026-09-20', deadline: '2026-10-10', today: '2026-10-18' });
  assert.match(l2, /carrozzina/); assert.match(l2, /10\/10\/2026/); assert.match(l2, /Luca/); assert.match(l2, /DPCM 12\/01\/2017/);
});
