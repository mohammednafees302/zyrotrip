"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Heart,
  RefreshCw,
  Save,
  Share2,
  ChevronDown,
  ChevronUp,
  Clock,
  Utensils,
  Camera,
  Hotel,
  Car,
  Sun,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  type: string;
  location?: string;
  estimatedCost?: number;
  duration?: string;
}

interface ItineraryDay {
  dayNumber: number;
  date?: string;
  title: string;
  theme: string;
  activities: ItineraryActivity[];
  accommodation?: string;
  meals?: string[];
  transportationTip?: string;
}

interface GeneratedItinerary {
  title: string;
  destination: string;
  summary: string;
  totalDays: number;
  estimatedBudget: {
    flights: number;
    accommodation: number;
    food: number;
    activities: number;
    transport: number;
    total: number;
  };
  bestTimeToVisit: string;
  travelTips: string[];
  days: ItineraryDay[];
}

// ─── Form Schema ──────────────────────────────────────────────────────────────
const plannerSchema = z.object({
  destination: z.string().min(2, "Please enter a destination"),
  startDate: z.string().optional(),
  duration: z.number().min(1).max(30),
  travelers: z.number().min(1).max(20),
  budget: z.enum(["budget", "mid-range", "luxury", "ultra-luxury"]),
  travelStyle: z.string().optional(),
  interests: z.array(z.string()).optional(),
  foodPreferences: z.string().optional(),
  accommodation: z.enum(["hostel", "budget-hotel", "boutique", "luxury-hotel", "resort", "villa"]).optional(),
});

type PlannerForm = z.infer<typeof plannerSchema>;

const INTEREST_OPTIONS = [
  "Historical sites", "Art & culture", "Local food", "Adventure sports",
  "Nature & wildlife", "Photography", "Shopping", "Nightlife",
  "Beaches", "Mountains", "Architecture", "Religion & spirituality",
];

const activityIcons: Record<string, React.ElementType> = {
  SIGHTSEEING: Camera,
  DINING: Utensils,
  TRANSPORT: Car,
  ACCOMMODATION: Hotel,
  RELAXATION: Sun,
  OTHER: MapPin,
};

