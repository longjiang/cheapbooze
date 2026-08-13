"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { Product } from "@/lib/types";
import { formatPrice, formatPricePerMl, formatVolume } from "@/lib/format";
import { Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
  rank: number;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, rank, onSelect }: ProductCardProps) {
  const isSale = product.isLimitedTimeOffer;
  const discount =
    isSale && product.regularPrice > 0
      ? Math.round(
          (1 - product.currentPrice / product.regularPrice) * 100
        )
      : 0;

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-zinc-200 dark:border-zinc-800"
      onClick={() => onSelect(product)}
    >
      <CardHeader className="p-0 relative">
        <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
          {product.image ? (
            <img
              src={`/api/images?url=${encodeURIComponent(product.image.replace("http://","https://"))}`}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="size-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-400">
              <span className="text-sm">No image</span>
            </div>
          )}

          {/* Ribbon badges */}
          {product.ribbons
            ?.filter((r) => r.id !== "empty-placeholder")
            .map((ribbon) => (
              <Badge
                key={ribbon.id}
                variant="secondary"
                className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
              >
                {ribbon.label}
              </Badge>
            ))}

          {/* Sale badge */}
          {isSale && discount > 0 && (
            <Badge
              variant="destructive"
              className="absolute top-2 right-2 text-xs"
            >
              -{discount}%
            </Badge>
          )}

          {/* Value rank */}
          <div className="absolute bottom-2 left-2 size-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
            #{rank}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 pb-0">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5em]">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex items-center gap-0.5 text-amber-500">
            <Star className="size-3 fill-current" />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {product.consumerRating.toFixed(1)}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400">
            ({product.votes})
          </span>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-5 font-normal"
          >
            {product.style || product.category}
          </Badge>
        </div>

        {/* Tasting description preview */}
        {product.tastingDescription && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.tastingDescription}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-3 pt-2 flex flex-col items-start gap-1.5">
        <div className="flex items-center gap-2">
          {isSale ? (
            <>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatPrice(product.currentPrice)}
              </span>
              <span className="text-sm text-zinc-400 line-through">
                {formatPrice(product.regularPrice)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold">
              {formatPrice(product.currentPrice)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span>{formatVolume(product.volume)}</span>
          <span>{product.alcoholPercentage}% ABV</span>
          <span>
            {product.pureAlcoholMl.toFixed(1)} mL alcohol
          </span>
        </div>

        <div className="w-full pt-1 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {formatPricePerMl(product.pricePerMlPure)} pure alcohol
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
