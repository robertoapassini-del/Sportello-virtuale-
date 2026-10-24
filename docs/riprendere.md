# Da dove riprendere (lavoro del 18/10/2026, aggiornato il 23/10/2026)

Nota per continuare da un altro computer o in una nuova sessione con Claude.

## Fatto

- Pagina **Numeri utili** (`numeri-utili/`, `js/numeri.js`, `data/numeri.json`) e contatti delle ASP per argomento
  (`contacts` in `data/regioni/sicilia/asp.json`: cup, urp, centralino, guardia, casa, palliative, protesica, cartelle, screening, anagrafe).
- **Regola dei numeri**: [regola-numeri.md](regola-numeri.md). Solo fonti ufficiali, controllo di chiusure e traslochi,
  ogni numero con `url`, `verified`, `proof`. Il test `tests/contatti.test.mjs` la fa rispettare.
- Riquadri «dov'è l'ufficio» nei moduli: ausili (uffici protesi), assistenza domiciliare (PUA), cure palliative,
  cartella clinica, prevenzione (screening), invalidità (sede INPS).
- Assistenza domiciliare: schermata «Consigli pratici».

## Da fare

**Prima di tutto (23/10/2026, dalle ricerche su Google Trends, `docs/ricerche-frequenti.md` punto 3b):**

A. **Link al fascicolo sanitario di ogni Regione.** Fatto il 23/10/2026 per 10 regioni più la Sicilia (CHANGELOG).
   Resta da fare:
   - fatto il 24/10/2026 per Veneto, Friuli-Venezia Giulia, Calabria e Puglia (15 regioni in tutto);
   - Lombardia: la copia di fascicolosanitario.regione.lombardia.it non riesce («troppi redirect», anche per le sue
     sottopagine). Cercare un'altra pagina ufficiale (Regione Lombardia o un'ATS) che spieghi come entrare e metterla
     in `regole_fonti.fse` al posto di quella di adesso;
   - Marche: fse.sanita.marche.it/it ha risposto 500 il 23/10. Guardare la copia successiva: se riesce, prova e link;
   - Lazio e Campania: nelle copie ci sono solo notizie. Trovare la pagina ufficiale del Fascicolo, metterla in
     `regole_fonti.fse` senza `proof`, aspettare la copia;
   - Trentino-Alto Adige: il Fascicolo è diverso a Trento e a Bolzano. Serve un link per zona, non uno per regione;
   - i nomi dei portali (Salute Lazio, Puglia Salute, Sinfonia, Sanità km zero…) nelle parole chiave della ricerca,
     solo se sono nei dati con la fonte.

B. **Pagina «Pronto soccorso e guardia medica».** Insieme valgono 3 volte la legge 104 e non hanno una pagina:
   quando andare, codici colore, ticket del codice bianco (cambia per regione, solo da delibere), chi chiamare di
   notte e nei festivi. Picchi: Natale ed estate.


1. **Fatto il 19/10/2026 dall'Italia** (vedi CHANGELOG): restano 6 numeri da telefonare. Per il giro successivo: aprire le pagine di
   [da-verificare.md](da-verificare.md) e, per ogni numero confermato, mettere `"proof": "pagina"` e la data.
   Rifare l'elenco con `npm run da-verificare`.
2. **Sportelli «scelta e revoca» ed esenzioni** (topic `anagrafe`): inseriti per tutte le 9 ASP il 18/10/2026, molti
   solo da estratto. Mancano: Catania città (telefoni), Gela, Canicattì, Sciacca, Lentini, Noto, Patti e altri.
3. Enna: numero dello screening; uffici cartelle cliniche di Enna e Ragusa; Papardo (Messina).
4. Il test dei numeri fallirà dopo 92 giorni dall'ultimo controllo (metà gennaio 2027): è il promemoria per il
   giro successivo.
