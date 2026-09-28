import { app, BrowserWindow, ipcMain, Notification } from "electron";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { creaArchivioSuFile } from "../archivio-su-file.js";
import { creaAgenda } from "../nucleo/agenda.js";
import { aggiungiMinuti, orarioDi } from "../nucleo/data-locale.js";

/** @import { Impegno } from "../nucleo/tipi.js" */

const qui = dirname(fileURLToPath(import.meta.url));
const CONTROLLO_PROMEMORIA_MS = 30_000;

// Senza un AppUserModelID Windows non mostra le notifiche di un'app non installata.
app.setAppUserModelId(app.isPackaged ? "it.calendario.widget" : process.execPath);

app.whenReady().then(() => {
  const agenda = creaAgenda({
    orologio: () => new Date(),
    archivio: creaArchivioSuFile(join(app.getPath("userData"), "agenda.json")),
  });

  // Ogni metodo del Nucleo risponde a "agenda:<metodo>" (vedi preload.cjs).
  for (const [metodo, funzione] of Object.entries(agenda)) {
    ipcMain.handle(`agenda:${metodo}`, (_evento, ...argomenti) =>
      /** @type {(...a: unknown[]) => unknown} */ (funzione)(...argomenti),
    );
  }

  const widget = new BrowserWindow({
    width: 320,
    height: 460,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: join(qui, "preload.cjs"),
      contextIsolation: true,
      sandbox: true,
    },
  });
  widget.loadFile(join(qui, "..", "widget", "index.html"));

  /** @param {Impegno} impegno */
  function mostraPromemoria(impegno) {
    const fine = impegno.durataMinuti ? `–${orarioDi(aggiungiMinuti(impegno.inizio, impegno.durataMinuti))}` : "";
    const notifica = new Notification({ title: impegno.titolo, body: `Alle ${orarioDi(impegno.inizio)}${fine}` });
    notifica.on("click", () => {
      widget.show();
      widget.focus();
    });
    notifica.show();
  }

  const controllaPromemoria = () => agenda.promemoriaDovuti().forEach(mostraPromemoria);
  controllaPromemoria();
  setInterval(controllaPromemoria, CONTROLLO_PROMEMORIA_MS);
});

app.on("window-all-closed", () => app.quit());
