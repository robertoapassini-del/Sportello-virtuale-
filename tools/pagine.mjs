// Rifà le parti comuni delle pagine partendo da data/moduli.json:
// - testata (logo, ricerca, le 4 aree) e percorso «Inizio › Area» in tutte le pagine;
// - le 4 pagine delle aree (per esempio visite-esami/index.html), con l'elenco dei moduli;
// - sitemap.xml.
// Uso: npm run pagine   (dopo aver aggiunto o cambiato un modulo o un'area)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(SITE, f), 'utf8');
const write = (f, s) => { fs.mkdirSync(path.dirname(path.join(SITE, f)), { recursive: true }); fs.writeFileSync(path.join(SITE, f), s); };
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const reg = JSON.parse(read('data/moduli.json'));
const home = read('index.html');
// L'icona è su una riga sola (ha virgolette dentro l'indirizzo): si prende tutta la riga.
const FAVICON = home.match(/<link rel="icon".*>/)[0];
const MARK = home.match(/<svg class="brand-mark"[\s\S]*?<\/svg>/)[0];
const groupById = Object.fromEntries(reg.groups.map((g) => [g.id, g]));
const INIZIO = { label: 'Inizio', href: 'index.html' };

// Ogni pagina: file, area attiva nel menu, percorso (senza la pagina stessa).
const pages = [
  { file: 'index.html', trail: [] },
  ...['fonti.html', 'privacy.html', 'note-legali.html'].map((file) => ({ file, trail: [INIZIO] })),
  ...reg.groups.map((g) => ({ file: `${g.page}/index.html`, area: g.id, trail: [INIZIO], group: g })),
  ...reg.modules.map((m) => {
    const g = groupById[m.group];
    return { file: `${m.id}/index.html`, area: g.id, trail: [INIZIO, { label: g.short, href: `${g.page}/index.html` }] };
  }),
];

function header(root, area) {
  const nav = reg.groups.map((g) => `<li><a href="${root}${g.page}/index.html"${g.id === area ? ' aria-current="true"' : ''}>${esc(g.short)}</a></li>`).join('');
  return `<header class="site-header">
<a class="skip-link" href="#app">Vai al contenuto</a>
<div class="wrap header-top"><a class="brand" href="${root}index.html">${MARK}<span>Guida Sanità <span class="brand-tag">Sicilia</span></span></a>
<form class="header-search" role="search" action="${root}index.html"><label for="hq" class="sr-only">Cerca nel sito</label><input type="search" id="hq" name="q" placeholder="Cerca: ticket, carrozzina…" autocomplete="off"><button type="submit" aria-label="Cerca"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button></form></div>
<nav class="header-nav" aria-label="Argomenti"><div class="wrap"><ul>${nav}</ul></div></nav>
</header>`;
}

// Sul computer tutto il percorso; sul telefono solo il link al livello sopra (come NHS.uk).
function breadcrumb(root, trail) {
  if (!trail.length) return '';
  const items = trail.map((t) => `<li><a href="${root}${t.href}">${esc(t.label)}</a></li>`).join('');
  const up = trail[trail.length - 1];
  return `\n<nav class="breadcrumb" aria-label="Sei qui"><div class="wrap"><ol>${items}</ol><a class="breadcrumb-back" href="${root}${up.href}"><span aria-hidden="true">‹ </span>${esc(up.label)}</a></div></nav>`;
}

function areaPage(g, root) {
  const mods = reg.modules.filter((m) => m.group === g.id);
  const others = reg.groups.filter((x) => x.id !== g.id);
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(g.title)} – Guida Sanità</title>
<meta name="description" content="${esc(g.intro)}">
<meta name="theme-color" content="#0b5f5c">
${FAVICON}
<script>document.documentElement.className += ' js';</script>
<link rel="stylesheet" href="${root}css/style.css">
</head>
<body>
<!-- Pagina creata da tools/pagine.mjs con i dati di data/moduli.json: non modificarla a mano. -->
<header class="site-header"></header>
<main class="wrap" id="app" data-band data-wide>
<div class="topbar"></div>
<h1 class="say">${esc(g.title)}</h1>
<p class="lead say">${esc(g.intro)}</p>
<ul class="area-list">
${mods.map((m) => `<li><a class="btn choice" href="${root}${m.id}/index.html"><span class="ico" aria-hidden="true">${m.icon}</span><span class="txt">${esc(m.title)} <small>${esc(m.small)}</small></span></a></li>`).join('\n')}
</ul>
<h2>Altri argomenti</h2>
<ul class="area-others">
${others.map((o) => `<li><a href="${root}${o.page}/index.html">${esc(o.title)}</a></li>`).join('\n')}
</ul>
<div id="area-help"></div>
</main>
<footer class="site-footer" id="site-footer"></footer>
<script type="module" src="${root}js/area.js"></script>
</body>
</html>
`;
}

const base = read('sitemap.xml').match(/<loc>(.*?)<\/loc>/)[1];
const pageUrl = (file) => base + file.replace(/(^|\/)index\.html$/, '$1');

for (const p of pages) {
  const root = p.file.includes('/') ? '../' : '';
  let html = p.group ? areaPage(p.group, root) : read(p.file);
  const top = header(root, p.area) + breadcrumb(root, p.trail);
  const re = /<header class="site-header">[\s\S]*?<\/header>(\n<nav class="breadcrumb"[\s\S]*?<\/nav>)?/;
  if (!re.test(html)) throw new Error(`Testata non trovata in ${p.file}`);
  html = html.replace(re, () => top).replace('<meta name="theme-color" content="#ffffff">', '<meta name="theme-color" content="#0b5f5c">');
  // Indirizzo canonico: «/x/» e «/x/index.html» sono la stessa pagina per Google.
  html = html.replace(/<link rel="canonical"[^>]*>\n/, '').replace(/(<link rel="stylesheet")/, `<link rel="canonical" href="${pageUrl(p.file)}">\n$1`);
  write(p.file, html);
  console.log('ok', p.file);
}

const urls = pages.map((p) => pageUrl(p.file)).sort((a, b) => (a === base ? -1 : b === base ? 1 : a.localeCompare(b)));
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`);
console.log(`ok sitemap.xml (${urls.length} pagine)`);
