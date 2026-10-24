// Un giro di tools/copie.mjs su dati finti e su un piccolo server locale (niente rete verso i siti veri).
// Controlla le regole di docs/regioni.md, sezione 8:
//   - email nascoste (Cloudflare, Joomla) in chiaro nella copia;
//   - PDF copiati come testo con pdftotext («pdf»: true), solo fino a 5 MB; senza pdftotext con pdf.js
//     (tools/pdf-testo.mjs); senza tutti e due, segnati e basta;
//   - sedi INPS: anche le fonti (sources) e le pagine (pagine) di inps.json;
//   - regole_fonti in cima ad asl.json, scelta_medico.url, phones[].url;
//   - fonti.json letto anche per una regione attiva, senza riscaricare gli url già copiati;
//   - fonti delle regole nazionali (data/rules*.json) e pagine dei temi da scrivere (data/fonti-nazionali.json);
//   - le cartelle delle aziende che non sono più nei dati si tolgono, quelle delle aziende che ci sono restano.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const COPIE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'tools', 'copie.mjs');
const conPdftotext = !process.env.COPIE_SENZA_PDFTOTEXT && (() => { try { execFileSync('pdftotext', ['-v'], { stdio: 'ignore' }); return true; } catch { return false; } })();
const conCurl = (() => { try { execFileSync('curl', ['--version'], { stdio: 'ignore' }); return true; } catch { return false; } })();

// Un PDF piccolo e valido, con una riga di testo.
function pdf(riga) {
  const stream = `BT /F1 12 Tf 72 720 Td (${riga}) Tj ET`;
  const obj = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>',
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',
    `<</Length ${stream.length}>>\nstream\n${stream}\nendstream`,
  ];
  let out = '%PDF-1.4\n';
  const pos = [];
  obj.forEach((o, i) => { pos.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${obj.length + 1}\n0000000000 65535 f \n${pos.map((p) => `${String(p).padStart(10, '0')} 00000 n \n`).join('')}`;
  out += `trailer\n<</Size ${obj.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}

const lungo = ' Testo della pagina ufficiale, abbastanza lungo da non sembrare una pagina fatta con JavaScript.'.repeat(8);
const cf = (e, k = 0x37) => k.toString(16).padStart(2, '0') + [...Buffer.from(e)].map((b) => (b ^ k).toString(16).padStart(2, '0')).join('');
const PAGINE = {
  '/asl': `<html><head><title>ASL di prova</title></head><body><p>URP: <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="${cf('urp@asl.prova.it')}">[email&#160;protected]</a></p><p>${lungo}</p></body></html>`,
  '/urp': `<html><head><title>URP</title></head><body><p>PEC: <span id="cloak1">Questo indirizzo email è protetto dagli spambots. È necessario abilitare JavaScript per vederlo.</span><script type='text/javascript'>
    document.getElementById('cloak1').innerHTML = '';
    var addy1 = 'protocollo' + '&#64;';
    addy1 = addy1 + 'pec' + '&#46;' + 'asl' + '&#46;' + 'prova' + '&#46;' + 'it';
    document.getElementById('cloak1').innerHTML += addy1;
  </script></p><p>${lungo}</p></body></html>`,
  '/telefono': `<html><head><title>Telefoni</title></head><body><p>Centralino 0577 535111</p><p>${lungo}</p></body></html>`,
  '/medico': `<html><head><title>Scelta del medico</title></head><body><p>${lungo}</p></body></html>`,
  '/regola': `<html><head><title>Tempi di attesa</title></head><body><p>${lungo}</p></body></html>`,
  '/inps-sede': `<html><head><title>Sede INPS</title></head><body><p>${lungo}</p></body></html>`,
  '/inps-fonte': `<html><head><title>Riforma della disabilità</title></head><body><p>${lungo}</p></body></html>`,
  '/inps-pagina': `<html><head><title>Province della riforma</title></head><body><p>${lungo}</p></body></html>`,
  '/vecchia-fonte': `<html><head><title>Pagina di fonti.json</title></head><body><p>${lungo}</p></body></html>`,
  '/tutela': `<html><head><title>Percorso di tutela</title></head><body><p><a href="/modulo-tutela.pdf">Scarica il modulo</a> · <a href="/delibera-12.pdf">Delibera n. 12</a> · <a href="https://altro-sito.example/modulo.pdf">Modulo di un altro sito</a></p><p>${lungo}</p></body></html>`,
  '/nazionale': `<html><head><title>Numero nazionale</title></head><body><p>${lungo}</p></body></html>`,
  '/legge': `<html><head><title>Legge</title></head><body><p>${lungo}</p></body></html>`,
  '/decreto': `<html><head><title>Decreto</title></head><body><p>${lungo}</p></body></html>`,
  '/ministero': `<html><head><title>Ministero</title></head><body><p>${lungo}</p></body></html>`,
};
const FILE = {
  '/modulo.pdf': pdf('Modulo di reclamo URP tel. 0577 535222'),
  '/modulo-tutela.pdf': pdf('Istanza di attivazione del percorso di tutela'),
  '/delibera-12.pdf': pdf('Delibera numero 12'),
  '/allegato': pdf('Allegato alla delibera'), // un PDF dietro un indirizzo senza «.pdf»
  '/grande.pdf': Buffer.concat([pdf('Troppo grande'), Buffer.alloc(5 * 1024 * 1024 + 10, 32)]),
};
const richieste = [];
let server; let base; let tmp;

before(async () => {
  server = http.createServer((req, res) => {
    richieste.push(req.url);
    if (PAGINE[req.url]) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(PAGINE[req.url]); return; }
    if (FILE[req.url]) { res.writeHead(200, { 'content-type': req.url === '/allegato' ? 'application/octet-stream' : 'application/pdf', 'content-length': FILE[req.url].length }); res.end(FILE[req.url]); return; }
    res.writeHead(404, { 'content-type': 'text/html' }); res.end('<h1>Non trovata</h1>');
  });
  // Porta scelta dal sistema: due giri di npm test insieme non si pestano i piedi.
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'copie-giro-'));
});
after(() => { server.close(); fs.rmSync(tmp, { recursive: true, force: true }); });

