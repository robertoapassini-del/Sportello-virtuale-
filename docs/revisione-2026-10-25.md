# Revisione completa dei contenuti (25/10/2026)

Perché: il proprietario ha trovato sulla pagina dei codici del pronto soccorso una frase sbagliata e
contraddittoria («Sono tempi massimi. Se arriva una persona più grave, passa prima di te»). I test controllano
cifre, fonti e parole, ma non il senso. Allora abbiamo riletto tutto il sito, frase per frase, contro le copie
delle pagine ufficiali fatte dal server (branch `copie-siti`, cartella `copie/nazionali/`).

Come: cinque riletture separate, una per area (urgenze e lavoro; invalidità e 104; esenzioni e aiuti; visite,
medico e documenti; cure a casa e prevenzione). Poi ogni problema è stato ricontrollato sulla copia della fonte
prima di correggerlo. Dove la prova non c'era, la frase è stata tolta o resa più prudente, mai riscritta a memoria.

Da adesso la rilettura è un passo fisso di ogni modifica: [protocollo-test.md](protocollo-test.md), punto 4.
Gli errori che si riconoscono da come sono scritti sono in `tests/errori-noti.test.mjs` (blocco del 25/10/2026).

## Corretti

### Sbagliati (la fonte dice un'altra cosa)
- **Congedo straordinario e permessi 104** (`legge-104/congedo-straordinario/`): si possono avere per la stessa
  persona, da due familiari, «purché non negli stessi giorni» (scheda INPS). Il sito diceva di no.
- **Prolungamento del congedo parentale**: entro i **14 anni** del figlio, non 12 (scheda INPS aggiornata;
  `data/rules-legge-104.json`).
- **Permessi 104 e revisione del verbale**: di solito non serve una domanda nuova (scheda INPS).
- **Aggravamento dell'invalidità**: si può chiedere anche durante un ricorso (schede INPS).
- **Dati per il pagamento (AP70) nel nuovo regime**: si mandano dopo il certificato, non «con la domanda».
- **Spese per l'infermiere**: per chi ha una disabilità sono deducibili per intero, anche pagate in contanti
  (Agenzia delle Entrate). Il sito diceva «in contanti non si può».
- **Fascicolo sanitario**: i documenti delle strutture private ci vanno dal 2020 (fascicolosanitario.gov.it). Il
  «31 marzo 2026» non aveva fonte.
- **RSA in Sicilia**: i primi 60 giorni, e i moduli Alzheimer, li paga tutti l'ASP; dopo, metà ASP e metà Comune
  (D.A. 1058/2025; `data/rules-rsa.json`).
- **Esenzione E02**: il limite più alto vale «in presenza del coniuge», anche se ha un reddito suo (il calcolo
  chiedeva «coniuge a carico»). E01 non vale per i familiari a carico.
- **Esenzione C05 e C06**: le definizioni giuste (residuo visivo fino a 1/10; sordità dalla nascita o prima di
  imparare a parlare).
- **Esenzione, dichiarazione falsa**: si rischia anche la denuncia penale, non solo «una multa».
- **Esenzione online**: sul Sistema Tessera Sanitaria nelle regioni che lo hanno chiesto; la frase su ASPConTe
  di Catania non aveva fonte.
- **Assegno di inclusione**: il rinnovo si ripete, ogni volta per 12 mesi; c'è il passo del patto digitale (PAD);
  la soglia di 8.190 euro vale anche con familiari con disabilità grave.
- **Bonus psicologo**: l'ultimo periodo per la domanda è stato dal 15/09 al 14/11/2025; non è un appuntamento di
  ogni anno.
- **DPC in Sicilia**: il decreto citato dalla Regione è il D.A. 1857/2017 (il «D.A. 367/2025» non aveva fonte).
- **Guardia medica**: fa la ricetta per le medicine che non possono aspettare, non «dà le medicine».
- **Cure palliative e dolore**: la L. 38/2010 dice che in ospedale il dolore si misura e si scrive in cartella;
  il «niente ticket» viene dai LEA, non dalla L. 38.
