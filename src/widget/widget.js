import { aggiungiMinuti, giornoDi, leggiData, orarioDi } from "../nucleo/data-locale.js";

/** @import { CosaDaFare, Impegno } from "../nucleo/tipi.js" */

const oggi = await window.agenda.oggi();
const [anno, mese, giornoDelMese] = oggi.split("-").map(Number);

mostraMiniCalendario(anno, mese, giornoDelMese);
await aggiornaGiornata();

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
  esito.textContent =
    "impegno" in risultato
      ? `Aggiunto: ${risultato.impegno.titolo}, ${descriviData(giornoDi(risultato.impegno.inizio))}, ${descriviOrario(risultato.impegno)}`
      : `Da fare: ${risultato.cosaDaFare.titolo}, ${descriviData(risultato.cosaDaFare.giorno)}`;
  campo.value = "";
  await aggiornaGiornata();
});

async function aggiornaGiornata() {
  mostraGiornata(oggi, await window.agenda.giorno(oggi));
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

/**
 * @param {number} anno
 * @param {number} mese 1–12
 * @param {number} giornoEvidenziato
 */
function mostraMiniCalendario(anno, mese, giornoEvidenziato) {
  const primo = new Date(anno, mese - 1, 1);
  elemento("titolo-mese").textContent = primo.toLocaleDateString("it-IT", { month: "long", year: "numeric" });

  const giorniNelMese = new Date(anno, mese, 0).getDate();
  const vuotiIniziali = (primo.getDay() + 6) % 7; // settimana da lunedì
  const celle = [
    ...Array.from({ length: vuotiIniziali }, () => 0),
    ...Array.from({ length: giorniNelMese }, (_, i) => i + 1),
  ];

  const corpo = elemento("giorni-mese");
  corpo.replaceChildren();
  for (let i = 0; i < celle.length; i += 7) {
    const riga = document.createElement("tr");
    for (const g of celle.slice(i, i + 7)) {
      const cella = document.createElement("td");
      if (g) cella.textContent = String(g);
      if (g === giornoEvidenziato) cella.classList.add("oggi");
      riga.append(cella);
    }
    corpo.append(riga);
  }
}

/**
 * @param {string} data
 * @param {{ impegni: Impegno[], coseDaFare: CosaDaFare[] }} giornata
 */
function mostraGiornata(data, { impegni, coseDaFare }) {
  elemento("titolo-giorno").textContent = descriviData(data);

  elemento("impegni").replaceChildren(
    ...impegni.map((impegno) => {
      const voce = document.createElement("li");
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
    await aggiornaGiornata();
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
    await aggiornaGiornata();
  });

  voce.append(etichetta, cancella);
  return voce;
}

/** @param {string} id */
function elemento(id) {
  return /** @type {HTMLElement} */ (document.getElementById(id));
}
