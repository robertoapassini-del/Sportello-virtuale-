# Registro delle modifiche

Ogni modifica ai file `data/*.json` va annotata qui, con la fonte.

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
