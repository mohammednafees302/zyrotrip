import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, ArrowRight, HeartCrack, Clock, Users, Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { WishlistButton } from "@/components/shared/WishlistButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "View and manage your saved destinations, hotels, and packages.",
};

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const items = await db.wishlistItem.findMany({
    where: { wishlist: { userId: session.user.id } },
    include: {
      destination: {
        include: { country: true, categories: { take: 1 } },
      },
      package: {
        include: {
          destination: { include: { country: true } },
          images: { take: 1, orderBy: { order: "asc" } },
        },
      },
      hotel: {
        include: { destination: { include: { country: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-charcoal-950 text-3xl font-bold dark:text-white">
          My Wishlist
        </h1>
        <p className="mt-2 text-stone-500 dark:text-stone-400">
          Your saved destinations, hotels, and packages in one place.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 py-24 text-center dark:border-white/10 dark:bg-white/5">
          <HeartCrack className="mb-4 h-12 w-12 text-stone-300 dark:text-stone-600" />
          <h3 className="text-charcoal-950 mb-2 text-lg font-semibold dark:text-white">
            Your wishlist is empty
          </h3>
          <p className="max-w-sm text-sm text-stone-500 dark:text-stone-400">
            You haven't saved any items yet. Start exploring to plan your next dream vacation!
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/destinations"
              className="bg-charcoal-950 hover:bg-charcoal-800 dark:text-charcoal-950 rounded-xl px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:hover:bg-stone-100"
            >
              Explore Destinations
            </Link>
            <Link
              href="/packages"
              className="text-charcoal-950 dark:bg-charcoal-900 dark:hover:bg-charcoal-800 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium hover:bg-stone-50 dark:border-white/10 dark:text-white"
            >
              Browse Packages
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            if (item.type === "DESTINATION" && item.destination) {
              const dest = item.destination;
              return (
                <Link
                  key={item.id}
                  href={`/destinations/${dest.slug}`}
                  className="group dark:bg-charcoal-900 block overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-xl dark:border-white/10"
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

                    <div className="absolute top-3 right-3">
                      <WishlistButton type="DESTINATION" itemId={dest.id} initialIsSaved={true} />
                    </div>

                    {dest.categories[0] && (
                      <div className="text-charcoal-700 absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                        {dest.categories[0].name}
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
                        {dest.country.name}
                      </p>
                      <h3 className="font-display text-xl font-semibold text-white">{dest.name}</h3>
                      {dest.tagline && (
                        <p className="mt-1 line-clamp-2 text-xs text-white/70">{dest.tagline}</p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium text-white">
                            {Number(dest.rating).toFixed(1)}
                          </span>
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
              );
            }

            if (item.type === "PACKAGE" && item.package) {
              const pkg = item.package;
              const heroImage = pkg.images[0];
              const hasDiscount =
                pkg.priceDiscount !== null &&
                pkg.priceDiscount !== undefined &&
                Number(pkg.priceDiscount) < Number(pkg.priceFrom);
              const displayPrice = hasDiscount ? Number(pkg.priceDiscount) : Number(pkg.priceFrom);

              return (
                <div
                  key={item.id}
                  className="group dark:bg-charcoal-900 flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-xl dark:border-white/10"
                >
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
                      <div className="dark:bg-charcoal-800 flex h-full items-center justify-center bg-stone-100">
                        <Package className="h-12 w-12 text-stone-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                    <div className="text-charcoal-700 dark:bg-charcoal-900/90 absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold backdrop-blur-sm dark:text-stone-200">
                      {pkg.category.charAt(0) + pkg.category.slice(1).toLowerCase()}
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                      <WishlistButton type="PACKAGE" itemId={pkg.id} initialIsSaved={true} />
                      <div className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold text-white">
                          {Number(pkg.rating).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {pkg.destination.name}, {pkg.destination.country.name}
                      </span>
                    </div>

                    <h3 className="font-display text-charcoal-950 mt-2 line-clamp-2 text-lg leading-snug font-semibold dark:text-white">
                      {pkg.title}
                    </h3>

                    <div className="mt-3 flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{formatDuration(pkg.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        <span>Max {pkg.maxTravelers}</span>
                      </div>
                    </div>

                    <div className="flex-1" />

                    <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4 dark:border-white/8">
                      <div>
                        {hasDiscount && (
                          <p className="text-xs text-stone-400 line-through">
                            {formatCurrency(Number(pkg.priceFrom), pkg.currency)}
                          </p>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-stone-500 dark:text-stone-400">From</span>
                          <span className="text-charcoal-950 text-lg font-bold dark:text-white">
                            {formatCurrency(displayPrice, pkg.currency)}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/packages/${pkg.slug}`}
                        className="bg-charcoal-950 hover:bg-charcoal-800 dark:text-charcoal-950 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all dark:bg-white dark:hover:bg-stone-100"
                      >
                        View
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }

            if (item.type === "HOTEL" && item.hotel) {
              const hotel = item.hotel;
              return (
                <div
                  key={item.id}
                  className="group dark:bg-charcoal-900 flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-xl dark:border-white/10"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={hotel.heroImage}
                      alt={hotel.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                    <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                      <WishlistButton type="HOTEL" itemId={hotel.id} initialIsSaved={true} />
                      {Number(hotel.rating) > 0 && (
                        <div className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-semibold text-white">
                            {Number(hotel.rating).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < hotel.stars
                              ? "fill-amber-400 text-amber-400"
                              : "fill-stone-200 text-stone-200 dark:fill-stone-600 dark:text-stone-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {hotel.destination.name}, {hotel.destination.country.name}
                      </span>
                    </div>
                    <h3 className="font-display text-charcoal-950 mt-2 line-clamp-2 text-lg leading-snug font-semibold dark:text-white">
                      {hotel.name}
                    </h3>

                    <div className="flex-1" />

                    <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4 dark:border-white/8">
                      <div>
                        <p className="text-xs text-stone-500 dark:text-stone-400">From</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-charcoal-950 text-lg font-bold dark:text-white">
                            {formatCurrency(Number(hotel.priceFrom), hotel.currency)}
                          </span>
                          <span className="text-xs text-stone-400">/ night</span>
                        </div>
                      </div>
                      <Link
                        href={`/hotels/${hotel.slug}`}
                        className="bg-charcoal-950 hover:bg-charcoal-800 dark:text-charcoal-950 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all dark:bg-white dark:hover:bg-stone-100"
                      >
                        View
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}
