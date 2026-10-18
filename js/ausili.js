// Modulo 4 — ausili e protesi: «la carrozzina non arriva».
// Regola: l'ASP autorizza entro 20 giorni; se non risponde, l'autorizzazione vale lo stesso
// (art. 18 DPCM 12/01/2017). Non chiediamo mai la malattia.
import { simpleDeadline, todayISO, formatIt, parseDate, daysBetween } from './engine.js';
import { ausiliReminder, mailtoHref } from './letters.js';
import { noPecBox,
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
const deadline = () => simpleDeadline({ fromDate: state.requestDate, days: rules.authorization_days, today: todayISO() });

function sources() {
  const a = state.province ? asp() : null;
  const items = [...rules.sources];
  if (a) {
    if (a.info_url) items.push({ label: `${a.name} – sito ufficiale`, url: a.info_url });
    items.push(...a.sources);
  }
  return [items, { verified: rules.last_verified, note: a ? 'I contatti degli uffici protesica dei distretti sono ancora da raccogliere.' : '' }];
}

const steps = () => `
  <h2 class="say">Come funziona</h2>
  <ol class="big-steps">
    <li class="say"><strong>La prescrizione.</strong> La scrive ${esc(rules.who_prescribes)}. Di solito serve avere l'invalidità riconosciuta, o la domanda già fatta.</li>
    <li class="say"><strong>La domanda all'ASP.</strong> Porti la prescrizione all'ufficio «assistenza protesica» del tuo distretto. Chiedi una ricevuta con la data.</li>
    <li class="say"><strong>L'autorizzazione.</strong> L'ASP deve rispondere entro <strong>${rules.authorization_days} giorni</strong>. Se non risponde, vale come un sì.</li>
    <li class="say"><strong>La consegna.</strong> Un fornitore convenzionato ti porta l'ausilio. Poi il medico lo controlla (si chiama collaudo).</li>
  </ol>`;

const screens = {
  intro: () => ({
    html: `
      <div class="hero" aria-hidden="true">🦽</div>
      <h1>La carrozzina, il letto o i pannoloni non arrivano?</h1>
      <p class="lead say">Hai chiesto un ausilio all'ASP e aspetti da troppo?</p>
      <p class="say">La legge dice che l'ASP deve autorizzare entro <strong>${rules.authorization_days} giorni</strong>. Ti aiutiamo a capire se è tardi e cosa fare.</p>
      <p class="muted say">Vale per: ${esc(rules.examples.join(', '))}.</p>
      <div class="notice info">
        <p class="say"><strong>Prendi questi fogli, se li hai:</strong></p>
        <ul class="icon-list say">
          <li><span class="ico" aria-hidden="true">📄</span> La prescrizione dello specialista</li>
          <li><span class="ico" aria-hidden="true">🧾</span> La ricevuta della domanda all'ASP</li>
        </ul>
      </div>
      <button type="button" class="btn primary big" data-go="province">▶️ Comincia</button>
      <p class="muted say">È gratis. Non salviamo niente. Non ti chiediamo la malattia.</p>`,
  }),

  province: () => ({
    html: `${progress(1, 3)}
      <h1>📍 Dove abita la persona?</h1>
      <p class="say">Scegli la provincia.</p>
      <div class="grid2">${[...data.asl].sort((a, b) => a.province.localeCompare(b.province)).map((a) => choice('📍', a.province, { province: a.id }, 'stage')).join('')}</div>`,
  }),

  stage: () => ({
    html: `${progress(2, 3)}
      <h1>A che punto sei?</h1>
      ${choice('📄', 'Non ho ancora la prescrizione', { stage: 'none' }, 'howto', 'Non so da dove cominciare')}
      ${choice('🧾', 'Ho fatto la domanda all\'ASP e aspetto la risposta', { stage: 'requested' }, 'date')}
      ${choice('✅', 'L\'ASP ha detto sì, ma l\'ausilio non arriva', { stage: 'authorized' }, 'delivery')}`,
  }),

  howto: () => ({
    html: `
      <div class="hero" aria-hidden="true">🩺</div>
      <h1>Si parte dallo specialista</h1>
      ${steps()}
      <div class="notice info"><p class="say">Il medico di famiglia può darti l'impegnativa per la visita dallo specialista. Un patronato o l'URP dell'ASP ti dicono dov'è l'ufficio protesica del tuo distretto.</p></div>
      <p class="say">Quando hai la ricevuta della domanda, torna qui: ti diciamo entro quando l'ASP deve rispondere.</p>
      ${disclaimer(rules.last_verified)}
      ${restartBtn()}`,
  }),

  date: () => ({
    html: `${progress(3, 3)}
      <h1>🧾 Che giorno hai fatto la domanda all'ASP?</h1>
      <p class="say">È scritto sulla ricevuta.</p>
      ${dateForm({ id: 'req-form', name: 'requestDate', label: 'Giorno della domanda', value: state.requestDate, button: '✔️ Controlla', max: todayISO() })}`,
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
            <p class="say">L'ASP deve rispondere entro il <strong>${esc(formatIt(d.deadline))}</strong> (${rules.authorization_days} giorni dalla domanda).</p>
            <p class="say">Se a quella data non hai notizie, torna qui.</p>
          </div>
          ${disclaimer(rules.last_verified)}
          ${restartBtn()}`,
      };
    }
    return {
      html: `
        <div class="hero" aria-hidden="true">⚠️</div>
        <h1>I 20 giorni sono passati: l'autorizzazione vale lo stesso</h1>
        <div class="notice bad">
          <p class="say">L'ASP doveva rispondere entro il <strong>${esc(formatIt(d.deadline))}</strong>. Sono passati <strong>${days(d.daysLate)} in più</strong>.</p>
          <p class="say">Per la legge, se l'ASP non risponde in tempo <strong>l'autorizzazione si considera data</strong>. Ora deve partire la consegna.</p>
        </div>
        <h2 class="say">Cosa fare, in ordine</h2>
        <ol class="big-steps">
          <li class="say"><strong>Telefona o vai all'ufficio protesica</strong> con la ricevuta. Di' che i 20 giorni sono passati.</li>
          <li class="say"><strong>Manda una lettera di sollecito</strong> all'ASP. La scriviamo insieme.</li>
          <li class="say"><strong>Se ancora niente:</strong> reclamo all'URP dell'ASP di ${esc(a.province)}${generalContact(a) ? ` (${mailLink(generalContact(a))})` : ''},
            un patronato, oppure Cittadinanzattiva (<a href="https://www.cittadinanzattiva.it" target="_blank" rel="noopener">cittadinanzattiva.it</a>).</li>
        </ol>
        ${a.phones.map((p) => callButton(p.label, p.number)).join('')}
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
        <p class="say">I tempi di consegna li fissa l'ASP nel contratto con il fornitore: non c'è un numero di giorni uguale per tutti.</p>
        <h2 class="say">Cosa fare, in ordine</h2>
        <ol class="big-steps">
          <li class="say"><strong>Chiama il fornitore</strong> scritto sull'autorizzazione e chiedi la data di consegna.</li>
          <li class="say"><strong>Chiama l'ufficio protesica dell'ASP</strong> e chiedi quanti giorni ha il fornitore per consegnare.</li>
          <li class="say"><strong>Se il tempo è passato:</strong> reclamo scritto all'ASP (URP${generalContact(a) ? `: ${mailLink(generalContact(a))}` : ''}). Un patronato può aiutarti.</li>
        </ol>
        <div class="notice info"><p class="say">Quando l'ausilio arriva, il medico deve controllarlo (collaudo) entro ${rules.collaudo_days} giorni. Se non va bene, può essere sostituito.</p></div>
        ${a.phones.map((p) => callButton(p.label, p.number)).join('')}
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
        <p class="say">Scrivi i dati qui sotto. Noi li mettiamo nella lettera per l'ASP di ${esc(a.province)}.</p>
        <div class="notice info">
          <p class="say">🔒 I dati restano sul tuo telefono. Noi non li vediamo. Non chiediamo la malattia.</p>
          <p class="say">Non sai qualcosa? Lascia vuoto. Dopo aver stampato, lo scrivi a penna.</p>
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
        <p class="muted">La lettera usa le parole degli uffici. In breve dice: «I 20 giorni sono passati, l'autorizzazione vale, consegnate».</p>
        <div id="preview" class="letter"></div>
        ${letterButtons()}
        <p class="say" id="send-hint"></p>
        ${noPecBox()}
        <div class="card">
          <h3 class="say" style="margin-top:0">Prima di mandarla</h3>
          <ul class="icon-list say">
            <li><span class="ico" aria-hidden="true">🖊️</span> Firma la lettera</li>
            <li><span class="ico" aria-hidden="true">🪪</span> Allega: documento d'identità (fotocopia o foto)</li>
            <li><span class="ico" aria-hidden="true">📄</span> Allega: copia della prescrizione e della ricevuta</li>
            ${person.isDelegate ? '<li><span class="ico" aria-hidden="true">📝</span> Allega: la delega firmata e il tuo documento</li>' : ''}
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
          form.querySelector('.delegate-fields').hidden = !person.isDelegate;
          const text = ausiliReminder({
            aspName: a.province, address: to, person, device: state.device, requestDate: state.requestDate,
            protocol: state.protocol, prescriber: state.prescriber, deadline: deadline().deadline, today: todayISO(),
          });
          state.letterText = text;
          document.getElementById('preview').textContent = text;
          document.getElementById('mail-btn').href = mailtoHref(to,
            `Sollecito autorizzazione ausilio${state.device ? ` – ${state.device}` : ''}${person.fullName ? ` – ${person.fullName}` : ''}`,
            `Buongiorno,\nin allegato il sollecito firmato, con i documenti.\n\nCordiali saluti\n${person.fullName || ''}`);
          document.getElementById('send-hint').innerHTML = to
            ? `📨 L'indirizzo dell'ASP è una PEC (${esc(to)}). <strong>Se non hai la PEC, stampa la lettera e consegnala all'ufficio protesica o all'URP</strong>, facendoti dare una ricevuta.`
            : '🏥 <strong>Stampa la lettera e consegnala all\'ufficio protesica o all\'URP dell\'ASP.</strong> Fatti dare una ricevuta con la data.';
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
    [rules, data] = await Promise.all([loadJSON(`${ROOT}data/rules-ausili.json`), loadJSON(`${ROOT}data/asp-sicilia.json`)]);
  } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>';
    return;
  }
  flow = createFlow({ app, screens, state, sources });
  flow.render();
})();
