// Pagina di un'area (per esempio «Visite ed esami»). L'elenco dei moduli è già
// scritto nell'HTML (lo crea tools/pagine.mjs da data/moduli.json), così si legge
// anche senza JavaScript. Qui si aggiungono solo Ascolta, «Chi può aiutarti» e il piè di pagina.
import { renderFooter, helpBox, listenButton, speakScreen } from './common.js';

const app = document.getElementById('app');
renderFooter('../');
app.querySelector('.topbar').innerHTML = listenButton();
document.getElementById('area-help').outerHTML = helpBox();
app.addEventListener('click', (e) => {
  if (e.target.closest('button[data-action="listen"]')) speakScreen(app);
});
