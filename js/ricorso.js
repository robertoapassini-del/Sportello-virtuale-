// Modulo 6 — ricorso contro il verbale di invalidità: «il verbale è sbagliato».
// Prima la risposta: la pagina mostra subito la risposta scritta; il conto dei 6 mesi parte dal pulsante.
// Regola: il ricorso al giudice va fatto entro 6 mesi dal verbale. Niente lettera:
// serve un avvocato (o un patronato che lo trova). Non chiediamo la malattia.
import { ricorsoDeadline, todayISO, formatIt, parseDate, daysBetween, formatEuro, art } from './engine.js';
import { esc, loadJSON, disclaimer, renderFooter, avvisoErrore, readForm } from './common.js';
import { createFlow, choice, restartBtn, days, dateForm, showError } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
// La risposta scritta della pagina: è la prima schermata del percorso.
const answerHtml = app.innerHTML;
let rules;
const state = {};

const sources = () => [rules.sources, { verified: rules.last_verified }];
const deadline = () => ricorsoDeadline(rules, { verbaleDate: state.verbaleDate, today: todayISO() });

const patronato = `<div class="notice info">
  <p>🏢 <strong>Un patronato ti aiuta gratis.</strong> Per esempio INCA, ACLI, INAS. Legge il verbale con te e ti manda da un avvocato convenzionato.</p></div>`;

const howItWorks = () => `
  <h2>Come funziona il ricorso</h2>
  <ol class="big-steps">
    <li><strong>Non si può fare ricorso all'INPS</strong> con una lettera: si va dal giudice. Serve un <strong>avvocato</strong>.</li>
    <li>L'avvocato chiede al Tribunale una <strong>nuova visita</strong> con un medico del giudice (si chiama «accertamento tecnico preventivo», ATP).</li>
    <li>Se il medico del giudice ti dà ragione e nessuno contesta, il giudice lo conferma. Poi l'INPS controlla gli altri requisiti (per esempio il reddito) e paga, con gli arretrati. Se invece una delle due parti contesta, la causa continua.</li>
    <li><strong>Se il reddito della famiglia è basso</strong> (sotto ${formatEuro(rules.gratuito_patrocinio_income)} l'anno), l'avvocato lo paga lo Stato: chiedi il «gratuito patrocinio».</li>
    <li><strong>Se perdi la causa</strong> e il reddito della famiglia è sotto ${formatEuro(rules.no_legal_costs_income)} l'anno, <strong>non paghi le spese legali</strong> dell'INPS. Basta una dichiarazione dentro il ricorso: la prepara l'avvocato.</li>
  </ol>
  <h2>Cosa portare al patronato o all'avvocato</h2>
  <ul class="icon-list">
    <li><span class="ico" aria-hidden="true">📄</span> Il verbale (tutte le pagine, con la busta o l'email con la data)</li>
    <li><span class="ico" aria-hidden="true">🗂️</span> Tutti i fogli medici: referti, cartelle, esami, anche recenti</li>
    <li><span class="ico" aria-hidden="true">🪪</span> Carta d'identità, tessera sanitaria, ultima dichiarazione dei redditi</li>
  </ul>`;

const aggravamento = `
  <details class="card">
    <summary>Se la salute è peggiorata: la domanda di aggravamento</summary>
    <p>Non è un ricorso: è una <strong>nuova domanda</strong>, con un nuovo certificato del medico, che dice che la situazione è peggiorata. Si può fare in qualsiasi momento, <strong>anche mentre c'è un ricorso in corso</strong>. Chiedi al patronato se ti conviene: la fa gratis.</p>
  </details>`;

const screens = {
  // Prima schermata: la risposta scritta che è già nella pagina (vedi index.html).
  // Così «Ricomincia» e il tasto Indietro riportano alla risposta, non a una presentazione.
  intro: () => ({ html: answerHtml }),

  received: () => ({
    html: `
      <h1>📬 Hai già ricevuto il verbale?</h1>
      <p>È il foglio con il risultato della visita: una percentuale, oppure «non invalido», oppure il riconoscimento della legge 104.</p>
      ${choice('✅', 'Sì, ce l\'ho', { received: true }, 'date')}
      ${choice('❌', 'No, aspetto ancora la visita o il verbale', { received: false }, 'notyet')}`,
  }),

  notyet: () => ({
    html: `
      <div class="hero" aria-hidden="true">⏳</div>
      <h1>Prima serve il verbale</h1>
      <p>Il ricorso si può fare solo dopo aver ricevuto il verbale. I ${rules.appeal_months} mesi partono da quel giorno.</p>
      <p>Se la visita non arriva, c'è un'altra pagina che ti aiuta:</p>
      <a class="btn choice" href="../invalidita/"><span class="ico" aria-hidden="true">♿</span><span class="txt">Invalidità civile: la domanda e la visita</span></a>
      ${disclaimer(rules.last_verified)}
      ${restartBtn()}`,
  }),

  date: () => ({
    html: `
      <h1>📅 Che giorno hai ricevuto il verbale?</h1>
      <p>La legge conta i ${rules.appeal_months} mesi dal giorno in cui il verbale ti è arrivato (raccomandata, email o PEC). L'INPS invece scrive che contano dalla data del verbale. <strong>Per stare tranquillo, usa la data scritta sul verbale</strong>: viene prima, quindi la scadenza è più prudente.</p>
      ${dateForm({ id: 'v-form', name: 'verbaleDate', label: 'Data scritta sul verbale (o giorno in cui l\'hai ricevuto)', value: state.verbaleDate, button: '✔️ Controlla', max: todayISO() })}`,
    mount() {
      document.getElementById('v-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = readForm(e.target);
        if (parseDate(v.verbaleDate) === null) return showError('v-form', 'Scrivi il giorno.');
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
            <p>Puoi fare ricorso <strong>${art('fino al', d.deadline)}${esc(formatIt(d.deadline))}</strong>.${d.slittato ? ' (I mesi finivano di sabato, di domenica o in un giorno festivo: il termine passa al primo giorno lavorativo.)' : ''}</p>
            <p>${d.daysLeft === 0 ? '<strong>Scade oggi.</strong>' : `Mancano <strong>${days(d.daysLeft)}</strong>.`}</p>
            <p>${d.daysLeft < 15
    ? '<strong>Vai oggi stesso da un patronato o da un avvocato: si può ancora depositare.</strong>'
    : 'L\'avvocato ha bisogno di qualche settimana per preparare tutto: non aspettare l\'ultimo momento.'}</p>
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
          <p>Il tempo per il ricorso è finito ${art('il', d.deadline)}<strong>${esc(formatIt(d.deadline))}</strong>, ${days(d.daysLate)} fa.</p>
          <p>Contro questo verbale non si può più fare ricorso.</p>
        </div>
        <h2>Cosa puoi fare adesso</h2>
        <ol class="big-steps">
          <li><strong>Se la salute è peggiorata:</strong> una <strong>domanda di aggravamento</strong>. Si parte da un nuovo certificato del medico. Un patronato la fa gratis.</li>
          <li><strong>Se nel verbale c'è una data di revisione:</strong> a quella visita porta tutti i fogli medici nuovi.</li>
          <li><strong>Fai leggere il verbale a un patronato:</strong> a volte la data che conta è diversa (per esempio se non c'è prova di quando l'hai ricevuto). Non costa niente chiedere.</li>
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
    avvisoErrore(); // la risposta scritta nella pagina resta, con l'avviso sopra
    return;
  }
  flow = createFlow({ app, screens, state, sources, first: 'intro' });
  flow.render();
})();
