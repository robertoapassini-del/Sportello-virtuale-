// Rifà le parti comuni delle pagine partendo da data/moduli.json:
// - testata (logo, ricerca, le 4 aree) e percorso «Inizio › Area» in tutte le pagine;
// - le 4 pagine delle aree (per esempio visite-esami/index.html), con l'elenco dei moduli;
// - i dati per l'anteprima nei messaggi (og:title…) e la barra «Condividi su WhatsApp / Stampa»;
// - in fondo alla guida scritta di ogni modulo, le fonti e la data del controllo (dai file data/);
// - sitemap.xml.
// I link interni puntano all'indirizzo della cartella («../liste-attesa/»), mai a «index.html».
// Con --controlla non scrive niente: esce con errore se qualche pagina non è aggiornata (lo usa npm test).
// Uso: npm run pagine   (dopo aver aggiunto o cambiato un modulo o un'area)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkWith } from '../js/controlla.js';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--controlla');
const read = (f) => fs.readFileSync(path.join(SITE, f), 'utf8');
const stale = [];
const write = (f, s) => {
  // Su Windows git può salvare i file con CR LF: si confronta il testo senza i CR.
  if (CHECK) { if (read(f).replace(/\r\n/g, '\n') !== s) stale.push(f); return; }
  fs.mkdirSync(path.dirname(path.join(SITE, f)), { recursive: true });
  fs.writeFileSync(path.join(SITE, f), s);
  console.log('ok', f);
};
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const reg = JSON.parse(read('data/moduli.json'));
const home = read('index.html');
// L'icona è su una riga sola (ha virgolette dentro l'indirizzo): si prende tutta la riga.
const FAVICON = home.match(/<link rel="icon".*>/)[0];
const MARK = home.match(/<svg class="brand-mark"[\s\S]*?<\/svg>/)[0];
const groupById = Object.fromEntries(reg.groups.map((g) => [g.id, g]));
const INIZIO = { label: 'Inizio', href: '' };
// Link a una pagina del sito: la cartella, senza «index.html» («./» per la home dalla cartella principale).
const href = (root, page) => root + page || './';

// Ogni pagina: file, area attiva nel menu, percorso (senza la pagina stessa).
const pages = [
  { file: 'index.html', trail: [] },
  ...['fonti.html', 'privacy.html', 'note-legali.html', 'numeri-utili/index.html'].map((file) => ({ file, trail: [INIZIO] })),
  ...reg.groups.map((g) => ({ file: `${g.page}/index.html`, area: g.id, trail: [INIZIO], group: g })),
  ...reg.modules.flatMap((m) => {
    const g = groupById[m.group];
    const trail = [INIZIO, { label: g.short, href: `${g.page}/` }];
    return [
      { file: `${m.id}/index.html`, area: g.id, trail, module: m },
      // Pagine corte della guida di un modulo (moduli.json → "pages"): /modulo/pagina/.
      ...(m.pages || []).map((sp) => ({ file: `${m.id}/${sp.id}/index.html`, area: g.id, trail: [...trail, { label: m.title, href: `${m.id}/` }], module: m, sub: sp })),
    ];
  }),
];

function header(root, area) {
  const nav = reg.groups.map((g) => `<li><a href="${root}${g.page}/"${g.id === area ? ' aria-current="true"' : ''}>${esc(g.short)}</a></li>`).join('');
  return `<header class="site-header">
<a class="skip-link" href="#app">Vai al contenuto</a>
<div class="wrap header-top"><a class="brand" href="${href(root, '')}">${MARK}<span>Guida Sanità</span></a>
<form class="header-search" role="search" action="${href(root, '')}"><label for="hq" class="sr-only">Cerca nel sito</label><input type="search" id="hq" name="q" placeholder="Cerca: ticket, carrozzina…" autocomplete="off"><button type="submit" aria-label="Cerca"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button></form></div>
<nav class="header-nav" aria-label="Argomenti"><div class="wrap"><ul>${nav}</ul></div></nav>
</header>`;
}

