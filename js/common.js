// Funzioni comuni del sito: testo sicuro, caricamento dati, piè di pagina,
// lettura ad alta voce, copia e stampa. Niente qui invia dati a qualcuno.
import { formatIt } from './engine.js';

// TODO: sostituire con l'indirizzo dedicato quando il dominio esiste (SPEC 8, 9.0).
export const MAINTAINER_EMAIL = 'info@aiutosanita.it';

export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export async function loadJSON(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Impossibile caricare ${path}`);
  return res.json();
}

export function disclaimer(date) {
  return `<p class="muted">Queste sono informazioni generali, non il parere di un avvocato o di un medico.
  Controlla sempre con la tua ASP. Informazioni aggiornate al ${esc(formatIt(date))}.</p>`;
}

export function reportErrorHref(context) {
  const subject = `Segnala un errore – ${context || 'Aiuto Sanità'}`;
  const body = 'Scrivi qui l\'errore (non scrivere dati sulla tua salute):\n\n';
  return `mailto:${MAINTAINER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
    </ul>
    <p>Puoi mostrare questa pagina a chi ti aiuta.</p>
  </details>`;
}

// root: percorso relativo verso la cartella principale ('' oppure '../').
export function renderFooter(root = '') {
  const el = document.getElementById('site-footer');
  if (!el) return;
  el.innerHTML = `<div class="wrap">
    <p>🔒 <strong>Non salviamo niente.</strong> Quello che scrivi resta sul tuo telefono e si cancella quando chiudi la pagina.</p>
    <p><strong>Aiuto Sanità è fatto da volontari. Non siamo l'ASP né l'INPS.</strong> Diamo informazioni generali, non il parere di un avvocato o di un medico.</p>
    <nav aria-label="Informazioni">
      <a href="${root}privacy.html">Privacy</a>
      <a href="${root}fonti.html">Da dove prendiamo le informazioni</a>
      <a href="${root}note-legali.html">Chi siamo</a>
      <a href="${esc(reportErrorHref())}">Segnala un errore</a>
    </nav>
    <p>Il sito è libero: codice con licenza MIT, testi con licenza CC BY 4.0.</p>
  </div>`;
}

// Pulsante di scelta con icona. set = valori da salvare, next = schermata successiva.
export function choice(icon, label, set, next, small = '') {
  return `<button type="button" class="btn choice" data-set='${esc(JSON.stringify(set))}' data-go="${next}">
    <span class="ico" aria-hidden="true">${icon}</span>
    <span class="txt">${esc(label)}${small ? `<small>${esc(small)}</small>` : ''}</span></button>`;
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
