// Funzioni comuni del sito: testo sicuro, caricamento dati, piè di pagina,
// lettura ad alta voce, copia e stampa. L'unica cosa inviata è il conteggio
// anonimo delle visite e dei «Sì / No» (vedi count()): mai quello che scrivi.
import { formatIt, art } from './engine.js';
import { ICONS } from './icons.js';
import { checkWith } from './controlla.js';

// TODO: sostituire con l'indirizzo dedicato quando il dominio esiste (SPEC 8, 9.0).
export const MAINTAINER_EMAIL = 'info@guidasanita.it';

// Statistiche senza cookie con GoatCounter: il nome scelto creando l'account su
// goatcounter.com (es. 'guidasanita' → https://guidasanita.goatcounter.com).
// Vuoto = non si conta niente.
export const GOATCOUNTER_CODE = 'guidasanita';

// Conta una pagina vista o un evento. Manda solo indirizzo della pagina, titolo e
// sito di provenienza: niente risposte, niente dati scritti nei moduli.
// Usa il «pixel» di GoatCounter (nessuno script da altri siti). Sul computer
// di chi sviluppa (localhost) non conta.
let pageCounted = false;
export function count(path, { title = '', event = false } = {}) {
  if (!GOATCOUNTER_CODE || !/^https?:$/.test(location.protocol)) return;
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;
  const q = new URLSearchParams({ p: path.replace(/\/index\.html$/, '/'), t: title, rnd: Math.random().toString(36).slice(2) });
  if (event) q.set('e', 'true');
  else {
    let from = '';
    try { from = new URL(document.referrer).origin; } catch { /* nessuna provenienza */ }
    if (from && from !== location.origin) q.set('r', from);
  }
  try { new Image().src = `https://${GOATCOUNTER_CODE}.goatcounter.com/count?${q}`; } catch { /* non importa */ }
}

