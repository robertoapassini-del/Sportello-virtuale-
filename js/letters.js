// Modelli di lettera (testo semplice). Funzioni pure: niente pagina.
// TODO-VERIFY: ogni modello va approvato dal legale prima del lancio.
import { formatIt, art } from './engine.js';

const blank = (v, placeholder = '__________') => (v && String(v).trim()) || placeholder;

function personBlock(p) {
  return `Il/La sottoscritto/a ${blank(p.fullName)}, nato/a a ${blank(p.birthPlace)} ${art('il', p.birthDate)}${p.birthDate ? formatIt(p.birthDate) : '__________'}, ` +
    `codice fiscale ${blank(p.cf)},\nresidente in ${blank(p.address)}, tel. ${blank(p.phone)}, email ${blank(p.email)},`;
}

function delegateBlock(p) {
  if (!p.isDelegate) return '';
  return `\nLa presente è presentata da ${blank(p.delegateName)}, codice fiscale ${blank(p.delegateCf)}, ` +
    `in qualità di delegato/a dell'assistito/a, come da delega allegata con copia dei documenti di identità di entrambi.\n`;
}

function signature(p, today) {
  return `${blank(p.city, '[luogo]')}, ${formatIt(today)}                                   Firma ______________________`;
}

// Modulo 1 — richiesta di attivazione del percorso di tutela (SPEC sezione 7).
export function tutelaLetter({ ente = 'Azienda Sanitaria Provinciale', aspName, aspAddress, person: p, service, nre, cls, maxDays, bookingDate, appointmentDate, noDateOffered, requestDate, today }) {
  const booking = noDateOffered
    ? `- in data ${requestDate ? formatIt(requestDate) : '__________'} ha richiesto la prenotazione tramite i canali ufficiali e non gli/le è
  stata proposta alcuna data, né è stato/a ricontattato/a entro il termine previsto;`
    : `- in data ${formatIt(bookingDate)} ha richiesto la prenotazione tramite i canali ufficiali e la prima
  disponibilità proposta è ${art('il', appointmentDate)}${formatIt(appointmentDate)}, oltre il tempo massimo previsto;`;
  const attach = 'copia del documento di identità; ricetta; foglio/promemoria di prenotazione' +
    (p.isDelegate ? '; delega e documento del delegato' : '');
  return `Spett.le ${ente} di ${aspName}
${aspAddress || ''}

Oggetto: Richiesta di attivazione del percorso di tutela per prestazione di primo accesso
(Piano Nazionale di Governo delle Liste d'Attesa 2026-2028; D.Lgs. 124/1998, art. 3, commi 10 e 13)

${personBlock(p)}

PREMESSO CHE
- gli/le è stata prescritta la prestazione di primo accesso "${blank(service)}"
  (ricetta n. ${blank(nre)}) con classe di priorità ${cls}, che prevede un tempo massimo di attesa
  di ${maxDays} giorni;
${booking}

CHIEDE
l'attivazione del percorso di tutela affinché la prestazione sia erogata entro i tempi massimi
previsti dalla classe di priorità indicata e, in caso di indisponibilità di strutture pubbliche o
accreditate, in regime di attività libero-professionale intramuraria con il solo pagamento del
ticket, ove dovuto.
${delegateBlock(p)}
Allega: ${attach}.

${signature(p, today)}
`;
}

// Modulo 1 — sollecito se l'ASP non risponde.
export function tutelaReminder({ ente = 'Azienda Sanitaria Provinciale', aspName, aspAddress, person: p, service, nre, cls, firstRequestDate, today }) {
  return `Spett.le ${ente} di ${aspName}
${aspAddress || ''}

Oggetto: SOLLECITO – Richiesta di attivazione del percorso di tutela ${art('del', firstRequestDate)}${firstRequestDate ? formatIt(firstRequestDate) : '__________'}
(prestazione "${blank(service)}", ricetta n. ${blank(nre)}, classe di priorità ${cls})

${personBlock(p)}

in data ${firstRequestDate ? formatIt(firstRequestDate) : '__________'} ha chiesto l'attivazione del percorso di tutela per la
prestazione sopra indicata. Alla data odierna non ha ricevuto risposta né proposta di appuntamento
entro i tempi massimi previsti.

SOLLECITA
un riscontro nel più breve tempo possibile e l'erogazione della prestazione secondo quanto previsto
dal Piano Nazionale di Governo delle Liste d'Attesa 2026-2028.
${delegateBlock(p)}
Allega: copia della richiesta ${art('del', firstRequestDate)}${firstRequestDate ? formatIt(firstRequestDate) : '__________'} e relativi allegati.

${signature(p, today)}
`;
}

// Modulo 2 — sollecito all'INPS quando la visita di invalidità non arriva.
export function inpsReminder({ provinceName, inpsPec, person: p, certNumber, certDate, domandaDate, domandaNumber, regime, deadlineInfo, today }) {
  const premise = regime === 'new'
    ? `- in data ${formatIt(certDate)} è stato trasmesso all'INPS il certificato medico introduttivo n. ${blank(certNumber)},\n  che ai sensi del D.Lgs. 62/2024 costituisce domanda di accertamento;`
    : `- in data ${formatIt(certDate)} è stato trasmesso all'INPS il certificato medico introduttivo n. ${blank(certNumber)}\n  e in data ${domandaDate ? formatIt(domandaDate) : '__________'} è stata presentata la relativa domanda (n. ${blank(domandaNumber)});`;
  const term = deadlineInfo.legal
    ? `- ai sensi dell'${deadlineInfo.legal}, la visita/il procedimento doveva svolgersi entro ${deadlineInfo.days} giorni,\n  cioè entro ${art('il', deadlineInfo.deadline)}${formatIt(deadlineInfo.deadline)};`
    : `- secondo i tempi indicati dalla normativa vigente, la convocazione era attesa entro ${art('il', deadlineInfo.deadline)}${formatIt(deadlineInfo.deadline)};`;
  const attach = 'copia del documento di identità; ricevuta di trasmissione del certificato medico' +
    (regime === 'old' ? '; ricevuta della domanda' : '') +
    (p.isDelegate ? '; delega e documento del delegato' : '');
  return `Spett.le INPS – Direzione provinciale di ${provinceName}
${inpsPec || ''}

Oggetto: Sollecito convocazione a visita per accertamento sanitario (invalidità civile / handicap)
– certificato medico n. ${blank(certNumber)} ${art('del', certDate)}${formatIt(certDate)}

${personBlock(p)}

PREMESSO CHE
${premise}
${term}
- alla data odierna non è pervenuta alcuna convocazione a visita;

SOLLECITA
la convocazione a visita nel più breve tempo possibile e chiede di essere informato/a sullo
stato della pratica.
${delegateBlock(p)}
Allega: ${attach}.

${signature(p, today)}
`;
}