- **Pronto soccorso**: i codici numerati li hanno decisi Stato e Regioni nel 2019, le Regioni li hanno adottati
  dopo; il ticket per i casi non urgenti dipende dalla Regione, non da «alcune regioni».
- **ASPConTe** «non richiede lo SPID»: la pagina dell'ASP Catania dice il contrario.
- **ASP**: si chiama così anche l'azienda sanitaria di Potenza (Basilicata).
- **Liste d'attesa**: «visita tra sei mesi: dipende dalla lettera» era illogico (sei mesi superano ogni classe);
  il sollecito per la classe B ora parte dopo i 5 giorni del richiamo, non dopo 10.
- **Numeri utili**: tolte le frasi senza fonte (112 «senza credito», 1522 «altre lingue» e «bolletta»,
  dipendenze «anonimo», centri antifumo «gratuiti»).

### Più ampi della fonte (mancava una condizione)
- **Triage**: la descrizione per Google ora dice «con un afflusso normale».
- **Invalidità, nuovo regime**: i tempi si fermano per 60 giorni se l'INPS chiede documenti; chi ha più di 70
  anni e non è autosufficiente segue la vecchia procedura fino al 31/12/2026 (anche nel modulo).
- **Ricorso (ATP)**: l'INPS paga dopo il decreto del giudice e il controllo degli altri requisiti; se una parte
  contesta, la causa continua. Per i 6 mesi: per stare tranquilli si conta dalla data del verbale.
- **Collaudo degli ausili (Sicilia)**: tocca a chi riceve l'ausilio andarci entro 20 giorni; se non ci va senza
  motivo, l'ASP può far pagare l'ausilio.
- **Silenzio-assenso per gli ausili (Sicilia)**: tolto finché non è letto il D.A. 20/12/2011; il sollecito chiede
  l'autorizzazione senza contare sul silenzio.
- **Disdetta al CUP**: «puoi dover pagare il ticket», e le eccezioni sono i casi di forza maggiore.
- **Percorso di tutela**: l'ASL cerca il posto nelle sue strutture, in quelle convenzionate o in intramoenia.
- **Cartella clinica**: il ricorso al TAR vale per gli ospedali pubblici.
- **Guardia medica**: gratis per chi ha il medico nella regione; il limite di 3 giorni del certificato lo
  scrivono molte aziende, non l'accordo nazionale.
- **Accompagnamento**: per bambini e over 65 non serve la percentuale.
- **Contrassegno**: anche chi cammina con molta difficoltà; tolta la frase sul divieto di sosta senza fonte.
- **Altri «sempre» e «mai»**: prelievo a casa (era la regola di Enna), dimissione protetta («parte subito»),
  hospice («nessun orario di visita»), ambulanza «gratis solo nelle emergenze», tessera rubata («prima la
  denuncia»), medico pieno (ci sono le deroghe), piano terapeutico (6 o 12 mesi «di solito»), consultorio.

## Da verificare (non corretti: manca la fonte nelle copie)
- **Detrazione al 19% di dentista e psicoterapia**: va detta la franchigia di 129,11 euro? Serve la pagina
  dell'Agenzia delle Entrate (risponde 404, `docs/piano-contenuti.md` sezione 5).
