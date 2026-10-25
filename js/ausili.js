// Modulo 4 — ausili e protesi: «la carrozzina non arriva».
// Prima la risposta: la pagina mostra subito la risposta scritta; il conto e il sollecito partono dal pulsante.
// Regola: il tempo per autorizzare lo fissa la Regione (DPCM 12/01/2017, art. 17-19 e allegato 12). Il conto si fa solo per la Sicilia
// (si arriva scegliendo una provincia siciliana): 20 giorni. Il silenzio-assenso non si scrive finché il
// D.A. 20/12/2011 non è letto: pagine e lettera chiedono solo l'autorizzazione senza altro ritardo. Non chiediamo mai la malattia.
import { simpleDeadline, todayISO, formatIt, parseDate, daysBetween, art } from './engine.js';
import { ausiliReminder, mailtoHref, conZona } from './letters.js';
import { noPecBox,
  esc, loadJSON, loadRegional, disclaimer, renderFooter, avvisoErrore, copyText, printText, readForm, aspCalls, officeBox, personFields, reportErrorHref, complaintTo, aslLabel, mailLink, generalContact, syncDelegate, delegateNoteText, fontiNazionali,
} from './common.js';
import { createFlow, choice, restartBtn, days, progress, dateForm, showError, letterButtons, provinceChoice, zonaScreen, intestazioneAzienda } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
// La risposta scritta della pagina: è la prima schermata del percorso.
const answerHtml = app.innerHTML;
let rules;
let data;
const state = {};
const person = {};

// L'azienda della provincia scelta, con i campi della zona al posto dei suoi (js/letters.js).
const aziendaBase = () => data.asl.find((a) => a.id === state.province);
const asp = () => conZona(aziendaBase(), state.zona);
const deadline = () => simpleDeadline({ fromDate: state.requestDate, days: rules.authorization_days, today: todayISO() });

function sources() {
  const a = state.province ? asp() : null;
  const items = fontiNazionali(rules.sources);
  if (a) {
    if (a.info_url) items.push({ label: `${a.name} – sito ufficiale`, url: a.info_url });
    items.push(...a.sources);
  }
  return [items, { verified: rules.last_verified, note: a && !(a.contacts || []).some((c) => c.topic === 'protesica') ? `I contatti degli uffici protesica di questa ${aslLabel()} non sono ancora confermati.` : '' }];
}

const steps = () => `
  <h2>Come funziona</h2>
  <ol class="big-steps">
    <li><strong>La prescrizione.</strong> La scrive ${esc(rules.who_prescribes)}. Di solito serve avere l'invalidità riconosciuta, o la domanda già fatta. Per pannoloni e traverse le regole di prescrizione cambiano da regione a regione: chiedi al distretto chi può prescriverli.</li>
    <li><strong>La domanda all'${aslLabel()}.</strong> Porti la prescrizione all'ufficio «assistenza protesica» del tuo distretto. Chiedi una ricevuta con la data.</li>
    <li><strong>L'autorizzazione.</strong> L'${aslLabel()} deve rispondere entro <strong>${rules.authorization_days} giorni</strong>. Se non risponde, manda un sollecito.</li>
    <li><strong>La consegna.</strong> Un fornitore convenzionato ti porta l'ausilio. Poi vai dal medico che lo controlla (si chiama collaudo), entro ${rules.collaudo_days} giorni.</li>
  </ol>`;

// Uffici protesi e ausili della provincia, con indirizzo e orari.
const protesica = (a) => officeBox(a, 'protesica', "🏥 Dov'è l'ufficio protesi e ausili", 'Vai o chiama quello del tuo distretto.');

