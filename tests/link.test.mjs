// Link interni: ogni href/src relativo delle pagine della sitemap (e della 404) porta a un file che
// esiste. Un link rotto («../../lista-attesa/» invece di «../../liste-attesa/») su GitHub Pages
// mostra la 404 e nessun altro test se ne accorge (audit dei mutanti del 21/10/2026).
// Non guarda: i link esterni (http, mailto, tel, data:), le ancore «#…», i pezzi scritti dai JS («${…}»).
// Se fallisce: correggi il link nella pagina (o in tools/pagine.mjs, se è una parte generata).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(SITE, f), 'utf8');
const pagine = read('sitemap.xml').match(/<loc>(.*?)<\/loc>/g)
  .map((x) => x.slice(5, -6).replace('https://guidasanita.it/', ''))
  .map((u) => (u === '' || u.endsWith('/') ? `${u}index.html` : u));

// Il file a cui porta un indirizzo relativo (o assoluto sul sito, «/css/…») scritto nella pagina «f».
function destinazione(f, u) {
  const senza = u.replace(/[?#].*$/, '');
  if (!senza) return null; // solo «?x» o «#x»: la pagina stessa
  let t = senza.startsWith('/') ? path.join(SITE, senza) : path.join(path.dirname(path.join(SITE, f)), senza);
  if (senza.endsWith('/') || (fs.existsSync(t) && fs.statSync(t).isDirectory())) t = path.join(t, 'index.html');
  return t;
}

function linkRotti(f) {
  const html = read(f);
  const rotti = [];
  for (const [, u] of html.matchAll(/\s(?:href|src|action)\s*=\s*["']([^"']*)["']/g)) {
    if (!u || u.includes('${') || /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(u)) continue;
    const t = destinazione(f, u.replace(/&amp;/g, '&'));
    if (t && !fs.existsSync(t)) rotti.push(`${f}: «${u}» non porta a nessun file (${path.relative(SITE, t)})`);
  }
  return rotti;
}

test('le pagine della sitemap ci sono tutte', () => {
  const mancano = pagine.filter((f) => !fs.existsSync(path.join(SITE, f)));
  assert.deepEqual(mancano, [], `sitemap.xml indica pagine che non esistono:\n${mancano.join('\n')}`);
});

test('nessun link interno rotto nelle pagine della sitemap e nella 404', () => {
  const rotti = [...pagine, '404.html'].filter((f) => fs.existsSync(path.join(SITE, f))).flatMap(linkRotti);
  assert.deepEqual(rotti, [], `Link rotti:\n${rotti.join('\n')}`);
});

test('il controllo dei link riconosce un link rotto', () => {
  assert.equal(destinazione('legge-104/index.html', '../liste-attesa/?x=1#a'), path.join(SITE, 'liste-attesa/index.html'));
  assert.ok(fs.existsSync(destinazione('legge-104/index.html', '../liste-attesa/')));
  assert.ok(!fs.existsSync(destinazione('legge-104/index.html', '../lista-attesa/')));
  assert.ok(fs.existsSync(destinazione('404.html', '/sitemap.xml')));
});
