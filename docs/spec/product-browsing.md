# Product Browsing

## Summary

The home page presents the full BC Liquor catalog and lets shoppers search,
filter, sort, and inspect products to find the best value per ml of pure
alcohol.

## User stories

- As a shopper, I want to see the cheapest spirits per ml of pure alcohol, so
  that I can maximize value.
- As a shopper, I want to filter by category, max price, minimum alcohol, and
  craft-only, so that I can narrow the list to what I care about.
- As a shopper, I want to search by name, so that I can find a specific product.
- As a shopper, I want to sort by value, price, rating, alcohol, or name, so
  that I can order the list the way I think.
- As a shopper, I want to tap a product to see full details (description,
  tasting notes, ratings, store availability), so that I can decide before
  buying.

## Requirements

### Functional

- REQ-F-01: The page loads the full catalog from `GET /api/products` on mount.
- REQ-F-02: Products are displayed as cards (`ProductCard`) in a responsive grid.
- REQ-F-03: Filters (`product-filters.tsx`) support:
  - free-text search
  - category (including "all")
  - maximum price
  - minimum alcohol percentage
  - craft-only toggle
- REQ-F-04: Supported sort orders: value (per-ml-pure) asc/desc, price asc/desc,
  rating desc, alcohol desc, name asc.
- REQ-F-05: Filtering + sorting run client-side over the fetched catalog and are
  recomputed with `useMemo`.
- REQ-F-06: Selecting a product opens a detail sheet (`ProductDetail`) with the
  product's full metadata.
- REQ-F-07: Product images load through the `/api/images` proxy.
- REQ-F-08: On fetch failure, an error state with a "retry" action is shown.

### Non-functional

- REQ-N-01: The catalog fetch must be cached server-side (30-min TTL) to avoid
  repeated upstream calls to BCL.
- REQ-N-02: The page should remain responsive while sorting/filtering up to the
  full catalog (~10k items) on a mid-range device.
- REQ-N-03: Image proxying must only allow `www.bcliquorstores.com` as the
  source host (SSRF guard).

## Acceptance criteria

- [ ] Page loads and renders product cards without layout shift after data arrives.
- [ ] Each filter changes the visible list immediately; sort order applies on top of filters.
- [ ] "Value" sort orders by `pricePerMlPure` ascending by default.
- [ ] Clicking a card opens the detail sheet with accurate data.
- [ ] All `<img>` tags resolve through `/api/images`.
- [ ] A network failure shows the error state; retry re-fetches successfully.
