// Date e orari locali come stringhe: "YYYY-MM-DD" per un giorno,
// "YYYY-MM-DDTHH:MM" per l'inizio di un Impegno. Niente fusi orari.

/** @param {number} n */
const due = (n) => String(n).padStart(2, "0");

/** @param {Date} d @returns {string} "YYYY-MM-DD" */
export function formattaData(d) {
  return `${d.getFullYear()}-${due(d.getMonth() + 1)}-${due(d.getDate())}`;
}

/** @param {Date} d @returns {string} "YYYY-MM-DDTHH:MM" */
export function formattaInizio(d) {
  return `${formattaData(d)}T${due(d.getHours())}:${due(d.getMinutes())}`;
}

/** @param {string} data "YYYY-MM-DD" o "YYYY-MM-DDTHH:MM" @returns {Date} ora locale */
export function leggiData(data) {
  const [a, m, g, ore = 0, minuti = 0] = data.split(/[-T:]/).map(Number);
  return new Date(a, m - 1, g, ore, minuti);
}

/** @param {string} inizio "YYYY-MM-DDTHH:MM" @returns {string} "YYYY-MM-DD" */
export const giornoDi = (inizio) => inizio.slice(0, 10);

/** @param {string} inizio "YYYY-MM-DDTHH:MM" @returns {string} "HH:MM" */
export const orarioDi = (inizio) => inizio.slice(11, 16);

/**
 * @param {string} inizio "YYYY-MM-DDTHH:MM"
 * @param {number} minuti
 * @returns {string} "YYYY-MM-DDTHH:MM"
 */
export function aggiungiMinuti(inizio, minuti) {
  const d = leggiData(inizio);
  d.setMinutes(d.getMinutes() + minuti);
  return formattaInizio(d);
}
