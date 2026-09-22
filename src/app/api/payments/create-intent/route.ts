import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, amount, currency = 'usd' } = body;

    if (!bookingId || !amount) {
      return NextResponse.json(
        { success: false, message: 'bookingId and amount are required' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        bookingId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('[STRIPE] create-intent error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
