// Pagina di un'area (per esempio «Visite ed esami»). L'elenco dei moduli è già
// scritto nell'HTML (lo crea tools/pagine.mjs da data/moduli.json), così si legge
// anche senza JavaScript. Qui si aggiungono solo «Chi può aiutarti» e il piè di pagina.
// «Chi può aiutarti» aspetta l'elenco delle regioni: così in Sicilia dice «ASP» e non «ASL».
import { renderFooter, helpBox, loadRegioni } from './common.js';

renderFooter('../');
loadRegioni('../').finally(() => {
  const el = document.getElementById('area-help');
  if (el) el.outerHTML = helpBox();
});