const screens = {
  // Prima schermata: la risposta scritta che è già nella pagina (vedi index.html).
  // Così «Ricomincia» e il tasto Indietro riportano alla risposta, non a una presentazione.
  intro: () => ({ html: answerHtml }),

  // «In quale zona?»: solo se l'azienda della provincia ha zone con una lettera diversa (js/letters.js).
  zona: () => zonaScreen(aziendaBase(), 'stage'),

  province: () => ({
    html: `${progress(1, 3)}
      <h1>📍 Dove abita la persona?</h1>
      <p>Scegli la provincia.</p>
      <div class="grid2">${[...data.asl].sort((a, b) => a.province.localeCompare(b.province)).map((a) => provinceChoice(a, 'stage')).join('')}</div>`,
  }),

  stage: () => ({
    html: `${progress(2, 3)}
      <h1>A che punto sei?</h1>
      ${choice('📄', 'Non ho ancora la prescrizione', { stage: 'none' }, 'howto', 'Non so da dove cominciare')}
      ${choice('🧾', `Ho fatto la domanda all'${aslLabel()} e aspetto la risposta`, { stage: 'requested' }, 'date')}
      ${choice('✅', `L'${aslLabel()} ha detto sì, ma l'ausilio non arriva`, { stage: 'authorized' }, 'delivery')}`,
  }),

  howto: () => ({
    html: `
      <div class="hero" aria-hidden="true">🩺</div>
      <h1>Si parte dallo specialista</h1>
      ${steps()}
      <div class="notice info"><p>Il medico di famiglia può darti l'impegnativa per la visita dallo specialista.${(asp().contacts || []).some((c) => c.topic === 'protesica') ? '' : ` Un patronato o l'URP dell'${aslLabel()} ti dicono dov'è l'ufficio protesica del tuo distretto.`}</p></div>
      ${protesica(asp())}
      <p>Quando hai la ricevuta della domanda, torna qui: ti diciamo entro quando l'${aslLabel()} deve rispondere.</p>
      ${disclaimer(rules.last_verified)}
      ${restartBtn()}`,
  }),

  date: () => ({
    html: `${progress(3, 3)}
      <h1>🧾 Che giorno hai fatto la domanda all'${aslLabel()}?</h1>
      <p>È scritto sulla ricevuta.</p>
      ${dateForm({ id: 'req-form', name: 'requestDate', label: 'Giorno della domanda', value: state.requestDate, button: '✔️ Controlla', max: todayISO() })}`,
    mount() {
      document.getElementById('req-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = readForm(e.target);
        if (parseDate(v.requestDate) === null) return showError('req-form', 'Scrivi il giorno.');
        if (daysBetween(v.requestDate, todayISO()) < 0) return showError('req-form', 'Questo giorno non è ancora arrivato. Controlla la data.');
        state.requestDate = v.requestDate;
        flow.go('result');
      });
    },
  }),

  result: () => {
    const d = deadline();
    const a = asp();
    if (d.status === 'error') return { html: `<h1>Controlla la data</h1>${restartBtn()}` };
    if (d.status === 'waiting') {
      return {
        html: `
          <div class="hero" aria-hidden="true">⏳</div>
          <h1>Non è ancora tardi</h1>
          <div class="notice ok">
            <p>L'${aslLabel()} deve rispondere entro ${art('il', d.deadline)}<strong>${esc(formatIt(d.deadline))}</strong> (${rules.authorization_days} giorni dalla domanda).</p>
            <p>Se a quella data non hai notizie, torna qui.</p>
          </div>
          ${disclaimer(rules.last_verified)}
          ${restartBtn()}`,
      };
    }
    return {
      html: `
        <div class="hero" aria-hidden="true">⚠️</div>
        <h1>I ${rules.authorization_days} giorni sono passati: manda il sollecito</h1>
        <div class="notice bad">
          <p>L'${aslLabel()} doveva rispondere entro ${art('il', d.deadline)}<strong>${esc(formatIt(d.deadline))}</strong>. ${d.daysLate === 1 ? 'È passato' : 'Sono passati'} <strong>${days(d.daysLate)} in più</strong>.</p>
          <p>Chiedi l'autorizzazione e la consegna senza altro ritardo.</p>
        </div>
        <h2>Cosa fare, in ordine</h2>
        <ol class="big-steps">
          <li><strong>Telefona o vai all'ufficio protesica</strong> con la ricevuta. Di' che i ${rules.authorization_days} giorni sono passati.</li>
          <li><strong>Manda una lettera di sollecito</strong> all'${aslLabel()}. La scriviamo insieme.</li>
          <li><strong>Se ancora niente:</strong> reclamo ${complaintTo(a)},
            un patronato, oppure Cittadinanzattiva (<a href="https://www.cittadinanzattiva.it" target="_blank" rel="noopener">cittadinanzattiva.it</a>).</li>
        </ol>
        ${protesica(a) || aspCalls(a)}
        <button type="button" class="btn primary" data-go="letter">✍️ Scriviamo il sollecito insieme</button>
        ${disclaimer(rules.last_verified)}`,
    };
  },

  delivery: () => {
    const a = asp();
    return {
      html: `
        <div class="hero" aria-hidden="true">🚚</div>
        <h1>Autorizzato ma non consegnato</h1>
        <p>I tempi di consegna li fissa l'${aslLabel()} nel contratto con il fornitore: non c'è un numero di giorni uguale per tutti.</p>
        <h2>Cosa fare, in ordine</h2>
        <ol class="big-steps">
          <li><strong>Chiama il fornitore</strong> scritto sull'autorizzazione e chiedi la data di consegna.</li>
          <li><strong>Chiama l'ufficio protesica dell'${aslLabel()}</strong> e chiedi quanti giorni ha il fornitore per consegnare.</li>
          <li><strong>Se il tempo è passato:</strong> reclamo scritto ${complaintTo(a)}. Un patronato può aiutarti.</li>
        </ol>
        <div class="notice info"><p>Quando l'ausilio arriva, entro ${rules.collaudo_days} giorni devi andare al collaudo dal medico che l'ha prescritto (o chiedere la visita a casa con la richiesta del medico di famiglia). Se non ci vai senza un motivo, l'${aslLabel()} può farti pagare l'ausilio. Se l'ausilio non va bene, può essere sostituito.</p></div>
        ${protesica(a) || aspCalls(a)}
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
    };
  },

  letter: () => {
    const a = asp();
    const to = a.pec || '';
    return {
      html: `
        <h1>✍️ Scriviamo il sollecito insieme</h1>
        <p>Scrivi i dati qui sotto. Noi li mettiamo nella lettera per l'${aslLabel()} di ${esc(a.province)}.</p>
        <div class="notice info">
          <p>🔒 I dati restano sul tuo telefono. Noi non li vediamo. Non chiediamo la malattia.</p>
          <p>Non sai qualcosa? Lascia vuoto. Dopo aver stampato, lo scrivi a penna.</p>
        </div>
        <form id="letter-form" novalidate>
          <fieldset>
            <legend>L'ausilio</legend>
            <label for="f-device">Cosa hai chiesto?<span class="hint">Per esempio «carrozzina pieghevole», «letto ortopedico», «pannoloni»</span></label>
            <input id="f-device" name="device" type="text" value="${esc(state.device || '')}">
            <label for="f-prescriber">Chi l'ha prescritto?<span class="hint">Per esempio «fisiatra dell'ospedale di …». Se non ricordi, lascia vuoto</span></label>
            <input id="f-prescriber" name="prescriber" type="text" value="${esc(state.prescriber || '')}">
            <label for="f-protocol">Numero della ricevuta<span class="hint">Se c'è</span></label>
            <input id="f-protocol" name="protocol" type="text" value="${esc(state.protocol || '')}">
          </fieldset>
          ${personFields(person, 'La persona che ha bisogno dell\'ausilio')}
        </form>
        <h2>📄 Ecco il tuo sollecito</h2>
        <p class="muted">La lettera usa le parole degli uffici. In breve dice: «I ${rules.authorization_days} giorni sono passati: autorizzate e consegnate senza altro ritardo».</p>
        <div id="preview" class="letter"></div>
        ${letterButtons()}
        <p id="send-hint"></p>
        ${noPecBox()}
        <div class="card">
          <h3 style="margin-top:0">Prima di mandarla</h3>
          <ul class="icon-list">
            <li><span class="ico" aria-hidden="true">🖊️</span> Firma la lettera</li>
            <li><span class="ico" aria-hidden="true">🪪</span> Allega: documento d'identità (fotocopia o foto)</li>
            <li><span class="ico" aria-hidden="true">📄</span> Allega: copia della prescrizione e della ricevuta</li>
            <li class="delegate-note"${person.isDelegate ? '' : ' hidden'}><span class="ico" aria-hidden="true">📝</span> <span class="delegate-note-text">${esc(delegateNoteText(person))}</span></li>
          </ul>
        </div>
        <p class="muted"><a href="${esc(reportErrorHref(`Ausili ${a.name}`))}">Segnala un errore</a></p>
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
      mount() {
        const form = document.getElementById('letter-form');
        const update = () => {
          const v = readForm(form);
          for (const k of ['device', 'prescriber', 'protocol']) { state[k] = v[k]; delete v[k]; }
          Object.assign(person, v);
          syncDelegate(form, person);
          const text = ausiliReminder({
            intestazione: intestazioneAzienda(a),
            aspName: a.province, address: to, person, device: state.device, requestDate: state.requestDate,
            protocol: state.protocol, prescriber: state.prescriber, deadline: deadline().deadline, days: rules.authorization_days, today: todayISO(),
          });
          state.letterText = text;
          document.getElementById('preview').textContent = text;
          document.getElementById('mail-btn').href = mailtoHref(to,
            `Sollecito autorizzazione ausilio${state.device ? ` – ${state.device}` : ''}${person.fullName ? ` – ${person.fullName}` : ''}`,
            `Buongiorno,\nin allegato il sollecito firmato, con i documenti.\n\nCordiali saluti\n${person.fullName || ''}`);
          document.getElementById('send-hint').innerHTML = to
            ? `📨 L'indirizzo dell'${aslLabel()} è una PEC (${esc(to)}). <strong>Se non hai la PEC, stampa la lettera e consegnala all'ufficio protesica o all'URP</strong>, facendoti dare una ricevuta.`
            : `🏥 <strong>Stampa la lettera e consegnala all'ufficio protesica o all'URP dell'${aslLabel()}.</strong> Fatti dare una ricevuta con la data.`;
        };
        form.addEventListener('input', update);
        form.addEventListener('change', update);
        update();
        document.getElementById('copy-btn').addEventListener('click', (e) => copyText(state.letterText, e.currentTarget));
        document.getElementById('pdf-btn').addEventListener('click', () => printText(state.letterText));
      },
    };
  },
};

let flow;
(async function init() {
  renderFooter(ROOT);
  try {
    [rules, data] = await Promise.all([loadJSON(`${ROOT}data/rules-ausili.json`), loadRegional(ROOT, 'asl')]);
  } catch {
    avvisoErrore(); // la risposta scritta nella pagina resta, con l'avviso sopra
    return;
  }
  flow = createFlow({ app, screens, state, sources, person });
  flow.render();
})();
