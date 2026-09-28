# 07: Navigare nel mini-calendario

**What to build:** l'utente clicca un giorno del mini-calendario per vederne Impegni e Cose da fare, passa al mese precedente o successivo e torna a oggi con un clic. I giorni con qualcosa hanno un puntino. Dopo un'aggiunta il Widget va al giorno dell'elemento creato. Nella giornata di oggi gli Impegni passati sono attenuati e il prossimo è evidenziato.

**Blocked by:** 02 (Aggiungere un Impegno con una Frase semplice)

**Status:** ready-for-agent

- [ ] Il Nucleo espone `giorniOccupati(mese)`
- [ ] Clic su un giorno → la lista mostra quel giorno, con il giorno selezionato evidenziato
- [ ] Frecce mese precedente/successivo e pulsante "Oggi"
- [ ] Puntino sui giorni occupati, aggiornato dopo ogni modifica
- [ ] Dopo `aggiungiDaTesto` il Widget seleziona il giorno dell'elemento creato
- [ ] Oggi: Impegni già finiti attenuati, prossimo Impegno evidenziato (aggiornato col passare del tempo)
- [ ] Se il ticket 05 è già fatto: cliccando la notifica il Widget si apre sul giorno dell'Impegno
- [ ] Test Vitest via Nucleo: `giorniOccupati` per un mese con Impegni e Cose da fare, compresi i bordi del mese
