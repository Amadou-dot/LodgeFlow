'use client';
import { useExperience } from '@/hooks/useExperience';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Link } from '@heroui/link';
import { Spinner } from '@heroui/spinner';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  FiAlertCircle,
  FiCalendar,
  FiCheck,
  FiClock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiStar,
  FiUsers,
} from 'react-icons/fi';

type Params = Promise<{
  id: string;
}>;

export default function ExperiencePage({ params }: { params: Params }) {
  const [experienceId, setExperienceId] = useState<string>('');
  const { data: experience, isLoading, error } = useExperience(experienceId);

  useEffect(() => {
    const getExperienceId = async () => {
      const { id } = await params;
      setExperienceId(id);
    };

    getExperienceId();
  }, [params]);

  if (isLoading || !experienceId) {
    return (
      <div className='flex flex-col justify-center items-center min-h-screen gap-4'>
        <Spinner size='lg' label='Loading experience details...' />
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

  if (!experience) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-lg'>Experience not found</div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'success';
      case 'Moderate':
        return 'warning';
      case 'Challenging':
        return 'danger';
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
            src={experience.image}
            alt={experience.name}
            fill
            className='object-cover'
          />
          <div className='absolute inset-0 bg-black/40' />

          {/* Header Content Overlay */}
          <div className='absolute bottom-0 left-0 right-0 p-8 text-white'>
            <div className='flex items-center gap-3 mb-4'>
              <Chip
                variant='solid'
                color={getDifficultyColor(experience.difficulty)}
                className='text-white'>
                {experience.difficulty}
              </Chip>
              <Chip variant='solid' color='primary'>
                {experience.category}
              </Chip>
              {experience.isPopular && (
                <Chip variant='solid' color='warning' startContent={<FiStar />}>
                  Popular
                </Chip>
              )}
            </div>

            <h1 className='text-4xl font-bold mb-2'>{experience.name}</h1>

            <div className='flex items-center gap-6 text-sm'>
              <div className='flex items-center gap-2'>
                <FiClock className='w-4 h-4' />
                <span>{experience.duration}</span>
              </div>

              {experience.maxParticipants && (
                <div className='flex items-center gap-2'>
                  <FiUsers className='w-4 h-4' />
                  <span>Max {experience.maxParticipants} participants</span>
                </div>
              )}

              {experience.location && (
                <div className='flex items-center gap-2'>
                  <FiMapPin className='w-4 h-4' />
                  <span>{experience.location}</span>
                </div>
              )}

              {experience.rating && (
                <div className='flex items-center gap-2'>
                  <FiStar className='w-4 h-4 fill-current' />
                  <span>
                    {experience.rating}/5 ({experience.reviewCount} reviews)
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
              <h2 className='text-2xl font-bold'>About This Experience</h2>
            </CardHeader>
            <CardBody className='space-y-4'>
              <p className='text-default-600'>{experience.description}</p>
              {experience.longDescription && (
                <p className='text-default-600'>{experience.longDescription}</p>
              )}
            </CardBody>
          </Card>

          {/* Highlights */}
          {experience.highlights && experience.highlights.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className='text-xl font-bold'>Experience Highlights</h3>
              </CardHeader>
              <CardBody>
                <ul className='space-y-2'>
                  {experience.highlights.map((highlight, index) => (
                    <li key={index} className='flex items-start gap-3'>
                      <FiCheck className='w-5 h-5 text-green-500 mt-0.5' />
                      <span className='text-default-600'>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {/* What's Included */}
          <Card>
            <CardHeader>
              <h3 className='text-xl font-bold'>What's Included</h3>
            </CardHeader>
            <CardBody>
              <ul className='space-y-2'>
                {experience.includes.map((item, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <FiCheck className='w-5 h-5 text-green-500 mt-0.5' />
                    <span className='text-default-600'>{item}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          {/* What to Bring */}
          {experience.whatToBring && experience.whatToBring.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className='text-xl font-bold'>What to Bring</h3>
              </CardHeader>
              <CardBody>
                <ul className='space-y-2'>
                  {experience.whatToBring.map((item, index) => (
                    <li key={index} className='flex items-start gap-3'>
                      <div className='w-2 h-2 bg-default-400 rounded-full mt-2' />
                      <span className='text-default-600'>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {/* Requirements */}
          {experience.requirements && experience.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className='text-xl font-bold'>
                  Requirements & Prerequisites
                </h3>
              </CardHeader>
              <CardBody>
                <ul className='space-y-2'>
                  {experience.requirements.map((requirement, index) => (
                    <li key={index} className='flex items-start gap-3'>
                      <FiAlertCircle className='w-5 h-5 text-orange-500 mt-0.5' />
                      <span className='text-default-600'>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {/* Gallery */}
          {experience.gallery && experience.gallery.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className='text-xl font-bold'>Gallery</h3>
              </CardHeader>
              <CardBody>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                  {experience.gallery.map((image, index) => (
                    <div
                      key={index}
                      className='relative h-32 rounded-lg overflow-hidden'>
                      <Image
                        src={image}
                        alt={`${experience.name} gallery ${index + 1}`}
                        fill
                        className='object-cover'
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
          {/* Booking Card */}
          <Card className='sticky top-4'>
            <CardBody className='space-y-6'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-primary mb-2'>
                  ${experience.price}
                </div>
                <div className='text-sm text-default-600'>per person</div>
              </div>

              <Divider />

              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <FiClock className='w-5 h-5 text-default-400' />
                  <div>
                    <div className='font-medium'>Duration</div>
                    <div className='text-sm text-default-600'>
                      {experience.duration}
                    </div>
                  </div>
                </div>

                {experience.minAge && (
                  <div className='flex items-center gap-3'>
                    <FiUsers className='w-5 h-5 text-default-400' />
                    <div>
                      <div className='font-medium'>Age Requirement</div>
                      <div className='text-sm text-default-600'>
                        {experience.minAge}+ years
                      </div>
                    </div>
                  </div>
                )}

                <div className='flex items-center gap-3'>
                  <FiCalendar className='w-5 h-5 text-default-400' />
                  <div>
                    <div className='font-medium'>Availability</div>
                    <div className='text-sm text-default-600'>
                      {experience.available.join(', ')}
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              <div className='space-y-3'>
                <Button
                  as={Link}
                  href='/contact'
                  color='primary'
                  size='lg'
                  className='w-full'
                  startContent={<FiMail className='w-4 h-4' />}>
                  {experience.ctaText}
                </Button>

                <Button
                  as={Link}
                  href='tel:+1-800-LODGEFLOW'
                  variant='bordered'
                  size='lg'
                  className='w-full'
                  startContent={<FiPhone className='w-4 h-4' />}>
                  Call to Book
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
              {experience.seasonality && (
                <div>
                  <span className='font-medium'>Best Season: </span>
                  <span className='text-default-600'>
                    {experience.seasonality}
                  </span>
                </div>
              )}

              {experience.cancellationPolicy && (
                <div>
                  <span className='font-medium'>Cancellation: </span>
                  <span className='text-default-600'>
                    {experience.cancellationPolicy}
                  </span>
                </div>
              )}

              <div>
                <span className='font-medium'>Weather Dependent: </span>
                <span className='text-default-600'>
                  Activities may be rescheduled due to weather
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
