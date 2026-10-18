// Navigazione comune ai moduli: schermate, Indietro, Ricomincia, Ascolta,
// riquadri Aiuto e Fonti. Le risposte restano in memoria finché la pagina è aperta.
import { esc, helpBox, listenButton, speakScreen, stopSpeaking, sourcesBox, choice, moreHelp, hideHeadingEmoji } from './common.js';

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

export function createFlow({ app, screens, state, sources, first = 'intro' }) {
  const nav = createNav({ first, show: (current) => paint(current) });

  function paint(current) {
    stopSpeaking();
    const s = screens[current]();
    const backBtn = current === first ? '' : '<button type="button" class="back" data-action="back">← Torna indietro</button>';
    app.innerHTML = `<div class="topbar">${backBtn}${listenButton()}</div>${s.html}${moreHelp()}${helpBox()}${sourcesBox(...sources())}`;
    hideHeadingEmoji(app);
    if (s.mount) s.mount();
    window.scrollTo(0, 0);
    const h1 = app.querySelector('h1');
    if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
  }
  const render = nav.render;
  const go = nav.go;
  const back = nav.back;
  const restart = () => nav.restart(() => { for (const k of Object.keys(state)) delete state[k]; });

  app.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-go], button[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'back') return back();
    if (btn.dataset.action === 'restart') return restart();
    if (btn.dataset.action === 'listen') return speakScreen(app);
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
