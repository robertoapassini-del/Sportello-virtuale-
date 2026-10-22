# Protocollo dei controlli

Ogni modifica al sito passa da questi controlli. Sono nati da errori veri trovati sul sito: ogni volta che se ne
trova uno nuovo, si aggiunge un controllo che lo avrebbe preso.

## Prima di cambiare qualcosa

1. Leggi le regole che toccano quello che cambi: [regola-numeri.md](regola-numeri.md) (numeri di telefono),
   [regola-cifre.md](regola-cifre.md) (giorni, euro, età), [regioni.md](regioni.md) (dati regionali), [regola-italiano.md](regola-italiano.md) (italiano semplice:
   Gulpease, frasi corte, parole da ufficio, verbi attivi) e la regola nazionale qui sotto.
2. Nessun fatto nuovo senza fonte ufficiale: ogni cifra o regola va nei file `data/` con `provenienza`
   (url, data, tipo di prova). Una regola di legge si cita con articolo e comma letti sul testo, non a memoria.
3. Chi cambia `data/regioni/` o `data/numeri.json` lancia `node tools/confronta-copie.mjs <cartella-copie> <regione>` sulle copie delle
   pagine ufficiali (branch `copie-siti`, cartella `copie/`) e corregge, o annota nel `todo`, ogni problema che riguarda
   quello che ha cambiato.

## Regola nazionale

Il sito vale in tutta Italia. Una regola di una sola regione si scrive dicendo di quale regione è
(«In Sicilia: …»), con accanto cosa fare nelle altre regioni. «ASP» è il nome siciliano (e calabrese) dell'azienda
sanitaria: nei testi per tutti si scrive «azienda sanitaria (ASL)», nei JS si usa `aslLabel()`.
Se non sai se una regola è nazionale, trattala come regionale finché non trovi la fonte.

## Telefoni vecchi

Molti di chi usa il sito hanno un telefono vecchio: il JavaScript deve funzionare su Safari 12 e Chrome 70
(`tests/compat.test.mjs`). Niente «?.», «??», `matchAll`, `replaceAll`, `.at()`, «await» fuori da una funzione e
gli altri casi elencati nel test. Se lo script non parte o i dati non arrivano, la pagina mostra lo stesso il testo
scritto (`tests/telefoni-vecchi.cjs`).

## I controlli automatici

