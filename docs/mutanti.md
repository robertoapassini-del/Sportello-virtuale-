# Mutanti: errori messi apposta per provare i controlli

Un audit dei mutanti mette nel sito un errore alla volta, apposta, e guarda se almeno un controllo fallisce
([protocollo-test.md](protocollo-test.md), «Audit dei mutanti»). Qui ci sono tutti gli errori già provati, con il
controllo che oggi prende ciascuno. **Un audit nuovo usa errori diversi da questi.**

Come rifarne uno: nel file indicato sostituisci il testo «prima» con il testo «dopo» (`⏎` è un a capo; se il testo
compare più volte, solo la prima), lancia `npm run pagine` se la riga dice «rigenera», poi il controllo indicato:
`npm test`, oppure `node tests/<nome>.cjs http://localhost:8080/` con il sito acceso. Il controllo deve fallire.
Poi rimetti tutto com'era (`git checkout -- .`, e `npm run pagine` se avevi rigenerato).

Nomi dei controlli: `coerenza`, `cifre`, `engine`… sono i file `tests/<nome>.test.mjs` (`npm test`); `copie` è
`node tools/confronta-copie.mjs <cartella-copie> --noti tests/copie-noti.txt --base <ramo>`, il job «copie» della CI.

## Giro 5 (21/10/2026): M01-M30

All'inizio `npm test` ne prendeva 4 su 30. Riprovati il 22/10/2026.

