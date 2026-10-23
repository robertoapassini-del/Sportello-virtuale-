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

In ordine di priorità. Prima di scrivere: fonte ufficiale per ogni cifra, nazionale o regione per regione.

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
- Le parole «sovracup» e «aspconte» nelle parole chiave valgono solo per la Sicilia: le parole delle altre
  regioni si aggiungono dopo il punto 3.

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
