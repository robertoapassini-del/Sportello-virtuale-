// Numeri utili: prima quelli validi in tutta Italia (data/numeri.json), poi quelli
// dell'azienda sanitaria della provincia scelta (data/regioni/<regione>/: file «asl», campo phones).
// È il modulo di prova per più regioni (docs/regioni.md, passo 3): cambiando regione i dati si ricaricano
// senza ricaricare la pagina; per una regione non ancora attiva resta la parte nazionale e l'invito a scriverci.
// La provincia scelta va nell'indirizzo (#palermo), così la pagina si può condividere.
import { esc, loadJSON, loadRegional, renderFooter, helpBox, sourcesBox, callButton, hideHeadingEmoji, aslLabel, regioneInfo, inRegione, regione, regioneDeiDati, regioneNonPronta, setRegione } from './common.js';
import { needsRegion, regionChoices, changeRegionLink, regionAction, regionMissing } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
let nums;
let data;
let inps;

const ext = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener">💻 ${esc(label)}</a>`;

// Un numero: grande pulsante «Chiama», poi a cosa serve, orari, costo e sito.
function item(n) {
  const meta = [n.hours, n.cost].filter(Boolean).map(esc).join(' · ');
  const where = n.address ? `<p>📍 ${esc(n.address)}</p>` : '';
  return `<div class="card num">
    ${callButton(n.title || n.label, n.number)}
    ${n.what ? `<p>${esc(n.what)}</p>` : ''}
    ${where}
    ${meta ? `<p class="muted">${meta}</p>` : ''}
    ${n.url ? `<p>${ext(n.url, n.url_label || 'Sito ufficiale')}</p>` : ''}
  </div>`;
}

const link = (l) => `<div class="card num">
    <p><strong>${esc(l.title)}</strong></p>
    <p>${esc(l.what)}</p>
    <p>${ext(l.url, l.url_label)}</p>
  </div>`;

// Contatti dell'azienda sanitaria divisi per argomento (campo contacts, topic). È una funzione
// perché i testi usano la sigla dell'azienda sanitaria della regione scelta.
const topics = () => [
  ['guardia', '🩺 Guardia medica', `Di solito risponde la sera dalle 20 alle 8, nei fine settimana e nei giorni di festa. Ogni zona ha il suo numero: se il tuo non c'è, guarda l'elenco sul sito dell'${aslLabel()}.`],
  ['cup', '📅 Prenotare visite ed esami (CUP)', 'Tieni pronta la ricetta e la tessera sanitaria.'],
  ['urp', '🏥 Ufficio per i cittadini (URP)', 'Per reclami, informazioni e quando non sai a chi chiedere.'],
  ['casa', '🏠 Infermiere e cure a casa (PUA)', "Il PUA è lo sportello del distretto per l'assistenza a casa. Chiama quello del tuo comune."],
  ['anagrafe', '🪪 Scelta del medico ed esenzioni ticket', 'Lo sportello «scelta e revoca» del distretto: cambiare medico o pediatra, esenzione dal ticket.'],
  ['screening', '🎗️ Esami contro i tumori (screening)', 'Mammografia, Pap test, esame per il colon: gratis e senza ricetta.'],
  ['cartelle', '📁 Copia della cartella clinica', "L'ufficio dell'ospedale dove c'è stato il ricovero."],
  ['protesica', '🦽 Protesi e ausili (carrozzina, letto, pannoloni)', 'Qui porti la prescrizione dello specialista. Vai a quello del tuo distretto.'],
  ['palliative', '🕊️ Cure palliative e hospice', ''],
  ['centralino', '📞 Centralino', "Se non trovi l'ufficio giusto: chiedi al centralino di passartelo."],
];

// Sede INPS della stessa provincia (data/regioni/<regione>/: file «inps»).
function inpsBlock(id) {
  const p = inps.provinces.find((x) => x.id === id);
  if (!p || !p.address) return '';
  return `<h3>🏛️ Sede INPS (invalidità, pensioni, assegni)</h3>
    <div class="card num">
      <p>📍 ${esc(p.address)}${p.hours ? `<br>${esc(p.hours)}` : ''}</p>
      <p>Per lo sportello bisogna prenotare: app INPS, sito MyINPS, oppure 803 164 da fisso.</p>
      ${p.url ? `<p>${ext(p.url, 'La pagina della sede sul sito INPS')}</p>` : ''}
    </div>`;
}

