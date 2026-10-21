// Pagine corte della guida (modulo/pagina/): solo testo, nessuna domanda.
// Qui si avvia la stessa cosa delle altre pagine: il piè di pagina con
// «Questa pagina ti è stata utile?» e il conteggio anonimo della visita.
import { renderFooter, siteRoot } from './common.js';

// Cartella principale del sito ('../' per i moduli solo testo, '../../' per le pagine corte).
const ROOT = siteRoot();

renderFooter(ROOT);
