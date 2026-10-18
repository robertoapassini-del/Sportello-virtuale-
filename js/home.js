// Pagina iniziale: scelta guidata. Prima 4 grandi riquadri, poi al massimo 4 scelte.
// In più una casella di ricerca sempre aperta per chi aiuta, e il pulsante Ascolta.
// Ogni gruppo ha il suo indirizzo (?gruppo=casa) per poterlo condividere.
import { esc, loadJSON, renderFooter, helpBox, listenButton, speakScreen, stopSpeaking, sourcesBox } from './common.js';
import { createNav } from './flow.js';

const app = document.getElementById('app');
let reg;
let rulesSources = [];
let current = { screen: 'groups' };
const nav = createNav({ first: 'groups', show: (screen) => { current = { screen }; render(); } });

function card(href, icon, title, small) {
  return `<a class="btn choice" href="${esc(href)}"><span class="ico" aria-hidden="true">${icon}</span><span class="txt">${esc(title)}${small ? ` <small>${esc(small)}</small>` : ''}</span></a>`;
}
function groupBtn(g) {
  return `<button type="button" class="btn choice" data-group="${esc(g.id)}"><span class="ico" aria-hidden="true">${g.icon}</span><span class="txt">${esc(g.title)} <small>${esc(g.small)}</small></span></button>`;
}

// Prima schermata: la domanda e le 4 scelte subito, come la home di NHS.uk.
// Chi siamo in una riga; il resto sotto le scelte.
const intro = () => `
  <section class="home-intro">
  <div class="topbar">${listenButton()}</div>
  <h1 class="say">Di cosa hai bisogno?</h1>
  <p class="home-trust say">Gratis. Siamo volontari: <strong>non siamo l'ASP né l'INPS</strong>. Per ora solo in Sicilia.</p>
  </section>`;

// La ricerca è sempre aperta: serve soprattutto a chi aiuta un familiare.
const search = `
  <div class="home-search">
    <label for="q">Oppure cerca una parola</label>
    <input type="search" id="q" placeholder="Per esempio: carrozzina, ticket, referti" autocomplete="off">
    <div id="q-results" aria-live="polite"></div>
  </div>`;

const about = `
  <div class="notice info home-about"><p class="say">Sanità, cure e invalidità: ti diciamo cosa ti spetta, entro quando e come chiederlo. Con parole semplici.</p></div>`;

function render() {
  stopSpeaking();
  let html;
  if (current.screen === 'groups') {
    html = `${intro()}
      ${reg.groups.map(groupBtn).join('')}
      ${search}
      ${about}`;
  } else {
    const g = reg.groups.find((x) => x.id === current.screen);
    const mods = reg.modules.filter((m) => m.group === g.id);
    html = `<div class="topbar"><button type="button" class="back" data-back="1">← Torna indietro</button>${listenButton()}</div>
      <h1><span aria-hidden="true">${g.icon}</span> ${esc(g.title)}</h1>
      <p class="say">Scegli quello che ti somiglia di più.</p>
      ${mods.map((m) => card(`${m.id}/index.html`, m.icon, m.title, m.small)).join('')}`;
  }
  app.innerHTML = `${html}${helpBox()}${sourcesBox(rulesSources, {})}`;
  window.scrollTo(0, 0);
  if (current.screen !== 'groups') {
    const h1 = app.querySelector('h1');
    h1.setAttribute('tabindex', '-1');
    h1.focus({ preventScroll: true });
  }
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
  if (g) { nav.go(g.dataset.group, `?gruppo=${encodeURIComponent(g.dataset.group)}`); return; }
  if (e.target.closest('button[data-back]')) nav.back();
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
  // Link condiviso a un gruppo (?gruppo=casa): la home sotto, il gruppo sopra,
  // così «Torna indietro» porta alle 4 scelte e non fuori dal sito.
  const wanted = new URLSearchParams(location.search).get('gruppo');
  if (wanted && reg.groups.some((g) => g.id === wanted)) {
    history.replaceState(history.state, '', location.pathname);
    render();
    nav.go(wanted, `?gruppo=${encodeURIComponent(wanted)}`);
    return;
  }
  render();
})();
