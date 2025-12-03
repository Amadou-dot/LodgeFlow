'use client';
import BookingForm from '@/components/BookingForm';
import Breadcrumb from '@/components/Breadcrumb';
import CabinDetails from '@/components/CabinDetails';
import CabinGallery from '@/components/CabinGallery';
import { useCabin } from '@/hooks/useCabin';
import { useUser } from '@clerk/nextjs';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Params = Promise<{
  id: string;
}>;

export default function Page({ params }: { params: Params }) {
  const [cabinId, setCabinId] = useState<string>('');
  const { data: cabin, isLoading, error } = useCabin(cabinId);
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();

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

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Cabins', href: '/cabins' },
    { label: cabin.name },
  ];

  return (
    <div className='container mx-auto px-4 py-8 max-w-7xl'>
      {/* Breadcrumb Navigation */}
      <div className='mb-6'>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Back Button */}
      <div className='mb-8'>
        <Button
          className='gap-2'
          startContent={<ArrowLeft size={18} />}
          variant='light'
          onPress={() => router.push('/cabins')}
        >
          Back to Cabins
        </Button>
      </div>

      {/* Main Content - Two Row Layout */}
      <div className='space-y-8'>
        {/* Gallery - Full Width */}
        <CabinGallery images={[cabin.image]} />

        {/* Cabin Details - Full Width */}
        <div>
          <CabinDetails cabin={cabin} />
        </div>

        {/* Booking Form - Full Width on Mobile, Centered on Desktop */}
        <div className='lg:max-w-3xl lg:mx-auto'>
          <BookingForm
            userData={userData}
            cabin={{
              _id: cabin._id,
              discount: cabin.discount,
              image: cabin.image,
              maxCapacity: cabin.capacity,
              name: cabin.name,
              regularPrice: cabin.price,
            }}
          />
        </div>
      </div>
    </div>
  );
}
