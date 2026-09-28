// Interprete delle Frasi: dettaglio interno del Nucleo dell'Agenda.
// Toglie dalla Frase, un pezzo alla volta, orario e giorno; quello che resta è il titolo.

import { formattaData, formattaInizio } from "./data-locale.js";

// Confini di parola che conoscono le lettere accentate (\b di JavaScript no).
const INIZIO = "(?<![\\p{L}\\p{N}])";
const FINE = "(?![\\p{L}\\p{N}])";
/** @param {string} corpo */
const espressione = (corpo) => new RegExp(`${INIZIO}(?:${corpo})${FINE}`, "iu");

const GIORNO_RELATIVO = espressione("oggi|domani|dopodomani");
/** @type {Record<string, number>} */
const SCARTO_GIORNI = { oggi: 0, domani: 1, dopodomani: 2 };

const GIORNO_SETTIMANA = espressione("(lune|marte|mercole|giove|vener)d[iìí]|sabato|domenica");
/** @type {Record<string, number>} Come Date.getDay(): domenica = 0. */
const NUMERO_GIORNO = { lune: 1, marte: 2, mercole: 3, giove: 4, vener: 5, sabato: 6, domenica: 0 };

const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
const ARTICOLO_DEL_GIORNO = "(?:il\\s+|l['’])";
// "12 ottobre", "il 12 ottobre 2027", "l'8 marzo".
const DATA_CON_MESE = espressione(`${ARTICOLO_DEL_GIORNO}?(\\d{1,2})\\s+(${MESI.join("|")})(?:\\s+(\\d{4}))?`);
// "12/10", "12/10/2027".
const DATA_NUMERICA = espressione(`${ARTICOLO_DEL_GIORNO}?(\\d{1,2})/(\\d{1,2})(?:/(\\d{4}))?`);
// "il 12", "l'8": il prossimo giorno con quel numero.
const GIORNO_DEL_MESE = espressione(`${ARTICOLO_DEL_GIORNO}(\\d{1,2})`);

// "alle 15", "alle 15:30", "alle 9 e mezza": dopo "alle" si prende tutta la parola
// che inizia con una cifra, così "alle 15:3" è un errore e non un "15" con ":3" nel titolo.
const FRAZIONE_ORA = "mezza|mezzo|un\\s+quarto|tre\\s+quarti";
const CON_FRAZIONE = `(?:\\s+e\\s+(${FRAZIONE_ORA})${FINE})?`;
const ORARIO_CON_ALLE = new RegExp(`${INIZIO}alle\\s+(\\d\\S*)${CON_FRAZIONE}`, "iu");
/** @type {Record<string, number>} */
const MINUTI_FRAZIONE = { mezza: 30, mezzo: 30, "un quarto": 15, "tre quarti": 45 };
// "15:30" / "15.30" anche senza "alle"; vale solo se non c'è un "alle".
const ORARIO_NUDO = espressione("(\\d{1,2})[:.](\\d{2})");
const ORE_E_MINUTI = /^(\d{1,2})(?:[:.](\d{2}))?$/;

// "dalle 15 alle 17": orario e durata insieme.
const INTERVALLO = new RegExp(`${INIZIO}dalle\\s+(\\d\\S*)${CON_FRAZIONE}\\s+alle\\s+(\\d\\S*)${CON_FRAZIONE}`, "iu");
// "per un'ora", "per mezz'ora", "per 2 ore", "per 30 minuti".
const DURATA = espressione("per\\s+(?:(un['’\\s]?ora)|(mezz['’\\s]?ora)|(\\d+)\\s+or[ae]|(\\d+)\\s+minut[oi])");

// Parole che restano ai bordi del titolo dopo aver tolto giorno e orario
// ("dal dentista", "alle 14 di domani").
const PREPOSIZIONI = new Set(
  "a ad al alla allo alle ai agli da dal dalla dallo dai dagli di del della dello dei degli in nel nella nello nei negli per".split(" "),
);
const PUNTEGGIATURA_AI_BORDI = /^[\s,.;:!?–-]+|[\s,.;:!?–-]+$/gu;

/**
 * @typedef {{ tipo: "relativo", scarto: number }
 *   | { tipo: "settimana", giornoSettimana: number }
 *   | { tipo: "delMese", giornoDelMese: number }
 *   | { tipo: "data", giornoDelMese: number, mese: number, anno?: number }} Giorno
 */

/**
 * @typedef {{ ok: true, tipo: "impegno", inizio: string, durataMinuti?: number, titolo: string }
 *   | { ok: true, tipo: "cosaDaFare", giorno: string, titolo: string }
 *   | { ok: false, errore: string }} FraseInterpretata
 */

/**
 * Con un orario la Frase descrive un Impegno; senza, una Cosa da fare.
 *
 * @param {string} frase
 * @param {Date} adesso
 * @returns {FraseInterpretata}
 */
