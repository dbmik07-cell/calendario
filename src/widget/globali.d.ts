import type { Impegno } from "../nucleo/tipi.js";

declare global {
  interface Window {
    agenda: {
      oggi(): Promise<string>;
      giorno(data: string): Promise<{ impegni: Impegno[] }>;
      aggiungiDaTesto(frase: string): Promise<{ ok: true; impegno: Impegno } | { ok: false; errore: string }>;
    };
  }
}
