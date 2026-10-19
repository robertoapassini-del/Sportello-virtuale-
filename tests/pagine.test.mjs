// Le pagine si leggono anche senza JavaScript (e così le legge Google): ogni modulo ha la
// guida scritta nell'HTML, la barra «Condividi su WhatsApp / Stampa», e i link interni
// puntano alla cartella («../liste-attesa/»), mai a «index.html».
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const site = new URL('../', import.meta.url);
const read = (f) => readFileSync(new URL(f, site), 'utf8');
const reg = JSON.parse(read('data/moduli.json'));
const html = ['index.html', 'fonti.html', 'privacy.html', 'note-legali.html', 'numeri-utili/index.html',
  ...reg.groups.map((g) => `${g.page}/index.html`), ...reg.modules.map((m) => `${m.id}/index.html`)];
const words = (s) => s.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

test('le pagine sono aggiornate con npm run pagine', () => {
  execFileSync(process.execPath, [new URL('tools/pagine.mjs', site).pathname, '--controlla'], { stdio: 'pipe' });
});

test('ogni modulo ha la guida scritta nella pagina', () => {
  for (const m of reg.modules) {
    const page = read(`${m.id}/index.html`);
    const g = page.match(/<section class="wrap guida" id="guida"[\s\S]*?<\/section>/);
    assert.ok(g, `${m.id}: manca <section class="wrap guida" id="guida">`);
    assert.ok(words(g[0]) >= 300, `${m.id}: la guida è troppo corta (${words(g[0])} parole)`);
    assert.match(g[0], /<h2 id="guida-titolo">/, `${m.id}: la guida non ha il titolo`);
    assert.doesNotMatch(page, /Torna all'inizio<\/a><\/p>\n<\/div>/, `${m.id}: il testo senza JavaScript è ancora quello vecchio`);
  }
});

test('ogni pagina ha «Condividi su WhatsApp» e «Stampa»', () => {
  for (const f of html) {
    const page = read(f);
    assert.match(page, /href="https:\/\/wa\.me\/\?text=[^"]+"/, `${f}: manca Condividi su WhatsApp`);
    assert.match(page, /data-action="print-page"/, `${f}: manca Stampa`);
    assert.match(page, /<meta property="og:title"/, `${f}: manca l'anteprima per i messaggi`);
  }
});

test('i link interni non puntano a index.html', () => {
  const js = readdirSync(new URL('js/', site)).filter((f) => f.endsWith('.js')).map((f) => `js/${f}`);
  for (const f of [...html, ...js]) {
    const bad = read(f).match(/(href|action)=["'`][^"'`]*index\.html|`[^`\n]*\/index\.html[#`]/g);
    assert.equal(bad, null, `${f}: ${bad && bad.join(', ')}`);
  }
});
