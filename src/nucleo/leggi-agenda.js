import { formattaData, formattaInizio, leggiData } from "./data-locale.js";

/** @import { DatiAgenda } from "./tipi.js" */

/** Valida tutta l'Agenda prima di assegnare id o salvare. @param {unknown} contenuto @param {DatiAgenda} precedente @returns {DatiAgenda} */
export function leggiAgenda(contenuto, precedente) {
  const dati = oggetto(contenuto);
  if (dati.versione !== 1 || !Array.isArray(dati.impegni) || !Array.isArray(dati.coseDaFare)) {
    throw new Error("Formato dell'Agenda non valido (versione, impegni o coseDaFare).");
  }
  const identificatori = new Set();
  /** @param {Record<string, unknown>} elemento */
  function idDi(elemento) {
    const id = elemento.id === undefined ? crypto.randomUUID() : testo(elemento.id, "id");
    if (identificatori.has(id)) throw new Error("Due elementi hanno lo stesso id.");
    identificatori.add(id);
    return id;
  }
  const impegni = dati.impegni.map((elemento) => {
    const i = oggetto(elemento);
    const id = idDi(i);
    const titolo = testo(i.titolo, "titolo");
    const inizio = testo(i.inizio, "inizio");
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(inizio) || formattaInizio(leggiData(inizio)) !== inizio) throw new Error("Data o orario dell'Impegno non validi.");
    const anticipoMinuti = i.anticipoMinuti === null ? null : minuti(i.anticipoMinuti, 0);
    const durataMinuti = i.durataMinuti === undefined ? undefined : minuti(i.durataMinuti, 1);
    const inizioMs = leggiData(inizio).getTime();
    if (!Number.isFinite(new Date(inizioMs + (durataMinuti ?? 0) * 60_000).getTime()) ||
        !Number.isFinite(new Date(inizioMs - (anticipoMinuti ?? 0) * 60_000).getTime())) throw new Error("Durata o Anticipo troppo grandi.");
    if (typeof i.promemoriaInviato !== "boolean") throw new Error("promemoriaInviato deve essere true o false.");
    const prima = precedente.impegni.find((p) => p.id === id);
    const cambiato = prima && (prima.inizio !== inizio || prima.anticipoMinuti !== anticipoMinuti);
    return { ...i, id, titolo, inizio, anticipoMinuti,
      ...(durataMinuti === undefined ? {} : { durataMinuti }),
      promemoriaInviato: cambiato ? false : i.promemoriaInviato,
    };
  });
  const coseDaFare = dati.coseDaFare.map((elemento) => {
    const c = oggetto(elemento);
    const id = idDi(c);
    const titolo = testo(c.titolo, "titolo");
    const giorno = testo(c.giorno, "giorno");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(giorno) || formattaData(leggiData(giorno)) !== giorno) throw new Error("Giorno della Cosa da fare non valido.");
    if (typeof c.fatta !== "boolean") throw new Error("fatta deve essere true o false.");
    return { ...c, id, titolo, giorno, fatta: c.fatta };
  });
  return { ...dati, versione: 1, impegni, coseDaFare };
}

/** @param {unknown} valore @returns {Record<string, unknown>} */
function oggetto(valore) {
  if (!valore || typeof valore !== "object" || Array.isArray(valore)) throw new Error("Elemento dell'Agenda non valido.");
  return /** @type {Record<string, unknown>} */ (valore);
}
/** @param {unknown} valore @param {string} campo */
function testo(valore, campo) {
  if (typeof valore !== "string" || !valore.trim()) throw new Error(`Campo ${campo} mancante o vuoto.`);
  return valore;
}
/** @param {unknown} valore @param {number} minimo */
function minuti(valore, minimo) {
  if (typeof valore !== "number" || !Number.isSafeInteger(valore) || valore < minimo) throw new Error("Durata o Anticipo non validi.");
  return valore;
}
