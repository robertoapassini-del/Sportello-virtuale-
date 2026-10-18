// Modulo 11 — cure palliative e terapia del dolore: «come si attivano?».
// Diritto della L. 38/2010. Spieghiamo i passi, i numeri da chiamare e una lettera di richiesta.
// Scritto con delicatezza: spesso chi legge sta assistendo una persona molto malata.
import { todayISO, formatIt, parseDate, daysBetween, art } from './engine.js';
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
  return [items, { verified: rules.last_verified, note: a ? 'I numeri della rete cure palliative della provincia sono ancora da raccogliere.' : '' }];
}

const whatIs = () => `
  <h2 class="say">Cosa sono e cosa danno</h2>
  <ul class="icon-list say">
    <li><span class="ico" aria-hidden="true">🏠</span> <span><strong>A casa:</strong> medici e infermieri esperti vengono a casa, anche più volte a settimana, con reperibilità telefonica. Controllano il dolore e gli altri sintomi, e aiutano la famiglia.</span></li>
    <li><span class="ico" aria-hidden="true">🏥</span> <span><strong>In hospice:</strong> una struttura dove la persona è seguita giorno e notte, con la famiglia sempre presente. Non è un ospedale.</span></li>
    <li><span class="ico" aria-hidden="true">💶</span> <span><strong>Gratis:</strong> niente ticket, per legge.</span></li>
    <li><span class="ico" aria-hidden="true">❤️</span> <span><strong>Per chi:</strong> non solo per i tumori. Anche per malattie gravi del cuore, dei polmoni, dei reni, neurologiche, in fase avanzata.</span></li>
  </ul>
  <h2 class="say">Come si attivano</h2>
  <ol class="big-steps">
    <li class="say"><strong>Chiedi al medico di famiglia o allo specialista</strong> di attivare le cure palliative. È lui che manda la richiesta alla rete cure palliative dell'ASP (o all'hospice).</li>
    <li class="say"><strong>Se la persona è in ospedale</strong>, chiedi al reparto di attivarle prima delle dimissioni («dimissione protetta»).</li>
    <li class="say"><strong>Un medico della rete valuta</strong> (a casa o in ospedale) e si decide insieme: casa o hospice.</li>
    <li class="say"><strong>L'attivazione deve essere rapida</strong>: di solito pochi giorni. Se passano più di ${rules.reminder_after_days} giorni, chiama di nuovo e sollecita.</li>
  </ol>
  <details class="card">
    <summary>Il dolore non deve essere sopportato</summary>
    <p>La legge 38/2010 dice che il dolore va misurato e curato, in ospedale e a casa. Se il dolore non è controllato, chiedi al medico la <strong>terapia del dolore</strong> o la visita in un <strong>centro di terapia del dolore</strong>. Le medicine forti contro il dolore (oppioidi) si possono prescrivere con la ricetta normale.</p>
  </details>`;

