// Interprete delle Frasi: dettaglio interno del Nucleo dell'Agenda.

import { formattaInizio } from "./data-locale.js";

const GIORNI_RELATIVI = /\b(oggi|domani|dopodomani)\b/i;
/** @type {Record<string, number>} */
const SCARTO_GIORNI = { oggi: 0, domani: 1, dopodomani: 2 };
// "alle 15", "alle 15:30", oppure "15:30" / "15.30" anche senza "alle".
const ORARIO = /(?:\balle\s+(\d{1,2})(?:[:.](\d{2}))?|\b(\d{1,2})[:.](\d{2}))\b/i;

// Resti di "dal dentista", "alle 14 di domani" dopo aver tolto giorno e orario.
const PREPOSIZIONE = "(?:a|al|alla|allo|da|dal|dalla|dallo|di|del|della|dello|in|nel|nella|il|lo|la)";
const PREPOSIZIONI_AI_BORDI = new RegExp(`^(?:${PREPOSIZIONE}\\s+)+|(?:\\s+${PREPOSIZIONE})+$`, "gi");

/**
 * @param {string} frase
 * @param {Date} adesso
 * @returns {{ ok: true, inizio: string, titolo: string } | { ok: false, errore: string }}
 */
export function interpretaFrase(frase, adesso) {
  if (!frase.trim()) return errore("Scrivi cosa devi fare e quando, per esempio \"domani alle 15 dentista\".");
  let resto = frase;

  const giorno = GIORNI_RELATIVI.exec(resto);
  resto = togli(resto, giorno);
  const scarto = giorno ? SCARTO_GIORNI[giorno[1].toLowerCase()] : 0;
  const data = new Date(adesso.getFullYear(), adesso.getMonth(), adesso.getDate() + scarto);

  const orario = ORARIO.exec(resto);
  if (!orario) return errore("Manca l'orario: aggiungi per esempio \"alle 15\".");
  resto = togli(resto, orario);
  const ore = Number(orario[1] ?? orario[3]);
  const minuti = Number(orario[2] ?? orario[4] ?? 0);
  if (ore > 23 || minuti > 59) return errore(`Orario non valido: "${orario[0].trim()}".`);
  data.setHours(ore, minuti);
  if (!giorno && data < adesso) data.setDate(data.getDate() + 1);

  const titolo = resto.replace(/\s+/g, " ").trim().replace(PREPOSIZIONI_AI_BORDI, "");
  if (!titolo) return errore("Manca il titolo: cosa devi fare?");
  return { ok: true, inizio: formattaInizio(data), titolo: titolo[0].toUpperCase() + titolo.slice(1) };
}

/** @param {string} messaggio */
const errore = (messaggio) => /** @type {const} */ ({ ok: false, errore: messaggio });

/**
 * @param {string} testo
 * @param {RegExpExecArray | null} trovato
 */
function togli(testo, trovato) {
  if (!trovato) return testo;
  return testo.slice(0, trovato.index) + " " + testo.slice(trovato.index + trovato[0].length);
}
