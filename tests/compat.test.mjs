// Telefoni vecchi (audit del 22/10/2026): il JavaScript deve partire anche su Safari 12 (iPhone 5s, 6 e 6 Plus
// restano a iOS 12) e su Chrome / Samsung Internet basati su Chromium 70.
// Un solo «?.» o «??» in js/common.js è un errore di sintassi: nessun modulo parte (si vede solo il testo scritto).
// Senza dipendenze: un piccolo lettore toglie commenti, stringhe e testo dei template, poi cerca la sintassi
// e i metodi troppo nuovi. Le espressioni regolari restano (servono per il lookbehind).
// Controlla i file js/ e gli script «type=module» scritti dentro le pagine HTML (fonti.html, privacy.html…).
// Uso: node --test tests/compat.test.mjs   (JS_DIR=… per provare un'altra cartella)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = process.env.JS_DIR || path.join(SITE, 'js');

// Ciò che non va su Safari 12.1 / Chrome 70 (fonte: tabelle MDN «Browser compatibility»).
const NUOVI = [
  [/\?\.(?!\d)/, '?. (Safari 13.1, Chrome 80)'],
  [/\?\?/, '?? (Safari 13.1, Chrome 80)'],
  [/(\|\||&&)=/, '||= &&= (Safari 14, Chrome 85)'],
  [/(^|[^\w$.])#[A-Za-z_$]/, 'campo privato #x (Safari 15, Chrome 74)'],
  [/\bstatic\s*\{/, 'static { } (Safari 16.4, Chrome 94)'],
  [/\.matchAll\s*\(/, 'matchAll (Safari 13, Chrome 73)'],
  [/\.replaceAll\s*\(/, 'replaceAll (Safari 13.1, Chrome 85)'],
  [/\.at\s*\(/, '.at() (Safari 15.4, Chrome 92)'],
  [/\bObject\.(hasOwn|fromEntries)\b/, 'Object.hasOwn / fromEntries (Safari 15.4 / 12.1)'],
  [/\bstructuredClone\b/, 'structuredClone (Safari 15.4, Chrome 98)'],
  [/\.(findLast|findLastIndex|toSorted|toReversed|toSpliced|with)\s*\(/, 'metodi degli array del 2023 (Safari 15.4-16)'],
  [/\bPromise\.(allSettled|any)\b/, 'Promise.allSettled / any (Safari 13 / 14)'],
  [/\bglobalThis\b/, 'globalThis (Safari 12.1, Chrome 71)'],
  [/\bIntl\.(ListFormat|RelativeTimeFormat|DisplayNames|Segmenter)\b/, 'Intl recente (Safari 14+)'],
  [/\brequestIdleCallback\b/, 'requestIdleCallback (Safari: no)'],
  [/\.replaceChildren\s*\(/, 'replaceChildren (Safari 14, Chrome 86)'],
  [/\(\?<[=!]/, 'lookbehind nelle regex (Safari 16.4)'],
  [/\d_\d/, 'separatore 1_000 (Safari 13, Chrome 75)'],
  [/\b\d+n\b/, 'BigInt (Safari 14)'],
];

// Toglie commenti, stringhe e testo dei template (ma non le ${…}): restano codice e regex.
// Regex o divisione: dopo ) ] identificatore o numero è una divisione, altrimenti una regex.
export function soloCodice(src) {
  let out = '';
  let i = 0;
  const tpl = []; // profondità delle { dentro ogni ${ aperto
  let prev = ''; // ultimo carattere significativo
  let prevWord = '';
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { const e = src.indexOf('*/', i + 2); const pezzo = src.slice(i, e + 2); out += pezzo.replace(/[^\n]/g, ' '); i = e + 2; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c) { if (src[j] === '\\') j++; j++; }
      out += c + ' '.repeat(j - i - 1) + c; i = j + 1; prev = 'a'; continue;
    }
    if (c === '`' || (c === '}' && tpl.length && tpl[tpl.length - 1] === 0)) {
      // testo di un template fino a ` o ${
      if (c === '}') tpl.pop();
      let j = i + 1;
      out += c;
      while (j < n && src[j] !== '`' && !(src[j] === '$' && src[j + 1] === '{')) { out += src[j] === '\n' ? '\n' : ' '; if (src[j] === '\\') { j++; out += ' '; } j++; }
      if (src[j] === '`') { out += '`'; i = j + 1; prev = 'a'; continue; }
      out += '${'; tpl.push(0); i = j + 2; prev = '{'; continue;
    }
    if (c === '{' && tpl.length) tpl[tpl.length - 1]++;
    if (c === '}' && tpl.length) tpl[tpl.length - 1]--;
    if (c === '/') {
      const divisione = /[\w$)\]]/.test(prev) && !/^(return|typeof|case|do|else|in|of|new|delete|void|throw)$/.test(prevWord);
      if (!divisione) {
        let j = i + 1; let classe = false;
        while (j < n && (src[j] !== '/' || classe)) { if (src[j] === '\\') j++; else if (src[j] === '[') classe = true; else if (src[j] === ']') classe = false; j++; }
        j++;
        while (/[a-z]/.test(src[j] || '')) j++;
        // la regex resta, ma ?. ?? e # dentro non contano: si scrivono come «R»
        out += src.slice(i, j).replace(/\?[.?]/g, 'R ').replace(/#/g, 'R');
        i = j; prev = 'a'; continue;
      }
    }
    out += c;
    if (!/\s/.test(c)) {
      if (/[\w$]/.test(c)) prevWord = (/[\w$]/.test(prev) ? prevWord : '') + c; else prevWord = '';
      prev = c;
    }
    i++;
  }
  return out;
}

// «await» fuori da ogni funzione (top-level await: Safari 15, Chrome 89), anche dentro un try { } o un if { }.
// Per ogni graffa aperta si guarda cosa c'è prima: «=>», o «)» di una funzione (non di if, for, while, switch,
// catch), apre il corpo di una funzione. Basta per il codice del sito; una graffa in una regex lo può confondere.
function awaitFuori(codice) {
  const out = [];
  const pila = []; // true = corpo di una funzione
  const re = /[{}]|\bawait\b/g;
  for (let m = re.exec(codice); m; m = re.exec(codice)) {
    if (m[0] === '}') { pila.pop(); continue; }
    if (m[0] === '{') {
      const prima = codice.slice(0, m.index).replace(/\s+$/, '');
      let funz = /=>$/.test(prima);
      if (!funz && prima.endsWith(')')) {
        let d = 0;
        let k = prima.length - 1;
        for (; k >= 0; k--) { if (prima[k] === ')') d++; else if (prima[k] === '(' && --d === 0) break; }
        funz = !/\b(if|for|while|switch|catch|with)\s*$/.test(prima.slice(0, k));
      }
      pila.push(funz);
      continue;
    }
    if (!pila.includes(true)) out.push(`${codice.slice(0, m.index).split('\n').length}: await fuori da una funzione (Safari 15, Chrome 89)`);
  }
  return out;
}

export function trova(src) {
  const codice = soloCodice(src);
  const righe = codice.split('\n');
  const out = [];
  righe.forEach((r, k) => { for (const [re, nome] of NUOVI) if (re.test(r)) out.push(`${k + 1}: ${nome}`); });
  return [...out, ...awaitFuori(codice)];
}

// Le pagine HTML del sito (senza node_modules e cartelle nascoste).
function pagine(dir = SITE, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) pagine(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

test('il JavaScript parte su Safari 12 e Chrome 70 (telefoni vecchi)', () => {
  const problemi = [];
  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.js'))) {
    for (const p of trova(fs.readFileSync(path.join(DIR, f), 'utf8'))) problemi.push(`js/${f}:${p}`);
  }
  assert.deepEqual(problemi, [], `Sintassi o metodi troppo nuovi per i telefoni vecchi:\n${problemi.join('\n')}`);
});

test('gli script scritti nelle pagine partono su Safari 12 e Chrome 70', { skip: !!process.env.JS_DIR }, () => {
  const problemi = [];
  for (const f of pagine()) {
    const html = fs.readFileSync(f, 'utf8');
    for (const m of html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g)) {
      const riga = html.slice(0, m.index).split('\n').length;
      for (const p of trova(m[1])) problemi.push(`${path.relative(SITE, f)} (script dalla riga ${riga}), riga ${p}`);
    }
  }
  assert.deepEqual(problemi, [], `Sintassi o metodi troppo nuovi per i telefoni vecchi:\n${problemi.join('\n')}`);
});

test('il controllo riconosce i casi (prova del lettore)', () => {
  assert.deepEqual(trova('const a = b?.c;'), ['1: ?. (Safari 13.1, Chrome 80)']);
  assert.deepEqual(trova('const a = x ? .5 : 1;'), []);
  assert.deepEqual(trova("const s = 'a ?? b?.c';"), []);
  assert.deepEqual(trova('// a ?? b\n/* x?.y */'), []);
  assert.deepEqual(trova('const t = `a ?? ${b ?? c} d`;'), ['1: ?? (Safari 13.1, Chrome 80)']);
  assert.deepEqual(trova('const t = `a ?? ${f({ x: 1 })} d?.e`;'), []);
  assert.deepEqual(trova('const r = /(?:a)?.b/; const q = /x??/;'), []);
  assert.deepEqual(trova('const r = /(?<=a)b/;'), ['1: lookbehind nelle regex (Safari 16.4)']);
  assert.deepEqual(trova('const h = a / b / c; x = "#y";'), []);
  assert.deepEqual(trova('for (const m of s.matchAll(re)) {}'), ['1: matchAll (Safari 13, Chrome 73)']);
  assert.deepEqual(trova('class A { #p = 1 }'), ['1: campo privato #x (Safari 15, Chrome 74)']);
  assert.deepEqual(trova('const a = await f();'), ['1: await fuori da una funzione (Safari 15, Chrome 89)']);
  assert.deepEqual(trova('(async function () {\n  const a = await f();\n})();'), []);
  assert.deepEqual(trova('try {\n  await f();\n} catch {}'), ['2: await fuori da una funzione (Safari 15, Chrome 89)']);
  assert.deepEqual(trova('if (a) { for (const x of y) { await g(x); } }'), ['1: await fuori da una funzione (Safari 15, Chrome 89)']);
  assert.deepEqual(trova('const f = async (x) => {\n  if (x) { await g(); }\n};\nasync function h(a = {}) { await a; }'), []);
  assert.deepEqual(trova('class A { async m() { await 1; } }'), []);
});
