import { NextRequest, NextResponse } from 'next/server';

import { connectDB, Dining, DiningReservation } from '@/models';
import type { ApiResponse } from '@/types';

type Params = Promise<{ id: string }>;

interface DiningAvailability {
  diningId: string;
  date: string;
  time?: string;
  seatsRemaining: number;
  maxPeople: number;
  isAvailable: boolean;
  availableTimeSlots?: { time: string; seatsRemaining: number }[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    await connectDB();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const timeParam = searchParams.get('time');

    if (!dateParam) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Date parameter is required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const dining = await Dining.findById(id);
    if (!dining) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Dining item not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const queryDate = new Date(dateParam);
    if (isNaN(queryDate.getTime())) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Invalid date format',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const dayStart = new Date(queryDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(queryDate);
    dayEnd.setHours(23, 59, 59, 999);

    if (timeParam) {
      // Validate time format
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(timeParam)) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Time must be in HH:MM format',
        };
        return NextResponse.json(response, { status: 400 });
      }

      // Validate time is within serving window
      const [reqHour, reqMin] = timeParam.split(':').map(Number);
      const [startHour, startMin] = dining.servingTime.start
        .split(':')
        .map(Number);
      const [endHour, endMin] = dining.servingTime.end.split(':').map(Number);
      const reqMinutes = reqHour * 60 + reqMin;
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (reqMinutes < startMinutes || reqMinutes > endMinutes) {
        const response: ApiResponse<never> = {
          success: false,
          error: `Time must be within serving hours: ${dining.servingTime.start} - ${dining.servingTime.end}`,
        };
        return NextResponse.json(response, { status: 400 });
      }

      // Check availability for a specific time slot
      const reservations = await DiningReservation.find({
        dining: id,
        date: { $gte: dayStart, $lt: dayEnd },
        time: timeParam,
        status: { $nin: ['cancelled', 'no-show'] },
      });

      const totalGuests = reservations.reduce((sum, r) => sum + r.numGuests, 0);
      const seatsRemaining = dining.maxPeople - totalGuests;

      const data: DiningAvailability = {
        diningId: id,
        date: dateParam,
        time: timeParam,
        seatsRemaining: Math.max(0, seatsRemaining),
        maxPeople: dining.maxPeople,
        isAvailable: seatsRemaining > 0,
      };

      const response: ApiResponse<DiningAvailability> = {
        success: true,
        data,
      };

      return NextResponse.json(response);
    }

    // Check availability across all time slots for the day
    const reservations = await DiningReservation.find({
      dining: id,
      date: { $gte: dayStart, $lt: dayEnd },
      status: { $nin: ['cancelled', 'no-show'] },
    });

    // Generate time slots based on serving time (every 30 minutes)
    const [startHour, startMin] = dining.servingTime.start
      .split(':')
      .map(Number);
    const [endHour, endMin] = dining.servingTime.end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    const timeSlots: { time: string; seatsRemaining: number }[] = [];
    for (let m = startMinutes; m <= endMinutes; m += 30) {
      const hour = Math.floor(m / 60);
      const min = m % 60;
      const slotTime = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

      const slotReservations = reservations.filter(r => r.time === slotTime);
      const slotGuests = slotReservations.reduce(
        (sum, r) => sum + r.numGuests,
        0
      );

      timeSlots.push({
        time: slotTime,
        seatsRemaining: Math.max(0, dining.maxPeople - slotGuests),
      });
    }

    const totalGuestsToday = reservations.reduce(
      (sum, r) => sum + r.numGuests,
      0
    );

    const data: DiningAvailability = {
      diningId: id,
      date: dateParam,
      seatsRemaining: Math.max(0, dining.maxPeople - totalGuestsToday),
      maxPeople: dining.maxPeople,
      isAvailable: timeSlots.some(slot => slot.seatsRemaining > 0),
      availableTimeSlots: timeSlots,
    };

    const response: ApiResponse<DiningAvailability> = {
      success: true,
      data,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error checking dining availability:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to check dining availability',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
