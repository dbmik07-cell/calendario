import { giornoDi, orarioDi } from "../nucleo/data-locale.js";

/** @import { Impegno } from "../nucleo/tipi.js" */

/** @param {(giorno: string) => Promise<void>} aggiornaGiorno */
export function preparaModificaImpegno(aggiornaGiorno) {
  const dialogo = /** @type {HTMLDialogElement} */ (document.getElementById("modifica-impegno"));
  const modulo = /** @type {HTMLFormElement} */ (document.getElementById("modulo-impegno"));
  const titolo = campo("modifica-titolo");
  const giorno = campo("modifica-giorno");
  const orario = campo("modifica-orario");
  const durata = campo("modifica-durata");
  const anticipo = campo("modifica-anticipo");
  const senzaPromemoria = campo("modifica-senza-promemoria");
  const errore = elemento("errore-modifica");
  const conferma = elemento("conferma-cancellazione");
  /** @type {Impegno | undefined} */
  let impegno;
  let occupato = false;

  function aggiornaAnticipo() { anticipo.disabled = senzaPromemoria.checked; }
  senzaPromemoria.addEventListener("change", aggiornaAnticipo);
  elemento("annulla-modifica").addEventListener("click", () => dialogo.close());
  dialogo.addEventListener("cancel", (evento) => { if (occupato) evento.preventDefault(); });
  elemento("cancella-impegno").addEventListener("click", () => {
    conferma.hidden = false;
    elemento("mantieni-impegno").focus();
  });
  elemento("mantieni-impegno").addEventListener("click", () => {
    conferma.hidden = true;
    elemento("cancella-impegno").focus();
  });

  /** @param {() => Promise<{ ok: true } | { ok: false, errore: string }>} azione @param {string} giornoDaMostrare */
  async function esegui(azione, giornoDaMostrare) {
    if (occupato) return;
    occupato = true;
    errore.hidden = true;
    const controlli = modulo.querySelectorAll("input, button");
    controlli.forEach((c) => { /** @type {HTMLInputElement | HTMLButtonElement} */ (c).disabled = true; });
    try {
      const esito = await azione();
      if (!esito.ok) {
        errore.textContent = esito.errore;
        errore.hidden = false;
        return;
      }
      await aggiornaGiorno(giornoDaMostrare);
      dialogo.close();
    } catch {
      errore.textContent = "Operazione non completata. Controlla l'Agenda e riprova.";
      errore.hidden = false;
    } finally {
      occupato = false;
      controlli.forEach((c) => { /** @type {HTMLInputElement | HTMLButtonElement} */ (c).disabled = false; });
      aggiornaAnticipo();
    }
  }
  modulo.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!impegno || occupato) return;
    const id = impegno.id;
    const modifiche = {
      titolo: titolo.value,
      inizio: `${giorno.value}T${orario.value}`,
      durataMinuti: durata.value === "" ? null : Number(durata.value),
      anticipoMinuti: senzaPromemoria.checked ? null : Number(anticipo.value),
    };
    void esegui(() => window.agenda.modificaImpegno(id, modifiche), giorno.value);
  });
  elemento("conferma-cancella").addEventListener("click", () => {
    if (!impegno || occupato) return;
    const { id, inizio } = impegno;
    void esegui(() => window.agenda.cancellaImpegno(id), giornoDi(inizio));
  });

  /** @param {Impegno} scelto */
  return function apri(scelto) {
    impegno = scelto;
    titolo.value = scelto.titolo;
    giorno.value = giornoDi(scelto.inizio);
    orario.value = orarioDi(scelto.inizio);
    durata.value = scelto.durataMinuti === undefined ? "" : String(scelto.durataMinuti);
    anticipo.value = String(scelto.anticipoMinuti ?? 15);
    senzaPromemoria.checked = scelto.anticipoMinuti === null;
    aggiornaAnticipo();
    errore.hidden = true;
    conferma.hidden = true;
    dialogo.showModal();
    titolo.focus();
  };
}

/** @param {string} id */
function elemento(id) { return /** @type {HTMLElement} */ (document.getElementById(id)); }
/** @param {string} id */
function campo(id) { return /** @type {HTMLInputElement} */ (elemento(id)); }
