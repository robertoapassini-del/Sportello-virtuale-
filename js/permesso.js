// Modulo 8 — permesso di soggiorno: «quando devo rinnovarlo?».
// Regola: la domanda di rinnovo va fatta almeno 60 giorni prima della scadenza (art. 5 D.Lgs. 286/1998).
import { permessoStatus, todayISO, formatIt, parseDate } from './engine.js';
import { esc, loadJSON, disclaimer, renderFooter, readForm } from './common.js';
import { createFlow, choice, restartBtn, days, dateForm, showError } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
let rules;
const state = {};
const sources = () => [rules.sources, { verified: rules.last_verified }];

const help = `<div class="notice ok"><p class="say">🏢 <strong>Aiuto gratis:</strong> i patronati (INCA, ACLI, INAS…) e lo sportello immigrazione del Comune compilano il kit con te e controllano i documenti.</p></div>`;

const howTo = () => `
  <h2 class="say">Come si fa il rinnovo</h2>
  <ol class="big-steps">
    <li class="say"><strong>Prendi il kit</strong> (busta gialla) in un ufficio postale con lo «Sportello Amico». Vale per: ${esc(rules.kit_types.join(', '))}.
      Per ${esc(rules.questura_types.join(', '))} si va invece direttamente in <strong>Questura</strong>.</li>
    <li class="say"><strong>Compila il kit</strong> (meglio con un patronato) e consegnalo alle Poste. Costa ${esc(rules.cost_note)}.</li>
    <li class="say"><strong>Conserva la ricevuta</strong> delle Poste: con quella sei in regola mentre aspetti, e puoi lavorare. Non perderla.</li>
    <li class="say"><strong>Vai in Questura</strong> il giorno dell'appuntamento scritto sulla ricevuta, per foto e impronte. Poi ti avvisano quando il permesso è pronto.</li>
  </ol>
  <h2 class="say">Cosa portare</h2>
  <ul class="icon-list say">
    <li><span class="ico" aria-hidden="true">🛂</span> Passaporto e vecchio permesso (originali e fotocopie)</li>
    <li><span class="ico" aria-hidden="true">📷</span> 4 fototessera</li>
    <li><span class="ico" aria-hidden="true">💶</span> Prove del reddito (contratto di lavoro, buste paga, CU) e della casa (contratto d'affitto o ospitalità)</li>
    <li><span class="ico" aria-hidden="true">🪪</span> Codice fiscale; per la famiglia, i documenti dei familiari</li>
  </ul>
  <p class="muted">I documenti cambiano con il tipo di permesso: il patronato ti dà l'elenco esatto. Puoi controllare lo stato della pratica sul Portale Immigrazione con il numero della ricevuta.</p>`;

const screens = {
  intro: () => ({
    html: `
      <div class="hero" aria-hidden="true">🛂</div>
      <h1>Quando devo rinnovare il permesso di soggiorno?</h1>
      <p class="lead say">Il rinnovo si chiede <strong>${rules.renew_before_days} giorni prima</strong> della scadenza. Se aspetti troppo, rischi.</p>
      <p class="say">Ti diciamo entro quando cominciare, dove andare e cosa portare.</p>
      <div class="notice info"><p class="say"><strong>Prendi il permesso:</strong> la data di scadenza è scritta sulla tessera.</p></div>
      <button type="button" class="btn primary big" data-go="date">▶️ Comincia</button>
      <p class="muted say">È gratis. Non salviamo niente.</p>`,
  }),

  date: () => ({
    html: `
      <h1>📅 Quando scade il permesso?</h1>
      <p class="say">Guarda la data sulla tessera, vicino a «scadenza» o «valido fino al».</p>
      ${dateForm({ id: 'exp-form', name: 'expiryDate', label: 'Data di scadenza', value: state.expiryDate, button: '✔️ Controlla' })}`,
    mount() {
      document.getElementById('exp-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = readForm(e.target);
        if (!parseDate(v.expiryDate)) return showError('exp-form', 'Scrivi la data.');
        state.expiryDate = v.expiryDate;
        flow.go('result');
      });
    },
  }),

  result: () => {
    const r = permessoStatus(rules, { expiryDate: state.expiryDate, today: todayISO() });
    const box = {
      early: ['🗓️', 'Hai tempo, ma segnati la data', 'info',
        `Il permesso scade il <strong>${esc(formatIt(state.expiryDate))}</strong>. Il rinnovo va chiesto <strong>entro il ${esc(formatIt(r.startBy))}</strong> (${rules.renew_before_days} giorni prima). Puoi farlo anche prima: meglio presto.`],
      now: ['⏰', 'È il momento di fare il rinnovo', 'warn',
        `Il permesso scade il <strong>${esc(formatIt(state.expiryDate))}</strong>: ${r.toExpiry === 0 ? '<strong>oggi</strong>' : `tra ${days(r.toExpiry)}`}. Sei già dentro i ${rules.renew_before_days} giorni: fai la domanda <strong>adesso</strong>.`],
      late: ['🚨', 'È scaduto da poco: muoviti subito', 'bad',
        `Il permesso è scaduto il <strong>${esc(formatIt(state.expiryDate))}</strong>, ${days(r.daysOverdue)} fa. Di solito la domanda viene ancora accettata entro ${rules.late_tolerance_days} giorni dalla scadenza (cioè entro il ${esc(formatIt(r.lateUntil))}), ma <strong>non aspettare un giorno di più</strong>. Vai subito a un patronato.`],
      expired: ['⚠️', 'È scaduto da più di 60 giorni', 'bad',
        `Il permesso è scaduto il <strong>${esc(formatIt(state.expiryDate))}</strong>, ${days(r.daysOverdue)} fa. Il rinnovo normale potrebbe non essere più accettato. <strong>Vai subito a un patronato o a un avvocato</strong> che si occupa di immigrazione: ci sono soluzioni, ma dipendono dal tuo caso.`],
    }[r.status];
    return {
      html: `
        <div class="hero" aria-hidden="true">${box[0]}</div>
        <h1>${box[1]}</h1>
        <div class="notice ${box[2]}"><p class="say">${box[3]}</p></div>
        ${help}
        ${howTo()}
        <div class="notice warn"><p class="say">⚠️ Mentre il permesso è scaduto e non hai la ricevuta del rinnovo, non viaggiare all'estero e non lasciare scadere anche il passaporto.</p></div>
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
    };
  },
};

let flow;
(async function init() {
  renderFooter(ROOT);
  try { rules = await loadJSON(`${ROOT}data/rules-permesso.json`); } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>'; return;
  }
  flow = createFlow({ app, screens, state, sources });
  flow.render();
})();
