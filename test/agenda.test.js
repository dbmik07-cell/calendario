import { describe, expect, it } from "vitest";
import { creaAgenda } from "../src/nucleo/agenda.js";
import { creaArchivioInMemoria } from "../src/nucleo/archivio-in-memoria.js";

/** @param {string} isoLocale */
const orologioFermoA = (isoLocale) => () => new Date(isoLocale);

const agendaVuota = () =>
  creaArchivioInMemoria({ versione: 1, impegni: [], coseDaFare: [] });

describe("oggi", () => {
  it("è la data locale dell'orologio", () => {
    const agenda = creaAgenda({ orologio: orologioFermoA("2026-12-31T23:59"), archivio: agendaVuota() });

    expect(agenda.oggi()).toBe("2026-12-31");
  });
});

describe("giorno", () => {
  it("restituisce gli Impegni del giorno richiesto e non quelli di altri giorni", () => {
    const archivio = creaArchivioInMemoria({
      versione: 1,
      impegni: [
        { id: "a", titolo: "Dentista", inizio: "2026-10-01T15:00", anticipoMinuti: 15, promemoriaInviato: false },
        { id: "b", titolo: "Palestra", inizio: "2026-10-02T18:00", anticipoMinuti: 15, promemoriaInviato: false },
      ],
      coseDaFare: [],
    });
    const agenda = creaAgenda({ orologio: orologioFermoA("2026-10-01T09:00"), archivio });

    expect(agenda.giorno("2026-10-01").impegni.map((i) => i.titolo)).toEqual(["Dentista"]);
  });
});
