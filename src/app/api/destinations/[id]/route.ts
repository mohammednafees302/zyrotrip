import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";

// ─── GET /api/destinations/[id] ───────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try fetching by id first, then fall back to slug
    const destination = await db.destination.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        published: true,
        deletedAt: null,
      },
      include: {
        country: true,
        region: true,
        categories: true,
        images: {
          orderBy: { order: "asc" },
        },
        hotels: {
          where: { published: true, deletedAt: null },
          orderBy: { rating: "desc" },
          include: {
            images: {
              orderBy: { order: "asc" },
              take: 3,
            },
          },
        },
        packages: {
          where: { published: true, deletedAt: null },
          orderBy: { rating: "desc" },
          include: {
            images: {
              orderBy: { order: "asc" },
              take: 3,
            },
          },
        },
        experiences: {
          where: { published: true },
          orderBy: { rating: "desc" },
        },
        reviews: {
          where: { published: true },
          orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        weatherCache: {
          where: { expiresAt: { gt: new Date() } },
          take: 1,
        },
      },
    });

    if (!destination) {
      return apiError("Destination not found", "NOT_FOUND", 404);
    }

    return apiResponse(destination, "Destination fetched successfully");
  } catch (error) {
    console.error("[GET /api/destinations/[id]]", error);
    return apiError("Failed to fetch destination", "INTERNAL_ERROR", 500);
  }
}
