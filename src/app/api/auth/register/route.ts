import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";

const registerSchema = z.object({
  firstName: z.string().min(2).max(50).trim(),
  lastName: z.string().min(2).max(50).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json() as unknown;
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return apiError(firstError?.message ?? "Invalid input", "VALIDATION_ERROR", 400);
    }

    const { firstName, lastName, email, password } = parsed.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return apiError("An account with this email already exists.", "EMAIL_EXISTS", 409);
    }

    // Hash password with bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        passwordHash,
        // Create wishlist for new user
        wishlist: { create: {} },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Audit log
    await db.auditLog
      .create({
        data: {
          userId: user.id,
          action: "USER_REGISTERED",
          entity: "User",
          entityId: user.id,
        },
      })
      .catch(() => undefined);

    return apiResponse({ userId: user.id }, "Account created successfully", 201);
  } catch (error) {
    console.error("[AUTH_REGISTER]", error);
    return apiError("Registration failed. Please try again.", "REGISTRATION_ERROR", 500);
  }
}
