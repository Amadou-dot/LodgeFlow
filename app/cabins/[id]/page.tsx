'use client';
import BookingForm from '@/components/BookingForm';
import Breadcrumb from '@/components/Breadcrumb';
import CabinDetails from '@/components/CabinDetails';
import CabinGallery from '@/components/CabinGallery';
import CabinMobileTabs from '@/components/CabinMobileTabs';
import CabinPricingCalculator from '@/components/CabinPricingCalculator';
import CabinShareButton from '@/components/CabinShareButton';
import CabinSimilar from '@/components/CabinSimilar';
import { useCabin } from '@/hooks/useCabin';
import { useUser } from '@clerk/nextjs';
import { Button } from '@heroui/button';
import { ArrowLeft, Heart } from 'lucide-react';
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
      <div className='container mx-auto px-4 py-8 max-w-7xl'>
        <div className='mb-6 h-6 w-48 rounded-lg bg-default-200 animate-pulse' />
        <div className='mb-8 h-10 w-32 rounded-lg bg-default-200 animate-pulse' />
        <div
          className='w-full rounded-2xl bg-default-200 animate-pulse'
          style={{ aspectRatio: '16 / 9', maxHeight: '520px' }}
        />
        <div className='mt-8 space-y-4'>
          <div className='h-8 w-64 rounded-lg bg-default-200 animate-pulse' />
          <div className='h-4 w-full rounded-lg bg-default-200 animate-pulse' />
          <div className='h-4 w-3/4 rounded-lg bg-default-200 animate-pulse' />
        </div>
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

      {/* Main Content */}
      <div className='space-y-8'>
        {/* Gallery - always visible */}
        <CabinGallery
          images={[cabin.image, ...(cabin.images || [])].filter(Boolean)}
        />

        {/* Share and Wishlist row - always visible */}
        <div className='flex gap-2'>
          <CabinShareButton cabinName={cabin.name} />
          <span title='Coming soon'>
            <Button
              aria-label='Add to wishlist (coming soon)'
              isDisabled
              variant='light'
            >
              <Heart size={18} />
            </Button>
          </span>
        </div>

        {/* Mobile Layout: tabbed interface (< lg) */}
        <div className='lg:hidden'>
          <CabinMobileTabs
            cabin={cabin}
            userData={userData}
            bookingCabin={{
              _id: cabin._id.toString(),
              discount: cabin.discount,
              image: cabin.image,
              maxCapacity: cabin.capacity,
              name: cabin.name,
              regularPrice: cabin.price,
            }}
          />
        </div>

        {/* Desktop Layout: vertical stack (lg+) */}
        <div className='hidden lg:block space-y-8'>
          <CabinDetails cabin={cabin} />
          <div className='lg:max-w-3xl lg:mx-auto' id='booking'>
            <BookingForm
              userData={userData}
              cabin={{
                _id: cabin._id.toString(),
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

      {/* Price Calculator - visible on all screen sizes */}
      <div className='mt-8'>
        <CabinPricingCalculator discount={cabin.discount} price={cabin.price} />
      </div>

      {/* Similar Cabins - visible on all screen sizes */}
      <div className='mt-8'>
        <CabinSimilar
          capacity={cabin.capacity}
          currentCabinId={cabin._id.toString()}
        />
      </div>
    </div>
  );
}
