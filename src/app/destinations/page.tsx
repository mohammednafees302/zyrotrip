import { Suspense } from "react";
import type { Metadata } from "next";
import { DestinationsGrid } from "@/components/destination/DestinationsGrid";
import { DestinationsFilters } from "@/components/destination/DestinationsFilters";
import { DestinationsHero } from "@/components/destination/DestinationsHero";

export const metadata: Metadata = {
  title: "Destinations | ZyroTrip",
  description:
    "Explore 100+ handpicked destinations across every continent. Filter by category, budget, or travel style to find your perfect journey.",
  openGraph: {
    title: "Destinations | ZyroTrip",
    description:
      "Explore 100+ handpicked destinations across every continent. Filter by category, budget, or travel style to find your perfect journey.",
    url: "/destinations",
    siteName: "ZyroTrip",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Explore World Destinations — ZyroTrip",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Destinations | ZyroTrip",
    description:
      "Explore 100+ handpicked destinations across every continent. Filter by category, budget, or travel style.",
    images: ["/og-image.jpg"],
  },
};

interface DestinationsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    country?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function DestinationsPage({ searchParams }: DestinationsPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-charcoal-950">
      {/* Page Hero */}
      <DestinationsHero />

      {/* Content */}
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 xl:px-16">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className="w-full shrink-0 lg:w-72 xl:w-80">
            <DestinationsFilters searchParams={params} />
          </aside>

          {/* Main Grid */}
          <main className="min-w-0 flex-1">
            <Suspense fallback={<DestinationsGridSkeleton />}>
              <DestinationsGrid searchParams={params} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

function DestinationsGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl">
          <div className="skeleton aspect-[3/4]" />
          <div className="mt-3 space-y-2 p-1">
            <div className="skeleton h-4 w-1/3 rounded" />
            <div className="skeleton h-5 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
