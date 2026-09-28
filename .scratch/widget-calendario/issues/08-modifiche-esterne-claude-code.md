# 08: Modifiche esterne tramite Claude Code

**What to build:** l'utente può chiedere a Claude Code di aggiungere, spostare o cancellare elementi scrivendo direttamente il file dell'Agenda. Il Widget se ne accorge e si aggiorna da solo. Gli elementi aggiunti a mano senza `id` ne ricevono uno. Un file scritto male non cancella i dati: il Widget tiene l'ultima Agenda valida e mostra un avviso. Il formato del file e la sua posizione sono documentati nel repo, così Claude Code sa come modificarlo.

**Blocked by:** 02 (Aggiungere un Impegno con una Frase semplice)

**Status:** ready-for-agent

- [ ] Il Nucleo espone `ricarica()`; il processo principale osserva il file e la chiama quando cambia
- [ ] Il Widget si aggiorna entro pochi secondi da una modifica esterna
- [ ] Elementi senza `id` ricevono un `id`, salvato nel file
- [ ] File JSON non valido: nessuna sovrascrittura, Agenda in memoria invariata, avviso visibile nel Widget; l'avviso sparisce quando il file torna valido
- [ ] Le scritture dell'app stessa non causano ricariche inutili o cicli
- [ ] Documento nel repo con percorso del file, formato e regole (`inizio` in ora locale, `anticipoMinuti: null` = nessun Promemoria, cambio di orario → `promemoriaInviato: false`), e un puntatore in `CLAUDE.md`
- [ ] Test Vitest via Nucleo: `ricarica` dopo una modifica all'archivio in memoria, elementi senza `id`
- [ ] Test Vitest sull'Archivio su file in una cartella temporanea: salva e rilegge, file non valido non sovrascritto e segnalato
