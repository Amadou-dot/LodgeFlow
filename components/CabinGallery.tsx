import Image from 'next/image';

interface CabinGalleryProps {
  images: string[];
}

export default function CabinGallery({ images }: CabinGalleryProps) {
  // Use 3 images for mock gallery
  const galleryImages =  [
    '/sarah_linden.png',
    '/david_lee.png',
    '/michael_rowan.png',
    '/sophia_patel.png',
    '/emily_wren.png',
    '/james_smith.png',
  ];

  return (
    <div className="w-full mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {galleryImages.map((src, idx) => (
          <div key={idx} className="relative aspect-video rounded-lg overflow-hidden shadow">
                <Image
                  alt={`Cabin image ${idx + 1}`}
                  className="object-cover"
                  fill
                  priority={idx === 0}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  src={src}
                />
          </div>
        ))}
      </div>
    </div>
  );
}
