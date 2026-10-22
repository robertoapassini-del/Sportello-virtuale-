// Modulo 2 — invalidità civile: "la visita non arriva".
// Prima la risposta: la pagina mostra subito la risposta scritta; il conto e il sollecito partono dal pulsante.
// Non chiede mai la malattia: basta sapere se è oncologica, un minore o altro.
// Le risposte restano solo in memoria e si cancellano quando si chiude la pagina.
// Testi: italiano semplice, frasi brevi, un'idea per frase.
import { invRegime, invDeadline, todayISO, formatIt, parseDate, daysBetween, art } from './engine.js';
import { inpsReminder, mailtoHref } from './letters.js';
import { noPecBox,
  esc, loadJSON, loadRegional, disclaimer, renderFooter, avvisoErrore, copyText, printText, readForm, mailLink, callButton,
  personFields, reportErrorHref, choice, helpBox, sourcesBox, moreHelp, hideHeadingEmoji, enableStart, aslLabel, syncDelegate, delegateNoteText,
} from './common.js';
import { createNav, withRegion, regionAction, moveToTop, showError } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
// La risposta scritta della pagina: è la prima schermata del percorso.
const answerHtml = app.innerHTML;

let rules;
let inps;
const state = {};
const person = {};

const nav = createNav({ first: 'intro', show: paint });
const go = nav.go;
const back = nav.back;
const render = nav.render;
const restart = () => nav.restart(() => { for (const o of [state, person]) for (const k of Object.keys(o)) delete o[k]; });

let dipinto = false;
function paint(current) {
  const s = screens[current]();
  const backBtn = current === 'intro' ? '' : '<div class="topbar"><button type="button" class="back" data-action="back">← Torna indietro</button></div>';
  app.innerHTML = `${backBtn}${s.html}${regionLink(current, state)}${moreHelp()}${helpBox()}${screenSources()}`;
  enableStart(app);
  hideHeadingEmoji(app);
  if (s.mount) s.mount();
  if (dipinto) moveToTop(app);
  dipinto = true;
}

app.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-go], button[data-action]');
  if (!btn) return;
  if (btn.dataset.action === 'back') return back();
  if (btn.dataset.action === 'restart') return restart();
  if (regionAction(btn, nav)) return;
  if (btn.dataset.set) Object.assign(state, JSON.parse(btn.dataset.set));
  if (btn.dataset.go) go(btn.dataset.go);
});

const prov = () => inps.provinces.find((p) => p.id === state.province);

// Sede INPS della provincia: indirizzo, orari e come prenotare lo sportello.
const inpsSede = (p) => (p.address ? `<div class="card">
    <h3 style="margin-top:0">🏛️ La sede INPS di ${esc(p.name)}</h3>
    <p>📍 ${esc(p.address)}${p.hours ? `<br>${esc(p.hours)}` : ''}</p>
    <p>Per parlare con qualcuno allo sportello bisogna <strong>prenotare</strong>: con l'app INPS, sul sito (MyINPS) o al telefono 803 164 (gratis da fisso).</p>
    ${p.url ? `<p><a href="${esc(p.url)}" target="_blank" rel="noopener">💻 La pagina della sede sul sito INPS</a></p>` : ''}
  </div>` : '');

// Fonti della schermata: le leggi + le pagine ufficiali su INPS e province.
function screenSources() {
  const items = [...rules.sources, ...inps.sources];
  return sourcesBox(items, {
    verified: rules.last_verified,
    note: state.province && prov() && !prov().pec_verified ? 'Gli indirizzi PEC dell\'INPS sono ancora da confermare con l\'ufficio.' : '',
  });
}
const regime = () => invRegime(prov(), state.certDate, rules.full_national_application);
const deadline = () => invDeadline(rules, {
  regime: regime(), category: state.category, certDate: state.certDate, domandaDate: state.domandaDate, today: todayISO(),
});
const restartBtn = (label = 'Ricomincia da capo') => `<button type="button" class="btn center" data-action="restart">🔄 ${esc(label)}</button>`;
const days = (n) => `${n} ${n === 1 ? 'giorno' : 'giorni'}`;

function progress(n) {
  const dots = Array.from({ length: 4 }, (_, i) => `<span class="dot${i < n ? ' on' : ''}"></span>`).join('');
  return `<p class="progress"><span aria-hidden="true">${dots}</span> Domanda ${n} di 4</p>`;
}

