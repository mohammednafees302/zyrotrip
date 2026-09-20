"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

const features = [
  "Personalized day-by-day itinerary",
  "Hotel & restaurant recommendations",
  "Budget estimation & breakdown",
  "Weather-aware planning",
  "Instantly editable and shareable",
];

export function AIPlannerCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-charcoal-950 py-24 lg:py-32"
      aria-labelledby="ai-planner-heading"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">

          {/* Left — Content */}
          <div>
            <motion.div
              className="mb-5 font-bold tracking-[0.2em] text-[10px] text-[#d3b482] uppercase"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4 }}
            >
              A QUIETER WAY TO GO FARTHER
            </motion.div>

            <motion.h2
              id="ai-planner-heading"
              className="font-display text-5xl lg:text-7xl leading-tight font-normal text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Intelligence, with <br />a human eye.
            </motion.h2>

            <motion.p
              className="mt-6 text-base lg:text-lg font-light leading-relaxed text-stone-400"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              ZyroTrip blends local knowledge, exacting hosts and an AI concierge into private journeys that move at your pace.
            </motion.p>

            {/* Feature list */}
            <motion.ul
              className="mt-8 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-amber-500" />
                  <span className="text-stone-300">{feature}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Link
                href="/ai-planner"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/25 active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                Start planning for free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>

          {/* Right — Preview Card */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              {/* Chat preview */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500">
                  <Sparkles className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">ZyroTrip AI</p>
                  <p className="text-xs text-stone-500">Travel Architect</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl rounded-tl-sm bg-white/10 p-4">
                  <p className="text-sm text-stone-300">
                    I'm planning a 10-day trip to Japan in April with my partner.
                    We love temples, local food, and scenic trains. Budget: $4,000.
                  </p>
                </div>

                <div className="rounded-xl rounded-tr-sm bg-amber-500/10 p-4">
                  <p className="mb-2 text-sm font-medium text-amber-300">
                    ✨ Here's your personalized Japan itinerary:
                  </p>
                  {[
                    "Day 1-3: Tokyo — Shibuya, Senso-ji, ramen tour",
                    "Day 4-5: Hakone — Mt. Fuji views, ryokan stay",
                    "Day 6-8: Kyoto — Arashiyama, Fushimi Inari, kaiseki",
                    "Day 9-10: Osaka — Dotonbori, Namba street food",
                  ].map((day) => (
                    <div key={day} className="mb-1 flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                      <p className="text-xs text-stone-400">{day}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA in card */}
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-lg bg-white/10 py-2 text-xs font-medium text-stone-300 transition-colors hover:bg-white/15">
                  Save itinerary
                </button>
                <button className="flex-1 rounded-lg bg-amber-500/80 py-2 text-xs font-medium text-white transition-colors hover:bg-amber-500">
                  Book this trip
                </button>
              </div>
            </div>

            {/* Floating stat cards */}
            <div className="absolute -right-4 -top-4 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-xs font-semibold text-amber-400">⚡ Generated in</p>
              <p className="text-lg font-bold text-white">3.2s</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
