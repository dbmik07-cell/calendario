// Unico ponte tra il Widget e il Nucleo dell'Agenda: ogni metodo diventa una chiamata IPC.
const { contextBridge, ipcRenderer } = require("electron");

const METODI_DEL_NUCLEO = ["oggi", "giorno", "aggiungiDaTesto", "segnaFatta", "cancellaCosaDaFare"];

contextBridge.exposeInMainWorld(
  "agenda",
  Object.fromEntries(
    METODI_DEL_NUCLEO.map((metodo) => [
      metodo,
      (/** @type {unknown[]} */ ...argomenti) => ipcRenderer.invoke(`agenda:${metodo}`, ...argomenti),
    ]),
  ),
);
