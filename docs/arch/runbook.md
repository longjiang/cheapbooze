# Runbook: Local Development & Build

Practical commands for running, building, and debugging CheapBooze locally.

## Prerequisites

- Node.js (the project targets the LTS line; Next.js 16 requires Node 20+)
- npm (installed with Node)

## Install dependencies

```bash
npm install
```

## Run the dev server

```bash
npm run dev
```

This starts Next.js in development mode. Open [http://localhost:3000](http://localhost:3000).

- Changes to source files hot-reload automatically.
- Route handlers (`/api/*`) also hot-reload; a save to
  `src/app/api/products/route.ts` re-runs the module.
- The dev server binds to `localhost:3000` by default. To change the port:

  ```bash
  npm run dev -- -p 4000
  ```

## Verify it works

1. Open `http://localhost:3000` — the product grid should load.
2. Confirm the catalog endpoint responds: `curl http://localhost:3000/api/products`
3. Confirm the image proxy allows only BCL hosts:
   - `curl http://localhost:3000/api/images?url=https://www.bcliquorstores.com/...` → 200
   - `curl http://localhost:3000/api/images?url=https://evil.example/x.png` → 403

## Lint

```bash
npm run lint
```

Runs ESLint (flat config, `eslint.config.mjs`) over the codebase.

## Production build (local)

```bash
npm run build
```

- Compiles + type-checks (Next.js runs `tsc` during build).
- Produces the production bundle in `.next/`.

```bash
npm start
```

Serves the production build at `http://localhost:3000`. Requires a prior
`npm run build`.

## Caching behavior (local)

- The catalog cache lives in `.cache/products.json` (next to `package.json`)
  when running locally — **not** in `/tmp` (that path is only used on
  Netlify/serverless).
- TTL is 30 minutes. To force a fresh fetch from BCL, delete the cache:

  ```bash
  rm -f .cache/products.json
  ```

## Environment variables

| Variable | Purpose |
| -------- | ------- |
| `NETLIFY` / `VERCEL` | If set, the API switches its cache path to `/tmp` (read-only FS workaround). Set automatically by the deploy platform — you generally don't set these locally. |
| `NEXT_TELEMETRY_DISABLED` | Set to `"1"` in `netlify.toml` to disable Next telemetry on builds. |

There are currently **no** required secrets/API keys for local development — the
app pulls public data from `bcliquorstores.com`.

## Troubleshooting

| Symptom | Likely cause / fix |
| ------- | ------------------ |
| `EADDRINUSE` on port 3000 | Another process holds the port; run on another port (`npm run dev -- -p 4000`). |
| `/api/products` returns an error on first load | Cold cache + upstream BCL unreachable; retry, or check network. |
| Products are stale | 30-min cache; delete `.cache/products.json` and reload. |
| Images 403 | URL host isn't `www.bcliquorstores.com` (by design). |
| `npm run build` type errors | Run `npx tsc --noEmit` for a focused type check and fix reported files. |

## Deploy (Netlify)

`netlify.toml` defines the build:

```toml
[build]
  command = "npm run build"
```

Push to `main` and Netlify builds + deploys. The CDN adds
`Cache-Control: public, max-age=900, stale-while-revalidate=3600` to `/api/*`.
