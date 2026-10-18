// Pagina iniziale: scelta guidata. Prima 4 grandi riquadri, poi al massimo 4 scelte.
// In più una casella «Scrivi una parola» per chi aiuta, e il pulsante Ascolta.
import { esc, loadJSON, renderFooter, helpBox, listenButton, speakScreen, stopSpeaking, sourcesBox } from './common.js';

const app = document.getElementById('app');
let reg;
let rulesSources = [];
let current = { screen: 'groups' };

function card(href, icon, title, small) {
  return `<a class="btn choice" href="${esc(href)}"><span class="ico" aria-hidden="true">${icon}</span><span class="txt">${esc(title)}${small ? `<small>${esc(small)}</small>` : ''}</span></a>`;
}
function groupBtn(g) {
  return `<button type="button" class="btn choice" data-group="${esc(g.id)}"><span class="ico" aria-hidden="true">${g.icon}</span><span class="txt">${esc(g.title)}<small>${esc(g.small)}</small></span></button>`;
}

const intro = () => `
  <section class="hero-band">
  <div class="topbar">${listenButton()}</div>
  <h1>Ci penso io</h1>
  <p class="lead say">Sanità, cure e invalidità: ti diciamo cosa ti spetta, entro quando e come chiederlo. Con parole semplici.</p>
  <div class="notice info"><p class="say">✅ È gratis. 🤝 Siamo volontari: <strong>non siamo l'ASP, l'INPS né un altro ufficio pubblico</strong>. 🔒 Non salviamo niente. 📍 Per ora vale solo in Sicilia.</p></div>
  </section>`;

const search = `
  <details class="card search">
    <summary><span class="ico" aria-hidden="true">🔎</span> Oppure scrivi una parola</summary>
    <label for="q" class="sr-only">Cerca</label>
    <input type="search" id="q" placeholder="Per esempio: carrozzina, ticket, referti" autocomplete="off">
    <div id="q-results" aria-live="polite"></div>
  </details>`;

function render() {
  stopSpeaking();
  let html;
  if (current.screen === 'groups') {
    html = `${intro()}
      <h2 class="say">Di cosa hai bisogno?</h2>
      ${reg.groups.map(groupBtn).join('')}
      ${search}`;
  } else {
    const g = reg.groups.find((x) => x.id === current.screen);
    const mods = reg.modules.filter((m) => m.group === g.id);
    html = `<button type="button" class="back" data-back="1">← Torna indietro</button>
      <h1><span aria-hidden="true">${g.icon}</span> ${esc(g.title)}</h1>
      <p class="say">Scegli quello che ti somiglia di più.</p>
      ${mods.map((m) => card(`${m.id}/index.html`, m.icon, m.title, m.small)).join('')}`;
  }
  app.innerHTML = `${current.screen === 'groups' ? '' : `<div class="topbar">${listenButton()}</div>`}${html}${helpBox()}${sourcesBox(rulesSources, {})}`;
  window.scrollTo(0, 0);
  const q = document.getElementById('q');
  if (q) q.addEventListener('input', () => showResults(q.value));
}

function showResults(text) {
  const box = document.getElementById('q-results');
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length >= 3);
  if (!words.length) { box.innerHTML = ''; return; }
  const hits = reg.modules.filter((m) => {
    const hay = `${m.title} ${m.small} ${m.keywords}`.toLowerCase();
    return words.some((w) => hay.includes(w));
  });
  box.innerHTML = hits.length
    ? hits.map((m) => card(`${m.id}/index.html`, m.icon, m.title, m.small)).join('')
    : '<p class="muted">Non abbiamo trovato niente con questa parola. Prova con un\'altra, oppure scegli uno dei riquadri qui sopra.</p>';
}

app.addEventListener('click', (e) => {
  const listen = e.target.closest('button[data-action="listen"]');
  if (listen) return speakScreen(app);
  const g = e.target.closest('button[data-group]');
  if (g) { current = { screen: g.dataset.group }; render(); return; }
  if (e.target.closest('button[data-back]')) { current = { screen: 'groups' }; render(); }
});

(async function init() {
  renderFooter('');
  try {
    reg = await loadJSON('data/moduli.json');
    const names = ['rules', 'rules-invalidita', 'rules-cartella', 'rules-ausili', 'rules-esenzione', 'rules-ricorso', 'rules-adi', 'rules-piano', 'rules-domiciliare', 'rules-palliative', 'rules-prevenzione', 'rules-medico'];
    rulesSources = (await Promise.all(names.map((n) => loadJSON(`data/${n}.json`)))).flatMap((r) => r.sources);
  } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>';
    return;
  }
  render();
})();
