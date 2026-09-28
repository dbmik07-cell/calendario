# Spec: Widget calendario da desktop con Promemoria

Status: ready-for-agent

## Problem Statement

Voglio organizzare la mia giornata e tenere sotto controllo gli impegni senza aprire ogni volta un'applicazione. Oggi non ho un posto sempre visibile sul desktop dove vedere cosa mi aspetta, e aggiungere un impegno in un calendario tradizionale richiede troppi clic (scegliere il giorno, l'ora, compilare un modulo). Inoltre, se non guardo il calendario, mi dimentico degli impegni perché nessuno mi avvisa in tempo.

## Solution

Un **Widget** sul desktop di Windows, in stile macOS: una finestra senza bordi, con angoli arrotondati e sfondo semitrasparente, che posso trascinare dove voglio e ridimensionare. Mostra un mini-calendario del mese e, sotto, gli **Impegni** e le **Cose da fare** del giorno selezionato (di base oggi).

Per aggiungere qualcosa scrivo una **Frase** in linguaggio naturale nella casella del Widget, per esempio "giovedì alle 15 dentista" o "domani chiamare la banca", e l'app la inserisce da sola nel giorno e all'orario indicati. Posso anche chiedere a Claude Code di modificare l'Agenda: i dati stanno in un file locale che Claude Code può leggere e scrivere, e il Widget si aggiorna appena il file cambia.

Prima di ogni Impegno ricevo un **Promemoria** come notifica di Windows, di base 15 minuti prima, con un **Anticipo** che posso cambiare per ogni Impegno. Il Widget parte da solo all'accensione del PC, così i Promemoria arrivano sempre.

## User Stories

### Vedere l'Agenda

1. Come utente, voglio vedere il Widget sul desktop appena accendo il PC, così ho subito sott'occhio la mia giornata.
2. Come utente, voglio vedere un mini-calendario del mese corrente, così capisco a colpo d'occhio in che giorno siamo.
3. Come utente, voglio che il giorno di oggi sia evidenziato nel mini-calendario, così non devo cercarlo.
4. Come utente, voglio che i giorni con almeno un Impegno o una Cosa da fare abbiano un segno (un puntino) nel mini-calendario, così vedo quali giorni sono occupati.
5. Come utente, voglio cliccare un giorno del mini-calendario per vederne Impegni e Cose da fare, così posso controllare anche i giorni futuri.
6. Come utente, voglio passare al mese precedente o successivo, così posso pianificare più avanti.
7. Come utente, voglio tornare a oggi con un clic, così non mi perdo dopo aver navigato tra i mesi.
8. Come utente, voglio vedere gli Impegni del giorno in ordine di orario, così capisco la sequenza della giornata.
9. Come utente, voglio vedere per ogni Impegno l'orario di inizio (e di fine, se ha una durata) e il titolo, così so cosa devo fare e quando.
10. Come utente, voglio vedere le Cose da fare del giorno in una sezione separata dagli Impegni, così distinguo cosa ha un orario e cosa no.
11. Come utente, voglio che gli Impegni già passati di oggi appaiano attenuati, così mi concentro su quelli che mancano.
12. Come utente, voglio che il prossimo Impegno di oggi sia evidenziato, così so subito cosa mi aspetta.
13. Come utente, voglio un messaggio chiaro quando un giorno è vuoto, così non penso che il Widget non funzioni.

### Aggiungere con una Frase