const screens = {
  intro: () => ({
    html: `
      <div class="hero" aria-hidden="true">🕊️</div>
      <h1>Cure palliative: aiuto a casa o in hospice</h1>
      <p class="lead say">Quando una malattia è grave e avanzata, la persona ha diritto a non soffrire e a essere curata a casa o in hospice, gratis.</p>
      <p class="say">Ti spieghiamo come si chiedono e cosa fare se non si attivano.</p>
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
      ${choice('❓', 'Vorrei capire come funziona', { stage: 'none' }, 'howto')}
      ${choice('🧾', 'Il medico ha fatto la richiesta e aspettiamo', { stage: 'requested' }, 'date')}
      ${choice('😣', 'Il dolore non è controllato', { stage: 'pain' }, 'pain')}`,
  }),

  howto: () => ({
    html: `
      <div class="hero" aria-hidden="true">🤲</div>
      <h1>Come funziona</h1>
      ${whatIs()}
      ${asp().phones.map((p) => callButton(p.label, p.number)).join('')}
      <button type="button" class="btn primary" data-go="letter">✍️ Prepara una richiesta scritta</button>
      ${disclaimer(rules.last_verified)}
      ${restartBtn()}`,
  }),

  pain: () => {
    const a = asp();
    return {
      html: `
        <div class="hero" aria-hidden="true">😣</div>
        <h1>Il dolore si può curare</h1>
        <ol class="big-steps">
          <li class="say"><strong>Chiama oggi il medico di famiglia</strong> (o la guardia medica la sera e nei festivi) e di' che il dolore non è controllato. Può cambiare la terapia subito.</li>
          <li class="say"><strong>Chiedi la terapia del dolore</strong> o l'attivazione delle cure palliative: è un diritto (legge 38/2010).</li>
          <li class="say"><strong>Se è già seguita dalla rete</strong>, chiama il numero di reperibilità che vi hanno dato: serve anche per questo.</li>
        </ol>
        <div class="notice urgent"><p class="say">Se la situazione precipita, chiama il <a href="tel:112">112</a>.</p></div>
        ${a.phones.map((p) => callButton(p.label, p.number)).join('')}
        ${whatIs()}
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
    };
  },

  date: () => ({
    html: `
      <h1>🧾 Che giorno è partita la richiesta?</h1>
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
    const late = waited > rules.reminder_after_days;
    return {
      html: `
        <div class="hero" aria-hidden="true">${late ? '⚠️' : '⏳'}</div>
        <h1>${late ? 'Troppo tempo: sollecita oggi' : 'La richiesta è partita'}</h1>
        <div class="notice ${late ? 'bad' : 'info'}">
          <p class="say">Richiesta ${art('del', state.requestDate)}${esc(formatIt(state.requestDate))}: sono passati <strong>${days(waited)}</strong>.</p>
          <p class="say">Le cure palliative devono partire in pochi giorni. ${late ? 'Non aspettare oltre.' : `Se entro ${rules.reminder_after_days} giorni dalla richiesta nessuno si è fatto vivo, sollecita.`}</p>
        </div>
        <h2 class="say">Cosa fare</h2>
        <ol class="big-steps">
          <li class="say"><strong>Chiama il medico che ha fatto la richiesta</strong> e chiedigli di telefonare lui alla rete cure palliative.</li>
          <li class="say"><strong>Chiama l'ASP</strong> e chiedi il numero della rete cure palliative o dell'hospice della tua zona.</li>
          <li class="say"><strong>Manda una richiesta scritta</strong> all'ASP di ${esc(a.province)}${generalContact(a) ? ` (${mailLink(generalContact(a))})` : ''}. La scriviamo insieme.</li>
        </ol>
        ${a.phones.map((p) => callButton(p.label, p.number)).join('')}
        <button type="button" class="btn primary" data-go="letter">✍️ Scriviamo la richiesta insieme</button>
        ${disclaimer(rules.last_verified)}`,
    };
  },

  letter: () => {
    const a = asp();
    const to = generalContact(a);
    const isReminder = state.stage === 'requested';
    return {
      html: `
        <h1>✍️ Scriviamo la richiesta insieme</h1>
        <p class="say">Scrivi i dati qui sotto. Noi li mettiamo nella lettera per l'ASP di ${esc(a.province)}.</p>
        <div class="notice info"><p class="say">🔒 I dati restano sul tuo telefono. Non scriviamo la malattia: il medico la conosce già. Non sai qualcosa? Lascia vuoto.</p></div>
        <form id="letter-form" novalidate>
          <fieldset>
            <legend>La richiesta</legend>
            <label for="f-doctor">Medico che segue la persona<span class="hint">Medico di famiglia o specialista. Se vuoi</span></label>
            <input id="f-doctor" name="doctor" type="text" value="${esc(state.doctor || '')}">
            <label for="f-pref">Dove preferite le cure?</label>
            <select id="f-pref" name="pref"><option value="casa" ${state.pref !== 'hospice' ? 'selected' : ''}>A casa</option><option value="hospice" ${state.pref === 'hospice' ? 'selected' : ''}>In hospice</option></select>
          </fieldset>
          ${personFields(person, 'La persona malata')}
        </form>
        <h2>📄 Ecco la lettera</h2>
        <div id="preview" class="letter"></div>
        ${letterButtons()}
        <p class="say" id="send-hint"></p>
        ${noPecBox()}
        <p class="muted"><a href="${esc(reportErrorHref(`Cure palliative ${a.name}`))}">Segnala un errore</a></p>
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
      mount() {
        const form = document.getElementById('letter-form');
        const update = () => {
          const v = readForm(form);
          for (const k of ['doctor', 'pref']) { state[k] = v[k]; delete v[k]; }
          Object.assign(person, v);
          form.querySelector('.delegate-fields').hidden = !person.isDelegate;
          const where = state.pref === 'hospice' ? 'in regime residenziale (hospice)' : 'a domicilio';
          const premise = [
            `è affetto/a da una patologia in fase avanzata, come da documentazione del medico curante${state.doctor ? ` (dott. ${state.doctor})` : ''}`,
            ...(isReminder ? [`in data ${formatIt(state.requestDate)} è stata inoltrata richiesta di attivazione delle cure palliative, senza riscontro alla data odierna`] : []),
            'la L. 38/2010 garantisce l\'accesso alle cure palliative e alla terapia del dolore, senza oneri a carico dell\'assistito',
          ];
          const text = genericRequest({
            to: `Azienda Sanitaria Provinciale di ${a.province}\nRete locale di cure palliative\ne p.c. Ufficio Relazioni con il Pubblico`,
            address: to, person,
            subject: `${isReminder ? 'SOLLECITO – ' : ''}Richiesta di attivazione delle cure palliative ${where} (L. 38/2010)`,
            premise,
            request: `l'attivazione urgente delle cure palliative ${where}, con la presa in carico da parte dell'équipe della rete, e di essere contattato/a al più presto ai recapiti indicati.`,
            attachments: ['copia del documento di identità', 'documentazione del medico curante'],
            today: todayISO(),
          });
          state.letterText = text;
          document.getElementById('preview').textContent = text;
          document.getElementById('mail-btn').href = mailtoHref(to, `${isReminder ? 'Sollecito' : 'Richiesta'} attivazione cure palliative${person.fullName ? ` – ${person.fullName}` : ''}`,
            `Buongiorno,\nin allegato la richiesta firmata, con i documenti.\n\nCordiali saluti\n${person.fullName || ''}`);
          document.getElementById('send-hint').innerHTML = to
            ? `📧 L'email si apre indirizzata a ${esc(to)}${to === a.pec || /@pec\./.test(to) ? ' (è una PEC: se non hai la PEC, consegna la lettera a mano)' : ''}. Chiama comunque: una telefonata del medico è spesso la via più veloce.`
            : '🏥 <strong>Stampa la lettera e consegnala all\'URP dell\'ASP o al distretto.</strong> Chiama comunque: una telefonata del medico è spesso la via più veloce.';
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
  try { [rules, data] = await Promise.all([loadJSON(`${ROOT}data/rules-palliative.json`), loadJSON(`${ROOT}data/asp-sicilia.json`)]); } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>'; return;
  }
  flow = createFlow({ app, screens, state, sources, person });
  flow.render();
})();
