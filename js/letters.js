// Modelli di lettera (testo semplice). Funzioni pure: niente pagina.
// TODO-VERIFY: ogni modello va approvato dal legale prima del lancio.
import { formatIt, art, daysBetween } from './engine.js';

// ---------- Aziende sanitarie e zone (docs/regioni.md, sezione 1 «Province e aziende») ----------
// Stanno qui, tra le funzioni pure delle lettere, perché servono alle lettere e ai test senza pagina.
//
// Una provincia può avere più aziende (Roma: 6 ASL; Napoli: 3) o un'azienda divisa in zone con uffici diversi.
// Allora l'azienda ha «sub_areas». Una zona può essere:
// - una frase («Messina – Taormina»): si legge e basta, non cambia la lettera (Messina, in Sicilia);
// - un oggetto con «id» e «label» (il testo del pulsante «In quale zona?») e i campi della lettera che valgono per
//   quella zona: name, nome_lettera, pec, emails, send_to, how_to, phones, contacts, scelta_medico… Questi campi
//   prendono il posto di quelli dell'azienda. Non cambiano mai «id» e «province».
// I moduli che scrivono all'azienda chiedono «In quale zona?» solo se c'è almeno una zona oggetto.

// Le zone che cambiano la lettera (le frasi restano fuori).
export function zoneLettera(a) {
  return a && Array.isArray(a.sub_areas) ? a.sub_areas.filter((z) => z && typeof z === 'object' && z.id) : [];
}

// Il nome di una zona per chi legge: la frase, oppure label (o name) dell'oggetto.
export function nomeZona(z) {
  if (typeof z === 'string') return z;
  return (z && (z.label || z.name)) || '';
}

// L'azienda con i campi della zona scelta al posto dei suoi. Zona sconosciuta o assente: l'azienda com'è.
const FISSI = ['id', 'province', 'provinces', 'sub_areas', 'label'];
export function conZona(a, zonaId) {
  if (!a || !zonaId) return a;
  const z = zoneLettera(a).find((x) => x.id === zonaId);
  if (!z) return a;
  const out = { ...a, zona: z };
  for (const [k, v] of Object.entries(z)) if (!FISSI.includes(k)) out[k] = v;
  return out;
}

// Come si scrive l'azienda in testa a una lettera. nome_lettera, se c'è (il nome ufficiale: «USL Umbria 2»,
// «Azienda USL della Valle d'Aosta»); se no la parola della regione + «di» + provincia
// (Sicilia: «Azienda Sanitaria Provinciale di Palermo»).
export function intestazioneDi(a, parola) {
  if (!a) return '';
  return a.nome_lettera || `${parola} di ${a.province}`;
}

const blank = (v, placeholder = '__________') => (v && String(v).trim()) || placeholder;

function personBlock(p) {
  return `Il/La sottoscritto/a ${blank(p.fullName)}, nato/a ${/^\s*a/i.test(p.birthPlace || '') ? 'ad' : 'a'} ${blank(p.birthPlace)} ${art('il', p.birthDate)}${p.birthDate ? formatIt(p.birthDate) : '__________'}, ` +
    `codice fiscale ${blank(p.cf)},${p.idDoc && String(p.idDoc).trim() ? ` documento di identità ${String(p.idDoc).trim()},` : ''} residente in ${blank(p.address)}, tel. ${blank(p.phone)}, email ${blank(p.email)},` +
    (p.pec && String(p.pec).trim() ? ` PEC ${String(p.pec).trim()},` : '');
}

// Chi scrive per un'altra persona. Tre casi, con firma e allegati diversi:
// - delegato: la persona firma una delega;
// - genitore di un minore: firma come genitore (artt. 316 e 320 c.c.), nessuna delega;
// - tutore o amministratore di sostegno: firma in quel ruolo e allega il decreto di nomina.
//   Il curatore assiste la persona ma non firma per lei (codice civile): non c'è tra le scelte
//   (art. 357 c.c. per il tutore; artt. 404-405 c.c., L. 6/2004, per l'amministratore di sostegno).
const GUARDIANS = { tutore: 'tutore', amministratore: 'amministratore di sostegno' };
export function delegateRole(p = {}) {
  if (!p.isDelegate) return null;
  if (p.delegateRole === 'genitore') return 'genitore';
  if (p.delegateRole === 'tutore') return 'tutore';
  return 'delegato';
}
const guardianName = (p) => GUARDIANS[p.guardianKind] || GUARDIANS.amministratore;

