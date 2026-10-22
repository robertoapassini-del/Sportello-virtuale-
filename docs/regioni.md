# Guida Sanità per tutte le regioni: la proposta

Oggi il sito copre solo la Sicilia. L'obiettivo è farne un riferimento nazionale, **senza rompere quello che
funziona**. Questo documento dice come: struttura dei dati, scelta della regione, cosa è nazionale e cosa regionale,
indirizzi delle pagine, marchio. L'ultima parte dice cosa è già fatto e cosa viene dopo.

Decisioni già prese dal proprietario: niente blog; pagine‑risposta con un blocco regionale; dati regionali in file
separati; pagine generate da `tools/pagine.mjs`.

## 1. Struttura dei dati

```
data/
  moduli.json                 elenco dei moduli e delle aree (nazionale)
  rules*.json                 regole nazionali (codici E01–E04, classi U/B/D/P, 7 giorni, tempi INPS…)
  numeri.json                 numeri nazionali (112, 1500, 803 164…)
  regioni/
    index.json                elenco delle regioni: quali sono attive, come si chiama l'azienda sanitaria
    sicilia/
      asp.json                le 9 ASP (era data/asp-sicilia.json)
      inps.json               le 9 sedi INPS (era data/inps-sicilia.json)
    lombardia/                (in futuro) asl.json, inps.json …
```

### `data/regioni/index.json`

Una voce per regione, anche per quelle non ancora attive: così la schermata «In quale regione abiti?» può
elencarle tutte e dire «non ancora disponibile» per quelle vuote.

```json
{
  "default": "sicilia",
  "regioni": [
    { "id": "sicilia", "name": "Sicilia", "attiva": true, "asl_label": "ASP", "asl_label_long": "Azienda sanitaria provinciale" },
    { "id": "lombardia", "name": "Lombardia", "attiva": false, "asl_label": "ATS" }
  ]
}
```

- `id`: minuscolo, senza accenti, usato nei nomi delle cartelle e in `localStorage`.
- `attiva`: solo le regioni con `attiva: true` hanno la cartella con i dati e compaiono tra le scelte.
- `asl_label`: come si chiama l'azienda sanitaria nella regione (ASP in Sicilia, ATS/ASST in Lombardia, ASL quasi
  ovunque, AUSL in Emilia‑Romagna, ULSS in Veneto, ASUGI/ASUFC in Friuli…). I testi dei moduli useranno questa
  parola al posto di «ASP» scritto a mano.

### I file di una regione

Stessa forma per ogni regione, così i moduli non devono sapere in quale regione sono:

- `asl.json` (in Sicilia si chiama `asp.json`: il nome del file è nell'indice, campo `files`): `region`, `model`,
  `local_name` (come si chiama il percorso di tutela in quella regione), `regional_channel` (portale di
  prenotazione regionale), `asl[]` con `id`, `name`, `province`, canali, `phones`, `contacts`, `sources`,
  `last_verified`, `status`, `todo`. È la struttura che già c'è: non cambia.
- `inps.json`: `provinces[]` con sede, PEC, regime vecchio/nuovo della riforma disabilità.
- In futuro `regole.json`: le poche regole che cambiano per regione (termine per prenotare dopo la ricetta, ticket
  regionale, cosa succede se manca la classe di priorità). Oggi questi campi stanno in cima a `asp.json`
  (`booking_deadline_days`, `no_class_rule`) e per ora restano lì.

**Regola:** una regione nuova si aggiunge creando la cartella, copiando la forma dei file siciliani e mettendo
`attiva: true` nell'indice. Niente altro da toccare nel codice.

### Province e aziende

In Sicilia una ASP = una provincia. Altrove non è così (Lombardia: 8 ATS per 12 province; Roma: 6 ASL in una città).
Quindi la domanda all'utente resta «in quale provincia abiti?», ma nel file ogni azienda elenca le sue province
(`provinces: ["Milano", "Lodi"]`) e, dove serve, i comuni che decidono la ASL (`comuni_url` o `comuni[]`). Il
modulo cerca l'azienda per provincia; se più aziende coprono la stessa provincia, fa una domanda in più («In quale
zona?») con le `sub_areas`.

