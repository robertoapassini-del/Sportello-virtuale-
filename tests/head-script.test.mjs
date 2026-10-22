// Lo script in testa a ogni pagina (tools/pagine.mjs, HEAD_SCRIPT) toglie «index.html» dall'indirizzo:
// non deve mai portare su un altro sito («//altro-sito/…/index.html» → «//altro-sito/» = altro sito).
// Prende lo script da tutte le pagine HTML e lo prova con indirizzi finti (audit di sicurezza, giro 6).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SALTA = ['node_modules', '.git', '.claude', 'tests', 'tools', 'docs', 'data'];
const pages = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    if (SALTA.includes(n)) continue;
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p); else if (n.endsWith('.html')) pages.push(p);
  }
})(ROOT);
const scripts = new Set(pages.map((p) => (readFileSync(p, 'utf8').match(/<script>(document\.documentElement\.className[^<]*)<\/script>/) || [])[1]).filter(Boolean));

// Prova lo script con un pathname finto: restituisce l'indirizzo passato a location.replace() (o null).
function dove(s, pathname) {
  let dest = null;
  const location = { pathname, search: '?x=1', hash: '#y', replace: (u) => { dest = u; } };
  new Function('document', 'location', s)({ documentElement: { className: '' } }, location);
  return dest;
}

test('lo script in testa alle pagine resta su questo sito', () => {
  assert.ok(scripts.size >= 1, 'nessuno script in testa trovato');
  for (const s of scripts) {
    for (const pathname of ['//evil.example/..%2flegge-104/index.html', '///evil.example/index.html', '/\\evil.example/index.html', '//legge-104/index.html', '/legge-104/index.html']) {
      const dest = dove(s, pathname);
      if (dest === null) continue;
      const u = new URL(dest, 'https://guidasanita.it/x/');
      assert.equal(u.origin, 'https://guidasanita.it', `${pathname} → ${dest}`);
    }
  }
});

test('lo script in testa toglie «index.html» dalle pagine normali', () => {
  for (const s of scripts) {
    assert.equal(dove(s, '/legge-104/index.html'), '/legge-104/?x=1#y');
    assert.equal(dove(s, '/index.html'), '/?x=1#y');
    assert.equal(dove(s, '/legge-104/'), null);
  }
});