14. Come utente, voglio scrivere una Frase nella casella del Widget e premere Invio per aggiungere un Impegno, così lo inserisco senza compilare moduli.
15. Come utente, voglio usare "oggi", "domani" e "dopodomani" nella Frase, così indico i giorni vicini in modo naturale.
16. Come utente, voglio usare il nome di un giorno della settimana ("giovedì"), così l'Impegno va al prossimo giovedì.
17. Come utente, voglio indicare una data precisa ("il 12", "12/10", "12 ottobre"), così posso pianificare in qualsiasi giorno.
18. Come utente, voglio indicare l'orario in modi diversi ("alle 15", "15:30", "alle 9 e mezza"), così scrivo come parlo.
19. Come utente, voglio indicare una durata ("per un'ora", "per 30 minuti", "dalle 15 alle 17"), così l'Impegno mostra anche quando finisce.
20. Come utente, voglio indicare l'Anticipo nella Frase ("avvisami un'ora prima"), così scelgo quando ricevere il Promemoria.
21. Come utente, voglio che una Frase senza orario diventi una Cosa da fare in quel giorno, così posso annotare le cose da fare "in giornata".
22. Come utente, voglio che una Frase senza giorno vada a oggi (o a domani, se l'orario di oggi è già passato), così non devo sempre specificare la data.
23. Come utente, voglio che il titolo sia la parte della Frase che resta dopo aver tolto giorno, orario, durata e Anticipo, così il titolo è pulito ("dentista" e non "giovedì alle 15 dentista").
24. Come utente, voglio vedere subito una conferma di cosa è stato aggiunto (giorno, orario, titolo), così posso controllare che la Frase sia stata capita bene.
25. Come utente, voglio un messaggio che spiega il problema quando una Frase non si capisce (es. data inesistente), senza che venga salvato nulla, così non mi ritrovo impegni sbagliati.
26. Come utente, voglio che dopo l'aggiunta il Widget mostri il giorno dell'Impegno appena creato, così lo vedo subito nella lista.

### Aggiungere tramite Claude Code

27. Come utente, voglio poter chiedere a Claude Code di aggiungere, spostare o cancellare Impegni, così posso fare modifiche complesse ("sposta tutto giovedì alla settimana prossima").
28. Come utente, voglio che il Widget si aggiorni da solo quando l'Agenda viene modificata fuori dal Widget, così non devo riavviarlo.
29. Come utente, voglio che il formato del file dell'Agenda sia documentato nel repo, così Claude Code sa come modificarlo correttamente.
30. Come utente, voglio che un file dell'Agenda scritto male non faccia sparire i miei dati, così un errore di modifica non mi fa perdere tutto.

### Modificare e cancellare

31. Come utente, voglio cliccare un Impegno per modificarne titolo, giorno, orario, durata e Anticipo, così correggo gli errori.
32. Come utente, voglio cancellare un Impegno, così tolgo quelli annullati.
33. Come utente, voglio spuntare una Cosa da fare come fatta, così vedo cosa mi resta.
34. Come utente, voglio togliere la spunta da una Cosa da fare, così correggo un clic sbagliato.
35. Come utente, voglio cancellare una Cosa da fare, così tengo pulita la lista.
36. Come utente, voglio che modificare l'orario di un Impegno faccia ripartire il suo Promemoria, così ricevo l'avviso anche per il nuovo orario.

### Promemoria

37. Come utente, voglio ricevere una notifica di Windows prima di ogni Impegno, così non me ne dimentico.
38. Come utente, voglio che l'Anticipo predefinito sia di 15 minuti, così non devo specificarlo ogni volta.
39. Come utente, voglio che la notifica mostri titolo e orario dell'Impegno, così capisco subito di cosa si tratta.
40. Come utente, voglio cliccare la notifica per aprire il Widget sul giorno dell'Impegno, così vedo i dettagli.
41. Come utente, voglio ricevere ogni Promemoria una volta sola, anche se riavvio il PC, così non vengo disturbato più volte.
42. Come utente, voglio ricevere comunque il Promemoria se accendo il PC dopo l'orario dell'avviso ma prima dell'inizio dell'Impegno, così non lo perdo.
43. Come utente, non voglio ricevere Promemoria per Impegni già iniziati mentre il PC era spento, così non ricevo avvisi inutili.
44. Come utente, voglio poter impostare "nessun Promemoria" per un Impegno, così non vengo avvisato per cose che non servono.

### Widget in stile Mac

45. Come utente, voglio trascinare il Widget in qualsiasi punto del desktop, così lo metto dove mi è comodo.
46. Come utente, voglio ridimensionare il Widget trascinando i bordi o gli angoli, così scelgo quanto spazio occupa.
47. Come utente, voglio che il Widget abbia una dimensione minima, così resta leggibile anche se lo rimpicciolisco troppo.
48. Come utente, voglio che il Widget ricordi posizione e dimensione al riavvio, così non devo sistemarlo ogni volta.
49. Come utente, voglio che il Widget torni su uno schermo visibile se lo schermo dove stava non c'è più (es. monitor staccato), così non lo perdo.
50. Come utente, voglio un aspetto in stile macOS (senza bordi, angoli arrotondati, sfondo sfocato o semitrasparente, carattere pulito), così il desktop resta elegante.
51. Come utente, voglio che il Widget sia in Modalità scrivania per impostazione predefinita, così non copre le finestre su cui lavoro.
52. Come utente, voglio passare alla Modalità in primo piano e tornare indietro, così posso tenere il Widget sopra tutto quando mi serve.
53. Come utente, voglio che il Widget non occupi posto nella barra delle applicazioni, così si comporta come un widget e non come un programma.
54. Come utente, voglio un'icona nell'area di notifica (vicino all'orologio) con cui mostrare o nascondere il Widget, cambiare modalità e chiudere l'app, così lo controllo sempre.
55. Come utente, voglio poter nascondere il Widget senza chiudere l'app, così continuo a ricevere i Promemoria.

### Avvio

56. Come utente, voglio che il Widget parta da solo all'accensione di Windows, così i Promemoria funzionano sempre.
57. Come utente, voglio poter disattivare l'avvio automatico dal menu dell'icona, così decido io.
58. Come utente, voglio che non si possano aprire due Widget insieme, così non ricevo Promemoria doppi.

## Implementation Decisions

### Tecnologia

- App **Electron** per Windows 11 (Node è già installato; Rust e .NET no). Electron offre finestre trasparenti senza bordi, notifiche native di Windows, icona nell'area di notifica e avvio automatico.
- L'interfaccia è HTML/CSS/JS nel renderer di Electron; niente framework pesanti, salvo che la dimensione del codice non lo giustifichi.
- Lingua dell'interfaccia e delle Frasi: **italiano**. Formato orario 24 ore, settimana che inizia di lunedì, fuso orario locale del PC.

### Moduli

1. **Nucleo dell'Agenda** (modulo profondo, senza Electron né DOM). È l'unico punto da cui passa tutta la logica. Riceve dall'esterno un **orologio** (funzione che dà "adesso") e un **archivio** (legge/scrive l'Agenda). Interfaccia pubblica, in termini di comportamento:
   - `aggiungiDaTesto(frase)` → interpreta la Frase e salva un Impegno o una Cosa da fare; restituisce l'elemento creato, oppure un errore leggibile senza salvare nulla.
   - `giorno(data)` → Impegni (in ordine di orario) e Cose da fare di quel giorno.
   - `giorniOccupati(mese)` → i giorni del mese che contengono qualcosa (per i puntini del mini-calendario).
   - `modificaImpegno(id, modifiche)`, `cancellaImpegno(id)`, `segnaFatta(id, fatta)`, `cancellaCosaDaFare(id)`.
   - `promemoriaDovuti(adesso)` → i Promemoria da mostrare in quel momento; ognuno viene segnato come inviato e non torna più. Regola: è dovuto se `inizio - anticipo <= adesso < inizio` e non è già stato inviato.
   - `ricarica()` → rilegge l'archivio (usato quando il file cambia fuori dall'app).
   - L'interprete delle Frasi è un dettaglio interno del Nucleo, non un'interfaccia separata.

