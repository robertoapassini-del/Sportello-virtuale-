// A chi chiedere conferma, nell'avviso in fondo a ogni modulo («Controlla sempre…»).
// Lo usano le pagine (js/common.js, disclaimer) e la guida scritta (tools/pagine.mjs).
// I moduli che non sono qui: «con la tua ASP».
export const CHECK_WITH = {
  invalidita: "con l'INPS o con un patronato",
  'ricorso-invalidita': "con l'INPS o con un patronato",
  'assegno-inclusione': "con l'INPS o con un patronato",
  'legge-104': "con l'INPS o con un patronato",
  'cartella-clinica': "con l'ospedale o con la tua ASP",
};

export const checkWith = (slug) => `Controlla sempre ${CHECK_WITH[slug] || 'con la tua ASP'}.`;
