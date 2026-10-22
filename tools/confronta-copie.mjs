// Confronta i dati con le copie testuali delle pagine ufficiali (branch «copie-siti», fatte ogni notte dal
// server in Italia con tools/copie.mjs). Per ogni regione attiva, o per quelle indicate, legge
// data/regioni/<regione>/(asp|asl).json e inps.json e <cartella-copie>/<regione>/indice.json; per i numeri
// nazionali (data/numeri.json) legge <cartella-copie>/nazionali/indice.json. Segnala:
//   1. contatti e numeri con proof «pagina» le cui cifre non compaiono nella copia del loro url;
//   2. orari (HH:MM, per esempio 8:30 o 14.30) dei contatti con proof «pagina» che non sono nella copia del loro url;
//   3. pec e send_to di ogni azienda che non compaiono in nessuna copia di quell'azienda;
//   4. sedi INPS: pec, indirizzo e orari che non compaiono nella copia della pagina della sede;
//   5. url dei dati senza copia (pagina non copiata, errore, o non presente nell'indice).
// I file (PDF, DOC…) non si copiano: si elencano a parte e non contano come problemi.
// Regole in docs/regola-numeri.md e docs/protocollo-test.md.
//
// Ogni problema ha una chiave fissa (una riga, per esempio «sicilia/palermo numero 0917031111 https://…»)
// che dipende solo dal dato, non dalla copia. Così si può tenere l'elenco dei problemi già noti.
//
// Uso: node tools/confronta-copie.mjs <cartella-copie> [regione… | nazionali] [opzioni]
//   --noti <file>         problemi già noti (una chiave per riga, # per i commenti): non bloccano.
//   --base <ref git>      con --noti: un problema nuovo su un dato uguale in <ref> (per esempio origin/main)
//                         è «non di questa PR» (è cambiata la pagina ufficiale, non i dati): non blocca.
//   --scrivi-noti <file>  scrive in <file> le chiavi di tutti i problemi di adesso (per rifare l'elenco dei noti).
// Codici di uscita: 0 nessun problema (con --noti: nessun problema che blocca), 3 problemi (con --noti: almeno
// un problema nuovo su un dato cambiato), 2 mancano le copie o gli argomenti sono sbagliati, 1 il programma si rompe.
// Con --noti un url nuovo senza copia non blocca: la copia si fa dopo l'unione (tools/copie-se-serve.sh).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const USO = 'Uso: node tools/confronta-copie.mjs <cartella-copie> [regione… | nazionali] [--noti <file>] [--base <ref>] [--scrivi-noti <file>]';
const opz = {};
const posizionali = [];
{
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (['--noti', '--base', '--scrivi-noti'].includes(a)) {
      if (!argv[i + 1]) { console.error(`${a}: manca il valore\n${USO}`); process.exit(2); }
      opz[a.slice(2)] = argv[++i];
    } else if (a.startsWith('--')) { console.error(`Opzione sconosciuta: ${a}\n${USO}`); process.exit(2); } else posizionali.push(a);
  }
}
const [copieArg, ...scelte] = posizionali;
if (!copieArg) { console.error(USO); process.exit(2); }
if (opz.base && !opz.noti) { console.error(`--base serve solo con --noti\n${USO}`); process.exit(2); }
const COPIE = path.resolve(copieArg);
if (!fs.existsSync(COPIE)) { console.error(`Manca la cartella delle copie: ${COPIE}`); process.exit(2); }
const FILE = /\.(pdf|docx?|xlsx?|odt|zip)(\?|$)/i;
const URL_KEYS = ['site_url', 'info_url', 'form_url', 'portal_url', 'guardia_medica_url', 'pua_url'];

const leggi = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const indice = leggi(path.join(SITE, 'data/regioni/index.json'));
const tutte = indice.regioni.filter((r) => r.attiva);
const ignote = scelte.filter((id) => id !== 'nazionali' && !indice.regioni.some((r) => r.id === id));
if (ignote.length) { console.error(`Regioni sconosciute: ${ignote.join(', ')}`); process.exit(2); }
const regioni = scelte.length ? indice.regioni.filter((r) => scelte.includes(r.id)) : tutte;
const conNazionali = !scelte.length || scelte.includes('nazionali');

