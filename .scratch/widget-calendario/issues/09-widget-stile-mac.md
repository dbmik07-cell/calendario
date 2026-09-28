# 09: Widget in stile Mac

**What to build:** il Widget si comporta e appare come un widget di macOS: si trascina da un'area in cima, si ridimensiona dai bordi e dagli angoli (con dimensione minima), ricorda posizione e dimensione, ha angoli arrotondati e sfondo semitrasparente. Di base è in Modalità scrivania (dietro le finestre); dall'icona vicino all'orologio si passa alla Modalità in primo piano, si mostra o nasconde il Widget e si esce. Non compare nella barra delle applicazioni.

**Blocked by:** 01 (Scheletro: il Widget mostra la giornata di oggi)

**Status:** ready-for-agent

- [ ] Trascinamento da un'area dedicata in cima; ridimensionamento da bordi e angoli; dimensione minima circa 260×320
- [ ] Posizione, dimensione e modalità salvate in un file di impostazioni separato dall'Agenda e ripristinate all'avvio
- [ ] Se la posizione salvata non cade su nessuno schermo attuale, il Widget viene centrato sullo schermo principale
- [ ] Aspetto macOS: senza bordi, angoli arrotondati, sfondo semitrasparente/sfocato, carattere pulito
- [ ] Modalità scrivania predefinita (non in primo piano); Modalità in primo piano attivabile e disattivabile
- [ ] Nessuna icona nella barra delle applicazioni; icona nell'area di notifica con menu: Mostra/Nascondi, Modalità in primo piano, Esci
- [ ] Nascondere il Widget non chiude l'app
- [ ] Verifica manuale documentata nel ticket al termine (nessun test automatico per questo strato)
