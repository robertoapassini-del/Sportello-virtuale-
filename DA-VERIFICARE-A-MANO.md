# Da verificare o completare a mano

Cose rimaste aperte dopo il lavoro del 19 ottobre 2026. Non sono cifre che cambiano ogni anno
(quelle sono in [CIFRE-DA-CONTROLLARE.md](CIFRE-DA-CONTROLLARE.md)): sono controlli da fare una volta,
decisioni da prendere e pezzi da completare.

Perché servono: i siti ufficiali (normattiva, INPS, ASP, Regione, Garante) **non si aprono dall'estero**.
Molti dati sono stati presi dai risultati di ricerca su quei siti, senza leggere la pagina intera.
Vanno riletti da una connessione italiana o confermati per telefono.

Quando chiudi un punto: correggi il sito se serve, scrivi la modifica in `CHANGELOG.md` e cancella la riga da qui.

## 0. Temi nuovi del 20/10/2026: letti sulle fonti ufficiali, cosa resta aperto

Il 20/10/2026, dal browser di Roberto (connessione italiana), sono state lette per intero: la scheda INPS dell'indennità
di accompagnamento, le schede INPS dei permessi 104 e del congedo straordinario, la scheda INPS del bonus psicologo, la
legge 106/2025 (artt. 1–3), l'art. 3 del D.L. 73/2024 (disdetta CUP), l'art. 381 del DPR 495/1992 (contrassegno), le FAQ
del Sistema TS sulla TEAM e le FAQ della Regione sul Fascicolo. Le pagine sono state corrette di conseguenza (vedi
`CHANGELOG.md`). Resta da fare:

- [ ] **Accompagnamento**: la regola «100% tra 18 e 65 anni» non è nella scheda INPS (che parla di invalidi totali): confermare
  con un patronato o nella L. 18/1980. Circolare INPS 153/2025 non letta (l'importo 551,53 è confermato dalla scheda).
- [ ] **Legge 104, IVA al 4% e detrazione del 19%** (22/10/2026): ora sono anche in `data/rules-legge-104.json`
  (`iva_auto_percent`, `detrazione_percent`), con la stessa provenienza di `rules-contrassegno-disabili.json` (scheda
  dell'Agenzia delle Entrate «Agevolazioni per le persone con disabilità», letta il 20/10/2026). Non riletta il 22/10
  (il sito non si apriva da qui): rileggere la scheda e la guida dell'Agenzia, e controllare che «sull'auto e sugli
  ausili» valga per tutti e due (l'IVA al 4% sugli ausili ha regole sue).
- [ ] **Legge 104**: tetto 2026 del congedo straordinario (circ. INPS 6/2026 e 47/2026); sul sito c'è solo «poco sopra i
  57.000 euro» per il 2025.
- [ ] **Contrassegno**: pagine ufficiali di Catania e Messina (letta solo Palermo: Circoscrizione, 5 euro, ZTL entro 15 giorni);
  costo della visita medico-legale nelle ASP siciliane; conferma dell'art. 188, comma 3-bis, del Codice della strada
  (strisce blu gratis), citato ma non letto.
- [ ] **CUP / disdetta**: la regola siciliana (il D.L. rimanda a linee di indirizzo del Ministero: cercare il decreto e
  l'applicazione delle ASP); esistenza di un numero verde del SovraCUP.
- [ ] **Tessera sanitaria**: durata del certificato sostitutivo TEAM (6 mesi: dalle guide, non dalle FAQ); duplicato allo
  sportello dell'ASP e tessera provvisoria di carta; dove si chiede il PIN della CNS in Sicilia.
- [ ] **Fascicolo**: validità della ricetta per visite ed esami in Sicilia (sul sito: «di solito fino a un anno»); i 5 giorni per
  caricare i referti (DM 7/9/2023, letto solo nelle notizie).
- [ ] **Cure fuori regione**: contributo regionale per viaggio e alloggio (notizia 2023: mai trovato il decreto); il PDF della
  direttiva prot. 9368 dell'11/02/2026 non si apre più dal sito della Regione (letta solo in estratto).
- [ ] **RSA**: il D.A. 1058/2025 si scarica solo come file (non letto); ISEE «ristretto»; regola sull'accompagnamento quando la
  famiglia paga la quota alberghiera; regolamenti comunali per l'integrazione.
- [ ] **Dentista**: soglia ISEE per la vulnerabilità sociale in Sicilia (sul sito «intorno agli 8.000 euro in molte regioni»);
  ticket dai 6 ai 14 anni; allegato 4C del DPCM 2017 letto solo tramite delibere regionali.
- [ ] **Psicologo**: finestra delle domande 2026 (nel 2025: 15 settembre – 14 novembre); i 270 giorni per usare il bonus;
  accesso diretto ai CSM nelle ASP siciliane.

## Controllo totale del 20/10/2026 (fatto, PR #14)

Dopo il passaggio a «prima la risposta» e alle pagine corte è stato rifatto il controllo di tutto il sito, confrontando
le 12 guide vecchie (una pagina) con le 59 pagine nuove. **Nessuna cifra, nessun testo e nessun link ufficiale è andato
perso**; i valori nei `data/` coincidono con [CIFRE-DA-CONTROLLARE.md](CIFRE-DA-CONTROLLARE.md). Nessuno dei punti qui sotto
è stato chiuso da quel controllo: restano tutti da fare a mano.

Trovato e già sistemato (non c'è più niente da fare):

- [x] Le 38 pagine corte non avviavano il piè di pagina: mancavano «Ti è stata utile?», il conteggio della visita e
  «Ascolta». Ora caricano `js/guida.js`.
- [x] Il pulsante che avvia il percorso a domande era cliccabile prima che i dati fossero caricati (un tocco si perdeva
  o dava errore). Ora è `disabled` finché i dati non arrivano (`enableStart`).
- [x] `npm run test:combinazioni` cercava il vecchio pulsante «Comincia»: era fermo dal rifacimento. Riadattato,
  1903 casi su 1903 passano. Resta un test manuale, da lanciare dopo ogni modifica ai percorsi.
- [x] La ricerca nella home non vedeva i titoli delle pagine corte; il generatore FAQPage era rimasto senza uso.

Non fatto perché impossibile dall'estero: il controllo dei 370 link esterni (`npm run controllo -- --tutto`) ha dato
«non verificabile» per tutti. Lo fa il workflow del lunedì da GitHub; da rileggere la issue `controllo-automatico`.

## 1. Decisioni da prendere

- [ ] **Ausili: 20 giorni e silenzio-assenso.** Il sito (pagina `ausili/`, lettera di sollecito in `js/letters.js`,
  `data/rules-ausili.json`, README) dice che dopo 20 giorni l'autorizzazione si intende data, «per il DPCM 12/01/2017».
  Dalle ricerche risulta che:
  - il DPCM 12/01/2017 (allegato 12, art. 1) **lascia alle Regioni** il tempo massimo per l'autorizzazione;
  - i 20 giorni con silenzio-assenso erano nel **vecchio DM 332/1999, art. 4**;
  - il DPCM ha un silenzio-assenso solo di **5 giorni**, per gli ausili dell'elenco 1 prescritti durante il ricovero.
  
  Da fare: trovare la regola della **Regione Siciliana** (decreto assessoriale sull'assistenza protesica) e leggere
  il testo dell'allegato 12 ([PDF del Ministero](https://www.salute.gov.it/new/sites/default/files/Allegato%2012%20Modalita%CC%80%20di%20erogazione%20delle%20prestazioni%20di%20assistenza%20protesica.pdf),
  [Gazzetta Ufficiale n. 65 del 18/03/2017](https://www.gazzettaufficiale.it/eli/gu/2017/03/18/65/so/15/sg/pdf)).
  Poi decidere come riscrivere testo e lettera (meglio con il legale).
  **21/10/2026:** il sito ora dice che il tempo lo fissa la Regione e dà i 20 giorni con silenzio-assenso solo come
  regola siciliana (D.A. 20/12/2011, direttive sul DM 332/1999); la lettera cita l'art. 18 e le disposizioni regionali.
  Resta da leggere il testo del D.A. per confermare 20 giorni, silenzio-assenso e collaudo in Sicilia
  ([procedure dell'ASP Catania](https://www.aspct.it/azienda/dipartimenti/dipartimenti-sanitari/dipartimento-di-riabilitazione/informazioni-generali/allegati/linee-guida-protesi-DM-332-99.pdf)).
- [ ] **«Ti è stata utile? Sì / No».** Oggi conta i Sì e i No con GoatCounter (senza cookie, senza dati personali).
  Scegliere: tenerlo così (proposta), oppure non contare niente e lasciare solo il link «scrivici».
- [ ] **Redirect 301 vero per `/…/index.html`.** GitHub Pages non lo permette: ora c'è un reindirizzamento fatto dal
  browser. Se davanti al sito c'è Cloudflare (o un servizio simile), aggiungere lì una regola:
  indirizzi che finiscono con `/index.html` → stesso indirizzo senza `index.html`, codice 301.
  Poi controllare che `https://guidasanita.it/liste-attesa/index.html` non mostri più la versione vecchia
  (può essere anche una copia vecchia nella cache del browser o del CDN: svuotarla).

## 2. Da confermare (telefono o pagina letta dall'Italia)

### Chi firma per un'altra persona (21/10/2026)
- [ ] Rileggere su Normattiva il Codice civile, artt. 316 e 320 (genitore), 357 (tutore), 404-405 (amministratore di
  sostegno, L. 6/2004), e confermare le formule delle lettere in `js/letters.js` (`delegateBlock`). Il contenuto è
  confermato da testi secondari (avvocato.it, miolegale.it), non ancora da Normattiva. Il curatore (art. 424) assiste
  ma non rappresenta: per questo è stato tolto dalle scelte.

### Liste d'attesa
- [ ] **ASP Trapani:** le richieste del percorso di tutela («prestazioni garantite») vanno davvero a
  `comunicazione@asptrapani.it`? PEC `direzione.generale@pec.asptrapani.it`. Pagina:
  [Percorsi di tutela](https://www.asptrapani.it/servizi/Menu/dinamica.aspx?idSezione=17900&idArea=17901&idCat=28961&ID=47241&TipoElemento=pagina).
  Se c'è un modulo, aggiungerlo in `form_url` (`data/regioni/sicilia/asp.json`).
- [ ] **ASP Enna:** oggi il sito manda le richieste a `responsabile.urp@asp.enna.it`. Letto dall'Italia il 19/10/2026: il
  regolamento aziendale dice che la richiesta va al **protocollo** (PEC `protocollo.generale@pec.asp.enna.it`), non all'URP.
  Decidere se cambiare `send_to`. Pagina: [Liste di attesa](https://www.aspenna.it/amministrazione-trasparente/servizi-erogati/liste-di-attesa)
  (sito nuovo dal 01/03/2026). Nessun modulo online.
- [ ] Dopo la conferma: in `data/regioni/sicilia/asp.json` togliere la nota nei `todo` di Enna e Trapani.

### Prevenzione
- [ ] **Screening gratuito dell'epatite C** (nati 1969–1989, e chi è seguito dal SerD o è in carcere a ogni età).
  Proroga nazionale fino al 31/12/2026, ma nessuna pagina siciliana del 2025–2026. Chiedere alla Regione o a un'ASP
  se è ancora attivo in Sicilia. **Se sì, aggiungerlo** alla pagina `prevenzione/` (prelievo gratis in un laboratorio
  pubblico o convenzionato, senza ricetta; campagna [bastapensarci.it](https://www.bastapensarci.it)).
- [ ] **Età di Pap test e test HPV:** l'[ASP Trapani](https://screeningoncologici.asptrapani.it/screening/screening-per-il-tumore-della-cervice-uterina/)
  scrive 25–33 (Pap) e 34–64 (HPV), le altre ASP 25–29 e 30–64. Chiarire con la Regione (decreto D.A. n. 1845) quale vale.

### Piano terapeutico
- [ ] **Ticket nella DPC:** il sito dice che chi non è esente può pagare il ticket della Regione anche per le medicine
  «per conto» dell'ASP. Viene dal [decalogo DPC dell'ASP Enna del 2022](https://www.aspenna.it/wp-content/uploads/2022/08/decalogo-DPC-2022-DEFINITIVO.pdf).
  Controllare sull'accordo DPC approvato con D.A. 367/2025: il PDF della Regione non c'è più (404 anche dall'Italia,
  19/10/2026) e la [pagina DPC](https://www.regione.sicilia.it/istituzioni/regione/strutture-regionali/assessorato-salute/dipartimento-pianificazione-strategica/dpc)
  non lo collega. Chiederlo alla Regione o cercarlo nella GURS.
- [ ] **«Arriva in un giorno o due»:** stesso decalogo (24 ore lavorative). Confermare che vale ancora.

### Cartella clinica
- [ ] **Fascicolo Sanitario «gratis»:** nessuna pagina siciliana lo dice in modo esplicito (ma non c'è nessun costo).
  Rileggere le [domande frequenti della Regione](https://www.regione.sicilia.it/istituzioni/regione/strutture-regionali/assessorato-salute/dipartimento-pianificazione-strategica/fascicolo-sanitario-elettronico-domande-frequenti).
- [ ] **Prima copia gratis (art. 15 GDPR):** rileggere le [FAQ del Garante](https://www.garanteprivacy.it/garante/doc.jsp?ID=10086913)
  per intero. Valutare con il legale se aggiungere la richiesta «ai sensi dell'art. 15 GDPR» anche nella lettera di sollecito
  (`js/letters.js`, che oggi parla di «eventuale costo di riproduzione»).

### Medico di famiglia
- [ ] **Massimale del pediatra:** il sito dice «circa 880». Dalle ricerche: dal 2022 è 880, fino a 1.000 con deroghe
  (ACN pediatria, art. 36). Leggere l'ACN pediatria del **18/03/2026** su [sisac.info](https://www.sisac.info) per vedere se è
  cambiato, e completare la frase sulle deroghe se serve.

### Ricorso invalidità
- [ ] **Art. 152 disp. att. c.p.c.:** testo preso dai risultati di ricerca. Rileggerlo su
  [Normattiva](https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1941-12-18;1368) e far controllare al legale
  la frase «non paghi le spese legali dell'INPS» (vale salvo «comportamento temerario»; il reddito è quello IRPEF della famiglia).

### Assegno di inclusione
- [ ] **Messaggio INPS n. 2437 del 22/07/2026** sui rinnovi: non letto. Controllare che non cambi quello che c'è scritto.
- [ ] Dal 2026 l'ADI usa il nuovo **«ISEE per l'inclusione»** (più leggero sulla casa). Valutare se dirlo nella guida.

## 3. Da completare (già noti prima)

- [ ] **Numeri di telefono:** il 19/10/2026, da una connessione italiana, sono stati riletti tutti sulle pagine ufficiali
  (vedi `CHANGELOG.md`). Ne restano **6** senza pagina ufficiale, da confermare per telefono: elenco in
  [docs/da-verificare.md](docs/da-verificare.md) (si rifà con `npm run da-verificare`). Regola: [docs/regola-numeri.md](docs/regola-numeri.md).
  I dubbi nuovi (sedi spostate nelle Case di Comunità, numeri in contrasto tra due pagine) sono nei `todo` delle ASP,
  alle righe «Verifica 19/10/2026».
- [ ] **Lettere** (`js/letters.js`): da far rivedere a un legale prima del lancio (sono segnate «DA VERIFICARE»).
- [ ] **Campi `todo` e `notes_internal`** nei file `data/*.json`: ogni ASP ha la sua lista (sportelli mancanti,
  numeri in contrasto). Cercare `TODO` nel codice e nei dati.
- [ ] **Domande da fare al telefono agli URP:** [docs/domande-urp.md](docs/domande-urp.md).
- [ ] **Nuovo piano regionale delle liste d'attesa** (atteso entro il 22/12/2026): ricontrollare tempi e contatti di tutte le ASP.
- [ ] **Stampa da un telefono vero** (audit del 22/10/2026, giro 8): su un Android (Chrome) e su un iPhone (Safari), aprire una
  lettera (per esempio Cartella clinica → sollecito), premere «Stampa o salva» e poi, tornati sulla pagina, stampare dal menu
  del browser: sul foglio (o nel PDF) deve esserci solo la lettera, mai il modulo con i dati. `tests/lettere-stampa.cjs`
  lo prova in Chromium imitando il telefono (la stampa che non aspetta), non su un telefono vero.
- [ ] **Prova con persone anziane:** far usare il sito a qualcuno e annotare dove si blocca.