function delegateBlock(p) {
  const role = delegateRole(p);
  if (!role) return '';
  const who = `\nLa presente è presentata da ${blank(p.delegateName)}, codice fiscale ${blank(p.delegateCf)}, `;
  if (role === 'genitore') {
    return `${who}in qualità di genitore esercente la responsabilità genitoriale per il/la figlio/a minore sopra indicato/a ` +
      `(artt. 316 e 320 c.c.), con copia del documento di identità del genitore.\n`;
  }
  if (role === 'tutore') {
    return `${who}in qualità di ${guardianName(p)} dell'assistito/a, nominato/a con decreto ${blank(p.decreeRef, 'del Tribunale di __________ n. ______ del __________')}, ` +
      `come da copia del decreto di nomina allegata, con copia dei documenti di identità di entrambi.\n`;
  }
  return `${who}in qualità di delegato/a dell'assistito/a, come da delega allegata con copia dei documenti di identità di entrambi.\n`;
}

// L'allegato in più per chi scrive per un'altra persona ('' se scrive per sé).
export function delegateAttachment(p = {}) {
  const role = delegateRole(p);
  if (role === 'genitore') return 'documento di identità del genitore';
  if (role === 'tutore') return 'copia del decreto di nomina e documento di identità di chi firma';
  if (role === 'delegato') return 'delega e documento del delegato';
  return '';
}
const extra = (p) => (delegateAttachment(p) ? `; ${delegateAttachment(p)}` : '');

// Luogo e data, poi la firma con sotto chi firma: la persona o chi scrive per lei, con il suo ruolo.
const ROLE_NAMES = { delegato: 'delegato/a', genitore: 'genitore' };
const SIGN_INDENT = ' '.repeat(30);
function signature(p, today) {
  const role = delegateRole(p);
  const who = role
    ? `Firma di ${blank(p.delegateName)} (${ROLE_NAMES[role] || guardianName(p)})\n${SIGN_INDENT}______________________`
    : `Firma ______________________${p.fullName && String(p.fullName).trim() ? `\n${SIGN_INDENT}${String(p.fullName).trim()}` : ''}`;
  return `${blank(p.city, '[luogo]')}, ${formatIt(today)}\n\n${SIGN_INDENT}${who}`;
}

// Modulo 1 — richiesta di attivazione del percorso di tutela (SPEC sezione 7).
// intestazione: il nome dell'azienda in testa alla lettera (intestazioneAzienda() in js/flow.js); se manca,
// ente + «di» + aspName («Azienda Sanitaria Provinciale di Palermo»).
// deadline: fine del tempo massimo (prenotazione + maxDays); callbackDays/callbackDeadline: richiamo del PNGLA
// quando il CUP non dà una data (non per la classe U); prescriptionDate: data della ricetta, se nota.
export function tutelaLetter({ intestazione, ente = 'Azienda Sanitaria Provinciale', aspName, aspAddress, person: p, service, nre, cls, maxDays, bookingDate, appointmentDate, noDateOffered, requestDate, prescriptionDate, deadline, callbackDays, callbackDeadline, today }) {
  const term = (d) => (today && daysBetween(d, today) >= 0 ? `termine scaduto ${art('il', d)}${formatIt(d)}` : `termine che scade ${art('il', d)}${formatIt(d)}`);
  const callback = cls === 'U' || !requestDate ? ''
    : !callbackDays ? ', né è stato/a ricontattato/a entro il termine previsto'
    : `, né è stato/a ricontattato/a entro i ${callbackDays} giorni previsti dal PNGLA per la classe ${cls}${callbackDeadline ? ` (${term(callbackDeadline)})` : ''}`;
  const booking = noDateOffered
    ? `- in data ${requestDate ? formatIt(requestDate) : '__________'} ha richiesto la prenotazione tramite i canali ufficiali e non gli/le è stata proposta alcuna data${callback};`
    : `- in data ${formatIt(bookingDate)} ha richiesto la prenotazione tramite i canali ufficiali e la prima disponibilità proposta è ${art('il', appointmentDate)}${formatIt(appointmentDate)}, oltre il tempo massimo previsto${deadline ? ` (${term(deadline)})` : ''};`;
  const attach = 'copia del documento di identità; ricetta; foglio/promemoria di prenotazione' +
    extra(p);
  return `Spett.le ${intestazione || `${ente} di ${aspName}`}
${aspAddress || ''}

Oggetto: Richiesta di attivazione del percorso di tutela – "${blank(service)}", ricetta n. ${blank(nre)}, classe ${cls} (prestazione di primo accesso; Piano Nazionale di Governo delle Liste d'Attesa 2026-2028; D.Lgs. 124/1998, art. 3, commi 10 e 13)

${personBlock(p)}

PREMESSO CHE
- gli/le è stata prescritta la prestazione di primo accesso "${blank(service)}" (ricetta n. ${blank(nre)}${prescriptionDate ? ` ${art('del', prescriptionDate)}${formatIt(prescriptionDate)}` : ''}) con classe di priorità ${cls}, che prevede un tempo massimo di attesa di ${maxDays} giorni;
${booking}

CHIEDE
l'attivazione del percorso di tutela affinché la prestazione sia erogata entro i tempi massimi previsti dalla classe di priorità indicata e, in caso di indisponibilità di strutture pubbliche o accreditate, in regime di attività libero-professionale intramuraria con il solo pagamento del ticket, ove dovuto.
${delegateBlock(p)}
Allega: ${attach}.

${signature(p, today)}
`;
}

