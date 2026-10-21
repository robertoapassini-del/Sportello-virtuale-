# Da dove riprendere (lavoro del 18/10/2026)

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

1. **Fatto il 19/10/2026 dall'Italia** (vedi CHANGELOG): restano 6 numeri da telefonare. Per il giro successivo: aprire le pagine di
   [da-verificare.md](da-verificare.md) e, per ogni numero confermato, mettere `"proof": "pagina"` e la data.
   Rifare l'elenco con `npm run da-verificare`.
2. **Sportelli «scelta e revoca» ed esenzioni** (topic `anagrafe`): inseriti per tutte le 9 ASP il 18/10/2026, molti
   solo da estratto. Mancano: Catania città (telefoni), Gela, Canicattì, Sciacca, Lentini, Noto, Patti e altri.
3. Enna: numero dello screening; uffici cartelle cliniche di Enna e Ragusa; Papardo (Messina).
4. Il test dei numeri fallirà dopo 92 giorni dall'ultimo controllo (metà gennaio 2027): è il promemoria per il
   giro successivo.
