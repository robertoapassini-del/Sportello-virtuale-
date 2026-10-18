// Controllo automatico: non cambia mai il sito, segnala solo cosa ricontrollare a mano.
// - Novità dalle fonti (ogni giorno): Gazzetta Ufficiale e INPS, filtrate per parole chiave dei moduli.
// - Link e date (il lunedì, o con --tutto): link rotti nei file data/*.json e nelle pagine,
//   riprovati da un server in Italia (check-host.net) se non rispondono, perché molti siti ASP bloccano l'estero;
//   e campi last_verified più vecchi di MAX_GIORNI.
// Uso: npm run controllo           (stampa il resoconto)
//      npm run controllo -- --tutto (anche link e date, qualunque giorno sia)
// Su GitHub (GITHUB_TOKEN e GITHUB_REPOSITORY presenti) apre o aggiorna le issue.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_GIORNI = 180;
const GIORNI_NOVITA = 14;
const LABEL = 'controllo-automatico';
const TITOLO_LINK = 'Link rotti e dati da riverificare';
const UA = 'Mozilla/5.0 (compatible; GuidaSanita-controllo/1.0; +https://guidasanita.it)';

const FONTI = [
  { nome: 'Gazzetta Ufficiale', url: 'https://www.gazzettaufficiale.it/rss/SG' },
  { nome: 'INPS circolari', url: 'https://www.inps.it/it/it.rss.circolari.xml' },
  { nome: 'INPS messaggi', url: 'https://www.inps.it/it/it.rss.messaggi.xml' },
  { nome: 'INPS notizie', url: 'https://www.inps.it/it/it.rss.news.xml' },
];

// Parole chiave dei moduli (senza accenti, minuscole). Meglio poche e precise: troppi avvisi non li legge nessuno.
const PAROLE = [
  'esenzion', 'ticket', 'invalidita civile', 'invalidi civili', 'handicap', 'disabilit', 'legge 104',
  'indennita di accompagnamento', 'indennita di frequenza', 'pensione di inabilita', 'assegno sociale',
  'accertamento sanitario', 'accertamenti sanitari', 'commissione medica', 'non autosufficien', 'caregiver',
  'liste d attesa', 'tempi di attesa', 'livelli essenziali di assistenza', /\blea\b/,
  'servizio sanitario', 'prestazioni sanitarie', 'assegno di inclusione', /\badi\b/,
  'assistenza domiciliare', 'cure palliative', 'hospice', 'ausili', 'protesi', 'nomenclatore',
  'piano terapeutico', 'medico di medicina generale', 'medici di medicina generale', 'pediatr',
  'screening', 'vaccin', 'cartella clinica', 'fascicolo sanitario', 'regione siciliana',
];

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’'`]/g, ' ');
const paroleTrovate = (testo) => {
  const t = norm(testo);
  return PAROLE.filter((p) => (typeof p === 'string' ? t.includes(p) : p.test(t))).map(String);
};
const oggi = new Date();
const giorniFa = (d) => Math.floor((oggi - d) / 86400000);

async function scarica(url, opts = {}) {
  return fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(25000), headers: { 'User-Agent': UA }, ...opts });
}

