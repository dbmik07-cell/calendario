# 03: Frasi complete: date, orari e durata

**What to build:** le Frasi capiscono il modo naturale in cui l'utente indica giorno, orario e durata: nomi dei giorni della settimana, date precise, orari parlati e durate. La lista mostra anche l'orario di fine quando l'Impegno ha una durata.

**Blocked by:** 02 (Aggiungere un Impegno con una Frase semplice)

**Status:** ready-for-agent

- [ ] Nome del giorno ("giovedì", anche senza accento) → prossima occorrenza; se è oggi e l'orario non è passato, oggi
- [ ] "il 12" → prossimo giorno 12; "12/10", "12/10/2027", "12 ottobre"
- [ ] "alle 9 e mezza", "alle 9 e un quarto"
- [ ] Durata: "per un'ora", "per 2 ore", "per 30 minuti", "dalle 15 alle 17"
- [ ] La lista mostra "15:00–16:00" quando c'è una durata
- [ ] Data inesistente (es. "31/02") → errore, nulla salvato
- [ ] Test Vitest via Nucleo con "adesso" fisso, compresi fine mese, fine anno, 29 febbraio in anno bisestile e non, "giovedì" detto di giovedì prima e dopo l'orario
