# 06: Modificare e cancellare un Impegno

**What to build:** cliccando un Impegno nella lista si apre un modulo in cui l'utente modifica titolo, giorno, orario, durata e Anticipo, oppure cancella l'Impegno. Se cambiano orario o Anticipo, il Promemoria riparte per il nuovo orario.

**Blocked by:** 05 (Promemoria)

**Status:** resolved

- [x] Il Nucleo espone `modificaImpegno(id, modifiche)` e `cancellaImpegno(id)`
- [x] Cambiare `inizio` o `anticipoMinuti` rimette `promemoriaInviato` a false
- [x] Modifiche non valide (titolo vuoto, data inesistente) → errore, nulla cambia
- [x] Il Widget ha un modulo di modifica con Salva, Annulla e Cancella (con conferma)
- [x] Test Vitest via Nucleo: modifica visibile in `giorno`, spostamento a un altro giorno, cancellazione, Promemoria che torna dovuto dopo il cambio di orario

## Comments

### Implementazione e verifica — 28 settembre 2026

- Modifica parziale tramite Nucleo: campi omessi invariati; `durataMinuti: null` rimuove la durata, `anticipoMinuti: null` disattiva il Promemoria. Cambiare solo titolo/durata o salvare valori identici non ripete un Promemoria già inviato.
- Titolo vuoto, date/orari inesistenti (anche il salto dell'ora legale), minuti non validi e valori oltre l'intervallo delle date vengono rifiutati prima del salvataggio. Le nuove operazioni aggiornano la memoria solo dopo il salvataggio riuscito.
- Modulo accessibile dal pulsante dell'Impegno, con campi precompilati, errori leggibili, blocco del doppio invio, Annulla e conferma esplicita di cancellazione. Dopo lo spostamento viene selezionato il nuovo giorno.
- TDD: 19 test attraverso l'interfaccia pubblica del Nucleo, con orologio e archivio iniettati.
- Verifica diretta Windows su profilo temporaneo: clic sull'Impegno apre il modulo, focus sul titolo, tutti i campi e pulsanti leggibili, Annulla torna alla lista senza modifiche.
- Verifica runtime temporanea del flusso renderer → IPC → Nucleo → file: annullamento, titolo vuoto, salvataggio di titolo/orario, rimozione della durata, rifiuto della cancellazione e successiva conferma; contenuto del JSON verificato dopo modifica e cancellazione. Harness non incluso nella suite; Agenda reale non utilizzata.
- Review Standards e Spec rispetto a `79983d7`: nessun problema identificato. La verifica delle notifiche Windows del ticket 05 resta separata.
