// Pagina di un'area (per esempio «Visite ed esami»). L'elenco dei moduli è già
// scritto nell'HTML (lo crea tools/pagine.mjs da data/moduli.json), così si legge
// anche senza JavaScript. Qui si aggiungono solo «Chi può aiutarti» e il piè di pagina.
import { renderFooter, helpBox } from './common.js';

renderFooter('../');
document.getElementById('area-help').outerHTML = helpBox();
