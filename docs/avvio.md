# Avvio del Widget su Windows

Dal repository, eseguire `npm start` per aprire il Widget. Al primo avvio
viene registrata la voce **Calendario** per l'accesso dell'utente a Windows.
Non servono un installer o privilegi di amministratore.

Il menu dell'icona nell'area di notifica contiene **Avvia con Windows**.
La spunta indica che la voce di avvio è attiva; togliendola si rimuove la
registrazione. La scelta viene conservata in `widget.json`, nella cartella
dati dell'app, insieme a posizione, dimensione e modalità. I file esistenti
senza questa scelta usano il valore predefinito attivo.

La registrazione viene aggiornata a ogni apertura secondo la scelta salvata.
Per disattivarla stabilmente usare il menu del Widget. **Esci** termina il
processo corrente, mentre **Nascondi** lascia attivi i Promemoria.

Nella versione avviata dal repository, Windows apre l'eseguibile Electron
con il percorso assoluto del progetto, anche quando contiene spazi. Il
repository e `node_modules` devono restare disponibili. Se si sposta il
progetto, avviarlo nuovamente dalla nuova posizione per aggiornare la voce.

Aprire il Widget una seconda volta mostra e porta davanti quello esistente,
anche se era nascosto o minimizzato. Il secondo processo termina prima di
leggere l'Agenda o avviare altri controlli dei Promemoria.

## Verifica dopo il riavvio di Windows

1. Attivare **Avvia con Windows** e sistemare il Widget nella posizione desiderata.
2. Uscire dal Widget per salvare le impostazioni, poi riavviare Windows.
3. Dopo l'accesso, verificare che compaia un solo Widget nella posizione salvata.
4. Disattivare **Avvia con Windows**, riavviare e verificare che non compaia.

La prova runtime con un profilo temporaneo verifica registrazione, scelta
persistente e istanza unica; il riavvio reale del PC resta da confermare.
