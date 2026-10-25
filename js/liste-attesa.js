// Modulo 1 — liste d'attesa. Domande → risultato → lettera → "E adesso?".
// Prima la risposta: la pagina mostra subito la risposta scritta; il conto e la lettera partono dal pulsante.
// Le risposte restano solo in memoria (oggetti `state` e `person`) e si
// cancellano quando si chiude la pagina. Niente viene inviato.
// Testi: italiano semplice, frasi brevi, un'idea per frase.
import { checkWaiting, callbackDeadline, maxWaitDays, todayISO, formatIt, parseDate, daysBetween, addDays, art } from './engine.js';
import { tutelaLetter, tutelaReminder, mailtoHref, conZona, nomeZona } from './letters.js';
import { noPecBox,
  esc, loadJSON, loadRegional, disclaimer, renderFooter, avvisoErrore, copyText, printText, readForm, mailLink, callButton, aspCalls,
  personFields, reportErrorHref, generalContactInfo, choice, helpBox, sourcesBox, moreHelp, hideHeadingEmoji, enableStart, aslLabel, regione, regioneInfo, regioneLink, fontiNazionali, generalContact, syncDelegate, delegateNoteText,
} from './common.js';
import { RICETTA_SVG } from './ricetta-svg.js';
import { createNav, withRegion, regionAction, senzaUffici, progress as progressBar, moveToTop, showError, clearError, provinceChoice, zonaScreen, intestazioneAzienda } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
// La risposta scritta della pagina: è la prima schermata del percorso.
const answerHtml = app.innerHTML;

let rules;
let data;
const state = {};
const person = {};

// ---------- navigazione ----------

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

// ---------- aiuti ----------

// Fonti della schermata: le leggi + le pagine ufficiali dell'ASP scelta.
function screenSources() {
  const a = state.province ? asp() : null;
  const items = [];
  if (a) {
    if (a.info_url) items.push({ label: `${a.name} – pagina sul percorso di tutela`, url: a.info_url });
    if (a.form_url && a.form_url !== a.info_url) items.push({ label: `${a.name} – modulo ufficiale`, url: a.form_url });
    if (a.portal_url && a.portal_url !== a.info_url) items.push({ label: `${a.name} – portale per la richiesta`, url: a.portal_url });
    items.push(...a.sources);
  }
  items.push(...fontiNazionali(rules.sources));
  return sourcesBox(items, { verified: a ? a.last_verified : rules.last_verified });
}

// L'azienda della provincia scelta, con i campi della zona al posto dei suoi (js/letters.js).
const aziendaBase = () => data.asl.find((a) => a.id === state.province);
const asp = () => conZona(aziendaBase(), state.zona);
const limit = () => maxWaitDays(rules, state.cls, state.kind);

// Testo per la lettera (linguaggio degli uffici).
function classText() {
  if (state.cls === 'D') return `D (${state.kind === 'exam' ? 'esame diagnostico' : 'visita'})`;
  return state.cls;
}

const progress = (n) => progressBar(n, 6);

function restartBtn(label = 'Ricomincia da capo') {
  return `<button type="button" class="btn center" data-action="restart">🔄 ${esc(label)}</button>`;
}

const days = (n) => `${n} ${n === 1 ? 'giorno' : 'giorni'}`;

const warnings = () => `
  <div class="card">
    <h2 style="margin-top:0">❗ Importante</h2>
    <ul class="icon-list">
      <li><span class="ico" aria-hidden="true">💶</span> Non andare dal privato a pagamento da solo: di solito i soldi non te li ridanno. Alcune aziende sanitarie rimborsano, ma solo se te lo scrivono prima.</li>
      <li><span class="ico" aria-hidden="true">🧾</span> Conserva il foglio della prenotazione.</li>
      <li><span class="ico" aria-hidden="true">📅</span> Non perdere l'appuntamento che hai già. Se non ci vai, disdicilo: altrimenti potresti pagare il ticket.</li>
    </ul>
  </div>`;