export function mailtoHref(to, subject, body) {
  // L'indirizzo deve restare corto per le app di posta del telefono; testi troppo lunghi vengono tolti.
  const maxBody = 1800;
  const b = body && body.length > maxBody ? '' : body;
  const params = [`subject=${encodeURIComponent(subject)}`];
  if (b) params.push(`body=${encodeURIComponent(b)}`);
  return `mailto:${to || ''}?${params.join('&')}`;
}

// Modulo 3 — sollecito per la copia della cartella clinica o dei referti.
export function cartellaReminder({ structure, address, person: p, requestDate, protocol, what, episode, deadline, days = 7, integrationDays = 30, today }) {
  return `Spett.le ${blank(structure, 'Direzione Sanitaria di __________')}
${address || ''}

Oggetto: SOLLECITO – Richiesta di copia di ${blank(what, 'cartella clinica')} presentata ${art('il', requestDate)}${requestDate ? formatIt(requestDate) : '__________'}
(art. 4, comma 3, L. 24/2017)

${personBlock(p)}

PREMESSO CHE
- in data ${requestDate ? formatIt(requestDate) : '__________'} ha chiesto copia di ${blank(what, 'cartella clinica')}${episode ? ` relativa a ${episode}` : ''}${protocol ? ` (ricevuta/protocollo n. ${protocol})` : ''};
- ai sensi dell'art. 4, comma 3, della L. 24/2017 la direzione sanitaria fornisce la documentazione sanitaria disponibile
  entro ${days} giorni dalla richiesta, cioè entro ${art('il', deadline)}${deadline ? formatIt(deadline) : '__________'}, e le eventuali integrazioni entro ${integrationDays} giorni;
- alla data odierna non ha ricevuto quanto richiesto né alcuna comunicazione;

SOLLECITA
la consegna della documentazione richiesta nel più breve tempo possibile e chiede di essere informato/a
per iscritto su data e modalità di ritiro, nonché sull'eventuale costo di riproduzione.
${delegateBlock(p)}
Allega: copia del documento di identità; copia della richiesta ${art('del', requestDate)}${requestDate ? formatIt(requestDate) : '__________'}${p.isDelegate ? '; delega e documento del delegato' : ''}.

${signature(p, today)}
`;
}

// Modulo 4 — sollecito all'ASP per l'autorizzazione di un ausilio o di una protesi.
export function ausiliReminder({ ente = 'Azienda Sanitaria Provinciale', aspName, address, person: p, device, requestDate, protocol, prescriber, deadline, days = 20, today }) {
  return `Spett.le ${ente} di ${aspName}
Ufficio Assistenza Protesica
${address || ''}

Oggetto: SOLLECITO – Autorizzazione alla fornitura di ${blank(device, 'ausilio/protesi')} richiesta ${art('il', requestDate)}${requestDate ? formatIt(requestDate) : '__________'}
(art. 18 DPCM 12/01/2017 e disposizioni regionali sull'assistenza protesica)

${personBlock(p)}

PREMESSO CHE
- in data ${requestDate ? formatIt(requestDate) : '__________'} ha presentato richiesta di autorizzazione alla fornitura di ${blank(device, 'ausilio/protesi')},
  su prescrizione ${prescriber ? `del/della ${prescriber}` : 'dello specialista del Servizio sanitario'}${protocol ? ` (ricevuta/protocollo n. ${protocol})` : ''};
- ai sensi dell'art. 18 del DPCM 12/01/2017 il tempo massimo per l'autorizzazione è fissato dalla Regione, e secondo le disposizioni regionali
  sull'assistenza protesica l'autorizzazione va rilasciata entro ${days} giorni dalla richiesta, cioè entro ${art('il', deadline)}${deadline ? formatIt(deadline) : '__________'},
  e, decorso tale termine senza risposta, si intende concessa;
- alla data odierna non ha ricevuto l'autorizzazione né alcuna comunicazione;

CHIEDE
il rilascio immediato dell'autorizzazione (o la conferma che si è formata per silenzio-assenso) e l'avvio della fornitura,
con indicazione del fornitore e dei tempi di consegna.
${delegateBlock(p)}
Allega: copia del documento di identità; copia della prescrizione e della richiesta ${art('del', requestDate)}${requestDate ? formatIt(requestDate) : '__________'}${p.isDelegate ? '; delega e documento del delegato' : ''}.

${signature(p, today)}
`;
}

// Richiesta o sollecito generico a un ufficio (distretto, PUA, rete cure palliative).
export function genericRequest({ to, address, subject, person: p, premise = [], request, attachments = [], today }) {
  const att = [...attachments, ...(p.isDelegate ? ['delega e documento del delegato'] : [])];
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
