import { describe, expect, it } from "vitest";
import { creaAgenda } from "../src/nucleo/agenda.js";
import { datiVuoti } from "../src/nucleo/dati.js";
import { creaArchivioInMemoria } from "./supporto/archivio-in-memoria.js";

/** @param {string} isoLocale */
const orologioFermoA = (isoLocale) => () => new Date(isoLocale);

const archivioVuoto = () => creaArchivioInMemoria(datiVuoti());

describe("oggi", () => {
  it("è la data locale dell'orologio", () => {
    const agenda = creaAgenda({ orologio: orologioFermoA("2026-12-31T23:59"), archivio: archivioVuoto() });

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
  const nuovaAgenda = (archivio = archivioVuoto()) =>
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
    ["venerdì alle 10 palestra", "2026-10-02T10:00"],
    ["lunedi alle 10 palestra", "2026-10-05T10:00"],
    ["Mercoledì alle 10 palestra", "2026-10-07T10:00"],
    ["giovedì alle 10 palestra", "2026-10-01T10:00"],
    ["giovedì alle 8 palestra", "2026-10-08T08:00"],
  ])("un giorno della settimana, %j, è la prossima occorrenza", (frase, inizio) => {
    expect(nuovaAgenda().aggiungiDaTesto(frase)).toMatchObject({ impegno: { titolo: "Palestra", inizio } });
  });

  it.each([
    ["il 12 alle 10 palestra", "2026-10-12T10:00"],
    ["il 1 alle 10 palestra", "2026-10-01T10:00"],
    ["il 1 alle 8 palestra", "2026-11-01T08:00"],
    ["12/10 alle 10 palestra", "2026-10-12T10:00"],
    ["12/10/2027 alle 10 palestra", "2027-10-12T10:00"],
    ["12 ottobre alle 10 palestra", "2026-10-12T10:00"],
    ["il 12 Ottobre alle 10 palestra", "2026-10-12T10:00"],
    ["5 marzo alle 10 palestra", "2027-03-05T10:00"],
    ["5 marzo 2028 alle 10 palestra", "2028-03-05T10:00"],
    ["29/02 alle 10 palestra", "2028-02-29T10:00"],
    ["29/02/2028 alle 10 palestra", "2028-02-29T10:00"],
  ])("una data precisa, %j, è %j", (frase, inizio) => {
    expect(nuovaAgenda().aggiungiDaTesto(frase)).toMatchObject({ impegno: { titolo: "Palestra", inizio } });
  });

  it.each([
    ["2026-12-31T23:00", "domani alle 10 palestra", "2027-01-01T10:00"],
    ["2026-12-31T23:00", "il 1 alle 10 palestra", "2027-01-01T10:00"],
    ["2026-12-31T23:00", "alle 10 palestra", "2027-01-01T10:00"],
    ["2026-10-31T09:00", "domani alle 10 palestra", "2026-11-01T10:00"],
    ["2026-11-05T09:00", "il 31 alle 10 palestra", "2026-12-31T10:00"],
    ["2028-02-28T09:00", "domani alle 10 palestra", "2028-02-29T10:00"],
    ["2027-02-28T09:00", "domani alle 10 palestra", "2027-03-01T10:00"],
  ])("a cavallo di mesi e anni: alle %s, %j è %j", (ora, frase, inizio) => {
    const agenda = creaAgenda({ orologio: orologioFermoA(ora), archivio: archivioVuoto() });

    expect(agenda.aggiungiDaTesto(frase)).toMatchObject({ impegno: { titolo: "Palestra", inizio } });
  });

  it.each([
    ["domani alle 15:30 dentista", "2026-10-02T15:30"],
    ["domani 15:30 dentista", "2026-10-02T15:30"],
    ["domani 15.30 dentista", "2026-10-02T15:30"],
    ["domani alle 9 dentista", "2026-10-02T09:00"],
    ["domani alle 07 dentista", "2026-10-02T07:00"],
    ["domani alle 9 e mezza dentista", "2026-10-02T09:30"],
    ["domani alle 9 e un quarto dentista", "2026-10-02T09:15"],
    ["domani alle 9 e tre quarti dentista", "2026-10-02T09:45"],
    ["domani dentista alle 15.", "2026-10-02T15:00"],
  ])("capisce l'orario in %j", (frase, inizio) => {
    expect(nuovaAgenda().aggiungiDaTesto(frase)).toMatchObject({ impegno: { titolo: "Dentista", inizio } });
  });

  it.each([
    ["domani alle 15 dentista per un'ora", "2026-10-02T15:00", 60],
    ["domani alle 15 dentista per un’ora", "2026-10-02T15:00", 60],
    ["domani alle 15 dentista per 2 ore", "2026-10-02T15:00", 120],
    ["domani alle 15 dentista per 30 minuti", "2026-10-02T15:00", 30],
    ["domani alle 15 dentista per mezz'ora", "2026-10-02T15:00", 30],
    ["domani dalle 15 alle 17 dentista", "2026-10-02T15:00", 120],
    ["domani dalle 9:30 alle 10 dentista", "2026-10-02T09:30", 30],
    ["domani dalle 15 e un quarto alle 16 e mezza dentista", "2026-10-02T15:15", 75],
  ])("capisce la durata in %j", (frase, inizio, durataMinuti) => {
    expect(nuovaAgenda().aggiungiDaTesto(frase)).toMatchObject({
      impegno: { titolo: "Dentista", inizio, durataMinuti },
    });
  });

  it("senza durata l'Impegno non ha durataMinuti", () => {
    const risultato = nuovaAgenda().aggiungiDaTesto("domani alle 15 dentista");

    expect(risultato.ok && "durataMinuti" in risultato.impegno).toBe(false);
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
    ["riunione sala 10.15 alle 16", "Riunione sala 10.15"],
    ["alle 18 caffè al bar", "Caffè al bar"],
    ["domani alle 15 la visita", "La visita"],
  ])("il titolo di %j è %j", (frase, titolo) => {
    expect(nuovaAgenda().aggiungiDaTesto(frase)).toMatchObject({ impegno: { titolo } });
  });

  it.each([
    ["", "Scrivi cosa devi fare e quando"],
    ["domani dentista", "Manca l'orario"],
    ["domani alle 15", "Manca il titolo"],
    ["domani alle 25 dentista", "Orario non valido"],
    ["domani alle 15:75 dentista", "Orario non valido"],
    ["domani alle 15:3 dentista", "Orario non valido"],
    ["domani alle 15:300 dentista", "Orario non valido"],
    ["domani alle 15.30.00 dentista", "Orario non valido"],
    ["domani alle 15:30dentista", "Orario non valido"],
    ["domani alle 15 alle 16 dentista", "Indica un solo orario"],
    ["domani alle 15 di", "Manca il titolo"],
    ["   ", "Scrivi cosa devi fare e quando"],
    ["domani dalle 17 alle 15 dentista", "La fine deve venire dopo l'inizio"],
    ["domani dalle 15 alle 25 dentista", "Orario non valido"],
    ["domani per un'ora dentista", "Manca l'orario"],
    ["oggi alle 15 domani dentista", "Indica un solo giorno"],
    ["31/02 alle 10 dentista", "Data non valida"],
    ["29/02/2027 alle 10 dentista", "Data non valida"],
    ["31 aprile alle 10 dentista", "Data non valida"],
    ["il 32 alle 10 dentista", "Data non valida"],
    ["12/13 alle 10 dentista", "Data non valida"],
  ])("%j dà l'errore %j e non salva nulla", (frase, errore) => {
    const archivio = archivioVuoto();
    const agenda = nuovaAgenda(archivio);

    expect(agenda.aggiungiDaTesto(frase)).toEqual({ ok: false, errore: expect.stringContaining(errore) });
    expect(agenda.giorno("2026-10-02").impegni).toEqual([]);
    expect(archivio.carica().impegni).toEqual([]);
  });

  it("un orario che non esiste per il passaggio all'ora legale dà errore", () => {
    const agenda = creaAgenda({ orologio: orologioFermoA("2026-03-28T09:00"), archivio: archivioVuoto() });

    expect(agenda.aggiungiDaTesto("domani alle 2:30 treno")).toEqual({
      ok: false,
      errore: expect.stringContaining("ora legale"),
    });
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
    const archivio = archivioVuoto();
    nuovaAgenda(archivio).aggiungiDaTesto("domani alle 15 dentista");

    expect(nuovaAgenda(archivio).giorno("2026-10-02").impegni.map((i) => i.titolo)).toEqual(["Dentista"]);
  });
});
