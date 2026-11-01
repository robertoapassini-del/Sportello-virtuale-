// Modulo 12 — prevenzione gratuita per età: screening oncologici e vaccini.
// Prima la risposta: la pagina mostra subito la risposta scritta; il percorso per età parte dal pulsante.
// Regole fisse per età e sesso. Non chiediamo la malattia.
import { prevenzione, numeroScreening } from './engine.js';
import { esc, loadJSON, loadRegional, disclaimer, renderFooter, avvisoErrore, readForm, callButton, officeBox, aslLabel, aslEnte, regione, regioneNonPronta, fontiNazionali } from './common.js';
import { createFlow, choice, restartBtn, progress, needsRegion, showError } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
// La risposta scritta della pagina: è la prima schermata del percorso.
const answerHtml = app.innerHTML;
let rules;
let data;
const state = {};
const sources = () => [fontiNazionali(rules.sources), { verified: rules.last_verified, note: `Le età possono cambiare con le campagne regionali: chiedi conferma al medico o all'${aslLabel()}.` }];

const item = (x, extra) => `<li><span class="ico" aria-hidden="true">${x.icon}</span><span><strong>${esc(x.title)}</strong> – ${extra}<br><span class="muted">${esc(x.how)}</span></span></li>`;

const screens = {
  // Prima schermata: la risposta scritta che è già nella pagina (vedi index.html).
  // Così «Ricomincia» e il tasto Indietro riportano alla risposta, non a una presentazione.
  intro: () => ({ html: answerHtml }),

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
        <input type="number" id="age" name="age" min="0" max="120" inputmode="numeric" value="${esc(state.age == null ? '' : state.age)}" aria-describedby="age-form-error">
        <p class="field-error" id="age-form-error" role="alert" hidden></p>
        <button type="submit" class="btn primary big">Avanti ▶️</button>
      </form>`,
    mount() {
      document.getElementById('age-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const n = Number(readForm(e.target).age);
        if (!Number.isInteger(n) || n < 0 || n > 120) return showError('age-form', 'Scrivi l\'età in anni, per esempio 67.', { field: 'age' });
        state.age = n;
        // Screening e vaccini per età valgono in tutta Italia: se la regione scelta non ha i dati
        // di questo modulo si va dritti al risultato, senza perdere le risposte.
        flow.go(regioneNonPronta() ? 'result' : 'province');
      });
    },
  }),

  province: () => ({
    html: `${progress(3, 3)}
      <h1>📍 Dove abita?</h1>
      <p>Ci serve per darti il numero giusto per prenotare.</p>
      <div class="grid2">${[...data.asl].sort((a, b) => a.province.localeCompare(b.province)).map((a) => choice('', a.province, { province: a.id }, 'result')).join('')}</div>`,
  }),

  result: () => {
    const r = prevenzione(rules, { age: state.age, sex: state.sex });
    // Regione senza i dati di questo modulo: niente ufficio né numero della provincia.
    const a = regioneNonPronta() ? null : data.asl.find((x) => x.id === state.province);
    const scr = a && (a.contacts || []).find((c) => c.topic === 'screening');
    // Un numero solo nella frase; con più numeri (più aziende nella provincia, o uno per esame) l'elenco sotto.
    const { numero: num, elenco } = numeroScreening(a, { regione: regione(), province: state.province, screeningNumbers: rules.screening_numbers });
    const later = r.later.slice(0, 3).map((x) => `<li><span class="ico" aria-hidden="true">${x.icon}</span><span>${esc(x.title)}: <strong>dai ${x.min} anni</strong></span></li>`).join('');
    const none = !r.screening.length && !r.vaccines.length;
    return {
      html: `
        <div class="hero" aria-hidden="true">${none ? '🧒' : '✅'}</div>
        <h1>${none ? 'Per ora non ci sono controlli di questo tipo' : 'Ecco cosa puoi fare gratis'}</h1>
        ${none ? `<p>Per i bambini e i ragazzi, i vaccini e i controlli li segue il pediatra o il medico di famiglia: chiedi a lui il calendario.</p>` : ''}
        ${r.screening.length ? `
          <h2>🎗️ Esami contro i tumori</h2>
          <p>Gratis, <strong>senza ricetta</strong> e senza ticket.</p>
          <ul class="icon-list">${r.screening.map((s) => item(s, `ogni ${s.every_years} anni (dai ${s.min} ai ${s.max} anni)`)).join('')}</ul>` : ''}
        ${r.vaccines.length ? `
          <h2>💉 Vaccini</h2>
          <ul class="icon-list">${r.vaccines.map((v) => item(v, esc(v.every))).join('')}</ul>` : ''}
        <h2>Come prenotare</h2>
        <ol class="big-steps">
          <li><strong>Chiedi al medico di famiglia:</strong> sa quali controlli ti mancano e fa molti vaccini direttamente nello studio.</li>
          <li><strong>Per gli esami contro i tumori</strong> chiama il numero dello screening dell'${aslEnte()}${a ? ` di ${esc(a.province)}` : ''}${num ? `: <strong>${esc(num)}</strong>` : elenco ? ': trovi i numeri qui sotto, con il nome di ogni ufficio' : ' (te lo dà il CUP o l\'URP)'}. Se hai ricevuto una lettera di invito, c'è scritto il numero.</li>
          <li><strong>Per i vaccini</strong> puoi andare anche al centro vaccinale dell'${aslLabel()} o, dove c'è il servizio, in farmacia.</li>
        </ol>
        ${scr ? officeBox(a, 'screening', '🎗️ Prenotare gli esami contro i tumori') : num ? callButton('Numero verde screening', num) : ''}
        ${later ? `<details class="card"><summary>Cosa arriverà più avanti</summary><ul class="icon-list">${later}</ul></details>` : ''}
        ${r.screening.length || state.age >= 45 ? `<p class="muted">Alcune Regioni invitano agli esami contro i tumori anche altre età. Chiedi al numero dello screening.</p>` : ''}
        <div class="notice info"><p>Se hai una malattia cronica, sei incinta o lavori con persone fragili, alcuni vaccini sono gratis anche prima di queste età. Chiedi al medico.</p></div>
        ${disclaimer(rules.last_verified)}
        ${restartBtn()}`,
    };
  },
};

let flow;
(async function init() {
  renderFooter(ROOT);
  try { [rules, data] = await Promise.all([loadJSON(`${ROOT}data/rules-prevenzione.json`), loadRegional(ROOT, 'asl')]); } catch {
    avvisoErrore(); return; // la risposta scritta nella pagina resta, con l'avviso sopra
  }
  flow = createFlow({ app, screens, state, sources });
  // Scelta la regione dopo sesso ed età (needsRegion): se non ha i dati di questo modulo, al posto del
  // blocco si mostra subito il risultato nazionale (createFlow ha già messo la scelta della regione davanti).
  const province = screens.province;
  screens.province = () => (!needsRegion() && regioneNonPronta() && state.age != null ? screens.result() : province());
  flow.render();
})();
