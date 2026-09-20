"use client";

import Link from "next/link";
import { ShieldCheck, Lock, RotateCcw, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BookingCTAProps {
  href: string;
  price: number;
  currency?: string;
  priceLabel?: string;
  priceDiscount?: number | null;
  cancellationPolicy?: string | null;
}

export function BookingCTA({
  href,
  price,
  currency = "USD",
  priceLabel = "per person",
  priceDiscount,
  cancellationPolicy,
}: BookingCTAProps) {
  const displayPrice = priceDiscount ?? price;
  const hasDiscount = priceDiscount !== null && priceDiscount !== undefined && priceDiscount < price;

  return (
    <div className="space-y-4">
      {/* Price block */}
      <div>
        {hasDiscount && (
          <p className="text-sm text-stone-500 line-through dark:text-stone-400">
            {formatCurrency(price, currency)}
          </p>
        )}
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-3xl font-bold text-charcoal-950 dark:text-white">
            {formatCurrency(displayPrice, currency)}
          </span>
          <span className="text-sm text-stone-500 dark:text-stone-400">{priceLabel}</span>
        </div>
        {hasDiscount && (
          <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            Save {formatCurrency(price - displayPrice, currency)}
          </span>
        )}
      </div>

      {/* Book button */}
      <Link
        href={href}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-400 hover:shadow-amber-400/40 active:scale-[0.98]"
      >
        Book Now
        <ArrowRight className="h-4 w-4" />
      </Link>

      {/* Divider */}
      <hr className="border-stone-200 dark:border-white/10" />

      {/* Cancellation policy */}
      {cancellationPolicy && (
        <div className="flex items-start gap-2.5 text-sm text-charcoal-600 dark:text-stone-300">
          <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <p>{cancellationPolicy}</p>
        </div>
      )}

      {/* Security badges */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2.5 text-sm text-charcoal-600 dark:text-stone-300">
          <Lock className="h-4 w-4 shrink-0 text-amber-500" />
          <span>Secure, encrypted checkout</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-charcoal-600 dark:text-stone-300">
          <ShieldCheck className="h-4 w-4 shrink-0 text-amber-500" />
          <span>Best price guarantee</span>
        </div>
      </div>
    </div>
  );
}
