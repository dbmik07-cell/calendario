import { mkdirSync, readFileSync, renameSync, watch, writeFileSync } from "node:fs";
import { basename, dirname } from "node:path";
import { datiVuoti } from "./nucleo/dati.js";

/** @import { Archivio, DatiAgenda } from "./nucleo/tipi.js" */

/**
 * Archivio che tiene l'Agenda in un file JSON.
 *
 * @param {string} percorso
 * @returns {Archivio & { osserva: (cambiato: () => void, riprovare?: () => boolean) => () => void }}
 */
export function creaArchivioSuFile(percorso) {
  /** @type {string | null | undefined} */
  let ultimaLettura;
  /** @type {string | null | undefined} */
  let ultimaOsservata;
  let utilizzabile = true;
  let esisteva = false;
  /** @returns {string | null} */
  function contenutoFile() {
    try { return readFileSync(percorso, "utf8"); }
    catch (errore) {
      if (/** @type {NodeJS.ErrnoException} */ (errore).code === "ENOENT") return null;
      throw errore;
    }
  }
  return {
    carica() {
      try {
        const contenuto = contenutoFile();
        ultimaOsservata = contenuto;
        if (contenuto === null && esisteva) throw new Error("Il file dell'Agenda è stato rimosso.");
        let dati;
        try {
          dati = contenuto === null ? datiVuoti() : /** @type {DatiAgenda} */ (JSON.parse(contenuto.replace(/^\uFEFF/, "")));
        } catch {
          throw new Error("Il file dell'Agenda contiene JSON non valido.");
        }
        ultimaLettura = contenuto;
        esisteva ||= contenuto !== null;
        utilizzabile = true;
        return dati;
      } catch (errore) { utilizzabile = false; throw errore; }
    },

    salva(dati) {
      if (!utilizzabile) throw new Error("Il file dell'Agenda non è leggibile: correggilo prima di salvare.");
      const attuale = contenutoFile();
      if (attuale !== (ultimaLettura ?? null)) throw new Error("Il file dell'Agenda è cambiato: ricaricalo prima di salvare.");
      // Scrittura atomica: un file a metà non sostituisce mai l'Agenda buona.
      mkdirSync(dirname(percorso), { recursive: true });
      const temporaneo = `${percorso}.tmp`;
      const contenuto = JSON.stringify(dati, null, 2);
      writeFileSync(temporaneo, contenuto, "utf8");
      renameSync(temporaneo, percorso);
      ultimaLettura = contenuto;
      ultimaOsservata = contenuto;
      esisteva = true;
    },

    osserva(cambiato, riprovare = () => false) {
      mkdirSync(dirname(percorso), { recursive: true });
      /** @type {ReturnType<typeof setTimeout> | undefined} */
      let attesa;
      function controlla() {
        try {
          const contenuto = contenutoFile();
          if (contenuto === ultimaOsservata && !riprovare()) return;
          ultimaOsservata = contenuto;
        } catch {
          ultimaOsservata = undefined;
          // Il Nucleo presenterà l'errore di lettura; una lettura successiva
          // deve poter recuperare anche se i byte sono rimasti identici.
        }
        cambiato();
      }
      // Osserva la cartella: gli editor spesso sostituiscono il file con rename.
      const osservatore = watch(dirname(percorso), (_evento, nome) => {
        if (nome !== null && nome.toString() !== basename(percorso)) return;
        clearTimeout(attesa);
        attesa = setTimeout(controlla, 150);
      });
      osservatore.on("error", controlla);
      // Recupera anche eventi persi o una cartella ricreata dopo una rimozione.
      const controllo = setInterval(controlla, 1000);
      return () => { clearTimeout(attesa); clearInterval(controllo); osservatore.close(); };
    },
  };
}
