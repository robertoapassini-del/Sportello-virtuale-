# Regola per l'italiano semplice

Chi legge il sito spesso è anziano, stanco o preoccupato. Il testo deve capirlo chi ha la licenza media.
Il test `tests/leggibilita.test.mjs` controlla le regole qui sotto: se una non è rispettata, `npm test` fallisce.

Quando semplifichi un testo, **fatti, cifre, date e leggi restano uguali**. Non aggiungere niente che non c'era:
dividi le frasi, cambia le parole difficili, metti gli elenchi in una lista.

## 1. Le soglie

L'indice Gulpease misura quanto è facile un testo italiano: 89 + (300 × frasi − 10 × lettere) / parole.
Più è alto, più è facile (sopra 60 lo legge chi ha la licenza media, sopra 80 chi ha la licenza elementare).

| Cosa | Minimo |
|---|---|
| Testo scritto a mano di una pagina (senza testata, indice, fonti e piè di pagina di `tools/pagine.mjs`) | Gulpease 60 |
| Testi delle schermate di un modulo (`js/`) | Gulpease 65 |
| Una frase | al massimo 40 parole |

Il Gulpease si controlla solo per i testi di almeno 80 parole: sotto non è affidabile. Non si guardano i file con le
lettere agli uffici (`letters.js`) e quelli senza testo per chi legge.

Come si alza il punteggio: frasi corte (una cosa per frase), parole corte e comuni, gli elenchi in una lista
(`<ul>`) invece che in una frase con le virgole, una domanda al posto di un «se» lungo («Hai la ricetta? …»).

## 2. Parole da ufficio

Nel testo per chi legge non si usano queste parole. Sono ammesse solo tra «» (una frase da copiare in una richiesta)
e nei pezzi di lettera agli uffici.

| Non scrivere | Scrivi |
|---|---|
| istanza | domanda |
| ai sensi di | secondo (o la legge tra parentesi: «(art. 22 GDPR)») |
| suddetto, predetto | questo |
| erogazione, erogare | pagamento, servizio; dare, pagare |
| decorrenza | da quando vale |
| inoltrare | mandare |
| avente diritto | chi ne ha diritto |
| contestualmente | insieme, nello stesso momento |
| nonché | e anche |
| ovvero | cioè, oppure |
| qualora | se |
| presso | a, da, in |
| prestazione (da sola) | visita, esame, cura, aiuto |
| in ordine a, in merito a | su |
| medesimo | stesso |
| previo | dopo, con |
| in capo a | di, per |
| al fine di | per |
| entro e non oltre | entro |
| pertanto | quindi |
| il richiedente | chi fa la domanda |
| di cui all'art. … | (togliere) |
| nell'ambito di | in, dentro |
| espletare | fare |
| adempimento, ottemperare | cosa da fare |
| diniego | rifiuto, il no |

«Prestazione» va bene quando dice di che cosa («prestazioni sanitarie», «prestazione economica»…).
«Sollecitare», «competente» e «tuttavia» non fanno fallire il test, ma è meglio «chiedere di nuovo», «giusto» e «però».

## 3. Chi lo fa: niente passivo che nasconde chi agisce

Se è chi legge che deve fare una cosa, diglielo con il verbo attivo:

- «va comunicato all'INPS» → «devi dirlo all'INPS»;
- «la ricetta va prenotata entro 180 giorni» → «devi prenotare la ricetta entro 180 giorni»;
- «la lettera va mandata con la PEC» → «manda la lettera con la PEC»;
- «va controllata di nuovo» → «devi controllarla di nuovo».

Se lo fa un ufficio, scrivi quale («l'ASL paga la parte sanitaria», non «la parte sanitaria è pagata»).
Il passivo va bene quando chi agisce non conta («l'indennità si sospende»). Questa regola non ha un test: la
controlla chi rilegge.
