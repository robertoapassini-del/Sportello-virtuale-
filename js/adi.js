// Modulo 7 — assegno di inclusione: «ho diritto all'assegno?».
// Controllo delle condizioni principali con regole fisse. Niente lettera: la domanda si fa
// all'INPS (o gratis con un patronato o un CAF).
import { adiCheck, formatEuro } from './engine.js';
import { esc, loadJSON, disclaimer, renderFooter, readForm } from './common.js';
import { createFlow, choice, restartBtn, progress } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
let rules;
const state = {};
const sources = () => [rules.sources, { verified: rules.last_verified, note: 'Le cifre cambiano ogni anno: controlla sempre con il patronato o sul sito INPS.' }];

const caf = `<div class="notice ok"><p class="say">🏢 <strong>Un patronato o un CAF fa la domanda gratis</strong> (per esempio INCA, ACLI, INAS, CAF CGIL o CISL). Ti fanno anche l'ISEE, che serve per la domanda.</p></div>`;

const howTo = () => `
  <h2 class="say">Come si chiede</h2>
  <ol class="big-steps">
    <li class="say"><strong>Fai l'ISEE</strong> al CAF (gratis). Senza ISEE non si può fare la domanda.</li>
    <li class="say"><strong>Fai la domanda</strong>: al patronato o al CAF, oppure da solo sul sito dell'INPS con lo SPID.</li>
    <li class="say"><strong>Vai all'appuntamento con i servizi sociali</strong> del Comune: ti chiamano loro, è obbligatorio. Firmi un «patto» con gli impegni della famiglia.</li>
    <li class="say"><strong>Ricevi la Carta di inclusione</strong> alle Poste: i soldi arrivano ogni mese sulla carta.</li>
  </ol>
  <details class="card">
    <summary>Quanto dura e cosa controllano</summary>
    <ul class="clean">
      <li>Dura <strong>${rules.duration_months} mesi</strong>. Poi si ferma per ${rules.pause_months} mese e si può rinnovare per altri ${rules.renewal_months}.</li>
      <li>Oltre all'ISEE, controllano il reddito della famiglia (limite di circa ${formatEuro(rules.income_max_base)} l'anno per una persona sola, di più per le famiglie numerose e per chi ha più di 67 anni o una disabilità), la casa e i risparmi.</li>
      <li>Chi può lavorare (tra 18 e 59 anni, senza carichi di cura) deve iscriversi ai percorsi per il lavoro.</li>
      <li>Se la situazione cambia (lavoro, nascite, trasloco) va comunicato all'INPS.</li>
    </ul>
  </details>`;

const screens = {
  intro: () => ({
    html: `
      <div class="hero" aria-hidden="true">🪪</div>
      <h1>Hai diritto all'assegno di inclusione?</h1>
      <p class="lead say">È un aiuto economico ogni mese per le famiglie con pochi soldi.</p>
      <p class="say">Con 3 domande ti diciamo se ci sono le condizioni principali e come fare la domanda.</p>
      <div class="notice info"><p class="say"><strong>Ti serve un numero:</strong> l'ISEE della famiglia. Se non ce l'hai, va bene lo stesso: ti diciamo il limite.</p></div>
      <button type="button" class="btn primary big" data-go="household">▶️ Comincia</button>
      <p class="muted say">È gratis. Non salviamo niente.</p>`,
  }),

  household: () => ({
    html: `${progress(1, 3)}
      <h1>👨‍👩‍👧 In famiglia c'è almeno una di queste persone?</h1>
      <ul class="icon-list say">${rules.household_conditions.map((c) => `<li><span class="ico" aria-hidden="true">👉</span>${esc(c)}</li>`).join('')}</ul>
      <p class="say">Basta una sola. Conta chi è nello stesso stato di famiglia.</p>
      ${choice('✅', 'Sì', { household: true }, 'residency')}
      ${choice('❌', 'No, nessuna', { household: false }, 'residency')}
      ${choice('🤷', 'Non lo so', { household: null }, 'residency', 'Per esempio: la disabilità non è ancora riconosciuta')}`,
  }),

  residency: () => ({
    html: `${progress(2, 3)}
      <h1>🏠 Chi fa la domanda vive in Italia da almeno ${rules.residency_years} anni?</h1>
      <p class="say">E almeno gli ultimi ${rules.residency_continuous_years} anni senza interruzioni.</p>
      ${choice('✅', 'Sì', { residency: true }, 'isee')}
      ${choice('❌', 'No', { residency: false }, 'isee')}
      ${choice('🤷', 'Non sono sicuro', { residency: null }, 'isee')}`,
  }),

  isee: () => ({
    html: `${progress(3, 3)}
      <h1>📄 Quanto è l'ISEE della famiglia?</h1>
      <p class="say">È il numero scritto sull'attestazione ISEE di quest'anno. Lo fa il CAF, gratis.</p>
      <form id="isee-form" novalidate>
        <label for="isee">ISEE, in euro<span class="hint">Per esempio 8000. Senza punti né virgole</span></label>
        <input type="number" id="isee" name="isee" min="0" step="1" inputmode="numeric" value="${esc(state.isee ?? '')}">
        <p class="field-error" id="isee-form-error" role="alert" hidden></p>
        <button type="submit" class="btn primary big">✔️ Controlla</button>
      </form>
      <button type="button" class="btn" id="no-isee">🤷 Non ce l'ho / non lo so</button>`,
    mount() {
      document.getElementById('isee-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = readForm(e.target);
        const n = Number(v.isee);
        if (v.isee === '' || !Number.isFinite(n) || n < 0) {
          const err = document.getElementById('isee-form-error');
          err.textContent = 'Scrivi un numero, oppure premi «Non lo so».';
          err.hidden = false;
          return;
        }
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
          <div class="notice warn"><p class="say">Perché: ${esc(r.reasons.map((k) => why[k]).join('; '))}.</p></div>
          <p class="say">Se qualcosa cambia (per esempio viene riconosciuta una disabilità, o l'ISEE scende), puoi rifare il controllo.</p>
          <p class="say">Per chi tra 18 e 59 anni può lavorare c'è un altro aiuto, il <strong>Supporto per la formazione e il lavoro</strong>: chiedi al patronato o al CAF.</p>
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
            <p class="say">Le condizioni principali sono: famiglia con minorenne, over 60, persona con disabilità o seguita dai servizi;
            ${rules.residency_years} anni in Italia; <strong>ISEE fino a ${formatEuro(rules.isee_max)}</strong>.</p>
            <p class="say">${state.isee === null ? 'Senza l\'ISEE non possiamo dirti di più: fallo al CAF, è gratis.' : 'Su qualche punto non eri sicuro: un patronato controlla in pochi minuti.'}</p>
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
          <p class="say">Famiglia, residenza e ISEE (${formatEuro(state.isee)}, sotto il limite di ${formatEuro(rules.isee_max)}) vanno bene.</p>
          <p class="say">L'INPS controlla anche reddito, casa e risparmi: il patronato lo verifica con te prima di mandare la domanda.</p>
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
