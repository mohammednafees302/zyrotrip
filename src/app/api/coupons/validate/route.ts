import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { code, orderAmount } = await request.json() as { code: string; orderAmount: number };

    if (!code || !orderAmount) {
      return apiError("Missing code or orderAmount", "VALIDATION_ERROR", 400);
    }

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon || !coupon.active) {
      return apiError("Invalid or inactive coupon", "INVALID_COUPON", 400);
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return apiError("Coupon has expired", "EXPIRED_COUPON", 400);
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return apiError("Coupon usage limit reached", "LIMIT_REACHED", 400);
    }

    if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
      return apiError(`Minimum order amount is $${coupon.minOrderAmount}`, "MIN_ORDER_NOT_MET", 400);
    }

    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = orderAmount * (Number(coupon.value) / 100);
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    } else {
      discount = Number(coupon.value);
    }

    return apiResponse({
      valid: true,
      code: coupon.code,
      discount,
      type: coupon.type,
      message: `Coupon applied: -$${discount.toFixed(2)}`
    }, "Coupon is valid");

  } catch (error) {
    console.error("[COUPON_VALIDATE]", error);
    return apiError("Failed to validate coupon", "INTERNAL_ERROR", 500);
  }
}