2. **Archivio su file**: implementazione dell'archivio che salva l'Agenda in un file JSON nella cartella dati dell'utente (`%APPDATA%` dell'app). Scrittura atomica (file temporaneo e poi rinomina). Se il file non è valido, l'app mantiene l'ultima Agenda valida in memoria, non sovrascrive il file e mostra un avviso nel Widget.

3. **Processo principale Electron** (strato sottile): crea il Widget, ricorda posizione/dimensione/modalità in un file di impostazioni separato dall'Agenda, gestisce l'icona nell'area di notifica, l'istanza unica, l'avvio automatico, osserva il file dell'Agenda per le modifiche esterne, e ogni 30 secondi chiama `promemoriaDovuti(adesso)` mostrando una notifica per ciascuno.

4. **Renderer del Widget**: mini-calendario, lista del giorno, casella per le Frasi, modulo di modifica. Parla con il Nucleo solo tramite IPC esposto da uno script di preload (con `contextIsolation` attivo).

### Formato dell'Agenda (contratto con Claude Code)

Il formato deve essere documentato nel repo, perché Claude Code lo modifica direttamente. Forma:

```
{
  "versione": 1,
  "impegni": [
    { "id": "…", "titolo": "Dentista", "inizio": "2026-10-01T15:00", "durataMinuti": 60, "anticipoMinuti": 15, "promemoriaInviato": false }
  ],
  "coseDaFare": [
    { "id": "…", "titolo": "Chiamare la banca", "giorno": "2026-10-01", "fatta": false }
  ]
}
```

