// Pagine corte della guida (modulo/pagina/): solo testo, nessuna domanda.
// Qui si avviano le stesse cose delle altre pagine: il piè di pagina con
// «Questa pagina ti è stata utile?», il conteggio anonimo della visita e il
// pulsante «🔊 Ascolta», che legge la guida ad alta voce.
import { renderFooter, listenButton, speakGuide, siteRoot } from './common.js';

// Cartella principale del sito ('../' per i moduli solo testo, '../../' per le pagine corte).
const ROOT = siteRoot();
const app = document.getElementById('app');

renderFooter(ROOT);

if (app) {
  const listen = listenButton();
  if (listen) {
    app.insertAdjacentHTML('afterbegin', `<div class="topbar no-say">${listen}</div>`);
    app.addEventListener('click', (e) => {
      if (e.target.closest('button[data-action="listen"]')) speakGuide(app);
    });
  }
}
