# Da verificare o completare a mano

Cose rimaste aperte dopo il lavoro del 19 ottobre 2026. Non sono cifre che cambiano ogni anno
(quelle sono in [CIFRE-DA-CONTROLLARE.md](CIFRE-DA-CONTROLLARE.md)): sono controlli da fare una volta,
decisioni da prendere e pezzi da completare.

Perché servono: i siti ufficiali (normattiva, INPS, ASP, Regione, Garante) **non si aprono dall'estero**.
Molti dati sono stati presi dai risultati di ricerca su quei siti, senza leggere la pagina intera.
Vanno riletti da una connessione italiana o confermati per telefono.

Quando chiudi un punto: correggi il sito se serve, scrivi la modifica in `CHANGELOG.md` e cancella la riga da qui.

## 0. Temi nuovi del 20/10/2026: da rileggere su fonti ufficiali

Le dieci pagine nuove (tessera, fascicolo e ricetta, CUP, 104, accompagnamento, contrassegno, cure fuori regione, RSA,
dentista, psicologo) sono scritte da ricerche web del 20/10/2026, in gran parte su siti di informazione: le fonti
ufficiali non si aprivano. Da controllare prima di dirle sicure:

- [ ] **Accompagnamento 2026**: importo (551,53 o 552,57 euro: due fonti diverse; sul sito dice «circa 550»), regola del ricovero
  gratuito oltre un mese, AP70 nel nuovo regime della riforma (circolari INPS 153/2025 e messaggio 628/2026).
- [ ] **Legge 104**: le 10 ore l'anno in più dal 2026 e il congedo non retribuito di 24 mesi (L. 106/2025); tetto del congedo
  straordinario 2026 (circ. INPS 6/2026 e 47/2026); l'ordine dei familiari per il congedo e la regola della convivenza.
- [ ] **Contrassegno**: strisce blu gratis (L. 156/2021), marca da bollo solo per il temporaneo, procedure online di Palermo,
  Catania e Messina (le pagine dei Comuni non sono state aperte), costo della visita medico-legale nelle ASP siciliane.
- [ ] **CUP / disdetta**: la regola siciliana sulla mancata disdetta e le eccezioni (il sito riporta la regola nazionale del
  D.L. 73/2024, art. 3: 2 giorni lavorativi, ticket anche per gli esenti). Esistenza di un numero verde del SovraCUP.
- [ ] **Tessera sanitaria**: duplicato allo sportello dell'ASP e tessera provvisoria di carta (varia per ASP); certificato
  sostitutivo TEAM di 6 mesi; dove si chiede il PIN della CNS in Sicilia.
- [ ] **Fascicolo**: delega a un familiare adulto (come si fa nel FSE della Regione Siciliana); modulo per segnalare un
  documento mancante; validità della ricetta per visite ed esami in Sicilia (sul sito: «di solito fino a un anno»).
- [ ] **Cure fuori regione**: esiste un contributo regionale per viaggio e alloggio (notizia 2023, 1,7 milioni, mai trovato il
  decreto)? La pagina dice che non c'è un rimborso automatico. Direttiva prot. 9368 dell'11/02/2026 letta solo in estratto.
- [ ] **RSA**: retta regionale (D.A. 1058/2025 letto in parte), ISEE «ristretto», regola sull'accompagnamento quando la famiglia
  paga la quota alberghiera, regolamenti comunali per l'integrazione.
- [ ] **Dentista**: soglia ISEE per la vulnerabilità sociale in Sicilia (sul sito: «intorno agli 8.000 euro in molte regioni»),
  ticket dai 6 ai 14 anni, ambulatori odontoiatrici delle ASP.
- [ ] **Psicologo**: importi e fasce ISEE del bonus 2026 (1.500/1.000/500; 50 euro a seduta), finestra delle domande,
  tempo per usarlo; accesso diretto ai CSM nelle ASP siciliane; Telefono Amico non citato con il numero (regola dei numeri).

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
- [ ] **«Ti è stata utile? Sì / No».** Oggi conta i Sì e i No con GoatCounter (senza cookie, senza dati personali).
  Scegliere: tenerlo così (proposta), oppure non contare niente e lasciare solo il link «scrivici».
- [ ] **Redirect 301 vero per `/…/index.html`.** GitHub Pages non lo permette: ora c'è un reindirizzamento fatto dal
  browser. Se davanti al sito c'è Cloudflare (o un servizio simile), aggiungere lì una regola:
  indirizzi che finiscono con `/index.html` → stesso indirizzo senza `index.html`, codice 301.
  Poi controllare che `https://guidasanita.it/liste-attesa/index.html` non mostri più la versione vecchia
  (può essere anche una copia vecchia nella cache del browser o del CDN: svuotarla).

## 2. Da confermare (telefono o pagina letta dall'Italia)

### Liste d'attesa
- [ ] **ASP Trapani:** le richieste del percorso di tutela («prestazioni garantite») vanno davvero a
  `comunicazione@asptrapani.it`? PEC `direzione.generale@pec.asptrapani.it`. Pagina:
  [Percorsi di tutela](https://www.asptrapani.it/servizi/Menu/dinamica.aspx?idSezione=17900&idArea=17901&idCat=28961&ID=47241&TipoElemento=pagina).
  Se c'è un modulo, aggiungerlo in `form_url` (`data/asp-sicilia.json`).
- [ ] **ASP Enna:** oggi il sito manda le richieste a `responsabile.urp@asp.enna.it`. Letto dall'Italia il 19/10/2026: il
  regolamento aziendale dice che la richiesta va al **protocollo** (PEC `protocollo.generale@pec.asp.enna.it`), non all'URP.
  Decidere se cambiare `send_to`. Pagina: [Liste di attesa](https://www.aspenna.it/amministrazione-trasparente/servizi-erogati/liste-di-attesa)
  (sito nuovo dal 01/03/2026). Nessun modulo online.
- [ ] Dopo la conferma: in `data/asp-sicilia.json` togliere la nota nei `todo` di Enna e Trapani.

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
- [ ] **Prova con persone anziane:** far usare il sito a qualcuno e annotare dove si blocca.
