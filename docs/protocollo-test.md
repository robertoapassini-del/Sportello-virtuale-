# Protocollo dei controlli

Ogni modifica al sito passa da questi controlli. Sono nati da errori veri trovati sul sito: ogni volta che se ne
trova uno nuovo, si aggiunge un controllo che lo avrebbe preso.

## Prima di cambiare qualcosa

1. Leggi le regole che toccano quello che cambi: [regola-numeri.md](regola-numeri.md) (numeri di telefono),
   [regola-cifre.md](regola-cifre.md) (giorni, euro, età), [regioni.md](regioni.md) (dati regionali) e la regola
   nazionale qui sotto.
2. Nessun fatto nuovo senza fonte ufficiale: ogni cifra o regola va nei file `data/` con `provenienza`
   (url, data, tipo di prova). Una regola di legge si cita con articolo e comma letti sul testo, non a memoria.
3. Chi cambia `data/regioni/` lancia `node tools/confronta-copie.mjs <cartella-copie> <regione>` sulle copie delle
   pagine ufficiali (branch `copie-siti`, cartella `copie/`) e corregge, o annota nel `todo`, ogni problema che riguarda
   quello che ha cambiato.

## Regola nazionale

Il sito vale in tutta Italia. Una regola di una sola regione si scrive dicendo di quale regione è
(«In Sicilia: …»), con accanto cosa fare nelle altre regioni. «ASP» è il nome siciliano (e calabrese) dell'azienda
sanitaria: nei testi per tutti si scrive «azienda sanitaria (ASL)», nei JS si usa `aslLabel()`.
Se non sai se una regola è nazionale, trattala come regionale finché non trovi la fonte.

## I controlli automatici

| Comando | Cosa controlla |
|---|---|
| `npm test` | dati, numeri e fonti (`contatti`, `provenienza`, `cifre`), pagine aggiornate (`pagine`, anche la 404), calcoli (`engine`), testi nazionali (`nazionale`), errori già visti (`errori-noti`), ricerca (`ricerca`: 40 parole → modulo giusto) |
| `node tests/browser.cjs <indirizzo>` | tutte le pagine in un browser (Sicilia, Lazio, nessuna regione) e i percorsi dei moduli: errori JavaScript, «undefined», pagine troppo larghe (anche con il testo al 250%), pulsanti sotto i 44 px, stampa (titolo, pulsanti), frasi siciliane senza «Sicilia» |
| `node tests/combinazioni.cjs <indirizzo>` | tutte le combinazioni di risposte nei moduli, confrontate con un calcolo indipendente |
| `node tools/confronta-copie.mjs <cartella-copie> [regione…]` | i dati regionali contro le copie notturne delle pagine ufficiali (branch `copie-siti`): cifre dei numeri con prova «pagina» che non sono nella copia del loro url, PEC e indirizzi di invio che non sono in nessuna copia dell'azienda, url senza copia. Nella CI è il job «copie», che non blocca le PR (le pagine ufficiali cambiano di notte) |
| `node tests/robustezza.cjs <indirizzo>` | cosa succede quando qualcosa va storto: file di dati che non arrivano, cookie bloccati, indirizzi ostili (`?torna=`), hash rotti |

Per i due controlli col browser: `python3 -m http.server 8080` in un altro terminale, poi `http://localhost:8080/`.
La CI (`.github/workflows/test.yml`) li fa tutti a ogni push e a ogni pull request: una PR si unisce solo con
tutti i controlli verdi.

## Quando trovi un errore

1. Correggilo.
2. Se si riconosce da come è scritto (una citazione sbagliata, un articolo, una parola), aggiungi una riga in
   `tests/errori-noti.test.mjs` con il motivo.
3. Se è un tipo di errore nuovo (per esempio un controllo che il browser può fare), aggiungi il controllo al test
   giusto e una riga qui sotto.
4. Scrivilo nel `CHANGELOG.md`.

## Registro dei controlli aggiunti

- 21/10/2026 — `nazionale.test.mjs` e il controllo delle frasi siciliane in `browser.cjs`: dopo il passaggio da
  sito siciliano a nazionale, molti testi dicevano «in Sicilia» o «ASP» a tutti.
- 21/10/2026 — `errori-noti.test.mjs`: citazioni di legge sbagliate trovate in rilettura (L. 24/2017 art. 4 c. 2,
  DPCM 2017 allegato 12 per gli ausili, artt. 24-26 per i consultori, allegato 4C per il dentista), «la ASL»,
  «Sono passati 1 giorno», «circa» con i centesimi, parenti fino al terzo grado per i permessi 104.
- 21/10/2026 — `browser.cjs` nella CI, con `combinazioni.cjs`: prima si lanciavano solo a mano.
- 21/10/2026 (notte) — audit indipendenti su leggi, lettere e calcoli, dati regionali, accessibilità, privacy e sicurezza,
  numeri nazionali, ricerca, stampa e SEO: `tests/ricerca.test.mjs` (la ricerca non ordinava e trovava pezzi di parola),
  `tests/robustezza.cjs` (redirect `?torna=` aggirabile, cookie bloccati, 112 sparito senza dati), controlli di
  accessibilità e stampa in `browser.cjs`, test sulle date (01/01/1970) e sui festivi in `engine.test.mjs`, 404.html.
- 21/10/2026 — `tools/confronta-copie.mjs` e il job «copie» nella CI: un audit sulle copie delle pagine ufficiali ha trovato
  in Sicilia PEC e indirizzi di invio sbagliati (Trapani, Agrigento, Siracusa), orari incompleti o di un altro ufficio e
  14 numeri con un url che non li conteneva.
- 21/10/2026 — audit dei testi: in `pagine.test.mjs` le sigle (PEC, ISEE, CUP, TAR, PUA, SAD) spiegate nella pagina dove
  compaiono; in `browser.cjs` il riquadro «Chi può aiutarti» delle pagine delle aree dice «ASP» in Sicilia; in
  `errori-noti.test.mjs` «della ASL», numeri verdi con lo spazio in mezzo, migliaia senza punto, titoli di pagina come
  link dentro la frase, «ad Enna», «una équipe», titoli di `moduli.json` diversi dall'h1.
