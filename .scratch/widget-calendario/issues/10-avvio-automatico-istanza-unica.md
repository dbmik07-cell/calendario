# 10: Avvio automatico e istanza unica

**What to build:** il Widget parte da solo all'accensione di Windows, così i Promemoria arrivano sempre; l'utente può disattivare l'avvio automatico dal menu dell'icona. Aprire l'app una seconda volta non crea un secondo Widget ma mostra quello esistente.

**Blocked by:** 09 (Widget in stile Mac)

**Status:** ready-for-human (implementazione completata; resta la prova di riavvio Windows)

- [x] Avvio automatico attivo di base, registrato all'accesso di Windows
- [x] Voce "Avvia con Windows" (con segno di spunta) nel menu dell'icona per attivarlo o disattivarlo
- [x] Istanza unica: un secondo avvio mostra e porta davanti il Widget esistente e poi termina
- [ ] Verifica manuale: riavvio del PC con il Widget che ricompare nella posizione salvata

## Comments

### Implementazione e verifica — 28 settembre 2026

- Il processo principale acquisisce `requestSingleInstanceLock` prima di inizializzare Agenda, Widget e controlli dei Promemoria. Il secondo processo termina; il primo mostra, ripristina se minimizzato e dà il focus al Widget. La richiesta viene conservata anche durante il caricamento iniziale.
- `widget.js` registra l'avvio con le API Electron `setLoginItemSettings` / `getLoginItemSettings`. La voce Windows si chiama `Calendario`; in sviluppo gli argomenti contengono il percorso assoluto del progetto tra virgolette. La versione confezionata apre direttamente l'eseguibile.
- `widget.json` conserva `avviaConWindows`, attivo di base e compatibile con i file di impostazioni precedenti. Il menu legge lo stato della registrazione corrente e salva la scelta dopo ogni modifica. Le impostazioni di avvio vengono riallineate a questa scelta quando si riapre il Widget.
- Prova runtime Electron con profilo temporaneo e voce di registro dedicata alla prova, rimossa al termine: registrazione predefinita, percorso contenente spazi, disattivazione/rimozione dal registro, preferenza disattivata conservata alla riapertura, riattivazione dal menu. Due avvii successivi mostrano il Widget prima nascosto e poi minimizzato; ogni processo secondario termina con codice 0 e resta un solo Widget. La posizione salvata viene ripristinata. L'Agenda reale e la voce di avvio dell'utente non sono state usate dalla prova.
- Review Standards: 0 rilievi. Review Spec: nessun difetto di implementazione; resta esplicita la verifica di riavvio reale richiesta dal ticket. Nessun test permanente aggiunto allo strato Electron, come previsto dalla spec.
- Prova aggiuntiva con creazione del Widget ritardata: un secondo avvio prima che esista la finestra termina con codice 0; il Widget viene mostrato con il focus quando è pronto. Controllo dei tipi e del diff superati; suite finale: 138 test su 4 file, tutti superati.
- Procedura d'uso e verifica manuale in `docs/avvio.md`. Non è stato riavviato il PC durante questo lavoro: confermare l'avvio dopo l'accesso a Windows e il ripristino della posizione prima di risolvere il ticket.
