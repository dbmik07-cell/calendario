// Unico ponte tra il Widget e il Nucleo dell'Agenda.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("agenda", {
  oggi: () => ipcRenderer.invoke("agenda:oggi"),
  /** @param {string} data */
  giorno: (data) => ipcRenderer.invoke("agenda:giorno", data),
  /** @param {string} frase */
  aggiungiDaTesto: (frase) => ipcRenderer.invoke("agenda:aggiungiDaTesto", frase),
});
