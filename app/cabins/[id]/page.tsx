'use client';
import { useState, useEffect } from 'react';
import BookingForm from '@/components/BookingForm';
import { useCabin } from '@/hooks/useCabin';
import { Spinner } from '@heroui/spinner';

type Params = Promise<{
  id: string;
}>;

export default function Page({ params }: { params: Params }) {
  const [cabinId, setCabinId] = useState<string>('');
  const { data: cabin, isLoading, error } = useCabin(cabinId);

  useEffect(() => {
    const getCabinId = async () => {
      const { id } = await params;
      setCabinId(id);
    };
    
    getCabinId();
  }, [params]);

  if (isLoading || !cabinId) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <Spinner size="lg" />
        <div className="text-lg">Loading cabin details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-500">
          Error: {error instanceof Error ? error.message : 'An error occurred'}
        </div>
      </div>
    );
  }

  if (!cabin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Cabin not found</div>
      </div>
    );
  }

  return (
    <div>
      <BookingForm
        cabin={{
          _id: cabin._id,
          name: cabin.name,
          regularPrice: cabin.price,
          maxCapacity: cabin.capacity,
        }}
      />
    </div>
  );
}