function aspBlock(a) {
  if (!a) return '';
  const pages = [
    a.site_url && [`Sito dell'${aslLabel()}`, a.site_url],
    a.guardia_medica_url && ['Guardia medica: tutte le sedi e i numeri', a.guardia_medica_url],
    a.pua_url && [`Cure a casa (PUA): pagina dell'${aslLabel()}`, a.pua_url],
  ].filter(Boolean);
  const contacts = a.contacts || [];
  return `<section id="asp-numeri" aria-labelledby="asp-title">
    <h2 id="asp-title">📍 ${esc(a.name)}</h2>
    ${topics().map(([t, title, tip]) => {
      const list = contacts.filter((c) => c.topic === t);
      if (!list.length && t !== 'guardia') return '';
      return `<h3>${title}</h3>
        ${tip ? `<p>${esc(tip)}</p>` : ''}
        ${list.map(item).join('')}
        ${t === 'guardia' && a.guardia_medica_url ? `<p>${ext(a.guardia_medica_url, 'Tutte le sedi della guardia medica')}</p>` : ''}
        ${t === 'guardia' && !list.length && !a.guardia_medica_url ? `<p>Non abbiamo ancora il numero: chiedi al centralino dell'${esc(aslLabel())} o al tuo medico di famiglia.</p>` : ''}`;
    }).join('')}
    ${inpsBlock(a.id)}
    ${pages.length ? `<h3>💻 Su internet</h3><ul class="clean">${pages.map(([l, u]) => `<li>${ext(u, l)}</li>`).join('')}</ul>` : ''}
  </section>`;
}

// Voci di data/numeri.json valide solo in una regione («regione»: "sicilia"): si mostrano solo a chi l'ha scelta.
const perMe = (x) => !x.regione || (x.regione === regione() && !needsRegion() && !regioneNonPronta());
const nota = (t) => (typeof t === 'string' ? t : t.text);

const group = (g) => `
  <h2>${esc(g.title)}</h2>
  ${g.id === 'urgenze' ? '<div class="notice urgent"><p>🚨 Se è grave, chiama subito il <a href="tel:112"><strong>112</strong></a>.</p></div>' : ''}
  ${g.items.filter(perMe).map(item).join('')}`;

// Blocco regionale: la scelta della regione, l'invito se la regione non c'è ancora, oppure le province.
function regionale(id, a, provinces) {
  if (needsRegion()) return `<p>Prima scegli la tua regione.</p>${regionChoices()}`;
  if (regioneNonPronta()) {
    return `<p>Guardia medica: chiedi al tuo medico di famiglia il numero della tua zona, o cercalo sul sito della tua azienda sanitaria.</p>
    ${regionMissing()}`;
  }
  return `<p>Scegli la tua provincia: guardia medica, CUP per prenotare, ufficio per i cittadini, cure a casa.</p>
    <div class="grid2">${provinces.map((p) => `<a class="btn choice" href="#${esc(p.id)}"${p.id === id ? ' aria-current="true"' : ''}><span class="txt">${esc(p.province)}</span></a>`).join('')}</div>
    ${changeRegionLink()}
    ${aspBlock(a)}`;
}

// La provincia nell'indirizzo (#palermo). Un indirizzo rotto (#%) non deve bloccare la pagina.
function hashId() {
  try { return decodeURIComponent(location.hash.slice(1)); } catch { return ''; }
}

// Avviso quando una parte dei dati non arriva: i numeri validi in tutta Italia restano.
const avvisoRegione = () => '<div class="notice bad"><p>Non riusciamo a caricare i numeri della tua regione. Riprova tra poco. I numeri validi in tutta Italia ci sono lo stesso.</p></div>';

