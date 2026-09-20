"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Calendar, Users, ChevronDown, Play, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Hero Search Bar ──────────────────────────────────────────────────────────
function HeroSearch() {
  return (
    <motion.div
      className="w-full max-w-3xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="rounded-2xl bg-white/95 p-2 shadow-2xl backdrop-blur-sm dark:bg-charcoal-900/95">
        <div className="grid grid-cols-1 divide-y divide-stone-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-white/10">
          {/* Destination */}
          <div className="flex items-center gap-3 px-4 py-3 sm:py-4">
            <Search className="h-5 w-5 flex-shrink-0 text-amber-500" />
            <div className="min-w-0">
              <label className="block text-xs font-semibold uppercase tracking-widest text-charcoal-400 dark:text-stone-500">
                Destination
              </label>
              <input
                type="text"
                placeholder="Where to?"
                className="mt-0.5 w-full bg-transparent text-sm font-medium text-charcoal-950 placeholder:text-charcoal-400 outline-none dark:text-white dark:placeholder:text-stone-500"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-3 px-4 py-3 sm:py-4">
            <Calendar className="h-5 w-5 flex-shrink-0 text-amber-500" />
            <div className="min-w-0">
              <label className="block text-xs font-semibold uppercase tracking-widest text-charcoal-400 dark:text-stone-500">
                Dates
              </label>
              <input
                type="text"
                placeholder="Select dates"
                className="mt-0.5 w-full bg-transparent text-sm font-medium text-charcoal-950 placeholder:text-charcoal-400 outline-none dark:text-white dark:placeholder:text-stone-500"
              />
            </div>
          </div>

          {/* Travelers + Search Button */}
          <div className="flex items-center gap-3 px-4 py-3 sm:py-4">
            <Users className="h-5 w-5 flex-shrink-0 text-amber-500" />
            <div className="min-w-0 flex-1">
              <label className="block text-xs font-semibold uppercase tracking-widest text-charcoal-400 dark:text-stone-500">
                Travelers
              </label>
              <input
                type="text"
                placeholder="2 adults"
                className="mt-0.5 w-full bg-transparent text-sm font-medium text-charcoal-950 placeholder:text-charcoal-400 outline-none dark:text-white dark:placeholder:text-stone-500"
              />
            </div>
            <button
              className="flex-shrink-0 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber-600 active:scale-95"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Hero Component ────────────────────────────────────────────────────────────
export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: imageY }}
      >
        <Image
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=90"
          alt="Scenic travel destination — mountains reflected in a lake"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center px-4 pt-24 text-center"
        style={{ y: contentY, opacity }}
      >
        {/* Badge */}
        <motion.div
          className="mb-8 font-bold tracking-[0.2em] text-[10px] text-[#d3b482] uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          The Private Travel House
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-display text-6xl md:text-8xl lg:text-[140px] leading-[0.9] tracking-tight font-normal text-white"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          The world,<br />
          precisely yours.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="mt-8 max-w-lg text-left md:text-center text-sm md:text-base font-light leading-relaxed text-white/90"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          Extraordinary places, personally composed. Start with an idea; leave with a journey that feels impossible to repeat.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 rounded-full bg-[#d3b482] px-8 py-3.5 text-xs font-bold tracking-widest uppercase text-charcoal-950 transition-all hover:bg-[#ebd2a9]"
          >
            Begin Your Journey
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.button
          className="mt-16 flex flex-col items-center gap-2 text-white/60 transition-colors hover:text-white/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          onClick={() => {
            window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
          }}
          aria-label="Scroll down"
        >
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-black/30 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-center divide-x divide-white/20 px-4 py-5">
          {[
            { value: "100+", label: "Destinations" },
            { value: "500K+", label: "Happy Travelers" },
            { value: "4.9★", label: "Average Rating" },
            { value: "24/7", label: "Support" },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 px-4 text-center sm:px-8">
              <div className="text-lg font-bold text-white sm:text-xl">{stat.value}</div>
              <div className="text-xs text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