// ─── Day Card ─────────────────────────────────────────────────────────────────
function DayCard({ day, index }: { day: ItineraryDay; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-white/10 dark:bg-charcoal-900"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 text-sm font-bold text-white">
            {day.dayNumber}
          </div>
          <div>
            <p className="font-semibold text-charcoal-950 dark:text-white">{day.title}</p>
            <p className="text-sm text-charcoal-500 dark:text-stone-400">{day.theme}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-charcoal-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-charcoal-400" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-stone-100 p-5 pt-4 dark:border-white/10">
              {/* Activities */}
              <div className="space-y-4">
                {day.activities.map((activity, i) => {
                  const Icon = activityIcons[activity.type] ?? MapPin;
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-white/10">
                          <Icon className="h-4 w-4 text-charcoal-600 dark:text-stone-400" />
                        </div>
                        {i < day.activities.length - 1 && (
                          <div className="my-1 w-px flex-1 bg-stone-100 dark:bg-white/10" />
                        )}
                      </div>
                      <div className="pb-4">
                        <div className="flex items-center gap-2">
                          {activity.time && (
                            <span className="text-xs font-semibold text-amber-500">
                              {activity.time}
                            </span>
                          )}
                          {activity.duration && (
                            <span className="flex items-center gap-1 text-xs text-charcoal-400 dark:text-stone-500">
                              <Clock className="h-3 w-3" />
                              {activity.duration}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 font-medium text-charcoal-950 dark:text-white">
                          {activity.title}
                        </p>
                        <p className="mt-1 text-sm text-charcoal-500 dark:text-stone-400">
                          {activity.description}
                        </p>
                        {activity.location && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-charcoal-400 dark:text-stone-500">
                            <MapPin className="h-3 w-3" />
                            {activity.location}
                          </p>
                        )}
                        {activity.estimatedCost != null && (
                          <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                            ~${activity.estimatedCost} per person
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Day footer */}
              {(day.accommodation || day.meals || day.transportationTip) && (
                <div className="mt-4 space-y-2 rounded-xl bg-stone-50 p-4 dark:bg-white/5">
                  {day.accommodation && (
                    <p className="flex items-center gap-2 text-sm text-charcoal-600 dark:text-stone-400">
                      <Hotel className="h-4 w-4 text-charcoal-400" />
                      <span className="font-medium">Stay:</span> {day.accommodation}
                    </p>
                  )}
                  {day.meals && day.meals.length > 0 && (
                    <p className="flex items-center gap-2 text-sm text-charcoal-600 dark:text-stone-400">
                      <Utensils className="h-4 w-4 text-charcoal-400" />
                      <span className="font-medium">Meals:</span> {day.meals.join(", ")}
                    </p>
                  )}
                  {day.transportationTip && (
                    <p className="flex items-center gap-2 text-sm text-charcoal-600 dark:text-stone-400">
                      <Car className="h-4 w-4 text-charcoal-400" />
                      {day.transportationTip}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Budget Breakdown ─────────────────────────────────────────────────────────
function BudgetBreakdown({ budget }: { budget: GeneratedItinerary["estimatedBudget"] }) {
  const items = [
    { label: "Flights", value: budget.flights, icon: "✈️" },
    { label: "Accommodation", value: budget.accommodation, icon: "🏨" },
    { label: "Food & Dining", value: budget.food, icon: "🍽️" },
    { label: "Activities", value: budget.activities, icon: "🎯" },
    { label: "Transport", value: budget.transport, icon: "🚗" },
  ];

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-charcoal-900">
      <h3 className="mb-4 font-semibold text-charcoal-950 dark:text-white">
        💰 Budget Estimate
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-charcoal-600 dark:text-stone-400">
              <span>{item.icon}</span>
              {item.label}
            </span>
            <span className="text-sm font-semibold text-charcoal-950 dark:text-white">
              ${item.value.toLocaleString()}
            </span>
          </div>
        ))}
        <div className="border-t border-stone-200 pt-3 dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-charcoal-950 dark:text-white">Total</span>
            <span className="text-lg font-bold text-amber-500">
              ${budget.total.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-xs text-charcoal-400 dark:text-stone-500">
            Per person estimate
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main AI Planner Interface ────────────────────────────────────────────────
export function AIPlannerInterface() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [step, setStep] = useState<"form" | "result">("form");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PlannerForm>({
    resolver: zodResolver(plannerSchema),
    defaultValues: {
      duration: 7,
      travelers: 2,
      budget: "mid-range",
    },
  });

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
    setValue("interests", selectedInterests);
  };

  const onSubmit = async (data: PlannerForm) => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, interests: selectedInterests }),
      });

      const json = await res.json() as { success: boolean; data?: GeneratedItinerary; message?: string };

      if (!res.ok || !json.success) {
        toast.error(json.message ?? "Failed to generate itinerary. Please try again.");
        return;
      }

      setItinerary(json.data!);
      setStep("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (step === "result" && itinerary) {
    return (
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">
                AI-Generated Itinerary
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-charcoal-950 dark:text-white">
                {itinerary.title}
              </h2>
              <p className="mt-2 text-charcoal-500 dark:text-stone-400">{itinerary.summary}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setStep("form")}
                className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium text-charcoal-700 hover:bg-stone-50 dark:border-white/10 dark:text-stone-300 dark:hover:bg-white/5"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </button>
              <button
                onClick={() => toast.success("Itinerary saved!")}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>

          {/* Days */}
          <div className="space-y-4">
            {itinerary.days.map((day, i) => (
              <DayCard key={day.dayNumber} day={day} index={i} />
            ))}
          </div>

          {/* Travel Tips */}
          {itinerary.travelTips.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-500/20 dark:bg-amber-500/5">
              <h3 className="mb-4 font-semibold text-charcoal-950 dark:text-white">
                💡 AI Travel Tips
              </h3>
              <ul className="space-y-2">
                {itinerary.travelTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-charcoal-600 dark:text-stone-400">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Quick Stats */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-charcoal-900">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-charcoal-400 dark:text-stone-500">Duration</p>
                <p className="mt-1 font-semibold text-charcoal-950 dark:text-white">
                  {itinerary.totalDays} days
                </p>
              </div>
              <div>
                <p className="text-xs text-charcoal-400 dark:text-stone-500">Best time</p>
                <p className="mt-1 text-sm font-semibold text-charcoal-950 dark:text-white">
                  {itinerary.bestTimeToVisit}
                </p>
              </div>
            </div>
          </div>

          {/* Budget */}
          <BudgetBreakdown budget={itinerary.estimatedBudget} />

          {/* CTA */}
          <div className="rounded-2xl bg-charcoal-950 p-5 dark:bg-amber-500">
            <p className="font-semibold text-white">Ready to book?</p>
            <p className="mt-1 text-sm text-stone-400 dark:text-amber-100">
              Turn this itinerary into a confirmed booking.
            </p>
            <button className="mt-4 w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600 dark:bg-white dark:!text-[#141310] dark:hover:bg-stone-100 dark:hover:!text-[#141310] dark:focus-visible:!ring-white dark:active:bg-stone-300">
              Find matching packages
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Destination */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-charcoal-900">
          <h2 className="mb-5 flex items-center gap-2 font-semibold text-charcoal-950 dark:text-white">
            <MapPin className="h-5 w-5 text-amber-500" />
            Where do you want to go?
          </h2>
          <input
            type="text"
            {...register("destination")}
            placeholder="e.g., Japan, Bali, Paris, Patagonia..."
            className={cn(
              "w-full rounded-xl border px-4 py-3 text-sm text-charcoal-950 outline-none transition-colors placeholder:text-charcoal-400 dark:bg-white/5 dark:text-white dark:placeholder:text-stone-500",
              errors.destination
                ? "border-red-400"
                : "border-stone-200 bg-stone-50 focus:border-amber-500 focus:bg-white dark:border-white/10"
            )}
          />
          {errors.destination && (
            <p className="mt-1.5 text-xs text-red-500">{errors.destination.message}</p>
          )}
        </div>

        {/* Trip Details */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-charcoal-900">
          <h2 className="mb-5 flex items-center gap-2 font-semibold text-charcoal-950 dark:text-white">
            <Calendar className="h-5 w-5 text-amber-500" />
            Trip details
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal-700 dark:text-stone-300">
                Duration (days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                {...register("duration", { valueAsNumber: true })}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-charcoal-950 outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-charcoal-800 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal-700 dark:text-stone-300">
                Travelers
              </label>
              <input
                type="number"
                min={1}
                max={20}
                {...register("travelers", { valueAsNumber: true })}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-charcoal-950 outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-charcoal-800 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal-700 dark:text-stone-300">
                Start date (optional)
              </label>
              <input
                type="date"
                {...register("startDate")}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-charcoal-950 outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-charcoal-800 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-charcoal-900">
          <h2 className="mb-5 flex items-center gap-2 font-semibold text-charcoal-950 dark:text-white">
            <DollarSign className="h-5 w-5 text-amber-500" />
            Budget style
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { value: "budget", label: "Budget", emoji: "🎒", desc: "< $100/day" },
              { value: "mid-range", label: "Mid-range", emoji: "🏨", desc: "$100-250/day" },
              { value: "luxury", label: "Luxury", emoji: "✨", desc: "$250-500/day" },
              { value: "ultra-luxury", label: "Ultra Luxury", emoji: "👑", desc: "$500+/day" },
            ].map((opt) => {
              const selected = watch("budget") === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("budget", opt.value as PlannerForm["budget"])}
                  className={cn(
                    "rounded-xl border p-4 text-center transition-all",
                    selected
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                      : "border-stone-200 hover:border-stone-300 hover:bg-stone-50 dark:border-white/10 dark:hover:bg-white/5"
                  )}
                >
                  <div className="text-2xl">{opt.emoji}</div>
                  <p className={cn("mt-1 text-sm font-medium", selected ? "text-amber-700 dark:text-amber-400" : "text-charcoal-950 dark:text-white")}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-charcoal-400 dark:text-stone-500">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interests */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-charcoal-900">
          <h2 className="mb-5 flex items-center gap-2 font-semibold text-charcoal-950 dark:text-white">
            <Heart className="h-5 w-5 text-amber-500" />
            What do you love? <span className="text-sm font-normal text-charcoal-400 dark:text-stone-500">Select all that apply</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const selected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-all",
                    selected
                      ? "border-amber-500 bg-amber-500 text-white"
                      : "border-stone-200 text-charcoal-600 hover:border-stone-300 hover:bg-stone-50 dark:border-white/10 dark:text-stone-400 dark:hover:bg-white/5"
                  )}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isGenerating}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-charcoal-950 px-8 py-5 text-base font-semibold text-white transition-all hover:bg-charcoal-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-950 focus-visible:ring-offset-2 active:bg-charcoal-900 active:text-white active:scale-[0.98] disabled:opacity-60 dark:bg-amber-500 dark:hover:bg-amber-600"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Crafting your perfect itinerary...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>Generate my itinerary</span>
            </>
          )}
        </button>
        <p className="text-center text-xs text-charcoal-400 dark:text-stone-500">
          Free for all users · Usually takes 5–10 seconds · Powered by Google Gemini
        </p>
      </form>
    </div>
  );
}
