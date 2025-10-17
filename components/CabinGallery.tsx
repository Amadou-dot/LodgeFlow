'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';

interface CabinGalleryProps {
  images: string[];
}

export default function CabinGallery({ images }: CabinGalleryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 420; // Slightly more than image width to show next image
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      e.preventDefault();
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };
  // Use 3 images for mock gallery
  const galleryImages = [
    '/sarah_linden.png',
    '/david_lee.png',
    '/michael_rowan.png',
    '/sophia_patel.png',
    '/emily_wren.png',
    '/james_smith.png',
  ];

  return (
    <div className="w-full mb-8 relative group">
      {/* Left Arrow */}
      <button
        aria-label="Scroll left"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="w-6 h-6 text-gray-800" />
      </button>

      {/* Right Arrow */}
      <button
        aria-label="Scroll right"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="w-6 h-6 text-gray-800" />
      </button>

      {/* Scroll Indicator - visible on mobile */}
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/80 to-transparent pointer-events-none z-[5] md:hidden" />
      
      {/* Scroll hint text - visible on mobile */}
      <div className="absolute bottom-6 right-4 z-[5] md:hidden">
        <div className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 animate-pulse">
          <span>Swipe</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mr-4 pr-4 md:mr-0 md:pr-0"
        onWheel={handleWheel}
      >
        {galleryImages.map((src, idx) => (
          <div key={idx} className="relative flex-none w-[80vw] md:w-[400px] aspect-video rounded-lg overflow-hidden shadow snap-center">
            <Image
              alt={`Cabin image ${idx + 1}`}
              className="object-cover"
              fill
              priority={idx === 0}
              sizes="(max-width: 768px) 80vw, 400px"
              src={src}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
