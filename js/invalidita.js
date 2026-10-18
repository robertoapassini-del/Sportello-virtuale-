// Module 2 — invalidità civile: "la visita non arriva".
// Never asks for the diagnosis: only oncological / minor / other, which is enough for the deadline.
// All answers live in memory only and are lost when the tab is closed.
import { invRegime, invDeadline, todayISO, formatIt, parseDate, daysBetween } from './engine.js';
import { inpsReminder, mailtoHref } from './letters.js';
import {
  esc, loadJSON, disclaimer, renderFooter, copyText, printText, readForm, phoneLink, mailLink,
  personFields, reportErrorHref,
} from './common.js';

const ROOT = '../';
const app = document.getElementById('app');

let rules;
let inps;
const state = {};
const person = {};
const history = [];
let current = 'intro';

function go(screen) { history.push(current); current = screen; render(); }
function back() { current = history.pop() || 'intro'; render(); }
function restart() {
  for (const k of Object.keys(state)) delete state[k];
  history.length = 0;
  current = 'intro';
  render();
}

function render() {
  const s = screens[current]();
  const backBtn = current === 'intro' ? '' : '<button type="button" class="back" data-action="back">← Indietro</button>';
  app.innerHTML = backBtn + s.html;
  if (s.mount) s.mount();
  window.scrollTo(0, 0);
  const h1 = app.querySelector('h1');
  if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
}

function choice(label, set, next, small = '') {
  return `<button type="button" class="btn" data-set='${esc(JSON.stringify(set))}' data-go="${next}">
    ${esc(label)}${small ? `<small>${esc(small)}</small>` : ''}</button>`;
}

app.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-go], button[data-action]');
  if (!btn) return;
  if (btn.dataset.action === 'back') return back();
  if (btn.dataset.action === 'restart') return restart();
  if (btn.dataset.set) Object.assign(state, JSON.parse(btn.dataset.set));
  if (btn.dataset.go) go(btn.dataset.go);
});

const prov = () => inps.provinces.find((p) => p.id === state.province);
const regime = () => invRegime(prov(), state.certDate, rules.full_national_application);
const deadline = () => invDeadline(rules, {
  regime: regime(), category: state.category, certDate: state.certDate, domandaDate: state.domandaDate, today: todayISO(),
});
const restartBtn = (label = 'Ricomincia') => `<button type="button" class="btn center" data-action="restart">${esc(label)}</button>`;

const notAssessing = `<div class="notice info"><p><strong>Non valutiamo la tua invalidità.</strong> Ti diciamo solo quali sono
  i tempi di legge e come sollecitare. Per la valutazione, i ricorsi o le domande di aggravamento rivolgiti a un patronato o a un avvocato.</p></div>`;

const patronato = `<div class="notice ok">
  <p><strong>Aiuto gratuito:</strong> i patronati (per esempio INCA, ACLI, INAS) seguono le pratiche di invalidità
  gratuitamente e possono sollecitare l'INPS per te. Se scrivere una lettera ti sembra difficile, comincia da lì.</p></div>`;

function inpsContacts() {
  const c = rules.inps_contacts;
  return `<ul class="clean">
    <li>Contact center INPS: ${phoneLink(c.contact_center_fixed)} (da rete fissa, gratuito) o ${phoneLink(c.contact_center_mobile)} (da cellulare).</li>
    <li>Servizio online <a href="${esc(c.inps_risponde_url)}" target="_blank" rel="noopener">INPS Risponde / contatti</a>.</li>
  </ul>`;
}

function regimeSteps(r) {
  if (r === 'new') {
    return `<h2>Come funziona nella tua provincia (nuova procedura INPS)</h2>
      <ol class="steps">
        <li>Il medico invia all'INPS il <strong>certificato medico introduttivo</strong>: <strong>vale già come domanda</strong>, non serve altro.</li>
        <li>L'INPS ti convoca a <strong>una sola visita</strong> collegiale (Unità di Valutazione di Base). Puoi portare un tuo medico o psicologo.</li>
        <li>Puoi inviare altri documenti medici fino a <strong>${rules.new_regime.extra_documents_days_before_visit} giorni prima</strong> della visita.</li>
        <li>Ricevi un unico <strong>certificato</strong> (ex verbale) che vale per invalidità civile, handicap (L. 104), cecità, sordità e collocamento mirato.</li>
      </ol>`;
  }
  return `<h2>Come funziona nella tua provincia (procedura attuale, fino al 31/12/2026)</h2>
    <ol class="steps">
      <li>Il medico invia il certificato all'INPS.</li>
      <li>Tu (o un patronato) presenti la <strong>domanda online entro ${rules.old_regime.domanda_window_days} giorni</strong> dal certificato.</li>
      <li>La commissione dell'ASP ti convoca a visita.</li>
      <li>L'INPS verifica e ti invia il verbale.</li>
    </ol>`;
}

