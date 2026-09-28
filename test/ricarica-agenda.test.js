import { describe, expect, it } from "vitest";
import { creaAgenda } from "../src/nucleo/agenda.js";
import { datiVuoti } from "../src/nucleo/dati.js";
import { creaArchivioInMemoria } from "./supporto/archivio-in-memoria.js";

function prepara() {
  const archivio = creaArchivioInMemoria(datiVuoti());
  const agenda = creaAgenda({ archivio, orologio: () => new Date("2026-10-01T14:50") });
  agenda.aggiungiDaTesto("oggi alle 15 dentista");
  return { archivio, agenda };
}

describe("ricarica dell'Agenda", () => {
  it("un salvataggio fallito non altera la memoria e non consuma un Promemoria", () => {
    const memoria = creaArchivioInMemoria(datiVuoti());
    let fallisce = false;
    const archivio = { carica: memoria.carica, salva: (/** @type {import('../src/nucleo/tipi.js').DatiAgenda} */ dati) => {
      if (fallisce) throw new Error("File cambiato");
      memoria.salva(dati);
    } };
    const agenda = creaAgenda({ archivio, orologio: () => new Date("2026-10-01T14:50") });
    agenda.aggiungiDaTesto("oggi alle 15 dentista");
    const prima = agenda.giorno("2026-10-01");
    fallisce = true;
    expect(agenda.aggiungiDaTesto("oggi banca")).toMatchObject({ ok: false });
    expect(agenda.giorno("2026-10-01")).toEqual(prima);
    fallisce = false;
    agenda.ricarica();
    fallisce = true;
    expect(agenda.promemoriaDovuti()).toEqual([]);
    expect(agenda.giorno("2026-10-01")).toEqual(prima);
    fallisce = false;
    agenda.ricarica();
    expect(agenda.promemoriaDovuti()).toHaveLength(1);
  });
  it("non risalva un'Agenda valida e non ripete il Promemoria per un cambio di titolo", () => {
    const { archivio, agenda } = prepara();
    agenda.promemoriaDovuti();
    const esterni = archivio.carica();
    esterni.impegni[0].titolo = "Controllo";
    archivio.salva(esterni);
    const senzaScritture = { carica: archivio.carica, salva: () => { throw new Error("Scrittura inutile"); } };
    const riaperta = creaAgenda({ archivio: senzaScritture, orologio: () => new Date("2026-10-01T14:50") });
    expect(riaperta.ricarica()).toEqual({ ok: true });
    expect(riaperta.promemoriaDovuti()).toEqual([]);
  });
  it("assegna e salva id stabili agli elementi aggiunti senza id", () => {
    const { archivio, agenda } = prepara();
    const esterni = archivio.carica();
    Reflect.deleteProperty(esterni.impegni[0], "id");
    esterni.coseDaFare.push(JSON.parse('{"titolo":"Banca","giorno":"2026-10-02","fatta":false}'));
    archivio.salva(esterni);
    expect(agenda.ricarica()).toEqual({ ok: true });
    const idImpegno = agenda.giorno("2026-10-01").impegni[0].id;
    const idCosa = agenda.giorno("2026-10-02").coseDaFare[0].id;
    expect(idImpegno).toEqual(expect.any(String));
    expect(idCosa).toEqual(expect.any(String));
    expect(idImpegno).not.toBe(idCosa);
    agenda.ricarica();
    const riaperta = creaAgenda({ archivio, orologio: () => new Date("2026-10-01T14:50") });
    expect(riaperta.giorno("2026-10-01").impegni[0].id).toBe(idImpegno);
    expect(riaperta.giorno("2026-10-02").coseDaFare[0].id).toBe(idCosa);
  });
  it("riattiva il Promemoria se cambia esternamente inizio o Anticipo", () => {
    const { archivio, agenda } = prepara();
    agenda.promemoriaDovuti();
    const esterni = archivio.carica();
    esterni.impegni[0].inizio = "2026-10-01T15:05";
    archivio.salva(esterni);
    agenda.ricarica();
    expect(agenda.promemoriaDovuti()).toHaveLength(1);
    const altri = archivio.carica();
    altri.impegni[0].anticipoMinuti = 20;
    archivio.salva(altri);
    agenda.ricarica();
    expect(agenda.promemoriaDovuti()).toHaveLength(1);
  });
  it.each([
    '{"versione":2,"impegni":[],"coseDaFare":[]}',
    '{"versione":1,"impegni":{},"coseDaFare":[]}',
    '{"versione":1,"impegni":[{"titolo":"X","inizio":"2026-02-31T15:00","anticipoMinuti":15,"promemoriaInviato":false}],"coseDaFare":[]}',
    '{"versione":1,"impegni":[],"coseDaFare":[{"id":"x","titolo":"X","giorno":"2026-10-01","fatta":false},{"id":"x","titolo":"Y","giorno":"2026-10-01","fatta":false}]}',
  ])("rifiuta dati non validi e blocca le scritture fino alla correzione: %s", (contenuto) => {
    const { archivio, agenda } = prepara();
    const valida = archivio.carica();
    const id = valida.impegni[0].id;
    archivio.salva(JSON.parse(contenuto));
    expect(agenda.ricarica()).toMatchObject({ ok: false });
    expect(agenda.avvisoArchivio()).toEqual(expect.any(String));
    expect(agenda.giorno("2026-10-01").impegni).toMatchObject([{ titolo: "Dentista" }]);
    expect(agenda.aggiungiDaTesto("oggi banca")).toMatchObject({ ok: false });
    expect(agenda.modificaImpegno(id, { titolo: "Altro" })).toMatchObject({ ok: false });
    expect(agenda.cancellaImpegno(id)).toMatchObject({ ok: false });
    expect(agenda.segnaFatta("assente", true)).toMatchObject({ ok: false });
    expect(agenda.cancellaCosaDaFare("assente")).toMatchObject({ ok: false });
    expect(agenda.promemoriaDovuti()).toEqual([]);
    archivio.salva(valida);
    expect(agenda.ricarica()).toEqual({ ok: true });
    expect(agenda.avvisoArchivio()).toBeNull();
    expect(agenda.aggiungiDaTesto("oggi banca")).toMatchObject({ ok: true });
  });
  it("all'avvio con un archivio illeggibile resta vuota e segnala senza scrivere", () => {
    const archivio = { carica: () => { throw new Error("JSON non valido"); }, salva: () => { throw new Error("Non deve scrivere"); } };
    const agenda = creaAgenda({ archivio, orologio: () => new Date("2026-10-01T09:00") });
    expect(agenda.giorniOccupati("2026-10")).toEqual([]);
    expect(agenda.avvisoArchivio()).toEqual(expect.any(String));
  });
  it("vede aggiunte, spostamenti e cancellazioni esterni", () => {
    const { archivio, agenda } = prepara();
    const esterni = archivio.carica();
    esterni.impegni[0].inizio = "2026-10-02T16:00";
    esterni.coseDaFare.push({ id: "banca", titolo: "Banca", giorno: "2026-10-02", fatta: false });
    archivio.salva(esterni);
    expect(agenda.ricarica()).toEqual({ ok: true });
    expect(agenda.giorno("2026-10-01").impegni).toEqual([]);
    expect(agenda.giorno("2026-10-02")).toMatchObject({ impegni: [{ titolo: "Dentista" }], coseDaFare: [{ titolo: "Banca" }] });
    archivio.salva(datiVuoti());
    agenda.ricarica();
    expect(agenda.giorniOccupati("2026-10")).toEqual([]);
  });
});
