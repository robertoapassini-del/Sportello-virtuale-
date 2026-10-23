// tools/cerca-numero.mjs: il numero dei dati si trova nella copia anche con separatori e col prefisso +39 attaccato.
// Errore trovato il 23/10/2026: la pagina dell'ASL Roma 3 scrive «+390656481» e il confronto non trovava 06 56481.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { regexNumero } from '../tools/cerca-numero.mjs';

test('il numero si trova con separatori e col prefisso dell\'Italia', () => {
  const r = regexNumero('06 56481');
  for (const t of ['tel. 06 56481', 'tel. 06.56.481', 'tel. +390656481', 'tel. +39 06 56481', 'tel. 0039 06 56481']) assert.ok(r.test(t), t);
});

test('il numero non si trova dentro un altro numero', () => {
  const r = regexNumero('06 56481');
  for (const t of ['tel. 06564811', 'tel. 1390656481', 'tel. 390656481', 'tel. 106 56481']) assert.ok(!r.test(t), t);
});
