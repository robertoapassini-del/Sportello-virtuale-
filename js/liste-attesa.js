// Module 1 — liste d'attesa. Question flow → result → letter → "E adesso?".
// All answers live in memory only (the `state` and `person` objects) and are
// lost when the tab is closed. Nothing is sent anywhere.
import { checkWaiting, callbackDeadline, maxWaitDays, todayISO, formatIt, parseDate, daysBetween, addDays } from './engine.js';
import { tutelaLetter, tutelaReminder, mailtoHref } from './letters.js';
import {
  esc, loadJSON, disclaimer, renderFooter, copyText, printText, readForm, phoneLink, mailLink,
  personFields, reportErrorHref,
} from './common.js';
import { RICETTA_SVG } from './ricetta-svg.js';

const ROOT = '../';
const app = document.getElementById('app');

let rules;
let data;
const state = {};
const person = {};
const history = [];
let current = 'intro';

// ---------- navigation ----------

function go(screen) {
  history.push(current);
  current = screen;
  render();
}

function back() {
  current = history.pop() || 'intro';
  render();
}

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

// A choice button: sets state values then goes to the next screen.
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

// ---------- helpers ----------

const asp = () => data.asl.find((a) => a.id === state.province);
const limit = () => maxWaitDays(rules, state.cls, state.kind);

function classText() {
  if (state.cls === 'D') return `D (${state.kind === 'exam' ? 'esame diagnostico' : 'visita'})`;
  return state.cls;
}

function statusBadge(status) {
  const label = { verified: 'Verificato', partial: 'Verificato in parte', todo: 'Da verificare' }[status] || status;
  return `<span class="badge ${esc(status)}">${esc(label)}</span>`;
}

function progress(n) {
  return `<p class="progress">Domanda ${n} di 6</p>`;
}

function restartBtn(label = 'Ricomincia') {
  return `<button type="button" class="btn center" data-action="restart">${esc(label)}</button>`;
}

const warnings = () => `
  <h2>Attenzione</h2>
  <ul class="clean">
    <li><strong>Non andare dal privato prima di chiedere il percorso di tutela</strong> sperando in un rimborso dopo: attiva sempre prima il percorso di tutela.</li>
    <li>Conserva il <strong>foglio (promemoria) di prenotazione</strong> con la data che ti è stata proposta.</li>
    <li>Non saltare l'appuntamento già prenotato senza disdirlo: chi non si presenta può dover pagare il ticket, anche se esente.</li>
  </ul>`;

