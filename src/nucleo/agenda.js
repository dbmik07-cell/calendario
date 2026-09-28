/** @import { Archivio, Orologio } from "./tipi.js" */

/**
 * Nucleo dell'Agenda: tutta la logica, senza Electron né DOM.
 *
 * @param {{ orologio: Orologio, archivio: Archivio }} dipendenze
 */
export function creaAgenda({ orologio, archivio }) {
  const dati = archivio.carica();

  return {
    /** @returns {string} La data locale di oggi, "YYYY-MM-DD". */
    oggi() {
      return dataLocale(orologio());
    },

    /** @param {string} data "YYYY-MM-DD" */
    giorno(data) {
      return {
        impegni: dati.impegni.filter((i) => i.inizio.slice(0, 10) === data),
      };
    },
  };
}

/** @param {Date} d */
function dataLocale(d) {
  const due = (/** @type {number} */ n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${due(d.getMonth() + 1)}-${due(d.getDate())}`;
}
