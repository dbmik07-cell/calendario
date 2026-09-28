import type { Impegno } from "../nucleo/tipi.js";

declare global {
  interface Window {
    agenda: {
      oggi(): Promise<string>;
      giorno(data: string): Promise<{ impegni: Impegno[] }>;
    };
  }
}
