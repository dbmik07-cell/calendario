import { aggiungiMinuti, giornoDi, leggiData, orarioDi } from "../nucleo/data-locale.js";

/** @import { CosaDaFare, Impegno } from "../nucleo/tipi.js" */
/** @typedef {Impegno & { passato: boolean, prossimo: boolean }} ImpegnoDelGiorno */

const AGGIORNAMENTO_MS = 60_000;

// La cattura mantiene il rilascio del puntatore anche fuori dal bordo iniziale.
for (const bordo of ["n", "s", "e", "w", "ne", "nw", "se", "sw"]) {
  const maniglia = document.createElement("div");
  maniglia.className = `ridimensiona ${bordo}`;
  maniglia.addEventListener("pointerdown", (evento) => {
    if (evento.button !== 0) return;
    evento.preventDefault();
    maniglia.setPointerCapture(evento.pointerId);
    window.widget.ridimensiona(bordo, { x: evento.screenX, y: evento.screenY });
  });
  for (const evento of ["pointerup", "pointercancel", "lostpointercapture"]) {
    maniglia.addEventListener(evento, () => window.widget.fineRidimensionamento());
  }
  document.body.append(maniglia);
}

const stato = {
  oggi: await window.agenda.oggi(),
  /** Il giorno di cui il Widget mostra la lista, "YYYY-MM-DD". */
  giornoSelezionato: "",
  /** Il mese mostrato nel mini-calendario, "YYYY-MM". */
  meseMostrato: "",
};
stato.giornoSelezionato = stato.oggi;
stato.meseMostrato = meseDi(stato.oggi);
await aggiorna();

elemento("mese-precedente").addEventListener("click", () => cambiaMese(-1));
elemento("mese-successivo").addEventListener("click", () => cambiaMese(1));
elemento("torna-a-oggi").addEventListener("click", () => seleziona(stato.oggi));
window.widget.suMostraGiorno((giorno) => seleziona(giorno));

// Tiene aggiornati "oggi" (anche dopo mezzanotte) e gli Impegni passati e prossimo.
setInterval(async () => {
  const oggi = await window.agenda.oggi();
  if (oggi !== stato.oggi && stato.giornoSelezionato === stato.oggi) {
    stato.giornoSelezionato = oggi;
    stato.meseMostrato = meseDi(oggi);
  }
  stato.oggi = oggi;
  await aggiorna();
}, AGGIORNAMENTO_MS);

elemento("nuova-frase").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const campo = /** @type {HTMLInputElement} */ (elemento("frase"));
  const risultato = await window.agenda.aggiungiDaTesto(campo.value);
  const esito = elemento("esito");
  esito.hidden = false;
  esito.classList.toggle("errore", !risultato.ok);
  if (!risultato.ok) {
    esito.textContent = risultato.errore;
    return;
  }
  campo.value = "";
  if ("impegno" in risultato) {
    const { impegno } = risultato;
    esito.textContent = `Aggiunto: ${impegno.titolo}, ${descriviData(giornoDi(impegno.inizio))}, ${descriviOrario(impegno)}`;
    await seleziona(giornoDi(impegno.inizio));
  } else {
    const { cosaDaFare } = risultato;
    esito.textContent = `Da fare: ${cosaDaFare.titolo}, ${descriviData(cosaDaFare.giorno)}`;
    await seleziona(cosaDaFare.giorno);
  }
});

/** @param {string} giorno "YYYY-MM-DD" */
async function seleziona(giorno) {
  stato.giornoSelezionato = giorno;
  stato.meseMostrato = meseDi(giorno);
  await aggiorna();
}

/** @param {number} scarto mesi in avanti (o indietro, se negativo) */
async function cambiaMese(scarto) {
  const [anno, mese] = stato.meseMostrato.split("-").map(Number);
  const primo = new Date(anno, mese - 1 + scarto, 1);
  stato.meseMostrato = `${primo.getFullYear()}-${String(primo.getMonth() + 1).padStart(2, "0")}`;
  await aggiorna();
}

async function aggiorna() {
  const [occupati, giornata] = await Promise.all([
    window.agenda.giorniOccupati(stato.meseMostrato),
    window.agenda.giorno(stato.giornoSelezionato),
  ]);
  mostraMiniCalendario(new Set(occupati));
  mostraGiornata(giornata);
}

