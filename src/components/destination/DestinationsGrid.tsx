import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Heart } from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { WishlistButton } from "@/components/shared/WishlistButton";
import type { Prisma } from "@prisma/client";

interface DestinationsGridProps {
  searchParams: {
    q?: string;
    category?: string;
    country?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  };
}

const PAGE_SIZE = 12;

async function getDestinations(searchParams: DestinationsGridProps["searchParams"]) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where: Prisma.DestinationWhereInput = {
    published: true,
    deletedAt: null,
  };

  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q } },
      { description: { contains: searchParams.q } },
      { country: { name: { contains: searchParams.q } } },
    ];
  }

  if (searchParams.category) {
    where.categories = {
      some: { slug: searchParams.category },
    };
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.priceFrom = {};
    if (searchParams.minPrice) {
      where.priceFrom.gte = parseFloat(searchParams.minPrice);
    }
    if (searchParams.maxPrice) {
      where.priceFrom.lte = parseFloat(searchParams.maxPrice);
    }
  }

  const orderBy: Prisma.DestinationOrderByWithRelationInput =
    searchParams.sort === "price_asc"
      ? { priceFrom: "asc" }
      : searchParams.sort === "price_desc"
        ? { priceFrom: "desc" }
        : searchParams.sort === "rating"
          ? { rating: "desc" }
          : { featured: "desc" };

  const [destinations, total] = await Promise.all([
    db.destination.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        name: true,
        tagline: true,
        heroImage: true,
        priceFrom: true,
        rating: true,
        bestTimeToVisit: true,
        country: { select: { name: true } },
        categories: { select: { name: true, slug: true }, take: 1 },
      },
    }),
    db.destination.count({ where }),
  ]);

  return { destinations, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function DestinationsGrid({ searchParams }: DestinationsGridProps) {
  const { destinations, total, page, totalPages } = await getDestinations(searchParams);

  if (destinations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 text-5xl">🌍</div>
        <h3 className="mb-2 text-lg font-semibold text-charcoal-950 dark:text-white">
          No destinations found
        </h3>
        <p className="text-sm text-charcoal-500 dark:text-stone-400">
          Try adjusting your filters or search query.
        </p>
        <Link
          href="/destinations"
          className="mt-4 rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-medium text-charcoal-700 hover:bg-stone-50"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Results count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-charcoal-500 dark:text-stone-400">
          <span className="font-semibold text-charcoal-950 dark:text-white">{total}</span>{" "}
          destinations found
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {destinations.map((dest) => (
          <Link
            key={dest.id}
            href={`/destinations/${dest.slug}`}
            className="group block overflow-hidden rounded-2xl"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={dest.heroImage}
                alt={dest.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

              {/* Wishlist */}
              <div className="absolute right-3 top-3">
                <WishlistButton type="DESTINATION" itemId={dest.id} />
              </div>

              {/* Category tag */}
              {dest.categories[0] && (
                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-charcoal-700 backdrop-blur-sm">
                  {dest.categories[0].name}
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                  {dest.country.name}
                </p>
                <h3 className="font-display text-xl font-semibold text-white">
                  {dest.name}
                </h3>
                {dest.tagline && (
                  <p className="mt-1 line-clamp-2 text-xs text-white/70">{dest.tagline}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-white">{Number(dest.rating).toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-white/60">From </span>
                    <span className="text-sm font-bold text-white">
                      {formatCurrency(Number(dest.priceFrom))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/destinations?${new URLSearchParams({
                ...Object.fromEntries(
                  Object.entries(searchParams).filter(([, v]) => v != null) as [string, string][]
                ),
                page: String(p),
              })}`}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                p === page
                  ? "bg-charcoal-950 text-white dark:bg-white dark:!text-[#141310]"
                  : "border border-stone-200 text-charcoal-600 hover:border-charcoal-300 hover:bg-stone-50 dark:border-white/10 dark:text-stone-400 dark:hover:bg-white/5"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
