import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Clock,
  Users,
  MapPin,
  Search,
  SlidersHorizontal,
  ArrowRight,
  Package,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency, formatDuration, cn } from "@/lib/utils";
import { WishlistButton } from "@/components/shared/WishlistButton";
import type { Prisma } from "@prisma/client";

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Travel Packages — Curated Journeys",
  description:
    "Discover handcrafted travel packages for every style — adventure, luxury, cultural, family, and more. All-inclusive itineraries with day-by-day plans.",
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface PackagesPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    destination?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

type SearchParams = Awaited<PackagesPageProps["searchParams"]>;

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const CATEGORIES: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Adventure", value: "ADVENTURE" },
  { label: "Cultural", value: "CULTURAL" },
  { label: "Beach", value: "BEACH" },
  { label: "Mountain", value: "MOUNTAIN" },
  { label: "City Break", value: "CITY" },
  { label: "Wildlife", value: "WILDLIFE" },
  { label: "Honeymoon", value: "HONEYMOON" },
  { label: "Family", value: "FAMILY" },
  { label: "Luxury", value: "LUXURY" },
  { label: "Budget", value: "BUDGET" },
];

const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Highest Rated", value: "rating" },
  { label: "Duration: Shortest", value: "duration_asc" },
];

const PRICE_RANGES = [
  { label: "Under $500", min: "0", max: "500" },
  { label: "$500 – $1,500", min: "500", max: "1500" },
  { label: "$1,500 – $3,000", min: "1500", max: "3000" },
  { label: "$3,000+", min: "3000", max: "" },
];

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function getPackages(params: SearchParams) {
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where: Prisma.TravelPackageWhereInput = {
    published: true,
    deletedAt: null,
  };

  if (params.q) {
    where.OR = [
      { title: { contains: params.q } },
      { description: { contains: params.q } },
      { destination: { name: { contains: params.q } } },
    ];
  }

  if (params.category) {
    where.category = params.category as string;
  }

  if (params.destination) {
    where.destination = {
      name: { contains: params.destination },
    };
  }

  if (params.minPrice || params.maxPrice) {
    where.priceFrom = {};
    if (params.minPrice) where.priceFrom.gte = parseFloat(params.minPrice);
    if (params.maxPrice) where.priceFrom.lte = parseFloat(params.maxPrice);
  }

  const orderBy: Prisma.TravelPackageOrderByWithRelationInput =
    params.sort === "price_asc"
      ? { priceFrom: "asc" }
      : params.sort === "price_desc"
        ? { priceFrom: "desc" }
        : params.sort === "rating"
          ? { rating: "desc" }
          : params.sort === "duration_asc"
            ? { duration: "asc" }
            : { featured: "desc" };

  const [packages, total] = await Promise.all([
    db.travelPackage.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        title: true,
        duration: true,
        priceFrom: true,
        priceDiscount: true,
        currency: true,
        rating: true,
        reviewCount: true,
        category: true,
        maxTravelers: true,
        images: { select: { url: true, alt: true }, orderBy: { order: "asc" }, take: 1 },
        destination: {
          select: {
            name: true,
            country: { select: { name: true } },
          },
        },
      },
    }),
    db.travelPackage.count({ where }),
  ]);

  return { packages, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function PackagesHero() {
  return (
    <div className="relative overflow-hidden bg-charcoal-950 pt-24 pb-16">
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>
      {/* Amber accent glow */}
      <div className="pointer-events-none absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-amber-500/10 blur-[80px]" />
      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-16">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">
          All-inclusive journeys
        </p>
        <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
          Travel Packages
        </h1>
        <p className="mt-4 max-w-lg text-stone-400">
          Expertly crafted, day-by-day itineraries across the world's most breathtaking
          destinations. Every detail handled, every moment unforgettable.
        </p>
      </div>
    </div>
  );
}

// ─── Filters Sidebar (Client Component) ──────────────────────────────────────

import { PackagesFilters } from "@/components/packages/PackagesFilters";

// ─── Package Card ─────────────────────────────────────────────────────────────

type PackageItem = Awaited<ReturnType<typeof getPackages>>["packages"][number];

function PackageCard({ pkg }: { pkg: PackageItem }) {
  const heroImage = pkg.images[0];
  const hasDiscount =
    pkg.priceDiscount !== null &&
    pkg.priceDiscount !== undefined &&
    Number(pkg.priceDiscount) < Number(pkg.priceFrom);
  const displayPrice = hasDiscount ? Number(pkg.priceDiscount) : Number(pkg.priceFrom);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-xl dark:border-white/10 dark:bg-charcoal-900">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {heroImage ? (
          <Image
            src={heroImage.url}
            alt={heroImage.alt ?? pkg.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-stone-100 dark:bg-charcoal-800">
            <Package className="h-12 w-12 text-stone-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Category badge */}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-charcoal-700 backdrop-blur-sm dark:bg-charcoal-900/90 dark:text-stone-200">
          {pkg.category.charAt(0) + pkg.category.slice(1).toLowerCase()}
        </div>

        <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
          {/* Wishlist */}
          <WishlistButton type="PACKAGE" itemId={pkg.id} />
          {/* Rating */}
          <div className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-white">{Number(pkg.rating).toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Destination */}
        <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>
            {pkg.destination.name}, {pkg.destination.country.name}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-charcoal-950 dark:text-white line-clamp-2">
          {pkg.title}
        </h3>

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDuration(pkg.duration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>Max {pkg.maxTravelers}</span>
          </div>
          {pkg.reviewCount > 0 && (
            <span className="ml-auto">
              {pkg.reviewCount} review{pkg.reviewCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4 dark:border-white/8">
          <div>
            {hasDiscount && (
              <p className="text-xs text-stone-400 line-through">
                {formatCurrency(Number(pkg.priceFrom), pkg.currency)}
              </p>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-stone-500 dark:text-stone-400">From</span>
              <span className="text-lg font-bold text-charcoal-950 dark:text-white">
                {formatCurrency(displayPrice, pkg.currency)}
              </span>
            </div>
          </div>

          <Link
            href={`/packages/${pkg.slug}`}
            className="flex items-center gap-1.5 rounded-xl bg-charcoal-950 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-charcoal-800 dark:bg-white dark:text-charcoal-950 dark:hover:bg-stone-100"
          >
            View Package
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

async function PackagesGrid({ searchParams }: { searchParams: SearchParams }) {
  let data;
  try {
    data = await getPackages(searchParams);
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 text-5xl">⚠️</div>
        <h3 className="mb-2 text-lg font-semibold text-charcoal-950 dark:text-white">
          Something went wrong
        </h3>
        <p className="text-sm text-stone-500">Unable to load packages. Please try again later.</p>
      </div>
    );
  }

  const { packages, total, page, totalPages } = data;

  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 text-5xl">🧳</div>
        <h3 className="mb-2 text-lg font-semibold text-charcoal-950 dark:text-white">
          No packages found
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Try adjusting your filters or search query.
        </p>
        <Link
          href="/packages"
          className="mt-4 rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-medium text-charcoal-700 hover:bg-stone-50 dark:border-white/10 dark:text-stone-300 dark:hover:bg-white/5"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          <span className="font-semibold text-charcoal-950 dark:text-white">{total}</span>{" "}
          packages found
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/packages?${new URLSearchParams({
                ...Object.fromEntries(
                  Object.entries(searchParams).filter(([, v]) => v != null) as [string, string][]
                ),
                page: String(p),
              })}`}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all",
                p === page
                  ? "bg-charcoal-950 text-white dark:bg-white dark:text-charcoal-950"
                  : "border border-stone-200 text-charcoal-600 hover:border-charcoal-300 hover:bg-stone-50 dark:border-white/10 dark:text-stone-400 dark:hover:bg-white/5"
              )}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function PackagesGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-stone-200 dark:border-white/10">
          <div className="skeleton aspect-[16/10]" />
          <div className="space-y-3 p-5">
            <div className="skeleton h-3 w-1/3 rounded" />
            <div className="skeleton h-5 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PackagesPage({ searchParams }: PackagesPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-charcoal-950">
      <PackagesHero />

      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 xl:px-16">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-72 xl:w-80">
            <PackagesFilters searchParams={params} />
          </aside>

          {/* Main Grid */}
          <main className="min-w-0 flex-1">
            <Suspense fallback={<PackagesGridSkeleton />}>
              <PackagesGrid searchParams={params} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
