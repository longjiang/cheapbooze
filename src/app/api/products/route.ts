import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Product, ProductsResponse } from "@/lib/types";

const BCL_URL =
  "https://www.bcliquorstores.com/ajax/browse?sort=currentPrice:asc&size=9999";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getCachePath() {
  // On Netlify/serverless, the filesystem is read-only except /tmp
  const base =
    process.env.NETLIFY || process.env.VERCEL
      ? path.join("/tmp", "cheapbooze-cache")
      : path.join(process.cwd(), ".cache");
  return path.join(base, "products.json");
}

function parseProduct(source: Record<string, unknown>): Product {
  const name = (source.name as string) || "";
  const regularPrice = parseFloat((source.regularPrice as string) || "0");
  const currentPrice = parseFloat((source.currentPrice as string) || "0");
  const isSale = source.isLimitedTimeOffer === true;
  const volume = parseFloat((source.volume as string) || "0");
  const alcoholPct = parseFloat((source.alcoholPercentage as string) || "0");

  const pureAlcoholMl = volume * 1000 * (alcoholPct / 100);
  const pricePerMlPure =
    pureAlcoholMl > 0
      ? Math.round((currentPrice / pureAlcoholMl) * 10000) / 10000
      : 0;

  const category = (source.category as { description?: string })?.description || "";
  const subCategory = (source.subCategory as { description?: string })?.description || "";

  return {
    sku: (source.sku as string) || "",
    name,
    namePrefix: (source.namePrefix as string) || "",
    nameSuffix: (source.nameSuffix as string) || "",
    regularPrice,
    currentPrice,
    isLimitedTimeOffer: isSale,
    salePrice: isSale ? currentPrice : null,
    volume,
    alcoholPercentage: alcoholPct,
    pureAlcoholMl: Math.round(pureAlcoholMl * 100) / 100,
    pricePerMlPure,
    image: ((source.image as string) || "").replace(/\.jpeg$/i, ".jpg"),
    tastingDescription: (source.tastingDescription as string) || "",
    consumerRating: (source.consumerRating as number) || 0,
    votes: (source.votes as number) || 0,
    category,
    subCategory,
    style: (source.style as string) || "",
    countryName: (source.countryName as string) || "",
    isCraft: source.isCraft === true,
    isOrganic: source.isOrganic === true,
    isExclusive: source.isExclusive === true,
    isNew: source.isNew === true,
    availableUnits: (source.availableUnits as number) || 0,
    storeCount: (source.storeCount as number) || 0,
    upc: (source.upc as string[]) || [],
    ribbons: (source.ribbons as { id: string; label: string }[]) || [],
  };
}

async function readCache(): Promise<ProductsResponse | null> {
  try {
    const cachePath = getCachePath();
    const stat = await fs.stat(cachePath);
    const age = Date.now() - stat.mtimeMs;
    if (age > CACHE_TTL_MS) return null;
    const raw = await fs.readFile(cachePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeCache(data: ProductsResponse): Promise<void> {
  try {
    const cachePath = getCachePath();
    await fs.mkdir(path.dirname(cachePath), { recursive: true });
    await fs.writeFile(cachePath, JSON.stringify(data), "utf-8");
  } catch (err) {
    console.error("Failed to write cache:", err);
  }
}

async function fetchFromBCL(): Promise<ProductsResponse> {
  const response = await fetch(BCL_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`BCL API responded with status ${response.status}`);
  }

  const data = await response.json();
  const hits = data?.hits?.hits ?? [];

  const products: Product[] = hits
    .map((item: { _source: Record<string, unknown> }) =>
      parseProduct(item._source)
    )
    .filter((p: Product) => p.pureAlcoholMl > 0);

  // Sort by best value (lowest price per ml of pure alcohol)
  products.sort((a, b) => a.pricePerMlPure - b.pricePerMlPure);

  return {
    products,
    total: products.length,
    fetchedAt: new Date().toISOString(),
  };
}

export async function GET() {
  // Try reading from file cache first
  const cached = await readCache();
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "public, max-age=900, stale-while-revalidate=3600",
        "X-Cache": "HIT",
      },
    });
  }

  // Fetch fresh data
  try {
    const result = await fetchFromBCL();
    // Write to cache (fire-and-forget, don't block response)
    writeCache(result);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=900, stale-while-revalidate=3600",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Failed to fetch BC Liquor products:", error);
    // Try to serve stale cache as fallback
    try {
      const cachePath = getCachePath();
      const raw = await fs.readFile(cachePath, "utf-8");
      const stale = JSON.parse(raw);
      return NextResponse.json(stale, {
        headers: { "X-Cache": "STALE" },
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch products", products: [], total: 0, fetchedAt: "" },
        { status: 500 }
      );
    }
  }
}
