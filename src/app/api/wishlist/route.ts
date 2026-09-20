import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";
import type {  } from "@prisma/client";

// Force dynamic — requires session
export const dynamic = "force-dynamic";

// ─── GET /api/wishlist ────────────────────────────────────────────────────────

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return apiError("Authentication required", "UNAUTHORIZED", 401);
    }

    const wishlist = await db.wishlist.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          orderBy: { createdAt: "desc" },
          include: {
            destination: {
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
            },
            package: {
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
            },
            hotel: {
              select: {
                id: true,
                slug: true,
                name: true,
                stars: true,
                heroImage: true,
                priceFrom: true,
                currency: true,
                rating: true,
                destination: { select: { name: true, slug: true } },
              },
            },
            experience: {
              select: {
                id: true,
                slug: true,
                name: true,
                duration: true,
                price: true,
                currency: true,
                category: true,
                heroImage: true,
                rating: true,
                destination: { select: { name: true, slug: true } },
              },
            },
          },
        },
      },
    });

    // Return empty wishlist structure if user has none yet
    if (!wishlist) {
      return apiResponse(
        { id: null, userId: session.user.id, items: [], createdAt: null, updatedAt: null },
        "Wishlist retrieved"
      );
    }

    return apiResponse(wishlist, "Wishlist retrieved successfully");
  } catch (error) {
    console.error("[GET /api/wishlist]", error);
    return apiError("Failed to fetch wishlist", "INTERNAL_ERROR", 500);
  }
}

// ─── POST /api/wishlist ───────────────────────────────────────────────────────

const addItemSchema = z.object({
  type: z.enum(["DESTINATION", "HOTEL", "PACKAGE", "EXPERIENCE"] as const),
  itemId: z.string().min(1, "Item ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return apiError("Authentication required", "UNAUTHORIZED", 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", "BAD_REQUEST", 400);
    }

    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        parsed.error.errors[0]?.message ?? "Invalid request body",
        "VALIDATION_ERROR",
        400
      );
    }

    const { type, itemId } = parsed.data;

    // ── Ensure wishlist exists (upsert pattern) ─────────────────────
    const wishlist = await db.wishlist.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
    });

    // ─── Check if it exists ───
    const uniqueWhere = buildUniqueWhere(wishlist.id, type, itemId);
    const existingItem = await db.wishlistItem.findUnique({
      where: uniqueWhere,
    });

    if (existingItem) {
      // Remove it
      await db.wishlistItem.delete({
        where: { id: existingItem.id },
      });
      return apiResponse(
        { wishlistId: wishlist.id, isSaved: false },
        "Item removed from wishlist",
        200
      );
    } else {
      // Add it
      const itemData = buildWishlistItemData(type, itemId);
      const item = await db.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          type,
          ...itemData,
        },
      });

      return apiResponse(
        { wishlistId: wishlist.id, item, isSaved: true },
        "Item added to wishlist",
        201
      );
    }
  } catch (error) {
    console.error("[POST /api/wishlist]", error);
    return apiError("Failed to add item to wishlist", "INTERNAL_ERROR", 500);
  }
}

// ─── DELETE /api/wishlist ─────────────────────────────────────────────────────

const removeItemSchema = z.object({
  wishlistItemId: z.string().min(1, "Wishlist item ID is required"),
});

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return apiError("Authentication required", "UNAUTHORIZED", 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", "BAD_REQUEST", 400);
    }

    const parsed = removeItemSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        parsed.error.errors[0]?.message ?? "Invalid request body",
        "VALIDATION_ERROR",
        400
      );
    }

    const { wishlistItemId } = parsed.data;

    // ── Verify ownership ────────────────────────────────────────────
    const wishlistItem = await db.wishlistItem.findUnique({
      where: { id: wishlistItemId },
      include: { wishlist: { select: { userId: true } } },
    });

    if (!wishlistItem) {
      return apiError("Wishlist item not found", "NOT_FOUND", 404);
    }

    if (wishlistItem.wishlist.userId !== session.user.id) {
      return apiError("You do not own this wishlist item", "FORBIDDEN", 403);
    }

    // ── Delete the item ─────────────────────────────────────────────
    await db.wishlistItem.delete({ where: { id: wishlistItemId } });

    return apiResponse({ wishlistItemId }, "Item removed from wishlist");
  } catch (error) {
    console.error("[DELETE /api/wishlist]", error);
    return apiError("Failed to remove item from wishlist", "INTERNAL_ERROR", 500);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildWishlistItemData(
  type: "DESTINATION" | "HOTEL" | "PACKAGE" | "EXPERIENCE",
  itemId: string
): Record<string, string> {
  switch (type) {
    case "DESTINATION":
      return { destinationId: itemId };
    case "HOTEL":
      return { hotelId: itemId };
    case "PACKAGE":
      return { packageId: itemId };
    case "EXPERIENCE":
      return { experienceId: itemId };
  }
}

function buildUniqueWhere(
  wishlistId: string,
  type: "DESTINATION" | "HOTEL" | "PACKAGE" | "EXPERIENCE",
  itemId: string
) {
  switch (type) {
    case "DESTINATION":
      return { wishlistId_destinationId: { wishlistId, destinationId: itemId } };
    case "HOTEL":
      return { wishlistId_hotelId: { wishlistId, hotelId: itemId } };
    case "PACKAGE":
      return { wishlistId_packageId: { wishlistId, packageId: itemId } };
    case "EXPERIENCE":
      return { wishlistId_experienceId: { wishlistId, experienceId: itemId } };
  }
}
