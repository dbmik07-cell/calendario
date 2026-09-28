// Unico ponte tra il Widget e il processo principale.
const { contextBridge, ipcRenderer } = require("electron");

// Ogni metodo del Nucleo dell'Agenda diventa una chiamata IPC "agenda:<metodo>".
const METODI_DEL_NUCLEO = ["oggi", "giorno", "giorniOccupati", "aggiungiDaTesto", "segnaFatta", "cancellaCosaDaFare", "modificaImpegno", "cancellaImpegno", "avvisoArchivio"];

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
  /** @param {(avviso: string | null) => void} callback */
  suAgendaAggiornata: (callback) => ipcRenderer.on("widget:agendaAggiornata", (_evento, avviso) => callback(avviso)),
  /** @param {string} bordo @param {{ x: number, y: number }} puntatore */
  ridimensiona: (bordo, puntatore) => ipcRenderer.send("widget:ridimensiona", bordo, puntatore),
  fineRidimensionamento: () => ipcRenderer.send("widget:fineRidimensionamento"),
  /** @param {(giorno: string) => void} callback chiamata quando il Widget deve mostrare un giorno */
  suMostraGiorno: (callback) => ipcRenderer.on("widget:mostraGiorno", (_evento, giorno) => callback(giorno)),
});