/** @param {Set<string>} occupati giorni "YYYY-MM-DD" con qualcosa in programma */
function mostraMiniCalendario(occupati) {
  const [anno, mese] = stato.meseMostrato.split("-").map(Number);
  const primo = new Date(anno, mese - 1, 1);
  elemento("titolo-mese").textContent = primo.toLocaleDateString("it-IT", { month: "long", year: "numeric" });

  const giorniNelMese = new Date(anno, mese, 0).getDate();
  const vuotiIniziali = (primo.getDay() + 6) % 7; // settimana da lunedì
  const celle = [
    ...Array.from({ length: vuotiIniziali }, () => ""),
    ...Array.from({ length: giorniNelMese }, (_, i) => `${stato.meseMostrato}-${String(i + 1).padStart(2, "0")}`),
  ];

  const righe = [];
  for (let i = 0; i < celle.length; i += 7) {
    const riga = document.createElement("tr");
    riga.append(...celle.slice(i, i + 7).map((giorno) => cellaGiorno(giorno, occupati)));
    righe.push(riga);
  }
  elemento("giorni-mese").replaceChildren(...righe);
}

/**
 * @param {string} giorno "YYYY-MM-DD", oppure "" per una cella vuota
 * @param {Set<string>} occupati
 */
function cellaGiorno(giorno, occupati) {
  const cella = document.createElement("td");
  if (!giorno) return cella;
  const pulsante = document.createElement("button");
  pulsante.type = "button";
  pulsante.className = "giorno";
  pulsante.textContent = String(Number(giorno.slice(8)));
  pulsante.setAttribute("aria-label", descriviData(giorno));
  pulsante.classList.toggle("oggi", giorno === stato.oggi);
  pulsante.classList.toggle("selezionato", giorno === stato.giornoSelezionato);
  pulsante.classList.toggle("occupato", occupati.has(giorno));
  pulsante.addEventListener("click", () => seleziona(giorno));
  cella.append(pulsante);
  return cella;
}

/** @param {{ impegni: ImpegnoDelGiorno[], coseDaFare: CosaDaFare[] }} giornata */
function mostraGiornata({ impegni, coseDaFare }) {
  elemento("titolo-giorno").textContent = descriviData(stato.giornoSelezionato);

  elemento("impegni").replaceChildren(
    ...impegni.map((impegno) => {
      const voce = document.createElement("li");
      voce.classList.toggle("passato", impegno.passato);
      voce.classList.toggle("prossimo", impegno.prossimo);
      const orario = document.createElement("span");
      orario.className = "orario";
      orario.textContent = descriviOrario(impegno);
      voce.append(orario, impegno.titolo);
      return voce;
    }),
  );
  elemento("cose-da-fare").replaceChildren(...coseDaFare.map(voceCosaDaFare));
  elemento("sezione-cose-da-fare").hidden = coseDaFare.length === 0;
  elemento("giornata-vuota").hidden = impegni.length + coseDaFare.length > 0;
}

/** @param {CosaDaFare} cosaDaFare */
function voceCosaDaFare(cosaDaFare) {
  const voce = document.createElement("li");
  voce.className = "cosa-da-fare";
  voce.classList.toggle("fatta", cosaDaFare.fatta);

  const etichetta = document.createElement("label");
  const spunta = document.createElement("input");
  spunta.type = "checkbox";
  spunta.checked = cosaDaFare.fatta;
  spunta.addEventListener("change", async () => {
    await window.agenda.segnaFatta(cosaDaFare.id, spunta.checked);
    await aggiorna();
  });
  etichetta.append(spunta, cosaDaFare.titolo);

  const cancella = document.createElement("button");
  cancella.type = "button";
  cancella.className = "cancella";
  cancella.textContent = "×";
  cancella.title = "Cancella";
  cancella.setAttribute("aria-label", `Cancella ${cosaDaFare.titolo}`);
  cancella.addEventListener("click", async () => {
    await window.agenda.cancellaCosaDaFare(cosaDaFare.id);
    await aggiorna();
  });

  voce.append(etichetta, cancella);
  return voce;
}

/** @param {string} data "YYYY-MM-DD" */
function descriviData(data) {
  return leggiData(data).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}

/** @param {Impegno} impegno @returns {string} "15:00" oppure "15:00–16:00" */
function descriviOrario({ inizio, durataMinuti }) {
  const orario = orarioDi(inizio);
  return durataMinuti ? `${orario}–${orarioDi(aggiungiMinuti(inizio, durataMinuti))}` : orario;
}

/** @param {string} giorno "YYYY-MM-DD" @returns {string} "YYYY-MM" */
function meseDi(giorno) {
  return giorno.slice(0, 7);
}

/** @param {string} id */
function elemento(id) {
  return /** @type {HTMLElement} */ (document.getElementById(id));
}
