# 08: Modifiche esterne tramite Claude Code

**What to build:** l'utente può chiedere a Claude Code di aggiungere, spostare o cancellare elementi scrivendo direttamente il file dell'Agenda. Il Widget se ne accorge e si aggiorna da solo. Gli elementi aggiunti a mano senza `id` ne ricevono uno. Un file scritto male non cancella i dati: il Widget tiene l'ultima Agenda valida e mostra un avviso. Il formato del file e la sua posizione sono documentati nel repo, così Claude Code sa come modificarlo.

**Blocked by:** 02 (Aggiungere un Impegno con una Frase semplice)

**Status:** resolved

- [x] Il Nucleo espone `ricarica()`; il processo principale osserva il file e la chiama quando cambia
- [x] Il Widget si aggiorna entro pochi secondi da una modifica esterna
- [x] Elementi senza `id` ricevono un `id`, salvato nel file
- [x] File JSON non valido: nessuna sovrascrittura, Agenda in memoria invariata, avviso visibile nel Widget; l'avviso sparisce quando il file torna valido
- [x] Le scritture dell'app stessa non causano ricariche inutili o cicli
- [x] Documento nel repo con percorso del file, formato e regole (`inizio` in ora locale, `anticipoMinuti: null` = nessun Promemoria, cambio di orario → `promemoriaInviato: false`), e un puntatore in `CLAUDE.md`
- [x] Test Vitest via Nucleo: `ricarica` dopo una modifica all'archivio in memoria, elementi senza `id`
- [x] Test Vitest sull'Archivio su file in una cartella temporanea: salva e rilegge, file non valido non sovrascritto e segnalato

## Comments

### Implementazione e verifica — 28 settembre 2026

- Il Nucleo valida tutta l'Agenda prima di aggiornarla o salvarla. Assegna id mancanti e riattiva i Promemoria se rileva cambiamenti esterni di inizio o Anticipo. Mantiene l'ultima Agenda valida in caso di errore; all'avvio con file illeggibile mostra un'Agenda vuota con avviso.
- Durante un errore di archivio, modifiche e Promemoria sono sospesi. I salvataggi falliti lasciano invariata la memoria; nessun Promemoria viene consumato senza salvataggio riuscito.
- L'Archivio osserva la cartella per intercettare sostituzioni atomiche e confronta i contenuti per ignorare le proprie scritture. Un controllo ogni secondo recupera eventi persi ed errori temporanei, anche quando il file torna leggibile senza cambiare byte. Ogni salvataggio controlla che il file non sia cambiato dall'ultima lettura.
- `docs/agenda.md` documenta percorso, formato, id, date locali, regole dei Promemoria e procedura di modifica; `CLAUDE.md` rimanda alla guida.
- TDD sul Nucleo e sull'Archivio: ricarica, aggiunte/spostamenti/cancellazioni esterne, id persistenti, file invalidi, salvataggi falliti, rinomine, assenza di cicli e recupero da un errore temporaneo di normalizzazione. Nessun test permanente aggiunto allo strato Electron.
- Verifica del Widget su profilo temporaneo: dopo JSON danneggiato, avviso visibile e Impegno valido ancora presente; aggiunta bloccata e file danneggiato invariato. Sostituzione atomica con Agenda valida: avviso rimosso, Cosa da fare esterna visibile, id salvato e contenuto stabile. Rimozione del file: avviso e dati in memoria conservati; ripristino: avviso rimosso. Catture del Widget ispezionate; Agenda reale non utilizzata.
- Review Standards e Spec rispetto a `b38ca9c`: corretto il recupero dopo errori temporanei e verificati gli id tramite l'interfaccia pubblica del Nucleo. Nessun rilievo residuo nelle due review.
