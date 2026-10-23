// Le pagine si leggono anche senza JavaScript (e così le legge Google): ogni modulo ha la
// guida scritta nell'HTML, la barra «Condividi su WhatsApp / Stampa», e i link interni
// puntano alla cartella («../liste-attesa/»), mai a «index.html».
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { checkWith } from '../js/controlla.js';
import { fileURLToPath } from 'node:url';

const site = new URL('../', import.meta.url);
const read = (f) => readFileSync(new URL(f, site), 'utf8');
const reg = JSON.parse(read('data/moduli.json'));
const html = ['index.html', 'fonti.html', 'privacy.html', 'chi-siamo.html', 'note-legali.html', 'numeri-utili/index.html',
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
    // Sempre con una sola «/» davanti: tests/head-script.test.mjs prova che non si esce dal sito.
    assert.match(read(f), /location\.replace\('\/'\+location\.pathname\.slice\(0,-10\)/, `${f}: manca il reindirizzamento`);
  }
});

test('niente dati FAQPage: le domande frequenti sono i titoli delle pagine corte', () => {
  for (const m of reg.modules) {
    assert.doesNotMatch(read(`${m.id}/index.html`), /"@type": "FAQPage"/, `${m.id}: dati FAQPage senza domande`);
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
  // La frase viene da js/controlla.js (CHECK_WITH): è la stessa delle pagine con JavaScript.
  for (const m of reg.modules) {
    assert.ok(read(`${m.id}/index.html`).replace(/&#39;/g, "'").includes(checkWith(m.id)), m.id);
  }
});

test('404.html: in italiano, non indicizzata, solo indirizzi assoluti, fuori dalla sitemap', () => {
  const html = read('404.html');
  assert.match(html, /<html lang="it">/);
  assert.match(html, /<meta name="robots" content="noindex">/);
  const rel = [...html.matchAll(/(?:href|src|action)="([^"]*)"/g)].map((m) => m[1]).filter((u) => !/^(\/|tel:|data:|https:)/.test(u));
  assert.deepEqual(rel, [], 'GitHub Pages la mostra a qualsiasi profondità: servono indirizzi che iniziano con «/»');
  assert.doesNotMatch(read('sitemap.xml'), /404/);
});

// Le sigle si spiegano nella pagina dove servono: chi arriva da Google legge solo quella (audit del 21/10/2026).
// Guarda il testo fisso (non le parti create da tools/pagine.mjs, che hanno già le loro parole).
const SIGLE = [
  ['PEC', /email speciale/],
  ['ISEE', /misura/],
  ['CUP', /ufficio dove si prenot/],
  ['TAR', /tribunale amministrativo/i],
  ['PUA', /Punto unico di accesso|sportello per l.assistenza a casa/i],
  ['SAD', /servizio di assistenza domiciliare/i],
];
// Pagine che un altro lavoro sta riscrivendo: da togliere appena hanno la spiegazione.
const SIGLE_DA_FARE = {};
test('ogni sigla (PEC, ISEE, CUP, TAR, PUA, SAD) è spiegata nella pagina dove compare', () => {
  const pagine = read('sitemap.xml').match(/<loc>(.*?)<\/loc>/g)
    .map((x) => x.slice(5, -6).replace('https://guidasanita.it/', '')).map((u) => (u === '' || u.endsWith('/') ? `${u}index.html` : u));
  const errori = [];
  for (const f of pagine) {
    const html = read(f);
    if (/<!-- Pagina creata da tools\/pagine\.mjs/.test(html)) continue; // pagine delle aree: tutta generata
    const fisso = html.replace(/<head>[\s\S]*?<\/head>/, '').replace(/<header class="site-header">[\s\S]*?<\/header>/, '')
      .replace(/<nav class="breadcrumb"[\s\S]*?<\/nav>/, '')
      .replace(/<!-- (blocco:[a-z-]+|fonti|condividi)[\s\S]*?<!-- \/(blocco:[a-z-]+|fonti|condividi) -->/g, '')
      .replace(/<footer[\s\S]*?<\/footer>/g, '').replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'");
    for (const [sigla, spiegazione] of SIGLE) {
      if ((SIGLE_DA_FARE[f] || []).includes(sigla)) continue;
      if (new RegExp(`\\b${sigla}\\b`).test(fisso) && !spiegazione.test(fisso)) errori.push(`${f}: «${sigla}» senza spiegazione`);
    }
  }
  assert.deepEqual(errori, [], errori.join('\n'));
});

// Audit dei mutanti del 21/10/2026: errori che nessun test prendeva.
const pagineSitemap = () => read('sitemap.xml').match(/<loc>(.*?)<\/loc>/g)
  .map((x) => x.slice(5, -6).replace('https://guidasanita.it/', '')).map((u) => (u === '' || u.endsWith('/') ? `${u}index.html` : u));

test('ogni elenco «Da dove vengono queste informazioni» ha almeno una fonte', () => {
  const vuoti = [];
  let blocchi = 0;
  for (const f of pagineSitemap()) {
    for (const [b] of read(f).matchAll(/<!-- fonti[\s\S]*?<!-- \/fonti -->/g)) {
      blocchi++;
      if (!/<li>\s*<a href="https:\/\//.test(b)) vuoti.push(f);
    }
  }
  assert.ok(blocchi >= reg.modules.length, `trovati solo ${blocchi} elenchi di fonti`);
  assert.deepEqual(vuoti, [], `pagine con l'elenco delle fonti vuoto (manca «sources» nei dati?):\n${vuoti.join('\n')}`);
});

test('nessuna pagina della sitemap è «noindex» (solo la 404 lo è)', () => {
  const noindex = pagineSitemap().filter((f) => /<meta[^>]+name=["']robots["'][^>]*noindex|<meta[^>]+noindex[^>]+name=["']robots["']/i.test(read(f)));
  assert.deepEqual(noindex, [], `pagine nella sitemap che Google non indicizzerebbe:\n${noindex.join('\n')}`);
  assert.match(read('404.html'), /<meta name="robots" content="noindex">/);
});

// Audit giro 6: ai siti esterni (link ufficiali, WhatsApp) arriva solo l'indirizzo del sito, non quello della pagina.
test('ogni pagina ha <meta name="referrer" content="strict-origin-when-cross-origin">', () => {
  for (const f of [...html, '404.html']) {
    assert.match(read(f), /<meta name="referrer" content="strict-origin-when-cross-origin">/, `${f}: manca il meta referrer`);
  }
});

// Reti lente (audit del 22/10/2026, giro 7): senza modulepreload il browser scarica i moduli uno dopo l'altro
// (prima la pagina, poi common.js, poi engine.js…). Ogni modulo usato dalla pagina va chiesto subito, in testa.
test('ogni pagina chiede in testa tutti i suoi moduli (modulepreload)', () => {
  const importsDi = (f) => [...read(`js/${f}`).matchAll(/(?:\bfrom\s*|\bimport\s*)['"]\.\/([\w-]+\.js)['"]/g)].map((m) => m[1]);
  for (const f of html) {
    const page = read(f);
    const head = page.match(/<head>[\s\S]*?<\/head>/)[0];
    const pre = new Set([...head.matchAll(/<link rel="modulepreload" href="(?:\.\.\/)*js\/([\w-]+\.js)">/g)].map((m) => m[1]));
    const da = [...page.matchAll(/<script type="module"([^>]*)>([\s\S]*?)<\/script>/g)]
      .flatMap(([, a, b]) => [...`${a} ${b}`.matchAll(/js\/([\w-]+\.js)/g)].map((m) => m[1]));
    assert.ok(da.length, `${f}: nessun modulo`);
    const visti = new Set();
    const giro = (m) => { if (visti.has(m)) return; visti.add(m); importsDi(m).forEach(giro); };
    da.forEach(giro);
    for (const m of visti) assert.ok(pre.has(m), `${f}: manca <link rel="modulepreload"> per js/${m} (npm run pagine)`);
  }
});
