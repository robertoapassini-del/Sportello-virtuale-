// Modulo 7 — assegno di inclusione: «ho diritto all'assegno?».
// Prima la risposta: la pagina mostra subito la risposta scritta; il controllo delle condizioni parte dal pulsante.
// Controllo delle condizioni principali con regole fisse. Niente lettera: la domanda si fa
// all'INPS (o gratis con un patronato o un CAF).
import { adiCheck, formatEuro } from './engine.js';
import { esc, loadJSON, disclaimer, renderFooter, readForm } from './common.js';
import { createFlow, choice, restartBtn, progress, showError } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
// La risposta scritta della pagina: è la prima schermata del percorso.
const answerHtml = app.innerHTML;
let rules;
const state = {};
const sources = () => [rules.sources, { verified: rules.last_verified, note: 'Le cifre cambiano ogni anno: controlla sempre con il patronato o sul sito INPS.' }];

const caf = `<div class="notice info"><p>🏢 <strong>Un patronato o un CAF fa la domanda gratis</strong> (per esempio INCA, ACLI, INAS, CAF CGIL o CISL). Ti fanno anche l'ISEE, che serve per la domanda.</p></div>`;

const howTo = () => `
  <h2>Come si chiede</h2>
  <ol class="big-steps">
    <li><strong>Fai l'ISEE</strong> al CAF (gratis). Senza ISEE non si può fare la domanda.</li>
    <li><strong>Fai la domanda</strong>: al patronato o al CAF, oppure da solo sul sito dell'INPS con lo SPID.</li>
    <li><strong>Vai all'appuntamento con i servizi sociali</strong> del Comune: ti chiamano loro, è obbligatorio. Firmi un «patto» con gli impegni della famiglia.</li>
    <li><strong>Ricevi la Carta di inclusione</strong> alle Poste: i soldi arrivano ogni mese sulla carta.</li>
  </ol>
  <details class="card">
    <summary>Quanto dura e cosa controllano</summary>
    <ul class="clean">
      <li>Dura <strong>${rules.duration_months} mesi</strong>. Poi si può rinnovare per altri ${rules.renewal_months} mesi, senza più il mese di stop: la domanda di rinnovo si fa dal mese dopo l'ultimo pagamento. Il primo mese del rinnovo arriva la metà (${rules.renewal_first_month_percent}%), poi l'importo intero.</li>
      <li>Oltre all'ISEE, controllano il reddito della famiglia (limite di ${formatEuro(rules.income_max_base)} l'anno per una persona sola, di più per le famiglie numerose, per chi è in affitto e per le famiglie con tutti sopra i 67 anni: ${formatEuro(rules.income_max_elderly)}), la casa e i risparmi.</li>
      <li>Chi può lavorare (tra 18 e 59 anni, senza carichi di cura) deve iscriversi ai percorsi per il lavoro.</li>
      <li>Se la situazione cambia (lavoro, nascite, trasloco) va comunicato all'INPS.</li>
    </ul>
  </details>`;

