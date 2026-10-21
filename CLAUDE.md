# Guida Sanità — istruzioni per chi modifica il sito

Sito statico italiano sui diritti sanitari, per tutta Italia (i dati regionali sono in `data/regioni/`).

Prima di ogni modifica leggi [docs/protocollo-test.md](docs/protocollo-test.md) e seguilo:
- nessun fatto, cifra o numero di telefono senza fonte ufficiale nei file `data/` (docs/regola-numeri.md, docs/regola-cifre.md);
- regole di una sola regione scritte come tali («In Sicilia: …»); nei JS la sigla dell'azienda sanitaria viene da `aslLabel()`;
- dopo la modifica: `npm run pagine`, `npm test`, e i controlli col browser (`tests/browser.cjs`, `tests/combinazioni.cjs`);
- ogni errore trovato diventa un controllo (`tests/errori-noti.test.mjs` o un test nuovo) e una riga nel `CHANGELOG.md` (fine riga CRLF).

Scrivi in italiano semplice, frasi corte. Non toccare a mano le parti create da `tools/pagine.mjs`
(testata, indice della guida, fonti, piè di pagina): si rigenerano con `npm run pagine`.
