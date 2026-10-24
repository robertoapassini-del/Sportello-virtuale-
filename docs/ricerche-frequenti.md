# Cosa cercano le persone

Questo documento serve a decidere quali pagine aggiungere o migliorare. Dal 22/10/2026 il sito copre tutte le 20
regioni: la prima ricerca (19/10/2026) era fatta solo sulla Sicilia ed è riassunta in fondo.

Ultimo aggiornamento: 23/10/2026. Da rifare ogni 3 mesi, o quando cambia molto il numero di visite.

## 1. Le fonti, in ordine di valore

1. **Search Console** (guidasanita.it), *Rendimento → Query*. Dice con quali parole il sito compare su Google,
   anche quando nessuno clicca. Proprietà aggiunta il 19/10/2026: i primi dati utili arrivano a metà novembre.
   Non divide per regione, ma le parole spesso la dicono («asl roma 1», «cup lombardia»).
2. **GoatCounter**, le statistiche del sito (vedi il punto 2 qui sotto). Dicono cosa succede *dentro* il sito.
3. **Google Trends**: dice cosa cerca la gente in generale, anche quello che il sito non tratta ancora. I numeri
   sono relativi: 100 è il termine più cercato nel confronto, non un numero di ricerche.
4. **Email** a info@guidasanita.it dal link «Scrivici cosa cercavi» (ricerca senza risultati) e dal «No» a
   «Ti è stata utile?».

## 2. Cosa contano le statistiche del sito

Mai le parole scritte (lo promette la pagina privacy, lo controlla `tests/conteggi.test.mjs`). Gli eventi:

| Evento GoatCounter                    | Quando                                                        | Cosa ci dice                              |
|---------------------------------------|---------------------------------------------------------------|-------------------------------------------|
| `utile-si/<pagina>/<regione>`         | «Sì» a «Ti è stata utile?»                                    | la pagina aiuta, in quella regione        |
| `utile-no/<pagina>/<regione>`         | «No» a «Ti è stata utile?»                                    | la pagina non aiuta, in quella regione    |
| `ricerca-fatta/<regione>`             | una ricerca di almeno 3 lettere (una volta per pagina aperta) | quanti usano la ricerca                   |
| `ricerca-vuota/<regione>`             | la ricerca resta senza risultati (una volta per pagina aperta)| quanto spesso la ricerca delude           |
| `ricerca-clic/<modulo>`               | si apre un risultato della ricerca                            | cosa si cerca di più dentro il sito       |

`<regione>` è l'id della regione scelta (`lombardia`, `valle-d-aosta`…) o `nessuna`. Gli eventi `utile-…` fino al
22/10/2026 non avevano la regione: per i totali di una pagina si sommano le due forme.

**Come leggerli** (GoatCounter → filtro per nome):

- `ricerca-vuota` diviso `ricerca-fatta`: se supera 1 su 5, guardare le email «Non ho trovato» e la tabella del
  punto 4.
- `utile-no` di una pagina in una regione molto più alto che nelle altre: i dati di quella regione mancano o
  sono sbagliati. Controllare `data/regioni/<regione>/` e il `todo`.
- `ricerca-clic`: i moduli più aperti dalla ricerca sono quelli che la gente non trova nei menu. Valutare se
  metterli tra i «più cercati» della home.

## 3. Google Trends: come rifare la ricerca

Sempre con **«legge 104»** come termine di riferimento, così i numeri si confrontano tra una volta e l'altra.

1. **Italia, ultimi 12 mesi.** Rifare i quattro confronti della Sicilia (punto 6) con «Italia». Poi un confronto
   con i temi che il sito non ha ancora: «certificato di malattia», «visita fiscale», «guardia medica»,
   «pronto soccorso», «codice STP».
2. **Per regione.** Per ogni tema forte («prenotazione cup», «cambio medico», «esenzione ticket», «fascicolo
   sanitario») aprire «Interesse per regione» e le «Query associate» di 4–5 regioni grandi (Lombardia, Lazio,
   Campania, Sicilia, Veneto, Emilia-Romagna, Puglia). Lì escono i nomi locali: il nome dell'azienda con la città
   («asl napoli 1», «ats milano»), il portale o l'app della Regione.