export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export async function loadJSON(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Impossibile caricare ${path}`);
  return res.json();
}

// Regione in uso (docs/regioni.md). La sceglie chi usa il sito e il browser la ricorda in
// localStorage («gs-regione»): è l'unica cosa che il sito ricorda, mai un dato sanitario.
// I dati di ogni regione sono in data/regioni/<id>/ (elenco in data/regioni/index.json).
export const REGIONE_DEFAULT = 'sicilia';
const REGIONE_KEY = 'gs-regione';
let indice = null;
let indiceLoading = null;
let regioneCaricata = null;

// Carica l'elenco delle regioni una volta sola. Se non arriva, si usa la regione predefinita.
export function loadRegioni(root = '') {
  if (!indiceLoading) {
    indiceLoading = loadJSON(`${root}data/regioni/index.json`)
      .catch(() => ({ default: REGIONE_DEFAULT, regioni: [] }))
      .then((d) => { indice = d; return d; });
  }
  return indiceLoading;
}

// La scelta salvata nel browser. Il browser può non avere localStorage o bloccarlo.
function savedRegione() {
  try { return localStorage.getItem(REGIONE_KEY); } catch { return null; }
}
export function setRegione(id) {
  try { localStorage.setItem(REGIONE_KEY, id); } catch { /* non si ricorda: pazienza */ }
}

// Tutte le regioni dell'indice (vuoto finché l'indice non è caricato) e quelle con i dati.
export const regioni = () => (indice ? indice.regioni : []);
export const regioniAttive = () => regioni().filter((r) => r.attiva);
// Vero se la regione salvata è una di quelle attive.
export const regioneScelta = () => regioniAttive().some((r) => r.id === savedRegione());
export function regione() {
  if (!indice) return REGIONE_DEFAULT;
  return regioneScelta() ? savedRegione() : (indice.default || REGIONE_DEFAULT);
}
// La voce dell'indice della regione in uso (nome, asl_label…).
export const regioneInfo = () => regioni().find((r) => r.id === regione()) || { id: regione(), name: 'Sicilia' };
// La regione di cui la pagina ha caricato i dati: se l'utente ne sceglie un'altra, la pagina si ricarica.
export const regioneDeiDati = () => regioneCaricata;
export const regionalPath = (root, name) => `${root}data/regioni/${regione()}/${name}.json`;
export async function loadRegional(root, name) {
  await loadRegioni(root);
  regioneCaricata = regione();
  return loadJSON(regionalPath(root, name));
}

// L'ufficio a cui chiedere conferma dipende dal modulo (js/controlla.js): la cartella della pagina.
export function disclaimer(date) {
  const slug = location.pathname.split('/').filter(Boolean).filter((x) => x !== 'index.html').pop() || '';
  return `<p class="muted">Queste sono informazioni generali, non il parere di un avvocato o di un medico.
  ${checkWith(slug)} Informazioni aggiornate ${art('al', date)}${esc(formatIt(date))}.</p>`;
}

export function reportErrorHref(context) {
  const subject = `Segnala un errore – ${context || 'Guida Sanità'}`;
  const body = 'Scrivi qui l\'errore (non scrivere dati sulla tua salute):\n\n';
  return `mailto:${MAINTAINER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Cartella principale del sito vista dalla pagina ('' o '../'), presa dal foglio di stile.
export function siteRoot() {
  const css = document.querySelector('link[rel="stylesheet"][href$="css/style.css"]');
  return css ? css.getAttribute('href').replace(/css\/style\.css$/, '') : '';
}

// Riquadro "Chi può aiutarmi?", uguale in tutte le pagine.
export function helpBox() {
  return `<details class="help">
    <summary><span class="ico" aria-hidden="true">🙋</span> Ti serve aiuto? Chi può aiutarti</summary>
    <ul class="icon-list">
      <li><span class="ico" aria-hidden="true">👨‍👩‍👧</span> Un figlio, un nipote o un vicino di casa</li>
      <li><span class="ico" aria-hidden="true">💊</span> La farmacia</li>
      <li><span class="ico" aria-hidden="true">👨‍⚕️</span> Il tuo medico di famiglia</li>
      <li><span class="ico" aria-hidden="true">🏢</span> Un patronato (per esempio INCA, ACLI, INAS). È gratis.</li>
      <li><span class="ico" aria-hidden="true">🏥</span> L'ufficio URP della tua ASP: è l'ufficio che ascolta i cittadini</li>
      <li><span class="ico" aria-hidden="true">📞</span> <a href="${siteRoot()}numeri-utili/">I numeri utili: guardia medica, CUP, ASP, INPS</a></li>
    </ul>
    <p>Puoi mostrare questa pagina a chi ti aiuta.</p>
  </details>`;
}

// Riquadro «Fonti»: le pagine ufficiali da cui vengono le informazioni della schermata.
// items: [{ label, url }] — se url manca, il nome resta come testo.
export function sourcesBox(items, { verified, note } = {}) {
  const seen = new Set();
  const list = items.filter((s) => s && s.label && !seen.has(s.url || s.label) && seen.add(s.url || s.label));
  if (!list.length) return '';
  return `<details class="fonti no-say">
    <summary><span class="ico" aria-hidden="true">📚</span> Da dove vengono queste informazioni</summary>
    <ul class="clean">${list.map((s) => `<li>${s.url
      ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`
      : esc(s.label)}</li>`).join('')}</ul>
    ${verified ? `<p class="muted">Controllate ${art('il', verified)}${esc(formatIt(verified))}.${note ? ` ${esc(note)}` : ''}</p>` : ''}
    <p class="muted">I link aprono i siti ufficiali in una nuova scheda.</p>
  </details>`;
}

// Pagine fisse: carica le regole e mostra il riquadro Fonti dentro #fonti.
export async function renderSources(root = '') {
  const el = document.getElementById('fonti');
  if (!el) return;
  try {
    const names = ['rules', 'rules-invalidita', 'rules-cartella', 'rules-ausili', 'rules-esenzione', 'rules-ricorso', 'rules-adi', 'rules-piano', 'rules-domiciliare', 'rules-palliative', 'rules-prevenzione', 'rules-medico'];
    const all = await Promise.all(names.map((n) => loadJSON(`${root}data/${n}.json`)));
    el.innerHTML = sourcesBox(all.flatMap((r) => r.sources), { verified: all[0].last_verified });
  } catch { el.innerHTML = ''; }
}

// «Ti serve altro?»: torna alla scelta guidata. In fondo a ogni schermata dei moduli.
export function moreHelp() {
  return `<a class="btn center more-help no-say" href="../">🏠 Ti serve altro? Torna all'inizio</a>`;
}

// Riquadro «Non hai la PEC?»: sotto ogni lettera. Modi validi per mandarla lo stesso.
export function noPecBox() {
  return `<details class="card no-pec">
    <summary><span class="ico" aria-hidden="true">📨</span> Non hai la PEC? Ecco 4 modi per mandarla lo stesso</summary>
    <p>La PEC è un'email speciale che vale come una raccomandata. Un'email normale mandata a un indirizzo PEC spesso viene rifiutata. Ecco cosa puoi fare:</p>
    <ul class="icon-list">
      <li><span class="ico" aria-hidden="true">🏢</span><span><strong>Patronato</strong> (INCA, ACLI, INAS…): porti la lettera firmata e i documenti, la mandano loro con la loro PEC. È gratis.</span></li>
      <li><span class="ico" aria-hidden="true">🏥</span><span><strong>A mano</strong>: porti la lettera all'ufficio (URP, distretto, ospedale) e ti fai dare una copia con <strong>timbro e data</strong>. Quella copia è la tua prova.</span></li>
      <li><span class="ico" aria-hidden="true">✉️</span><span><strong>Raccomandata con ricevuta di ritorno</strong> (A/R), dall'ufficio postale. Costa pochi euro. Conserva la ricevuta.</span></li>
      <li><span class="ico" aria-hidden="true">👨‍👩‍👧</span><span><strong>Un familiare con la PEC</strong> può mandarla per te. Allega la delega firmata e i documenti di tutti e due.</span></li>
    </ul>
    <p class="muted">Se fai spesso pratiche, una PEC tua costa circa 5–10 € l'anno (Poste, Aruba, Register e altri).</p>
  </details>`;
}

// root: percorso relativo verso la cartella principale ('' oppure '../').
export function renderFooter(root = '') {
  const el = document.getElementById('site-footer');
  if (!el) return;
  el.innerHTML = `<div class="wrap">
    <p>🔒 <strong>Non salviamo niente.</strong> Quello che scrivi resta sul tuo telefono e si cancella quando chiudi la pagina.</p>
    <p><strong>Guida Sanità è fatto da volontari. Non siamo l'ASP, l'INPS né un altro ufficio pubblico.</strong> Diamo informazioni generali, non il parere di un avvocato o di un medico.</p>
    <nav aria-label="Informazioni">
      <a href="${root}privacy.html">Privacy</a>
      <a href="${root}fonti.html">Da dove prendiamo le informazioni</a>
      <a href="${root}note-legali.html">Chi siamo</a>
      <a href="${esc(reportErrorHref())}">Segnala un errore</a>
    </nav>
    <p>Il sito è libero: codice con licenza MIT, testi con licenza CC BY 4.0.</p>
  </div>`;
  renderFeedback(el, root);
  if (!pageCounted) { pageCounted = true; count(location.pathname, { title: document.title }); }
}

// «Questa pagina ti è stata utile?» sopra il piè di pagina, come NHS.uk.
// Contiamo solo quanti «Sì» e quanti «No» per pagina (evento GoatCounter
// «utile-si/…» o «utile-no/…»): con «No» si può scriverci un'email, se si vuole. Sotto, la data dell'ultimo controllo.
function renderFeedback(footer, root) {
  if (document.getElementById('page-feedback')) return;
  footer.insertAdjacentHTML('beforebegin', `<section class="page-feedback no-say" id="page-feedback" aria-labelledby="fb-q"><div class="wrap">
    <div class="fb-box" aria-live="polite">
      <h2 id="fb-q">Questa pagina ti è stata utile?</h2>
      <div class="fb-buttons"><button type="button" data-fb="si">Sì</button><button type="button" data-fb="no">No</button></div>
      <p class="muted">Contiamo solo quanti Sì e quanti No, senza sapere chi sei.</p>
    </div>
    <p class="fb-checked" hidden></p>
  </div></section>`);
  const box = document.querySelector('#page-feedback .fb-box');
  box.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-fb]');
    if (!b) return;
    count(`utile-${b.dataset.fb}${location.pathname}`, { title: `Utile: ${b.dataset.fb === 'si' ? 'Sì' : 'No'} – ${document.title}`, event: true });
    box.innerHTML = b.dataset.fb === 'si'
      ? '<p><strong>Grazie!</strong> Puoi mostrare questa pagina anche a chi ne ha bisogno.</p>'
      : `<p><strong>Ci dispiace.</strong> Se vuoi, <a href="${esc(reportErrorHref(document.title))}">scrivici cosa non andava</a>: si apre il tuo programma di posta e decidi tu se mandare.</p>
         <p class="muted">Non scrivere dati sulla tua salute.</p>`;
  });
  checkedDate(root).then((d) => {
    if (!d) return;
    const p = document.querySelector('#page-feedback .fb-checked');
    p.textContent = `Informazioni controllate ${art('il', d)}${formatIt(d)}.`;
    p.hidden = false;
  }).catch(() => {});
}

