import { app, BrowserWindow, dialog, ipcMain, Menu, nativeImage, screen, Tray } from "electron";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const MINIMO = { width: 260, height: 320 };

/** Finestra, impostazioni e controlli desktop del Widget. @param {string} qui */
export function creaWidget(qui) {
  const percorso = join(app.getPath("userData"), "widget.json");
  let impostazioni = leggiImpostazioni(percorso);
  let inPrimoPiano = impostazioni.inPrimoPiano;
  let avviaConWindows = impostazioni.avviaConWindows;
  // In sviluppo Electron deve ricevere il percorso assoluto del progetto:
  // Windows non usa la directory corrente di `npm start` all'accesso.
  const avvio = { name: "Calendario", path: process.execPath,
    args: app.isPackaged ? [] : [`"${app.getAppPath()}"`] };
  function registraAvvio() {
    try {
      app.setLoginItemSettings({ ...avvio, openAtLogin: avviaConWindows, enabled: avviaConWindows });
    } catch (errore) {
      dialog.showErrorBox("Avvio con Windows", `Impossibile aggiornare l'avvio automatico: ${errore}`);
    }
  }
  function avvioAttivo() {
    return app.getLoginItemSettings(avvio).launchItems.some(voce =>
      voce.name === avvio.name && voce.scope === "user" && voce.enabled);
  }
  registraAvvio();
  let inUscita = false;
  const widget = new BrowserWindow({
    ...rettangoloVisibile(impostazioni.rettangolo),
    minWidth: MINIMO.width,
    minHeight: MINIMO.height,
    frame: false,
    transparent: true,
    // Le finestre trasparenti non supportano il ridimensionamento nativo.
    // I bordi del renderer usano setBounds attraverso un IPC dedicato.
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    show: false,
    webPreferences: { preload: join(qui, "preload.cjs"), contextIsolation: true, sandbox: true },
  });
  // resizable:false inizialmente blocca anche i limiti alla dimensione iniziale.
  // Ripristina i limiti per il ridimensionamento esplicito dei nostri bordi.
  widget.setMinimumSize(MINIMO.width, MINIMO.height);
  widget.setMaximumSize(0, 0);
  const tray = new Tray(iconaCalendario());
  tray.setToolTip("Calendario");

  function salva() {
    impostazioni = { rettangolo: widget.getBounds(), inPrimoPiano, avviaConWindows };
    try {
      mkdirSync(dirname(percorso), { recursive: true });
      writeFileSync(`${percorso}.tmp`, JSON.stringify(impostazioni, null, 2), "utf8");
      renameSync(`${percorso}.tmp`, percorso);
    } catch (errore) {
      console.error("Impossibile salvare le impostazioni del Widget:", errore);
    }
  }

  function alternaVisibilita() {
    if (widget.isVisible()) widget.hide();
    else { widget.show(); widget.focus(); }
  }

  function aggiornaMenu() {
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: widget.isVisible() ? "Nascondi" : "Mostra", click: alternaVisibilita },
      { label: "Modalità in primo piano", type: "checkbox", checked: inPrimoPiano, click: (voce) => {
        inPrimoPiano = voce.checked;
        applicaModalita();
        salva();
        aggiornaMenu();
      } },
      { label: "Avvia con Windows", type: "checkbox", checked: avvioAttivo(), click: (voce) => {
        avviaConWindows = voce.checked;
        registraAvvio();
        salva();
        aggiornaMenu();
      } },
      { type: "separator" },
      { label: "Esci", click: () => app.quit() },
    ]));
  }
  function applicaModalita() {
    // Su Windows il livello floating può perdere il topmost quando Electron
    // riordina la finestra dietro la barra delle applicazioni.
    widget.setAlwaysOnTop(inPrimoPiano, "pop-up-menu");
  }
  tray.on("click", alternaVisibilita);
  widget.on("show", aggiornaMenu);
  widget.on("hide", aggiornaMenu);
  widget.on("moved", salva);
  widget.on("close", (evento) => {
    if (!inUscita) { evento.preventDefault(); widget.hide(); }
  });
  app.on("before-quit", () => { inUscita = true; terminaRidimensionamento(); salva(); });
  widget.on("closed", () => tray.destroy());

  /** @type {ReturnType<typeof setInterval> | undefined} */
  let ridimensionamento;
  /** @type {(() => void) | undefined} */
  let aggiornaDimensioni;
  function terminaRidimensionamento() {
    if (!ridimensionamento) return;
    aggiornaDimensioni?.();
    clearInterval(ridimensionamento);
    ridimensionamento = undefined;
    aggiornaDimensioni = undefined;
    salva();
  }
  ipcMain.on("widget:ridimensiona", (evento, bordo, puntatore) => {
    if (evento.sender !== widget.webContents || !["n", "s", "e", "w", "ne", "nw", "se", "sw"].includes(bordo)) return;
    if (!puntatore || !Number.isFinite(puntatore.x) || !Number.isFinite(puntatore.y)) return;
    terminaRidimensionamento();
    const iniziale = widget.getBounds();
    aggiornaDimensioni = () => {
      const ora = screen.getCursorScreenPoint();
      const dx = ora.x - puntatore.x;
      const dy = ora.y - puntatore.y;
      const width = Math.max(MINIMO.width, iniziale.width + (bordo.includes("w") ? -dx : bordo.includes("e") ? dx : 0));
      const height = Math.max(MINIMO.height, iniziale.height + (bordo.includes("n") ? -dy : bordo.includes("s") ? dy : 0));
      widget.setBounds({ width, height,
        x: iniziale.x + (bordo.includes("w") ? iniziale.width - width : 0),
        y: iniziale.y + (bordo.includes("n") ? iniziale.height - height : 0),
      });
    };
    ridimensionamento = setInterval(aggiornaDimensioni, 16);
  });
  ipcMain.on("widget:fineRidimensionamento", (evento) => {
    if (evento.sender === widget.webContents) terminaRidimensionamento();
  });
  widget.on("blur", terminaRidimensionamento);
  widget.on("hide", terminaRidimensionamento);
  function recuperaSchermo() {
    widget.setBounds(rettangoloVisibile(widget.getBounds()));
    salva();
  }
  screen.on("display-removed", recuperaSchermo);
  screen.on("display-metrics-changed", recuperaSchermo);
  aggiornaMenu();
  widget.once("ready-to-show", () => {
    widget.showInactive();
    applicaModalita();
  });
  widget.loadFile(join(qui, "..", "widget", "index.html"));
  return widget;
}

