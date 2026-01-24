import { Booking, connectDB } from '@/models';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  await connectDB();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      const isDeposit = session.metadata?.isDeposit === 'true';

      if (bookingId) {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
          break;
        }

        if (isDeposit && booking.depositPaid) {
          break;
        }

        if (!isDeposit && booking.isPaid) {
          break;
        }

        const updateData: Record<string, unknown> = {
          stripePaymentIntentId: session.payment_intent as string,
          paidAt: new Date(),
        };

        if (isDeposit) {
          updateData.depositPaid = true;
        } else {
          updateData.isPaid = true;
        }

        await Booking.findByIdAndUpdate(bookingId, updateData);
      }
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata?.bookingId;

      if (bookingId) {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
          break;
        }

        await Booking.findByIdAndUpdate(bookingId, {
          stripePaymentIntentId: paymentIntent.id,
        });
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;

      if (paymentIntentId) {
        const booking = await Booking.findOne({
          stripePaymentIntentId: paymentIntentId,
        });

        if (booking) {
          await Booking.findByIdAndUpdate(booking._id, {
            refundAmount: charge.amount_refunded / 100,
            refundedAt: new Date(),
          });
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
