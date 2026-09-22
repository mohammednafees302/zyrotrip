"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, ChevronRight, ChevronLeft, CreditCard, Shield,
  Tag, Users, Calendar, MapPin, Loader2, Lock,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// ─── Stripe Setup ─────────────────────────────────────────────────────────────

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "pk_test_placeholder"
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface BookingPackage {
  id: string;
  title: string;
  slug: string;
  heroImage?: string;
  duration: number;
  priceFrom: number;
  destination: { name: string; country: { name: string } };
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const bookingSchema = z.object({
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  adults: z.number().min(1, "At least 1 adult is required").max(20),
  children: z.number().min(0).max(20),
  infants: z.number().min(0).max(10),
  specialRequests: z.string().optional(),
  travelers: z.array(z.object({
    firstName: z.string().min(1, "First name required"),
    lastName: z.string().min(1, "Last name required"),
    dateOfBirth: z.string().optional(),
    passportNumber: z.string().optional(),
    nationality: z.string().optional(),
    isLead: z.boolean().optional()
  })).min(1),
  couponCode: z.string().optional(),
  extras: z.array(z.string()).optional()
});

type BookingForm = z.infer<typeof bookingSchema>;

const EXTRAS = [
  { id: "airport-transfer", name: "Airport Transfer (Round trip)", price: 50 },
  { id: "travel-insurance", name: "Premium Travel Insurance", price: 80 },
  { id: "welcome-kit", name: "Local Welcome Kit", price: 25 },
  { id: "private-guide", name: "Private Guide (1 day)", price: 120 }
];

// ─── Stripe Payment Form ──────────────────────────────────────────────────────

function StripePaymentForm({
  onSuccess,
  isSubmitting,
  onBookingSubmit,
}: {
  onSuccess: () => void;
  isSubmitting: boolean;
  onBookingSubmit: () => Promise<string | null>;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // First create the booking record
      const bookingRef = await onBookingSubmit();
      if (!bookingRef) {
        setIsProcessing(false);
        return;
      }

      // Then confirm Stripe payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/bookings",
        },
        redirect: "if_required",
      });

      if (error) {
        setPaymentError(error.message ?? "Payment failed. Please try again.");
      } else {
        onSuccess();
      }
    } catch {
      setPaymentError("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const busy = isProcessing || isSubmitting;

  return (
    <div className="space-y-5">
      {/* Test mode banner */}
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
        <span className="text-base">🔒</span>
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
          Test Mode — Use card <strong className="font-mono">4242 4242 4242 4242</strong>, any future date, any CVC
        </p>
      </div>

      {/* Stripe Payment Element */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-charcoal-950/60">
        <PaymentElement
          options={{
            layout: "tabs",
            wallets: { applePay: "auto", googlePay: "auto" },
          }}
        />
      </div>

      {paymentError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {paymentError}
        </div>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={!stripe || !elements || busy}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
        ) : (
          <><Lock className="h-4 w-4" /> Pay Securely</>
        )}
      </button>

      <p className="text-center text-xs text-stone-400 dark:text-stone-500">
        Powered by Stripe · SSL encrypted · PCI DSS compliant
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BookingFlow({ pkg }: { pkg: BookingPackage }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discount, setDiscount] = useState<{ amount: number, code: string } | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const { register, control, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      adults: 2,
      children: 0,
      infants: 0,
      travelers: [{ firstName: "", lastName: "", isLead: true }],
      extras: []
    }
  });

  const { fields: travelerFields, append: appendTraveler, remove: removeTraveler } = useFieldArray({
    control,
    name: "travelers"
  });

  const watchAdults = watch("adults");
  const watchExtras = watch("extras") || [];
  const watchCoupon = watch("couponCode");

  // Sync travelers array with adults count
  const handleAdultsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    setValue("adults", val);

    if (val > travelerFields.length) {
      for (let i = travelerFields.length; i < val; i++) {
        appendTraveler({ firstName: "", lastName: "", isLead: false });
      }
    } else if (val < travelerFields.length) {
      for (let i = travelerFields.length - 1; i >= val; i--) {
        removeTraveler(i);
      }
    }
  };

  // Pricing calculations
  const basePrice = pkg.priceFrom * watchAdults;
  const extrasPrice = EXTRAS.filter(e => watchExtras.includes(e.id)).reduce((sum, e) => sum + e.price, 0);
  const subtotal = basePrice + extrasPrice;
  const total = Math.max(0, subtotal - (discount?.amount || 0));

  const validateStep = async (currentStep: number) => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await trigger(["checkIn", "checkOut", "adults"]);
    } else if (currentStep === 2) {
      isValid = await trigger(["travelers"]);
    } else {
      isValid = true;
    }

    if (isValid) setStep(s => s + 1);
  };

  const applyCoupon = async () => {
    if (!watchCoupon) return;
    setIsCheckingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: watchCoupon, orderAmount: subtotal })
      });
      const data = await res.json();
      if (data.success && data.data.valid) {
        setDiscount({ amount: data.data.discount, code: data.data.code });
        toast.success(data.message);
      } else {
        setDiscount(null);
        toast.error(data.message || "Invalid coupon");
      }
    } catch {
      toast.error("Failed to validate coupon");
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  // Create booking and get clientSecret for Stripe
  const handleProceedToPayment = async (data: BookingForm) => {
    setIsSubmitting(true);
    try {
      // Step 1: Create the booking
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          packageId: pkg.id,
          totalAmount: total,
          couponCode: discount?.code,
        }),
      });

      const bookingData = await bookingRes.json();

      if (!bookingRes.ok || !bookingData.success) {
        toast.error(bookingData.message || "Booking failed");
        if (bookingData.code === "UNAUTHORIZED") {
          router.push(`/auth/login?callbackUrl=/book/${pkg.id}`);
        }
        return;
      }

      const newBookingRef = bookingData.data.reference;
      const bookingId = bookingData.data.id;
      setBookingRef(newBookingRef);

      // Step 2: Create a PaymentIntent
      const intentRes = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount: total,
          currency: "usd",
        }),
      });

      const intentData = await intentRes.json();

      if (!intentRes.ok || !intentData.clientSecret) {
        toast.error("Failed to initialize payment. Please try again.");
        return;
      }

      setClientSecret(intentData.clientSecret);
      setStep(5); // Move to Stripe payment step
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Called from StripePaymentForm after booking ref is already set
  const handleStripeBookingSubmit = async (): Promise<string | null> => {
    return bookingRef;
  };

  const handleStripeSuccess = () => {
    setStep(7);
  };

  const toggleExtra = (id: string) => {
    const current = watchExtras;
    if (current.includes(id)) {
      setValue("extras", current.filter(x => x !== id));
    } else {
      setValue("extras", [...current, id]);
    }
  };

  const steps = [
    { id: 1, title: "Trip Details" },
    { id: 2, title: "Travelers" },
    { id: 3, title: "Extras" },
    { id: 4, title: "Review" },
    { id: 5, title: "Payment" },
  ];

  // Success screen
  if (step === 7) {
    return (
      <div className="mx-auto max-w-2xl text-center py-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-500"
        >
          <Check className="h-12 w-12" />
        </motion.div>
        <h1 className="font-display text-4xl font-bold text-charcoal-950 dark:text-white">
          Booking Confirmed!
        </h1>
        <p className="mt-4 text-stone-500 dark:text-stone-400">
          Your booking reference is <strong className="text-charcoal-950 dark:text-white">{bookingRef}</strong>
        </p>
        <p className="mt-2 text-sm text-stone-500">
          We've sent a confirmation email with your full itinerary and invoice.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
          <button
            onClick={() => router.push("/profile/bookings")}
            className="rounded-xl bg-charcoal-950 px-6 py-3 font-semibold text-white hover:bg-charcoal-800 dark:bg-white dark:text-charcoal-950"
          >
            View My Bookings
          </button>
          <button
            onClick={() => router.push("/")}
            className="rounded-xl border border-stone-200 px-6 py-3 font-semibold text-charcoal-700 hover:bg-stone-50 dark:border-white/10 dark:text-stone-300 dark:hover:bg-white/5"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Main Form Area */}
      <div className="lg:col-span-2">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((s) => (
              <div key={s.id} className="flex flex-col items-center">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  step > s.id ? "bg-amber-500 text-white" : step === s.id ? "bg-charcoal-950 text-white dark:bg-white dark:text-charcoal-950" : "bg-stone-200 text-stone-500 dark:bg-white/10"
                )}>
                  {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                </div>
                <span className="mt-2 text-xs font-medium text-stone-500">{s.title}</span>
              </div>
            ))}
          </div>
          <div className="relative mt-2 h-1 w-full rounded-full bg-stone-200 dark:bg-white/10">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-amber-500 transition-all duration-300"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={e => e.preventDefault()} className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-charcoal-900 shadow-sm">
          <AnimatePresence mode="wait">

            {/* Step 1: Trip Details */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="mb-6 font-display text-2xl font-bold text-charcoal-950 dark:text-white flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-amber-500" /> Trip Dates & Guests
                </h2>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-charcoal-700 dark:text-stone-300">Check-in Date</label>
                    <input
                      type="date"
                      {...register("checkIn")}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                    {errors.checkIn && <p className="mt-1 text-xs text-red-500">{errors.checkIn.message}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-charcoal-700 dark:text-stone-300">Check-out Date</label>
                    <input
                      type="date"
                      {...register("checkOut")}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                    {errors.checkOut && <p className="mt-1 text-xs text-red-500">{errors.checkOut.message}</p>}
                  </div>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-charcoal-700 dark:text-stone-300">Adults</label>
                    <input
                      type="number" min={1} max={20}
                      {...register("adults", { valueAsNumber: true, onChange: handleAdultsChange })}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-charcoal-700 dark:text-stone-300">Children (2-12)</label>
                    <input
                      type="number" min={0} max={20}
                      {...register("children", { valueAsNumber: true })}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-charcoal-700 dark:text-stone-300">Infants (0-2)</label>
                    <input
                      type="number" min={0} max={10}
                      {...register("infants", { valueAsNumber: true })}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="mb-2 block text-sm font-medium text-charcoal-700 dark:text-stone-300">Special Requests (Optional)</label>
                  <textarea
                    {...register("specialRequests")}
                    rows={3}
                    placeholder="Dietary requirements, accessibility needs, etc."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Travelers */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="mb-6 font-display text-2xl font-bold text-charcoal-950 dark:text-white flex items-center gap-2">
                  <Users className="h-6 w-6 text-amber-500" /> Traveler Details
                </h2>

                <div className="space-y-6">
                  {travelerFields.map((field, index) => (
                    <div key={field.id} className="rounded-xl border border-stone-200 p-5 dark:border-white/10 bg-stone-50/50 dark:bg-charcoal-950/50">
                      <h3 className="mb-4 font-semibold text-charcoal-950 dark:text-white">
                        Traveler {index + 1} {index === 0 && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Lead</span>}
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-stone-500">First Name *</label>
                          <input
                            {...register(`travelers.${index}.firstName`)}
                            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-charcoal-900 dark:text-white"
                          />
                          {errors.travelers?.[index]?.firstName && <p className="mt-1 text-xs text-red-500">{errors.travelers[index]?.firstName?.message}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-stone-500">Last Name *</label>
                          <input
                            {...register(`travelers.${index}.lastName`)}
                            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-charcoal-900 dark:text-white"
                          />
                          {errors.travelers?.[index]?.lastName && <p className="mt-1 text-xs text-red-500">{errors.travelers[index]?.lastName?.message}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-stone-500">Date of Birth</label>
                          <input
                            type="date"
                            {...register(`travelers.${index}.dateOfBirth`)}
                            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-charcoal-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-stone-500">Nationality</label>
                          <input
                            {...register(`travelers.${index}.nationality`)}
                            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-charcoal-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Extras */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="mb-6 font-display text-2xl font-bold text-charcoal-950 dark:text-white flex items-center gap-2">
                  <Tag className="h-6 w-6 text-amber-500" /> Enhance Your Trip
                </h2>

                <div className="space-y-3">
                  {EXTRAS.map(extra => {
                    const isSelected = watchExtras.includes(extra.id);
                    return (
                      <div
                        key={extra.id}
                        onClick={() => toggleExtra(extra.id)}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all",
                          isSelected ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10" : "border-stone-200 hover:border-stone-300 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("flex h-5 w-5 items-center justify-center rounded border", isSelected ? "border-amber-500 bg-amber-500 text-white" : "border-stone-300 dark:border-white/20")}>
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </div>
                          <span className="font-medium text-charcoal-950 dark:text-white">{extra.name}</span>
                        </div>
                        <span className="font-semibold text-charcoal-950 dark:text-white">+{formatCurrency(extra.price)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Code Section */}
                <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-5 dark:border-white/10 dark:bg-charcoal-950/50">
                  <label className="mb-2 block text-sm font-medium text-charcoal-700 dark:text-stone-300">Have a promo code?</label>
                  <div className="flex gap-2">
                    <input
                      {...register("couponCode")}
                      placeholder="Enter code"
                      className="flex-1 rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm uppercase focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-charcoal-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={isCheckingCoupon || !watchCoupon}
                      className="rounded-lg bg-charcoal-950 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-charcoal-950"
                    >
                      {isCheckingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                  {discount && (
                    <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                      Coupon applied! -{formatCurrency(discount.amount)}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Review & Confirm */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="mb-6 font-display text-2xl font-bold text-charcoal-950 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-amber-500" /> Review Your Booking
                </h2>

                <div className="space-y-4">
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 dark:border-white/10 dark:bg-charcoal-950/50">
                    <h3 className="mb-3 font-semibold text-charcoal-950 dark:text-white">Trip Summary</h3>
                    <div className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
                      <div className="flex justify-between">
                        <span>Package</span>
                        <span className="font-medium text-charcoal-950 dark:text-white">{pkg.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Destination</span>
                        <span className="font-medium text-charcoal-950 dark:text-white">{pkg.destination.name}, {pkg.destination.country.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration</span>
                        <span className="font-medium text-charcoal-950 dark:text-white">{pkg.duration} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Travelers</span>
                        <span className="font-medium text-charcoal-950 dark:text-white">{watchAdults} adult{watchAdults > 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-500/20 dark:bg-green-500/10">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      Your payment is protected by bank-level SSL encryption via Stripe
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Stripe Payment */}
            {step === 5 && clientSecret && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="mb-6 font-display text-2xl font-bold text-charcoal-950 dark:text-white flex items-center gap-2">
                  <Lock className="h-6 w-6 text-amber-500" /> Secure Payment
                </h2>

                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#f59e0b",
                        colorBackground: "#ffffff",
                        colorText: "#1c1917",
                        borderRadius: "12px",
                        fontFamily: "Inter, system-ui, sans-serif",
                      },
                    },
                  }}
                >
                  <StripePaymentForm
                    onSuccess={handleStripeSuccess}
                    isSubmitting={isSubmitting}
                    onBookingSubmit={handleStripeBookingSubmit}
                  />
                </Elements>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Buttons — hidden on step 5 (Stripe form has its own submit) */}
          {step < 5 && (
            <div className="mt-8 flex items-center justify-between border-t border-stone-100 pt-6 dark:border-white/10">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1.5 rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-medium text-charcoal-700 hover:bg-stone-50 dark:border-white/10 dark:text-stone-300 dark:hover:bg-white/5"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              ) : <div />}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => validateStep(step)}
                  className="flex items-center gap-1.5 rounded-xl bg-charcoal-950 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-charcoal-800 dark:bg-white dark:text-charcoal-950 dark:hover:bg-stone-200"
                >
                  Next Step <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                // Step 4: Review — button creates booking + payment intent, goes to step 5
                <button
                  type="button"
                  onClick={handleSubmit(handleProceedToPayment)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-amber-600 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Proceed to Payment
                </button>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Sidebar Summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm dark:border-white/10 dark:bg-charcoal-900">
          <div className="relative h-40">
            {pkg.heroImage && (
              <Image src={pkg.heroImage} alt={pkg.title} fill className="object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="font-display text-xl font-bold leading-tight">{pkg.title}</h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-white/80">
                <MapPin className="h-3.5 w-3.5" /> {pkg.destination.name}, {pkg.destination.country.name}
              </p>
            </div>
          </div>

          <div className="p-5">
            <h4 className="font-semibold text-charcoal-950 dark:text-white mb-4">Price Summary</h4>

            <div className="space-y-3 text-sm text-stone-600 dark:text-stone-400">
              <div className="flex justify-between">
                <span>{watchAdults} × Adult{watchAdults > 1 ? "s" : ""}</span>
                <span className="font-medium text-charcoal-950 dark:text-white">{formatCurrency(basePrice)}</span>
              </div>

              {EXTRAS.map(e => watchExtras.includes(e.id) && (
                <div key={e.id} className="flex justify-between">
                  <span>{e.name}</span>
                  <span className="font-medium text-charcoal-950 dark:text-white">{formatCurrency(e.price)}</span>
                </div>
              ))}

              <div className="my-3 border-t border-stone-200 dark:border-white/10" />

              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span className="text-charcoal-950 dark:text-white">{formatCurrency(subtotal)}</span>
              </div>

              {discount && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount ({discount.code})</span>
                  <span>-{formatCurrency(discount.amount)}</span>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-xl bg-stone-50 p-4 dark:bg-charcoal-950/50">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-charcoal-950 dark:text-white">Total</span>
                <span className="font-display text-2xl font-bold text-amber-500">
                  {formatCurrency(total)}
                </span>
              </div>
              <p className="mt-1 text-right text-xs text-stone-500">Includes all taxes and fees</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
