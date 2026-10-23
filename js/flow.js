// Navigazione comune ai moduli: schermate, Indietro, Ricomincia,
// riquadri Aiuto e Fonti. Le risposte restano in memoria finché la pagina è aperta.
import { zoneLettera, nomeZona, intestazioneDi } from './letters.js';
import {
  esc, helpBox, sourcesBox, choice, moreHelp, hideHeadingEmoji, enableStart,
  MAINTAINER_EMAIL, aslIntestazione, regioni, regioniAttive, regioneInfo, inRegione, regioneDeiDati, regioneNonPronta, regioneSalvata, regione, setRegione, regioneRicordata, moduloPagina,
} from './common.js';

export { choice };

// ---------- Provincia e zona ----------
// L'intestazione della lettera per un'azienda (o la sua zona, js/letters.js): il nome ufficiale «nome_lettera»
// se c'è, se no aslIntestazione() + «di» + provincia. Sicilia: «Azienda Sanitaria Provinciale di Palermo».
export const intestazioneAzienda = (a) => intestazioneDi(a, aslIntestazione());
// Il pulsante di una provincia. Se la sua azienda ha zone con una lettera diversa (sub_areas oggetto, js/letters.js),
// prima di next viene la domanda «In quale zona?» (schermata «zona» del modulo, fatta con zonaScreen).
// Con una zona sola (Lombardia: la provincia ha l'ATS e una sola ASST) non c'è niente da chiedere: si usa quella.
export function provinceChoice(a, next) {
  const zone = zoneLettera(a);
  if (zone.length === 1) return choice('', a.province, { province: a.id, zona: zone[0].id }, next);
  return choice('', a.province, { province: a.id, zona: null }, zone.length ? 'zona' : next);
}
// «In quale zona?»: a è l'azienda della provincia scelta (senza la zona), next la schermata dopo.
export function zonaScreen(a, next) {
  const zone = zoneLettera(a);
  return {
    html: `<h1>📍 In quale zona?</h1>
      <p>In provincia di ${esc(a.province)} ci sono più uffici. La lettera va a quello della tua zona. Scegli dove abita la persona.</p>
      ${zone.map((z) => choice('', nomeZona(z), { zona: z.id }, next, [].concat(z.comuni || []).join(', '))).join('')}`,
  };
}

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
// Si chiede se ci sono più regioni attive e non ne è salvata nessuna (anche una non ancora attiva vale come scelta).
export const needsRegion = () => askRegion || (regioniAttive().length > 1 && !regioneSalvata());

// Email per chiederci una regione che non c'è ancora.
const regionMail = (nome) => `mailto:${MAINTAINER_EMAIL}?subject=${encodeURIComponent(`Vorrei ${nome ? `la regione ${nome}` : 'la mia regione'} su Guida Sanità`)}`;

// I pulsanti delle regioni attive e, sotto, le altre in grigio. Anche quelle si possono scegliere:
// chi abita lì vede la parte valida in tutta Italia e l'invito a segnalarcela. Usati anche da Numeri utili.
export function regionChoices() {
  const byName = (a, b) => a.name.localeCompare(b.name, 'it');
  const on = regioniAttive().sort(byName);
  const off = regioni().filter((r) => !r.attiva).sort(byName);
  return `<div class="grid2">${on.map((r) => `<button type="button" class="btn choice" data-action="region" data-region="${esc(r.id)}">
      <span class="txt">${esc(r.name)}</span></button>`).join('')}</div>
    ${off.length ? `<p>Queste regioni non ci sono ancora:</p>
    <ul class="regioni-off">${off.map((r) => `<li><button type="button" class="link" data-action="region" data-region="${esc(r.id)}">${esc(r.name)}</button> <small>non ancora disponibile</small></li>`).join('')}</ul>` : ''}`;
}

// Schermata per chi ha scelto una regione che non c'è ancora (o che per questo modulo non ha i dati):
// niente uffici e numeri, ma il link alla guida scritta sotto (<section id="guida">, le regole valide
// in tutta Italia) e, per una regione non attiva, ai Numeri utili nazionali e l'invito a scriverci.
// Non riporta mai alla prima schermata del modulo: il suo pulsante riporterebbe qui (giro senza uscita).
const guidaLink = () => (typeof document !== 'undefined' && document.getElementById('guida')
  ? '<a class="btn choice" href="#guida"><span class="txt">Leggi le regole valide in tutta Italia</span></a>' : '');
