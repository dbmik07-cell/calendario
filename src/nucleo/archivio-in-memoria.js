/** @import { Archivio, DatiAgenda } from "./tipi.js" */

/**
 * @param {DatiAgenda} dati
 * @returns {Archivio}
 */
export function creaArchivioInMemoria(dati) {
  return {
    carica: () => structuredClone(dati),
  };
}
