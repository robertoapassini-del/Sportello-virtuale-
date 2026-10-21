// Pagina iniziale: la domanda e 4 grandi riquadri, uno per area. Ogni riquadro porta
// alla pagina dell'area (per esempio visite-esami/), come la home di NHS.uk.
// La ricerca è nella testata: qui i risultati compaiono mentre si scrive.
import { esc, loadJSON, loadRegioni, renderFooter, helpBox, sourcesBox, aslLabel, regioniAttive, regioneInfo, regioneSalvata } from './common.js';

const app = document.getElementById('app');
let reg;
let rulesSources = [];

function card(href, icon, title, small) {
  return `<a class="btn choice" href="${esc(href)}"><span class="ico" aria-hidden="true">${icon}</span><span class="txt">${esc(title)}${small ? ` <small>${esc(small)}</small>` : ''}</span></a>`;
}

// Chi siamo in una riga sopra le scelte; il resto sotto. Con una regione sola: «Per ora solo in <regione>».
// Con più regioni: quale si sta guardando e il link per cambiarla (la scelta è in Numeri utili).
function intro() {
  const scelta = regioneSalvata() || regioneInfo();
  const piu = regioniAttive().length > 1;
  // Finché non si sceglie la regione, il nome generico: la sigla cambia da regione a regione (ASP, ASL, ATS…).
  const ente = piu && !regioneSalvata() ? 'azienda sanitaria (ASL)' : (scelta.asl_label || aslLabel());
  return `
  <section class="home-intro page-band">
  <h1>Di cosa hai bisogno?</h1>
  <p class="home-trust">Gratis. Siamo volontari: <strong>non siamo l'${esc(ente)} né l'INPS</strong>.${piu ? '' : ` Per ora solo in ${esc(regioneInfo().name)}.`}</p>
  ${piu ? `<p class="home-regione">📍 ${regioneSalvata() ? `Stai guardando: <strong>${esc(scelta.name)}</strong> · <a href="numeri-utili/?torna=${encodeURIComponent(location.pathname)}#regione">Cambia regione</a>` : `<a href="numeri-utili/?torna=${encodeURIComponent(location.pathname)}#regione">Scegli la tua regione</a> per vedere i numeri e gli uffici della tua zona`}</p>` : ''}
  </section>`;
}

const results = `
  <section class="home-results" id="q-box" hidden>
    <h2 id="q-title">Risultati della ricerca</h2>
    <div id="q-results" aria-live="polite"></div>
  </section>`;

const about = `
  <div class="notice info home-about"><p>Sanità, cure e invalidità: ti diciamo cosa ti spetta, entro quando e come chiederlo. Con parole semplici.</p></div>`;

// Le domande più frequenti: link d'azione con la freccia verde, come NHS.uk.
const FREQUENTI = [
  ['liste-attesa', 'Controlla se la tua visita è troppo lontana'],
  ['esenzione-ticket', 'Scopri se devi pagare il ticket'],
  ['invalidita', "Controlla se la visita per l'invalidità è in ritardo"],
];
const frequent = () => `
  <section class="frequent">
  <h2>Le domande più frequenti</h2>
  <ul class="action-links">${FREQUENTI.map(([id, text]) => `
    <li><a class="action-link" href="${id}/"><span class="arrow" aria-hidden="true">▶️</span><span class="txt">${esc(text)}</span></a></li>`).join('')}
  </ul>
  </section>`;

// Riquadro rosso per chi sta male adesso (come le «care card» urgenti di NHS.uk).
const urgent = `
  <section class="care-urgent" aria-labelledby="urg-title">
    <h2 id="urg-title">Stai male adesso?</h2>
    <div class="care-body">
      <p>Questo sito non serve per le urgenze.</p>
      <ul>
        <li>Se è grave, chiama subito il <a href="tel:112"><strong>112</strong></a>.</li>
        <li>La sera, di notte e nei giorni di festa: chiama la <strong>guardia medica</strong> della tua zona.</li>
      </ul>
    </div>
  </section>`;

function render() {
  app.innerHTML = `${intro()}
    ${results}
    <div class="area-grid">${reg.groups.map((g) => card(`${g.page}/`, g.icon, g.title, g.small)).join('')}</div>
    <div class="home-row">${urgent}${frequent()}</div>
    ${about}
    ${helpBox()}${sourcesBox(rulesSources, {})}`;
}

// La pagina «Numeri utili» non è un modulo, ma la ricerca deve trovarla.
const NUMERI = {
  id: 'numeri-utili', icon: '📞', title: 'Numeri utili', get small() { return `Guardia medica, CUP, ${aslLabel()}, INPS`; },
  keywords: 'numero numeri telefono chiamare guardia medica notte cup urp centralino inps tessera sanitaria farmacia turno violenza 1522 112 118 116117 pua',
};

function showResults(text) {
  const box = document.getElementById('q-box');
  const list = document.getElementById('q-results');
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length >= 3);
  if (!words.length) { box.hidden = true; list.innerHTML = ''; return; }
  // «rinnovo» trova anche «rinnova»: per le parole lunghe si confronta senza l'ultima lettera.
  const stem = (w) => (w.length >= 6 ? w.slice(0, -1) : w);
  const found = (hay) => words.some((w) => hay.toLowerCase().includes(stem(w)));
  const hits = [];
  for (const m of [NUMERI, ...reg.modules]) {
    if (found(`${m.title} ${m.small} ${m.keywords}`)) hits.push({ href: `${m.id}/`, icon: m.icon, title: m.title, small: m.small });
    // Le pagine corte della guida (moduli.json → "pages"): si cercano per titolo.
    for (const sp of m.pages || []) if (found(sp.title)) hits.push({ href: `${m.id}/${sp.id}/`, icon: m.icon, title: sp.title, small: m.title });
  }
  box.hidden = false;
  document.getElementById('q-title').textContent = `Risultati per «${text.trim()}»`;
  list.innerHTML = hits.length
    ? hits.map((h) => card(h.href, h.icon, h.title, h.small)).join('')
    : '<p class="muted">Non abbiamo trovato niente con questa parola. Prova con un\'altra, oppure scegli uno dei riquadri qui sotto.</p>';
}

(async function init() {
  renderFooter('');
  try {
    [reg] = await Promise.all([loadJSON('data/moduli.json'), loadRegioni('')]);
    const names = [...new Set(reg.modules.flatMap((m) => m.data))].filter((n) => n.startsWith('rules'));
    rulesSources = (await Promise.all(names.map((n) => loadJSON(`data/${n}.json`)))).flatMap((r) => r.sources);
  } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>';
    return;
  }
  const params = new URLSearchParams(location.search);
  // Vecchi link ai gruppi (?gruppo=casa): ora ogni area ha la sua pagina.
  const old = reg.groups.find((g) => g.id === params.get('gruppo'));
  if (old) { location.replace(`${old.page}/`); return; }

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
    // Ricerca partita da un'altra pagina: ./#q=carrozzina (o ?q= senza JavaScript).
    const asked = new URLSearchParams(location.hash.slice(1)).get('q') || params.get('q');
    if (asked) { hq.value = asked; showResults(asked); }
  }
})();