// Sul computer tutto il percorso; sul telefono solo il link al livello sopra (come NHS.uk).
function breadcrumb(root, trail) {
  if (!trail.length) return '';
  const items = trail.map((t) => `<li><a href="${href(root, t.href)}">${esc(t.label)}</a></li>`).join('');
  const up = trail[trail.length - 1];
  return `\n<nav class="breadcrumb" aria-label="Sei qui"><div class="wrap"><ol>${items}</ol><a class="breadcrumb-back" href="${href(root, up.href)}"><span aria-hidden="true">‹ </span>${esc(up.label)}</a></div></nav>`;
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
<h1>${esc(g.title)}</h1>
<p class="lead">${esc(g.intro)}</p>
<ul class="area-list">
${mods.map((m) => `<li><a class="btn choice" href="${root}${m.id}/"><span class="ico" aria-hidden="true">${m.icon}</span><span class="txt">${esc(m.title)} <small>${esc(m.small)}</small></span></a></li>`).join('\n')}
</ul>
<h2>Altri argomenti</h2>
<ul class="area-others">
${others.map((o) => `<li><a href="${root}${o.page}/">${esc(o.title)}</a></li>`).join('\n')}
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

// Anteprima quando si manda il link su WhatsApp o altrove: titolo, frase, indirizzo.
function openGraph(html, url) {
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  const desc = html.match(/<meta name="description" content="(.*?)">/)[1];
  return `<meta property="og:type" content="website">
<meta property="og:site_name" content="Guida Sanità">
<meta property="og:locale" content="it_IT">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
`;
}

// L'indirizzo nuovo comincia sempre con una sola «/»: «//altro-sito/…/index.html» darebbe «//altro-sito/», cioè un
// altro sito (audit di sicurezza, giro 6). Le «\» si tolgono anche loro: per il browser valgono come «/».
const HEAD_SCRIPT = "<script>document.documentElement.className += ' js';if(/\\/index\\.html$/.test(location.pathname))location.replace('/'+location.pathname.slice(0,-10).replace(/^[\\/\\\\]+/,'')+location.search+location.hash);</script>";
// Ai siti esterni (link ufficiali, WhatsApp) arriva solo l'indirizzo del sito, mai la pagina con quello che c'è dopo.
const REFERRER = '<meta name="referrer" content="strict-origin-when-cross-origin">';

// «Condividi su WhatsApp» (funziona anche senza JavaScript: è un link) e «Stampa».
// Sotto, l'indirizzo della pagina: si vede solo sul foglio stampato.
const WA_ICON = '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';
function shareBar(html, url) {
  const title = html.match(/<title>(.*?)<\/title>/)[1].replace(/ – Guida Sanità$/, '');
  const text = `${title.replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"')}\n${url}`;
  const guide = /id="guida"/.test(html);
  return `<!-- condividi: creato da tools/pagine.mjs -->
<aside class="wrap share-bar" aria-label="Condividi o stampa">
<a class="btn share-wa" href="https://wa.me/?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">${WA_ICON} Condividi su WhatsApp</a>
<button type="button" class="btn share-print js-inline" data-action="print-page"${guide ? ' data-print="guida"' : ''}>🖨️ ${guide ? 'Stampa la guida' : 'Stampa questa pagina'}</button>
<p class="print-url">Guida Sanità, gratis e fatta da volontari: ${url}</p>
</aside>
<!-- /condividi -->
`;
}

// Piè di pagina scritto nell'HTML, uguale a quello di js/common.js (renderFooter, che poi lo sostituisce):
// così «Chi siamo», privacy e contatti si vedono anche senza JavaScript.
const EMAIL = read('js/common.js').match(/MAINTAINER_EMAIL = '(.*?)'/)[1];
const footer = (root) => `<footer class="site-footer" id="site-footer"><div class="wrap">
<p><strong>Guida Sanità è fatto da volontari. Non siamo l'azienda sanitaria (ASL), l'INPS né un altro ufficio pubblico.</strong> Diamo informazioni generali, non il parere di un avvocato o di un medico.</p>
<nav aria-label="Informazioni">
<a href="${root}privacy.html">Privacy</a>
<a href="${root}fonti.html">Da dove prendiamo le informazioni</a>
<a href="${root}note-legali.html">Chi siamo</a>
<a href="mailto:${EMAIL}">Scrivici: ${EMAIL}</a>
</nav>
</div></footer>`;

// Fonti e data del controllo in fondo alla guida scritta: dai file data/ del modulo (data/moduli.json).
const dataFile = (f) => JSON.parse(read(`data/${f}.json`));
// File di una regione (data/regioni/<id>/): per ora la regione predefinita dell'indice (docs/regioni.md).
const regioni = dataFile('regioni/index');
const REGIONE = regioni.default;
const regionalFile = (name) => dataFile(`regioni/${REGIONE}/${name}`);
const dateIt = (d) => { const [y, m, g] = d.split('-').map(Number); return `${g === 1 ? '1º' : g} ${['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'][m - 1]} ${y}`; };
function guideSources(m) {
  const files = (m.data || []).map(dataFile);
  const seen = new Set();
  const list = files.flatMap((d) => d.sources || []).filter((s) => s.url && !seen.has(s.url) && seen.add(s.url));
  const dates = files.flatMap((d) => JSON.stringify(d).match(/"last_verified":"\d{4}-\d{2}-\d{2}"/g) || []).map((x) => x.slice(-11, -1)).sort();
  return `<!-- fonti: create da tools/pagine.mjs -->
<h3>Da dove vengono queste informazioni</h3>
<ul class="clean">
${list.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('\n')}
</ul>
<p class="muted">Sono informazioni generali, non il parere di un avvocato o di un medico. ${checkWith(m.id)}${dates.length ? ` Informazioni controllate il ${dateIt(dates[0])}.` : ''}</p>
<!-- /fonti -->`;
}

// Parti della guida scritta che vengono dai file data/ (così i numeri restano giusti):
// nella pagina si scrive <!-- blocco:nome --><!-- /blocco:nome --> e qui si riempie.
const BLOCKS = {
  // Home senza JavaScript: le aree con i loro moduli (prima era scritto a mano e restava indietro).
  'home-elenco': () => reg.groups.map((g) => {
    const mods = reg.modules.filter((m) => m.group === g.id);
    return `<h2><a href="${g.page}/">${esc(g.title)}</a></h2><ul class="static-list">${mods.map((m) => `<li><a href="${m.id}/">${esc(m.title)}</a></li>`).join('')}</ul>`;
  }).join('\n'),
  // «In questa guida»: l'elenco delle pagine corte di un modulo (moduli.json → "pages"),
  // con la pagina in cui si è scritta senza link. Vale nella pagina del modulo e in ogni pagina corta.
  'guida-indice': (p) => {
    const m = p.module;
    const up = p.sub ? '../' : '';
    const items = [{ id: '', title: m.title }, ...(m.pages || [])].map((sp) => {
      const here = (p.sub ? p.sub.id : '') === sp.id;
      const href = sp.id ? `${up}${sp.id}/` : (up || './');
      return here ? `<li aria-current="page"><strong>${esc(sp.title)}</strong></li>` : `<li><a href="${href}">${esc(sp.title)}</a></li>`;
    });
    return `<ol class="guida-indice">\n${items.join('\n')}\n</ol>`;
  },
  // Liste d'attesa: tempi massimi per classe di priorità (data/rules.json).
  'classi-priorita': () => {
    const r = dataFile('rules');
    const g = (n) => `${n} ${n === 1 ? 'giorno' : 'giorni'}`;
    const rows = [
      ['U', 'Urgente', `entro ${r.max_wait_days.U * 24} ore (${g(r.max_wait_days.U)})`, 'Non aspettare: chiama subito il CUP, la tua ASL o il tuo medico'],
      ['B', 'Breve', `entro ${g(r.max_wait_days.B)}`, `entro ${g(r.callback_days.B)}`],
      ['D', 'Differibile', `entro ${g(r.max_wait_days.D_visit)} per le visite, ${g(r.max_wait_days.D_exam)} per gli esami`, `entro ${g(r.callback_days.D_visit)} (visite) o ${g(r.callback_days.D_exam)} (esami)`],
      ['P', 'Programmabile', `entro ${g(r.max_wait_days.P)}`, `entro ${g(r.callback_days.P)}`],
    ];
    return `<table>
<thead><tr><th scope="col">Lettera sulla ricetta</th><th scope="col">Tempo massimo di attesa</th><th scope="col">Se il CUP non ti dà una data, l'ASL ti richiama</th></tr></thead>
<tbody>
${rows.map(([c, n, t, cb]) => `<tr><th scope="row">${c} – ${n}</th><td>${esc(t)}</td><td>${esc(cb)}</td></tr>`).join('\n')}
</tbody>
</table>`;
  },
  // Liste d'attesa: come chiedere il percorso di tutela in ogni provincia (data/regioni/<regione>/asp.json).
  'asp-tutela': () => {
    const d = regionalFile('asp');
    const list = [...d.asl].sort((a, b) => a.province.localeCompare(b.province));
    const links = (a) => [...new Set([a.info_url, a.form_url, a.portal_url].filter(Boolean))]
      .map((u, i) => `<a href="${esc(u)}" target="_blank" rel="noopener">${u === a.form_url && u !== a.info_url ? 'Modulo ufficiale' : u === a.portal_url ? 'Sito per la richiesta' : 'Pagina ufficiale'}${i ? '' : ` dell'${esc(a.name)}`}</a>`).join(' · ');
    return `<dl>
${list.map((a) => `<dt id="tutela-${esc(a.id)}">${esc(a.province)} – ${esc(a.name)}</dt>
<dd>${esc(a.how_to)}${a.pec && !a.how_to.includes(a.pec) ? ` PEC dell'ASP: ${esc(a.pec)}.` : ''}${links(a) ? `<br>${links(a)}` : ''}</dd>`).join('\n')}
</dl>`;
  },
  // Numeri utili senza JavaScript: i numeri validi in tutta Italia (data/numeri.json, senza le voci di una sola
  // regione) e l'elenco delle regioni con i numeri delle aziende sanitarie, che si scelgono con JavaScript (js/numeri.js).
  numeri: () => {
    const nums = dataFile('numeri');
    const tutti = (x) => !x.regione;
    const tel = (n) => `<a href="tel:${esc(n.replace(/\s+/g, ''))}">${esc(n)}</a>`;
    const extra = (n) => [n.what, n.address, n.hours, n.cost].filter(Boolean).map(esc).join(' · ');
    const one = (n) => `<li><strong>${esc(n.title || n.label)}</strong>: ${tel(n.number)}${extra(n) ? `<br>${extra(n)}` : ''}</li>`;
    const group = (g) => `<h2>${esc(g.title)}</h2>\n<ul>\n${g.items.filter(tutti).map(one).join('\n')}\n</ul>`;
    const attive = regioni.regioni.filter((r) => r.attiva).map((r) => r.name).sort((a, b) => a.localeCompare(b, 'it'));
    const links = nums.links.filter(tutti);
    return [
      group(nums.groups[0]),
      `<h2>I numeri della tua azienda sanitaria</h2>\n<p>Guardia medica, CUP per prenotare, ufficio per i cittadini (URP), cure a casa: con JavaScript attivo scegli la regione e la provincia. Regioni con i numeri delle aziende sanitarie: ${attive.map(esc).join(', ')}.</p>`,
      ...nums.groups.slice(1).map(group),
      nums.notes.filter((t) => typeof t === 'string').map((t) => `<p>${esc(t)}</p>`).join('\n'),
      links.length ? `<h2>Su internet</h2>\n<ul>\n${links.map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.url_label)}</a>: ${esc(l.what)}</li>`).join('\n')}\n</ul>` : '',
      `<p class="muted">Numeri controllati sui siti ufficiali. Informazioni controllate il ${dateIt(nums.last_verified)}.</p>`,
    ].filter(Boolean).join('\n');
  },
};

// Reti lente (audit del 22/10/2026, giro 7): il browser scopre gli import di un modulo solo dopo averlo scaricato,
// così su un 3G lento common.js, engine.js, flow.js… arrivano uno dopo l'altro. Con <link rel="modulepreload">
// in testa li chiede tutti insieme. L'elenco viene dagli import scritti nei file js/ (solo quelli statici).
const importsOf = new Map();
function moduleGraph(file, seen = new Set()) {
  if (seen.has(file)) return seen;
  seen.add(file);
  if (!importsOf.has(file)) {
    const src = read(`js/${file}`);
    importsOf.set(file, [...src.matchAll(/(?:\bfrom\s*|\bimport\s*)['"]\.\/([\w-]+\.js)['"]/g)].map((m) => m[1]));
  }
  for (const f of importsOf.get(file)) moduleGraph(f, seen);
  return seen;
}
function modulePreload(html, root) {
  const files = new Set();
  for (const [, attrs, body] of html.matchAll(/<script type="module"([^>]*)>([\s\S]*?)<\/script>/g)) {
    const src = attrs.match(/src="(?:\.\.\/|\.\/)*js\/([\w-]+\.js)"/);
    const entries = src ? [src[1]] : [...body.matchAll(/from\s*['"](?:\.\.\/|\.\/)*js\/([\w-]+\.js)['"]/g)].map((m) => m[1]);
    for (const e of entries) for (const f of moduleGraph(e)) files.add(f);
  }
  return [...files].map((f) => `<link rel="modulepreload" href="${root}js/${f}">\n`).join('');
}

for (const p of pages) {
  const root ='../'.repeat(p.file.split('/').length - 1);
  let html = p.group ? areaPage(p.group, root) : read(p.file).replace(/\r\n/g, '\n');
  const top = header(root, p.area) + breadcrumb(root, p.trail);
  const re = /<header class="site-header">[\s\S]*?<\/header>(\n<nav class="breadcrumb"[\s\S]*?<\/nav>)?/;
  if (!re.test(html)) throw new Error(`Testata non trovata in ${p.file}`);
  html = html.replace(re, () => top).replace('<meta name="theme-color" content="#ffffff">', '<meta name="theme-color" content="#0b5f5c">');
  // Indirizzo canonico: «/x/» e «/x/index.html» sono la stessa pagina per Google.
  const url = pageUrl(p.file);
  html = html.replace(/<link rel="canonical"[^>]*>\n/, '').replace(/<meta property="og:[^>]*>\n/g, '')
    .replace(/<link rel="stylesheet"/, (m) => `<link rel="canonical" href="${url}">\n${openGraph(html, url)}${m}`);
  // «/x/index.html» → «/x/»: GitHub Pages non fa redirect 301, quindi lo fa il browser appena apre la pagina.
  html = html.replace(/<script>document\.documentElement\.className[^<]*<\/script>/, () => HEAD_SCRIPT);
  html = html.replace(/<meta name="referrer"[^>]*>\n/, '').replace(/<meta name="viewport"[^>]*>\n/, (m) => `${m}${REFERRER}\n`);
  // Dati FAQPage di una versione precedente: non ci sono più «Domande frequenti», le domande sono i titoli delle pagine.
  html = html.replace(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\n/, '');
  html = html.replace(/<!-- condividi[\s\S]*?<!-- \/condividi -->\n/, '')
    .replace(/<footer class="site-footer"[\s\S]*?<\/footer>/, () => `${shareBar(html, url)}${footer(root)}`);
  html = html.replace(/<!-- blocco:([a-z-]+)[^>]*-->[\s\S]*?<!-- \/blocco:\1 -->/g, (_, name) => {
    if (!BLOCKS[name]) throw new Error(`Blocco sconosciuto «${name}» in ${p.file}`);
    return `<!-- blocco:${name} (creato da tools/pagine.mjs) -->\n${BLOCKS[name](p)}\n<!-- /blocco:${name} -->`;
  });
  html = html.replace(/<link rel="modulepreload"[^>]*>\n/g, '')
    .replace(/<link rel="stylesheet"[^>]*>\n/, (m) => `${m}${modulePreload(html, root)}`);
  if (p.module) {
    if (!/<!-- fonti[\s\S]*?<!-- \/fonti -->/.test(html)) throw new Error(`Guida scritta (id="guida" con <!-- fonti --><!-- /fonti -->) non trovata in ${p.file}`);
    html = html.replace(/<!-- fonti[\s\S]*?<!-- \/fonti -->/, () => guideSources(p.module));
  }
  write(p.file, html);
}

const urls = pages.map((p) => pageUrl(p.file)).sort((a, b) => (a === base ? -1 : b === base ? 1 : a.localeCompare(b)));
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`);
if (CHECK) {
  if (stale.length) { console.error(`Pagine non aggiornate: ${stale.join(', ')}. Lancia: npm run pagine`); process.exit(1); }
  console.log('Tutte le pagine sono aggiornate.');
} else console.log(`ok sitemap.xml (${urls.length} pagine)`);
