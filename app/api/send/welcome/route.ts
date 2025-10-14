import { Resend } from 'resend';

import { WelcomeEmail } from '@/components/EmailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email, firstName } = await request.json();

  try {
    const { data, error } = await resend.emails.send({
      from: 'LodgeFlow <onboarding@resend.dev>',
      react: WelcomeEmail({ firstName }),
      subject: 'Welcome to LodgeFlow',
      to: email,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