**Il nome nella lettera (`nome_lettera`).** Le lettere all'azienda cominciano con «Spett.le» + `nome_lettera`, il nome
ufficiale dell'azienda («USL Umbria 2», «Azienda USL della Valle d'Aosta», «ASReM – Azienda Sanitaria Regionale del
Molise»). Se manca, scrivono `asl_intestazione` dell'indice (o `asl_label`) + «di» + provincia: in Sicilia
«Azienda Sanitaria Provinciale di Palermo», e lì `nome_lettera` non c'è. `nome_lettera` viene dal `name` già provato,
senza le parti che non sono il nome (in Basilicata «ASM – Azienda Sanitaria Locale di Matera»). Le funzioni sono in
`js/letters.js` (`intestazioneDi`) e `js/flow.js` (`intestazioneAzienda(a)`).

**Le zone (`sub_areas`).** Una zona può essere:

- una frase (`"Messina – Taormina"`): si legge e basta, la lettera non cambia (Messina: un'ASP, una PEC, tre zone);
- un oggetto, quando la lettera cambia secondo il comune:

```json
"aziende_multiple": true,
"sub_areas": [
  { "id": "roma1", "label": "Roma 1 – Centro e Nord", "comuni": ["Roma (municipi I, II, III…)"],
    "nome_lettera": "ASL Roma 1", "pec": "…", "emails": ["…"] },
  { "id": "roma2", "label": "Roma 2 – …", "nome_lettera": "ASL Roma 2", "pec": "…", "emails": ["…"] }
]
```

`id` e `label` (il testo del pulsante) sono obbligatori; `comuni` va sotto il pulsante. Gli altri campi della zona
(`name`, `nome_lettera`, `pec`, `emails`, `send_to`, `how_to`, `phones`, `contacts`, `scelta_medico`, `letter_mode`…)
prendono il posto di quelli dell'azienda (`conZona()` in `js/letters.js`); `id` e `province` non cambiano mai. Ogni
dato di una zona segue la regola delle prove (sezione 9): solo dalle copie delle pagine ufficiali.

I moduli che scrivono all'azienda (cartella-clinica, medico-famiglia, assistenza-domiciliare, cure-palliative,
liste-attesa, ausili) chiedono «In quale zona?» dopo la provincia quando l'azienda ha almeno una zona oggetto
(`provinceChoice()` e `zonaScreen()` in `js/flow.js`).

**Più aziende in una provincia (`aziende_multiple: true`).** Si scrive sull'azienda quando la provincia ha più aziende
sanitarie. Finché mancano le zone (almeno due, ognuna con `nome_lettera` e `pec`, `emails` o `send_to` suoi),
`tests/coerenza.test.mjs` non lascia accendere in quella regione i moduli con una lettera all'azienda. Lo stesso test
vuole `aziende_multiple` quando il `name` elenca più aziende («ASL CN1 e ASL CN2», «Roma 1–6») o le email URP sono di
più ASST lombarde. Oggi (22/10/2026) `aziende_multiple` c'è, e le zone sono da fare, per:

| Regione | Provincia | Aziende |
|---|---|---|
| Lazio | Roma | ASL Roma 1, 2, 3, 4, 5, 6 |
| Campania | Napoli | ASL Napoli 1 Centro, Napoli 2 Nord, Napoli 3 Sud |
| Piemonte | Torino | ASL Città di Torino, TO3, TO4, TO5 |
| Piemonte | Cuneo | ASL CN1, CN2 |
| Umbria | Perugia | USL Umbria 1; USL Umbria 2 per Foligno, Spoleto e Valnerina |
| Emilia-Romagna | Bologna | AUSL di Bologna, AUSL di Imola |
| Veneto | Venezia | ULSS 3 Serenissima, ULSS 4 Veneto Orientale |
| Veneto | Vicenza | ULSS 8 Berica, ULSS 7 Pedemontana |
| Lombardia | tutte e 12 | l'ATS controlla; visite, casa, protesica e medico sono delle ASST (più d'una in molte province) |

Chi fa la regione riempie le zone dalle copie, toglie la riga dal `todo` e tiene `aziende_multiple: true`.

## 2. Come un modulo sceglie la regione

