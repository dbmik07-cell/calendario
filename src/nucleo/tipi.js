// Forme dei dati dell'Agenda (vedi CONTEXT.md per il vocabolario).

/**
 * @typedef {object} Impegno
 * @property {string} id
 * @property {string} titolo
 * @property {string} inizio        Ora locale senza fuso, "YYYY-MM-DDTHH:MM".
 * @property {number} [durataMinuti]
 * @property {number | null} anticipoMinuti  null = nessun Promemoria.
 * @property {boolean} promemoriaInviato
 */

/**
 * @typedef {object} CosaDaFare
 * @property {string} id
 * @property {string} titolo
 * @property {string} giorno        "YYYY-MM-DD".
 * @property {boolean} fatta
 */

/**
 * @typedef {object} DatiAgenda
 * @property {1} versione
 * @property {Impegno[]} impegni
 * @property {CosaDaFare[]} coseDaFare
 */

/**
 * @typedef {object} Archivio
 * @property {() => DatiAgenda} carica
 */

/** @typedef {() => Date} Orologio */

export {};
