// Testo di un PDF senza pdftotext: lo usa tools/copie.mjs quando sul server non c'è poppler-utils.
// Legge il PDF con pdf.js (la libreria di Firefox), versione fissa scaricata da npm la prima volta.
// Prima di usarla si controlla l'impronta (sha512) del pacchetto: se non è quella scritta qui, non si usa.
// Gira in un processo a parte: copie.mjs lo ferma dopo 60 secondi, come pdftotext.
//
// Uso: node tools/pdf-testo.mjs --prepara      scarica e controlla pdf.js (esce con 1 se non ci riesce)
//      node tools/pdf-testo.mjs <file.pdf>     scrive {"testo","titolo"} in JSON
// COPIE_PDFJS_DIR cambia la cartella di pdf.js (default: node_modules/pdfjs-dist accanto al sito, fuori da git).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const VERSIONE = '4.10.38'; // dalla 4.2.67 è chiuso il buco dei font (CVE-2024-4367)
const PACCHETTO = `https://registry.npmjs.org/pdfjs-dist/-/pdfjs-dist-${VERSIONE}.tgz`;
const IMPRONTA = 'sha512-/Y3fcFrXEAsMjJXeL9J8+ZG9U01LbuWaYypvDW2ycW1jL269L3js3DVBjDJ0Up9Np1uqDXsDrRihHANhZOlwdQ==';
const RADICE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.resolve(process.env.COPIE_PDFJS_DIR || path.join(RADICE, 'node_modules', 'pdfjs-dist'));
const LIBRERIA = path.join(DIR, 'legacy', 'build', 'pdf.mjs');

const pronta = () => {
  try { return JSON.parse(fs.readFileSync(path.join(DIR, 'package.json'), 'utf8')).version === VERSIONE && fs.existsSync(LIBRERIA); } catch { return false; }
};

function prepara() {
  if (pronta()) return;
  if (+process.versions.node.split('.')[0] < 20) throw new Error(`pdf.js ${VERSIONE} vuole Node 20 o più nuovo (qui ${process.version})`);
  const tgz = execFileSync('curl', ['-sS', '-L', '--fail', '--max-time', '120', PACCHETTO], { maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'] });
  const impronta = `sha512-${crypto.createHash('sha512').update(tgz).digest('base64')}`;
  if (impronta !== IMPRONTA) throw new Error(`impronta di pdf.js sbagliata (${impronta}): non lo uso`);
  fs.rmSync(DIR, { recursive: true, force: true });
  fs.mkdirSync(DIR, { recursive: true });
  execFileSync('tar', ['xzf', '-', '-C', DIR, '--strip-components=1'], { input: tgz, stdio: ['pipe', 'ignore', 'pipe'] });
  if (!pronta()) throw new Error('pdf.js scaricato ma incompleto');
}

// Le righe come le scrive pdftotext -layout: i pezzi alla stessa altezza vanno sulla stessa riga, da sinistra a destra.
function righe(items) {
  const perRiga = new Map();
  for (const it of items) {
    if (!it.str || !it.transform) continue;
    const y = Math.round(it.transform[5]);
    const chiave = [...perRiga.keys()].find((k) => Math.abs(k - y) <= 2) ?? y;
    if (!perRiga.has(chiave)) perRiga.set(chiave, []);
    perRiga.get(chiave).push(it);
  }
  return [...perRiga.entries()].sort((a, b) => b[0] - a[0]).map(([, pezzi]) => {
    pezzi.sort((a, b) => a.transform[4] - b.transform[4]);
    let riga = '';
    let fine = null;
    for (const p of pezzi) {
      const alto = Math.abs(p.transform[3]) || 10;
      if (fine != null && p.transform[4] - fine > alto * 0.2 && !/\s$/.test(riga) && !/^\s/.test(p.str)) riga += ' ';
      riga += p.str;
      fine = p.transform[4] + (p.width || 0);
    }
    return riga;
  });
}

async function testo(file) {
  // pdf.js scrive i suoi avvisi con console.log: vanno su stderr, su stdout c'è solo il JSON.
  console.log = console.info = console.warn = (...a) => process.stderr.write(`${a.join(' ')}\n`);
  const pdfjs = await import(pathToFileURL(LIBRERIA).href);
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(fs.readFileSync(file)),
    isEvalSupported: false, // mai codice creato dal PDF
    disableFontFace: true, useSystemFonts: false, verbosity: 0,
  }).promise;
  const pagine = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const pagina = await doc.getPage(n);
    pagine.push(righe((await pagina.getTextContent()).items).join('\n'));
    pagina.cleanup();
  }
  let titolo = '';
  try { titolo = String(((await doc.getMetadata()).info || {}).Title || '').trim(); } catch { /* senza titolo: la prima riga */ }
  await doc.destroy();
  return { testo: pagine.join('\n\n'), titolo };
}

const arg = process.argv[2];
try {
  if (arg === '--prepara') prepara();
  else if (arg) { if (!pronta()) throw new Error('pdf.js non pronto: prima --prepara'); process.stdout.write(JSON.stringify(await testo(arg))); }
  else throw new Error('uso: node tools/pdf-testo.mjs --prepara | <file.pdf>');
} catch (e) {
  process.stderr.write(`${String(e.message || e).split('\n')[0]}\n`);
  process.exit(1);
}