- **IVA al 4% sull'auto con la 104**: ora scritto «in alcuni casi»; servono i requisiti dall'Agenzia delle Entrate.
- **Cure fuori regione**: «qualsiasi ospedale pubblico o convenzionato» e le spese di viaggio da scaricare.
- **E01 «dai 65 anni compiuti»**: già nel `notes_internal` di `data/rules-esenzione.json`.
- **Soglia ISEE del dentista** («intorno agli 8.000 euro», prova «secondaria»).
- **Regno Unito e tessera europea (TEAM)**: tolto dall'elenco finché non c'è una fonte.
- **Note legali, «minori di 14 anni»**: coerenza con i numeri per bambini e ragazzi.
- **Silenzio-assenso e 20 giorni degli ausili in Sicilia**: leggere il D.A. 20/12/2011 (DA-VERIFICARE-A-MANO.md).
- **Accompagnamento e RSA in Sicilia**: nei primi 60 giorni l'ASP paga tutta la retta. Conta come «ricovero a
  totale carico» che sospende l'indennità dopo 29 giorni? Nessuna fonte INPS nelle copie: chiedere a un patronato.
- **Lombardia, «la tua ATS»**: i servizi li danno le ASST; l'avviso «URP della tua ATS» va scritto meglio
  (`asl_label` in `data/regioni/index.json`).
- **Palermo, «L'ASP ti telefona entro 2 giorni»** (`data/regioni/sicilia/asp.json`): manca la frase della fonte.

## Seconda rilettura: coerenza tra pagine (25/10/2026)

Due riletture in più: lo stesso fatto in pagine diverse; `data/moduli.json`, testi comuni dei JS, pagine delle
aree e testi delle regioni. Corretti:
- **Esenzione E04**: anche qui il limite di 11.362,05 euro vale «in presenza del coniuge» (modulo di
  autocertificazione): pagina e calcolo ora fanno la stessa domanda per E02 ed E04.
- **Cure palliative**: titolo e descrizioni dicevano «gratis per legge (L. 38/2010)»; ora «senza ticket perché
  sono nei LEA», come le sottopagine.
