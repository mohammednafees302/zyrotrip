import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type {
  Destination,
  Country,
  Region,
  DestinationCategory,
  DestinationImage,
  Hotel,
  TravelPackage,
  Experience,
  Review,
  User,
} from "@prisma/client";
import {
  MapPin,
  Star,
  Clock,
  Users,
  Globe,
  Thermometer,
  Languages,
  Calendar,
  ArrowRight,
  Camera,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { WeatherDashboard } from "@/components/destination/WeatherDashboard";
import { EditorialGallery } from "@/components/destination/EditorialGallery";
import DestinationMap from "@/components/destination/DestinationMap";

// ─── Types ────────────────────────────────────────────────────────────────────

type DestinationFull = Destination & {
  country: Country;
  region: Region | null;
  categories: DestinationCategory[];
  images: DestinationImage[];
  hotels: Hotel[];
  packages: TravelPackage[];
  experiences: Experience[];
  reviews: (Review & { user: Pick<User, "id" | "name" | "firstName" | "lastName" | "avatar"> })[];
};

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function getDestination(slug: string): Promise<DestinationFull | null> {
  return db.destination.findFirst({
    where: { slug, published: true, deletedAt: null },
    include: {
      country: true,
      region: true,
      categories: true,
      images: {
        orderBy: { order: "asc" },
        take: 8,
      },
      hotels: {
        where: { published: true, deletedAt: null },
        orderBy: { rating: "desc" },
        take: 4,
      },
      packages: {
        where: { published: true, deletedAt: null },
        orderBy: { rating: "desc" },
        take: 3,
      },
      experiences: {
        where: { published: true },
        orderBy: { rating: "desc" },
        take: 6,
      },
      reviews: {
        where: { published: true },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: 6,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      },
    },
  }) as Promise<DestinationFull | null>;
}

// ─── Static Params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const destinations = await db.destination.findMany({
    where: { published: true, deletedAt: null },
    select: { slug: true },
  });

  return destinations.map((dest) => ({
    slug: dest.slug,
  }));
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestination(slug);

  if (!destination) {
    return { title: "Destination Not Found | ZyroTrip" };
  }

  const title = destination.seoTitle ?? `${destination.name} Travel Guide | ZyroTrip`;
  const description =
    destination.seoDescription ??
    destination.tagline ??
    destination.description.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: destination.heroImage, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [destination.heroImage],
    },
  };
}

