// Modulo 6 — ricorso contro il verbale di invalidità: «il verbale è sbagliato».
// Regola: il ricorso al giudice va fatto entro 6 mesi dal verbale. Niente lettera:
// serve un avvocato (o un patronato che lo trova). Non chiediamo la malattia.
import { ricorsoDeadline, todayISO, formatIt, parseDate, daysBetween, formatEuro } from './engine.js';
import { esc, loadJSON, disclaimer, renderFooter, readForm } from './common.js';
import { createFlow, choice, restartBtn, days, dateForm, showError } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
let rules;
const state = {};

const sources = () => [rules.sources, { verified: rules.last_verified }];
const deadline = () => ricorsoDeadline(rules, { verbaleDate: state.verbaleDate, today: todayISO() });

const patronato = `<div class="notice ok">
  <p class="say">🏢 <strong>Un patronato ti aiuta gratis.</strong> Per esempio INCA, ACLI, INAS. Legge il verbale con te e ti manda da un avvocato convenzionato.</p></div>`;

const howItWorks = () => `
  <h2 class="say">Come funziona il ricorso</h2>
  <ol class="big-steps">
    <li class="say"><strong>Non si può fare ricorso all'INPS</strong> con una lettera: si va dal giudice. Serve un <strong>avvocato</strong>.</li>
    <li class="say">L'avvocato chiede al Tribunale una <strong>nuova visita</strong> con un medico del giudice (si chiama «accertamento tecnico preventivo», ATP).</li>
    <li class="say">Se il medico del giudice ti dà ragione, l'INPS deve adeguarsi, con gli arretrati.</li>
    <li class="say"><strong>Se il reddito della famiglia è basso</strong> (sotto circa ${formatEuro(rules.gratuito_patrocinio_income)} l'anno), l'avvocato lo paga lo Stato: chiedi il «gratuito patrocinio».</li>
  </ol>
  <h2 class="say">Cosa portare al patronato o all'avvocato</h2>
  <ul class="icon-list say">
    <li><span class="ico" aria-hidden="true">📄</span> Il verbale (tutte le pagine, con la busta o l'email con la data)</li>
    <li><span class="ico" aria-hidden="true">🗂️</span> Tutti i fogli medici: referti, cartelle, esami, anche recenti</li>
    <li><span class="ico" aria-hidden="true">🪪</span> Carta d'identità, tessera sanitaria, ultima dichiarazione dei redditi</li>
  </ul>`;

const aggravamento = `
  <details class="card">
    <summary>Se la salute è peggiorata: la domanda di aggravamento</summary>
    <p>Non è un ricorso: è una <strong>nuova domanda</strong>, con un nuovo certificato del medico, che dice che la situazione è peggiorata. Si può fare in qualsiasi momento, ma <strong>non mentre c'è un ricorso in corso</strong>. Un patronato la fa gratis.</p>
  </details>`;

