# 04: Cose da fare

**What to build:** una Frase con un giorno ma senza orario (es. "domani chiamare la banca") diventa una Cosa da fare di quel giorno, mostrata in una sezione separata dagli Impegni. L'utente può spuntarla come fatta, togliere la spunta e cancellarla.

**Blocked by:** 02 (Aggiungere un Impegno con una Frase semplice)

**Status:** ready-for-agent

- [ ] `aggiungiDaTesto` senza orario crea una Cosa da fare (senza giorno → oggi)
- [ ] `giorno(data)` restituisce Impegni e Cose da fare separati
- [ ] Il Widget mostra le Cose da fare in una sezione a parte, con casella di spunta
- [ ] `segnaFatta(id, fatta)` e `cancellaCosaDaFare(id)` funzionano e vengono salvati
- [ ] Le Cose da fare fatte appaiono barrate
- [ ] Test Vitest via Nucleo: creazione, spunta, rimozione della spunta, cancellazione, persistenza su un nuovo Nucleo con lo stesso archivio
