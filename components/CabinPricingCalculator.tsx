'use client';

import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { DatePicker } from '@heroui/date-picker';
import { Link } from '@heroui/link';
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
import { useState } from 'react';

interface CabinPricingCalculatorProps {
  discount: number;
  price: number;
}

// Computed once at module load — does not change per render
const todayDate = today(getLocalTimeZone());

export default function CabinPricingCalculator({
  discount,
  price,
}: CabinPricingCalculatorProps) {
  const [checkIn, setCheckIn] = useState<CalendarDate | null>(null);
  const [checkOut, setCheckOut] = useState<CalendarDate | null>(null);

  const effectiveRate = price - discount;
  const hasDiscount = discount > 0;

  const nights = checkIn && checkOut ? checkOut.compare(checkIn) : null;
  const validNights = nights !== null && nights > 0 ? nights : null;

  const totalPrice = validNights !== null ? effectiveRate * validNights : null;
  const savings =
    hasDiscount && validNights !== null ? discount * validNights : null;

  const handleReset = () => {
    setCheckIn(null);
    setCheckOut(null);
  };

  return (
    <Card className='w-full'>
      <CardHeader className='flex flex-col items-start gap-1 pb-2'>
        <h3 className='text-lg font-bold'>Price Calculator</h3>
        <div className='flex items-center gap-2'>
          {hasDiscount && (
            <span className='text-sm text-default-400 line-through'>
              ${price.toFixed(2)}/night
            </span>
          )}
          <span className='text-xl font-bold text-success'>
            ${effectiveRate.toFixed(2)}/night
          </span>
          {hasDiscount && (
            <span className='font-semibold text-sm text-success'>
              Save ${discount.toFixed(2)}/night
            </span>
          )}
        </div>
      </CardHeader>

      <CardBody className='space-y-4'>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <DatePicker
            label='Check-in'
            minValue={todayDate}
            showMonthAndYearPickers
            value={checkIn}
            onChange={setCheckIn}
          />
          <DatePicker
            isDisabled={!checkIn}
            label='Check-out'
            minValue={checkIn ? checkIn.add({ days: 1 }) : todayDate}
            showMonthAndYearPickers
            value={checkOut}
            onChange={setCheckOut}
          />
        </div>

        {validNights !== null && totalPrice !== null ? (
          <>
            <Divider />
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span>
                  ${effectiveRate.toFixed(2)} &times; {validNights} night
                  {validNights > 1 ? 's' : ''}
                </span>
                <span>${(effectiveRate * validNights).toFixed(2)}</span>
              </div>

              {savings !== null && savings > 0 && (
                <div className='flex items-center justify-between rounded-lg bg-success-50 px-3 py-2 text-sm font-semibold text-success'>
                  <span>Savings</span>
                  <span>-${savings.toFixed(2)}</span>
                </div>
              )}

              <Divider />

              <div className='flex items-center justify-between font-bold text-base'>
                <span>Total</span>
                <span className='text-success'>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </>
        ) : (
          <p className='text-sm text-default-500'>
            Select check-in and check-out dates to see pricing.
          </p>
        )}

        <div className='flex flex-col gap-2 pt-1 sm:flex-row'>
          <Button
            as={Link}
            className='flex-1'
            color='primary'
            href='#booking'
            size='lg'
          >
            Book Now
          </Button>
          <Button
            className='sm:w-auto'
            color='default'
            size='lg'
            variant='flat'
            onPress={handleReset}
          >
            Clear Dates
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
