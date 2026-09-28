import { describe, expect, it } from "vitest";
import { creaAgenda } from "../src/nucleo/agenda.js";
import { datiVuoti } from "../src/nucleo/dati.js";
import { creaArchivioInMemoria } from "./supporto/archivio-in-memoria.js";

function prepara() {
  const archivio = creaArchivioInMemoria(datiVuoti());
  const orologio = () => new Date("2026-10-01T14:50");
  const agenda = creaAgenda({ archivio, orologio });
  agenda.aggiungiDaTesto("oggi alle 15 dentista per un'ora");
  const id = agenda.giorno("2026-10-01").impegni[0].id;
  return { agenda, id, riapri: () => creaAgenda({ archivio, orologio }) };
}

describe("modifica di un Impegno", () => {
  it.each([{ inizio: "2026-10-01T15:05" }, { anticipoMinuti: 20 }])("riattiva il Promemoria cambiando %j", (modifiche) => {
    const { agenda, id, riapri } = prepara();
    expect(agenda.promemoriaDovuti()).toHaveLength(1);
    agenda.modificaImpegno(id, modifiche);
    const dopo = riapri();
    expect(dopo.promemoriaDovuti()).toHaveLength(1);
    expect(dopo.promemoriaDovuti()).toEqual([]);
  });
  it("mantiene il Promemoria inviato cambiando solo titolo e rimuovendo la durata", () => {
    const { agenda, id, riapri } = prepara();
    agenda.promemoriaDovuti();
    expect(agenda.modificaImpegno(id, { titolo: "Controllo", durataMinuti: null })).toEqual({ ok: true });
    expect(riapri().giorno("2026-10-01").impegni[0]).not.toHaveProperty("durataMinuti");
    expect(riapri().promemoriaDovuti()).toEqual([]);
  });
  it("salvare gli stessi valori non ripete il Promemoria", () => {
    const { agenda, id, riapri } = prepara();
    agenda.promemoriaDovuti();
    agenda.modificaImpegno(id, { inizio: "2026-10-01T15:00", anticipoMinuti: 15 });
    expect(riapri().promemoriaDovuti()).toEqual([]);
  });
  it("cancella definitivamente e non emette più il Promemoria", () => {
    const { agenda, id, riapri } = prepara();
    expect(agenda.cancellaImpegno(id)).toEqual({ ok: true });
    expect(agenda.giorno("2026-10-01").impegni).toEqual([]);
    expect(riapri().giorniOccupati("2026-10")).toEqual([]);
    expect(riapri().promemoriaDovuti()).toEqual([]);
    expect(agenda.cancellaImpegno(id)).toMatchObject({ ok: false });
    expect(agenda.modificaImpegno(id, { titolo: "Assente" })).toMatchObject({ ok: false });
  });
  it.each([
    { titolo: "   " }, { inizio: "2026-02-31T15:00" }, { inizio: "2026-10-01T25:00" },
    { inizio: "2026-03-29T02:30" }, { inizio: "2026-1-1T09:00" },
    { durataMinuti: 0 }, { durataMinuti: -1 }, { durataMinuti: 1.5 },
    { anticipoMinuti: -1 }, { anticipoMinuti: NaN }, { anticipoMinuti: Infinity },
    { durataMinuti: Number.MAX_SAFE_INTEGER }, { anticipoMinuti: Number.MAX_SAFE_INTEGER },
  ])("rifiuta %j senza alterare l'Agenda né il salvataggio", (modifiche) => {
    const { agenda, id, riapri } = prepara();
    const prima = agenda.giorno("2026-10-01");
    expect(agenda.modificaImpegno(id, modifiche)).toMatchObject({ ok: false });
    expect(agenda.giorno("2026-10-01")).toEqual(prima);
    expect(riapri().giorno("2026-10-01")).toEqual(prima);
  });
  it("salva titolo, giorno, orario, durata e Anticipo mantenendo l'identità", () => {
    const { agenda, id, riapri } = prepara();
    expect(agenda.modificaImpegno(id, {
      titolo: " Visita di controllo ", inizio: "2026-10-02T16:30", durataMinuti: 30, anticipoMinuti: null,
    })).toEqual({ ok: true });
    expect(agenda.giorno("2026-10-01").impegni).toEqual([]);
    expect(riapri().giorno("2026-10-02").impegni).toMatchObject([
      { id, titolo: "Visita di controllo", inizio: "2026-10-02T16:30", durataMinuti: 30, anticipoMinuti: null },
    ]);
    expect(agenda.giorniOccupati("2026-10")).toEqual(["2026-10-02"]);
  });
});
