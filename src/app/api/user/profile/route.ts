import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  preferredCurrency: z.string(),
  preferredLanguage: z.string(),
  newsletterOptIn: z.boolean()
});

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const body = await request.json() as unknown;
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Invalid input", "VALIDATION_ERROR", 400);
    }

    const data = parsed.data;

    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        phone: data.phone,
        preferredCurrency: data.preferredCurrency,
        preferredLanguage: data.preferredLanguage,
        newsletterOptIn: data.newsletterOptIn
      },
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    });

    return apiResponse(user, "Profile updated successfully");
  } catch (error) {
    console.error("[USER_PROFILE_PUT]", error);
    return apiError("Failed to update profile", "INTERNAL_ERROR", 500);
  }
}
