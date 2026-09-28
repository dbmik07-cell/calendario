# 09: Widget in stile Mac

**What to build:** il Widget si comporta e appare come un widget di macOS: si trascina da un'area in cima, si ridimensiona dai bordi e dagli angoli (con dimensione minima), ricorda posizione e dimensione, ha angoli arrotondati e sfondo semitrasparente. Di base è in Modalità scrivania (dietro le finestre); dall'icona vicino all'orologio si passa alla Modalità in primo piano, si mostra o nasconde il Widget e si esce. Non compare nella barra delle applicazioni.

**Blocked by:** 01 (Scheletro: il Widget mostra la giornata di oggi)

**Status:** ready-for-human (implementazione completata; verifica visiva finale sotto)

- [ ] Trascinamento da un'area dedicata in cima; ridimensionamento da bordi e angoli; dimensione minima circa 260×320
- [x] Posizione, dimensione e modalità salvate in un file di impostazioni separato dall'Agenda e ripristinate all'avvio
- [x] Se la posizione salvata non cade su nessuno schermo attuale, il Widget viene centrato sullo schermo principale
- [x] Aspetto macOS: senza bordi, angoli arrotondati, sfondo semitrasparente/sfocato, carattere pulito
- [x] Modalità scrivania predefinita (non in primo piano); Modalità in primo piano attivabile e disattivabile
- [ ] Nessuna icona nella barra delle applicazioni; icona nell'area di notifica con menu: Mostra/Nascondi, Modalità in primo piano, Esci
- [x] Nascondere il Widget non chiude l'app
- [x] Verifica manuale documentata nel ticket al termine (nessun test automatico per questo strato)

## Comments

### Implementazione e verifica — 28 settembre 2026

- `src/main/widget.js` gestisce finestra, area di notifica e `widget.json` nella cartella dati dell'app, separato da `agenda.json`. Le impostazioni si salvano con file temporaneo e rinomina; un file illeggibile usa i valori predefiniti.
- Otto bordi/angoli del renderer ridimensionano la finestra trasparente via IPC. Electron non supporta il ridimensionamento nativo delle finestre trasparenti; la cattura del puntatore mantiene il gesto e il rilascio applica anche l'ultima posizione. Il contenuto scorre alla dimensione minima.
- Modalità in primo piano: livello Electron `pop-up-menu`. Sul PC di verifica `floating` e `status` restituivano `isAlwaysOnTop() === false`; `pop-up-menu` restituisce `true`. Questo livello può sovrapporsi anche alla barra delle applicazioni. Modalità scrivania resta una finestra normale, senza integrazione nello sfondo Windows.
- Verifica UI su profilo temporaneo, senza usare l'Agenda reale: aspetto arrotondato e semitrasparente; trascinamento del bordo destro fino a larghezza 260; angolo inferiore destro fino a 260×320; contenuto ancora scorrevole. Un gesto rapido inizialmente non ridimensionava: corretto passando le coordinate iniziali dal pointerdown.
- Verifica runtime Electron con harness temporaneo (non aggiunto alla suite): ripristino di posizione e dimensione 260×320; coordinate salvate 99999,99999 ricentrate sul monitor principale; modalità salvata ripristinata con topmost nativo `true`; callback del menu commuta `false`/`true`; Nascondi mantiene finestra/processo vivi, Mostra la rende visibile, Esci termina il processo.
- Restano da confermare fisicamente: trascinamento della maniglia, tutti gli altri bordi/angoli, rimozione reale di un monitor, icona/menu nell'area di notifica e assenza dalla barra delle applicazioni. La verifica UI del trascinamento nativo non ha prodotto uno spostamento osservabile con lo strumento disponibile; non è considerata superata.
- Review separata Standards/Spec: nessun difetto di codice identificato; la verifica manuale residua resta esplicita. Nessun test automatico aggiunto allo strato Electron, come richiesto dalla spec.
