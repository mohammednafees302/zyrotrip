import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Cache results for 60 seconds — search results are reused frequently
export const revalidate = 60;

// ─── Validation ───────────────────────────────────────────────────────────────

const querySchema = z.object({
  q: z.string().min(2, "Query must be at least 2 characters"),
  type: z
    .enum(["destinations", "packages", "hotels", "experiences", "all"])
    .optional()
    .default("all"),
  limit: z.coerce.number().int().min(1).max(20).optional().default(5),
});

// ─── GET /api/search ──────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const rawQ = searchParams.get("q");

    // Validate q is present and long enough
    if (!rawQ || rawQ.trim().length < 2) {
      return apiError(
        "Search query must be at least 2 characters",
        "QUERY_TOO_SHORT",
        400
      );
    }

    const parsed = querySchema.safeParse({
      q: rawQ,
      type: searchParams.get("type") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return apiError(
        parsed.error.errors[0]?.message ?? "Invalid query parameters",
        "VALIDATION_ERROR",
        400
      );
    }

    const { q, type, limit } = parsed.data;

    const searchAll = type === "all";

    // ── Run searches in parallel ────────────────────────────────────
    const [destinations, packages, hotels, experiences] = await Promise.all([
      // Destinations
      searchAll || type === "destinations"
        ? db.destination.findMany({
            where: {
              published: true,
              deletedAt: null,
              OR: [
                { name: { contains: q,  } },
                { description: { contains: q,  } },
                { tagline: { contains: q,  } },
              ],
            },
            take: limit,
            select: {
              id: true,
              slug: true,
              name: true,
              tagline: true,
              heroImage: true,
              rating: true,
              priceFrom: true,
              currency: true,
              country: { select: { name: true, code: true } },
            },
            orderBy: { rating: "desc" },
          })
        : [],

      // Packages
      searchAll || type === "packages"
        ? db.travelPackage.findMany({
            where: {
              published: true,
              deletedAt: null,
              OR: [
                { title: { contains: q,  } },
                { description: { contains: q,  } },
              ],
            },
            take: limit,
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              duration: true,
              priceFrom: true,
              currency: true,
              rating: true,
              category: true,
              destination: { select: { name: true, slug: true } },
            },
            orderBy: { rating: "desc" },
          })
        : [],

      // Hotels
      searchAll || type === "hotels"
        ? db.hotel.findMany({
            where: {
              published: true,
              deletedAt: null,
              OR: [
                { name: { contains: q,  } },
                { description: { contains: q,  } },
              ],
            },
            take: limit,
            select: {
              id: true,
              slug: true,
              name: true,
              description: true,
              stars: true,
              heroImage: true,
              priceFrom: true,
              currency: true,
              rating: true,
              destination: { select: { name: true, slug: true } },
            },
            orderBy: { rating: "desc" },
          })
        : [],

      // Experiences
      searchAll || type === "experiences"
        ? db.experience.findMany({
            where: {
              published: true,
              OR: [
                { name: { contains: q,  } },
                { description: { contains: q,  } },
              ],
            },
            take: limit,
            select: {
              id: true,
              slug: true,
              name: true,
              description: true,
              duration: true,
              price: true,
              currency: true,
              category: true,
              heroImage: true,
              rating: true,
              destination: { select: { name: true, slug: true } },
            },
            orderBy: { rating: "desc" },
          })
        : [],
    ]);

    const total =
      destinations.length + packages.length + hotels.length + experiences.length;

    return apiResponse(
      {
        destinations,
        packages,
        hotels,
        experiences,
        total,
      },
      `Found ${total} result${total !== 1 ? "s" : ""} for "${q}"`
    );
  } catch (error) {
    console.error("[GET /api/search]", error);
    return apiError("Search failed", "INTERNAL_ERROR", 500);
  }
}
