"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: "1",
    name: "Sarah Chen",
    location: "San Francisco, USA",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    rating: 5,
    text: "ZyroTrip completely changed how I plan travel. The AI itinerary for Kyoto was so detailed and personalized — it felt like having a local friend plan the trip.",
    destination: "Kyoto, Japan",
  },
  {
    id: "2",
    name: "Marcus Weber",
    location: "Berlin, Germany",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    rating: 5,
    text: "Booked a Patagonia package through ZyroTrip. The entire process was seamless — from selection to booking to the trip itself. Absolute perfection.",
    destination: "Patagonia, Chile",
  },
  {
    id: "3",
    name: "Priya Sharma",
    location: "Mumbai, India",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    rating: 5,
    text: "I've used every major travel platform. ZyroTrip is in another league entirely. The curation, the UI, the support team — all exceptional.",
    destination: "Santorini, Greece",
  },
];

export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      className="py-24 lg:py-32"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-16">
        <div ref={ref} className="mb-14 text-center">
          <motion.p
            className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
          >
            What travelers say
          </motion.p>
          <motion.h2
            id="testimonials-heading"
            className="font-display text-display-lg font-bold text-charcoal-950 dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            Stories from the road
          </motion.h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.id}
              className="relative rounded-2xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-charcoal-900"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
            >
              {/* Quote icon */}
              <Quote className="mb-4 h-8 w-8 text-amber-200 dark:text-amber-500/30" />

              {/* Stars */}
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm leading-relaxed text-charcoal-600 dark:text-stone-400">
                "{t.text}"
              </p>

              {/* Author */}
              <div className="mt-5 flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal-950 dark:text-white">
                    {t.name}
                  </p>
                  <p className="text-xs text-charcoal-400 dark:text-stone-500">
                    {t.location}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                    {t.destination}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
