"use client";

import { Search, SlidersHorizontal, Star } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Highest Rated", value: "rating" },
  { label: "Stars: High to Low", value: "stars_desc" },
];

const PRICE_RANGES = [
  { label: "Under $100 / night", min: "0", max: "100" },
  { label: "$100 – $250", min: "100", max: "250" },
  { label: "$250 – $500", min: "250", max: "500" },
  { label: "$500+", min: "500", max: "" },
];

interface HotelsFiltersProps {
  searchParams: Record<string, string | undefined>;
}

export function HotelsFilters({ searchParams }: HotelsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(searchParams.q ?? "");

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams();
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

  const activeStars = searchParams.stars ? parseInt(searchParams.stars, 10) : null;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-charcoal-900">
        <h2 className="mb-4 text-sm font-semibold text-charcoal-950 dark:text-white">Search</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search hotels..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-4 text-sm text-charcoal-950 placeholder:text-charcoal-400 outline-none transition-colors focus:border-amber-500/50 focus:bg-white dark:focus:bg-charcoal-800 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-stone-500"
          />
        </div>
      </div>

      {/* Star Rating */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-charcoal-900">
        <h2 className="mb-4 text-sm font-semibold text-charcoal-950 dark:text-white">
          Star rating
        </h2>
        <div className="space-y-2">
          <button
            onClick={() => updateParam("stars", "")}
            className={cn(
              "w-full rounded-lg px-3 py-2.5 text-left text-sm transition-all",
              activeStars === null
                ? "bg-amber-50 font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                : "text-charcoal-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/5"
            )}
          >
            All stars
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => updateParam("stars", String(star))}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-all",
                activeStars === star
                  ? "bg-amber-50 font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  : "text-charcoal-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/5"
              )}
            >
              <span className="flex items-center gap-0.5">
                {Array.from({ length: star }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </span>
              <span>{star} Star{star !== 1 ? "s" : ""}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price per night */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-charcoal-900">
        <h2 className="mb-4 text-sm font-semibold text-charcoal-950 dark:text-white">
          Price per night
        </h2>
        <div className="space-y-3">
          {PRICE_RANGES.map((range) => {
            const isActive =
              (searchParams.minPrice ?? "") === range.min &&
              (searchParams.maxPrice ?? "") === range.max;
            return (
              <label key={range.label} className="flex cursor-pointer items-center gap-3">
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
                <span className="text-sm text-charcoal-600 dark:text-stone-400">{range.label}</span>
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