const patronato = `<div class="notice info">
  <p>🏢 <strong>Un patronato ti aiuta gratis.</strong> Per esempio INCA, ACLI o INAS. Segue la tua pratica e può sollecitare l'INPS per te.</p></div>`;

function inpsCalls() {
  const c = rules.inps_contacts;
  return `${callButton('Chiama l\'INPS da telefono fisso (gratis)', c.contact_center_fixed)}
    ${callButton('Chiama l\'INPS dal cellulare', c.contact_center_mobile)}`;
}

function regimeSteps(r) {
  if (r === 'new') {
    return `<ol class="big-steps">
        <li>Il medico manda il certificato all'INPS. <strong>Questa è già la domanda</strong>: non devi fare altro.</li>
        <li>L'INPS ti chiama per una visita. Puoi portare un tuo medico.</li>
        <li>Ricevi un foglio con il risultato.</li>
      </ol>`;
  }
  return `<ol class="big-steps">
      <li>Il medico manda il certificato all'INPS.</li>
      <li>Poi bisogna fare la <strong>domanda all'INPS entro ${rules.old_regime.domanda_window_days} giorni</strong>. Un patronato la fa gratis per te.</li>
      <li>L'${aslLabel()} ti chiama per la visita.</li>
      <li>Ricevi un foglio con il risultato.</li>
    </ol>`;
}

const afterVerbale = `
  <details class="card">
    <summary>Dopo la visita: a cosa può dare diritto</summary>
    <p>Dipende dal risultato. Per esempio: non pagare il ticket, i permessi della legge 104, l'indennità di accompagnamento,
    la pensione di invalidità, l'aiuto per trovare lavoro, il contrassegno per il parcheggio.</p>
    <p>Chiedi a un patronato o guarda il sito <a href="https://www.inps.it" target="_blank" rel="noopener">inps.it</a>.</p>
    <p>Se il foglio del risultato ha una scadenza, i tuoi aiuti continuano fino alla nuova visita (legge 114/2014).</p>
    <p>Se il verbale ti sembra sbagliato, hai <strong>6 mesi</strong> per il ricorso: <a href="../ricorso-invalidita/">controlla quanto tempo ti resta</a>.</p>
    <p class="muted">Noi non calcoliamo percentuali né importi.</p>
  </details>`;