3. Scrivere qui sotto le tabelle, con la data. I nomi locali **non** vanno nelle pagine finché non c'è la fonte
   ufficiale nei file `data/regioni/` (`docs/regola-numeri.md`, `docs/regioni.md`).

**Picchi stagionali** già visti in Sicilia, da controllare in tutta Italia: guardia medica a Natale e a
Ferragosto; esenzione ticket a gennaio e aprile (rinnovi); legge 104 a settembre (notizie INPS).

## 3b. Risultati: Italia, 23/10/2026

Google Trends, Italia, 23/10/2025 – 23/10/2026, tutte le categorie, Ricerca Google, sempre «Termine di
ricerca». Raccolti dal proprietario con Claude in Chrome, dai dati che la pagina carica per il grafico (le medie
sono quelle a sinistra del grafico). Ottobre 2025 conta solo l'ultima settimana.

### Confronti

| Confronto | Termine                      | Media | Picco (settimana, valore)        | Mesi più alti                 |
|-----------|------------------------------|------:|----------------------------------|-------------------------------|
| 1         | legge 104                    | 28    | 20–26 set 2026 (59)              | set 2026, fine ott 2025       |
| 1         | guardia medica               | 39    | 21–27 dic 2025 (100)             | dic 2025, ago, lug 2026       |
| 1         | invalidità civile            | 15    | 20–26 set 2026 (35)              | set, mar 2026                 |
| 1         | esenzione ticket             | 8     | 29 mar – 4 apr 2026 (22)         | apr, mar 2026                 |
| 1         | prenotazione cup             | 10    | 12–18 apr 2026 (13)              | quasi piatto                  |
| 2         | legge 104                    | 16    | 20–26 set 2026 (34)              | set 2026, fine ott 2025, lug  |
| 2         | fascicolo sanitario          | 75    | 18–24 ott 2026 (100)             | ott, mar, giu 2026            |
| 2         | cambio medico                | 7     | 9, in 4 settimane                | piatto                        |
| 2         | tessera sanitaria            | 21    | 19–25 apr 2026 (53)              | apr, mag, giu 2026            |
| 2         | pronto soccorso              | 25    | 19–25 lug 2026 (43)              | ago, lug, giu 2026            |
| 3         | legge 104                    | 48    | 20–26 set 2026 (100)             | set 2026, fine ott 2025, lug  |
| 3         | medico di base               | 55    | 18–24 ott 2026 (74)              | ott, set, gen 2026            |
| 3         | certificato di malattia      | 9     | 14–20 dic 2025 (13)              | ott, gen, set 2026            |
| 3         | visita fiscale               | 11    | 14–20 dic 2025 (18)              | nov 2025, gen, mar 2026       |
| 3         | indennità di accompagnamento | 2     | dic 2025 (4)                     | nov 2025 – gen 2026           |

**Classifica**, con «legge 104» = 1 (media della parola diviso la media di «legge 104» nello stesso confronto):

