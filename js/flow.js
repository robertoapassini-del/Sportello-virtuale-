// Navigazione comune ai moduli: schermate, Indietro, Ricomincia,
// riquadri Aiuto e Fonti. Le risposte restano in memoria finché la pagina è aperta.
import {
  esc, helpBox, sourcesBox, choice, moreHelp, hideHeadingEmoji, enableStart,
  MAINTAINER_EMAIL, regioni, regioniAttive, regioneScelta, regioneInfo, regioneDeiDati, setRegione,
} from './common.js';

export { choice };

// Schermate collegate alla cronologia del browser: il tasto Indietro del
// telefono torna alla schermata precedente invece di uscire dal modulo.
// L'indirizzo non cambia. Le voci di cronologia di una sessione precedente
// (pagina ricaricata, «Ricomincia») riportano alla prima schermata.
export function createNav({ first, show }) {
  const newGen = () => `${Date.now()}-${Math.random()}`;
  let gen = newGen();
  let stack = [];
  let current = first;

  function draw() {
    try { show(current); } catch (err) {
      console.error(err);
      stack = [];
      current = first;
      history.replaceState({ screen: first, stack, gen }, '');
      show(first);
    }
  }
  history.replaceState({ screen: first, stack, gen }, '');
  window.addEventListener('popstate', (e) => {
    const s = e.state;
    if (!s || !s.screen) return;
    if (s.gen === gen) {
      current = s.screen;
      stack = s.stack || [];
    } else {
      current = first;
      stack = [];
      history.replaceState({ screen: first, stack, gen }, '');
    }
    draw();
  });

  return {
    get current() { return current; },
    // url (facoltativo): indirizzo da mostrare per questa schermata, per poterla condividere.
    go(screen, url) {
      stack = [...stack, current];
      current = screen;
      history.pushState({ screen, stack, gen }, '', url);
      draw();
    },
    back() {
      if (stack.length) history.back();
      else { current = first; draw(); }
    },
    // `clear` svuota le risposte prima di tornare alla prima schermata.
    restart(clear) {
      if (clear) clear();
      const n = stack.length;
      gen = newGen();
      if (n) history.go(-n);
      else { current = first; history.replaceState({ screen: first, stack, gen }, ''); draw(); }
    },
    render: draw,
  };
}

// ---------- Regione ----------
// «In quale regione abiti?» (docs/regioni.md, sezione 2). Viene prima della domanda sulla
// provincia: la schermata della provincia mostra questa scelta al suo posto se ci sono più
// regioni attive e la scelta non è ancora salvata, oppure dopo «Cambia regione».
// Con una sola regione attiva non si vede mai: il modulo va dritto alla provincia.
let askRegion = false;
export const needsRegion = () => askRegion || (regioniAttive().length > 1 && !regioneScelta());

// I pulsanti delle regioni attive e, sotto, le altre in grigio. Usati anche da Numeri utili.
export function regionChoices() {
  const byName = (a, b) => a.name.localeCompare(b.name, 'it');
  const on = regioniAttive().sort(byName);
  const off = regioni().filter((r) => !r.attiva).sort(byName);
  const mail = `mailto:${MAINTAINER_EMAIL}?subject=${encodeURIComponent('La mia regione su Guida Sanità')}`;
  return `<div class="grid2">${on.map((r) => `<button type="button" class="btn choice" data-action="region" data-region="${esc(r.id)}">
      <span class="txt">${esc(r.name)}</span></button>`).join('')}</div>
    ${off.length ? `<p class="say">Queste regioni non ci sono ancora:</p>
    <ul class="regioni-off">${off.map((r) => `<li>${esc(r.name)} <small>non ancora disponibile</small></li>`).join('')}</ul>
    <p class="muted">La tua regione non c'è? <a href="${esc(mail)}">Scrivici</a>: ci aiuti a scegliere quale aggiungere.</p>` : ''}`;
}

const regionScreen = () => ({
  html: `<h1>📍 In quale regione abiti?</h1>
    <p class="say">Ogni regione ha i suoi uffici e i suoi numeri. Scegli la tua.</p>
    ${regionChoices()}`,
});

// Link piccolo «Non abiti in Sicilia? Cambia regione» per le schermate con dati regionali.
// Con una sola regione attiva non c'è niente da cambiare e il link non si vede.
export function changeRegionLink() {
  if (regioniAttive().length < 2) return '';
  return `<p class="cambia-regione no-say"><button type="button" class="link" data-action="change-region">Non abiti in ${esc(regioneInfo().name)}? Cambia regione</button></p>`;
}

