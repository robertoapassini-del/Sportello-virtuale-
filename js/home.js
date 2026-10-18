// Pagina iniziale: la domanda e 4 grandi riquadri, uno per area. Ogni riquadro porta
// alla pagina dell'area (per esempio visite-esami/index.html), come la home di NHS.uk.
// La ricerca è nella testata: qui i risultati compaiono mentre si scrive.
import { esc, loadJSON, renderFooter, helpBox, listenButton, speakScreen, sourcesBox } from './common.js';

const app = document.getElementById('app');
let reg;
let rulesSources = [];

function card(href, icon, title, small) {
  return `<a class="btn choice" href="${esc(href)}"><span class="ico" aria-hidden="true">${icon}</span><span class="txt">${esc(title)}${small ? ` <small>${esc(small)}</small>` : ''}</span></a>`;
}

// Chi siamo in una riga sopra le scelte; il resto sotto.
const intro = () => `
  <section class="home-intro page-band">
  <div class="topbar">${listenButton()}</div>
  <h1 class="say">Di cosa hai bisogno?</h1>
  <p class="home-trust say">Gratis. Siamo volontari: <strong>non siamo l'ASP né l'INPS</strong>. Per ora solo in Sicilia.</p>
  </section>`;

const results = `
  <section class="home-results no-say" id="q-box" hidden>
    <h2 id="q-title">Risultati della ricerca</h2>
    <div id="q-results" aria-live="polite"></div>
  </section>`;

const about = `
  <div class="notice info home-about"><p class="say">Sanità, cure e invalidità: ti diciamo cosa ti spetta, entro quando e come chiederlo. Con parole semplici.</p></div>`;

// Le domande più frequenti: link d'azione con la freccia verde, come NHS.uk.
const FREQUENTI = [
  ['liste-attesa', 'Controlla se la tua visita è troppo lontana'],
  ['esenzione-ticket', 'Scopri se devi pagare il ticket'],
  ['invalidita', "Controlla se la visita per l'invalidità è in ritardo"],
];
const frequent = () => `
  <section class="frequent">
  <h2 class="say">Le domande più frequenti</h2>
  <ul class="action-links">${FREQUENTI.map(([id, text]) => `
    <li><a class="action-link" href="${id}/index.html"><span class="arrow" aria-hidden="true">▶️</span><span class="txt say">${esc(text)}</span></a></li>`).join('')}
  </ul>
  </section>`;

// Riquadro rosso per chi sta male adesso (come le «care card» urgenti di NHS.uk).
const urgent = `
  <section class="care-urgent" aria-labelledby="urg-title">
    <h2 id="urg-title" class="say">Stai male adesso?</h2>
    <div class="care-body">
      <p class="say">Questo sito non serve per le urgenze.</p>
      <ul>
        <li class="say">Se è grave, chiama subito il <a href="tel:112"><strong>112</strong></a>.</li>
        <li class="say">La sera, di notte e nei giorni di festa: chiama la <strong>guardia medica</strong> della tua zona.</li>
      </ul>
    </div>
  </section>`;

function render() {
  app.innerHTML = `${intro()}
    ${results}
    <div class="area-grid">${reg.groups.map((g) => card(`${g.page}/index.html`, g.icon, g.title, g.small)).join('')}</div>
    <div class="home-row">${urgent}${frequent()}</div>
    ${about}
    ${helpBox()}${sourcesBox(rulesSources, {})}`;
}

function showResults(text) {
  const box = document.getElementById('q-box');
  const list = document.getElementById('q-results');
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length >= 3);
  if (!words.length) { box.hidden = true; list.innerHTML = ''; return; }
  const hits = reg.modules.filter((m) => {
    const hay = `${m.title} ${m.small} ${m.keywords}`.toLowerCase();
    return words.some((w) => hay.includes(w));
  });
  box.hidden = false;
  document.getElementById('q-title').textContent = `Risultati per «${text.trim()}»`;
  list.innerHTML = hits.length
    ? hits.map((m) => card(`${m.id}/index.html`, m.icon, m.title, m.small)).join('')
    : '<p class="muted">Non abbiamo trovato niente con questa parola. Prova con un\'altra, oppure scegli uno dei riquadri qui sotto.</p>';
}

app.addEventListener('click', (e) => {
  if (e.target.closest('button[data-action="listen"]')) speakScreen(app);
});

(async function init() {
  renderFooter('');
  try {
    reg = await loadJSON('data/moduli.json');
    const names = [...new Set(reg.modules.flatMap((m) => m.data))].filter((n) => n.startsWith('rules'));
    rulesSources = (await Promise.all(names.map((n) => loadJSON(`data/${n}.json`)))).flatMap((r) => r.sources);
  } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>';
    return;
  }
  const params = new URLSearchParams(location.search);
  // Vecchi link ai gruppi (?gruppo=casa): ora ogni area ha la sua pagina.
  const old = reg.groups.find((g) => g.id === params.get('gruppo'));
  if (old) { location.replace(`${old.page}/index.html`); return; }

  render();
  // In questa pagina la ricerca della testata non ricarica: mostra i risultati subito.
  const hq = document.getElementById('hq');
  if (hq) {
    hq.addEventListener('input', () => showResults(hq.value));
    hq.form.addEventListener('submit', (e) => {
      e.preventDefault();
      showResults(hq.value);
      document.getElementById('q-box').scrollIntoView({ block: 'start' });
    });
    // Ricerca partita da un'altra pagina (?q=carrozzina).
    const asked = params.get('q');
    if (asked) { hq.value = asked; showResults(asked); }
  }
})();
