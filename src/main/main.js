import { app, BrowserWindow, ipcMain } from "electron";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { creaArchivioSuFile } from "../archivio-su-file.js";
import { creaAgenda } from "../nucleo/agenda.js";

const qui = dirname(fileURLToPath(import.meta.url));

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
});

app.on("window-all-closed", () => app.quit());
