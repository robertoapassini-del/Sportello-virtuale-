// Modulo 14 — legge 104: «cosa mi spetta davvero».
// Prima la risposta: la pagina mostra subito la risposta scritta; il percorso a domande parte dal pulsante.
// Due domande: per chi è (lavoratore con disabilità, familiare che assiste, nessuno dei due) e cosa dice
// il verbale (comma 3, comma 1, non c'è ancora, non lo so). Niente date, niente malattia, niente salvato.
import { formatEuro } from './engine.js';
import { esc, loadJSON, disclaimer, renderFooter } from './common.js';
import { createFlow, choice, restartBtn } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
// La risposta scritta della pagina: è la prima schermata del percorso.
const answerHtml = app.innerHTML;
let rules;
const state = {};

const sources = () => [rules.sources, { verified: rules.last_verified }];

const patronato = `<div class="notice info">
  <p class="say">🏢 <strong>Un patronato ti aiuta gratis.</strong> Per esempio INCA, ACLI, INAS. Legge il verbale con te, fa la domanda all'INPS e ti dice quali agevolazioni puoi chiedere al CAF.</p></div>`;

const linkGuida = (page, label) => `<a class="btn choice" href="${page}/"><span class="ico" aria-hidden="true">📖</span><span class="txt">${esc(label)}</span></a>`;

// I permessi, secondo chi li chiede.
function permessi() {
  const p = rules.permessi;
  if (state.who === 'self') {
    return `<li class="say"><strong>Permessi dal lavoro:</strong> <strong>${p.hours_per_day} ore al giorno</strong> oppure <strong>${p.days_per_month} giorni al mese</strong>, pagati, a tua scelta. Solo se sei dipendente.</li>
      <li class="say"><strong>Sul lavoro:</strong> puoi scegliere la sede più vicina a casa quando è possibile, non puoi essere trasferito senza il tuo consenso, hai la priorità per il lavoro da casa.</li>`;
  }
  return `<li class="say"><strong>Permessi dal lavoro:</strong> <strong>${p.days_per_month} giorni al mese</strong>, pagati come giorni di lavoro, anche spezzati in ore. Solo se sei dipendente.</li>
    <li class="say"><strong>Congedo straordinario:</strong> fino a <strong>${rules.congedo.years} anni</strong> in tutta la vita lavorativa, pagati, se vivi con la persona (i genitori anche senza vivere insieme).</li>
    <li class="say"><strong>Chi può chiederli:</strong> coniuge, convivente, genitori, figli, fratelli, nonni, nipoti, suoceri (parenti entro il ${rules.family.degree}° grado). Fino al ${rules.family.extended_degree}° grado se i genitori o il coniuge della persona hanno ${rules.family.extended_age} anni o più, mancano o sono malati.</li>
    <li class="say"><strong>Sul lavoro:</strong> sede più vicina quando è possibile, niente trasferimenti senza consenso, puoi rifiutare il lavoro di notte.</li>`;
}

const agevolazioni = () => `<li class="say"><strong>Ausili e computer:</strong> IVA al ${rules.ausili_iva_percent}% con la prescrizione del medico.</li>
  <li class="say"><strong>Auto:</strong> IVA al ${rules.auto.iva_percent}%, detrazione del ${rules.auto.detrazione_percent}% fino a ${formatEuro(rules.auto.detrazione_max)}, niente bollo, una volta ogni ${rules.auto.every_years} anni. <strong>Solo se il verbale dice</strong> che la persona non vede, non sente, ha una disabilità psichica con accompagnamento o una grave difficoltà a camminare.</li>
  <li class="say"><strong>Spese mediche e di assistenza:</strong> si scaricano dalle tasse, in parte per intero. Lo fa il CAF.</li>`;