// Data dell'ultimo controllo della pagina: la più vecchia tra i file di dati che usa
// (data/moduli.json → "data"). Pagina di un'area: i suoi moduli. Home: tutti.
// Privacy, fonti e chi siamo: nessuna data.
async function checkedDate(root) {
  const parts = location.pathname.split('/').filter(Boolean);
  const file = /\.html$/.test(parts[parts.length - 1] || '') ? parts.pop() : 'index.html';
  const slug = root ? parts[parts.length - 1] : (file === 'index.html' ? '' : null);
  if (slug === null) return null;
  const reg = await loadJSON(`${root}data/moduli.json`);
  const group = reg.groups.find((g) => g.page === slug);
  const mods = !slug ? reg.modules : reg.modules.filter((m) => (group ? m.group === group.id : m.id === slug));
  const files = [...new Set(mods.flatMap((m) => m.data || []))];
  const data = await Promise.all(files.map((f) => loadJSON(`${root}data/${f}.json`)));
  const dates = data.flatMap((d) => JSON.stringify(d).match(/"last_verified":"\d{4}-\d{2}-\d{2}"/g) || []).map((s) => s.slice(-11, -1));
  return dates.sort()[0] || null;
}

// Pulsante di scelta con icona (icon = '' → senza icona, per gli elenchi tutti uguali
// come le province). set = valori da salvare, next = schermata successiva.
// Lo spazio prima di <small> serve ai lettori di schermo: «Lettera B, Entro 10 giorni».
export function choice(icon, label, set, next, small = '') {
  return `<button type="button" class="btn choice" data-set='${esc(JSON.stringify(set))}' data-go="${next}">
    ${icon ? `<span class="ico" aria-hidden="true">${icon}</span>` : ''}
    <span class="txt">${esc(label)}${small ? ` <small>${esc(small)}</small>` : ''}</span></button>`;
}

