import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://zyrotrip.vercel.app";

  // ─── Static Routes ────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/destinations`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/packages`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hotels`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ai-planner`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // ─── Dynamic Routes ───────────────────────────────────────────────────────
  try {
    const [destinations, packages, hotels] = await Promise.all([
      db.destination.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      db.travelPackage.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      db.hotel.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const destinationRoutes: MetadataRoute.Sitemap = destinations.map((d) => ({
      url: `${baseUrl}/destinations/${d.slug}`,
      lastModified: d.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const packageRoutes: MetadataRoute.Sitemap = packages.map((p) => ({
      url: `${baseUrl}/packages/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const hotelRoutes: MetadataRoute.Sitemap = hotels.map((h) => ({
      url: `${baseUrl}/hotels/${h.slug}`,
      lastModified: h.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [
      ...staticRoutes,
      ...destinationRoutes,
      ...packageRoutes,
      ...hotelRoutes,
    ];
  } catch {
    // If DB is unreachable at build time, return static routes only
    return staticRoutes;
  }
}
