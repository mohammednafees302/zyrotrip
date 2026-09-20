"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Star, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Destination {
  id: string;
  slug: string;
  name: string;
  country: string;
  tagline: string;
  heroImage: string;
  priceFrom: number;
  rating: number;
  duration: string;
}

// ─── Destination Card ─────────────────────────────────────────────────────────
function DestinationCard({
  destination,
  index,
}: {
  destination: Destination;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        href={`/destinations/${destination.slug}`}
        className="group relative block overflow-hidden rounded-2xl"
        aria-label={`Explore ${destination.name}`}
      >
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={destination.heroImage}
            alt={`${destination.name}, ${destination.country}`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              // Wishlist logic in Phase 9
            }}
            aria-label={`Save ${destination.name} to wishlist`}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/40 hover:scale-110"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Content overlay */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            {/* Country */}
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/70">
              {destination.country}
            </p>

            {/* Name */}
            <h3 className="font-display text-xl font-semibold text-white leading-tight">
              {destination.name}
            </h3>

            {/* Tagline */}
            <p className="mt-1 line-clamp-2 text-sm text-white/75">
              {destination.tagline}
            </p>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-white">{destination.rating}</span>
                </div>
                {/* Duration */}
                <div className="flex items-center gap-1 text-white/70">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs">{destination.duration}</span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <span className="text-xs text-white/60">From</span>
                <div className="text-sm font-bold text-white">
                  {formatCurrency(destination.priceFrom)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Section Data ─────────────────────────────────────────────────────────────
const FEATURED_DESTINATIONS: Destination[] = [
  {
    id: "1",
    slug: "bali",
    name: "Bali",
    country: "Indonesia",
    tagline: "Sacred temples, emerald rice terraces, and world-class surf breaks.",
    heroImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    priceFrom: 1299,
    rating: 4.9,
    duration: "7–14 days",
  },
  {
    id: "2",
    slug: "santorini",
    name: "Santorini",
    country: "Greece",
    tagline: "Iconic whitewashed villages perched on volcanic cliffs above the sea.",
    heroImage: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80",
    priceFrom: 1899,
    rating: 4.8,
    duration: "5–10 days",
  },
  {
    id: "3",
    slug: "kyoto",
    name: "Kyoto",
    country: "Japan",
    tagline: "Ancient temples, bamboo groves, and centuries of living tradition.",
    heroImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    priceFrom: 1599,
    rating: 4.9,
    duration: "6–12 days",
  },
  {
    id: "4",
    slug: "patagonia",
    name: "Patagonia",
    country: "Chile / Argentina",
    tagline: "Untamed wilderness at the end of the earth, raw and unforgettable.",
    heroImage: "https://images.unsplash.com/photo-1477281765962-ef34e8bb0967?w=800&q=80",
    priceFrom: 2499,
    rating: 4.7,
    duration: "10–21 days",
  },
];

// ─── Featured Destinations Section ────────────────────────────────────────────
export function FeaturedDestinations() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  return (
    <section className="bg-stone-50 py-24 dark:bg-charcoal-950 lg:py-32" aria-labelledby="featured-destinations-heading">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-16">

        {/* Section Header */}
        <div ref={headerRef} className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-16">
          <div>
            <motion.p
              className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500"
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4 }}
            >
              Handpicked for you
            </motion.p>
            <motion.h2
              id="featured-destinations-heading"
              className="font-display text-display-lg font-bold text-charcoal-950 dark:text-white"
              initial={{ opacity: 0, y: 25 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Featured destinations
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-medium text-charcoal-700 transition-all hover:border-charcoal-300 hover:bg-white dark:border-white/10 dark:text-stone-300 dark:hover:bg-white/5"
            >
              View all destinations
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_DESTINATIONS.map((destination, index) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
