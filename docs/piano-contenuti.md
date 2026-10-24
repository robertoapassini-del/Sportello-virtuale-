# Piano dei contenuti: tutta la sanità, dalla A alla Z

La missione è in [CLAUDE.md](../CLAUDE.md): spiegare a tutti la sanità pubblica, con fonti ufficiali, prima come si
fa e poi cosa fare se qualcosa non va. Questo file dice **cosa manca** e **in che ordine** farlo. Si aggiorna ogni
volta che si aggiunge un tema, e dopo ogni giro delle ricerche ([ricerche-frequenti.md](ricerche-frequenti.md)).

Primo elenco: 24/10/2026. È un piano, non una fonte: ogni fatto di una pagina nuova va prima nei file `data/` con la
sua fonte (`docs/regola-cifre.md`, `docs/regola-numeri.md`).

## 1. Cosa tratta il sito, e cosa no

**Sì:**
- i servizi del Servizio sanitario: visite, esami, ricoveri, medicine, prevenzione, cure a casa;
- i documenti: tessera, fascicolo, ricette, certificati, cartella clinica;
- gli aiuti legati alla salute e alla disabilità (INPS, Comune, Regione);
- i diritti di chi è malato o lo assiste, e cosa fare se non vengono rispettati.

**Sì, ma solo la procedura:**
- **urgenze** (pronto soccorso, guardia medica): dove andare, quanto si paga, quali numeri. Mai «è grave o no»:
  quello lo dice il 112 o il medico;
- **lavoro e malattia** (certificato, visita fiscale, permessi): cosa fare e dove. Per i casi del contratto di
  lavoro, il patronato o il sindacato.

**No:**
- consigli medici (sintomi, cure, medicine da prendere);
- sanità privata e assicurazioni, tranne quando il Servizio sanitario rimborsa;
- le pratiche delle persone: non le seguiamo, diciamo chi lo fa (ASL, INPS, patronato).

## 2. Ogni pagina, lo stesso schema

1. **In breve**: 3 righe in cima.
2. **Cos'è** e **chi ne ha diritto**.
3. **Come si fa**: i passi numerati, con il link alla pagina ufficiale dove si fa la domanda.
4. **Cosa serve**, **quanto costa**, **quanto tempo ci vuole**.
5. **Se qualcosa non va**: tempi di legge, sollecito, lettera (i moduli che ci sono già).
6. Fonti e data del controllo (le crea `tools/pagine.mjs`).

Da fare dopo: lo schema scritto nei dati (`rules-*.json`), con un test che controlla che le parti ci siano.

## 3. I temi che mancano, in ordine

L'ordine viene da quanto si cercano (Google Trends, `ricerche-frequenti.md` punto 3b) e da quanto servono.

### Primo giro: molto cercati, nessuna pagina

| Tema | Perché | Area |
|---|---|---|
| Pronto soccorso: quando andare, i codici, il ticket | 1,6 volte «legge 104», solo in Numeri utili | **fatto il 24/10/2026**: `pronto-soccorso/`, area «Urgenze», con le regole di Lombardia, Friuli-Venezia Giulia e Sardegna. Da aggiungere: i tempi nazionali dall'allegato dell'accordo Stato-Regioni (copia dei PDF fino a 20 MB) e il ticket delle altre regioni dalle loro pagine ufficiali |
| Guardia medica e 116117: quando, come, dove | 1,4 volte «legge 104», picchi a Natale e Ferragosto | **fatto il 24/10/2026**: `guardia-medica/`, dalle pagine delle aziende sanitarie; l'elenco del 116117 si crea dai dati. Regola nazionale dall'Accordo collettivo nazionale aggiunta lo stesso giorno |
| Certificato di malattia per il lavoro | 0,2, ma tutto l'anno | **fatto il 24/10/2026**: `certificato-malattia/`, area «Malattia e lavoro» |
| Visita fiscale: fasce orarie, se non sei a casa | 0,2 | **fatto il 24/10/2026**: `visita-fiscale/` |
| Link della Regione per CUP e cambio medico online | ricerche «cup + regione», «cambio medico online» | dati regionali |

### Secondo giro: domande frequenti, con una pagina vicina

