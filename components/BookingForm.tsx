import { subtitle, title } from '@/components/primitives';
import { useCreateBooking } from '@/hooks/useBooking';
import { CreateBookingData } from '@/types';
import { useUser } from '@clerk/nextjs';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Checkbox } from '@heroui/checkbox';
import { DateRangePicker } from '@heroui/date-picker';
import { Form } from '@heroui/form';
import { Input, Textarea } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { addToast } from '@heroui/toast';
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
  type DateValue,
} from '@internationalized/date';
import type { RangeValue } from '@react-types/shared';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import useSWR from 'swr';

interface BookingFormProps {
  cabin: {
    _id: string;
    name: string;
    regularPrice: number;
    discount?: number;
    maxCapacity: number;
    image?: string;
  };
  userData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

interface UnavailableDateRange {
  start: string;
  end: string;
}

interface AvailabilityData {
  cabinId: string;
  unavailableDates: UnavailableDateRange[];
  queryRange: {
    start: string;
    end: string;
  };
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function BookingForm({ cabin, userData }: BookingFormProps) {
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(
    null
  );
  const [numberOfGuests, setNumberOfGuests] = useState<string>('');
  const { isSignedIn, isLoaded, user } = useUser();
  const { mutate: createBooking } = useCreateBooking();
  const router = useRouter();

  const { data: availabilityData, error: availabilityError } = useSWR<{
    success: boolean;
    data: AvailabilityData;
  }>(cabin?._id ? `/api/cabins/${cabin._id}/availability` : null, fetcher);

  const todayDate = today(getLocalTimeZone());

  const isDateUnavailable = (date: any) => {
    if (!availabilityData?.success || !availabilityData.data.unavailableDates) {
      return false;
    }

    const calendarDate = 'calendar' in date ? toCalendarDate(date) : date;

    return availabilityData.data.unavailableDates.some(range => {
      const startDate = parseDate(range.start);
      const endDate = parseDate(range.end);
      return (
        calendarDate.compare(startDate) >= 0 &&
        calendarDate.compare(endDate) < 0
      );
    });
  };

  if (!isSignedIn || !user) {
    return (
      <div className='p-6 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700'>
        Please sign in to book this cabin.
      </div>
    );
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded || !isSignedIn) return;

    const data = Object.fromEntries(new FormData(e.currentTarget));
    const extras = {
      hasBreakfast: data['breakfast'] === 'on',
      hasPets: data['pets'] === 'on',
      hasParking: data['parking'] === 'on',
      hasEarlyCheckIn: data['early_checkin'] === 'on',
      hasLateCheckOut: data['late_checkout'] === 'on',
    };
    const specialRequests = (data['special_requests'] as string)
      .split(
        '\
'
      )
      .map(req => req.trim())
      .filter(req => req.length > 0);

    if (!dateRange?.start || !dateRange?.end) {
      addToast({
        title: 'Error',
        description: 'Please select your booking dates',
        color: 'danger',
      });
      return;
    }
    if (!numberOfGuests) {
      addToast({
        title: 'Error',
        description: 'Please select number of guests',
        color: 'danger',
      });
      return;
    }

    const bookingData: CreateBookingData = {
      cabinId: cabin._id,
      customerId: user.id,
      checkInDate: new Date(dateRange.start.toString()),
      checkOutDate: new Date(dateRange.end.toString()),
      numGuests: parseInt(numberOfGuests, 10),
      extras,
      specialRequests,
      observations: (data['observations'] as string) || '',
    };

    createBooking(bookingData, {
      onSuccess: response => {
        // Redirect to confirmation page with booking ID
        if (response.data && response.data._id) {
          router.push(`/cabins/confirmation/${response.data._id}`);
        } else {
          addToast({
            title: 'Success',
            description: 'Your booking request has been submitted!',
            color: 'success',
          });
        }
      },
      onError: error => {
        addToast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'An error occurred',
          color: 'danger',
        });
      },
    });
  };

  const maxCapacity = cabin?.maxCapacity || 8;
  const cabinName = cabin?.name || 'This Cabin';
  const regularPrice = cabin?.regularPrice || 0;
  const discount = cabin?.discount || 0;
  const effectivePrice = regularPrice - discount;
  const hasDiscount = discount > 0;
  const cabinImage =
    cabin?.image ||
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d';

  const guestOptions = Array.from({ length: maxCapacity }, (_, i) => ({
    key: (i + 1).toString(),
    label: `${i + 1} Guest${i + 1 > 1 ? 's' : ''}`,
  }));

  const calculateTotal = () => {
    if (!dateRange?.start || !dateRange?.end) return null;
    const startDate = new Date(dateRange.start.toString());
    const endDate = new Date(dateRange.end.toString());
    const timeDiff = endDate.getTime() - startDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    if (nights <= 0) return null;
    const subtotal = nights * effectivePrice;
    const originalTotal = nights * regularPrice;
    const totalSavings = hasDiscount ? originalTotal - subtotal : 0;
    return { nights, subtotal, originalTotal, totalSavings };
  };

  const totalInfo = calculateTotal();

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <div className='relative h-64 lg:h-full min-h-[400px] rounded-lg overflow-hidden'>
        <Image
          alt={cabinName}
          className='rounded-lg'
          fill
          src={cabinImage}
          style={{ objectFit: 'cover' }}
        />
      </div>

      <Card className='p-6'>
        <CardHeader className='flex flex-col'>
          <h3 className={title({ size: 'sm' })}>Book {cabinName}</h3>
          <div className='mt-2 text-center'>
            {hasDiscount ? (
              <div className='space-y-1'>
                <div className='flex items-center justify-center gap-2'>
                  <span className='text-lg line-through text-default-400'>
                    ${regularPrice}
                  </span>
                  <span className={subtitle({ class: 'text-green-600' })}>
                    ${effectivePrice}/night
                  </span>
                </div>
                <div className='text-sm text-green-600 font-semibold'>
                  Save ${discount}/night!
                </div>
                <p className='text-xs text-default-500'>
                  Up to {maxCapacity} guests
                </p>
              </div>
            ) : (
              <p className={subtitle()}>
                ${regularPrice}/night • Up to {maxCapacity} guests
              </p>
            )}
          </div>
        </CardHeader>
        <CardBody className='space-y-4'>
          <Form
            aria-label='Cabin booking form'
            className='space-y-4'
            onSubmit={handleSubmit}
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
              <Input
                defaultValue={userData?.firstName || ''}
                isReadOnly={true}
                isRequired
                label='First Name'
                name='first_name'
                placeholder='Enter your first name'
              />
              <Input
                defaultValue={userData?.lastName || ''}
                isReadOnly={true}
                isRequired
                label='Last Name'
                name='last_name'
                placeholder='Enter your last name'
              />
            </div>
            <Input
              defaultValue={userData?.email || ''}
              isReadOnly={!!userData?.email}
              isRequired
              label='Email'
              name='email'
              placeholder='Enter your email'
              type='email'
            />
            <Input
              defaultValue={userData?.phone || ''}
              isReadOnly={!!userData?.phone}
              isRequired
              label='Phone'
              name='phone_number'
              placeholder='Enter your phone number'
              type='tel'
            />

            <DateRangePicker
              calendarWidth={400}
              isDateUnavailable={isDateUnavailable}
              isRequired
              label='Stay Duration'
              minValue={todayDate}
              name='booking_duration'
              showMonthAndYearPickers
              value={dateRange}
              visibleMonths={2}
              description={
                availabilityData?.success
                  ? 'Select your check-in and check-out dates. Unavailable dates are crossed out.'
                  : 'Select your check-in and check-out dates'
              }
              errorMessage={
                availabilityError
                  ? 'Failed to load availability data'
                  : undefined
              }
              onChange={setDateRange}
            />

            {availabilityData?.success && (
              <div className='text-xs text-default-500'>
                {availabilityData.data.unavailableDates.length > 0 ? (
                  <>Unavailable dates are crossed out and cannot be selected.</>
                ) : (
                  <>All dates in the next 6 months are available for booking.</>
                )}
              </div>
            )}

            <Select
              isRequired
              label='Number of Guests'
              name='num_guests'
              placeholder='Select number of guests'
              selectedKeys={numberOfGuests ? [numberOfGuests] : []}
              onSelectionChange={keys => {
                const selected = Array.from(keys)[0] as string;
                setNumberOfGuests(selected || '');
              }}
            >
              {guestOptions.map(option => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>

            <div className='grid md:grid-cols-2 gap-6'>
              <Checkbox color='success' name='breakfast'>
                Would you like to add breakfast?
              </Checkbox>
              <Checkbox color='success' name='pets'>
                Will you be bringing a pet?
              </Checkbox>
              <Checkbox color='success' name='parking'>
                Will you need parking?
              </Checkbox>
              <Checkbox color='success' name='early_checkin'>
                Will you check-in early?
              </Checkbox>
              <Checkbox color='success' name='late_checkout'>
                Will you check-out late?
              </Checkbox>
            </div>

            <Textarea
              description='Separate multiple requests with new lines. (ENTER)'
              label='Special Requests'
              minRows={3}
              name='special_requests'
              placeholder='Any special requests or dietary requirements?'
            />

            <div className='border-t pt-4 w-full'>
              <div className='space-y-2 mb-4'>
                {totalInfo ? (
                  <>
                    {hasDiscount && (
                      <div className='flex justify-between items-center text-sm text-default-400 line-through'>
                        <span>
                          ${regularPrice} × {totalInfo.nights} night
                          {totalInfo.nights > 1 ? 's' : ''}
                        </span>
                        <span>${totalInfo.originalTotal}</span>
                      </div>
                    )}
                    <div className='flex justify-between items-center text-sm'>
                      <span>
                        ${effectivePrice} × {totalInfo.nights} night
                        {totalInfo.nights > 1 ? 's' : ''}
                      </span>
                      <span>${totalInfo.subtotal}</span>
                    </div>
                    {hasDiscount && totalInfo.totalSavings > 0 && (
                      <div className='flex justify-between items-center text-sm text-green-600 font-semibold bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg'>
                        <span>Your Savings</span>
                        <span>-${totalInfo.totalSavings}</span>
                      </div>
                    )}
                    <div className='flex justify-between items-center font-bold text-lg border-t pt-2'>
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
                className='w-full'
                color='primary'
                size='lg'
                type='submit'
                isDisabled={
                  !dateRange?.start || !dateRange?.end || !numberOfGuests
                }
              >
                Submit Booking Request
              </Button>

              <p className='text-xs text-default-500 mt-2 text-center'>
                This is a booking request. Final confirmation will be provided
                by our team.
              </p>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
