// Modulo 1 — liste d'attesa. Domande → risultato → lettera → "E adesso?".
// Prima la risposta: la pagina mostra subito la risposta scritta; il conto e la lettera partono dal pulsante.
// Le risposte restano solo in memoria (oggetti `state` e `person`) e si
// cancellano quando si chiude la pagina. Niente viene inviato.
// Testi: italiano semplice, frasi brevi, un'idea per frase.
import { checkWaiting, callbackDeadline, maxWaitDays, todayISO, formatIt, parseDate, daysBetween, addDays, art } from './engine.js';
import { tutelaLetter, tutelaReminder, mailtoHref } from './letters.js';
import { noPecBox,
  esc, loadJSON, loadRegional, disclaimer, renderFooter, copyText, printText, readForm, mailLink, callButton, aspCalls,
  personFields, reportErrorHref, generalContact, choice, helpBox, sourcesBox, moreHelp, hideHeadingEmoji, enableStart, aslLabel, aslIntestazione, regioneInfo, regioneLink,
} from './common.js';
import { RICETTA_SVG } from './ricetta-svg.js';
import { createNav, withRegion, regionAction } from './flow.js';

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

function paint(current) {
  const s = screens[current]();
  const backBtn = current === 'intro' ? '' : '<div class="topbar"><button type="button" class="back" data-action="back">← Torna indietro</button></div>';
  app.innerHTML = `${backBtn}${s.html}${regionLink(current, state)}${moreHelp()}${helpBox()}${screenSources()}`;
  enableStart(app);
  hideHeadingEmoji(app);
  if (s.mount) s.mount();
  window.scrollTo(0, 0);
  const h1 = app.querySelector('h1');
  if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
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
  items.push(...rules.sources);
  return sourcesBox(items, { verified: a ? a.last_verified : rules.last_verified });
}

const asp = () => data.asl.find((a) => a.id === state.province);
const limit = () => maxWaitDays(rules, state.cls, state.kind);

// Testo per la lettera (linguaggio degli uffici).
function classText() {
  if (state.cls === 'D') return `D (${state.kind === 'exam' ? 'esame diagnostico' : 'visita'})`;
  return state.cls;
}

function progress(n) {
  const dots = Array.from({ length: 6 }, (_, i) => `<span class="dot${i < n ? ' on' : ''}"></span>`).join('');
  return `<p class="progress"><span aria-hidden="true">${dots}</span> Domanda ${n} di 6</p>`;
}

function restartBtn(label = 'Ricomincia da capo') {
  return `<button type="button" class="btn center" data-action="restart">🔄 ${esc(label)}</button>`;
}

const days = (n) => `${n} ${n === 1 ? 'giorno' : 'giorni'}`;