// Cifre del numero, con separatori qualsiasi tra l'una e l'altra (spazi, punti, trattini, barre…).
const cifre = (numero) => String(numero).replace(/\D/g, '');
const regexNumero = (numero) => {
  const c = cifre(numero);
  return c ? new RegExp(`(?<!\\d)${c.split('').join('[^\\d\\n]{0,3}')}(?!\\d)`) : null;
};
// Orari HH:MM (anche 8.30 o 8,30) di un testo, scritti come «8:30».
const orari = (s) => [...new Set([...String(s || '').matchAll(/(?<!\d[:.,]?)(\d{1,2})[:.,](\d{2})(?![\d:.,]?\d)/g)]
  .filter(([, h, m]) => +h < 24 && +m < 60).map(([, h, m]) => `${+h}:${m}`))];
const cacheOrari = new Map();
const orariDelTesto = (t) => { if (!cacheOrari.has(t)) cacheOrari.set(t, new Set(orari(t))); return cacheOrari.get(t); };
// Per cercare le email si tolgono gli spazi strani e si confronta in minuscolo.
const normEmail = (s) => s.toLowerCase().replace(/\s+/g, '');
// Indirizzi: minuscole, senza accenti, solo lettere e cifre separate da uno spazio.
const normTesto = (s) => String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
// La via di un indirizzo («Via Picone 20/30, Agrigento» → «via picone 20 30»): tutto tranne la città dopo l'ultima virgola.
const viaDi = (indirizzo) => normTesto(String(indirizzo).includes(',') ? String(indirizzo).replace(/,[^,]*$/, '') : indirizzo);
// La via nella copia: le parole del nome di seguito, poi al massimo due parole (un nome in tedesco, «n.»), poi i numeri.
const regexVia = (via) => {
  const parole = via.split(' ');
  const i = parole.findIndex((p) => /^\d/.test(p));
  const esc = (p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const nome = (i < 0 ? parole : parole.slice(0, i)).map(esc).join(' ');
  const numeri = i < 0 ? '' : `(?: [a-z0-9]+){0,2} ${parole.slice(i).map(esc).join(' ')}`;
  return new RegExp(`(?:^| )${nome}${numeri}(?: |$)`);
};
// Lo stesso indirizzo scritto con o senza la barra finale è la stessa pagina.
const normUrl = (u) => String(u).trim().replace(/#.*$/, '').replace(/\/+$/, '');
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase(); } catch { return null; } };

// I dati di una regione: dal disco, o da un commit git (--base) per sapere se un dato è cambiato.
const fileRegione = (reg, tipo) => `data/regioni/${reg.id}/${(reg.files && reg.files[tipo]) || tipo}.json`;
function daGit(ref, rel) {
  try { return JSON.parse(execFileSync('git', ['show', `${ref}:${rel}`], { cwd: SITE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 })); } catch { return null; }
}
const daDisco = (rel) => (fs.existsSync(path.join(SITE, rel)) ? leggi(path.join(SITE, rel)) : null);

