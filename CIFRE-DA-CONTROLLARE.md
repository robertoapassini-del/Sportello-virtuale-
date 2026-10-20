# Cifre da controllare ogni anno

Promemoria per il giro di **gennaio** (e dopo ogni legge di bilancio, a fine dicembre).
Per ogni cifra: dove si trova, il campo nei file `data/` e la fonte ufficiale da rileggere.

Dal 20/10/2026 ogni cifra ha anche la sua scheda nel blocco `provenienza` del file `data/`, con la data
`review_by` entro cui va ricontrollata: `npm test` fallisce da solo quando è ora. Regola completa e
procedura: [docs/regola-cifre.md](docs/regola-cifre.md). Questo elenco resta la vista per argomento,
con le pagine ufficiali da rileggere.

Come si aggiorna una cifra:

1. Cambia il valore nel file `data/…json` (le schermate lo leggono da lì).
2. Cambia lo stesso numero nella guida scritta della pagina (`<cartella>/index.html`): lì è scritto a mano.
   Il test `tests/cifre.test.mjs` ti dice se ne hai dimenticato uno.
3. Aggiorna la scheda in `provenienza` (`verified`, `proof`, `review_by`), metti la data di oggi in
   `last_verified` e aggiungi la fonte in `sources`.
4. `npm run pagine` (rifà fonti e «Informazioni controllate il…») e poi `npm test`.
5. Scrivi la modifica in `CHANGELOG.md`, con la fonte.

Ultimo controllo di questo elenco: 19 ottobre 2026.

## Cifre che cambiano spesso (ogni anno o ogni due anni)

