# ADR-0001: Use Next.js App Router

- Status: Accepted
- Date: 2026-08-13

## Context

The project is a small, read-only catalog browser. It needs client-side
interactivity (filtering, sorting, a detail sheet), a couple of server-side API
routes, and a simple static deployment on Netlify.

## Decision

Build the app with Next.js 16 using the **App Router** (`src/app/`), React 19,
and TypeScript. Server-side logic lives in Route Handlers under `src/app/api/`.

## Consequences

### Positive

- Route Handlers give us serverless API endpoints (`/api/products`,
  `/api/images`) without a separate backend service.
- Client components (`"use client"`) handle the interactive UI while shared
  domain types stay server/client compatible (`src/lib/types.ts`).
- `next build` produces a static/edge deployable artifact for Netlify.

### Negative

- App Router conventions (file-based routing, RSC boundaries) add a learning
  curve and some boilerplate (`"use client"` directives).
- The toolchain is newer and moves fast; upgrading Next.js majors may require
  breaking changes.

### Trade-offs

- A fully static site (no server routes) was considered but rejected because
  we need server-side proxying/caching of the upstream BCL catalog and images.
