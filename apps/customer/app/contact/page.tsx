import ContactPageClient from '@/components/ContactPageClient';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Contact',
  description:
    'Contact LodgeFlow for questions about your stay, cabin reservations, dining, and experiences.',
  path: '/contact',
});

export default function ContactPage() {
  return <ContactPageClient />;
}
