// Il file della CI (.github/workflows/test.yml) deve essere YAML valido: se non lo è, GitHub non fa partire
// nessun controllo e la PR resta senza test, senza un errore visibile (giro 8, 22/10/2026: un «: » dentro
// un comando «- run: …» senza virgolette).
// Qui si controlla senza librerie la regola che ha rotto il file: dopo «run: » scritto su una riga sola,
// il comando non può contenere «: » né « #» (in YAML iniziano una chiave o un commento).
// Se fallisce: scrivi il comando come blocco («run: |» e il comando sulla riga sotto, rientrato).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const DIR = new URL('../.github/workflows/', import.meta.url);

test('i comandi della CI su una riga non hanno «: » né « #»', () => {
  const errori = [];
  for (const f of readdirSync(DIR).filter((x) => /\.ya?ml$/.test(x))) {
    readFileSync(new URL(f, DIR), 'utf8').split('\n').forEach((riga, i) => {
      const m = riga.match(/^\s*(?:-\s+)?(?:run|name):\s+(?!["'|>])(.*)$/);
      if (m && /:\s| #/.test(m[1])) errori.push(`${f}:${i + 1}: ${riga.trim()}`);
    });
  }
  assert.deepEqual(errori, []);
});

// Ogni controllo nel browser (tests/*.cjs) gira nella CI: togliere una riga da test.yml spegne un controllo in silenzio.
test('ogni tests/*.cjs è lanciato dal job browser della CI', () => {
  const yml = readFileSync(new URL('test.yml', DIR), 'utf8');
  const mancano = readdirSync(new URL('../tests/', import.meta.url)).filter((f) => f.endsWith('.cjs'))
    .filter((f) => !new RegExp(`node tests/${f.replace('.', '\\.')} `).test(yml));
  assert.deepEqual(mancano, []);
});
