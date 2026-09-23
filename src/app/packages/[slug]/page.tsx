import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Star,
  Clock,
  Users,
  MapPin,
  Check,
  X,
  ChevronDown,
  Calendar,
  Tag,
  Shield,
  Camera,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency, formatDuration, formatDate, minutesToDuration } from "@/lib/utils";
import { BookingCTA } from "@/components/shared/BookingCTA";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PackageDetailPageProps {
  params: Promise<{ slug: string }>;
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function getPackage(slug: string) {
  return db.travelPackage.findUnique({
    where: { slug, published: true, deletedAt: null },
    include: {
      destination: { include: { country: true } },
      images: { orderBy: { order: "asc" } },
      days: {
        orderBy: { dayNumber: "asc" },
        include: {
          activities: { orderBy: { order: "asc" } },
        },
      },
      reviews: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { user: { select: { name: true, avatar: true } } },
      },
    },
  });
}

// ─── Static Params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const packages = await db.travelPackage.findMany({
    where: { published: true, deletedAt: null },
    select: { slug: true },
  });

  return packages.map((pkg) => ({
    slug: pkg.slug,
  }));
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PackageDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackage(slug);
  if (!pkg) return { title: "Package Not Found" };

  return {
    title: pkg.seoTitle ?? `${pkg.title} | Travel Packages`,
    description:
      pkg.seoDescription ??
      `${pkg.title}: ${pkg.duration}-day journey to ${pkg.destination.name}. From ${formatCurrency(Number(pkg.priceFrom), pkg.currency)}.`,
    openGraph: {
      title: pkg.title,
      description: pkg.description.slice(0, 160),
      images: pkg.images[0] ? [{ url: pkg.images[0].url }] : [],
    },
  };
}

// ─── Activity Type Badge ──────────────────────────────────────────────────────

