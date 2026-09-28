import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { creaArchivioSuFile } from "../src/archivio-su-file.js";

describe("Archivio su file", () => {
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

    expect(archivio.carica()).toEqual({ versione: 1, impegni: [], coseDaFare: [] });
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