const screens = {
  intro: () => ({
    html: `
      <div class="hero" aria-hidden="true">⚖️</div>
      <h1>Il verbale di invalidità è sbagliato?</h1>
      <p class="lead say">La percentuale è troppo bassa, o ti hanno detto di no?</p>
      <p class="say">Puoi fare ricorso, ma <strong>solo entro ${rules.appeal_months} mesi</strong> da quando hai ricevuto il verbale. Dopo, non si può più. Ti diciamo quanto tempo ti resta e cosa fare.</p>
      <div class="notice info">
        <p class="say"><strong>Prendi questo foglio:</strong></p>
        <ul class="icon-list say"><li><span class="ico" aria-hidden="true">📄</span> Il verbale, con la busta o l'email con cui è arrivato</li></ul>
      </div>
      <button type="button" class="btn primary big" data-go="received">▶️ Comincia</button>
      <p class="muted say">Non giudichiamo il verbale. Non salviamo niente. Non chiediamo la malattia.</p>`,
  }),

  received: () => ({
    html: `
      <h1>📬 Hai già ricevuto il verbale?</h1>
      <p class="say">È il foglio con il risultato della visita: una percentuale, oppure «non invalido», oppure il riconoscimento della legge 104.</p>
      ${choice('✅', 'Sì, ce l\'ho', { received: true }, 'date')}
      ${choice('❌', 'No, aspetto ancora la visita o il verbale', { received: false }, 'notyet')}`,
  }),

  notyet: () => ({
    html: `
      <div class="hero" aria-hidden="true">⏳</div>
      <h1>Prima serve il verbale</h1>
      <p class="say">Il ricorso si può fare solo dopo aver ricevuto il verbale. I ${rules.appeal_months} mesi partono da quel giorno.</p>
      <p class="say">Se la visita non arriva, c'è un'altra pagina che ti aiuta:</p>
      <a class="btn choice" href="../invalidita/index.html"><span class="ico" aria-hidden="true">♿</span><span class="txt">La visita per l'invalidità non arriva</span></a>
      ${disclaimer(rules.last_verified)}
      ${restartBtn()}`,
  }),

  date: () => ({
    html: `
      <h1>📅 Che giorno hai ricevuto il verbale?</h1>
      <p class="say">Il giorno in cui è arrivata la raccomandata, l'email o la PEC. Se non lo ricordi, guarda il timbro sulla busta o la data dell'email. In mancanza, usa la data scritta sul verbale: è più prudente.</p>
      ${dateForm({ id: 'v-form', name: 'verbaleDate', label: 'Giorno in cui l\'hai ricevuto', value: state.verbaleDate, button: '✔️ Controlla', max: todayISO() })}`,
    mount() {
      document.getElementById('v-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = readForm(e.target);
        if (!parseDate(v.verbaleDate)) return showError('v-form', 'Scrivi il giorno.');
        if (daysBetween(v.verbaleDate, todayISO()) < 0) return showError('v-form', 'Questo giorno non è ancora arrivato. Controlla la data.');
        state.verbaleDate = v.verbaleDate;
        flow.go('result');
      });
    },
  }),

  result: () => {
    const d = deadline();
    if (d.status === 'error') return { html: `<h1>Controlla la data</h1>${restartBtn()}` };
    if (d.status === 'waiting') {
      const urgent = d.daysLeft <= 30;
      return {
        html: `
          <div class="hero" aria-hidden="true">${urgent ? '🚨' : '⏰'}</div>
          <h1>${urgent ? 'Muoviti subito: manca poco' : 'Sei ancora in tempo'}</h1>
          <div class="notice ${urgent ? 'bad' : 'ok'}">
            <p class="say">Puoi fare ricorso <strong>fino al ${esc(formatIt(d.deadline))}</strong>.</p>
            <p class="say">${d.daysLeft === 0 ? '<strong>Scade oggi.</strong>' : `Mancano <strong>${days(d.daysLeft)}</strong>.`}</p>
            <p class="say">L'avvocato ha bisogno di qualche settimana per preparare tutto: non aspettare l'ultimo momento.</p>
          </div>
          ${patronato}
          ${howItWorks()}
          ${aggravamento}
          ${disclaimer(rules.last_verified)}
          ${restartBtn()}`,
      };
    }
    return {
      html: `
        <div class="hero" aria-hidden="true">⌛</div>
        <h1>I ${rules.appeal_months} mesi sono passati</h1>
        <div class="notice bad">
          <p class="say">Il tempo per il ricorso è finito il <strong>${esc(formatIt(d.deadline))}</strong>, ${days(d.daysLate)} fa.</p>
          <p class="say">Contro questo verbale non si può più fare ricorso.</p>
        </div>
        <h2 class="say">Cosa puoi fare adesso</h2>
        <ol class="big-steps">
          <li class="say"><strong>Se la salute è peggiorata:</strong> una <strong>domanda di aggravamento</strong>. Si parte da un nuovo certificato del medico. Un patronato la fa gratis.</li>
          <li class="say"><strong>Se nel verbale c'è una data di revisione:</strong> a quella visita porta tutti i fogli medici nuovi.</li>
          <li class="say"><strong>Fai leggere il verbale a un patronato:</strong> a volte la data che conta è diversa (per esempio se non c'è prova di quando l'hai ricevuto). Non costa niente chiedere.</li>
        </ol>
        ${patronato}
        ${aggravamento}
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
    };
  },
};

let flow;
(async function init() {
  renderFooter(ROOT);
  try {
    rules = await loadJSON(`${ROOT}data/rules-ricorso.json`);
  } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>';
    return;
  }
  flow = createFlow({ app, screens, state, sources, first: 'intro' });
  flow.render();
})();
