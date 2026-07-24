# Coral Kitchens

Marketing site for [Coral Kitchens](https://www.coralkitchens.com.au) — a custom
kitchen manufacturer in Smithfield, Western Sydney. Design, manufacture and
installation, plus cut-to-size panels, custom door profiles and precision
joinery for residential and commercial projects.

Built with TanStack Start, React 19, Tailwind CSS 4 and three.js.

## Development

Requires Node.js 20+.

```sh
bun install     # or: npm install
bun dev         # or: npm run dev
```

The site runs at http://localhost:8080.

| Command   | Does                       |
| --------- | -------------------------- |
| `dev`     | Vite dev server            |
| `build`   | Production build           |
| `preview` | Serve the production build |
| `lint`    | ESLint + Prettier          |
| `format`  | Rewrite with Prettier      |

## Deploying

Nitro picks its target from the environment, so the same commit deploys to
either host without a config change:

- **Vercel** — `VERCEL=1` is set automatically during Vercel builds, which
  selects the `vercel` preset and emits `.vercel/output` (Build Output API v3).
  No `vercel.json` is needed; leave the framework preset on **Other** and the
  build command as `npm run build`.
- **Anywhere else, including Lovable** — falls back to `cloudflare-module` and
  emits `wrangler.json`.

See [`vite.config.ts`](vite.config.ts).

### Environment variables

| Variable              | Required               | Purpose                                                                                                                          |
| --------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `ENQUIRY_WEBHOOK_URL` | **Yes, in production** | Where contact-form submissions are POSTed as JSON. Works with Zapier, Make, n8n, a Slack incoming webhook, or your own endpoint. |

> [!IMPORTANT]
> Without `ENQUIRY_WEBHOOK_URL` the enquiry form still returns success to the
> visitor, but the submission is only written to the server log — **leads will
> not reach an inbox**. Set it before pointing real traffic at the site.
> See [`src/lib/enquiry.ts`](src/lib/enquiry.ts).

## Structure

```
src/
  components/
    three/        3D kitchen: model, materials, scene, stage
    effects/      Scroll progress, line reveals, magnetic buttons, counters
    ui/           shadcn/ui primitives
  config/site.ts  Business details, services, structured data
  lib/enquiry.ts  Contact form schema + server function
  routes/         TanStack Start file routes
public/kitchens/  Coral Kitchens photography
```

The 3D kitchen in the Workshop section is modelled to scale from one of the
studio's own shaker installs. Its textures are generated procedurally at
runtime, so there are no texture files to download.

## Before launch

Values still to confirm in [`src/config/site.ts`](src/config/site.ts):

- **Opening hours** — the Google listing confirms a 5pm weekday close, but the
  opening time and weekend rows are placeholders.
- **Social links** — currently point at the Instagram and Facebook homepages.
- **Canonical domain** — confirm `url` matches where this is actually served.
