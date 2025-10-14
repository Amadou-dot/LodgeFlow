import { Resend } from 'resend';

import { BookingConfirmationEmail } from '@/components/EmailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: Request) {
  const { bookingData, cabinData, email, firstName } = await request.json();
  const emailValid = validateEmail(email);

  try {
    if (!emailValid) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (!bookingData || !cabinData) {
      return Response.json(
        { error: 'Missing booking or cabin data' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'LodgeFlow <onboarding@resend.dev>',
      react: BookingConfirmationEmail({
        bookingData,
        cabinData,
        firstName,
      }),
      subject: 'Booking Confirmation',
      to: `${email}`,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
