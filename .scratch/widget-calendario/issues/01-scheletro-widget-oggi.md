# 01: Scheletro: il Widget mostra la giornata di oggi

**What to build:** avviando l'app compare sul desktop il Widget: una finestra Electron senza bordi con il mini-calendario del mese corrente (oggi evidenziato, settimana da lunedì) e, sotto, la lista del giorno di oggi. Con l'Agenda vuota mostra un messaggio chiaro di giornata vuota. È la prima fetta verticale: Nucleo dell'Agenda (con orologio e archivio iniettati) → Archivio su file JSON nella cartella dati dell'utente → processo principale → renderer via preload/IPC. Vedi la spec in `.scratch/widget-calendario/spec.md` e il glossario in `CONTEXT.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Il repo è inizializzato come progetto Node con Electron e Vitest; un comando avvia l'app e uno esegue i test
- [x] Il Nucleo dell'Agenda espone `giorno(data)` e riceve dall'esterno orologio e archivio; nessuna dipendenza da Electron o DOM
- [x] L'Archivio su file legge l'Agenda dal file JSON (formato `versione`, `impegni`, `coseDaFare` della spec); se il file non esiste parte da un'Agenda vuota
- [x] Il Widget mostra il mini-calendario del mese corrente con oggi evidenziato
- [x] Il Widget mostra "giornata vuota" (o simile) quando oggi non ha nulla
- [x] Un Impegno scritto a mano nel file per oggi compare nella lista all'avvio
- [x] Il renderer usa `contextIsolation` e parla col Nucleo solo tramite preload/IPC
- [x] Test Vitest sul Nucleo con orologio finto e archivio in memoria: `giorno` restituisce gli elementi del giorno richiesto e non quelli di altri giorni
