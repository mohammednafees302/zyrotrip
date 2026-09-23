import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Clock,
  MapPin,
  Search,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency, minutesToDuration, cn } from "@/lib/utils";
import type { Prisma } from "@prisma/client";
import { ExperiencesFilters } from "@/components/experiences/ExperiencesFilters";

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Experiences — Extraordinary Moments",
  description:
    "Handcrafted local experiences: cooking classes, adventure tours, cultural walks, wildlife safaris, and more. Book unforgettable moments worldwide.",
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExperiencesPageProps {
  searchParams: Promise<{
    q?: string;
    destination?: string;
    category?: string;
    minDuration?: string;
    maxDuration?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

type SearchParams = Awaited<ExperiencesPageProps["searchParams"]>;

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function getExperiences(params: SearchParams) {
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where: Prisma.ExperienceWhereInput = {
    published: true,
  };

  if (params.q) {
    where.OR = [
      { name: { contains: params.q } },
      { description: { contains: params.q } },
      { category: { contains: params.q } },
      { destination: { name: { contains: params.q } } },
    ];
  }

  if (params.destination) {
    where.destination = { name: { contains: params.destination } };
  }

  if (params.category) {
    where.category = { equals: params.category };
  }

  if (params.minDuration || params.maxDuration) {
    where.duration = {};
    if (params.minDuration) where.duration.gte = parseInt(params.minDuration, 10);
    if (params.maxDuration) where.duration.lte = parseInt(params.maxDuration, 10);
  }

  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) where.price.gte = parseFloat(params.minPrice);
    if (params.maxPrice) where.price.lte = parseFloat(params.maxPrice);
  }

  const orderBy: Prisma.ExperienceOrderByWithRelationInput =
    params.sort === "price_asc"
      ? { price: "asc" }
      : params.sort === "price_desc"
        ? { price: "desc" }
        : params.sort === "rating"
          ? { rating: "desc" }
          : params.sort === "duration_asc"
            ? { duration: "asc" }
            : { featured: "desc" };

  const [experiences, total] = await Promise.all([
    db.experience.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        name: true,
        duration: true,
        price: true,
        currency: true,
        category: true,
        heroImage: true,
        rating: true,
        reviewCount: true,
        maxGroupSize: true,
        destination: {
          select: {
            name: true,
            country: { select: { name: true } },
          },
        },
      },
    }),
    db.experience.count({ where }),
  ]);

  return { experiences, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function ExperiencesHero() {
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
      <div className="pointer-events-none absolute -top-10 left-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-[80px]" />
      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-16">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">
          Live like a local
        </p>
        <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
          Experiences
        </h1>
        <p className="mt-4 max-w-lg text-stone-400">
          Immersive, hands-on adventures led by passionate local experts. From sunrise hikes
          to secret supper clubs — find your extraordinary moment.
        </p>
      </div>
    </div>
  );
}

// ─── Experience Card ──────────────────────────────────────────────────────────

type ExperienceItem = Awaited<ReturnType<typeof getExperiences>>["experiences"][number];

function ExperienceCard({ exp }: { exp: ExperienceItem }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-xl dark:border-white/10 dark:bg-charcoal-900">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={exp.heroImage}
          alt={exp.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Category badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 backdrop-blur-sm dark:bg-charcoal-900/90">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span className="text-xs font-semibold text-charcoal-700 dark:text-stone-200">
            {exp.category}
          </span>
        </div>

        {/* Rating */}
        {Number(exp.rating) > 0 && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-white">
              {Number(exp.rating).toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>
            {exp.destination.name}, {exp.destination.country.name}
          </span>
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-charcoal-950 dark:text-white line-clamp-2">
          {exp.name}
        </h3>

        <div className="mt-3 flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{minutesToDuration(exp.duration)}</span>
          </div>
          {exp.reviewCount > 0 && (
            <span className="ml-auto">
              {exp.reviewCount} review{exp.reviewCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4 dark:border-white/8">
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400">From</p>
            <span className="text-lg font-bold text-charcoal-950 dark:text-white">
              {formatCurrency(Number(exp.price), exp.currency)}
            </span>
          </div>
          <Link
            href={`/experiences/${exp.slug}`}
            className="flex items-center gap-1.5 rounded-xl bg-charcoal-950 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-charcoal-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-950 focus-visible:ring-offset-2 active:bg-charcoal-900 active:text-white dark:bg-white dark:!text-[#141310] dark:hover:bg-stone-100 dark:hover:!text-[#141310] dark:focus-visible:!ring-white dark:active:bg-stone-200"
          >
            Book Now
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

async function ExperiencesGrid({ searchParams }: { searchParams: SearchParams }) {
  let data;
  try {
    data = await getExperiences(searchParams);
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 text-5xl">⚠️</div>
        <h3 className="mb-2 text-lg font-semibold text-charcoal-950 dark:text-white">
          Something went wrong
        </h3>
        <p className="text-sm text-stone-500">
          Unable to load experiences. Please try again later.
        </p>
      </div>
    );
  }

  const { experiences, total, page, totalPages } = data;

  if (experiences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 text-5xl">✨</div>
        <h3 className="mb-2 text-lg font-semibold text-charcoal-950 dark:text-white">
          No experiences found
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Try adjusting your filters or search query.
        </p>
        <Link
          href="/experiences"
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
          experiences found
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {experiences.map((exp) => (
          <ExperienceCard key={exp.id} exp={exp} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/experiences?${new URLSearchParams({
                ...Object.fromEntries(
                  Object.entries(searchParams).filter(([, v]) => v != null) as [string, string][]
                ),
                page: String(p),
              })}`}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all",
                p === page
                  ? "bg-charcoal-950 text-white dark:bg-white dark:!text-[#141310]"
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

function ExperiencesGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-stone-200 dark:border-white/10"
        >
          <div className="skeleton aspect-[4/3]" />
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

export default async function ExperiencesPage({ searchParams }: ExperiencesPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-charcoal-950">
      <ExperiencesHero />

      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 xl:px-16">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-72 xl:w-80">
            <ExperiencesFilters searchParams={params} />
          </aside>

          <div className="min-w-0 flex-1">
            <Suspense fallback={<ExperiencesGridSkeleton />}>
              <ExperiencesGrid searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
