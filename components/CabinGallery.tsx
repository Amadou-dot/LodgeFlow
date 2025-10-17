'use client';

import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface CabinGalleryProps {
  images: string[];
}

export default function CabinGallery({ images }: CabinGalleryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const scrollToNext = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 420;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      // If at the end, loop back to start
      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      } else {
        container.scrollTo({
          left: container.scrollLeft + scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      e.preventDefault();
      scrollContainerRef.current.scrollLeft += e.deltaY;
      // Pause auto-scroll on manual interaction
      setIsAutoScrolling(false);
    }
  };

  const handleManualScroll = () => {
    // Pause auto-scroll when user manually scrolls
    setIsAutoScrolling(false);
  };

  const toggleAutoScroll = () => {
    setIsAutoScrolling(!isAutoScrolling);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (isAutoScrolling) {
      autoScrollIntervalRef.current = setInterval(() => {
        scrollToNext();
      }, 3000); // Auto-scroll every 3 seconds
    } else {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    }

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [isAutoScrolling]);
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
        onClick={() => {
          scroll('left');
          setIsAutoScrolling(false);
        }}
      >
        <ChevronLeft className="w-6 h-6 text-gray-800" />
      </button>

      {/* Right Arrow */}
      <button
        aria-label="Scroll right"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
        onClick={() => {
          scroll('right');
          setIsAutoScrolling(false);
        }}
      >
        <ChevronRight className="w-6 h-6 text-gray-800" />
      </button>

      {/* Auto-scroll toggle button */}
      <button
        aria-label={isAutoScrolling ? 'Pause auto-scroll' : 'Resume auto-scroll'}
        className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 cursor-pointer"
        onClick={toggleAutoScroll}
      >
        {isAutoScrolling ? (
          <Pause className="w-4 h-4 text-gray-800" />
        ) : (
          <Play className="w-4 h-4 text-gray-800" />
        )}
      </button>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mr-4 pr-4 md:mr-0 md:pr-0"
        onTouchStart={handleManualScroll}
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