// Le emoji all'inizio dei titoli restano visibili ma i lettori di schermo non le leggono
// (altrimenti dicono per esempio «puntina arrotondata, Dove abiti?»).
const LEADING_EMOJI = /^\s*((?:[\p{Extended_Pictographic}\p{Regional_Indicator}\u{1F3FB}-\u{1F3FF}⃣️‍])+)\s*/u;
export function hideHeadingEmoji(root) {
  for (const h of root.querySelectorAll('h1, h2, h3')) {
    const t = h.firstChild;
    if (!t || t.nodeType !== 3) continue;
    const m = t.textContent.match(LEADING_EMOJI);
    if (!m) continue;
    t.textContent = t.textContent.slice(m[0].length);
    const span = document.createElement('span');
    span.setAttribute('aria-hidden', 'true');
    span.className = 'h-ico';
    span.textContent = `${m[1]} `;
    h.insertBefore(span, t);
  }
}

// ---------- Lettura ad alta voce ----------
// Usa la voce del telefono/computer. Legge solo titolo, frasi e scelte della schermata:
// mai i dati personali o le lettere (non hanno la classe "say").

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

export function listenButton() {
  return canSpeak ? '<button type="button" class="listen" data-action="listen" aria-label="Ascolta questa pagina">🔊 Ascolta</button>' : '';
}

