'use client';
import BookingForm from '@/components/BookingForm';
import Breadcrumb from '@/components/Breadcrumb';
import CabinAvailabilityPreview from '@/components/CabinAvailabilityPreview';
import CabinBookingSteps from '@/components/CabinBookingSteps';
import CabinDetails from '@/components/CabinDetails';
import CabinGallery from '@/components/CabinGallery';
import CabinTestimonials from '@/components/CabinTestimonials';
import CabinTrustIndicators from '@/components/CabinTrustIndicators';
import { useCabin } from '@/hooks/useCabin';
import { useSettings } from '@/hooks/useSettings';
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
  const { data: settings } = useSettings();
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

      {/* Main Content */}
      <div className='space-y-8'>
        {/* Gallery - Full Width */}
        <CabinGallery
          images={[cabin.image, ...(cabin.images || [])].filter(Boolean)}
        />

        {/* Trust Indicators */}
        {settings?.cancellationPolicy && (
          <CabinTrustIndicators
            cancellationPolicy={
              settings.cancellationPolicy as 'flexible' | 'moderate' | 'strict'
            }
          />
        )}

        {/* Cabin Details - Full Width */}
        <div>
          <CabinDetails cabin={cabin} />
        </div>

        {/* Guest Testimonials */}
        <CabinTestimonials />

        {/* Availability Preview */}
        <CabinAvailabilityPreview cabinId={cabinId} />

        {/* How Booking Works */}
        <CabinBookingSteps />

        {/* Booking Form */}
        <div className='lg:mx-auto lg:max-w-3xl'>
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
  );
}