// ---------- Novità dalle fonti ----------
const decodifica = (s) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, ' ')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ').trim();
const campo = (item, tag) => { const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')); return m ? decodifica(m[1]) : ''; };
function leggiData(s) {
  const it = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); // INPS: 16/10/2026
  if (it) return new Date(Date.UTC(+it[3], +it[2] - 1, +it[1]));
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

async function novita() {
  const trovate = [], errori = [];
  for (const f of FONTI) {
    try {
      const r = await scarica(f.url);
      if (!r.ok) throw new Error(`risposta ${r.status}`);
      const xml = await r.text();
      for (const item of xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || []) {
        const titolo = campo(item, 'title');
        const testo = campo(item, 'content:encoded') || campo(item, 'description');
        const link = campo(item, 'link');
        const data = leggiData(campo(item, 'pubDate'));
        if (data && giorniFa(data) > GIORNI_NOVITA) continue;
        const parole = paroleTrovate(`${titolo} ${testo}`);
        if (parole.length) trovate.push({ fonte: f.nome, titolo, testo, link, data, parole });
      }
    } catch (e) {
      errori.push(`${f.nome}: ${e.message}`);
    }
  }
  return { trovate, errori };
}

// ---------- Date di verifica ----------
const fileDati = () => fs.readdirSync(path.join(SITE, 'data')).filter((f) => f.endsWith('.json')).map((f) => `data/${f}`);

function dateVecchie() {
  const out = [];
  const visita = (v, file, dove) => {
    if (Array.isArray(v)) v.forEach((x, i) => visita(x, file, `${dove}[${i}]`));
    else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) {
        if (k === 'last_verified' && typeof x === 'string') {
          const d = new Date(x);
          const nome = v.name || v.title || v.id || dove || '(file intero)';
          if (isNaN(d)) out.push({ file, nome, data: x, giorni: null });
          else if (giorniFa(d) > MAX_GIORNI) out.push({ file, nome, data: x, giorni: giorniFa(d) });
        } else visita(x, file, dove ? `${dove}.${k}` : k);
      }
    }
  };
  for (const f of fileDati()) visita(JSON.parse(fs.readFileSync(path.join(SITE, f), 'utf8')), f, '');
  return out;
}

// ---------- Link ----------
function pagineHtml(dir = SITE, rel = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || ['node_modules', 'docs', 'tests', 'tools', 'fonts'].includes(e.name)) continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...pagineHtml(path.join(dir, e.name), r));
    else if (e.name.endsWith('.html')) out.push(r);
  }
  return out;
}

