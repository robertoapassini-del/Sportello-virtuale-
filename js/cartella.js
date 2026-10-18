// Modulo 3 — cartella clinica e referti: «non me li danno».
// Regola: l'ospedale o l'ASP deve rispondere entro 30 giorni (art. 25 L. 241/1990).
// Non chiediamo mai la malattia: solo il nome della struttura e le date.
import { simpleDeadline, todayISO, formatIt, parseDate, daysBetween } from './engine.js';
import { cartellaReminder, mailtoHref } from './letters.js';
import {
  esc, loadJSON, disclaimer, renderFooter, copyText, printText, readForm, mailLink, callButton, personFields, reportErrorHref, generalContact,
} from './common.js';
import { createFlow, choice, restartBtn, days, progress, dateForm, showError, letterButtons } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
let rules;
let data;
const state = {};
const person = {};

const asp = () => data.asl.find((a) => a.id === state.province);
const deadline = () => simpleDeadline({ fromDate: state.requestDate, days: rules.deadline_days, today: todayISO() });

const whatLabel = { cartella: 'la cartella clinica', referti: 'i referti o le immagini', altro: 'i documenti sanitari' };

function sources() {
  const a = state.province ? asp() : null;
  const items = [...rules.sources];
  if (a) {
    if (a.info_url) items.push({ label: `${a.name} – sito ufficiale`, url: a.info_url });
    items.push(...a.sources);
  }
  return [items, { verified: rules.last_verified }];
}

const howToAsk = () => `
  <h2 class="say">Come si chiede</h2>
  <ol class="big-steps">
    <li class="say"><strong>Vai all'ufficio cartelle cliniche</strong> dell'ospedale (a volte si chiama «Direzione sanitaria» o «Archivio»). Oppure all'URP. Molti ospedali hanno anche un modulo sul sito.</li>
    <li class="say"><strong>Porta la carta d'identità.</strong> Se chiedi per un familiare, serve una <strong>delega firmata</strong> da lui e la copia del suo documento. Se la persona è morta, serve una dichiarazione di essere erede.</li>
    <li class="say"><strong>Chiedi una ricevuta</strong> con il giorno della richiesta. Da quel giorno partono i ${rules.deadline_days} giorni.</li>
    <li class="say"><strong>Chiedi quanto costa.</strong> La copia si paga (di solito pochi euro, di più se ci sono le immagini). Il referto di una visita o di un esame fatto da poco è spesso gratis.</li>
  </ol>`;

