import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    if (!endpointSecret) {
      throw new Error("Missing STRIPE_WEBHOOK_SECRET");
    }
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.bookingId;

        if (bookingId) {
          await db.$transaction(async (tx) => {
            await tx.payment.updateMany({
              where: { bookingId },
              data: {
                status: "COMPLETED",
                providerPaymentId: paymentIntent.id,
              },
            });

            await tx.booking.update({
              where: { id: bookingId },
              data: { status: "CONFIRMED" },
            });
            
            // Optionally, we could send a success email here.
          });
          console.log(`Booking ${bookingId} confirmed via Stripe webhook.`);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.bookingId;

        if (bookingId) {
          await db.$transaction(async (tx) => {
            await tx.payment.updateMany({
              where: { bookingId },
              data: {
                status: "FAILED",
                providerPaymentId: paymentIntent.id,
              },
            });

            await tx.booking.update({
              where: { id: bookingId },
              data: { status: "CANCELLED" },
            });
          });
          console.log(`Booking ${bookingId} payment failed.`);
        }
        break;
      }
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (err: any) {
    console.error(`Webhook processing failed: ${err.message}`);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