// Modulo 1 — sollecito se l'ASP non risponde.
export function tutelaReminder({ intestazione, ente = 'Azienda Sanitaria Provinciale', aspName, aspAddress, person: p, service, nre, cls, firstRequestDate, protocol, today }) {
  return `Spett.le ${intestazione || `${ente} di ${aspName}`}
${aspAddress || ''}

Oggetto: SOLLECITO – Richiesta di attivazione del percorso di tutela ${art('del', firstRequestDate)}${firstRequestDate ? formatIt(firstRequestDate) : '__________'} (prestazione "${blank(service)}", ricetta n. ${blank(nre)}, classe di priorità ${cls})

${personBlock(p)}

in data ${firstRequestDate ? formatIt(firstRequestDate) : '__________'} ha chiesto l'attivazione del percorso di tutela per la prestazione sopra indicata (protocollo n. ${blank(protocol, '___')}). Alla data odierna non ha ricevuto risposta né proposta di appuntamento entro i tempi massimi previsti.

SOLLECITA
un riscontro nel più breve tempo possibile e l'erogazione della prestazione secondo quanto previsto dal Piano Nazionale di Governo delle Liste d'Attesa 2026-2028 ovvero, in mancanza, l'erogazione in regime libero-professionale intramurario con il solo pagamento del ticket (D.Lgs. 124/1998, art. 3, c. 13).
${delegateBlock(p)}
Allega: copia della richiesta ${art('del', firstRequestDate)}${firstRequestDate ? formatIt(firstRequestDate) : '__________'} e relativi allegati${extra(p)}.

${signature(p, today)}
`;
}

