// Email nascoste ai robot nelle pagine ufficiali (tools/email-nascoste.mjs, usato da tools/copie.mjs).
// Errore trovato il 22/10/2026: nelle copie del server c'era «[email protected]» al posto dell'indirizzo
// (Cloudflare: 123 copie in Sardegna, 3 in Calabria) e «Questo indirizzo email è protetto dagli spambots»
// (Joomla: URP e PEC delle USL toscane). tools/confronta-copie.mjs non poteva trovare PEC e email in quelle copie.
// Esempi fissi, scritti a mano: se il codice cambia, l'indirizzo deve uscire uguale.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cfDecode, svelaCloudflare, svelaJoomla, svelaEmail, entita } from '../tools/email-nascoste.mjs';

// «a@b.it» con la chiave 0x10: a=61^10=71, @=40^10=50, b=62^10=72, .=2e^10=3e, i=69^10=79, t=74^10=64.
const A_B_IT = '107150723e7964';
// «urp@aslsassari.it» con la chiave 0x42.
const URP = '423730320223312e3123313123302b6c2b36';

test('Cloudflare: il codice esadecimale torna l\'indirizzo', () => {
  assert.equal(cfDecode(A_B_IT), 'a@b.it');
  assert.equal(cfDecode(URP), 'urp@aslsassari.it');
  assert.equal(cfDecode('zz'), null);
  assert.equal(cfDecode('1'), null);
});

test('Cloudflare: [email protected] diventa l\'indirizzo, anche dentro un link', () => {
  const html = `<p>Email: <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="${URP}">[email&#160;protected]</a></p>`
    + `<p><a href="/cdn-cgi/l/email-protection#${A_B_IT}"><span class="__cf_email__" data-cfemail="${A_B_IT}">[email&#160;protected]</span></a></p>`
    + `<p><a href="https://www.aslsassari.it/cdn-cgi/l/email-protection#${URP}">Scrivi all'URP</a></p>`;
  const { html: out, trovate } = svelaCloudflare(html);
  assert.equal(trovate, 4);
  assert.doesNotMatch(out, /protected|cdn-cgi/);
  assert.match(out, /Email: urp@aslsassari\.it</);
  assert.match(out, /<a href="mailto:a@b\.it">a@b\.it<\/a>/); // già scritto nel testo del link: non si ripete
  assert.match(out, /<a href="mailto:urp@aslsassari\.it">Scrivi all'URP urp@aslsassari\.it<\/a>/);
});

test('Joomla 3: lo script con «addy» diventa l\'indirizzo', () => {
  const html = `<p>URP: <span id="cloak9f1c">Questo indirizzo email è protetto dagli spambots. È necessario abilitare JavaScript per vederlo.</span><script type='text/javascript'>
				document.getElementById('cloak9f1c').innerHTML = '';
				var prefix = '&#109;a' + 'i&#108;' + '&#116;o';
				var path = 'hr' + 'ef' + '=';
				var addy9f1c = 'urp' + '&#64;';
				addy9f1c = addy9f1c + 'uslcentro' + '&#46;' + 'toscana' + '&#46;' + 'it';
				var addy_text9f1c = 'urp' + '&#64;' + 'uslcentro' + '&#46;' + 'toscana' + '&#46;' + 'it';document.getElementById('cloak9f1c').innerHTML += '<a ' + path + '\\'' + prefix + ':' + addy9f1c + '\\'>'+addy_text9f1c+'<\\/a>';
		</script></p>`;
  const { html: out, trovate } = svelaJoomla(html);
  assert.equal(trovate, 1);
  assert.match(out, /urp@uslcentro\.toscana\.it/);
  assert.doesNotMatch(out, /<script/);
});

test('Joomla 1.5 e 2.5: document.write, testo del link diverso dall\'indirizzo', () => {
  const html = `PEC: <script type='text/javascript'>
 <!--
 var prefix = '&#109;a' + 'i&#108;' + '&#116;o';
 var path = 'hr' + 'ef' + '=';
 var addy71234 = 'protocollo' + '&#64;';
 addy71234 = addy71234 + 'postacert' + '&#46;' + 'uslnordovest' + '&#46;' + 'toscana' + '&#46;' + 'it';
 var addy_text71234 = 'PEC aziendale';
 document.write('<a ' + path + '\\'' + prefix + ':' + addy71234 + '\\'>');
 document.write(addy_text71234);
 document.write('<\\/a>');
 //-->\n </script><script type='text/javascript'>
 <!--
 document.write('<span style=\\'display: none;\\'>');
 //-->
 </script>Questo indirizzo email è protetto dagli spambots. È necessario abilitare JavaScript per vederlo.`;
  const { html: out, trovate } = svelaJoomla(html);
  assert.equal(trovate, 1);
  assert.match(out, /PEC aziendale protocollo@postacert\.uslnordovest\.toscana\.it/);
});

test('Joomla 4 e 5: <joomla-hidden-mail> in base64', () => {
  const b = (s) => Buffer.from(s).toString('base64');
  const html = `<p>Email: <joomla-hidden-mail is-link="1" is-email="1" first="${b('urp')}" last="${b('uslsudest.toscana.it')}" text="${b('urp@uslsudest.toscana.it')}" base="">Questo indirizzo email è protetto dagli spambots. È necessario abilitare JavaScript per vederlo.</joomla-hidden-mail></p>`
    + `<p><joomla-hidden-mail is-link="1" is-email="0" first="${b('pec.urp')}" last="${b('pec.uslsudest.toscana.it')}" text="${b('Scrivi alla PEC')}" base="">Questo indirizzo…</joomla-hidden-mail></p>`;
  const { html: out, trovate } = svelaJoomla(html);
  assert.equal(trovate, 2);
  assert.match(out, /Email: {1,2}urp@uslsudest\.toscana\.it /);
  assert.match(out, /Scrivi alla PEC pec\.urp@pec\.uslsudest\.toscana\.it/);
  assert.doesNotMatch(out, /joomla-hidden-mail/);
});

test('niente da svelare: la pagina resta uguale (anche uno script con «addy» senza indirizzo)', () => {
  const html = '<p>Telefono 0577 535111</p><script>var addy = cerca();</script><a href="mailto:urp@x.it">urp@x.it</a>';
  assert.deepEqual(svelaEmail(html), { html, trovate: 0 });
  // Un codice Cloudflare rotto non diventa testo a caso.
  const rotto = '<a class="__cf_email__" data-cfemail="4">[email&#160;protected]</a>';
  assert.equal(svelaEmail(rotto).html, rotto);
});

test('entità usate per nascondere @ e punto', () => {
  assert.equal(entita('urp&#64;asl&#x2E;it'), 'urp@asl.it');
  assert.equal(entita('urp&commat;asl&period;it'), 'urp@asl.it');
});
