import { mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { creaArchivioSuFile } from "../src/archivio-su-file.js";
import { datiVuoti } from "../src/nucleo/dati.js";
import { creaAgenda } from "../src/nucleo/agenda.js";

describe("Archivio su file", () => {
  it("riprende dopo un errore temporaneo di salvataggio anche se il file non cambia", async () => {
    const percorso = join(cartella, "agenda.json");
    writeFileSync(percorso, JSON.stringify({ ...datiVuoti(), coseDaFare: [{ titolo: "Banca", giorno: "2026-10-01", fatta: false }] }));
    mkdirSync(`${percorso}.tmp`);
    const archivio = creaArchivioSuFile(percorso);
    const agenda = creaAgenda({ archivio, orologio: () => new Date("2026-10-01T09:00") });
    expect(agenda.avvisoArchivio()).toEqual(expect.any(String));
    const chiudi = archivio.osserva(() => { agenda.ricarica(); }, () => agenda.avvisoArchivio() !== null);
    try {
      rmSync(`${percorso}.tmp`, { recursive: true });
      await vi.waitFor(() => expect(agenda.avvisoArchivio()).toBeNull(), { timeout: 3000 });
      expect(agenda.giorno("2026-10-01").coseDaFare).toMatchObject([{ id: expect.any(String), titolo: "Banca" }]);
    } finally { chiudi(); }
  });
  it("osserva aggiunte e rinomine esterne, ignorando scritture proprie e contenuto identico", async () => {
    const percorso = join(cartella, "agenda.json");
    const archivio = creaArchivioSuFile(percorso);
    archivio.carica();
    const cambiato = vi.fn(() => archivio.carica());
    const chiudi = archivio.osserva(cambiato);
    try {
      archivio.salva(datiVuoti());
      await new Promise((r) => setTimeout(r, 1200));
      expect(cambiato).not.toHaveBeenCalled();
      const esterni = { ...datiVuoti(), coseDaFare: [{ id: "x", titolo: "Banca", giorno: "2026-10-01", fatta: false }] };
      writeFileSync(`${percorso}.esterno`, JSON.stringify(esterni));
      renameSync(`${percorso}.esterno`, percorso);
      await vi.waitFor(() => expect(cambiato).toHaveBeenCalledTimes(1), { timeout: 3000 });
      expect(archivio.carica()).toEqual(esterni);
      writeFileSync(percorso, JSON.stringify(esterni));
      await new Promise((r) => setTimeout(r, 1200));
      expect(cambiato).toHaveBeenCalledTimes(1);
    } finally { chiudi(); }
  });
  it("se il JSON è danneggiato segnala l'errore e impedisce di sovrascriverlo", () => {
    const percorso = join(cartella, "agenda.json");
    const archivio = creaArchivioSuFile(percorso);
    archivio.salva(datiVuoti());
    writeFileSync(percorso, '{"versione":', "utf8");
    expect(() => archivio.carica()).toThrow();
    expect(() => archivio.salva(datiVuoti())).toThrow();
    expect(readFileSync(percorso, "utf8")).toBe('{"versione":');
  });
  it("rifiuta un salvataggio se il file cambia dopo la lettura", () => {
    const percorso = join(cartella, "agenda.json");
    const archivio = creaArchivioSuFile(percorso);
    archivio.salva(datiVuoti());
    archivio.carica();
    const esterno = JSON.stringify({ ...datiVuoti(), coseDaFare: [{ id: "x", titolo: "Banca", giorno: "2026-10-01", fatta: false }] });
    writeFileSync(percorso, esterno);
    expect(() => archivio.salva(datiVuoti())).toThrow();
    expect(readFileSync(percorso, "utf8")).toBe(esterno);
  });
  /** @type {string} */
  let cartella;
  beforeEach(() => {
    cartella = mkdtempSync(join(tmpdir(), "agenda-"));
  });
  afterEach(() => {
    rmSync(cartella, { recursive: true, force: true });
  });

  it("parte da un'Agenda vuota se il file non esiste", () => {
    const archivio = creaArchivioSuFile(join(cartella, "agenda.json"));

    expect(archivio.carica()).toEqual(datiVuoti());
  });

  it("legge un'Agenda scritta a mano", () => {
    const percorso = join(cartella, "agenda.json");
    const dati = {
      versione: 1,
      impegni: [{ id: "a", titolo: "Dentista", inizio: "2026-10-01T15:00", anticipoMinuti: 15, promemoriaInviato: false }],
      coseDaFare: [],
    };
    writeFileSync(percorso, JSON.stringify(dati), "utf8");

    expect(creaArchivioSuFile(percorso).carica()).toEqual(dati);
  });

  it("salva l'Agenda e la rilegge, creando la cartella se manca e senza lasciare file temporanei", () => {
    const percorso = join(cartella, "dati", "agenda.json");
    /** @type {import("../src/nucleo/tipi.js").DatiAgenda} */
    const dati = {
      versione: 1,
      impegni: [{ id: "a", titolo: "Dentista", inizio: "2026-10-01T15:00", anticipoMinuti: 15, promemoriaInviato: false }],
      coseDaFare: [],
    };

    creaArchivioSuFile(percorso).salva(dati);

    expect(creaArchivioSuFile(percorso).carica()).toEqual(dati);
    expect(readdirSync(join(cartella, "dati"))).toEqual(["agenda.json"]);
  });
});
