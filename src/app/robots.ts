import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://zyrotrip.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/profile", "/bookings", "/wishlist"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
