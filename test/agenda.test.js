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

describe("aggiungiDaTesto", () => {
  /** Giovedì 1 ottobre 2026, ore 9. */
  const adesso = "2026-10-01T09:00";
  const nuovaAgenda = (archivio = agendaVuota()) =>
    creaAgenda({ orologio: orologioFermoA(adesso), archivio });

  it("aggiunge un Impegno nel giorno e all'orario della Frase", () => {
    const agenda = nuovaAgenda();

    const risultato = agenda.aggiungiDaTesto("domani alle 15 dentista");

    expect(risultato).toMatchObject({
      ok: true,
      impegno: { titolo: "Dentista", inizio: "2026-10-02T15:00", anticipoMinuti: 15, promemoriaInviato: false },
    });
    expect(agenda.giorno("2026-10-02").impegni.map((i) => i.titolo)).toEqual(["Dentista"]);
  });

  it.each([
    ["oggi alle 18 palestra", "2026-10-01T18:00"],
    ["dopodomani alle 18 palestra", "2026-10-03T18:00"],
  ])("capisce il giorno in %j", (frase, inizio) => {
    expect(nuovaAgenda().aggiungiDaTesto(frase)).toMatchObject({ impegno: { titolo: "Palestra", inizio } });
  });

  it.each([
    ["domani alle 15:30 dentista", "2026-10-02T15:30"],
    ["domani 15:30 dentista", "2026-10-02T15:30"],
    ["domani 15.30 dentista", "2026-10-02T15:30"],
    ["domani alle 9 dentista", "2026-10-02T09:00"],
  ])("capisce l'orario in %j", (frase, inizio) => {
    expect(nuovaAgenda().aggiungiDaTesto(frase)).toMatchObject({ impegno: { titolo: "Dentista", inizio } });
  });

  it.each([
    ["alle 18 palestra", "2026-10-01T18:00"],
    ["alle 8 palestra", "2026-10-02T08:00"],
  ])("senza giorno, %j va a oggi o, se l'orario è passato, a domani", (frase, inizio) => {
    expect(nuovaAgenda().aggiungiDaTesto(frase)).toMatchObject({ impegno: { titolo: "Palestra", inizio } });
  });

  it.each([
    ["domani alle 15 dal dentista", "Dentista"],
    ["cena con Marco domani alle 20", "Cena con Marco"],
    ["riunione di lavoro alle 14 di domani", "Riunione di lavoro"],
  ])("il titolo di %j è %j", (frase, titolo) => {
    expect(nuovaAgenda().aggiungiDaTesto(frase)).toMatchObject({ impegno: { titolo } });
  });

  it.each([
    ["", "Scrivi cosa devi fare e quando"],
    ["domani dentista", "Manca l'orario"],
    ["domani alle 15", "Manca il titolo"],
    ["domani alle 25 dentista", "Orario non valido"],
    ["domani alle 15:75 dentista", "Orario non valido"],
  ])("%j dà l'errore %j e non salva nulla", (frase, errore) => {
    const archivio = agendaVuota();
    const agenda = nuovaAgenda(archivio);

    expect(agenda.aggiungiDaTesto(frase)).toEqual({ ok: false, errore: expect.stringContaining(errore) });
    expect(agenda.giorno("2026-10-02").impegni).toEqual([]);
    expect(archivio.carica().impegni).toEqual([]);
  });

  it("il giorno elenca gli Impegni in ordine di orario, ognuno con il suo id", () => {
    const agenda = nuovaAgenda();
    agenda.aggiungiDaTesto("domani alle 18 palestra");
    agenda.aggiungiDaTesto("domani alle 8:30 colazione con Anna");

    const impegni = agenda.giorno("2026-10-02").impegni;

    expect(impegni.map((i) => i.titolo)).toEqual(["Colazione con Anna", "Palestra"]);
    expect(new Set(impegni.map((i) => i.id)).size).toBe(2);
  });

  it("salva l'Impegno: un nuovo Nucleo sullo stesso archivio lo ritrova", () => {
    const archivio = agendaVuota();
    nuovaAgenda(archivio).aggiungiDaTesto("domani alle 15 dentista");

    expect(nuovaAgenda(archivio).giorno("2026-10-02").impegni.map((i) => i.titolo)).toEqual(["Dentista"]);
  });
});
