import { formattaData, giornoDi } from "./data-locale.js";
import { interpretaFrase } from "./frase.js";

/** @import { Archivio, Impegno, Orologio } from "./tipi.js" */

const ANTICIPO_PREDEFINITO_MINUTI = 15;

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
      return formattaData(orologio());
    },

    /** @param {string} data "YYYY-MM-DD" */
    giorno(data) {
      return {
        impegni: dati.impegni
          .filter((i) => giornoDi(i.inizio) === data)
          .sort((a, b) => a.inizio.localeCompare(b.inizio)),
      };
    },

    /** @param {string} frase */
    aggiungiDaTesto(frase) {
      const interpretata = interpretaFrase(frase, orologio());
      if (!interpretata.ok) return interpretata;

      /** @type {Impegno} */
      const impegno = {
        id: crypto.randomUUID(),
        titolo: interpretata.titolo,
        inizio: interpretata.inizio,
        anticipoMinuti: ANTICIPO_PREDEFINITO_MINUTI,
        promemoriaInviato: false,
      };
      dati.impegni.push(impegno);
      archivio.salva(dati);
      return /** @type {const} */ ({ ok: true, impegno });
    },
  };
}