export function regionMissing() {
  const r = regioneNonPronta();
  if (!r) return '';
  // Regione attiva, ma questo modulo non ha ancora i suoi dati: la parte nazionale e i numeri utili della regione.
  if (r.parziale) {
    return `<p>Per gli uffici della tua zona guarda i numeri utili o chiedi all'URP della tua azienda sanitaria.</p>
    ${guidaLink()}
    ${(r.moduli || []).includes('numeri-utili') ? `<a class="btn primary center" href="../numeri-utili/">📞 I numeri utili: ${esc(r.name)}</a>` : ''}
    <p class="cambia-regione"><button type="button" class="link" data-action="change-region">Hai sbagliato regione? Cambia</button></p>`;
  }
  return `<div class="notice warn"><p><strong>${esc(r.name)}: non c'è ancora.</strong> Uffici e numeri della tua regione non li abbiamo.
      Quello che vale in tutta Italia lo trovi lo stesso.</p></div>
    ${guidaLink()}
    ${moduloPagina() !== 'numeri-utili' ? '<a class="btn primary center" href="../numeri-utili/">📞 I numeri validi in tutta Italia</a>' : ''}
    <a class="btn primary center" href="${esc(regionMail(r.name))}">✉️ Chiedici di aggiungerla</a>
    <p class="muted">Si apre la tua email. Decidi tu se mandarla.</p>
    <p class="cambia-regione"><button type="button" class="link" data-action="change-region">Hai sbagliato regione? Cambia</button></p>`;
}
const regionMissingScreen = () => ({
  html: `<h1>📍 ${(regioneNonPronta() || {}).parziale ? `Uffici e numeri ${esc(inRegione())}` : 'La tua regione non c\'è ancora'}</h1>${regionMissing()}`,
});

// Link alla guida scritta (#guida) dentro #app: scorre alla guida senza aggiungere una voce
// alla cronologia (il tasto Indietro resta per le schermate). L'ascolto è sul documento, così vale
// anche dopo che #app è stato ridisegnato.
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('#app a[href="#guida"]');
    const g = a && document.getElementById('guida');
    if (!g) return;
    e.preventDefault();
    g.scrollIntoView({ block: 'start' });
    if (!g.hasAttribute('tabindex')) g.setAttribute('tabindex', '-1');
    g.focus({ preventScroll: true });
  });
}

const regionScreen = () => ({
  html: `<h1>📍 In quale regione abiti?</h1>
    <p>Ogni regione ha i suoi uffici e i suoi numeri. Scegli la tua.</p>
    ${regionChoices()}`,
});

// Link piccolo «Non abiti in Sicilia? Cambia regione» («nel Lazio», «nelle Marche»: inRegione) per le schermate con dati regionali.
// Con una sola regione attiva non c'è niente da cambiare e il link non si vede.
export function changeRegionLink() {
  if (regioniAttive().length < 2 && !regioneSalvata()) return '';
  return `<p class="cambia-regione"><button type="button" class="link" data-action="change-region">Non abiti ${esc(inRegione())}? Cambia regione</button></p>`;
}

// Regione attiva che per questo modulo non ha ancora uffici e lettere (regioneNonPronta() «parziale»,
// per esempio la Lombardia con solo i Numeri utili), in un modulo che sa fare il conto senza la provincia.
// Allora la domanda sulla provincia si salta: le domande e il conto valgono in tutta Italia.
// Le schermate che mostrano uffici o lettera usano senzaUffici(a, …): senza provincia, al loro posto c'è regionMissing().
let saltaProvincia = false;
export const provinciaSaltata = () => saltaProvincia && !needsRegion() && !!(regioneNonPronta() || {}).parziale;
export const senzaUffici = (a, html) => (a ? html() : regionMissing());

// Mette la scelta della regione davanti alla schermata della provincia (name).
// next (facoltativo): la schermata dopo la provincia, per i moduli il cui conto non dipende dai dati della regione.
// Senza next, chi ha una regione senza i dati di questo modulo vede regionMissingScreen().
// Torna una funzione per il disegno: (current, state) → il link «Cambia regione»
// se la schermata mostra dati regionali (la provincia o le schermate dopo).
export function withRegion(screens, name = 'province', next = null) {
  const inner = screens[name];
  if (!inner) return () => '';
  if (next) saltaProvincia = true;
  // Vero se il pulsante verso la provincia porta a regionMissingScreen().
  const bloccata = () => !needsRegion() && !!regioneNonPronta() && !(next && provinciaSaltata());
  screens[name] = () => {
    if (needsRegion()) return regionScreen();
    if (next && provinciaSaltata()) return screens[next]();
    return regioneNonPronta() ? regionMissingScreen() : inner();
  };
  // Se il conto non si può fare, il pulsante principale della prima schermata non si vede: resta la guida scritta.
  // (23/10/2026: prima diventava «Uffici e numeri in Lombardia» e portava a «non abbiamo ancora i dati».)
  const intro = screens.intro;
  if (intro) {
    screens.intro = () => {
      const s = intro();
      if (!bloccata()) return s;
      const t = document.createElement('template');
      t.innerHTML = s.html;
      const b = t.content.querySelector(`button.btn.primary[data-go="${name}"]`);
      if (!b) return s;
      // Via anche il consiglio subito sotto («Tieni a portata di mano la ricetta…»): vale solo per il conto.
      const riga = b.closest('p') || b;
      if (riga.nextElementSibling && riga.nextElementSibling.matches('p.muted')) riga.nextElementSibling.remove();
      riga.remove();
      return { ...s, html: t.innerHTML };
    };
  }
  return (current, state = {}) => {
    if (current !== name) askRegion = false;
    return !needsRegion() && !regioneNonPronta() && (current === name || state.province) ? changeRegionLink() : '';
  };
}

