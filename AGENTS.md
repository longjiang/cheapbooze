# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository.

## Project overview

CheapBooze is a Next.js 16 (App Router) + React 19 + TypeScript app that lets
users browse BC Liquor products and rank them by value per mL of pure alcohol.
Deployed on Netlify.

- `src/app/page.tsx` — home page (client component): fetches the catalog,
  filters/sorts client-side, infinite scroll
- `src/app/api/products/route.ts` — fetches + normalizes + caches the BCL
  catalog (30-min TTL)
- `src/app/api/images/route.ts` — image proxy; only `www.bcliquorstores.com`
  hostnames allowed (SSRF guard)
- `src/components/` — UI components (shadcn/ui + Base UI)
- `src/lib/` — shared types (`types.ts`), formatting helpers
- `docs/` — architecture (`arch/`), specs (`spec/`), ADRs (`adr/`)

## Commands

| Task | Command |
| ---- | ------- |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Production build | `npm run build` |

## Mandatory rules

- **Always run `npm run typecheck` before committing.** TypeScript strict mode is
  enabled, and the Next.js build also type-checks — type errors will fail
  builds/deploys.
- Run `npm run lint` before committing too; keep the codebase warning-free.
- Don't leave console errors in the browser dev tools.
- Keep derived value metrics (`pricePerMlPure`, `pureAlcoholMl`) computed
  server-side in the products route — do not recompute them in components.
- Product images must always go through `/api/images` — never hotlink
  `bcliquorstores.com` directly.

## Data & rendering constraints

- Catalog cache: `.cache/products.json` locally, `/tmp` on serverless; 30-min TTL.
  Force a fresh fetch with `rm -f .cache/products.json`.
- The product grid renders a **window** of products (infinite scroll, 60 at a
  time) — never render the full ~10k catalog at once.
- Product card images use `loading="lazy"` — preserve that when editing
  `product-card.tsx`.
- Filtering and sorting happen client-side over the fetched catalog.

## Docs conventions

- Architecture changes → update `docs/arch/`.
- Feature behavior changes → update `docs/spec/` in the same commit.
- Point-in-time decisions → add a numbered ADR in `docs/adr/` (`NNNN-title.md`);
  never rewrite accepted ADRs — supersede them with a new one.
