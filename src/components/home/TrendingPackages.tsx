"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Clock, Star, Users, Tag } from "lucide-react";
import { formatCurrency, formatDuration } from "@/lib/utils";

interface Package {
  id: string;
  slug: string;
  title: string;
  destination: string;
  country: string;
  heroImage: string;
  duration: number;
  priceFrom: number;
  priceDiscount?: number;
  rating: number;
  maxTravelers: number;
  category: string;
}

const TRENDING_PACKAGES: Package[] = [
  {
    id: "1",
    slug: "bali-spiritual-journey-7d",
    title: "Bali Spiritual Journey",
    destination: "Bali",
    country: "Indonesia",
    heroImage: "https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800&q=80",
    duration: 7,
    priceFrom: 1299,
    priceDiscount: 1099,
    rating: 4.9,
    maxTravelers: 12,
    category: "Cultural",
  },
  {
    id: "2",
    slug: "greece-island-hopping-10d",
    title: "Greek Islands Odyssey",
    destination: "Santorini & Mykonos",
    country: "Greece",
    heroImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
    duration: 10,
    priceFrom: 2199,
    rating: 4.8,
    maxTravelers: 16,
    category: "Beach",
  },
  {
    id: "3",
    slug: "japan-cherry-blossom-12d",
    title: "Japan Cherry Blossom",
    destination: "Tokyo to Osaka",
    country: "Japan",
    heroImage: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80",
    duration: 12,
    priceFrom: 2899,
    priceDiscount: 2499,
    rating: 5.0,
    maxTravelers: 10,
    category: "Cultural",
  },
];

function PackageCard({ pkg, index }: { pkg: Package; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const discount = pkg.priceDiscount
    ? Math.round(((pkg.priceFrom - pkg.priceDiscount) / pkg.priceFrom) * 100)
    : null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.12, duration: 0.5 }}
    >
      <Link
        href={`/packages/${pkg.slug}`}
        className="group block overflow-hidden rounded-2xl border border-stone-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-charcoal-900"
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <Image
            src={pkg.heroImage}
            alt={pkg.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {discount && (
            <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1">
              <Tag className="h-3 w-3 text-white" />
              <span className="text-xs font-bold text-white">{discount}% OFF</span>
            </div>
          )}
          <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-charcoal-700 backdrop-blur-sm">
            {pkg.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-charcoal-400 dark:text-stone-500">
            {pkg.destination} · {pkg.country}
          </p>
          <h3 className="font-display text-lg font-semibold text-charcoal-950 dark:text-white">
            {pkg.title}
          </h3>

          <div className="mt-3 flex items-center gap-4 text-sm text-charcoal-500 dark:text-stone-400">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(pkg.duration)}
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Up to {pkg.maxTravelers}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {pkg.rating}
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              {pkg.priceDiscount ? (
                <>
                  <span className="mr-2 text-xs text-charcoal-400 line-through dark:text-stone-500">
                    {formatCurrency(pkg.priceFrom)}
                  </span>
                  <span className="text-lg font-bold text-charcoal-950 dark:text-white">
                    {formatCurrency(pkg.priceDiscount)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-charcoal-950 dark:text-white">
                  {formatCurrency(pkg.priceFrom)}
                </span>
              )}
              <span className="ml-1 text-xs text-charcoal-400 dark:text-stone-500">/ person</span>
            </div>
            <span className="rounded-lg bg-charcoal-950 px-4 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-amber-500 dark:bg-white dark:text-charcoal-950">
              View
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function TrendingPackages() {
  const headerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headerRef, { once: true, margin: "-80px" });

  return (
    <section className="py-24 lg:py-32" aria-labelledby="trending-packages-heading">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-16">
        <div ref={headerRef} className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <motion.p
              className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
            >
              Most booked
            </motion.p>
            <motion.h2
              id="trending-packages-heading"
              className="font-display text-display-lg font-bold text-charcoal-950 dark:text-white"
              initial={{ opacity: 0, y: 25 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
            >
              Trending packages
            </motion.h2>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-medium text-charcoal-700 transition-all hover:border-charcoal-300 hover:bg-stone-50 dark:border-white/10 dark:text-stone-300 dark:hover:bg-white/5"
            >
              All packages <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TRENDING_PACKAGES.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
