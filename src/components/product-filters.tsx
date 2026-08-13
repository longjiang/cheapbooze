"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type SortOption =
  | "value-asc"
  | "value-desc"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "alcohol-desc"
  | "name-asc";

export interface FilterState {
  search: string;
  category: string;
  maxPrice: number;
  minAlcohol: number;
  sort: SortOption;
  craftOnly: boolean;
}

interface ProductFiltersProps {
  filters: FilterState;
  categories: string[];
  maxPriceAvailable: number;
  onChange: (filters: FilterState) => void;
}

export function ProductFilters({
  filters,
  categories,
  maxPriceAvailable,
  onChange,
}: ProductFiltersProps) {
  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial });
  };

  const activeFilterCount = [
    filters.search,
    filters.category !== "all",
    filters.maxPrice < maxPriceAvailable,
    filters.minAlcohol > 0,
    filters.craftOnly,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
        <Input
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="pl-9 pr-8"
        />
        {filters.search && (
          <button
            onClick={() => update({ search: "" })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-3">
        {/* Category */}
        <Select
          value={filters.category}
          onValueChange={(v) => update({ category: v ?? "all" })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={filters.sort}
          onValueChange={(v) => update({ sort: (v ?? "value-asc") as SortOption })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="value-asc">
              Best Value (Lowest $/mL alcohol)
            </SelectItem>
            <SelectItem value="value-desc">
              Worst Value (Highest $/mL alcohol)
            </SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="rating-desc">Highest Rated</SelectItem>
            <SelectItem value="alcohol-desc">Strongest (Highest ABV)</SelectItem>
            <SelectItem value="name-asc">Name: A-Z</SelectItem>
          </SelectContent>
        </Select>

        {/* Craft toggle */}
        <button
          onClick={() => update({ craftOnly: !filters.craftOnly })}
          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
            filters.craftOnly
              ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200"
              : "bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-700"
          }`}
        >
          Craft Only
        </button>
      </div>

      {/* Price slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Max Price: ${filters.maxPrice.toFixed(0)}</span>
          <button
            onClick={() => update({ maxPrice: maxPriceAvailable })}
            className="text-emerald-600 hover:underline"
          >
            Reset
          </button>
        </div>
        <Slider
          value={[filters.maxPrice]}
          onValueChange={(value) => {
            const v = Array.isArray(value) ? value[0] : value;
            update({ maxPrice: v });
          }}
          max={maxPriceAvailable}
          step={1}
          className="w-full"
        />
      </div>

      {/* Min alcohol slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Min Alcohol: {filters.minAlcohol}% ABV</span>
          <button
            onClick={() => update({ minAlcohol: 0 })}
            className="text-emerald-600 hover:underline"
          >
            Reset
          </button>
        </div>
        <Slider
          value={[filters.minAlcohol]}
          onValueChange={(value) => {
            const v = Array.isArray(value) ? value[0] : value;
            update({ minAlcohol: v });
          }}
          max={80}
          step={0.5}
          className="w-full"
        />
      </div>

      {/* Active filters count */}
      {activeFilterCount > 0 && (
        <div className="text-xs text-zinc-400">
          {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
        </div>
      )}
    </div>
  );
}
