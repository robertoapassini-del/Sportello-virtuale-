// Modulo 5 — esenzione dal ticket per reddito: «devo pagare il ticket?».
// Calcolo con regole fisse nazionali (codici E01-E04). Nessuna lettera.
// Non chiediamo la malattia: le esenzioni per malattia le mostriamo solo come informazione.
import { esenzioneReddito, formatEuro } from './engine.js';
import { esc, loadJSON, disclaimer, renderFooter, readForm } from './common.js';
import { createFlow, choice, restartBtn, progress } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
let rules;
const state = {};

const sources = () => [rules.sources, { verified: rules.last_verified }];

const ageText = { under6: 'meno di 6 anni', '6to59': 'tra 6 e 59 anni', '60to64': 'tra 60 e 64 anni', '65plus': '65 anni o più' };

const howToGet = () => `
  <h2 class="say">Come si ottiene</h2>
  <ol class="big-steps">
    <li class="say"><strong>Chiedi al medico di famiglia.</strong> Spesso l'esenzione per reddito è già nel suo computer: la mette sulla ricetta e non devi fare niente.</li>
    <li class="say"><strong>Se non c'è, vai allo sportello esenzioni dell'ASP</strong> (nel distretto o al CUP) con tessera sanitaria e carta d'identità. Firmi un foglio in cui dichiari il reddito (autocertificazione). È gratis.</li>
    <li class="say"><strong>Quando prenoti, di' che hai l'esenzione.</strong> Deve essere scritta sulla ricetta, altrimenti il ticket lo paghi.</li>
  </ol>
  <div class="notice warn"><p class="say">⚠️ L'esenzione vale fino al <strong>${esc(rules.valid_until)}</strong>. Poi va controllata di nuovo. Se dichiari un reddito falso, devi restituire i soldi e paghi una multa.</p></div>`;

const otherExemptions = () => `
  <details class="card">
    <summary>Altre esenzioni: invalidità, malattie, gravidanza</summary>
    <p>Queste non dipendono dal reddito. Chiedi al medico di famiglia o allo sportello esenzioni dell'ASP.</p>
    <ul class="clean">${rules.other_exemptions.map((o) => `<li><strong>${esc(o.code)}</strong> – ${esc(o.text)}</li>`).join('')}</ul>
  </details>`;

