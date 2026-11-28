import ExperiencesPageClient from '@/components/ExperiencesPageClient';
import { getExperiencesForListing } from '@/lib/data/catalog';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Experiences',
  description:
    'Discover LodgeFlow outdoor adventures, guided activities, and relaxing experiences in nature.',
  path: '/experiences',
});

export default async function ExperiencesPage() {
  const experiences = await getExperiencesForListing();
  return <ExperiencesPageClient initialExperiences={experiences} />;
}
