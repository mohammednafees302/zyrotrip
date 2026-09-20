import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Unauthorized", "UNAUTHORIZED", 401);
    }
    const resolvedParams = await params;

    const booking = await db.booking.findUnique({
      where: { id: resolvedParams.id },
      include: {
        package: { select: { title: true, destination: { select: { name: true } } } },
        hotel: { select: { name: true, heroImage: true, destination: { select: { name: true } } } },
        travelers: true,
        payments: true,
        invoice: true
      }
    });

    if (!booking) {
      return apiError("Booking not found", "NOT_FOUND", 404);
    }

    if (booking.userId !== session.user.id && session.user.role !== "ADMIN") {
      return apiError("Forbidden", "FORBIDDEN", 403);
    }

    return apiResponse(booking, "Booking retrieved successfully");
  } catch (error) {
    console.error("[BOOKING_GET]", error);
    return apiError("Failed to fetch booking", "INTERNAL_ERROR", 500);
  }
}
