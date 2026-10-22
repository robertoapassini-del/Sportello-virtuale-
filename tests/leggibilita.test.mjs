// Italiano semplice (docs/regola-italiano.md): Gulpease per pagina, frasi lunghe, parole da ufficio.
// Gulpease = 89 + (300*frasi - 10*lettere)/parole. ≥ 60 = leggibile con la licenza media; ≥ 80 = elementare.
// Legge il testo scritto a mano delle pagine (senza i blocchi di tools/pagine.mjs) e i testi dei moduli js/.
// Se fallisce: dividi le frasi lunghe, usa parole semplici, ma lascia uguali fatti, cifre, date e leggi.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', nbsp: ' ', '#39': "'", apos: "'", rsquo: '’', laquo: '«', raquo: '»', egrave: 'è', agrave: 'à', eacute: 'é', ugrave: 'ù', ograve: 'ò', igrave: 'ì', euro: '€', hellip: '…', ndash: '–', mdash: '—' };
const BLOCK = /^(p|li|h[1-6]|td|th|dt|dd|div|summary|br|tr|ul|ol|section|details|table|blockquote|figcaption|label|button|option|legend|caption|aside|form|header|footer|nav)$/i;

// Testo con numero di riga per ogni carattere. Gli "a capo" di blocco diventano '¶' (fine frase).
function stripHtml(src, firstLine = 1) {
  let out = '', lines = [], line = firstLine, i = 0;
  const push = (s) => { for (const c of s) { out += c; lines.push(line); } };
  while (i < src.length) {
    const c = src[i];
    if (c === '\n') { line++; push(' '); i++; continue; }
    if (c === '<') {
      const m = /^<\/?([a-zA-Z0-9]+)[^>]*>/.exec(src.slice(i, i + 2000));
      if (m) {
        const tag = m[1].toLowerCase();
        if (tag === 'script' || tag === 'style' || tag === 'svg') {
          const end = src.indexOf(`</${tag}>`, i); const stop = end < 0 ? src.length : end + tag.length + 3;
          for (let k = i; k < stop; k++) if (src[k] === '\n') line++;
          i = stop; continue;
        }
        for (const ch of m[0]) if (ch === '\n') line++;
        push(BLOCK.test(tag) ? ' ¶ ' : '');
        i += m[0].length; continue;
      }
    }
    if (c === '&') {
      const m = /^&(#?[a-z0-9]+);/i.exec(src.slice(i, i + 12));
      if (m) { push(ENT[m[1]] ?? (m[1][0] === '#' ? String.fromCharCode(parseInt(m[1].slice(1))) : ' ')); i += m[0].length; continue; }
    }
    push(c); i++;
  }
  return { text: out, lines };
}

// Frasi: fine a . ! ? seguiti da spazio + maiuscola/«/( o fine; oppure fine blocco.
function sentences({ text, lines }) {
  const res = []; let start = 0;
  const emit = (end) => {
    const raw = text.slice(start, end).replace(/[¶\s]+/g, ' ').trim();
    if (/[A-Za-zÀ-ÿ]/.test(raw)) {
      let off = start; while (off < end && /[\s¶]/.test(text[off])) off++;
      res.push({ text: raw, line: lines[off] });
    }
    start = end;
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '¶') { emit(i); start = i + 1; continue; }
    if ('.!?'.includes(c)) {
      const rest = text.slice(i + 1, i + 6);
      if (/^[»"')\]]*(\s+|¶)/.test(rest) || i + 1 === text.length) {
        const after = text.slice(i + 1).replace(/^[»"')\]\s]+/, '');
        const prev = text.slice(Math.max(0, i - 6), i);
        const abbr = /(^|[\s('’])([Aa]rt|[Aa]rtt|nn?|[Ee]s|ecc|pag|[Dd]ott|[Ss]ig|lett|co|D\.Lgs|D\.L|L|d\.lgs|d\.l|D\.P\.R|DPR|cfr|[Tt]el|ca|ss|p|v|vd)$/.test(prev);
        if (!abbr && (after === '' || /^[A-ZÀ-Ý«"¶(0-9🧾-🫶✅❌👉📞]/u.test(after) || /^\p{Extended_Pictographic}/u.test(after))) emit(i + 1);
      }
    }
  }
  emit(text.length);
  return res;
}

const words = (s) => s.split(/\s+/).filter((w) => /[A-Za-zÀ-ÿ0-9]/.test(w));
const letters = (s) => (s.match(/[A-Za-zÀ-ÿ0-9]/g) || []).length;
function gulpease(sents) {
  let F = sents.length, L = 0, P = 0;
  for (const s of sents) { L += letters(s.text); P += words(s.text).length; }
  return P ? 89 + (300 * F - 10 * L) / P : null;
}

// Parte di pagina scritta a mano: <main>…</main> senza i blocchi creati da tools/pagine.mjs.
function pageMain(html) {
  const a = html.indexOf('<main'), b = html.indexOf('</main>');
  if (a < 0) return null;
  let body = html.slice(a, b < 0 ? html.length : b);
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  body = body.replace(/<!-- blocco:([a-z-]+)[\s\S]*?<!-- \/blocco:\1 -->/g, blank)
    .replace(/<!-- fonti[\s\S]*?<!-- \/fonti -->/g, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/<h2>In questa guida<\/h2>/g, blank);
  const firstLine = html.slice(0, a).split('\n').length;
  return { body, firstLine };
}

// Testi dei moduli JS: stringhe e template literal con almeno 4 parole; ${…} → «X».
function jsTexts(src) {
  const out = []; let i = 0, line = 1;
  while (i < src.length) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i); for (let k = i; k < e; k++) if (src[k] === '\n') line++; i = e + 2; continue; }
    if (c === '`' || c === "'" || c === '"') {
      const q = c, startLine = line; let j = i + 1, s = '', depth = 0;
      while (j < src.length) {
        const d = src[j];
        if (d === '\\') { s += src[j + 1] === 'n' ? ' ' : src[j + 1]; j += 2; continue; }
        if (q === '`' && d === '$' && src[j + 1] === '{') { // salta l'espressione, conta le parentesi
          depth = 1; j += 2; while (j < src.length && depth) { if (src[j] === '{') depth++; else if (src[j] === '}') depth--; else if (src[j] === '\n') line++; j++; }
          s += ' 10 '; continue;
        }
        if (d === q) break;
        if (d === '\n') { if (q !== '`') break; line++; }
        s += d; j++;
      }
      const plain = s.replace(/<[^>]*>/g, ' '); const ws = words(plain);
      if (ws.length >= 4 && !(ws.length > 30 && ws.filter((w) => w.length <= 5).length / ws.length > 0.8) && /[a-zà-ù]{3,} [a-zà-ù]{2,}/.test(s.replace(/<[^>]*>/g, ' '))) out.push({ src: s, line: startLine });
      i = j + 1; continue;
    }
    i++;
  }
  return out;
}

// Gergo burocratico. allow: contesti in cui la parola è spiegata o necessaria.
const JARGON = [
  { re: /\bistanz[ae]\b/gi, word: 'istanza', meglio: 'domanda' },
  { re: /\bai sensi\b/gi, word: 'ai sensi', meglio: 'secondo (la legge…)' },
  { re: /\bsuddett[oaie]\b/gi, word: 'suddetto', meglio: 'questo' },
  { re: /\berogazion[ei]\b/gi, word: 'erogazione', meglio: 'pagamento / servizio dato' },
  { re: /\berogat[oaie]\b|\berogar[ei]\b|\beroga(no)?\b/gi, word: 'erogare', meglio: 'dare, pagare' },
  { re: /\bdecorrenza\b/gi, word: 'decorrenza', meglio: 'da quando vale' },
  { re: /\binoltr(are|a|ata|ate|ato|ano|i)\b/gi, word: 'inoltrare', meglio: 'mandare' },
  { re: /\baventi? diritto\b/gi, word: 'avente diritto', meglio: 'chi ne ha diritto' },
  { re: /\bcontestualmente\b/gi, word: 'contestualmente', meglio: 'insieme, nello stesso momento' },
  { re: /\bnonché\b/gi, word: 'nonché', meglio: 'e anche' },
  { re: /\bovvero\b/gi, word: 'ovvero', meglio: 'cioè / oppure' },
  { re: /\bqualora\b/gi, word: 'qualora', meglio: 'se' },
  { re: /\bpresso\b/gi, word: 'presso', meglio: 'a, da, in' },
  { re: /\bprestazion[ei]\b(?! (sanitari|di |del|dell|special|ambulator|socio|riabilit|assistenz|economic|odontoiatr|domicil|previdenz))/gi, word: 'prestazione (da sola)', meglio: 'visita, esame, cura, aiuto' },
  { re: /\bin ordine a\b/gi, word: 'in ordine a', meglio: 'su' },
  { re: /\bmedesim[oaie]\b/gi, word: 'medesimo', meglio: 'stesso' },
  { re: /\bpredett[oaie]\b/gi, word: 'predetto', meglio: 'questo' },
  { re: /\bprevi[oa]\b/gi, word: 'previo', meglio: 'dopo / con' },
  { re: /\bin capo a\b/gi, word: 'in capo a', meglio: 'di / per' },
  { re: /\bin merito a\b/gi, word: 'in merito a', meglio: 'su' },
  { re: /\bal fine di\b/gi, word: 'al fine di', meglio: 'per' },
  { re: /\bentro e non oltre\b/gi, word: 'entro e non oltre', meglio: 'entro' },
  { re: /\bcompetent[ei]\b/gi, word: 'competente', meglio: 'giusto / che se ne occupa' },
  { re: /\bpertanto\b/gi, word: 'pertanto', meglio: 'quindi' },
  { re: /\btuttavia\b/gi, word: 'tuttavia', meglio: 'però' },
  { re: /\bil richiedente\b/gi, word: 'il richiedente', meglio: 'chi fa la domanda' },
  { re: /\bdi cui all\b/gi, word: 'di cui all', meglio: '(togliere)' },
  { re: /\bnell'ambito\b/gi, word: "nell'ambito", meglio: 'in / dentro' },
  { re: /\bespletament[oi]\b|\bespletar[ei]\b/gi, word: 'espletare', meglio: 'fare' },
  { re: /\bottemperare\b|\badempiment[oi]\b/gi, word: 'adempimento', meglio: 'cosa da fare' },
  { re: /\bdiniego\b/gi, word: 'diniego', meglio: 'rifiuto, il no' },
  { re: /\bsollecitare\b/gi, word: 'sollecitare', meglio: 'chiedere di nuovo' },
];

const ROOT = process.env.GS_ROOT || new URL('..', import.meta.url).pathname;
const SOGLIA_PAGINA = 60;   // pagine HTML (testo scritto a mano, senza i blocchi di tools/pagine.mjs)
const SOGLIA_JS = 65;       // testi delle schermate nei moduli JS (molti bottoni corti: punteggio più alto)
const MIN_PAROLE = 80;      // sotto questa lunghezza il Gulpease non è affidabile
const MAX_PAROLE_FRASE = 40;
// Moduli senza testo per chi legge, o con lettere agli uffici (linguaggio formale ammesso).
const JS_ESCLUSI = new Set(['letters.js', 'icons.js', 'ricetta-svg.js', 'engine.js', 'area.js', 'guida.js', 'cerca.js']);
// Parole da ufficio ammesse in questi contesti: tra «» (frase da copiare in una richiesta) o nel testo di una lettera.
const AMMESSI = [
  /«[^»]*»/g,                                   // citazioni da copiare
];
const LETTERE_JS = [ // frammenti di lettera costruiti fuori da letters.js
  { file: 'medico.js', re: /^presso lo sportello è risultato/ },
  { file: 'domiciliare.js', re: /^in data .* ha inoltrato richiesta/ },
  { file: 'palliative.js', re: /^in data .* è stata inoltrata richiesta/ },
];
const VIETATE = JARGON.filter((j) => !['sollecitare', 'competente', 'tuttavia'].includes(j.word));

function unita() {
  const locs = [...readFileSync(ROOT + 'sitemap.xml', 'utf8').matchAll(/<loc>https:\/\/[^/]+\/([^<]*)<\/loc>/g)].map((m) => m[1]);
  const out = [];
  for (const l of locs) {
    const f = l === '' ? 'index.html' : l.endsWith('/') ? l + 'index.html' : l;
    const pm = pageMain(readFileSync(ROOT + f, 'utf8'));
    if (pm) out.push({ id: f, js: false, sents: sentences(stripHtml(pm.body, pm.firstLine)) });
  }
  for (const f of readdirJs()) {
    const sents = [];
    for (const t of jsTexts(readFileSync(ROOT + 'js/' + f, 'utf8'))) sents.push(...sentences(stripHtml(t.src, t.line)));
    out.push({ id: 'js/' + f, js: true, file: f, sents });
  }
  return out;
}
function readdirJs() { return readdirSync(ROOT + 'js').filter((f) => f.endsWith('.js') && !JS_ESCLUSI.has(f)); }

const U = unita();

test('Gulpease per pagina sopra la soglia', () => {
  const bad = [];
  for (const u of U) {
    const P = u.sents.reduce((a, s) => a + words(s.text).length, 0);
    if (P < MIN_PAROLE) continue;
    const g = gulpease(u.sents), min = u.js ? SOGLIA_JS : SOGLIA_PAGINA;
    if (g < min) bad.push(`${u.id}: Gulpease ${g.toFixed(1)} (minimo ${min}, ${P} parole)`);
  }
  assert.deepEqual(bad, [], 'Testo troppo difficile: frasi più corte, parole più semplici.\n' + bad.join('\n'));
});

test(`Nessuna frase oltre ${MAX_PAROLE_FRASE} parole`, () => {
  const bad = [];
  for (const u of U) for (const s of u.sents) {
    const n = words(s.text).length;
    if (n > MAX_PAROLE_FRASE) bad.push(`${u.id}:${s.line} (${n} parole) ${s.text.slice(0, 90)}…`);
  }
  assert.deepEqual(bad, [], 'Frasi troppo lunghe: dividile.\n' + bad.join('\n'));
});

test('Niente parole da ufficio nel testo per chi legge', () => {
  const bad = [];
  for (const u of U) for (const s of u.sents) {
    if (u.js && LETTERE_JS.some((l) => l.file === u.file && l.re.test(s.text))) continue;
    let t = s.text; for (const a of AMMESSI) t = t.replace(a, ' ');
    for (const j of VIETATE) { const m = t.match(j.re); if (m) bad.push(`${u.id}:${s.line} «${m[0]}» → meglio «${j.meglio}»`); }
  }
  assert.deepEqual(bad, [], bad.join('\n'));
});
