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
- **Coerenza tra pagine diverse**: la sesta rilettura (lo stesso fatto detto in modo diverso in pagine diverse,
  i testi di `data/moduli.json`, i testi delle regioni) si è fermata a metà; da rifare.
