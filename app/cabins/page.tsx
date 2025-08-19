'use client';
import CabinCard from '@/components/CabinCard';
import CabinFilters from '@/components/CabinFilters';
import { PageHeader } from '@/components/ui';
import { useCabins } from '@/hooks/useCabins';
import { Spinner } from '@heroui/spinner';
import { useEffect, useState } from 'react';

interface CabinsFilters {
  capacity?: number;
  minPrice?: number;
  maxPrice?: number;
}

export default function CabinsPage() {
  const [filters, setFilters] = useState<CabinsFilters>({});
  const { data: cabins, isLoading, error } = useCabins(filters);

  // Initialize filters from URL params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilters: CabinsFilters = {
      capacity: urlParams.get('capacity')
        ? parseInt(urlParams.get('capacity')!)
        : undefined,
      minPrice: urlParams.get('minPrice')
        ? parseInt(urlParams.get('minPrice')!)
        : undefined,
      maxPrice: urlParams.get('maxPrice')
        ? parseInt(urlParams.get('maxPrice')!)
        : undefined,
    };
    setFilters(initialFilters);
  }, []);

  const handleFiltersChange = (newFilters: CabinsFilters) => {
    setFilters(newFilters);
  };

  if (error) {
    return (
      <div className='flex justify-center items-center min-h-[50vh]'>
        <div className='text-center'>
          <h2 className='text-xl font-bold text-red-500 mb-2'>
            Error Loading Cabins
          </h2>
          <p className='text-default-500'>
            {error instanceof Error
              ? error.message
              : 'An error occurred while loading cabins'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto py-8'>
      {/* Header */}
      <div className='text-center mb-8'>
        <PageHeader
          title='Our'
          titleAccent='Cabins'
          subtitle='Discover our collection of beautiful cabins, each offering unique experiences in the heart of nature. From cozy retreats to spacious family accommodations.'
        />
      </div>

      {/* Filters */}
      <CabinFilters
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
      />

      {/* Loading State */}
      {isLoading && (
        <div className='flex flex-col justify-center items-center py-12 gap-4'>
          <Spinner size='lg' label='Loading cabins...' />
        </div>
      )}

      {/* Cabins Grid */}
      {!isLoading && cabins && (
        <>
          {cabins.length > 0 ? (
            <>
              <div className='mb-4'>
                <p className='text-default-600'>
                  {cabins.length} cabin{cabins.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {cabins.map(cabin => (
                  <CabinCard key={cabin._id} cabin={cabin} />
                ))}
              </div>
            </>
          ) : (
            <div className='text-center py-12'>
              <h3 className='text-xl font-semibold mb-2'>No cabins found</h3>
              <p className='text-default-500 mb-4'>
                Try adjusting your filters to see more options.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