1. **Scelta ricordata nel browser** in `localStorage` con la chiave `gs-regione` (valore: l'`id`). È l'unica cosa
   che il sito ricorda: non è un dato sanitario e non esce dal telefono. Va scritta nella pagina privacy.
2. **Prima domanda «In quale regione abiti?»** se la scelta non c'è: schermata con l'elenco delle regioni attive
   (pulsanti grandi, in ordine alfabetico) e, sotto, le altre in grigio con «non ancora disponibile». Chi sceglie
   una regione non attiva vede la parte nazionale della guida e un invito a segnalarci la sua regione.
3. **Poi la provincia**, come oggi. La domanda sulla provincia appare solo nei moduli che ne hanno bisogno
   (quelli con dati regionali in `moduli.json`).
4. **Cambiare regione**: un piccolo link «Non abiti in Sicilia? Cambia regione» nel blocco regionale, e la stessa
   scelta nella pagina Numeri utili.
5. **Senza JavaScript**: la guida scritta mostra la parte nazionale e il blocco regionale della regione
   predefinita (`default` nell'indice), con la frase «Sei in un'altra regione? Scegli la tua regione qui sopra».

Nel codice: una funzione `regione()` in `js/common.js` legge `localStorage` e torna l'`id` (oppure il `default`
dell'indice); `loadRegional(root, 'asl')` carica il file giusto. I moduli non scrivono mai il nome della regione nei
percorsi dei file.

## 3. Cosa è nazionale e cosa regionale

| Nazionale (uguale ovunque, nei `rules*.json` e nei testi dei moduli) | Regionale (nel blocco regionale, dai file `data/regioni/<id>/`) |
|---|---|
| Codici esenzione E01–E04 e soglie di reddito | Sportello dove si chiede l'esenzione, se si fa online (es. ASPConTe a Catania) |
| Classi di priorità U/B/D/P e tempi massimi (PNGLA) | Come chiedere il percorso di tutela e come si chiama; portale di prenotazione (SovraCUP, Zero Coda…); termine regionale per prenotare dopo la ricetta |
| 7 giorni per la cartella clinica (L. 24/2017); prima copia gratis | Ufficio cartelle cliniche dell'ospedale o dell'azienda; Fascicolo sanitario regionale |
| Tempi INPS per l'invalidità; riforma disabilità | Sede INPS della provincia; se la provincia è nella sperimentazione |
| 20 giorni per gli ausili (DPCM 12/01/2017) | Ufficio protesi dell'azienda |
| Diritto alle cure palliative (L. 38/2010) | Rete regionale, hospice, numeri |
| Screening e vaccini dei LEA, fasce d'età nazionali | Fasce d'età diverse della regione; numero dello screening; dove si prenota |
| Scelta e cambio del medico: regole generali | Sportello scelta e revoca; cambio online regionale |
| Numeri nazionali (112, 1500, 803 164) | Guardia medica, CUP, URP, PUA dell'azienda |

Regola pratica per scrivere: se la frase vale per un cittadino di Bolzano come per uno di Palermo, va nel testo
nazionale. Se cita un ufficio, un sito, un numero, un nome locale, va nel blocco regionale. Il blocco regionale è
sempre riconoscibile: titolo «In Sicilia» (il nome della regione), bordo colorato, link «Cambia regione».

## 4. Indirizzi delle pagine (URL)

- **Un solo indirizzo per domanda**: `/esenzione-ticket/`, `/liste-attesa/`… Il blocco regionale cambia dentro la
  pagina in base alla scelta. Così i link condivisi su WhatsApp funzionano per tutti, e Google vede una pagina
  forte invece di venti deboli.
- **Pagine regionali indicizzabili solo dove la differenza è sostanziale**: per esempio il percorso di tutela
  (nomi, canali e moduli diversi in ogni regione) o i numeri utili. In quel caso la pagina regionale è
  `/liste-attesa/sicilia/`, generata da `tools/pagine.mjs` dallo stesso HTML con il blocco regionale già riempito,
  con `canonical` proprio e voce nella sitemap. Le pagine `/x/<regione>/` esistono solo per i moduli che le chiedono
  esplicitamente in `moduli.json` (`"pagine_regionali": true`).
- Nessun parametro `?regione=` negli indirizzi: la scelta sta in `localStorage`. L'unica eccezione è il link
  «Cambia regione», che apre la schermata di scelta (`#regione`).

## 5. Marchio

- Il nome diventa **Guida Sanità** ovunque: testata, `og:site_name`, riga stampata in fondo al foglio,
  descrizione in `package.json`. Il logo (cuore e mani) non ha testo e non cambia.
- «Sicilia» resta **solo nel blocco regionale** («In Sicilia…») e nella riga della home «Per ora solo in Sicilia»,
  che sparirà quando ci sarà la seconda regione.
- Titoli e descrizioni delle pagine che oggi dicono «in Sicilia» vanno riscritti quando il modulo diventa
  multi‑regione (passo 3): fino ad allora dicono il vero.

## 6. Passi

1. **Fatto in questa modifica.** Dati siciliani in `data/regioni/sicilia/` con `data/regioni/index.json`;
   `loadRegional` in `js/common.js`; `tools/pagine.mjs`, test e strumenti aggiornati; «Sicilia» tolto dal marchio.
   Il sito funziona esattamente come prima.
2. **Fatto.** Schermata della regione. `regione()` legge `localStorage` (`gs-regione`) e torna la regione salvata
   se è attiva, altrimenti il `default` dell'indice; `setRegione(id)` la salva. In `js/flow.js`: `withRegion(screens)`
   mette «In quale regione abiti?» al posto della schermata `province` finché la scelta non c'è (lo fa da solo
   `createFlow`; liste d'attesa e invalidità lo chiamano a mano), `regionAction()` gestisce i clic, `changeRegionLink()`
   è il link «Non abiti in Sicilia? Cambia regione» nella schermata della provincia e in quelle dopo.
   Se la regione è attiva ma senza i dati del modulo, `withRegion(screens, 'province', next)` (in `createFlow`: `next`)
   salta la provincia e va a `next`: le schermate con uffici o lettera usano `senzaUffici(a, …)`, che senza provincia
   mostra `regionMissing()`. Senza `next` (invalidità, ausili: il conto dipende dai dati della regione) resta il blocco,
   e il pulsante della prima schermata non promette il conto. Numeri utili
   usa gli stessi pezzi. Nota nella privacy. Con una sola regione attiva né la schermata né il link si vedono, quindi
   il sito è uguale a prima. Se si sceglie una regione diversa da quella dei dati già caricati, per ora la pagina si
   ricarica (si riparte dall'inizio del modulo, la regione resta salvata): al passo 3 i dati si potranno ricaricare
   senza ricaricare la pagina. Le regioni non attive sono in grigio e non si possono scegliere, con un invito a
   scriverci; la parte nazionale per chi le sceglie arriva al passo 3.
3. **Un modulo multi‑regione per prova**: Numeri utili o Esenzione ticket (pochi dati regionali), con la seconda
   regione. Si rivedono i testi: `asl_label` al posto di «ASP», blocco regionale ben separato dal testo nazionale.
   **Fatto (21/10/2026), il codice:**
   - `loadRegional(root, 'asl')` prende il nome del file dall'indice (`files`), i test dei contatti girano su tutte
     le regioni attive, `aslLabel()` dà la sigla dell'azienda sanitaria.
   - Anche le regioni non attive si possono scegliere: nei moduli, al posto della provincia, c'è «La tua regione non
     c'è ancora» con il link alla parte nazionale e l'invito a scriverci.
   - Numeri utili è il modulo di prova: titoli con la regione e la sigla giusta, cambio di regione senza ricaricare la
     pagina, `numeri-utili/#regione` apre la scelta. In home, con più regioni, «Stai guardando: … · Cambia regione».
   - Con la sola Sicilia attiva non si vede niente di nuovo.
   - Tutti i moduli usano la sigla della regione (`aslLabel()`) e l'intestazione delle lettere (`aslIntestazione()`).
     Le cose solo siciliane (Fascicolo sanitario, assessorato, trasporto per la dialisi) stanno nell'indice
     (`ente`, `link`): una regione senza quei link mostra una frase generica.
   **Da fare:** i dati della Lombardia (le pagine ufficiali sono in `data/regioni/lombardia/fonti.json`, il server
   le copia ogni notte). La guida scritta delle pagine (HTML, anche senza JavaScript) resta quella della Sicilia
   fino al passo 5.
4. **In corso (21/10/2026): Lombardia e Lazio attivi per Numeri utili** (`moduli: ["numeri-utili"]` nell'indice): 191 numeri
   di ATS e ASST per le 12 province, letti nelle copie delle pagine ufficiali. Gli altri moduli, per chi sceglie la
   Lombardia, mostrano la parte nazionale e il link ai numeri utili finché non hanno i loro dati.
   **Le altre regioni**, una alla volta, con la stessa regola dei numeri (`docs/regola-numeri.md`): solo fonti
   ufficiali, data e prova. Si parte da quelle con più abitanti o più richieste.
5. **Pagine regionali indicizzabili** dove serve (percorso di tutela, numeri utili).

## 7. Cose da non dimenticare

- `tests/contatti.test.mjs` deve girare su tutte le cartelle di `data/regioni/`, non solo sulla Sicilia.
- `tools/controllo.mjs` legge i file di dati anche nelle sottocartelle (già fatto).
- `docs/regola-numeri.md` vale per ogni regione.
- `tests/combinazioni.cjs` prova le 9 province siciliane: con più regioni va parametrizzato per regione.

## 8. Aggiornamento assistito: come il sito si tiene aggiornato da solo

Il lavoro grosso di un sito nazionale non è costruirlo, è tenere giusti numeri, orari e indirizzi di un centinaio
di aziende sanitarie. Lo facciamo in tre pezzi, ognuno con un compito solo:

1. **Un server in Italia scarica.** Molti siti delle ASL non rispondono a chi si collega dall'estero (nel test del
   21/10/2026: dal server italiano 110 pagine su 134 rispondono, dall'estero Messina, Caltanissetta e Ragusa non
   rispondono). Un piccolo server virtuale (Aruba Cloud, data center di Bergamo, `/opt/guidasanita`) lancia ogni
   notte alle 3:30 `tools/copie.mjs`: legge gli indirizzi ufficiali dai dati regionali e dei numeri nazionali
   (`data/numeri.json`, cartella `copie/nazionali/`), salva ogni pagina come
   testo semplice e la carica nel branch **`copie-siti`** (cartella `copie/<regione>/<asl>/`, con `indice.json`:
   indirizzo, codice HTTP, titolo, impronta del testo, se è cambiata). Niente AI qui: è uno script semplice.
   **Quali indirizzi copia.** Regola semplice: ogni url scritto nei file della regione.
   - `asl.json` (regione attiva): `site_url`, `info_url`, `form_url`, `portal_url`, `guardia_medica_url`, `pua_url`,
     `scelta_medico.url` e gli url di `phones[]`, `contacts[]` e `pagine[]` di ogni azienda; gli url di
     `regole_fonti` in cima al file, nella cartella `regole`.
   - `inps.json` (regione attiva), nella cartella `inps-<regione>`: la pagina di ogni sede (`provinces[].url`), le fonti
     del file (`sources[].url`) e le pagine da copiare (`pagine[]`, in cima al file o in una sede). Sono le prove di
     `regime` e `regime_since`.
   - `fonti.json`, se c'è, **anche dopo l'attivazione**: ogni azienda nella sua cartella (`asl-roma1`…). Un url già
     copiato per `asl.json` non si scarica una seconda volta. Solo per le regioni in preparazione il server segue anche
     i link della homepage.
   Le cartelle di aziende che non sono più in nessuno di questi file si cancellano a ogni giro (mai `indice.json`,
   mai la cartella di un'azienda che c'è ancora). Una pagina che non serve più si toglie dal file, non dal server.
   **`pagine[]`** (in `asl.json` e `fonti.json`): le pagine ufficiali da far copiare, che non hanno un campo loro.
   Ogni voce è `{ "tipo": "cartelle", "url": "…" }`; `tipo` dice a cosa serve (`tutela`, `cartelle`, `medico`,
   `protesica`, `palliative`, `casa`, `screening`, `urp`…) e serve solo a chi legge. È la prova dei campi senza numero
   (`how_to`, `letter_mode`, `what_next`, `scelta_medico.how`): si scrive prima la pagina in `pagine[]`, poi, dopo la
   copia, il campo. `tools/confronta-copie.mjs` segnala un url di `pagine[]` solo quando la copia c'è stata e non è
   riuscita (404, errore, CAPTCHA); se l'url non è ancora nell'indice è «da copiare» e non conta.
   **`regole_fonti`** (in cima ad `asl.json`, Emilia-Romagna, Liguria, Toscana): la prova delle regole regionali
   in cima al file, un campo per regola: `{ "local_name": { "url", "verified", "proof", "nota" } }`. `nota` riporta
   la frase della pagina tra «…». Anche questi url si copiano.
   **Email nascoste ai robot.** Molti siti mostrano l'indirizzo con un piccolo script: curl vedeva solo
   «[email protected]» (Cloudflare: 123 copie in Sardegna, 3 in Calabria) o «Questo indirizzo email è protetto dagli
   spambots» (Joomla: URP e PEC delle USL toscane). `tools/email-nascoste.mjs` rimette l'indirizzo in chiaro prima di
   fare il testo: Cloudflare (`data-cfemail` e i link `/cdn-cgi/l/email-protection#…`, in esadecimale) e Joomla (le
   variabili `addy…` dello script; in Joomla 4 e 5 il tag `<joomla-hidden-mail>` in base64). Non è superare una
   protezione: è l'indirizzo che la pagina mostra a chiunque la apra. Nell'indice, `"email_nascoste": N`.
   **PDF** (moduli di tutela, allegati delle delibere): se sul server c'è `pdftotext`, il PDF si scarica (al massimo
   5 MB) e se ne salva il testo come per una pagina, con `"pdf": true` nell'indice. Un PDF fatto solo di immagini
   (scansione) non ha testo: è segnato e basta. Senza `pdftotext` i PDF sono segnati come oggi («file, non
   controllato»). Si installa una volta: `sudo apt-get install -y poppler-utils`. DOC, XLS e ZIP non si copiano.
   Si presenta con nome e sito nel `User-Agent`, una pagina alla volta, una pausa tra una pagina e l'altra, mai
   portali di prenotazione, login o CAPTCHA. Se un'ASL chiede di smettere, si toglie dalla lista.
   **Copia a richiesta, senza aspettare la notte:** `tools/copie-se-serve.sh` gira sul server ogni 15 minuti.
   Se in `main` sono cambiati `data/regioni/`, `data/numeri.json`, `tools/copie.mjs`, `tools/email-nascoste.mjs` o `tools/copie-richiesta.txt`, rifà subito
   la copia con lo stesso comando della notte; altrimenti esce senza fare niente. Basta quindi unire una pull
   request: nessuno deve entrare nel server. Per forzare una copia si cambia `tools/copie-richiesta.txt`.
   Si installa una volta, con una riga in `crontab -e` sul server:
   `*/15 * * * * /opt/guidasanita/tools/copie-se-serve.sh "<comando delle 3:30>" >> /opt/guidasanita/copie-se-serve.log 2>&1`.
   La prima volta che gira fa subito una copia; non parte se un'altra copia è già in corso.
   **Pagine fatte con JavaScript** (es. AST delle Marche, ULSS di Venezia, Azienda sanitaria dell'Alto Adige):
   scaricate così sono quasi vuote. Sul server c'è Playwright (nelle copie del 22/10/2026
   110 pagine hanno `"browser": true`): `tools/copie.mjs` le riapre in un browser vero (Chromium) e salva il testo
   che compare. Per reinstallarlo, nella cartella del sito:
   `cd /opt/guidasanita && npm install --no-save playwright && sudo npx playwright install --with-deps chromium`.
   Le pagine con CAPTCHA o controllo anti-robot non si copiano neanche così: sono segnate nell'indice e vanno
   sostituite con altre pagine ufficiali.
2. **Claude confronta e propone.** Una routine settimanale di Claude Code (cloud, inclusa nell'abbonamento) legge
   le copie, le confronta con `data/regioni/<regione>/*.json` e apre una pull request: per ogni numero trovato
   nella pagina ufficiale aggiorna `verified` e `proof: "pagina"`; per ogni numero non trovato, pagina rotta
   (404, indirizzo cambiato) o orario diverso scrive una riga «prima / dopo / fonte» e un `todo`. Non cancella
   mai un numero da sola. Se non c'è niente da cambiare, non apre niente.
3. **Una persona approva.** Il proprietario legge la pull request dal telefono e fa «merge»: è l'unico gesto umano
   che resta. I test (`tests/contatti.test.mjs`) continuano a bloccare numeri senza fonte, data o prova.

Cosa serve una volta sola: il server (chiave SSH del PC del proprietario, accesso solo con chiave, aggiornamenti
automatici), la chiave di deploy del server sul repository GitHub (scrittura, serve per il branch `copie-siti`),
la routine su https://claude.ai/code/routines. Costo: il server, 2,49 € + IVA al mese. Claude è incluso in Max.

Perché è lecito, in breve: contatti e orari di uffici pubblici sono informazioni pubbliche che l'ente ha l'obbligo
di pubblicare; non copiamo testi, prendiamo i dati e citiamo la fonte; non superiamo nessuna protezione (niente
login, niente CAPTCHA). Il metodo è scritto in `fonti.html` per trasparenza. Da far rileggere al legale insieme
alle lettere.

## 9. Aggiungere le lettere di una regione (checklist)

Una regione nuova parte con `"moduli": ["numeri-utili"]` in `data/regioni/index.json`. Ogni altro modulo si accende
**da solo**, aggiungendo il suo id a `moduli`, quando i dati che legge sono tutti provati. Finché un modulo è spento,
chi abita lì vede la parte valida in tutta Italia e il link ai numeri utili (`regionMissing()` in `js/flow.js`).
Senza `moduli` la regione si crede pronta per tutto: si toglie solo quando sono accesi tutti.

### Regola delle prove (vale per ogni campo qui sotto)

- **Numeri, indirizzi, PEC, email, orari**: solo dalla copia della pagina ufficiale fatta dal server (branch
  `copie-siti`), con `url` = la pagina copiata, `verified` = il giorno della copia, `proof: "pagina"`
  ([regola-numeri.md](regola-numeri.md)). Un estratto del motore di ricerca non basta per un numero, una PEC o
  l'indirizzo di una lettera.
- **Come si fa** (`how_to`, `what_next`, `scelta_medico.how`…): le parole della pagina ufficiale copiata, dette in
  italiano semplice ([regola-italiano.md](regola-italiano.md)), senza aggiungere niente. Una regola di una sola
  regione si scrive «In Umbria: …».
- **Date e cifre regionali** (`regime_since`, `booking_deadline_days`…): dal testo dell'atto (DGR, messaggio INPS),
  anche da un estratto (`proof: "estratto"`, da rileggere per intero al primo giro), con la fonte in `sources`.
- Se una prova manca, il campo **non si scrive** e si annota nel `todo` dell'azienda. Mai un dato «probabile».

### Cosa legge ogni modulo

Campi di un'azienda in `asl.json` (`asl[]`), salvo dove è scritto `inps.json`. «Facoltativo» vuol dire che senza il
campo il modulo funziona e dice una frase generica (per esempio «chiedi all'URP»).

| Modulo | Campi regionali necessari | Facoltativi | Chi li controlla |
|---|---|---|---|
| tutti | `id`, `name`, `province` (una per azienda), `phones[]`, `emails[]`, `sources[]`, `site_url`; una sede INPS con lo stesso `id` | `contacts[]` con `topic` | `contatti.test` (numeri), `coerenza.test` (id, province, topic, sede INPS) |
| tutti quelli con una lettera all'azienda (sotto) | `nome_lettera` (se la regione non ha `asl_intestazione`); con `aziende_multiple`: `sub_areas` oggetto con `id`, `label`, `nome_lettera` e `pec`, `emails` o `send_to` | `sub_areas` anche senza `aziende_multiple` (uffici diversi nella stessa azienda) | `coerenza.test` (anche ogni zona con i campi del modulo), `aziende.test`, `browser.cjs` (intestazione e indirizzo della lettera in ogni regione) |
| `liste-attesa` | `channel`, `letter_mode` (`email`, `pec`, `official_form`, `portal`), `how_to`, `documents_required[]`, `what_next[]`, `notes[]`, `details[]`, `last_verified`; con `email`/`pec`: `send_to` o `pec`; con `official_form`: `form_url` e `form_fields[]` (`label`, `source`); con `portal`: `portal_url` | `info_url`, `fast_track`, `sub_areas`, `local_name` e `regional_channel` in cima al file | `coerenza.test` («ogni modulo acceso ha i dati che legge»), `confronta-copie` (PEC e `send_to` in una copia dell'azienda), `combinazioni.cjs` (per ora solo Sicilia) |
| `cartella-clinica` | `pec` o `emails[]` (il reclamo se l'ospedale è dell'azienda) | `contacts` `topic: "cartelle"`, uno per ospedale, anche quelli delle aziende ospedaliere (dominio in `official_domains`, come il Policlinico di Palermo nell'ASP di Palermo) | `coerenza.test`, `contatti.test` |
| `medico-famiglia` | `scelta_medico: { how, url }`; `emails[]` o `pec` (la lettera va a `generalContact()`: l'URP, se no la PEC) | `contacts` `topic: "anagrafe"` (sportelli scelta e revoca); `scelta_medico.url_label`, il testo del pulsante di `url` (se manca: «Sito dell'<sigla>»; per esempio «Sito della Regione») | `coerenza.test` |
| `assistenza-domiciliare` | `emails[]` o `pec` | `contacts` `topic: "casa"` (PUA), `pua_url` | `coerenza.test` |
| `cure-palliative` | `emails[]` o `pec` | `contacts` `topic: "palliative"` (rete, hospice) | `coerenza.test` |
| `ausili` | `pec` (la lettera va alla PEC) | `contacts` `topic: "protesica"` | `coerenza.test` |
| `prevenzione` | niente | `contacts` `topic: "screening"` | — |
| `invalidita` | `inps.json`: per ogni provincia `id`, `name`, `regime` (`old`/`new`, mai `null`), `regime_since` se `new`, `pec`, `pec_verified`, `address`, `url`, `verified`, `proof` | `hours` | `coerenza.test`, `contatti.test` (sedi INPS), `confronta-copie` (PEC, indirizzo, orari nella copia della sede), `combinazioni.cjs` (tutte le regioni con `invalidita` accesa) |

Due controlli prima di accendere un modulo con una lettera all'azienda:

1. **Una provincia, più aziende.** I moduli cercano l'azienda per provincia. Se una provincia ha due aziende (in
   Umbria la provincia di Perugia: USL Umbria 1 e, per Foligno, Spoleto e Valnerina, USL Umbria 2) la lettera
   all'URP o alla PEC va all'una o all'altra secondo il comune. L'azienda ha `aziende_multiple: true` e servono le
   zone in `sub_areas`, ognuna con il suo `nome_lettera` e i suoi indirizzi (sezione 1, con l'elenco delle province
   da fare): finché mancano, `coerenza.test` tiene spenti quei moduli.
2. **Il nome nell'intestazione.** Le lettere scrivono `nome_lettera` («USL Umbria 2»); senza, `asl_intestazione` +
   «di» + provincia («Azienda Sanitaria Provinciale di Palermo», solo in Sicilia). «USL di Perugia» o «ATS di
   Genova» non esistono: per questo, fuori dalla Sicilia, `coerenza.test` vuole `nome_lettera` in ogni azienda di una
   regione con una lettera accesa.

### I passi

1. Leggi le copie della regione (`git show origin/copie-siti:copie/<regione>/indice.json`: url → file) e riempi i
   campi della tabella con le prove.
2. **Indirizzi mancanti → pagine da far copiare al server.** Per ogni campo che manca cerca la pagina ufficiale (solo i
   domini ufficiali dell'azienda, della Regione, delle aziende ospedaliere, dell'INPS) e mettila in `pagine[]`
   dell'azienda (`{ "tipo": "cartelle", "url": "…" }`; `tools/copie.mjs` copia `site_url`, `info_url`, `form_url`,
   `portal_url`, `guardia_medica_url`, `pua_url`, `scelta_medico.url`, `phones[].url`, `contacts[].url` e
   `pagine[].url`, anche i PDF; sezione 8). Per una regola regionale in cima al file la pagina va in `regole_fonti`; per
   il regime INPS in `pagine[]` di `inps.json`. Il campo resta nel `todo`.
3. Unisci la PR: il server copia le pagine nuove entro 15 minuti (`tools/copie-se-serve.sh`).
4. **Si accende il modulo dopo la copia.** Leggi le copie nuove, riempi i campi, aggiungi il modulo a `moduli`.
   `npm test` dice se manca qualcosa («acceso ma manca …»).
5. Controlli: `npm run pagine`, `npm test`, `node tools/confronta-copie.mjs <copie> <regione> --noti tests/copie-noti.txt --base origin/main`,
   e i test col browser. `tests/browser.cjs` percorre da solo ogni modulo acceso di ogni regione (una provincia a
   turno, la zona se c'è, fino alla lettera) e guarda intestazione e indirizzo; l'invalidità in tutte le province la
   prova `tests/combinazioni.cjs`. Per provare in fretta solo questi percorsi: `SOLO_REGIONI=1 node tests/browser.cjs <indirizzo>`.
6. Una riga nel `CHANGELOG.md`, con le fonti.

### Umbria, 22/10/2026

Acceso: `invalidita` (sedi INPS di Perugia e Terni dalle copie; riforma dal 01/01/2025 a Perugia e dal 01/03/2026 a
Terni). Spenti, e cosa manca:

- `liste-attesa`: nessuna pagina copiata sul percorso di tutela. In Umbria, se il CUP non trova posto nei tempi
  della classe, mette la ricetta in «presa in carico» e ricontatta la persona: serve la pagina che lo dice (in
  `pagine[]`: USL 1, USL 2, Azienda Ospedaliera di Terni, Regione), poi `letter_mode`, `how_to`, `what_next` e a chi
  si scrive se nessuno richiama. Poi le zone in `sub_areas` per la provincia di Perugia (sezione 1).
- `cartella-clinica`, `medico-famiglia`, `assistenza-domiciliare`, `cure-palliative`, `ausili`: le pagine delle
  cartelle cliniche (USL 1, USL 2, Aziende Ospedaliere di Perugia e Terni), di protesica, scelta e revoca e cure
  palliative sono in `pagine[]`; dopo la copia servono gli uffici e, per la provincia di Perugia, le due zone in
  `sub_areas` (USL Umbria 1 e USL Umbria 2, con `nome_lettera` e indirizzi). Terni ha già `nome_lettera`
  («USL Umbria 2»).
- `prevenzione`: i numeri dello screening (pagine in `pagine[]`); il modulo dà già il risultato nazionale.