- `inizio` è ora locale senza fuso; `durataMinuti` è facoltativa; `anticipoMinuti: null` vuol dire nessun Promemoria.
- Un elemento senza `id`, aggiunto a mano, riceve un `id` alla prima lettura.
- Se `inizio` o `anticipoMinuti` di un Impegno cambiano, `promemoriaInviato` torna `false`.

### Regole dell'interprete delle Frasi

- Giorno: "oggi", "domani", "dopodomani"; nome del giorno della settimana = la prossima occorrenza (se è oggi e l'orario non è passato, oggi); "il 12" = prossimo giorno 12; "12/10", "12/10/2027", "12 ottobre".
- Orario: "alle 15", "alle 15:30", "15.30", "alle 9 e mezza", "alle 9 e un quarto".
- Durata: "per un'ora", "per 2 ore", "per 30 minuti", "dalle 15 alle 17".
- Anticipo: "avvisami N minuti/ore prima", "senza promemoria".
- Senza orario → Cosa da fare. Senza giorno → oggi, oppure domani se l'orario di oggi è già passato.
- Titolo = il testo che resta, ripulito da preposizioni ai bordi, con la prima lettera maiuscola. Titolo vuoto → errore.
- Una data inesistente (es. "31/02") → errore, nessun salvataggio.

### Widget

- Finestra `frame: false`, `transparent: true`, ridimensionabile, dimensione minima circa 260×320, `skipTaskbar: true`. Si trascina da un'area dedicata in cima.
- Modalità scrivania = finestra non in primo piano e mai portata davanti in automatico; Modalità in primo piano = `alwaysOnTop`. Il Widget non viene fissato "dentro" lo sfondo del desktop di Windows (sarebbe troppo fragile).
- All'avvio, se la posizione salvata non cade su nessuno schermo attuale, il Widget viene centrato sullo schermo principale.

## Testing Decisions

- **Un solo punto di test: il Nucleo dell'Agenda**, usato attraverso la sua interfaccia pubblica, con un orologio finto (si imposta "adesso") e un archivio in memoria. Si verificano solo comportamenti osservabili: cosa restituiscono `giorno`, `giorniOccupati` e `promemoriaDovuti` dopo una sequenza di operazioni. Nessun test sulle funzioni interne dell'interprete o sul formato interno.
- Scenari da coprire almeno:
  - ogni forma di Frase elencata sopra, con date calcolate rispetto a un "adesso" fisso (compresi fine mese, fine anno, anni bisestili e "giovedì" detto di giovedì);
  - Frasi non valide che restituiscono un errore e non salvano nulla;
  - finestra del Promemoria: prima dell'anticipo nessuno, dentro l'anticipo uno, una seconda chiamata nessuno, dopo l'inizio nessuno;
  - Promemoria dopo un "riavvio" (nuovo Nucleo sullo stesso archivio) non ripetuto;
  - modifica dell'orario che fa ripartire il Promemoria;
  - "nessun Promemoria";
  - `ricarica()` dopo una modifica esterna all'archivio, compresi elementi senza `id`.
- Per l'Archivio su file c'è un test sottile su una cartella temporanea: salva e rilegge, e con un file non valido non sovrascrive e segnala errore.
- Processo principale e renderer di Electron: nessun test automatico, solo verifica manuale (trascinare, ridimensionare, cambiare modalità, notifica, avvio automatico).
- Test runner: **Vitest**. Non esistono ancora test nel repo (nessun esempio precedente).

## Out of Scope

- Sincronizzazione con Google Calendar, Outlook o altri servizi.
- Impegni ricorrenti ("ogni lunedì").
- Viste settimanali e mensili a tutto schermo.
- Interpretazione delle Frasi tramite AI o API esterne.
- Inserimento vocale.
- Fissare il Widget dentro lo sfondo del desktop di Windows.
- Più Widget contemporaneamente, temi personalizzati, lingue diverse dall'italiano.
- Versioni per macOS o Linux.
- Installer firmato e aggiornamenti automatici (basta poter avviare l'app e registrarla all'avvio).

## Further Notes

- Il vocabolario (Agenda, Impegno, Cosa da fare, Promemoria, Anticipo, Frase, Widget, Modalità scrivania / in primo piano) è definito in `CONTEXT.md` e va usato in codice, interfaccia e test.
- Il repo non è ancora un repository git; conviene inizializzarlo prima di iniziare a implementare.
- Le scelte su inserimento, vocabolario, posizione, contenuto, avvisi, dati e avvio sono le risposte consigliate dell'ultima sessione di domande, date per accettate perché l'utente è passato direttamente alla spec.
