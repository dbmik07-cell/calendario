# 02: Aggiungere un Impegno con una Frase semplice

**What to build:** l'utente scrive una Frase nella casella del Widget (es. "domani alle 15 dentista"), preme Invio e l'Impegno viene salvato nell'Agenda e compare nella lista del giorno, in ordine di orario, con un messaggio di conferma (giorno, orario, titolo). Frasi non comprese mostrano un errore leggibile e non salvano nulla.

**Blocked by:** 01 (Scheletro: il Widget mostra la giornata di oggi)

**Status:** ready-for-agent

- [ ] Il Nucleo espone `aggiungiDaTesto(frase)` che restituisce l'Impegno creato oppure un errore leggibile
- [ ] Riconosce "oggi", "domani", "dopodomani"
- [ ] Riconosce l'orario "alle HH", "alle HH:MM", "HH:MM", "HH.MM"
- [ ] Senza giorno: oggi, oppure domani se l'orario di oggi è già passato
- [ ] Il titolo è il testo che resta, senza preposizioni ai bordi e con la prima lettera maiuscola; titolo vuoto → errore
- [ ] Ogni Impegno ha un `id`, `anticipoMinuti` 15 e `promemoriaInviato` false; il salvataggio su file è atomico
- [ ] La lista del giorno mostra orario e titolo in ordine di orario e si aggiorna subito dopo l'aggiunta
- [ ] Il Widget mostra la conferma o l'errore
- [ ] Test Vitest via Nucleo per ogni forma sopra con un "adesso" fisso, compreso il caso dell'orario già passato e le Frasi non valide che non salvano nulla
