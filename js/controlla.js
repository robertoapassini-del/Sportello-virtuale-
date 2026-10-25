// A chi chiedere conferma, nell'avviso in fondo a ogni modulo («Controlla sempre…»).
// Lo usano le pagine (js/common.js, disclaimer) e la guida scritta (tools/pagine.mjs).
// I moduli che non sono qui: «con la tua ASP». La sigla cambia con la regione (asl: ASP, ATS, ASL…);
// senza regione (guida scritta, uguale per tutti) «azienda sanitaria (ASL)».
export const CHECK_WITH = {
  invalidita: "con l'INPS o con un patronato",
  'ricorso-invalidita': "con l'INPS o con un patronato",
  'assegno-inclusione': "con l'INPS o con un patronato",
  'cartella-clinica': "con l'ospedale o con la tua ASP",
  'contrassegno-disabili': "con il tuo Comune o con la tua ASP",
  'accompagnamento': "con l'INPS o con un patronato",
  'legge-104': "con l'INPS o con un patronato",
  'tessera-sanitaria': "con l'Agenzia delle Entrate o con la tua ASP",
  'certificato-malattia': "con l'INPS, con il tuo medico o con il datore di lavoro",
  'visita-fiscale': "con l'INPS o con il datore di lavoro",
  psicologo: "con la tua ASP o, per il bonus psicologo, con l'INPS",
};

export const checkWith = (slug, asl = 'azienda sanitaria (ASL)') => `Controlla sempre ${(CHECK_WITH[slug] || 'con la tua ASP').replace(/\bASP\b/g, asl)}.`;
