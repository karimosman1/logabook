import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Loads .env.local (Supabase URL and key) and .env.test.local (test accounts)
    env: loadEnv("test", process.cwd(), ""),
    // The isolation test talks to the real Supabase project, which can be slow to wake up
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
});
