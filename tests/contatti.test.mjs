// Fa rispettare la regola dei numeri (docs/regola-numeri.md): ogni numero mostrato sul sito ha
// una pagina ufficiale, la data del controllo e il modo in cui è stato controllato, e non è
// più vecchio di 92 giorni. Se fallisce: ricontrollare i numeri, non allentare il test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const load = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const nums = load('../data/numeri.json');
// Tutte le regioni attive (data/regioni/index.json): ognuna con le sue aziende sanitarie e, se c'è, le sedi INPS.
const file = (r, k) => `../data/regioni/${r.id}/${(r.files || {})[k] || k}.json`;
const regioni = load('../data/regioni/index.json').regioni.filter((r) => r.attiva).map((r) => ({
  ...r,
  asl: load(file(r, 'asl')).asl,
  inps: existsSync(new URL(file(r, 'inps'), import.meta.url)) ? load(file(r, 'inps')) : { provinces: [] },
}));

const MAX_DAYS = 92;
const PROOFS = ['telefono', 'pagina', 'estratto', 'archivio'];
// Si può far finta di essere in un altro giorno: OGGI=2026-12-01 npm test
const today = process.env.OGGI ? new Date(`${process.env.OGGI}T12:00:00Z`) : new Date();
// Gruppo centrale fino a 5 cifre: alcuni numeri a 11 cifre si scrivono così sulle pagine ufficiali (02 99430 1814).
const PHONE = /^(\d{2,4} ?\d{3,5} ?\d{0,4}|1\d{2,5})$/;

const host = (u) => new URL(u).hostname.replace(/^www\./, '');
const onDomain = (u, domains) => domains.some((d) => host(u) === d || host(u).endsWith(`.${d}`));

function check(n, where, domains) {
  const name = `${where}: ${n.label || n.title} ${n.number}`;
  assert.match(n.number, PHONE, `${name}: numero scritto male`);
  assert.ok(n.url, `${name}: manca «url», la pagina ufficiale da cui viene`);
  assert.ok(onDomain(n.url, domains), `${name}: «url» non è un sito ufficiale (${host(n.url)}). Ammessi: ${domains.join(', ')}`);
  assert.ok(PROOFS.includes(n.proof), `${name}: «proof» deve essere ${PROOFS.join(' / ')}`);
  assert.match(n.verified || '', /^\d{4}-\d{2}-\d{2}$/, `${name}: manca «verified» (AAAA-MM-GG)`);
  if (n.proof === 'archivio') assert.match(n.archived || '', /^\d{4}-\d{2}-\d{2}$/, `${name}: con «archivio» serve «archived», la data della copia su web.archive.org`);
  const age = Math.floor((today - new Date(`${n.verified}T12:00:00Z`)) / 86400000);
  assert.ok(age >= -1, `${name}: «verified» è nel futuro`);
  assert.ok(age <= MAX_DAYS, `${name}: controllato ${age} giorni fa (${n.verified}). Ricontrollalo (docs/regola-numeri.md)`);
}

test('Aziende sanitarie: ogni numero ha fonte ufficiale, data e prova recenti', () => {
  for (const a of regioni.flatMap((r) => r.asl)) {
    assert.ok(a.site_url, `${a.name}: manca site_url`);
    const domains = [host(a.site_url), ...(a.official_domains || [])];
    for (const n of [...a.phones, ...(a.contacts || [])]) check(n, a.name, domains);
    for (const k of ['site_url', 'guardia_medica_url', 'pua_url']) {
      if (a[k]) assert.ok(onDomain(a[k], domains), `${a.name}: ${k} non è sul sito ufficiale`);
    }
  }
});

test('Aziende sanitarie: lo stesso numero ha gli stessi dati in phones e contacts', () => {
  for (const a of regioni.flatMap((r) => r.asl)) {
    const byNum = new Map((a.contacts || []).map((c) => [c.number, c]));
    for (const p of a.phones) {
      const c = byNum.get(p.number);
      if (c) assert.equal(p.verified, c.verified, `${a.name} ${p.number}: date di controllo diverse`);
    }
  }
});

test('Numeri nazionali: fonte ufficiale, data e prova recenti', () => {
  assert.ok(nums.official_domains?.length, 'numeri.json: manca official_domains');
  for (const g of nums.groups) for (const n of g.items) check(n, 'numeri.json', nums.official_domains);
  for (const l of nums.links) assert.ok(onDomain(l.url, nums.official_domains), `${l.title}: link non ufficiale`);
});

test('Sedi INPS: indirizzo con fonte ufficiale, data e prova recenti', () => {
  for (const r of regioni) {
    for (const p of r.inps.provinces) {
      if (!p.address) continue;
      check({ ...p, number: '803 164', label: `INPS ${p.name}` }, `regioni/${r.id}/inps.json`, ['inps.it']);
    }
  }
});
