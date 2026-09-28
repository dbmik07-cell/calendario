// Unico ponte tra il Widget e il processo principale.
const { contextBridge, ipcRenderer } = require("electron");

// Ogni metodo del Nucleo dell'Agenda diventa una chiamata IPC "agenda:<metodo>".
const METODI_DEL_NUCLEO = ["oggi", "giorno", "giorniOccupati", "aggiungiDaTesto", "segnaFatta", "cancellaCosaDaFare"];

contextBridge.exposeInMainWorld(
  "agenda",
  Object.fromEntries(
    METODI_DEL_NUCLEO.map((metodo) => [
      metodo,
      (/** @type {unknown[]} */ ...argomenti) => ipcRenderer.invoke(`agenda:${metodo}`, ...argomenti),
    ]),
  ),
);

// Messaggi dal processo principale al Widget.
contextBridge.exposeInMainWorld("widget", {
  /** @param {(giorno: string) => void} callback chiamata quando il Widget deve mostrare un giorno */
  suMostraGiorno: (callback) => ipcRenderer.on("widget:mostraGiorno", (_evento, giorno) => callback(giorno)),
});
