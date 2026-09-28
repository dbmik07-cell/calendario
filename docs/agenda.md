# Modificare l'Agenda da un programma esterno

## Posizione del file

Il file è `agenda.json` nella cartella restituita da Electron con `app.getPath("userData")`.
Con `npm start` e il nome attuale del progetto è normalmente:

```text
%APPDATA%\calendario\agenda.json
```

Le impostazioni del Widget sono in `widget.json` nella stessa cartella. I due file hanno scopi diversi: modificare l'Agenda significa intervenire su `agenda.json`.

## Formato

JSON UTF-8 (anche con BOM). La versione supportata è `1`; entrambi gli elenchi sono obbligatori, anche quando vuoti.

```json
{
  "versione": 1,
  "impegni": [
    {
      "id": "dentista-2026-10-01",
      "titolo": "Dentista",
      "inizio": "2026-10-01T15:00",
      "durataMinuti": 60,
      "anticipoMinuti": 15,
      "promemoriaInviato": false
    }
  ],
  "coseDaFare": [
    {
      "id": "banca-2026-10-01",
      "titolo": "Chiamare la banca",
      "giorno": "2026-10-01",
      "fatta": false
    }
  ]
}
```

- `id`: stringa non vuota, unica in tutta l'Agenda. Conservare l'id quando si sposta o modifica un elemento. Per un elemento nuovo si può omettere: il Nucleo ne assegna uno e lo salva dopo aver validato tutto il file.
- `titolo`: stringa non vuota.
- `inizio`: data e ora **locali del PC**, nel formato esatto `YYYY-MM-DDTHH:MM`, senza `Z` o offset. Deve essere un orario esistente, anche durante il passaggio all'ora legale.
- `durataMinuti`: intero positivo facoltativo. Per togliere la durata, rimuovere la proprietà dal JSON.
- `anticipoMinuti`: intero almeno zero; `null` significa **nessun Promemoria**. Il valore predefinito per gli Impegni creati dal Widget è 15, ma il campo deve essere presente nel file.
- `promemoriaInviato`: booleano obbligatorio. Usare `false` per gli Impegni nuovi e quando si cambia `inizio` o `anticipoMinuti`. Il Nucleo riporta automaticamente il valore a `false` se rileva questi cambiamenti rispetto all'Agenda già caricata; dopo un riavvio non può confrontare il vecchio valore.
- `giorno`: data locale esistente nel formato esatto `YYYY-MM-DD`.
- `fatta`: booleano obbligatorio.

Per cancellare un elemento, rimuoverlo dal suo elenco. Un'Agenda vuota valida mantiene `versione: 1`, `impegni: []` e `coseDaFare: []`; cancellare il file dopo che è stato caricato viene invece segnalato come errore.

## Procedura

1. Leggere l'intero file e conservare gli altri elementi e i loro id.
2. Applicare la modifica, verificare il JSON e le regole sopra.
3. Scrivere un file temporaneo **nella stessa cartella**, poi sostituire `agenda.json` con una rinomina. Preferire questa scrittura atomica a una scrittura parziale sul file in uso.
4. Attendere l'aggiornamento del Widget, normalmente entro un secondo. Il Widget resta sul giorno selezionato; per un elemento spostato selezionare il nuovo giorno.

Evitare modifiche simultanee dal Widget e dal programma esterno. L'Archivio confronta il contenuto prima di ogni salvataggio e rifiuta una scrittura se rileva una modifica esterna non ancora caricata; questo controllo riduce i conflitti, ma non è una transazione condivisa tra programmi.

## File non validi e recupero

Se il file non è leggibile, contiene JSON o dati non validi, il Widget mantiene l'ultima Agenda valida in memoria e mostra un avviso. Non sovrascrive il file; modifiche dal Widget e invio dei Promemoria restano sospesi finché il file viene corretto. La correzione viene rilevata automaticamente e l'avviso scompare. Al primo avvio con un file non valido, il Widget mostra un'Agenda vuota con lo stesso avviso.

Gli id e gli eventuali reset dei Promemoria vengono salvati solo se l'intera Agenda è valida. Le scritture del Widget non generano cicli di ricarica.
