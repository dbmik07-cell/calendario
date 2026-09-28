# 05: Promemoria

**What to build:** prima di ogni Impegno l'utente riceve una notifica di Windows con titolo e orario, di base 15 minuti prima. Nella Frase può scegliere l'Anticipo ("avvisami un'ora prima") o nessun Promemoria ("senza promemoria"). Ogni Promemoria arriva una sola volta, anche dopo un riavvio; uno perso a PC spento arriva se l'Impegno non è ancora iniziato. Cliccando la notifica si apre il Widget.

**Blocked by:** 02 (Aggiungere un Impegno con una Frase semplice)

**Status:** ready-for-agent

- [x] Il Nucleo espone `promemoriaDovuti()` (l'"adesso" viene dall'orologio iniettato): dovuto se `inizio - anticipo <= adesso < inizio` e non già inviato; lo segna come inviato e lo salva
- [x] Frase: "avvisami N minuti prima", "avvisami N ore prima", "avvisami un'ora prima", "senza promemoria" (`anticipoMinuti: null`)
- [ ] Il processo principale controlla ogni 30 secondi e mostra una notifica di Windows per ogni Promemoria dovuto (codice fatto; Electron conferma la notifica, ma nella verifica non era visibile sullo schermo: da confermare a occhio)
- [ ] Cliccando la notifica il Widget viene mostrato e portato davanti (codice fatto, non verificato)
- [x] Nessuna notifica per Impegni già iniziati
- [x] Test Vitest via Nucleo: prima dell'Anticipo nessuno; dentro uno; seconda chiamata nessuno; dopo l'inizio nessuno; nuovo Nucleo sullo stesso archivio non ripete; "senza promemoria" mai
