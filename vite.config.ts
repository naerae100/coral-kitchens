// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    /*
     * Which host we are building for.
     *
     * The default here is a Cloudflare Worker — it emits wrangler.json and a
     * `wrangler deploy` command, which Vercel has no idea what to do with. Vercel
     * sets VERCEL=1 during its builds, so we switch presets only there and leave
     * Lovable's own Cloudflare builds exactly as they were.
     */
    preset: process.env.VERCEL ? "vercel" : "cloudflare-module",
  },
});