// ─── Helper Components ────────────────────────────────────────────────────────

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
          }`}
        />
      ))}
    </span>
  );
}

function HotelStars({ stars }: { stars: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: stars }).map((_, i) => (
        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
      ))}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await getDestination(slug);

  if (!destination) {
    notFound();
  }

  const rating = Number(destination.rating);
  const priceFrom = Number(destination.priceFrom);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: destination.name,
    description: destination.description,
    image: destination.heroImage,
    touristType: destination.categories.map((c) => c.name),
    geo: {
      "@type": "GeoCoordinates",
      latitude: destination.latitude ? Number(destination.latitude) : undefined,
      longitude: destination.longitude ? Number(destination.longitude) : undefined,
    },
    aggregateRating:
      destination.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: rating.toFixed(1),
            reviewCount: destination.reviewCount,
          }
        : undefined,
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-950 text-white">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative h-screen min-h-[640px] overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 scale-110"
            style={{ transform: "scale(1.1) translateZ(0)" }}
          >
            <Image
              src={destination.heroImage}
              alt={destination.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/60 via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end pb-20 px-6 md:px-12 lg:px-20">
            <div className="max-w-5xl">
              {/* Breadcrumb / Location */}
              <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>{destination.country.name}</span>
                {destination.region && (
                  <>
                    <span className="text-white/40">·</span>
                    <span>{destination.region.name}</span>
                  </>
                )}
              </div>

              {/* Categories */}
              {destination.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {destination.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium border border-white/20"
                    >
                      {cat.icon && <span>{cat.icon}</span>}
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Destination Name */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-none mb-4">
                {destination.name}
              </h1>

              {/* Tagline */}
              {destination.tagline && (
                <p className="text-xl md:text-2xl text-white/80 font-light mb-8 max-w-2xl">
                  {destination.tagline}
                </p>
              )}

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-6">
                {rating > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRating rating={rating} size="md" />
                    <span className="text-white font-semibold">{rating.toFixed(1)}</span>
                    <span className="text-white/60 text-sm">
                      ({destination.reviewCount.toLocaleString()} reviews)
                    </span>
                  </div>
                )}

                <div className="w-px h-5 bg-white/20 hidden sm:block" />

                <div className="flex items-center gap-2 text-white/80">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  <span className="text-sm">
                    From{" "}
                    <span className="text-white font-bold text-base">
                      {formatCurrency(priceFrom, destination.currency)}
                    </span>
                  </span>
                </div>

                {destination.bestTimeToVisit && (
                  <>
                    <div className="w-px h-5 bg-white/20 hidden sm:block" />
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>Best: {destination.bestTimeToVisit}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 right-8 md:right-12 lg:right-20 flex flex-col items-center gap-2 text-white/40">
            <div className="h-12 w-px bg-gradient-to-b from-transparent to-white/40" />
            <span className="text-xs tracking-widest uppercase rotate-90 origin-center translate-y-4">
              Scroll
            </span>
          </div>
        </section>

        {/* ── Overview ──────────────────────────────────────────────────── */}
        <section className="bg-gray-950 py-20 px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Description */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <span className="text-xs font-semibold tracking-widest text-rose-400 uppercase">
                    About
                  </span>
                  <h2 className="mt-2 text-3xl md:text-4xl font-bold text-white">
                    Discover {destination.name}
                  </h2>
                </div>

                <p className="text-gray-300 text-lg leading-relaxed">
                  {destination.description}
                </p>

                {destination.longDescription && (
                  <p className="text-gray-400 leading-relaxed">
                    {destination.longDescription}
                  </p>
                )}
              </div>

              {/* Info Cards */}
              <div className="space-y-4">

                {destination.climate && (
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="p-2.5 rounded-xl bg-orange-500/20">
                      <Thermometer className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Climate
                      </p>
                      <p className="text-white font-medium">{destination.climate}</p>
                    </div>
                  </div>
                )}

                {destination.language && (
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="p-2.5 rounded-xl bg-purple-500/20">
                      <Languages className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Language
                      </p>
                      <p className="text-white font-medium">{destination.language}</p>
                    </div>
                  </div>
                )}

                {destination.timezone && (
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="p-2.5 rounded-xl bg-sky-500/20">
                      <Globe className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Timezone
                      </p>
                      <p className="text-white font-medium">{destination.timezone}</p>
                    </div>
                  </div>
                )}

                {destination.bestTimeToVisit && (
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20">
                      <Calendar className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Best Time to Visit
                      </p>
                      <p className="text-white font-medium">{destination.bestTimeToVisit}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Weather ───────────────────────────────────────────────────── */}
        <section className="py-20 px-6 md:px-12 lg:px-20 bg-gray-900/30 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <WeatherDashboard
              slug={destination.slug}
              destinationName={destination.name}
            />
          </div>
        </section>

        {/* ── Gallery ───────────────────────────────────────────────────── */}
        {destination.images.length > 0 && (
          <section className="py-24 px-6 md:px-12 lg:px-20 bg-gray-950 border-t border-white/5">
            <div className="max-w-7xl mx-auto">
              <EditorialGallery images={destination.images} destinationName={destination.name} />
            </div>
          </section>
        )}

        {/* ── Packages ──────────────────────────────────────────────────── */}
        {destination.packages.length > 0 && (
          <section className="py-20 px-6 md:px-12 lg:px-20 bg-gray-950">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <span className="text-xs font-semibold tracking-widest text-rose-400 uppercase">
                    Travel Packages
                  </span>
                  <h2 className="mt-2 text-3xl font-bold text-white">
                    Curated Experiences
                  </h2>
                  <p className="mt-2 text-gray-400">
                    Hand-picked packages for every traveler
                  </p>
                </div>
                <Link
                  href={`/packages?destination=${slug}`}
                  className="hidden md:flex items-center gap-2 text-rose-400 hover:text-rose-300 text-sm font-medium transition-colors"
                >
                  View all packages <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destination.packages.map((pkg) => {
                  const pkgRating = Number(pkg.rating);
                  const pkgPrice = Number(pkg.priceFrom);
                  return (
                    <Link
                      key={pkg.id}
                      href={`/packages/${pkg.slug}`}
                      className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-rose-500/40 hover:bg-white/8 transition-all duration-300"
                    >
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/90 text-xs font-medium border border-white/20">
                          {pkg.category}
                        </span>
                      </div>

                      {/* Featured badge */}
                      {pkg.featured && (
                        <div className="absolute top-4 right-4 z-10">
                          <span className="px-3 py-1 rounded-full bg-rose-500/90 text-white text-xs font-semibold">
                            Featured
                          </span>
                        </div>
                      )}

                      <div className="p-6 pt-14">
                        <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-2 mb-2">
                          {pkg.title}
                        </h3>

                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                          {pkg.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-sky-400" />
                              {pkg.duration} days
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-purple-400" />
                              Max {pkg.maxTravelers}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-end justify-between mt-4">
                          {pkgRating > 0 && (
                            <div className="flex items-center gap-1.5">
                              <StarRating rating={pkgRating} />
                              <span className="text-white text-sm font-semibold">
                                {pkgRating.toFixed(1)}
                              </span>
                              {pkg.reviewCount > 0 && (
                                <span className="text-gray-500 text-xs">
                                  ({pkg.reviewCount})
                                </span>
                              )}
                            </div>
                          )}
                          <div className="text-right">
                            <p className="text-gray-500 text-xs">From</p>
                            <p className="text-white font-bold text-xl">
                              {formatCurrency(pkgPrice, pkg.currency)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Hover accent */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Hotels ────────────────────────────────────────────────────── */}
        {destination.hotels.length > 0 && (
          <section className="py-20 px-6 md:px-12 lg:px-20 bg-gray-900/50">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <span className="text-xs font-semibold tracking-widest text-sky-400 uppercase">
                    Where to Stay
                  </span>
                  <h2 className="mt-2 text-3xl font-bold text-white">
                    Top Hotels
                  </h2>
                  <p className="mt-2 text-gray-400">
                    Premium accommodations in {destination.name}
                  </p>
                </div>
                <Link
                  href={`/hotels?destination=${slug}`}
                  className="hidden md:flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors"
                >
                  View all hotels <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {destination.hotels.map((hotel) => {
                  const hotelRating = Number(hotel.rating);
                  const hotelPrice = Number(hotel.priceFrom);
                  return (
                    <Link
                      key={hotel.id}
                      href={`/hotels/${hotel.slug}`}
                      className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-sky-500/40 transition-all duration-300"
                    >
                      {/* Hero Image */}
                      <div className="relative h-44 overflow-hidden">
                        <Image
                          src={hotel.heroImage}
                          alt={hotel.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />

                        {/* Stars overlay */}
                        <div className="absolute bottom-3 left-3">
                          <HotelStars stars={hotel.stars} />
                        </div>

                        {hotel.featured && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-0.5 rounded-full bg-sky-500/90 text-white text-xs font-semibold">
                              Featured
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="text-white font-semibold text-sm group-hover:text-sky-300 transition-colors line-clamp-1 mb-1">
                          {hotel.name}
                        </h3>

                        {hotel.address && (
                          <p className="text-gray-500 text-xs flex items-center gap-1 mb-3">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="line-clamp-1">{hotel.address}</span>
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          {hotelRating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-white text-xs font-semibold">
                                {hotelRating.toFixed(1)}
                              </span>
                              {hotel.reviewCount > 0 && (
                                <span className="text-gray-500 text-xs">
                                  ({hotel.reviewCount})
                                </span>
                              )}
                            </div>
                          )}
                          <div className="text-right">
                            <p className="text-gray-500 text-xs">From</p>
                            <p className="text-white font-bold">
                              {formatCurrency(hotelPrice, hotel.currency)}
                            </p>
                            <p className="text-gray-600 text-xs">/night</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Experiences ───────────────────────────────────────────────── */}
        {destination.experiences.length > 0 && (
          <section className="py-20 px-6 md:px-12 lg:px-20 bg-gray-950">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">
                    Activities & Experiences
                  </span>
                  <h2 className="mt-2 text-3xl font-bold text-white">
                    Things to Do
                  </h2>
                  <p className="mt-2 text-gray-400">
                    Unforgettable moments await you
                  </p>
                </div>
                <Link
                  href={`/experiences?destination=${slug}`}
                  className="hidden md:flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                >
                  View all experiences <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                {destination.experiences.map((exp) => {
                  const expRating = Number(exp.rating);
                  const expPrice = Number(exp.price);
                  const hours = Math.floor(exp.duration / 60);
                  const minutes = exp.duration % 60;
                  const durationStr =
                    hours > 0
                      ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`
                      : `${minutes}m`;

                  return (
                    <Link
                      key={exp.id}
                      href={`/experiences/${exp.slug}`}
                      className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300"
                    >
                      {/* Hero Image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={exp.heroImage}
                          alt={exp.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />

                        {/* Category & Duration */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/80 backdrop-blur-sm text-white text-xs font-medium">
                            {exp.category}
                          </span>
                          <span className="flex items-center gap-1 text-white/90 text-xs">
                            <Clock className="w-3 h-3" /> {durationStr}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="text-white font-semibold group-hover:text-emerald-300 transition-colors line-clamp-2 mb-2">
                          {exp.name}
                        </h3>

                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                          {exp.description}
                        </p>

                        <div className="flex items-center justify-between">
                          {expRating > 0 ? (
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-white text-sm font-semibold">
                                {expRating.toFixed(1)}
                              </span>
                              {exp.reviewCount > 0 && (
                                <span className="text-gray-500 text-xs">
                                  ({exp.reviewCount})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span />
                          )}

                          <p className="text-white font-bold">
                            {formatCurrency(expPrice, exp.currency)}
                            <span className="text-gray-500 text-xs font-normal">/person</span>
                          </p>
                        </div>

                        {exp.maxGroupSize && (
                          <p className="mt-2 text-gray-500 text-xs flex items-center gap-1">
                            <Users className="w-3 h-3" /> Max {exp.maxGroupSize} people
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Interactive Map ────────────────────────────────────────── */}
        {destination.latitude && destination.longitude && (
          <DestinationMap
            latitude={Number(destination.latitude)}
            longitude={Number(destination.longitude)}
            name={destination.name}
            country={destination.country.name}
            markers={destination.hotels.filter(h => h.latitude && h.longitude).map(h => ({
              id: h.id,
              latitude: Number(h.latitude),
              longitude: Number(h.longitude),
              title: h.name,
              subtitle: 'Premium Hotel',
              type: 'hotel'
            }))}
          />
        )}

        {/* ── Reviews ───────────────────────────────────────────────────── */}
        {destination.reviews.length > 0 && (
          <section className="py-20 px-6 md:px-12 lg:px-20 bg-gray-900/50">
            <div className="max-w-7xl mx-auto">
              <div className="mb-10">
                <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
                  Traveler Reviews
                </span>
                <div className="mt-2 flex items-baseline gap-4">
                  <h2 className="text-3xl font-bold text-white">
                    What People Say
                  </h2>
                  {rating > 0 && (
                    <div className="flex items-center gap-2">
                      <StarRating rating={rating} size="md" />
                      <span className="text-white font-bold text-lg">{rating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">
                        · {destination.reviewCount.toLocaleString()} reviews
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {destination.reviews.map((review) => {
                  const userName =
                    (review.user.name ??
                    `${review.user.firstName ?? ""} ${review.user.lastName ?? ""}`.trim()) ||
                    "Anonymous";
                  const initials = getInitials(userName || "A");

                  return (
                    <article
                      key={review.id}
                      className={`relative bg-white/5 border rounded-2xl p-6 ${
                        review.featured
                          ? "border-amber-500/30 bg-amber-500/5"
                          : "border-white/10"
                      }`}
                    >
                      {review.featured && (
                        <div className="absolute -top-2.5 left-5">
                          <span className="px-3 py-0.5 rounded-full bg-amber-500 text-black text-xs font-bold">
                            Featured Review
                          </span>
                        </div>
                      )}

                      {/* Header */}
                      <div className="flex items-start gap-3 mb-4">
                        {review.user.avatar ? (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white/10">
                            <Image
                              src={review.user.avatar}
                              alt={userName}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {initials}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{userName}</p>
                          <p className="text-gray-500 text-xs">{formatDate(review.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Content */}
                      <h4 className="text-white font-semibold text-sm mb-2">{review.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">
                        {review.body}
                      </p>

                      {/* Admin Response */}
                      {review.adminResponse && (
                        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-xs font-semibold text-rose-400 mb-1">
                            Response from ZyroTrip
                          </p>
                          <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                            {review.adminResponse}
                          </p>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="relative py-32 px-6 md:px-12 lg:px-20 overflow-hidden">
          {/* Background blur blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-900/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium mb-8">
              <MapPin className="w-4 h-4" />
              {destination.name}, {destination.country.name}
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Ready to explore{" "}
              <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                {destination.name}?
              </span>
            </h2>

            <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Let our AI travel planner craft the perfect itinerary for your dream trip. 
              Personalized, detailed, and ready in seconds.
            </p>

            <Link
              href={`/ai-planner?destination=${slug}`}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-lg hover:from-rose-400 hover:to-orange-400 transition-all duration-300 shadow-2xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5"
            >
              Start Planning Your Trip
              <ArrowRight className="w-5 h-5" />
            </Link>

            {priceFrom > 0 && (
              <p className="mt-6 text-gray-600 text-sm">
                Packages starting from{" "}
                <span className="text-white font-semibold">
                  {formatCurrency(priceFrom, destination.currency)}
                </span>
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
