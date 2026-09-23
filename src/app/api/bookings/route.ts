import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiResponse, apiError, generateBookingReference, generateInvoiceNumber } from "@/lib/utils";
import { stripe } from "@/lib/stripe";
import { Resend } from "resend";
import { render } from "@react-email/render";
import BookingConfirmation from "@/emails/BookingConfirmation";

const bookingSchema = z.object({
  packageId: z.string().optional(),
  hotelId: z.string().optional(),
  checkIn: z.string(),
  checkOut: z.string(),
  adults: z.number().min(1).max(20),
  children: z.number().min(0).max(20),
  infants: z.number().min(0).max(10),
  specialRequests: z.string().optional(),
  travelers: z.array(z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dateOfBirth: z.string().optional(),
    passportNumber: z.string().optional(),
    nationality: z.string().optional(),
    isLead: z.boolean().default(false)
  })).min(1),
  couponCode: z.string().optional(),
  totalAmount: z.number(),
  extras: z.array(z.string()).optional()
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const body = await request.json() as unknown;
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input", "VALIDATION_ERROR", 400);
    }

    const data = parsed.data;

    if (!data.packageId && !data.hotelId) {
      return apiError("Either packageId or hotelId must be provided", "VALIDATION_ERROR", 400);
    }

    let basePrice = 0;
    let packageName = "";
    let destinationName = "";
    if (data.packageId) {
      const pkg = await db.travelPackage.findUnique({ 
        where: { id: data.packageId },
        include: { destination: true }
      });
      if (!pkg) return apiError("Package not found", "NOT_FOUND", 404);
      basePrice = Number(pkg.priceDiscount || pkg.priceFrom) * data.adults; 
      packageName = pkg.title;
      destinationName = pkg.destination.name;
    } else if (data.hotelId) {
      const hotel = await db.hotel.findUnique({ 
        where: { id: data.hotelId },
        include: { destination: true }
      });
      if (!hotel) return apiError("Hotel not found", "NOT_FOUND", 404);
      // Simplified nights calculation
      const nights = Math.max(1, Math.ceil((new Date(data.checkOut).getTime() - new Date(data.checkIn).getTime()) / (1000 * 60 * 60 * 24)));
      basePrice = Number(hotel.priceFrom) * nights;
      packageName = hotel.name;
      destinationName = hotel.destination.name;
    }

    let discount = 0;
    let couponId: string | undefined;

    if (data.couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: data.couponCode } });
      if (coupon && coupon.active && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
          couponId = coupon.id;
          if (coupon.type === "PERCENTAGE") {
            discount = basePrice * (Number(coupon.value) / 100);
            if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
              discount = Number(coupon.maxDiscount);
            }
          } else {
            discount = Number(coupon.value);
          }
        }
      }
    }

    const finalAmount = Math.max(0, basePrice - discount);
    const bookingRef = generateBookingReference();

    const result = await db.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          reference: bookingRef,
          userId: session.user.id,
          packageId: data.packageId,
          hotelId: data.hotelId,
          status: "PENDING",
          checkIn: new Date(data.checkIn),
          checkOut: new Date(data.checkOut),
          adults: data.adults,
          children: data.children,
          infants: data.infants,
          totalAmount: basePrice,
          discountAmount: discount,
          finalAmount: finalAmount,
          specialRequests: data.specialRequests,
          travelers: {
            create: data.travelers.map(t => ({
              firstName: t.firstName,
              lastName: t.lastName,
              dateOfBirth: t.dateOfBirth ? new Date(t.dateOfBirth) : null,
              passportNumber: t.passportNumber,
              nationality: t.nationality,
              isLead: t.isLead
            }))
          }
        }
      });

      if (couponId) {
        await tx.couponUsage.create({
          data: {
            couponId,
            userId: session.user.id,
            bookingId: booking.id,
            discountAmount: discount
          }
        });
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } }
        });
      }

      await tx.invoice.create({
        data: {
          bookingId: booking.id,
          invoiceNumber: generateInvoiceNumber(Math.floor(Math.random() * 100000)),
          subtotal: basePrice,
          discount: discount,
          total: finalAmount,
          items: JSON.stringify([
            { description: "Base Fare", amount: basePrice }
          ])
        }
      });

      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          provider: "STRIPE",
          amount: finalAmount,
          status: "PENDING"
        }
      });

      return { booking, payment };
    });

    if (process.env.RESEND_API_KEY && session.user.email) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const html = await render(
          BookingConfirmation({
            customerName: session.user.name || "Valued Customer",
            packageName: packageName,
            destinationName: destinationName,
            startDate: new Date(data.checkIn),
            endDate: new Date(data.checkOut),
            totalPrice: finalAmount,
            bookingId: bookingRef,
          })
        );
        
        await resend.emails.send({
          from: "ZyroTrip <bookings@zyrotrip.com>",
          to: session.user.email,
          subject: `Your ZyroTrip Booking Confirmation: ${destinationName}`,
          html: html,
        });
      } catch (emailError) {
        console.error("[BOOKING_EMAIL_ERROR]", emailError);
      }
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100),
      currency: "usd",
      metadata: {
        bookingId: result.booking.id,
        bookingReference: result.booking.reference,
        userId: session.user.id,
      },
    });

    return apiResponse({
      bookingId: result.booking.id,
      reference: result.booking.reference,
      paymentId: result.payment.id,
      clientSecret: paymentIntent.client_secret,
    }, "Booking created successfully", 201);
    
  } catch (error) {
    console.error("[BOOKING_CREATE]", error);
    return apiError("Failed to create booking", "INTERNAL_ERROR", 500);
  }
}