const screens = {
  intro: () => ({
    html: `
      <div class="hero" aria-hidden="true">🎫</div>
      <h1>Devi pagare il ticket?</h1>
      <p class="lead say">Molte persone pagano visite ed esami senza sapere che non dovrebbero.</p>
      <p class="say">Con 4 domande ti diciamo se hai diritto all'esenzione per età o per reddito, e come ottenerla.</p>
      <div class="notice info">
        <p class="say"><strong>Ti serve un numero:</strong> il reddito di tutta la famiglia dell'anno scorso. Lo trovi sulla dichiarazione dei redditi (730 o CU). Se non lo sai, va bene lo stesso: ti diciamo il limite.</p>
      </div>
      <button type="button" class="btn primary big" data-go="age">▶️ Comincia</button>
      <p class="muted say">È gratis. Non salviamo niente. Vale per visite ed esami, non per le medicine.</p>`,
  }),

  age: () => ({
    html: `${progress(1, 4)}
      <h1>🎂 Quanti anni ha la persona?</h1>
      <p class="say">Chi deve fare la visita o l'esame. Conta l'età già compiuta: chi ha fatto 65 anni sceglie «65 anni o più».</p>
      ${choice('👶', 'Meno di 6 anni', { ageBand: 'under6' }, 'status')}
      ${choice('🧑', 'Da 6 a 59 anni', { ageBand: '6to59' }, 'status')}
      ${choice('🧓', 'Da 60 a 64 anni', { ageBand: '60to64' }, 'status')}
      ${choice('👵', '65 anni o più', { ageBand: '65plus' }, 'status')}`,
  }),

  status: () => ({
    html: `${progress(2, 4)}
      <h1>📋 C'è una di queste situazioni?</h1>
      <p class="say">Vale per la persona o per chi la mantiene (per esempio il genitore o il coniuge di cui è a carico).</p>
      ${choice('💼', 'Disoccupato iscritto al centro per l\'impiego', { status: 'disoccupato' }, 'family', 'Ha perso il lavoro ed è iscritto come disoccupato. Non vale per chi non ha mai lavorato o per le casalinghe')}
      ${choice('🏛️', 'Ha l\'assegno sociale', { status: 'sociale' }, 'family', 'Si chiamava «pensione sociale»')}
      ${choice('👴', 'Ha la pensione al minimo e più di 60 anni', { status: 'minimo' }, 'family', 'La pensione «integrata al minimo» dell\'INPS')}
      ${choice('➖', 'Nessuna di queste', { status: 'none' }, 'family')}`,
  }),

  family: () => ({
    html: `${progress(3, 4)}
      <h1>👨‍👩‍👧 La famiglia</h1>
      <p class="say">Conta chi è nello stesso stato di famiglia e a carico.</p>
      <form id="fam-form" novalidate>
        <label class="check"><input type="checkbox" name="spouse" ${state.spouse ? 'checked' : ''}> C'è un coniuge (marito o moglie) a carico</label>
        <label for="children">Quanti figli a carico?<span class="hint">Scrivi 0 se nessuno</span></label>
        <input type="number" id="children" name="children" min="0" max="20" inputmode="numeric" value="${esc(state.children ?? 0)}">
        <button type="submit" class="btn primary big">Avanti ▶️</button>
      </form>`,
    mount() {
      document.getElementById('fam-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = readForm(e.target);
        state.spouse = !!v.spouse;
        state.children = Math.max(0, Math.min(20, parseInt(v.children, 10) || 0));
        flow.go('income');
      });
    },
  }),

  income: () => ({
    html: `${progress(4, 4)}
      <h1>💶 Quanto ha guadagnato la famiglia l'anno scorso?</h1>
      <p class="say">Il reddito di tutti insieme, lordo. È sulla dichiarazione dei redditi (730, Redditi) o sulla CU della pensione.</p>
      <form id="inc-form" novalidate>
        <label for="income">Reddito familiare dell'anno scorso, in euro<span class="hint">Per esempio 15000. Senza punti né virgole</span></label>
        <input type="number" id="income" name="income" min="0" step="1" inputmode="numeric" value="${esc(state.income ?? '')}">
        <p class="field-error" id="inc-form-error" role="alert" hidden></p>
        <button type="submit" class="btn primary big">✔️ Controlla</button>
      </form>
      <button type="button" class="btn" id="no-income">🤷 Non lo so</button>`,
    mount() {
      document.getElementById('inc-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = readForm(e.target);
        const n = Number(v.income);
        if (v.income === '' || !Number.isFinite(n) || n < 0) {
          const err = document.getElementById('inc-form-error');
          err.textContent = 'Scrivi un numero, oppure premi «Non lo so».';
          err.hidden = false;
          return;
        }
        state.income = n;
        flow.go('result');
      });
      document.getElementById('no-income').addEventListener('click', () => { state.income = null; flow.go('result'); });
    },
  }),

  result: () => {
    const r = esenzioneReddito(rules, state);
    const c = rules.codes;
    const li = (code, why) => `<li class="say"><span class="ico" aria-hidden="true">✅</span><span><strong>Codice ${code}</strong>: ${esc(c[code].label)}.${why ? ` ${why}` : ''}</span></li>`;
    const thr = (code) => formatEuro(r.thresholds[code]);

    if (r.codes.length) {
      return {
        html: `
          <div class="hero" aria-hidden="true">✅</div>
          <h1>Non devi pagare il ticket per visite ed esami</h1>
          <div class="notice ok">
            <p class="say">Hai diritto all'esenzione per reddito:</p>
            <ul class="icon-list">${r.codes.map((k) => li(k, r.thresholds[k] ? `Il tuo reddito è sotto il limite di ${thr(k)}.` : '')).join('')}</ul>
            ${r.codes.length > 1 ? '<p class="say">Basta una sola: il medico sceglie quale scrivere.</p>' : ''}
          </div>
          ${howToGet()}
          ${otherExemptions()}
          ${disclaimer(rules.last_verified)}
          ${restartBtn()}`,
      };
    }
    if (r.maybe.length) {
      return {
        html: `
          <div class="hero" aria-hidden="true">🔎</div>
          <h1>Dipende dal reddito: ecco il limite</h1>
          <div class="notice info">
            <p class="say">Per la tua situazione, non paghi il ticket se il reddito della famiglia dell'anno scorso è sotto:</p>
            <ul class="icon-list">${r.maybe.map((k) => `<li class="say"><span class="ico" aria-hidden="true">💶</span><span><strong>${thr(k)}</strong> – codice ${k}: ${esc(c[k].label)}</span></li>`).join('')}</ul>
            <p class="say">Guarda il reddito sulla dichiarazione dei redditi o sulla CU, poi torna indietro e scrivilo.</p>
          </div>
          <button type="button" class="btn primary" data-action="back">← Scrivi il reddito</button>
          ${howToGet()}
          ${otherExemptions()}
          ${disclaimer(rules.last_verified)}
          ${restartBtn()}`,
      };
    }
    const why = [];
    if (r.thresholds.E01) why.push(`per età il limite è ${thr('E01')} e il reddito è più alto`);
    if (r.thresholds.E02) why.push(`per i disoccupati il limite è ${thr('E02')} e il reddito è più alto`);
    if (r.thresholds.E04) why.push(`per la pensione al minimo il limite è ${thr('E04')} e il reddito è più alto`);
    if (!why.length) why.push(`l'esenzione per reddito vale solo sotto i 6 anni, dai 65 anni in su (reddito fino a ${formatEuro(c.E01.income_max)}), per i disoccupati, per chi ha l'assegno sociale o la pensione al minimo`);
    return {
      html: `
        <div class="hero" aria-hidden="true">💳</div>
        <h1>Per il reddito non c'è esenzione</h1>
        <div class="notice warn"><p class="say">Con i dati che hai scritto (${esc(ageText[state.ageBand])}), ${esc(why.join('; '))}.</p></div>
        <p class="say">Ma potresti non pagare per <strong>altri motivi</strong>: una malattia cronica, un'invalidità, la gravidanza, gli esami di prevenzione. Guarda qui sotto.</p>
        ${otherExemptions()}
        <div class="notice info"><p class="say">Se la situazione è cambiata (per esempio hai perso il lavoro quest'anno), chiedi allo sportello esenzioni dell'ASP: in alcuni casi conta la situazione di adesso.</p></div>
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
    };
  },
};

let flow;
(async function init() {
  renderFooter(ROOT);
  try {
    rules = await loadJSON(`${ROOT}data/rules-esenzione.json`);
  } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>';
    return;
  }
  flow = createFlow({ app, screens, state, sources, first: 'intro' });
  flow.render();
})();
