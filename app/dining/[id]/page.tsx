'use client';

import { useEffect, useState } from 'react';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Spinner } from '@heroui/spinner';
import { ArrowLeft, Clock, MapPin, Users, UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { title, subtitle } from '@/components/primitives';
import { useDiningItem } from '@/hooks/useDiningItem';

type Params = Promise<{ id: string }>;

export default function DiningDetailPage({ params }: { params: Params }) {
  const [diningId, setDiningId] = useState<string>('');
  const { data: dining, isLoading, error } = useDiningItem(diningId);

  useEffect(() => {
    const getId = async () => {
      const { id } = await params;
      setDiningId(id);
    };
    getId();
  }, [params]);

  if (isLoading || !diningId) {
    return (
      <div className='flex flex-col justify-center items-center min-h-screen gap-4'>
        <Spinner label='Loading dining details...' size='lg' />
      </div>
    );
  }

  if (error || !dining) {
    return (
      <div className='flex flex-col justify-center items-center min-h-screen gap-4'>
        <p className='text-danger'>Dining item not found</p>
        <Link href='/dining'>
          <Button
            startContent={<ArrowLeft className='w-4 h-4' />}
            variant='flat'
          >
            Back to Dining
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      {/* Back Button */}
      <Link href='/dining'>
        <Button
          className='mb-6'
          startContent={<ArrowLeft className='w-4 h-4' />}
          variant='light'
        >
          Back to Dining
        </Button>
      </Link>

      {/* Hero Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Image */}
        <div className='relative h-80 lg:h-96 rounded-xl overflow-hidden'>
          <Image
            alt={dining.name}
            className='object-cover'
            fill
            src={dining.image}
          />
          {dining.isPopular && (
            <Chip
              className='absolute top-4 left-4'
              color='warning'
              variant='solid'
            >
              Popular
            </Chip>
          )}
        </div>

        {/* Details */}
        <div className='space-y-6'>
          <div>
            <h1 className={title({ size: 'lg' })}>{dining.name}</h1>
            <p className={subtitle({ class: 'mt-2' })}>{dining.description}</p>
          </div>

          {/* Quick Info Chips */}
          <div className='flex flex-wrap gap-3'>
            <Chip color='success' size='lg' variant='flat'>
              ${dining.price}/person
            </Chip>
            <Chip
              size='lg'
              startContent={<Clock className='w-4 h-4' />}
              variant='flat'
            >
              {dining.servingTime.start} - {dining.servingTime.end}
            </Chip>
            <Chip
              size='lg'
              startContent={<Users className='w-4 h-4' />}
              variant='flat'
            >
              {dining.minPeople}-{dining.maxPeople} guests
            </Chip>
            {dining.duration && (
              <Chip
                size='lg'
                startContent={<UtensilsCrossed className='w-4 h-4' />}
                variant='flat'
              >
                {dining.duration}
              </Chip>
            )}
            {dining.location && (
              <Chip
                size='lg'
                startContent={<MapPin className='w-4 h-4' />}
                variant='flat'
              >
                {dining.location}
              </Chip>
            )}
          </div>

          {/* Meal Type & Category */}
          <div className='flex gap-2'>
            <Chip color='primary' size='sm' variant='flat'>
              {dining.mealType === 'all-day'
                ? 'All Day'
                : dining.mealType.charAt(0).toUpperCase() +
                  dining.mealType.slice(1)}
            </Chip>
            <Chip color='secondary' size='sm' variant='flat'>
              {dining.type === 'experience' ? 'Dining Experience' : 'Menu Item'}
            </Chip>
          </div>

          {/* Reserve Button */}
          <Link href={`/dining/${diningId}/reserve`}>
            <Button className='w-full sm:w-auto' color='primary' size='lg'>
              Make Reservation
            </Button>
          </Link>
        </div>
      </div>

      {/* Additional Details */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12'>
        {/* Dietary Info */}
        {dining.dietary && dining.dietary.length > 0 && (
          <Card>
            <CardBody className='space-y-3'>
              <h3 className='text-lg font-semibold'>Dietary Options</h3>
              <div className='flex flex-wrap gap-2'>
                {dining.dietary.map(diet => (
                  <Chip key={diet} color='success' size='sm' variant='flat'>
                    {diet}
                  </Chip>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Allergens */}
        {dining.allergens && dining.allergens.length > 0 && (
          <Card>
            <CardBody className='space-y-3'>
              <h3 className='text-lg font-semibold'>Allergen Information</h3>
              <div className='flex flex-wrap gap-2'>
                {dining.allergens.map(allergen => (
                  <Chip key={allergen} color='warning' size='sm' variant='flat'>
                    {allergen}
                  </Chip>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Ingredients */}
        {dining.ingredients && dining.ingredients.length > 0 && (
          <Card>
            <CardBody className='space-y-3'>
              <h3 className='text-lg font-semibold'>Ingredients</h3>
              <ul className='text-sm text-default-600 space-y-1'>
                {dining.ingredients.map((ingredient, i) => (
                  <li key={i}>• {ingredient}</li>
                ))}
              </ul>
            </CardBody>
          </Card>
        )}

        {/* What's Included */}
        {dining.includes && dining.includes.length > 0 && (
          <Card>
            <CardBody className='space-y-3'>
              <h3 className='text-lg font-semibold'>What's Included</h3>
              <ul className='text-sm text-default-600 space-y-1'>
                {dining.includes.map((item, i) => (
                  <li key={i} className='flex items-center gap-2'>
                    <span className='text-success'>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Gallery */}
      {dining.gallery && dining.gallery.length > 0 && (
        <div className='mt-12'>
          <h2 className={title({ size: 'sm' })}>Gallery</h2>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4'>
            {dining.gallery.map((image, i) => (
              <div key={i} className='relative h-48 rounded-lg overflow-hidden'>
                <Image
                  alt={`${dining.name} - ${i + 1}`}
                  className='object-cover'
                  fill
                  src={image}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