// Modulo 2 — sollecito all'INPS quando la visita di invalidità non arriva.
// category: 'oncological' | 'minor' | 'other' (dice perché vale il termine di legge).
export function inpsReminder({ provinceName, inpsPec, person: p, certNumber, certDate, domandaDate, domandaNumber, regime, category, deadlineInfo, today }) {
  const premise = regime === 'new'
    ? `- in data ${formatIt(certDate)} è stato trasmesso all'INPS il certificato medico introduttivo n. ${blank(certNumber)}, che ai sensi del D.Lgs. 62/2024 costituisce domanda di accertamento;`
    : `- in data ${formatIt(certDate)} è stato trasmesso all'INPS il certificato medico introduttivo n. ${blank(certNumber)} e in data ${domandaDate ? formatIt(domandaDate) : '__________'} è stata presentata la relativa domanda (n. ${blank(domandaNumber)});`;
  const why = category === 'oncological' ? ' trattandosi di persona con patologia oncologica, come indicato nel certificato,'
    : category === 'minor' && regime === 'new' ? ' trattandosi di minore,' : '';
  const what = regime === 'new'
    ? `il procedimento di valutazione di base doveva concludersi entro ${deadlineInfo.days} giorni dalla trasmissione del certificato, e non è stata comunicata alcuna sospensione per integrazione documentale`
    : `la visita doveva svolgersi entro ${deadlineInfo.days} giorni dalla domanda`;
  // Senza base di legge (vecchia procedura ordinaria) i 30 giorni sono indicativi: si dice solo quanto tempo è passato.
  const elapsed = domandaDate && today ? daysBetween(domandaDate, today) : null;
  const term = deadlineInfo.legal
    ? `- ai sensi dell'${deadlineInfo.legal},${why} ${what}, cioè entro ${art('il', deadlineInfo.deadline)}${formatIt(deadlineInfo.deadline)};\n- alla data odierna non è pervenuta alcuna convocazione a visita;`
    : `- sono trascorsi ${elapsed !== null && elapsed > deadlineInfo.days ? elapsed : `oltre ${deadlineInfo.days}`} giorni dalla presentazione della domanda senza che sia pervenuta alcuna convocazione;`;
  const attach = 'copia del documento di identità; ricevuta di trasmissione del certificato medico' +
    (regime === 'old' ? '; ricevuta della domanda' : '') +
    extra(p);
  return `Spett.le INPS – Direzione provinciale di ${provinceName}
${inpsPec || ''}

Oggetto: Sollecito convocazione a visita per accertamento sanitario (invalidità civile / handicap) – certificato medico n. ${blank(certNumber)} ${art('del', certDate)}${formatIt(certDate)}

${personBlock(p)}

PREMESSO CHE
${premise}
${term}

SOLLECITA
la convocazione a visita nel più breve tempo possibile e chiede di essere informato/a sullo stato della pratica.
${delegateBlock(p)}
Allega: ${attach}.

${signature(p, today)}
`;
}

