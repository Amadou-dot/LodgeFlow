import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import DiningDetailClient from '@/components/DiningDetailClient';
import { getDiningById } from '@/lib/data/catalog';
import { createPageMetadata, noIndexMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const dining = await getDiningById(id);
  if (!dining) notFound();

  const description = dining.description.slice(0, 160);
  // Preserve existing detail access while keeping unavailable items out of search.
  if (dining.isAvailable !== true) {
    return { ...noIndexMetadata, title: dining.name, description };
  }
  return createPageMetadata({
    title: dining.name,
    description,
    path: `/dining/${dining._id}`,
  });
}

export default async function DiningDetailPage({ params }: Props) {
  const { id } = await params;
  const dining = await getDiningById(id);
  if (!dining) notFound();
  return <DiningDetailClient initialDining={dining} />;
}