// Ciò che chiede l'ASP, in 3 passi semplici + dettagli nascosti.
function aspSteps(a) {
  const ft = a.fast_track && a.fast_track.by_class[state.cls];
  const docs = a.documents_required.map((d) => `<li><span class="ico" aria-hidden="true">${docIcon(d)}</span> ${esc(d)}</li>`).join('');

  let sendBtn;
  if (a.letter_mode === 'portal') {
    // portal_label: di chi è il portale, se non è il sito dell'azienda (Lazio: «sito della Regione (Salute Lazio)»).
    sendBtn = `<a class="btn primary" href="${esc(a.portal_url)}" target="_blank" rel="noopener">💻 Vai al ${esc(a.portal_label || `sito dell'${aslLabel()}`)}</a>`;
  } else if (a.letter_mode === 'official_form') {
    sendBtn = '<button type="button" class="btn primary" data-go="letter">✍️ Ti aiutiamo a compilare il modulo</button>';
  } else {
    sendBtn = '<button type="button" class="btn primary" data-go="letter">✍️ Scriviamo la lettera insieme</button>';
  }
  const phones = aspCalls(a);

  const contacts = [];
  for (const e of a.emails) contacts.push(`<li>Email: ${mailLink(e)}</li>`);
  if (a.pec) contacts.push(`<li>PEC: ${mailLink(a.pec)}</li>`);
  if (a.form_url) contacts.push(`<li><a href="${esc(a.form_url)}" target="_blank" rel="noopener">Modulo o pagina ufficiale dell'${aslLabel()}</a></li>`);
  if (a.info_url && a.info_url !== a.form_url) contacts.push(`<li><a href="${esc(a.info_url)}" target="_blank" rel="noopener">Pagina ufficiale dell'${aslLabel()}</a></li>`);

  return `
  ${ft ? `<div class="notice info">
      <h2 style="margin-top:0">🚀 Prima prova questo</h2>
      <p>${esc(ft.text)}</p>
      ${ft.phone ? callButton('Chiama', ft.phone) : ''}
      <p>Se non funziona, segui i passi qui sotto.</p>
    </div>` : ''}
  <h2>Cosa fare: 3 passi</h2>
  <ol class="big-steps">
    <li>
      <h3>Prepara questi fogli</h3>
      <ul class="icon-list">${docs}</ul>
    </li>
    <li>
      <h3>Fai la richiesta all'${aslLabel()} di ${esc(a.province)}</h3>
      <p>${esc(a.how_to)}</p>
      ${a.notes.map((n) => `<p class="notice warn">${esc(n)}</p>`).join('')}
      ${sendBtn}
      ${phones}
    </li>
    <li>
      <h3>Aspetta la risposta</h3>
      <ul class="clean">
        ${a.what_next.map((w) => `<li>${esc(w)}</li>`).join('')}
        <li>Se non c'è posto, fai la visita in ospedale pagando solo il ticket.</li>
      </ul>
      ${a.letter_mode === 'portal' ? '<button type="button" class="btn" data-go="after">⏳ Ho fatto la richiesta: e adesso?</button>' : ''}
    </li>
  </ol>
  <details class="card">
    <summary>Per saperne di più su ${esc(a.name)}</summary>
    ${a.sub_areas ? `<p>L'${aslLabel()} divide la provincia in ${a.sub_areas.length} zone: ${a.sub_areas.map((z) => esc(nomeZona(z))).join('; ')}.</p>` : ''}
    ${a.details.length ? `<ul class="clean">${a.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
    ${contacts.length ? `<ul class="clean">${contacts.join('')}</ul>` : ''}
    <p>La regola dice che la visita va fatta in tempo in strutture pubbliche o convenzionate.
    Se non c'è posto, si fa in ospedale «in intramoenia» pagando solo il ticket
    (Piano nazionale liste d'attesa 2026-2028; D.Lgs. 124/1998, art. 3).</p>
    <p class="muted">Controllato ${art('il', a.last_verified)}${esc(formatIt(a.last_verified))}.
      ${a.sources.map((s) => (s.url ? `Fonte: <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label || new URL(s.url).hostname.replace(/^www\./, ''))}</a>` : `Fonte: ${esc(s.label)}`)).join(' · ')}
      · <a href="${esc(reportErrorHref(a.name))}">Segnala un errore</a></p>
  </details>`;
}

function docIcon(d) {
  if (/identit/i.test(d)) return '🪪';
  if (/ricetta/i.test(d)) return '📄';
  if (/prenotazione/i.test(d)) return '🧾';
  if (/lettera/i.test(d)) return '✍️';
  return '📎';
}

// ---------- schermate ----------

