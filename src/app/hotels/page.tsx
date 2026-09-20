import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  MapPin,
  Search,
  SlidersHorizontal,
  ArrowRight,
  Building2,
  Wifi,
  Coffee,
  Dumbbell,
  Waves,
  Car,
  Utensils,
  Wind,
  Tv,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency, cn } from "@/lib/utils";
import { WishlistButton } from "@/components/shared/WishlistButton";
import type { Prisma } from "@prisma/client";
import { HotelsFilters } from "@/components/hotels/HotelsFilters";

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Hotels — Luxury & Boutique Stays",
  description:
    "Browse our curated collection of hotels, resorts, and boutique stays around the world. Filter by destination, stars, price, and rating.",
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface HotelsPageProps {
  searchParams: Promise<{
    q?: string;
    destination?: string;
    stars?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

type SearchParams = Awaited<HotelsPageProps["searchParams"]>;

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

// ─── Amenity icon map ─────────────────────────────────────────────────────────

const AMENITY_ICONS: Record<string, React.ElementType> = {
  WiFi: Wifi,
  "Free WiFi": Wifi,
  Pool: Waves,
  Gym: Dumbbell,
  Breakfast: Coffee,
  Restaurant: Utensils,
  Parking: Car,
  "Air Conditioning": Wind,
  TV: Tv,
};

function AmenityChip({ label }: { label: string }) {
  const Icon = AMENITY_ICONS[label] ?? Building2;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs text-charcoal-600 dark:bg-white/8 dark:text-stone-300">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function getHotels(params: SearchParams) {
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where: Prisma.HotelWhereInput = {
    published: true,
    deletedAt: null,
  };

  if (params.q) {
    where.OR = [
      { name: { contains: params.q } },
      { description: { contains: params.q } },
      { destination: { name: { contains: params.q } } },
    ];
  }

  if (params.destination) {
    where.destination = { name: { contains: params.destination } };
  }

  if (params.stars) {
    where.stars = parseInt(params.stars, 10);
  }

  if (params.minPrice || params.maxPrice) {
    where.priceFrom = {};
    if (params.minPrice) where.priceFrom.gte = parseFloat(params.minPrice);
    if (params.maxPrice) where.priceFrom.lte = parseFloat(params.maxPrice);
  }

  const orderBy: Prisma.HotelOrderByWithRelationInput =
    params.sort === "price_asc"
      ? { priceFrom: "asc" }
      : params.sort === "price_desc"
        ? { priceFrom: "desc" }
        : params.sort === "rating"
          ? { rating: "desc" }
          : params.sort === "stars_desc"
            ? { stars: "desc" }
            : { featured: "desc" };

  const [hotels, total] = await Promise.all([
    db.hotel.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        name: true,
        stars: true,
        heroImage: true,
        rating: true,
        reviewCount: true,
        priceFrom: true,
        currency: true,
        amenities: true,
        destination: {
          select: {
            name: true,
            country: { select: { name: true } },
          },
        },
      },
    }),
    db.hotel.count({ where }),
  ]);

  return { hotels, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HotelsHero() {
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
      <div className="pointer-events-none absolute -top-20 right-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-[80px]" />
      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-16">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">
          Curated accommodations
        </p>
        <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
          Hotels & Resorts
        </h1>
        <p className="mt-4 max-w-lg text-stone-400">
          From intimate boutique guesthouses to world-class luxury resorts — every property
          handpicked for exceptional quality and experience.
        </p>
      </div>
    </div>
  );
}

// ─── Star Rating Display ──────────────────────────────────────────────────────

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < stars ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200 dark:fill-stone-600 dark:text-stone-600"}`}
        />
      ))}
    </div>
  );
}

// ─── Hotel Card ───────────────────────────────────────────────────────────────

type HotelItem = Awaited<ReturnType<typeof getHotels>>["hotels"][number];

function HotelCard({ hotel }: { hotel: HotelItem }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-xl dark:border-white/10 dark:bg-charcoal-900">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={hotel.heroImage}
          alt={hotel.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
          {/* Wishlist */}
          <WishlistButton type="HOTEL" itemId={hotel.id} />
          {/* Guest rating */}
          {Number(hotel.rating) > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-white">
                {Number(hotel.rating).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Stars classification */}
        <div className="absolute bottom-3 left-3">
          <StarRating stars={hotel.stars} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>
            {hotel.destination.name}, {hotel.destination.country.name}
          </span>
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-charcoal-950 dark:text-white line-clamp-2">
          {hotel.name}
        </h3>

        {/* Amenity chips */}
        {(() => {
          const amenities = JSON.parse(hotel.amenities || "[]") as string[];
          return amenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {amenities.slice(0, 3).map((amenity) => (
                <AmenityChip key={amenity} label={amenity} />
              ))}
              {amenities.length > 3 && (
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-400 dark:bg-white/5">
                  +{amenities.length - 3} more
                </span>
              )}
            </div>
          );
        })()}

        <div className="flex-1" />

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4 dark:border-white/8">
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400">From</p>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-charcoal-950 dark:text-white">
                {formatCurrency(Number(hotel.priceFrom), hotel.currency)}
              </span>
              <span className="text-xs text-stone-400">/ night</span>
            </div>
          </div>
          <Link
            href={`/hotels/${hotel.slug}`}
            className="flex items-center gap-1.5 rounded-xl bg-charcoal-950 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-charcoal-800 dark:bg-white dark:text-charcoal-950 dark:hover:bg-stone-100"
          >
            View Hotel
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

async function HotelsGrid({ searchParams }: { searchParams: SearchParams }) {
  let data;
  try {
    data = await getHotels(searchParams);
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 text-5xl">⚠️</div>
        <h3 className="mb-2 text-lg font-semibold text-charcoal-950 dark:text-white">
          Something went wrong
        </h3>
        <p className="text-sm text-stone-500">Unable to load hotels. Please try again later.</p>
      </div>
    );
  }

  const { hotels, total, page, totalPages } = data;

  if (hotels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 text-5xl">🏨</div>
        <h3 className="mb-2 text-lg font-semibold text-charcoal-950 dark:text-white">
          No hotels found
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Try adjusting your filters or search query.
        </p>
        <Link
          href="/hotels"
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
          hotels found
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/hotels?${new URLSearchParams({
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

function HotelsGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-stone-200 dark:border-white/10"
        >
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

export default async function HotelsPage({ searchParams }: HotelsPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-charcoal-950">
      <HotelsHero />

      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 xl:px-16">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-72 xl:w-80">
            <HotelsFilters searchParams={params} />
          </aside>

          <main className="min-w-0 flex-1">
            <Suspense fallback={<HotelsGridSkeleton />}>
              <HotelsGrid searchParams={params} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
