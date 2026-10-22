// Aziende e zone (js/letters.js, docs/regioni.md sezione 1). Nato il 22/10/2026: le lettere scrivevano
// «USL di Perugia», «ATS di Genova», «ASREM di Campobasso» (aziende che con quel nome non esistono) e, in una
// provincia con più aziende, andavano sempre alla prima.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { zoneLettera, nomeZona, conZona, intestazioneDi } from '../js/letters.js';
import * as L from '../js/letters.js';

const json = (f) => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'));
const indice = json('data/regioni/index.json');

// Un'azienda finta con due zone (fixture): i campi della zona prendono il posto di quelli dell'azienda.
const prova = {
  id: 'prova', province: 'Prova', name: 'ASL Prova 1 e ASL Prova 2', pec: 'uno@pec.prova.it', emails: ['urp@prova1.it'],
  sub_areas: [
    { id: 'p1', label: 'Prova 1 – centro', comuni: ['Prova'], nome_lettera: 'ASL Prova 1', pec: 'uno@pec.prova.it' },
    { id: 'p2', label: 'Prova 2 – mare', nome_lettera: 'ASL Prova 2', pec: 'due@pec.prova.it', emails: ['urp@prova2.it'] },
  ],
};

test('zone: solo gli oggetti con id cambiano la lettera (le frasi di Messina no)', () => {
  assert.deepEqual(zoneLettera(prova).map((z) => z.id), ['p1', 'p2']);
  assert.deepEqual(zoneLettera({ sub_areas: ['Messina – Taormina', 'Milazzo – Lipari – Barcellona P.G.'] }), []);
  assert.deepEqual(zoneLettera({}), []);
  assert.equal(nomeZona('Messina – Taormina'), 'Messina – Taormina');
  assert.equal(nomeZona(prova.sub_areas[0]), 'Prova 1 – centro');
});

test('conZona: i campi della zona al posto di quelli dell\'azienda, id e provincia restano', () => {
  const a = conZona(prova, 'p2');
  assert.equal(a.id, 'prova');
  assert.equal(a.province, 'Prova');
  assert.equal(a.pec, 'due@pec.prova.it');
  assert.deepEqual(a.emails, ['urp@prova2.it']);
  assert.equal(a.nome_lettera, 'ASL Prova 2');
  assert.equal(a.zona.id, 'p2');
  assert.equal(a.sub_areas, prova.sub_areas);
  // Zona che non c'è o non scelta: l'azienda com'è.
  assert.equal(conZona(prova, 'nessuna'), prova);
  assert.equal(conZona(prova, null), prova);
  assert.equal(conZona(undefined, 'p1'), undefined);
});

test('intestazione: nome_lettera se c\'è, se no la parola della regione + «di» + provincia', () => {
  assert.equal(intestazioneDi({ province: 'Palermo' }, 'Azienda Sanitaria Provinciale'), 'Azienda Sanitaria Provinciale di Palermo');
  assert.equal(intestazioneDi({ province: 'Terni', nome_lettera: 'USL Umbria 2' }, 'USL'), 'USL Umbria 2');
  assert.equal(intestazioneDi(conZona(prova, 'p2'), 'ASL'), 'ASL Prova 2');
});

// La Sicilia resta com'era: «Azienda Sanitaria Provinciale di Palermo» (asl_intestazione dell'indice, nessun nome_lettera).
test('Sicilia: intestazione invariata', () => {
  const sic = indice.regioni.find((r) => r.id === 'sicilia');
  assert.equal(sic.asl_intestazione, 'Azienda Sanitaria Provinciale');
  for (const a of json('data/regioni/sicilia/asp.json').asl) {
    assert.equal(a.nome_lettera, undefined, `${a.id}: in Sicilia l'intestazione viene da asl_intestazione`);
    assert.equal(intestazioneDi(a, sic.asl_intestazione), `Azienda Sanitaria Provinciale di ${a.province}`);
  }
  const p = { fullName: 'Mario Rossi' };
  const t = L.tutelaLetter({ intestazione: intestazioneDi({ province: 'Palermo' }, sic.asl_intestazione), aspAddress: 'x@pec.it', person: p, service: 'visita', nre: '1', cls: 'B', maxDays: 10, bookingDate: '2026-01-02', appointmentDate: '2026-03-01', today: '2026-01-03' });
  assert.match(t, /^Spett\.le Azienda Sanitaria Provinciale di Palermo\n/);
  // Senza intestazione le lettere fanno come prima (ente + «di» + aspName).
  assert.match(L.ausiliReminder({ aspName: 'Enna', person: p, today: '2026-01-03' }), /^Spett\.le Azienda Sanitaria Provinciale di Enna\n/);
  assert.match(L.ausiliReminder({ intestazione: 'USL Umbria 2', aspName: 'Terni', person: p, today: '2026-01-03' }), /^Spett\.le USL Umbria 2\n/);
  assert.match(L.tutelaReminder({ intestazione: 'Azienda USL della Valle d\'Aosta', aspName: 'Aosta', person: p, cls: 'B', today: '2026-01-03' }), /^Spett\.le Azienda USL della Valle d'Aosta\n/);
});

// Nelle altre regioni nessuna azienda di una sola azienda scrive «<sigla> di <provincia>» se il suo nome dice altro:
// nome_lettera c'è per tutte (o aziende_multiple, con le zone da fare).
test('regioni attive fuori dalla Sicilia: ogni azienda ha nome_lettera o aziende_multiple', () => {
  const err = [];
  for (const r of indice.regioni.filter((x) => x.attiva && !x.asl_intestazione)) {
    const f = `data/regioni/${r.id}/${(r.files && r.files.asl) || 'asl'}.json`;
    for (const a of json(f).asl) if (!a.nome_lettera && a.aziende_multiple !== true) err.push(`${r.id}/${a.id}`);
  }
  assert.deepEqual(err, [], `manca nome_lettera: ${err.join(', ')}`);
});
