// Numeri utili: prima quelli validi in tutta Italia (data/numeri.json), poi quelli
// dell'azienda sanitaria della provincia scelta (data/regioni/<regione>/: file «asl», campo phones).
// È il modulo di prova per più regioni (docs/regioni.md, passo 3): cambiando regione i dati si ricaricano
// senza ricaricare la pagina; per una regione non ancora attiva resta la parte nazionale e l'invito a scriverci.
// La provincia scelta va nell'indirizzo (#palermo), così la pagina si può condividere.
import { esc, loadJSON, loadRegional, renderFooter, helpBox, sourcesBox, callButton, hideHeadingEmoji, aslLabel, regioneInfo, regione, regioneDeiDati, regioneNonPronta } from './common.js';
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

// Contatti dell'azienda sanitaria divisi per argomento (campo contacts, topic).
const TOPICS = [
  ['guardia', '🩺 Guardia medica', "Di solito risponde la sera dalle 20 alle 8, nei fine settimana e nei giorni di festa. Ogni zona ha il suo numero: se il tuo non c'è, guarda l'elenco sul sito dell'ASP."],
  ['cup', '📅 Prenotare visite ed esami (CUP)', 'Tieni pronta la ricetta e la tessera sanitaria.'],
  ['urp', '🏥 Ufficio per i cittadini (URP)', 'Per reclami, informazioni e quando non sai a chi chiedere.'],
  ['casa', '🏠 Infermiere e cure a casa (PUA)', "Il PUA è lo sportello del distretto per l'assistenza a casa. Chiama quello del tuo comune."],
  ['anagrafe', '🪪 Scelta del medico ed esenzioni ticket', 'Lo sportello «scelta e revoca» del distretto: cambiare medico o pediatra, esenzione dal ticket.'],
  ['screening', '🎗️ Esami contro i tumori (screening)', 'Mammografia, pap test, esame per il colon: gratis e senza ricetta.'],
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
    ${TOPICS.map(([t, title, tip]) => {
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

const group = (g) => `
  <h2>${esc(g.title)}</h2>
  ${g.id === 'urgenze' ? '<div class="notice urgent"><p>🚨 Se è grave, chiama subito il <a href="tel:112"><strong>112</strong></a>.</p></div>' : ''}
  ${g.items.map(item).join('')}`;

// Blocco regionale: la scelta della regione, l'invito se la regione non c'è ancora, oppure le province.
function regionale(id, a, provinces) {
  if (needsRegion()) return `<p>Prima scegli la tua regione.</p>${regionChoices()}`;
  if (regioneNonPronta()) return regionMissing('');
  return `<p>Scegli la tua provincia: guardia medica, CUP per prenotare, ufficio per i cittadini, cure a casa.</p>
    <div class="grid2">${provinces.map((p) => `<a class="btn choice" href="#${esc(p.id)}"${p.id === id ? ' aria-current="true"' : ''}><span class="txt">${esc(p.province)}</span></a>`).join('')}</div>
    ${changeRegionLink()}
    ${aspBlock(a)}`;
}

function render() {
  const id = decodeURIComponent(location.hash.slice(1));
  const a = data.asl.find((x) => x.id === id);
  const pronta = !needsRegion() && !regioneNonPronta();
  const provinces = [...data.asl].sort((x, y) => x.province.localeCompare(y.province));
  app.innerHTML = `
    <h1>📞 Numeri utili</h1>
    <p class="lead">I numeri giusti da chiamare${pronta ? ` in ${esc(regioneInfo().name)}` : ''}. Tocca il numero per chiamare.</p>
    ${group(nums.groups[0])}
    <h2 id="regione">${pronta ? `I numeri della tua ${esc(aslLabel())}` : 'I numeri della tua regione'}</h2>
    ${regionale(id, a, provinces)}
    ${nums.groups.slice(1).map(group).join('')}
    ${nums.notes.map((t) => `<div class="notice info"><p>${esc(t)}</p></div>`).join('')}
    <h2>Su internet</h2>
    ${nums.links.map(link).join('')}
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
    try { await caricaRegione(); } catch {
      app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare i numeri di questa regione. Riprova tra poco.</p></div>'; return;
    }
    if (location.hash && location.hash !== '#regione') history.replaceState(null, '', location.pathname);
  }
  render();
  document.getElementById('regione')?.scrollIntoView({ block: 'start' });
}

app.addEventListener('click', (e) => {
  // Scelta della regione: la pagina ha una schermata sola, «Cambia regione» la ridisegna.
  const btn = e.target.closest('button[data-action="region"], button[data-action="change-region"]');
  if (btn) regionAction(btn, { current: 'province', render: ridisegna, go: ridisegna });
});

window.addEventListener('hashchange', () => {
  render();
  document.getElementById('asp-numeri')?.scrollIntoView({ block: 'start' });
});

(async function init() {
  renderFooter(ROOT);
  try {
    [nums] = await Promise.all([loadJSON(`${ROOT}data/numeri.json`), caricaRegione()]);
  } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>'; return;
  }
  // «Cambia regione» dalle altre pagine (per esempio dalla home): numeri-utili/#regione.
  if (location.hash === '#regione') regionAction({ dataset: { action: 'change-region' } }, { current: 'province', render, go: render });
  else render();
  if (location.hash) document.getElementById(location.hash === '#regione' ? 'regione' : 'asp-numeri')?.scrollIntoView({ block: 'start' });
})();