const screens = {
  // Prima schermata: la risposta scritta che è già nella pagina (vedi index.html).
  // Così «Ricomincia» e il tasto Indietro riportano alla risposta, non a una presentazione.
  intro: () => ({ html: answerHtml }),

  province: () => ({
    html: `${progress(1)}
      <h1>📍 Dove abiti?</h1>
      <p>Scegli la tua provincia.</p>
      <div class="grid2">${inps.provinces.map((p) => choice('', p.name, { province: p.id }, 'certDate')).join('')}</div>`,
  }),

  certDate: () => ({
    html: `${progress(2)}
      <h1>📄 Che giorno il medico ha mandato il certificato?</h1>
      <p>È scritto sulla ricevuta che ti ha dato il medico.</p>
      <form id="cert-form" novalidate>
        <label for="certDate">Giorno del certificato</label>
        <input type="date" id="certDate" name="certDate" value="${esc(state.certDate || '')}" max="${todayISO()}" aria-describedby="cert-form-error">
        <p class="field-error" id="cert-form-error" role="alert" hidden></p>
        <button type="submit" class="btn primary big">Avanti ▶️</button>
      </form>`,
    mount() {
      document.getElementById('cert-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = readForm(e.target);
        if (parseDate(v.certDate) === null) return showError('cert-form', 'Scrivi il giorno.');
        if (daysBetween(v.certDate, todayISO()) < 0) return showError('cert-form', 'Questo giorno non è ancora arrivato. Controlla la data.');
        state.certDate = v.certDate;
        go('category');
      });
    },
  }),

  category: () => ({
    html: `${progress(3)}
      <h1>👤 Per chi è la domanda?</h1>
      <p>Ci serve solo per sapere quanto tempo ha l'INPS.</p>
      ${choice('🎗️', 'Per una persona con un tumore', { category: 'oncological' }, 'regime', 'Anche se è un bambino')}
      ${choice('🧒', 'Per un bambino o un ragazzo', { category: 'minor' }, 'regime', 'Meno di 18 anni')}
      ${choice('🧑', 'Per un adulto', { category: 'other' }, 'regime')}`,
  }),

  regime: () => {
    const r = regime();
    const p = prov();
    if (r === 'new') {
      return {
        html: `<h1>Nella provincia di ${esc(p.name)} funziona così</h1>
          ${regimeSteps('new')}
          <h2>Ti hanno già chiamato per la visita?</h2>
          ${choice('✅', 'Sì, ho il giorno della visita', { convocation: true }, 'checklist')}
          ${choice('❌', 'No, non ancora', { convocation: false }, 'result')}`,
      };
    }
    return {
      html: `<h1>Nella provincia di ${esc(p.name)} funziona così</h1>
        ${regimeSteps('old')}
        <h2>Hai già fatto la domanda all'INPS?</h2>
        <p>Anche se l'ha fatta il patronato per te.</p>
        <form id="dom-form" novalidate>
          <label for="domandaDate">Se sì, che giorno?<span class="hint">È scritto sulla ricevuta della domanda</span></label>
          <input type="date" id="domandaDate" name="domandaDate" value="${esc(state.domandaDate || '')}" max="${todayISO()}" aria-describedby="dom-form-error">
          <p class="field-error" id="dom-form-error" role="alert" hidden></p>
          <button type="submit" class="btn primary">✅ Sì, l'ho fatta</button>
        </form>
        <button type="button" class="btn" id="no-dom">❌ No, non ancora</button>`,
      mount() {
        document.getElementById('dom-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const v = readForm(e.target);
          if (parseDate(v.domandaDate) === null) return showError('dom-form', 'Scrivi il giorno della domanda.');
          if (daysBetween(v.domandaDate, todayISO()) < 0) return showError('dom-form', 'Questo giorno non è ancora arrivato. Controlla la data.');
          if (daysBetween(state.certDate, v.domandaDate) < 0) return showError('dom-form', 'La domanda non può essere prima del certificato. Controlla le date.');
          state.domandaDate = v.domandaDate;
          go('convocation');
        });
        document.getElementById('no-dom').addEventListener('click', () => { state.domandaDate = null; go('result'); });
      },
    };
  },

  convocation: () => ({
    html: `${progress(4)}
      <h1>Ti hanno già chiamato per la visita?</h1>
      ${choice('✅', 'Sì, ho il giorno della visita', { convocation: true }, 'checklist')}
      ${choice('❌', 'No, non ancora', { convocation: false }, 'result')}`,
  }),

  result: () => {
    const d = deadline();
    const p = prov();
    if (d.status === 'error') {
      return { html: `<h1>Controlla le date</h1><p>Le date non vanno bene insieme. Riprova.</p>${restartBtn()}` };
    }

    if (d.kind === 'domanda') {
      const body = d.lateDomanda
        ? `<div class="hero" aria-hidden="true">⏰</div>
           <h1>Il tempo per la domanda era finito</h1>
           <div class="notice bad"><p>Bisognava fare la domanda entro ${art('il', d.deadline)}<strong>${esc(formatIt(d.deadline))}</strong>. È stata fatta ${art('il', d.domandaDate)}${esc(formatIt(d.domandaDate))}, ${days(d.daysLate)} dopo.</p>
           <p><strong>Il certificato potrebbe non valere più: controlla con un patronato.</strong> Prima di sollecitare l'INPS, chiedi se serve un nuovo certificato del medico.</p></div>`
        : d.status === 'passed'
        ? `<div class="hero" aria-hidden="true">⏰</div>
           <h1>Il tempo per la domanda è finito</h1>
           <div class="notice bad"><p>Bisognava fare la domanda entro ${art('il', d.deadline)}<strong>${esc(formatIt(d.deadline))}</strong>.</p>
           <p>Di solito serve un nuovo certificato. Chiedi al tuo medico o a un patronato.</p></div>`
        : `<div class="hero" aria-hidden="true">📝</div>
           <h1>Prima devi fare la domanda</h1>
           <div class="notice warn"><p>Hai tempo ${art('fino al', d.deadline)}<strong>${esc(formatIt(d.deadline))}</strong>.</p>
           <p>Dopo quel giorno il certificato non vale più.</p></div>
           <p>Vai a un patronato: fa la domanda per te, gratis.</p>`;
      return { html: `${body}${patronato}${inpsCalls()}${disclaimer(rules.last_verified)}${restartBtn()}` };
    }

    // Procedura vecchia con tumore: la legge fissa la data della visita, non della chiamata.
    const visitDate = d.kind === 'visit' && state.category === 'oncological';
    const what = d.kind === 'conclusion' ? 'La visita e il risultato dovevano arrivare'
      : visitDate ? 'La visita doveva arrivare' : 'La chiamata per la visita doveva arrivare';
    const whatFuture = d.kind === 'conclusion' ? 'La visita e il risultato devono arrivare'
      : visitDate ? 'La visita deve arrivare' : 'La chiamata per la visita deve arrivare';
    const note = d.indicative ? '<p class="muted">Questa data è indicativa: per questo caso la legge non è precisa.</p>' : '';
    const legal = d.legal ? `<p class="muted">Regola: ${esc(d.legal)}.</p>` : '';

    if (d.status !== 'passed') {
      return {
        html: `<div class="hero" aria-hidden="true">✅</div>
          <h1>Non è ancora tardi</h1>
          <div class="notice ok"><p>${whatFuture} entro ${art('il', d.deadline)}<strong>${esc(formatIt(d.deadline))}</strong>.</p>
          <p>Se non arriva niente, torna qui quel giorno.</p></div>
          ${note}${legal}${patronato}${afterVerbale}${disclaimer(rules.last_verified)}${restartBtn()}`,
      };
    }

    return {
      html: `<div class="hero" aria-hidden="true">⚠️</div>
        <h1>È tardi! Puoi sollecitare l'INPS</h1>
        <div class="notice bad">
          <p>${what} entro ${art('il', d.deadline)}<strong>${esc(formatIt(d.deadline))}</strong>.</p>
          <p>${d.daysLate === 1 ? 'È passato' : 'Sono passati'} <strong>${days(d.daysLate)} in più</strong>.</p>
        </div>
        ${note}${legal}
        <h2>Cosa fare, in ordine</h2>
        <ol class="big-steps">
          <li><p><strong>Vai a un patronato.</strong> È gratis. Controlla la pratica e sollecita l'INPS per te.</p></li>
          <li><p><strong>Chiama l'INPS.</strong></p>${inpsCalls()}</li>
          <li><p><strong>Manda una lettera di sollecito all'INPS di ${esc(p.name)}.</strong> La scriviamo insieme.</p>
            <button type="button" class="btn primary" data-go="letter">✍️ Scriviamo il sollecito insieme</button></li>
        </ol>
        <p class="muted">Anche se il tempo è passato, la pratica resta valida. Il ritardo però ti dà il diritto di sollecitare.
        Stiamo verificando con un avvocato le conseguenze precise.</p>
        ${afterVerbale}
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
    };
  },

  letter: () => {
    const p = prov();
    const r = regime();
    // Per un minore scrive il genitore: firma come genitore, senza delega (artt. 316 e 320 c.c.).
    if (state.category === 'minor' && !person.delegateRole) person.delegateRole = 'genitore';
    return {
      html: `<h1>✍️ Scriviamo il sollecito insieme</h1>
        <p>Scrivi i dati qui sotto. Noi li mettiamo nella lettera per l'INPS di ${esc(p.name)}.</p>
        <div class="notice info">
          <p>🔒 I dati restano sul tuo telefono. Noi non li vediamo. Non scriviamo la malattia.</p>
          <p>Non sai qualcosa? Lascia vuoto. Dopo aver stampato, lo scrivi a penna.</p>
        </div>
        <form id="letter-form" novalidate>
          ${personFields(person, 'Chi deve fare la visita')}
          <fieldset>
            <legend>La pratica</legend>
            <label for="f-certNumber">Numero del certificato<span class="hint">È sulla ricevuta che ti ha dato il medico</span></label>
            <input id="f-certNumber" name="certNumber" type="text" value="${esc(state.certNumber || '')}">
            ${r === 'old' ? `<label for="f-domandaNumber">Numero della domanda<span class="hint">È sulla ricevuta della domanda</span></label>
            <input id="f-domandaNumber" name="domandaNumber" type="text" value="${esc(state.domandaNumber || '')}">` : ''}
          </fieldset>
        </form>
        <h2>📄 Ecco il tuo sollecito</h2>
        <p class="muted">La lettera usa le parole degli uffici. In breve dice: «Sono in ritardo, chiamatemi per la visita».</p>
        <div id="preview" class="letter"></div>
        <div class="btn-row three">
          <button type="button" class="btn center" id="pdf-btn">🖨️ Stampa o salva</button>
          <button type="button" class="btn center" id="copy-btn">📋 Copia</button>
          <a class="btn center" id="mail-btn" href="#">📧 Manda per email</a>
        </div>
        <p>📨 L'indirizzo dell'INPS è una PEC (una email speciale). <strong>Se non hai la PEC, porta la lettera a un patronato</strong>: la mandano loro.</p>
        ${noPecBox()}
        <div class="card">
          <h3 style="margin-top:0">Prima di mandarla</h3>
          <ul class="icon-list">
            <li><span class="ico" aria-hidden="true">🖊️</span> Firma la lettera</li>
            <li><span class="ico" aria-hidden="true">🪪</span> Allega: documento d'identità (fotocopia o foto)</li>
            <li><span class="ico" aria-hidden="true">📄</span> Allega: ricevuta del certificato</li>
            ${r === 'old' ? '<li><span class="ico" aria-hidden="true">🧾</span> Allega: ricevuta della domanda</li>' : ''}
            <li class="delegate-note"${person.isDelegate ? '' : ' hidden'}><span class="ico" aria-hidden="true">📝</span> <span class="delegate-note-text">${esc(delegateNoteText(person))}</span></li>
          </ul>
        </div>
        <p class="muted">Indirizzo PEC: ${mailLink(p.pec)}${p.pec_verified ? '' : ' (stiamo ancora controllando questo indirizzo)'} ·
        <a href="${esc(reportErrorHref(`INPS ${p.name}`))}">Segnala un errore</a></p>
        ${inpsSede(p)}
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
      mount() {
        const form = document.getElementById('letter-form');
        const update = () => {
          const v = readForm(form);
          state.certNumber = v.certNumber; state.domandaNumber = v.domandaNumber;
          delete v.certNumber; delete v.domandaNumber;
          Object.assign(person, v);
          syncDelegate(form, person);
          const text = inpsReminder({
            provinceName: p.name, inpsPec: p.pec, person, certNumber: state.certNumber, certDate: state.certDate,
            domandaDate: state.domandaDate, domandaNumber: state.domandaNumber, regime: r, category: state.category, deadlineInfo: deadline(), today: todayISO(),
          });
          state.letterText = text;
          document.getElementById('preview').textContent = text;
          document.getElementById('mail-btn').href = mailtoHref(p.pec,
            `Sollecito convocazione visita invalidità civile${person.fullName ? ` – ${person.fullName}` : ''}${state.certNumber ? ` – certificato n. ${state.certNumber}` : ''}`,
            `Buongiorno,\nin allegato il sollecito firmato, con i documenti.\n\nCordiali saluti\n${person.fullName || ''}`);
        };
        form.addEventListener('input', update);
        form.addEventListener('change', update);
        update();
        document.getElementById('copy-btn').addEventListener('click', (e) => copyText(state.letterText, e.currentTarget));
        document.getElementById('pdf-btn').addEventListener('click', () => printText(state.letterText));
      },
    };
  },

  checklist: () => {
    const r = regime();
    return {
      html: `<div class="hero" aria-hidden="true">🗂️</div>
        <h1>Cosa portare alla visita</h1>
        <ul class="icon-list">
          <li><span class="ico" aria-hidden="true">🪪</span> Carta d'identità</li>
          <li><span class="ico" aria-hidden="true">💳</span> Tessera sanitaria</li>
          <li><span class="ico" aria-hidden="true">📄</span> Ricevuta del certificato del medico</li>
          <li><span class="ico" aria-hidden="true">🗂️</span> Tutti i fogli medici: referti, esami, lettere dell'ospedale</li>
        </ul>
        ${r === 'new' ? `<div class="notice info">
          <p>📨 Puoi mandare altri fogli medici all'INPS fino a <strong>${rules.new_regime.extra_documents_days_before_visit} giorni prima</strong> della visita.</p>
          <p>👨‍⚕️ Alla visita puoi portare un tuo medico.</p></div>` : ''}
        ${patronato}
        ${afterVerbale}
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
    };
  },
};

// Prima della provincia, la regione (se ce n'è più di una). Link «Cambia regione» nelle schermate con dati regionali.
const regionLink = withRegion(screens);

(async function init() {
  renderFooter(ROOT);
  try {
    [rules, inps] = await Promise.all([loadJSON(`${ROOT}data/rules-invalidita.json`), loadRegional(ROOT, 'inps')]);
  } catch {
    avvisoErrore(); // la risposta scritta nella pagina resta, con l'avviso sopra
    return;
  }
  render();
})();
