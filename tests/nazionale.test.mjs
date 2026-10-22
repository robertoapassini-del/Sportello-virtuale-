// Il sito vale in tutta Italia (docs/regola-nazionale.md): i fatti di una sola regione si scrivono
// dicendo di quale regione sono. Questo test legge il testo fisso delle pagine e fallisce se:
// - il titolo o la descrizione di una pagina parlano della Sicilia (le pagine sono per tutti);
// - una frase nomina un ufficio, un servizio o una città della Sicilia (ASP, SovraCUP, ASPConTe,
//   Palermo…) senza dire «Sicilia» nella stessa frase o nel titoletto sopra (es. <h3>In Sicilia</h3>).
// Non guarda le parti create da tools/pagine.mjs (fonti, indice, piè di pagina): lì i nomi delle fonti
// dicono già di chi sono. Se fallisce: scrivi «In Sicilia: …» davanti alla frase, o rendila generica.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagine = fs.readFileSync(path.join(SITE, 'sitemap.xml'), 'utf8').match(/<loc>(.*?)<\/loc>/g)
  .map((x) => x.slice(5, -6).replace('https://guidasanita.it/', '')).map((u) => (u === '' || u.endsWith('/') ? `${u}index.html` : u));

// Parole che indicano qualcosa di solo siciliano (oltre alla parola «Sicilia»).
const SICILIANO = /\bASP\b|SovraCUP|ASPConTe|Regione Siciliana|\b(Palermo|Catania|Messina|Trapani|Siracusa|Agrigento|Enna|Ragusa|Caltanissetta)\b/;
const testo = (h) => h.replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

function blocchi(html) {
  const corpo = html
    .replace(/<head>[\s\S]*?<\/head>/, '')
    .replace(/<header class="site-header">[\s\S]*?<\/header>/, '')
    .replace(/<nav class="breadcrumb"[\s\S]*?<\/nav>/, '')
    .replace(/<!-- (blocco:[a-z-]+|fonti|condividi)[\s\S]*?<!-- \/(blocco:[a-z-]+|fonti|condividi) -->/g, '')
    .replace(/<footer[\s\S]*?<\/footer>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '');
  const out = [];
  let titoletto = '';
  for (const [, tag, dentro] of corpo.matchAll(/<(h[1-6]|p|li|dd|dt|td|th)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
    const t = testo(dentro);
    if (/^h[2-6]$/.test(tag)) titoletto = t;
    out.push({ tag, t, titoletto });
  }
  return out;
}

test('titoli e descrizioni delle pagine non parlano della Sicilia', () => {
  const errori = [];
  for (const f of pagine) {
    const html = fs.readFileSync(path.join(SITE, f), 'utf8');
    const titolo = (html.match(/<title>(.*?)<\/title>/) || [, ''])[1];
    const desc = (html.match(/<meta name="description" content="(.*?)">/) || [, ''])[1];
    if (/Sicili|\bASP\b/.test(titolo)) errori.push(`${f}: titolo «${titolo}»`);
    if (/\bASP\b/.test(desc)) errori.push(`${f}: descrizione con «ASP»: «${desc.slice(0, 120)}»`);
  }
  assert.deepEqual(errori, []);
});

test('ogni frase su uffici o servizi siciliani dice che è della Sicilia', () => {
  const errori = [];
  for (const f of pagine) {
    const html = fs.readFileSync(path.join(SITE, f), 'utf8');
    for (const b of blocchi(html)) {
      if (!SICILIANO.test(b.t)) continue;
      if (/Sicili/.test(b.t) || /Sicili/.test(b.titoletto)) continue;
      if (/\b(ASL|ATS)\b[^.]{0,12}\bASP\b|\bASP\b[^.]{0,12}\b(ASL|ATS)\b/.test(b.t)) continue; // elenco di sigle: «ASL, ASP, ATS»
      errori.push(`${f}: «${b.t.slice(0, 140)}»`);
    }
  }
  assert.deepEqual(errori, [], `Frasi siciliane senza «Sicilia»:\n${errori.join('\n')}`);
});