export function interpretaFrase(frase, adesso) {
  if (!frase.trim()) return errore("Scrivi cosa devi fare e quando, per esempio \"domani alle 15 dentista\".");
  const testo = { resto: frase };

  const orario = estraiOrario(testo);
  if (orario && "errore" in orario) return errore(orario.errore);
  if (!orario && DURATA.test(testo.resto)) return errore("Manca l'orario: aggiungi per esempio \"alle 15\".");

  const giorno = estraiGiorno(testo);
  if (estraiGiorno(testo)) return errore("Indica un solo giorno.");
  const data = risolviGiorno(giorno, adesso, orario);
  if (!data) return errore("Data non valida: controlla giorno e mese.");

  const titolo = ripulisciTitolo(testo.resto);
  if (!titolo) return errore("Manca il titolo: cosa devi fare?");
  if (!orario) return { ok: true, tipo: "cosaDaFare", giorno: formattaData(data), titolo };

  data.setHours(orario.ore, orario.minuti);
  if (data.getHours() !== orario.ore || data.getMinutes() !== orario.minuti) {
    return errore("Quell'orario non esiste: è la notte del passaggio all'ora legale.");
  }
  const durata = orario.durataMinuti === undefined ? {} : { durataMinuti: orario.durataMinuti };
  return { ok: true, tipo: "impegno", inizio: formattaInizio(data), ...durata, titolo };
}

/** @param {string} messaggio */
const errore = (messaggio) => /** @type {const} */ ({ ok: false, errore: messaggio });

/**
 * @typedef {{ ore: number, minuti: number }} Orario
 * @typedef {{ errore: string }} Problema
 */

/**
 * Orario d'inizio e, se c'è, durata.
 *
 * @param {{ resto: string }} testo
 * @returns {Orario & { durataMinuti?: number } | Problema | null}
 */
function estraiOrario(testo) {
  const intervallo = togli(testo, INTERVALLO);
  if (intervallo) {
    const [scritto, parolaInizio, frazioneInizio, parolaFine, frazioneFine] = intervallo;
    const inizio = leggiOrario(parolaInizio, frazioneInizio, scritto);
    const fine = leggiOrario(parolaFine, frazioneFine, scritto);
    if ("errore" in inizio) return inizio;
    if ("errore" in fine) return fine;
    const durataMinuti = minutiDelGiorno(fine) - minutiDelGiorno(inizio);
    if (durataMinuti <= 0) return { errore: "La fine deve venire dopo l'inizio." };
    return { ...inizio, durataMinuti };
  }

  const inizio = estraiInizio(testo);
  if (!inizio || "errore" in inizio) return inizio;
  const durata = togli(testo, DURATA);
  if (!durata) return inizio;
  const [, unOra, mezzOra, ore, minuti] = durata;
  const durataMinuti = unOra ? 60 : mezzOra ? 30 : ore ? Number(ore) * 60 : Number(minuti);
  if (durataMinuti <= 0) return { errore: "La durata deve essere di almeno un minuto." };
  return { ...inizio, durataMinuti };
}

/**
 * @param {{ resto: string }} testo
 * @returns {Orario | Problema | null}
 */
function estraiInizio(testo) {
  const conAlle = togli(testo, ORARIO_CON_ALLE);
  if (conAlle) {
    if (ORARIO_CON_ALLE.test(testo.resto)) return { errore: "Indica un solo orario." };
    return leggiOrario(conAlle[1], conAlle[2], conAlle[0]);
  }

  const nudo = togli(testo, ORARIO_NUDO);
  if (!nudo) return null;
  return leggiOrario(`${nudo[1]}:${nudo[2]}`, undefined, nudo[0]);
}

/**
 * @param {string} parola "15", "15:30", "15.30" (eventuale punteggiatura finale ignorata)
 * @param {string | undefined} frazione "mezza", "un quarto", "tre quarti"
 * @param {string} scritto il pezzo di Frase, per il messaggio d'errore
 * @returns {Orario | Problema}
 */
function leggiOrario(parola, frazione, scritto) {
  const oreEMinuti = ORE_E_MINUTI.exec(parola.replace(/[.,;!?]+$/, ""));
  if (!oreEMinuti || (frazione && oreEMinuti[2])) return orarioNonValido(scritto);
  const ore = Number(oreEMinuti[1]);
  const minuti = frazione ? MINUTI_FRAZIONE[frazione.toLowerCase().replace(/\s+/g, " ")] : Number(oreEMinuti[2] ?? 0);
  return ore > 23 || minuti > 59 ? orarioNonValido(scritto) : { ore, minuti };
}

/** @param {string} scritto */
const orarioNonValido = (scritto) => ({ errore: `Orario non valido: "${scritto.trim()}".` });

/** @param {Orario} orario */
const minutiDelGiorno = ({ ore, minuti }) => ore * 60 + minuti;

/**
 * Il testo rimasto, senza punteggiatura né preposizioni ai bordi, con la prima lettera maiuscola.
 *
 * @param {string} resto
 */
