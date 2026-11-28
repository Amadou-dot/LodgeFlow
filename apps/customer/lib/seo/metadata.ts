import type { Metadata } from 'next';

import { siteConfig } from '@/config/site';

/** URL identity belongs to a public page, never to its shared layout. */
export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: path,
      siteName: siteConfig.name,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
      title,
      description,
    },
  };
}

export const noIndexMetadata: Metadata = {
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};
