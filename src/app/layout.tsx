import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SkipNav } from "@/components/layout/SkipNav";

// ─── Fonts ──────────────────────────────────────────────────────────────────
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

// ─── Metadata ───────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://zyrotrip.com"),
  title: {
    default: "ZyroTrip — Travel Further. Experience More.",
    template: "%s | ZyroTrip",
  },
  description:
    "ZyroTrip is a premium travel discovery, planning, and booking platform. Discover extraordinary destinations, build curated itineraries, and travel with confidence.",
  keywords: [
    "travel",
    "travel planning",
    "luxury travel",
    "destinations",
    "travel packages",
    "hotels",
    "itinerary",
    "AI travel planner",
    "international travel",
  ],
  authors: [{ name: "ZyroTrip" }],
  creator: "ZyroTrip",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "ZyroTrip — Travel Further. Experience More.",
    description:
      "Discover extraordinary destinations, curate personalized itineraries, and book premium travel experiences with ZyroTrip.",
    siteName: "ZyroTrip",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ZyroTrip — Premium Travel Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZyroTrip — Travel Further. Experience More.",
    description:
      "Discover extraordinary destinations, curate personalized itineraries, and book premium travel experiences with ZyroTrip.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#141310" },
  ],
};

import { auth } from "@/lib/auth";
import { WebVitals } from "@/components/analytics/WebVitals";

// ─── Root Layout ─────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body className="font-sans antialiased">
        <SkipNav />
        <Providers>
          <WebVitals />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
