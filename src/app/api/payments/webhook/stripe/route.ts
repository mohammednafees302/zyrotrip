import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Initialize Stripe (optional: only if env var is present to avoid crashing if user hasn't set it)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" }) 
  : null;

export async function POST(req: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    // If Stripe is not configured, we just return 200 to acknowledge but do nothing
    return NextResponse.json({ message: "Stripe not configured" }, { status: 200 });
  }

  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`[STRIPE_WEBHOOK] Signature validation failed: ${err.message}`);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata.bookingId;

        if (bookingId) {
          // Update Payment status
          await db.payment.updateMany({
            where: { bookingId, provider: "STRIPE" },
            data: { 
              status: "SUCCESS",
              providerPaymentId: paymentIntent.id,
              webhookVerified: true
            }
          });

          // Update Booking status
          await db.booking.update({
            where: { id: bookingId },
            data: { status: "CONFIRMED" }
          });

          // Create notification for user
          const booking = await db.booking.findUnique({ where: { id: bookingId } });
          if (booking) {
            await db.notification.create({
              data: {
                userId: booking.userId,
                type: "PAYMENT_SUCCESS",
                title: "Payment Successful",
                body: `Your payment for booking ${booking.reference} was successful.`,
                actionUrl: `/profile/bookings/${booking.id}`
              }
            });
          }
        }
        break;
      }
      
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata.bookingId;

        if (bookingId) {
          await db.payment.updateMany({
            where: { bookingId, provider: "STRIPE" },
            data: { 
              status: "FAILED",
              failureReason: paymentIntent.last_payment_error?.message || "Payment failed",
              providerPaymentId: paymentIntent.id
            }
          });

          const booking = await db.booking.findUnique({ where: { id: bookingId } });
          if (booking) {
            await db.notification.create({
              data: {
                userId: booking.userId,
                type: "PAYMENT_FAILED",
                title: "Payment Failed",
                body: `We couldn't process the payment for booking ${booking.reference}. Please try again.`,
                actionUrl: `/book/payment/${booking.id}`
              }
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_HANDLER]", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
