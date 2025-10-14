'use client';
import BookingForm from '@/components/BookingForm';
import { useCabin } from '@/hooks/useCabin';
import { useUser } from '@clerk/nextjs';
import { Spinner } from '@heroui/spinner';
import { useEffect, useState } from 'react';

type Params = Promise<{
  id: string;
}>;

export default function Page({ params }: { params: Params }) {
  const [cabinId, setCabinId] = useState<string>('');
  const { data: cabin, isLoading, error } = useCabin(cabinId);
  const { user, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    const getCabinId = async () => {
      const { id } = await params;
      setCabinId(id);
    };

    getCabinId();
  }, [params]);

  if (isLoading || !cabinId || !userLoaded) {
    return (
      <div className='flex flex-col justify-center items-center min-h-screen gap-4'>
        <Spinner label='Loading cabin details...' size='lg' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-lg text-red-500'>
          Error: {error instanceof Error ? error.message : 'An error occurred'}
        </div>
      </div>
    );
  }

  if (!cabin) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-lg'>Cabin not found</div>
      </div>
    );
  }

  const userData = user
    ? {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.emailAddresses[0]?.emailAddress || '',
        phone: user.phoneNumbers[0]?.phoneNumber || '',
      }
    : undefined;

  return (
    <div>
      <BookingForm
        userData={userData}
        cabin={{
          _id: cabin._id,
          name: cabin.name,
          regularPrice: cabin.price,
          maxCapacity: cabin.capacity,
          image: cabin.image,
        }}
      />
    </div>
  );
}