| Id | Errore | File | Prima → dopo | Chi lo prende oggi |
|---|---|---|---|---|
| M01 | Telefono ASP Palermo (centralino) con una cifra sbagliata | `data/regioni/sicilia/asp.json` (rigenera) | `"number": "091 7031111",⏎          "verified": "2026-10-18",⏎          "proof": "pagina",⏎          "url": "https://www.asppalermo.org/"` → `"number": "091 7031112",⏎          "verified": "2026-10-18",⏎          "proof": "pagina",⏎          "url": "https://www.asppalermo.org/"` | `copie` (numero non nella copia) |
| M02 | Telefono ASL Frosinone (Lazio) con due cifre scambiate | `data/regioni/lazio/asl.json` (rigenera) | `"0775 8821"` → `"0775 8812"` | `copie` (numero non nella copia) |
| M03 | Numero verde nazionale in numeri.json con due cifre scambiate | `data/numeri.json` (rigenera) | `"800 861061"` → `"800 861016"` | `copie` sulle copie dei numeri nazionali (cartella `nazionali`; non riprovato il 22/10: la copia usata non l'aveva) |
| M04 | Cartella clinica: appeal_days 30 -> 40 (silenzio-rigetto L. 241/1990) | `data/rules-cartella.json` (rigenera) | `"appeal_days": 30,` → `"appeal_days": 40,` | `engine` (cartella clinica: ricorso al TAR dopo 30 + 30 giorni) |
| M05 | Ausili: tolto «In Sicilia» dal collaudo entro 20 giorni | `ausili/index.html` | `In Sicilia entro 20 giorni dalla consegna.` → `Entro 20 giorni dalla consegna.` | `errori-noti` |
| M06 | Ricetta 180 giorni (regola nazionale) scritta come «solo in Sicilia» | `fascicolo-e-ricetta/ricetta-elettronica/index.html` | `(regola nazionale per le ricette dal 30 dicembre 2024;` → `(solo in Sicilia, per le ricette dal 30 dicembre 2024;` | `errori-noti` |
| M07 | Link interno rotto (../../lista-attesa/) | `fascicolo-e-ricetta/ricetta-elettronica/index.html` | `Leggi <a href="../../liste-attesa/">` → `Leggi <a href="../../lista-attesa/">` | `link` |
| M08 | Pulsante Stampa che non fa niente (selettore del gestore sbagliato) | `js/common.js` | `closest('button[data-action="print-page"]')` → `closest('button[data-action="print-pagina"]')` | `numeri-province.cjs` (Stampa non chiama la stampa) |
| M09 | Errore JS nel ramo raro: blocco sede INPS di Numeri utili con provincia scelta | `js/numeri.js` | `<p>📍 ${esc(p.address)}${p.hours` → `<p>📍 ${esc(p.adress.trim())}${p.hours` | `numeri-province.cjs` (errore JavaScript) |
| M10 | Soglia ISEE ADI cambiata nel <title> (10.140 -> 10.410) | `assegno-inclusione/index.html` (rigenera) | `<title>Assegno di inclusione (ADI): chi ha diritto, ISEE fino a 10.140 euro` → `<title>Assegno di inclusione (ADI): chi ha diritto, ISEE fino a 10.410 euro` | `cifre` (titolo della pagina) |
| M11 | h1 della pagina diverso dal titolo in moduli.json | `tessera-sanitaria/index.html` | `<h1>La tessera sanitaria è scaduta o l'hai persa?</h1>` → `<h1>Tessera sanitaria: rinnovo e duplicato</h1>` | **nessuno** (i titoli di `moduli.json` sono più corti dell'h1 per scelta: un confronto automatico darebbe falsi allarmi) |
| M12 | Lettera con segnaposto rimasto ([COMUNE]) | `js/medico.js` | `nel comune di ${state.comune \|\| '__________'}` → `nel comune di ${state.comune \|\| '[COMUNE]'}` | `lettere` (segnaposto nei js) |
| M13 | Ricerca: tolte le parole «tac risonanza» dal modulo liste d'attesa | `data/moduli.json` (rigenera) | `ecografia eco tac risonanza"` → `ecografia eco"` | `coerenza` (parole della ricerca, `tests/ricerca-parole.txt`) |
| M14 | Pagina senza fonti: sources vuoto in rules-tessera-sanitaria.json | `data/rules-tessera-sanitaria.json` (rigenera) | «sources» diventa una lista vuota `[]` | `pagine` (fonti mai vuote) e `provenienza` |
| M15 | Orario CUP ASP Palermo cambiato (14:30 -> 13:30) | `data/regioni/sicilia/asp.json` (rigenera) | `Dal lunedì al venerdì 8:30–14:30; lunedì, mercoledì` → `Dal lunedì al venerdì 8:30–13:30; lunedì, mercoledì` | `copie` (orario non nella copia) |
| M16 | PEC ASP Catania con un refuso (protocolo@) | `data/regioni/sicilia/asp.json` (rigenera) | `"pec": "protocollo@pec.aspct.it"` → `"pec": "protocolo@pec.aspct.it"` | `copie` (PEC non nelle copie) |
| M17 | PEC ASL Frosinone (Lazio) con un refuso | `data/regioni/lazio/asl.json` (rigenera) | `"pec": "protocollo@pec.aslfrosinone.it"` → `"pec": "protocollo@pec.aslfrosinone.ti"` | `copie` (PEC non nelle copie) |
| M18 | send_to ASP Palermo (destinatario della lettera) con un refuso | `data/regioni/sicilia/asp.json` (rigenera) | `"send_to": "percorsoditutela@asppalermo.org"` → `"send_to": "percorsoditutela@aspalermo.org"` | `copie` (indirizzo non nelle copie) |
| M19 | Liste d'attesa: classe B 10 -> 12 giorni nei dati | `data/rules.json` (rigenera) | `"B": 10,` → `"B": 12,` | `engine` (giorni per classe) |
| M20 | Citazione di legge sbagliata: permessi 104 «art. 33» -> «art. 34» | `legge-104/index.html` | `e prevede i permessi (art. 33).` → `e prevede i permessi (art. 34).` | `citazioni` (`tests/citazioni.txt`) |
| M21 | Accompagnamento 551,53 -> 515,53 sia nei dati sia nella guida (coerente ma falso) | `data/rules-accompagnamento.json + accompagnamento/index.html` (rigenera) | `"importo_mensile_2026": 551.53,` → `"importo_mensile_2026": 515.53,` e `<strong>551,53 euro al mese</strong>` → `<strong>515,53 euro al mese</strong>` | `cifre` e `provenienza` (cifra nella frase della fonte) |
| M22 | Mammografia da 50 -> 45 anni nei dati (screening nazionale 50-69) | `data/rules-prevenzione.json` (rigenera) | `"sex": "F",⏎      "min": 50,` → `"sex": "F",⏎      "min": 45,` | `engine` (prevenzione per età e sesso) |
| M23 | noindex su una pagina di modulo | `dentista/index.html` | `<meta name="viewport" content="width=device-width, initial-scale=1">` → `<meta name="viewport" content="width=device-width, initial-scale=1">⏎<meta name="robots" content="noindex">` | `pagine` («noindex») |
| M24 | Festivi: tolto Ferragosto (15/08) da engine.js | `js/engine.js` | `'06-02', '08-15', ` → `'06-02', ` | `engine` (festivi 2026-2030) |
| M25 | Sede INPS Agrigento: indirizzo cambiato | `data/regioni/sicilia/inps.json` (rigenera) | `"address": "Via Picone 20/30, Agrigento"` → `"address": "Via Picone 2/30, Agrigento"` | `copie` sulla copia della sede INPS (cartella `inps-sicilia`; non riprovato il 22/10: la copia usata non l'aveva) |
| M26 | Voce siciliana di numeri.json senza «regione»: numero verde della Regione Siciliana mostrato a tutti | `data/numeri.json` (rigenera) | togli `"regione": "sicilia"` da una voce siciliana (il testo del giro 5 non c'è più) | `contatti` (voci di una sola regione con «regione») |
| M27 | Invalidità nuova procedura: oncologici 15 -> 20 giorni | `data/rules-invalidita.json` (rigenera) | `"oncological": 15,` → `"oncological": 20,` | `engine` (nuova procedura 15/30/90) |
| M28 | Esenzione: <= diventa < sul reddito E01 | `js/engine.js` | `else if (income <= c.E01.income_max)` → `else if (income < c.E01.income_max)` | `engine` (esenzione per reddito) |
| M29 | PEC INPS Messina (destinataria del sollecito) con un refuso | `data/regioni/sicilia/inps.json` (rigenera) | `"pec": "direzione.provinciale.messina@postacert.inps.gov.it"` → `"pec": "direzione.provinciale.mesina@postacert.inps.gov.it"` | `copie` sulla copia della sede INPS (cartella `inps-sicilia`; non riprovato il 22/10: la copia usata non l'aveva) |
| M30 | Permessi 104: «3 giorni al mese» -> «2 giorni al mese» nel testo del lavoratore con handicap grave | `legge-104/permessi/index.html` | `handicap grave</strong>: 3 giorni al mese, oppure` → `handicap grave</strong>: 2 giorni al mese, oppure` | `cifre` (unità dal nome del campo) |

## Giro 6 (22/10/2026): N01-N30

All'inizio i controlli (CI compresa) ne prendevano 6 su 30: N06, N08, N17, N18, N20 (il controllo col browser si
fermava con un errore), N21. Ogni riga è stata riprovata il 22/10/2026: il controllo indicato fallisce con l'errore
e passa senza.

| Id | Errore | File | Prima → dopo | Chi lo prende oggi |
|---|---|---|---|---|
| N01 | Liste d'attesa: il sollecito va alla PEC generale invece che all'indirizzo del percorso di tutela (send_to) | `js/liste-attesa.js` | `aspName: a.province, aspAddress: a.send_to \|\| a.pec \|\| '', person, service: state.service, nre: state.nre,⏎            cls: classText(), firstRequestDate` → `aspName: a.province, aspAddress: a.pec \|\| a.send_to \|\| '', person, service: state.service, nre: state.nre,⏎            cls: classText(), firstRequestDate`; `document.getElementById('rmail-btn').href = mailtoHref(a.send_to \|\| a.pec \|\| '',` → `document.getElementById('rmail-btn').href = mailtoHref(a.pec \|\| a.send_to \|\| '',` | `combinazioni.cjs` (il sollecito va allo stesso indirizzo della prima lettera) |
| N02 | Liste d'attesa: anteprima della lettera senza esc() (testo dell'utente come HTML) | `js/liste-attesa.js` | `` preview.innerHTML = `<div class="letter">${esc(text)}</div>`; `` → `` preview.innerHTML = `<div class="letter">${text}</div>`; `` | `combinazioni.cjs` (nome con «< > &» nella lettera) |
| N03 | Cartella: testo del TAR, off-by-one (< diventa <=) nel giorno 30 | `js/cartella.js` | `if (waited < rules.integration_days) return` → `if (waited <= rules.integration_days) return` | `combinazioni.cjs` (TAR a 29, 30, 31 giorni) |
| N04 | Ricorso: «Vai oggi stesso» da < 15 a <= 15 giorni (off-by-one) | `js/ricorso.js` | `${d.daysLeft < 15` → `${d.daysLeft <= 15` | `combinazioni.cjs` (ricorso da 150 a 186 giorni: «Vai oggi stesso») |
| N05 | Ricorso: link JS a una cartella che non esiste (../invalidita-civile/) | `js/ricorso.js` | `href="../invalidita/"><span class="ico" aria-hidden="true">♿</span>` → `href="../invalidita-civile/"><span class="ico" aria-hidden="true">♿</span>` | `coerenza` (link nei js) |
| N06 | Invalidità: l'email del sollecito va sempre alla PEC della prima sede INPS dell'elenco | `js/invalidita.js` | `document.getElementById('mail-btn').href = mailtoHref(p.pec,` → `document.getElementById('mail-btn').href = mailtoHref(inps.provinces[0].pec,` | `combinazioni.cjs` («PEC INPS sbagliata»), già prima |
| N07 | Cure palliative: lettera indirizzata al PUA (copia-incolla da domiciliare) invece che alla rete di cure palliative | `js/palliative.js` | `\nRete locale di cure palliative\ne p.c.` → `\nPunto Unico di Accesso\ne p.c.` | `combinazioni.cjs` (a chi va la lettera) |
| N08 | Esenzione: ai disoccupati si mostra il limite della pensione al minimo (E04 al posto di E02) | `js/esenzione.js` | `per i disoccupati il limite è ${thr('E02')}` → `per i disoccupati il limite è ${thr('E04')}` | `combinazioni.cjs` («NaN» nel risultato), già prima |
| N09 | Ricorso: classi scambiate, «Muoviti subito» in verde e «Sei ancora in tempo» in rosso | `js/ricorso.js` | `<div class="notice ${urgent ? 'bad' : 'ok'}">` → `<div class="notice ${urgent ? 'ok' : 'bad'}">` | `combinazioni.cjs` (colore dell'avviso) |
| N10 | flow.js: lo stack ricorda solo l'ultima schermata («Ricomincia» torna indietro di un passo) | `js/flow.js` | `stack = [...stack, current];` → `stack = [current];` | `browser.cjs` («Ricomincia da capo», poi Indietro) |
| N11 | Lettere: data della firma in formato ISO (2026-10-21) invece di 21/10/2026 | `js/letters.js` | `` return `${blank(p.city, '[luogo]')}, ${formatIt(today)} `` → `` return `${blank(p.city, '[luogo]')}, ${today} `` | `combinazioni.cjs` (data della firma) |
| N12 | Lazio: l'ASL di Rieti con provincia «Latina» (due pulsanti Latina, Rieti sparisce) | `data/regioni/lazio/asl.json` (rigenera) | `"province": "Rieti",` → `"province": "Latina",` | `coerenza` (province ripetute) |
| N13 | Toscana: id duplicato (prato -> pistoia): l'ASL di Prato non si raggiunge | `data/regioni/toscana/asl.json` (rigenera) | `"id": "prato",` → `"id": "pistoia",` | `coerenza` (id ripetuti, sede INPS) |
| N14 | index.json: Calabria senza asl_label (dice «ASL» invece di «ASP») | `data/regioni/index.json` (rigenera) | `"name": "Calabria", "attiva": true, "asl_label": "ASP", ` → `"name": "Calabria", "attiva": true, ` | `coerenza` (`asl_label`) |
| N15 | index.json: Puglia senza «moduli» (tutti i moduli si credono pronti, ma i dati ci sono solo per Numeri utili) | `data/regioni/index.json` (rigenera) | `"name": "Puglia", "attiva": true, "asl_label": "ASL", "moduli": ["numeri-utili"] }` → `"name": "Puglia", "attiva": true, "asl_label": "ASL" }` | `coerenza` (regione senza «moduli») |
| N16 | Lazio: topic «cup» scritto «CUP» (la sezione Prenotare sparisce per Frosinone) | `data/regioni/lazio/asl.json` (rigenera) | `"topic": "cup",` → `"topic": "CUP",` | `coerenza` (topic sconosciuto) |
| N17 | Sicilia: send_to di Palermo e Siracusa scambiati (merge sbagliato) | `data/regioni/sicilia/asp.json` (rigenera) | scambia i valori: `"send_to": "percorsoditutela@asppalermo.org"` ↔ `"send_to": "percorsoditutela@asp.sr.it"` | `copie`, già prima |
| N18 | CSS: la guida scritta nascosta (.guida aggiunta alla regola di .js-only) | `css/style.css` | `.js-only { display: none; }` → `.js-only, .guida { display: none; }` | `browser.cjs` (#guida non si vede; anche «stampando, il titolo non c'è», già prima) |
| N19 | CSS: stampando una lettera il foglio è bianco (#print-area senza display:block) | `css/style.css` | `body.printing #print-area { display: block; white-space` → `body.printing #print-area { white-space` | `combinazioni.cjs` (stampando la lettera il foglio è bianco) |
| N20 | common.js: la classe «pronto» non viene mai messa | `js/common.js` | `  document.documentElement.classList.add('pronto'); // ora` → `  // ora` | `browser.cjs` (manca la classe «pronto»; prima il controllo si fermava con un errore) |
| N21 | Modifica a mano dentro il blocco generato classi-priorita (B 10 -> 12 giorni), senza npm run pagine | `liste-attesa/tempi-massimi/index.html` | `<td>entro 10 giorni</td><td>entro 5 giorni</td>` → `<td>entro 12 giorni</td><td>entro 5 giorni</td>` | `pagine` e `cifre`, già prima |
| N22 | moduli.json: tolta la pagina corta ausili/consegna-e-collaudo (il file resta, fuori da sitemap e indice) | `data/moduli.json` (rigenera) | `,⏎        {⏎          "id": "consegna-e-collaudo",⏎          "title": "La consegna del fornitore e il collaudo"⏎        }` → (niente) | `coerenza` (pagina fuori dalla sitemap) |
| N23 | Ricorso: «solo entro 6 mesi» -> «solo entro 3 mesi» nel testo della guida | `ricorso-invalidita/index.html` | `<strong>solo entro 6 mesi</strong>` → `<strong>solo entro 3 mesi</strong>` | `cifre` (anche il `<main>` della pagina) |
| N24 | Cure palliative: «legge 38/2010» -> «legge 38/2001» (anno sbagliato, senza articolo) | `cure-palliative/index.html` | `Lo dice la legge 38/2010.` → `Lo dice la legge 38/2001.` | `coerenza` (stessa legge, due anni) |
| N25 | Prevenzione: il campo età senza <label for> (testo in un <p>) | `js/prevenzione.js` | `<label for="age">Età, in anni</label>` → `<p>Età, in anni</p>` | `browser.cjs` (campo senza etichetta) |
| N26 | Testata: il pulsante della ricerca (solo icona) senza aria-label | `tools/pagine.mjs` (rigenera) | `<button type="submit" aria-label="Cerca">` → `<button type="submit">` | `coerenza` (pulsante senza nome) |
| N27 | moduli.json: tolta la parola «lungodegenza» dalla RSA (la ricerca non la trova più) | `data/moduli.json` (rigenera) | `assistita casa di riposo lungodegenza anziano` → `assistita casa di riposo anziano` | `coerenza` (`tests/ricerca-parole.txt`) |
| N28 | pagine.mjs: il link «‹ indietro» del telefono porta sempre a Inizio (trail[0]) | `tools/pagine.mjs` (rigenera) | `const up = trail[trail.length - 1];` → `const up = trail[0];` | `coerenza` («‹ indietro») |
| N29 | pagine.mjs: «Informazioni controllate il» con la data più recente invece della più vecchia | `tools/pagine.mjs` (rigenera) | `Informazioni controllate il ${dateIt(dates[0])}` → `Informazioni controllate il ${dateIt(dates[dates.length - 1])}` | `coerenza` («Informazioni controllate il») |
| N30 | pagine.mjs: «Condividi su WhatsApp» manda l'indirizzo della home invece di quello della pagina | `tools/pagine.mjs` (rigenera) | `` \n${url}`;⏎  const guide `` → `` \n${base}`;⏎  const guide `` | `coerenza` (WhatsApp) |

## Giro 9 (22/10/2026): P01-P22

Terzo giro, sul codice dopo i giri 5-8: 20 errori presi su 22 (91%). I 2 mancanti ora li prendono controlli nuovi.
Le modifiche precise sono in `mut.py` dell'audit; qui la descrizione.

| Id | Errore | File | Lo prende |
|---|---|---|---|
| P01 | showError non segna il campo con aria-invalid | `js/flow.js` | browser.cjs |
| P02 | showError scrive l'errore ma lo lascia nascosto | `js/flow.js` | combinazioni.cjs |
| P03 | moveToTop anche alla prima schermata | `js/flow.js` | browser.cjs (primo Tab) |
| P04 | avvisoErrore senza la classe errore-js | `js/common.js` | telefoni-vecchi.cjs |
| P05 | il gestore degli errori conta solo quelli di altri siti | `js/common.js` | telefoni-vecchi.cjs |
| P06 | modulepreload senza la radice del sito | `tools/pagine.mjs` | link.test |
| P07 | lo script in testa perde il #… dell'indirizzo | `tools/pagine.mjs` | head-script.test |
| P08 | la classe della stampa della guida non si toglie | `js/common.js` | lettere-stampa.cjs |
| P09 | Ctrl+P sul modulo di Palermo stampa tutta la pagina | `js/common.js` | lettere-stampa.cjs |
| P10 | ogni tutore o amministratore firma come «tutore» | `js/letters.js` | lettere.test |
| P11 | il genitore non è nominato nella firma | `js/letters.js` | lettere.test |
| P12 | «dott. Dott. Rossi» (titolo maiuscolo non riconosciuto) | `js/letters.js` | lettere.test |
| P13 | «Distretto – Distretto» con «Distretto» senza spazio dopo | `js/letters.js` | errori-noti |
| P14 | l'indirizzo email accetta «?» nel dominio | `js/letters.js` | lettere.test |
| P15 | ?torna= senza controllo del sito | `js/numeri.js` | robustezza.cjs |
| P16 | ?torna= con pathname invece di href | `js/numeri.js` | robustezza.cjs |
| P17 | il sabato contato come giorno lavorativo | `js/engine.js` | combinazioni.cjs; ora anche engine.test |
| P18 | Pasqua un giorno dopo (Pasquetta di martedì) | `js/engine.js` | engine.test |
| P19 | numero della Sicilia con regione «lazio» | `data/numeri.json` | contatti.test |
| P20 | regione senza uffici: avviso vuoto al posto di regionMissing() | `js/flow.js` | browser.cjs |
| P21 | tolto dalla CI il giro di lettere-stampa.cjs | `.github/workflows/test.yml` | prima nessuno; ora workflow.test |
| P22 | testi di numeri.json in linguaggio da ufficio | `data/numeri.json` | prima nessuno; ora leggibilita.test |
| P23 | gli avvisi di pdf.js finiscono nel JSON del testo (PDF letto senza pdftotext) | `tools/pdf-testo.mjs` | preso da copie-giro.test (giro con `COPIE_SENZA_PDFTOTEXT=1`) |
| P24 | impronta sha512 di pdf.js cambiata | `tools/pdf-testo.mjs` | provato a mano: «impronta di pdf.js sbagliata», niente scaricato; copie-giro.test vede «pdf.js non pronto» |

Andamento: giro 5 presi 4 su 30, giro 6 presi 6 su 30, giro 9 presi 20 su 22.