function sito() {
  const s = path.join(tmp, 'sito');
  const w = (f, j) => { fs.mkdirSync(path.dirname(path.join(s, f)), { recursive: true }); fs.writeFileSync(path.join(s, f), JSON.stringify(j)); };
  w('data/regioni/index.json', { default: 'prova', regioni: [{ id: 'prova', name: 'Prova', attiva: true }, { id: 'nuova', name: 'Nuova', attiva: false }] });
  w('data/regioni/prova/asl.json', {
    regole_fonti: { local_name: { url: `${base}/regola`, proof: 'pagina' } },
    asl: [{
      id: 'centro', site_url: `${base}/asl`,
      phones: [{ number: '0577 535111', url: `${base}/telefono` }],
      contacts: [{ title: 'URP', url: `${base}/urp` }, { title: 'Tutela', url: `${base}/tutela` }],
      scelta_medico: { how: '…', url: `${base}/medico` },
      pagine: [{ tipo: 'tutela', url: `${base}/modulo.pdf` }, { tipo: 'tutela', url: `${base}/allegato` }, { tipo: 'cartelle', url: `${base}/grande.pdf` }, { tipo: 'cartelle', url: `${base}/sparita` }],
    }],
  });
  w('data/regioni/prova/inps.json', {
    sources: [{ label: 'INPS', url: `${base}/inps-fonte` }], pagine: [{ url: `${base}/inps-pagina` }],
    provinces: [{ id: 'centro', url: `${base}/inps-sede` }],
  });
  // fonti.json della regione attiva: una pagina già nei dati (non si riscarica) e una che c'è solo qui.
  w('data/regioni/prova/fonti.json', { asl: [{ id: 'asl-centro', site_url: `${base}/asl`, pagine: [{ url: `${base}/vecchia-fonte` }] }] });
  w('data/regioni/nuova/fonti.json', { asl: [{ id: 'asl-nuova', site_url: `${base}/vecchia-fonte` }] });
  w('data/numeri.json', { groups: [{ id: 'emergenze', items: [{ number: '112', url: `${base}/nazionale` }] }] });
  // Regole nazionali (fonti e provenienza) e pagine dei temi da scrivere.
  w('data/rules-prova.json', { sources: [{ label: 'Legge', url: `${base}/legge` }], provenienza: { soglia: { url: `${base}/decreto`, proof: 'testo' }, altra: { url: `${base}/legge` } } });
  w('data/fonti-nazionali.json', { temi: [{ id: 'pronto-soccorso', pagine: [{ tipo: 'ministero', url: `${base}/ministero` }] }] });
  return s;
}

