import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Star,
  MapPin,
  Users,
  Wifi,
  Coffee,
  Dumbbell,
  Waves,
  Car,
  Utensils,
  Wind,
  Tv,
  Building2,
  Camera,
  Navigation,
  BedDouble,
  ShieldCheck,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BookingCTA } from "@/components/shared/BookingCTA";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HotelDetailPageProps {
  params: Promise<{ slug: string }>;
}

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
  "Room Service": BedDouble,
  Spa: ShieldCheck,
};

function AmenityCard({ label }: { label: string }) {
  const Icon = AMENITY_ICONS[label] ?? Building2;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 p-3 dark:border-white/8 dark:bg-white/5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm text-charcoal-700 dark:text-stone-300">{label}</span>
    </div>
  );
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function getHotel(slug: string) {
  return db.hotel.findUnique({
    where: { slug, published: true, deletedAt: null },
    include: {
      destination: { include: { country: true } },
      images: { orderBy: { order: "asc" } },
      rooms: { where: { available: true }, orderBy: { pricePerNight: "asc" } },
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
  const hotels = await db.hotel.findMany({
    where: { published: true, deletedAt: null },
    select: { slug: true },
  });

  return hotels.map((hotel) => ({
    slug: hotel.slug,
  }));
}

export const dynamicParams = false;

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: HotelDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  let hotel = null;
  try {
    hotel = await getHotel(slug);
  } catch (err) {
    console.error("Metadata DB Error:", err);
  }

  if (!hotel) return { title: "Hotel Not Found" };

  return {
    title: hotel.seoTitle ?? `${hotel.name} — ${hotel.stars}-Star Hotel`,
    description:
      hotel.seoDescription ??
      `${hotel.name} in ${hotel.destination.name}. ${hotel.stars}-star hotel from ${formatCurrency(Number(hotel.priceFrom), hotel.currency)} per night.`,
    openGraph: {
      title: hotel.name,
      description: hotel.description.slice(0, 160),
      images: [{ url: hotel.heroImage }],
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function HotelDetailPage({ params }: HotelDetailPageProps) {
  const { slug } = await params;

  let hotel;
  let dbError = null;
  try {
    hotel = await getHotel(slug);
  } catch (err: any) {
    dbError = err.message + '\n' + err.stack;
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-black text-red-500 p-20 font-mono">
        <h1>Vercel Runtime Error Diagnostic:</h1>
        <pre>{dbError}</pre>
      </div>
    );
  }

  if (!hotel) notFound();

  const cheapestRoom = hotel.rooms[0];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-charcoal-950">
      {/* ─── Cinematic Hero ───────────────────────────────────── */}
      <div className="relative h-[70vh] min-h-[520px] w-full overflow-hidden">
        <Image
          src={hotel.heroImage}
          alt={hotel.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
          <div className="mx-auto max-w-[1440px]">
            {/* Star classification */}
            <div className="mb-3 flex items-center gap-1">
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h1 className="font-display text-3xl font-bold text-white sm:text-5xl lg:text-6xl">
              {hotel.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 text-white/80">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="text-sm">
                  {hotel.destination.name}, {hotel.destination.country.name}
                </span>
              </div>
              {Number(hotel.rating) > 0 && (
                <div className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 backdrop-blur-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-white">
                    {Number(hotel.rating).toFixed(1)}
                  </span>
                  {hotel.reviewCount > 0 && (
                    <span className="text-sm text-white/60">
                      ({hotel.reviewCount} reviews)
                    </span>
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

            {/* ── Description ──────────────────────────────────── */}
            <section>
              <h2 className="mb-4 font-display text-2xl font-semibold text-charcoal-950 dark:text-white">
                About this hotel
              </h2>
              <p className="leading-relaxed text-charcoal-600 dark:text-stone-300">
                {hotel.description}
              </p>
            </section>

            {/* ── Amenities ─────────────────────────────────────── */}
            {hotel.amenities.length > 0 && (
              <section>
                <h2 className="mb-6 font-display text-2xl font-semibold text-charcoal-950 dark:text-white">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {(JSON.parse(hotel.amenities || "[]")).map((amenity: string) => (
                    <AmenityCard key={amenity} label={amenity} />
                  ))}
                </div>
              </section>
            )}

            {/* ── Available Rooms ────────────────────────────────── */}
            {hotel.rooms.length > 0 && (
              <section>
                <h2 className="mb-6 font-display text-2xl font-semibold text-charcoal-950 dark:text-white">
                  Available rooms
                </h2>
                <div className="space-y-4">
                  {hotel.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-charcoal-900"
                    >
                      <div className="flex items-start gap-4">
                        {room.images[0] ? (
                          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
                            <Image
                              src={room.images[0]}
                              alt={room.name}
                              fill
                              className="object-cover"
                              sizes="112px"
                            />
                          </div>
                        ) : (
                          <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-charcoal-800">
                            <BedDouble className="h-8 w-8 text-stone-300" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-charcoal-950 dark:text-white">
                            {room.name}
                          </h3>
                          {room.description && (
                            <p className="mt-1 text-sm text-stone-500 line-clamp-2 dark:text-stone-400">
                              {room.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Up to {room.maxOccupancy} guests
                            </span>
                            {JSON.parse(room.amenities || "[]").slice(0, 3).map((a: string) => (
                              <span key={a}>{a}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-xl font-bold text-charcoal-950 dark:text-white">
                            {formatCurrency(Number(room.pricePerNight), hotel.currency)}
                          </p>
                          <p className="text-xs text-stone-400">per night</p>
                        </div>
                        <Link
                          href={`/book/${hotel.id}?room=${room.id}`}
                          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-amber-400"
                        >
                          Book Room
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Image Gallery ─────────────────────────────────── */}
            {hotel.images.length > 1 && (
              <section>
                <h2 className="mb-6 font-display text-2xl font-semibold text-charcoal-950 dark:text-white">
                  <Camera className="mr-2 inline-block h-6 w-6 text-amber-500" />
                  Photo gallery
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {hotel.images.slice(1, 7).map((img, i) => (
                    <div
                      key={img.id}
                      className={`relative overflow-hidden rounded-xl ${i === 0 ? "col-span-2 aspect-[4/3]" : "aspect-square"}`}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt ?? `${hotel.name} photo ${i + 2}`}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Location ──────────────────────────────────────── */}
            <section>
              <h2 className="mb-6 font-display text-2xl font-semibold text-charcoal-950 dark:text-white">
                Location
              </h2>
              <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-charcoal-900">
                {hotel.address && (
                  <div className="mb-4 flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-charcoal-950 dark:text-white">
                        {hotel.address}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {hotel.destination.name}, {hotel.destination.country.name}
                      </p>
                    </div>
                  </div>
                )}
                {hotel.latitude && hotel.longitude && (
                  <div className="flex items-center gap-3 rounded-xl bg-stone-50 p-3 dark:bg-white/5">
                    <Navigation className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      {Number(hotel.latitude).toFixed(6)}, {Number(hotel.longitude).toFixed(6)}
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* ── Reviews ───────────────────────────────────────── */}
            {hotel.reviews.length > 0 && (
              <section>
                <h2 className="mb-6 font-display text-2xl font-semibold text-charcoal-950 dark:text-white">
                  Guest reviews
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {hotel.reviews.map((review) => (
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
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
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
            <div className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-charcoal-900">
                <BookingCTA
                  href={`/book/${hotel.id}`}
                  price={
                    cheapestRoom ? Number(cheapestRoom.pricePerNight) : Number(hotel.priceFrom)
                  }
                  currency={hotel.currency}
                  priceLabel="per night"
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
            <p className="text-lg font-bold text-charcoal-950 dark:text-white">
              {formatCurrency(
                cheapestRoom ? Number(cheapestRoom.pricePerNight) : Number(hotel.priceFrom),
                hotel.currency
              )}
            </p>
            <p className="text-xs text-stone-500">per night</p>
          </div>
          <Link
            href={`/book/${hotel.id}`}
            className="flex-1 rounded-xl bg-amber-500 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-amber-400"
          >
            Book Now
          </Link>
        </div>
      </div>
      <div className="h-24 lg:hidden" />
    </div>
  );
}
