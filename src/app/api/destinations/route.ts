import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { Prisma } from "@prisma/client";

// ─── Validation ───────────────────────────────────────────────────────────────

const querySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  country: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z
    .enum(["rating", "priceAsc", "priceDesc", "newest", "trending", "featured"])
    .optional()
    .default("rating"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(48).optional().default(12),
});

// ─── GET /api/destinations ────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const parsed = querySchema.safeParse({
      q: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      country: searchParams.get("country") ?? undefined,
      minPrice: searchParams.get("minPrice") ?? undefined,
      maxPrice: searchParams.get("maxPrice") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return apiError(
        "Invalid query parameters",
        "VALIDATION_ERROR",
        400
      );
    }

    const { q, category, country, minPrice, maxPrice, sort, page, limit } = parsed.data;

    // ── Build where clause ──────────────────────────────────────────
    const where: Prisma.DestinationWhereInput = {
      published: true,
      deletedAt: null,
    };

    // Text search on name and description
    if (q && q.trim().length > 0) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { tagline: { contains: q } },
      ];
    }

    // Category filter (by slug)
    if (category) {
      where.categories = {
        some: { slug: { equals: category } },
      };
    }

    // Country filter (by code or name)
    if (country) {
      where.country = {
        OR: [
          { code: { equals: country.toUpperCase() } },
          { name: { contains: country } },
        ],
      };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.priceFrom = {};
      if (minPrice !== undefined) where.priceFrom.gte = minPrice;
      if (maxPrice !== undefined) where.priceFrom.lte = maxPrice;
    }

    // ── Build orderBy ───────────────────────────────────────────────
    type OrderBy = Prisma.DestinationOrderByWithRelationInput | Prisma.DestinationOrderByWithRelationInput[];
    const orderByMap: Record<string, OrderBy> = {
      rating: { rating: "desc" },
      priceAsc: { priceFrom: "asc" },
      priceDesc: { priceFrom: "desc" },
      newest: { createdAt: "desc" },
      trending: [{ trending: "desc" }, { rating: "desc" }],
      featured: [{ featured: "desc" }, { rating: "desc" }],
    };
    const orderBy = orderByMap[sort] ?? { rating: "desc" };

    // ── Pagination ──────────────────────────────────────────────────
    const skip = (page - 1) * limit;

    // ── Query ───────────────────────────────────────────────────────
    const [destinations, total] = await Promise.all([
      db.destination.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          name: true,
          tagline: true,
          description: true,
          heroImage: true,
          priceFrom: true,
          currency: true,
          rating: true,
          reviewCount: true,
          bestTimeToVisit: true,
          featured: true,
          trending: true,
          seasonal: true,
          createdAt: true,
          country: {
            select: { id: true, name: true, code: true, flagUrl: true },
          },
          region: {
            select: { id: true, name: true },
          },
          categories: {
            select: { id: true, name: true, slug: true, icon: true },
          },
        },
      }),
      db.destination.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return apiResponse(
      { destinations, total, page, totalPages },
      "Destinations fetched successfully"
    );
  } catch (error) {
    console.error("[GET /api/destinations]", error);
    return apiError("Failed to fetch destinations", "INTERNAL_ERROR", 500);
  }
}