| Tema                    | Volte legge 104 | Pagina oggi                                  |
|-------------------------|----------------:|----------------------------------------------|
| fascicolo sanitario     | 4,7             | `fascicolo-e-ricetta/`, ma senza il link della Regione (c'è solo per la Sicilia) |
| pronto soccorso         | 1,6             | nessuna (solo `numeri-utili/`)               |
| guardia medica          | 1,4             | nessuna (solo `numeri-utili/`)               |
| tessera sanitaria       | 1,3             | `tessera-sanitaria/`                         |
| medico di base          | 1,1             | `medico-famiglia/`                           |
| legge 104               | 1               | `legge-104/`                                 |
| invalidità civile       | 0,5             | `invalidita/`                                |
| cambio medico           | 0,4             | `medico-famiglia/`                           |
| prenotazione cup        | 0,4             | `prenotare-cup/`                             |
| esenzione ticket        | 0,3             | `esenzione-ticket/`                          |
| visita fiscale          | 0,2             | nessuna                                      |
| certificato di malattia | 0,2             | nessuna                                      |
| accompagnamento         | 0,04            | `accompagnamento/`                           |

### Query associate (Italia, Lombardia, Lazio, Campania, Veneto, Puglia, Emilia-Romagna, Sicilia)

Le prime 5 di ogni lista. Tra parentesi il valore («Più popolari») o la crescita («In aumento»).

**Prenotazione CUP**
- Italia: cup online prenotazione (100), cup online (92), prenotazione cup toscana (42), numero prenotazione cup
  (36). In aumento: puglia salute prenotazione (+110%), centro unico di prenotazione (+70%), salute lazio (+60%),
  salute piemonte (+50%).
- Lombardia: cup lombardia (100), prenotazione cup online (73), numero prenotazione cup (54).
- Lazio: cup lazio (100), prenotazione online (50), cup roma (40). In aumento: salute lazio (+90%).
- Campania: prenotazione cup online (100), cup online (96), numero prenotazione cup (89). Solo 4 query.
- Veneto: prenotazione cup online (100), numero prenotazione cup (46), disdire prenotazione cup (25). In aumento:
  disdire prenotazione cup (+50%).
- Puglia: puglia salute prenotazione (100), numero prenotazione cup (90), disdetta prenotazione cup (43). In
  aumento: annullare prenotazione cup (+200%).
- Emilia-Romagna: prenotazione cup bologna (100), numero prenotazione cup (94), stampa prenotazione cup (84). In
  aumento: disdire prenotazione cup (+80%), numero verde prenotazione cup (+70%).
- Sicilia: cup palermo (100), cup online (90), cup policlinico (45). In aumento: sovracup palermo (+80%).

**Cambio medico**
- Italia: cambio medico base (100), cambio medico asl (31), cambio medico online (30). In aumento: cambio medico
  di base vicino a me (+300%), salute lazio cambio medico di base (+110%), toscana salute cambio medico (+70%),
  cambio medico online fvg (+70%), sinfonia cambio medico (+60%).
- «cambio medico di base vicino a me» cresce in tutte le regioni tranne la Puglia.
- «fascicolo sanitario cambio medico» è tra le prime in Lombardia, Lazio, Veneto, Emilia-Romagna e Sicilia: in
  molte regioni il medico si cambia dal fascicolo.
- Nomi locali: Lazio «salute lazio» e «asl roma»; Campania «sinfonia»; Veneto «ulss 3/6/9» e «sanità km zero»;
  Puglia «pugliasalute»; Sicilia «asp» (100) e «asp palermo».

**Esenzione ticket**
- Italia: reddito esenzione ticket (100), esenzione ticket per reddito (76), esenzione ticket online (58), asl
  esenzione ticket (51). In aumento: rinnovo esenzione ticket 2026 e rinnovo online 2026 (Impennata), asp con te
  (+1.050%), sinfonia (+90%), esenzione ticket over 65 (+60%), codice e01 (+50%), certificato esenzione (+40%).
- Lazio: esenzione ticket over 65 (+450%), quando scade esenzione ticket (+50%).
- Sicilia: delega per esenzione ticket (+300%), asp con te (Impennata), esenzione e02 (+40%).
- In molte regioni la prima ricerca è «esenzione ticket» + nome della regione.

**Fascicolo sanitario**
- In tutte le regioni la prima ricerca è «fascicolo sanitario» + nome della regione: la gente cerca il portale
  della propria Regione.
- In aumento: come accedere al fascicolo sanitario (+50%), fascicolo sanitario login, accedi con CIE (Lombardia
  +600%), fse, fascicolo sanitario 2.0 (Campania +300%), doctolib (Lazio, Veneto, Emilia-Romagna).
- Nomi locali: Puglia «puglia salute», Lazio «salute lazio», Veneto «sanità km zero», Sicilia «cefpas» (Impennata)
  e «asp con te».
- Nota sulla Sicilia: nella lista «Più popolari» la riga 10 ripeteva la 9 per un errore di copia; sono 9 query.

### Cosa ci dice

1. **Il fascicolo sanitario è il tema più cercato**, quasi 5 volte la legge 104. La gente vuole il link del
   fascicolo della propria Regione, ma il sito lo ha solo per la Sicilia (`link.fse` in
   `data/regioni/index.json`). Le copie del server (branch `copie-siti`) hanno già pagine ufficiali del fascicolo
   per 16 regioni: mancano Friuli-Venezia Giulia, Lombardia, Veneto e la Sicilia stessa.
2. **Pronto soccorso e guardia medica insieme valgono 3 volte la legge 104** e non hanno una pagina. Picchi: guardia
   medica a Natale e in estate, pronto soccorso d'estate.
3. **Le persone cercano lo strumento online**: «cup online», «cambio medico online», «esenzione ticket online».
   Ogni pagina deve portare subito al servizio online della Regione o dell'azienda.
4. **«Numero prenotazione cup»** è tra le prime ricerche in quasi tutte le regioni: il numero del CUP della propria
   azienda deve essere in alto nella pagina del CUP.
5. **Disdire e annullare** una prenotazione crescono (Veneto, Puglia, Emilia-Romagna).
6. **I portali regionali hanno un nome** (Salute Lazio, Puglia Salute, Sinfonia in Campania, Sanità km zero in
   Veneto, Toscana Salute, Salute Piemonte, ASP con te in Sicilia). Vanno nei dati solo dopo la copia della pagina
   ufficiale; poi nelle parole chiave della ricerca, come «aspconte».
7. **Accompagnamento** si cerca poco con questo nome (0,04): la gente lo cerca dentro «invalidità civile».

## 4. Ricerche e pagine: cosa c'è e cosa manca

Ogni ricerca di questa tabella che ha una pagina è anche in `tests/ricerca.test.mjs`: se la ricerca della home
smette di portare alla pagina giusta, il test fallisce. Una riga nuova qui = una riga nuova nel test.

### Ricerche che hanno già una pagina

| Ricerca                                         | Pagina                  |
|-------------------------------------------------|-------------------------|
| legge 104, permessi 104, congedo straordinario  | `legge-104/`            |
| invalidità civile, pensione/assegno invalidità  | `invalidita/`           |
| indennità di accompagnamento, importo           | `accompagnamento/`      |
| esenzione ticket, rinnovo, over 65, delega      | `esenzione-ticket/`     |
| medico di base, cambio medico, scelta in deroga | `medico-famiglia/`      |
| prenotazione CUP, disdire, impegnativa          | `prenotare-cup/`        |
| liste d'attesa, visita troppo lontana           | `liste-attesa/`         |
| tessera sanitaria smarrita, scaduta, TEAM       | `tessera-sanitaria/`    |
| fascicolo sanitario, ricetta elettronica        | `fascicolo-e-ricetta/`  |
| guardia medica, 116117, farmacia di turno       | `numeri-utili/`         |
| ASL, ATS, ULSS, azienda sanitaria               | `numeri-utili/`         |
| pass/contrassegno disabili                      | `contrassegno-disabili/`|
| RSA, casa di riposo                             | `rsa/`                  |
| cure fuori regione                              | `cure-fuori-regione/`   |
| psicologo, dentista                             | `psicologo/`, `dentista/` |

### Ricerche senza una pagina giusta (prova del 23/10/2026 sulla ricerca della home)

In ordine di priorità (con i numeri del punto 3b). Prima di scrivere: fonte ufficiale per ogni cifra, nazionale o
regione per regione.

0. **Link al fascicolo sanitario di ogni Regione** (non è una pagina nuova, ma è la cosa più cercata). Fatto il
   23/10/2026 per 11 regioni e il 24/10 per altre 6 (17 su 20), con l'elenco nelle pagine del fascicolo; le altre in `docs/riprendere.md`, punto A.
1. **Pronto soccorso e guardia medica.** «codice bianco» porta all'esenzione ticket, «pronto soccorso
   pediatrico» solo ai Numeri utili. Serve una pagina: quando andare, codici colore, ticket del codice bianco
   (cambia per regione: una fonte datata diceva 25 € in Sicilia, da non usare), chi chiamare di notte e nei
   festivi.
2. **Pensione e assegno di invalidità.** La ricerca porta a `invalidita/`, che parla della visita ma non dice
   quanto si prende né i limiti di reddito. Sono ricerche in crescita (importi dell'anno in corso).
3. **Certificato di malattia e visita fiscale.** Oggi «certificato di malattia» porta all'esenzione ticket e
   «visita fiscale» alle liste d'attesa: risultati sbagliati.
4. **Stranieri: codice STP, iscrizione al servizio sanitario.** «straniero» e «stp» non trovano niente.
5. **Occhiali, logopedista, colonscopia**: non trovano niente o trovano poco. Valutare se bastano parole chiave
   nelle pagine che ci sono (ausili, prenotare-cup, prevenzione) o se serve altro.

### Nomi locali che mancano nei dati

- `regional_channel` (portale o app di prenotazione della Regione) è vuoto in tutte le 20 regioni.
- `local_name` (come si chiama il percorso di tutela) c'è solo in Sicilia, Toscana, Liguria e Valle d'Aosta;
  in Emilia-Romagna è «da verificare».
- `link.fse` (fascicolo della Regione): 17 regioni su 20 il 24/10/2026, vedi il punto 0 qui sopra.
- Le parole «sovracup» e «aspconte» nelle parole chiave valgono solo per la Sicilia. I nomi trovati il 23/10/2026
  (punto 3b, n. 6) si aggiungono quando sono nei dati della regione con la fonte.

## 5. Le pagine da migliorare (dalla ricerca in Sicilia, ancora valide)

- **Liste d'attesa**: usare le parole che la gente scrive («prenotazione CUP», il nome del portale della
  Regione), non solo «percorso di tutela».
- **Invalidità**: chiarire che invalidità, legge 104, accompagnamento e contrassegno sono cose diverse.
- **Numeri utili**: guardia medica e farmacia di turno sono cercate molto, soprattutto nei festivi.

## 6. La prima ricerca: Sicilia, 19/10/2026

Google Trends, regione Sicilia, media su 12 mesi. In quella settimana GoatCounter contava 74 visite, 1 sola da
Google, circa l'80% da telefono.

| Confronto | Termini (media)                                                                                     |
|-----------|-----------------------------------------------------------------------------------------------------|
| 1         | legge 104 (44), guardia medica (40), invalidità civile (24), esenzione ticket (19), liste d'attesa (0) |
| 2         | legge 104 (46), fascicolo sanitario (34), cambio medico (26), prenotazione cup (12), indennità di accompagnamento (1) |
| 3         | tessera sanitaria (44), legge 104 (34), pronto soccorso (33), medico di base (22), certificato di malattia (4) |
| 4         | medico di base (70), asp con te (40), medico di famiglia (22), tempi di attesa (1), percorso di tutela (0) |

Cosa ci ha detto: la gente scrive «medico di base», non «medico di famiglia»; cerca lo strumento («prenotazione
cup», «asp con te») e non «liste d'attesa» o «percorso di tutela»; tessera sanitaria, fascicolo, pronto soccorso
e guardia medica sono molto cercati.

Ricerche in crescita allora: «rinnovo esenzione ticket 2026», «esenzione ticket over 65», «scelta in deroga medico
di base», «pensione / assegno invalidità civile 2026», «aumento indennità di accompagnamento 2026», «permessi
doppi» (legge 104), «ho smarrito la tessera sanitaria», «guardia medica» + paese, «farmacia di turno oggi»,
«pronto soccorso pediatrico vicino a me», «scaricare certificato di malattia».

Da quella ricerca sono nate le pagine tessera sanitaria, fascicolo, legge 104, CUP, accompagnamento, cure fuori
regione, contrassegno, RSA, psicologo e dentista.

Fonti della ricerca siciliana: Cittadinanzattiva, Rapporto civico sulla salute 2025
(<https://tg24.sky.it/salute-e-benessere/2025/12/18/sanita-liste-attesa-allarme-cittadinanzattiva>); Istat,
rinuncia alle cure 2024
(<https://www.dire.it/06-11-2025/1193696-aumentano-italiani-che-rifiutano-curarsi-istat-sono-quasi-6-milioni-primo-motivo-lunghe-attese/>);
ticket del pronto soccorso per regione
(<https://www.quotidianosanita.it/insights/ticket-pronto-soccorso-quanto-si-paga-regione-per-regione/>). Sono
fonti per scegliere i temi, non per le cifre: le cifre vanno prese dalle fonti ufficiali.
