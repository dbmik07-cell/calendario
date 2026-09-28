import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Date e orari sono locali: i test girano sempre nel fuso italiano (con ora legale).
    env: { TZ: "Europe/Rome" },
  },
});
