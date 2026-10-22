// Nessun file del repository con i segni di un conflitto di git rimasti dentro («<<<<<<< », «>>>>>>> »).
// 22/10/2026: unendo il lavoro di più agenti, tests/copie-noti.txt è stato salvato con i segni dentro.
// Se fallisce: apri il file, tieni le righe giuste delle due parti e togli i segni.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('nessun segno di conflitto di git nei file', () => {
  const files = execFileSync('git', ['ls-files'], { cwd: SITE, encoding: 'utf8' }).split('\n')
    .filter((f) => /\.(html|js|mjs|cjs|json|md|txt|css|yml|yaml|sh)$/.test(f));
  const errori = [];
  for (const f of files) {
    let s;
    try { s = readFileSync(path.join(SITE, f), 'utf8'); } catch { continue; }
    s.split('\n').forEach((riga, i) => { if (/^(<{7}|>{7}) /.test(riga) || /^={7}\r?$/.test(riga)) errori.push(`${f}:${i + 1}`); });
  }
  assert.deepEqual(errori, []);
});
