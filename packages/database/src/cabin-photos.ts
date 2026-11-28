import { lakesideHavenPhotos } from './cabin-galleries/lakeside-haven';
import { pineValleyCabinPhotos } from './cabin-galleries/pine-valley-cabin';
import { sunsetRetreatPhotos } from './cabin-galleries/sunset-retreat';

export const cabinPhotoGalleries = {
  'Lakeside Haven': lakesideHavenPhotos,
  'Pine Valley Cabin': pineValleyCabinPhotos,
  'Sunset Retreat': sunsetRetreatPhotos,
} as const;

const photosBySrc = new Map<string, { src: string; alt: string }>();
for (const gallery of Object.values(cabinPhotoGalleries)) {
  for (const photo of gallery) photosBySrc.set(photo.src, photo);
}

export const bundledCabinPhotoPaths = Array.from(photosBySrc.keys());

/** Only listed first-party paths are valid alternatives to external image URLs. */
export function findBundledCabinPhoto(src: string) {
  return photosBySrc.get(src);
}

export function cabinGalleryImages(name: keyof typeof cabinPhotoGalleries) {
  const [cover, ...gallery] = cabinPhotoGalleries[name];
  return { image: cover.src, images: gallery.map(photo => photo.src) };
}