- **Moduli**: «Esenzione per età o per reddito» (nessun codice dipende solo dall'età); «congedo di 2 anni» →
  «fino a 2 anni»; vaccini «per adulti e bambini» → «per gli adulti», come la pagina; «Carrozzina… come averli
  gratis» → «chi li ha gratis e come»; l'area «Visite ed esami» non prometteva più la prenotazione, che sta in
  «Tessera e ricette».
- **Piè di pagina**: «Non salviamo niente» ora dice anche che il sito ricorda la regione scelta.
- **PEC**: il patronato manda le pratiche all'INPS; per le lettere all'ASL o all'ospedale bisogna chiedere.
- **Psicologo**: «Controlla sempre con la tua ASL o, per il bonus psicologo, con l'INPS».
- **Tempi di 7 giorni per i referti**: «dalla richiesta scritta», come nella pagina della cartella clinica.
- **Accompagnamento**: «più di un mese» → «più di 29 giorni», con la condizione dell'assistenza completa.
- **Tessera sanitaria**: la nuova arriva «di solito» prima della scadenza.
- **RSA**: conta l'ISEE sociosanitario della persona ricoverata; la dimissione protetta la prevedono le regole
  della Regione.
- **Piemonte, Friuli-Venezia Giulia, Puglia**: per il medico, al posto del certificato di residenza va bene anche
  l'autocertificazione.

## Terzo giro (26/10/2026): pagine, schermate dei moduli, copie nuove

Tre riletture con le copie della notte del 26/10: pagine A–L, pagine M–Z con la home, e il testo che si vede
davvero nelle schermate dei moduli e nelle lettere (provato nel browser, con date ai bordi e quattro regioni).
Il confronto automatico con le copie (`tools/confronta-copie.mjs nazionali`) ha trovato un errore del server.

Corretti:
- **Copie**: la pagina «Request Rejected» del filtro dell'ISS era salvata come copia; ora è riconosciuta
  come anti-robot (`tools/copie.mjs`, `tests/copie-giro.test.mjs`).
- **Cure all'estero**: la direttiva 2011/24/UE vale nell'UE e in Norvegia, Islanda e Liechtenstein, non in
  Svizzera (linee guida nazionali). Errore introdotto nel primo giro.
- **Congedo straordinario**: si passa al familiare dopo solo se i precedenti mancano, sono morti o hanno una
  malattia invalidante; l'indennità è l'ultima retribuzione (voci fisse e continuative), non «lo stipendio base».
- **Bonus psicologo**: 1.500 euro solo con ISEE sotto 15.000 (anche nella pagina dello psicologo); il codice
  arriva se la domanda è accolta.
- **Assegno di inclusione**: conta la famiglia dell'ISEE, non lo stato di famiglia; il Supporto per la
  formazione e il lavoro si propone solo se manca il requisito della famiglia.
- **Liste d'attesa (schermate)**: l'intramoenia la organizza l'ASL e si paga il ticket «se lo devi pagare»;
  non va prenotata da soli.
- **Ricorso (schermate)**: si chiede la data scritta sul verbale, la più prudente.
- **Invalidità**: la commissione della vecchia procedura dipende dalla Regione; il sollecito del nuovo regime
  dice che non è stata comunicata nessuna sospensione.
- **Privacy**: «Non salviamo niente» → «Non salviamo quello che scrivi» su tutte le pagine; la privacy dice che
  restano la regione e le parole della ricerca.
- **Altri**: trasporto in ambulanza da scaricare (per le persone con disabilità), contrassegno («multa», non
  «ritiro»), SPID (alcuni gestori chiedono un costo), ricetta in farmacia «di solito» con la sola tessera,
  accompagnamento per bambini e over 65 nelle descrizioni, collaudo (regola delle procedure dell'ASP di
  Catania), piano terapeutico (niente «ricetta ogni mese», niente «un giorno o due»), screening (dove si fanno
  lo dice la lettera di invito), neuropsichiatria anche con il medico di famiglia, Telefono Amico nei numeri utili,
  pronto soccorso «ASL di Cagliari», duplicato della tessera (solo con il chip), numero del Sistema TS
  (assistenza, non «tessera persa»), «è di oggi» al posto di «sono passati 0 giorni», note di E02 ed E04.

Ancora da verificare (manca la fonte nelle copie, o serve un lavoro sui dati):
- **Lazio, sollecito del percorso di tutela**: in Lazio si usa il Pass di garanzia online, ma il sollecito parla
  di una lettera con protocollo. Serve un testo per le aziende con `letter_mode: 'portal'`.
- **Lombardia, ATS e ASST**: nelle schermate (liste d'attesa, invalidità, cartella clinica, cure a casa, piano
  terapeutico) la sigla è «ATS», ma i servizi sono delle ASST. Serve una sigla di servizio separata.
- **Richiamo del CUP (5, 10, 15, 30 giorni)**: la nota di `callback_days` in `data/rules.json` non ha la frase
  del PNGLA, e la copia del PNGLA non ha testo.
- **Scadenza oggi**: «torna qui quel giorno» quando quel giorno è oggi (invalidità, cartella clinica, ausili).
- **Fonti senza testo nelle copie**: `rules-medico.json` (la pagina SISAC non ha le cifre; c'è un ACN nuovo del
  26/06/2026), `rules-ricorso.json` (D.L. 269/2003 art. 42, art. 152 disp. att. c.p.c., DM del 22/04/2025;
  giustizia.it dice ancora 12.838,01 euro), certificato sostitutivo della tessera (6 mesi), numeri verdi
  dell'ISS (la copia di stanotte era bloccata), numero del Sistema TS (non è nel testo della pagina).
- **Prima copia gratis della cartella clinica**: rileggere la FAQ del Garante su cosa è gratis.
- **Cure all'estero in Sicilia, 30 giorni dal rientro**: il PDF della direttiva regionale non è nelle copie.

## Gruppo 1 corretto (26/10/2026)
- **Lombardia**: sigla dei servizi «ASST» (`asl_label_servizi`), l'ATS resta per siti, numeri, URP e screening.
- **Lazio**: il sollecito parla del Pass di garanzia (`request_name`), non di una lettera con protocollo.
- **Scadenza oggi**: «torna qui il giorno dopo», e «Oggi è l'ultimo giorno».

## Gruppo 2, primo passo (27/10/2026): fonti da copiare

Da questa sessione i siti ufficiali non si aprono: le fonti si leggono solo nelle copie del server. Con la ricerca
abbiamo trovato gli indirizzi giusti e li abbiamo messi in `data/fonti-nazionali.json`, tema «verifiche»: il server li
copia dopo l'unione, poi si leggono e si correggono le frasi.
- **Medico di famiglia**: massimale di 1.500, scelta del medico dai 6 anni e scelta temporanea da 3 mesi a 1 anno
  letti nell'ACN 2024 (rep. 51/CSR), che era già nelle copie. Nuovo nella pagina: prima della scelta temporanea
  l'azienda cancella la persona dall'elenco del medico della residenza.
- **Gratuito patrocinio**: la cifra del sito (13.659,64 euro) è quella del decreto del 22/04/2025; la pagina di
  giustizia.it è vecchia. Da confermare sulla Gazzetta n. 159 dell'11/07/2025.
- **In copia dalla prossima notte**: Gazzetta del PNGLA (S.O. n. 32 del 24/08/2026), guida dell'Agenzia delle Entrate
  sulla disabilità, accordo dei pediatri (rep. 28/CSR del 18/03/2026), ausili in Sicilia (D.A. 780/2021, che forse
  sostituisce il D.A. del 2011), cure all'estero in Sicilia (direttiva 9368/2026), FAQ del Garante sulle cartelle
  cliniche, messaggio INPS 18291/2011 sul ricovero gratuito, L. 537/1993 (esenzione E01).

## Gruppo 2, secondo passo (27/10/2026): copie lette

Lette le copie della notte del 27/10 (tema «verifiche»).
- **Gratuito patrocinio**: confermato 13.659,64 euro (Gazzetta n. 159 dell'11/07/2025 e Corte d'appello dell'Aquila).
- **Richiamo del CUP**: la frase del PNGLA dà 5, 10, 15 e 30 giorni. Più avanti lo stesso piano scrive «massimo 20
  giorni per le priorità P». Il sito tiene 30: da chiarire con la Regione o il Ministero.
- **Accompagnamento e RSA in Sicilia**: chiarito dal messaggio INPS 18291/2011. Il ricovero è gratuito anche se la
  parte della persona la paga un ente pubblico. Nei primi 60 giorni pagati dall'ASP valgono le regole del ricovero
  gratuito (sospensione dai 30 giorni, se la struttura dà tutta l'assistenza).
- **Detrazione al 19%**: detta la franchigia di 129,11 euro per dentista e psicologo (guida dell'Agenzia delle Entrate).
- **IVA al 4% sull'auto**: conta cosa è scritto nel verbale, e ci sono limiti di cilindrata (stessa guida).
- **Prima copia gratis della cartella clinica**: confermata dalla FAQ del Garante; il sito già lo scrive bene.

Ancora aperti:
- **Franchigia di 129,11 euro**: la guida non dice se si conta sul totale delle spese dell'anno, come scrive la
  pagina dei consigli pratici dell'assistenza a casa. Serve la scheda dell'Agenzia delle Entrate sulle spese sanitarie.
- **E01**: la L. 537/1993 dice «età superiore a sessantacinque anni». Resta da chiarire se vale dal compleanno.
- **Pediatri (rep. 28/CSR)**: la copia ha solo l'intesa, non il testo dell'accordo. Serve l'url dell'allegato.
- **Ausili in Sicilia (D.A. 780/2021)**: la copia ha solo la pagina con i link. Serve l'url del PDF del decreto.
- **Cure all'estero in Sicilia (direttiva 9368/2026)**: l'url risponde 404. Serve un indirizzo nuovo.
