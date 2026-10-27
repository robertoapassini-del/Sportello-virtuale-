# Registro delle modifiche

Ogni modifica ai file `data/*.json` va annotata qui, con la fonte.

## 27/10/2026 — Fonte del testamento biologico corretta
- `data/fonti-nazionali.json`, tema «dat»: al posto della Gazzetta n. 297/2017 (che non contiene la legge) il testo vigente della L. 219/2017 su Normattiva. La legge è nella Gazzetta n. 12 del 16/01/2018.

## 27/10/2026 — Testamento biologico, stranieri, consultorio
- `cure-palliative/testamento-biologico/` (pagina nuova): le DAT della L. 219/2017, chi le fa, dove (notaio, Comune, azienda sanitaria, consolato), senza tasse, il fiduciario, la banca dati nazionale; gli sportelli toscani. Fonte: Regione Toscana (la copia della Gazzetta indicata nel tema «dat» non contiene la legge: indirizzo sbagliato, da correggere).
- `tessera-sanitaria/stranieri/` (pagina nuova): l'iscrizione con il permesso di soggiorno, l'iscrizione volontaria, il codice STP (6 mesi, rinnovabile); i Centri ISI del Piemonte e i minori in Emilia-Romagna. `data/rules-tessera-sanitaria.json`: «stp_mesi» e «stp_minori_medico_fino_anni_emilia_romagna» con la frase della fonte.
- `prevenzione/consultorio/` (pagina nuova): cosa fa il consultorio, l'accesso senza ricetta, gli spazi per i ragazzi (Emilia-Romagna, Toscana, Lazio), Piemonte, Lombardia. `data/rules-prevenzione.json`: «consultorio_ragazzi» con la frase della fonte.
- Copie del server del 27/10/2026, sera.

## 27/10/2026 — Fisioterapia e logopedia con il Servizio sanitario
- `prenotare-cup/riabilitazione/` (pagina nuova): la ricetta per la visita dal fisiatra, la prenotazione al CUP, il progetto riabilitativo individuale; le regole delle aziende di Torino, Liguria (ASL3) e Umbria 1. Letto nelle copie del server del 27/10/2026.
- `data/rules-prenotare-cup.json`: 3 fonti nuove. Il trasporto sanitario non urgente aspetta altre copie: per ora c'è solo la Toscana.

## 27/10/2026 — Gravidanza: visite ed esami senza ticket
- `esenzione-ticket/gravidanza/` (pagina nuova): cosa non si paga in gravidanza (DPCM 12/01/2017, art. 59, letto nel vademecum dell'Emilia-Romagna), il codice M, l'Agenda di gravidanza del Piemonte, il libretto della Toscana, il NIPT gratis in Emilia-Romagna. Copie del server del 27/10/2026.
- `data/rules-esenzione.json`: «gravidanza_nipt_emilia_romagna» (dal 2024, tra la 10ª e la 13ª settimana) con la frase della fonte, una scheda per cifra; 4 fonti nuove. `tests/citazioni.txt`: «art. 59 | DPCM 12/01/2017».

## 27/10/2026 — Malattia cronica o rara: niente ticket, come si chiede
- `esenzione-ticket/malattia-cronica-rara/` (pagina nuova): cosa copre l'esenzione, il codice sulla ricetta, cosa portare all'ASL, la malattia rara e il codice R99, le regole delle aziende di Palermo e Torino. Letto nelle copie del server del 27/10/2026 (ASP Palermo, ASL Città di Torino, vademecum dell'Emilia-Romagna, Regione Umbria).
- `data/rules-esenzione.json`: 4 fonti nuove. Il PDF dei codici della Lombardia non è stato copiato (la copia è la pagina del portale).

## 27/10/2026 — Franchigia di 129,11 euro sul totale dell'anno
- `dentista/chi-ha-diritto/` e `psicologo/bonus-psicologo/`: il 19% si calcola sulla parte che supera 129,11 euro, «sul totale delle spese mediche dell'anno». Fonte: guida dell'Agenzia delle Entrate «Le spese sanitarie» (copia del 27/10/2026), ora nella provenienza di `data/rules-dentista.json` e `data/rules-psicologo.json`.
- `docs/revisione-2026-10-25.md`: chiuso il punto della franchigia; la direttiva siciliana 9368/2026 e il PDF del D.A. 780/2021 rispondono 404.

## 27/10/2026 — I vaccini dei bambini
- `prevenzione/vaccini-bambini/` (pagina nuova): i 10 vaccini obbligatori da 0 a 16 anni, i 4 gratis non obbligatori, nido e scuola dell'infanzia, la multa, l'esonero; le regole di Piemonte e Toscana per la scuola. Letto nelle copie del server del 27/10/2026 (ISS, Regione Piemonte, Regione Toscana).
- `data/rules-prevenzione.json`: «vaccini_bambini» con la frase dell'ISS; 4 fonti nuove. `prevenzione/vaccini/`: link alla pagina nuova.

## 27/10/2026 — Le medicine in farmacia: il ticket regione per regione
- `fascicolo-e-ricetta/ticket-farmaci/` (pagina nuova): classe A e classe C, la differenza col generico, e il ticket dei farmaci di 7 regioni (Basilicata, Campania-ASL Salerno, Emilia-Romagna, Liguria-ASL3, Lombardia, Piemonte, Umbria), letto nelle copie del server del 27/10/2026.
- `data/rules-fascicolo-e-ricetta.json`: «ticket_farmaci_euro» e «ticket_farmaci_piemonte_abolito_anno» con la frase della fonte, 8 fonti nuove. In Basilicata la data di inizio della quota non è chiara (le note della Regione dicono 1° settembre o 1° ottobre 2026): il sito non la scrive.
- In Veneto la pagina della Regione racconta la quota del 2002 al passato: non scritta finché non c'è la cifra di oggi.

## 27/10/2026 — Cambio del medico online, regione per regione
- `medico-famiglia/come-si-fa/`: elenco nuovo con il servizio online di 12 regioni (Abruzzo, Basilicata, Calabria, Campania, Friuli-Venezia Giulia, Liguria, Lombardia, Piemonte, Sardegna, provincia di Trento, Umbria, Veneto), più la Sicilia che c'era già. Letto nelle copie del server del 27/10/2026; dove la pagina è di un'azienda sanitaria, la frase lo dice.
- `data/rules-medico.json`: «online_attesa_giorni» (Lombardia 30, ASL3 Liguria 31) con la frase della fonte, e 12 fonti nuove.
- `tests/cifre.test.mjs`: tolta l'eccezione dei 30 giorni di Trapani, ora la cifra è nei dati.
- Copie che mancano: Emilia-Romagna, Lazio, Molise, Puglia, Toscana, Valle d'Aosta (la pagina non è stata copiata).

## 27/10/2026 — Fonti da copiare per il terzo giro
- `data/fonti-nazionali.json`: temi nuovi «dat» (testamento biologico, L. 219/2017), «stranieri» (iscrizione, STP ed ENI) e «consultorio», con le pagine ufficiali delle Regioni; `data/regioni/lazio/fonti.json`: la pagina dei consultori del Lazio. Il server le copia; le pagine si scrivono dalla copia.

## 27/10/2026 — Fonti da copiare per il secondo giro
- `data/fonti-nazionali.json`: temi nuovi «esenzione-patologia», «gravidanza», «trasporto-sanitario», con le pagine ufficiali delle Regioni (Lombardia, Emilia-Romagna, Umbria, Piemonte, Toscana).
- `data/regioni/<regione>/fonti.json`: le stesse voci con le pagine delle aziende sanitarie (ASL3 Liguria, ASP Palermo, ASL Città di Torino, USL Umbria 1), più «riabilitazione». Il server le copia; le pagine si scrivono dalla copia.

## 27/10/2026 — Fonti nuove da copiare: cambio medico online, ticket dei farmaci, vaccini
- `data/regioni/<regione>/fonti.json`: voce nuova «medico-online» in 19 regioni (pagine ufficiali del cambio del medico online) e «ticket-farmaci» in 14 regioni. Il server le copia; le frasi si scrivono dopo, dalla copia.
- `data/fonti-nazionali.json`: tema nuovo «vaccini-bambini» (L. 119/2017, ISS, pagine di 4 Regioni). Nel tema «verifiche»: il PDF del D.A. 780/2021, la direttiva siciliana 9368/2026 con «www» e la pagina della Regione sulle cure all'estero, la scheda dell'Agenzia delle Entrate sulle spese sanitarie.
- `medico-famiglia/come-si-fa/`: tolta una frase ripetuta.

## 27/10/2026 — Pronto soccorso: il ticket regione per regione
- `pronto-soccorso/il-ticket/` (pagina nuova): la regola nazionale (L. 296/2006: 25 euro per il codice bianco non seguito da ricovero; non pagano i minori di 14 anni, i traumi e gli avvelenamenti acuti) e le regole di 17 regioni, lette nelle copie del server del 27/10/2026. Dove la fonte è di un'azienda sanitaria, la pagina dice quale.
- `data/rules-pronto-soccorso.json`: cifre nuove con la frase della fonte (Emilia-Romagna 25 euro e fino a 36,15 per ricetta; ASL 1 Liguria fino a 61,15 euro ed entro 7 giorni; Puglia 10 euro per ricetta; ASL CN1 trauma entro 36 ore; Toscana sud est fino a 50 euro; Veneto osservazione oltre 4 ore) e 24 fonti nuove.
- `pronto-soccorso/`: al posto dell'elenco delle regioni, la regola di base e il link alla pagina nuova.
- `tests/provenienza.test.mjs`: un intero scritto con i centesimi nella fonte («€ 10,00») ora vale come la cifra 10. Provato con l'errore messo apposta (10 → 11): il test fallisce.

## 27/10/2026 — Fonti da verificare: letto le copie della notte
- `data/rules-ricorso.json`: il limite del gratuito patrocinio (13.659,64 euro) ora ha la frase della Gazzetta n. 159 dell'11/07/2025 (decreto del 22/04/2025); `tests/citazioni.txt`: «art. 76 comma 1».
- `data/rules.json`: il richiamo del CUP (5, 10, 15, 30 giorni) ora ha la frase del PNGLA 2025-2027 (Gazzetta S.O. 32 del 24/08/2026). Più avanti il piano scrive «massimo 20 giorni per le priorità P»: il sito tiene 30, da chiarire.
- `data/rules-accompagnamento.json`: fonte nuova, messaggio INPS 18291/2011. `rsa/quanto-si-paga/`: il ricovero conta come gratuito anche se la parte della persona la paga un ente pubblico; in Sicilia i primi 60 giorni pagati dall'ASP sono ricovero gratuito.
- `dentista/chi-ha-diritto/` e `psicologo/bonus-psicologo/`: il 19% si calcola solo sulla parte che supera 129,11 euro (guida dell'Agenzia delle Entrate sulla disabilità).
- `legge-104/`: per l'auto conta cosa è scritto nel verbale, e ci sono limiti di cilindrata (stessa guida).
- Controllati senza cambiare niente: prima copia gratis della cartella clinica (FAQ del Garante); E01 (la L. 537/1993 dice «età superiore a sessantacinque anni»: resta da chiarire se vale dal compleanno).
- Copie senza il testo che serviva: accordo dei pediatri (rep. 28/CSR, solo l'intesa senza l'allegato), D.A. 780/2021 della Sicilia (solo la pagina con i link agli allegati). La direttiva siciliana 9368/2026 risponde 404.

## 27/10/2026 — Pronto soccorso: il ticket nelle altre regioni (primo passo)
- `pronto-soccorso/`: aggiunta la Calabria. All'ASP di Catanzaro i codici bianco e verde non seguiti da ricovero pagano 25 euro di quota fissa, più una quota per gli altri esami «fino ad un massimo di 45 euro» (pagina «Ticket» dell'ASP, aggiornata il 15/04/2026, copia del server). Dati e fonte in `data/rules-pronto-soccorso.json`.
- Per altre 15 regioni le pagine ufficiali trovate con la ricerca sono in `data/regioni/<regione>/fonti.json`, voce `ticket-pronto-soccorso` (nuovo `data/regioni/sicilia/fonti.json`): il server le copia, poi il ticket si scrive leggendo le copie. Il Molise non ha una pagina ufficiale con l'importo.

## 27/10/2026 — Fonti da verificare: indirizzi per il server
- `data/fonti-nazionali.json`: tema nuovo «verifiche» con 10 fonti ufficiali per le frasi «da verificare» (`docs/revisione-2026-10-25.md`, gruppo 2): Gazzetta del gratuito patrocinio e del PNGLA, Corte d'appello dell'Aquila, guida dell'Agenzia delle Entrate sulla disabilità, accordo dei pediatri 2026, D.A. 780/2021 (ausili in Sicilia), direttiva siciliana 9368/2026, Garante (cartelle cliniche), messaggio INPS 18291/2011, L. 537/1993. `tests/coerenza.test.mjs`: giustizia.it e garanteprivacy.it tra i siti ufficiali.
- `data/rules-medico.json`: massimale (1.500), scelta del medico dai 6 anni e scelta temporanea (3 mesi–1 anno) con la frase dell'ACN 2024 (rep. 51/CSR), già nelle copie; prima la fonte era una notizia SISAC senza le cifre. `medico-famiglia/scelta-temporanea/`: prima l'azienda cancella dall'elenco del medico della residenza (ACN, art. 39 c. 6), al posto di «chiedi cosa succede».
- `data/rules-ricorso.json`: nota del gratuito patrocinio (giustizia.it ha ancora la cifra del 2023).

## 26/10/2026 — Lombardia, Lazio e scadenze di oggi
- Lombardia: visite, ospedali, cure a casa, ausili, medico e farmacia sono delle ASST, non dell'ATS (`docs/regioni.md`). `data/regioni/index.json`: campo nuovo `asl_label_servizi: "ASST"`. Nei JS `aslLabel()` dà la sigla dei servizi, `aslEnte()` quella dell'azienda dei dati (siti, numeri, URP, screening, intestazioni). Nuovo controllo in `tests/coerenza.test.mjs`: la sigla dei servizi c'è solo dove il «model» dei dati nomina tutte e due le aziende. Provato: la sigla messa per sbaglio sulla Liguria (che ha solo l'ATS) lo fa fallire.
- Lazio: il sollecito del percorso di tutela parlava di una lettera con protocollo, ma nel Lazio si attiva il «Pass di garanzia» (online o al CUP). Campo nuovo `request_name` nelle aziende con `letter_mode: "portal"`; il sollecito, il campo del numero e l'oggetto dell'email parlano del Pass (`js/letters.js`, `js/liste-attesa.js`).
- Scadenze: «torna qui quel giorno» → «torna qui il giorno dopo» (il giorno della scadenza non è ancora tardi), e «Oggi è l'ultimo giorno» quando la scadenza è oggi (invalidità, richiamo del CUP, ausili, cartella clinica). Nuova riga in `tests/errori-noti.test.mjs`.

## 26/10/2026 — Terzo giro di rilettura
- Tre riletture con le copie della notte del 26/10/2026 (pagine A–L, pagine M–Z, testo delle schermate dei moduli nel browser). Elenco completo e punti aperti: `docs/revisione-2026-10-25.md`, sezione «Terzo giro».
- Corretti: direttiva UE per le cure all'estero senza la Svizzera (errore del primo giro); congedo straordinario (ordine dei familiari e indennità); bonus psicologo per ISEE e codice «se accolta»; assegno di inclusione (famiglia dell'ISEE, SFL solo se manca il requisito della famiglia); intramoenia nelle schermate delle liste d'attesa; data del verbale nel ricorso; commissione della vecchia procedura e sollecito del nuovo regime; «Non salviamo quello che scrivi» su tutte le pagine; e altre frasi più ampie della fonte (ambulanza, contrassegno, SPID, ricetta, accompagnamento, collaudo di Catania, piano terapeutico, screening, neuropsichiatria, Telefono Amico, Cagliari, duplicato con chip, numero del Sistema TS, «è di oggi»). Note di E02 ed E04 in `data/rules-esenzione.json` allineate alla pagina.
- `data/numeri.json`: il numero del Sistema TS è l'assistenza per i servizi online, non per la «tessera persa» (la pagina copiata lo descrive così).
- Nuovi controlli: 12 righe in `tests/errori-noti.test.mjs` (terzo giro), provate sulla versione di prima; «non salviamo niente» si cerca anche con la minuscola.

