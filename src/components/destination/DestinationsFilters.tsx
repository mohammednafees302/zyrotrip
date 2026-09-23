"use client";

import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Adventure", value: "adventure" },
  { label: "Cultural", value: "cultural" },
  { label: "Beach", value: "beach" },
  { label: "Mountain", value: "mountain" },
  { label: "City", value: "city" },
  { label: "Wildlife", value: "wildlife" },
  { label: "Luxury", value: "luxury" },
];

const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Highest Rated", value: "rating" },
  { label: "Most Popular", value: "popular" },
];

interface DestinationsFiltersProps {
  searchParams: Record<string, string | undefined>;
}

export function DestinationsFilters({ searchParams }: DestinationsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(searchParams.q ?? "");

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams();
      // Preserve existing params
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v && k !== key && k !== "page") params.set(k, v);
      });
      if (value) params.set(key, value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleSearch = useCallback(() => {
    updateParam("q", search);
  }, [search, updateParam]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-charcoal-900">
        <h2 className="mb-4 text-sm font-semibold text-charcoal-950 dark:text-white">
          Search
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search destinations..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-4 text-sm text-charcoal-950 placeholder:text-charcoal-400 outline-none transition-colors focus:border-amber-500/50 focus:bg-white dark:focus:bg-charcoal-800 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-stone-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-charcoal-900">
        <h2 className="mb-4 text-sm font-semibold text-charcoal-950 dark:text-white">
          Category
        </h2>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isActive = (searchParams.category ?? "") === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => updateParam("category", cat.value)}
                className={cn(
                  "w-full rounded-lg px-3 py-2.5 text-left text-sm transition-all",
                  isActive
                    ? "bg-amber-50 font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                    : "text-charcoal-600 hover:bg-stone-50 hover:text-charcoal-950 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-white"
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget Range */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-charcoal-900">
        <h2 className="mb-4 text-sm font-semibold text-charcoal-950 dark:text-white">
          Budget per person
        </h2>
        <div className="space-y-3">
          {[
            { label: "Under $1,000", min: "0", max: "1000" },
            { label: "$1,000 – $2,000", min: "1000", max: "2000" },
            { label: "$2,000 – $3,500", min: "2000", max: "3500" },
            { label: "$3,500+", min: "3500", max: "" },
          ].map((range) => {
            const isActive =
              (searchParams.minPrice ?? "") === range.min &&
              (searchParams.maxPrice ?? "") === range.max;
            return (
              <label
                key={range.label}
                className="flex cursor-pointer items-center gap-3"
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => {
                    const params = new URLSearchParams();
                    Object.entries(searchParams).forEach(([k, v]) => {
                      if (v && k !== "minPrice" && k !== "maxPrice" && k !== "page") {
                        params.set(k, v);
                      }
                    });
                    if (!isActive) {
                      params.set("minPrice", range.min);
                      if (range.max) params.set("maxPrice", range.max);
                    }
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className="h-4 w-4 rounded border-stone-300 accent-amber-500"
                />
                <span className="text-sm text-charcoal-600 dark:text-stone-400">
                  {range.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Sort */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-charcoal-900">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-charcoal-950 dark:text-white">
          <SlidersHorizontal className="h-4 w-4" />
          Sort by
        </h2>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => {
            const isActive = (searchParams.sort ?? "recommended") === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => updateParam("sort", opt.value)}
                className={cn(
                  "w-full rounded-lg px-3 py-2.5 text-left text-sm transition-all",
                  isActive
                    ? "bg-charcoal-950 font-medium text-white dark:bg-white dark:!text-[#141310]"
                    : "text-charcoal-600 hover:bg-stone-50 hover:text-charcoal-950 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-white"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
