'use client';

import { Card, CardBody, CardHeader } from '@heroui/card';
import { Skeleton } from '@heroui/skeleton';
import CabinCard from '@/components/CabinCard';
import { useCabins } from '@/hooks/useCabins';

interface CabinSimilarProps {
  capacity: number;
  currentCabinId: string;
}

function LoadingSkeleton() {
  return (
    <div className='flex gap-4 overflow-x-auto lg:grid lg:grid-cols-4 lg:overflow-visible'>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className='w-64 shrink-0 lg:w-full'>
          <CardHeader className='pb-0 pt-2 px-4 flex-col items-start'>
            <Skeleton className='h-48 w-full rounded-lg' />
          </CardHeader>
          <CardBody className='space-y-3 py-2'>
            <Skeleton className='h-5 w-3/4 rounded-lg' />
            <Skeleton className='h-4 w-full rounded-lg' />
            <Skeleton className='h-4 w-2/3 rounded-lg' />
            <Skeleton className='h-8 w-full rounded-lg' />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export default function CabinSimilar({
  capacity,
  currentCabinId,
}: CabinSimilarProps) {
  const { data: cabins, isLoading } = useCabins({
    capacity: Math.max(1, capacity - 1),
  });

  const similarCabins = (cabins ?? [])
    .filter(cabin => cabin._id.toString() !== currentCabinId)
    .slice(0, 4);

  return (
    <div>
      <h2 className='mb-4 text-xl font-semibold'>Similar Cabins</h2>

      {isLoading ? (
        <LoadingSkeleton />
      ) : similarCabins.length === 0 ? (
        <p className='text-foreground-500 text-sm'>
          No similar cabins available at this time.
        </p>
      ) : (
        <div className='flex gap-4 overflow-x-auto lg:grid lg:grid-cols-4 lg:overflow-visible'>
          {similarCabins.map(cabin => (
            <div key={cabin._id.toString()} className='w-64 shrink-0 lg:w-full'>
              <CabinCard cabin={cabin} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
