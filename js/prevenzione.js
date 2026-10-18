// Modulo 12 — prevenzione gratuita per età: screening oncologici e vaccini.
// Regole fisse per età e sesso. Non chiediamo la malattia.
import { prevenzione } from './engine.js';
import { esc, loadJSON, disclaimer, renderFooter, readForm, callButton } from './common.js';
import { createFlow, choice, restartBtn, progress } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
let rules;
let data;
const state = {};
const sources = () => [rules.sources, { verified: rules.last_verified, note: 'Le età possono cambiare con le campagne regionali: chiedi conferma al medico o all\'ASP.' }];

const item = (x, extra) => `<li class="say"><span class="ico" aria-hidden="true">${x.icon}</span><span><strong>${esc(x.title)}</strong> – ${extra}<br><span class="muted">${esc(x.how)}</span></span></li>`;

const screens = {
  intro: () => ({
    html: `
      <div class="hero" aria-hidden="true">🛡️</div>
      <h1>Quali controlli e vaccini puoi fare gratis?</h1>
      <p class="lead say">Ci sono esami contro i tumori e vaccini che il Servizio sanitario offre gratis, in base all'età. Molte persone non lo sanno.</p>
      <p class="say">Con 2 domande ti diciamo quali sono i tuoi e come prenotarli.</p>
      <button type="button" class="btn primary big" data-go="sex">▶️ Comincia</button>
      <p class="muted say">È gratis. Non salviamo niente. Non chiediamo la malattia.</p>`,
  }),

  sex: () => ({
    html: `${progress(1, 3)}
      <h1>👤 La persona è…</h1>
      ${choice('👩', 'Una donna', { sex: 'F' }, 'age')}
      ${choice('👨', 'Un uomo', { sex: 'M' }, 'age')}`,
  }),

  age: () => ({
    html: `${progress(2, 3)}
      <h1>🎂 Quanti anni ha?</h1>
      <form id="age-form" novalidate>
        <label for="age">Età, in anni</label>
        <input type="number" id="age" name="age" min="0" max="120" inputmode="numeric" value="${esc(state.age ?? '')}">
        <p class="field-error" id="age-form-error" role="alert" hidden></p>
        <button type="submit" class="btn primary big">Avanti ▶️</button>
      </form>`,
    mount() {
      document.getElementById('age-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const n = Number(readForm(e.target).age);
        if (!Number.isInteger(n) || n < 0 || n > 120) {
          const err = document.getElementById('age-form-error');
          err.textContent = 'Scrivi l\'età in anni, per esempio 67.';
          err.hidden = false;
          return;
        }
        state.age = n;
        flow.go('province');
      });
    },
  }),

  province: () => ({
    html: `${progress(3, 3)}
      <h1>📍 Dove abita?</h1>
      <p class="say">Ci serve per darti il numero giusto per prenotare.</p>
      <div class="grid2">${[...data.asl].sort((a, b) => a.province.localeCompare(b.province)).map((a) => choice('📍', a.province, { province: a.id }, 'result')).join('')}</div>`,
  }),

  result: () => {
    const r = prevenzione(rules, { age: state.age, sex: state.sex });
    const a = data.asl.find((x) => x.id === state.province);
    const num = rules.screening_numbers[state.province];
    const later = r.later.slice(0, 3).map((x) => `<li class="say"><span class="ico" aria-hidden="true">${x.icon}</span><span>${esc(x.title)}: <strong>dai ${x.min} anni</strong></span></li>`).join('');
    const none = !r.screening.length && !r.vaccines.length;
    return {
      html: `
        <div class="hero" aria-hidden="true">${none ? '🧒' : '✅'}</div>
        <h1>${none ? 'Per ora non ci sono controlli di questo tipo' : 'Ecco cosa puoi fare gratis'}</h1>
        ${none ? `<p class="say">Per i bambini e i ragazzi, i vaccini e i controlli li segue il pediatra o il medico di famiglia: chiedi a lui il calendario.</p>` : ''}
        ${r.screening.length ? `
          <h2 class="say">🎗️ Esami contro i tumori</h2>
          <p class="say">Gratis, <strong>senza ricetta</strong> e senza ticket.</p>
          <ul class="icon-list">${r.screening.map((s) => item(s, `ogni ${s.every_years} anni (dai ${s.min} ai ${s.max} anni)`)).join('')}</ul>` : ''}
        ${r.vaccines.length ? `
          <h2 class="say">💉 Vaccini</h2>
          <ul class="icon-list">${r.vaccines.map((v) => item(v, esc(v.every))).join('')}</ul>` : ''}
        <h2 class="say">Come prenotare</h2>
        <ol class="big-steps">
          <li class="say"><strong>Chiedi al medico di famiglia:</strong> sa quali controlli ti mancano e fa molti vaccini direttamente nello studio.</li>
          <li class="say"><strong>Per gli esami contro i tumori</strong> chiama il numero dello screening dell'ASP di ${esc(a.province)}${num ? `: <strong>${esc(num)}</strong>` : ' (te lo dà il CUP o l\'URP)'}. Se hai ricevuto una lettera di invito, c'è scritto il numero.</li>
          <li class="say"><strong>Per i vaccini</strong> puoi andare anche al centro vaccinale dell'ASP o, dove c'è il servizio, in farmacia.</li>
        </ol>
        ${num ? callButton('Numero verde screening', num) : ''}
        ${later ? `<details class="card"><summary>Cosa arriverà più avanti</summary><ul class="icon-list">${later}</ul></details>` : ''}
        <div class="notice info"><p class="say">Se hai una malattia cronica, sei incinta o lavori con persone fragili, alcuni vaccini sono gratis anche prima di queste età. Chiedi al medico.</p></div>
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
    };
  },
};

let flow;
(async function init() {
  renderFooter(ROOT);
  try { [rules, data] = await Promise.all([loadJSON(`${ROOT}data/rules-prevenzione.json`), loadJSON(`${ROOT}data/asp-sicilia.json`)]); } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>'; return;
  }
  flow = createFlow({ app, screens, state, sources });
  flow.render();
})();
