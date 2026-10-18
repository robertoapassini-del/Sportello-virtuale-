// Modulo 10 — assistenza domiciliare integrata (ADI): «come la chiedo all'ASP?».
// Non c'è un numero di giorni fissato dalla legge: spieghiamo i passi e, se nessuno viene,
// prepariamo un sollecito al distretto. Non chiediamo la malattia.
import { todayISO, formatIt, parseDate, daysBetween, addDays, art } from './engine.js';
import { genericRequest, mailtoHref } from './letters.js';
import { noPecBox, esc, loadJSON, disclaimer, renderFooter, copyText, printText, readForm, mailLink, callButton, personFields, reportErrorHref, generalContact } from './common.js';
import { createFlow, choice, restartBtn, days, progress, dateForm, showError, letterButtons } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
let rules;
let data;
const state = {};
const person = {};
const asp = () => data.asl.find((a) => a.id === state.province);

function sources() {
  const a = state.province ? asp() : null;
  const items = [...rules.sources];
  if (a) { if (a.info_url) items.push({ label: `${a.name} – sito ufficiale`, url: a.info_url }); items.push(...a.sources); }
  return [items, { verified: rules.last_verified, note: a ? 'I contatti dei PUA dei distretti sono ancora da raccogliere.' : '' }];
}

const steps = () => `
  <h2 class="say">Come si chiede</h2>
  <ol class="big-steps">
    <li class="say"><strong>Parla con il medico di famiglia.</strong> È lui che compila la richiesta di assistenza domiciliare e la manda al distretto. Se la persona è in ospedale, chiedi al reparto la <strong>«dimissione protetta»</strong>: la richiesta parte dall'ospedale prima che torni a casa.</li>
    <li class="say"><strong>La richiesta arriva al PUA</strong> (Punto Unico di Accesso) del distretto dell'ASP. Chiedi al medico una copia o il numero della richiesta, con la data.</li>
    <li class="say"><strong>Una équipe viene a casa</strong> per la valutazione (si chiama UVM) e scrive il piano: quante volte a settimana, quali figure (infermiere, fisioterapista, medico, operatore).</li>
    <li class="say"><strong>Iniziano le visite a casa.</strong> È tutto <strong>gratuito</strong>.</li>
  </ol>
  <details class="card">
    <summary>Cosa comprende e cosa no</summary>
    <ul class="clean">
      <li>Comprende: medicazioni, prelievi, terapie, fisioterapia, controllo di cateteri e sondini, educazione dei familiari.</li>
      <li>Non comprende la badante né l'aiuto per pulizie e spesa: per quelli si chiede al <strong>Comune</strong> (servizio sociale, SAD) e, se c'è l'invalidità, l'indennità di accompagnamento.</li>
      <li>Per i malati gravi in fase avanzata esistono le <a href="../cure-palliative/index.html">cure palliative a casa</a>.</li>
    </ul>
  </details>`;

