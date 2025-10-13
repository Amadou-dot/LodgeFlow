import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { DateRangePicker } from '@heroui/date-picker';
import { Input, Textarea } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import type { DateValue } from '@internationalized/date';
import { getLocalTimeZone, today } from '@internationalized/date';
import type { RangeValue } from '@react-types/shared';
import Image from 'next/image';
import { useState } from 'react';

import { subtitle, title } from '@/components/primitives';

interface BookingFormProps {
  cabin: {
    _id: string;
    name: string;
    regularPrice: number;
    maxCapacity: number;
    image?: string;
  };
  userData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export default function BookingForm({ cabin, userData }: BookingFormProps) {
  // State for date range and guests
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(
    null
  );
  const [numberOfGuests, setNumberOfGuests] = useState<string>('');

  // Fallback values if cabin is undefined or missing properties
  const maxCapacity = cabin?.maxCapacity || 8;
  const cabinName = cabin?.name || 'This Cabin';
  const regularPrice = cabin?.regularPrice || 0;
  const cabinImage =
    cabin?.image ||
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';

  const guestOptions = Array.from({ length: maxCapacity }, (_, i) => ({
    key: (i + 1).toString(),
    label: `${i + 1} Guest${i + 1 > 1 ? 's' : ''}`,
  }));

  // Calculate number of nights and total price
  const calculateTotal = () => {
    if (!dateRange?.start || !dateRange?.end) {
      return null;
    }

    const startDate = new Date(dateRange.start.toString());
    const endDate = new Date(dateRange.end.toString());
    const timeDiff = endDate.getTime() - startDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (nights <= 0) return null;

    const subtotal = nights * regularPrice;
    return { nights, subtotal };
  };

  const totalInfo = calculateTotal();

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {/* Cabin Image */}
      <div className='relative h-64 lg:h-full min-h-[400px] rounded-lg overflow-hidden'>
        <Image
          src={cabinImage}
          alt={cabinName}
          fill
          style={{ objectFit: 'cover' }}
          className='rounded-lg'
        />
      </div>

      {/* Booking Form */}
      <Card className='p-6'>
        <CardHeader>
          <div>
            <h3 className={title({ size: 'sm' })}>Book {cabinName}</h3>
            <p className={subtitle({ class: 'mt-2' })}>
              ${regularPrice}/night • Up to {maxCapacity} guests
            </p>
          </div>
        </CardHeader>
        <CardBody className='space-y-4'>
          <form className='space-y-4'>
            {/* Guest Information */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Input
                label='First Name'
                placeholder='Enter your first name'
                defaultValue={userData?.firstName}
                isRequired
              />
              <Input
                label='Last Name'
                placeholder='Enter your last name'
                defaultValue={userData?.lastName}
                isRequired
              />
            </div>

            <Input
              label='Email'
              type='email'
              placeholder='Enter your email'
              defaultValue={userData?.email}
              isRequired
              isReadOnly={!!userData?.email}
            />

            <Input
              label='Phone'
              type='tel'
              placeholder='Enter your phone number'
              isRequired
              defaultValue={userData?.phone}
              isReadOnly={!!userData?.phone}
            />

            {/* Booking Details with Date Range Picker */}
            <DateRangePicker
              label='Stay Duration'
              isRequired
              minValue={today(getLocalTimeZone())}
              value={dateRange}
              onChange={setDateRange}
              description='Select your check-in and check-out dates'
            />

            <Select
              label='Number of Guests'
              placeholder='Select number of guests'
              isRequired
              selectedKeys={numberOfGuests ? [numberOfGuests] : []}
              onSelectionChange={keys => {
                const selected = Array.from(keys)[0] as string;
                setNumberOfGuests(selected || '');
              }}>
              {guestOptions.map(option => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>

            <Textarea
              label='Special Requests'
              placeholder='Any special requests or dietary requirements?'
              minRows={3}
            />

            <div className='border-t pt-4'>
              <div className='space-y-2 mb-4'>
                {totalInfo ? (
                  <>
                    <div className='flex justify-between items-center text-sm'>
                      <span>
                        ${regularPrice} × {totalInfo.nights} night
                        {totalInfo.nights > 1 ? 's' : ''}
                      </span>
                      <span>${totalInfo.subtotal}</span>
                    </div>
                    <div className='flex justify-between items-center font-bold text-lg'>
                      <span>Total (before taxes)</span>
                      <span className='text-green-600'>
                        ${totalInfo.subtotal}
                      </span>
                    </div>
                    <p className='text-xs text-default-500'>
                      Taxes and fees will be calculated at confirmation
                    </p>
                  </>
                ) : (
                  <div className='flex justify-between items-center'>
                    <span>Total</span>
                    <span className='text-default-500'>
                      Select dates to see pricing
                    </span>
                  </div>
                )}
              </div>

              <Button
                type='submit'
                color='primary'
                size='lg'
                className='w-full'
                isDisabled={
                  !dateRange?.start || !dateRange?.end || !numberOfGuests
                }>
                Submit Booking Request
              </Button>

              <p className='text-xs text-default-500 mt-2 text-center'>
                This is a booking request. Final confirmation will be provided
                by our team.
              </p>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