// Toglie le emoji dal testo da leggere: la voce le pronuncerebbe a parole
// (per esempio 📍 = «puntina arrotondata»).
export function stripEmoji(text) {
  return text
    .replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\u{1F3FB}-\u{1F3FF}\u20E3\uFE0F\u200D]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function plainText(el) {
  const c = el.cloneNode(true);
  c.querySelectorAll('.ico, .no-say').forEach((x) => x.remove());
  return stripEmoji(c.textContent);
}

export function stopSpeaking() {
  if (canSpeak) window.speechSynthesis.cancel();
}

export function speakScreen(root) {
  if (!canSpeak) return;
  const synth = window.speechSynthesis;
  if (synth.speaking) { synth.cancel(); return; }
  const parts = [...root.querySelectorAll('h1, .say')].map(plainText);
  const choices = [...root.querySelectorAll('.choice .txt')].map(plainText);
  if (choices.length) parts.push(`Puoi scegliere: ${choices.join('. Oppure: ')}.`);
  const u = new SpeechSynthesisUtterance(parts.join('. '));
  u.lang = 'it-IT';
  u.rate = 0.9;
  const voices = synth.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith('it'));
  const voice = voices.find((v) => v.localService) || voices[0];
  if (voice) u.voice = voice;
  synth.speak(u);
}

// Pagine di solo testo (le pagine corte della guida): legge titoli, paragrafi ed elenchi,
// saltando indice, fonti e quello che è segnato .no-say.
export function speakGuide(root) {
  if (!canSpeak) return;
  const synth = window.speechSynthesis;
  if (synth.speaking) { synth.cancel(); return; }
  const parts = [...root.querySelectorAll('h1, h2, h3, p, li')]
    .filter((el) => !el.closest('.no-say, .topbar, .guida-indice, details, nav'))
    .map(plainText)
    .filter(Boolean);
  const u = new SpeechSynthesisUtterance(parts.join('. '));
  u.lang = 'it-IT';
  u.rate = 0.9;
  const voices = synth.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith('it'));
  const voice = voices.find((v) => v.localService) || voices[0];
  if (voice) u.voice = voice;
  synth.speak(u);
}

// I pulsanti che avviano il percorso sono scritti nell'HTML con `disabled`: si sbloccano
// solo quando il modulo ha caricato i dati, così un tocco arrivato prima non va perso.
export function enableStart(root) {
  root.querySelectorAll('button[data-go][disabled]').forEach((b) => { b.disabled = false; });
}

// ---------- Copia e stampa ----------

export async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  if (button) {
    const old = button.innerHTML;
    button.textContent = 'Copiato ✓';
    setTimeout(() => { button.innerHTML = old; }, 2000);
  }
}

// "Stampa o salva": stampa solo la lettera; si può scegliere "Salva come PDF".
// Nessuna libreria esterna, così niente viene scaricato da altri siti.
export function printText(text) {
  let area = document.getElementById('print-area');
  if (!area) {
    area = document.createElement('div');
    area.id = 'print-area';
    document.body.appendChild(area);
  }
  area.textContent = text;
  document.body.classList.add('printing');
  const done = () => { document.body.classList.remove('printing'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
  setTimeout(done, 1000);
}

// Legge i campi di un modulo in un oggetto (caselle di spunta → vero/falso).
export function readForm(form) {
  const out = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.type === 'checkbox') out[el.name] = el.checked;
    else if (el.type === 'radio') { if (el.checked) out[el.name] = el.value; }
    else out[el.name] = el.value.trim();
  }
  return out;
}

export function phoneLink(number) {
  return `<a href="tel:${esc(number.replace(/\s+/g, ''))}">${esc(number)}</a>`;
}

// Grande pulsante "Chiama".
export function callButton(label, number) {
  return `<a class="btn choice call" href="tel:${esc(number.replace(/\s+/g, ''))}">
    <span class="ico" aria-hidden="true">📞</span><span class="txt">${esc(label)}<small>${esc(number)}</small></span></a>`;
}