| Comando | Cosa controlla |
|---|---|
| `npm test` | dati, numeri e fonti (`contatti`, `provenienza`, `cifre`: anche nel titolo e nella descrizione, con l'unità giusta), pagine aggiornate (`pagine`, anche la 404, fonti mai vuote, niente «noindex»), link interni (`link`), citazioni di legge rilette (`citazioni` + `tests/citazioni.txt`), lettere senza segnaposto (`lettere`), calcoli e festivi (`engine`), testi nazionali (`nazionale`), errori già visti (`errori-noti`), ricerca (`ricerca`: 40 parole → modulo giusto), italiano semplice (`leggibilita`: Gulpease ≥ 60 per pagina e ≥ 65 per modulo, frasi fino a 40 parole, niente parole da ufficio) |
| `node tests/browser.cjs <indirizzo>` | tutte le pagine in un browser (Sicilia, Lazio, nessuna regione) e i percorsi dei moduli: errori JavaScript, «undefined», pagine troppo larghe (anche con il testo al 250%), pulsanti sotto i 44 px, tastiera (primo Tab, contorno del focus, errori dei campi collegati), stampa (titolo, pulsanti), frasi siciliane senza «Sicilia» |
| `node tests/combinazioni.cjs <indirizzo>` | tutte le combinazioni di risposte nei moduli, confrontate con un calcolo indipendente; nella CI anche con il fuso orario di New York (`TZ=America/New_York TZID=America/New_York`) |
| `node tools/confronta-copie.mjs <cartella-copie> [regione…\|nazionali]` | i dati contro le copie notturne delle pagine ufficiali (branch `copie-siti`): cifre dei numeri con prova «pagina» (regionali e `data/numeri.json`) e orari HH:MM dei contatti con prova «pagina» che non sono nella copia del loro url, PEC e indirizzi di invio che non sono in nessuna copia dell'azienda, PEC, indirizzo e orari delle sedi INPS (`inps.json`) che non sono nella copia della pagina della sede, url senza copia. Nella CI è il job «copie», con `--noti tests/copie-noti.txt --base origin/main`: diventa rosso (codice 3) solo per un problema nuovo su un dato che la PR ha cambiato; i problemi già noti, quelli su dati uguali a main («non di questa PR»: è cambiata la pagina ufficiale) e gli url nuovi senza copia vanno solo nel riepilogo del job |
| `node tests/robustezza.cjs <indirizzo>` | cosa succede quando qualcosa va storto: file di dati che non arrivano, cookie bloccati, indirizzi ostili (`?torna=`), hash rotti |
| `node tests/numeri-province.cjs <indirizzo>` | Numeri utili in ogni regione attiva e in ogni provincia (`numeri-utili/#<id>`): errori JavaScript, «undefined», blocco dell'azienda (`#asp-numeri`) e della sede INPS presenti, niente «Sicilia» fuori dalla Sicilia; il pulsante «Stampa» chiama davvero la stampa |
| `node tests/telefoni-vecchi.cjs <indirizzo>` | telefoni vecchi e reti lente, su tutte le pagine: senza JavaScript (titolo visibile entro 0,7 secondi, niente «Un momento…» per sempre, niente pulsanti bloccati), senza dati e con un errore nello script della pagina (resta la risposta scritta, con l'avviso), telefono in orizzontale 640x360 con il testo al 200% (niente scorrimento laterale) |
| `node tests/lettere-stampa.cjs <indirizzo>` | 17 lettere dei moduli in Sicilia, con dati lunghi e un delegato: stampa col pulsante (al massimo 2 pagine, solo la lettera, con «Spett.le», «Oggetto:», nome, luogo e data accanto alla firma), stampa dal menu del browser (Ctrl+P) sulla schermata della lettera e sul modulo ufficiale dell'ASP di Palermo (solo la lettera o la tabella, mai il modulo con i dati), la classe di stampa che resta finché non arriva «afterprint» (sul telefono la stampa non aspetta), testo copiato senza entità HTML, link email sotto i 2000 caratteri con il nome nell'oggetto, PEC di chi scrive, firma con il nome di chi firma, niente «dott. dott.» né «Distretto – Distretto», niente frasi spezzate a mano. Usa `pdfinfo`/`pdftotext` se ci sono |

**Elenco dei problemi noti delle copie** (`tests/copie-noti.txt`): una chiave per riga, per esempio
`sicilia/enna numero 0935520111 https://www.aspenna.it`. Ci vanno solo i buchi delle copie (pagine fatte con
JavaScript, siti giù) e i problemi già annotati nel `todo`. Si rifà con
`node tools/confronta-copie.mjs <cartella-copie> --scrivi-noti tests/copie-noti.txt`, e chi rivede la PR controlla
ogni riga nuova: aggiungere la propria chiave per far passare un numero sbagliato non vale. Le righe che il job
segnala come «non ci sono più» si tolgono.

Per i controlli col browser: `python3 -m http.server 8080` in un altro terminale, poi `http://localhost:8080/`.
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
- 21/10/2026 (giro 5) — `browser.cjs`, «conto senza uffici»: in una regione con solo i Numeri utili i moduli con un conto
  nazionale si fermavano subito a «non abbiamo ancora i dati». Ora il controllo segue il percorso fino alla data calcolata.
- 21/10/2026 (giro 5) — audit dei mutanti (30 errori messi apposta, `npm test` ne prendeva 4): `tests/link.test.mjs`
  (link interni rotti), `tests/citazioni.test.mjs` (ogni «art. N | legge» deve stare in `tests/citazioni.txt`: una
  citazione nuova si rilegge sulla fonte e si aggiunge; `CITAZIONI=scrivi` rigenera l'elenco), `tests/lettere.test.mjs`
  (segnaposto e «undefined» nelle lettere); in `cifre` titolo, descrizione e unità dal nome del campo; in `provenienza`
  fonti mai vuote e cifra presente nella frase «…» della nota; in `pagine` niente «noindex»; in `engine` festivi
  2026-2030 e ricorso al TAR della cartella; in `contatti` le voci regionali di `numeri.json` con «regione».
- 21/10/2026 (giro 5) — chi scrive per un'altra persona: `engine.test.mjs` (genitore senza delega, tutore e
  amministratore di sostegno con il decreto), `combinazioni.cjs` (nell'invalidità di un minore è già scelto «genitore»),
  due righe in `errori-noti.test.mjs`: le lettere chiedevano sempre la delega.
- 21/10/2026 — audit con errori messi apposta (giro 5): la CI ne prendeva 4 su 30. `tests/numeri-province.cjs` (un errore
  JavaScript nella sede INPS di una provincia, un numero della Regione Siciliana mostrato a tutti, il pulsante Stampa
  che non stampava); il job «copie» blocca i numeri, le PEC e gli orari cambiati dalla PR che la copia non conferma
  (`tests/copie-noti.txt` per i buchi noti); `confronta-copie.mjs` controlla anche gli orari, le sedi INPS e
  `data/numeri.json`, e `tools/copie.mjs` copia anche le pagine delle sedi INPS e dei numeri nazionali.
- 22/10/2026 (giro 6) — audit tastiera e lettori di schermo: in `browser.cjs` il primo Tab deve portare a «Vai al
  contenuto» (i moduli spostavano il focus sul titolo all'apertura), ogni elemento raggiunto con Tab ha un contorno
  di almeno 2 px (i `summary` non ce l'avevano), e dopo un invio vuoto l'errore è collegato al campo
  (`aria-describedby`), il campo ha `aria-invalid` e il focus (`showError()` in `js/flow.js`); i percorsi nei moduli
  anche come utente della Sicilia. In `errori-noti.test.mjs` i link chiamati «qui», «leggi qui», «Fonte».
- 22/10/2026 (giro 6) — audit di sicurezza e privacy: in `robustezza.cjs` gli indirizzi `?torna=` che si risolvono in
  «//altro-sito/» («/.//altro-sito/»); `tests/head-script.test.mjs` (lo script in testa a ogni pagina non porta fuori dal
  sito); `tests/html-esc.test.mjs` (dati dell'utente nell'HTML solo dentro `esc()`); in `lettere.test.mjs` «Manda per
  email» con indirizzi ostili («?cc=», «&bcc=») e con tutti gli indirizzi di `data/`; in `pagine.test.mjs` il meta
  referrer su ogni pagina; in `errori-noti.test.mjs` la privacy dice che la ricerca resta nell'indirizzo («#q=»).
- 22/10/2026 (giro 7) — audit telefoni vecchi e reti lente: `tests/compat.test.mjs` (18 «?.» e «??» e un `matchAll`
  fermavano tutti i moduli su iOS 12 e Chrome prima dell'80; «await» fuori da una funzione in `fonti.html`),
  `tests/telefoni-vecchi.cjs` (12 moduli toglievano la risposta scritta quando i dati non arrivavano, pulsante
  d'inizio bloccato dopo un errore nello script, «Un momento…» per sempre in `fonti.html` senza JavaScript, menu che
  usciva dallo schermo a 640x360 con il testo al 200%, pagina nascosta 1,5 secondi), in `pagine.test.mjs` il
  `modulepreload` di tutti i moduli della pagina, un secondo giro di `combinazioni.cjs` con il fuso di New York.
- 22/10/2026 (giro 8) — audit dell'italiano semplice: `tests/leggibilita.test.mjs` ([regola-italiano.md](regola-italiano.md)).
  9 pagine avevano un Gulpease sotto 60 (ausili, cure fuori regione, dentista, accompagnamento, RSA), 13 frasi
  superavano le 40 parole, la privacy diceva «ai sensi dell'art. 22 GDPR».
- 22/10/2026 (giro 8) — audit delle lettere stampate: `tests/lettere-stampa.cjs` (sul telefono la classe che stampa solo la
  lettera spariva dopo 1 secondo e si stampava la pagina intera con i dati; Ctrl+P sulla schermata della lettera stampava
  4-6 pagine col modulo; frasi spezzate a mano che in stampa lasciavano mozziconi; firma senza il nome; PEC chiesta e mai
  scritta; «dott. dott.», «Distretto – Distretto»; oggetto dell'email INPS senza il nome), in `lettere.test.mjs` PEC, firma,
  una riga per frase, `doctorName()` e `districtLine()`, in `errori-noti.test.mjs` «dott. ${…}» e «Distretto – ${…}».
