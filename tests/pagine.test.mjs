// Le pagine si leggono anche senza JavaScript (e così le legge Google): ogni modulo ha la
// guida scritta nell'HTML, la barra «Condividi su WhatsApp / Stampa», e i link interni
// puntano alla cartella («../liste-attesa/»), mai a «index.html».
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const site = new URL('../', import.meta.url);
const read = (f) => readFileSync(new URL(f, site), 'utf8');
const reg = JSON.parse(read('data/moduli.json'));
const html = ['index.html', 'fonti.html', 'privacy.html', 'note-legali.html', 'numeri-utili/index.html',
  ...reg.groups.map((g) => `${g.page}/index.html`), ...reg.modules.map((m) => `${m.id}/index.html`),
  ...reg.modules.flatMap((m) => (m.pages || []).map((sp) => `${m.id}/${sp.id}/index.html`))];
const words = (s) => s.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

test('le pagine sono aggiornate con npm run pagine', () => {
  execFileSync(process.execPath, [fileURLToPath(new URL('tools/pagine.mjs', site)), '--controlla'], { stdio: 'pipe' });
});

test('ogni modulo ha la guida scritta nella pagina', () => {
  for (const m of reg.modules) {
    const page = read(`${m.id}/index.html`);
    const g = page.match(/<section class="wrap guida" id="guida"[\s\S]*?<\/section>/);
    assert.ok(g, `${m.id}: manca <section class="wrap guida" id="guida">`);
    // Un modulo diviso in pagine corte (moduli.json → "pages") ha nella pagina principale solo l'indice.
    const min = m.pages ? 60 : 300;
    assert.ok(words(g[0]) >= min, `${m.id}: la guida è troppo corta (${words(g[0])} parole)`);
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

test('«/x/index.html» porta subito a «/x/» (GitHub Pages non fa redirect 301)', () => {
  for (const f of html.filter((x) => x.endsWith('index.html'))) {
    assert.match(read(f), /location\.replace\(location\.pathname\.slice\(0,-10\)/, `${f}: manca il reindirizzamento`);
  }
});

test('le «Domande frequenti» sono anche nei dati strutturati FAQPage', () => {
  for (const m of reg.modules) {
    const page = read(`${m.id}/index.html`);
    const dl = page.match(/<h3>Domande frequenti<\/h3>\s*<dl>([\s\S]*?)<\/dl>/);
    // Un modulo diviso in pagine corte può non avere le domande frequenti: le domande sono i titoli delle pagine.
    if (!dl && m.pages) { assert.doesNotMatch(page, /"@type": "FAQPage"/, `${m.id}: dati FAQPage senza domande`); continue; }
    assert.ok(dl, `${m.id}: manca la sezione «Domande frequenti»`);
    const ld = page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(ld, `${m.id}: mancano i dati FAQPage`);
    const data = JSON.parse(ld[1]);
    assert.equal(data['@type'], 'FAQPage');
    assert.equal(data.mainEntity.length, (dl[1].match(/<dt>/g) || []).length, `${m.id}: domande diverse`);
  }
});

test('sitemap.xml ha tutte le pagine e robots.txt la indica', () => {
  const sitemap = read('sitemap.xml');
  for (const f of html) {
    const url = `https://guidasanita.it/${f.replace(/(^|\/)index\.html$/, '$1')}`;
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), `sitemap.xml: manca ${url}`);
  }
  assert.doesNotMatch(sitemap, /index\.html/);
  assert.match(read('robots.txt'), /^Sitemap: https:\/\/guidasanita\.it\/sitemap\.xml$/m);
});

test('l\'avviso finale dice a chi chiedere conferma, guida per guida', () => {
  const want = { invalidita: "l'INPS o con un patronato", 'ricorso-invalidita': "l'INPS o con un patronato", 'assegno-inclusione': "l'INPS o con un patronato", 'cartella-clinica': "l'ospedale o con la tua ASP" };
  for (const m of reg.modules) {
    assert.ok(read(`${m.id}/index.html`).replace(/&#39;/g, "'").includes(`Controlla sempre con ${want[m.id] || 'la tua ASP'}.`), m.id);
  }
});
