import { existsSync, readFileSync } from "node:fs";

/** @import { Archivio, DatiAgenda } from "./nucleo/tipi.js" */

/**
 * Archivio che tiene l'Agenda in un file JSON.
 *
 * @param {string} percorso
 * @returns {Archivio}
 */
export function creaArchivioSuFile(percorso) {
  return {
    carica() {
      if (!existsSync(percorso)) return { versione: 1, impegni: [], coseDaFare: [] };
      return /** @type {DatiAgenda} */ (JSON.parse(readFileSync(percorso, "utf8")));
    },
  };
}