const MAILTO_TO = /^[^\s@?&#%,;<>"]+@[^\s@?&#%,;<>"]+(,[^\s@?&#%,;<>"]+@[^\s@?&#%,;<>"]+)*$/;
export function mailtoHref(to, subject, body) {
  // L'indirizzo deve restare corto per le app di posta del telefono; testi troppo lunghi vengono tolti.
  const maxBody = 1800;
  const b = body && body.length > maxBody ? '' : body;
  const params = [`subject=${encodeURIComponent(subject)}`];
  if (b) params.push(`body=${encodeURIComponent(b)}`);
  // Solo indirizzi semplici (anche più d'uno, separati da virgola): un indirizzo scritto da chi usa il sito
  // non deve aggiungere destinatari o campi («?cc=», «&bcc=») né spezzare il link (audit di sicurezza, giro 6).
  const t = String(to || '').trim();
  const addr = MAILTO_TO.test(t) ? t : '';
  return `mailto:${addr}?${params.join('&')}`;
}

// Modulo 3 — sollecito per la copia della cartella clinica o dei referti.
// «copia della cartella clinica», «copia dei referti o delle immagini», «copia di documenti sanitari».
function copyOf(what) {
  const w = (what && String(what).trim()) || 'cartella clinica';
  if (/^cartella/i.test(w)) return { text: `della ${w}`, rel: 'relativa' };
  if (/^referti o immagini$/i.test(w)) return { text: 'dei referti o delle immagini', rel: 'relativi' };
  return { text: `di ${w}`, rel: /^(referti|documenti)/i.test(w) ? 'relativi' : 'relativa' };
}

export function cartellaReminder({ structure, address, person: p, requestDate, protocol, what, episode, deadline, days = 7, integrationDays = 30, today }) {
  const c = copyOf(what);
  return `Spett.le ${blank(structure, 'Direzione Sanitaria di __________')}
${address || ''}

Oggetto: SOLLECITO – Richiesta di copia ${c.text} presentata ${art('il', requestDate)}${requestDate ? formatIt(requestDate) : '__________'} (art. 4, comma 2, L. 24/2017)

${personBlock(p)}

PREMESSO CHE
- in data ${requestDate ? formatIt(requestDate) : '__________'} ha chiesto copia ${c.text} ${c.rel} a ${blank(episode, '____________ (periodo e reparto)')}${protocol ? ` (ricevuta/protocollo n. ${protocol})` : ''};
- ai sensi dell'art. 4, comma 2, della L. 24/2017 la direzione sanitaria fornisce la documentazione sanitaria disponibile entro ${days} giorni dalla richiesta, cioè entro ${art('il', deadline)}${deadline ? formatIt(deadline) : '__________'}, e le eventuali integrazioni entro ${integrationDays} giorni;
- alla data odierna non ha ricevuto quanto richiesto né alcuna comunicazione;

SOLLECITA
la consegna della documentazione richiesta nel più breve tempo possibile e chiede di essere informato/a per iscritto su data e modalità di ritiro. Chiede inoltre, per i propri dati personali, che la prima copia sia rilasciata gratuitamente, ai sensi dell'art. 15 del Regolamento UE 2016/679 (GDPR).
${delegateBlock(p)}
Allega: copia del documento di identità; copia della richiesta ${art('del', requestDate)}${requestDate ? formatIt(requestDate) : '__________'}${extra(p)}.

${signature(p, today)}
`;
}

// Modulo 4 — sollecito all'ASP per l'autorizzazione di un ausilio o di una protesi.
export function ausiliReminder({ intestazione, ente = 'Azienda Sanitaria Provinciale', aspName, address, person: p, device, requestDate, protocol, prescriber, deadline, days = 20, today }) {
  return `Spett.le ${intestazione || `${ente} di ${aspName}`}
Ufficio Assistenza Protesica
${address || ''}

Oggetto: SOLLECITO – Autorizzazione alla fornitura di ${blank(device, 'ausilio/protesi')} richiesta ${art('il', requestDate)}${requestDate ? formatIt(requestDate) : '__________'} (DPCM 12/01/2017, allegato 12, e disposizioni regionali sull'assistenza protesica)

${personBlock(p)}

PREMESSO CHE
- in data ${requestDate ? formatIt(requestDate) : '__________'} ha presentato richiesta di autorizzazione alla fornitura di ${blank(device, 'ausilio/protesi')}, su prescrizione ${prescriber ? `di ${String(prescriber).trim()}` : 'dello specialista del Servizio sanitario'}${protocol ? ` (ricevuta/protocollo n. ${protocol})` : ''};
- ai sensi del DPCM 12/01/2017 (allegato 12) il tempo massimo per l'autorizzazione è fissato dalla Regione, e secondo le disposizioni regionali sull'assistenza protesica l'autorizzazione va rilasciata entro ${days} giorni dalla richiesta (in Sicilia: direttive regionali sul DM 332/1999), cioè entro ${art('il', deadline)}${deadline ? formatIt(deadline) : '__________'};
- alla data odierna non ha ricevuto l'autorizzazione né alcuna comunicazione;

CHIEDE
che, decorso il termine, l'autorizzazione sia rilasciata senza ulteriore ritardo e sia avviata la fornitura, con indicazione del fornitore e dei tempi di consegna.
${delegateBlock(p)}
Allega: copia del documento di identità; copia della prescrizione e della richiesta ${art('del', requestDate)}${requestDate ? formatIt(requestDate) : '__________'}${extra(p)}.

${signature(p, today)}
`;
}

// Il nome del medico come va nella lettera: «dott.» davanti, se chi scrive non ha già messo un titolo
// («dott.ssa Anna Bianchi», «Dr. Rossi», «prof. Verdi»): il titolo non si ripete (audit del 22/10/2026, giro 8).
const TITLE = /^(dott|dr|prof)(\.?ssa)?(\.\s*|\s+)/i;
export function doctorName(name) {
  const n = String(name || '').trim();
  if (!n) return '';
  return TITLE.test(n) ? n : `dott. ${n}`;
}

// Il distretto nell'intestazione: «Distretto – Bagheria», ma «Distretto di Bagheria» resta com'è
// (la parola «Distretto» non si ripete).
export function districtLine(district) {
  const d = String(district || '').trim();
  if (!d) return '';
  return /^distretto/i.test(d) ? d : `Distretto – ${d}`;
}

// Richiesta o sollecito generico a un ufficio (distretto, PUA, rete cure palliative).
export function genericRequest({ to, address, subject, person: p, premise = [], request, attachments = [], today }) {
  const att = [...attachments, ...(delegateAttachment(p) ? [delegateAttachment(p)] : [])];
  return `Spett.le ${blank(to, '__________')}
${address || ''}

Oggetto: ${subject}

${personBlock(p)}

PREMESSO CHE
${premise.map((l) => `- ${l};`).join('\n')}

CHIEDE
${request}
${delegateBlock(p)}
Allega: ${att.length ? att.join('; ') : 'copia del documento di identità'}.

${signature(p, today)}
`;
}
