/** @import { Impegno } from "../nucleo/tipi.js" */

const oggi = await window.agenda.oggi();
const [anno, mese, giornoDelMese] = oggi.split("-").map(Number);

mostraMiniCalendario(anno, mese, giornoDelMese);
mostraGiornata(oggi, (await window.agenda.giorno(oggi)).impegni);

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
  const [a, m, g] = data.split("-").map(Number);
  elemento("titolo-giorno").textContent = new Date(a, m - 1, g).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  elemento("impegni").replaceChildren(
    ...impegni.map((impegno) => {
      const voce = document.createElement("li");
      const orario = document.createElement("span");
      orario.className = "orario";
      orario.textContent = impegno.inizio.slice(11, 16);
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
