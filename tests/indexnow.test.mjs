// IndexNow (tools/indexnow.mjs, .github/workflows/indexnow.yml): Bing rilegge subito le pagine cambiate.
// Se il file della chiave manca o non è uguale alla chiave, Bing rifiuta gli avvisi senza dirlo a nessuno.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { KEY, BASE, urlDaFile } from '../tools/indexnow.mjs';

const site = new URL('../', import.meta.url);

test('il file della chiave è nel sito e contiene la chiave', () => {
  assert.match(KEY, /^[0-9a-f]{32}$/);
  assert.ok(existsSync(new URL(`${KEY}.txt`, site)), `manca ${KEY}.txt`);
  assert.equal(readFileSync(new URL(`${KEY}.txt`, site), 'utf8').trim(), KEY);
});

test('da file a indirizzo, come la sitemap', () => {
  assert.equal(urlDaFile('index.html'), BASE);
  assert.equal(urlDaFile('liste-attesa/index.html'), `${BASE}liste-attesa/`);
  assert.equal(urlDaFile('invalidita/pensione-e-assegno/index.html'), `${BASE}invalidita/pensione-e-assegno/`);
  assert.equal(urlDaFile('privacy.html'), `${BASE}privacy.html`);
  for (const f of ['404.html', 'docs/x.html', 'tests/x.html', 'tools/x.html', 'data/moduli.json', 'css/style.css']) assert.equal(urlDaFile(f), null, f);
  // Ogni indirizzo che può uscire è nella sitemap: Bing non riceve pagine che il sito non dichiara.
  const sitemap = readFileSync(new URL('sitemap.xml', site), 'utf8');
  assert.ok(sitemap.includes(`<loc>${urlDaFile('fascicolo-e-ricetta/index.html')}</loc>`));
});

test('il workflow lancia tools/indexnow.mjs dopo i push su main', () => {
  const yml = readFileSync(new URL('.github/workflows/indexnow.yml', site), 'utf8');
  assert.match(yml, /branches: \[main\]/);
  assert.match(yml, /node tools\/indexnow\.mjs "\$\{\{ github\.event\.before \}\}" "\$\{\{ github\.sha \}\}"/);
});