const screens = {
  intro: () => ({
    html: `
      <div class="hero" aria-hidden="true">📁</div>
      <h1>Non ti danno la cartella clinica o i referti?</h1>
      <p class="lead say">Hai chiesto una copia all'ospedale, ma non arriva?</p>
      <p class="say">La legge dice che devono dartela entro <strong>${rules.deadline_days} giorni</strong>. Ti aiutiamo a capire se sono in ritardo e cosa fare.</p>
      <div class="notice info">
        <p class="say"><strong>Prendi questo foglio, se ce l'hai:</strong></p>
        <ul class="icon-list say"><li><span class="ico" aria-hidden="true">🧾</span> La ricevuta della richiesta</li></ul>
      </div>
      <button type="button" class="btn primary big" data-go="province">▶️ Comincia</button>
      <p class="muted say">È gratis. Non salviamo niente.</p>`,
  }),

  province: () => ({
    html: `${progress(1, 3)}
      <h1>📍 In quale provincia è l'ospedale?</h1>
      <div class="grid2">${[...data.asl].sort((a, b) => a.province.localeCompare(b.province)).map((a) => choice('📍', a.province, { province: a.id }, 'what')).join('')}</div>`,
  }),

  what: () => ({
    html: `${progress(2, 3)}
      <h1>📄 Cosa ti serve?</h1>
      ${choice('📁', 'La cartella clinica', { what: 'cartella' }, 'asked', 'Tutti i fogli di un ricovero in ospedale')}
      ${choice('🔬', 'I referti o le immagini', { what: 'referti' }, 'asked', 'Il risultato di una visita, di un esame, di una radiografia')}
      ${choice('📎', 'Altri documenti sanitari', { what: 'altro' }, 'asked', 'Per esempio il verbale del pronto soccorso')}`,
  }),

  asked: () => ({
    html: `${progress(3, 3)}
      <h1>Hai già fatto la richiesta per iscritto?</h1>
      <p class="say">Per esempio con un modulo all'ufficio cartelle cliniche, o per email o PEC.</p>
      ${choice('✅', 'Sì, ho già fatto la richiesta', { asked: true }, 'date')}
      ${choice('❌', 'No, non ancora', { asked: false }, 'howto')}
      ${choice('🗣️', 'L\'ho chiesta solo a voce', { asked: false }, 'howto', 'Al reparto o al telefono')}`,
  }),

  howto: () => ({
    html: `
      <div class="hero" aria-hidden="true">✍️</div>
      <h1>Prima fai la richiesta per iscritto</h1>
      <p class="say">I ${rules.deadline_days} giorni partono solo da una richiesta scritta. A voce non conta.</p>
      ${howToAsk()}
      <div class="notice info"><p class="say">Quando hai la ricevuta, torna qui: ti diciamo entro quando devono rispondere.</p></div>
      ${disclaimer(rules.last_verified)}
      ${restartBtn()}`,
  }),

  date: () => ({
    html: `
      <h1>🧾 Che giorno hai fatto la richiesta?</h1>
      <p class="say">È scritto sulla ricevuta, o sull'email che hai mandato.</p>
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
    const d = deadline();
    const a = asp();
    if (d.status === 'error') return { html: `<h1>Controlla la data</h1>${restartBtn()}` };
    if (d.status === 'waiting') {
      return {
        html: `
          <div class="hero" aria-hidden="true">⏳</div>
          <h1>Non è ancora tardi</h1>
          <div class="notice ok">
            <p class="say">Devono darti ${whatLabel[state.what]} entro il <strong>${esc(formatIt(d.deadline))}</strong> (${rules.deadline_days} giorni dalla richiesta).</p>
            <p class="say">Se a quella data non hai niente, torna qui.</p>
          </div>
          <p class="say">Nel frattempo puoi telefonare all'ufficio cartelle cliniche e chiedere a che punto è.</p>
          ${disclaimer(rules.last_verified)}
          ${restartBtn()}`,
      };
    }
    return {
      html: `
        <div class="hero" aria-hidden="true">⚠️</div>
        <h1>Sono in ritardo: puoi sollecitare</h1>
        <div class="notice bad">
          <p class="say">Dovevano darti ${whatLabel[state.what]} entro il <strong>${esc(formatIt(d.deadline))}</strong>.</p>
          <p class="say">Sono passati <strong>${days(d.daysLate)} in più</strong>.</p>
        </div>
        <h2 class="say">Cosa fare, in ordine</h2>
        <ol class="big-steps">
          <li class="say"><strong>Telefona o vai all'ufficio cartelle cliniche</strong> con la ricevuta. Spesso basta questo.</li>
          <li class="say"><strong>Manda una lettera di sollecito</strong> alla Direzione sanitaria dell'ospedale. La scriviamo insieme.</li>
          <li class="say"><strong>Se ancora niente:</strong> reclamo all'URP dell'ASP di ${esc(a.province)}${generalContact(a) ? ` (${mailLink(generalContact(a))})` : ''}, oppure a Cittadinanzattiva
            (<a href="https://www.cittadinanzattiva.it" target="_blank" rel="noopener">cittadinanzattiva.it</a>). Un avvocato può fare ricorso al TAR entro 30 giorni.</li>
        </ol>
        ${a.phones.map((p) => callButton(p.label, p.number)).join('')}
        <button type="button" class="btn primary" data-go="letter">✍️ Scriviamo il sollecito insieme</button>
        ${disclaimer(rules.last_verified)}`,
    };
  },

  letter: () => {
    const a = asp();
    return {
      html: `
        <h1>✍️ Scriviamo il sollecito insieme</h1>
        <p class="say">Scrivi i dati qui sotto. Noi li mettiamo nella lettera.</p>
        <div class="notice info">
          <p class="say">🔒 I dati restano sul tuo telefono. Noi non li vediamo. Non chiediamo la malattia.</p>
          <p class="say">Non sai qualcosa? Lascia vuoto. Dopo aver stampato, lo scrivi a penna.</p>
        </div>
        <form id="letter-form" novalidate>
          <fieldset>
            <legend>L'ospedale</legend>
            <label for="f-structure">Nome dell'ospedale o della struttura<span class="hint">Per esempio «Ospedale Civico di Palermo»</span></label>
            <input id="f-structure" name="structure" type="text" value="${esc(state.structure || '')}">
            <label for="f-structureEmail">Email o PEC dell'ospedale<span class="hint">Se la conosci. Altrimenti lascia vuoto e consegna la lettera a mano</span></label>
            <input id="f-structureEmail" name="structureEmail" type="email" value="${esc(state.structureEmail || '')}">
            <label for="f-episode">Di quando?<span class="hint">Per esempio «ricovero di marzo 2026» o «visita del 5 settembre». Non scrivere la malattia</span></label>
            <input id="f-episode" name="episode" type="text" value="${esc(state.episode || '')}">
            <label for="f-protocol">Numero della ricevuta<span class="hint">Se c'è</span></label>
            <input id="f-protocol" name="protocol" type="text" value="${esc(state.protocol || '')}">
          </fieldset>
          ${personFields(person, 'La persona a cui si riferiscono i documenti')}
        </form>
        <h2>📄 Ecco il tuo sollecito</h2>
        <p class="muted">La lettera usa le parole degli uffici. In breve dice: «Sono in ritardo, datemi i documenti».</p>
        <div id="preview" class="letter"></div>
        ${letterButtons()}
        <p class="say" id="send-hint"></p>
        <div class="card">
          <h3 class="say" style="margin-top:0">Prima di mandarla</h3>
          <ul class="icon-list say">
            <li><span class="ico" aria-hidden="true">🖊️</span> Firma la lettera</li>
            <li><span class="ico" aria-hidden="true">🪪</span> Allega: documento d'identità (fotocopia o foto)</li>
            <li><span class="ico" aria-hidden="true">🧾</span> Allega: copia della prima richiesta o della ricevuta</li>
            ${person.isDelegate ? '<li><span class="ico" aria-hidden="true">📝</span> Allega: la delega firmata e il tuo documento</li>' : ''}
          </ul>
        </div>
        <p class="muted">Se l'ospedale è dell'ASP, la PEC generale è ${a.pec ? mailLink(a.pec) : 'da chiedere all\'URP'}. I grandi ospedali (Policlinico, Cannizzaro, Papardo, Civico, Villa Sofia…) hanno una PEC loro: cercala sul sito dell'ospedale.
          <a href="${esc(reportErrorHref(`Cartella clinica ${a.name}`))}">Segnala un errore</a></p>
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
      mount() {
        const form = document.getElementById('letter-form');
        const update = () => {
          const v = readForm(form);
          for (const k of ['structure', 'structureEmail', 'episode', 'protocol']) { state[k] = v[k]; delete v[k]; }
          Object.assign(person, v);
          form.querySelector('.delegate-fields').hidden = !person.isDelegate;
          const d = deadline();
          const text = cartellaReminder({
            structure: state.structure ? `Direzione Sanitaria – ${state.structure}` : '', address: state.structureEmail, person,
            requestDate: state.requestDate, protocol: state.protocol, what: whatLabel[state.what].replace(/^(la|i) /, ''),
            episode: state.episode, deadline: d.deadline, today: todayISO(),
          });
          state.letterText = text;
          document.getElementById('preview').textContent = text;
          document.getElementById('mail-btn').href = mailtoHref(state.structureEmail || '',
            `Sollecito copia ${whatLabel[state.what].replace(/^(la|i) /, '')}${person.fullName ? ` – ${person.fullName}` : ''}`,
            `Buongiorno,\nin allegato il sollecito firmato, con i documenti.\n\nCordiali saluti\n${person.fullName || ''}`);
          document.getElementById('send-hint').innerHTML = state.structureEmail
            ? `📧 L'email si apre indirizzata a ${esc(state.structureEmail)}. Se è una PEC e non hai la PEC, stampa la lettera e consegnala a mano, facendoti dare una ricevuta.`
            : '🏥 <strong>Stampa la lettera e consegnala all\'ufficio cartelle cliniche o all\'URP dell\'ospedale.</strong> Fatti dare una ricevuta con la data.';
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
    [rules, data] = await Promise.all([loadJSON(`${ROOT}data/rules-cartella.json`), loadJSON(`${ROOT}data/asp-sicilia.json`)]);
  } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>';
    return;
  }
  flow = createFlow({ app, screens, state, sources });
  flow.render();
})();
