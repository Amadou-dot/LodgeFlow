import DiningPageClient from '@/components/DiningPageClient';
import { getDiningForListing } from '@/lib/data/catalog';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Dining',
  description:
    'Explore LodgeFlow dining, seasonal menus, and culinary experiences prepared with local ingredients.',
  path: '/dining',
});

export default async function DiningPage() {
  const dining = await getDiningForListing();
  return <DiningPageClient initialDining={dining} />;
}