const screens = {
  intro: () => ({
    html: `
      <div class="hero" aria-hidden="true">🏠</div>
      <h1>Serve un infermiere o un medico a casa?</h1>
      <p class="lead say">Per chi non può muoversi, l'ASP manda a casa infermieri, fisioterapisti e medici. Si chiama assistenza domiciliare (ADI) ed è gratis.</p>
      <p class="say">Ti spieghiamo come chiederla e cosa fare se nessuno viene.</p>
      <button type="button" class="btn primary big" data-go="province">▶️ Comincia</button>
      <p class="muted say">Non salviamo niente. Non chiediamo la malattia.</p>`,
  }),

  province: () => ({
    html: `${progress(1, 2)}
      <h1>📍 Dove abita la persona?</h1>
      <div class="grid2">${[...data.asl].sort((a, b) => a.province.localeCompare(b.province)).map((a) => choice('', a.province, { province: a.id }, 'stage')).join('')}</div>`,
  }),

  stage: () => ({
    html: `${progress(2, 2)}
      <h1>A che punto sei?</h1>
      ${choice('❓', 'Non ho ancora chiesto niente', { stage: 'none' }, 'howto')}
      ${choice('🧾', 'Il medico ha mandato la richiesta e aspetto', { stage: 'requested' }, 'date')}
      ${choice('⏸️', 'L\'assistenza c\'era ma si è interrotta o è troppo poca', { stage: 'reduced' }, 'reduced')}`,
  }),

  howto: () => ({
    html: `
      <div class="hero" aria-hidden="true">👨‍⚕️</div>
      <h1>Si parte dal medico di famiglia</h1>
      ${steps()}
      ${asp().phones.map((p) => callButton(p.label, p.number)).join('')}
      <p class="say">Quando la richiesta è partita, torna qui con la data: ti diciamo quando sollecitare.</p>
      ${disclaimer(rules.last_verified)}
      ${restartBtn()}`,
  }),

  reduced: () => {
    const a = asp();
    return {
      html: `
        <div class="hero" aria-hidden="true">⏸️</div>
        <h1>Se l'assistenza si ferma o non basta</h1>
        <ol class="big-steps">
          <li class="say"><strong>Chiedi al medico di famiglia</strong> di chiedere una nuova valutazione (rivalutazione) al distretto: il piano si può aumentare.</li>
          <li class="say"><strong>Chiama il PUA del distretto</strong> e chiedi perché si è interrotta e quando riprende. Segnati nome e data.</li>
          <li class="say"><strong>Se non cambia niente:</strong> reclamo all'URP dell'ASP di ${esc(a.province)}${generalContact(a) ? ` (${mailLink(generalContact(a))})` : ''}. Puoi usare la lettera qui sotto.</li>
        </ol>
        ${a.phones.map((p) => callButton(p.label, p.number)).join('')}
        <button type="button" class="btn primary" data-go="letter">✍️ Scriviamo la lettera insieme</button>
        ${disclaimer(rules.last_verified)}`,
    };
  },

  date: () => ({
    html: `
      <h1>🧾 Che giorno è partita la richiesta?</h1>
      <p class="say">Il giorno in cui il medico l'ha mandata al distretto, o in cui l'ospedale ha fatto la dimissione protetta.</p>
      ${dateForm({ id: 'req-form', name: 'requestDate', label: 'Giorno della richiesta', value: state.requestDate, button: '✔️ Controlla', max: todayISO() })}`,
    mount() {
      document.getElementById('req-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = readForm(e.target);
        if (!parseDate(v.requestDate)) return showError('req-form', 'Scrivi il giorno.');
        if (daysBetween(v.requestDate, todayISO()) < 0) return showError('req-form', 'Questo giorno non è ancora arrivato. Controlla la data.');
        state.requestDate = v.requestDate;
        flow.go('result');
      });
    },
  }),

  result: () => {
    const a = asp();
    const waited = daysBetween(state.requestDate, todayISO());
    const remindOn = addDays(state.requestDate, rules.reminder_after_days);
    // Il giorno stesso della scadenza si può già sollecitare. Prima, niente sollecito:
    // la lettera direbbe «non è stata effettuata la valutazione» troppo presto.
    const late = waited >= rules.reminder_after_days;
    return {
      html: `
        <div class="hero" aria-hidden="true">${late ? '⚠️' : '⏳'}</div>
        <h1>${late ? 'Aspetti da troppo: sollecita' : 'La richiesta è partita'}</h1>
        <div class="notice ${late ? 'bad' : 'info'}">
          <p class="say">Hai fatto la richiesta ${art('il', state.requestDate)}${esc(formatIt(state.requestDate))}: sono passati <strong>${days(waited)}</strong>.</p>
          <p class="say">La legge non fissa un numero di giorni per la valutazione a casa. ${late
            ? `Ma ${rules.reminder_after_days} giorni senza notizie sono troppi: è il momento di sollecitare.`
            : `Se entro ${art('il', remindOn)}<strong>${esc(formatIt(remindOn))}</strong> nessuno ti ha chiamato, torna qui per sollecitare.`}</p>
        </div>
        <h2 class="say">Cosa fare</h2>
        <ol class="big-steps">
          <li class="say"><strong>Chiama il PUA del distretto</strong> e chiedi a che punto è la richiesta. Se non sai il numero, chiama l'ASP e chiedi del PUA del tuo comune.</li>
          <li class="say"><strong>Chiedi al medico di famiglia</strong> di sollecitare anche lui: la sua telefonata pesa.</li>
          ${late ? `<li class="say"><strong>Manda un sollecito scritto</strong> al distretto e all'URP dell'ASP di ${esc(a.province)}. Lo scriviamo insieme.</li>` : ''}
        </ol>
        ${a.phones.map((p) => callButton(p.label, p.number)).join('')}
        ${late ? '<button type="button" class="btn primary" data-go="letter">✍️ Scriviamo il sollecito insieme</button>' : ''}
        ${disclaimer(rules.last_verified)}`,
    };
  },

  letter: () => {
    const a = asp();
    const to = generalContact(a);
    const isReminder = state.stage === 'requested';
    return {
      html: `
        <h1>✍️ ${isReminder ? 'Scriviamo il sollecito insieme' : 'Scriviamo la lettera insieme'}</h1>
        <p class="say">Scrivi i dati qui sotto. Noi li mettiamo nella lettera per il distretto dell'ASP di ${esc(a.province)}.</p>
        <div class="notice info"><p class="say">🔒 I dati restano sul tuo telefono. Non chiediamo la malattia. Non sai qualcosa? Lascia vuoto e scrivilo a penna.</p></div>
        <form id="letter-form" novalidate>
          <fieldset>
            <legend>La richiesta</legend>
            <label for="f-district">Comune o distretto<span class="hint">Per esempio «Distretto di Bagheria»</span></label>
            <input id="f-district" name="district" type="text" value="${esc(state.district || '')}">
            <label for="f-doctor">Nome del medico di famiglia<span class="hint">Se lo vuoi scrivere</span></label>
            <input id="f-doctor" name="doctor" type="text" value="${esc(state.doctor || '')}">
          </fieldset>
          ${personFields(person, 'La persona che ha bisogno di assistenza')}
        </form>
        <h2>📄 Ecco la lettera</h2>
        <div id="preview" class="letter"></div>
        ${letterButtons()}
        <p class="say" id="send-hint"></p>
        ${noPecBox()}
        <div class="card"><h3 class="say" style="margin-top:0">Prima di mandarla</h3>
          <ul class="icon-list say">
            <li><span class="ico" aria-hidden="true">🖊️</span> Firma la lettera</li>
            <li><span class="ico" aria-hidden="true">🪪</span> Allega: documento d'identità (fotocopia o foto)</li>
            <li><span class="ico" aria-hidden="true">📄</span> Allega: copia della richiesta del medico, se ce l'hai</li>
            <li class="delegate-note"${person.isDelegate ? '' : ' hidden'}><span class="ico" aria-hidden="true">📝</span> Allega: la delega firmata e il tuo documento</li>
          </ul></div>
        <p class="muted"><a href="${esc(reportErrorHref(`Assistenza domiciliare ${a.name}`))}">Segnala un errore</a></p>
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
      mount() {
        const form = document.getElementById('letter-form');
        const update = () => {
          const v = readForm(form);
          for (const k of ['district', 'doctor']) { state[k] = v[k]; delete v[k]; }
          Object.assign(person, v);
          form.querySelector('.delegate-fields').hidden = !person.isDelegate;
          document.querySelectorAll('.delegate-note').forEach((li) => { li.hidden = !person.isDelegate; });
          const premise = isReminder
            ? [`in data ${formatIt(state.requestDate)} il medico di medicina generale${state.doctor ? ` (dott. ${state.doctor})` : ''} ha inoltrato richiesta di attivazione dell'assistenza domiciliare integrata`,
               'alla data odierna non è stata effettuata la valutazione domiciliare né è pervenuta alcuna comunicazione',
               'le cure domiciliari rientrano nei livelli essenziali di assistenza (art. 22 DPCM 12/01/2017)']
            : ['è in carico al servizio di assistenza domiciliare integrata del distretto',
               'l\'assistenza è stata interrotta o ridotta senza una nuova valutazione',
               'le cure domiciliari rientrano nei livelli essenziali di assistenza (art. 22 DPCM 12/01/2017)'];
          const text = genericRequest({
            to: `Azienda Sanitaria Provinciale di ${a.province}\n${state.district ? `Distretto – ${state.district} – ` : ''}Punto Unico di Accesso\ne p.c. Ufficio Relazioni con il Pubblico`,
            address: to, person,
            subject: isReminder ? `SOLLECITO – Attivazione assistenza domiciliare integrata (richiesta ${art('del', state.requestDate)}${formatIt(state.requestDate)})` : 'Richiesta di rivalutazione del piano di assistenza domiciliare integrata',
            premise,
            request: isReminder
              ? 'la valutazione domiciliare e l\'attivazione dell\'assistenza nel più breve tempo possibile, e di essere informato/a per iscritto sui tempi previsti.'
              : 'una nuova valutazione domiciliare (UVM) e il ripristino o l\'adeguamento del piano di assistenza, e di essere informato/a per iscritto sui tempi previsti.',
            attachments: ['copia del documento di identità', 'copia della richiesta del medico, se disponibile'],
            today: todayISO(),
          });
          state.letterText = text;
          document.getElementById('preview').textContent = text;
          document.getElementById('mail-btn').href = mailtoHref(to, `${isReminder ? 'Sollecito' : 'Richiesta'} assistenza domiciliare${person.fullName ? ` – ${person.fullName}` : ''}`,
            `Buongiorno,\nin allegato la lettera firmata, con i documenti.\n\nCordiali saluti\n${person.fullName || ''}`);
          document.getElementById('send-hint').innerHTML = to
            ? `📧 L'email si apre indirizzata a ${esc(to)}${to === a.pec || /@pec\./.test(to) ? ' (è una PEC: se non hai la PEC, consegna la lettera a mano al distretto o all\'URP)' : ''}. Chiedi sempre una ricevuta.`
            : '🏥 <strong>Stampa la lettera e consegnala al PUA del distretto o all\'URP dell\'ASP.</strong> Fatti dare una ricevuta con la data.';
        };
        form.addEventListener('input', update); form.addEventListener('change', update); update();
        document.getElementById('copy-btn').addEventListener('click', (e) => copyText(state.letterText, e.currentTarget));
        document.getElementById('pdf-btn').addEventListener('click', () => printText(state.letterText));
      },
    };
  },
};

let flow;
(async function init() {
  renderFooter(ROOT);
  try { [rules, data] = await Promise.all([loadJSON(`${ROOT}data/rules-domiciliare.json`), loadJSON(`${ROOT}data/asp-sicilia.json`)]); } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>'; return;
  }
  flow = createFlow({ app, screens, state, sources, person });
  flow.render();
})();
