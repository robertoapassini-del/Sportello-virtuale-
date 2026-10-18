# Registro delle modifiche

Ogni modifica ai file `data/*.json` va annotata qui, con la fonte.

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
