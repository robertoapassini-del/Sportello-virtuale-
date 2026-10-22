# Registro delle modifiche

Ogni modifica ai file `data/*.json` va annotata qui, con la fonte.

## 22/10/2026 — Toscana, Emilia-Romagna, Marche, Liguria: dati per i moduli e le lettere
- `data/regioni/index.json`: Invalidità accesa in Toscana, Emilia-Romagna e Liguria; Medico di famiglia acceso in Liguria. Gli altri moduli restano spenti: mancano dati letti su pagine ufficiali (elenco nel `todo` di ogni azienda).
- `inps.json` di Toscana, Emilia-Romagna e Liguria: `regime` della riforma della disabilità per ogni provincia. Nuova procedura dal 01/01/2025 a Firenze e Forlì-Cesena, dal 30/09/2025 a Genova, dal 01/03/2026 ad Arezzo, Massa-Carrara, Bologna, Piacenza, Ravenna, Rimini, La Spezia e Savona; vecchia procedura nelle altre fino al 31/12/2026. Fonti: INPS, «Riforma della disabilità: al via la terza fase sperimentale» (https://www.inps.it/it/it/inps-comunica/notizie/dettaglio-news-page.news.2026.02.riforma-della-disabilit-al-via-la-terza-fase-sperimentale.html) e Dipartimento per le politiche in favore delle persone con disabilità (https://www.disabilita.governo.it/it/notizie/al-via-sperimentazione-riforma-disabilita-in-altre-40-province/), estratti del 22/10/2026, stesso elenco usato per la Sicilia. Nome della provincia nella scelta: «Forlì-Cesena» e «Reggio Emilia» (prima il nome della sede INPS).
- Liguria, Area 1 (Imperia): percorso di tutela con il numero verde 800 186044 (lunedì–venerdì 9–13), letto sulla copia del 22/10/2026 di https://www.asl1.liguria.it/prenotazioni-e-ticket/numero-verde-gratuito-riduzione-tempi-attesa.html; campi della lettera (`how_to`, `documents_required`, `what_next`, invio alla PEC di ATS Liguria). Tigullio (Area 4): numero verde 800 185088, da https://www.asl4.liguria.it/prenotazioni-cup/prenotazioni/.
- Liguria: `scelta_medico` per le 4 province (Salute Simplex, https://www.regione.liguria.it/homepage-salute/accesso-rapido/salutesimplex-app-portale.html; sportelli polifunzionali e anagrafe sanitaria delle Aree 1, 2 e 3; poliss.regione.liguria.it e farmacie per l'Area 5, https://www.asl5.liguria.it/Home/ORARICUPANAGRAFEBRUGNATO.aspx). Senza codice di priorità vale la classe P (ATS Liguria, «Liste di attesa»).
- In cima agli `asl.json`: `local_name`, `no_class_rule` e `regional_channel` (prenota.sanita.toscana.it, cupweb.it, Prenoto Salute) con la loro fonte in `regole_fonti`.
- Ogni azienda ha in `pagine` le pagine ufficiali da copiare (percorso di tutela, cartella clinica anche degli ospedali universitari, cure palliative, protesi e ausili, scelta del medico), trovate col motore di ricerca sui domini ufficiali: il server le copia dopo l'unione e i dati si scrivono solo leggendo le copie.
- Marche: nessun dato nuovo. Le pagine delle AST sono fatte con JavaScript (le copie hanno 3-66 caratteri) e quelle della Regione hanno un CAPTCHA: serve Playwright sul server.

## 22/10/2026 — Lazio, Abruzzo, Molise, Campania: dati per i moduli e le lettere
- `tests/browser.cjs` e `tests/robustezza.cjs`: la regione non attiva e i moduli ancora spenti della Lombardia si leggono dall'indice, non sono scritti a mano (con la Campania attivata il controllo «regione non attiva» falliva).
- `js/home.js`: per una regione con alcuni moduli completi la frase della pagina iniziale li elenca («In Molise ci sono i numeri utili e, con gli uffici della zona, invalidità, cartella clinica, assistenza a casa e medico di famiglia»).
- Campania attiva per Numeri utili (`data/regioni/campania/asl.json`, `inps.json`): 5 province, 7 ASL (Avellino, Benevento, Caserta, Napoli 1 Centro, 2 Nord, 3 Sud, Salerno), 57 contatti letti nelle copie del server del 22/10/2026 (proof «pagina»; `confronta-copie` 0 problemi). Le tre ASL di Napoli sono in una voce sola, come Roma nel Lazio. Sedi INPS: pagine «sedi» di inps.it (Avellino, Benevento, Caserta, Napoli, Salerno).
- Riforma della disabilità (campo `regime` di `inps.json`) in Lazio, Abruzzo, Molise e Campania: nuovo sistema dal 01/01/2025 a Frosinone e Salerno, dal 30/09/2025 a Teramo e Isernia, dal 01/03/2026 a Roma, Chieti, Campobasso e Caserta; vecchio sistema nelle altre fino al 31/12/2026. Fonte: notizie INPS (terza fase, febbraio 2026; seconda fase, messaggio 2600 del 05/09/2025) e Dipartimento per le politiche in favore delle persone con disabilità, letti come estratto: da rileggere sul testo (todo).
- Moduli accesi in `data/regioni/index.json`: invalidità in Lazio, Abruzzo, Molise e Campania; cartella clinica in Abruzzo e Molise; assistenza domiciliare e medico di famiglia in Molise. PEC ed email URP di queste aziende sono nelle copie.
- Abruzzo, ASL di Teramo: uffici cartelle cliniche degli ospedali di Atri, Giulianova e Sant'Omero, con gli orari (pagina «Cittadini Utenti»).
- Molise: `scelta_medico` dalla pagina della Regione sul Fascicolo sanitario elettronico (scelta e revoca online; medico temporaneo e deroghe al distretto).
- Nuovo campo `pagine` in `asl.json` (lo legge già `tools/copie.mjs`): pagine ufficiali sul percorso di tutela da far copiare al server (Pass di garanzia nel Lazio e pagine delle ASL di Roma; liste di attesa delle ASL abruzzesi, della Regione Campania, di Salerno e Benevento; pagine della Regione Molise). Trovate con il motore di ricerca: nessun dato scritto finché non c'è la copia.
- `tests/copie-noti.txt`: tolte due righe del Lazio che non servono più.

## 22/10/2026 — Frase della pagina iniziale sulle regioni
- `js/home.js`: «uffici e lettere solo per la Sicilia» confondeva (i numeri utili sono proprio numeri di uffici) e sarebbe diventata falsa con una regione nuova. Ora: «Le regole e i conti valgono in tutta Italia. In Umbria per ora ci sono i numeri utili. Le lettere già pronte, per ora, solo in Sicilia.» Le regioni con le lettere si leggono dall'indice. Nuova riga in `tests/errori-noti.test.mjs`.

## 21/10/2026 — L'icona del sito nei risultati di Google
- Google non mostrava l'icona accanto a «guidasanita.it» nei risultati: l'icona era scritta dentro ogni pagina (indirizzo `data:`) e Google vuole un file a un indirizzo stabile, quadrato, multiplo di 48 pixel.
- Nuovi file, fatti dal logo (`logo.svg`): `favicon.ico` (16, 32 e 48 pixel), `apple-touch-icon.png` (iPhone), `icon-192.png` e `icon-512.png` con `site.webmanifest` (Android).
- Ogni pagina ora collega `favicon.ico`, `logo.svg`, `apple-touch-icon.png` e `site.webmanifest`; i link li scrive `tools/pagine.mjs`, che è l'unico posto dove cambiarli.
- Google aggiorna l'icona quando ripassa sulla home page: può volerci qualche giorno. Per fare prima: Search Console → «Controllo URL» su https://guidasanita.it/ → «Richiedi indicizzazione».

## 22/10/2026 — Audit notturno, giro 9: terzo giro di errori messi apposta
- 22 errori nuovi sul codice dei giri 5-8: i test ne prendevano 20. Nuovi controlli per i 2 mancanti: `tests/workflow.test.mjs` controlla che ogni `tests/*.cjs` sia lanciato dalla CI; `tests/leggibilita.test.mjs` controlla le parole da ufficio anche nei testi di `data/numeri.json` e `data/regioni/`.
- `tests/engine.test.mjs`: un termine che cade di sabato passa al lunedì (prima lo vedeva solo `combinazioni.cjs`).
- `tests/telefoni-vecchi.cjs`: su fonti.html si aspetta fino a 3 secondi che «Un momento…» sparisca (sotto carico falliva senza motivo).
- `docs/mutanti.md`: i 22 errori del giro 9.

## 22/10/2026 — Audit notturno, giro 6: altri 30 errori messi apposta
- Secondo audit dei mutanti: 30 errori nuovi messi apposta nel sito (diversi da quelli del giro 5), i controlli ne prendevano 6. Ora li prendono tutti e 30. Elenco dei due giri, con il controllo che prende ogni errore, in `docs/mutanti.md`; in `docs/protocollo-test.md` la regola: dopo ogni gruppo di controlli nuovi, un audit con errori nuovi.
- Nuovo `tests/coerenza.test.mjs`: i link scritti nei JavaScript portano a pagine che esistono; nelle regioni attive id e province non ripetuti, una sede INPS per ogni azienda, topic dei contatti conosciuti da `js/numeri.js`, `asl_label` per ogni regione; una regione senza «moduli» ha i dati di tutti i moduli e il file INPS; ogni pagina del sito è nella sitemap; la stessa legge non ha due anni diversi; ogni pulsante ha un nome; il link «‹ indietro» porta al livello sopra; «Informazioni controllate il» è la data più vecchia dei dati del modulo; «Condividi su WhatsApp» manda l'indirizzo della pagina; nessuna parola della ricerca sparita (elenco in `tests/ricerca-parole.txt`, 419 righe; `PAROLE=scrivi npm test` lo rifà).
- `tests/cifre.test.mjs`: legge anche il resto del `<main>` della pagina di ogni modulo (la risposta breve), non solo la guida. Trovate 5 cifre senza dato:
- `data/rules-legge-104.json`: nuovi `iva_auto_percent` 4 e `detrazione_percent` 19 («IVA al 4% e detrazione del 19% sull'auto e sugli ausili»), con la stessa fonte già usata per il contrassegno: Agenzia delle Entrate, scheda «Agevolazioni per le persone con disabilità» (https://www.agenziaentrate.gov.it/portale/web/guest/schede/agevolazioni/disabili, letta il 20/10/2026). Fonte aggiunta anche in `sources`; pagine rigenerate. Da rileggere: `DA-VERIFICARE-A-MANO.md`.
- Dichiarate in `ECCEZIONI` di `tests/cifre.test.mjs`, con il calcolo dal dato: «devono dartelo entro 7 giorni» (fascicolo, è il `deadline_days` della cartella clinica), «hai 6 mesi per il ricorso» (accompagnamento, è l'`appeal_months` del ricorso); senza calcolo: «Non serve l'invalidità al 100%» (contrassegno: dice che la percentuale non serve).
- `tests/browser.cjs`: nelle pagine dei moduli la guida scritta si vede, c'è la classe «pronto» su `<html>` e si vede il pulsante Stampa; ogni campo dei moduli ha un'etichetta (controllata prima di mandare il modulo vuoto: l'età vuota vale 0 e porta avanti); «Ricomincia da capo» torna alla prima schermata e poi Indietro esce dal modulo; un pulsante che non si può cliccare diventa un problema nell'elenco invece di fermare tutto il controllo.
- `tests/combinazioni.cjs`: lettera delle liste d'attesa a Siracusa e Agrigento (nome con «< > &» scritto com'è, data della firma di oggi in gg/mm/aaaa, stampando il foglio non è bianco); il sollecito va allo stesso indirizzo della prima lettera; lettera delle cure palliative alla rete di cure palliative e dell'assistenza a casa al PUA; ricorso giorno per giorno da 150 a 186 giorni dal verbale (giorni che mancano, titolo, colore, «Vai oggi stesso» sotto i 15 giorni); cartella clinica a 29, 30 e 31 giorni dalla richiesta (testo del TAR).
- Nessun testo delle guide cambiato: nelle pagine della legge 104 c'è solo una fonte in più (Agenzia delle Entrate).

## 22/10/2026 — Audit notturno, giro 8: lettere stampate
- CI (`.github/workflows/test.yml`): un «: » dentro un comando su una riga rendeva il file YAML non valido e GitHub non faceva partire nessun controllo, senza errori visibili. Corretto, e nuovo `tests/workflow.test.mjs` che lo controlla a ogni `npm test`.
- Stampa sul telefono (`js/common.js`): «Stampa o salva» e «Stampa la guida» toglievano dopo 1 secondo la classe che stampa solo la lettera (o solo la guida). Sul telefono `window.print()` non aspetta: la finestra di stampa arrivava dopo e stampava tutta la pagina, con il modulo e i dati personali. Ora la classe si toglie a «afterprint» o quando cambia la schermata, mai dopo un tempo fisso.
- Stampa dal menu del browser (Ctrl+P) su una schermata con la lettera: usciva la pagina intera (4-6 fogli, con il modulo dei dati). Ora `js/common.js` segna la lettera della schermata (`letter-screen`, `print-target`) e `css/style.css` stampa solo quella, anche nel sollecito delle liste d'attesa. Sul modulo ufficiale dell'ASP di Palermo c'è il pulsante «Stampa questi dati» e si stampa solo la tabella «Cosa scrivere nel modulo», con il titolo.
- Lettere (`js/letters.js`): le frasi andavano a capo a mano (es. «…non gli/le è» / «stata proposta…») e in stampa a 12 punti lasciavano mozziconi di riga. Ora ogni paragrafo e ogni punto «- » è una riga sola, senza rientri; le parole sono le stesse.
- Firma: ora sotto la riga c'è il nome di chi firma; chi scrive per un'altra persona firma «Firma di <nome> (delegato/a)», «(genitore)», «(tutore)» o «(amministratore di sostegno)». Luogo e data stanno sopra la firma.
- La PEC chiesta nel modulo dei dati non finiva mai nella lettera: ora c'è, dopo l'email.
- Assistenza domiciliare: con «Distretto di Bagheria» (come suggerisce il modulo) la lettera diceva «Distretto – Distretto di Bagheria»; ora `districtLine()` non ripete la parola. Assistenza domiciliare e cure palliative: con «dott. Rossi» la lettera diceva «dott. dott. Rossi»; ora `doctorName()` mette «dott.» solo se manca un titolo (e lascia «dott.ssa», «Dr.», «prof.» come scritti).
- Invalidità: l'oggetto dell'email all'INPS non aveva il nome della persona; ora c'è, come negli altri moduli.
- Ausili: «su prescrizione del/della dott.ssa…» diventa «su prescrizione di …». Sollecito del percorso di tutela: tra gli allegati c'è anche la delega (o il decreto di nomina, o il documento del genitore), come nelle altre lettere.
- Controlli nuovi: `tests/lettere-stampa.cjs` (17 lettere in Sicilia: stampa col pulsante e con Ctrl+P, stampa sul telefono che non aspetta, testo copiato, link email, PEC, firma, «dott. dott.», «Distretto – Distretto», frasi spezzate; nella CI); in `tests/lettere.test.mjs` PEC, firma con il delegato, una riga per frase, `doctorName()`, `districtLine()`, allegati del sollecito, «su prescrizione di»; in `tests/errori-noti.test.mjs` «dott. ${…}» e «Distretto – ${…}» scritti nei js. La prova su un telefono vero è in `DA-VERIFICARE-A-MANO.md`.

## 22/10/2026 — Audit notturno, giro 8: italiano semplice
- Nuovo controllo `tests/leggibilita.test.mjs` con la regola `docs/regola-italiano.md`: indice Gulpease almeno 60 per il testo scritto a mano di ogni pagina e almeno 65 per i testi dei moduli `js/` (solo per testi di almeno 80 parole), nessuna frase oltre 40 parole, niente parole da ufficio («ai sensi», «istanza», «presso», «qualora»…) fuori dalle frasi tra «» e dalle lettere. Prima delle modifiche falliva tutti e tre i controlli.
- 9 pagine sotto Gulpease 60, portate sopra dividendo le frasi lunghe e mettendo gli elenchi in liste, con gli stessi fatti e le stesse cifre: `ausili/come-chiederli` (55,7 → 72,9), `cure-fuori-regione` (56,5 → 64,2), `cure-fuori-regione/estero` (56,7 → 63,4), `dentista` (56,8 → 63,1), `dentista/chi-ha-diritto` (57,3 → 62,4), `accompagnamento/requisiti` (58,6 → 62,8), `rsa` (59,3 → 62,5), `rsa/quanto-si-paga` (59,3 → 65,0), `ausili` (59,9 → 67,3).
- 13 frasi oltre 40 parole divise (permessi 104, congedo straordinario, RSA, cure all'estero, dentista, accompagnamento, assegno di inclusione anche in `js/adi.js`, contrassegno, liste d'attesa, privacy). In `dentista/chi-ha-diritto` le malattie gravi sono ora un elenco. «Permesso retribuito» e «congedo non retribuito» diventano «pagato» e «non pagato».
- Privacy: «ai sensi dell'art. 22 GDPR» → «(art. 22 GDPR)», «non producono effetti giuridici» → «non hanno effetti legali»; le due frasi sulla ricerca e sulla regione salvata nel browser divise in frasi corte.
- Verbi attivi dove chi agisce è chi legge: «va comunicato all'INPS» → «devi dirlo all'INPS» (accompagnamento, RSA, assegno di inclusione, `js/adi.js`), «va prenotata» → «prenotala» / «devi prenotare» (piano terapeutico, `js/piano.js`, ricetta elettronica), «va mandata» → «manda» (sollecito invalidità), «va controllata» → «devi controllarla» (esenzione ticket, `js/esenzione.js`), «va fatta / va usato» → «devi fare / devi usare» (bonus psicologo).

## 22/10/2026 — Audit notturno, giro 7: telefoni vecchi e reti lente
- Telefoni vecchi (`js/`): 18 «?.» e «??» e un `matchAll` in `js/common.js` fermavano tutti i moduli su iPhone con iOS 12, Safari prima della 13.1 e Chrome prima dell'80 (errore di sintassi: si vedeva solo il testo scritto). Riscritti con la sintassi di prima, con lo stesso significato («??» cambia solo null e undefined, non 0 o ''). Nuovo controllo `tests/compat.test.mjs`: il JavaScript deve partire su Safari 12 e Chrome 70, anche gli script scritti nelle pagine.
- `fonti.html`: lo script usava «await» fuori da una funzione (Safari 15, Chrome 89): ora è dentro una funzione. «Un momento…» si vede solo con JavaScript (`js-only`); senza, una frase spiega che l'elenco si vede con JavaScript attivo.
- Dati che non arrivano (`data/*.json`): 12 moduli (liste d'attesa, invalidità, ricorso, cartella, ausili, esenzione, assegno di inclusione, assistenza domiciliare, medico, cure palliative, piano terapeutico, prevenzione) toglievano la risposta scritta e lasciavano solo «Non riusciamo a caricare la pagina». Ora la risposta resta, con l'avviso sopra (`avvisoErrore()` in `js/common.js`, come in home e Numeri utili).
- Errore nello script di una pagina prima che parta: il pulsante d'inizio restava bloccato senza messaggio. Ora `js/common.js` mostra l'avviso e il contenuto scritto (classe `errore-js`).
- Reti lente: ogni pagina chiede subito tutti i suoi moduli (`<link rel="modulepreload">`, da `tools/pagine.mjs`; controllo in `tests/pagine.test.mjs`) e, se lo script non parte, la pagina si vede dopo mezzo secondo invece di 1,5 (`css/style.css`). Su un 3G lento (2 s di latenza, 50 kB/s, CPU 4 volte più lenta) la pagina delle liste d'attesa è pronta in 7,0 secondi invece di 11,6.
- Telefono in orizzontale (640x360) con il testo al 200%: il menu degli argomenti usciva dallo schermo su tutte le pagine. Ora va a capo (`css/style.css`).
- Nuovo controllo `tests/telefoni-vecchi.cjs` nella CI (senza JavaScript, senza dati, errore nello script della pagina, 640x360 al 200%) e un secondo giro di `tests/combinazioni.cjs` con il fuso orario di New York (`TZID`).

## 22/10/2026 — Audit notturno, giro 7: verifica dei fatti
- Accompagnamento (`data/rules-accompagnamento.json`, `accompagnamento/requisiti/`, `rsa/quanto-si-paga/`): con un ricovero gratuito oltre 29 giorni l'indennità non si sospende se la struttura non dà tutta l'assistenza (serve sempre un familiare o un infermiere privato): dichiarazione online all'INPS con l'attestazione della struttura. Fonte: messaggio INPS 3347 del 26/09/2023.
- Esenzione E02 ed E04 (`js/engine.js`, `data/rules-esenzione.json`, `esenzione-ticket/`): il reddito deve essere «inferiore a» 8.263,31 euro (11.362,05 con il coniuge), quindi chi ha esattamente il limite non ha l'esenzione; prima il sito diceva «fino a». Fonte: tabelle regionali delle esenzioni per reddito (Regione Piemonte, DGR del 23/03/2026; Regione Lombardia). E01 resta «non superiore» a 36.151,98.
- Verificate altre 19 affermazioni sulle fonti ufficiali (importi 2026, scadenze, PNGLA, ricetta, Fascicolo, tessera, TEAM, legge 104, strisce blu): giuste. Nuove righe in `tests/errori-noti.test.mjs`.

## 22/10/2026 — Audit notturno, giro 6: sicurezza e privacy
- `js/numeri.js`: il ritorno dopo la scelta della regione (`?torna=`) poteva portare su un altro sito con «/.//altro-sito/» (il pathname diventava «//altro-sito/»). Ora si usa l'indirizzo intero di questo sito. `tests/robustezza.cjs` prova 8 indirizzi ostili e uno buono (prima della correzione 4 uscivano dal sito).
- `tools/pagine.mjs`: lo script in testa che toglie «index.html» dall'indirizzo poteva portare su un altro sito con «//altro-sito/…/index.html». Ora l'indirizzo comincia sempre con una sola «/». Nuovo `tests/head-script.test.mjs`; pagine rigenerate.
- `tools/pagine.mjs`: ogni pagina ha `<meta name="referrer" content="strict-origin-when-cross-origin">` (anche la 404, a mano): ai siti esterni arriva solo l'indirizzo del sito. Controllo in `tests/pagine.test.mjs`.
- `js/letters.js`: «Manda per email» accetta solo indirizzi semplici (anche più d'uno, separati da virgola). Un indirizzo scritto con «?cc=», «&bcc=», «#», «%» o spazi non aggiungeva più destinatari: ora il campo «A» resta vuoto. `tests/lettere.test.mjs` prova gli attacchi e tutti gli indirizzi di `data/` (passano tutti).
- Nuovo `tests/html-esc.test.mjs`: nei JS, quello che scrive l'utente entra nell'HTML solo dentro `esc()`. Più severo del prototipo dell'audit: anche `${state.x || ''}` senza `esc()` è un errore. Nessun falso allarme sul sito di oggi.
- `privacy.html`: le parole cercate nella pagina iniziale restano nell'indirizzo («#q=», serve al tasto Indietro) e quindi nella cronologia del browser. La privacy ora lo dice; prima diceva solo «si cancella tutto». Controllo in `tests/errori-noti.test.mjs`.

## 22/10/2026 — Audit notturno, giro 6: tastiera e screen reader
- Errori dei campi (tutti i moduli con una data, un'età, un ISEE o un reddito): il messaggio si leggeva, ma nessun campo era segnato e il focus restava sul pulsante. Ora ogni errore passa da `showError()` (`js/flow.js`): il campo da correggere ha `aria-invalid="true"` e il focus, e tutti i campi hanno `aria-describedby="<modulo>-error"`. Nuova `clearError()` per il sollecito delle liste d'attesa (controllo mentre si scrive, senza spostare il cursore). Gli id degli errori di liste d'attesa e invalidità ora finiscono tutti con `-form-error`.
- Moduli: alla prima apertura la pagina metteva il focus sul titolo e tornava in cima, così il primo Tab saltava «Vai al contenuto» e `/liste-attesa/#guida` non arrivava alla guida. Ora questo succede solo quando cambia la schermata (`moveToTop()` in `js/flow.js`, anche in `js/liste-attesa.js` e `js/invalidita.js`).
- `css/style.css`: i riquadri apribili («Ti serve aiuto?», «Da dove vengono queste informazioni») hanno lo stesso contorno di 3 px degli altri elementi quando li raggiungi con Tab (`summary:focus-visible`).
- Nomi dei link: «leggi qui» nella pagina del Fascicolo (cartella clinica) ora dice «come vedere il Fascicolo di un figlio»; nelle liste d'attesa i link «Fonte» ora dicono il nome della fonte («Fonte: ASP Palermo – …»).
- Nuovi controlli in `tests/browser.cjs`: il primo Tab porta a «Vai al contenuto»; ogni elemento raggiunto con Tab ha un contorno di almeno 2 px; dopo un invio vuoto l'errore è collegato al campo, il campo ha `aria-invalid` e il focus. I percorsi nei moduli ora si provano anche come utente della Sicilia. In `tests/errori-noti.test.mjs`: link chiamati «qui», «leggi qui», «clicca qui» o «Fonte».

## 21/10/2026 — Audit notturno, giro 5: test più severi
- Audit dei mutanti: 30 errori messi apposta nel sito, `npm test` ne prendeva 4. Nuovi controlli per quelli che si riconoscono senza browser:
- Nuovo `tests/link.test.mjs`: ogni link interno delle pagine della sitemap e della 404 porta a un file che esiste.
- Nuovo `tests/citazioni.test.mjs` con l'elenco `tests/citazioni.txt` (54 citazioni «art. N | legge»): una citazione nuova o cambiata va riletta sulla fonte e aggiunta all'elenco.
- Nuovo `tests/lettere.test.mjs`: lettere con i campi vuoti senza segnaposto («[COMUNE]», «{{…}}», «XXX») né «undefined»/«null»; nessun segnaposto del genere nei js.
- `tests/cifre.test.mjs`: legge anche `<title>` e descrizioni delle pagine; una cifra torna solo con un dato della stessa unità (dal nome del campo: «_days» giorni, «_ore» ore, «isee»/«income» euro…). Trovate e dichiarate: «Circa 550 euro» nella descrizione dell'accompagnamento (551,53 arrotondato), «ricorso entro 6 mesi» nelle descrizioni dell'invalidità e della 104 (il «6 mesi» della 104 tornava solo per caso con un «6» di ore).
- `tests/provenienza.test.mjs`: ogni `data/rules*.json` ha almeno una fonte; se la nota di una scheda copia tra «…» la frase della fonte con una cifra, il dato deve stare in quella frase.
- `tests/pagine.test.mjs`: nessun elenco delle fonti vuoto; nessuna pagina della sitemap con «noindex».
- `tests/engine.test.mjs`: festivi 2026-2030 giorno per giorno contro un elenco scritto a mano (con Lunedì dell'Angelo e 4 ottobre); cartella clinica: `appeal_days` 30 e il conto del TAR (richiesta + 30 + 30).
- `tests/contatti.test.mjs`: le voci di `data/numeri.json` con url di una regione o di un'azienda sanitaria, o con il numero di un'azienda, hanno «regione».
- `tests/errori-noti.test.mjs`: «20 giorni dalla consegna» senza «Sicilia»; «in Sicilia» vicino ai «180 giorni» della ricetta (regola nazionale).
- Nuovo `tests/numeri-province.cjs` (nella CI, job «browser»): apre Numeri utili in ogni regione attiva e in ogni provincia (93), controlla errori JavaScript, «undefined», il blocco dell'azienda sanitaria e della sede INPS, niente «Sicilia» fuori dalla Sicilia, e che il pulsante «Stampa» chiami davvero la stampa. Prima un errore nella sede INPS, un numero della Regione Siciliana mostrato a tutti e un pulsante Stampa rotto passavano.
- Job «copie» della CI più severo: blocca la PR quando un numero, una PEC, un indirizzo di invio, un orario o una sede INPS nuovi o cambiati non sono nella copia della pagina ufficiale. Non bloccano i problemi già noti (nuovo `tests/copie-noti.txt`, 42 righe: pagine fatte con JavaScript, siti giù), i dati uguali a main («non di questa PR»: è cambiata la pagina di notte) e gli url nuovi (la copia arriva dopo l'unione). Opzioni nuove di `tools/confronta-copie.mjs`: `--noti`, `--base`, `--scrivi-noti`.
- `tools/confronta-copie.mjs` controlla anche gli orari HH:MM dei contatti con prova «pagina», PEC, indirizzo e orari delle sedi INPS (`inps.json`) e i numeri di `data/numeri.json`. `tools/copie.mjs` copia da ora anche le pagine delle sedi INPS delle regioni attive (cartella `inps-<regione>`) e quelle dei numeri nazionali (cartella `nazionali`); `tools/copie-se-serve.sh` rifà la copia anche quando cambia `data/numeri.json`.
- Da ricontrollare (nessun dato cambiato): l'orario del PUA di Augusta (ASP Siracusa, «martedì 15–16:30») non è nella pagina PUA del suo url, ma nella pagina del Distretto di Augusta; gli orari di screening e cartelle cliniche dell'ASP di Enna non sono nelle copie, che sono incomplete (pagine con «Mostra dettagli»).

## 21/10/2026 — Audit notturno, giro 5: scenari reali
- Ricerca (`data/moduli.json`): «mia madre esce dall ospedale», «dimessa dall ospedale», «mamma esce dall ospedale non cammina» portavano alla cartella clinica; ora il primo risultato è l'assistenza a casa (con la dimissione protetta). Nuove parole chiave: esce, uscita, uscire, dimessa, dimesso, dimissioni, ospedale, cammina.
- Ricerca: «prenotare una tac», «prenotare risonanza», «prenotare ecografia» portavano ai tempi d'attesa; ora il primo risultato è «Prenotare al CUP» (parole chiave tac, risonanza, ecografia, esame, esami, visita).
- Ricerca (`js/home.js`): i risultati dicevano sempre «ASL»; ora usano la sigla della regione scelta (ASP in Sicilia, ATS in Lombardia…).
- Ricorso invalidità (`js/ricorso.js`): con meno di 15 giorni il sito diceva «L'avvocato ha bisogno di qualche settimana», che scoraggia; ora dice «Vai oggi stesso da un patronato o da un avvocato: si può ancora depositare».
- Nuovi controlli: 6 ricerche in `tests/ricerca.test.mjs`, la sigla nei risultati in `tests/browser.cjs` (Sicilia e Lombardia, «carrozzina»), il ricorso a 0 e 9 giorni dalla scadenza in `tests/combinazioni.cjs`.
- Regioni con solo i Numeri utili (Lombardia, Toscana, Lazio…): «Fai il conto» portava subito a «Per questo argomento non abbiamo ancora i dati», anche se i giorni sono regole valide in tutta Italia. Ora liste d'attesa, cartella clinica, assistenza domiciliare, cure palliative e medico di famiglia saltano la domanda sulla provincia, fanno le domande e il conto; al posto di uffici e lettera c'è l'avviso con il link alla guida e ai Numeri utili (`js/flow.js`: `withRegion(…, next)`, `senzaUffici()`).
- Invalidità (la procedura dipende dalla provincia) e ausili (i giorni li fissa la Regione) restano senza conto fuori dalla Sicilia: il pulsante ora dice «Uffici e numeri in Lombardia» e non promette più il conto.
- Nuovo controllo in `tests/browser.cjs`: in Lombardia ogni modulo arriva alla data calcolata con l'avviso, senza lettera; in Sicilia lo stesso percorso arriva fino alla lettera. `tests/robustezza.cjs` aggiornato (medico di famiglia nel Lazio e in Lombardia va alla prima domanda).
- Chi scrive per un'altra persona (`js/common.js`, `js/letters.js`): prima la lettera chiedeva sempre la delega. Ora si sceglie il ruolo: delegato (con la delega), genitore di un minore (firma «genitore esercente la responsabilità genitoriale per il/la figlio/a minore», artt. 316 e 320 c.c., senza delega), tutore o amministratore di sostegno (firma in quel ruolo e allega la copia del decreto di nomina; il curatore non c'è perché assiste ma non firma per la persona). In `tests/citazioni.test.mjs` la fine di una voce d'elenco chiude la frase (l'art. 30 del DPCM veniva attribuito al Codice civile della voce dopo). Nell'invalidità, se la visita è per un bambino, è già scelto «genitore». Guide corrette: RSA (chi non può firmare: tutore o amministratore di sostegno), sollecito invalidità, percorso di tutela, medico di famiglia, esenzione ticket, cartella clinica. Fonti aggiunte in `data/rules*.json` (`sources`): Codice civile artt. 316, 320, 357, 404-405 e L. 6/2004, da rileggere su Normattiva (non raggiungibile da qui). Nuovi controlli in `tests/engine.test.mjs`, `tests/combinazioni.cjs` e `tests/errori-noti.test.mjs`.

## 21/10/2026 — Audit notturno, giri 3-4: moduli contro guide, lettere, dati della Sicilia
- Moduli contro guide: l'assistenza domiciliare non è «tutta gratuita» (l'aiuto dell'operatore dopo 30 giorni può avere una quota); con la classe U non si aspettano 10 giorni per sollecitare, con la B si sollecita prima della scadenza; dal privato solo se l'ASL lo scrive; reclamo per la cartella all'URP dell'ospedale; invalidità (vecchia procedura) con domanda oltre 90 giorni dal certificato: avviso che il certificato potrebbe non valere più; «PEC dell'ASL» quando l'indirizzo non è dell'URP; pannoloni; tenere l'appuntamento vecchio finché non c'è il nuovo; medico in pensione.
- Lettere viste da chi le riceve: la lettera INPS dice perché vale il termine di 15 o 30 giorni e cosa doveva concludersi; niente «termine indicato come ordinario»; la lettera per gli ausili non afferma più il silenzio-assenso (finché non si legge il D.A. siciliano 20/12/2011) ma chiede l'autorizzazione senza ulteriore ritardo; la richiesta di tutela ha nell'oggetto prestazione, numero della ricetta e classe, e le date del termine; il sollecito ha il protocollo e la richiesta dell'intramoenia con il solo ticket; la lettera per la cartella chiede la prima copia gratuita (art. 15 GDPR) e il periodo del ricovero.
- Sicilia (`data/regioni/sicilia/asp.json`, confronto con le copie delle pagine ufficiali): Agrigento richiesta via PEC del protocollo (non all'URP); PEC di Trapani protocollo@pec.asptrapani.it; Messina con il modulo dell'ASP; Siracusa servizio online e percorsoditutela@asp.sr.it; orari corretti (Siracusa esenzioni, Termini Imerese, Ragusa, Castelvetrano, Bagheria, Gela, Nicosia, URP Caltanissetta); indirizzi di Misilmeri e PTA Centro; pagine giuste per i 14 uffici protesi di Palermo.
- Nuovo `tools/confronta-copie.mjs`: confronta i numeri, le PEC e gli indirizzi delle regioni con le copie delle pagine ufficiali (job «copie» nella CI: le differenze restano verdi e vanno nel riepilogo del job; rosso solo se il programma si rompe).

## 21/10/2026 — Audit dei testi: grammatica, sigle, titoli
- Sigle spiegate nella pagina dove compaiono (PEC, ISEE, CUP, TAR, PUA, SAD) e nuovo controllo in `tests/pagine.test.mjs`.
- Guide: alla prima «azienda sanitaria (ASL)» di ogni guida «(ASL; in Sicilia si chiama ASP)», come dice il riquadro «Chi può aiutarti»; nelle pagine delle aree il riquadro ora aspetta la regione (`js/area.js`), controllo in `tests/browser.cjs`.
- «dell'ASL», «nell'ASL», «dell'USL» al posto di «della ASL»… (`data/regioni/puglia`, `sardegna`, `toscana`, `umbria`); numeri verdi scritti «800 123456» (`data/numeri.json`, `piemonte`, `emilia-romagna`); «(Punto unico di accesso)» (`lombardia`, `toscana`) e «Pap test» (`toscana`): solo testo, nessun numero cambiato.
- Titoli in `data/moduli.json` allineati all'h1 («Non ti danno…», «l'hai persa?», «puoi fare», «Hai diritto», «L'ospedale è in ritardo»).
- Frasi più semplici (invalidità, RSA, liste d'attesa, esenzione E02), link con il titolo di una pagina dentro la frase («Leggi cosa fare se …»), «circa 1.500», «Il percorso in questa guida», «a Enna», «un'équipe».
- Nuove righe in `tests/errori-noti.test.mjs` per tutti questi errori.

## 21/10/2026 — Audit notturno, giro 3: fatti nelle guide, chi non vive in Sicilia
- Fuori dalla Sicilia: «Leggi cosa vale in tutta Italia» portava alla prima schermata del modulo, che riportava al blocco (giro senza uscita in 8 moduli per 19 regioni): ora porta alla guida scritta. Per Campania, Veneto e Marche anche il link ai numeri validi in tutta Italia; titolo «Per questo argomento in Lombardia non abbiamo ancora i dati»; la home dice cosa c'è per la regione scelta; Prevenzione dà il risultato (nazionale) senza fermarsi sulla regione; le guide dicono che la lettera già scritta è per ora solo per la Sicilia.
- Alto Adige (`data/regioni/trentino-alto-adige/asl.json`): il CUPP «100 100» si chiama con il prefisso della zona (0471 Bolzano, 0472 Bressanone, 0473 Merano, 0474 Brunico); prima il pulsante «Chiama» faceva 100100 e la chiamata non partiva. `tests/contatti.test.mjs` ora accetta solo i numeri brevi nazionali.
- Guide: viaggio e alloggio per le cure di solito non si detraggono; l'accompagnamento si sospende dopo 29 giorni di ricovero gratuito (pagina RSA); tolta «nessuno può essere dimesso senza una soluzione»; l'assistenza domiciliare è gratuita per le cure sanitarie, per l'aiuto dell'operatore dopo 30 giorni può esserci una quota.

## 21/10/2026 — Audit notturno, giro 2: accessibilità, privacy e robustezza, ricerca, stampa
- Ricerca (nuovo `js/cerca.js`): risultati ordinati per pertinenza, parole corte solo intere («rsa» non trova più «persa»), parole vuote e accenti, una lettera di differenza per gli errori di battitura, parole d'emergenza verso i Numeri utili, «chiama il 112» se non trova niente, ricerca salvata nell'indirizzo. Nuove parole chiave in `data/moduli.json`. Test: `tests/ricerca.test.mjs`.
- Robustezza: `?torna=` accetta solo indirizzi di questo sito; con i cookie bloccati la regione resta nella scheda aperta; Numeri utili mostra sempre i numeri nazionali anche se un file non arriva; indirizzo con «#%» non blocca più la pagina; fonti.html e home non spariscono se manca un file. Se JavaScript non parte resta il contenuto scritto nella pagina. Test: `tests/robustezza.cjs` (anche nella CI).
- Privacy: frasi corrette sulla visita e l'ausilio scritti per la lettera, sulla ricerca senza JavaScript e su `window.name`.
- Accessibilità: pulsanti e link da toccare alti almeno 44 px, «Copiato» annunciato agli screen reader, barra di condivisione come regione della pagina, nome del sito a capo con il testo molto grande.
- Stampa: «Stampa la guida» stampa anche il titolo e la risposta (prima solo l'indice), titoli non più bianchi sul foglio, niente pulsanti stampati.
- Nuova pagina 404 in italiano; titolo della home più chiaro; il documento di identità scritto nei moduli ora compare nelle lettere; «ad Agrigento».

## 21/10/2026 — Audit notturno, giro 1: leggi, lettere e calcoli, dati regionali
- Codici di esenzione per invalidità corretti (`data/rules-esenzione.json`): C01 100% senza accompagnamento, C02 100% con accompagnamento, C03 67-99%, C04 minori con indennità di frequenza, C05 ciechi, C06 sordi (prima C02 e C03 erano sbagliati). Fonte: Garante disabili Regione Campania.
- Strisce blu: dal 14/12/2024 (L. 177/2024, art. 188 c. 3-bis CdS) sosta gratis con il contrassegno senza la condizione dei posti riservati occupati.
- Legge 104 (`data/rules-legge-104.json`): part-time orizzontale con i 3 giorni interi (circolare INPS 45/2021); prolungamento del congedo parentale entro i 12 anni del figlio, 2 ore al giorno fino ai 3 anni. Campi nuovi al posto di `prolungamento_figlio_anni`.
- Accompagnamento (`data/rules-accompagnamento.json`): tolta la «rivalutazione dell'1,4%» (è la perequazione delle pensioni); importo 2026 dal messaggio INPS 628/2026.
- Riforma della disabilità: messaggi INPS 635 e 637 del 23/02/2026 (non 639) in `data/regioni/sicilia/inps.json`. Citazioni dei decreti-legge al posto delle leggi di conversione (D.L. 4/2006 art. 6 c. 3-bis; D.L. 347/2001 art. 8). Bonus psicologo: DM 24/11/2023.
- Ricorso invalidità: se i 6 mesi finiscono di sabato, domenica o in un festivo, il termine slitta al primo giorno lavorativo (art. 155 c.p.c.). Date del 01/01/1970 di nuovo mostrate nelle lettere. Il sollecito INPS della vecchia procedura non cita più una «normativa vigente» per i 30 giorni, che sono indicativi.
- Lazio, URP ASL Roma 4 (`data/regioni/lazio/asl.json`): orario dalla pagina URP (dal lunedì al venerdì), l'avviso aveva un refuso.
- Nuove regole in `tests/errori-noti.test.mjs` (ora guarda anche i dati regionali) e test sulle date e sulle scadenze in `tests/engine.test.mjs` e `tests/combinazioni.cjs`.

## 21/10/2026 — Rilettura completa del sito e nuovi controlli automatici
- Citazioni di legge corrette: L. 24/2017 art. 4 comma 2 (documentazione sanitaria, anche nella lettera e in `data/rules-cartella.json`); DPCM 12/01/2017 allegato 12 per gli ausili (anche nella lettera di sollecito); artt. 24, 25 e 26 per consultori e salute mentale; allegato 4C per il dentista (`data/rules-dentista.json`).
- Legge 104: parenti fino al secondo grado, terzo grado solo nei casi dell'art. 33 c. 3 (`data/rules-legge-104.json`); le 2 ore al giorno solo per il lavoratore disabile; il congedo fino a 24 mesi della L. 106/2025 non è «dal 2026» (lo sono le 10 ore). Tolto il tetto 2025 del congedo straordinario.
- RSA: per l'ISEE contano anche i figli fuori casa (componente aggiuntiva); la parte alberghiera la paga la persona ricoverata.
- Contraddizioni tolte: cure all'estero (autorizzazione solo per ricoveri e cure costose), pediatra «sotto i 6 anni», avvisi «numeri da raccogliere» mostrati solo se mancano, nota PEC INPS solo se non verificata, Fascicolo dei figli che dipende dalla Regione, Siracusa e Trapani in `data/regioni/sicilia/asp.json`.
- Testi: «È passato 1 giorno», «l'ASL», niente «circa» con i centesimi, tessera europea valida anche nel Regno Unito, limitazioni della scelta del medico attribuite a Trapani e Palermo.
- «Da dove prendiamo le informazioni»: le leggi di tutti i moduli.
- Nuovi controlli (docs/protocollo-test.md): `tests/nazionale.test.mjs`, `tests/errori-noti.test.mjs`, `tests/browser.cjs`; la CI ora prova il sito anche nel browser (con `tests/combinazioni.cjs`). Nuovi CLAUDE.md e modello per le pull request.

## 21/10/2026 — Controllate quattro regole: ausili, esenzione, ricetta, screening
- Ausili (`data/rules-ausili.json`, pagine `ausili/`, lettera di sollecito): il DPCM 12/01/2017 (art. 18) lascia alle Regioni il tempo per l'autorizzazione; i 20 giorni con silenzio-assenso (e il collaudo entro 20 giorni) ora sono indicati come regola della Sicilia (D.A. 20/12/2011 sul DM 332/1999). La lettera non attribuisce più i 20 giorni al DPCM. Fonte aggiunta: procedure dell'ASP Catania. Il testo del D.A. resta da leggere (DA-VERIFICARE-A-MANO.md).
- Esenzione ticket per reddito: la scadenza del 31 marzo dell'anno dopo vale in tutta Italia (la scrivono ASL di regioni diverse), con proroghe decise da alcune Regioni. Fonti aggiunte: AUSL Piacenza, ASL Città di Torino.
- Ricetta per visite ed esami: 180 giorni per prenotare, regola nazionale per le ricette dal 30/12/2024 (Gazzetta Ufficiale), salvo tempi più brevi della Regione; prima la pagina diceva «di solito fino a un anno». Nuovo campo `prescription_specialist_days` in `data/rules-fascicolo-e-ricetta.json`.
- Screening: le età (mammografia 50-69, Pap test 25-29, HPV 30-64, colon 50-69) sono quelle nazionali dei LEA; alcune Regioni le allargano. Fonte aggiunta: ISS EpiCentro.
- Tutte controllate con la ricerca web (estratti), perché da qui i siti italiani non si aprono.

## 21/10/2026 — Il sito parla a tutta Italia, non solo alla Sicilia
- Guide: titoli, descrizioni e introduzioni valide in tutta Italia; «ASP» usato come nome generico diventa «ASL». Le cose solo siciliane (SovraCUP, ASPConTe, delibere della Regione, uffici delle ASP) restano, segnate «In Sicilia».
- Chi sceglie una regione vede la sigla giusta (ASL, ATS, USL…) e «nel Lazio», «nelle Marche»; chi non ha ancora scelto vede testi generici.
- Numeri utili: il numero verde della Regione Siciliana, SovraCUP e l'avviso sul 116117 in Sicilia si vedono solo a chi ha scelto la Sicilia.
- «Da dove prendiamo le informazioni»: le fonti di tutte le regioni attive.
- Caricando una pagina non si vedono più per un attimo le emoji e la pagina senza banda colorata.
- «Cambia regione» dalla home: scelta la regione si torna alla home, non si resta in Numeri utili.

## 21/10/2026 — Sardegna: i numeri utili delle 8 ASL
- 73 numeri delle ASL (centralino, URP, CUP, PUA), controllati nelle copie delle pagine ufficiali del 21/10/2026.
- Guardia medica: 116117 in 6 ASL su 8; per Medio Campidano e Cagliari le pagine non sono d'accordo e per ora non c'è un numero. CUP regionale 1533 da fisso.
- Sedi INPS delle 8 zone.

## 21/10/2026 — Umbria: i numeri utili di Perugia e Terni
- 71 numeri delle USL Umbria 1 e 2, controllati nelle copie delle pagine ufficiali del 21/10/2026.
- Guardia medica: i numeri delle zone (il 116117 vale solo nel Perugino); CUP regionale NUS 800 636363.
- Sedi INPS di Perugia e Terni.

## 21/10/2026 — Abruzzo: i numeri utili delle 4 province
- 40 numeri delle ASL, controllati nelle copie delle pagine ufficiali del 21/10/2026.
- Guardia medica: 116117 in tutto l'Abruzzo; CUP unico 800 827827 (da cellulare 0872 226).
- Sedi INPS delle 4 province.

## 21/10/2026 — Friuli-Venezia Giulia: i numeri utili delle 4 province
- 42 numeri di ASUGI, ASUFC e ASFO, controllati nelle copie delle pagine ufficiali del 21/10/2026.
- Guardia medica: 116117 in tutta la regione; Call center unico salute e sociale 0434 223522.
- Sedi INPS delle 4 province.

## 21/10/2026 — Basilicata: i numeri utili di Potenza e Matera
- 19 numeri dell'ASP e dell'ASM, controllati nelle copie delle pagine ufficiali del 21/10/2026.
- Guardia medica: 116117 in tutta la regione; CUP regionale 800 814814.
- Sedi INPS di Potenza e Matera.

## 21/10/2026 — Molise: i numeri utili di Campobasso e Isernia
- 34 numeri dell'ASReM (CUP-PASS, PUA, scelta del medico, URP), controllati nelle copie delle pagine ufficiali del 21/10/2026.
- Guardia medica: 116117 in tutto il Molise dal 06/10/2026; Call Center Sanitario 800 639595 (da cellulare 0875 752626).
- Sedi INPS di Campobasso e Isernia.

## 21/10/2026 — Trentino-Alto Adige: i numeri utili di Trento e Bolzano
- 24 numeri di Asuit (Trento, ex APSS) e dell'Azienda sanitaria dell'Alto Adige, controllati nelle copie delle pagine ufficiali del 21/10/2026.
- Trento: 116117 per la guardia medica, CUP 0461 379400, i PUA delle sedi. Bolzano: per ora solo il CUPP 100100 e pochi altri numeri (le pagine dell'azienda non si sono lasciate copiare).
- Sedi INPS di Trento e Bolzano.

## 21/10/2026 — Calabria: i numeri utili delle 5 province
- 31 numeri delle ASP, controllati nelle copie delle pagine ufficiali del 21/10/2026.
- Guardia medica: 116117 in tutta la regione (dal 28/07/2026); CUP regionale 0961 789789.
- Vibo Valentia: per ora solo centralino e 116117 (il sito dell'ASP non si è lasciato copiare).
- Sedi INPS delle 5 province.

## 21/10/2026 — Liguria: i numeri utili delle 4 province
- 47 numeri di ATS Liguria (le ex ASL sono ora aree sociosanitarie), controllati nelle copie delle pagine ufficiali del 21/10/2026.
- Prenotazioni: CUP Liguria 010 5383400. Guardia medica: 116117 solo nel Tigullio, numeri locali nelle altre aree.
- Il nome dell'azienda sanitaria in Liguria ora è ATS.
- Sedi INPS delle 4 province.

## 21/10/2026 — Valle d'Aosta: i numeri utili
- 13 numeri dell'Azienda USL (centralino, CUP, URP, sportelli di scelta del medico), controllati nelle copie delle pagine ufficiali del 21/10/2026.
- Guardia medica: in Valle d'Aosta si chiama il 112.
- Sede INPS di Aosta.

## 21/10/2026 — Piemonte: i numeri utili delle 8 province
- 108 numeri delle ASL (le quattro di Torino insieme nella provincia di Torino, CN1 e CN2 a Cuneo), controllati nelle copie delle pagine ufficiali del 21/10/2026.
- Guardia medica: 116117 in tutta la regione; prenotazioni al CUP Piemonte 800 000 500.
- Verbano-Cusio-Ossola: per ora solo 116117 e CUP Piemonte (il sito dell'ASL non si è lasciato copiare).
- Sedi INPS delle 8 province.

## 21/10/2026 — Puglia: i numeri utili delle 6 province
- 49 numeri delle ASL (CUP, URP, screening, cure a casa), controllati nelle copie delle pagine ufficiali del 21/10/2026.
- Guardia medica: i numeri locali di Lecce, Taranto e BT, perché il 116117 è autorizzato ma non ancora attivo.
- Sedi INPS delle 6 province.

## 21/10/2026 — Emilia-Romagna: i numeri utili delle 9 province
- 75 numeri delle AUSL (Bologna e Imola insieme nella provincia di Bologna, la Romagna per ambito), controllati nelle copie delle pagine ufficiali del 21/10/2026.
- Guardia medica: i numeri delle aziende, perché il 116117 non è ancora attivo; CUP telefonico di ogni AUSL; numero verde regionale 800 033033 per le informazioni.
- Sedi INPS delle 9 province.

## 21/10/2026 — Toscana: i numeri utili delle 10 province
- Nuovo `data/regioni/toscana/asl.json`: 76 numeri delle 3 aziende USL (numeri unici aziendali con i tasti per CUP, URP, screening, scelta del medico; centralini degli ospedali; sportelli URP; PUA dei capoluoghi di Arezzo, Siena e Grosseto). Fonte: pagine ufficiali delle USL e della Regione Toscana copiate dal server in Italia il 21/10/2026; ogni numero ritrovato nella copia della pagina citata (`proof: "pagina"`).
- Guardia medica: 116117 in tutta la Toscana (pagina della Regione aggiornata al 05/02/2026).
- Nuovo `data/regioni/toscana/inps.json`: indirizzo e PEC delle 10 sedi INPS. Toscana attiva solo per Numeri utili.
- Cosa manca (nei `todo`): PUA della Nord Ovest e di Prato e Pistoia.

## 21/10/2026 — Lazio: i numeri utili delle 5 province
- Nuovo `data/regioni/lazio/asl.json`: 92 numeri delle ASL (centralini, URP, PUA e cure a casa, CUP e scelta del medico dove ci sono), una voce per provincia (Roma con le 6 ASL). Fonte: pagine ufficiali di ASL e Regione Lazio copiate dal server in Italia il 21/10/2026; ogni numero ritrovato nella copia della pagina citata (`proof: "pagina"`).
- Numeri regionali: 116117 per guardia medica e consigli non urgenti, attivo in tutto il Lazio dal 24/08/2026 (Salute Lazio), e ReCUP 06 9939 (pagina della Regione aggiornata al 12/08/2021: orari da confermare). A Grotte di Castro, Proceno, Onano e San Lorenzo Nuovo la guardia medica è ancora al 06 55525592 (pagina dell'ASL di Viterbo, 01/09/2026).
- Nuovo `data/regioni/lazio/inps.json`: indirizzo e PEC delle 5 sedi INPS. Lazio attivo solo per Numeri utili.
- Indice delle regioni: campo `in` per dire «nel Lazio», «nel Veneto», «nelle Marche».

## 21/10/2026 — Lombardia: i numeri utili delle 12 province
- Nuovo `data/regioni/lombardia/asl.json`: 191 numeri di ATS e ASST (centralini, URP, PUA e cure a casa, cartelle cliniche, screening, protesica dove c'è), uno per provincia. Fonte: le pagine ufficiali di ATS, ASST e Regione Lombardia copiate dal server in Italia il 21/10/2026; ogni numero è stato ritrovato nella copia della pagina citata (`proof: "pagina"`).
- Numeri regionali in tutte le province: guardia medica 116117 (feriali 20–8, festivi e prefestivi 24 ore su 24) e prenotazioni 800 638638 da fisso o 02 999599 da cellulare (dal lunedì al sabato 8–20), dalle pagine di Regione Lombardia.
- Nuovo `data/regioni/lombardia/inps.json`: indirizzo e PEC delle 12 sedi INPS provinciali (pagine «sedi» di inps.it). Il campo della riforma della disabilità è da verificare: il modulo invalidità per la Lombardia resta spento.
- `data/regioni/index.json`: Lombardia attiva solo per Numeri utili (`moduli`). Da ora chi apre un modulo sceglie prima la regione; in home «Scegli la tua regione».
- Cosa manca (nei `todo`): quasi nessuna ASST ha un CUP telefonico proprio (si prenota al numero regionale); mancano alcuni PUA (Ovest Milanese, Lodi, Garda, Franciacorta, Lecco, Bergamo Est, Insubria) e l'URP dell'ASST della Brianza.

## 21/10/2026 — copia delle pagine ufficiali a richiesta (nessun dato cambiato)
- `tools/copie-se-serve.sh`: sul server gira ogni 15 minuti e rifà la copia delle pagine ufficiali appena in `main` cambiano i dati o gli indirizzi delle regioni, senza aspettare la notte. `tools/copie-richiesta.txt` serve a forzare una copia. Da installare una volta sul server (`docs/regioni.md`, sezione 8).

## 21/10/2026 — indirizzi ufficiali di tutte le regioni da copiare (nessun dato cambiato)
- `data/regioni/<regione>/fonti.json` per le 18 regioni che mancavano (Abruzzo, Basilicata, Calabria, Campania, Emilia-Romagna, Friuli-Venezia Giulia, Lazio, Liguria, Marche, Molise, Piemonte, Puglia, Sardegna, Toscana, Trentino-Alto Adige, Umbria, Valle d'Aosta, Veneto): 1.331 indirizzi di Regioni, aziende sanitarie e sedi INPS, trovati con il motore di ricerca. Nessun numero: il server in Italia copia le pagine e i numeri si scrivono leggendo le copie.
- Da ricordare: in Liguria dal 2026 c'è un'azienda unica (ATS Liguria); in Trentino l'APSS è diventata Asuit; in Alto Adige il sito è passato ad asdaa.it.

## 21/10/2026 — testi dei moduli per tutte le regioni (nessun dato cambiato)
- Nei moduli «ASP» diventa la sigla della regione scelta (ASP, ATS, ASL…), anche nell'avviso «Controlla sempre con la tua …» e nell'intestazione delle lettere.
- Le cose solo siciliane passano nell'indice delle regioni (`data/regioni/index.json`: `ente`, `asl_intestazione`, `link`): Fascicolo sanitario della Regione Siciliana, URP dell'assessorato, elenco per il trasporto dei dializzati. Nelle altre regioni compare una frase generica; l'elenco dei grandi ospedali siciliani si vede solo in Sicilia.
- Per la Sicilia i testi restano identici: confrontate 132 schermate prima e dopo.

## 21/10/2026 — passo 3 delle regioni: il codice per più regioni (nessun dato cambiato)
- Si può scegliere anche una regione non ancora attiva: al posto della provincia c'è «La tua regione non c'è ancora», con la parte valida in tutta Italia e l'invito a scriverci.
- Numeri utili funziona con più regioni: titoli con il nome della regione e la sigla dell'azienda sanitaria (ASP, ATS, ASL…), cambio di regione senza ricaricare la pagina, `numeri-utili/#regione` apre la scelta. In home, con più regioni, si vede quale si sta guardando.
- `loadRegional(root, 'asl')` prende il nome del file dall'indice; `tests/contatti.test.mjs` controlla tutte le regioni attive.
- Con la sola Sicilia attiva il sito resta uguale.

## 21/10/2026 — tolte le classi della vecchia lettura ad alta voce (nessun dato cambiato)
- Tolte le classi `say` e `no-say` (597 in 105 file): servivano solo al pulsante «Ascolta», tolto prima. Le pagine si vedono come prima.

## 21/10/2026 — tolto il pulsante «Ascolta» (nessun dato cambiato)
- Il pulsante «🔊 Ascolta» (lettura ad alta voce con la voce del telefono) non c'è più in nessuna pagina: tolti il codice in `js/common.js`, i pulsanti in home, aree, moduli, guide e Numeri utili, gli stili e le prove in `tests/`.
- `privacy.html` e `README.md` non parlano più di «Ascolta».

## 21/10/2026 — testata più semplice sul telefono (nessun dato cambiato)
- Sul telefono (schermi sotto 640 px) la testata ha solo logo e ricerca: tolta la riga con i 5 argomenti. Agli argomenti si arriva dai riquadri della home e dal link «‹ …» in cima a ogni pagina. Sul PC il menu resta com'era.

## 21/10/2026 — scelta della regione nei moduli (nessun dato cambiato)
- Passo 2 di `docs/regioni.md`: `regione()` legge la regione salvata nel browser (`localStorage`, chiave `gs-regione`), `setRegione(id)` la salva; schermata «In quale regione abiti?» prima della provincia e link «Cambia regione» (`js/flow.js`, anche in Numeri utili).
- Con una sola regione attiva (oggi la Sicilia) la schermata e il link non compaiono: il sito è uguale a prima.
- `privacy.html`: il sito ricorda nel browser solo la regione scelta, nessun dato sanitario; si cancella svuotando i dati del sito.

## 21/10/2026 — copie notturne delle pagine ufficiali e controllo settimanale assistito
- Server in Italia (Aruba Cloud) che ogni notte salva in testo le pagine ufficiali delle ASP nel branch `copie-siti` (`tools/copie.mjs`); routine settimanale di Claude che le confronta con i dati e apre una pull request. Nessun dato cambiato. Come funziona: `docs/regioni.md`, sezione 8.
- Test del 21/10/2026 dal server: 110 pagine su 134 rispondono; Messina ha il certificato installato male (si legge lo stesso), i vecchi indirizzi `dinamica.aspx` di Caltanissetta non esistono più (sito nuovo), una pagina di Siracusa dà 404: da aggiornare.
- `SPEC.md`: principio 5 riscritto (mai CUP, login o CAPTCHA; pagine informative sì, con educazione).

## 19/10/2026 — primo passo verso tutte le regioni (nessun dato cambiato)
- Proposta completa in `docs/regioni.md`: struttura dei dati per regione, scelta della regione ricordata nel browser, testi nazionali e regionali, indirizzi delle pagine, marchio.
- `data/asp-sicilia.json` → `data/regioni/sicilia/asp.json`, `data/inps-sicilia.json` → `data/regioni/sicilia/inps.json`; nuovo `data/regioni/index.json` con l'elenco delle regioni (attiva solo la Sicilia).
- `js/common.js`: `loadRegional(root, nome)` carica i file della regione in uso; i moduli non scrivono più «sicilia» nei percorsi.
- Marchio: «Guida Sanità» senza «Sicilia» in testata, anteprima dei messaggi (`og:site_name`) e riga stampata. «Sicilia» resta nei testi che parlano della regione.

## 20/10/2026 — temi nuovi: controllo sulle fonti ufficiali
- Fonti lette per intero dal browser: scheda INPS accompagnamento (aggiornata al 20/07/2026), schede INPS permessi 104 (50098) e congedo straordinario (50097), scheda INPS bonus psicologo, L. 106/2025 artt. 1–3 (Normattiva), D.L. 73/2024 art. 3 (Normattiva), DPR 495/1992 art. 381 (Normattiva), FAQ TEAM del Sistema TS, FAQ FSE della Regione Siciliana (27/05/2026), modulo 2025 del Comune di Palermo.
- **Accompagnamento**: importo 2026 scritto per esteso (551,53 €); sospensione per ricovero gratuito oltre 29 giorni (non «un mese»); permesso di soggiorno di almeno un anno (non «di lungo periodo»); INPS chiude la pratica entro 45 giorni dalla domanda di pagamento (tolto «1–2 mesi»).
- **Legge 104**: la L. 106/2025 (10 ore l'anno, congedo non retribuito fino a 24 mesi) vale per i lavoratori con malattie oncologiche, invalidanti o croniche con invalidità dal 74%, non per chi assiste con la 104: corrette le tre pagine. Familiari fino al terzo grado; 2 ore al giorno solo con orario di almeno 6 ore (1 ora altrimenti); i 30 giorni sono il termine dell'INPS, non del datore di lavoro.
- **Fascicolo**: in Sicilia la delega per un adulto non è ancora attiva (arriverà con il sistema nazionale); per i minori serve il modulo al pediatra o all'ASP; consenso nella sezione «Privacy» o con modulo al medico; tolto il «modulo per segnalare un documento mancante».
- **Contrassegno**: a Palermo la domanda va alla Circoscrizione (5 euro di istruttoria), non alla Polizia municipale; tolta la marca da bollo; ZTL di Palermo: email entro 15 giorni. Art. 381: 5 anni e rinnovo con il medico curante confermati sul testo.
- **Tessera**: duplicato anche in PDF dal Sistema TS; chiedere il duplicato disattiva la tessera vecchia; in Svizzera e Francia si paga e si chiede il rimborso; i 6 mesi del certificato sostitutivo restano da confermare.
- **Bonus psicologo**: prima seduta entro 60 giorni dall'accoglimento. **Dentista**: ortodonzia solo per minori in condizione di vulnerabilità. **CUP**: disdetta e ticket per chi non si presenta confermati sul testo del D.L. 73/2024.
- Cosa resta aperto: `DA-VERIFICARE-A-MANO.md`, sezione 0.

## 20/10/2026 — dieci temi nuovi e la quinta area «Tessera e ricette»
- Fonti: ricerca web del 20/10/2026 su siti ufficiali e di informazione (dettagli e punti aperti in `DA-VERIFICARE-A-MANO.md`, sezione «Temi nuovi»); i file `data/rules-*.json` dei temi nuovi hanno solo le fonti, nessuna cifra usata dai calcoli.
- Nuova area `tessera-e-ricette/` con: tessera sanitaria (rinnovo, duplicato, TEAM), fascicolo sanitario e ricetta elettronica, prenotare e disdire al CUP.
- In Invalidità: legge 104 (come si ottiene, permessi, congedo straordinario), indennità di accompagnamento (requisiti, domanda e AP70), contrassegno disabili (come si chiede, cosa permette).
- In Visite ed esami: curarsi fuori dalla Sicilia e all'estero, il dentista nel Servizio sanitario, psicologo e salute mentale (servizi dell'ASP, bonus psicologo). In Aiuto a casa: la RSA (come si entra, chi paga).
- Sono moduli «solo testo» (`static` in `moduli.json`): risposta in cima e pagine corte, senza percorso a domande. L'elenco della home senza JavaScript ora lo crea `pagine.mjs` (blocco `home-elenco`). Il test sull'avviso finale usa `js/controlla.js`.

## 20/10/2026 — controllo totale dopo il rifacimento: tre cose rimesse a posto
- Nessun dato cambiato. Controllo di cifre, testi, link e funzioni delle 59 pagine rispetto alla versione prima delle pagine corte: nessuna cifra e nessun testo perso (le «Domande frequenti» vivono dentro le pagine).
- Le 38 pagine corte caricano ora `js/guida.js` al posto del solo `js/common.js`: tornano «Questa pagina ti è stata utile?», il conteggio anonimo della visita e il pulsante «🔊 Ascolta», che legge tutta la guida (titoli, paragrafi ed elenchi; non l'indice né le fonti).
- Il pulsante che avvia il percorso a domande è scritto nell'HTML con `disabled` e si sblocca quando il modulo ha caricato i dati (`enableStart` in `js/common.js`, chiamata da `js/flow.js`, `js/invalidita.js`, `js/liste-attesa.js`). Prima un tocco arrivato sulla connessione lenta andava perso o dava errore (`rules` non ancora caricato).
- La ricerca nella home trova anche le pagine corte, per titolo (es. «pediatra» → «Pediatra o medico di base: dipende dall'età»); le parole lunghe si confrontano senza l'ultima lettera («rinnovo» trova «rinnova»).
- `tools/pagine.mjs`: tolto il generatore dei dati FAQPage, senza uso da quando le «Domande frequenti» sono titoli dentro le pagine; il test ora controlla solo che non restino dati FAQPage.
- `tests/combinazioni.cjs` cercava ancora il vecchio pulsante «Comincia» e andava in timeout su tutti i 1903 casi: ora preme il pulsante di avvio della risposta scritta. Il controllo sul numero CUP di Catania nella prevenzione guarda il numero (800 954414), non le parole «tasto 2», che compaiono anche nello screening di Siracusa.

## 20/10/2026 — regola per le cifre di legge: coerenza e provenienza
- Nuovo test `tests/cifre.test.mjs`: ogni cifra scritta nella guida o nel js di un modulo deve essere uguale a quella in `data/`; esempi e arrotondamenti sono dichiarati nel test. Nessun valore cambiato. Regola: [docs/regola-cifre.md](docs/regola-cifre.md).
- In ogni `data/rules*.json` il blocco `provenienza`: per ogni cifra la pagina ufficiale, la data del controllo, la prova (`testo` / `estratto` / `secondaria` / `sito`) e la data di ricontrollo `review_by`. Nuovo test `tests/provenienza.test.mjs`: fallisce se manca la scheda o se `review_by` è passata (si prova con `OGGI=2027-02-01 npm test`). Le prove sono `estratto` quasi ovunque: i testi ufficiali vanno riletti per intero.
- Nuovi campi che prima erano solo nel testo delle guide, valori invariati: `age_limits` (esenzione: 6, 65, 60 anni), `household_min_age` 60 e `elderly_age` 67 (assegno di inclusione), `detrazione` 19% e 129,11 € (assistenza domiciliare), `minor_age` 18 (invalidità), `every_years` 10 (antitetanica).
- `tools/pagine.mjs --controlla` non segnala più come «non aggiornate» le pagine salvate da git con fine riga Windows.

## 20/10/2026 — tutte le guide: prima la risposta, poi pagine corte
- Nessun dato cambiato. Tutti i 12 moduli hanno ora la stessa impostazione dell'esenzione ticket: in cima la risposta scritta (leggibile anche senza JavaScript), il percorso a domande parte da un pulsante e torna alla risposta con «Ricomincia», la guida lunga è divisa in 2–4 pagine corte con l'indice «In questa guida».
- Pagine nuove: liste-attesa (3), medico-famiglia (4), cartella-clinica (3), piano-terapeutico (3), prevenzione (2), invalidita (3), ricorso-invalidita (3), assegno-inclusione (3), assistenza-domiciliare (4, compresi i consigli pratici), ausili (3), cure-palliative (3). Sitemap: 59 pagine.
- Le «Domande frequenti» sono diventate titoli dentro le pagine: niente più FAQPage nei moduli. I testi delle guide sono gli stessi di prima, riordinati per domanda; frasi nuove solo per legare le pagine.

## 20/10/2026 — esenzione ticket: la guida diventa 4 pagine corte (modello NHS.uk)
- Nessun dato cambiato. La guida lunga sotto la risposta è divisa in pagine che rispondono a una domanda ciascuna: `chi-ha-diritto/`, `come-chiedere/`, `rinnovo/`, `altre-esenzioni/`. Nella pagina principale resta la risposta, il calcolo e l'indice «In questa guida».
- Le «Domande frequenti» sono diventate titoli e punti dentro le pagine (niente FAQPage per questo modulo).
- `tools/pagine.mjs`: un modulo può avere `pages` in `data/moduli.json`; il blocco `guida-indice` crea l'elenco delle pagine; sitemap, testata e percorso «Sei qui» anche per le pagine corte.

## 19/10/2026 — numeri e link riletti da una connessione italiana
- Fonte: le pagine ufficiali delle ASP (e degli ospedali), aperte oggi da una connessione italiana. Ogni numero confermato ha ora la pagina esatta in `url` e `proof: "pagina"`.
- Tre ASP hanno un sito nuovo nel 2026 e i vecchi indirizzi non funzionano più: **Caltanissetta** (www.asp.cl.it/it), **Enna** (dal 01/03/2026: le vecchie pagine dicono «Pagina non trovata») e **Messina** (le vecchie pagine `?page_id=` mostrano la home; il vecchio sito resta su old.asp.messina.it). Tutti i link sostituiti.
- Numeri cambiati:
  - Ragusa: URP 0932 234203 → **0932 234204** (trasferito all'ex Ospedale Civile, avviso 27/04/2026); protesi Ragusa 0932 234756 (è la ventiloterapia) → **0932 234759**; anagrafe Modica 448732 → **0932 448710** (via V. Veneto 10); anagrafe Vittoria 999615 → **0932 999713**, nuova sede via Generale Cascino dal 27/07/2026.
  - Caltanissetta: guardia medica sede 1 0934 506580 → **0934 597332** (tabella guardie mediche); protesi Mussomeli 0934 506479 (è l'ufficio presidi per diabete e celiachia) → **0934 506487**.
  - Messina: PUA 090 3653510 (vecchia sede di via Saffi) → **090 3653440**, Casa della Comunità di via del Vespro 14.
  - Siracusa: centro screening 0931 484332 → **0931 312525 tasto 2**, nuova sede ex ONP padiglione 4 dal 18/03/2026; cartelle Umberto I 0931 724043 → **0931 724264**; protesi Siracusa 0931 484373 → **0931 484611** (Medicina Riabilitativa, ex ONP); presidi Augusta 0931 989363 → **0931 989373**.
  - Enna: anagrafe Enna 0935 520568 → **0935 520489** (guida del distretto); protesi Regalbuto 0935 911137 (è l'esenzione ticket) → **0935 911129**; protesi Nicosia 0935 671627 → **0935 671661**; protesi Piazza Armerina 0935 981812 → **0935 981781** (pagina del 04/06/2026); guardia medica di Enna stesso numero ma sede tornata all'ex INAM, via Calascibetta 1 (dal 30/01/2026); orari del CUP 8:15–17.
  - Catania: protesi Caltagirone 0933 353035 → **0933 353036**.
  - Palermo: cartelle Ospedale Cervello 091 6802080 → **091 7802080**.
- Numeri tolti (su nessuna pagina ufficiale, o non dell'ufficio indicato): Siracusa URP 0931 744310, 0931 484387 e 0931 890527 (numeri generali dei distretti), Lentini 095 909922; Catania guardia medica 095 2545811 (sostituito dai numeri dei presidi di Catania).
- Orari e indirizzi aggiornati dove la pagina ufficiale li dà diversi (es. screening Ragusa 8:30–12:30, pannoloni Catania lun/mer/ven, URP Catania).
- Aggiunti numeri ufficiali che mancavano: sportelli scelta e revoca (Catania via La Marmora, Messina e provincia, San Cataldo, Mussomeli, Melilli), guardie mediche di Catania, Messina e Augusta, uffici protesi della provincia di Messina e della Medicina Riabilitativa di Siracusa, cartelle cliniche di Villa Sofia, CTO, Lentini, Avola, Augusta e Noto, centralini degli ospedali di Ragusa, Modica e Vittoria, e altri.
- Cambio del medico online: ora c'è anche a Caltanissetta, Siracusa e Palermo (SPID o CIE); Messina solo dal lunedì al venerdì 8–20. Testi `scelta_medico` corretti.
- Restano solo da estratto (da confermare per telefono): i 4 PUA di Ragusa (solo giornale del 2019), il centralino di Caltanissetta, le cartelle dell'Ospedale Civico di Palermo. Dubbi nuovi nei `todo` delle ASP («Verifica 19/10/2026»).
- `tools/controllo.mjs`: il controllo dei link riconosce anche le pagine che rispondono ma sono sbagliate («Pagina non trovata», rimando alla home, home mostrata al posto della pagina).

## 19/10/2026 — esenzione ticket: esperimento «prima la risposta»
- Nessun dato cambiato. La pagina mostra subito la risposta scritta (i 4 casi E01–E04 con i limiti, come si ottiene, le altre esenzioni); il calcolo a domande parte dal pulsante «Fai il conto» e con «Ricomincia» torna alla risposta.
- Serve a confrontare le due impostazioni (risposta subito / percorso subito) sul telefono prima di decidere per tutte le pagine. Vedi `docs/ricerche-frequenti.md`.

## 19/10/2026 — parole cercate su Google (medico di base, CUP, rinnovo esenzione, legge 104)
- Fonte: Google Trends, Sicilia, ultimi 12 mesi (dettagli in `docs/ricerche-frequenti.md`); ASPConTe dell'ASP Catania già in `asp-sicilia.json` (nota del 18/10/2026) e notizie di LiveUniversity Catania (13/05/2025, 17/04/2025).
- `moduli.json`: titolo «medico di base» al posto di «medico di famiglia»; parole per la ricerca interna (medico di base, deroga, SovraCUP, ASPConTe, over 65, rinnovo, delega, fascicolo sanitario, contrassegno).
- Medico: «medico di base» in titolo e testo, «scelta in deroga», cambio online con ASPConTe a Catania, 2 domande frequenti nuove.
- Liste d'attesa: «prenotazione al CUP / SovraCUP» in titolo e testo, ASPConTe a Catania, domanda frequente sulla prima data offerta.
- Esenzione ticket: «over 65» e «rinnovo» nel titolo, come controllare il rinnovo dopo il 31 marzo, delega per un familiare, ASPConTe.
- Invalidità: invalidità, legge 104, accompagnamento e contrassegno sono riconoscimenti diversi; nuova domanda frequente.

## 19/10/2026 — piano terapeutico: distribuzione diretta e DPC
- Fonti: Regione Siciliana, pagina DPC (https://www.regione.sicilia.it/istituzioni/regione/strutture-regionali/assessorato-salute/dipartimento-pianificazione-strategica/dpc) e accordo approvato con D.A. n. 367 del 03/04/2025; AIFA (L. 405/2001, art. 8); decalogo DPC dell'ASP Enna con Federfarma (2022: consegna in 24 ore lavorative, ticket fisso per chi non è esente).
- Nuovo passo «Dove prendi la medicina» (farmacia dell'ASP o farmacia «per conto» dell'ASP) e nuova domanda frequente.

## 19/10/2026 — cartella clinica: Fascicolo Sanitario e prima copia gratis
- Fonti: Garante privacy, FAQ sull'accesso alle cartelle cliniche (dicembre 2024, https://www.garanteprivacy.it/web/guest/home/docweb/-/docweb-display/docweb/10086913): «l'interessato può ottenere gratuitamente la prima copia della cartella clinica recante i propri dati personali (art. 12, par. 5 del RGPD)»; Regione Siciliana, Fascicolo Sanitario Elettronico (https://www.regione.sicilia.it/fascicolosanitario) e sue domande frequenti (accesso con SPID, CIE o CNS).
- Nuovo passo 1: guardare prima nel Fascicolo Sanitario Elettronico. Passo «ricevuta e costo» → «ricevuta e prima copia gratis» (art. 15 GDPR); due domande frequenti cambiate o nuove.

## 19/10/2026 — assistenza domiciliare: franchigia di 129,11 euro
- Fonte: Agenzia delle Entrate (https://www.agenziaentrate.gov.it/portale/le-spese-sanitarie-e-i-mezzi-di-ausilio): «19% della differenza tra il totale della somma spesa e la franchigia di 129,11 euro».
- Infermiere privato: il 19% si detrae sulla parte oltre 129,11 euro, una volta all'anno per tutte le spese mediche; esempio con i numeri.

## 19/10/2026 — liste d'attesa: Enna e Trapani
- Fonti (estratti di ricerca: i siti delle due ASP non si aprono dall'estero): ASP Trapani, pagina «Percorsi di tutela» (https://www.asptrapani.it/servizi/Menu/dinamica.aspx?idSezione=17900&idArea=17901&idCat=28961&ID=47241&TipoElemento=pagina); ASP Enna, pagina «Liste di attesa» (https://www.aspenna.it/category/servizi/liste-di-attesa/) e pagina URP; elenco PEC delle ASP della Regione (https://www.regione.sicilia.it/istituzioni/regione/strutture-regionali/assessorato-salute/aziende-sanitarie-provinciali-sicilia).
- Trapani: `info_url`, email comunicazione@asptrapani.it, PEC direzione.generale@pec.asptrapani.it.
- Enna: `info_url`, email responsabile.urp@asp.enna.it, PEC protocollo.generale@pec.asp.enna.it.
- Da confermare per telefono (nei `todo`).

## 19/10/2026 — ricorso invalidità: nuova soglia del gratuito patrocinio, niente spese se si perde
- Fonte: DM Giustizia 22/04/2025, GU n. 159 dell'11/07/2025 (https://www.gazzettaufficiale.it/gazzetta/serie_generale/caricaDettaglio?dataPubblicazioneGazzetta=2025-07-11&numeroGazzetta=159), ripreso dai siti dei tribunali (giustizia.it).
- `rules-ricorso.json`: `gratuito_patrocinio_income` 12.838,01 → **13.659,64 €**; nuovo `no_legal_costs_income` = 27.319,28 € (il doppio, art. 152 disp. att. c.p.c.).
- Guida e schermate: con reddito basso non si pagano le spese legali anche se si perde (dichiarazione nel ricorso); nuova domanda frequente.

## 19/10/2026 — prevenzione: età degli screening controllate
- Fonti: ASP Palermo (https://screening.asppalermo.org/), ASP Catania (https://www.aspct.it/comunicazione/eventi/salute-donna/). In Sicilia mammografia e sangue occulto restano 50–69 anni: nessuna estensione a 45–74 o 74. Età non cambiate.
- ASP Trapani scrive Pap test 25–33 e test HPV 34–64: nella guida una frase dice che qualche ASP può avere età un po' diverse.
- Screening gratuito dell'epatite C (nati 1969–1989): proroga nazionale al 31/12/2026, ma nessuna pagina siciliana del 2025–2026. Non aggiunto: da verificare con la Regione.

## 19/10/2026 — assegno di inclusione: niente più mese di stop
- Fonte: INPS, messaggio n. 640 del 23/02/2026 (https://www.inps.it/it/it/inps-comunica/notizie/dettaglio-news-page.news.2026.03.assegno-di-inclusione-addio-al-mese-di-stop.html) e Ministero del Lavoro (https://www.lavoro.gov.it/notizie/pagine/adi-cosa-cambia-con-la-legge-di-bilancio-2026); L. 199/2025, art. 1 c. 160.
- `rules-adi.json`: tolto `pause_months`; nuovo `renewal_first_month_percent` = 50 (il primo mese del rinnovo è la metà). Soglie (ISEE 10.140 €, reddito 6.500 € × scala, 8.190 € con tutti sopra i 67 anni) confermate per il 2026.
- Guida e schermate: rinnovo senza mese di stop, domanda dal mese dopo l'ultimo pagamento; nuova domanda frequente.

## 19/10/2026 — pagine leggibili senza JavaScript, WhatsApp, stampa
- Ogni modulo ha la guida passo passo scritta nell'HTML (per Google e per chi non ha JavaScript), con anche i termini tecnici che la gente cerca. Titoli e descrizioni delle pagine riscritti con le stesse parole.
- Liste d'attesa: tabella delle classi U, B, D, P (da `rules.json`) e come chiedere il percorso di tutela in ogni ASP (da `asp-sicilia.json`), creati da `npm run pagine`. «Numeri utili»: tutti i numeri anche senza JavaScript.
- Pulsanti «Condividi su WhatsApp» e «Stampa» su ogni pagina; anteprima del link (`og:title`, `og:description`); versione stampabile.
- Link interni senza `index.html` (`../liste-attesa/`), come l'indirizzo canonico.

## 18/10/2026 — Catania: pagine sparite dal sito dell'ASP
- Fonte: pagina ufficiale «ADI, Cure palliative, RSA» (https://www.aspct.it/azienda/dipartimenti/dipartimenti-sanitari/dipartimento-delle-cure-intermedie-domiciliari-e-della-speci/u-o-c-coordinamento-e-controllo-adi-cure-palliative-rsa-e-lu/adi-cure-palliative-rsa/) e pagina «Contatti» (https://www.aspct.it/azienda/contatti/), lette per intero; nessuna notizia di chiusure o traslochi.
- URP numero verde 800 279761: la pagina `organizzazione/urp.aspx` non esiste più (404) → pagina «Contatti», prova `pagina`.
- Tolto il centralino 095 2541111: non è più su nessuna pagina ufficiale (solo giornali del 2020).
- Tolto il PUA del PTA San Luigi 095 8250212: la pagina `cosa_fare_per/cure-palliative-domiciliari.aspx` non esiste più e il numero non è sulla pagina nuova. Al suo posto: UVM di Catania (cure a casa e RSA, PTA San Luigi) 095 8250259 e UVP (cure palliative a casa, via Vecchia Ognina 14) 095 2540624.

## 18/10/2026 — sportelli «scelta e revoca» ed esenzioni
- Topic `anagrafe` in `asp-sicilia.json` per tutte le 9 ASP (51 sportelli): compaiono nel modulo medico di famiglia e in «Numeri utili». Esclusi i dati in contrasto (elenco nei `todo`).
- `scelta_medico` aggiornato: cambio medico online a Catania (ASPConTe), Messina (SPID), Trapani e Caltanissetta (sportello online con PIN), Ragusa (servizi online); Siracusa per email.
- Agrigento: tolto l'ufficio protesi 0922 407568 (pagina 2022), che sulla pagina 2024 è il numero dell'anagrafe.

## 18/10/2026 — uffici negli altri moduli: cartelle cliniche, screening, sedi INPS
- Nuovo riquadro comune `officeBox` (`js/common.js`): mostra gli uffici di un argomento con indirizzo e orari, oppure niente se l'ASP non ha dati confermati.
- **Cartella clinica:** uffici cartelle cliniche di 14 ospedali (topic `cartelle`), anche delle aziende ospedaliere (nuovo campo `official_domains` per i loro siti). Policlinico Catania e Policlinico Martino Messina: prima copia gratis.
- **Prevenzione:** numero dello screening di 8 ASP su 9 (topic `screening`); Enna non pubblicato (estratto con numero sbagliato).
- **Invalidità / Numeri utili:** sede INPS di ogni provincia (indirizzo, orari, pagina inps.it) in `inps-sicilia.json`; le 9 PEC `direzione.provinciale.<città>@postacert.inps.gov.it` sono confermate, tolta la nota «stiamo ancora controllando». Test anche per le sedi INPS.
- **Medico di famiglia ed esenzione ticket:** pronti i riquadri per gli sportelli «scelta e revoca» (topic `anagrafe`); l'esenzione rimanda a «Numeri utili».
- `npm run da-verificare` crea `docs/da-verificare.md`: i numeri da rileggere da una connessione italiana.

## 18/10/2026 — uffici protesi e ausili; verifica di tutte le 9 ASP completata
- **Uffici protesi e ausili** (`contacts`, topic `protesica`, con indirizzo e orari) per tutte le 9 ASP: compaiono nel modulo ausili («Dov'è l'ufficio protesi e ausili»: spiegazione iniziale, «20 giorni passati», «non consegnato») e in «Numeri utili». Esclusi i dati in contrasto (orari Catania, pannoloni Messina, indirizzo Nicosia, pomeriggio Bagheria) e quelli di attribuzione incerta: elenco nei `todo`.
- Sotto ogni pulsante «Chiama» ora ci sono indirizzo e orari (`address`, `hours`).
- **Nuovo tipo di prova `archivio`**: copia della pagina ufficiale su web.archive.org, con la data in `archived`.
- **Ragusa:** tolto 800 296339 (fonte 2024); aggiunti guardia medica di Ragusa, PUA di Modica, Comiso, Vittoria.
- **Siracusa:** CUP 0931 484848 → numero unico **0931 312525** (dal 20/09/2023); aggiunti centralino, URP di distretto, sedi dei PUA.
- **Trapani:** PUA Marsala → 0923 717760 (Casa della Comunità, piazza Francesco Pizzo); Mazara → 0923 677267; Castelvetrano → 0924 930601; Alcamo → 0924 599542; URP della città di Trapani non pubblicato (tre numeri diversi).
- **Agrigento:** «guardia medica» 0922 407758 era il pronto soccorso pediatrico → guardia medica di Agrigento 0922 407764, più San Leone e Giardina Gallotti; disdetta 0922 407699 confermata; «cabina di regia» 0922 407365 non esiste.
- **Caltanissetta:** tolto 0934 506666 (nessuna fonte); URP 0934 506126; PUA di San Cataldo, Gela, Mussomeli.
- **Enna:** guardia medica di Enna spostata il 14/02/2025 in via Trieste (vecchio Umberto I), 0935 500896; aggiunti centralino, URP, PUA 0935 520559. WhatsApp CUP non pubblicato (solo giornali).

## 18/10/2026 — regola dei numeri e verifica di tutte le ASP
- **Nuova regola** [docs/regola-numeri.md](docs/regola-numeri.md): solo numeri da fonte ufficiale o confermati per telefono; per ogni numero si cercano anche chiusure e traslochi; ricontrollo ogni 3 mesi. Ogni numero ha `url`, `verified`, `proof` (`telefono` / `pagina` / `estratto`). Il test `tests/contatti.test.mjs` fallisce se mancano, se l'url non è ufficiale o se il controllo ha più di 92 giorni.
- I siti di molte ASP **bloccano chi si collega dall'estero** (verificato con check-host.net da Milano: tutti e 9 rispondono dall'Italia). Dove non si leggono, si usa l'estratto della ricerca (`proof: "estratto"`), da confermare per telefono.
- **Tolti i centri antiveleni** dalla pagina «Numeri utili»: in Sicilia non c'è un centro antiveleni.
- **Palermo** (pagine lette): numeri confermati; aggiunti i PUA di Carini (Casa di Comunità di via Ponticelli), Partinico, Termini Imerese, Misilmeri, Corleone, Lercara Friddi, Petralia Sottana.
- **Catania** (estratti): CUP 800 954414 dal 12/01/2026 lun–ven 8–16:45, sabato chiuso (aspct.it news 25833); tasto 2 per classi U e B confermato; orari URP tolti perché due pagine ASP non coincidono.
- **Messina** (estratti): tolti 090 3653440 (legato sia a via Saffi chiusa sia a via del Vespro) e guardia medica centro 090 45077 (un avviso ASP dà via Sacra Famiglia 7, 090 2932510); cure palliative a casa 090 3652097: dal 25/03/2026 l'ufficio non riceve di persona.

## 18/10/2026 — Messina: PUA trasferito in via del Vespro
- La Casa di Comunità di via Saffi 2 ha chiuso il 30/05/2026: PUA, assistenza infermieristica e ambulatori sono alla Casa di Comunità di via del Vespro (piano terra). Nuovi contatti: **PUA Messina Nord, via del Vespro 14, 090 3653510** (lun–ven 8:30–12, lun e mer 15–17; pagina del Distretto di Messina) e **Casa della Comunità di via del Vespro 14, 090 3653440** (il numero è passato alla nuova sede; pagina contatti dell'ASP). `pua_url` punta alla pagina del Distretto. Letti dall'estratto di ricerca perché il sito ASP non si apriva: da confermare con una telefonata.
- Fonti: https://old.asp.messina.it/?p=497924 · https://www.asp.messina.it/?page_id=249137 · https://www.asp.messina.it/asp-contatti/

## 18/10/2026 — numeri utili e consigli pratici per l'aiuto a casa
- **Nuova pagina «Numeri utili»** (`numeri-utili/`, `js/numeri.js`, `data/numeri.json`): 112, 1522, 114, 19696, Telefono Amico, ISS (dipendenze 800 940789, fumo, AIDS), INPS, tessera sanitaria, numero verde della Regione; poi la provincia e i numeri della propria ASP divisi per argomento, ognuno con il link alla pagina ufficiale. Link dal riquadro «Chi può aiutarti», dai moduli e dalla ricerca (non nella pagina iniziale).
- **116117 non attivo in Sicilia** (D.A. n. 934 del 23/07/2026): lo diciamo. Non c'è un numero unico per guardia medica né per le farmacie di turno.
- **`asp-sicilia.json`: nuovi campi** `contacts` (topic: cup, urp, centralino, guardia, casa, palliative; con orari e url), `site_url`, `guardia_medica_url`, `pua_url`. I campi `phones` non cambiano. Numeri presi dai siti ufficiali delle ASP (alcuni siti non si aprivano: in quel caso dall'estratto della pagina ufficiale); quelli trovati solo sui giornali non sono pubblicati e sono in `todo`.
- I moduli che mostrano i numeri dell'ASP usano `aspCalls` (`js/common.js`): ADI mostra anche i PUA, cure palliative anche reti e hospice; sotto c'è il link «Tutti i numeri dell'ASP».
- **Assistenza domiciliare: schermata «Consigli pratici»**: medicazione o puntura (cure domiciliari di base), prelievo a casa, infermiere privato (albo FNOPI, infermiere/OSS/badante, detrazione 19% con fattura e pagamento tracciabile), dimissione protetta, ossigeno, trasporto per la dialisi.
- Da verificare (in `todo`/`notes_internal`): numeri di Enna (sito irraggiungibile), centralino di Ragusa e Siracusa, URP di Trapani, 0922 407699 e 0922 407365 di Agrigento; ticket per prelievo e prestazioni a domicilio; chi paga l'ambulanza per le visite programmate.

## 18/10/2026 — cartella clinica: 7 giorni
- `rules-cartella.json`: `deadline_days` da 30 a **7** (L. 24/2017 «legge Gelli», art. 4, comma 3: la direzione sanitaria fornisce la documentazione disponibile entro 7 giorni; le integrazioni entro 30, nuovo campo `integration_days`).
- Il ricorso al TAR resta sull'art. 25 L. 241/1990 (silenzio dopo 30 giorni, poi 30 giorni per il ricorso).
- Fonte: https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2017-03-08;24

## 18/10/2026 — statistiche anonime (GoatCounter)
- **Si contano le pagine viste e i «Sì / No» di «Ti è stata utile?»** con GoatCounter, senza cookie e senza script da altri siti (richiesta «pixel» da `count()` in `js/common.js`). Non si manda mai quello che l'utente scrive. Non conta su localhost.
- Si attiva scrivendo il nome dell'account in `GOATCOUNTER_CODE` (`js/common.js`); finché è vuoto non si conta niente.
- Privacy e testo sotto «Ti è stata utile?» aggiornati: non diciamo più «non contiamo chi visita» né «non registriamo la risposta».

## 18/10/2026 — pagina più larga sul computer
- Testata, banda e piè di pagina larghi fino a 56rem (`--page`); il testo dei moduli resta nella colonna di lettura di 42rem (`--maxw`), allineata a sinistra, come NHS.uk.
- Home e pagine delle aree (`data-wide`): da 768px in su i riquadri sono su 2 colonne; in home «Le domande più frequenti» e «Stai male adesso?» stanno affiancati. Sul telefono non cambia niente.

## 18/10/2026 — urgenze, domande frequenti, «Ti è stata utile?»
- **Home: riquadro rosso «Stai male adesso?»**: il sito non serve per le urgenze; se è grave chiama il 112; la sera, di notte e nei festivi la guardia medica.
- **Home: «Le domande più frequenti»** con la freccia verde: visita troppo lontana, ticket, visita per l'invalidità in ritardo (elenco `FREQUENTI` in `js/home.js`).
- **In fondo a ogni pagina: «Questa pagina ti è stata utile? Sì / No».** La risposta non viene registrata (niente server, niente statistiche); con «No» compare un link per scriverci un'email, se si vuole.
- **«Informazioni controllate il …»** sotto la domanda: la data `last_verified` più vecchia tra i file di dati della pagina. Pagine delle aree: i loro moduli; home: tutti; privacy, fonti e chi siamo: nessuna data.
- `data/moduli.json`: ogni modulo ha ora `data`, l'elenco dei suoi file in `data/` (servono per la data del controllo). Se un modulo inizia a usare un altro file di dati, aggiungerlo qui.

## 18/10/2026 — banda colorata e icone disegnate
- **Banda verde acqua in alto** con icona grande, titolo e frase principale: nella home, nelle pagine delle aree, in privacy, fonti e chi siamo, e nella prima schermata e nel risultato di ogni modulo. Le schermate con le domande restano senza banda. La crea `bandify` in `js/common.js`, senza toccare i moduli.
- **Icone disegnate al posto delle emoji** (93 icone Lucide, licenza ISC, `fonts/LICENSE-lucide.txt`): uguali su tutti i telefoni, di un solo colore. Verde, rosso e giallo solo per «sì», «no» e «attenzione». Nei file si continuano a scrivere le emoji: le sostituisce `iconize` in `js/common.js`. Le lettere non vengono toccate.
- Il titolo che riceve il focus a ogni schermata non mostra più il contorno del browser.

## 18/10/2026 — pagine delle aree e percorso «Inizio › Area»
- **4 pagine vere per le aree**: `visite-esami/`, `prevenzione-medico/`, `aiuto-a-casa/`, `invalidita-aiuti/`. Si possono condividere, Google le trova, e funzionano anche senza JavaScript. Prima erano schermate create al momento (`?gruppo=casa`); i vecchi link portano alla pagina nuova.
- **Percorso sotto la testata** in tutte le pagine tranne la home: sul computer «Inizio › Aiuto a casa», sul telefono solo «‹ Aiuto a casa».
- **Una sola ricerca**: quella nella testata. In home i risultati compaiono sopra i riquadri mentre si scrive.
- `data/moduli.json`: ogni area ha ora `page` (cartella), `short` (nome nel menu) e `intro` (frase in alto nella pagina dell'area).
- Nuovo `npm run pagine` (`tools/pagine.mjs`): rifà testata, percorso, pagine delle aree e `sitemap.xml` (ora 20 pagine).

## 18/10/2026 — testata, colori e riquadri sul modello NHS.uk
- **Testata nuova in tutte le 16 pagine**: verde acqua scuro, logo, ricerca sempre visibile (porta alla pagina iniziale con `?q=parola`) e le 4 aree (Visite ed esami, Prevenzione, Aiuto a casa, Invalidità). L'area della pagina aperta è sottolineata.
- **Un colore = un ruolo**: titoli neri, link verde acqua sottolineati, pulsanti d'azione («Comincia», «Controlla», «Scriviamo la lettera») verdi pieni.
- **Pagina grigio chiaro con riquadri bianchi** e un bordo spesso sotto, al posto delle ombre leggere. Campi con bordo scuro, più visibili.
- Corretto lo spazio sopra il contenuto (`main.wrap` non aveva il margine in alto).

## 18/10/2026 — mappa del sito per Google
- Nuovo `sitemap.xml` con tutte le 16 pagine, da indicare in Google Search Console. Se si aggiunge un modulo, aggiungerlo anche qui.

## 18/10/2026 — design sul modello NHS.uk
- **Pagina iniziale**: titolo «Di cosa hai bisogno?» e le 4 scelte subito visibili sul telefono; chi siamo in una riga sopra, la descrizione sotto le scelte. Tolto il nome ripetuto nel titolo.
- **Ricerca sempre aperta** (prima era nascosta in «Oppure scrivi una parola»).
- **Ogni gruppo ha un indirizzo** da condividere (per esempio `?gruppo=casa`). Tornando indietro da un modulo si ritrova il gruppo aperto.
- **Meno emoji ripetute**: le province non hanno più la puntina accanto a ogni nome. Le emoji all'inizio dei titoli restano visibili ma i lettori di schermo non le leggono.
- **Avvisi: un colore = un significato** (`css/style.css`): info = consiglio o aiuto, ok = sei nei tempi, warn = attenzione, bad = in ritardo, nuovo **urgent** (rosso pieno) = stai male, chiama il medico o il 112. I riquadri «patronato/CAF» passano da ok a info.
- **Lettori di schermo**: «Lettera B, Entro 10 giorni» invece di «Lettera BEntro 10 giorni» (spazio prima della spiegazione in tutti i pulsanti).
- **Senza JavaScript** la pagina iniziale mostra l'elenco di tutti i moduli come link, e ogni modulo il suo titolo e la descrizione (prima: solo «Un momento…»).

## 18/10/2026 — tasto Indietro del telefono
- Prima il tasto Indietro del telefono (o del browser) faceva uscire dal modulo e si perdevano le risposte. Ora torna alla domanda precedente, come «← Torna indietro»; il tasto Avanti la riapre. Vale per tutti i moduli e per i gruppi della pagina iniziale (`createNav` in `js/flow.js`).
- L'indirizzo della pagina non cambia. Dopo «Ricomincia» o se ricarichi la pagina, le schermate vecchie riportano all'inizio.

## 18/10/2026 — link precisi nelle fonti
- 29 link nei file `data/*.json` e 1 in `js/liste-attesa.js` portavano alla home del sito: ora portano alla pagina specifica (Ministero della Salute, INPS, Gazzetta Ufficiale, Garante privacy, Regione Siciliana – Assessorato Salute, Ministero del Lavoro, Giustizia, AIFA, Riforma disabilità, Tessera Sanitaria, SISAC, Federazione Cure Palliative). Tutti aperti e controllati il 18/10/2026.
- Restano sulla home: Ministero della Salute per cartella clinica e scelta del medico (non c'è una pagina dedicata), Osservatorio Nazionale Screening.
- Province della sperimentazione: il link elenca solo le 40 province della terza fase.

## 18/10/2026 — nome: Guida Sanità
- «Ci penso io» prometteva troppo (il sito spiega, non fa la pratica al posto tuo). Nuovo nome «Guida Sanità» (la frase «Niente panico.» è stata provata e tolta). Dominio guidasanita.it libero al 18/10/2026.
- Email segnaposto: info@guidasanita.it.

## 18/10/2026 — nuovo logo
- Simbolo: una mano che sostiene un cuore, in verde acqua (`logo.svg`). Anche come icona della scheda del browser.

## 18/10/2026 — nuovo aspetto
- Stile ispirato a Unimamma, in **verde acqua** (#0F7C78): sfondo bianco, titoli verde acqua, carattere tondo Nunito, sfumatura verde menta in home, riquadri e pulsanti arrotondati con ombra leggera, logo con segno sfumato verde acqua.
- Il carattere Nunito è incluso nel sito (`fonts/`, licenza SIL OFL): nessun file caricato da siti esterni.

## 18/10/2026 — solo salute
- Nuovo modulo **Prevenzione gratuita** (`rules-prevenzione.json`): mammografia 50–69 ogni 2 anni, Pap test 25–29 ogni 3, HPV 30–64 ogni 5, colon 50–69 ogni 2; vaccini influenza da 60, pneumococco e zoster da 65, richiamo tetano ogni 10 anni. Numero screening ASP Catania 800 894 007. Da verificare: fasce siciliane e numeri delle altre ASP.
- Nuovo modulo **Medico di famiglia e pediatra** (`rules-medico.json`, campo `scelta_medico` per ASP): pediatra fino a 6 anni, scelta 6–14, medico dai 14; scelta temporanea per domiciliati; lettera all'ASP se non c'è posto. Catania: app ASPConTe. Da verificare: canali online delle altre ASP, massimali.
- Home: nuovo gruppo «Prevenzione e medico di famiglia».
- Tolto il modulo «Permesso di soggiorno» (pagina, regole, test, fonti, domande): il sito si concentra sulla salute.

## 18/10/2026 — «Non hai la PEC?»
- Sotto ogni lettera, un riquadro con 4 modi per mandarla senza PEC: patronato, a mano con timbro, raccomandata A/R, familiare con delega.
- Il test delle combinazioni controlla che ci sia in ogni schermata con una lettera.

## 18/10/2026 — nome definitivo: Ci penso io
- «Cosa mi spetta» era già usato da un sito di bonus. Nuovo nome «Ci penso io» (dominio cipensoio.it).
- Email segnaposto: info@cipensoio.it.

## 18/10/2026 — nuovo nome: Cosa mi spetta
- Il sito copre anche aiuti economici e documenti, non solo sanità: da «Aiuto Sanità» a «Cosa mi spetta».
- Email segnaposto: info@cosamispetta.it (dominio da verificare).

## 18/10/2026 — pagina iniziale a scelta guidata
- Prima una sola domanda con 4 grandi riquadri, poi al massimo 4 scelte. Elenco dei moduli in `data/moduli.json`.
- Casella «Scrivi una parola» per chi aiuta; pulsante Ascolta anche in home.
- In fondo a ogni schermata: «Ti serve altro? Torna all'inizio».

## 18/10/2026 — cinque moduli suggeriti dagli utenti
- **Assegno di inclusione** (`rules-adi.json`): famiglia, 5 anni di residenza, ISEE ≤ 10.140 €; domanda INPS/patronato/CAF.
  Da verificare: soglie 2026 (ISEE, reddito, patrimonio).
- **Permesso di soggiorno** (`rules-permesso.json`): rinnovo 60 giorni prima (art. 5 D.Lgs. 286/1998); kit postale o Questura;
  tolleranza di 60 giorni dopo la scadenza (prassi). Da verificare: tipi di permesso per canale, costi.
- **Piano terapeutico** (`rules-piano.json`): prenotare il rinnovo 60 giorni prima della scadenza. Da verificare: proroghe regionali.
- **Assistenza domiciliare** (`rules-domiciliare.json`): LEA art. 22; nessun termine di legge; sollecito dopo 30 giorni.
  Da raccogliere: contatti dei PUA per distretto.
- **Cure palliative** (`rules-palliative.json`): L. 38/2010; sollecito dopo 7 giorni. Da raccogliere: numeri della rete per provincia.
- Le lettere dei moduli diversi dal percorso di tutela vanno ora all'URP o alla PEC generale dell'ASP, non alla casella
  dedicata alle liste d'attesa (Palermo e Caltanissetta ne hanno una).
- Home riorganizzata in 4 gruppi. Test delle combinazioni: 1735 percorsi.

## 18/10/2026 — altri due moduli
- **Esenzione ticket**: calcolo con regole fisse per età e reddito (E01 ≤ 36.151,98 €; E02/E04 8.263,31 €,
  11.362,05 € con coniuge, +516,46 € per figlio; E03 senza limite). Nuovo file `data/rules-esenzione.json`.
  Da verificare: soglie aggiornate e codici C01–C03. Le medicine (regole regionali) non sono calcolate.
- **Ricorso invalidità**: 6 mesi dal verbale (art. 42 D.L. 269/2003), ATP, gratuito patrocinio, aggravamento.
  Nuovo file `data/rules-ricorso.json`. Da verificare con il legale: termine nella nuova procedura, soglia del
  gratuito patrocinio.
- Test delle combinazioni: ora 1594 percorsi.

## 18/10/2026 — link corretti dopo prova dal telefono
- ASP Enna: www.aspenna.it è l'indirizzo giusto ma il 18/10/2026 il sito non si apriva (problema del sito, non del link). Lasciato com'è.
- INPS: la pagina contatti non si apre → sostituita con la pagina iniziale www.inps.it.
- Tutti gli altri 30 link esterni aperti e funzionanti (prova del 18/10/2026).

## 18/10/2026 — due nuovi moduli
- **Cartella clinica e referti**: scadenza di 30 giorni dalla richiesta scritta (art. 25 L. 241/1990), come chiedere,
  sollecito alla Direzione sanitaria. Nuovo file `data/rules-cartella.json`.
- **Ausili e protesi**: autorizzazione dell'ASP entro 20 giorni, poi silenzio-assenso (art. 18 DPCM 12/01/2017),
  percorso «autorizzato ma non consegnato», sollecito all'ufficio protesica. Nuovo file `data/rules-ausili.json`.
- Da verificare con il legale: commi esatti del silenzio-assenso e del silenzio-rigetto. Da raccogliere: contatti
  degli uffici protesica e cartelle cliniche (vedi `docs/domande-urp.md`).
- Test delle combinazioni: ora 1074 percorsi.

## 18/10/2026 — fonti in ogni pagina
- Riquadro «Da dove vengono queste informazioni» in fondo a ogni schermata, con i link alle leggi
  (normattiva.it, Gazzetta Ufficiale, Ministero della Salute) e alle pagine ufficiali dell'ASP scelta o dell'INPS.
- `data/rules.json`, `data/rules-invalidita.json`, `data/inps-sicilia.json`: nuovo campo `sources` con i link.
- `data/asp-sicilia.json`: aggiunto il sito ufficiale per Trapani ed Enna (indirizzi da confermare).
- Nota: i link non sono stati aperti dall'ambiente di sviluppo (rete bloccata): vanno provati a mano.

## 18/10/2026 — nuovo nome: Aiuto Sanità
- Il sito si chiama ora «Aiuto Sanità» (prima «Diritto in Tempo»).
- Frase «Siamo volontari: non siamo l'ASP né l'INPS» nella pagina iniziale, nel piè di pagina e in «Chi siamo».

## 18/10/2026 — voce senza emoji
- Il pulsante «Ascolta» non legge più le emoji (diceva per esempio «puntina arrotondata dove abiti»).
- Il test delle combinazioni ora preme «Ascolta» in ogni schermata e controlla il testo letto.

## 18/10/2026 — controllo di tutte le combinazioni
- `data/asp-sicilia.json`: il fast track ha ora testo e telefono per ogni classe. Corregge Catania classe U,
  che mostrava il numero verde 800 954414 (valido solo per la classe B). Nessun contatto cambiato.
- Il sito non accetta più giorni nel futuro per prenotazione, richiesta al CUP e domanda INPS.
- Nuovo test `tests/combinazioni.cjs` (948 percorsi).

## 18/10/2026 — testi semplificati
- Tutti i testi riscritti in italiano semplice; pulsanti con icone; pulsante «Ascolta»; riquadro «Chi può aiutarti».
- `data/asp-sicilia.json`: nuovi campi `details` (informazioni in più) e `todo` (note interne, non mostrate).
  Testi `how_to`, `what_next`, `notes` riscritti. Nessun contatto cambiato.

## 18/10/2026 — prima versione (MVP)
- Modulo 1 (liste d'attesa) e modulo 2 (invalidità civile) costruiti da SPEC.md v2.2.
- `data/asp-sicilia.json`: 9 ASP dalla ricerca del 18/10/2026 (Palermo verificata; Ragusa, Caltanissetta, Messina,
  Siracusa, Agrigento, Catania in parte; Trapani, Enna da verificare). Fonti in ogni scheda.
- `data/inps-sicilia.json`: procedura per provincia dall'elenco del Dipartimento disabilità + messaggio INPS 639/2026.
  Indirizzi PEC costruiti sul formato standard INPS — tutti da verificare.
