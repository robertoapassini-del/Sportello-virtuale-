// Errori già trovati sul sito, che non devono tornare. Ogni volta che una rilettura o un utente trova
// un errore che si può riconoscere da come è scritto, si aggiunge qui una riga (cosa, perché, dove guardare).
// Guarda le pagine HTML, i JS e i file di dati, anche quelli delle regioni.
// Se fallisce: correggi il testo. Togli una riga solo se la regola è cambiata (e scrivilo nel CHANGELOG).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SALTA = new Set(['node_modules', '.git', '.claude', 'tests', 'tools', 'docs', 'fonts', 'css']);
function files(dir = SITE) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (SALTA.has(e.name)) return [];
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return files(p);
    return /\.(html|js|json)$/.test(e.name) ? [p] : [];
  });
}

// [espressione, perché è sbagliato, righe dove invece va bene, file da saltare per ora].
// I file da saltare sono quelli che un altro lavoro sta riscrivendo: si tolgono appena sono corretti. Le espressioni guardano il testo così com'è nel file.
const ERRORI = [
  // Lettere stampate del 22/10/2026 (giro 8): chi scrive «dott. Rossi» o «Distretto di Bagheria» nel modulo.
  [/\b(dott|dr)\.(ssa)? (dott|dr)\b/i, 'titolo ripetuto «dott. dott.»: il nome del medico passa da doctorName() di js/letters.js'],
  [/\bdott\. \$\{/, '«dott. ${…}»: chi scrive può aver già messo «dott.» o «dott.ssa»: usa doctorName() di js/letters.js', /TITLE\.test/],
  // 22/10/2026: le lettere scrivevano «USL di Perugia», «ATS di Genova» (aziende che con quel nome non esistono).
  [/aslIntestazione\(\)\} di \$\{|ente: aslIntestazione\(\)/, 'intestazione della lettera fatta a mano con la sigla + «di» + provincia: usa intestazioneAzienda(a) di js/flow.js (legge nome_lettera e la zona)'],
  [/Distretto – (Distretto|\$\{)/i, '«Distretto – ${…}»: chi scrive può aver già messo «Distretto di …» (niente «Distretto – Distretto»): usa districtLine() di js/letters.js', /\/\^distretto\/i\.test/],
  [/\b(la|della|nella|alla|dalla|sulla|una) (ASL|ASP|AUSL|ASST|ATS|USL|ULSS|AST|ASREM)\b/, "si scrive «l'ASL», «dell'ASL» (rilettura del 21/10/2026)"],
  [/art\.\s*4,?\s*comma\s*3[^.\n]{0,60}24\/2017|24\/2017[^.\n]{0,60}art\.\s*4,?\s*comma\s*3/, 'documentazione sanitaria entro 7/30 giorni: è l\'art. 4, comma 2 della L. 24/2017 (il comma 3 parla dei risarcimenti)'],
  [/art(icolo|\.)\s*18[^.\n]{0,80}autorizz|autorizz[^.\n]{0,80}art(icolo|\.)\s*18 (del )?DPCM/i, "ausili: l'art. 18 del DPCM 12/01/2017 parla dei destinatari; autorizzazione e tempi sono nell'allegato 12"],
  [/artt?\.\s*25 e 26/, 'consultori: sono nell\'art. 24 del DPCM 12/01/2017 (artt. 24, 25 e 26)'],
  [/art\.\s*9 del DPCM[^.\n]{0,60}(odontoiatr|dentist)|(odontoiatr|dentist)[^.\n]{0,80}art\.\s*9 del DPCM/i, "dentista: non è l'art. 9 del DPCM (allegato 4C)"],
  [/circa\s+\$\{formatEuro|circa \d{1,3}(\.\d{3})*,\d{2}\s*(€|euro)/, '«circa» davanti a una cifra con i centesimi'],
  [/Sono passati <strong>\$\{days\(/, '«Sono passati 1 giorno»: va gestito il singolare'],
  [/Curarsi fuori dalla Sicilia/, 'il modulo vale per tutte le regioni: «Curarsi fuori dalla propria regione»'],
  [/fino al terzo grado/, 'permessi 104: parenti fino al secondo grado; il terzo grado solo in casi precisi (art. 33 c. 3 L. 104/1992)', /65 anni|Un familiare alla volta|congedo/],
  [/di solito fino a un anno/, 'ricetta per visite ed esami: 180 giorni per prenotare (regola nazionale dal 30/12/2024)'],
  [/l'ASL autorizza entro 20 giorni|L'articolo 18 dice che l'ASL autorizza entro/, 'ausili: i 20 giorni non sono del DPCM, sono una regola regionale (Sicilia)'],
  [/Per ora solo in Sicilia/, 'il sito vale in tutta Italia'],
  [/Fino a \$\{rules\.pediatra_only_until\} anni/, 'pediatra: «sotto i 6 anni» (tra 6 e 13 si può scegliere)'],
  [/!parseDate\(/, 'parseDate() del 01/01/1970 vale 0 (falso): si controlla con «=== null» (audit del 21/10/2026)'],
  [/C02[^<\n]{0,40}67|C03[^<\n]{0,40}frequenza/, 'codici esenzione invalidità: C02 = 100% con accompagnamento, C03 = 67-99%, C04 = minori con frequenza'],
  [/strisce blu[^.\n]{0,100}(occupati|occupate)/, 'strisce blu: dal 14/12/2024 (L. 177/2024) gratis senza la condizione dei posti riservati occupati'],
  [/part-time i giorni si riducono in proporzione/, 'permessi 104: con il part-time orizzontale i 3 giorni restano interi (circolare INPS 45/2021)'],
  [/meno di 3 anni[^.\n]{0,80}prolungamento del congedo/, 'prolungamento del congedo parentale: fino ai 12 anni del figlio; solo le 2 ore fino ai 3 anni'],
  [/rivalutazione dell.1,4%/, "accompagnamento: l'1,4% è la perequazione delle pensioni, non vale per l'accompagnamento"],
  [/messaggio (n\. )?639\/2026/, 'province della riforma della disabilità: messaggi INPS 635 e 637 del 23/02/2026'],
  [/art\. 6,? L\. 80\/2006|L\. 405\/2001, art\./, 'leggi di conversione con un solo articolo: si cita il decreto-legge (D.L. 4/2006 art. 6 c. 3-bis; D.L. 347/2001 art. 8)'],
  [/lunedì e mercoledì[^;"]*;\s*dal martedì al giovedì/, 'orario con un giorno ripetuto e il venerdì mancante (URP ASL Roma 4, avviso con refuso)'],
  [/(come fare|nato\/a) a \$\{/, '«a Agrigento»: davanti ai nomi che cominciano per A ci vuole «ad»'],
  [/Non ti chiediamo (mai la malattia|dati sulla salute)\./, 'privacy: i moduli chiedono la visita o l\'ausilio per la lettera (resta nel browser)'],
  [/spese di viaggio[^.\n]{0,80}scaricare[^.\n]{0,60}in parte/i, 'viaggio e alloggio per le cure di solito non si detraggono (Agenzia delle Entrate)'],
  [/tutto gratuito<\/strong> per più di un mese/, 'accompagnamento: si sospende dopo 29 giorni di ricovero gratuito, non «un mese»'],
  [/nessuno può essere dimesso/i, 'dimissione protetta: è un percorso organizzativo regionale, non un divieto di dimissione'],
  [/L'assistenza domiciliare è gratuita\./, 'ADI: gratuite le cure sanitarie; l\'aiuto dell\'operatore dopo 30 giorni può avere una quota (DPCM 2017 art. 22)'],
  [/data-go="\$\{(esc\()?first\)?\}"[^`]*Leggi cosa vale/, '«Leggi cosa vale in tutta Italia» riportava all\'inizio del modulo: giro senza uscita (va alla guida #guida)'],
  [/DM 24\/11\/2022/, 'bonus psicologo: il decreto è del 24/11/2023'],
  [/tutto\s*(<strong>)?\s*gratuit/i, 'ADI: gratuite solo le cure sanitarie (DPCM 2017 art. 22)', /ricovero è <strong>tutto gratuito|tutto gratuito per più di 29/],
  [/Non andare dal privato a pagamento prima di (aver )?mandat[oa] la richiesta[.:]/, "liste d'attesa: dal privato solo dopo la richiesta e solo se l'ASL lo scrive (rilettura del 21/10/2026)"],
  [/costo di riproduzione/, 'cartella: la prima copia è gratis (art. 15 GDPR)'],
  [/visita\/il procedimento/, 'sollecito INPS: nuova procedura = «il procedimento di valutazione di base doveva concludersi», vecchia oncologica = «la visita doveva svolgersi» (audit lettere del 21/10/2026)'],
  [/termine indicato come ordinario/, 'sollecito INPS, vecchia procedura ordinaria: i 30 giorni sono indicativi, la lettera dice solo quanti giorni sono passati'],
  [/isDelegate \? \[?'(; )?delega e documento/, 'chi scrive per un\'altra persona: il genitore di un minore non allega la delega, il tutore e l\'amministratore di sostegno allegano il decreto di nomina (usa delegateAttachment())'],
  [/di chi fa la richiesta per lei, con la <strong>delega/, 'RSA: chi non può firmare (per esempio con una demenza) non firma la delega: firma il tutore o l\'amministratore di sostegno, con il decreto'],
  [/secondo i tempi indicati dalla normativa vigente/, 'i 30 giorni della vecchia procedura INPS sono indicativi (rules-invalidita.json): la lettera non li cita come norma'],
  // Audit dei testi del 21/10/2026 (sera).
  [/"number": "800 \d{3} \d{3}"/, 'numeri verdi: «800 123456» (docs/regola-numeri.md)'],
  [/circa \d{4,}\b|circa \$\{rules\.max_patients/, 'migliaia con il punto: «circa 1.500»'],
  [/[Ii]l conto in questa guida/, '«Il percorso in questa guida»: il modulo non è solo un conto'],
  [/\(Punto Unico di Accesso\)|\bpap test\b/, '«(Punto unico di accesso)», «Pap test»', /"keywords"/],
  [/\bad (?=[EIOU][a-z])|\b([Uu]na|[Dd]ella|[Nn]ella|[Aa]lla|[Dd]alla|[Ll]a) équipe\b/, "«a Enna» («ad» solo davanti alla A), «un'équipe», «dell'équipe»"],
  [/\b([Gg]uarda|vale la pagina) <a [^>]*>(la visita è|il verbale è|la visita per l.invalidità non)/, 'il titolo di una pagina non va dentro la frase come link: «Leggi cosa fare se …»'],
  [/Non andare dal privato a pagamento prima di/, "liste d'attesa: «Vai dal privato a pagamento solo se l'ASL te lo scrive»"],
  [/"title": "(Non mi danno|Ho diritto|[^"]*l'ho persa|[^"]*posso fare)/, "titoli in data/moduli.json come l'h1 della pagina: si dà del tu («Non ti danno», «l'hai persa»)"],
  // Audit dei mutanti del 21/10/2026: regole regionali scritte per tutti, regole nazionali scritte come siciliane.
  [/20 giorni dalla consegna/, 'ausili: il collaudo entro 20 giorni è una regola della Sicilia: «In Sicilia entro 20 giorni dalla consegna»', /Sicili|"notes_internal"/],
  // Audit tastiera e lettori di schermo del 22/10/2026 (giro 6).
  [/<a [^>]*>\s*(qui|leggi qui|clicca qui|fonte)\s*<\/a>/i, 'link con un nome che da solo non dice dove porta («leggi qui», «Fonte»): chi usa un lettore di schermo sente solo l\'elenco dei link. Scrivi dove porta («come vedere il Fascicolo di un figlio», «Fonte: …»)'],
  [/\bin Sicilia\b[^.\n]{0,80}180 giorni|180 giorni[^.\n]{0,80}\bin Sicilia\b/, 'ricetta per visite ed esami: i 180 giorni sono una regola nazionale (ricette dal 30/12/2024), non solo siciliana', /regola nazionale/],
  // Verifica dei fatti del 22/10/2026 (giro 7).
  [/[Ss]i sospende[^.]{0,120}29 giorni|29 giorni[^.]{0,60}si sospende/, 'accompagnamento: non si sospende se la struttura non dà tutta l\'assistenza (messaggio INPS 3347/2023): dirlo', /3347|tutta l'assistenza/],
  [/fino a 8\.263,31/, 'esenzione E02/E04: reddito «inferiore a» 8.263,31 (il limite esatto è escluso): «sotto 8.263,31»'],
  // 23/10/2026: «Per gli altri argomenti le lettere già pronte, per ora, solo in Sicilia» e «non abbiamo ancora i dati»:
  // il sito dice quello che c'è; dove mancano i dati della regione il pulsante del modulo non si vede (js/flow.js).
  [/lettere già pronte, per ora|non abbiamo ancora|non li abbiamo ancora|ancora da raccogliere|non ancora (in|per) tutte le regioni/, 'non dire quello che manca: mostra solo quello che c\'è nella regione', /^\s*\/\//],
  [/uffici e lettere solo per la Sicilia|le lettere per ora solo per la Sicilia/, 'home: le regioni con le lettere si calcolano dall\'indice (regioni senza «moduli»), non si scrive «solo per la Sicilia»'],
  // Revisione completa del 25/10/2026: frasi più ampie della fonte, sbagliate o contraddittorie (docs/revisione-2026-10-25.md).
  [/[Ss]ono tempi massimi/, 'triage: i tempi valgono «quando siano presenti condizioni di normale affluenza», non sono una garanzia'],
  [/non si può prendere nello stesso periodo in cui un altro familiare/, 'congedo straordinario e permessi 104 per la stessa persona: si possono, «purché non negli stessi giorni» (scheda INPS)'],
  [/entro i 12 anni del figlio/, 'prolungamento del congedo parentale: entro i 14 anni del figlio (scheda INPS sui permessi 104)'],
  [/non mentre c'è un ricorso in corso/, "aggravamento: l'INPS lo ammette anche durante un ricorso («con l'eccezione delle domande di aggravamento»)"],
  [/si considera data|l'autorizzazione vale lo stesso|vale come un sì/, 'ausili: il silenzio-assenso in Sicilia non ha ancora una fonte letta (DA-VERIFICARE-A-MANO.md)'],
  [/31 marzo 2026 anche in quelle private|Dal 2026 tutte le strutture/, 'Fascicolo: i documenti dei privati ci vanno dal 2020 (fascicolosanitario.gov.it); la data 2026 non ha fonte'],
  [/Per legge devi pagare il <strong>ticket intero/, 'disdetta: il D.L. 73/2024 rimanda alle linee di indirizzo i casi in cui si paga («può dover pagare»)'],
  [/trattano la ricetta senza lettera come classe/, 'ricetta senza classe di priorità: nessuna fonte dice come la trattano le aziende'],
  [/D\.A\. n\. 367 del 3 aprile 2025/, 'DPC in Sicilia: la pagina della Regione cita il D.A. n. 1857 del 26/09/2017'],
  [/ogni anno c'è un periodo per fare domanda|nei periodi che l'INPS (apre|annuncia) ogni anno|periodo che l(&#39;|')INPS apre ogni anno/, "bonus psicologo: l'INPS apre i periodi quando ci sono i fondi; non è un appuntamento di ogni anno"],
  [/in contanti non si può/, 'infermiere: per chi ha una disabilità la spesa è deducibile anche in contanti (Agenzia delle Entrate)'],
  [/ti (<strong>)?rimborsa i chilometri/, 'dialisi: il rimborso dei chilometri con la propria auto non ha fonte'],
  [/Ti dà le <strong>medicine/, 'guardia medica: fa la ricetta per le terapie «non differibili», non dà le medicine'],
  [/che non richiede lo SPID/, 'ASPConTe: la pagina dell\'ASP Catania chiede lo SPID'],
  [/in Sicilia e in Calabria si chiama ASP/, "si chiama ASP anche l'azienda sanitaria di Potenza (Basilicata)"],
  [/con tutti sopra i 67 anni/, "assegno di inclusione: 8.190 euro anche con altri familiari con disabilità grave, e da 67 anni compiuti («pari o superiore»)"],
  [/e paghi una multa/, 'esenzione: chi dichiara il falso rischia anche sanzioni penali (art. 75 e 76 D.P.R. 445/2000)'],
];

test('nessuno degli errori già trovati è tornato', () => {
  const trovati = [];
  for (const f of files()) {
    const righe = fs.readFileSync(f, 'utf8').split('\n');
    righe.forEach((riga, i) => {
      for (const [re, perche, va_bene, salta] of ERRORI) {
        if (salta && salta.includes(path.relative(SITE, f).split(path.sep).join('/'))) continue;
        if (re.test(riga) && !(va_bene && va_bene.test(riga))) trovati.push(`${path.relative(SITE, f)}:${i + 1}: ${perche}\n    ${riga.trim().slice(0, 160)}`);
      }
    });
  }
  assert.deepEqual(trovati, [], `Errori già visti:\n${trovati.join('\n')}`);
});

// Audit giro 6: la ricerca della pagina iniziale resta nell'indirizzo (#q=…, js/home.js), ma la privacy diceva solo
// «Quando chiudi la pagina, si cancella tutto». Finché il sito la tiene nell'indirizzo, la privacy lo deve dire.
test('la privacy dice che le parole cercate restano nell\'indirizzo e nella cronologia', () => {
  const home = fs.readFileSync(path.join(SITE, 'js/home.js'), 'utf8');
  if (!/#q=/.test(home)) return;
  const privacy = fs.readFileSync(path.join(SITE, 'privacy.html'), 'utf8');
  assert.match(privacy, /«#q=»[^<]*cronologia/, 'privacy.html: manca la frase sulla ricerca nell\'indirizzo («#q=») e nella cronologia');
});

// 24/10/2026, la missione (CLAUDE.md): prima come si fa, poi cosa fare se qualcosa non va. Titoli e home dicevano
// solo il problema («La visita per l'invalidità non arriva», «Il verbale è sbagliato»). Le frasi dei problemi restano
// nelle parole chiave e nelle pagine «Se qualcosa non va»; i titoli dei moduli e delle aree dicono la procedura.
test('titoli dei moduli e home: prima la procedura, non solo il problema', () => {
  const reg = JSON.parse(fs.readFileSync(path.join(SITE, 'data/moduli.json'), 'utf8'));
  const PROBLEMA = /non arriv|troppo lontan|è sbagliat|non ti danno|in ritardo/i;
  const brutti = [...reg.groups.map((g) => g.title), ...reg.modules.map((m) => m.title)].filter((t) => PROBLEMA.test(t));
  assert.deepEqual(brutti, [], 'titoli scritti come problema: scrivi la procedura (il problema va in «small» o nelle parole chiave)');
  const home = fs.readFileSync(path.join(SITE, 'js/home.js'), 'utf8');
  const frequenti = home.match(/const FREQUENTI = \[([\s\S]*?)\];/)[1];
  assert.ok(!PROBLEMA.test(frequenti), 'js/home.js: «Le domande più frequenti» sono procedure; i problemi vanno in «Qualcosa non va?» (NON_VA)');
});