const screens = {
  // Prima schermata: la risposta scritta che è già nella pagina (vedi index.html).
  // Così «Ricomincia» e il tasto Indietro riportano alla risposta, non a una presentazione.
  intro: () => ({ html: answerHtml }),

  // «In quale zona?»: solo se l'azienda della provincia ha zone con una lettera diversa (js/letters.js).
  zona: () => zonaScreen(aziendaBase(), 'access'),

  province: () => ({
    html: `${progress(1)}
      <h1>📍 Dove abiti?</h1>
      <p>Scegli la tua provincia.</p>
      <div class="grid2">
      ${[...data.asl].sort((a, b) => a.province.localeCompare(b.province)).map((a) => provinceChoice(a, 'access')).join('')}
      </div>`,
  }),

  access: () => ({
    html: `${progress(2)}
      <h1>🩺 È la prima volta per questo problema?</h1>
      <p>Per esempio: la prima visita dal cardiologo, o il primo esame.</p>
      ${choice('✅', 'Sì, è la prima volta', { access: 'first' }, 'cls')}
      ${choice('🔁', 'No, è un controllo', { access: 'followup' }, 'followup', 'Ci sei già stato e devi tornare')}
      ${choice('🤷', 'Non lo so', {}, 'accessUnknown')}`,
  }),

  accessUnknown: () => ({
    html: `
      <h1>🤷 Come faccio a saperlo?</h1>
      <p>Guarda la ricetta. A volte c'è scritto «primo accesso».</p>
      <p>Se non lo trovi, chiedi al medico che ha scritto la ricetta.</p>
      ${choice('✅', 'È la prima volta', { access: 'first' }, 'cls')}
      ${choice('🔁', 'È un controllo', { access: 'followup' }, 'followup')}`,
  }),

  followup: () => ({
    html: `
      <div class="hero" aria-hidden="true">🔁</div>
      <h1>Per i controlli questa regola non vale</h1>
      <p>La legge vale solo per la prima visita o il primo esame.</p>
      <p><strong>Cosa puoi fare:</strong> chiedi al dottore che ti segue di prenotarti lui il controllo.</p>
      ${restartBtn()}`,
  }),

  cls: () => ({
    html: `${progress(3)}
      <h1>📄 Che lettera c'è sulla ricetta?</h1>
      <p>Cerca la casella «Priorità». C'è una lettera: U, B, D oppure P.</p>
      <p class="muted">Nel disegno è nel riquadro giallo.</p>
      ${RICETTA_SVG}
      ${choice('<b class="letter-ico">U</b>', 'Lettera U', { cls: 'U', kind: null }, 'cup', `Urgente: entro ${days(rules.max_wait_days.U)}`)}
      ${choice('<b class="letter-ico">B</b>', 'Lettera B', { cls: 'B', kind: null }, 'cup', `Entro ${days(rules.max_wait_days.B)}`)}
      ${choice('<b class="letter-ico">D</b>', 'Lettera D', { cls: 'D' }, 'kind', `Entro ${days(rules.max_wait_days.D_visit)} (visite) o ${days(rules.max_wait_days.D_exam)} (esami)`)}
      ${choice('<b class="letter-ico">P</b>', 'Lettera P', { cls: 'P', kind: null }, 'cup', `Entro ${days(rules.max_wait_days.P)}`)}
      ${choice('🤷', 'Non c\'è nessuna lettera, o non la trovo', { cls: null }, 'noClass')}`,
  }),

  noClass: () => ({
    html: `
      <div class="hero" aria-hidden="true">📄</div>
      <h1>Senza la lettera non possiamo calcolare</h1>
      <p>La lettera dice entro quanto tempo devi fare la visita.</p>
      <p><strong>Cosa puoi fare:</strong> chiedi al medico che ha scritto la ricetta di aggiungere la lettera.</p>
      ${restartBtn()}`,
  }),

  kind: () => ({
    html: `${progress(4)}
      <h1>È una visita o un esame?</h1>
      ${choice('👨‍⚕️', 'Una visita', { kind: 'visit' }, 'cup', 'Il dottore ti visita e ti parla. Per esempio dal cardiologo o dall\'oculista')}
      ${choice('🔬', 'Un esame', { kind: 'exam' }, 'cup', 'Per esempio ecografia, radiografia, TAC, risonanza')}`,
  }),

  cup: () => ({
    html: `${progress(5)}
      <h1>☎️ Cosa ti ha detto il CUP?</h1>
      <p>Il CUP è l'ufficio dove si prenotano visite ed esami.</p>
      ${choice('📅', 'Mi ha dato una data', { cup: 'date' }, 'accepted')}
      ${choice('🚫', 'Non mi ha dato nessuna data', { cup: 'none' }, 'resultC', 'Mi ha detto di richiamare, o che non c\'è posto')}`,
  }),

  accepted: () => ({
    html: `${progress(6)}
      <h1>Hai preso la prima data che ti hanno offerto?</h1>
      ${choice('✅', 'Sì', { accepted: true }, 'dates')}
      ${choice('❌', 'No, ne ho scelta un\'altra', { accepted: false }, 'refused', 'Per esempio per andare in un altro ospedale')}`,
  }),

  refused: () => ({
    html: `
      <div class="hero" aria-hidden="true">❌</div>
      <h1>Così la legge non ti aiuta</h1>
      <p>Se non prendi la prima data offerta, perdi questo diritto.</p>
      <p><strong>Cosa puoi fare:</strong> prenota di nuovo e prendi la prima data. Se è ancora troppo lontana, torna qui.</p>
      <p>Tieni l'appuntamento che hai finché non ne hai uno nuovo; poi disdici quello vecchio, altrimenti potresti pagare il ticket.</p>
      ${restartBtn()}`,
  }),

  dates: () => ({
    html: `
      <h1>🧾 Guarda il foglio della prenotazione</h1>
      <p>Ci servono due date.</p>
      <form id="dates-form" novalidate>
        <label for="bookingDate">1. Che giorno hai prenotato?<span class="hint">Il giorno in cui hai chiamato o sei andato al CUP</span></label>
        <input type="date" id="bookingDate" name="bookingDate" required value="${esc(state.bookingDate || '')}" max="${todayISO()}" aria-describedby="dates-form-error">
        <label for="appointmentDate">2. Che giorno è l'appuntamento?</label>
        <input type="date" id="appointmentDate" name="appointmentDate" required value="${esc(state.appointmentDate || '')}" aria-describedby="dates-form-error">
        <p class="field-error" id="dates-form-error" role="alert" hidden></p>
        <button type="submit" class="btn primary big">✔️ Controlla</button>
      </form>`,
    mount() {
      const form = document.getElementById('dates-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = readForm(form);
        if (parseDate(v.bookingDate) !== null && daysBetween(v.bookingDate, todayISO()) < 0) {
          return showError('dates-form', 'Il giorno della prenotazione non può essere nel futuro. Controlla la data.', { field: 'bookingDate' });
        }
        const r = checkWaiting(rules, { cls: state.cls, kind: state.kind, bookingDate: v.bookingDate, appointmentDate: v.appointmentDate });
        if (r.status === 'error') {
          return r.error === 'order'
            ? showError('dates-form', 'L\'appuntamento non può essere prima del giorno della prenotazione. Controlla le date.', { field: 'appointmentDate' })
            : showError('dates-form', 'Scrivi tutte e due le date.');
        }
        Object.assign(state, v, { result: r });
        go(r.status === 'exceeded' ? 'resultB' : 'resultA');
      });
    },
  }),

  resultA: () => {
    const r = state.result;
    return {
      html: `
        <div class="hero" aria-hidden="true">✅</div>
        <h1>Va tutto bene</h1>
        <div class="notice ok">
          <p>La tua data rispetta la legge.</p>
          <p>Il limite era ${art('il', r.deadline)}<strong>${esc(formatIt(r.deadline))}</strong>.
          Il tuo appuntamento è ${art('il', state.appointmentDate)}<strong>${esc(formatIt(state.appointmentDate))}</strong>.</p>
        </div>
        <p>Tieni il foglio della prenotazione. Se ti spostano l'appuntamento più avanti, torna qui.</p>
        <p>Un consiglio: quando hai una ricetta, prenota subito.</p>
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
    };
  },

  resultB: () => {
    const r = state.result;
    const a = asp();
    return {
      html: `
        <div class="hero" aria-hidden="true">⚠️</div>
        <h1>La data è troppo lontana. Hai diritto a fare prima!</h1>
        <div class="notice bad">
          <p>La visita andava fatta entro ${art('il', r.deadline)}<strong>${esc(formatIt(r.deadline))}</strong>.</p>
          <p>Il tuo appuntamento è ${art('il', state.appointmentDate)}<strong>${esc(formatIt(state.appointmentDate))}</strong>:
          <strong>${days(r.excess)} di troppo</strong>.</p>
        </div>
        <p>Puoi chiedere all'${aslLabel()} di farti fare la visita prima. Se serve, la fai in ospedale pagando solo il ticket.</p>
        ${senzaUffici(a, () => aspSteps(a))}
        ${warnings()}
        ${disclaimer((a || rules).last_verified)}`,
    };
  },

  resultC: () => {
    const a = asp();
    if (state.cls === 'U') {
      return {
        html: `
          <div class="hero" aria-hidden="true">🚨</div>
          <h1>Lettera U: è urgente</h1>
          <p>La visita va fatta entro ${days(rules.max_wait_days.U)}. Non aspettare.</p>
          ${senzaUffici(a, () => aspSteps(a))}
          <div class="notice urgent"><p>Se stai male, chiama il tuo medico. Se è grave, chiama il <a href="tel:112">112</a>.</p></div>
          ${disclaimer((a || rules).last_verified)}
          ${restartBtn()}`,
      };
    }
    const cb = callbackDeadline(rules, { cls: state.cls, kind: state.kind, requestDate: state.requestDate, today: todayISO() });
    let status = '';
    if (cb.status === 'waiting') {
      status = `<div class="notice info"><p>📞 L'${aslLabel()} deve richiamarti entro ${art('il', cb.deadline)}<strong>${esc(formatIt(cb.deadline))}</strong>.</p>
        <p>Se non ti chiamano, torna qui quel giorno.</p></div>`;
    } else if (cb.status === 'passed') {
      status = `<div class="notice bad"><p>⚠️ Dovevano richiamarti entro ${art('il', cb.deadline)}<strong>${esc(formatIt(cb.deadline))}</strong>. Non l'hanno fatto.</p>
        <p>Ora puoi chiedere all'${aslLabel()} di farti fare la visita in tempo.</p></div>
        ${senzaUffici(a, () => aspSteps(a))}
        ${warnings()}`;
    }
    return {
      html: `
        <div class="hero" aria-hidden="true">🚫</div>
        <h1>Il CUP non ti ha dato una data</h1>
        <p>In questo caso l'${aslLabel()} deve metterti in una lista e <strong>richiamarti entro ${days(cb.days)}</strong>.</p>
        <div class="notice warn"><p>Chiedi al CUP un foglio con il giorno della tua richiesta e il numero della ricetta. Conservalo.</p></div>
        <form id="req-form" novalidate>
          <label for="requestDate">Che giorno hai chiesto la prenotazione al CUP?</label>
          <input type="date" id="requestDate" name="requestDate" value="${esc(state.requestDate || '')}" max="${todayISO()}" aria-describedby="req-form-error">
          <p class="field-error" id="req-form-error" role="alert" hidden></p>
          <button type="submit" class="btn primary">✔️ Calcola</button>
        </form>
        ${status}
        ${disclaimer(rules.last_verified)}`,
      mount() {
        document.getElementById('req-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const v = readForm(e.target);
          if (parseDate(v.requestDate) === null) return showError('req-form', 'Scrivi il giorno.');
          if (daysBetween(v.requestDate, todayISO()) < 0) return showError('req-form', 'Questo giorno non è ancora arrivato. Controlla la data.');
          state.requestDate = v.requestDate;
          render();
        });
      },
    };
  },

  letter: () => {
    const a = asp();
    const official = a.letter_mode === 'official_form';
    return {
      html: `
        <h1>✍️ ${official ? 'Compiliamo il modulo insieme' : 'Scriviamo la lettera insieme'}</h1>
        <p>Scrivi i dati qui sotto. ${official ? 'Ti diciamo cosa scrivere in ogni riga del modulo.' : 'Noi li mettiamo nella lettera.'}</p>
        <div class="notice info">
          <p>🔒 I dati restano sul tuo telefono. Noi non li vediamo.</p>
          <p>Non sai qualcosa? Lascia vuoto. ${official ? 'Lo scrivi a penna sul modulo.' : 'Dopo aver stampato, lo scrivi a penna.'}</p>
        </div>
        ${official ? `<a class="btn" href="${esc(a.form_url)}" target="_blank" rel="noopener">📥 Scarica il modulo dell'${aslLabel()}</a>` : ''}
        <form id="letter-form" novalidate>
          ${personFields(person, 'Chi deve fare la visita')}
          <fieldset>
            <legend>La ricetta</legend>
            <label for="f-service">Cosa c'è scritto sulla ricetta?<span class="hint">Per esempio «Visita cardiologica»</span></label>
            <input id="f-service" name="service" type="text" value="${esc(state.service || '')}">
            <label for="f-nre">Numero della ricetta<span class="hint">${regione() === 'sicilia' ? 'Il codice lungo in alto, che inizia con 190…' : 'Il codice lungo in alto (NRE)'}</span></label>
            <input id="f-nre" name="nre" type="text" value="${esc(state.nre || '')}" autocapitalize="characters">
            <label for="f-prescriptionDate">Data della ricetta<span class="hint">Se la trovi sulla ricetta</span></label>
            <input id="f-prescriptionDate" name="prescriptionDate" type="date" value="${esc(state.prescriptionDate || '')}" max="${todayISO()}">
          </fieldset>
        </form>
        <h2>${official ? '📝 Cosa scrivere nel modulo' : '📄 Ecco la tua lettera'}</h2>
        ${official ? '' : '<p class="muted">La lettera usa le parole degli uffici. In breve dice: «Chiedo di fare la visita entro i tempi di legge».</p>'}
        <div id="preview"></div>
        <div class="btn-row three">
          ${official ? '<button type="button" class="btn center" id="pdf-btn" data-action="print-letter">🖨️ Stampa questi dati</button>' : '<button type="button" class="btn center" id="pdf-btn">🖨️ Stampa o salva</button><button type="button" class="btn center" id="copy-btn">📋 Copia</button>'}
          <a class="btn center${official ? ' primary' : ''}" id="mail-btn" href="#">📧 Manda per email</a>
        </div>
        <p id="send-hint"></p>
        ${noPecBox()}
        <div class="card">
          <h3 style="margin-top:0">Prima di mandarla</h3>
          <ul class="icon-list">
            <li><span class="ico" aria-hidden="true">🖊️</span> Firma ${official ? 'il modulo' : 'la lettera'}</li>
            ${a.documents_required.filter((d) => !/lettera/i.test(d)).map((d) => `<li><span class="ico" aria-hidden="true">${docIcon(d)}</span> Allega: ${esc(d)}</li>`).join('')}
            <li class="delegate-note"${person.isDelegate ? '' : ' hidden'}><span class="ico" aria-hidden="true">📝</span> <span class="delegate-note-text">${esc(delegateNoteText(person))}</span></li>
          </ul>
        </div>
        <button type="button" class="btn primary" data-go="after">⏳ Fatto! E adesso?</button>
        ${disclaimer(a.last_verified)}`,
      mount() {
        const form = document.getElementById('letter-form');
        const update = () => {
          const v = readForm(form);
          state.service = v.service; state.nre = v.nre;
          state.prescriptionDate = parseDate(v.prescriptionDate) !== null && daysBetween(v.prescriptionDate, todayISO()) >= 0 ? v.prescriptionDate : '';
          delete v.service; delete v.nre; delete v.prescriptionDate;
          Object.assign(person, v);
          syncDelegate(form, person);
          updateLetter(a, official);
        };
        form.addEventListener('input', update);
        form.addEventListener('change', update);
        update();
        const copyBtn = document.getElementById('copy-btn');
        const pdfBtn = document.getElementById('pdf-btn');
        if (copyBtn) copyBtn.addEventListener('click', (e) => copyText(state.letterText, e.currentTarget));
        // Col modulo ufficiale il pulsante stampa solo la tabella «Cosa scrivere nel modulo» (data-action, js/common.js).
        if (pdfBtn && !official) pdfBtn.addEventListener('click', () => printText(state.letterText));
      },
    };
  },

  after: () => {
    const a = asp();
    const today = todayISO();
    if (!state.firstRequestDate) state.firstRequestDate = today;
    // Con la classe U non si aspetta il sollecito; con la B si sollecita dopo i giorni del richiamo (5), perché i
    // 10 giorni della classe partono dalla prenotazione, che viene prima della richiesta di tutela (revisione del 25/10/2026).
    const urgent = state.cls === 'U';
    const remindAfter = state.cls === 'B' ? Math.min(rules.reminder_after_days, rules.callback_days.B) : rules.reminder_after_days;
    const remindTitle = () => {
      if (urgent) return `Se entro ${days(rules.max_wait_days.U - 1)} nessuno ti chiama, telefona subito all'${aslLabel()} e al tuo medico`;
      const on = addDays(state.firstRequestDate, remindAfter);
      return `Se nessuno ti risponde entro ${art('il', on)}${formatIt(on)}`;
    };
    const { addr: urp, kind: urpKind } = generalContactInfo(a);
    return {
      html: `
        <div class="hero" aria-hidden="true">⏳</div>
        <h1>E adesso?</h1>
        <ul class="icon-list">
          <li><span class="ico" aria-hidden="true">📞</span> Aspetta la risposta dell'${aslLabel()}. Tieni il telefono acceso: possono chiamarti da un numero che non conosci.</li>
          ${a.what_next.map((w) => `<li><span class="ico" aria-hidden="true">👉</span> ${esc(w)}</li>`).join('')}
          <li><span class="ico" aria-hidden="true">🗂️</span> Conserva una copia di tutto quello che hai mandato.</li>
        </ul>
        <h2 id="remind-title">${esc(remindTitle())}</h2>
        <ol class="big-steps">
          <li><strong>Manda un sollecito</strong>: una seconda lettera per ricordarlo all'${aslLabel()}. La trovi qui sotto, già pronta.</li>
          <li><strong>Fai un reclamo</strong> ${urpKind === 'pec' ? `alla PEC dell'${aslLabel()} (${mailLink(urp)})` : `all'ufficio URP della tua ${aslLabel()}${urp ? ` (${urpKind === 'email' ? `email dell'${aslLabel()}: ` : ''}${mailLink(urp)})` : ''}`}.</li>
          <li><strong>Chiedi aiuto a un'associazione</strong> di pazienti: Cittadinanzattiva
            (<a href="https://www.cittadinanzattiva.it" target="_blank" rel="noopener">cittadinanzattiva.it</a>) oppure
            Associazione Luca Coscioni (<a href="https://www.associazionelucacoscioni.it" target="_blank" rel="noopener">associazionelucacoscioni.it</a>).</li>
          <li>${regioneLink('assessorato') || regione() === 'sicilia' ? `<strong>Scrivi alla ${esc(regioneInfo().ente || 'tua Regione')}</strong>, ufficio URP dell'Assessorato della Salute${regioneLink('assessorato') ? `
            (<a href="${esc(regioneLink('assessorato'))}" target="_blank" rel="noopener">${esc(new URL(regioneLink('assessorato')).hostname.replace(/^www\./, ''))}</a>)` : ''}.` : '<strong>Scrivi alla tua Regione</strong> (guarda il sito della Regione per l\'ufficio giusto).'}</li>
        </ol>
        <div class="notice warn"><p>💶 <strong>Non andare dal privato a pagamento da solo</strong>: di solito i soldi non te li ridanno. Alcune aziende sanitarie rimborsano, ma solo se te lo scrivono prima.</p></div>
        <div class="card">
          <h2 style="margin-top:0">📄 Il sollecito, già pronto</h2>
          <form id="rem-form" novalidate>
            <label for="firstRequestDate">Che giorno hai mandato la prima richiesta?</label>
            <input type="date" id="firstRequestDate" name="firstRequestDate" value="${esc(state.firstRequestDate)}" max="${today}" aria-describedby="rem-form-error">
            <p class="field-error" id="rem-form-error" role="alert" hidden></p>
            <label for="f-reqProtocol">Numero di protocollo della richiesta<span class="hint">Se te l'hanno dato</span></label>
            <input id="f-reqProtocol" name="reqProtocol" type="text" value="${esc(state.reqProtocol || '')}">
          </form>
          <div id="reminder" class="letter"></div>
          <div class="btn-row three">
            <button type="button" class="btn center" id="rpdf-btn">🖨️ Stampa o salva</button>
            <button type="button" class="btn center" id="rcopy-btn">📋 Copia</button>
            <a class="btn center" id="rmail-btn" href="#">📧 Manda per email</a>
          </div>
          <p class="muted">Usa i dati che hai scritto prima. Se mancano, lascia vuoto e scrivi a penna.</p>
          ${noPecBox()}
        </div>
        ${disclaimer(a.last_verified)}
        ${restartBtn('Fai un altro controllo')}`,
      mount() {
        const update = () => {
          const v = readForm(document.getElementById('rem-form'));
          const ok = parseDate(v.firstRequestDate) !== null && daysBetween(v.firstRequestDate, today) >= 0;
          if (ok) state.firstRequestDate = v.firstRequestDate;
          state.reqProtocol = v.reqProtocol;
          if (ok) clearError('rem-form');
          else showError('rem-form', `Scrivi una data giusta, non dopo oggi. Per ora usiamo ${art('il', state.firstRequestDate)}${formatIt(state.firstRequestDate)}.`, { field: 'firstRequestDate', focus: false });
          document.getElementById('remind-title').textContent = remindTitle();
          const text = tutelaReminder({
            intestazione: intestazioneAzienda(a),
            aspName: a.province, aspAddress: a.send_to || a.pec || '', person, service: state.service, nre: state.nre,
            cls: classText(), firstRequestDate: state.firstRequestDate, protocol: state.reqProtocol, today,
          });
          state.reminderText = text;
          document.getElementById('reminder').textContent = text;
          document.getElementById('rmail-btn').hidden = !(a.send_to || a.pec);
          document.getElementById('rmail-btn').href = mailtoHref(a.send_to || a.pec || '',
            `SOLLECITO – Richiesta percorso di tutela${person.fullName ? ` – ${person.fullName}` : ''}`,
            `Buongiorno,\nin allegato il sollecito firmato.\n\nCordiali saluti\n${person.fullName || ''}`);
        };
        document.getElementById('rem-form').addEventListener('change', update);
        document.getElementById('f-reqProtocol').addEventListener('input', update);
        document.getElementById('rem-form').addEventListener('submit', (e) => { e.preventDefault(); update(); });
        update();
        document.getElementById('rcopy-btn').addEventListener('click', (e) => copyText(state.reminderText, e.currentTarget));
        document.getElementById('rpdf-btn').addEventListener('click', () => printText(state.reminderText));
      },
    };
  },
};

// Prima della provincia, la regione (se ce n'è più di una). Link «Cambia regione» nelle schermate con dati regionali.
// Le classi U, B, D, P e i loro giorni valgono in tutta Italia: senza i dati della regione si salta la provincia (vedi js/flow.js).
const regionLink = withRegion(screens, 'province', 'access');

function updateLetter(a, official) {
  const today = todayISO();
  const preview = document.getElementById('preview');
  const subject = `Richiesta attivazione percorso di tutela${person.fullName ? ` – ${person.fullName}` : ''}${state.nre ? ` – ricetta ${state.nre}` : ''}`;
  const mail = document.getElementById('mail-btn');
  const hint = document.getElementById('send-hint');
  const signoff = `\n\nCordiali saluti\n${person.fullName || ''}${person.phone ? `\nTel. ${person.phone}` : ''}`;

  if (official) {
    const values = {
      ...person,
      serviceAndNre: [state.service, state.nre && `ricetta n. ${state.nre}`].filter(Boolean).join(' – '),
      today: formatIt(today),
    };
    preview.innerHTML = `<table class="fields"><caption class="sr-only">Cosa scrivere nel modulo dell'${esc(aslLabel())} di ${esc(a.province)}</caption><tbody>${a.form_fields.map((f) => `
      <tr><th scope="row">${esc(f.label)}</th><td>${esc(f.fixed || values[f.source] || '—')}</td></tr>`).join('')}</tbody></table>`;
    state.letterText = '';
    mail.href = mailtoHref(a.send_to, subject,
      `Buongiorno,\nin allegato il modulo di richiesta del percorso di tutela, compilato e firmato, con i documenti.${signoff}`);
    hint.innerHTML = a.channel === 'pec' || /@pec\./.test(a.send_to || '')
      ? `📨 L'indirizzo dell'${aslLabel()} è una PEC (una email speciale). <strong>Se non hai la PEC, stampa il modulo compilato e portalo all'ufficio URP.</strong>`
      : `📧 L'email si apre già con l'indirizzo giusto (${esc(a.send_to)}). Aggiungi il modulo firmato e le foto dei documenti.`;
    return;
  }

  const noDate = state.cup === 'none';
  const cb = noDate ? callbackDeadline(rules, { cls: state.cls, kind: state.kind, requestDate: state.requestDate, today }) : null;
  const text = tutelaLetter({
    intestazione: intestazioneAzienda(a),
    aspName: a.province,
    aspAddress: a.send_to || a.pec || '',
    person, service: state.service, nre: state.nre, cls: classText(), maxDays: limit(),
    bookingDate: state.bookingDate, appointmentDate: state.appointmentDate,
    noDateOffered: noDate, requestDate: state.requestDate, prescriptionDate: state.prescriptionDate,
    deadline: !noDate && state.result ? state.result.deadline : null,
    callbackDays: cb && cb.days, callbackDeadline: cb && cb.deadline, today,
  });
  state.letterText = text;
  preview.innerHTML = `<div class="letter">${esc(text)}</div>`;
  const to = a.send_to || '';
  mail.href = mailtoHref(to, subject, `Buongiorno,\nin allegato la richiesta di attivazione del percorso di tutela, firmata, con i documenti.${signoff}`);
  const howToEmail = (a.how_to || '').match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/);
  if (!to && howToEmail) {
    hint.innerHTML = `📧 Puoi scrivere all'indirizzo indicato sopra; per sicurezza stampa la lettera e portala anche all'ufficio URP, facendoti dare una ricevuta.`;
  } else if (!to) {
    hint.innerHTML = `🏥 <strong>Stampa la lettera e portala all'ufficio URP</strong> o al CUP, facendoti dare una ricevuta.`;
  } else if (a.channel === 'pec' || /@pec\./.test(to)) {
    hint.innerHTML = `📨 L'indirizzo dell'${aslLabel()} è una PEC (una email speciale). <strong>Se non hai la PEC, stampa la lettera e portala all'ufficio URP.</strong>`;
  } else {
    hint.innerHTML = `📧 L'email si apre già con l'indirizzo giusto (${esc(to)}). Aggiungi la lettera firmata e le foto dei documenti.
      Se non sai usare l'email, stampa la lettera e portala all'ufficio URP.`;
  }
}

// ---------- avvio ----------

(async function init() {
  renderFooter(ROOT);
  try {
    [rules, data] = await Promise.all([loadJSON(`${ROOT}data/rules.json`), loadRegional(ROOT, 'asl')]);
  } catch {
    avvisoErrore(); // la risposta scritta nella pagina resta, con l'avviso sopra
    return;
  }
  render();
})();