function ripulisciTitolo(resto) {
  const parole = resto.replace(PUNTEGGIATURA_AI_BORDI, "").split(/\s+/).filter(Boolean);
  while (parole.length && PREPOSIZIONI.has(parole[0].toLowerCase())) parole.shift();
  while (parole.length && PREPOSIZIONI.has(parole[parole.length - 1].toLowerCase())) parole.pop();
  const titolo = parole.join(" ").replace(PUNTEGGIATURA_AI_BORDI, "");
  return titolo && titolo[0].toUpperCase() + titolo.slice(1);
}

/**
 * @param {{ resto: string }} testo
 * @returns {Giorno | null}
 */
function estraiGiorno(testo) {
  const relativo = togli(testo, GIORNO_RELATIVO);
  if (relativo) return { tipo: "relativo", scarto: SCARTO_GIORNI[relativo[0].toLowerCase()] };

  const settimana = togli(testo, GIORNO_SETTIMANA);
  if (settimana) {
    const chiave = (settimana[1] ?? settimana[0]).toLowerCase();
    return { tipo: "settimana", giornoSettimana: NUMERO_GIORNO[chiave] };
  }

  const conMese = togli(testo, DATA_CON_MESE);
  if (conMese) {
    const [, giornoDelMese, mese, anno] = conMese;
    return { tipo: "data", giornoDelMese: Number(giornoDelMese), mese: MESI.indexOf(mese.toLowerCase()) + 1, ...annoSe(anno) };
  }

  const numerica = togli(testo, DATA_NUMERICA);
  if (numerica) {
    const [, giornoDelMese, mese, anno] = numerica;
    return { tipo: "data", giornoDelMese: Number(giornoDelMese), mese: Number(mese), ...annoSe(anno) };
  }

  const delMese = togli(testo, GIORNO_DEL_MESE);
  if (delMese) return { tipo: "delMese", giornoDelMese: Number(delMese[1]) };
  return null;
}

/** @param {string | undefined} anno */
const annoSe = (anno) => (anno ? { anno: Number(anno) } : {});

/**
 * Il giorno (a mezzanotte) indicato dalla Frase, o null se la data non esiste.
 * Senza indicazioni è oggi, o domani se l'orario di oggi è già passato; un giorno
 * senza anno ("giovedì", "il 12", "12 ottobre") è la prossima occorrenza.
 *
 * @param {Giorno | null} giorno
 * @param {Date} adesso
 * @param {Orario | null} orario null per una Cosa da fare: oggi vale ancora
 * @returns {Date | null}
 */
function risolviGiorno(giorno, adesso, orario) {
  const oggi = new Date(adesso.getFullYear(), adesso.getMonth(), adesso.getDate());
  const orarioPassato = orario !== null && minutiDelGiorno(orario) < adesso.getHours() * 60 + adesso.getMinutes();
  /** @param {Date} d */
  const ancoraDaVenire = (d) => d > oggi || (d.getTime() === oggi.getTime() && !orarioPassato);
  /** @param {number} giorni */
  const traGiorni = (giorni) => new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() + giorni);

  if (!giorno) return traGiorni(orarioPassato ? 1 : 0);
  switch (giorno.tipo) {
    case "relativo":
      return traGiorni(giorno.scarto);
    case "settimana": {
      const scarto = (giorno.giornoSettimana - oggi.getDay() + 7) % 7;
      return traGiorni(scarto === 0 && orarioPassato ? 7 : scarto);
    }
    case "delMese":
      for (let mesi = 0; mesi <= 12; mesi++) {
        const candidato = dataEsistente(oggi.getFullYear(), oggi.getMonth() + 1 + mesi, giorno.giornoDelMese);
        if (candidato && ancoraDaVenire(candidato)) return candidato;
      }
      return null;
    case "data": {
      const { giornoDelMese, mese, anno } = giorno;
      if (mese > 12) return null;
      if (anno) return dataEsistente(anno, mese, giornoDelMese);
      // Il 29 febbraio può essere fino a 8 anni più avanti.
      for (let a = oggi.getFullYear(); a <= oggi.getFullYear() + 8; a++) {
        const candidato = dataEsistente(a, mese, giornoDelMese);
        if (candidato && ancoraDaVenire(candidato)) return candidato;
      }
      return null;
    }
  }
}

/**
 * @param {number} anno
 * @param {number} mese 1–12, anche oltre (13 = gennaio dell'anno dopo)
 * @param {number} giornoDelMese
 * @returns {Date | null} null se quel giorno non esiste in quel mese
 */
function dataEsistente(anno, mese, giornoDelMese) {
  if (mese < 1 || giornoDelMese < 1) return null;
  const d = new Date(anno, mese - 1, giornoDelMese);
  return d.getDate() === giornoDelMese && d.getMonth() === (mese - 1) % 12 ? d : null;
}

/**
 * Toglie dal testo il primo pezzo che corrisponde all'espressione.
 *
 * @param {{ resto: string }} testo
 * @param {RegExp} espressione
 */
function togli(testo, espressione) {
  const trovato = espressione.exec(testo.resto);
  if (trovato) {
    testo.resto = testo.resto.slice(0, trovato.index) + " " + testo.resto.slice(trovato.index + trovato[0].length);
  }
  return trovato;
}
