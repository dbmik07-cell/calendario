/** @import { Archivio, DatiAgenda } from "../../src/nucleo/tipi.js" */

/**
 * @param {DatiAgenda} dati
 * @returns {Archivio}
 */
export function creaArchivioInMemoria(dati) {
  let salvati = structuredClone(dati);
  return {
    carica: () => structuredClone(salvati),
    salva: (nuovi) => {
      salvati = structuredClone(nuovi);
    },
  };
}
