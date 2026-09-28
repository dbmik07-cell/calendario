import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

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

    salva(dati) {
      // Scrittura atomica: un file a metà non sostituisce mai l'Agenda buona.
      mkdirSync(dirname(percorso), { recursive: true });
      const temporaneo = `${percorso}.tmp`;
      writeFileSync(temporaneo, JSON.stringify(dati, null, 2), "utf8");
      renameSync(temporaneo, percorso);
    },
  };
}