| Cifra | Valore attuale | Pagina | Campo in `data/` | Fonte ufficiale | Quando cambia |
|---|---|---|---|---|---|
| Assegno di inclusione: ISEE massimo | 10.140 € | `assegno-inclusione/` | `rules-adi.json` → `isee_max` | [INPS – Assegno di inclusione](https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.assegno-di-inclusione-adi.html) | Legge di bilancio |
| Assegno di inclusione: reddito massimo (× scala di equivalenza) | 6.500 € | `assegno-inclusione/` | `rules-adi.json` → `income_max_base` | come sopra; [Ministero del Lavoro](https://www.lavoro.gov.it/notizie/pagine/adi-cosa-cambia-con-la-legge-di-bilancio-2026) | Legge di bilancio |
| Assegno di inclusione: reddito massimo se tutti hanno 67 anni o più | 8.190 € | `assegno-inclusione/` | `rules-adi.json` → `income_max_elderly` | come sopra | Legge di bilancio |
| Assegno di inclusione: durata, rinnovo, primo mese del rinnovo | 18 mesi, poi 12; nessun mese di stop; primo mese al 50% | `assegno-inclusione/` | `rules-adi.json` → `duration_months`, `renewal_months`, `renewal_first_month_percent` | [INPS – addio al mese di stop (messaggio 640/2026)](https://www.inps.it/it/it/inps-comunica/notizie/dettaglio-news-page.news.2026.03.assegno-di-inclusione-addio-al-mese-di-stop.html) | Legge di bilancio |
| Gratuito patrocinio: reddito massimo | 13.659,64 € (DM 22/04/2025) | `ricorso-invalidita/` (nella guida: «circa 13.660 euro») | `rules-ricorso.json` → `gratuito_patrocinio_income` | [Gazzetta Ufficiale n. 159 dell'11/07/2025](https://www.gazzettaufficiale.it/gazzetta/serie_generale/caricaDettaglio?dataPubblicazioneGazzetta=2025-07-11&numeroGazzetta=159); [Ministero della Giustizia](https://www.giustizia.it/giustizia/page/it/patrocinio_a_spese_dello_stato_nei_giudizi_civili_e_amministrativi) | Ogni 2 anni (ISTAT): il prossimo nel 2027 |
| Niente spese legali se si perde (doppio del gratuito patrocinio) | 27.319,28 € | `ricorso-invalidita/` (nella guida: «circa 27.300 euro») | `rules-ricorso.json` → `no_legal_costs_income` | art. 152 disp. att. c.p.c. ([Normattiva](https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1941-12-18;1368)) | Insieme al gratuito patrocinio |
| Detrazione spese sanitarie: franchigia e percentuale | 129,11 €, 19% | `assistenza-domiciliare/` | — (solo testo in `js/domiciliare.js` e nella guida) | [Agenzia delle Entrate – spese sanitarie](https://www.agenziaentrate.gov.it/portale/le-spese-sanitarie-e-i-mezzi-di-ausilio) | Legge di bilancio (raro) |
| Riforma della disabilità: province e date | Palermo dal 30/09/2025; Caltanissetta, Catania, Messina dal 01/03/2026; tutta Italia dal 01/01/2027 | `invalidita/` | `rules-invalidita.json` → `new_regime`, `full_national_application` | [riformadisabilita.gov.it](https://riformadisabilita.gov.it/valutazione-di-base/); [disabilita.governo.it](https://www.disabilita.governo.it/it/notizie/al-via-sperimentazione-riforma-disabilita-in-altre-40-province/) | Decreti di proroga (spesso a fine anno) |
| Screening oncologici: età | Mammografia 50–69, colon 50–69, Pap test 25–29, test HPV 30–64 | `prevenzione/` | `rules-prevenzione.json` → `screening` | [Regione Siciliana – prevenzione tumori](https://www.regione.sicilia.it/istituzioni/regione/strutture-regionali/assessorato-salute/dipartimento-attivita-sanitarie-osservatorio-epidemiologico/epidemiologia-prevenzione/piano/screening/prevenzione-tumori); [ASP Palermo – screening](https://screening.asppalermo.org/) | Nuovo Piano regionale della prevenzione |
| Screening epatite C (nati 1969–1989) | **Non pubblicato**: proroga nazionale al 31/12/2026, nessuna pagina siciliana recente | (da aggiungere a `prevenzione/` se confermato) | — | Regione Siciliana, ASP, [bastapensarci.it](https://www.bastapensarci.it) | Ogni anno (proroghe) |
| Vaccini gratis per età | Influenza da 60 anni; pneumococco e zoster da 65; antitetanica ogni 10 anni | `prevenzione/` | `rules-prevenzione.json` → `vaccines` | Circolare influenza del Ministero della Salute (ogni anno); calendario vaccinale regionale | Ogni autunno |
| Liste d'attesa: tempi massimi per classe | U 72 ore, B 10 giorni, D 30/60 giorni, P 120 giorni | `liste-attesa/` (tabella creata da `npm run pagine`) | `rules.json` → `max_wait_days`, `callback_days` | [Piano nazionale liste d'attesa 2026–2028](https://www.salute.gov.it/new/it/tema/liste-di-attesa/piano-nazionale-governo-liste-di-attesa/) | Nuovo piano nazionale o regionale (piano regionale atteso entro il 22/12/2026: `regional_plan_due`) |

## Cifre ferme da anni (ricontrollare comunque una volta l'anno)

| Cifra | Valore attuale | Pagina | Campo in `data/` | Fonte ufficiale |
|---|---|---|---|---|
| Esenzione ticket E01 (sotto 6 anni o 65 anni e più) | reddito familiare fino a 36.151,98 € | `esenzione-ticket/` | `rules-esenzione.json` → `codes.E01` | [Ministero della Salute – esenzioni per reddito](https://www.salute.gov.it/new/it/tema/esenzioni-dal-ticket/esenzioni-reddito/) |
| Esenzione ticket E02 ed E04 | 8.263,31 €; 11.362,05 € con il coniuge; +516,46 € per figlio | `esenzione-ticket/` | `rules-esenzione.json` → `codes.E02`, `codes.E04` | come sopra |
| Massimale medico di famiglia | 1.500 pazienti | `medico-famiglia/` | `rules-medico.json` → `max_patients_medico` | ACN medicina generale ([SISAC](https://www.sisac.info)) |
| Massimale pediatra | 880 pazienti (fino a 1.000 con deroghe, ACN 2022) | `medico-famiglia/` | `rules-medico.json` → `max_patients_pediatra` | ACN pediatria ([SISAC](https://www.sisac.info)); controllare l'ACN del 18/03/2026 |
| Copia della cartella clinica | 7 giorni; integrazioni 30 giorni; prima copia gratis (art. 15 GDPR) | `cartella-clinica/` | `rules-cartella.json` | L. 24/2017 art. 4; [Garante privacy, FAQ dicembre 2024](https://www.garanteprivacy.it/web/guest/home/docweb/-/docweb-display/docweb/10086913) |
| Ausili: tempo per l'autorizzazione | 20 giorni (**da verificare**: vedi sotto) | `ausili/` | `rules-ausili.json` → `authorization_days` | DPCM 12/01/2017, allegato 12; regole della Regione Siciliana |
| Ricorso invalidità | 6 mesi dal verbale | `ricorso-invalidita/` | `rules-ricorso.json` → `appeal_months` | D.L. 269/2003, art. 42 |
| Invalidità: tempi della visita | 15 / 30 / 90 giorni (nuovo regime) | `invalidita/` | `rules-invalidita.json` | D.Lgs. 62/2024, art. 6 |
| Contact center INPS | 803 164 (fisso), 06 164164 (cellulare) | `invalidita/`, `numeri-utili/` | `rules-invalidita.json` → `inps_contacts` | [inps.it](https://www.inps.it) |

## Note aperte

- **Ausili, 20 giorni e silenzio-assenso:** il DPCM 12/01/2017 (allegato 12, art. 1) lascia alle Regioni il tempo massimo per l'autorizzazione. I 20 giorni con silenzio-assenso erano nel vecchio DM 332/1999, art. 4. Il DPCM ha un silenzio-assenso solo di 5 giorni, per i dispositivi dell'elenco 1 prescritti durante il ricovero. Prima di cambiare il testo e la lettera bisogna trovare la regola della Regione Siciliana.
- I **numeri di telefono** delle ASP hanno una regola a parte, con un controllo ogni 3 mesi: vedi [docs/regola-numeri.md](docs/regola-numeri.md).
