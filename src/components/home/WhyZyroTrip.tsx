"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, Sparkles, HeadphonesIcon, CreditCard, MapPin, Star } from "lucide-react";

const values = [
  {
    icon: Sparkles,
    title: "AI-Powered Planning",
    description:
      "Our AI travel architect creates fully personalized itineraries tailored to your style, budget, and interests in seconds.",
    accent: "bg-amber-50 text-amber-500 dark:bg-amber-500/10",
  },
  {
    icon: Shield,
    title: "Book with Confidence",
    description:
      "Every booking is protected with secure payments, clear cancellation policies, and comprehensive travel support.",
    accent: "bg-stone-100 text-charcoal-700 dark:bg-white/10 dark:text-stone-300",
  },
  {
    icon: MapPin,
    title: "Curated Destinations",
    description:
      "100+ handpicked destinations selected by our team of expert travelers and local guides worldwide.",
    accent: "bg-stone-100 text-charcoal-700 dark:bg-white/10 dark:text-stone-300",
  },
  {
    icon: Star,
    title: "Premium Experiences",
    description:
      "From boutique hotels to exclusive experiences, every option is vetted to meet our premium quality standard.",
    accent: "bg-stone-100 text-charcoal-700 dark:bg-white/10 dark:text-stone-300",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Expert Support",
    description:
      "Our travel specialists are available around the clock, ensuring you have help whenever and wherever you need it.",
    accent: "bg-stone-100 text-charcoal-700 dark:bg-white/10 dark:text-stone-300",
  },
  {
    icon: CreditCard,
    title: "Transparent Pricing",
    description:
      "No hidden fees. What you see is what you pay. Full price breakdown before every booking confirmation.",
    accent: "bg-stone-100 text-charcoal-700 dark:bg-white/10 dark:text-stone-300",
  },
];

export function WhyZyroTrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="border-y border-stone-200 bg-white py-24 dark:border-white/10 dark:bg-charcoal-900 lg:py-32" aria-labelledby="why-zyrotrip-heading">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-16">

        <div ref={ref} className="mb-16 max-w-xl">
          <motion.div
            className="mb-6 font-bold tracking-[0.2em] text-[10px] text-[#d3b482] uppercase"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            FOUNDATION IN PLACE
          </motion.div>
          <motion.h2
            id="why-zyrotrip-heading"
            className="font-display text-5xl lg:text-7xl leading-[1.1] font-normal text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            The detail is <br />the destination.
          </motion.h2>
          <motion.p
            className="mt-6 max-w-xl text-base lg:text-lg font-light leading-relaxed text-stone-400"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            From first thought to final return, every considered detail earns its place in the journey.
          </motion.p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              className="rounded-2xl border border-stone-200 p-6 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.08 + 0.3, duration: 0.4 }}
            >
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${value.accent}`}>
                <value.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-charcoal-950 dark:text-white">
                {value.title}
              </h3>
              <p className="text-sm leading-relaxed text-charcoal-500 dark:text-stone-400">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
