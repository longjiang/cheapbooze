"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { formatPrice, formatPricePerMl, formatVolume } from "@/lib/format";
import {
  Star,
  Tag,
  Globe,
  Warehouse,
  Store,
  Wine,
  Droplets,
  Percent,
  Beaker,
  Leaf,
  Diamond,
  Sparkles,
} from "lucide-react";

interface ProductDetailProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-zinc-400 shrink-0 size-4">{icon}</span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400 w-28 shrink-0">
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function ProductDetail({
  product,
  open,
  onOpenChange,
}: ProductDetailProps) {
  if (!product) return null;

  const isSale = product.isLimitedTimeOffer;
  const discount =
    isSale && product.regularPrice > 0
      ? Math.round((1 - product.currentPrice / product.regularPrice) * 100)
      : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg leading-tight">
            {product.name}
          </SheetTitle>
          <SheetDescription className="text-xs">
            SKU: {product.sku}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Product Image */}
          <div className="relative aspect-square bg-zinc-50 dark:bg-zinc-900 rounded-lg overflow-hidden">
            {product.image ? (
              <img
                src={`/api/images?url=${encodeURIComponent(product.image.replace("http://", "https://"))}`}
                alt={product.name}
                className="size-full object-contain p-6"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-400">
                No image available
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            {isSale ? (
              <>
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatPrice(product.currentPrice)}
                </span>
                <span className="text-xl text-zinc-400 line-through">
                  {formatPrice(product.regularPrice)}
                </span>
                {discount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    -{discount}%
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-3xl font-bold">
                {formatPrice(product.currentPrice)}
              </span>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 text-center">
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Price / mL Pure Alcohol
              </div>
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                {formatPricePerMl(product.pricePerMlPure)}
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 text-center">
              <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Total Pure Alcohol
              </div>
              <div className="text-lg font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                {product.pureAlcoholMl.toFixed(1)} mL
              </div>
            </div>
          </div>

          {/* Rating */}
          {product.consumerRating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < Math.round(product.consumerRating)
                        ? "fill-current"
                        : "text-zinc-300 dark:text-zinc-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">
                {product.consumerRating.toFixed(1)}
              </span>
              <span className="text-xs text-zinc-400">
                ({product.votes} reviews)
              </span>
            </div>
          )}

          {/* Ribbons */}
          {product.ribbons?.filter((r) => r.id !== "empty-placeholder")
            .length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.ribbons
                .filter((r) => r.id !== "empty-placeholder")
                .map((ribbon) => (
                  <Badge
                    key={ribbon.id}
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                  >
                    {ribbon.label}
                  </Badge>
                ))}
            </div>
          )}

          {/* Tasting Description */}
          {product.tastingDescription && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Description</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {product.tastingDescription}
              </p>
            </div>
          )}

          {/* Details Table */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Product Details</h4>
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg px-3 divide-y divide-zinc-100 dark:divide-zinc-800">
              <DetailRow
                icon={<Tag />}
                label="Category"
                value={product.category}
              />
              {product.subCategory && (
                <DetailRow
                  icon={<Wine />}
                  label="Subcategory"
                  value={product.subCategory}
                />
              )}
              {product.style && (
                <DetailRow
                  icon={<Beaker />}
                  label="Style"
                  value={product.style}
                />
              )}
              <DetailRow
                icon={<Droplets />}
                label="Volume"
                value={formatVolume(product.volume)}
              />
              <DetailRow
                icon={<Percent />}
                label="Alcohol %"
                value={`${product.alcoholPercentage}% ABV`}
              />
              <DetailRow
                icon={<Globe />}
                label="Origin"
                value={product.countryName || "Unknown"}
              />
              <DetailRow
                icon={<Warehouse />}
                label="In Stock"
                value={product.availableUnits.toLocaleString()} />
              <DetailRow
                icon={<Store />}
                label="Store Count"
                value={product.storeCount.toLocaleString()}
              />
              {product.isCraft && (
                <DetailRow icon={<Sparkles />} label="Feature" value="Crafted" />
              )}
              {product.isOrganic && (
                <DetailRow icon={<Leaf />} label="Feature" value="Organic" />
              )}
              {product.isExclusive && (
                <DetailRow
                  icon={<Diamond />}
                  label="Feature"
                  value="BCL Exclusive"
                />
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