function render() {
  const id = hashId();
  const a = data ? data.asl.find((x) => x.id === id) : null;
  const pronta = !needsRegion() && !regioneNonPronta() && !!data;
  const provinces = (data ? [...data.asl] : []).sort((x, y) => x.province.localeCompare(y.province));
  app.innerHTML = `
    <h1>📞 Numeri utili</h1>
    <p class="lead">I numeri giusti da chiamare${pronta ? ` ${esc(inRegione())}` : ''}. Tocca il numero per chiamare.</p>
    ${group(nums.groups[0])}
    <h2 id="regione">${pronta ? `I numeri della tua ${esc(aslLabel())}` : 'I numeri della tua regione'}</h2>
    ${data || needsRegion() || regioneNonPronta() ? regionale(id, a, provinces) : `${avvisoRegione()}${changeRegionLink()}`}
    ${nums.groups.slice(1).map(group).join('')}
    ${nums.notes.filter(perMe).map((t) => `<div class="notice info"><p>${esc(nota(t))}</p></div>`).join('')}
    ${nums.links.some(perMe) ? `<h2>Su internet</h2>
    ${nums.links.filter(perMe).map(link).join('')}` : ''}
    ${helpBox()}
    ${sourcesBox([...nums.sources, ...(a && pronta ? a.sources : [])], { verified: nums.last_verified })}`;
  hideHeadingEmoji(app);
}

// Dati della regione in uso. Una regione nuova può non avere ancora le sedi INPS: si mostra il resto.
async function caricaRegione() {
  [data, inps] = await Promise.all([loadRegional(ROOT, 'asl'), loadRegional(ROOT, 'inps').catch(() => ({ provinces: [] }))]);
}

// Dopo una scelta: se la regione dei dati è cambiata si caricano i dati nuovi, senza ricaricare la pagina.
async function ridisegna() {
  if (regione() !== regioneDeiDati()) {
    // Se i dati della regione non arrivano, render() mostra l'avviso e i numeri nazionali.
    try { await caricaRegione(); } catch { data = null; inps = { provinces: [] }; }
    if (location.hash && location.hash !== '#regione') history.replaceState(null, '', location.pathname);
  }
  render();
  document.getElementById('regione')?.scrollIntoView({ block: 'start' });
}

// Arrivati da un'altra pagina per cambiare regione (numeri-utili/?torna=/pagina/#regione): scelta la regione,
// si torna lì. Solo indirizzi di questo sito: l'indirizzo si risolve come fa il browser
// («/\\altro-sito» e «/%09/altro-sito» diventano «//altro-sito») e si tiene solo se resta qui.
const torna = (() => {
  const t = new URLSearchParams(location.search).get('torna');
  if (!t) return '';
  try {
    const u = new URL(t, location.origin);
    return u.origin === location.origin ? u.pathname + u.search + u.hash : '';
  } catch { return ''; }
})();

app.addEventListener('click', (e) => {
  // Scelta della regione: la pagina ha una schermata sola, «Cambia regione» la ridisegna.
  const btn = e.target.closest('button[data-action="region"], button[data-action="change-region"]');
  if (btn && btn.dataset.action === 'region' && torna) { setRegione(btn.dataset.region); location.assign(torna); return; }
  if (btn) regionAction(btn, { current: 'province', render: ridisegna, go: ridisegna });
});

window.addEventListener('hashchange', () => {
  if (!nums) return; // dati non ancora arrivati (o non arrivati): init() disegna
  render();
  document.getElementById('asp-numeri')?.scrollIntoView({ block: 'start' });
});

(async function init() {
  renderFooter(ROOT);
  // Senza i dati della regione la pagina mostra lo stesso i numeri nazionali (render() mette l'avviso).
  const reg = caricaRegione().catch(() => { data = null; inps = { provinces: [] }; });
  try {
    [nums] = await Promise.all([loadJSON(`${ROOT}data/numeri.json`), reg]);
  } catch {
    // Senza data/numeri.json resta visibile il testo scritto nella pagina (.static-fallback, con 112, 1522…):
    // la classe «errore-js» lo mostra (css/style.css). Al posto di «Un momento…» c'è l'avviso.
    document.documentElement.classList.add('errore-js');
    const wait = app.querySelector('.js-only');
    const msg = '<div class="notice bad" role="alert"><p>Non riusciamo a caricare tutta la pagina. I numeri più importanti sono qui sotto. Riprova tra poco.</p></div>';
    if (wait) wait.remove();
    app.insertAdjacentHTML('afterbegin', msg);
    return;
  }
  // «Cambia regione» dalle altre pagine (per esempio dalla home): numeri-utili/#regione.
  if (location.hash === '#regione') regionAction({ dataset: { action: 'change-region' } }, { current: 'province', render, go: render });
  else render();
  if (location.hash) document.getElementById(location.hash === '#regione' ? 'regione' : 'asp-numeri')?.scrollIntoView({ block: 'start' });
})();
