// Come tools/confronta-copie.mjs cerca un numero di telefono nel testo di una copia (tests/cerca-numero.test.mjs).
// Cifre del numero, con separatori qualsiasi tra l'una e l'altra (spazi, punti, trattini, barre…).
// Nella pagina il numero può avere il prefisso dell'Italia attaccato: «+390656481» o «0039 06 56481».
export const cifre = (numero) => String(numero).replace(/\D/g, '');
export const regexNumero = (numero) => {
  const c = cifre(numero);
  return c ? new RegExp(`(?:(?<!\\d)|(?<=(?:\\+|(?<!\\d)00)39[^\\d\\n]{0,3}))${c.split('').join('[^\\d\\n]{0,3}')}(?!\\d)`) : null;
};