const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  SIGHTSEEING: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  DINING: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  ADVENTURE: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  CULTURAL: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  RELAXATION: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  SHOPPING: "bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
  TRANSPORT: "bg-stone-50 text-stone-600 dark:bg-white/5 dark:text-stone-400",
  ACCOMMODATION: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  OTHER: "bg-stone-50 text-stone-600 dark:bg-white/5 dark:text-stone-400",
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { slug } = await params;

  let pkg;
  try {
    pkg = await getPackage(slug);
  } catch {
    pkg = null;
  }

  if (!pkg) notFound();

  const heroImage = pkg.images[0];
  const hasDiscount =
    pkg.priceDiscount !== null &&
    pkg.priceDiscount !== undefined &&
    Number(pkg.priceDiscount) < Number(pkg.priceFrom);
  const displayPrice = hasDiscount ? Number(pkg.priceDiscount) : Number(pkg.priceFrom);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-charcoal-950">
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <div className="relative h-[65vh] min-h-[500px] w-full overflow-hidden">
        {heroImage ? (
          <Image
            src={heroImage.url}
            alt={heroImage.alt ?? pkg.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-charcoal-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
          <div className="mx-auto max-w-[1440px]">
            {/* Category badge */}
            <span className="inline-block rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
              {pkg.category.charAt(0) + pkg.category.slice(1).toLowerCase()}
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {pkg.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 text-white/80">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="text-sm">
                  {pkg.destination.name}, {pkg.destination.country.name}
                </span>
              </div>
              {Number(pkg.rating) > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-white">
                    {Number(pkg.rating).toFixed(1)}
                  </span>
                  {pkg.reviewCount > 0 && (
                    <span className="text-sm text-white/60">({pkg.reviewCount} reviews)</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content + Sidebar ───────────────────────────── */}
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 xl:px-16">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* LEFT: Content */}
          <div className="min-w-0 flex-1 space-y-10">

            {/* ── Quick Stats ───────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-4 dark:border-white/10 dark:bg-charcoal-900">
              {[
                { icon: Clock, label: "Duration", value: formatDuration(pkg.duration) },
                { icon: Users, label: "Max Travelers", value: String(pkg.maxTravelers) },
                {
                  icon: Star,
                  label: "Rating",
                  value: Number(pkg.rating) > 0 ? Number(pkg.rating).toFixed(1) : "New",
                },
                {
                  icon: Tag,
                  label: "From",
                  value: formatCurrency(displayPrice, pkg.currency),
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <Icon className="mx-auto mb-2 h-5 w-5 text-amber-500" />
                  <p className="text-xs text-stone-500 dark:text-stone-400">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-charcoal-950 dark:text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* ── Description ──────────────────────────────────── */}
            <section>
              <h2 className="mb-4 font-display text-2xl font-semibold text-charcoal-950 dark:text-white">
                About this package
              </h2>
              <div className="prose prose-stone max-w-none text-charcoal-600 dark:prose-invert dark:text-stone-300">
                <p className="leading-relaxed">{pkg.description}</p>
                {pkg.longDescription && (
                  <p className="mt-4 leading-relaxed">{pkg.longDescription}</p>
                )}
              </div>
            </section>

            {/* ── Included / Excluded ───────────────────────────── */}
            {(pkg.included.length > 0 || pkg.excluded.length > 0) && (
              <section>
                <h2 className="mb-6 font-display text-2xl font-semibold text-charcoal-950 dark:text-white">
                  What&apos;s included
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {pkg.included.length > 0 && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                        <Check className="h-4 w-4" />
                        Included
                      </h3>
                      <ul className="space-y-2.5">
                        {(JSON.parse(pkg.included || "[]")).map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <span className="text-sm text-charcoal-700 dark:text-stone-300">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {pkg.excluded.length > 0 && (
                    <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5 dark:border-red-500/20 dark:bg-red-500/5">
                      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-400">
                        <X className="h-4 w-4" />
                        Not included
                      </h3>
                      <ul className="space-y-2.5">
                        {(JSON.parse(pkg.excluded || "[]")).map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                            <span className="text-sm text-charcoal-700 dark:text-stone-300">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── Itinerary ─────────────────────────────────────── */}
            {pkg.days.length > 0 && (
              <section>
                <h2 className="mb-6 font-display text-2xl font-semibold text-charcoal-950 dark:text-white">
                  Day-by-day itinerary
                </h2>
                <div className="space-y-4">
                  {pkg.days.map((day) => (
                    <details
                      key={day.id}
                      className="group rounded-2xl border border-stone-200 bg-white open:border-amber-200 dark:border-white/10 dark:bg-charcoal-900 dark:open:border-amber-500/30"
                    >
                      <summary className="flex cursor-pointer list-none items-center gap-4 p-5 select-none">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                          D{day.dayNumber}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-stone-500 dark:text-stone-400">
                            Day {day.dayNumber}
                          </p>
                          <p className="font-semibold text-charcoal-950 dark:text-white">
                            {day.title}
                          </p>
                        </div>
                        <ChevronDown className="h-5 w-5 shrink-0 text-stone-400 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="border-t border-stone-100 px-5 pb-5 dark:border-white/8">
                        {day.description && (
                          <p className="mt-4 text-sm text-charcoal-600 dark:text-stone-300">
                            {day.description}
                          </p>
                        )}
                        {day.activities.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {day.activities.map((activity) => (
                              <div
                                key={activity.id}
                                className="flex items-start gap-3 rounded-xl bg-stone-50 p-3.5 dark:bg-white/5"
                              >
                                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-400 ring-4 ring-amber-100 dark:ring-amber-500/20" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-medium text-charcoal-950 dark:text-white">
                                      {activity.title}
                                    </p>
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${ACTIVITY_TYPE_COLORS[activity.type] ?? ACTIVITY_TYPE_COLORS.OTHER}`}
                                    >
                                      {activity.type.charAt(0) +
                                        activity.type.slice(1).toLowerCase()}
                                    </span>
                                  </div>
                                  {activity.description && (
                                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                      {activity.description}
                                    </p>
                                  )}
                                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-stone-400 dark:text-stone-500">
                                    {activity.startTime && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {activity.startTime}
                                      </span>
                                    )}
                                    {activity.duration && (
                                      <span>{minutesToDuration(activity.duration)}</span>
                                    )}
                                    {activity.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {activity.location}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* ── Image Gallery ─────────────────────────────────── */}
            {pkg.images.length > 1 && (
              <section>
                <h2 className="mb-6 font-display text-2xl font-semibold text-charcoal-950 dark:text-white">
                  <Camera className="mr-2 inline-block h-6 w-6 text-amber-500" />
                  Photo gallery
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {pkg.images.slice(1, 7).map((img, i) => (
                    <div
                      key={img.id}
                      className={`relative overflow-hidden rounded-xl ${i === 0 ? "col-span-2 row-span-2 aspect-square sm:aspect-[4/3]" : "aspect-square"}`}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt ?? `${pkg.title} photo ${i + 2}`}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Reviews ───────────────────────────────────────── */}
            {pkg.reviews.length > 0 && (
              <section>
                <h2 className="mb-6 font-display text-2xl font-semibold text-charcoal-950 dark:text-white">
                  Traveler reviews
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {pkg.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-charcoal-900"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {review.user.avatar ? (
                            <Image
                              src={review.user.avatar}
                              alt={review.user.name ?? "User"}
                              width={36}
                              height={36}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                              {(review.user.name ?? "U").charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-charcoal-950 dark:text-white">
                              {review.user.name ?? "Anonymous"}
                            </p>
                            <p className="text-xs text-stone-400">{formatDate(review.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200 dark:fill-stone-600 dark:text-stone-600"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-charcoal-950 dark:text-white">
                        {review.title}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-charcoal-600 line-clamp-4 dark:text-stone-300">
                        {review.body}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT: Sticky Sidebar */}
          <aside className="w-full lg:w-80 xl:w-96">
            {/* Desktop sticky sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-charcoal-900">
                <BookingCTA
                  href={`/book/${pkg.id}`}
                  price={Number(pkg.priceFrom)}
                  priceDiscount={pkg.priceDiscount !== null ? Number(pkg.priceDiscount) : null}
                  currency={pkg.currency}
                  priceLabel="per person"
                  cancellationPolicy={pkg.cancellationPolicy}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white p-4 lg:hidden dark:border-white/10 dark:bg-charcoal-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            {hasDiscount && (
              <p className="text-xs text-stone-400 line-through">
                {formatCurrency(Number(pkg.priceFrom), pkg.currency)}
              </p>
            )}
            <p className="text-lg font-bold text-charcoal-950 dark:text-white">
              {formatCurrency(displayPrice, pkg.currency)}
            </p>
            <p className="text-xs text-stone-500">per person</p>
          </div>
          <Link
            href={`/book/${pkg.id}`}
            className="flex-1 rounded-xl bg-amber-500 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-amber-400"
          >
            Book Now
          </Link>
        </div>
      </div>
      {/* Bottom padding for mobile fixed bar */}
      <div className="h-24 lg:hidden" />
    </div>
  );
}
