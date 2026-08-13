# ADR-0002: Server-side catalog fetch with disk caching

- Status: Accepted
- Date: 2026-08-13

## Context

The product catalog is scraped from BC Liquor's public AJAX browse endpoint
(`https://www.bcliquorstores.com/ajax/browse?sort=currentPrice:asc&size=9999`).
Fetching the full catalog (~10k items) on every page load would be slow and
abusive to the upstream service. Serverless functions also have a bounded
execution time.

## Decision

Fetch and normalize the catalog **once server-side** in `GET /api/products`,
then cache the normalized `ProductsResponse` as JSON on disk:

- Cache location: `/tmp/cheapbooze-cache/products.json` on Netlify/other
  serverless (where the filesystem is read-only except `/tmp`), otherwise
  `.cache/products.json` locally.
- TTL: 30 minutes (`CACHE_TTL_MS`).
- Normalization (including derived `pricePerMlPure` and `pureAlcoholMl`) happens
  at fetch time, so clients receive ready-to-render data.
- The Netlify CDN adds `Cache-Control: public, max-age=900, stale-while-revalidate=3600`
  to `/api/*` responses as an additional edge cache layer.

## Consequences

### Positive

- Upstream BCL is hit at most once per 30 minutes per function instance.
- Client requests are fast and return a small, typed payload.
- Derived value metrics are computed in one place (server-side), keeping client
  logic simpler.

### Negative

- Cache is per-function-instance and in-memory-per-instance semantics vary; on
  cold starts the first request may be slow while the cache warms.
- Disk cache on serverless is ephemeral — a redeploy or instance recycle clears
  it (acceptable, it just re-fetches).

### Trade-offs

- An external cache (e.g. KV/Redis) would give a shared, durable cache but adds
  infrastructure and cost that isn't warranted at this scale.