// I fatti da controllare: ognuno con la sua chiave fissa. Le stesse funzioni servono per i dati di --base.
function fattiRegione(reg, dati, inps) {
  const fatti = [];
  for (const a of (dati && dati.asl) || []) {
    const dove = `${reg.id}/${a.id}`;
    const urls = new Set();
    for (const k of URL_KEYS) if (a[k]) urls.add(a[k]);
    for (const c of [...(a.phones || []), ...(a.contacts || [])]) if (c.url) urls.add(c.url);
    for (const url of urls) fatti.push({ tipo: 'url', dove, url, chiave: `${dove} url ${normUrl(url)}` });
    for (const c of [...(a.phones || []), ...(a.contacts || [])]) {
      if (c.proof !== 'pagina' || !c.url) continue;
      const etichetta = c.label || c.title || c.topic;
      if (c.number && cifre(c.number)) fatti.push({ tipo: 'numero', dove, url: c.url, number: c.number, etichetta, chiave: `${dove} numero ${cifre(c.number)} ${normUrl(c.url)}` });
      for (const ora of orari(c.hours)) fatti.push({ tipo: 'orario', dove, url: c.url, ora, etichetta, chiave: `${dove} orario ${ora} ${cifre(c.number) || normTesto(etichetta).replace(/ /g, '-')} ${normUrl(c.url)}` });
    }
    // Le copie di un'azienda sono quelle con il suo id nell'indice, oppure su uno dei suoi domini (site_url,
    // official_domains, url dei dati): le regioni copiate da fonti.json hanno nell'indice id diversi da quelli
    // dei dati (es. «asl-roma1» invece di «roma»).
    const domini = new Set([...urls].map(host).filter(Boolean));
    for (const d of a.official_domains || []) domini.add(String(d).replace(/^www\./, '').toLowerCase());
    for (const k of ['pec', 'send_to']) {
      const v = a[k];
      if (!v || typeof v !== 'string' || !v.includes('@')) continue;
      if (k === 'send_to' && v === a.pec) continue;
      fatti.push({ tipo: 'email', dove, campo: k, valore: v, azienda: a.id, domini, chiave: `${dove} ${k} ${normEmail(v)}` });
    }
  }
  // Sedi INPS (data/regioni/<regione>/inps.json): pec, indirizzo e orari nella pagina della sede su inps.it.
  for (const p of (inps && inps.provinces) || []) {
    if (!p.url) continue;
    const dove = `${reg.id}/inps-${p.id}`;
    fatti.push({ tipo: 'url', dove, url: p.url, chiave: `${dove} url ${normUrl(p.url)}` });
    if (p.pec && String(p.pec).includes('@')) fatti.push({ tipo: 'inps-pec', dove, url: p.url, valore: p.pec, chiave: `${dove} pec ${normEmail(p.pec)}` });
    if (p.address) fatti.push({ tipo: 'inps-indirizzo', dove, url: p.url, valore: p.address, chiave: `${dove} indirizzo ${viaDi(p.address)}` });
    for (const ora of orari(p.hours)) fatti.push({ tipo: 'orario', dove, url: p.url, ora, etichetta: 'sede INPS', chiave: `${dove} orario ${ora} sede ${normUrl(p.url)}` });
  }
  return fatti;
}
// Numeri nazionali (data/numeri.json): stesso controllo dei numeri regionali, copie nella cartella «nazionali».
function fattiNazionali(nums) {
  const fatti = [];
  for (const g of (nums && nums.groups) || []) {
    for (const n of g.items || []) {
      if (!n.url) continue;
      const dove = `nazionali/${g.id}`;
      fatti.push({ tipo: 'url', dove, url: n.url, chiave: `${dove} url ${normUrl(n.url)}` });
      if (n.proof !== 'pagina') continue;
      if (n.number && cifre(n.number)) fatti.push({ tipo: 'numero', dove, url: n.url, number: n.number, etichetta: n.title, chiave: `${dove} numero ${cifre(n.number)} ${normUrl(n.url)}` });
      for (const ora of orari(n.hours)) fatti.push({ tipo: 'orario', dove, url: n.url, ora, etichetta: n.title, chiave: `${dove} orario ${ora} ${cifre(n.number)} ${normUrl(n.url)}` });
    }
  }
  return fatti;
}

// Le copie di una cartella (una regione, o «nazionali»).
function apriCopie(cartella) {
  const fileIndice = path.join(COPIE, cartella, 'indice.json');
  if (!fs.existsSync(fileIndice)) return null;
  const pagine = leggi(fileIndice).pagine || [];
  // Una pagina si trova col suo indirizzo o con quello finale dopo i redirect, con o senza la barra finale.
  const perUrl = new Map();
  for (const p of pagine) {
    for (const u of [p.url, p.finale].filter(Boolean)) {
      const k = normUrl(u);
      if (!perUrl.has(k) || (!perUrl.get(k).file && p.file)) perUrl.set(k, p);
    }
  }
  const cache = new Map();
  const testo = (p) => {
    if (!p || !p.file) return null;
    if (!cache.has(p.file)) {
      const f = path.join(COPIE, cartella, p.file);
      cache.set(p.file, fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null);
    }
    return cache.get(p.file);
  };
  const copia = (url) => perUrl.get(normUrl(url));
  return { pagine, copia, testo, testoDi: (url) => testo(copia(url)) };
}