// Pulsanti «Chiama» di un'ASP: i numeri generali (phones) e quelli degli argomenti
// chiesti (contacts con topic, per esempio 'casa' o 'palliative'), senza doppioni.
// Sotto, il link a tutti i numeri dell'ASP nella pagina «Numeri utili».
// onlyTopics: solo i numeri degli argomenti, senza quelli generali (per officeBox).
export function aspCalls(a, topics = [], { onlyTopics = false } = {}) {
  const seen = new Set();
  const list = [...(a.contacts || []).filter((c) => topics.includes(c.topic)), ...(onlyTopics ? [] : a.phones)]
    .filter((p) => !seen.has(p.number) && seen.add(p.number));
  const info = (p) => [p.address && `📍 ${esc(p.address)}`, p.hours && esc(p.hours)].filter(Boolean).join('<br>');
  return `${list.map((p) => `${callButton(p.label, p.number)}${info(p) ? `<p class="muted call-info">${info(p)}</p>` : ''}`).join('')}
    <p><a href="${siteRoot()}numeri-utili/#${esc(a.id)}">📞 Tutti i numeri dell'${esc(a.name)}: guardia medica, CUP, URP</a></p>`;
}

// Riquadro «Dov'è l'ufficio»: i contatti dell'ASP di un argomento, con titolo e una frase.
// Solo i numeri di quell'ufficio: i numeri generali (per esempio il CUP con «tasto 2»,
// che vale per le visite urgenti) qui confondono. Vuoto se l'ASP non ha contatti confermati per quell'argomento.
export function officeBox(a, topic, title, intro = '') {
  if (!(a.contacts || []).some((c) => c.topic === topic)) return '';
  return `<h2 class="say">${title}</h2>
    ${intro ? `<p class="say">${esc(intro)}</p>` : ''}
    ${aspCalls(a, [topic], { onlyTopics: true })}`;
}

// Indirizzo generale dell'ASP (URP o PEC del protocollo), per le richieste che NON sono
// il percorso di tutela: alcune ASP hanno una casella dedicata solo alle liste d'attesa.
export function generalContact(a) {
  return a.emails.find((e) => /urp/i.test(e)) || a.pec || a.emails[0] || '';
}

export function mailLink(addr) {
  return `<a href="mailto:${esc(addr)}">${esc(addr)}</a>`;
}

// Dati personali per le lettere dei due moduli.
// Restano solo in memoria (oggetto `person`) finché la pagina è aperta.
export function personFields(p = {}, legend = 'I dati della persona') {
  const f = (name, label, type = 'text', hint = '', extra = '') =>
    `<label for="f-${name}">${label}${hint ? `<span class="hint">${hint}</span>` : ''}</label>
     <input id="f-${name}" name="${name}" type="${type}" value="${esc(p[name] || '')}" ${extra}>`;
  return `
  <fieldset>
    <legend>${legend}</legend>
    ${f('fullName', 'Nome e cognome', 'text', '', 'autocomplete="name"')}
    ${f('birthPlace', 'Dove è nato/a', 'text', 'Il comune')}
    ${f('birthDate', 'Quando è nato/a', 'date')}
    ${f('cf', 'Codice fiscale', 'text', 'È scritto sulla tessera sanitaria', 'autocapitalize="characters" maxlength="16"')}
    ${f('address', 'Indirizzo di casa', 'text', 'Via, numero e città', 'autocomplete="street-address"')}
    ${f('city', 'Città', 'text', 'Va in fondo alla lettera, vicino alla data')}
    ${f('phone', 'Numero di telefono', 'tel', '', 'autocomplete="tel"')}
    ${f('email', 'Email', 'email', 'Se non ce l\'hai, lascia vuoto', 'autocomplete="email"')}
    ${f('pec', 'PEC', 'email', 'Solo se ce l\'hai. Se non sai cos\'è, lascia vuoto')}
    ${f('idDoc', 'Carta d\'identità', 'text', 'Numero, data e comune che l\'ha fatta')}
  </fieldset>
  <fieldset>
    <legend>Scrivi per un'altra persona?</legend>
    <label class="check"><input type="checkbox" name="isDelegate" ${p.isDelegate ? 'checked' : ''}> Sì, scrivo per un familiare (per esempio mamma o papà)</label>
    <div class="delegate-fields" ${p.isDelegate ? '' : 'hidden'}>
      ${f('delegateName', 'Il tuo nome e cognome')}
      ${f('delegateCf', 'Il tuo codice fiscale', 'text', '', 'autocapitalize="characters" maxlength="16"')}
      <p class="muted">Serve una <strong>delega</strong>: un foglio firmato dalla persona, che dice che puoi fare la richiesta per lei.
      Allega anche la fotocopia dei documenti di tutti e due.</p>
    </div>
  </fieldset>`;
}

