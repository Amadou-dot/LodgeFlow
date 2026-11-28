import { alpineSanctuaryPhotos } from './cabin-galleries/alpine-sanctuary';
import { canyonEdgeLodgePhotos } from './cabin-galleries/canyon-edge-lodge';
import { desertRoseVillaPhotos } from './cabin-galleries/desert-rose-villa';
import { forestEdgeCabinPhotos } from './cabin-galleries/forest-edge-cabin';
import { glacierViewChaletPhotos } from './cabin-galleries/glacier-view-chalet';
import { lakesideHavenPhotos } from './cabin-galleries/lakeside-haven';
import { meadowBrookCottagePhotos } from './cabin-galleries/meadow-brook-cottage';
import { pineValleyCabinPhotos } from './cabin-galleries/pine-valley-cabin';
import { riversideEscapePhotos } from './cabin-galleries/riverside-escape';
import { sunsetRetreatPhotos } from './cabin-galleries/sunset-retreat';
import { treetopHideawayPhotos } from './cabin-galleries/treetop-hideaway';
import { zenGardenRetreatPhotos } from './cabin-galleries/zen-garden-retreat';

export const cabinPhotoGalleries = {
  'Alpine Sanctuary': alpineSanctuaryPhotos,
  'Canyon Edge Lodge': canyonEdgeLodgePhotos,
  'Desert Rose Villa': desertRoseVillaPhotos,
  'Forest Edge Cabin': forestEdgeCabinPhotos,
  'Glacier View Chalet': glacierViewChaletPhotos,
  'Lakeside Haven': lakesideHavenPhotos,
  'Meadow Brook Cottage': meadowBrookCottagePhotos,
  'Pine Valley Cabin': pineValleyCabinPhotos,
  'Riverside Escape': riversideEscapePhotos,
  'Sunset Retreat': sunsetRetreatPhotos,
  'Treetop Hideaway': treetopHideawayPhotos,
  'Zen Garden Retreat': zenGardenRetreatPhotos,
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
