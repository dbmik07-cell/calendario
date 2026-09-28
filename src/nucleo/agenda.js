import { aggiungiMinuti, formattaData, formattaInizio, giornoDi, leggiData } from "./data-locale.js";
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
    /**
     * null rimuove la durata; i campi omessi mantengono il valore corrente.
     * @param {string} id
     * @param {{ titolo?: string, inizio?: string, durataMinuti?: number | null, anticipoMinuti?: number | null }} modifiche
     * @returns {Esito}
     */
    modificaImpegno(id, modifiche) {
      const indice = dati.impegni.findIndex((i) => i.id === id);
      if (indice < 0) return { ok: false, errore: "Questo Impegno non c'è più." };
      const precedente = dati.impegni[indice];
      const nuovo = { ...precedente };
      if (modifiche.titolo !== undefined) nuovo.titolo = modifiche.titolo.trim();
      if (modifiche.inizio !== undefined) nuovo.inizio = modifiche.inizio;
      if (modifiche.anticipoMinuti !== undefined) nuovo.anticipoMinuti = modifiche.anticipoMinuti;
      if (modifiche.durataMinuti === null) delete nuovo.durataMinuti;
      else if (modifiche.durataMinuti !== undefined) nuovo.durataMinuti = modifiche.durataMinuti;
      if (!nuovo.titolo) return { ok: false, errore: "Il titolo non può essere vuoto." };
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(nuovo.inizio) || formattaInizio(leggiData(nuovo.inizio)) !== nuovo.inizio) {
        return { ok: false, errore: "Data o orario non validi." };
      }
      if (nuovo.durataMinuti !== undefined && (!Number.isSafeInteger(nuovo.durataMinuti) || nuovo.durataMinuti <= 0)) {
        return { ok: false, errore: "La durata deve essere un numero intero positivo di minuti." };
      }
      if (nuovo.anticipoMinuti !== null && (!Number.isSafeInteger(nuovo.anticipoMinuti) || nuovo.anticipoMinuti < 0)) {
        return { ok: false, errore: "L'Anticipo deve essere un numero intero di minuti, almeno zero." };
      }
      const inizioMs = leggiData(nuovo.inizio).getTime();
      if (!Number.isFinite(new Date(inizioMs + (nuovo.durataMinuti ?? 0) * 60_000).getTime()) ||
          !Number.isFinite(new Date(inizioMs - (nuovo.anticipoMinuti ?? 0) * 60_000).getTime())) {
        return { ok: false, errore: "Durata o Anticipo troppo grandi." };
      }
      if (nuovo.inizio !== precedente.inizio || nuovo.anticipoMinuti !== precedente.anticipoMinuti) nuovo.promemoriaInviato = false;
      const aggiornati = { ...dati, impegni: dati.impegni.map((i, n) => n === indice ? nuovo : i) };
      archivio.salva(aggiornati);
      dati.impegni = aggiornati.impegni;
      return { ok: true };
    },

    /** @param {string} id @returns {Esito} */
    cancellaImpegno(id) {
      if (!dati.impegni.some((i) => i.id === id)) return { ok: false, errore: "Questo Impegno non c'è più." };
      const aggiornati = { ...dati, impegni: dati.impegni.filter((i) => i.id !== id) };
      archivio.salva(aggiornati);
      dati.impegni = aggiornati.impegni;
      return { ok: true };
    },

    /** @returns {string} La data locale di oggi, "YYYY-MM-DD". */
    oggi() {
      return formattaData(orologio());
    },

    /**
     * Impegni (in ordine di orario) e Cose da fare di un giorno. Ogni Impegno dice se è
     * già finito (passato) e, solo oggi, se è il primo non ancora finito (prossimo).
     *
     * @param {string} data "YYYY-MM-DD"
     */
    giorno(data) {
      const adesso = formattaInizio(orologio());
      const impegni = dati.impegni
        .filter((i) => giornoDi(i.inizio) === data)
        .sort((a, b) => a.inizio.localeCompare(b.inizio))
        .map((i) => ({ ...i, passato: aggiungiMinuti(i.inizio, i.durataMinuti ?? 0) < adesso, prossimo: false }));
      const prossimo = data === giornoDi(adesso) ? impegni.find((i) => !i.passato) : undefined;
      if (prossimo) prossimo.prossimo = true;
      return { impegni, coseDaFare: dati.coseDaFare.filter((c) => c.giorno === data) };
    },

    /**
     * I giorni del mese che contengono almeno un Impegno o una Cosa da fare.
     *
     * @param {string} mese "YYYY-MM"
     * @returns {string[]} "YYYY-MM-DD", in ordine
     */
    giorniOccupati(mese) {
      const giorni = new Set([...dati.impegni.map((i) => giornoDi(i.inizio)), ...dati.coseDaFare.map((c) => c.giorno)]);
      return [...giorni].filter((g) => g.startsWith(`${mese}-`)).sort();
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
        anticipoMinuti: interpretata.anticipoMinuti === undefined ? ANTICIPO_PREDEFINITO_MINUTI : interpretata.anticipoMinuti,
        promemoriaInviato: false,
      };
      dati.impegni.push(impegno);
      archivio.salva(dati);
      return { ok: true, impegno };
    },

    /**
     * I Promemoria da mostrare adesso: Impegni non ancora iniziati il cui Anticipo è
     * cominciato. Ognuno viene restituito una volta sola, anche dopo un riavvio.
     *
     * @returns {Impegno[]}
     */
    promemoriaDovuti() {
      const adesso = formattaInizio(orologio());
      const dovuti = dati.impegni
        .filter(
          (i) =>
            !i.promemoriaInviato &&
            i.anticipoMinuti !== null &&
            aggiungiMinuti(i.inizio, -i.anticipoMinuti) <= adesso &&
            adesso < i.inizio,
        )
        .sort((a, b) => a.inizio.localeCompare(b.inizio));
      if (dovuti.length === 0) return [];
      for (const impegno of dovuti) impegno.promemoriaInviato = true;
      archivio.salva(dati);
      return dovuti.map((i) => ({ ...i }));
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