const afterVerbale = `
  <details class="card">
    <summary><strong>Dopo il verbale: cosa può dare diritto a cosa</strong></summary>
    <p>A seconda della percentuale o del livello riconosciuto, puoi avere: esenzione dal ticket, permessi L. 104,
    indennità di accompagnamento, pensione di inabilità, collocamento mirato al lavoro, contrassegno per il parcheggio.
    Trovi i dettagli sul sito <a href="https://www.inps.it" target="_blank" rel="noopener">inps.it</a>.</p>
    <p class="muted">Non stimiamo percentuali né importi.</p>
    <p>Se il verbale ha una <strong>scadenza</strong>, i benefici continuano fino alla visita di revisione (L. 114/2014).</p>
  </details>`;

const screens = {
  intro: () => ({
    html: `
      <h1>La visita per l'invalidità civile non arriva?</h1>
      <p class="lead">Scopri in 2 minuti entro quando l'INPS deve concludere e come sollecitare.</p>
      <p>La legge fissa dei tempi massimi, ma quasi nessuno li conosce. Ti diciamo quale procedura vale nella tua provincia,
      la scadenza esatta e cosa fare se è passata.</p>
      ${notAssessing}
      <button type="button" class="btn primary" data-go="province">Inizia</button>
      <p class="muted">Non chiediamo mai la diagnosi. Nessun dato viene salvato.</p>`,
  }),

  province: () => ({
    html: `<p class="progress">Domanda 1 di 4</p>
      <h1>In quale provincia sei residente?</h1>
      ${inps.provinces.map((p) => choice(p.name, { province: p.id }, 'certDate')).join('')}`,
  }),

  certDate: () => ({
    html: `<p class="progress">Domanda 2 di 4</p>
      <h1>Quando il medico ha inviato il certificato all'INPS?</h1>
      <p>È la data sulla ricevuta del <strong>certificato medico introduttivo</strong> che ti ha dato il medico.</p>
      <form id="cert-form" novalidate>
        <label for="certDate">Data di invio del certificato</label>
        <input type="date" id="certDate" name="certDate" value="${esc(state.certDate || '')}" max="${todayISO()}">
        <p class="field-error" id="cert-error" role="alert" hidden></p>
        <button type="submit" class="btn primary">Avanti</button>
      </form>`,
    mount() {
      document.getElementById('cert-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = readForm(e.target);
        const err = document.getElementById('cert-error');
        if (!parseDate(v.certDate)) { err.textContent = 'Inserisci la data.'; err.hidden = false; return; }
        if (daysBetween(v.certDate, todayISO()) < 0) { err.textContent = 'La data non può essere nel futuro.'; err.hidden = false; return; }
        state.certDate = v.certDate;
        go('category');
      });
    },
  }),

  category: () => ({
    html: `<p class="progress">Domanda 3 di 4</p>
      <h1>A chi si riferisce la domanda?</h1>
      <p>Ci serve solo per sapere quale scadenza si applica. Non ti chiediamo la malattia.</p>
      ${choice('Persona con patologia oncologica', { category: 'oncological' }, 'regime', 'Vale anche per i minori con patologia oncologica')}
      ${choice('Minore (meno di 18 anni)', { category: 'minor' }, 'regime')}
      ${choice('Altro adulto', { category: 'other' }, 'regime')}`,
  }),

  regime: () => {
    const r = regime();
    const p = prov();
    if (r === 'new') {
      return {
        html: `<h1>Nella provincia di ${esc(p.name)} vale la nuova procedura INPS</h1>
          ${regimeSteps('new')}
          <h2>Hai già ricevuto la convocazione a visita?</h2>
          ${choice('Sì, ho la data della visita', { convocation: true }, 'checklist')}
          ${choice('No, non ancora', { convocation: false }, 'result')}`,
      };
    }
    return {
      html: `<h1>Nella provincia di ${esc(p.name)} vale ancora la procedura attuale (ASP + INPS)</h1>
        ${regimeSteps('old')}
        <p class="muted">Dal 1° gennaio 2027 la nuova procedura INPS vale in tutte le province.</p>
        <h2>Hai già presentato la domanda online?</h2>
        <form id="dom-form" novalidate>
          <label for="domandaDate">Data della domanda<span class="hint">La trovi sulla ricevuta della domanda (anche se l'ha fatta il patronato)</span></label>
          <input type="date" id="domandaDate" name="domandaDate" value="${esc(state.domandaDate || '')}" max="${todayISO()}">
          <p class="field-error" id="dom-error" role="alert" hidden></p>
          <button type="submit" class="btn primary">Sì, l'ho presentata</button>
        </form>
        <button type="button" class="btn" id="no-dom">Non ancora</button>`,
      mount() {
        document.getElementById('dom-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const v = readForm(e.target);
          const err = document.getElementById('dom-error');
          if (!parseDate(v.domandaDate)) { err.textContent = 'Inserisci la data della domanda.'; err.hidden = false; return; }
          if (daysBetween(state.certDate, v.domandaDate) < 0) { err.textContent = 'La domanda non può essere prima del certificato.'; err.hidden = false; return; }
          state.domandaDate = v.domandaDate;
          go('convocation');
        });
        document.getElementById('no-dom').addEventListener('click', () => { state.domandaDate = null; go('result'); });
      },
    };
  },

  convocation: () => ({
    html: `<p class="progress">Domanda 4 di 4</p>
      <h1>Hai già ricevuto la convocazione a visita?</h1>
      ${choice('Sì, ho la data della visita', { convocation: true }, 'checklist')}
      ${choice('No, non ancora', { convocation: false }, 'result')}`,
  }),

  result: () => {
    const d = deadline();
    const p = prov();
    if (d.status === 'error') {
      return { html: `<h1>Controlla le date</h1><p>Le date inserite non sono coerenti.</p>${restartBtn()}` };
    }

    if (d.kind === 'domanda') {
      const body = d.status === 'passed'
        ? `<div class="notice bad"><p>Il termine per presentare la domanda è scaduto il <strong>${esc(formatIt(d.deadline))}</strong>.
            Di solito serve un nuovo certificato del medico. Chiedi conferma al medico o a un patronato.</p></div>`
        : `<div class="notice warn"><p>Devi presentare la domanda online <strong>entro il ${esc(formatIt(d.deadline))}</strong>
            (${d.days} giorni dal certificato), altrimenti il certificato non vale più.</p></div>
            <p>Puoi presentarla da solo sul sito INPS (con SPID, CIE o CNS) oppure, gratis, tramite un patronato.</p>`;
      return {
        html: `<h1>Prima di tutto: la domanda</h1>${body}${patronato}${inpsContacts()}
          ${disclaimer(rules.last_verified)}${restartBtn()}`,
      };
    }

    const what = d.kind === 'conclusion' ? 'concludere la procedura' : 'convocarti a visita';
    const basis = d.legal ? `(${esc(d.legal)})` : '<span class="muted">(valore indicativo, base legale da verificare)</span>';
    const head = d.status === 'passed'
      ? `<div class="notice bad">
          <span class="big-number">+${d.daysLate} ${d.daysLate === 1 ? 'giorno' : 'giorni'}</span>
          <p>L'${d.kind === 'conclusion' ? 'INPS' : 'amministrazione'} doveva ${what} entro <strong>${d.days} giorni</strong> ${basis},
          cioè entro il <strong>${esc(formatIt(d.deadline))}</strong>. Il termine è passato.</p></div>`
      : `<div class="notice ok"><p>L'${d.kind === 'conclusion' ? 'INPS' : 'amministrazione'} deve ${what} entro
          <strong>${d.days} giorni</strong> ${basis}, cioè entro il <strong>${esc(formatIt(d.deadline))}</strong>.</p>
          <p>Il termine non è ancora passato. Se a quella data non hai notizie, torna qui per preparare un sollecito.</p></div>`;

    return {
      html: `<h1>${d.status === 'passed' ? 'Il termine di legge è passato: puoi sollecitare' : 'Entro quando deve arrivare la visita'}</h1>
        ${head}
        ${d.status === 'passed' ? `
          <h2>Cosa fare, in ordine</h2>
          <ol class="steps">
            <li><strong>Rivolgiti a un patronato</strong> (gratis): può controllare la pratica e sollecitare l'INPS per te.</li>
            <li><strong>Contatta l'INPS</strong>:${inpsContacts()}</li>
            <li><strong>Invia un sollecito scritto</strong> alla Direzione provinciale INPS di ${esc(p.name)}
              (PEC: ${mailLink(p.pec)}). Te lo prepariamo noi.</li>
          </ol>
          <button type="button" class="btn primary" data-go="letter">Prepara il sollecito all'INPS</button>
          <p class="muted">Nota: molti ritengono che questi termini siano "ordinatori": se passano la procedura non si annulla, ma
          il ritardo giustifica un sollecito o un reclamo. Stiamo verificando con un legale le conseguenze esatte.</p>` : patronato}
        ${afterVerbale}
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
    };
  },

  letter: () => {
    const p = prov();
    const r = regime();
    return {
      html: `<h1>Sollecito all'INPS di ${esc(p.name)}</h1>
        <div class="notice info"><p>🔒 I dati che scrivi restano solo su questo dispositivo e spariscono quando chiudi la pagina.
        Non chiediamo e non scriviamo la diagnosi.</p></div>
        <form id="letter-form" novalidate>
          ${personFields(person)}
          <fieldset>
            <legend>Dati della pratica</legend>
            <label for="f-certNumber">Numero del certificato medico introduttivo<span class="hint">Sulla ricevuta che ti ha dato il medico</span></label>
            <input id="f-certNumber" name="certNumber" type="text" value="${esc(state.certNumber || '')}">
            ${r === 'old' ? `<label for="f-domandaNumber">Numero (protocollo) della domanda</label>
            <input id="f-domandaNumber" name="domandaNumber" type="text" value="${esc(state.domandaNumber || '')}">` : ''}
          </fieldset>
        </form>
        <h2>Il tuo sollecito</h2>
        <div id="preview" class="letter"></div>
        <div class="btn-row three">
          <button type="button" class="btn" id="copy-btn">Copia testo</button>
          <button type="button" class="btn" id="pdf-btn">Scarica PDF</button>
          <a class="btn" id="mail-btn" href="#">Apri email</a>
        </div>
        <p class="muted">L'indirizzo dell'INPS è una <strong>PEC</strong>: inviala dalla tua PEC (un'email normale potrebbe essere rifiutata),
        oppure fatti aiutare da un patronato. Indirizzo da verificare: ${mailLink(p.pec)} ·
        <a href="${esc(reportErrorHref(`INPS ${p.name}`))}">Segnala un errore</a></p>
        <h3>Ricordati di allegare</h3>
        <ul class="checklist">
          <li>Copia del documento di identità</li>
          <li>Ricevuta di trasmissione del certificato medico</li>
          ${r === 'old' ? '<li>Ricevuta della domanda</li>' : ''}
          ${person.isDelegate ? '<li>Delega firmata e documento del delegato</li>' : ''}
        </ul>
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
      mount() {
        const form = document.getElementById('letter-form');
        const update = () => {
          const v = readForm(form);
          state.certNumber = v.certNumber; state.domandaNumber = v.domandaNumber;
          delete v.certNumber; delete v.domandaNumber;
          Object.assign(person, v);
          form.querySelector('.delegate-fields').hidden = !person.isDelegate;
          const text = inpsReminder({
            provinceName: p.name, inpsPec: p.pec, person, certNumber: state.certNumber, certDate: state.certDate,
            domandaDate: state.domandaDate, domandaNumber: state.domandaNumber, regime: r, deadlineInfo: deadline(), today: todayISO(),
          });
          state.letterText = text;
          document.getElementById('preview').textContent = text;
          document.getElementById('mail-btn').href = mailtoHref(p.pec,
            `Sollecito convocazione visita invalidità civile${state.certNumber ? ` – certificato n. ${state.certNumber}` : ''}`,
            `Buongiorno,\nin allegato il sollecito firmato, con i documenti indicati.\n\nCordiali saluti\n${person.fullName || ''}`);
        };
        form.addEventListener('input', update);
        form.addEventListener('change', update);
        update();
        document.getElementById('copy-btn').addEventListener('click', (e) => copyText(state.letterText, e.target));
        document.getElementById('pdf-btn').addEventListener('click', () => printText(state.letterText));
      },
    };
  },

  checklist: () => {
    const r = regime();
    return {
      html: `<h1>Prepararsi alla visita</h1>
        <h2>Cosa portare</h2>
        <ul class="checklist">
          <li>Documento di identità</li>
          <li>Tessera sanitaria</li>
          <li>Ricevuta del certificato medico introduttivo</li>
          <li>Documenti medici (di strutture pubbliche o accreditate): cartelle, referti, esami recenti</li>
        </ul>
        ${r === 'new' ? `<div class="notice info"><p>Puoi inviare altri documenti medici all'INPS fino a
          <strong>${rules.new_regime.extra_documents_days_before_visit} giorni prima</strong> della visita.
          Alla visita puoi farti accompagnare da un tuo medico o psicologo.</p></div>` : ''}
        ${patronato}
        ${afterVerbale}
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
    };
  },
};

(async function init() {
  renderFooter(ROOT);
  try {
    [rules, inps] = await Promise.all([loadJSON(`${ROOT}data/rules-invalidita.json`), loadJSON(`${ROOT}data/inps-sicilia.json`)]);
  } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare i dati. Ricarica la pagina.</p></div>';
    return;
  }
  render();
})();
