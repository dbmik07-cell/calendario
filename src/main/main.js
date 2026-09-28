import { app, ipcMain, Notification } from "electron";
import { creaWidget } from "./widget.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { creaArchivioSuFile } from "../archivio-su-file.js";
import { creaAgenda } from "../nucleo/agenda.js";
import { aggiungiMinuti, giornoDi, orarioDi } from "../nucleo/data-locale.js";

/** @import { Impegno } from "../nucleo/tipi.js" */

const qui = dirname(fileURLToPath(import.meta.url));
const CONTROLLO_PROMEMORIA_MS = 30_000;

// Senza un AppUserModelID Windows non mostra le notifiche di un'app non installata.
app.setAppUserModelId(app.isPackaged ? "it.calendario.widget" : process.execPath);

app.whenReady().then(() => {
  const archivio = creaArchivioSuFile(join(app.getPath("userData"), "agenda.json"));
  const agenda = creaAgenda({
    orologio: () => new Date(),
    archivio,
  });

  const widget = creaWidget(qui);
  const pubblicaAggiornamento = () => {
    if (!widget.isDestroyed()) widget.webContents.send("widget:agendaAggiornata", agenda.avvisoArchivio());
  };

  // Ogni metodo del Nucleo risponde a "agenda:<metodo>" (vedi preload.cjs).
  for (const [metodo, funzione] of Object.entries(agenda)) {
    ipcMain.handle(`agenda:${metodo}`, (_evento, ...argomenti) => {
      const risultato = /** @type {(...a: unknown[]) => unknown} */ (funzione)(...argomenti);
      if (!["oggi", "giorno", "giorniOccupati", "avvisoArchivio"].includes(metodo)) pubblicaAggiornamento();
      return risultato;
    });
  }
  const terminaOsservazione = archivio.osserva(
    () => { agenda.ricarica(); pubblicaAggiornamento(); },
    () => agenda.avvisoArchivio() !== null,
  );
  app.on("before-quit", terminaOsservazione);

  /** @param {Impegno} impegno */
  function mostraPromemoria(impegno) {
    const fine = impegno.durataMinuti ? `–${orarioDi(aggiungiMinuti(impegno.inizio, impegno.durataMinuti))}` : "";
    const notifica = new Notification({ title: impegno.titolo, body: `Alle ${orarioDi(impegno.inizio)}${fine}` });
    notifica.on("click", () => {
      widget.show();
      widget.focus();
      widget.webContents.send("widget:mostraGiorno", giornoDi(impegno.inizio));
    });
    notifica.show();
  }

  const controllaPromemoria = () => {
    agenda.promemoriaDovuti().forEach(mostraPromemoria);
    pubblicaAggiornamento();
  };
  controllaPromemoria();
  setInterval(controllaPromemoria, CONTROLLO_PROMEMORIA_MS);
});

app.on("window-all-closed", () => app.quit());