## 26/10/2026 — Copie: la pagina «Request Rejected» dell'ISS non è una copia
- Errore trovato con il confronto delle copie del 26/10/2026: le pagine dei numeri verdi dell'ISS (dipendenze, fumo) erano la pagina del filtro «Request Rejected», salvata come copia; il confronto segnalava i numeri come spariti. I numeri del sito non cambiano.
- `tools/copie.mjs`: «Request Rejected» e «The requested URL was rejected» sono riconosciuti come pagina anti-robot (come Gcore): la pagina si segna e non si salva. Nuovo caso in `tests/copie-giro.test.mjs`, provato: senza la correzione fallisce.

## 25/10/2026 — Seconda rilettura: coerenza tra pagine
- Riletti insieme lo stesso fatto in pagine diverse, `data/moduli.json`, i testi comuni dei JS, le pagine delle aree e i testi delle regioni (`docs/revisione-2026-10-25.md`, ultima sezione).
- Esenzione E04: il limite di 11.362,05 euro vale «in presenza del coniuge» anche qui (modulo di autocertificazione dell'ASL Città di Torino); il calcolo fa la stessa domanda per E02 ed E04.
- Cure palliative: titolo e descrizioni «gratis per legge (L. 38/2010)» → «senza ticket perché sono nei LEA» (`data/rules-palliative.json`, `legal_basis`).
- `data/moduli.json`: esenzione (non «per età»), congedo «fino a» 2 anni, vaccini per gli adulti, ausili «chi li ha gratis e come», area «Visite ed esami» senza la prenotazione.
- Piè di pagina (il sito ricorda la regione), PEC e patronato, «Controlla sempre» del modulo psicologo, 7 giorni «dalla richiesta scritta», accompagnamento «più di 29 giorni», tessera «di solito», RSA (ISEE della persona, dimissione protetta regionale).
- `data/regioni/` Piemonte, Friuli-Venezia Giulia e Puglia: certificato di residenza «o un'autocertificazione».
- Nuovi controlli: 7 righe in `tests/errori-noti.test.mjs` (seconda rilettura), provate sulla versione di prima. Tolta un'eccezione di `tests/cifre.test.mjs` che non serve più.

## 25/10/2026 — Revisione completa dei contenuti
- Perché: il proprietario ha trovato nel triage una frase semplice ma sbagliata. Riletto tutto il sito, frase per frase, contro le copie delle fonti ufficiali del server. Elenco completo, con quello che resta da verificare: `docs/revisione-2026-10-25.md`.
- Corretti i fatti sbagliati: congedo straordinario e permessi 104 per la stessa persona (si può, non negli stessi giorni); prolungamento del congedo parentale entro i 14 anni (`data/rules-legge-104.json`, scheda INPS); revisione del verbale e permessi; aggravamento durante il ricorso; dati AP70 nel nuovo regime; spese per l'infermiere deducibili anche in contanti per chi ha una disabilità; Fascicolo e strutture private (dal 2020); RSA in Sicilia (60 giorni e Alzheimer a carico dell'ASP, poi metà Comune: `data/rules-rsa.json`, D.A. 1058/2025); esenzione E02 con il coniuge, E01 senza familiari a carico, C05 e C06, dichiarazione falsa; esenzione online sul Sistema TS; assegno di inclusione (rinnovi ripetuti, PAD, soglia 8.190 euro); bonus psicologo (ultimo periodo 15/09–14/11/2025); D.A. della DPC in Sicilia; guardia medica e ricette; L. 38/2010 e dolore; codici del pronto soccorso dal 2019; ASPConTe e SPID; ASP anche a Potenza; liste d'attesa (sei mesi, sollecito della classe B dopo 5 giorni, anche in `tests/combinazioni.cjs`); numeri utili senza frasi non provate.
- Aggiunte le condizioni che mancavano: tempi del triage nella descrizione; invalidità (tempi sospesi 60 giorni, chi ha più di 70 anni e non è autosufficiente: `data/rules-invalidita.json`, anche nel modulo); ricorso ATP e data da cui contare i 6 mesi; collaudo degli ausili in Sicilia (`data/rules-ausili.json`); disdetta al CUP; percorso di tutela; TAR solo per gli ospedali pubblici; guardia medica gratis e certificato di 3 giorni; accompagnamento per bambini e over 65; contrassegno.
- Tolte le frasi senza fonte: silenzio-assenso degli ausili in Sicilia (finché non è letto il D.A. 20/12/2011), rimborso dei chilometri per la dialisi, ricetta senza classe «come classe D», Regno Unito nella TEAM, divieto di sosta col contrassegno, frasi dei numeri utili. Numero dello screening di Catania con la sua fonte (`data/rules-prevenzione.json`).
- Nuovi controlli: 17 righe in `tests/errori-noti.test.mjs` (blocco del 25/10/2026), provate sulla versione di prima (falliscono) e su quella corretta (passano). Nuova regola fissa: ogni frase toccata si rilegge contro la fonte prima di unire (`docs/protocollo-test.md` punto 4, `CLAUDE.md`, modello delle PR).

## 25/10/2026 — Combinazioni: l'orologio del browser fermo
- Errore trovato dalla CI: il giro `combinazioni-ny` della PR #76 è partito alle 23:51 di New York ed è passato dalla mezzanotte a metà prova. Il test calcola «oggi» una volta sola, il sito leggeva l'ora vera: 41 casi al limite di un giorno («richiesta da 29 giorni», «data nel futuro») davano un risultato diverso. Non era un errore del sito.
- `tests/combinazioni.cjs`: l'orologio di ogni contesto del browser resta fermo all'istante del calcolo (`clock.setFixedTime`). Provato con «oggi» spostato a ieri: con la correzione 6666 casi senza problemi.