- Esenzione per malattia cronica o rara: codici, come si chiede (oggi è una sottopagina dell'esenzione).
- Le medicine: ticket in farmacia (cambia per regione), farmaci gratis e a pagamento, farmacia dei servizi.
- Vaccini per i bambini: obbligatori, scuola, dove si fanno.
- Gravidanza e parto: esami gratis, consultorio, dopo il parto.
- Ricovero in ospedale: cosa portare, dimissioni, chi assiste.
- Riabilitazione: fisioterapia e logopedia con il Servizio sanitario.
- Trasporto sanitario: ambulanza non urgente, dialisi, visite.

### Terzo giro: domande meno frequenti

- Stranieri: iscrizione al Servizio sanitario, codice STP e ENI, cure urgenti.
- Italiani all'estero (AIRE) e chi torna in Italia.
- Consultorio: contraccezione, interruzione di gravidanza, aiuto alle famiglie.
- Dipendenze (SerD) e gioco d'azzardo.
- Malattie rare: centro di riferimento, esenzione.
- Donazione di sangue e di organi; testamento biologico (DAT).
- Consenso informato e privacy dei dati sanitari.
- Certificati: idoneità sportiva, patente, scuola.
- Cure termali con il Servizio sanitario.
- Demenza e Alzheimer: centri, aiuti per la famiglia.
- Amministratore di sostegno; il caregiver familiare.
- Infortunio sul lavoro e malattia professionale (INAIL).
- Reclamo all'URP e risarcimento per un errore medico (pagina generale «Se qualcosa non va»).

## 4. Aggiornamento automatico: il piano

Il punto forte del sito: le informazioni si controllano da sole, ogni notte, sulle pagine ufficiali. Oggi il
controllo automatico c'è per numeri, PEC, indirizzi e orari (`tools/confronta-copie.mjs`). Per le procedure, in
ordine:

1. **Frasi di prova.** Ogni passo di una procedura ha la frase della pagina ufficiale da cui viene (come `nota` in
   `regole_fonti`). Ogni notte `confronta-copie` controlla che la frase sia ancora nella copia.
2. **Data del controllo automatica.** Se tutte le frasi di una pagina sono confermate, «Informazioni controllate il»
   prende la data della copia.
3. **Controllo più a fondo** quando una frase non si trova più, o è ambigua: il server rilegge la pagina intera, la
   confronta con la copia di prima e prepara una proposta di modifica (una pull request), con le due frasi vicine.
4. **Turni per regione.** Con migliaia di pagine, il server non le copia tutte ogni notte: ogni regione ha il suo
   turno, ogni 2–3 giorni. Le procedure non cambiano da un giorno all'altro, quindi basta.

**Deciso il 24/10/2026:** per ora il sito si aggiorna da solo. La proposta si unisce da sola quando la CI è verde
(`docs/regioni.md`, sezione 8; testo della routine in `docs/routine-aggiornamento.md`).

**Fatto il 24/10/2026:** il server copia anche le fonti delle regole nazionali e le pagine dei temi nuovi
(`data/fonti-nazionali.json`). Le pagine del primo giro si scrivono quando arrivano le copie.

## 5. Fonti nazionali da sistemare (prima copia, 24/10/2026)

Fonti delle regole nazionali: 128 voci, 107 indirizzi diversi. 100 sono copie vere. Le altre:
- 404, da sostituire con la pagina nuova dello stesso ente: tre schede dell'Agenzia delle Entrate (agevolazioni
  per i disabili, detrazioni per le spese sanitarie, tessera sanitaria), la scheda INPS dell'indennità di
  accompagnamento, la pagina della ricetta dematerializzata di sistemats1, il PDF del consenso al Fascicolo
  della Regione Siciliana;
- un PDF INPS dell'assegno di inclusione più grande di 5 MB;
- due moduli della Regione Siciliana fatti di sole immagini (non hanno testo);
- 16 voci (15 indirizzi) di salute.gov.it: protezione anti-robot (Gcore). Non la superiamo: per ogni cifra che viene da lì
  serve un'altra fonte ufficiale (legge su Normattiva, Gazzetta Ufficiale, accordo Stato-Regioni).

