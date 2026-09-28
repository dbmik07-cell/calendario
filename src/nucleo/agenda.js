import { formattaData, giornoDi } from "./data-locale.js";
import { interpretaFrase } from "./frase.js";

/** @import { Archivio, CosaDaFare, Impegno, Orologio } from "./tipi.js" */

const ANTICIPO_PREDEFINITO_MINUTI = 15;

/** @typedef {{ ok: true } | { ok: false, errore: string }} Esito */

/**
 * Nucleo dell'Agenda: tutta la logica, senza Electron né DOM.
 *
 * @param {{ orologio: Orologio, archivio: Archivio }} dipendenze
 */
export function creaAgenda({ orologio, archivio }) {
  const dati = archivio.carica();

  /** @param {string} id */
  const trovaCosaDaFare = (id) => dati.coseDaFare.find((c) => c.id === id);
  /** @type {Esito} */
  const cosaDaFareNonTrovata = { ok: false, errore: "Questa Cosa da fare non c'è più." };

  return {
    /** @returns {string} La data locale di oggi, "YYYY-MM-DD". */
    oggi() {
      return formattaData(orologio());
    },

    /**
     * Impegni (in ordine di orario) e Cose da fare di un giorno.
     *
     * @param {string} data "YYYY-MM-DD"
     */
    giorno(data) {
      return {
        impegni: dati.impegni
          .filter((i) => giornoDi(i.inizio) === data)
          .sort((a, b) => a.inizio.localeCompare(b.inizio)),
        coseDaFare: dati.coseDaFare.filter((c) => c.giorno === data),
      };
    },

    /**
     * @param {string} frase
     * @returns {{ ok: true, impegno: Impegno } | { ok: true, cosaDaFare: CosaDaFare } | { ok: false, errore: string }}
     */
    aggiungiDaTesto(frase) {
      const interpretata = interpretaFrase(frase, orologio());
      if (!interpretata.ok) return interpretata;

      if (interpretata.tipo === "cosaDaFare") {
        /** @type {CosaDaFare} */
        const cosaDaFare = { id: crypto.randomUUID(), titolo: interpretata.titolo, giorno: interpretata.giorno, fatta: false };
        dati.coseDaFare.push(cosaDaFare);
        archivio.salva(dati);
        return { ok: true, cosaDaFare };
      }

      /** @type {Impegno} */
      const impegno = {
        id: crypto.randomUUID(),
        titolo: interpretata.titolo,
        inizio: interpretata.inizio,
        ...(interpretata.durataMinuti === undefined ? {} : { durataMinuti: interpretata.durataMinuti }),
        anticipoMinuti: ANTICIPO_PREDEFINITO_MINUTI,
        promemoriaInviato: false,
      };
      dati.impegni.push(impegno);
      archivio.salva(dati);
      return { ok: true, impegno };
    },

    /**
     * @param {string} id
     * @param {boolean} fatta
     * @returns {Esito}
     */
    segnaFatta(id, fatta) {
      const cosaDaFare = trovaCosaDaFare(id);
      if (!cosaDaFare) return cosaDaFareNonTrovata;
      cosaDaFare.fatta = fatta;
      archivio.salva(dati);
      return { ok: true };
    },

    /**
     * @param {string} id
     * @returns {Esito}
     */
    cancellaCosaDaFare(id) {
      const cosaDaFare = trovaCosaDaFare(id);
      if (!cosaDaFare) return cosaDaFareNonTrovata;
      dati.coseDaFare.splice(dati.coseDaFare.indexOf(cosaDaFare), 1);
      archivio.salva(dati);
      return { ok: true };
    },
  };
}
