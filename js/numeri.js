// Numeri utili: prima quelli validi in tutta Italia (data/numeri.json), poi quelli
// dell'ASP della provincia scelta (data/regioni/sicilia/asp.json, campo phones).
// La provincia scelta va nell'indirizzo (#palermo), così la pagina si può condividere.
import { esc, loadJSON, loadRegional, renderFooter, helpBox, sourcesBox, callButton, hideHeadingEmoji } from './common.js';
import { needsRegion, regionChoices, changeRegionLink, regionAction } from './flow.js';

const ROOT = '../';
const app = document.getElementById('app');
let nums;
let data;
let inps;

const ext = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener">💻 ${esc(label)}</a>`;

// Un numero: grande pulsante «Chiama», poi a cosa serve, orari, costo e sito.
function item(n) {
  const meta = [n.hours, n.cost].filter(Boolean).map(esc).join(' · ');
  const where = n.address ? `<p class="say">📍 ${esc(n.address)}</p>` : '';
  return `<div class="card num">
    ${callButton(n.title || n.label, n.number)}
    ${n.what ? `<p class="say">${esc(n.what)}</p>` : ''}
    ${where}
    ${meta ? `<p class="muted">${meta}</p>` : ''}
    ${n.url ? `<p>${ext(n.url, n.url_label || 'Sito ufficiale')}</p>` : ''}
  </div>`;
}

const link = (l) => `<div class="card num">
    <p><strong>${esc(l.title)}</strong></p>
    <p class="say">${esc(l.what)}</p>
    <p>${ext(l.url, l.url_label)}</p>
  </div>`;

// Contatti dell'ASP divisi per argomento (campo contacts, topic).
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

// Sede INPS della stessa provincia (data/regioni/sicilia/inps.json).
function inpsBlock(id) {
  const p = inps.provinces.find((x) => x.id === id);
  if (!p || !p.address) return '';
  return `<h3 class="say">🏛️ Sede INPS (invalidità, pensioni, assegni)</h3>
    <div class="card num">
      <p class="say">📍 ${esc(p.address)}${p.hours ? `<br>${esc(p.hours)}` : ''}</p>
      <p class="say">Per lo sportello bisogna prenotare: app INPS, sito MyINPS, oppure 803 164 da fisso.</p>
      ${p.url ? `<p>${ext(p.url, 'La pagina della sede sul sito INPS')}</p>` : ''}
    </div>`;
}

function aspBlock(a) {
  if (!a) return '';
  const pages = [
    a.site_url && ["Sito dell'ASP", a.site_url],
    a.guardia_medica_url && ['Guardia medica: tutte le sedi e i numeri', a.guardia_medica_url],
    a.pua_url && ["Cure a casa (PUA): pagina dell'ASP", a.pua_url],
  ].filter(Boolean);
  const contacts = a.contacts || [];
  return `<section id="asp-numeri" aria-labelledby="asp-title">
    <h2 id="asp-title" class="say">📍 ${esc(a.name)}</h2>
    ${TOPICS.map(([t, title, tip]) => {
      const list = contacts.filter((c) => c.topic === t);
      if (!list.length && t !== 'guardia') return '';
      return `<h3 class="say">${title}</h3>
        ${tip ? `<p class="say">${esc(tip)}</p>` : ''}
        ${list.map(item).join('')}
        ${t === 'guardia' && a.guardia_medica_url ? `<p>${ext(a.guardia_medica_url, 'Tutte le sedi della guardia medica')}</p>` : ''}
        ${t === 'guardia' && !list.length && !a.guardia_medica_url ? `<p class="say">Non abbiamo ancora il numero: chiedi al centralino dell'ASP o al tuo medico di famiglia.</p>` : ''}`;
    }).join('')}
    ${inpsBlock(a.id)}
    ${pages.length ? `<h3>💻 Su internet</h3><ul class="clean">${pages.map(([l, u]) => `<li>${ext(u, l)}</li>`).join('')}</ul>` : ''}
  </section>`;
}

const group = (g) => `
  <h2 class="say">${esc(g.title)}</h2>
  ${g.id === 'urgenze' ? '<div class="notice urgent"><p class="say">🚨 Se è grave, chiama subito il <a href="tel:112"><strong>112</strong></a>.</p></div>' : ''}
  ${g.items.map(item).join('')}`;

function render() {
  const id = decodeURIComponent(location.hash.slice(1));
  const a = data.asl.find((x) => x.id === id);
  const provinces = [...data.asl].sort((x, y) => x.province.localeCompare(y.province));
  app.innerHTML = `
    <h1>📞 Numeri utili</h1>
    <p class="lead say">I numeri giusti da chiamare in Sicilia. Tocca il numero per chiamare.</p>
    ${group(nums.groups[0])}
    <h2 class="say">I numeri della tua ASP</h2>
    ${needsRegion() ? `<p class="say">Prima scegli la tua regione.</p>${regionChoices()}` : `
    <p class="say">Scegli la tua provincia: guardia medica, CUP per prenotare, ufficio per i cittadini, cure a casa.</p>
    <div class="grid2">${provinces.map((p) => `<a class="btn choice" href="#${esc(p.id)}"${p.id === id ? ' aria-current="true"' : ''}><span class="txt">${esc(p.province)}</span></a>`).join('')}</div>
    ${changeRegionLink()}
    ${aspBlock(a)}`}
    ${nums.groups.slice(1).map(group).join('')}
    ${nums.notes.map((t) => `<div class="notice info"><p class="say">${esc(t)}</p></div>`).join('')}
    <h2 class="say">Su internet</h2>
    ${nums.links.map(link).join('')}
    ${helpBox()}
    ${sourcesBox([...nums.sources, ...(a ? a.sources : [])], { verified: nums.last_verified })}`;
  hideHeadingEmoji(app);
}

app.addEventListener('click', (e) => {
  // Scelta della regione: la pagina ha una schermata sola, «Cambia regione» la ridisegna.
  const btn = e.target.closest('button[data-action="region"], button[data-action="change-region"]');
  if (btn) regionAction(btn, { current: 'province', render, go: render });
});

window.addEventListener('hashchange', () => {
  render();
  document.getElementById('asp-numeri')?.scrollIntoView({ block: 'start' });
});

(async function init() {
  renderFooter(ROOT);
  try {
    [nums, data, inps] = await Promise.all([loadJSON(`${ROOT}data/numeri.json`), loadRegional(ROOT, 'asp'), loadRegional(ROOT, 'inps')]);
  } catch {
    app.innerHTML = '<div class="notice bad"><p>Non riusciamo a caricare la pagina. Riprova tra poco.</p></div>'; return;
  }
  render();
  if (location.hash) document.getElementById('asp-numeri')?.scrollIntoView({ block: 'start' });
})();
