# 06: Modificare e cancellare un Impegno

**What to build:** cliccando un Impegno nella lista si apre un modulo in cui l'utente modifica titolo, giorno, orario, durata e Anticipo, oppure cancella l'Impegno. Se cambiano orario o Anticipo, il Promemoria riparte per il nuovo orario.

**Blocked by:** 05 (Promemoria)

**Status:** ready-for-agent

- [ ] Il Nucleo espone `modificaImpegno(id, modifiche)` e `cancellaImpegno(id)`
- [ ] Cambiare `inizio` o `anticipoMinuti` rimette `promemoriaInviato` a false
- [ ] Modifiche non valide (titolo vuoto, data inesistente) → errore, nulla cambia
- [ ] Il Widget ha un modulo di modifica con Salva, Annulla e Cancella (con conferma)
- [ ] Test Vitest via Nucleo: modifica visibile in `giorno`, spostamento a un altro giorno, cancellazione, Promemoria che torna dovuto dopo il cambio di orario
