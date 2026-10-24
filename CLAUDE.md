# Guida Sanità — istruzioni per chi modifica il sito

Sito statico italiano sulla sanità pubblica, per tutta Italia (i dati regionali sono in `data/regioni/`).

## La missione

Guida Sanità spiega a tutti, con parole semplici, tutto quello che riguarda la sanità pubblica: come si fa,
cosa ti spetta, cosa fare se qualcosa non va. Ogni informazione viene da una fonte ufficiale. Il sito si tiene
aggiornato da solo (la copia notturna delle pagine ufficiali, `docs/regioni.md` sezione 8): fa la ricerca e il
lavoro difficile al posto delle persone.

Per chi scrive vuol dire:
- prima come si fa, poi cosa fare se qualcosa non va. Titoli e descrizioni dicono la procedura
  («Invalidità civile: la domanda e la visita»), non solo il problema («La visita non arriva»);
- le frasi dei problemi restano nelle parole chiave di `data/moduli.json`, perché la ricerca le trovi;
- siamo volontari, non un ufficio pubblico: ogni passo porta alla pagina ufficiale dove si fa davvero la domanda;
- i temi da aggiungere e l'ordine sono in `docs/piano-contenuti.md`.

## Prima di ogni modifica

Prima di ogni modifica leggi [docs/protocollo-test.md](docs/protocollo-test.md) e seguilo:
- nessun fatto, cifra o numero di telefono senza fonte ufficiale nei file `data/` (docs/regola-numeri.md, docs/regola-cifre.md);
- italiano semplice: Gulpease, frasi corte, niente parole da ufficio, verbi attivi (docs/regola-italiano.md);
- regole di una sola regione scritte come tali («In Sicilia: …»); nei JS la sigla dell'azienda sanitaria viene da `aslLabel()`;
- dopo la modifica: `npm run pagine`, `npm test`, e i controlli col browser (`tests/browser.cjs`, `tests/combinazioni.cjs`);
- ogni errore trovato diventa un controllo (`tests/errori-noti.test.mjs` o un test nuovo) e una riga nel `CHANGELOG.md` (fine riga CRLF).

Scrivi in italiano semplice, frasi corte. Non toccare a mano le parti create da `tools/pagine.mjs`
(testata, indice della guida, fonti, piè di pagina): si rigenerano con `npm run pagine`.
