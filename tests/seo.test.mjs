// Come appare il sito su Google e nei messaggi (23/10/2026: Google mostrava «guidasanita.it» al posto del nome,
// titoli lunghi tagliati, il riquadro «Stai male adesso?» come descrizione della home, nessuna immagine di anteprima).
// Le parti controllate qui le scrive tools/pagine.mjs: si cambiano lì.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const site = new URL('../', import.meta.url);
const read = (f) => readFileSync(new URL(f, site), 'utf8');
const BASE = 'https://guidasanita.it/';
const sitemap = read('sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
const fileOf = (u) => { const p = u.slice(BASE.length); return !p || p.endsWith('/') ? `${p}index.html` : p; };
const pagine = urls.map((u) => ({ url: u, file: fileOf(u), html: read(fileOf(u)) }));
const testo = (s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const ld = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const tipi = (html) => ld(html).flatMap((d) => d['@graph'] || [d]).map((x) => x['@type']);

test('ogni pagina: canonical assoluto uguale alla sitemap, senza parametri', () => {
  const brutti = pagine.filter((p) => (p.html.match(/<link rel="canonical" href="([^"]+)">/) || [])[1] !== p.url || /[?#]/.test(p.url)).map((p) => p.file);
  assert.deepEqual(brutti, []);
});

test('icone con percorso assoluto in ogni pagina', () => {
  const brutti = pagine.filter((p) => [...p.html.matchAll(/<link rel="(?:icon|apple-touch-icon|manifest)" href="([^"]+)"/g)].some((m) => !m[1].startsWith('/'))).map((p) => p.file);
  assert.deepEqual(brutti, []);
  assert.ok(pagine.every((p) => p.html.includes('<link rel="icon" href="/favicon.ico" sizes="48x48">')));
});

test('anteprima per i messaggi: og:image 1200x630 e twitter:card', () => {
  const png = readFileSync(new URL('og-image.png', site));
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  const servono = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'og:site_name', 'og:locale'];
  const brutti = pagine.filter((p) => servono.some((k) => !p.html.includes(`<meta property="${k}" content="`))
    || !p.html.includes(`<meta property="og:image" content="${BASE}og-image.png">`)
    || !p.html.includes('<meta property="og:locale" content="it_IT">')
    || !p.html.includes('<meta name="twitter:card" content="summary_large_image">')).map((p) => p.file);
  assert.deepEqual(brutti, []);
});

test('titoli: al massimo 60 caratteri; « – Guida Sanità» solo sui titoli corti', () => {
  const brutti = [];
  for (const p of pagine.filter((x) => x.file !== 'index.html')) {
    const t = testo(p.html.match(/<title>(.*?)<\/title>/)[1]);
    const base = t.replace(/ – Guida Sanità$/, '');
    if (t.length > 60) brutti.push(`${p.file}: ${t.length} caratteri`);
    if (/ - Guida Sanità$/.test(t)) brutti.push(`${p.file}: trattino corto`);
    if (t === base && base.length + 15 <= 60) brutti.push(`${p.file}: titolo corto senza « – Guida Sanità»`);
  }
  assert.deepEqual(brutti, []);
});

test('dati strutturati: JSON valido; nome e logo nella home; percorso ovunque; Article nelle guide', () => {
  const home = pagine.find((p) => p.file === 'index.html').html;
  const g = ld(home)[0]['@graph'];
  const sito = g.find((x) => x['@type'] === 'WebSite');
  assert.equal(sito.name, 'Guida Sanità');
  assert.equal(sito.alternateName, 'guidasanita.it');
  assert.equal(sito.url, BASE);
  assert.equal(g.find((x) => x['@type'] === 'Organization').logo, `${BASE}icon-512.png`);
  assert.ok(existsSync(new URL('icon-512.png', site)));
  const brutti = [];
  for (const p of pagine.filter((x) => x.file !== 'index.html')) {
    if (ld(p.html).length !== 1) { brutti.push(`${p.file}: ${ld(p.html).length} blocchi JSON-LD`); continue; }
    const t = tipi(p.html);
    if (!t.includes('BreadcrumbList')) brutti.push(`${p.file}: manca BreadcrumbList`);
    const guida = p.html.includes('id="guida"');
    if (guida && !t.includes('Article')) brutti.push(`${p.file}: manca Article`);
    const art = ld(p.html)[0]['@graph'].find((x) => x['@type'] === 'Article');
    if (art && (!art.headline || !art.description || !/^\d{4}-\d{2}-\d{2}$/.test(art.dateModified || '') || !art.publisher.logo)) brutti.push(`${p.file}: Article incompleto`);
  }
  assert.deepEqual(brutti, []);
});

test('sitemap: lastmod con una data vera, mai nel futuro', () => {
  const oggi = new Date().toISOString().slice(0, 10);
  const date = [...sitemap.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map((m) => m[1]);
  assert.ok(date.length >= urls.length - 5, `solo ${date.length} lastmod su ${urls.length} pagine`);
  assert.deepEqual(date.filter((d) => !/^\d{4}-\d{2}-\d{2}$/.test(d) || d > oggi), []);
});

test('home: sotto il titolo la frase che dice a cosa serve il sito, prima del riquadro «Stai male adesso?»', () => {
  const home = read('index.html');
  assert.match(home, /<h1>Di cosa hai bisogno\?<\/h1>\n<p class="lead">La visita è troppo lontana\?/);
  const js = read('js/home.js');
  assert.ok(js.indexOf('home-lead') > 0 && js.indexOf('home-lead') < js.indexOf('${urgent}'));
});

test('«Chi siamo» e «Note legali» sono due pagine, con i link nel piè di pagina', () => {
  assert.match(read('chi-siamo.html'), /<h1>Chi siamo<\/h1>/);
  assert.match(read('note-legali.html'), /<h1>Note legali<\/h1>/);
  assert.ok(urls.includes(`${BASE}chi-siamo.html`) && urls.includes(`${BASE}note-legali.html`));
  for (const f of ['js/common.js', 'tools/pagine.mjs']) {
    const s = read(f);
    assert.ok(s.includes('chi-siamo.html">Chi siamo<') && s.includes('note-legali.html">Note legali<'), f);
  }
});