function aspCard(a, { showFastTrack = true } = {}) {
  const ft = a.fast_track && showFastTrack && a.fast_track.classes.includes(state.cls) ? a.fast_track : null;
  const contacts = [];
  if (a.emails.length) contacts.push(`<dt>Email</dt><dd>${a.emails.map(mailLink).join('<br>')}</dd>`);
  if (a.pec) contacts.push(`<dt>PEC</dt><dd>${mailLink(a.pec)}</dd>`);
  if (a.portal_url) contacts.push(`<dt>Portale online</dt><dd><a href="${esc(a.portal_url)}" target="_blank" rel="noopener">${esc(a.portal_url)}</a></dd>`);
  if (a.form_url) contacts.push(`<dt>Modulo</dt><dd><a href="${esc(a.form_url)}" target="_blank" rel="noopener">Apri il modulo ufficiale</a></dd>`);
  for (const p of a.phones) contacts.push(`<dt>${esc(p.label)}</dt><dd>${phoneLink(p.number)}</dd>`);
  if (a.urp_default) contacts.push(`<dt>${esc(a.urp_default.name)}</dt><dd>${esc(a.urp_default.address)}</dd>`);

  const fallback = a.letter_mode === 'fallback' ? `
    <div class="notice warn">
      <p><strong>Stiamo ancora verificando la procedura di questa ASP.</strong> Chiama l'URP o il CUP e chiedi di attivare il
      "percorso di tutela". Puoi anche inviare la lettera che prepariamo qui via PEC o raccomandata alla PEC generale dell'ASP
      ${a.pec ? `(${mailLink(a.pec)})` : `(la trovi su <a href="${esc(data.indicepa_url)}" target="_blank" rel="noopener">IndicePA</a>)`}.</p>
    </div>` : '';

  return `
  ${ft ? `<div class="notice info">
      <h3 style="margin-top:0">Prima di tutto: fast track per la classe ${esc(state.cls)}</h3>
      <p>${esc(ft.description)}</p>
      ${ft.phone ? `<p>Telefono: ${phoneLink(ft.phone)}</p>` : ''}
      <p class="muted">Se il fast track non funziona, usa il percorso di tutela qui sotto.</p>
    </div>` : ''}
  <div class="card">
    <h2 style="margin-top:0">${esc(a.name)} ${statusBadge(a.status)}</h2>
    <p>${esc(a.how_to)}</p>
    ${a.sub_areas ? `<p><strong>Ambiti di garanzia:</strong></p><ul class="clean">${a.sub_areas.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
    ${contacts.length ? `<dl class="contacts">${contacts.join('')}</dl>` : ''}
    ${fallback}
    <h3>Documenti da allegare</h3>
    <ul class="checklist">${a.documents_required.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
    <h3>Cosa succede dopo</h3>
    <ul class="clean">
      ${a.what_next.map((w) => `<li>${esc(w)}</li>`).join('')}
      <li>L'ASP cerca un posto entro il tempo massimo, in strutture pubbliche o accreditate del territorio.</li>
      <li>Se non c'è posto: prestazione in intramoenia (ALPI) pagando solo il ticket.</li>
    </ul>
    ${a.notes.length ? `<h3>Note</h3><ul class="clean">${a.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
    <p class="muted">Ultima verifica: ${esc(formatIt(a.last_verified))}.
      ${a.sources.map((s) => (s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">Fonte ufficiale</a>` : `Fonte: ${esc(s.label)}`)).join(' · ')}
      · <a href="${esc(reportErrorHref(a.name))}">Segnala un errore</a></p>
  </div>`;
}

// ---------- screens ----------

const screens = {
  intro: () => ({
    html: `
      <h1>Hai una prenotazione oltre i tempi previsti dalla tua ricetta?</h1>
      <p class="lead">Verifica i tuoi diritti in 2 minuti.</p>
      <p>Se il CUP ti ha dato un appuntamento troppo lontano, la legge ti dà diritto a chiedere all'ASP di farti fare la visita
      o l'esame entro il tempo massimo scritto sulla ricetta. Ti diciamo se hai diritto e come fare nella tua ASP.</p>
      <div class="notice info"><p>Tieni a portata di mano la <strong>ricetta</strong> e il <strong>foglio di prenotazione del CUP</strong>.</p></div>
      <button type="button" class="btn primary" data-go="province">Inizia</button>
      <p class="muted">Regole fisse, non è un consulto legale o medico. Nessun dato viene salvato.</p>`,
  }),

  province: () => ({
    html: `${progress(1)}
      <h1>In quale provincia sei residente?</h1>
      <p>La richiesta va fatta all'ASP della provincia in cui risiedi, anche se hai prenotato in un ospedale (Policlinico, Cannizzaro, Papardo, ecc.).</p>
      ${[...data.asl].sort((a, b) => a.province.localeCompare(b.province)).map((a) => choice(a.province, { province: a.id }, 'access')).join('')}
      <p class="muted">Se sei solo domiciliato (per esempio per studio o lavoro) chiedi conferma all'URP dell'ASP: la regola non è ancora chiara.</p>`,
  }),

  access: () => ({
    html: `${progress(2)}
      <h1>È una prima visita (o primo esame) oppure un controllo?</h1>
      <p>Il diritto vale solo per il <strong>primo accesso</strong>: la prima visita o il primo esame per quel problema.</p>
      ${choice('Prima visita o primo esame', { access: 'first' }, 'cls')}
      ${choice('Visita o esame di controllo', { access: 'followup' }, 'followup', 'Per esempio un controllo dopo una visita già fatta')}
      <p class="muted">Non sai? Sulla ricetta di solito è indicato "primo accesso". Chiedi al medico che l'ha scritta.</p>`,
  }),

  followup: () => ({
    html: `
      <h1>Per i controlli il percorso di tutela non vale</h1>
      <div class="notice warn"><p>Le visite e gli esami di controllo (follow-up) sono esclusi dalla garanzia dei tempi massimi
      in tutte le ASP siciliane.</p></div>
      <p>Cosa puoi fare:</p>
      <ul class="clean">
        <li>Chiedi allo specialista che ti segue di prenotare direttamente il controllo (molti reparti hanno agende dedicate).</li>
        <li>Se hai una malattia cronica, chiedi al CUP o all'URP della tua ASP se esiste un percorso per i pazienti cronici.</li>
      </ul>
      ${restartBtn()}`,
  }),

  cls: () => ({
    html: `${progress(3)}
      <h1>Che classe di priorità c'è sulla ricetta?</h1>
      <p>È una lettera: <strong>U, B, D o P</strong>. Guarda la casella "Priorità" (in giallo nel disegno).</p>
      ${RICETTA_SVG}
      ${choice('U – Urgente', { cls: 'U', kind: null }, 'cup', 'Entro 72 ore')}
      ${choice('B – Breve', { cls: 'B', kind: null }, 'cup', 'Entro 10 giorni')}
      ${choice('D – Differibile', { cls: 'D' }, 'kind', 'Entro 30 giorni (visite) o 60 giorni (esami)')}
      ${choice('P – Programmabile', { cls: 'P', kind: null }, 'cup', 'Entro 120 giorni')}
      ${choice('Non lo so / non c\'è nessuna lettera', { cls: null }, 'noClass')}`,
  }),

  noClass: () => ({
    html: `
      <h1>Senza classe di priorità non possiamo calcolare il tempo massimo</h1>
      <p>La garanzia dei tempi vale per le ricette di primo accesso <strong>con una classe di priorità</strong> (U, B, D o P).</p>
      <ul class="clean">
        <li>Controlla di nuovo la ricetta: la lettera è nella casella "Priorità".</li>
        <li>Se non c'è, chiedi al medico che l'ha scritta di indicare la classe di priorità.</li>
      </ul>
      <p class="muted">In alcune regioni una ricetta senza classe viene trattata come classe D. Per la Sicilia stiamo ancora verificando.</p>
      ${restartBtn()}`,
  }),

  kind: () => ({
    html: `${progress(4)}
      <h1>È una visita o un esame diagnostico?</h1>
      <p>Per la classe D il tempo massimo cambia: 30 giorni per le visite, 60 giorni per gli esami.</p>
      ${choice('Una visita', { kind: 'visit' }, 'cup', 'Per esempio visita cardiologica, oculistica, dermatologica')}
      ${choice('Un esame diagnostico', { kind: 'exam' }, 'cup', 'Per esempio ecografia, TAC, risonanza, gastroscopia')}`,
  }),

  cup: () => ({
    html: `${progress(5)}
      <h1>Cosa ti ha detto il CUP?</h1>
      ${choice('Mi ha proposto una data', { cup: 'date' }, 'accepted')}
      ${choice('Nessuna data', { cup: 'none' }, 'resultC', 'Agende chiuse, "richiami più avanti" o messo in lista d\'attesa')}`,
  }),

  accepted: () => ({
    html: `${progress(6)}
      <h1>Hai accettato la prima data che ti è stata proposta?</h1>
      <p>Anche se era lontana o in un ospedale che non preferivi.</p>
      ${choice('Sì, ho accettato la prima data proposta', { accepted: true }, 'dates')}
      ${choice('No, ho scelto un\'altra data o un altro ospedale', { accepted: false }, 'refused')}`,
  }),

  refused: () => ({
    html: `
      <h1>Se rifiuti la prima data, la garanzia si perde</h1>
      <div class="notice warn"><p>Se non accetti la prima disponibilità (per esempio per scegliere un ospedale preferito),
      la prenotazione esce dalla garanzia dei tempi massimi. Lo dicono ad esempio le ASP di Enna, Messina e Agrigento.</p></div>
      <p>Cosa puoi fare: se la ricetta è ancora valida, <strong>prenota di nuovo e accetta la prima data proposta</strong>.
      Se anche quella supera il tempo massimo, rifai questo test.</p>
      ${restartBtn('Rifai il test')}`,
  }),

  dates: () => ({
    html: `
      <h1>Le date della prenotazione</h1>
      <p>Le trovi sul foglio (promemoria) di prenotazione del CUP.</p>
      <form id="dates-form" novalidate>
        <label for="bookingDate">Quando hai prenotato?<span class="hint">Il giorno in cui hai chiamato o sei andato al CUP</span></label>
        <input type="date" id="bookingDate" name="bookingDate" required value="${esc(state.bookingDate || '')}" max="${todayISO()}">
        <label for="appointmentDate">Che data di appuntamento ti hanno dato?</label>
        <input type="date" id="appointmentDate" name="appointmentDate" required value="${esc(state.appointmentDate || '')}">
        <p class="field-error" id="dates-error" role="alert" hidden></p>
        <button type="submit" class="btn primary">Verifica</button>
      </form>`,
    mount() {
      const form = document.getElementById('dates-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = readForm(form);
        const err = document.getElementById('dates-error');
        const r = checkWaiting(rules, { cls: state.cls, kind: state.kind, bookingDate: v.bookingDate, appointmentDate: v.appointmentDate });
        if (r.status === 'error') {
          err.textContent = r.error === 'order'
            ? 'La data dell\'appuntamento non può essere prima della data di prenotazione.'
            : 'Inserisci entrambe le date.';
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
        <h1>La tua prenotazione è entro il tempo massimo</h1>
        <div class="notice ok">
          <p>Classe ${esc(classText())}: tempo massimo <strong>${r.limit} giorni</strong>.</p>
          <p>Tra la prenotazione (${esc(formatIt(state.bookingDate))}) e l'appuntamento (${esc(formatIt(state.appointmentDate))})
          ci sono <strong>${r.days} giorni</strong>. Il limite era il ${esc(formatIt(r.deadline))}.</p>
        </div>
        <p>In questo caso il percorso di tutela non si applica. Conserva il foglio di prenotazione: se l'appuntamento viene
        spostato più avanti, rifai il test.</p>
        <p class="muted">Consiglio: prenota sempre il prima possibile dopo aver ricevuto la ricetta. In Sicilia la ricetta vale
        ${rules.prescription_validity_days} giorni per prenotare, ma una prenotazione tardiva può far perdere la priorità.</p>
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
    };
  },

  resultB: () => {
    const r = state.result;
    const a = asp();
    const letterBtn = a.letter_mode === 'portal'
      ? `<a class="btn primary" href="${esc(a.portal_url)}" target="_blank" rel="noopener">Vai al portale dell'ASP</a>`
      : `<button type="button" class="btn primary" data-go="letter">${a.letter_mode === 'official_form' ? 'Ti aiutiamo a compilare il modulo' : 'Prepara la lettera'}</button>`;
    return {
      html: `
        <h1>Il tempo massimo è superato: puoi chiedere il percorso di tutela</h1>
        <div class="notice bad">
          <span class="big-number">+${r.excess} ${r.excess === 1 ? 'giorno' : 'giorni'}</span>
          <p>Classe ${esc(classText())}: tempo massimo <strong>${r.limit} giorni</strong>, cioè entro il ${esc(formatIt(r.deadline))}.
          Ti hanno dato appuntamento dopo <strong>${r.days} giorni</strong> (${esc(formatIt(state.appointmentDate))}).</p>
        </div>
        <p>Puoi chiedere alla tua ASP di farti fare la prestazione entro i tempi. Se non c'è posto nelle strutture pubbliche
        o accreditate, la prestazione va fatta in intramoenia pagando <strong>solo il ticket</strong> (se dovuto).
        <strong>Il tempo di garanzia riparte dalla data della tua richiesta.</strong></p>
        <p class="muted">La garanzia riguarda le prestazioni monitorate dal Piano nazionale liste d'attesa (PNGLA): sono le visite
        e gli esami più comuni. Se hai dubbi sulla tua prestazione, chiedi all'URP.</p>
        ${aspCard(a)}
        ${letterBtn}
        ${a.letter_mode === 'portal' ? '<button type="button" class="btn center" data-go="after">Ho inviato la richiesta: e adesso?</button>' : ''}
        ${warnings()}
        ${disclaimer(a.last_verified)}`,
    };
  },

  resultC: () => {
    const a = asp();
    if (state.cls === 'U') {
      return {
        html: `
          <h1>Classe U senza data: muoviti subito</h1>
          <div class="notice bad"><p>La classe U (urgente) prevede la prestazione entro 72 ore. Non aspettare.</p></div>
          ${aspCard(a)}
          <p>Se il problema di salute peggiora, chiama il tuo medico o il 112 / vai al pronto soccorso.</p>
          ${disclaimer(a.last_verified)}
          ${restartBtn()}`,
      };
    }
    const cb = callbackDeadline(rules, { cls: state.cls, kind: state.kind, requestDate: state.requestDate, today: todayISO() });
    let status = '';
    if (cb.status === 'waiting') {
      status = `<div class="notice info"><p>L'ASP deve richiamarti entro il <strong>${esc(formatIt(cb.deadline))}</strong>.
        Se non ti richiamano entro quella data, torna qui: potrai chiedere il percorso di tutela.</p></div>`;
    } else if (cb.status === 'passed') {
      status = `<div class="notice bad"><p>Il termine per richiamarti è scaduto il <strong>${esc(formatIt(cb.deadline))}</strong>.
        Puoi chiedere il percorso di tutela alla tua ASP.</p></div>
        ${aspCard(a)}
        ${a.letter_mode === 'portal'
          ? `<a class="btn primary" href="${esc(a.portal_url)}" target="_blank" rel="noopener">Vai al portale dell'ASP</a>`
          : '<button type="button" class="btn primary" data-go="letter">Prepara la richiesta</button>'}
        ${warnings()}`;
    }
    return {
      html: `
        <h1>Il CUP non ti ha dato una data</h1>
        <p>Con il nuovo Piano nazionale liste d'attesa (PNGLA 2026-2028), se non ci sono posti l'ASP deve inserirti in una
        <strong>lista di tutela</strong> (pre-lista) e richiamarti entro <strong>${cb.days} giorni</strong>
        per la classe ${esc(classText())}.</p>
        <div class="notice warn"><p>Chiedi al CUP una <strong>prova scritta</strong> della tua richiesta, con la data e il numero
        della ricetta. Ti servirà se non ti richiamano.</p></div>
        <form id="req-form" novalidate>
          <label for="requestDate">Quando hai chiesto la prenotazione al CUP?</label>
          <input type="date" id="requestDate" name="requestDate" value="${esc(state.requestDate || '')}" max="${todayISO()}">
          <button type="submit" class="btn primary">Calcola la scadenza</button>
        </form>
        ${status}
        ${disclaimer(rules.last_verified)}`,
      mount() {
        document.getElementById('req-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const v = readForm(e.target);
          if (!parseDate(v.requestDate)) return;
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
        <h1>${official ? `Compila il modulo ufficiale di ${esc(a.name)}` : 'Prepara la lettera per l\'ASP'}</h1>
        <div class="notice info"><p>🔒 I dati che scrivi restano solo su questo dispositivo. Non li salviamo e non li inviamo:
        servono solo a riempire il testo. Quando chiudi la pagina spariscono.</p></div>
        ${official ? `<p>${esc(a.name)} chiede di usare il proprio modulo. <a href="${esc(a.form_url)}" target="_blank" rel="noopener">Scarica il modulo ufficiale</a>,
          poi copia in ogni campo quello che vedi nella tabella qui sotto.</p>` : ''}
        <form id="letter-form" novalidate>
          ${personFields(person)}
          <fieldset>
            <legend>Dati della ricetta</legend>
            <label for="f-service">Prestazione<span class="hint">Come è scritta sulla ricetta, per esempio "Visita cardiologica"</span></label>
            <input id="f-service" name="service" type="text" value="${esc(state.service || '')}">
            <label for="f-nre">Numero della ricetta (NRE)<span class="hint">Il codice di 15 caratteri, per esempio 190A0…</span></label>
            <input id="f-nre" name="nre" type="text" value="${esc(state.nre || '')}" autocapitalize="characters">
          </fieldset>
        </form>
        <h2>${official ? 'Cosa scrivere in ogni campo del modulo' : 'La tua lettera'}</h2>
        <div id="preview"></div>
        <div class="btn-row three">
          ${official ? '' : '<button type="button" class="btn" id="copy-btn">Copia testo</button><button type="button" class="btn" id="pdf-btn">Scarica PDF</button>'}
          <a class="btn${official ? ' primary center' : ''}" id="mail-btn" href="#">Apri email</a>
        </div>
        <p class="muted" id="send-hint"></p>
        <h3>Ricordati di allegare</h3>
        <ul class="checklist">${a.documents_required.map((d) => `<li>${esc(d)}</li>`).join('')}${person.isDelegate ? '<li>Delega firmata e documento del delegato</li>' : ''}</ul>
        <button type="button" class="btn primary" data-go="after">Ho inviato la richiesta: e adesso?</button>
        ${disclaimer(a.last_verified)}`,
      mount() {
        const form = document.getElementById('letter-form');
        const update = () => {
          const v = readForm(form);
          state.service = v.service; state.nre = v.nre;
          delete v.service; delete v.nre;
          Object.assign(person, v);
          form.querySelector('.delegate-fields').hidden = !person.isDelegate;
          updateLetter(a, official);
        };
        form.addEventListener('input', update);
        form.addEventListener('change', update);
        update();
        document.getElementById('copy-btn')?.addEventListener('click', (e) => copyText(state.letterText, e.target));
        document.getElementById('pdf-btn')?.addEventListener('click', () => printText(state.letterText));
      },
    };
  },

  after: () => {
    const a = asp();
    const today = todayISO();
    if (!state.firstRequestDate) state.firstRequestDate = today;
    const reminderDays = rules.reminder_after_days;
    const remindOn = formatIt(addDays(state.firstRequestDate, reminderDays));
    return {
      html: `
        <h1>E adesso?</h1>
        <h2>Cosa aspettarti</h2>
        <ul class="clean">
          ${a.what_next.map((w) => `<li>${esc(w)}</li>`).join('')}
          <li>Il tempo di garanzia riparte dalla data della tua richiesta.</li>
          <li>Tieni il telefono a portata di mano: l'ASP può chiamarti da un numero sconosciuto.</li>
          <li>Conserva una copia di tutto quello che hai inviato e la ricevuta (o l'email inviata).</li>
        </ul>
        <h2>Se non succede niente</h2>
        <ol class="steps">
          <li><strong>Sollecito</strong>: se non ricevi risposta entro i tempi indicati dalla tua ASP o entro ${reminderDays} giorni
            (per una richiesta del ${esc(formatIt(state.firstRequestDate))}: dal ${esc(remindOn)}), invia un sollecito. Lo puoi preparare qui sotto.</li>
          <li><strong>Reclamo all'URP</strong> della tua ASP (${a.emails[0] ? mailLink(a.emails[0]) : a.pec ? mailLink(a.pec) : 'chiedi il contatto al CUP'}).</li>
          <li><strong>URP dell'Assessorato regionale della Salute</strong> – Regione Siciliana
            (<a href="https://www.regione.sicilia.it" target="_blank" rel="noopener">regione.sicilia.it</a>).</li>
          <li><strong>Associazioni di pazienti</strong>: Cittadinanzattiva – PiT Salute
            (<a href="https://www.cittadinanzattiva.it" target="_blank" rel="noopener">cittadinanzattiva.it</a>),
            Associazione Luca Coscioni (<a href="https://www.associazionelucacoscioni.it" target="_blank" rel="noopener">associazionelucacoscioni.it</a>).</li>
          <li><strong>Rimborso</strong>: solo dopo un'autorizzazione scritta dell'ASP. Non pagare il privato prima.</li>
        </ol>
        <div class="card">
          <h2 style="margin-top:0">Prepara un sollecito</h2>
          <form id="rem-form" novalidate>
            <label for="firstRequestDate">Quando hai inviato la prima richiesta?</label>
            <input type="date" id="firstRequestDate" name="firstRequestDate" value="${esc(state.firstRequestDate)}" max="${today}">
          </form>
          <div id="reminder" class="letter"></div>
          <div class="btn-row three">
            <button type="button" class="btn" id="rcopy-btn">Copia testo</button>
            <button type="button" class="btn" id="rpdf-btn">Scarica PDF</button>
            <a class="btn" id="rmail-btn" href="#">Apri email</a>
          </div>
          <p class="muted">I dati personali sono quelli inseriti nella lettera. Se mancano, torna indietro e completali.</p>
        </div>
        ${disclaimer(a.last_verified)}
        ${restartBtn('Fai un altro controllo')}`,
      mount() {
        const update = () => {
          const v = readForm(document.getElementById('rem-form'));
          if (parseDate(v.firstRequestDate) && daysBetween(v.firstRequestDate, today) >= 0) state.firstRequestDate = v.firstRequestDate;
          const text = tutelaReminder({
            aspName: a.province, aspAddress: a.send_to || a.pec || '', person, service: state.service, nre: state.nre,
            cls: classText(), firstRequestDate: state.firstRequestDate, today,
          });
          state.reminderText = text;
          document.getElementById('reminder').textContent = text;
          document.getElementById('rmail-btn').href = mailtoHref(a.send_to || a.pec || '',
            `SOLLECITO – Richiesta percorso di tutela${person.fullName ? ` – ${person.fullName}` : ''}`, text);
        };
        document.getElementById('rem-form').addEventListener('change', update);
        update();
        document.getElementById('rcopy-btn').addEventListener('click', (e) => copyText(state.reminderText, e.target));
        document.getElementById('rpdf-btn').addEventListener('click', () => printText(state.reminderText));
      },
    };
  },
};

function updateLetter(a, official) {
  const today = todayISO();
  const preview = document.getElementById('preview');
  const subject = `Richiesta attivazione percorso di tutela${person.fullName ? ` – ${person.fullName}` : ''}${state.nre ? ` – ricetta ${state.nre}` : ''}`;
  const mail = document.getElementById('mail-btn');
  const hint = document.getElementById('send-hint');

  if (official) {
    const values = {
      ...person,
      serviceAndNre: [state.service, state.nre && `ricetta n. ${state.nre}`].filter(Boolean).join(' – '),
      today: formatIt(today),
    };
    preview.innerHTML = `<table class="fields"><tbody>${a.form_fields.map((f) => `
      <tr><th scope="row">${esc(f.label)}</th><td>${esc(f.fixed || values[f.source] || '—')}</td></tr>`).join('')}</tbody></table>`;
    state.letterText = '';
    const body = `Buongiorno,\nin allegato invio il modulo di richiesta di accesso al percorso di tutela compilato e firmato, ` +
      `con i documenti richiesti.\n\nCordiali saluti\n${person.fullName || ''}${person.phone ? `\nTel. ${person.phone}` : ''}`;
    mail.href = mailtoHref(a.send_to, subject, body);
    hint.textContent = `L'email si apre già indirizzata a ${a.send_to}. Allega il modulo compilato e firmato e i documenti.`;
    return;
  }

  const text = tutelaLetter({
    aspName: a.province,
    aspAddress: a.send_to || a.pec || '',
    person, service: state.service, nre: state.nre, cls: classText(), maxDays: limit(),
    bookingDate: state.bookingDate, appointmentDate: state.appointmentDate,
    noDateOffered: state.cup === 'none', requestDate: state.requestDate, today,
  });
  state.letterText = text;
  preview.innerHTML = `<div class="letter">${esc(text)}</div>`;
  const to = a.send_to || '';
  const body = `Buongiorno,\nin allegato la richiesta di attivazione del percorso di tutela, firmata, con i documenti richiesti.\n\n` +
    `Cordiali saluti\n${person.fullName || ''}${person.phone ? `\nTel. ${person.phone}` : ''}`;
  mail.href = mailtoHref(to, subject, body);
  hint.innerHTML = to
    ? `L'email si apre indirizzata a ${esc(to)}. Allega la lettera firmata (PDF) e i documenti.` +
      (a.channel === 'pec' ? ' <strong>È un indirizzo PEC:</strong> inviala dalla tua PEC, oppure consegna la lettera di persona all\'URP.' : '')
    : `Per questa ASP non abbiamo ancora un indirizzo verificato: chiedi all'URP dove inviarla o cerca la PEC su <a href="${esc(data.indicepa_url)}" target="_blank" rel="noopener">IndicePA</a>.`;
}

// ---------- start ----------

(async function init() {
  renderFooter(ROOT);
  try {
    [rules, data] = await Promise.all([loadJSON(`${ROOT}data/rules.json`), loadJSON(`${ROOT}data/asp-sicilia.json`)]);
  } catch (err) {
    app.innerHTML = `<div class="notice bad"><p>Non riusciamo a caricare i dati. Ricarica la pagina.</p></div>`;
    return;
  }
  render();
})();