function giro(out, env = {}) {
  return new Promise((resolve, reject) => {
    execFile(process.execPath, [COPIE, out], {
      env: { ...process.env, COPIE_SITO: sito(), COPIE_PAUSA_MS: '0', COPIE_SENZA_BROWSER: '1', NO_PROXY: '127.0.0.1,localhost', no_proxy: '127.0.0.1,localhost', ...env },
      encoding: 'utf8', timeout: 120000,
    }, (err, stdout, stderr) => (err ? reject(new Error(`${err.message}\n${stdout}\n${stderr}`)) : resolve(stdout)));
  });
}
const indice = (out, reg) => JSON.parse(fs.readFileSync(path.join(out, reg, 'indice.json'), 'utf8')).pagine;
const copia = (out, reg, url) => {
  const p = indice(out, reg).find((x) => x.url === url);
  return p && p.file ? fs.readFileSync(path.join(out, reg, p.file), 'utf8') : null;
};

test('un giro di copie.mjs su pagine finte', { skip: !conCurl && 'manca curl' }, async () => {
  const out = path.join(tmp, 'copie');
  // Cartelle di un giro vecchio: un'azienda che non c'è più (via) e una che c'è ancora (resta).
  for (const d of ['prova/asl-vecchia', 'prova/centro', 'nuova/asl-sparita']) fs.mkdirSync(path.join(out, d), { recursive: true });
  fs.writeFileSync(path.join(out, 'prova/asl-vecchia/123.txt'), 'vecchia');
  fs.writeFileSync(path.join(out, 'nuova/asl-sparita/123.txt'), 'vecchia');
  const log = await giro(out);

  // Email nascoste in chiaro.
  assert.match(copia(out, 'prova', `${base}/asl`), /URP: urp@asl\.prova\.it/);
  assert.doesNotMatch(copia(out, 'prova', `${base}/asl`), /protected/);
  assert.match(copia(out, 'prova', `${base}/urp`), /protocollo@pec\.asl\.prova\.it/);
  assert.equal(indice(out, 'prova').find((p) => p.url === `${base}/urp`).email_nascoste, 1);

  // Le altre fonti dei dati.
  for (const u of ['/telefono', '/medico']) assert.ok(copia(out, 'prova', `${base}${u}`), `manca la copia di ${u}`);
  assert.equal(indice(out, 'prova').find((p) => p.url === `${base}/regola`).asl, 'regole');
  for (const u of ['/inps-sede', '/inps-fonte', '/inps-pagina']) {
    const p = indice(out, 'prova').find((x) => x.url === `${base}${u}`);
    assert.ok(p && p.file && p.asl === 'inps-prova', `manca la copia INPS di ${u}`);
  }

  // Regole nazionali: le fonti e la provenienza di data/rules-prova.json, una volta sola; i temi da scrivere.
  const naz = indice(out, 'nazionali');
  assert.deepEqual(naz.filter((p) => p.asl === 'regole-prova').map((p) => p.url).sort(), [`${base}/decreto`, `${base}/legge`]);
  assert.ok(copia(out, 'nazionali', `${base}/ministero`) && naz.find((p) => p.url === `${base}/ministero`).asl === 'tema-pronto-soccorso');

  // fonti.json di una regione attiva: la pagina nuova si copia, quella già copiata non si riscarica.
  assert.equal(indice(out, 'prova').find((p) => p.url === `${base}/vecchia-fonte`).asl, 'asl-centro');
  assert.equal(indice(out, 'prova').filter((p) => p.url === `${base}/asl`).length, 1);

  // PDF.
  const pdfPiccolo = indice(out, 'prova').find((p) => p.url === `${base}/modulo.pdf`);
  const grande = indice(out, 'prova').find((p) => p.url === `${base}/grande.pdf`);
  // Senza pdftotext il testo lo fa pdf.js, se si è potuto scaricare (nella CI sì): stesse regole.
  if (conPdftotext || /l'ha fatto pdf\.js/.test(log)) {
    assert.equal(pdfPiccolo.pdf, true);
    assert.match(copia(out, 'prova', `${base}/modulo.pdf`), /0577 535222/);
    assert.equal(indice(out, 'prova').find((p) => p.url === `${base}/allegato`).pdf, true);
    assert.match(grande.errore, /più grande di 5 MB/);
    assert.ok(!grande.file);
  } else {
    assert.ok(!process.env.CI, `nella CI pdf.js deve funzionare:\n${log}`);
    assert.equal(pdfPiccolo.nota, 'file, non controllato');
    assert.match(log, /pdftotext non installato/);
  }
  assert.equal(indice(out, 'prova').find((p) => p.url === `${base}/sparita`).http, 404);

  // I PDF linkati da una pagina: tutti nell'indice (stesso dominio); il modulo si copia subito, la delibera no.
  const tutela = indice(out, 'prova').find((p) => p.url === `${base}/tutela`);
  assert.deepEqual(tutela.link_pdf.map((l) => l.url), [`${base}/modulo-tutela.pdf`, `${base}/delibera-12.pdf`]);
  assert.equal(tutela.link_pdf[0].testo, 'Scarica il modulo');
  assert.ok(!richieste.includes('/delibera-12.pdf'), 'una delibera linkata non si scarica');
  if (conPdftotext || /l'ha fatto pdf\.js/.test(log)) {
    const modulo = indice(out, 'prova').find((p) => p.url === `${base}/modulo-tutela.pdf`);
    assert.equal(modulo.da_pagina, `${base}/tutela`);
    assert.match(copia(out, 'prova', `${base}/modulo-tutela.pdf`), /percorso di tutela/);
  }

  // Cartelle: via quelle delle aziende che non ci sono più, restano le altre.
  assert.ok(!fs.existsSync(path.join(out, 'prova/asl-vecchia')));
  assert.ok(!fs.existsSync(path.join(out, 'nuova/asl-sparita')));
  for (const d of ['prova/centro', 'prova/asl-centro', 'prova/inps-prova', 'prova/regole', 'nuova/asl-nuova']) assert.ok(fs.existsSync(path.join(out, d)), `tolta per sbaglio: ${d}`);
  assert.match(log, /tolte: prova\/asl-vecchia, nuova\/asl-sparita/);

  // Un giro senza pdftotext: i PDF si segnano e basta, come prima.
  const prima = richieste.length;
  await giro(out, { COPIE_SENZA_PDF: '1' });
  assert.equal(indice(out, 'prova').find((p) => p.url === `${base}/modulo.pdf`).nota, 'file, non controllato');
  assert.ok(!richieste.slice(prima).includes('/modulo.pdf'), 'senza pdftotext un .pdf non si scarica');
  assert.ok(!richieste.slice(prima).includes('/modulo-tutela.pdf'), 'senza chi fa il testo, i PDF linkati non si seguono');
  assert.ok(!indice(out, 'prova').some((p) => p.url === `${base}/modulo-tutela.pdf`));
  assert.equal(indice(out, 'prova').find((p) => p.url === `${base}/allegato`).nota, 'file, non controllato');

  // Un giro senza pdftotext ma con pdf.js (tools/pdf-testo.mjs): i PDF si copiano lo stesso.
  // pdf.js si scarica da npm la prima volta; nella CI deve riuscire, altrove senza rete si salta.
  const pdfjs = await giro(out, { COPIE_SENZA_PDFTOTEXT: '1' });
  if (/l'ha fatto pdf\.js/.test(pdfjs)) {
    const p = indice(out, 'prova').find((x) => x.url === `${base}/modulo.pdf`);
    assert.equal(p.pdf, true, JSON.stringify(p));
    assert.ok(p.file, JSON.stringify(p));
    assert.match(copia(out, 'prova', `${base}/modulo.pdf`), /0577 535222/);
    assert.equal(indice(out, 'prova').find((x) => x.url === `${base}/allegato`).pdf, true);
    assert.match(indice(out, 'prova').find((x) => x.url === `${base}/grande.pdf`).errore, /più grande di 5 MB/);
  } else {
    assert.ok(!process.env.CI, `nella CI pdf.js deve funzionare:\n${pdfjs}`);
    assert.match(pdfjs, /pdf\.js non pronto/);
  }
});