const screens = {
  // Prima schermata: la risposta scritta che è già nella pagina (vedi index.html).
  intro: () => ({ html: answerHtml }),

  who: () => ({
    html: `
      <h1>🙋 Per chi vuoi sapere?</h1>
      <p class="say">Scegli il caso più vicino al tuo.</p>
      ${choice('🧑‍💼', 'Per me: ho una disabilità e lavoro', { who: 'self' }, 'verbale')}
      ${choice('👨‍👩‍👧', 'Assisto un familiare con disabilità, e lavoro', { who: 'family' }, 'verbale')}
      ${choice('ℹ️', 'Nessuno dei due: voglio sapere cosa dà la 104', { who: 'info' }, 'verbale')}`,
  }),

  verbale: () => ({
    html: `
      <h1>📄 Cosa c'è scritto nel verbale?</h1>
      <p class="say">È il foglio arrivato dopo la visita. Cerca la riga con «legge 104» o «art. 3».</p>
      ${choice('✅', 'Art. 3, comma 3: handicap in situazione di gravità (o «sostegno elevato o molto elevato»)', { verbale: 'c3' }, 'result')}
      ${choice('🟡', 'Art. 3, comma 1: handicap senza gravità', { verbale: 'c1' }, 'result')}
      ${choice('⏳', 'Non c\'è ancora nessun verbale', { verbale: 'none' }, 'result')}
      ${choice('❓', 'Non lo so, non lo trovo', { verbale: 'unknown' }, 'result')}`,
  }),

  result: () => {
    const v = state.verbale;
    if (v === 'c3') {
      return {
        html: `
          <div class="hero" aria-hidden="true">✅</div>
          <h1>Con il comma 3 hai i diritti pieni della 104</h1>
          <ul class="big-steps">
            ${permessi()}
            ${agevolazioni()}
          </ul>
          <h2 class="say">Come chiederli</h2>
          <p class="say">I permessi e il congedo si chiedono <strong>all'INPS</strong> (online con lo SPID o al patronato) e poi si avvisa il datore di lavoro. I dipendenti pubblici fanno domanda alla propria amministrazione. Le agevolazioni fiscali si chiedono al CAF con la dichiarazione dei redditi, e l'IVA al ${rules.ausili_iva_percent}% direttamente al negozio con il verbale.</p>
          ${patronato}
          ${linkGuida('permessi-e-congedo', 'Permessi e congedo: tutte le regole')}
          ${linkGuida('agevolazioni', 'Auto, ausili e tasse: le agevolazioni')}
          ${disclaimer(rules.last_verified)}
          ${restartBtn()}`,
      };
    }
    if (v === 'c1') {
      return {
        html: `
          <div class="hero" aria-hidden="true">🟡</div>
          <h1>Con il comma 1 niente permessi, ma qualche agevolazione sì</h1>
          <div class="notice info">
            <p class="say">Il comma 1 dice che c'è l'handicap ma <strong>non è grave</strong>. Non dà i ${rules.permessi.days_per_month} giorni di permesso né il congedo straordinario.</p>
          </div>
          <ul class="big-steps">
            ${agevolazioni()}
          </ul>
          <h2 class="say">Se la situazione è più grave di così</h2>
          <ol class="big-steps">
            <li class="say"><strong>Se la salute è peggiorata:</strong> chiedi una nuova visita con una <strong>domanda di aggravamento</strong>: si parte da un nuovo certificato del medico. Un patronato la fa gratis.</li>
            <li class="say"><strong>Se il verbale è sbagliato:</strong> si può fare <strong>ricorso</strong>, ma con tempi stretti. Guarda la pagina <a href="../ricorso-invalidita/">Il verbale di invalidità è sbagliato</a>.</li>
          </ol>
          ${patronato}
          ${linkGuida('agevolazioni', 'Auto, ausili e tasse: le agevolazioni')}
          ${disclaimer(rules.last_verified)}
          ${restartBtn()}`,
      };
    }
    if (v === 'none') {
      return {
        html: `
          <div class="hero" aria-hidden="true">🩺</div>
          <h1>Prima serve il verbale: si parte dal medico</h1>
          <ol class="big-steps">
            <li class="say"><strong>Vai dal medico di famiglia</strong> con tutti i fogli medici. Manda lui il certificato all'INPS. Chiedigli di segnare sia l'invalidità civile sia la legge 104: una sola visita per tutte e due.</li>
            <li class="say"><strong>Fai la domanda</strong> all'INPS, gratis con un patronato. In alcune province siciliane il certificato è già la domanda.</li>
            <li class="say"><strong>Vai alla visita</strong> con tutti i referti. Poi arriva il verbale: con il comma 3 hai permessi, congedo e agevolazioni.</li>
          </ol>
          ${patronato}
          ${linkGuida('come-chiederla', 'Come si chiede, passo passo')}
          <a class="btn choice" href="../invalidita/"><span class="ico" aria-hidden="true">♿</span><span class="txt">La visita non arriva? I tempi di legge e il sollecito</span></a>
          ${disclaimer(rules.last_verified)}
          ${restartBtn()}`,
      };
    }
    return {
      html: `
        <div class="hero" aria-hidden="true">🔍</div>
        <h1>Cerca questa riga nel verbale</h1>
        <p class="say">Nel verbale c'è una riga che inizia con <strong>«Persona con handicap»</strong> (o «con disabilità»). Guarda cosa segue:</p>
        <ul class="big-steps">
          <li class="say"><strong>«in situazione di gravità (art. 3, comma 3)»</strong>, oppure «necessità di sostegno elevato o molto elevato»: sono i diritti pieni, permessi e congedo compresi.</li>
          <li class="say"><strong>«(art. 3, comma 1)»</strong> senza la parola gravità: niente permessi, solo alcune agevolazioni.</li>
          <li class="say"><strong>Non c'è nessuna riga sulla 104</strong>, solo una percentuale di invalidità: la 104 non è stata chiesta o riconosciuta. Si può chiedere con una nuova domanda.</li>
        </ul>
        <p class="say">Se non trovi il verbale, lo vedi nella tua area personale sul sito INPS (con lo SPID), oppure lo chiedi al patronato.</p>
        ${patronato}
        <button type="button" class="btn primary big" data-go="verbale">↩️ Ho trovato la riga: torno alla domanda</button>
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
    };
  },
};

let flow;
(async function init() {
  renderFooter(ROOT);
  try {
    rules = await loadJSON(`${ROOT}data/rules-legge104.json`);
  } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>';
    return;
  }
  flow = createFlow({ app, screens, state, sources, first: 'intro' });
  flow.render();
})();
