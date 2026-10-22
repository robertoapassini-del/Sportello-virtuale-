// Modulo 9 — piano terapeutico: «come lo chiedo, quando lo rinnovo?».
// Prima la risposta: la pagina mostra subito la risposta scritta; il conto della scadenza parte dal pulsante.
// Non chiediamo né la malattia né il nome della medicina: solo la data di scadenza del piano.
import { pianoStatus, todayISO, formatIt, parseDate, art } from './engine.js';
import { esc, loadJSON, loadRegioni, disclaimer, renderFooter, avvisoErrore, readForm, aslLabel } from './common.js';
import { createFlow, choice, restartBtn, days, dateForm, showError } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
// La risposta scritta della pagina: è la prima schermata del percorso.
const answerHtml = app.innerHTML;
let rules;
const state = {};
const sources = () => [rules.sources, { verified: rules.last_verified }];

const whatIs = () => `
  <h2>Cos'è e come funziona</h2>
  <ol class="big-steps">
    <li><strong>Alcune medicine</strong> il medico di famiglia può prescriverle solo se c'è un <strong>piano terapeutico</strong>: un foglio scritto da uno <strong>specialista del Servizio sanitario</strong> (in ospedale o in un centro autorizzato), non da un medico privato.</li>
    <li><strong>Il piano ha una scadenza</strong>, scritta sul foglio: di solito ${rules.typical_duration_months.join(' o ')} mesi.</li>
    <li><strong>Con il piano valido</strong>, il medico di famiglia ti fa la ricetta ogni mese. Tieni una copia del piano: a volte la farmacia la chiede.</li>
    <li><strong>Dove prendi la medicina:</strong> molte medicine con il piano non si prendono come le altre. A volte si ritirano alla <strong>farmacia dell'${aslLabel()}</strong> («distribuzione diretta»). Altre volte le dà la tua farmacia <strong>per conto dell'${aslLabel()}</strong> («DPC»): la farmacia la ordina e di solito arriva in un giorno o due. Chiedi al medico o al farmacista quale vale per la tua medicina.</li>
    <li><strong>Prima che scada</strong> serve una nuova visita dallo specialista per rinnovarlo. Se scade, il medico non può più fare la ricetta con il Servizio sanitario.</li>
  </ol>
  <div class="notice warn"><p>⚠️ La visita per il rinnovo è una <strong>visita di controllo</strong>: può avere tempi lunghi e non c'è la garanzia dei tempi massimi. Per questo prenotala con largo anticipo, almeno ${rules.book_before_days} giorni prima.</p></div>
  <details class="card">
    <summary>Se la visita non si trova in tempo</summary>
    <ul class="clean">
      <li>Chiedi al reparto o al centro che ha fatto il piano: spesso hanno un'agenda riservata ai rinnovi.</li>
      <li>Chiedi al medico di famiglia di contattare lo specialista: a volte il piano si rinnova senza visita, con i referti recenti.</li>
      <li>Chiedi alla farmacia dell'${aslLabel()} (servizio farmaceutico) se nella tua zona esistono proroghe.</li>
      <li>Non interrompere la cura da solo: parlane con il medico.</li>
    </ul>
  </details>`;

const screens = {
  // Prima schermata: la risposta scritta che è già nella pagina (vedi index.html).
  // Così «Ricomincia» e il tasto Indietro riportano alla risposta, non a una presentazione.
  intro: () => ({ html: answerHtml }),

  have: () => ({
    html: `
      <h1>📄 Hai già un piano terapeutico?</h1>
      ${choice('✅', 'Sì, ce l\'ho', { have: true }, 'date', 'Voglio sapere quando rinnovarlo')}
      ${choice('❌', 'No, devo farlo per la prima volta', { have: false }, 'first')}`,
  }),

  first: () => ({
    html: `
      <div class="hero" aria-hidden="true">👨‍⚕️</div>
      <h1>Si parte dallo specialista</h1>
      <p>Chiedi al medico di famiglia l'impegnativa per la visita dallo specialista giusto. Alla visita, lo specialista scrive il piano.</p>
      ${whatIs()}
      <p>Quando hai il piano, torna qui con la data di scadenza: ti diciamo quando prenotare il rinnovo.</p>
      ${disclaimer(rules.last_verified)}
      ${restartBtn()}`,
  }),

  date: () => ({
    html: `
      <h1>📅 Quando scade il piano?</h1>
      <p>La data è scritta sul foglio, vicino a «valido fino al» o «durata».</p>
      ${dateForm({ id: 'exp-form', name: 'expiryDate', label: 'Data di scadenza del piano', value: state.expiryDate, button: '✔️ Controlla' })}`,
    mount() {
      document.getElementById('exp-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = readForm(e.target);
        if (parseDate(v.expiryDate) === null) return showError('exp-form', 'Scrivi la data.');
        state.expiryDate = v.expiryDate;
        flow.go('result');
      });
    },
  }),

  result: () => {
    const r = pianoStatus(rules, { expiryDate: state.expiryDate, today: todayISO() });
    const box = {
      ok: ['🗓️', 'Hai tempo: segnati la data', 'ok',
        `Il piano scade ${art('il', state.expiryDate)}<strong>${esc(formatIt(state.expiryDate))}</strong>. Prenota la visita per il rinnovo <strong>entro ${art('il', r.bookBy)}${esc(formatIt(r.bookBy))}</strong>, così la fai prima della scadenza.`],
      soon: ['⏰', 'Prenota adesso il rinnovo', 'warn',
        `Il piano scade ${art('il', state.expiryDate)}<strong>${esc(formatIt(state.expiryDate))}</strong>, ${r.toExpiry === 0 ? '<strong>oggi</strong>' : `tra ${days(r.toExpiry)}`}. Chiama subito per la visita dallo specialista: le liste possono essere lunghe.`],
      expired: ['⚠️', 'Il piano è scaduto', 'bad',
        `Il piano è scaduto ${art('il', state.expiryDate)}<strong>${esc(formatIt(state.expiryDate))}</strong>, ${days(r.daysOverdue)} fa. Fino al rinnovo il medico di famiglia non può prescrivere la medicina con il Servizio sanitario. Chiama subito lo specialista o il centro che l'ha fatto e chiedi un appuntamento urgente per il rinnovo.`],
    }[r.status];
    return {
      html: `
        <div class="hero" aria-hidden="true">${box[0]}</div>
        <h1>${box[1]}</h1>
        <div class="notice ${box[2]}"><p>${box[3]}</p></div>
        ${whatIs()}
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
    };
  },
};

let flow;
(async function init() {
  renderFooter(ROOT);
  // L'elenco delle regioni serve a aslLabel(): ASP in Sicilia, ASL, ATS… altrove.
  try { [rules] = await Promise.all([loadJSON(`${ROOT}data/rules-piano.json`), loadRegioni(ROOT)]); } catch {
    avvisoErrore(); return; // la risposta scritta nella pagina resta, con l'avviso sopra
  }
  flow = createFlow({ app, screens, state, sources });
  flow.render();
})();
