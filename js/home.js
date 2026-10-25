// Pagina iniziale: la domanda e 4 grandi riquadri, uno per area. Ogni riquadro porta
// alla pagina dell'area (per esempio visite-esami/), come la home di NHS.uk.
// La ricerca è nella testata: qui i risultati compaiono mentre si scrive.
import { cerca } from './cerca.js';
import { esc, loadJSON, loadRegioni, renderFooter, helpBox, sourcesBox, fontiNazionali, aslLabel, regioniAttive, regioneInfo, regioneSalvata, inRegione, count, eventoRicerca, eventoClic, idRegioneScelta, MAINTAINER_EMAIL } from './common.js';

const app = document.getElementById('app');
let reg;
let rulesSources = [];

function card(href, icon, title, small, id = '') {
  return `<a class="btn choice" href="${esc(href)}"${id ? ` data-modulo="${esc(id)}"` : ''}><span class="ico" aria-hidden="true">${icon}</span><span class="txt">${esc(title)}${small ? ` <small>${esc(small)}</small>` : ''}</span></a>`;
}

// Nomi brevi dei moduli con dati regionali, per la frase sulla regione (copertura).
const NOMI_BREVI = {
  'liste-attesa': "liste d'attesa", invalidita: 'invalidità', 'cartella-clinica': 'cartella clinica',
  'assistenza-domiciliare': 'assistenza a casa', 'cure-palliative': 'cure palliative', 'medico-famiglia': 'medico di famiglia',
  ausili: 'ausili', 'esenzione-ticket': 'esenzione dal ticket', prevenzione: 'prevenzione', 'piano-terapeutico': 'piano terapeutico',
};

// Per una regione salvata con solo alcuni moduli («moduli» nell'indice) o non ancora attiva: cosa c'è e cosa no.
function copertura() {
  const r = regioneSalvata();
  if (!r || (r.attiva && !r.moduli)) return '';
  // «In Lombardia», «Nel Lazio»: la preposizione giusta viene dall'indice delle regioni (inRegione).
  const dove = esc(inRegione(r).replace(/^./, (c) => c.toUpperCase()));
  // Si dice solo quello che c'è nella regione, mai quello che manca (23/10/2026: «le lettere già pronte, per ora,
  // solo in Sicilia» non si scrive più; i moduli senza dati della regione non mostrano il pulsante, js/flow.js).
  const pronti = (r.moduli || []).filter((m) => NOMI_BREVI[m]).map((m) => NOMI_BREVI[m]);
  const elenco = pronti.length > 1 ? `${pronti.slice(0, -1).join(', ')} e ${pronti[pronti.length - 1]}` : pronti[0];
  const qui = pronti.length
    ? `${dove} trovi anche i numeri utili e gli uffici della zona per: ${esc(elenco)}.`
    : `${dove} trovi anche i numeri utili.`;
  return r.attiva
    ? `<p class="home-regione">Le regole valgono in tutta Italia. ${qui}</p>`
    : '<p class="home-regione">Le regole valgono in tutta Italia.</p>';
}

// Sotto il titolo, la frase che dice a cosa serve il sito (è anche la descrizione per Google: senza, Google
// mostrava il riquadro «Stai male adesso?»). Poi chi siamo in una riga sopra le scelte; il resto sotto. Con una regione attiva sola: «Per ora solo in <regione>».
// Con più regioni: quale si sta guardando e il link per cambiarla (la scelta è in Numeri utili).
function intro() {
  const scelta = regioneSalvata() || regioneInfo();
  const piu = regioniAttive().length > 1;
  const una = regioniAttive().length === 1; // zero se l'indice non arriva: allora niente «Per ora solo in…»
  // Finché non si sceglie la regione, il nome generico: la sigla cambia da regione a regione (ASP, ASL, ATS…).
  const ente = !una && !regioneSalvata() ? 'azienda sanitaria (ASL)' : (scelta.asl_label || aslLabel());
  return `
  <section class="home-intro page-band">
  <h1>Di cosa hai bisogno?</h1>
  <p class="lead home-lead">Come prenoti una visita? Come chiedi l'esenzione dal ticket o l'invalidità? Qui trovi i passi da fare, con parole semplici e fonti ufficiali. In tutta Italia.</p>
  <p class="home-trust">Gratis. Siamo volontari: <strong>non siamo l'${esc(ente)} né l'INPS</strong>.${una ? ` Per ora solo in ${esc(regioneInfo().name)}.` : ''}</p>
  ${piu ? `<p class="home-regione">📍 ${regioneSalvata() ? `Stai guardando: <strong>${esc(scelta.name)}</strong> · <a href="numeri-utili/?torna=${encodeURIComponent(location.pathname)}#regione">Cambia regione</a>` : `<a href="numeri-utili/?torna=${encodeURIComponent(location.pathname)}#regione">Scegli la tua regione</a> per vedere i numeri e gli uffici della tua zona`}</p>` : ''}
  ${piu ? copertura() : ''}
  </section>`;
}

