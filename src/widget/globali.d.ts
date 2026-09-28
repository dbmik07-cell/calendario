import type { creaAgenda } from "../nucleo/agenda.js";

type Nucleo = ReturnType<typeof creaAgenda>;

/** Il Nucleo visto dal Widget: stessi metodi, ma attraverso l'IPC, quindi asincroni. */
type NucleoRemoto = {
  [Metodo in keyof Nucleo]: Nucleo[Metodo] extends (...argomenti: infer A) => infer R
    ? (...argomenti: A) => Promise<R>
    : never;
};

declare global {
  interface Window {
    agenda: NucleoRemoto;
    widget: {
      suAgendaAggiornata(callback: (avviso: string | null) => void): void;
      ridimensiona(bordo: string, puntatore: { x: number; y: number }): void;
      fineRidimensionamento(): void;
      suMostraGiorno(callback: (giorno: string) => void): void;
    };
  }
}
