// Shared browser helpers: escaping, data loading, footer, copy/print.
// Nothing here sends data anywhere.
import { formatIt } from './engine.js';

// TODO: replace with the project's dedicated address once the domain exists (SPEC 8, 9.0).
export const MAINTAINER_EMAIL = 'info@dirittointempo.it';

export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export async function loadJSON(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Impossibile caricare ${path}`);
  return res.json();
}

export function disclaimer(date) {
  return `<p class="muted"><strong>Attenzione:</strong> Diritto in Tempo fornisce informazioni generali sui diritti previsti dalla normativa.
  Non è un consulto legale o medico. Verifica sempre le informazioni con la tua ASP.
  Informazioni aggiornate al ${esc(formatIt(date))}.</p>`;
}

export function reportErrorHref(context) {
  const subject = `Segnala un errore – ${context || 'Diritto in Tempo'}`;
  const body = 'Descrivi l\'errore (non inserire dati sanitari o personali):\n\n';
  return `mailto:${MAINTAINER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// root: relative path to the site root from the current page ('' or '../').
export function renderFooter(root = '') {
  const el = document.getElementById('site-footer');
  if (!el) return;
  el.innerHTML = `<div class="wrap">
    <p><strong>Diritto in Tempo</strong> fornisce informazioni generali. Non è un consulto legale o medico.</p>
    <p>🔒 Nessun dato viene salvato o inviato: tutto resta nel tuo browser e sparisce quando chiudi la pagina.</p>
    <nav aria-label="Informazioni">
      <a href="${root}privacy.html">Privacy</a>
      <a href="${root}fonti.html">Fonti e date di verifica</a>
      <a href="${root}note-legali.html">Note legali</a>
      <a href="${esc(reportErrorHref())}">Segnala un errore</a>
    </nav>
    <p>Codice con licenza MIT, contenuti con licenza CC BY 4.0.</p>
  </div>`;
}

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
    const old = button.textContent;
    button.textContent = 'Copiato ✓';
    setTimeout(() => { button.textContent = old; }, 2000);
  }
}

// "Scarica PDF": prints only the letter; the user picks "Salva come PDF".
// No external library, so nothing is downloaded from third parties.
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

// Reads all named inputs of a form into a plain object (checkboxes → boolean).
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

export function mailLink(addr) {
  return `<a href="mailto:${esc(addr)}">${esc(addr)}</a>`;
}

// Personal-data fieldset shared by both modules' letter screens.
// Values are kept only in memory (the `person` object) for the current tab.
export function personFields(p = {}) {
  const f = (name, label, type = 'text', hint = '', extra = '') =>
    `<label for="f-${name}">${label}${hint ? `<span class="hint">${hint}</span>` : ''}</label>
     <input id="f-${name}" name="${name}" type="${type}" value="${esc(p[name] || '')}" ${extra}>`;
  return `
  <fieldset>
    <legend>Dati della persona assistita</legend>
    ${f('fullName', 'Nome e cognome', 'text', '', 'autocomplete="name"')}
    ${f('birthPlace', 'Luogo di nascita')}
    ${f('birthDate', 'Data di nascita', 'date')}
    ${f('cf', 'Codice fiscale', 'text', '', 'autocapitalize="characters" maxlength="16"')}
    ${f('address', 'Indirizzo di residenza', 'text', 'Via, numero, CAP, comune', 'autocomplete="street-address"')}
    ${f('city', 'Comune da cui scrivi', 'text', 'Va in fondo alla lettera, accanto alla data')}
    ${f('phone', 'Telefono', 'tel', '', 'autocomplete="tel"')}
    ${f('email', 'Email', 'email', '', 'autocomplete="email"')}
    ${f('pec', 'PEC (se ce l\'hai)', 'email')}
    ${f('idDoc', 'Documento di identità', 'text', 'Tipo, numero, data di rilascio, rilasciato da')}
  </fieldset>
  <fieldset>
    <legend>Scrivi per un familiare?</legend>
    <label class="check"><input type="checkbox" name="isDelegate" ${p.isDelegate ? 'checked' : ''}> Sì, scrivo come delegato/a (per esempio per un genitore)</label>
    <div class="delegate-fields" ${p.isDelegate ? '' : 'hidden'}>
      ${f('delegateName', 'Nome e cognome del delegato')}
      ${f('delegateCf', 'Codice fiscale del delegato', 'text', '', 'autocapitalize="characters" maxlength="16"')}
      <p class="muted">Allega una delega firmata dall'assistito/a e la copia dei documenti di identità di entrambi.</p>
    </div>
  </fieldset>`;
}