const results = `
  <section class="home-results" id="q-box" hidden>
    <h2 id="q-title">Risultati della ricerca</h2>
    <div id="q-results" aria-live="polite"></div>
  </section>`;

const about = `
  <div class="notice info home-about"><p>Tutto quello che serve sapere sulla sanità pubblica, con parole semplici. Ogni informazione viene da una fonte ufficiale. Ogni notte il sito copia le pagine ufficiali e controlla numeri e indirizzi.</p></div>`;

// Le domande più frequenti: link d'azione con la freccia verde, come NHS.uk. Prima come si fa (le ricerche più
// frequenti su Google, docs/ricerche-frequenti.md, punto 3b), poi cosa fare se qualcosa non va (24/10/2026).
const FREQUENTI = [
  ['fascicolo-e-ricetta/fascicolo-sanitario', 'Entra nel Fascicolo Sanitario'],
  ['medico-famiglia', 'Cambia il medico di base'],
  ['prenotare-cup', 'Prenota o disdici una visita al CUP'],
  ['esenzione-ticket', 'Scopri se devi pagare il ticket'],
  ['legge-104', 'Chiedi la legge 104'],
];
const NON_VA = [
  ['liste-attesa', 'Controlla se la tua visita è troppo lontana'],
  ['invalidita', "Controlla se la visita per l'invalidità è in ritardo"],
  ['ausili', 'La carrozzina o il letto non arrivano'],
];
const azioni = (lista) => `
  <ul class="action-links">${lista.map(([id, text]) => `
    <li><a class="action-link" href="${id}/"><span class="arrow" aria-hidden="true">▶️</span><span class="txt">${esc(text)}</span></a></li>`).join('')}
  </ul>`;
const frequent = () => `
  <section class="frequent">
  <h2>Le domande più frequenti</h2>${azioni(FREQUENTI)}
  <h2>Qualcosa non va?</h2>${azioni(NON_VA)}
  </section>`;

// Riquadro rosso per chi sta male adesso (come le «care card» urgenti di NHS.uk).
const urgent = `
  <section class="care-urgent" aria-labelledby="urg-title" data-nosnippet>
    <h2 id="urg-title">Stai male adesso?</h2>
    <div class="care-body">
      <p>Questo sito non serve per le urgenze.</p>
      <ul>
        <li>Se è grave, chiama subito il <a href="tel:112"><strong>112</strong></a>.</li>
        <li>La sera, di notte e nei giorni di festa: chiama la <a href="guardia-medica/"><strong>guardia medica</strong></a> della tua zona.</li>
      </ul>
    </div>
  </section>`;

function render() {
  app.innerHTML = `${intro()}
    ${results}
    <div class="area-grid">${reg.groups.map((g) => card(`${g.page}/`, g.icon, g.title, g.small)).join('')}</div>
    <div class="home-row">${urgent}${frequent()}</div>
    ${about}
    ${helpBox()}${sourcesBox(fontiNazionali(rulesSources), {})}`;
}

// La pagina «Numeri utili» non è un modulo, ma la ricerca deve trovarla.
const NUMERI = {
  id: 'numeri-utili', icon: '📞', title: 'Numeri utili', get small() { return `Guardia medica, CUP, ${aslLabel()}, INPS`; },
  keywords: 'numero numeri telefono chiamare guardia medica notte cup urp centralino inps tessera sanitaria farmacia turno violenza 1522 112 118 116117 pua pronto soccorso ambulanza urgente urgenza urgenze emergenza sto male malore continuita assistenziale festivi ats asst ausl ulss azienda sanitaria',
};

// Quando non troviamo niente, ricordiamo sempre il 112 a chi sta male adesso.
// L'email per dirci cosa mancava parte vuota: le parole cercate le scrive la persona, se vuole.
const SCRIVICI = `mailto:${MAINTAINER_EMAIL}?subject=${encodeURIComponent('Non ho trovato quello che cercavo')}&body=${encodeURIComponent('Cosa cercavi? (non scrivere dati sulla tua salute)\n\n')}`;
const NIENTE = '<p class="muted">Non abbiamo trovato niente con queste parole. Prova con un\'altra parola, oppure scegli uno dei riquadri qui sotto.</p>'
  + `<p>Non c'è quello che ti serve? <a href="${esc(SCRIVICI)}">Scrivici cosa cercavi</a>: ci aiuta a scrivere le pagine che mancano.</p>`
  + '<p><strong>Se stai male adesso chiama il <a href="tel:112">112</a>.</strong></p>';

