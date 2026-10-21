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
