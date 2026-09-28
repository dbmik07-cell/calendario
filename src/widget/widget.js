import { aggiungiMinuti, giornoDi, leggiData, orarioDi } from "../nucleo/data-locale.js";

/** @import { Impegno } from "../nucleo/tipi.js" */

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
  const { impegno } = risultato;
  esito.textContent = `Aggiunto: ${impegno.titolo}, ${descriviData(giornoDi(impegno.inizio))}, ${descriviOrario(impegno)}`;
  campo.value = "";
  await aggiornaGiornata();
});

async function aggiornaGiornata() {
  mostraGiornata(oggi, (await window.agenda.giorno(oggi)).impegni);
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
 * @param {Impegno[]} impegni
 */
function mostraGiornata(data, impegni) {
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
  elemento("giornata-vuota").hidden = impegni.length > 0;
}

/** @param {string} id */
function elemento(id) {
  return /** @type {HTMLElement} */ (document.getElementById(id));
}
