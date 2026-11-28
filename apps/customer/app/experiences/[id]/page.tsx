import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ExperienceDetailClient from '@/components/ExperienceDetailClient';
import { getExperienceById } from '@/lib/data/catalog';
import { createPageMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const experience = await getExperienceById(id);
  if (!experience) notFound();
  return createPageMetadata({
    title: experience.name,
    description: experience.description.slice(0, 160),
    path: `/experiences/${experience._id}`,
  });
}

export default async function ExperiencePage({ params }: Props) {
  const { id } = await params;
  const experience = await getExperienceById(id);
  if (!experience) notFound();
  return <ExperienceDetailClient initialExperience={experience} />;
}