function raccogliLink() {
  const dove = new Map();
  for (const f of [...fileDati(), ...pagineHtml()]) {
    const testo = fs.readFileSync(path.join(SITE, f), 'utf8');
    for (let u of testo.match(/https?:\/\/[^\s"'<>`)\]\\]+/g) || []) {
      u = u.replace(/&amp;/g, '&').replace(/[.,;:]+$/, '');
      if (/w3\.org|schema\.org|\$\{/.test(u)) continue;
      if (!dove.has(u)) dove.set(u, new Set());
      dove.get(u).add(f);
    }
  }
  return dove;
}

async function provaLink(u) {
  for (let tentativo = 0; tentativo < 2; tentativo++) {
    try {
      let r = await scarica(u, { method: 'HEAD' });
      if (r.status >= 400) r = await scarica(u); // molti siti pubblici non rispondono bene a HEAD
      return { stato: r.status };
    } catch (e) {
      if (tentativo === 1) return { stato: 0, errore: e.cause?.code || e.name || e.message };
    }
  }
}

// Molti siti ASP bloccano chi si collega dall'estero (GitHub controlla dagli Stati Uniti):
// i link che non rispondono si riprovano da un server a Milano con check-host.net.
const CHECK_HOST = 'https://check-host.net';
const NODO_ITALIA = 'it2.node.check-host.net';
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

async function provaDallItalia(urls) {
  const esiti = new Map();
  const richieste = [];
  for (const u of urls) {
    for (let tentativo = 0; tentativo < 4; tentativo++) {
      try {
        const r = await fetch(`${CHECK_HOST}/check-http?host=${encodeURIComponent(u)}&node=${NODO_ITALIA}`,
          { headers: { Accept: 'application/json', 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
        const testo = await r.text();
        const id = testo.startsWith('{') ? JSON.parse(testo).request_id : null;
        if (id) { richieste.push({ u, id }); break; }
        if (testo.includes('limit_exceeded') && tentativo < 3) { await pausa(15000); continue; }
        console.warn(`check-host non ha accettato ${u}: ${r.status} ${testo.slice(0, 150)}`);
      } catch (e) { console.warn(`check-host non raggiungibile per ${u}: ${e.message}`); }
      break;
    }
    await pausa(2000); // check-host limita le richieste troppo ravvicinate
  }
  for (let giro = 0; giro < 12 && richieste.some((x) => !esiti.has(x.u)); giro++) {
    await pausa(5000);
    for (const { u, id } of richieste.filter((x) => !esiti.has(x.u))) {
      try {
        const r = await fetch(`${CHECK_HOST}/check-result/${id}`,
          { headers: { Accept: 'application/json', 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
        const v = (await r.json())[NODO_ITALIA];
        if (!v) { if (giro === 11) console.warn(`check-host senza risposta per ${u}`); continue; } // ancora in corso
        // v = [[1 se ha risposto, secondi, messaggio, codice HTTP, ip]]
        const [ok, , , codice] = v[0] || [];
        const n = Number(codice);
        esiti.set(u, ok === 1 && n > 0 && n < 400 ? { funziona: true } : { funziona: false, motivo: n ? `errore ${n}` : 'non risponde' });
      } catch { /* riprova al giro dopo */ }
    }
  }
  return esiti;
}

async function linkRotti() {
  const dove = raccogliLink();
  const urls = [...dove.keys()];
  const falliti = [];
  let i = 0;
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (i < urls.length) {
      const u = urls[i++];
      const r = await provaLink(u);
      // 401/403/429: il sito blocca i controlli automatici, non vuol dire che il link sia rotto.
      if (r.stato === 0 || (r.stato >= 400 && ![401, 403, 429].includes(r.stato))) falliti.push({ url: u, ...r });
    }
  }));

  const italia = await provaDallItalia(falliti.map((x) => x.url));
  const rotti = [], nonVerificabili = [];
  let soloItalia = 0;
  for (const f of falliti) {
    const it = italia.get(f.url);
    const voce = { ...f, file: [...dove.get(f.url)].sort() };
    if (!it) nonVerificabili.push(voce);
    else if (it.funziona) soloItalia++;
    else rotti.push({ ...voce, motivo: `${it.motivo} anche dall'Italia` });
  }
  const ordina = (a) => a.sort((x, y) => x.url.localeCompare(y.url));
  return { totale: urls.length, rotti: ordina(rotti), nonVerificabili: ordina(nonVerificabili), soloItalia };
}

// ---------- Resoconti ----------
const fmtData = (d) => (d ? d.toISOString().slice(0, 10) : 's.d.');
const taglia = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function testoNovita(trovate, errori) {
  let s = 'Novità uscite nelle fonti ufficiali che **potrebbero** riguardare il sito. ' +
    'Leggi ognuna: se cambia qualcosa, aggiorna i file in `data/` (e `last_verified`). Poi chiudi la issue.\n\n';
  for (const n of trovate) {
    s += `- [ ] **${n.fonte}** (${fmtData(n.data)}) — [${taglia(n.titolo, 120)}](${n.link})\n`;
    if (n.testo) s += `  ${taglia(n.testo, 300)}\n`;
    s += `  _Parole trovate: ${n.parole.join(', ')}_\n`;
  }
  if (errori.length) s += `\n⚠️ Fonti non lette oggi: ${errori.join('; ')}\n`;
  return s;
}

function testoLink(link, date) {
  let s = `Resoconto del controllo automatico del ${fmtData(oggi)}. Si aggiorna da solo ogni lunedì; ` +
    'quando è tutto a posto la issue si chiude.\n\n';
  if (link) {
    s += `## Link da sistemare (${link.rotti.length} su ${link.totale} controllati)\n\n`;
    if (!link.rotti.length) s += 'Nessuno. 👍\n';
    for (const l of link.rotti) s += `- [ ] ${l.url} — ${l.motivo} — in ${l.file.map((f) => `\`${f}\``).join(', ')}\n`;
    s += '\nOgni link è stato riprovato anche da un server in Italia. Può comunque essere un guasto passeggero: ' +
      'aprilo dal browser prima di cambiarlo.\n';
    if (link.soloItalia) s += `\n${link.soloItalia} link non rispondono dall'estero ma dall'Italia funzionano: tutto a posto.\n`;
    if (link.nonVerificabili.length) {
      s += `\n### Non verificabili dall'Italia (${link.nonVerificabili.length})\n\nIl server di prova in Italia non ha risposto: aprili tu dal browser.\n\n`;
      for (const l of link.nonVerificabili) s += `- [ ] ${l.url} — in ${l.file.map((f) => `\`${f}\``).join(', ')}\n`;
    }
    s += '\n';
  }
  s += `## Dati non verificati da più di ${MAX_GIORNI} giorni (${date.length})\n\n`;
  if (!date.length) s += 'Nessuno. 👍\n';
  for (const d of date) s += `- [ ] \`${d.file}\` — ${d.nome}: verificato il ${d.data}${d.giorni ? ` (${d.giorni} giorni fa)` : ' (data non valida)'}\n`;
  s += '\nDopo aver ricontrollato con la fonte ufficiale, aggiorna `last_verified` alla data di oggi.\n';
  return s;
}

// ---------- GitHub ----------
const TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY;
async function gh(metodo, percorso, corpo) {
  const r = await fetch(`https://api.github.com/repos/${REPO}${percorso}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': UA },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  if (!r.ok) throw new Error(`GitHub ${metodo} ${percorso}: ${r.status} ${await r.text()}`);
  return r.json();
}
const issueAutomatiche = () => gh('GET', `/issues?labels=${LABEL}&state=all&per_page=100&sort=created&direction=desc`);

// ---------- Avvio ----------
const tutto = process.argv.includes('--tutto') || oggi.getUTCDay() === 1 || process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';

const { trovate, errori } = await novita();
const link = tutto ? await linkRotti() : null;
const date = tutto ? dateVecchie() : null;

if (!TOKEN || !REPO) {
  console.log(`# Novità dalle fonti (${trovate.length})\n\n${testoNovita(trovate, errori)}`);
  if (tutto) console.log(`# ${TITOLO_LINK}\n\n${testoLink(link, date)}`);
  else console.log('(Link e date si controllano il lunedì; aggiungi --tutto per farlo ora.)');
} else {
  const esistenti = (await issueAutomatiche()).filter((x) => !x.pull_request);
  const giaViste = esistenti.map((x) => x.body || '').join('\n');
  const nuove = trovate.filter((n) => !giaViste.includes(n.link));
  if (nuove.length) {
    const t = await gh('POST', '/issues', { title: `Novità dalle fonti – ${fmtData(oggi)} (${nuove.length})`, body: testoNovita(nuove, errori), labels: [LABEL] });
    console.log(`Aperta issue novità: ${t.html_url}`);
  } else console.log('Nessuna novità nuova dalle fonti.');

  if (tutto) {
    const aperta = esistenti.find((x) => x.state === 'open' && x.title === TITOLO_LINK);
    const problemi = link.rotti.length + link.nonVerificabili.length + date.length;
    const body = testoLink(link, date);
    if (problemi && aperta) await gh('PATCH', `/issues/${aperta.number}`, { body });
    else if (problemi) console.log(`Aperta issue link: ${(await gh('POST', '/issues', { title: TITOLO_LINK, body, labels: [LABEL] })).html_url}`);
    else if (aperta) await gh('PATCH', `/issues/${aperta.number}`, { body, state: 'closed' });
    console.log(`Link rotti: ${link.rotti.length}/${link.totale} (bloccati solo dall'estero: ${link.soloItalia}; non verificabili: ${link.nonVerificabili.length}); date vecchie: ${date.length}.`);
  }
}