// Un fatto contro le copie: il messaggio del problema, «file» per un file non copiato, oppure null.
function controlla(f, c) {
  if (f.tipo === 'url') {
    const p = c.copia(f.url);
    if (FILE.test(f.url)) return c.testo(p) ? null : 'file';
    if (!p) return `url senza copia (non è nell'indice): ${f.url}`;
    if (!c.testo(p)) return `url senza copia (${p.http || p.errore || p.nota || 'nessun file'}): ${f.url}`;
    return null;
  }
  if (f.tipo === 'email') {
    const suoDominio = (u) => { const h = host(u); return h && [...f.domini].some((d) => h === d || h.endsWith(`.${d}`)); };
    const testi = c.pagine.filter((p) => p.asl === f.azienda || suoDominio(p.url) || suoDominio(p.finale || '')).map(c.testo).filter(Boolean);
    return testi.some((t) => normEmail(t).includes(normEmail(f.valore))) ? null : `${f.campo} ${f.valore} non compare in nessuna copia di questa azienda`;
  }
  const t = c.testoDi(f.url);
  if (t == null) return null; // url senza copia: già segnalato (o file non copiato)
  if (f.tipo === 'numero') return regexNumero(f.number).test(t) ? null : `${f.number} («${f.etichetta}») non compare nella copia di ${f.url}`;
  if (f.tipo === 'orario') return orariDelTesto(t).has(f.ora) ? null : `orario ${f.ora} («${f.etichetta}») non compare nella copia di ${f.url}`;
  if (f.tipo === 'inps-pec') return normEmail(t).includes(normEmail(f.valore)) ? null : `pec della sede INPS ${f.valore} non compare nella copia di ${f.url}`;
  if (f.tipo === 'inps-indirizzo') return regexVia(viaDi(f.valore)).test(normTesto(t)) ? null : `indirizzo della sede INPS «${f.valore}» non compare nella copia di ${f.url}`;
  throw new Error(`tipo di fatto sconosciuto: ${f.tipo}`);
}

// I gruppi da controllare: le regioni scelte, poi i numeri nazionali.
const gruppi = regioni.map((reg) => ({
  id: reg.id, nome: reg.name,
  fatti: (leggiDa) => fattiRegione(reg, leggiDa(fileRegione(reg, 'asl')), leggiDa(fileRegione(reg, 'inps'))),
  manca: () => (!fs.existsSync(path.join(SITE, fileRegione(reg, 'asl'))) ? `manca il file dei dati ${fileRegione(reg, 'asl')}` : null),
  obbligatorie: true,
}));
if (conNazionali) gruppi.push({ id: 'nazionali', nome: 'Numeri nazionali', fatti: (leggiDa) => fattiNazionali(leggiDa('data/numeri.json')), manca: () => null, obbligatorie: false });

const problemi = []; // { chiave, gruppo, testo }
const riepilogo = [];
const avvisi = [];
for (const g of gruppi) {
  const lista = [];
  const fileNonCopiati = [];
  const manca = g.manca();
  const c = manca ? null : apriCopie(g.id);
  if (manca) lista.push({ chiave: `${g.id} dati mancanti`, testo: manca });
  else if (!c && g.obbligatorie) lista.push({ chiave: `${g.id} copie mancanti`, testo: `manca l'indice delle copie ${path.join(COPIE, g.id, 'indice.json')}` });
  else if (!c) avvisi.push(`${g.nome}: nessuna copia (${path.join(COPIE, g.id, 'indice.json')}): le pagine sono nell'elenco di tools/copie.mjs e arrivano con la prossima copia notturna.`);
  else {
    const visti = new Set();
    for (const f of g.fatti(daDisco)) {
      if (visti.has(f.chiave)) continue;
      visti.add(f.chiave);
      const m = controlla(f, c);
      if (m === 'file') fileNonCopiati.push(`${f.dove}: ${f.url}`);
      else if (m) lista.push({ chiave: f.chiave, tipo: f.tipo, testo: `${f.dove.replace(/^[^/]+\//, '')}: ${m}` });
    }
  }
  for (const p of lista) problemi.push({ ...p, gruppo: g });
  riepilogo.push(`${g.id}: ${lista.length}`);
  if (lista.length || fileNonCopiati.length) {
    console.log(`\n== ${g.nome} (${g.id}): ${lista.length} ${lista.length === 1 ? 'problema' : 'problemi'}`);
    for (const p of lista) console.log(`  - ${p.testo}`);
    if (fileNonCopiati.length) {
      console.log(`  File non copiati (da controllare a mano, non contano): ${fileNonCopiati.length}`);
      for (const f of fileNonCopiati) console.log(`    · ${f}`);
    }
  }
}
for (const a of avvisi) console.log(`\nNota: ${a}`);
console.log(`\nRiepilogo: ${riepilogo.join(', ')}`);
console.log(problemi.length ? `Totale: ${problemi.length} problemi.` : 'Nessun problema: dati e copie vanno d\'accordo.');

