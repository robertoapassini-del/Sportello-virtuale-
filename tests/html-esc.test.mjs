// Nei JS che scrivono HTML, quello che scrive l'utente (state.*, person.*, p[name], .value, location.*,
// localStorage, window.name) entra in una riga con tag HTML solo dentro esc() o encodeURIComponent()
// (audit di sicurezza, giro 6). Se fallisce: metti il valore dentro esc() (js/ui.js) prima di scriverlo nell'HTML.
// js/letters.js è escluso: scrive testo semplice, non HTML.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const DIR = fileURLToPath(new URL('../js/', import.meta.url));
const TAINT = /\b(state|person|p\[name\])\.[A-Za-z_]+|\.value\b|location\.(hash|search|href)|localStorage|window\.name|savedRegione\(\)/;
// Valori di state.* che non vengono dall'utente ma da scelte fisse (pulsanti con valori scritti nel codice)
// si possono mettere qui se un giorno servono: per ora nessuna eccezione.
const ALLOW = [];
function interpolations(line) {
  const out = []; let i = 0;
  while ((i = line.indexOf('${', i)) !== -1) {
    let depth = 1, j = i + 2;
    while (j < line.length && depth) { if (line[j] === '{') depth++; else if (line[j] === '}') depth--; j++; }
    out.push(line.slice(i + 2, j - 1)); i = j;
  }
  return out;
}
test('interpolazioni HTML con dati utente sempre con esc()', () => {
  const bad = [];
  for (const f of readdirSync(DIR).filter((n) => n.endsWith('.js') && n !== 'letters.js')) {
    const lines = readFileSync(join(DIR, f), 'utf8').split('\n');
    lines.forEach((line, n) => {
      // Riga con HTML: un tag, oppure un'assegnazione a innerHTML/outerHTML/insertAdjacentHTML (anche se continua sotto).
      const sink = /innerHTML|outerHTML|insertAdjacentHTML/;
      const html = /<[a-z][^>]*>|<\/[a-z]/i.test(line) || sink.test(line) || (n > 0 && sink.test(lines[n - 1]) && !/;\s*$/.test(lines[n - 1]));
      if (!html) return;
      for (const e of interpolations(line)) {
        // tolgo le parti già protette e i confronti (state.x === 'a' ? ... : ...)
        const rest = e.replace(/\b(esc|encodeURIComponent|mailLink|telLink|art|formatIt|formatEuro)\((?:[^()]|\([^()]*\))*\)/g, '')
          .replace(/\b(state|person)\.[A-Za-z_]+\s*(===|!==|==|!=|>=|<=|>|<)\s*[^?:&|]+/g, '')
          .replace(/!*\b(state|person)\.[A-Za-z_]+\s*(\?|&&)/g, '$2')
          .replace(/\b[A-Za-z_]+\[(state|person)\.[A-Za-z_]+\]/g, '""')
          .replace(/'[^']*'|"[^"]*"/g, '""');
        if (TAINT.test(rest) && !ALLOW.includes(`${f}:${n + 1}`)) bad.push(`${f}:${n + 1}: \${${e}}`);
      }
    });
  }
  assert.deepEqual(bad, []);
});