const screens = {
  // Prima schermata: la risposta scritta che è già nella pagina (vedi index.html).
  // Così «Ricomincia» e il tasto Indietro riportano alla risposta, non a una presentazione.
  intro: () => ({ html: answerHtml }),

  household: () => ({
    html: `${progress(1, 3)}
      <h1>👨‍👩‍👧 In famiglia c'è almeno una di queste persone?</h1>
      <ul class="icon-list">${rules.household_conditions.map((c) => `<li><span class="ico" aria-hidden="true">👉</span>${esc(c)}</li>`).join('')}</ul>
      <p>Basta una sola. Conta chi è nello stesso stato di famiglia.</p>
      ${choice('✅', 'Sì', { household: true }, 'residency')}
      ${choice('❌', 'No, nessuna', { household: false }, 'residency')}
      ${choice('🤷', 'Non lo so', { household: null }, 'residency', 'Per esempio: la disabilità non è ancora riconosciuta')}`,
  }),

  residency: () => ({
    html: `${progress(2, 3)}
      <h1>🏠 Chi fa la domanda vive in Italia da almeno ${rules.residency_years} anni?</h1>
      <p>E almeno gli ultimi ${rules.residency_continuous_years} anni senza interruzioni.</p>
      ${choice('✅', 'Sì', { residency: true }, 'isee')}
      ${choice('❌', 'No', { residency: false }, 'isee')}
      ${choice('🤷', 'Non sono sicuro', { residency: null }, 'isee')}`,
  }),

  isee: () => ({
    html: `${progress(3, 3)}
      <h1>📄 Quanto è l'ISEE della famiglia?</h1>
      <p>È il numero scritto sull'attestazione ISEE di quest'anno. Lo fa il CAF, gratis.</p>
      <form id="isee-form" novalidate>
        <label for="isee">ISEE, in euro<span class="hint">Per esempio 8000. Senza punti né virgole</span></label>
        <input type="number" id="isee" name="isee" min="0" step="1" inputmode="numeric" value="${esc(state.isee ?? '')}" aria-describedby="isee-form-error">
        <p class="field-error" id="isee-form-error" role="alert" hidden></p>
        <button type="submit" class="btn primary big">✔️ Controlla</button>
      </form>
      <button type="button" class="btn" id="no-isee">🤷 Non ce l'ho / non lo so</button>`,
    mount() {
      document.getElementById('isee-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = readForm(e.target);
        const n = Number(v.isee);
        if (v.isee === '' || !Number.isFinite(n) || n < 0) return showError('isee-form', 'Scrivi un numero, oppure premi «Non lo so».', { field: 'isee' });
        state.isee = n;
        flow.go('result');
      });
      document.getElementById('no-isee').addEventListener('click', () => { state.isee = null; flow.go('result'); });
    },
  }),

  result: () => {
    const r = adiCheck(rules, state);
    const why = {
      household: `in famiglia non c'è un minorenne, una persona con almeno 60 anni, una persona con disabilità o una persona seguita dai servizi`,
      residency: `chi fa la domanda non vive in Italia da ${rules.residency_years} anni`,
      isee: `l'ISEE (${formatEuro(state.isee ?? 0)}) è sopra il limite di ${formatEuro(rules.isee_max)}`,
    };
    if (r.status === 'no') {
      return {
        html: `
          <div class="hero" aria-hidden="true">❌</div>
          <h1>Con questi dati non ci sono le condizioni</h1>
          <div class="notice warn"><p>Perché: ${esc(r.reasons.map((k) => why[k]).join('; '))}.</p></div>
          <p>Se qualcosa cambia (per esempio viene riconosciuta una disabilità, o l'ISEE scende), puoi rifare il controllo.</p>
          <p>Per chi tra 18 e 59 anni può lavorare c'è un altro aiuto, il <strong>Supporto per la formazione e il lavoro</strong>: chiedi al patronato o al CAF.</p>
          ${caf}
          ${disclaimer(rules.last_verified)}
          ${restartBtn()}`,
      };
    }
    if (r.status === 'maybe') {
      return {
        html: `
          <div class="hero" aria-hidden="true">🔎</div>
          <h1>Forse sì: serve una verifica</h1>
          <div class="notice info">
            <p>Le condizioni principali sono: famiglia con minorenne, over 60, persona con disabilità o seguita dai servizi;
            ${rules.residency_years} anni in Italia; <strong>ISEE fino a ${formatEuro(rules.isee_max)}</strong>.</p>
            <p>${state.isee === null ? 'Senza l\'ISEE non possiamo dirti di più: fallo al CAF, è gratis.' : 'Su qualche punto non eri sicuro: un patronato controlla in pochi minuti.'}</p>
          </div>
          ${caf}
          ${howTo()}
          ${disclaimer(rules.last_verified)}
          ${restartBtn()}`,
      };
    }
    return {
      html: `
        <div class="hero" aria-hidden="true">✅</div>
        <h1>Le condizioni principali ci sono</h1>
        <div class="notice ok">
          <p>Famiglia, residenza e ISEE (${formatEuro(state.isee)}, entro il limite di ${formatEuro(rules.isee_max)}) vanno bene.</p>
          <p>L'INPS controlla anche reddito, casa e risparmi: il patronato lo verifica con te prima di mandare la domanda.</p>
        </div>
        ${caf}
        ${howTo()}
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
    };
  },
};

let flow;
(async function init() {
  renderFooter(ROOT);
  try { rules = await loadJSON(`${ROOT}data/rules-adi.json`); } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>'; return;
  }
  flow = createFlow({ app, screens, state, sources });
  flow.render();
})();
