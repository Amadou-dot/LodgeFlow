'use client';

import { useEffect, useState } from 'react';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Link } from '@heroui/link';
import { Spinner } from '@heroui/spinner';
import Image from 'next/image';
import {
  Calendar,
  Check,
  Clock,
  MapPin,
  Star,
  Users,
  UtensilsCrossed,
} from 'lucide-react';

import { useDiningItem } from '@/hooks/useDiningItem';

type Params = Promise<{
  id: string;
}>;

export default function DiningDetailPage({ params }: { params: Params }) {
  const [diningId, setDiningId] = useState<string>('');
  const { data: dining, isLoading, error } = useDiningItem(diningId);

  useEffect(() => {
    const getDiningId = async () => {
      const { id } = await params;
      setDiningId(id);
    };

    getDiningId();
  }, [params]);

  if (isLoading || !diningId) {
    return (
      <div className='flex flex-col justify-center items-center min-h-screen gap-4'>
        <Spinner label='Loading dining details...' size='lg' />
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

  if (!dining) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-lg'>Dining item not found</div>
      </div>
    );
  }

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return 'warning';
      case 'lunch':
        return 'primary';
      case 'dinner':
        return 'secondary';
      case 'all-day':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <div className='max-w-7xl mx-auto px-4 py-8 space-y-8'>
      {/* Header Section */}
      <div className='relative'>
        <div className='relative h-96 rounded-2xl overflow-hidden'>
          <Image
            alt={dining.name}
            className='object-cover'
            fill
            src={dining.image}
          />
          <div className='absolute inset-0 bg-black/40' />

          {/* Header Content Overlay */}
          <div className='absolute bottom-0 left-0 right-0 p-8 text-white'>
            <div className='flex items-center gap-3 mb-4'>
              <Chip
                className='text-white'
                color={getMealTypeColor(dining.mealType)}
                variant='solid'
              >
                {dining.mealType.charAt(0).toUpperCase() +
                  dining.mealType.slice(1)}
              </Chip>
              <Chip color='primary' variant='solid'>
                {dining.type === 'experience'
                  ? 'Dining Experience'
                  : 'Menu Item'}
              </Chip>
              {dining.isPopular && (
                <Chip color='warning' startContent={<Star />} variant='solid'>
                  Popular
                </Chip>
              )}
            </div>

            <h1 className='text-4xl font-bold mb-2'>{dining.name}</h1>

            <div className='flex items-center gap-6 text-sm'>
              <div className='flex items-center gap-2'>
                <Clock className='w-4 h-4' />
                <span>
                  {dining.servingTime.start} - {dining.servingTime.end}
                </span>
              </div>

              <div className='flex items-center gap-2'>
                <Users className='w-4 h-4' />
                <span>
                  {dining.minPeople > 1 ? dining.minPeople + '-' : '1-'}
                  {dining.maxPeople} guests
                </span>
              </div>

              {dining.location && (
                <div className='flex items-center gap-2'>
                  <MapPin className='w-4 h-4' />
                  <span>{dining.location}</span>
                </div>
              )}

              {dining.rating && (
                <div className='flex items-center gap-2'>
                  <Star className='w-4 h-4 fill-current' />
                  <span>
                    {dining.rating}/5 ({dining.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Main Content */}
        <div className='lg:col-span-2 space-y-8'>
          {/* Description */}
          <Card>
            <CardHeader>
              <h2 className='text-2xl font-bold'>About This Dining Option</h2>
            </CardHeader>
            <CardBody className='space-y-4'>
              <p className='text-default-600'>{dining.description}</p>
            </CardBody>
          </Card>

          {/* Dietary Options */}
          {dining.dietary && dining.dietary.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className='text-xl font-bold'>Dietary Options</h3>
              </CardHeader>
              <CardBody>
                <div className='flex flex-wrap gap-2'>
                  {dining.dietary.map((diet, index) => (
                    <Chip key={index} color='success' variant='flat'>
                      {diet}
                    </Chip>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* What's Included (for dining experiences) */}
          {dining.includes && dining.includes.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className='text-xl font-bold'>Whats Included</h3>
              </CardHeader>
              <CardBody>
                <ul className='space-y-2'>
                  {dining.includes.map((item, index) => (
                    <li key={index} className='flex items-start gap-3'>
                      <Check className='w-5 h-5 text-green-500 mt-0.5' />
                      <span className='text-default-600'>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {/* Ingredients */}
          {dining.ingredients && dining.ingredients.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className='text-xl font-bold'>Key Ingredients</h3>
              </CardHeader>
              <CardBody>
                <div className='flex flex-wrap gap-2'>
                  {dining.ingredients.map((ingredient, index) => (
                    <Chip key={index} variant='bordered'>
                      {ingredient}
                    </Chip>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Allergens */}
          {dining.allergens && dining.allergens.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className='text-xl font-bold'>Allergen Information</h3>
              </CardHeader>
              <CardBody>
                <div className='flex flex-wrap gap-2'>
                  {dining.allergens.map((allergen, index) => (
                    <Chip key={index} color='warning' variant='flat'>
                      {allergen}
                    </Chip>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Gallery */}
          {dining.gallery && dining.gallery.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className='text-xl font-bold'>Gallery</h3>
              </CardHeader>
              <CardBody>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                  {dining.gallery.map((image, index) => (
                    <div
                      key={index}
                      className='relative h-32 rounded-lg overflow-hidden'
                    >
                      <Image
                        alt={dining.name + ' gallery ' + (index + 1)}
                        className='object-cover'
                        fill
                        src={image}
                      />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Reservation Card */}
          <Card className='sticky top-4'>
            <CardBody className='space-y-6'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-primary mb-2'>
                  ${dining.price}
                </div>
                <div className='text-sm text-default-600'>per person</div>
              </div>

              <Divider />

              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <Clock className='w-5 h-5 text-default-400' />
                  <div>
                    <div className='font-medium'>Serving Hours</div>
                    <div className='text-sm text-default-600'>
                      {dining.servingTime.start} - {dining.servingTime.end}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <Users className='w-5 h-5 text-default-400' />
                  <div>
                    <div className='font-medium'>Party Size</div>
                    <div className='text-sm text-default-600'>
                      {dining.minPeople > 1 ? dining.minPeople + '-' : '1-'}
                      {dining.maxPeople} guests
                    </div>
                  </div>
                </div>

                {dining.duration && (
                  <div className='flex items-center gap-3'>
                    <UtensilsCrossed className='w-5 h-5 text-default-400' />
                    <div>
                      <div className='font-medium'>Duration</div>
                      <div className='text-sm text-default-600'>
                        {dining.duration}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Divider />

              <div className='space-y-3'>
                <Button
                  as={Link}
                  className='w-full'
                  color='primary'
                  href={'/dining/' + diningId + '/reserve'}
                  size='lg'
                  startContent={<Calendar className='w-4 h-4' />}
                >
                  Make Reservation
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <h3 className='text-lg font-bold'>Good to Know</h3>
            </CardHeader>
            <CardBody className='space-y-3 text-sm'>
              {dining.seasonality && (
                <div>
                  <span className='font-medium'>Seasonality: </span>
                  <span className='text-default-600'>{dining.seasonality}</span>
                </div>
              )}

              {dining.category !== 'regular' && (
                <div>
                  <span className='font-medium'>Category: </span>
                  <span className='text-default-600'>
                    {dining.category
                      .split('-')
                      .map(
                        (w: string) => w.charAt(0).toUpperCase() + w.slice(1)
                      )
                      .join(' ')}
                  </span>
                </div>
              )}

              <div>
                <span className='font-medium'>Reservations: </span>
                <span className='text-default-600'>Recommended</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
