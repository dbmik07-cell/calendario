# Calendario

Widget da desktop per Windows, sviluppato con Electron, per gestire Impegni,
Cose da fare e Promemoria.

## Avvio

Installare Node.js e npm, quindi dalla cartella del progetto eseguire:

```sh
npm ci
npm start
```

Il Widget supporta l'inserimento con frasi in italiano, la navigazione tra i
giorni, la modifica degli Impegni e i Promemoria. I dati vengono conservati
localmente nella cartella dati dell'applicazione.

Al primo avvio viene attivato l'avvio automatico con Windows. Per disattivarlo,
togliere la spunta da **Avvia con Windows** nel menu dell'icona nell'area di
notifica. Ulteriori dettagli in [docs/avvio.md](docs/avvio.md).

## Verifiche

```sh
npm test
npm run typecheck
```

## Documentazione

- [Terminologia del progetto](CONTEXT.md)
- [Avvio con Windows](docs/avvio.md)
- [Formato dei dati e modifica dell'Agenda da programmi esterni](docs/agenda.md)