/** @param {string} percorso */
function leggiImpostazioni(percorso) {
  try {
    const dati = JSON.parse(readFileSync(percorso, "utf8"));
    const r = dati.rettangolo;
    if (r && [r.x, r.y, r.width, r.height].every(Number.isSafeInteger) && r.width > 0 && r.height > 0) {
      return { rettangolo: /** @type {Electron.Rectangle} */ (r), inPrimoPiano: dati.inPrimoPiano === true,
        avviaConWindows: dati.avviaConWindows !== false };
    }
    return { rettangolo: undefined, inPrimoPiano: dati.inPrimoPiano === true,
      avviaConWindows: dati.avviaConWindows !== false };
  } catch { /* Primo avvio o impostazioni illeggibili: valori predefiniti. */ }
  return { rettangolo: undefined, inPrimoPiano: false, avviaConWindows: true };
}

/** Mantiene tutta la finestra raggiungibile nell'area di lavoro. @param {Electron.Rectangle | undefined} r */
function rettangoloVisibile(r) {
  const schermo = r && screen.getAllDisplays().find(({ workArea: a }) =>
    r.x < a.x + a.width && r.x + r.width > a.x && r.y < a.y + a.height && r.y + r.height > a.y);
  const a = (schermo || screen.getPrimaryDisplay()).workArea;
  const width = Math.max(MINIMO.width, Math.min(r?.width ?? 320, a.width));
  const height = Math.max(MINIMO.height, Math.min(r?.height ?? 460, a.height));
  return { width, height,
    x: schermo && r ? Math.max(a.x, Math.min(r.x, a.x + a.width - width)) : a.x + Math.round((a.width - width) / 2),
    y: schermo && r ? Math.max(a.y, Math.min(r.y, a.y + a.height - height)) : a.y + Math.round((a.height - height) / 2),
  };
}

/** Piccolo calendario BGRA, leggibile anche nell'area di notifica. */
function iconaCalendario() {
  const pixel = Buffer.alloc(16 * 16 * 4);
  for (let y = 1; y < 15; y++) for (let x = 1; x < 15; x++) {
    const punto = y >= 7 && y % 3 === 1 && x >= 4 && x <= 12 && x % 3 === 1;
    const colore = y < 5 ? [48, 59, 255, 255] : punto ? [80, 80, 80, 255] : [248, 248, 248, 255];
    pixel.set(colore, (y * 16 + x) * 4);
  }
  return nativeImage.createFromBitmap(pixel, { width: 16, height: 16 });
}
