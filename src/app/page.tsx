import { Hero } from "@/components/home/Hero";
import { FeaturedDestinations } from "@/components/home/FeaturedDestinations";
import { AIPlannerCTA } from "@/components/home/AIPlannerCTA";
import { Testimonials } from "@/components/home/Testimonials";
import { TrendingPackages } from "@/components/home/TrendingPackages";
import { WhyZyroTrip } from "@/components/home/WhyZyroTrip";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZyroTrip — Travel Further. Experience More.",
  description:
    "Discover extraordinary destinations, curate personalized itineraries, and book premium travel experiences with ZyroTrip. AI-powered travel planning for the modern explorer.",
};

export default function HomePage() {
  return (
    <>
      {/* 1. Cinematic Hero with Search */}
      <Hero />

      {/* 2. Featured Destinations */}
      <FeaturedDestinations />

      {/* 3. Why ZyroTrip — Value Props */}
      <WhyZyroTrip />

      {/* 4. Trending Packages */}
      <TrendingPackages />

      {/* 5. AI Planner CTA */}
      <AIPlannerCTA />

      {/* 6. Testimonials */}
      <Testimonials />
    </>
  );
}
