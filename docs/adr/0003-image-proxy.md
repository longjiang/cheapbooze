# ADR-0003: Image proxy for product images

- Status: Accepted
- Date: 2026-08-13

## Context

Product images are hosted on `www.bcliquorstores.com`. Hotlinking them directly
from the browser risks mixed-content issues, CORS problems, upstream rate
limiting, and leaves image caching policy uncontrolled. Images also need a
browser-like `User-Agent` to be served by the upstream.

## Decision

Proxy product images through a dedicated Route Handler `GET /api/images?url=<url>`:

- Only `www.bcliquorstores.com` hostnames are allowed (all others get `403`,
  guarding against SSRF).
- The handler fetches the upstream image with a browser `User-Agent`, verifies
  the upstream response, and returns the bytes with
  `Cache-Control: public, max-age=86400` (24 h).
- Client components reference images as `/api/images?url=...`.

## Consequences

### Positive

- Centralized cache policy for images (24 h at the browser/edge).
- Single place to enforce the allow-listed image host (SSRF guard).
- Avoids CORS/mixed-content issues in the browser.

### Negative

- Every image request adds a server hop (can be partially mitigated by the CDN
  edge cache).
- Adds a small amount of per-image latency on cache misses.

### Trade-offs

- Next.js `next/image` with a remote pattern was considered; the custom proxy
  keeps behavior explicit and works identically on static/edge deploys without
  configuring an image optimizer.