## 25/10/2026 — Pagine nuove come il resto del sito
- Errore trovato dal proprietario: le pagine nuove mostravano emoji colorate al posto delle icone del sito. 🚑 (pronto soccorso, area «Urgenze»), 🌙 (guardia medica) e 🤒 (certificato di malattia) non erano in `js/icons.js`; nemmeno 📊 in `privacy.html`. Aggiunte in `tools/icone.mjs` (Lucide 1.59.0: ambulance, moon, thermometer, chart-column) e rifatto `js/icons.js`. Nuovo controllo in `tests/coerenza.test.mjs`: ogni emoji del sito deve avere la sua icona (provato: senza le icone nuove fallisce).
- `pronto-soccorso/i-codici/`: «Sono tempi massimi. Se arriva una persona più grave, passa prima di te» si contraddiceva. Ora: i tempi non sono una garanzia, sono gli obiettivi con un afflusso normale (come dice la delibera del Piemonte); nei giorni pieni si aspetta di più, e chi è più grave passa sempre prima.
- Visita fiscale: icona ⏰ (orari) invece di 🏠, che è quella dell'area «Aiuto a casa».
- Guardia medica: come gli altri temi, ora ha una pagina corta, «Cosa non fa la guardia medica, e il numero 116117» (prima era l'unico tema con un indice di una sola voce).
- «Controlla sempre…» in fondo alle pagine: per certificato di malattia e visita fiscale ora dice l'INPS, il medico e il datore di lavoro, non l'azienda sanitaria (`js/controlla.js`).
- Home, riquadro «Stai male adesso?»: «guardia medica» porta alla pagina nuova.

## 24/10/2026 — Pronto soccorso: i tempi nazionali del triage
- Letti gli atti delle Regioni sul triage copiati dal server il 24/10/2026. Le linee di indirizzo nazionali del 2019 (riportate dalla DGR del Piemonte del 16/04/2021 «come da direttive nazionali», dal documento della Campania sul BURC e dalla delibera dell'Emilia-Romagna GPG/2021/1291): codice 1 accesso immediato, 2 entro 15 minuti, 3 entro 60, 4 entro 120, 5 entro 240, con un afflusso normale.
- `pronto-soccorso/i-codici/`: i tempi ora sono quelli nazionali (prima erano solo quelli della carta dei servizi dell'ASUGI, Friuli-Venezia Giulia, uguali). In Veneto la Regione ha un modello suo (DGR 1035/2019): scritto come regola regionale. Fonti e dati in `data/rules-pronto-soccorso.json`.

## 24/10/2026 — Guardia medica: la regola nazionale
- Letto l'Accordo collettivo nazionale della medicina generale 2019-2021 (PDF dell'intesa Stato-Regioni del 4/4/2024, copiato dal server il 24/10/2026; il testo ha errori di lettura automatica). La guardia medica è un compito dei medici del «ruolo unico» di assistenza primaria: continuità dell'assistenza di notte e di giorno, feriale e festiva; cure non differibili in ambulatorio o a casa, anche con il 116117; ricette per terapie non differibili, proposte di ricovero, certificati di malattia per i lavoratori dipendenti. Le Regioni organizzano il servizio, anche con meno medici da mezzanotte alle 8.
- L'accordo non fissa gli orari dalle 20 alle 8 né il limite di 3 giorni del certificato: restano regole scritte dalle aziende sanitarie, e la pagina `guardia-medica/` ora lo dice. Note aggiornate in `data/rules-guardia-medica.json`.

## 24/10/2026 — Triage: le linee di indirizzo dalle Regioni
- L'allegato dell'accordo Stato-Regioni del 01/08/2019 sul triage è arrivato con la copia del 24/10/2026, ma è una scansione: il PDF non ha testo («PDF senza testo»). Le stesse linee di indirizzo nazionali sono negli atti con cui le Regioni le hanno adottate: in `data/fonti-nazionali.json` ci sono ora quelli di Piemonte (DGR del 16/04/2021), Emilia-Romagna (GPG/2021/1291), Veneto (DGR 1035/2019, allegato A), Puglia (DGR 266/2023), Lazio (manuale regionale a cinque codici, 2022) e Campania (BURC). I tempi nazionali si aggiungono alla pagina dei codici dopo averli letti nelle copie.
- `tests/coerenza.test.mjs`: tra i siti ufficiali di `fonti-nazionali.json` anche quelli delle Regioni e dei loro bollettini (`regione.<nome>.it`).

## 24/10/2026 — La guardia medica e il 116117
- Nuova pagina `guardia-medica/` nell'area «Urgenze» (ora «Urgenze, pronto soccorso e guardia medica»): quando c'è, cosa fa e cosa non fa, il certificato di malattia fino a 3 giorni, il 116117.
- Fonti (`data/rules-guardia-medica.json`), dalle copie del server del 24/10/2026: le pagine ufficiali delle aziende sanitarie di 17 regioni su 20 dicono la notte «dalle 20 alle 8»; nel fine settimana si comincia alle 10 (ASP Basilicata, ASL Cagliari, ASL Roma 5) o alle 8 (Regione Friuli-Venezia Giulia, ARCS) del sabato o del giorno prima della festa. Il certificato fino a 3 giorni lo scrivono le aziende di 14 regioni (per esempio l'AUSL di Modena). Da confermare sull'Accordo collettivo nazionale quando arriva la copia.
- Nuovo blocco `numero-europeo` in `tools/pagine.mjs`: l'elenco delle regioni dove la guardia medica risponde al 116117, in tutta la regione o solo in alcune aziende. Viene dai numeri delle aziende sanitarie (`asl.json`), che hanno già fonte e prova: si aggiorna da solo. Oggi: 11 regioni in tutto il territorio, 3 in parte (Liguria, Sardegna, Umbria).
- Ricerca: «guardia medica» e «116117» portano alla pagina nuova (prima ai numeri utili).

## 24/10/2026 — Guardia medica: le fonti nazionali da copiare
- Le pagine del Ministero sulla guardia medica (continuità assistenziale) e sul 116117 non si copiano: salute.gov.it ha una protezione anti-robot. In `data/fonti-nazionali.json` ci sono ora le fonti dell'Accordo collettivo nazionale della medicina generale: le pagine della SISAC sull'accordo del 4 aprile 2024 e sul testo consolidato del 26 giugno 2026, l'intesa del 15 gennaio 2026 in Gazzetta Ufficiale, l'intesa del 4 aprile 2024 della Conferenza Stato-Regioni (pagina e PDF).
- `tests/coerenza.test.mjs`: sisac.info tra i siti ufficiali di `fonti-nazionali.json`.

## 24/10/2026 — Area nuova «Urgenze»: il pronto soccorso
- Nuova pagina `pronto-soccorso/` (con «I codici del pronto soccorso, da 1 a 5») nell'area nuova `urgenze/`: il triage, i codici di priorità, il ticket, cosa portare.
- Fonti, tutte lette sulle copie del server del 24/10/2026 (`data/rules-pronto-soccorso.json`): l'accordo Stato-Regioni del 01/08/2019 (Rep. n. 143/CSR, codici numerici da 1 a 5 in tutta Italia, colori a scelta delle Regioni); la pagina della Regione Lombardia sul pronto soccorso (significato dei 5 codici; ticket di 25 euro per il codice bianco alla dimissione); la carta dei servizi dell'ASUGI in Friuli-Venezia Giulia (tempi: 15, 60, 120 e 240 minuti); l'ASL di Cagliari (ticket per codice bianco e verde). Le regole regionali sono scritte come tali.
- Da aggiungere quando arriva la copia dell'allegato dell'accordo Stato-Regioni (PR «Fonti nazionali: PDF fino a 20 MB»): le definizioni e i tempi nazionali.
- Notato: la pagina dell'ASL TO5 (Piemonte) sul pronto soccorso mostra ancora i 4 colori di prima del 2019.
- Ricerca: «pronto soccorso» e «codice bianco» portano alla pagina nuova (prima «pronto soccorso» portava ai numeri utili); nuove ricerche di prova per «visita fiscale» e «certificato di malattia» in `tests/ricerca.test.mjs`.

## 24/10/2026 — Fonti nazionali: PDF fino a 20 MB
- La copia del 24/10/2026 non ha preso l'allegato dell'accordo Stato-Regioni sul triage del 01/08/2019: il PDF pesa più di 5 MB, il limite del server. `tools/copie.mjs` ora ha un limite di 20 MB solo per le fonti nazionali (cartelle `nazionali/regole-*` e `nazionali/tema-*`); per le regioni resta 5 MB. Nuovo caso in `tests/copie-giro.test.mjs`, provato: senza la correzione fallisce.
- Tolto da `data/fonti-nazionali.json` l'indirizzo del comma 796 della L. 296/2006: Normattiva mostra solo i primi 100 commi dell'art. 1, anche con l'indirizzo del comma. Il ticket del codice bianco al pronto soccorso si prende dalle pagine ufficiali delle Regioni (in Lombardia, per esempio, la pagina della Regione sul pronto soccorso).

## 24/10/2026 — Area nuova «Malattia e lavoro»: certificato di malattia e visita fiscale
- Due temi nuovi, scritti leggendo le copie del server del 24/10/2026 (branch `copie-siti`, `nazionali/tema-*`): `certificato-malattia/` (con «Nei giorni di festa, in ospedale, se guarisci prima») e `visita-fiscale/` (con «Se il medico non ti trova, o devi cambiare indirizzo»). Area nuova `malattia-e-lavoro/`.
- Dati in `data/rules-malattia.json`, ognuno con la fonte letta per intero: guida INPS «Certificazione di malattia e visite mediche di controllo» (marzo 2024), messaggio INPS n. 4640/2023 (fasce orarie dei dipendenti pubblici dopo la sentenza del TAR Lazio n. 16305/2023), D.L. 463/1983 art. 5 comma 14, D.Lgs. 165/2001 art. 55-septies. Fasce dalle 10 alle 12 e dalle 17 alle 19, ogni giorno, privati e pubblici; ricontrollo a sei mesi perché l'INPS le ha fissate «fino a nuove disposizioni».
- Errore trovato: le pagine di salute.gov.it hanno una protezione anti-robot (Gcore, «Browser Validation Page»). `tools/copie.mjs` la salvava come copia riuscita (520 caratteri, sopra il limite delle pagine vuote). Ora la riconosce e la segna come controllo anti-robot; nuovo caso in `tests/copie-giro.test.mjs`, provato: senza la correzione fallisce.
- Pronto soccorso e guardia medica: non ancora scritti. Le pagine del Ministero non si copiano (protezione anti-robot) e la copia della L. 296/2006 si ferma prima del comma 796. In `data/fonti-nazionali.json` ci sono ora l'allegato PDF dell'accordo Stato-Regioni del 01/08/2019 e il comma 796 da solo.
- Dalla prima copia delle fonti nazionali (128 voci, 107 indirizzi diversi): 100 sono copie vere. 16 sono la pagina anti-robot di salute.gov.it (15 indirizzi). Da sistemare anche: 6 indirizzi che rispondono 404, usati in 9 file (tre schede dell'Agenzia delle Entrate, la scheda INPS dell'accompagnamento, la pagina della ricetta dematerializzata di sistemats1, il PDF del consenso al Fascicolo della Regione Siciliana), un PDF ADI sopra 5 MB, due PDF fatti di sole immagini. Annotati in `docs/piano-contenuti.md`.

## 24/10/2026 — Il server copia anche le fonti nazionali; il sito si aggiorna da solo
- `tools/copie.mjs` copia ogni notte anche le fonti delle regole nazionali (`sources` e `provenienza` di ogni `data/rules*.json`, 97 indirizzi: Normattiva, Ministero della Salute, INPS…; cartelle `nazionali/regole-<file>`) e le pagine dei temi da scrivere (`data/fonti-nazionali.json`, cartelle `nazionali/tema-<id>`). `tools/copie-se-serve.sh` rifà la copia anche quando cambiano questi file.
- Nuovo `data/fonti-nazionali.json`: le pagine ufficiali per pronto soccorso, guardia medica e 116117, certificato di malattia e visita fiscale (Ministero della Salute, Conferenza Stato-Regioni, INPS, Normattiva). Solo indirizzi, nessun fatto: le pagine si scrivono leggendo le copie, perché da qui i siti ufficiali non si aprono.
- Decisione del proprietario: per ora il sito si aggiorna da solo. La routine settimanale cambia un dato quando la copia ufficiale lo dimostra e unisce la sua pull request quando la CI è verde (`docs/regioni.md` sezione 8, `SPEC.md` principio 5). Il testo nuovo della routine è in `docs/routine-aggiornamento.md`.
- Controlli nuovi: `tests/copie-giro.test.mjs` (fonti nazionali e temi copiati, una volta sola) e `tests/coerenza.test.mjs` (in `fonti-nazionali.json` solo siti ufficiali).

## 24/10/2026 — La missione nuova: tutta la sanità pubblica, prima come si fa
- Missione scritta in `CLAUDE.md` (e in `README.md`, «Chi siamo»): spiegare a tutti la sanità pubblica con parole semplici e fonti ufficiali, prima come si fa e poi cosa fare se qualcosa non va, con un sito che si aggiorna da solo. `SPEC.md` è segnato come storia del progetto.
- Titoli dei moduli e delle pagine sulla procedura, non sul problema: «Quanto puoi aspettare una visita o un esame», «Avere la cartella clinica e i referti», «Carrozzina, letto, pannoloni: come averli gratis», «Invalidità civile: la domanda e la visita», «Il ricorso contro il verbale di invalidità», «La tessera sanitaria: rinnovo, duplicato, estero», «Un infermiere o un medico a casa». Cambiati anche titolo per Google, descrizione e frase d'apertura delle pagine principali; i fatti e le cifre restano gli stessi. Gli indirizzi delle pagine non cambiano.
- Presentazione delle aree «Visite ed esami», «Aiuto a casa» e «Invalidità» riscritta sulla procedura.
- Home: «Le domande più frequenti» ora sono le ricerche più frequenti (Fascicolo, cambio medico, CUP, ticket, legge 104; `docs/ricerche-frequenti.md` punto 3b); i problemi sono nel blocco nuovo «Qualcosa non va?». Il riquadro in basso dice da dove vengono le informazioni e la copia notturna. Nuova frase anche nell'immagine di anteprima (`og-image.png`).
- Nuovo `docs/piano-contenuti.md`: cosa tratta il sito e cosa no, lo schema di ogni pagina, i temi che mancano in ordine (pronto soccorso, guardia medica, certificato di malattia, visita fiscale…) e il piano dell'aggiornamento automatico delle procedure.
- Nuovo controllo in `tests/errori-noti.test.mjs`: nessun titolo di modulo o di area scritto come problema, e domande frequenti della home senza problemi.

## 24/10/2026 — Pagina iniziale: a cosa serve il sito
- La frase sotto «Di cosa hai bisogno?» parlava solo di cose che non funzionano («La visita è troppo lontana?», «far valere i tuoi diritti»). Il sito serve anche a sapere come fare: ora dice «Come prenoti una visita? Come chiedi l'esenzione dal ticket o l'invalidità? Qui trovi i passi da fare, con parole semplici e fonti ufficiali. In tutta Italia.»
- Stesso cambio nel titolo della home («…: come fare») e nella descrizione per Google e WhatsApp.
- Riga della regione: «Le regole valgono in tutta Italia» (tolto «e i conti», poco chiaro).
- `tests/seo.test.mjs` controlla la frase nuova.
## 24/10/2026 — Fascicolo Sanitario: Marche e Trentino-Alto Adige; nuove pagine da copiare per Lombardia, Lazio e Campania
- Marche: `link.fse` alla pagina dell'AST Fermo sul Fascicolo («Come accedere Fascicolo Sanitario https://fse.sanita.marche.it/it», copia del 23/10/2026), perché il nuovo portale regionale ha risposto 500 alla copia.
- Trentino-Alto Adige: il Fascicolo è diverso nelle due province, quindi `link.fse` e `regole_fonti.fse` possono essere un elenco `{ in, url }`. Trento: Trentino Salute (servizi online con TreC+); Bolzano: Azienda Sanitaria dell'Alto Adige (myCIVIS, con Carta Servizi, SPID o CIE). Copie del 23/10/2026. L'elenco nelle pagine e il pulsante della cartella clinica mostrano un link per provincia (`tools/pagine.mjs`, `js/cartella.js`); `tests/coerenza.test.mjs` controlla anche gli elenchi.
- Da copiare (indirizzi trovati con il motore di ricerca sui siti ufficiali il 24/10/2026): Lombardia, la pagina della Regione «I servizi sanitari online» (il sito del Fascicolo non si copia); Lazio, il portale Salute Lazio; Campania, la pagina della Regione sul Fascicolo (Portale Salute del Cittadino, app SINFONIA Salute).
- L'elenco «Il sito del Fascicolo nella tua regione» ha ora 17 regioni (18 link).

## 24/10/2026 — Fascicolo Sanitario: link anche per Veneto, Friuli-Venezia Giulia, Calabria e Puglia
- Le pagine messe in `regole_fonti.fse` il 23/10/2026 sono state copiate dal server la sera stessa (branch `copie-siti`, cartella `regole`). Lette le copie: `verified`, `proof: "pagina"` e la frase in `nota`; poi `link.fse` in `data/regioni/index.json`. Veneto: Portale della Salute («Accedi al Fascicolo Sanitario Elettronico Regionale»); Friuli-Venezia Giulia: SESAMO (copia aperta col browser); Calabria: fascicolosanitario.regione.calabria.it («ACCEDI AL TUO FASCICOLO»); Puglia: la pagina in italiano di PugliaSalute.
- Sicilia: la prova del link ora è la copia della pagina della Regione (23/10/2026).
- Non copiate: Lombardia (il sito rimanda all'infinito, «troppi redirect», come le altre sue pagine: serve un'altra pagina ufficiale) e Marche (errore 500 del server del portale: si riprova alla prossima copia). Restano anche Lazio, Campania e Trentino-Alto Adige.
- L'elenco «Il sito del Fascicolo nella tua regione» ha ora 15 regioni.

## 23/10/2026 — Il link al Fascicolo Sanitario di ogni Regione
- Il fascicolo sanitario è la cosa più cercata (Google Trends, `docs/ricerche-frequenti.md` punto 3b), ma il sito aveva il link solo per la Sicilia.
- `data/regioni/index.json`, `link.fse` per 10 regioni nuove, dalle copie del server del 23/10/2026 (branch `copie-siti`): Abruzzo (sanita.regione.abruzzo.it/fse), Basilicata, Emilia-Romagna, Liguria, Molise (pagina dell'ASREM), Piemonte, Sardegna, Toscana (fascicolosanitario.regione.toscana.it), Umbria, Valle d'Aosta. La prova di ognuno è in `regole_fonti.fse` del file della regione: indirizzo, giorno, «pagina» e la frase della pagina tra «…». La Sicilia ha ora la sua prova (fonte della guida, 20/10/2026).
- Da copiare, senza link finché la copia non c'è (`regole_fonti.fse` senza `proof`): Lombardia, Veneto, Friuli-Venezia Giulia (SESAMO), Calabria, Marche (il nuovo portale fse.sanita.marche.it) e Puglia (la pagina in italiano: la copia era quella in inglese). Gli indirizzi sono quelli citati nelle copie di pagine ufficiali delle aziende sanitarie.
- Senza un indirizzo buono nelle copie: Lazio e Campania (solo notizie), Trentino-Alto Adige (il Fascicolo è diverso a Trento e a Bolzano).
- Pagine: l'elenco «Il sito del Fascicolo nella tua regione» (blocco `fse-regioni` di `tools/pagine.mjs`, si legge anche senza JavaScript) in `fascicolo-e-ricetta/`, `fascicolo-e-ricetta/fascicolo-sanitario/` e `cartella-clinica/fascicolo-sanitario/`. Nel modulo della cartella clinica il pulsante dice la regione («Fascicolo Sanitario in Toscana»), non più «della tua Regione».
- Nuovo controllo in `tests/coerenza.test.mjs`: un `link.fse` c'è solo con la sua prova in `regole_fonti.fse` (stesso indirizzo, «pagina», giorno, frase).

## 23/10/2026 — Come appare il sito su Google: nome, titoli, anteprima, dati strutturati, «Chi siamo»
- Errore trovato (ricerca «site:guidasanita.it»): Google mostrava «guidasanita.it» al posto del nome, tagliava i titoli lunghi (fino a 131 caratteri) e usava il riquadro «Stai male adesso?» come descrizione della home.
- Home: dati strutturati JSON-LD «WebSite» (nome «Guida Sanità») e «Organization» (logo `icon-512.png`); sotto il titolo la frase che dice a cosa serve il sito, prima del riquadro dell'urgenza (`index.html`, `js/home.js`).
- Titoli: al massimo 60 caratteri; « – Guida Sanità» solo sui titoli corti (`tools/pagine.mjs`). Riscritti 76 titoli, con le parole che la gente cerca (`docs/ricerche-frequenti.md`). I testi delle pagine non cambiano.
- Anteprima nei messaggi: `og-image.png` (1200 x 630, logo, nome e frase del sito, fatta con `node tools/og-image.cjs`), `og:image`, `og:locale` e `twitter:card` in ogni pagina; `og:type` «article» nelle guide.
- Dati strutturati in ogni pagina: «BreadcrumbList» (il percorso) e, nelle guide, «Article» con `dateModified`. Niente «FAQPage»: Google la mostra solo per siti di enti pubblici o sanitari ufficiali.
- Icone con percorso assoluto («/favicon.ico»…).
- `sitemap.xml` con `lastmod`: la data del controllo più recente nei file `data/` della pagina (privacy: la data scritta nella pagina).
- «Chi siamo» (`chi-siamo.html`) e «Note legali» (`note-legali.html`) ora sono due pagine, con i link nel piè di pagina e nella privacy. Testi spostati, non cambiati.
- Nuovi controlli: `tests/seo.test.mjs` (canonical, icone, anteprima, titoli, JSON-LD valido, lastmod, frase della home, le due pagine). Ha trovato un errore nel generatore: contava «&#39;» come 5 caratteri.

## 23/10/2026 — Google Trends per l'Italia e 7 regioni: risultati e ricerca della home
- `docs/ricerche-frequenti.md`, punto 3b: 3 confronti per l'Italia e le query associate di 4 temi in 8 zone (Google Trends, 23/10/2025 – 23/10/2026, raccolti dal proprietario). Il fascicolo sanitario è il tema più cercato (4,7 volte la legge 104), ma il link al fascicolo della Regione c'è solo per la Sicilia; pronto soccorso e guardia medica insieme valgono 3 volte la legge 104 e non hanno una pagina.
- Ricerca della home: «fse» portava prima alla cartella clinica (tolta la parola da `cartella-clinica`, che resta trovata con «fascicolo»); parole nuove «annullare annullamento stampa» (CUP) e «residenza trasferimento curante» (medico).
- Nuovi controlli: 13 ricerche prese da Google Trends in `tests/ricerca.test.mjs`.

## 23/10/2026 — Cosa cercano le persone, in tutta Italia; statistiche anonime della ricerca
- `docs/ricerche-frequenti.md` riscritto per tutte le regioni: fonti in ordine di valore, come rifare Google Trends per l'Italia e per regione, tabella ricerche → pagina, ricerche ancora senza pagina (pronto soccorso e codice bianco, pensione e assegno di invalidità, certificato di malattia e visita fiscale, stranieri e STP). La ricerca della Sicilia del 19/10/2026 resta in fondo.
- Statistiche (GoatCounter), mai le parole scritte: «Sì / No» con la regione scelta (`utile-no/<pagina>/<regione>`), `ricerca-fatta/<regione>`, `ricerca-vuota/<regione>` e `ricerca-clic/<modulo>` (`js/common.js`, `js/home.js`). I conteggi partono con `sendBeacon`, così arrivano anche quando si apre un risultato. Pagina privacy aggiornata.
- Ricerca senza risultati: link «Scrivici cosa cercavi» (email vuota, la scrive la persona).
- Parole della ricerca: «impegnativa» (CUP), «pensione assegno mensile» (invalidità), «ats asst ausl ulss azienda sanitaria» (Numeri utili). Prima «impegnativa», «ats» e «ulss» non trovavano niente e «pensione invalidità» dava prima l'esenzione ticket.
- Errore trovato durante la prova: sulle pagine che non caricano l'elenco delle regioni il «No» arrivava senza regione. Ora la regione si legge dal browser.
- Nuovi controlli: `tests/conteggi.test.mjs` (nomi degli eventi, nessun testo scritto in `count()`, regione senza l'elenco, pagina privacy); 20 ricerche nuove in `tests/ricerca.test.mjs`.

## 23/10/2026 — Friuli-Venezia Giulia, Piemonte, Sardegna: liste d'attesa in Friuli-Venezia Giulia, prevenzione in tutte e tre
- Fonti: le copie del server del 23/10/2026 delle 11:06 (branch `copie-siti`), anche il testo dei PDF. Ogni numero e ogni email nuova ha `url` = la pagina copiata, `verified` 2026-10-23, `proof` «pagina». Nessun dato dagli estratti del motore di ricerca.
- Friuli-Venezia Giulia, ASUFC (Udine): `what_next` del diritto di garanzia dal regolamento aziendale (DDG n. 706 del 28/06/2024, PDF https://asufc.sanita.fvg.it/export/sites/asufc/it/amministrazione_trasparente/documenti_AT/16_servizi-erogati/liste_attesa/2024_706_regolamento_diritto_garanzia_REG.pdf): controllo dei requisiti, pre-lista, telefonata con la nuova data; chi rifiuta una data proposta perde il diritto. Il programma attuativo 2026 (PDF) dice che il percorso resta in vigore. Nota: si può mandare un'altra persona con una delega.
- Friuli-Venezia Giulia, screening: ASUFC 0432 553290 (pagina «Segreteria unica - Screening»); ASUGI area giuliana 040 3992816, 040 3992813, 040 3997235 e area isontina 0481 592875; ASFO 0434 1923384 (pagine «dove rivolgersi» della Regione FVG).
- Piemonte, screening: numero verde di Prevenzione Serena 800 001141, tutti i giorni 8–20, nella pagina della Regione Piemonte (https://www.regione.piemonte.it/web/temi/sanita/prevenzione/prevenzione-serena), che dice «presente su tutto il territorio piemontese»: aggiunto alle ASL che non lo avevano. Liste d'attesa resta spenta: l'ASL VCO risponde ancora 403 al server; l'ASL Biella non dice a chi si manda la domanda, e il suo modulo è dietro un pulsante «Scarica il file» che il server non segue.
- Sardegna, screening: numero del centro screening di tutte e 8 le ASL (Cagliari 800 728259, Gallura 800 283333, Medio Campidano 800 339233, Nuoro 800 208084, Ogliastra 0782 490460, Oristano 800 186000 e 0783 317007, Sassari 800 663355 e 079 2062213, Sulcis Iglesiente 0781 6683714, 6683709, 6683710), dalle pagine screening delle ASL. Il numero verde del Sulcis scritto «80023559» (una cifra in meno) non è usato.
- Sardegna, percorso di tutela: Cagliari dall'Allegato A della delibera n. 349/2024 (prenotazione in intramoenia al 070 4677970 e stampa del CupWeb con l'Allegato C a urpcagliari@aslcagliari.it); Sassari dalla «Nota esplicativa» e dalla notizia del 05/03/2026 (richiesta all'URP, urp@aslsassari.it, dai giorni scritti nella nota); Medio Campidano e Nuoro con il modulo ufficiale (Allegato A, PDF): `letter_mode` «official_form», `form_url` e `form_fields` dal testo del modulo. Liste d'attesa resta spenta: nessuna pagina copiata sul percorso di tutela di Gallura, Ogliastra, Oristano e Sulcis Iglesiente.
- Sardegna, `inps.json`: le copie INPS e Normattiva nominano solo Sassari e Cagliari (la copia del decreto-legge 19/2026 non ha l'allegato con le province): regime resta null per Olbia, Lanusei, Sanluri e Carbonia, invalidità resta spenta.
- `data/regioni/index.json`: accesi liste d'attesa e prevenzione in Friuli-Venezia Giulia, prevenzione in Piemonte e in Sardegna.

## 23/10/2026 — Lazio: prevenzione accesa; Marche: numeri dello screening di 4 AST su 5
- `data/regioni/lazio/asl.json`: un contatto «screening» per ogni ASL, dalle copie del 23/10/2026 delle pagine dello screening. Frosinone 800 003422 (pagina «UOSD Coordinamento Screening»), Latina 800 065560 (pagina «Servizio di Screening»), Rieti 800 646999 (pagina «UOS Coordinamento Screening di Popolazione»), Viterbo 800 840359 (pagine dello screening del seno e del colon-retto). Roma, tra i contatti dell'azienda: Roma 1 800 536693 (volantino PDF dell'ASL Roma 1), Roma 2 800 405051 e 06 51006675 (pagina «UOSD Coordinamento Screening»), Roma 3 800 634634 (brochure PDF dello screening del seno), Roma 4 800 539762, Roma 5 800 894549, Roma 6 800 430264 e 06 93273281 (seno e colon-retto), 800 160622 e 06 93273791 (collo dell'utero), dalle pagine dello screening di ogni ASL. Orari solo dove la pagina li scrive chiari.
- `data/regioni/index.json`: nel Lazio accesa la prevenzione.
- Lazio, `pagine[]`: tolto il depliant screening di Salute Lazio (la copia risponde 404). Nuove pagine per la scelta del medico: «Medico di famiglia» di Salute Lazio (tutte le ASL) e le pagine delle ASL di Latina, Rieti e Viterbo (url trovati col motore di ricerca sui domini ufficiali, nessun dato preso dagli estratti). Il medico di famiglia resta spento: nelle copie non c'è come si sceglie il medico.
- `data/regioni/marche/asl.json`: contatti «screening» dell'AST Pesaro Urbino (800 738073 seno, 800 710977 collo dell'utero, 800 210858 colon-retto), Ancona (800 267267), Macerata (800 178008) e Fermo (800 185454), dalle pagine dello screening delle AST copiate il 23/10/2026. Prevenzione resta spenta: la pagina «UOSD Screening» dell'AST Ascoli Piceno non ha numeri (nuova pagina «Screening oncologici» in `pagine[]`).
- Marche, liste d'attesa: resta spento. La pagina dell'ARS Marche e quella dell'AST Ancona dicono che chi non trova posto va nella «Lista di presa in carico» e l'AST lo richiama, ma non dicono a chi scrivere se nessuno richiama (solo gli URP di Ascoli Piceno e Fermo). Annotato nel `todo` di ogni AST.

## 23/10/2026 — Prevenzione: il numero giusto dove ci sono più aziende
- Errore trovato: nella prevenzione la frase «chiama il numero dello screening dell'ASL di …» dava il primo numero dei contatti. A Roma (6 ASL) tutti avevano il numero dell'ASL Roma 1, a Perugia quello dell'USL Umbria 2. Ora, con più numeri, la frase rimanda all'elenco sotto, dove ogni numero ha il nome del suo ufficio (`js/engine.js`, `numeroScreening`; test in `tests/engine.test.mjs`).

## 23/10/2026 — Il sito dice quello che c'è, non quello che manca
- La home diceva «Per gli altri argomenti le lettere già pronte, per ora, solo in Sicilia». Ora dice solo cosa c'è nella regione scelta: «In Lombardia trovi anche i numeri utili e gli uffici della zona per: invalidità».
- Moduli senza i dati della regione (invalidità e ausili dove non sono accesi): il pulsante principale e il consiglio sotto non si vedono più. Prima diventava «Uffici e numeri in …» e portava a «Per questo argomento … non abbiamo ancora i dati». Resta la guida scritta.
- Moduli che fanno il conto anche senza uffici: al posto dell'avviso «uffici e numeri non li abbiamo ancora» c'è il rimando ai numeri utili e all'URP. Tolti anche «non abbiamo ancora un indirizzo sicuro» (liste d'attesa) e «contatti ancora da raccogliere» (fonti di assistenza a casa e cure palliative).
- Guide: tolte le frasi «(non ancora in tutte le regioni)» e «li abbiamo per molte regioni, non ancora per tutte»; negli ausili, che ci sono solo in Sicilia, «In Sicilia il percorso in questa guida…».
- Controlli: `tests/coerenza.test.mjs` (guide), una riga in `tests/errori-noti.test.mjs` (pagine e JS), `tests/browser.cjs` su ogni pagina e nei moduli senza dati (niente pulsante, niente «non abbiamo ancora»).

## 23/10/2026 — Audit «solo in Sicilia»: frasi superate, dati siciliani a chi non ha scelto la Sicilia, regole regionali scritte come nazionali
- Errore trovato: 10 pagine dicevano «per ora solo per la Sicilia» (uffici, numeri, lettere) per moduli accesi anche in altre regioni: liste d'attesa, cartella clinica, assistenza a casa, cure palliative, invalidità. Corrette; nuovo controllo in `tests/coerenza.test.mjs` che legge `data/regioni/index.json` (al posto della riga di `tests/errori-noti.test.mjs` che obbligava a scrivere «solo per la Sicilia»).
- «(ASL; in Sicilia si chiama ASP)» in 44 frasi: anche in Calabria l'azienda si chiama ASP (`data/regioni/index.json`). Ora «in Sicilia e in Calabria».
- Errore trovato: senza regione scelta la regione dei dati è la Sicilia. Assistenza a casa e cure palliative mostravano le fonti della Regione Siciliana, dell'ASP di Palermo e di Enna, la frase su Enna e la regola siciliana della dialisi come «Nella tua regione…», con il link all'elenco siciliano. Le fonti siciliane dei file nazionali (`rules*.json`: SovraCUP, Fascicolo, DPC, screening di Palermo…) si vedevano a tutti anche in liste d'attesa, cartella, medico, prevenzione, piano terapeutico, esenzione, nelle fonti della home e delle pagine fisse e in Numeri utili. Ora `sceltaSicilia()` e `fontiNazionali()` in `js/common.js`; `regioneLink()` vale solo con una regione scelta. Nuovo controllo in `tests/browser.cjs`: niente link a siti siciliani fuori dalla Sicilia.
- Errore trovato: se `data/regioni/index.json` non arrivava, valeva la Sicilia per tutti, anche per chi aveva scelto un'altra regione: la home diceva «Per ora solo in Sicilia», Numeri utili mostrava il numero verde della Regione Siciliana. Ora vale la regione salvata; senza, niente dati regionali. Nuovo caso in `tests/robustezza.cjs`.
- Testi nazionali troppo sicuri (nessuna cifra nuova): codici di esenzione «gli stessi in tutta Italia» (E01–E04 sono il minimo, le Regioni ne aggiungono); esenzione «non vale per le medicine» (il ticket sui farmaci lo decide la Regione); famiglia per l'esenzione «stesso stato di famiglia» (conta la famiglia fiscale: da rileggere, DA-VERIFICARE-A-MANO.md); età dello screening «uguali in tutta Italia» (sono il minimo); RSA «la decisione passa dall'azienda sanitaria» (cambia da regione a regione); équipe dell'ADI «si chiama UVM» (anche UVMD, UVG, UVI); «si parte sempre dal medico»; invalidità, vecchia procedura: «l'ASL ti chiama per la visita» (in alcune province la fa l'INPS); cartella di una persona morta solo agli eredi (anche ai familiari, Codice privacy art. 2-terdecies); scelta del medico online «sul sito dell'ASL» (spesso Regione o Fascicolo); «Vai dal privato solo se l'ASL te lo scrive» (il rimborso non è una regola nazionale); 112 «numero unico» (non ancora in tutte le regioni: ora «per ogni emergenza, in tutta Italia»).
- README e note legali: il sito vale in tutta Italia.

## 23/10/2026 — Lazio: PEC dell'ASL Roma 2; liste d'attesa, cartella clinica, assistenza a casa e cure palliative accese
- `data/regioni/lazio/asl.json`, zona Roma 2: PEC protocollo.generale@pec.aslroma2.it. Fonti: PDF dell'ASL «Modulo mancata disdetta» (https://www.aslroma2.it/attachments/Documenti/CUP/Modulo%20mancata%20disdetta.pdf) e elenco PEC delle ASL della Regione Lazio (2021), copie del 23/10/2026. Era l'ultima zona senza indirizzo.
- `data/regioni/index.json`: nel Lazio accese liste d'attesa, cartella clinica, assistenza a casa e cure palliative.
- Errore trovato: nel Lazio la richiesta per le liste d'attesa si fa sul portale della Regione (Salute Lazio), ma il pulsante diceva «Vai al sito dell'ASL». Ora c'è il campo `portal_label` (`js/liste-attesa.js`); `tests/coerenza.test.mjs` lo chiede quando il portale non è sul sito dell'azienda, e `tests/browser.cjs` controlla il pulsante.

## 23/10/2026 — Friuli-Venezia Giulia, Piemonte, Lazio, Marche, Sardegna: quarto giro, pagine da copiare
- Solo indirizzi in `pagine[]` (35 nuovi), trovati con il motore di ricerca sui domini ufficiali (aziende, Regioni, inps.it, normattiva.it). Nessun numero, PEC, email o regola presi dagli estratti: si scrivono dopo la copia del server. Per ogni azienda una riga nel `todo` dice cosa deve provare la pagina.
- ASUFC (Udine): programma attuativo 2026 sui tempi di attesa (PDF) e pagina del CUP di Udine, per «what_next» del diritto di garanzia (con il regolamento DDG 706/2024 già in `pagine`).
- ASL Biella: Carta dei servizi (a chi si manda la domanda del percorso di tutela). Il PDF del modulo non trovato: lo prende il server dai link PDF della pagina.
- Lazio, ASL Roma 2: regolamento di pubblica tutela e informativa privacy (PDF), per la PEC o l'email della zona Roma 2. Screening: pagine di Frosinone, Latina, Rieti, Viterbo, Roma 2, Roma 4, Roma 5, Roma 6.
- Marche: pagina della UOSD Screening oncologici dell'AST Macerata e pagina screening della Regione.
- Sardegna: pagine del centro screening di tutte e 8 le ASL. Allegati A dei percorsi di tutela di Cagliari, Medio Campidano e Nuoro non trovati: li prende il server dai link PDF delle pagine. `inps.json`: nuovo `pagine` in cima al file (pagina INPS «Fase sperimentale», due notizie sulla terza fase, decreto-legge 19/2026 e testo coordinato su Normattiva), per il regime di Olbia, Lanusei, Sanluri e Carbonia.

## 23/10/2026 — Calabria e Alto Adige: PEC che mancavano; lettere accese
- `data/regioni/trentino-alto-adige/asl.json`, Azienda sanitaria dell'Alto Adige: PEC dg@pec.sabes.it (Direzione generale). Fonte: https://www.asdaa.it/it/contatti/53003, letta dall'Italia il 23/10/2026; pagina aggiunta a «pagine» per la copia, riga in `tests/copie-noti.txt` finché la copia non c'è. In `index.json` accese cartella clinica, assistenza a casa e cure palliative (Trento aveva già PEC ed email URP).
- `data/regioni/calabria/asl.json`, ASP di Vibo Valentia: PEC aspvibovalentia@pec.it ed email URP urp@aspvv.it. Fonte: pagina «Ufficio Comunicazione e URP» dell'ASP (https://www.aspvv.it/index.php/azienda/presentazione/la-direzione-generale-e-uffici-di-staff/ufficio-comunicazione-e-urp), letta dall'Italia il 23/10/2026: il sito blocca il server delle copie (403), quindi la riga della PEC è in `tests/copie-noti.txt`. L'indirizzo «comunicazione@» è per la stampa: non usato.
- `data/regioni/index.json`: in Calabria accese cartella clinica, assistenza a casa e cure palliative. Vibo era l'unica azienda senza PEC né email.

## 23/10/2026 — Emilia-Romagna, Marche, Toscana, Liguria, Umbria: terzo giro sulle copie
- Fonti: le copie del server del 23/10/2026 (branch `copie-siti`). Ogni numero, email e PEC nuovo ha l'url della pagina copiata, `verified` 2026-10-23 e `proof` «pagina». Nessun dato dagli estratti del motore di ricerca: gli indirizzi trovati così sono solo in `pagine[]`.
- Emilia-Romagna: provincia di Bologna divisa in due zone (`sub_areas`): Azienda USL di Bologna (PEC protocollo@pec.ausl.bologna.it, pagina «Contatti e Posta Elettronica Certificata») e Azienda USL di Imola (urp@ausl.imola.bo.it, pagina URP; i 10 comuni dal menu «Medici e Pediatri di Famiglia»). Scelta del medico per tutte le AUSL dal Fascicolo sanitario elettronico (pagina della Regione); AUSL di Imola e di Parma dalle loro pagine. «Prelista» (percorso di tutela) per AUSL della Romagna, Parma e Reggio Emilia; mancano Bologna, Imola, Ferrara, Modena e Piacenza.
- Marche: scelta del medico per le 5 AST dalle pagine dell'anagrafe assistiti; PEC dell'AST Fermo (ast.fermo@emarche.it, pagina «Note legali»); sportelli anagrafe di Ascoli Piceno, San Benedetto del Tronto e Porto Sant'Elpidio.
- Umbria: numeri dello screening del seno dell'USL Umbria 1 (7 centri di senologia, pagina «Screening della mammella»).
- `data/regioni/index.json`: accesi cartella clinica, medico di famiglia, assistenza a casa e cure palliative in Emilia-Romagna; medico di famiglia nelle Marche. Liste d'attesa (Emilia-Romagna, Marche) e prevenzione (Emilia-Romagna, Marche, Toscana, Liguria) restano spente: mancano prove per qualche azienda.
- `pagine[]`: nuove pagine da copiare (solo domini ufficiali): screening di tutte le AUSL emiliano-romagnole, delle AST, dell'ASL Toscana Sud Est e delle Aree liguri; presa in carico e preliste di Bologna, Ferrara, Modena e Piacenza; tempi di attesa dell'ARS Marche e delle AST di Ancona e Ascoli Piceno. Tolta la pagina cartelle dell'AUSL di Modena (404).

## 23/10/2026 — Valle d'Aosta, Trentino-Alto Adige, Friuli-Venezia Giulia, Veneto: terzo giro sulle copie (percorso di tutela, screening, medico)
- Fonti: le copie del 23/10/2026 del branch `copie-siti`. Nelle quattro regioni non c'è ancora nessun PDF copiato. Ogni numero nuovo ha `url` = la pagina copiata, `verified` 2026-10-23, `proof` «pagina».
- Moduli accesi in `data/regioni/index.json`: Friuli-Venezia Giulia medico di famiglia (ASUFC: `scelta_medico` dalle pagine «Scelta o cambio del medico» e «Anagrafe sanitaria», con 14 sportelli di anagrafe; le altre tre aziende lo avevano già); Trentino-Alto Adige prevenzione (Asuit: numeri verdi dello screening 800 243625 e 800 100616 dalle pagine sul tumore del colon-retto e del seno; Bolzano ha i numeri del CUPP Prevenzione).
- Friuli-Venezia Giulia, diritto di garanzia: ASUGI (Trieste e Gorizia, pagina «Percorso di tutela - Diritto di Garanzia») e ASUFC (Udine, pagina «Liste di attesa») con `channel`, `letter_mode`, `how_to`, `documents_required`, sportelli e orari. Liste d'attesa resta spenta: per l'ASUFC la pagina non dice cosa succede dopo la richiesta (`what_next`); il regolamento in PDF è in `pagine`.
- Veneto: percorso di tutela (`how_to`, `what_next`) dell'ULSS 1, dell'ULSS 9 e delle zone ULSS 3 e ULSS 7; screening dell'ULSS 4 (0421 228243) e dell'ULSS 9 (045 6712016). Liste d'attesa e prevenzione restano spente: mancano ULSS 2, 4, 5, 6 e 8.
- `pagine[]`: url ufficiali nuovi da copiare (regolamenti del diritto di garanzia in PDF di ASUGI, ASUFC e ASFO; liste d'attesa e screening delle ULSS; URP, tempi di prenotazione e Carta dei servizi dell'Azienda sanitaria dell'Alto Adige; PUA e ADI in Valle d'Aosta). Tolte 10 pagine che rispondono 404. Bolzano non ha ancora un'email dell'URP né la PEC generale.

## 23/10/2026 — Lazio, Abruzzo, Molise, Campania: terzo giro sulle copie (testo dei PDF)
- Fonti: le copie del 23/10/2026 del branch `copie-siti`, anche il testo dei PDF. Ogni numero, PEC ed email nuova ha `url` = la pagina copiata, `verified` 2026-10-23, `proof` «pagina». Nessun modulo nuovo acceso: in ogni regione manca ancora la prova per almeno un'azienda.
- Lazio: zona ASL Roma 3 con PEC urp@pec.aslroma3.it, email urp@aslroma3.it e comuni (Municipi X, XI e XII, Fiumicino) dalla pagina URP dell'ASL Roma 3 (il sito ora risponde al server); nei details della zona la PEC del percorso di tutela protocollo@pec.aslroma3.it con i documenti (pagina Liste di attesa, Delibera 597/2024). In tutte le ASL una riga nei details: il Pass di garanzia è un servizio della Regione (Salute Lazio). Liste d'attesa resta spento: la zona Roma 2 non ha ancora PEC né email (pagina «PEC» dell'ASL Roma 2 in `pagine`). In `pagine` anche il depliant screening di Salute Lazio e la pagina screening della Regione (numeri verdi di ogni ASL), le pagine dei distretti di Roma 4, 5 e 6. Nel `todo`: la pagina «Servizio prenotazioni» dell'ASL Roma 3, unica fonte del centralino 06 56481 (scritto «+390656481»), ha link di siti di scommesse e sembra manomessa.
- `tests/copie-noti.txt`: tolte le tre righe «url senza copia» dell'ASL Roma 3 (ora copiate), aggiunta la riga del centralino 06 56481 scritto con il +39.
- Abruzzo: ASL di Teramo, contatto «screening» numero verde 800 210002 (pagina «Cittadini Utenti»). Prevenzione resta spenta: mancano i numeri dello screening delle ASL 1, 2 e Pescara (pagine screening di ASL 2 e Pescara in `pagine`); in `pagine` anche la procedura del percorso di tutela dell'ASL 1 e il piano liste d'attesa dell'ASL 2.
- Molise: in `pagine` la pagina dell'Hospice di Larino (cure palliative). I PDF della DDG 1696/2024 sul percorso di tutela non sono ancora nelle copie.
- Campania: ASL di Avellino, percorso di tutela dal PDF «Percorso di tutela aziendale» (istanza per email a urp@aslavellino.it, dati da scrivere, documenti, niente rimborsi dopo): `letter_mode` «email», `send_to`, `how_to`, `documents_required`, `notes`, `details`. ASL Napoli 3 Sud: due contatti «screening» (seno 081 18436545, colon-retto 081 18436557) dalla rubrica, anche nella zona. Liste d'attesa e prevenzione restano spente: mancano le altre ASL. In `pagine` le pagine screening delle ASL, la pagina liste d'attesa e la procedura di tutela dell'ASL Napoli 3 Sud e le pagine dei distretti delle tre ASL di Napoli (comuni delle zone); tolta la notizia della Regione che risponde 404.

## 23/10/2026 — Piemonte e Lombardia: terzo giro sulle copie (anche i PDF)
- Fonti: le copie del server del 23/10/2026 (branch `copie-siti`, anche il testo dei PDF). Nessun dato preso dal motore di ricerca: lì solo gli indirizzi nuovi di `pagine[]`.
- Piemonte: PEC dell'ASL VCO protocollo@pec.aslvco.it (sede legale in via Mazzini 117, Omegna) dal PDF del Bollettino ufficiale della Regione Piemonte n. 46 del 13/11/2025 (https://www.regione.piemonte.it/governo/bollettino/abbonati/2025/46/attach/co_azienda%20sanitaria%20locale%20vco_2025-11-03_97606.pdf). Il sito aslvco.it chiede ancora un CAPTCHA al server.
- `data/regioni/index.json`: in Piemonte accesi cartella clinica, assistenza a casa e cure palliative (ora ogni ASL e ogni zona di Torino e Cuneo ha PEC o email provata). Liste d'attesa restano spente: manca il percorso di tutela dell'ASL VCO, e per l'ASL Biella l'indirizzo dove mandare la domanda (la pagina rimanda a un modulo PDF non copiato). Prevenzione resta spenta: il numero dello screening c'è solo per Torino.
- Lombardia: testo sotto il pulsante «In quale zona?» (`comuni`) per le 22 ASST delle province con più ASST (Bergamo, Brescia, Como, Cremona, Milano, Monza e Brianza, Varese): distretti, Municipi di Milano o comuni dove la copia li elenca (Nord Milano, Melegnano e Martesana), se no gli ospedali e le Case di Comunità. Fonti nel `todo` di ogni provincia. Nessun modulo nuovo: nelle copie della Lombardia non c'è ancora nessun PDF, mancano il percorso di tutela di molte ASST e i numeri dello screening delle ATS (solo Bergamo e Pavia).
- `pagine[]` nuove (domini ufficiali, da copiare): elenco dei centri screening della Regione Lombardia (PDF) e pagina regionale sugli screening per le province senza numero; pagina «Prevenzione Serena» della Regione Piemonte per le ASL senza numero; PDF del percorso di tutela dell'ASL VCO; modulo PDF del percorso di tutela dell'ASST Valle Olona; PDF dell'Ufficio Pubblica Tutela dell'ASST Ovest Milanese; Carta dei Servizi 2026 dell'ASST Santi Paolo e Carlo.

## 23/10/2026 — Puglia, Basilicata, Calabria, Sardegna: terzo giro sulle copie (anche i PDF)
- Puglia: prevenzione accesa. Ogni ASL ha il numero degli screening oncologici, letto sulla home dell'ASL copiata il 23/10/2026. Nuovo il numero verde 800 957773 dell'ASL Foggia (https://www.sanita.puglia.it/web/asl-foggia); per l'ASL Lecce lo stesso numero ora viene dalla home del portale nuovo (https://www.sanita.puglia.it/web/asl-lecce), non più dal vecchio portale sist.
- Basilicata: assistenza a casa accesa (la lettera va all'URP o alla PEC di ogni azienda, già provate). Nuovi per l'ASM Matera, Distretto di Policoro: ADI 0835 986456 e ufficio protesi 0835 986420, via Moncenisio (pagina del Distretto sul vecchio sito old.asmbasilicata.it, copia del 23/10/2026). Tolta da «pagine» la pagina «cure a casa e hospice» dell'ASM, che risponde 404.
- Liste d'attesa: restano spente in tutte e quattro le regioni. In Puglia e in Sardegna il server non ha copiato PDF; la Carta dei servizi dell'ASP Basilicata (PDF) e le Linee guida del CUP della Calabria (PDF) non danno canale, documenti e indirizzo per azienda; l'ASP di Vibo Valentia risponde ancora 403.
- Sardegna: in «pagine» la procedura del percorso di tutela dell'ASL Nuoro e la nota dell'ASL Sassari (PDF), da leggere dopo la copia. `inps.json`: le notizie INPS sulla riforma ora sono copiate, ma non dicono se «Sassari» e «Cagliari» valgono per Gallura, Ogliastra, Medio Campidano e Sulcis: regime ancora null.
- `todo` aggiornati in tutte le aziende delle quattro regioni (riga «Terzo giro»).

## 23/10/2026 — Copie: i link ai PDF delle pagine; numeri col +39
- `tools/copie.mjs`: per ogni pagina copiata l'indice ha i link ai PDF dello stesso dominio (`link_pdf`, con il testo del link). Quelli che sembrano moduli o guide (tutela, modulo, istanza, carta dei servizi, liste d'attesa, screening) si copiano subito, al massimo 5 per pagina. Prima i moduli di tutela linkati nelle pagine non si trovavano senza il motore di ricerca (terzo giro sulle regioni). Test in `tests/copie-giro.test.mjs`.
- Errore trovato: `tools/confronta-copie.mjs` non trovava un numero scritto con il prefisso attaccato (ASL Roma 3: «+390656481»). Ora la ricerca è in `tools/cerca-numero.mjs`, con `tests/cerca-numero.test.mjs`.

## 22/10/2026 — Copie: i PDF si leggono anche senza pdftotext
- `tools/pdf-testo.mjs` (nuovo): se sul server manca `pdftotext`, `tools/copie.mjs` fa il testo dei PDF con pdf.js 4.10.38, scaricato da npm la prima volta e usato solo se l'impronta sha512 è giusta. Gira in un processo a parte, fermato dopo 60 secondi. Così poppler-utils non serve più per forza: basta unire la pull request.
- Errore trovato provando: pdf.js scrive i suoi avvisi su stdout, e il testo del PDF non si leggeva. Ora gli avvisi vanno su stderr; `tests/copie-giro.test.mjs` fa un giro senza pdftotext e controlla il testo del PDF.
- `tools/copie-se-serve.sh`: anche una modifica a `tools/pdf-testo.mjs` fa partire la copia.

## 22/10/2026 — Prevenzione in Molise, Umbria e Valle d'Aosta
- `data/regioni/index.json`: prevenzione accesa in Molise, Umbria e Valle d'Aosta, dove ogni azienda ha il numero dello screening nei dati (contatti con prova «pagina» dei giri precedenti).
- `tests/coerenza.test.mjs`: fuori dalla Sicilia la prevenzione si accende solo se ogni azienda ha un contatto «screening».
- `tests/browser.cjs`: il giro di tutte le regioni risponde a sesso ed età prima della provincia (prima la prevenzione non si poteva accendere da nessuna parte: il giro si fermava).

## 22/10/2026 — Puglia, Sardegna, Basilicata, Calabria: secondo giro sulle copie (medico di famiglia, cartella clinica)
- Fonti: le copie del 22/10/2026 del branch `copie-siti` (pagine in `pagine[]`, email Cloudflare in chiaro). Ogni numero, PEC ed email nuova ha `url` = la pagina copiata, `verified` 2026-10-22, `proof` «pagina».
- Moduli accesi in `data/regioni/index.json`: Puglia e Sardegna medico di famiglia e cartella clinica (Sardegna: `moduli` ["numeri-utili", "cartella-clinica", "medico-famiglia"]; l'invalidità resta spenta per il `regime` null di 4 sedi INPS).
- Puglia: `scelta_medico` dalla pagina regionale PugliaSalute «Scelta e Revoca Medico» (online con SPID, CIE o TS-CNS; pulsante «Sito della Regione») per le 6 ASL; a Foggia anche l'ufficio scelta e revoca di San Severo, a Taranto anche gli sportelli e i CAF convenzionati. ASL Bari: servizio protesi (080 5843021), ambulatorio di cure palliative di Altamura, uffici cartelle cliniche del Policlinico e del Giovanni XXIII (`policlinico.ba.it` in `official_domains`). ASL Foggia: uffici protesi di San Severo, Torremaggiore, Apricena e Lesina; PEC dell'URP urp@mailcert.aslfg.it prima della PEC della direzione (pagina «Altri contatti»). ASL Taranto: uffici protesi di Taranto, Laterza, Massafra e Grottaglie.
- Sardegna: PEC protocollo@pec.asl….it ed email URP delle 8 ASL dalle copie (prima nascoste da Cloudflare; Ogliastra senza email URP: la lettera va alla PEC). `scelta_medico` dalla pagina regionale «Scelta e revoca del medico» (Zente Web). ASL Medio Campidano: percorso di tutela dalla pagina dell'ASL (modulo A alla PEC, documenti, risposta dell'URP, rimborso). ASL Nuoro: `send_to` urp.nuoro@aslnuoro.it, l'indirizzo della pagina del percorso di tutela. Liste d'attesa restano spente: manca il percorso in Gallura, Ogliastra, Oristano e Sulcis, e a Cagliari è nell'Allegato A in PDF.
- Basilicata: `scelta_medico` per ASM Matera (portale «Servizi Anagrafe» con firma digitale) e ASP Potenza (online o agli sportelli, con i documenti e la PEC del protocollo), sportelli scelta e revoca e centri di coordinamento delle cure palliative dell'ASP. Nessun modulo nuovo: `tests/browser.cjs` segnala «ASP» fuori dalla Sicilia nel nome ufficiale «ASP Basilicata», anche nell'intestazione della lettera (todo).
- Calabria: `scelta_medico.url` alla pagina FAQ di Ecosanità (Regione Calabria) con «Sito della Regione». Nessun modulo nuovo: l'ASP di Vibo Valentia non ha ancora PEC né email (aspvv.it risponde 403 al server).
- `pagine[]` nuove (trovate con il motore di ricerca, domini ufficiali, da copiare): cartelle cliniche di ASM Matera, ASP Potenza, ASP Reggio Calabria, ASP Catanzaro (regolamento), ASP Cosenza; protesica di ASP Potenza, ASL Lecce, ASL Brindisi, ASL BAT; ADI di Brindisi; PUA e ADI di Alghero (ASL Sassari); liste di attesa dell'ASL Gallura.
- `tests/copie-noti.txt`: la pagina liste di attesa dell'ASP di Vibo Valentia (403, come il resto del sito).

## 22/10/2026 — Toscana, Umbria, Liguria, Marche: moduli con le lettere dalle copie (secondo giro)
- Fonti: copie del server del 22/10/2026 (branch `copie-siti`, ultima copia delle 14:16), con le email in chiaro (Joomla delle USL toscane) e le pagine aperte nel browser. Ogni numero, email e PEC nuovo ha `proof: "pagina"` e l'url della pagina copiata.
- Toscana: email degli URP per provincia (Sud Est: urp.arezzo@, urp.grosseto@, urp.siena@uslsudest.toscana.it; Nord Ovest: URP di zona dalla pagina «Contatti e sedi URP»; Centro: urp@uslcentro.toscana.it e PEC urp.uslcentro@postacert.toscana.it, https://www.uslcentro.toscana.it/urp). Scelta del medico dalle pagine dell'ASL Sud Est e Centro e, per la Nord Ovest, della Regione (https://www.regione.toscana.it/scegliere-il-medico-di-base). Percorso di tutela: Centro dall'URP, poi 116117 (pagina «Tempi di attesa e Percorso di Tutela»); Sud Est e Nord Ovest il CUP prende in carico e richiama, poi reclamo all'URP (pagine «Tempi di attesa», «Criteri di formazione liste», «Attività di tutela», «Reclami e segnalazioni»). Uffici cartelle di Careggi e AOU Pisana, cure palliative e protesi di alcune zone.
- Umbria: provincia di Perugia divisa in due zone (`sub_areas`): USL Umbria 1 e USL Umbria 2 (22 comuni di Foligno, Spoleto e Valnerina, dalla pagina Guardia medica dell'USL 2), ognuna con `nome_lettera`, URP, PEC e scelta del medico (pagine URP e «Scelta, cambio, revoca» dell'USL 1, «Anagrafe assistibili» dell'USL 2, Regione «Scelta e revoca online»). Percorso di tutela dalla pagina della Regione «Liste di attesa» (il CUP prende in carico e ricontatta) e dell'USL 1 (3 chiamate senza risposta). Uffici cartelle cliniche, protesica e screening (USL 2) per distretto.
- Liguria: percorso di tutela anche a Genova (Area 3: 800 185055; Area 4: 800 185088), Savona (800 183422) e La Spezia (Recupero prestazioni 800 185466, recupero.prestazioni@asl5.liguria.it), dalle pagine «Liste di attesa» delle Aree e di ATS Liguria. Uffici cartelle cliniche delle Aree 1, 3, 4 e 5, cure palliative delle Aree 4 e 5, protesica dell'Area 1.
- `data/regioni/index.json`: accesi liste d'attesa, cartella clinica, medico di famiglia, assistenza a casa, cure palliative e ausili in Toscana e Umbria; liste d'attesa, cartella clinica, assistenza a casa, cure palliative e ausili in Liguria; cartella clinica, assistenza a casa e cure palliative nelle Marche (email URP e PEC già nelle copie). Emilia-Romagna: nessun modulo nuovo (manca la PEC dell'AUSL di Bologna per le zone della provincia).
- `pagine[]`: tolte le pagine che non esistono più (ec.uslumbria2.it, 404 delle ASL toscane); nuove pagine da copiare (trovate col motore di ricerca, solo domini ufficiali, nessun dato preso da lì): PEC dell'AUSL di Bologna e di Ferrara, prelista dell'AUSL Romagna e liste d'attesa di Parma, screening dell'USL Umbria 1, scelta del medico e cartelle cliniche delle AST delle Marche, note legali dell'AST Fermo. Cosa manca è nel `todo` di ogni azienda.

## 22/10/2026 — Valle d'Aosta, Trentino-Alto Adige, Friuli-Venezia Giulia, Veneto: secondo giro sulle copie
- Fonte di tutto: le copie delle pagine ufficiali del 22/10/2026 (branch `copie-siti`, anche le pagine aperte nel browser), proof «pagina». Nessun dato dagli estratti del motore di ricerca: gli indirizzi trovati così sono solo in `pagine[]`, per la prossima copia.
- Valle d'Aosta: accesi `cartella-clinica`, `cure-palliative` e `ausili`. Nuovi contatti dell'Azienda USL: Ufficio cartelle cliniche dell'Ospedale Parini (0165 543240, martedì e giovedì 8:30–13, ufficiocartellecliniche@ausl.vda.it), cure palliative e hospice (0165 545573, Beauregard), ufficio protesica e ausili (0165 544806, via Guido Rey 1) e riparazioni (0165 545714), coordinamento screening (0165 231205). Fonti: pagine «Richiedere e ritirare la cartella clinica», «Hospice e cure palliative – Sede e contatti», «Ausili, protesi e ortesi», «Aderire agli screening regionali» di ausl.vda.it. `prevenzione` ha i dati ma resta spenta: il giro generico di `tests/browser.cjs` non sa rispondere a sesso ed età prima della provincia. `assistenza-domiciliare` resta spenta: nessun PUA nelle copie.
- Trentino-Alto Adige (nessun modulo nuovo: Bolzano non ha email URP né PEC generale nelle copie). Trento (Asuit): `scelta_medico` (TreC+, sportelli anagrafe sanitaria su appuntamento, 0461 371037) con 16 sportelli, 7 uffici cartelle cliniche degli ospedali, cure palliative dal PUA. Bolzano: il 116117 è attivo dal 15/09/2026 solo nel Comprensorio sanitario di Bolzano (pagina della Provincia «Il numero 116117»); guardia medica di Bolzano 0471 438288 (pagina del distretto Centro-Piani-Rencio). Tolte da `tests/copie-noti.txt` le 8 righe del CUPP di Bolzano: le due pagine oggi rispondono 503.
- Friuli-Venezia Giulia (nessun modulo nuovo: per l'ASUFC di Udine mancano scelta del medico, cartelle e diritto di garanzia). ASFO: diritto di garanzia (email tempidiattesa@asfo.sanita.fvg.it o sportelli CUP; si chiede entro 4, 10 o 40 giorni lavorativi dalla prenotazione per le classi B, D, P: l'estratto di stamattina li leggeva come tempi di risposta) e `scelta_medico` (SESAMO). ASUGI (Trieste e Gorizia): `scelta_medico` (SESAMO con SPID o Login FVG, sportelli, PEC asugi@certsanita.fvg.it) e 10 sportelli di anagrafe sanitaria.
- Veneto: zone per le lettere (`sub_areas` oggetto) a Venezia (Azienda ULSS 3 Serenissima, PEC protocollo.aulss3@pecveneto.it; Azienda ULSS 4 Veneto Orientale, urp@aulss4.veneto.it e protocollo.aulss4@pecveneto.it) e a Vicenza (Azienda ULSS 8 Berica, protocollo@aulss8.veneto.it e protocollo.aulss8@pecveneto.it; Azienda ULSS 7 Pedemontana, urp@aulss7.veneto.it e protocollo.aulss7@pecveneto.it, con i comuni dei due distretti). Fonti: pagine URP e PEC delle quattro ULSS, «Distretti e territorio» dell'ULSS 7, elenco delle aziende della Regione. ADI dei distretti di Belluno (0437 516812) e Feltre (0439 883107), ADI di Arzignano (0444 708220) e Impegnativa di cura domiciliare dell'ULSS 8 (0444 756405). Nessun modulo nuovo: mancano cartelle, protesica e screening in quasi tutte le ULSS.
- `pagine[]`: aggiunte le pagine ufficiali da copiare per quello che manca (cartelle cliniche di tutte le ULSS venete, ASFO e Asuit, protesica e screening, diritto di garanzia ASUGI e ASUFC, scelta del medico ASUFC, contatti e PEC dell'Azienda sanitaria dell'Alto Adige, PUA e invalidità civile in Valle d'Aosta).

## 22/10/2026 — Zone: una sola zona senza domanda
- `tests/browser.cjs`: «ASP» non è siciliano anche dove un'azienda ha «ASP» nel nome ufficiale («ASP Basilicata», Potenza), letto dai dati. Basilicata con cartella clinica e medico di famiglia (dati del gruppo Sud).
- Ausili spenti fuori dalla Sicilia (Toscana, Umbria, Liguria, Valle d'Aosta): il modulo dice «l'ASL deve rispondere entro 20 giorni, se non risponde vale come un sì», che è la regola della Sicilia; nelle altre regioni i giorni li fissa la Regione. Nuovo controllo in `tests/coerenza.test.mjs`: ausili acceso solo in Sicilia finché il modulo non ha i giorni di ogni regione con la fonte.
- Nuovo `tests/conflitti.test.mjs`: nessun file del repository con i segni di un conflitto di git rimasti dentro (`tests/copie-noti.txt` era stato salvato così unendo il lavoro di due agenti).
- `js/flow.js` (`provinceChoice`): se l'azienda della provincia ha una sola zona con la lettera (Lombardia: l'ATS e una sola ASST), il modulo usa quella senza chiedere «In quale zona?». `tests/coerenza.test.mjs` chiede ora almeno una zona, non due.
- `tests/browser.cjs`: il giro su tutte le regioni si aspetta la domanda «In quale zona?» solo nei moduli con una lettera all'azienda e solo con due zone o più (l'invalidità scrive all'INPS).

## 22/10/2026 — Piemonte e Lombardia, giro 2: zone delle aziende, percorso di tutela, scelta del medico
- Piemonte: acceso `medico-famiglia`. La scelta del medico viene dalla pagina della Regione Piemonte «Il medico di famiglia e il pediatra di libera scelta» e dal servizio «Il mio medico» di Salute Piemonte (copie del 22/10/2026): online o all'ufficio scelta e revoca del distretto, con tessera sanitaria, codice fiscale e documento. Vale per tutte le ASL.
- Piemonte, zone in `sub_areas` (copie del 22/10/2026): Torino con ASL Città di Torino (protocollo@pec.aslcittaditorino.it, urp@aslcittaditorino.it), ASL TO3 (aslto3@cert.aslto3.piemonte.it, urp@aslto3.piemonte.it), ASL TO4 (direzione.generale@pec.aslto4.piemonte.it, urp@aslto4.piemonte.it), ASL TO5 (protocollo@cert.aslto5.piemonte.it, urp@aslto5.piemonte.it); Cuneo con ASL CN1 (protocollo@aslcn1.legalmailPA.it, urp@aslcn1.it) e ASL CN2 Alba-Bra (aslcn2@legalmail.it, urp@aslcn2.it).
- Piemonte, percorso di tutela dalle pagine copiate delle ASL (Alessandria, Asti, Novara, Vercelli, CN1, CN2, Città di Torino, TO3, TO4, TO5): indirizzo, fogli da mandare, cosa succede dopo, classi B, D e P (Novara: B e D), nessun rimborso delle visite già fatte a pagamento. `liste-attesa` resta spento: mancano Biella (la pagina non dice l'indirizzo) e VCO (sito 403). Spenti anche cartella clinica, assistenza a casa, cure palliative e ausili: l'ASL VCO non ha email né PEC provate.
- Piemonte, cure palliative: ASL Biella 015 15154533, ASL TO4 (Lanzo 0123 300545, Foglizzo 011 9701891, Salerano 0125 538809), ASL TO5 (Carignano 011 9698976), dalle pagine copiate.
- Lombardia: zone in `sub_areas`, una per ASST (26 aziende nelle 12 province), con nome ufficiale, PEC e email URP dalle copie delle pagine ufficiali del 22/10/2026 (ASST del Garda dalla pagina URP dell'ATS di Brescia; ASST Ovest Milanese senza PEC, solo URP). Percorso di tutela scritto per ASST Spedali Civili, Bergamo Ovest, Bergamo Est, Niguarda e Valle Olona. Nessun modulo nuovo acceso: mancano i comuni delle ASST e il percorso di tutela delle altre, e le province con una sola ASST (Lecco, Lodi, Mantova, Pavia, Sondrio) hanno una zona sola.
- Pagine nuove da copiare: ASL Biella (percorsi di tutela, modulo), Regione Piemonte (ASL VCO), ASST di Lodi e di Cremona (liste di attesa, UPT).

## 22/10/2026 — Lazio, Abruzzo, Molise, Campania: secondo giro sulle copie (zone di Roma e Napoli, scelta del medico in Abruzzo)
- Campania, provincia di Napoli: le tre ASL sono ora zone in `sub_areas` (domanda «In quale zona?»): ASL Napoli 1 Centro (urpcentrale@aslnapoli1centro.it, PEC urpcentrale@pec.aslna1centro.it, pagina URP), ASL Napoli 2 Nord (urp@aslnapoli2nord.it, PEC protocollo@pec.aslnapoli2nord.it, pagine URP e PUA), ASL Napoli 3 Sud (relazionipubbliche@aslnapoli3sud.it, pagina URP; PEC protocollo@pec.aslnapoli3sud.it, pagine CUP e rubrica). Ogni zona ha i numeri della sua ASL. Copie del 22/10/2026. Mancano i comuni di ogni ASL (todo).
- Campania: accesi `cartella-clinica` e `assistenza-domiciliare` (`data/regioni/index.json`): ogni azienda e ogni zona di Napoli ha email o PEC e i numeri del PUA o delle cure domiciliari nelle copie.
- Abruzzo: `scelta_medico` nelle 4 ASL dalla pagina «Servizi online» del Portale Sanità della Regione (scelta e cambio del medico o del pediatra online, con SPID o utenza regionale; delega per minori e non autosufficienti), con il pulsante «Sito della Regione». ASL 2 Lanciano – Vasto – Chieti: sportelli scelta e revoca di Chieti (0871 357260), Lanciano (0872 706953) e Vasto (0873 308729) con gli orari, dalle pagine delle Case della comunità. Acceso `medico-famiglia`.
- Lazio: percorso di tutela («Pass di garanzia») in tutte le ASL dalla pagina di Salute Lazio (copia del 22/10/2026; le stesse frasi nelle pagine dell'ASL Roma 1 e Roma 5): `how_to`, `documents_required`, `what_next`, `details`, `letter_mode` «portal». Provincia di Roma: zone in `sub_areas` per le sei ASL; Roma 1, 4, 5 e 6 con la PEC (e l'email URP di Roma 1 e Roma 5) dalle copie, Roma 2 e Roma 3 ancora senza indirizzo (il sito dell'ASL Roma 3 non risponde al server). Per questo nel Lazio i moduli con la lettera restano spenti.
- Abruzzo, Molise, Campania, Lazio: `todo` aggiornati con quello che le copie del 22/10/2026 dicono e quello che manca (moduli del percorso di tutela dell'ASL 1 e di Pescara, allegati della DDG 1696/2024 del Molise, hospice di Larino, ufficio protesi di Campobasso, comuni delle ASL di Roma e Napoli). Nuove pagine da copiare: «Percorsi di tutela» dell'ASL di Frosinone e dell'ASL di Avellino (PDF).
- `tests/copie-noti.txt`: tre pagine dell'ASL Roma 3 che il server non riesce a copiare (sito che non risponde).

## 22/10/2026 — copie: indirizzi rotti del giro delle 7:30 (21 problemi)
- Fonte: copie del server in Italia (branch `copie-siti`, giro delle 7:30 del 22/10/2026) e prova con browser dal server; sitemap dei siti.
- Veneto (`fonti.json`): tolte le 8 pagine di salute.regione.veneto.it, che rifiuta ogni connessione non domestica (CloudFront 403 anche da browser): nota nella voce, aggiunta la pagina Sanità di regione.veneto.it. ULSS 1: pagine ADI di Belluno e Feltre al posto di una pagina sparita. ULSS 2: «Contatti» e «Numeri utili» al posto di «Strutture» (404). ULSS 6: elenco «Case della Comunità» (l'indirizzo era troncato). ULSS 8: URP e cure domiciliari (impegnativa di cura, ADI Arzignano) al posto di due pagine 404.
- Campania (`asl.json`): la pagina regionale «Liste di attesa» non esiste più sul sito nuovo della Regione; al suo posto la pagina della Regione sul monitoraggio delle liste d'attesa e il CUP unico regionale (5 ASL).
- `tools/copie.mjs`: se un sito risponde 403 al programma ma accetta un browser (ASP Vibo Valentia, ASL VCO), la pagina si riprende col browser.

## 22/10/2026 — Lettere all'azienda giusta: nome ufficiale, zone, percorsi in tutte le regioni
- Le lettere all'azienda sanitaria scrivevano la sigla + «di» + provincia: «USL di Perugia», «ATS di Genova», «ASREM di Campobasso», «USL di Aosta», aziende che con quel nome non esistono. Ora cominciano con `nome_lettera`, il nome ufficiale preso dal `name` già provato (nessun dato nuovo): per esempio «USL Umbria 2», «ASReM – Azienda Sanitaria Regionale del Molise», «Azienda USL della Valle d'Aosta», «ATS Liguria – Area sociosanitaria locale 2 (Savona, ex ASL2 Savonese)», «AUSL della Romagna», «Azienda USL Toscana Centro», «ASM – Azienda Sanitaria Locale di Matera». `nome_lettera` c'è in ogni azienda di una sola azienda di tutte le regioni attive fuori dalla Sicilia. La Sicilia resta com'era: «Azienda Sanitaria Provinciale di Palermo» (`asl_intestazione` dell'indice). Codice: `zoneLettera()`, `conZona()` e `intestazioneDi()` e il parametro `intestazione` in `js/letters.js`, `intestazioneAzienda()` in `js/flow.js`.
- Più aziende in una provincia: `aziende_multiple: true`, con una riga nel `todo`, a Roma, Napoli, Torino, Cuneo, Perugia, Bologna (AUSL di Bologna e di Imola), Venezia, Vicenza e in tutte le province lombarde (ATS e ASST). Le `sub_areas` ora possono essere oggetti con `id`, `label`, `comuni` e i campi della lettera (`nome_lettera`, `pec`, `emails`, `send_to`, `how_to`…) che prendono il posto di quelli dell'azienda; i moduli cartella-clinica, medico-famiglia, assistenza-domiciliare, cure-palliative, liste-attesa e ausili chiedono «In quale zona?» dopo la provincia (`provinceChoice()` e `zonaScreen()` in `js/flow.js`). Le zone scritte come frase (Messina) non cambiano niente. Le zone vere sono da riempire dalle copie: elenco in `docs/regioni.md`, sezione 1.
- `js/medico.js`: il pulsante di `scelta_medico.url` usa `scelta_medico.url_label` se c'è (per esempio «Sito della Regione»); se no resta «Sito dell'<sigla>». In Liguria «Sito dell'Area 1/2/3/5» (i siti delle aree, come dice `how`).
- `tests/coerenza.test.mjs`: un modulo con lettera all'azienda non si accende se una provincia ha `aziende_multiple` senza almeno due zone con `nome_lettera` e `pec`, `emails` o `send_to` suoi; fuori dalla Sicilia ogni azienda ha `nome_lettera`; ogni zona ha i campi che il modulo legge; un `name` che elenca più aziende («ASL CN1 e ASL CN2», «Roma 1–6») o email URP di più ASST vogliono `aziende_multiple`. Le regole sono provate anche su dati finti.
- `tests/aziende.test.mjs` (nuovo): zone, `conZona()`, intestazione, la Sicilia invariata, `nome_lettera` in tutte le regioni attive fuori dalla Sicilia. `tests/errori-noti.test.mjs`: niente intestazione fatta a mano con `aslIntestazione()` + «di».
- `tests/browser.cjs`: per ogni regione con `moduli`, ogni modulo acceso (tranne i Numeri utili) in una provincia a turno, con la zona se c'è, fino alla fine e, per le lettere, fino alla lettera: errori JavaScript, «undefined», «Sicilia» e «ASP» fuori dalla Sicilia (in Calabria «ASP» va bene), «non abbiamo ancora i dati» in un modulo acceso, email che non sono nei dati della regione, intestazione e indirizzo della lettera dell'azienda della regione. «In quale zona?» provata con due zone finte a Messina. Prende i mutanti «medico-famiglia acceso in Abruzzo senza `scelta_medico`», «intestazione con la sigla + di» (Liguria, Molise, Valle d'Aosta) e «zona ignorata». `SOLO_REGIONI=1` prova solo questi percorsi.
- `tests/browser.cjs` e `tests/robustezza.cjs`: da quando sono attive tutte le regioni, la schermata «La tua regione non c'è ancora» non si provava più. Ora, se nessuna regione è non attiva, il browser aggiunge all'indice una regione finta non attiva («Regione di prova», con `page.route`).

## 22/10/2026 — Copie delle pagine ufficiali: email nascoste, PDF, fonti INPS
- `tools/email-nascoste.mjs` (nuovo), usato da `tools/copie.mjs` prima di fare il testo: rimette in chiaro le email nascoste ai robot. Cloudflare (`data-cfemail`, link `/cdn-cgi/l/email-protection#…`): nelle copie c'era «[email protected]» (123 copie in Sardegna, 3 in Calabria). Joomla (variabili `addy…`, `<joomla-hidden-mail>`): «Questo indirizzo email è protetto dagli spambots» al posto di URP e PEC delle USL toscane. Nell'indice: `email_nascoste`.
- `tools/copie.mjs`: i PDF si copiano come testo se sul server c'è `pdftotext` (`sudo apt-get install -y poppler-utils`), al massimo 5 MB, con `"pdf": true` nell'indice; senza `pdftotext` restano segnati come prima. Stesse regole di buona educazione: una richiesta alla volta, la pausa, il nostro nome nel User-Agent.
- `tools/copie.mjs` copia anche: fonti (`sources`) e pagine (`pagine`) di `inps.json`, prova di `regime`; gli url di `regole_fonti` (cartella `regole`); `scelta_medico.url` e `phones[].url`. Legge `fonti.json` anche per le regioni attive (le pagine trovate prima dei dati restano aggiornate; un url già copiato non si riscarica) e cancella le cartelle delle aziende che non sono più in nessun file della regione.
- `tools/confronta-copie.mjs`: controlla anche gli url di `pagine[]`, `scelta_medico.url`, `regole_fonti` e di fonti e pagine di `inps.json`. Un url non ancora nell'indice è «da copiare» e non conta; conta se la copia c'è stata e non è riuscita. Segnala le cartelle che l'indice non nomina.
- `tools/copie-se-serve.sh`: la copia a richiesta parte anche quando cambia `tools/email-nascoste.mjs`.
- Nuovi `tests/copie-email.test.mjs` (esempi fissi di Cloudflare e Joomla 1.5, 3, 4) e `tests/copie-giro.test.mjs` (un giro di `copie.mjs` su un server locale con pagine finte: PDF, email, INPS, `fonti.json`, cartelle tolte e lasciate).
- `.github/workflows/test.yml`: il job browser (25 minuti in serie) è diviso in tre job paralleli: «browser», «combinazioni», «combinazioni-ny».
- `tests/copie-noti.txt`: tolte 10 righe che il job segnalava come «non ci sono più» (pagine delle sedi INPS siciliane e home dell'Azienda sanitaria dell'Alto Adige, ora copiate).
- `docs/regioni.md` (sezioni 8 e 9) e `docs/protocollo-test.md`: quali url si copiano, `pagine[]`, `regole_fonti`, email nascoste, PDF, Playwright sul server.

## 22/10/2026 — Veneto e Marche attivi: Numeri utili e Invalidità
- `data/regioni/veneto/asl.json` (nuovo): 7 province, 9 ULSS, 90 numeri letti nelle copie del 22/10/2026 fatte dal server con un browser vero (`"browser": true` per le pagine in JavaScript di ULSS 3 e ULSS 4), proof «pagina». Venezia (ULSS 3 Serenissima e ULSS 4 Veneto Orientale) e Vicenza (ULSS 8 Berica e ULSS 7 Pedemontana) hanno una voce sola con i contatti delle due ULSS, come Roma nel Lazio. Guardia medica: 116117 in tutte le ULSS e il numero verde 800 311330 dove il 116117 non prende. PEC delle ULSS (protocollo.aulssN@pecveneto.it) dalle pagine URP e PEC.
- `data/regioni/marche/asl.json` (nuovo): 5 AST, una per provincia, 62 numeri dalle copie del 22/10/2026 (pagine «Telefono e posta elettronica», URP, CUP, PUA, cure domiciliari). CUP regionale 800 098798 (fisso), 0721 1779301 e 071 9998010 (cellulare) dalle pagine CUP delle AST. Guardia medica: nelle Marche il 116117 non è ancora attivo; numero trovato solo per Fermo (centralino). PEC ast.<provincia>@emarche.it dove la pagina la chiama PEC (non Fermo: todo).
- `data/regioni/veneto/inps.json` e `data/regioni/marche/inps.json` (nuovi): indirizzo e PEC delle 12 sedi INPS dalle copie delle pagine «sedi» di inps.it. Regime della riforma della disabilità con le stesse fonti delle altre regioni (estratti delle notizie INPS e del Dipartimento per la disabilità): Vicenza e Macerata dal 30/09/2025; Treviso, Venezia, Verona, Ancona e Ascoli Piceno dal 01/03/2026; Belluno, Padova, Rovigo, Fermo e Pesaro e Urbino col sistema vecchio fino al 31/12/2026.
- `data/regioni/index.json`: Veneto e Marche con `attiva: true` e `moduli: ["numeri-utili", "invalidita"]`. Ora nessuna regione è «non attiva»: `tests/browser.cjs` e `tests/robustezza.cjs` saltano il controllo della regione non attiva.
- `pagine` in ogni voce: le pagine di `fonti.json` e quelle trovate dal server, più alcune da copiare (centralini di ULSS 2, ULSS 3, ULSS 4 e ULSS 9, URP di ULSS 3 e ULSS 4, cartelle cliniche dell'ULSS 1). Cosa manca è nel `todo` di ogni voce.

## 22/10/2026 — Umbria: dati per i moduli e le lettere
- `tests/coerenza.test.mjs`: per il medico di famiglia email o PEC non sono obbligatorie (senza, la lettera si consegna allo sportello: Vibo Valentia).
- Acceso il modulo invalidità in Umbria (`data/regioni/index.json`: `moduli` ["numeri-utili", "invalidita"]). `data/regioni/umbria/inps.json`: riforma della disabilità a Perugia dal 01/01/2025 (prima fase, messaggio INPS 4465 del 27/12/2024) e a Terni dal 01/03/2026 (terza fase, le 40 province nuove). Fonti: [INPS, fase sperimentale](https://inps.it/it/it/inps-comunica/dossier/riforma-della-disabilita/fase-sperimentale.html), [Dipartimento per le disabilità](https://www.disabilita.governo.it/it/notizie/al-via-sperimentazione-riforma-disabilita-in-altre-40-province/) (estratti del 22/10/2026). PEC e indirizzi delle due sedi erano già provati dalle copie del server.
- `data/regioni/umbria/asl.json`: Hospice di Spoleto (0743 210278) e di Terni (0744 204207) dalla pagina [USL Umbria 2 – Cure palliative e terapia del dolore](https://www.uslumbria2.it/notizie/cure-palliative-e-terapia-del-dolore) (copia del server del 21/10/2026; la pagina è del 05/05/2023, da confermare con una telefonata); `pua_url` di Terni (pagina USL Umbria 2 su come si accede all'assistenza domiciliare); domini delle Aziende Ospedaliere di Perugia e Terni in `official_domains`.
- `pagine[]` di Perugia e Terni: le pagine ufficiali da far copiare al server per le lettere (cartelle cliniche di USL 1, USL 2 e delle Aziende Ospedaliere di Perugia e Terni; protesica; scelta e revoca; screening; cure palliative; «presa in carico» del CUP e liste d'attesa; reclami URP). Indirizzi trovati con il motore di ricerca, solo domini ufficiali: nessun dato preso da lì.
- Gli altri moduli restano spenti in Umbria: mancano le pagine copiate e la provincia di Perugia ha due aziende (serve la domanda «In quale zona?» prima di scrivere all'URP o alla PEC). Elenco preciso in `docs/regioni.md`.
- `docs/regioni.md`, nuova sezione 9 «Aggiungere le lettere di una regione (checklist)»: modulo → campi regionali → chi li controlla, regola delle prove, passi (pagine mancanti → copia del server → si accende il modulo).
- `tests/coerenza.test.mjs`: una regione con «moduli» accende un modulo solo se ha i dati che legge (per l'invalidità: `regime` old o new, mai null; per il medico `scelta_medico.how`; per gli ausili la `pec`…).
- `tests/combinazioni.cjs`: prova le sedi INPS di ogni regione che accende l'invalidità (Perugia e Terni, fino alla lettera all'INPS). `tests/browser.cjs`: in Umbria la pagina iniziale dice numeri utili e invalidità, il modulo invalidità propone Perugia e Terni, le liste d'attesa restano senza uffici.
- `tests/browser.cjs` e `tests/robustezza.cjs`: la regione «non ancora attiva» dei controlli di blocco è il Veneto, non più la Campania (attiva da oggi: i due test fallivano).

## 22/10/2026 — Lombardia: invalidità accesa; controllo sul regime INPS
- `data/regioni/index.json`: Lombardia con `invalidita` (il regime della riforma per le 12 sedi INPS è nel `inps.json`, dal gruppo del Nord; prima restava spenta solo perché un test la voleva bloccata).
- `tests/coerenza.test.mjs`: una regione con l'invalidità accesa deve avere il regime («new» o «old») in ogni sede INPS.
- `tests/browser.cjs`: il controllo «conto senza uffici» prova solo i moduli che la Lombardia non ha ancora acceso.

## 22/10/2026 — Piemonte, Valle d'Aosta, Lombardia, Trentino-Alto Adige, Friuli-Venezia Giulia, Veneto: dati per i moduli e le lettere
- Valle d'Aosta: accesi «Liste d'attesa» e «Medico di famiglia» (`data/regioni/index.json`, «moduli»). Percorso di tutela dalla pagina USL «Tempi di attesa» (https://www.ausl.vda.it/tempi-d-attesa/tempi-di-attesa, copia del server del 21/10/2026): si chiede al CUP (0165 548387) o agli sportelli CUP, «lista di galleggiamento», visita anche fuori regione in un centro privato convenzionato, chi rifiuta la data esce dalla lista. Senza un indirizzo dedicato la lettera si porta all'URP o al CUP. Scelta del medico dalla pagina «Scelta e revoca» (copia del 22/10/2026): cambio online nel FSE, sportelli dei distretti dal lunedì al venerdì 8–14, modulo anche con la PEC protocollo@pec.ausl.vda.it.
- Piemonte e Friuli-Venezia Giulia: acceso «Invalidità». Lombardia: dati pronti, ma il modulo resta spento perché `tests/browser.cjs` usa la Lombardia come regione con l'invalidità bloccata (va cambiato il test). In `inps.json` il regime della riforma della disabilità per provincia, dagli estratti delle pagine del Dipartimento per la disabilità (disabilita.governo.it: 9 province dal 01/01/2025, 11 dal 30/09/2025, 40 dal 01/03/2026) e della notizia INPS sulla terza fase: nuovo regime a Brescia e Trieste (01/01/2025), Alessandria (30/09/2025), Asti, Cuneo, Torino, Bergamo, Como, Mantova, Milano, Pavia, Sondrio, Pordenone, Udine (01/03/2026); le altre con la vecchia procedura. Da rileggere per intero e confermare con la sede, come per la Sicilia.
- Trentino-Alto Adige e Valle d'Aosta: regime messo in `inps.json` (Trento e Valle d'Aosta dal 30/09/2025, Bolzano dal 01/03/2026), ma «Invalidità» resta spento: qui l'accertamento ha regole proprie (a Bolzano non lo fa l'INPS, secondo l'estratto della notizia INPS).
- Nessun altro modulo acceso. Torino (4 ASL), Cuneo (2 ASL) e le province lombarde (più ASST per provincia) hanno una sola voce: la lettera deve andare all'azienda giusta e serve una domanda in più nel codice. In Trentino-Alto Adige mancano i dati di Bolzano (sito fatto in JavaScript). Nel Friuli-Venezia Giulia le pagine dei servizi non sono ancora copiate.
- Pagine ufficiali per il server (`pagine` nelle voci di `asl.json`, copiate da `tools/copie.mjs`): le pagine di `fonti.json` che non erano più copiate da quando le regioni sono attive (Piemonte 56, Lombardia 152, Trentino-Alto Adige 43, Friuli-Venezia Giulia 28, Valle d'Aosta 16) e 78 pagine nuove trovate col motore di ricerca (solo domini ufficiali) su percorso di tutela, cartella clinica, protesi e ausili, cure palliative, cure a casa e scelta del medico. Veneto: 7 pagine sulle liste d'attesa in `fonti.json`.
- Nel `todo` di ogni azienda gli indirizzi del percorso di tutela letti solo negli estratti (per esempio tempiattesa@aslcittaditorino.it, percorsotutela.scb@asst-spedalicivili.it, tempidiattesa@asfo.sanita.fvg.it): non messi nei dati finché la copia della pagina non li conferma. Lombardia: dal 15/09/2026 le ricette U si prenotano entro 10 giorni e le B entro 30 (pagina dell'ASST di Pavia, copia del 21/10/2026).
- Veneto resta in preparazione: le copie delle pagine dell'ULSS 3 Serenissima e dell'ULSS 4 Veneto Orientale sono vuote (siti fatti in JavaScript), quindi la provincia di Venezia non ha numeri.

## 22/10/2026 — Puglia, Basilicata, Calabria, Sardegna: dati per i moduli e le lettere
- `data/regioni/*/inps.json` (Puglia, Basilicata, Calabria, Sardegna): campo `regime` della riforma della disabilità. Regime nuovo: Catanzaro e Sassari dal 01/01/2025, Lecce e Matera dal 30/09/2025, Brindisi, Potenza, Cosenza, Crotone, Reggio Calabria, Vibo Valentia e Cagliari dal 01/03/2026; regime vecchio: Bari, Barletta-Andria-Trani, Foggia, Taranto, Nuoro, Oristano. Fonti: notizie INPS sulle tre fasi della sperimentazione (https://www.inps.it/it/it/inps-comunica/notizie/dettaglio-news-page.news.2024.12.accertamento-della-disabilit-avvio-sperimentazione-della-riforma.html, …2025.09.riforma-della-disabilit-in-avvio-la-seconda-fase-di-sperimentazione.html, …2026.02.riforma-della-disabilit-al-via-la-terza-fase-sperimentale.html), lette negli estratti del motore di ricerca (da rileggere per intero). Sardegna: Gallura, Ogliastra, Medio Campidano e Sulcis restano senza regime (non è chiaro se valgono gli elenchi «Sassari» e «Cagliari»).
- `data/regioni/index.json`: modulo Invalidità acceso per Puglia, Basilicata e Calabria; Medico di famiglia acceso per la Calabria. Sardegna: solo Numeri utili.
- `data/regioni/calabria/asl.json`: `scelta_medico` per le 5 ASP, dalla pagina FAQ di Ecosanità della Regione Calabria (https://ecosanita.regione.calabria.it/faq.php, copia del server del 21/10/2026): cambio online con SPID o CIE, sportello dell'ASP se il medico ha già tutti i pazienti.
- `data/regioni/sardegna/asl.json`, ASL Nuoro: percorso di tutela (come chiederlo, documenti, cosa succede dopo) dalla pagina dell'ASL (https://www.asl3nuoro.it/servizio/percorso-di-tutela-di-accesso-alternativo-alle-prestazioni-specialistiche/, copia del 21/10/2026). Senza email: nella copia gli indirizzi email delle ASL sarde sono nascosti («[email protected]»).
- `pagine` nelle aziende delle 4 regioni: pagine ufficiali su percorso di tutela, scelta del medico, protesica, cure palliative e cartella clinica, trovate con il motore di ricerca, perché il server le copi. Nel `todo` di ogni azienda: cosa manca per ogni modulo.
- `tests/copie-noti.txt`: tolte 6 righe della Puglia che non ci sono più (homepage delle ASL ora copiate).

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
