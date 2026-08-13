"use client";

import { useState, useEffect, useMemo } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductDetail } from "@/components/product-detail";
import {
  ProductFilters,
  type FilterState,
  type SortOption,
} from "@/components/product-filters";
import type { Product, ProductsResponse } from "@/lib/types";
import { Beaker, TrendingDown, RefreshCw, AlertCircle } from "lucide-react";

const DEFAULT_FILTERS: FilterState = {
  search: "",
  category: "all",
  maxPrice: 9999,
  minAlcohol: 0,
  sort: "value-asc",
  craftOnly: false,
};

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "value-asc":
      sorted.sort((a, b) => a.pricePerMlPure - b.pricePerMlPure);
      break;
    case "value-desc":
      sorted.sort((a, b) => b.pricePerMlPure - a.pricePerMlPure);
      break;
    case "price-asc":
      sorted.sort((a, b) => a.currentPrice - b.currentPrice);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.currentPrice - a.currentPrice);
      break;
    case "rating-desc":
      sorted.sort((a, b) => b.consumerRating - a.consumerRating);
      break;
    case "alcohol-desc":
      sorted.sort((a, b) => b.alcoholPercentage - a.alcoholPercentage);
      break;
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }
  return sorted;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Infinite scroll: only render a window of products at a time
  const PAGE_SIZE = 60;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null);

  // Reset the visible window whenever filters change. Adjust state during
  // render (React-recommended) rather than in an effect.
  const [prevFilters, setPrevFilters] = useState(filters);
  if (filters !== prevFilters) {
    setPrevFilters(filters);
    setVisibleCount(PAGE_SIZE);
  }

  async function fetchCatalog(): Promise<ProductsResponse> {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  }

  const applyCatalog = (data: ProductsResponse) => {
    setProducts(data.products);
    setFetchedAt(data.fetchedAt);
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      applyCatalog(await fetchCatalog());
    } catch {
      setError("Could not load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load on mount. Initial `loading` is already true and every setState call
  // happens after `await`, so nothing runs synchronously in the effect body.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCatalog();
        if (!cancelled) applyCatalog(data);
      } catch {
        if (!cancelled) setError("Could not load products. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [products]);

  const maxPriceAvailable = useMemo(() => {
    if (products.length === 0) return 100;
    return Math.max(...products.map((p) => p.currentPrice));
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // Search filter
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.style?.toLowerCase().includes(q) &&
          !p.category?.toLowerCase().includes(q) &&
          !p.tastingDescription?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      // Category filter
      if (filters.category !== "all" && p.category !== filters.category) {
        return false;
      }

      // Max price filter
      if (p.currentPrice > filters.maxPrice) {
        return false;
      }

      // Min alcohol filter
      if (p.alcoholPercentage < filters.minAlcohol) {
        return false;
      }

      // Craft only filter
      if (filters.craftOnly && !p.isCraft) {
        return false;
      }

      return true;
    });

    result = sortProducts(result, filters.sort);
    return result;
  }, [products, filters]);

  // Only render the current window of products (infinite scroll). The slice is
  // naturally bounded by the filtered list length.
  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  // Load the next page when the sentinel scrolls into view
  useEffect(() => {
    if (!sentinelEl) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((count) =>
            Math.min(count + PAGE_SIZE, filteredProducts.length)
          );
        }
      },
      { rootMargin: "1200px 0px" }
    );
    observer.observe(sentinelEl);
    return () => observer.disconnect();
  }, [sentinelEl, filteredProducts.length]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  const formatFetchedTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-CA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Summary stats for the header
  const bestValue = products.length > 0 ? products[0] : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Beaker className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">
                CheapBooze
              </h1>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">
                BC Liquor &mdash; Best Value per mL of Alcohol
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {fetchedAt && (
              <span className="text-[10px] text-zinc-400 hidden sm:inline">
                Updated {formatFetchedTime(fetchedAt)}
              </span>
            )}
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`size-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters bar - collapsible on mobile */}
        <div className="max-w-7xl mx-auto px-4 pb-3">
          <ProductFilters
            filters={filters}
            categories={categories}
            maxPriceAvailable={maxPriceAvailable}
            onChange={setFilters}
          />
        </div>
      </header>

      {/* Best value teaser */}
      {!loading && !error && bestValue && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-md">
            <div className="flex items-center gap-2 text-emerald-100 text-xs font-medium uppercase tracking-wider mb-1">
              <TrendingDown className="size-3.5" />
              Best Overall Value
            </div>
            <p className="text-sm sm:text-base font-semibold">
              {bestValue.name} &mdash;{" "}
              <span className="text-emerald-50">
                ${bestValue.pricePerMlPure.toFixed(4)}/mL pure alcohol
                {bestValue.isLimitedTimeOffer &&
                  ` · Now $${bestValue.currentPrice.toFixed(2)}`}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Product count */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {loading
            ? "Loading products..."
            : error
              ? ""
              : visibleProducts.length < filteredProducts.length
                ? `Showing ${visibleProducts.length} of ${filteredProducts.length} products`
                : `${filteredProducts.length} of ${products.length} products`}
        </p>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-4 pb-16">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="size-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <p className="text-sm text-zinc-500">
                Fetching products from BC Liquor...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertCircle className="size-8 text-red-400" />
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={fetchProducts}
              className="text-xs text-emerald-600 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-2">
            <p className="text-sm text-zinc-500">No products match your filters.</p>
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-xs text-emerald-600 hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {visibleProducts.map((product, index) => (
                <ProductCard
                  key={product.sku}
                  product={product}
                  rank={index + 1}
                  onSelect={handleSelectProduct}
                />
              ))}
            </div>
            {/* Infinite scroll sentinel: load next page when scrolled into view */}
            {visibleProducts.length < filteredProducts.length && (
              <div
                ref={setSentinelEl}
                aria-hidden
                className="h-px"
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-zinc-400">
          <p>
            Data sourced from BC Liquor Store. Prices and availability subject to
            change.
          </p>
          <p className="mt-1">
            Not affiliated with BC Liquor Distribution Branch.
          </p>
        </div>
      </footer>

      {/* Product Detail Sheet */}
      <ProductDetail
        product={selectedProduct}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}

