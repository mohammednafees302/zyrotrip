import type { Metadata } from "next";
import { AIPlannerInterface } from "@/components/ai/AIPlannerInterface";

export const metadata: Metadata = {
  title: "AI Travel Concierge | ZyroTrip",
  description:
    "Let ZyroTrip's AI create a personalized travel itinerary in seconds. Just tell us where you want to go and what you love.",
  openGraph: {
    title: "AI Travel Concierge | ZyroTrip",
    description:
      "Let ZyroTrip's AI create a personalized travel itinerary in seconds. Just tell us where you want to go and what you love.",
    url: "/ai-planner",
    siteName: "ZyroTrip",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Travel Concierge — ZyroTrip",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Travel Concierge | ZyroTrip",
    description:
      "Let ZyroTrip's AI create a personalized travel itinerary in seconds.",
    images: ["/og-image.jpg"],
  },
};

export default function AIPlannerPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-charcoal-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-charcoal-950 pt-24 pb-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
              ✨ Powered by Gemini AI
            </span>
          </div>
          <h1 className="font-display text-display-lg font-bold text-white">
            Your AI Travel Architect
          </h1>
          <p className="mt-4 max-w-xl text-stone-400">
            Describe your dream trip and our AI will craft a detailed, personalized
            itinerary with hotels, restaurants, activities, and budget breakdown.
          </p>
        </div>
      </div>

      {/* Main Interface */}
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 xl:px-16">
        <AIPlannerInterface />
      </div>
    </div>
  );
}