if (opz['scrivi-noti']) {
  const righe = [...new Set(problemi.map((p) => p.chiave))].sort();
  fs.writeFileSync(path.resolve(opz['scrivi-noti']), `# Problemi già noti di tools/confronta-copie.mjs (una chiave per riga). Non bloccano la CI.\n# Si rifà con: node tools/confronta-copie.mjs <cartella-copie> --scrivi-noti tests/copie-noti.txt\n# Regole in docs/protocollo-test.md. Togliere una riga quando il problema è risolto.\n${righe.join('\n')}\n`);
  console.log(`Scritte ${righe.length} chiavi in ${opz['scrivi-noti']}.`);
}

if (!opz.noti) process.exit(problemi.length ? 3 : 0); // 3 = differenze trovate (1 resta per un errore del programma)

// Con --noti: solo i problemi nuovi su dati cambiati bloccano.
if (!fs.existsSync(opz.noti)) { console.error(`Manca il file dei problemi noti: ${opz.noti}`); process.exit(2); }
const noti = new Set(fs.readFileSync(opz.noti, 'utf8').split(/\r?\n/).map((r) => r.trim()).filter((r) => r && !r.startsWith('#')));
let inBase = null;
if (opz.base) {
  try { execFileSync('git', ['rev-parse', '--verify', '--quiet', `${opz.base}^{commit}`], { cwd: SITE, stdio: 'ignore' }); } catch {
    console.error(`--base: il commit «${opz.base}» non c'è (nella CI: git fetch origin main).`); process.exit(2);
  }
  inBase = new Set();
  for (const g of gruppi) for (const f of g.fatti((rel) => daGit(opz.base, rel))) inBase.add(f.chiave);
}
const nuovi = problemi.filter((p) => !noti.has(p.chiave));
const nonDiQuesta = inBase ? nuovi.filter((p) => inBase.has(p.chiave)) : [];
const urlNuovi = nuovi.filter((p) => !nonDiQuesta.includes(p) && p.tipo === 'url');
const bloccano = nuovi.filter((p) => !nonDiQuesta.includes(p) && !urlNuovi.includes(p));
const esaminati = new Set(gruppi.map((g) => g.id));
const risolti = [...noti].filter((k) => esaminati.has(k.split(/[/ ]/)[0]) && !problemi.some((p) => p.chiave === k));

console.log(`\n== Contro l'elenco dei noti (${opz.noti})${opz.base ? ` e i dati di ${opz.base}` : ''}`);
console.log(`Già noti: ${problemi.length - nuovi.length}. Nuovi: ${nuovi.length}.`);
if (nonDiQuesta.length) {
  console.log(`\nNon di questa PR (${nonDiQuesta.length}): il dato è uguale in ${opz.base}, è cambiata la pagina ufficiale. Da controllare, non blocca:`);
  for (const p of nonDiQuesta) console.log(`  - ${p.gruppo.id}/${p.testo}`);
}
if (urlNuovi.length) {
  console.log(`\nUrl nuovi senza copia (${urlNuovi.length}): la copia arriva dopo l'unione (tools/copie-se-serve.sh). Non blocca:`);
  for (const p of urlNuovi) console.log(`  - ${p.gruppo.id}/${p.testo}`);
}
if (risolti.length) {
  console.log(`\nNoti che non ci sono più (${risolti.length}): si possono togliere da ${opz.noti}:`);
  for (const k of risolti) console.log(`  · ${k}`);
}
if (bloccano.length) {
  console.log(`\nBLOCCANO (${bloccano.length}): dati nuovi o cambiati che la copia della pagina ufficiale non conferma.`);
  console.log('Correggi il dato, oppure metti l\'url della pagina che lo dice (docs/regola-numeri.md):');
  for (const p of bloccano) console.log(`  - ${p.gruppo.id}/${p.testo}\n      chiave: ${p.chiave}`);
  process.exit(3);
}
console.log('\nNessun problema nuovo su dati cambiati: il controllo passa.');
process.exit(0);