// Clic su una regione o su «Cambia regione». nav: { current, go, render }. Vero se gestito.
// Se la regione scelta non è quella dei dati già caricati, la pagina si ricarica con i dati giusti.
export function regionAction(btn, nav, name = 'province') {
  if (btn.dataset.action === 'region') {
    setRegione(btn.dataset.region);
    askRegion = false;
    // Regione attiva diversa da quella dei dati già caricati: si ricarica la pagina con i dati giusti.
    // Una regione non attiva non ha dati: basta ridisegnare (si vede l'invito).
    // Se il browser non può ricordare la scelta (localStorage bloccato e niente nome della scheda,
    // vedi setRegione in js/common.js) ricaricando la si perderebbe e si tornerebbe a «In quale regione abiti?»:
    // allora si ridisegna, con la scelta in memoria finché la pagina è aperta.
    if (regioneDeiDati() && !regioneNonPronta() && regione() !== regioneDeiDati() && regioneRicordata()) location.reload();
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
// next: vedi withRegion.
// Dopo un cambio di schermata: in cima, con il focus sul titolo (chi usa un lettore di schermo sente il titolo nuovo).
// Non alla prima schermata: lì il primo Tab deve portare a «Vai al contenuto» e un indirizzo con #guida deve
// restare sulla guida (audit del 22/10/2026, giro 6).
export function moveToTop(app) {
  window.scrollTo(0, 0);
  const h1 = app.querySelector('h1');
  if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
}

export function createFlow({ app, screens, state, sources, first = 'intro', person, next }) {
  const nav = createNav({ first, show: (current) => paint(current) });
  const regionLink = withRegion(screens, 'province', next);
  let dipinto = false;

  function paint(current) {
    const s = screens[current]();
    const backBtn = current === first ? '' : '<div class="topbar"><button type="button" class="back" data-action="back">← Torna indietro</button></div>';
    app.innerHTML = `${backBtn}${s.html}${regionLink(current, state)}${moreHelp()}${helpBox()}${sourcesBox(...sources())}`;
    enableStart(app);
    hideHeadingEmoji(app);
    if (s.mount) s.mount();
    if (dipinto) moveToTop(app);
    dipinto = true;
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

// Se la domanda sulla provincia si salta (provinciaSaltata), le domande sono una in meno.
export function progress(n, total) {
  if (provinciaSaltata() && n > 1) { n -= 1; total -= 1; }
  const dots = Array.from({ length: total }, (_, i) => `<span class="dot${i < n ? ' on' : ''}"></span>`).join('');
  return `<p class="progress"><span aria-hidden="true">${dots}</span> Domanda ${n} di ${total}</p>`;
}

// Campo data con messaggio di errore e pulsante.
export function dateForm({ id, name, label, hint, value, button, max }) {
  return `<form id="${id}" novalidate>
    <label for="${name}">${label}${hint ? `<span class="hint">${hint}</span>` : ''}</label>
    <input type="date" id="${name}" name="${name}" value="${esc(value || '')}" ${max ? `max="${max}"` : ''} aria-describedby="${id}-error">
    <p class="field-error" id="${id}-error" role="alert" hidden></p>
    <button type="submit" class="btn primary big">${button}</button>
  </form>`;
}

// Errore in un modulo: il messaggio è in <p id="<form>-error" role="alert">, collegato ai campi con
// aria-describedby. Il campo da correggere viene segnato (aria-invalid) e riceve il focus.
// field: il nome del campo sbagliato; se manca, il primo campo vuoto (o il primo campo).
// focus: false quando il controllo parte mentre la persona scrive (non le si sposta il cursore).
export function showError(formId, text, { field, focus = true } = {}) {
  const form = document.getElementById(formId);
  const err = document.getElementById(`${formId}-error`);
  err.textContent = text;
  err.hidden = false;
  const campi = [...form.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=hidden]), select, textarea')]
    .filter((c) => c.offsetParent !== null); // solo i campi visibili (non quelli del tutore nascosti)
  for (const c of campi) c.removeAttribute('aria-invalid');
  const campo = campi.find((c) => c.name === field) || campi.find((c) => !c.value) || campi[0];
  if (!campo) return;
  campo.setAttribute('aria-invalid', 'true');
  campo.addEventListener('change', () => campo.removeAttribute('aria-invalid'), { once: true });
  if (focus) campo.focus();
}

// Toglie il messaggio d'errore e i segni sui campi.
export function clearError(formId) {
  const err = document.getElementById(`${formId}-error`);
  err.textContent = '';
  err.hidden = true;
  for (const c of document.getElementById(formId).querySelectorAll('[aria-invalid]')) c.removeAttribute('aria-invalid');
}

// Pulsanti Stampa / Copia / Email sotto una lettera.
export function letterButtons(prefix = '') {
  return `<div class="btn-row three">
    <button type="button" class="btn center" id="${prefix}pdf-btn">🖨️ Stampa o salva</button>
    <button type="button" class="btn center" id="${prefix}copy-btn">📋 Copia</button>
    <a class="btn center" id="${prefix}mail-btn" href="#">📧 Manda per email</a>
  </div>`;
}
