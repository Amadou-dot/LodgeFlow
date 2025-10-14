import { Booking, Cabin, connectDB, Settings } from '@/models';
import type {
  ApiResponse,
  CreateBookingData,
  PopulatedBooking
} from '@/types';
import { clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      cabinId: cabinId,
      customerId: customerId,
      checkInDate,
      checkOutDate,
      numGuests,
      extras = {},
      specialRequests = [],
    } = body as CreateBookingData;

    const client = await clerkClient();
    const user = await client.users.getUser(customerId);

    if (!user) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Customer not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Validate required fields
    if (
      !cabinId ||
      !customerId ||
      !checkInDate ||
      !checkOutDate ||
      !numGuests
    ) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Missing required fields',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      const response: ApiResponse<never> = {
        success: false,
        error: "Check-out date must be after check-in date",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if cabin exists and is available
    const cabin = await Cabin.findById(cabinId);
    if (!cabin) {
      const response: ApiResponse<never> = {
        success: false,
        error: "Cabin not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    if (numGuests > cabin.capacity) {
      const response: ApiResponse<never> = {
        success: false,
        error: `Cabin capacity exceeded. Maximum guests: ${cabin.capacity}`,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      cabin: cabinId,
      status: { $nin: ["cancelled"] },
      $or: [
        {
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn },
        },
      ],
    });

    if (conflictingBookings.length > 0) {
      const response: ApiResponse<never> = {
        success: false,
        error: "Cabin is not available for the selected dates",
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Get settings for pricing
    const settings = await Settings.findOne().sort({ createdAt: -1 });
    if (!settings) {
      const response: ApiResponse<never> = {
        success: false,
        error: "System settings not found",
      };
      return NextResponse.json(response, { status: 500 });
    }

    // Calculate nights and pricing
    const numNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    if (numNights < settings.minBookingLength || numNights > settings.maxBookingLength) {
      const response: ApiResponse<never> = {
        success: false,
        error: `Booking length must be between ${settings.minBookingLength} and ${settings.maxBookingLength} nights`,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Calculate prices
    const effectivePrice = cabin.price - cabin.discount;
    const cabinPrice = effectivePrice * numNights;

    let extrasPrice = 0;
    const bookingExtras = {
      hasBreakfast: extras.hasBreakfast || false,
      breakfastPrice: 0,
      hasPets: extras.hasPets || false,
      petFee: 0,
      hasParking: extras.hasParking || false,
      parkingFee: 0,
      hasEarlyCheckIn: extras.hasEarlyCheckIn || false,
      earlyCheckInFee: 0,
      hasLateCheckOut: extras.hasLateCheckOut || false,
      lateCheckOutFee: 0,
    };

    if (bookingExtras.hasBreakfast) {
      bookingExtras.breakfastPrice = settings.breakfastPrice * numGuests * numNights;
      extrasPrice += bookingExtras.breakfastPrice;
    }

    if (bookingExtras.hasPets && settings.allowPets) {
      bookingExtras.petFee = settings.petFee * numNights;
      extrasPrice += bookingExtras.petFee;
    }

    if (bookingExtras.hasParking && !settings.parkingIncluded) {
      bookingExtras.parkingFee = settings.parkingFee * numNights;
      extrasPrice += bookingExtras.parkingFee;
    }

    if (bookingExtras.hasEarlyCheckIn) {
      bookingExtras.earlyCheckInFee = settings.earlyCheckInFee;
      extrasPrice += bookingExtras.earlyCheckInFee;
    }

    if (bookingExtras.hasLateCheckOut) {
      bookingExtras.lateCheckOutFee = settings.lateCheckOutFee;
      extrasPrice += bookingExtras.lateCheckOutFee;
    }

    const totalPrice = cabinPrice + extrasPrice;
    const depositAmount = settings.requireDeposit
      ? Math.round(totalPrice * (settings.depositPercentage / 100))
      : 0;

    // Ensure customer exists

    // Create booking
    const booking = await Booking.create({
      cabin: cabinId,
      customer: customerId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numNights,
      numGuests,
      status: 'unconfirmed',
      cabinPrice: effectivePrice,
      extrasPrice,
      totalPrice,
      isPaid: false,
      paymentMethod: 'online',
      extras: bookingExtras,
      specialRequests,
      depositPaid: false,
      depositAmount,
    });

    // Update customer statistics
    await Booking.findOneAndUpdate(
      { customer: customerId },
      {
        $inc: { totalBookings: 1, totalSpent: totalPrice },
        lastBookingDate: new Date(),
      }
    );

    // Populate the booking for response
    const populatedBooking: PopulatedBooking = await Booking.findById(booking._id)
      .populate('cabin');
    const response: ApiResponse<any> = {
      success: true,
      data: populatedBooking,
      message: 'Booking created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);

    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to create booking',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