// Mette la scelta della regione davanti alla schermata della provincia (name).
// Torna una funzione per il disegno: (current, state) → il link «Cambia regione»
// se la schermata mostra dati regionali (la provincia o le schermate dopo).
export function withRegion(screens, name = 'province') {
  const inner = screens[name];
  if (!inner) return () => '';
  screens[name] = () => (needsRegion() ? regionScreen() : inner());
  return (current, state = {}) => {
    if (current !== name) askRegion = false;
    return !needsRegion() && (current === name || state.province) ? changeRegionLink() : '';
  };
}

// Clic su una regione o su «Cambia regione». nav: { current, go, render }. Vero se gestito.
// Se la regione scelta non è quella dei dati già caricati, la pagina si ricarica con i dati giusti.
export function regionAction(btn, nav, name = 'province') {
  if (btn.dataset.action === 'region') {
    setRegione(btn.dataset.region);
    askRegion = false;
    if (regioneDeiDati() && btn.dataset.region !== regioneDeiDati()) location.reload();
    else nav.render();
    return true;
  }
  if (btn.dataset.action === 'change-region') {
    askRegion = true;
    if (nav.current === name) nav.render();
    else nav.go(name);
    return true;
  }
  return false;
}

// person (facoltativo): i dati per le lettere, cancellati anche loro con «Ricomincia».
export function createFlow({ app, screens, state, sources, first = 'intro', person }) {
  const nav = createNav({ first, show: (current) => paint(current) });
  const regionLink = withRegion(screens);

  function paint(current) {
    const s = screens[current]();
    const backBtn = current === first ? '' : '<div class="topbar"><button type="button" class="back" data-action="back">← Torna indietro</button></div>';
    app.innerHTML = `${backBtn}${s.html}${regionLink(current, state)}${moreHelp()}${helpBox()}${sourcesBox(...sources())}`;
    enableStart(app);
    hideHeadingEmoji(app);
    if (s.mount) s.mount();
    window.scrollTo(0, 0);
    const h1 = app.querySelector('h1');
    if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
  }
  const render = nav.render;
  const go = nav.go;
  const back = nav.back;
  const restart = () => nav.restart(() => { for (const o of [state, person]) if (o) for (const k of Object.keys(o)) delete o[k]; });

  app.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-go], button[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'back') return back();
    if (btn.dataset.action === 'restart') return restart();
    if (regionAction(btn, nav)) return;
    if (btn.dataset.set) Object.assign(state, JSON.parse(btn.dataset.set));
    if (btn.dataset.go) go(btn.dataset.go);
  });

  return { render, go, back, restart };
}

export const restartBtn = (label = 'Ricomincia da capo') =>
  `<button type="button" class="btn center" data-action="restart">🔄 ${esc(label)}</button>`;

export const days = (n) => `${n} ${n === 1 ? 'giorno' : 'giorni'}`;

export function progress(n, total) {
  const dots = Array.from({ length: total }, (_, i) => `<span class="dot${i < n ? ' on' : ''}"></span>`).join('');
  return `<p class="progress"><span aria-hidden="true">${dots}</span> Domanda ${n} di ${total}</p>`;
}

// Campo data con messaggio di errore e pulsante.
export function dateForm({ id, name, label, hint, value, button, max }) {
  return `<form id="${id}" novalidate>
    <label for="${name}">${label}${hint ? `<span class="hint">${hint}</span>` : ''}</label>
    <input type="date" id="${name}" name="${name}" value="${esc(value || '')}" ${max ? `max="${max}"` : ''}>
    <p class="field-error" id="${id}-error" role="alert" hidden></p>
    <button type="submit" class="btn primary big">${button}</button>
  </form>`;
}

export function showError(formId, text) {
  const err = document.getElementById(`${formId}-error`);
  err.textContent = text;
  err.hidden = false;
}

// Pulsanti Stampa / Copia / Email sotto una lettera.
export function letterButtons(prefix = '') {
  return `<div class="btn-row three">
    <button type="button" class="btn center" id="${prefix}pdf-btn">🖨️ Stampa o salva</button>
    <button type="button" class="btn center" id="${prefix}copy-btn">📋 Copia</button>
    <a class="btn center" id="${prefix}mail-btn" href="#">📧 Manda per email</a>
  </div>`;
}