// Statistiche della ricerca (docs/ricerche-frequenti.md): contiamo una volta per pagina aperta
// se qualcuno ha cercato e se la ricerca è rimasta senza risultati, e quale risultato apre.
// Mai le parole scritte. Si conta dopo 2 secondi senza scrivere, o subito con Invio.
const contate = { fatta: false, vuota: false };
let ultimiRisultati = -1;
let attesa = null;
function contaRicerca() {
  clearTimeout(attesa);
  if (ultimiRisultati < 0) return;
  for (const cosa of ultimiRisultati ? ['fatta'] : ['fatta', 'vuota']) {
    if (contate[cosa]) continue;
    contate[cosa] = true;
    count(eventoRicerca(cosa, idRegioneScelta()), { title: cosa === 'vuota' ? 'Ricerca senza risultati' : 'Ricerca', event: true });
  }
}

// La ricerca resta nell'indirizzo (#q=…): aperto un risultato, il tasto Indietro la ritrova.
function saveQuery(text) {
  const q = text.trim();
  const url = `${location.pathname}${location.search}${q ? `#q=${encodeURIComponent(q)}` : ''}`;
  try { history.replaceState(history.state, '', url); } catch { /* indirizzo non modificabile: pazienza */ }
}

// submitted: la persona ha premuto Invio (o la lente). Con 1-2 lettere spieghiamo cosa fare.
function showResults(text, submitted = false) {
  const box = document.getElementById('q-box');
  const list = document.getElementById('q-results');
  const q = text.trim();
  if (q.length < 3) {
    ultimiRisultati = -1;
    if (submitted && q) {
      box.hidden = false;
      document.getElementById('q-title').textContent = 'Risultati della ricerca';
      list.innerHTML = '<p class="muted">Scrivi almeno 3 lettere.</p>';
    } else { box.hidden = true; list.innerHTML = ''; }
    return;
  }
  const hits = cerca(q, [NUMERI, ...reg.modules]);
  box.hidden = false;
  document.getElementById('q-title').textContent = `Risultati per «${q}»`;
  // I testi di data/moduli.json dicono «ASL»: nei risultati si usa la sigla della regione
  // («dell'ASP» in Sicilia, «all'ATS» in Lombardia). Le forme con l'apostrofo vanno bene per tutte.
  const ente = (t) => String(t || '').replace(/\bASL\b/g, aslLabel());
  list.innerHTML = hits.length ? hits.map((h) => card(h.href, h.icon, ente(h.title), ente(h.small), h.id)).join('') : NIENTE;
  ultimiRisultati = hits.length;
  clearTimeout(attesa);
  if (submitted) contaRicerca();
  else attesa = setTimeout(contaRicerca, 2000);
}

(async function init() {
  renderFooter('');
  try {
    [reg] = await Promise.all([loadJSON('data/moduli.json'), loadRegioni('')]);
  } catch {
    // Senza data/moduli.json resta visibile l'elenco degli argomenti scritto nella pagina
    // (.static-fallback, mostrato dalla classe «errore-js»: css/style.css). Sopra, l'avviso.
    document.documentElement.classList.add('errore-js');
    const wait = app.querySelector('.js-only');
    if (wait) wait.remove();
    app.insertAdjacentHTML('afterbegin', '<div class="notice bad" role="alert"><p>Non riusciamo a caricare tutta la pagina. Gli argomenti sono qui sotto. Riprova tra poco.</p></div>');
    return;
  }
  // Le fonti in fondo alla pagina: se un file non si carica, la pagina funziona lo stesso.
  const names = [...new Set(reg.modules.flatMap((m) => m.data || []))].filter((n) => n.startsWith('rules'));
  rulesSources = (await Promise.all(names.map((n) => loadJSON(`data/${n}.json`).then((r) => r.sources || []).catch(() => [])))).flat();
  const params = new URLSearchParams(location.search);
  // Vecchi link ai gruppi (?gruppo=casa): ora ogni area ha la sua pagina.
  const old = reg.groups.find((g) => g.id === params.get('gruppo'));
  if (old) { location.replace(`${old.page}/`); return; }

  render();
  // In questa pagina la ricerca della testata non ricarica: mostra i risultati subito.
  const hq = document.getElementById('hq');
  if (hq) {
    hq.addEventListener('input', () => { showResults(hq.value); saveQuery(hq.value); });
    hq.form.addEventListener('submit', (e) => {
      e.preventDefault();
      showResults(hq.value, true);
      saveQuery(hq.value);
      document.getElementById('q-box').scrollIntoView({ block: 'start' });
    });
    document.getElementById('q-results').addEventListener('click', (e) => {
      const a = e.target.closest('a[data-modulo]');
      if (!a) return;
      contaRicerca();
      count(eventoClic(a.dataset.modulo), { title: 'Risultato della ricerca aperto', event: true });
    });
    // Ricerca partita da un'altra pagina: ./#q=carrozzina (o ?q= senza JavaScript).
    const asked = new URLSearchParams(location.hash.slice(1)).get('q') || params.get('q');
    if (asked) { hq.value = asked; showResults(asked); }
  }
})();