const warnings = () => `
  <div class="card">
    <h2 style="margin-top:0">❗ Importante</h2>
    <ul class="icon-list">
      <li><span class="ico" aria-hidden="true">💶</span> Non andare dal privato a pagamento prima di mandare la richiesta. Potresti non avere i soldi indietro.</li>
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
    sendBtn = `<a class="btn primary" href="${esc(a.portal_url)}" target="_blank" rel="noopener">💻 Vai al sito dell'${aslLabel()}</a>`;
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
    ${a.sub_areas ? `<p>L'${aslLabel()} divide la provincia in 3 zone: ${a.sub_areas.map(esc).join('; ')}.</p>` : ''}
    ${a.details.length ? `<ul class="clean">${a.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
    ${contacts.length ? `<ul class="clean">${contacts.join('')}</ul>` : ''}
    <p>La regola dice che la visita va fatta in tempo in strutture pubbliche o convenzionate.
    Se non c'è posto, si fa in ospedale «in intramoenia» pagando solo il ticket
    (Piano nazionale liste d'attesa 2026-2028; D.Lgs. 124/1998, art. 3).</p>
    <p class="muted">Controllato ${art('il', a.last_verified)}${esc(formatIt(a.last_verified))}.
      ${a.sources.map((s) => (s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">Fonte</a>` : `Fonte: ${esc(s.label)}`)).join(' · ')}
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

  province: () => ({
    html: `${progress(1)}
      <h1>📍 Dove abiti?</h1>
      <p>Scegli la tua provincia.</p>
      <div class="grid2">
      ${[...data.asl].sort((a, b) => a.province.localeCompare(b.province)).map((a) => choice('', a.province, { province: a.id }, 'access')).join('')}
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
      ${restartBtn()}`,
  }),

  dates: () => ({
    html: `
      <h1>🧾 Guarda il foglio della prenotazione</h1>
      <p>Ci servono due date.</p>
      <form id="dates-form" novalidate>
        <label for="bookingDate">1. Che giorno hai prenotato?<span class="hint">Il giorno in cui hai chiamato o sei andato al CUP</span></label>
        <input type="date" id="bookingDate" name="bookingDate" required value="${esc(state.bookingDate || '')}" max="${todayISO()}">
        <label for="appointmentDate">2. Che giorno è l'appuntamento?</label>
        <input type="date" id="appointmentDate" name="appointmentDate" required value="${esc(state.appointmentDate || '')}">
        <p class="field-error" id="dates-error" role="alert" hidden></p>
        <button type="submit" class="btn primary big">✔️ Controlla</button>
      </form>`,
    mount() {
      const form = document.getElementById('dates-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = readForm(form);
        const err = document.getElementById('dates-error');
        if (parseDate(v.bookingDate) && daysBetween(v.bookingDate, todayISO()) < 0) {
          err.textContent = 'Il giorno della prenotazione non può essere nel futuro. Controlla la data.';
          err.hidden = false;
          return;
        }
        const r = checkWaiting(rules, { cls: state.cls, kind: state.kind, bookingDate: v.bookingDate, appointmentDate: v.appointmentDate });
        if (r.status === 'error') {
          err.textContent = r.error === 'order'
            ? 'L\'appuntamento non può essere prima del giorno della prenotazione. Controlla le date.'
            : 'Scrivi tutte e due le date.';
          err.hidden = false;
          return;
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
        ${aspSteps(a)}
        ${warnings()}
        ${disclaimer(a.last_verified)}`,
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
          ${aspSteps(a)}
          <div class="notice urgent"><p>Se stai male, chiama il tuo medico. Se è grave, chiama il <a href="tel:112">112</a>.</p></div>
          ${disclaimer(a.last_verified)}
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
        ${aspSteps(a)}
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
          <input type="date" id="requestDate" name="requestDate" value="${esc(state.requestDate || '')}" max="${todayISO()}">
          <p class="field-error" id="req-error" role="alert" hidden></p>
          <button type="submit" class="btn primary">✔️ Calcola</button>
        </form>
        ${status}
        ${disclaimer(rules.last_verified)}`,
      mount() {
        document.getElementById('req-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const v = readForm(e.target);
          const err = document.getElementById('req-error');
          if (!parseDate(v.requestDate)) { err.textContent = 'Scrivi il giorno.'; err.hidden = false; return; }
          if (daysBetween(v.requestDate, todayISO()) < 0) { err.textContent = 'Questo giorno non è ancora arrivato. Controlla la data.'; err.hidden = false; return; }
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
            <label for="f-nre">Numero della ricetta<span class="hint">Il codice lungo in alto, che inizia con 190…</span></label>
            <input id="f-nre" name="nre" type="text" value="${esc(state.nre || '')}" autocapitalize="characters">
          </fieldset>
        </form>
        <h2>${official ? '📝 Cosa scrivere nel modulo' : '📄 Ecco la tua lettera'}</h2>
        ${official ? '' : '<p class="muted">La lettera usa le parole degli uffici. In breve dice: «Chiedo di fare la visita entro i tempi di legge».</p>'}
        <div id="preview"></div>
        <div class="btn-row three">
          ${official ? '' : '<button type="button" class="btn center" id="pdf-btn">🖨️ Stampa o salva</button><button type="button" class="btn center" id="copy-btn">📋 Copia</button>'}
          <a class="btn center${official ? ' primary' : ''}" id="mail-btn" href="#">📧 Manda per email</a>
        </div>
        <p id="send-hint"></p>
        ${noPecBox()}
        <div class="card">
          <h3 style="margin-top:0">Prima di mandarla</h3>
          <ul class="icon-list">
            <li><span class="ico" aria-hidden="true">🖊️</span> Firma ${official ? 'il modulo' : 'la lettera'}</li>
            ${a.documents_required.filter((d) => !/lettera/i.test(d)).map((d) => `<li><span class="ico" aria-hidden="true">${docIcon(d)}</span> Allega: ${esc(d)}</li>`).join('')}
            <li class="delegate-note"${person.isDelegate ? '' : ' hidden'}><span class="ico" aria-hidden="true">📝</span> Allega: la delega firmata e il tuo documento</li>
          </ul>
        </div>
        <button type="button" class="btn primary" data-go="after">⏳ Fatto! E adesso?</button>
        ${disclaimer(a.last_verified)}`,
      mount() {
        const form = document.getElementById('letter-form');
        const update = () => {
          const v = readForm(form);
          state.service = v.service; state.nre = v.nre;
          delete v.service; delete v.nre;
          Object.assign(person, v);
          form.querySelector('.delegate-fields').hidden = !person.isDelegate;
          document.querySelectorAll('.delegate-note').forEach((li) => { li.hidden = !person.isDelegate; });
          updateLetter(a, official);
        };
        form.addEventListener('input', update);
        form.addEventListener('change', update);
        update();
        document.getElementById('copy-btn')?.addEventListener('click', (e) => copyText(state.letterText, e.currentTarget));
        document.getElementById('pdf-btn')?.addEventListener('click', () => printText(state.letterText));
      },
    };
  },

  after: () => {
    const a = asp();
    const today = todayISO();
    if (!state.firstRequestDate) state.firstRequestDate = today;
    const remindTitle = () => {
      const on = addDays(state.firstRequestDate, rules.reminder_after_days);
      return `Se nessuno ti risponde entro ${art('il', on)}${formatIt(on)}`;
    };
    const urp = generalContact(a);
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
          <li><strong>Fai un reclamo</strong> all'ufficio URP della tua ${aslLabel()}${urp ? ` (${mailLink(urp)})` : ''}.</li>
          <li><strong>Chiedi aiuto a un'associazione</strong> di pazienti: Cittadinanzattiva
            (<a href="https://www.cittadinanzattiva.it" target="_blank" rel="noopener">cittadinanzattiva.it</a>) oppure
            Associazione Luca Coscioni (<a href="https://www.associazionelucacoscioni.it" target="_blank" rel="noopener">associazionelucacoscioni.it</a>).</li>
          <li><strong>Scrivi alla ${esc(regioneInfo().ente || 'tua Regione')}</strong>, ufficio URP dell'Assessorato della Salute${regioneLink('assessorato') ? `
            (<a href="${esc(regioneLink('assessorato'))}" target="_blank" rel="noopener">${esc(new URL(regioneLink('assessorato')).hostname.replace(/^www\./, ''))}</a>)` : ''}.</li>
        </ol>
        <div class="notice warn"><p>💶 Vai dal privato a pagamento <strong>solo se l'${aslLabel()} te lo scrive</strong>. Altrimenti potresti non avere i soldi indietro.</p></div>
        <div class="card">
          <h2 style="margin-top:0">📄 Il sollecito, già pronto</h2>
          <form id="rem-form" novalidate>
            <label for="firstRequestDate">Che giorno hai mandato la prima richiesta?</label>
            <input type="date" id="firstRequestDate" name="firstRequestDate" value="${esc(state.firstRequestDate)}" max="${today}" aria-describedby="rem-form-error">
            <p class="field-error" id="rem-form-error" role="alert" hidden></p>
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
          const ok = parseDate(v.firstRequestDate) && daysBetween(v.firstRequestDate, today) >= 0;
          if (ok) state.firstRequestDate = v.firstRequestDate;
          const err = document.getElementById('rem-form-error');
          err.hidden = ok;
          err.textContent = ok ? '' : `Scrivi una data giusta, non dopo oggi. Per ora usiamo ${art('il', state.firstRequestDate)}${formatIt(state.firstRequestDate)}.`;
          document.getElementById('remind-title').textContent = remindTitle();
          const text = tutelaReminder({
            ente: aslIntestazione(),
            aspName: a.province, aspAddress: a.send_to || a.pec || '', person, service: state.service, nre: state.nre,
            cls: classText(), firstRequestDate: state.firstRequestDate, today,
          });
          state.reminderText = text;
          document.getElementById('reminder').textContent = text;
          document.getElementById('rmail-btn').hidden = !(a.send_to || a.pec);
          document.getElementById('rmail-btn').href = mailtoHref(a.send_to || a.pec || '',
            `SOLLECITO – Richiesta percorso di tutela${person.fullName ? ` – ${person.fullName}` : ''}`,
            `Buongiorno,\nin allegato il sollecito firmato.\n\nCordiali saluti\n${person.fullName || ''}`);
        };
        document.getElementById('rem-form').addEventListener('change', update);
        update();
        document.getElementById('rcopy-btn').addEventListener('click', (e) => copyText(state.reminderText, e.currentTarget));
        document.getElementById('rpdf-btn').addEventListener('click', () => printText(state.reminderText));
      },
    };
  },
};

// Prima della provincia, la regione (se ce n'è più di una). Link «Cambia regione» nelle schermate con dati regionali.
const regionLink = withRegion(screens);

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
    preview.innerHTML = `<table class="fields"><tbody>${a.form_fields.map((f) => `
      <tr><th scope="row">${esc(f.label)}</th><td>${esc(f.fixed || values[f.source] || '—')}</td></tr>`).join('')}</tbody></table>`;
    state.letterText = '';
    mail.href = mailtoHref(a.send_to, subject,
      `Buongiorno,\nin allegato il modulo di richiesta del percorso di tutela, compilato e firmato, con i documenti.${signoff}`);
    hint.textContent = `📧 L'email si apre già con l'indirizzo giusto (${a.send_to}). Aggiungi il modulo firmato e le foto dei documenti.`;
    return;
  }

  const text = tutelaLetter({
    ente: aslIntestazione(),
    aspName: a.province,
    aspAddress: a.send_to || a.pec || '',
    person, service: state.service, nre: state.nre, cls: classText(), maxDays: limit(),
    bookingDate: state.bookingDate, appointmentDate: state.appointmentDate,
    noDateOffered: state.cup === 'none', requestDate: state.requestDate, today,
  });
  state.letterText = text;
  preview.innerHTML = `<div class="letter">${esc(text)}</div>`;
  const to = a.send_to || '';
  mail.href = mailtoHref(to, subject, `Buongiorno,\nin allegato la richiesta di attivazione del percorso di tutela, firmata, con i documenti.${signoff}`);
  if (!to) {
    hint.innerHTML = `🏥 Per questa ${aslLabel()} non abbiamo ancora un indirizzo sicuro. <strong>Stampa la lettera e portala all'ufficio URP</strong> o al CUP.`;
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
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>';
    return;
  }
  render();
})();