// ---------- Icone e banda colorata ----------
// Nei testi del sito le icone sono scritte come emoji (comode da leggere nel codice).
// Qui, appena compaiono sullo schermo, diventano icone disegnate tutte uguali (js/icons.js):
// le emoji cambiano aspetto da un telefono all'altro. Le lettere non si toccano.

const emojiRe = new RegExp(
  Object.keys(ICONS)
    .flatMap((e) => (e.includes('\uFE0F') ? [e, e.replace(/\uFE0F/g, '')] : [e]))
    .sort((a, b) => b.length - a.length)
    .map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|'),
  'gu',
);
const hasEmoji = new RegExp(emojiRe.source, 'u');
const iconOf = (e) => ICONS[e] || ICONS[`${e}\uFE0F`];
const SKIP = 'script, style, textarea, .letter, #print-area, svg';

function iconSvg([inner, tone]) {
  const t = document.createElement('template');
  t.innerHTML = `<svg class="i${tone ? ` i-${tone}` : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
  return t.content.firstChild;
}

export function iconize(root) {
  if (root.nodeType === 3) root = root.parentElement;
  if (!root || root.closest?.(SKIP)) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (hasEmoji.test(n.data) && !n.parentElement.closest(SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const nodes = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n);
  for (const n of nodes) {
    const frag = document.createDocumentFragment();
    let last = 0;
    for (const m of n.data.matchAll(emojiRe)) {
      frag.append(n.data.slice(last, m.index), iconSvg(iconOf(m[0])));
      last = m.index + m[0].length;
    }
    frag.append(n.data.slice(last));
    n.replaceWith(frag);
  }
}

// Banda colorata in alto (come NHS.uk): icona grande, titolo e frase principale.
// Solo nelle schermate con l'icona grande (inizio e risultato di un modulo) e nelle
// pagine con data-band (le aree); le schermate con le domande restano semplici.
function bandify() {
  const app = document.getElementById('app');
  const h1 = app && app.querySelector(':scope > h1');
  if (!h1) return;
  const hero = h1.previousElementSibling?.classList.contains('hero') ? h1.previousElementSibling : null;
  if (!hero && !app.hasAttribute('data-band')) return;
  let start = hero || h1;
  const top = start.previousElementSibling;
  if (top && top.classList.contains('topbar') && top === app.firstElementChild) start = top;
  const items = [];
  for (let n = start; n; n = n.nextElementSibling) { items.push(n); if (n === h1) break; }
  for (let n = h1.nextElementSibling; n && n.matches('p.lead'); n = n.nextElementSibling) items.push(n);
  const focused = document.activeElement;
  const band = document.createElement('div');
  band.className = 'page-band';
  start.before(band);
  band.append(...items);
  if (focused && band.contains(focused)) focused.focus({ preventScroll: true });
}

if (typeof document !== 'undefined') {
  // Ricerca nella testata dalle altre pagine: si va alla home con il testo dopo «#»
  // (./#q=…), che il browser non manda al server. In home la gestisce home.js.
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (e.defaultPrevented || !form.matches('.header-search')) return;
    e.preventDefault();
    const q = form.elements.q.value.trim();
    location.href = `${form.getAttribute('action')}${q ? `#q=${encodeURIComponent(q)}` : ''}`;
  });
  // «Stampa la guida» (barra in fondo alla pagina, creata da tools/pagine.mjs): sul foglio
  // va solo la guida scritta, senza le domande. «Stampa questa pagina»: tutta la pagina.
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-action="print-page"]');
    if (!b) return;
    const only = b.dataset.print === 'guida';
    if (only) document.body.classList.add('printing-guide');
    const done = () => { document.body.classList.remove('printing-guide'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(done, 1000);
  });
  iconize(document.body);
  bandify();
  new MutationObserver((changes) => {
    for (const c of changes) c.addedNodes.forEach((n) => iconize(n));
    bandify();
  }).observe(document.body, { childList: true, subtree: true });
}
